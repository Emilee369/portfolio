/* The original drawing and process movie share the illustration's coordinate space. */
(() => {
  const lifecycle = window.PortfolioNavigation?.page;
  const listen = (target,type,callback,options={}) => target.addEventListener(type,callback,{...options,signal:lifecycle?.signal});
  const watch = (Type,callback,options) => {
    const observer = new Type((...args) => {if (!lifecycle || lifecycle.alive) callback(...args);},options);
    lifecycle?.cleanups.push(()=>observer.disconnect()); return observer;
  };
  const screen = document.querySelector('#desk-video');
  if (!screen) return;
  const expanded = document.querySelector('#drawing-video');
  const dialog = document.querySelector('#drawing-dialog');
  const opener = document.querySelector('#open-drawing');
  const toggle = document.querySelector('#toggle-drawing');
  const status = document.querySelector('#drawing-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false, screenPrepared = false, expandedPrepared = false, paused = false;
  function prepare(video) {
    if (video === screen ? screenPrepared : expandedPrepared) return;
    if (video === screen) screenPrepared = true; else expandedPrepared = true;
    video.muted = true; video.preload = 'auto'; video.load();
  }
  function play(video) {
    prepare(video);
    return video.play().catch(() => {
      if (video === expanded) {
        paused = true; toggle.textContent = 'Play drawing process';
        status.textContent = 'Press Play drawing process to start the recording.';
      }
    });
  }
  function sync() {
    if (lifecycle && !lifecycle.alive) return;
    if (dialog.open) {
      screen.pause();
      if (document.hidden || paused) expanded.pause(); else play(expanded);
    } else {
      expanded.pause();
      if (inView && !document.hidden && !reducedMotion.matches) play(screen); else screen.pause();
    }
  }
  const near = watch(IntersectionObserver, entries => {
    if (entries.some(entry => entry.isIntersecting)) { prepare(screen); near.disconnect(); }
  }, {rootMargin:'250px'});
  near.observe(screen);
  watch(IntersectionObserver, entries => { inView = entries[0].isIntersecting; sync(); }, {threshold:.15}).observe(screen);
  for (const event of ['loadeddata','canplay']) screen.addEventListener(event,sync);
  listen(document,'visibilitychange',sync);
  listen(reducedMotion,'change',sync);
  opener.addEventListener('click', () => {
    paused = false; status.textContent = ''; toggle.textContent = 'Pause drawing process';
    dialog.showModal();
    prepare(expanded);
    const seek = () => { if (Number.isFinite(screen.currentTime)) expanded.currentTime = screen.currentTime; };
    if (expanded.readyState >= 1) seek(); else expanded.addEventListener('loadedmetadata',seek,{once:true});
    sync();
  });
  document.querySelector('#close-drawing').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    if (screen.readyState >= 1 && Number.isFinite(expanded.currentTime)) screen.currentTime = expanded.currentTime;
    sync(); opener.focus({preventScroll:true});
  });
  dialog.addEventListener('click',event=>{
    if(event.target !== dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)dialog.close();
  });
  toggle.addEventListener('click',()=>{
    paused = !paused; status.textContent = '';
    toggle.textContent = paused ? 'Play drawing process' : 'Pause drawing process'; sync();
  });
  expanded.addEventListener('error',()=>{
    status.textContent = 'This browser could not play the recording.';
    paused = true; toggle.textContent = 'Retry drawing process';
    expandedPrepared = false;
  });
})();
