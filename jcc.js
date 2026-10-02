(() => {
  const lifecycle = window.PortfolioNavigation?.page;
  const listen = (target, type, callback, options = {}) => target.addEventListener(type, callback, {...options, signal:lifecycle?.signal});
  const video = document.querySelector('#jcc-prototype-video');
  if (video) {
    const toggle = document.querySelector('#toggle-jcc-prototype');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, requested = false, userPaused = false, motionAllowed = !reduced.matches, failed = false;
    video.muted = true; video.defaultMuted = true;
    const prepare = () => { if (!requested) { requested = true; video.preload = 'auto'; video.load(); } };
    const reflect = () => {
      if (lifecycle && !lifecycle.alive) return;
      toggle.textContent = failed ? 'Retry animation' : video.paused ? 'Play animation' : 'Pause animation';
      toggle.setAttribute('aria-label', failed ? 'Retry Alumni prototype' : video.paused ? 'Play Alumni prototype' : 'Pause Alumni prototype');
    };
    const sync = () => {
      if (lifecycle && !lifecycle.alive) return;
      if (visible) prepare();
      if (visible && !userPaused && motionAllowed && document.visibilityState === 'visible') {
        if (video.readyState >= 2 && video.paused) video.play().catch(reflect);
      } else video.pause();
    };
    listen(video, 'playing', reflect); listen(video, 'pause', reflect);
    listen(video, 'loadeddata', () => { failed = false; reflect(); sync(); });
    listen(video, 'canplay', sync);
    listen(video, 'error', () => { failed = true; reflect(); });
    listen(toggle, 'click', () => {
      if (failed) { failed = false; userPaused = false; motionAllowed = true; video.load(); sync(); return; }
      if (video.paused) { userPaused = false; motionAllowed = true; prepare(); video.play().catch(reflect); }
      else { userPaused = true; video.pause(); }
    });
    const observer = new IntersectionObserver(entries => {
      if (lifecycle && !lifecycle.alive) return;
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .15; sync();
    }, {threshold:[0,.15]});
    observer.observe(video);
    listen(document, 'visibilitychange', sync); listen(window, 'pageshow', sync);
    listen(reduced, 'change', () => { motionAllowed = !reduced.matches; sync(); });
    lifecycle?.cleanups.push(() => { observer.disconnect(); video.pause(); video.removeAttribute('src'); video.querySelectorAll('source').forEach(source => source.removeAttribute('src')); video.load(); });
    reflect();
  }
  const dialog = document.querySelector('.jcc-dialog');
  let opener;
  if (dialog) {
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('#jcc-dialog-caption');
    document.querySelectorAll('[data-enlarge]').forEach(button => {
      listen(button, 'click', () => {
        opener = button;
        image.src = button.dataset.enlarge;
        image.alt = button.querySelector('img').alt;
        caption.textContent = button.dataset.caption;
        dialog.showModal();
      });
    });
    listen(dialog.querySelector('button'), 'click', () => dialog.close());
    listen(dialog, 'click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    listen(dialog, 'close', () => { if (!lifecycle || lifecycle.alive) opener?.focus(); });
    lifecycle?.cleanups.push(() => { if (dialog.open) dialog.close(); });
  }
  const navigation = document.querySelector('.threadit-nav');
  if (!navigation) return;
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  let scheduled = false;
  const update = () => {
    scheduled = false;
    if (lifecycle && !lifecycle.alive) return;
    const threshold = navigation.getBoundingClientRect().bottom + 100;
    let active = 0;
    sections.forEach((section, index) => { if (section.getBoundingClientRect().top <= threshold) active = index; });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
  listen(window, 'scroll', schedule, {passive:true});
  listen(window, 'resize', schedule);
  update();
})();
