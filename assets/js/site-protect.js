/*
 * CodeBuzz.ai — right-click / inspect deterrent
 * ------------------------------------------------
 * Set these to true before deploying. Both are OFF by default, and the
 * script never runs on localhost (so local development is unaffected).
 *
 * Note: this only deters casual users. Browser menus, view-source: and
 * the Network tab still work, so never put secrets in website code.
 */
(function () {
  var CONFIG = {
    disableRightClick: false,       // block the right-click menu (still allowed inside form fields)
    blockInspectShortcuts: false    // block F12, Ctrl+Shift+I/J/C and Ctrl+U (Cmd+Option on Mac)
  };

  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;

  function inFormField(el) {
    return el && el.closest && el.closest('input, textarea, select, [contenteditable="true"]');
  }

  if (CONFIG.disableRightClick) {
    document.addEventListener('contextmenu', function (e) {
      if (!inFormField(e.target)) e.preventDefault();
    });
  }

  if (CONFIG.blockInspectShortcuts) {
    document.addEventListener('keydown', function (e) {
      // e.code is layout-independent (Option on Mac changes e.key to symbols)
      var k = (e.code || '').replace(/^Key/, '');
      var mod = e.ctrlKey || e.metaKey;
      var devtools = (mod && e.shiftKey && (k === 'I' || k === 'J' || k === 'C')) ||   // Windows / Linux
                     (e.metaKey && e.altKey && (k === 'I' || k === 'J' || k === 'C'));  // Mac
      var viewSource = (mod && k === 'U') || (e.metaKey && e.altKey && k === 'U');
      if (k === 'F12' || devtools || viewSource) e.preventDefault();
    });
  }
})();
