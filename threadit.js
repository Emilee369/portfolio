/* Original screen exports, framed in code. No app UI is recreated. */
(() => {
  const lifecycle = window.PortfolioNavigation?.page;
  const listen = (target,type,callback,options={}) => target.addEventListener(type,callback,{...options,signal:lifecycle?.signal});
  const watch = (Type,callback,options) => {
    const observer = new Type((...args) => {if (!lifecycle || lifecycle.alive) callback(...args);},options);
    lifecycle?.cleanups.push(()=>observer.disconnect()); return observer;
  };
  const assets = window.THREADIT_ASSETS || {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Animate the evidence once, when it enters view; values stay readable and exact.
  const dataGroups=[...document.querySelectorAll('.threadit-stats,.research-screen-interest,.research-sources,.research-interviews dl')];
  if (!reduced.matches && dataGroups.length) {
    const dataObserver=watch(IntersectionObserver,entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-data-visible');dataObserver.unobserve(entry.target);}
    }),{threshold:.15});
    dataGroups.forEach(group=>{group.classList.add('data-motion-ready');[...group.children].forEach((child,i)=>child.style.setProperty('--data-order',i));dataObserver.observe(group);});
    listen(reduced,'change',()=>{if(reduced.matches){dataGroups.forEach(group=>group.classList.remove('data-motion-ready'));dataObserver.disconnect();}});
  }
  function makeImage(key) {
    const image = document.createElement('img');
    image.alt = assets[key].alt; image.decoding = 'async'; image.src = assets[key].src;
    return image;
  }
  document.querySelectorAll('[data-threadit-asset]').forEach(slot => {
    const key = slot.dataset.threaditAsset, asset = assets[key];
    if (!asset?.src) return;
    let url;
    try { url = new URL(asset.src, location.href); } catch { return; }
    if (!['http:', 'https:'].includes(url.protocol)) return;
    const placeholder = slot.firstElementChild;
    let media;
    const ready = () => {
      placeholder.hidden = true; media.hidden = false; slot.classList.add('has-asset');
      if (key === 'cover') slot.closest('.threadit-cover')?.classList.add('has-asset');
    };
    if (asset.type === 'image') {
      media = document.createElement('img'); media.alt = asset.alt;
      media.decoding = 'async';
      if (key === 'teamPhoto') { media.loading = 'lazy'; media.width = 3200; media.height = 2400; }
      media.addEventListener('load', ready, {once:true});
    } else if (asset.type === 'video') {
      media = document.createElement('video'); media.id = slot.dataset.videoId || 'closet-video';
      media.controls = false; media.muted = true; media.defaultMuted = true;
      media.loop = true; media.playsInline = true; media.autoplay = false;
      media.setAttribute('muted', ''); media.setAttribute('loop', '');
      media.setAttribute('playsinline', '');
      media.preload = 'none'; media.disablePictureInPicture = true;
      media.setAttribute('aria-label', asset.alt);
      media.addEventListener('loadedmetadata', ready, {once:true});
    } else return;
    // Keep the video in the rendered device from the start. Hiding it while
    // starting/stopping playback can leave WebKit's video layer blank on resume.
    media.hidden = asset.type !== 'video' && media.loading !== 'lazy';
    if (asset.type === 'video' || media.loading === 'lazy') placeholder.hidden = true;
    media.addEventListener('error', () => {
      if (asset.type === 'image') { media.hidden = true; placeholder.hidden = false; }
    });
    media.src = url.href; slot.append(media);
    if (asset.type === 'video') setupVideo(media, slot);
  });

  function setupVideo(video, slot) {
    const button = document.querySelector(slot.dataset.videoControl || '#toggle-prototype');
    const viewport = video.closest('.iphone-recording');
    let visible = false, userPaused = false, failed = false, requested = false, motionAllowed = !reduced.matches;
    function prepareVideo() {
      if (requested) return;
      requested = true; video.preload = 'auto'; video.load();
    }
    function reflect() {
      if (lifecycle && !lifecycle.alive) return;
      if (failed) { button.disabled = false; button.textContent = 'Retry animation ↻'; return; }
      button.replaceChildren(document.createTextNode(video.paused ? 'Play animation ' : 'Pause animation '));
      const icon = document.createElement('span'); icon.setAttribute('aria-hidden', 'true');
      icon.textContent = video.paused ? '▶' : 'Ⅱ'; button.append(icon);
      button.disabled = false;
    }
    function sync() {
      if (lifecycle && !lifecycle.alive) return;
      if (visible) prepareVideo();
      if (visible && !userPaused && motionAllowed && document.visibilityState === 'visible') {
        // Wait for a decoded frame rather than racing the initial load.
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.paused) {
          video.play().catch(reflect);
        }
      } else video.pause();
    }
    video.addEventListener('playing', reflect); video.addEventListener('pause', reflect);
    video.addEventListener('loadedmetadata', () => { reflect(); sync(); });
    video.addEventListener('loadeddata', () => { failed = false; reflect(); sync(); });
    video.addEventListener('canplay', sync);
    video.addEventListener('error', () => { failed = true; reflect(); });
    const preloader = watch(IntersectionObserver, entries => {
      if (entries[0].isIntersecting) { prepareVideo(); preloader.disconnect(); }
    }, {rootMargin:'400px'});
    preloader.observe(viewport);
    watch(IntersectionObserver, entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .15; sync();
    }, {threshold:[0,.15]}).observe(viewport);
    listen(document,'visibilitychange', sync);
    listen(window,'pageshow', sync);
    listen(reduced,'change', () => {
      motionAllowed = !reduced.matches;
      sync();
    });
    button.addEventListener('click', () => {
      if (failed) { failed = false; userPaused = false; motionAllowed = true; video.load(); reflect(); sync(); return; }
      if (video.paused) { userPaused = false; motionAllowed = true; prepareVideo(); video.play().catch(reflect); }
      else { userPaused = true; video.pause(); }
    });
  }

  const cover = document.querySelector('.threadit-cover-asset');
  const coverKeys = ['closetWardrobe', 'closetWishlist'];
  if (cover && !cover.querySelector('img') && !assets.cover?.src && coverKeys.every(key => assets[key]?.src)) {
    const screens = document.createElement('span'); screens.className = 'threadit-cover-screens';
    let count = 0;
    coverKeys.forEach(key => {
      const phone = document.createElement('span'); phone.className = 'iphone';
      const display = document.createElement('span'); display.className = 'iphone-display';
      const image = makeImage(key);
      image.addEventListener('load', () => {
        if (++count === coverKeys.length) {
          cover.replaceChildren(screens); cover.closest('.threadit-cover').classList.add('has-composite');
        }
      }, {once:true});
      display.append(image); phone.append(display); screens.append(phone);
    });
  }

  const comparisonImage = document.querySelector('#comparison-image');
  if (comparisonImage) {
    const buttons = [...document.querySelectorAll('[data-comparison]')];
    const versions = {
      before: {key:'closetBefore',heading:'The earlier Wardrobe.',description:'The earlier Closet design shows categories, search, a clothing grid, and wear counts, before Wishlist and the user profile were added.',caption:'Earlier Closet design'},
      after: {key:'closetRevised',heading:'Wardrobe and Wishlist, together.',description:'The revised Closet includes adjacent Wardrobe and Wishlist tabs, with a user profile above.',caption:'Final Closet design'}
    };
    // Decode the actual exports before the switch is used; dimensions remain fixed.
    Object.values(versions).forEach(version => { makeImage(version.key).decode().catch(() => {}); });
    function select(version) {
      const content = versions[version];
      comparisonImage.src = assets[content.key].src; comparisonImage.alt = assets[content.key].alt;
      document.querySelector('#comparison-heading').textContent = content.heading;
      document.querySelector('#comparison-description').textContent = content.description;
      document.querySelector('#comparison-caption').textContent = content.caption;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.comparison === version)));
    }
    buttons.forEach(button => {
      button.addEventListener('click', () => select(button.dataset.comparison));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const target = event.key === 'ArrowLeft' || event.key === 'Home' ? buttons[0] : buttons[1];
        target.focus(); select(target.dataset.comparison);
      });
    });
  }

  const navigation = document.querySelector('.threadit-nav');
  if (!navigation) return;
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  let scheduled = false;
  function updateSection() {
    if (lifecycle && !lifecycle.alive) return;
    scheduled = false;
    const threshold = navigation.getBoundingClientRect().bottom + 100;
    let active = 0;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= threshold) active = i; });
    links.forEach((link, i) => {
      if (i === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateSection); } }
  listen(window,'scroll', schedule, {passive:true});
  listen(window,'resize', schedule); updateSection();
})();
