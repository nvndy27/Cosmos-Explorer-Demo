'use strict';
/* Museum-style discovery behavior. DOM and visual styles are owned by the integrator. */
(() => {
  const root = document.getElementById('museumView');
  const $ = id => document.getElementById(id);
  const body = document.body;
  const featuredIds = ['earth', 'orion', 'messier-45'];
  let noticeTimer = null;
  let noticeVersion = 0;
  let appSelect = null;
  let homeProfileOpen = false;
  let homeProfileFocus = null;

  const notice = message => {
    const live = $('uiNotice');
    if (!live) return;
    if (noticeTimer !== null) clearTimeout(noticeTimer);
    const version = ++noticeVersion;
    live.textContent = message;
    noticeTimer = setTimeout(() => {
      if (version === noticeVersion) live.textContent = '';
      noticeTimer = null;
    }, 4500);
  };

  const setHomeButtonState = active => {
    const button = $('museumHome');
    if (!button) return;
    button.type = 'button';
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('active', active);
  };

  const leaveHome = () => {
    body.classList.remove('museum-home');
    delete body.dataset.museumPalette;
    if (root) {
      root.hidden = true;
      root.setAttribute('aria-hidden', 'true');
    }
    setHomeButtonState(false);
  };

  // Keep the public ExplorerUI API and select signature intact; route existing controls out of home.
  if (typeof ExplorerUI !== 'undefined' && typeof ExplorerUI.setMode === 'function') {
    const setMode = ExplorerUI.setMode;
    ExplorerUI.setMode = function (mode, focus) {
      homeProfileOpen = false;
      leaveHome();
      return setMode.call(this, mode, focus);
    };
  }
  if (typeof window.select === 'function') {
    appSelect = window.select;
    const select = appSelect;
    window.select = function (...args) {
      const wasHome = body.classList.contains('museum-home');
      const previousFocus = document.activeElement;
      leaveHome();
      const result = select.apply(this, args);
      if (wasHome && objectFor(args[0]) && typeof ExplorerUI !== 'undefined') {
        homeProfileOpen = true;
        homeProfileFocus = previousFocus;
        ExplorerUI.setReading(true);
      }
      return result;
    };
  }

  const objectFor = id => typeof data === 'undefined' ? null : data.find(item => item.id === id) || null;
  const savedIds = () => {
    try { return Array.isArray(favorites) ? favorites : []; }
    catch (_) { return []; }
  };

  function syncSavedCards() {
    if (!root) return;
    const saved = new Set(savedIds());
    root.querySelectorAll('[data-museum-save]').forEach(button => {
      const isSaved = saved.has(button.dataset.museumSave);
      button.textContent = isSaved ? '★ Đã lưu' : '☆ Lưu';
      button.setAttribute('aria-pressed', String(isSaved));
    });
  }

  function openLibrary(query) {
    if (typeof ExplorerUI === 'undefined') return false;
    ExplorerUI.setMode('library', true);
    const field = $('libraryQuery');
    if (typeof query === 'string' && field) {
      $('clearLibraryFilters')?.click();
      field.value = query;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.focus();
    }
    return true;
  }

  function showHome() {
    if (!root || typeof ExplorerUI === 'undefined') return false;
    // Stop the diagram renderer before exposing the home panel.
    ExplorerUI.setMode('library', false);
    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    body.classList.add('museum-home');
    const homeUrl = new URL(window.location.href);
    homeUrl.hash = '';
    history.replaceState(null, '', homeUrl.href);
    body.dataset.museumPalette = 'monochrome';
    setHomeButtonState(true);
    syncSavedCards();
    return true;
  }

  function returnToHome() {
    const focus = homeProfileFocus;
    showHome();
    if (focus?.isConnected && focus.getClientRects().length) focus.focus();
    else $('museumQuery')?.focus();
  }

  function validSource(url) {
    try {
      const parsed = new URL(url, window.location.href);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
    } catch (_) { return null; }
  }

  function makeCard(id) {
    const object = objectFor(id);
    if (!object) return null;
    const card = document.createElement('article');
    card.className = 'museum-card';
    card.dataset.id = id;

    const photo = document.createElement('div');
    photo.className = 'museum-photo';
    photo.setAttribute('role', 'group');
    photo.setAttribute('aria-label', 'Tư liệu hình ảnh: ' + object.name);
    if (object.image) {
      const image = document.createElement('img');
      image.src = object.image;
      image.alt = object.imageAlt || (object.name + ' — ' + (object.visualType || 'ảnh tư liệu'));
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('error', () => {
        const fallback = document.createElement('p');
        fallback.className = 'museum-image-fallback';
        fallback.setAttribute('role', 'img');
        fallback.setAttribute('aria-label', 'Ảnh tư liệu không tải được; thông tin và nguồn vẫn có trong hồ sơ.');
        fallback.textContent = 'Ảnh tư liệu hiện không tải được. Mở hồ sơ để xem mô tả và nguồn.';
        image.replaceWith(fallback);
      }, { once: true });
      photo.append(image);
    } else {
      const fallback = document.createElement('p');
      fallback.className = 'museum-image-fallback';
      fallback.setAttribute('role', 'img');
      fallback.setAttribute('aria-label', 'Không có ảnh tư liệu cho ' + object.name);
      fallback.textContent = 'Chưa có ảnh tư liệu cục bộ cho hiện vật này.';
      photo.append(fallback);
    }

    const content = document.createElement('div');
    content.className = 'museum-content';
    const kind = document.createElement('p');
    kind.className = 'museum-kind';
    kind.textContent = (ExplorerModel.labels[object.classification] || object.small || 'Thiên thể') +
      ' · ' + ExplorerModel.imageLabel(object);
    const title = document.createElement('h2');
    title.textContent = object.name;
    const summary = document.createElement('p');
    summary.className = 'museum-summary';
    summary.textContent = object.intro || object.summary || 'Mở hồ sơ để khám phá hiện vật này.';
    const caption = document.createElement('p');
    caption.className = 'museum-caption';
    caption.textContent = object.photoCaption || 'Chú thích ảnh chưa có trong hồ sơ.';
    const credit = document.createElement('p');
    credit.className = 'museum-credit';
    credit.textContent = object.credit ? 'Ghi công: ' + object.credit : 'Ghi công ảnh chưa có trong hồ sơ.';
    content.append(kind, title, summary, caption, credit);

    const actions = document.createElement('div');
    actions.className = 'museum-actions';
    const read = document.createElement('button');
    read.type = 'button';
    read.textContent = 'Đọc hồ sơ';
    read.setAttribute('aria-label', 'Đọc hồ sơ ' + object.name);
    read.addEventListener('click', () => {
      if (typeof window.select === 'function') window.select(id);
      if (typeof ExplorerUI !== 'undefined') ExplorerUI.setReading(true);
    });
    const save = document.createElement('button');
    save.type = 'button';
    save.dataset.museumSave = id;
    save.addEventListener('click', () => saveUsingExistingControl(id));
    const compare = document.createElement('button');
    compare.type = 'button';
    compare.textContent = 'So sánh';
    compare.setAttribute('aria-label', 'Thêm ' + object.name + ' vào so sánh');
    compare.addEventListener('click', () => {
      if (typeof ExplorerUI === 'undefined') return;
      const hadIt = ExplorerUI.state.compare.includes(id);
      ExplorerUI.toggleCompare(id);
      if (!hadIt && ExplorerUI.state.compare.includes(id)) ExplorerUI.setMode('compare', true);
    });
    actions.append(read, save, compare);
    const sourceUrl = validSource(object.imageSource || object.source);
    if (sourceUrl) {
      const source = document.createElement('a');
      source.className = 'museum-source';
      source.href = sourceUrl;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.textContent = 'Mở nguồn tư liệu ↗';
      actions.append(source);
    }
    content.append(actions);
    card.append(photo, content);
    return card;
  }

  function saveUsingExistingControl(id) {
    const favoriteButton = $('favBtn');
    const previous = typeof current === 'string' ? current : null;
    const select = appSelect;
    if (!favoriteButton || typeof select !== 'function') return;
    const wasHome = body.classList.contains('museum-home');
    const wasSaved = savedIds().includes(id);
    // Use the app's existing favorite key/button, without moving the shared profile URL.
    select(id, false);
    favoriteButton.click();
    const isSaved = savedIds().includes(id);
    if (previous && objectFor(previous)) select(previous, false);
    syncSavedCards();
    if (wasHome) showHome();
    let persisted = false;
    try {
      const stored = JSON.parse(localStorage.getItem('cosmos_favorites') || '[]');
      persisted = Array.isArray(stored) && stored.includes(id) === isSaved;
    } catch (_) { persisted = false; }
    notice(!persisted
      ? (isSaved ? 'Đã lưu trong phiên này; trình duyệt không xác nhận được lưu lâu dài.' : 'Đã bỏ lưu trong phiên này; trình duyệt không xác nhận được thay đổi lâu dài.')
      : (wasSaved ? 'Đã bỏ lưu ' + (objectFor(id)?.name || 'thiên thể') + '.' : 'Đã lưu ' + (objectFor(id)?.name || 'thiên thể') + '.'));
  }

  function init() {
    if (!root || typeof ExplorerUI === 'undefined') return;
    const heroImage = root.querySelector('.museum-figure img');
    if (heroImage) {
      const heroFallback = () => {
        if (!heroImage.isConnected) return;
        const panel = document.createElement('div');
        panel.className = 'museum-hero-fallback';
        const message = document.createElement('p');
        message.setAttribute('role', 'status');
        message.textContent = 'Ảnh Orion hiện không tải được. Nội dung và nguồn vẫn có trong hồ sơ.';
        const read = document.createElement('button');
        read.type = 'button';
        read.textContent = 'Đọc hồ sơ Orion';
        read.addEventListener('click', () => {
          window.select('orion');
          ExplorerUI.setReading(true);
        });
        panel.append(message, read);
        heroImage.replaceWith(panel);
      };
      heroImage.addEventListener('error', heroFallback, { once: true });
      if (heroImage.complete && heroImage.naturalWidth === 0) heroFallback();
    }
    const cards = $('museumCards') || root.querySelector('.museum-grid');
    if (cards) {
      cards.replaceChildren();
      featuredIds.forEach(id => {
        const card = makeCard(id);
        if (card) cards.append(card);
      });
    }

    const allCategory = root.querySelector('.museum-category[data-classification=""]');
    if (allCategory) allCategory.textContent = 'Tất cả ' + data.length + ' hồ sơ';
    const homeButton = $('museumHome');
    if (homeButton) homeButton.addEventListener('click', showHome);
    $('homeBtn')?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      showHome();
    }, true);
    document.addEventListener('keydown', event => {
      const helpOpen = $('helpOverlay') && !$('helpOverlay').classList.contains('hidden');
      if (event.key === 'Escape' && homeProfileOpen && ExplorerUI.state.reading && !helpOpen) {
        event.preventDefault();
        event.stopImmediatePropagation();
        returnToHome();
      } else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) && event.target.closest?.('.mode-tab')) {
        homeProfileOpen = false;
        leaveHome();
      }
    }, true);
    document.addEventListener('click', event => {
      if (event.target.closest?.('#readWide') && homeProfileOpen && ExplorerUI.state.reading) {
        event.preventDefault();
        event.stopImmediatePropagation();
        returnToHome();
      } else if (event.target.closest?.('.mode-tab')) {
        homeProfileOpen = false;
        leaveHome();
      }
    }, true);
    const form = $('museumSearchForm');
    if (form) form.addEventListener('submit', event => {
      event.preventDefault();
      openLibrary($('museumQuery')?.value || '');
    });
    $('museumAll')?.addEventListener('click', () => {
      openLibrary();
      $('clearLibraryFilters')?.click();
    });
    $('museumSaved')?.addEventListener('click', () => {
      openLibrary();
      $('clearLibraryFilters')?.click();
      const saved = $('librarySaved');
      if (saved) { saved.checked = true; saved.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    $('museumDiagram')?.addEventListener('click', () => ExplorerUI.setMode('diagram', true));
    $('museumCompare')?.addEventListener('click', () => ExplorerUI.setMode('compare', true));
    root.querySelectorAll('.museum-category[data-classification]').forEach(button => {
      button.type = 'button';
      button.addEventListener('click', () => {
        const classification = button.dataset.classification || '';
        openLibrary();
        $('clearLibraryFilters')?.click();
        const type = $('libraryType');
        if (type && classification) {
          type.value = classification;
          type.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });
    $('clearSavedOnDevice')?.addEventListener('click', syncSavedCards);
    window.addEventListener('storage', event => {
      if (event.key === 'cosmos_favorites' || event.key === null) syncSavedCards();
    });
    window.addEventListener('focus', syncSavedCards);

    if (!window.location.hash) showHome();
    else leaveHome();
    syncSavedCards();
  }

  window.Museum = Object.freeze({ showHome, openLibrary });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
