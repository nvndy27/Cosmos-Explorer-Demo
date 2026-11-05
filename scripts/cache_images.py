#!/usr/bin/env python3
"""Restore missing local image files from their recorded official URLs.
Run with Pillow installed; review attribution before redistributing assets.
"""
import io,json,urllib.request
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]/'cosmos-explorer'
records=json.loads((root/'data/image-manifest.json').read_text())['images']
for record in records:
 target=root/record['file']
 if target.exists():continue
 with urllib.request.urlopen(record['download'],timeout=90) as response:image=Image.open(io.BytesIO(response.read())).convert('RGB')
 transform=record.get('transform',{})
 image.thumbnail((transform.get('maxWidth',800),transform.get('maxHeight',800)));target.parent.mkdir(parents=True,exist_ok=True);image.save(target,transform.get('format','WEBP'),quality=transform.get('quality',84))
 print(record['id'],target.name)
