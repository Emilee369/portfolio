/* Letter imagery and elastic motion adapted from the MIT-licensed template. */
(() => {
  const lifecycle = window.PortfolioNavigation?.page;
  const listen = (target,type,callback,options={}) => target.addEventListener(type,callback,{...options,signal:lifecycle?.signal});
  const watch = (Type,callback,options) => {
    const observer = new Type((...args) => {if (!lifecycle || lifecycle.alive) callback(...args);},options);
    lifecycle?.cleanups.push(()=>observer.disconnect()); return observer;
  };
  const c = window.LETTER_CONFIG;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function choose(items, last) { const pool = items.filter(item => item !== last); return (pool.length ? pool : items)[Math.floor(Math.random() * (pool.length || items.length))]; }
  function setupHero() {
    const words = document.querySelector('#words');
    const status = document.querySelector('#status');
    const replay = document.querySelector('#replay');
    const pause = document.querySelector('#pause');
    const entry = document.querySelector('.page-entry');
    let entryTimer, finishEntry;
    function playPageEntry() {
      clearTimeout(entryTimer);
      finishEntry?.();
      document.documentElement.classList.remove('entry-active');
      if (reduced.matches) return Promise.resolve();
      // Restart the short screen-opening sequence when replay is pressed.
      void entry.offsetWidth;
      document.documentElement.classList.add('entry-active');
      return new Promise(resolve => {
        finishEntry = resolve;
        entryTimer = setTimeout(() => {
          document.documentElement.classList.remove('entry-active');
          finishEntry = null;
          resolve();
        }, 650);
      });
    }
    let entrySeen = false;
    try { entrySeen = sessionStorage.getItem('between-pieces-entry-seen') === '1'; } catch {}
    const firstLanding = !window.PortfolioNavigation?.isNavigating && !entrySeen && (!location.hash || location.hash === '#top');
    if (firstLanding) { try { sessionStorage.setItem('between-pieces-entry-seen', '1'); } catch {} }
    const pageEntered = firstLanding ? playPageEntry() : Promise.resolve();
    const states = [];
    let paused = false, loaded = false, imagesLoading = null, inView = false, autoTimer, introTimers = [], queue = [];
    let index = 0, lastAuto = -1;
    document.querySelector('h1').setAttribute('aria-label', c.text);
    const lines = c.lines || [c.text];
    for (const text of lines) {
      const line = document.createElement('span'); line.className = 'title-line';
      text.split(/\s+/).forEach((word, wi) => {
        if (wi) { const space = document.createElement('span'); space.className = 'space'; line.append(space); }
        const group = document.createElement('span'); group.className = 'word';
        for (const ch of Array.from(word)) {
          const el = document.createElement('button');
          el.type = 'button'; el.className = 'letter'; el.setAttribute('aria-label', 'Animate ' + ch);
          const char = document.createElement('span'); char.className = 'char'; char.textContent = ch; el.append(char);
          const state = {el, char, ch, index, images: [], last: null, active: false, timer: null, hovered: false, focused: false};
          states.push(state); index++;
          el.addEventListener('pointerenter', e => { if (!paused && e.pointerType === 'mouse') { state.hovered = true; cancelIntro(); show(state); } });
          el.addEventListener('pointerleave', () => { state.hovered = false; if (!state.focused) hide(state); });
          el.addEventListener('focus', () => { if (paused) return; state.focused = true; cancelIntro(); show(state); });
          el.addEventListener('blur', () => { state.focused = false; if (!state.hovered) hide(state); });
          el.addEventListener('click', () => { if (paused) return; cancelIntro(); show(state); state.timer = setTimeout(() => hide(state), 1100); });
          group.append(el);
        }
        line.append(group);
      });
      words.append(line);
    }
    function hide(s) {
      clearTimeout(s.timer);
      if (!s.active) return;
      s.active = false; s.el.classList.remove('active'); s.el.classList.add('returning'); s.el.style.paddingInline = '0em';
      const sticker = s.el.querySelector('.sticker');
      if (sticker) {
        const pose = getComputedStyle(sticker).transform;
        sticker.getAnimations().forEach(a => a.cancel());
        if (reduced.matches) sticker.remove();
        else { const exit = sticker.animate([{transform:pose,opacity:1},{transform:pose + ' scale(1.045)',opacity:1,offset:.2},{transform:pose + ' scale(.35)',opacity:0}], {duration:c.exitDuration || 620,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}); exit.onfinish = () => sticker.remove(); }
      }
      queue = queue.filter(other => other !== s);
    }
    function show(s, intro = false) {
      clearTimeout(s.timer);
      if (paused || reduced.matches || !s.images.length) return;
      const src = choose(s.images, s.last); s.last = src; s.active = true;
      s.el.querySelector('.sticker')?.remove(); s.el.classList.remove('returning'); s.el.classList.add('active');
      const sticker = document.createElement('span'); sticker.className = 'sticker';
      const im = document.createElement('img'); im.src = src; im.alt = ''; im.draggable = false; sticker.append(im); s.el.append(sticker);
      s.el.style.paddingInline = intro ? '.028em' : '.055em';
      const angle = [-8,7,-4,8,-6,5][s.index % 6];
      const frames = Array.from({length:41}, (_,i) => { const t = i / 40; const v = i === 40 ? 1 : 1 - Math.exp(-7.2 * t) * (Math.cos(10.5*t) + .24 * Math.sin(10.5*t)); return {offset:t,transform:'translate(-50%, -50%) rotate(' + (angle - 8*(1-v)) + 'deg) scale(' + (.35 + .65*v) + ')'}; });
      sticker.animate(frames, {duration:c.enterDuration || 340,fill:'both'});
      queue = queue.filter(other => other !== s); queue.push(s);
      if (!intro) while (queue.length > 4) hide(queue[0]);
    }
    function cancelIntro() { introTimers.forEach(clearTimeout); introTimers = []; states.forEach(s => { if (!s.hovered && !s.focused) hide(s); }); }
    function runIntro() {
      cancelIntro();
      if (paused) return;
      if (reduced.matches) { status.textContent = 'Motion is reduced to match your system preference.'; return; }
      states.forEach((s,i) => {
        introTimers.push(setTimeout(() => show(s,true),i*42));
        introTimers.push(setTimeout(() => { if (!s.hovered && !s.focused) hide(s); }, 1100+i*35));
      });
      status.textContent = 'Hover, tap, or focus a letter to explore its shapes.';
    }
    function schedule() {
      clearTimeout(autoTimer);
      if (!loaded || paused || reduced.matches || document.hidden || !inView) return;
      autoTimer = setTimeout(() => {
        const candidates = states.filter(s => s.images.length && !s.hovered && !s.focused && s.index !== lastAuto);
        if (candidates.length && !states.some(s => s.hovered || s.focused)) { const s = candidates[Math.floor(Math.random()*candidates.length)]; lastAuto = s.index; show(s); s.timer = setTimeout(() => hide(s),1000); }
        schedule();
      },2100 + Math.random()*1300);
    }
    replay.addEventListener('click', async () => {
      paused = false; pause.setAttribute('aria-pressed','false'); pause.textContent = 'Pause motion';
      words.closest('.hero').classList.remove('motion-paused');
      cancelIntro(); clearTimeout(autoTimer);
      await playPageEntry();
      if (document.documentElement.classList.contains('entry-active')) return;
      runIntro(); schedule();
    });
    pause.addEventListener('click', () => {
      paused = !paused; pause.setAttribute('aria-pressed',String(paused)); pause.textContent = paused ? 'Resume motion' : 'Pause motion';
      words.closest('.hero').classList.toggle('motion-paused',paused);
      if (paused) {
        clearTimeout(entryTimer); document.documentElement.classList.remove('entry-active');
        finishEntry?.(); finishEntry = null;
        introTimers.forEach(clearTimeout); introTimers = []; queue = [];
        states.forEach(s => {
          clearTimeout(s.timer); s.active = s.hovered = s.focused = false;
          s.el.getAnimations({subtree:true}).forEach(animation => animation.cancel());
          s.el.querySelector('.sticker')?.remove();
          s.el.classList.remove('active','returning'); s.el.style.paddingInline = '0em';
        });
      }
      status.textContent = paused ? 'Letter motion and hover interactions paused.' : 'Letter motion and interactions resumed.'; schedule();
    });
    listen(document,'visibilitychange', () => { if (document.hidden) cancelIntro(); schedule(); });
    watch(IntersectionObserver, entries => {
      inView = entries[0].isIntersecting;
      if (inView) prepareLetterImages(); else cancelIntro();
      schedule();
    },{threshold:.15}).observe(words);
    listen(reduced,'change', () => {
      if (reduced.matches) {
        clearTimeout(entryTimer);
        document.documentElement.classList.remove('entry-active');
        finishEntry?.(); finishEntry = null;
      }
      cancelIntro(); schedule();
    });
    lifecycle?.cleanups.push(()=>{
      paused=true;loaded=false;clearTimeout(autoTimer);clearTimeout(entryTimer);
      introTimers.forEach(clearTimeout);states.forEach(state=>clearTimeout(state.timer));
      document.documentElement.classList.remove('entry-active');
    });
    async function loadImage(s,name) {
      const im = new Image(); im.src = 'assets/' + name;
      try { await im.decode(); s.images.push(im.src); } catch { console.warn('Could not load letter image:',name); }
    }
    function prepareLetterImages() {
      if (imagesLoading) return imagesLoading;
      // Load a small batch at a time, and only when the hero is in view.
      const jobs = [0,1].flatMap(variant => states.map((s,i) => [s,c.imagesByPosition[i][variant]]));
      async function worker() {
        while (jobs.length) { const [state,name] = jobs.shift(); await loadImage(state,name); }
      }
      imagesLoading = Promise.all(Array.from({length:4}, worker)).then(() => {
        if (lifecycle && !lifecycle.alive) return;
        loaded = true; replay.disabled = pause.disabled = false;
        pageEntered.then(() => {
          if (firstLanding && !paused && inView) runIntro();
          else if (!paused) status.textContent = 'Hover, tap, or focus a letter to explore its shapes.';
          schedule();
        });
      });
      return imagesLoading;
    }
  }
  const profile=window.PORTFOLIO_CONFIG;
  document.querySelector('.identity').setAttribute('aria-label',profile.name+', home');
  const aboutCopy = document.querySelector('.about-copy>p');
  if (aboutCopy) aboutCopy.textContent='I’m '+profile.name+', a '+profile.role.toLowerCase()+' who believes good experiences begin with understanding people.';
  document.querySelector('#year').textContent=new Date().getFullYear();
  document.querySelectorAll('[data-profile-name]').forEach(el => { el.textContent = profile.name; });
  document.querySelectorAll('[data-profile-role]').forEach(el => { el.textContent = profile.role; });
  function setupShape(selector, position) {
    const image = document.querySelector(selector);
    if (!image) return;
    const variants = c.imagesByPosition[position].map(name => new URL('assets/' + name, location.href).href);
    image.parentElement.addEventListener('click', () => { image.src = choose(variants, image.src); });
  }
  setupShape('#about-sticker', 6);
  setupShape('#footer-sticker', 0);
  if (document.querySelector('#words')) setupHero();
  document.querySelector('#print-resume')?.addEventListener('click', () => window.print());
})();
