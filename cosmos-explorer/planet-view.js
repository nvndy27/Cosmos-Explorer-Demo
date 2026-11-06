'use strict';
// A deliberate view choice in the profile; the diagram always stays an overview.
(() => {
  const controls = document.getElementById('planetArtControls');
  const button = document.getElementById('planetArtToggle');
  const caption = document.getElementById('planetArtCaption');
  const details = document.getElementById('details');
  function setIllustration(active) {
    details.classList.toggle('illustration-active', active);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? 'Trở lại ảnh tư liệu' : 'Xem minh họa hành tinh';
    caption.classList.toggle('hidden', !active);
    document.getElementById('detailCanvas').setAttribute('aria-hidden', String(!active));
  }
  const original = window.renderDetailArt;
  window.renderDetailArt = function (record) {
    const result = original(record);
    controls.classList.toggle('hidden', !solarIds.includes(record.id));
    setIllustration(false);
    return result;
  };
  button.addEventListener('click', () => setIllustration(button.getAttribute('aria-pressed') !== 'true'));
  controls.classList.toggle('hidden', !solarIds.includes(current));
  setIllustration(false);
})();
