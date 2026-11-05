import hashlib
import importlib.util
import json
from pathlib import Path, PurePosixPath
import re
import tempfile
import unittest
import zipfile


ROOT = Path(__file__).resolve().parents[2]
PACKAGE_PATH = ROOT / 'scripts' / 'package_release.py'
spec = importlib.util.spec_from_file_location('package_release', PACKAGE_PATH)
package_release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package_release)


class PackageReleaseTests(unittest.TestCase):
    def setUp(self):
        self.source = ROOT / 'cosmos-explorer'

    def build_release(self, output_dir):
        return package_release.build(self.source, Path(output_dir))

    def test_zip_is_safe_complete_and_reproducible(self):
        with tempfile.TemporaryDirectory() as temporary:
            first_dir = Path(temporary) / 'first'
            second_dir = Path(temporary) / 'second'
            first_zip = self.build_release(first_dir)
            second_zip = self.build_release(second_dir)
            self.assertEqual(self.sha256(first_zip), self.sha256(second_zip))

            with zipfile.ZipFile(first_zip) as archive:
                names = archive.namelist()
                self.assertIn('cosmos-explorer/index.html', names)
                for name in names:
                    path = PurePosixPath(name)
                    self.assertFalse(path.is_absolute(), name)
                    self.assertNotIn('..', path.parts, name)
                    self.assertNotIn('\\', name, name)
                    self.assertNotIn(':', path.parts[0], name)
                    lowered = [part.lower() for part in path.parts]
                    self.assertFalse(any(part in {'tests', '__pycache__', '.git', 'automation', 'dist'} for part in lowered), name)
                    self.assertFalse(any('token' in part or part == '.env' or part.startswith('.env.') for part in lowered), name)

                checksum_text = archive.read('cosmos-explorer/SHA256SUMS').decode('utf-8')
                checksums = {}
                for line in checksum_text.splitlines():
                    digest, name = line.split('  ', 1)
                    self.assertRegex(digest, r'^[0-9a-f]{64}$')
                    self.assertNotIn(name, checksums)
                    checksums[name] = digest
                self.assertEqual(set(checksums), set(names) - {'cosmos-explorer/SHA256SUMS'})
                for name, expected in checksums.items():
                    self.assertEqual(hashlib.sha256(archive.read(name)).hexdigest(), expected, name)

                with tempfile.TemporaryDirectory() as extracted:
                    archive.extractall(extracted)
                    package_root = Path(extracted) / 'cosmos-explorer'
                    manifest = json.loads((package_root / 'data/image-manifest.json').read_text(encoding='utf-8'))
                    images = manifest['images']
                    self.assertEqual(len(images), 126)
                    self.assertEqual(len({item['id'] for item in images}), 126)
                    for item in images:
                        image_path = package_root / item['file']
                        self.assertTrue(image_path.is_file(), item['file'])
                        self.assertEqual(self.sha256(image_path), item['sha256'], item['file'])

                    html = (package_root / 'index.html').read_text(encoding='utf-8')
                    local_refs = re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)', html, re.I)
                    local_refs += re.findall(r'<link\b(?=[^>]*\brel=["\'][^"\']*stylesheet)[^>]*\bhref=["\']([^"\']+)', html, re.I)
                    for ref in local_refs:
                        if re.match(r'^(?:[a-z][a-z0-9+.-]*:|//|#)', ref, re.I):
                            continue
                        target = (package_root / ref.split('#', 1)[0].split('?', 1)[0]).resolve()
                        self.assertTrue(target.is_relative_to(package_root.resolve()), ref)
                        self.assertTrue(target.is_file(), ref)

    @staticmethod
    def sha256(path):
        digest = hashlib.sha256()
        with Path(path).open('rb') as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b''):
                digest.update(block)
        return digest.hexdigest()


if __name__ == '__main__':
    unittest.main()
