(() => {
  const root = document.documentElement;
  const fontButtons = [...document.querySelectorAll('[data-font]')].filter(e => e.tagName === 'BUTTON');
  function setFont(font) {
    if (!['manrope', 'inter', 'space'].includes(font)) return;
    root.dataset.font = font;
    fontButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.font === font)));
    try { localStorage.setItem('3fig-review-font', font); } catch (_) {}
  }
  try { setFont(localStorage.getItem('3fig-review-font') || 'manrope'); } catch (_) {}
  fontButtons.forEach(b => b.addEventListener('click', () => setFont(b.dataset.font)));
  // Local review instrumentation only. No personal data, remote analytics, or signup requests.
  window.reviewEvents = [];
  function record(name, props = {}) {
    window.reviewEvents.push({name, ...props, version:document.body.className, time:Date.now()});
    window.dispatchEvent(new CustomEvent('3fig-review-event', {detail:{name,...props}}));
  }
  const dialog = document.getElementById('signup');
  const form = document.getElementById('waitlist-form');
  let trigger = null;
  document.querySelectorAll('[data-signup]').forEach(b => b.addEventListener('click', () => {
    trigger = b;
    record('early_access_click', {placement:b.dataset.location});
    document.getElementById('form-status').textContent = '';
    dialog.showModal();
    document.body.classList.add('modal-open');
  }));
  const close = () => dialog.close();
  dialog.querySelector('.close').addEventListener('click',close);
  dialog.addEventListener('click',e => { if(e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close(); } });
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');trigger?.focus();});
  form.addEventListener('submit',e=>{
    e.preventDefault();
    record('waitlist_submit_test');
    document.getElementById('form-status').textContent = 'Review complete. No signup was sent or saved.';
    form.reset();
  });
})();
