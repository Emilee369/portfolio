(() => {
  'use strict';
  const root = document.querySelector('.about-story');
  if (!root) return;
  const page = window.PortfolioNavigation?.page;
  const local = new AbortController(), signal = page?.signal || local.signal;
  const $ = selector => root.querySelector(selector);
  const listen = (node, type, fn, options = {}) => node?.addEventListener(type, fn, {...options, signal});
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => {timers.delete(id); if (!signal.aborted) fn();}, ms); timers.add(id); return id; };
  const cancel = id => {clearTimeout(id); timers.delete(id);};
  
  const shade = $('#window-shade'), shadePanel = $('.window-shade'), views = [...root.querySelectorAll('[data-window-view]')];
  const destinations = ['Above the clouds', 'Taipei, Taiwan', 'San Francisco, California'];
  let windowClosed = false, destination = 0, shadeDrag = null, suppressShadeClick = false;
  const flight = views.find(view => view.tagName === 'VIDEO');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let windowVisible = true;
  function syncFlight() {
    if (!flight) return;
    if (signal.aborted || document.hidden || windowClosed || destination !== 0 || !windowVisible || reduced.matches) flight.pause();
    else flight.play().catch(() => {});
  }
  if (flight) flight.muted = true;
  const flightObserver = new IntersectionObserver(entries => {windowVisible = entries[0].isIntersecting; syncFlight();});
  flightObserver.observe($('.airplane-window'));
  listen(document,'visibilitychange',syncFlight);listen(reduced,'change',syncFlight);
  syncFlight();

  // Key the supplied recording onto a transparent canvas, including browsers
  // that cannot decode alpha video. No rectangle or screen-blend dependency.
  const cursorVideo=$('.cursor-source'),cursorCanvas=$('.cursor-animation'),cursorStill=$('.cursor-still');
  const cursorContext=cursorCanvas?.getContext('2d',{willReadFrequently:true});
  const cursorFigure=cursorCanvas?.closest('.personal-cursor');
  let cursorVisible=true,cursorFrame=null,cursorTimer=null,cursorFinished=false,cursorStillTimer=null;
  function finishCursor(){
    cursorFinished=true;cursorVideo?.pause();cancelCursorFrame();
    if(cursorStillTimer!==null)cancel(cursorStillTimer);
    cursorStillTimer=null;if(cursorFigure)cursorFigure.hidden=true;
  }
  function cancelCursorFrame(){
    if(cursorFrame!==null)cursorVideo?.cancelVideoFrameCallback?.(cursorFrame);
    clearTimeout(cursorTimer);cursorFrame=null;cursorTimer=null;
  }
  function drawCursor(){
    cursorFrame=null;cursorTimer=null;
    if(!cursorContext || cursorVideo.readyState<2 || signal.aborted)return;
    cursorContext.drawImage(cursorVideo,0,0,330,150);
    const frame=cursorContext.getImageData(0,0,330,150),pixels=frame.data;
    for(let i=0;i<pixels.length;i+=4){
      const brightness=Math.max(pixels[i],pixels[i+1],pixels[i+2]);
      const alpha=Math.max(0,Math.min(1,(brightness-20)/35));
      pixels[i+3]=Math.round(255*alpha);
      if(alpha>0 && alpha<1)for(let c=0;c<3;c++)pixels[i+c]=Math.min(255,pixels[i+c]/alpha);
    }
    cursorContext.putImageData(frame,0,0);cursorCanvas.hidden=false;cursorStill.hidden=true;
    const progress=Math.min(1,cursorVideo.currentTime/13.2);
    cursorFigure.style.setProperty('--cursor-drift-x',`${Math.sin(progress*Math.PI*2)*5}px`);
    cursorFigure.style.setProperty('--cursor-drift-y',`${Math.sin(progress*Math.PI*3)*3}px`);
    cursorFigure.style.setProperty('--cursor-drift-angle',`${Math.sin(progress*Math.PI*2)*1.5}deg`);
    cursorFigure.style.opacity=String(Math.min(1,(13.2-cursorVideo.currentTime)/.7));
    if(!cursorVideo.paused)scheduleCursorFrame();
  }
  function scheduleCursorFrame(){
    if(signal.aborted || cursorFinished || cursorVideo.paused || !cursorVisible || document.hidden || reduced.matches)return;
    if(cursorFrame!==null || cursorTimer!==null)return;
    if(cursorVideo.requestVideoFrameCallback)cursorFrame=cursorVideo.requestVideoFrameCallback(drawCursor);
    else cursorTimer=setTimeout(drawCursor,63);
  }
  function syncCursor(){
    if(!cursorVideo || !cursorContext || cursorFinished)return;
    if(signal.aborted || document.hidden || !cursorVisible || reduced.matches){
      cursorVideo.pause();cancelCursorFrame();
      if(reduced.matches){
        cursorCanvas.hidden=true;cursorStill.hidden=false;
        cursorFigure.style.removeProperty('--cursor-drift-x');cursorFigure.style.removeProperty('--cursor-drift-y');cursorFigure.style.removeProperty('--cursor-drift-angle');
        if(cursorStillTimer===null)cursorStillTimer=later(finishCursor,Math.max(500,(13.2-cursorVideo.currentTime)*1000));
      }
    }else {
      if(cursorStillTimer!==null){cancel(cursorStillTimer);cursorStillTimer=null;}
      cursorVideo.play().then(scheduleCursorFrame).catch(()=>{});
    }
  }
  if(cursorVideo)cursorVideo.muted=true;
  const cursorObserver=new IntersectionObserver(entries=>{cursorVisible=entries[0].isIntersecting;syncCursor();});
  if(cursorCanvas)cursorObserver.observe(cursorCanvas.closest('.personal-cursor'));
  listen(cursorVideo,'loadeddata',syncCursor);listen(cursorVideo,'playing',scheduleCursorFrame);
  listen(cursorVideo,'ended',finishCursor);
  listen(document,'visibilitychange',syncCursor);listen(reduced,'change',syncCursor);syncCursor();
  function setShade(closed) {
    if (windowClosed && !closed) {
      destination = (destination + 1) % views.length;
      views.forEach((view, index) => view.hidden = index !== destination);
      $('#window-location').textContent = destinations[destination];
    }
    if (closed && views[(destination + 1) % views.length].tagName === 'IMG') views[(destination + 1) % views.length].loading = 'eager';
    windowClosed = closed; syncFlight(); shade.classList.toggle('is-closed', closed);
    shade.setAttribute('aria-expanded', String(!closed));
    shade.setAttribute('aria-label', closed ? 'Open the airplane window shade to the next place' : 'Close the airplane window shade');
  }
  listen(shade, 'click', () => {if (!suppressShadeClick) setShade(!windowClosed);});
  listen(shade, 'keydown', event => {
    if (!['ArrowUp','ArrowDown'].includes(event.key)) return;
    event.preventDefault(); setShade(event.key === 'ArrowDown');
  });
  listen(shade, 'pointerdown', event => {
    if (event.button !== 0) return;
    shadeDrag = {id:event.pointerId, y:event.clientY, initial:windowClosed ? 1 : 0, moved:false, progress:windowClosed ? 1 : 0};
    shade.setPointerCapture?.(event.pointerId);
  });
  listen(shade, 'pointermove', event => {
    if (!shadeDrag || shadeDrag.id !== event.pointerId) return;
    const dy = event.clientY - shadeDrag.y;
    if (Math.abs(dy) > 7) shadeDrag.moved = true;
    if (!shadeDrag.moved) return;
    shade.classList.add('is-dragging');
    const distance = Math.max(1, shade.clientHeight - 28);
    shadeDrag.progress = Math.max(0, Math.min(1, shadeDrag.initial + dy / distance));
    shadePanel.style.transform = `translateY(${-(1-shadeDrag.progress)*distance}px)`;
  });
  function endShadeDrag(event) {
    if (!shadeDrag || shadeDrag.id !== event.pointerId) return;
    const drag = shadeDrag; shadeDrag = null;
    shade.classList.remove('is-dragging'); shadePanel.style.transform = '';
    shade.releasePointerCapture?.(event.pointerId);
    if (drag.moved) {suppressShadeClick = true; later(() => suppressShadeClick = false, 0); if (event.type !== 'pointercancel') setShade(drag.progress >= .5);}
  }
  listen(shade, 'pointerup', endShadeDrag); listen(shade, 'pointercancel', endShadeDrag);

  // Objects can be rearranged within this page's canvas, without covering the header/footer.
  const objects = [...root.querySelectorAll('[data-about-object]')];
  const compact = matchMedia('(max-width: 1020px)');
  let objectDrag = null;
  const offsetOf = object => ({x:Number(object.dataset.offsetX || 0), y:Number(object.dataset.offsetY || 0)});
  function moveObject(object, x, y) {
    const current = offsetOf(object), bounds = root.getBoundingClientRect(), rect = object.getBoundingClientRect();
    const left = rect.left - bounds.left - current.x, top = rect.top - bounds.top - current.y;
    x = Math.max(12-left, Math.min(x, bounds.width-rect.width-12-left));
    y = Math.max(12-top, Math.min(y, bounds.height-rect.height-24-top));
    object.dataset.offsetX=x; object.dataset.offsetY=y;
    object.style.setProperty('--object-x', `${x}px`); object.style.setProperty('--object-y', `${y}px`);
  }
  function resetObject(object) {
    object.style.removeProperty('left');object.style.removeProperty('right');object.style.removeProperty('top');object.style.removeProperty('z-index');
    object.style.removeProperty('--object-angle');object.style.removeProperty('--object-x');object.style.removeProperty('--object-y');
    delete object.dataset.offsetX; delete object.dataset.offsetY;
  }
  objects.forEach(object => {
    listen(object,'pointerdown',event => {
      if (compact.matches || event.button !== 0 || event.target.closest('a,input,.window-toggle,#play-record,#next-song') || (event.target.closest('button') && !event.target.closest('.object-grip'))) return;
      const offset=offsetOf(object);objectDrag={object,id:event.pointerId,x:event.clientX,y:event.clientY,offset};
      object.setPointerCapture?.(event.pointerId);object.classList.add('object-moving');
    });
    listen(object,'pointermove',event => {
      if (!objectDrag || objectDrag.object!==object || objectDrag.id!==event.pointerId) return;
      moveObject(object,objectDrag.offset.x+event.clientX-objectDrag.x,objectDrag.offset.y+event.clientY-objectDrag.y);
    });
    const finishMove = event => {
      if (!objectDrag || objectDrag.object!==object || objectDrag.id!==event.pointerId) return;
      if (event.type==='pointercancel') moveObject(object,objectDrag.offset.x,objectDrag.offset.y);
      objectDrag=null;object.classList.remove('object-moving');object.releasePointerCapture?.(event.pointerId);
    };
    listen(object,'pointerup',finishMove);listen(object,'pointercancel',finishMove);
    listen(object.querySelector('.object-grip'),'keydown',event => {
      if (compact.matches) return;
      if (event.key==='Escape') {event.preventDefault();resetObject(object);return;}
      const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
      if (!direction) return;
      event.preventDefault();const offset=offsetOf(object),step=event.shiftKey?24:8;moveObject(object,offset.x+direction[0]*step,offset.y+direction[1]*step);
    });
  });
  function deskMode(messy) {
    root.dataset.arrangement=messy?'messy':'tidy';
    $('.laptop-open').hidden=!messy;$('.laptop-closed').hidden=messy;
    objects.forEach(resetObject);
    if (messy && !compact.matches) {
      const layout={photo:[8,205,-23,3],'character-one':[17,155,-18,5],'character-two':[23,235,22,5],matcha:[75,640,17,6],window:[6,345,-13,1],music:[70,75,9,2],laptop:[68,510,-18,3],hotpot:[18,625,18,5],folder:[49,110,-9,4]};
      objects.forEach(object=>{
        const pose=layout[object.dataset.aboutObject] || [10,100,8];
        object.style.left=`${Math.max(12,Math.min(root.clientWidth-object.offsetWidth-12,root.clientWidth*pose[0]/100))}px`;
        object.style.right='auto';object.style.top=`${Math.max(12,Math.min(root.clientHeight-object.offsetHeight-70,pose[1]*root.clientHeight/880))}px`;
        object.style.setProperty('--object-angle',`${pose[2]}deg`);object.style.zIndex=pose[3];
      });
    }
    if (messy && compact.matches) objects.forEach((object,i)=>object.style.setProperty('--object-angle',`${[13,-9,12,-12,-3,3,-12,14,-8][i]}deg`));
    $('.outside-story').hidden=!messy;$('.outside-clean').hidden=messy;
    $('#messy-about').setAttribute('aria-pressed',String(messy));$('#tidy-about').setAttribute('aria-pressed',String(!messy));
    $('#arrangement-status').textContent=messy?'Coffee break. A little creative chaos.':'Cleaned up. Everything in its place.';
  }
  listen($('#tidy-about'),'click',()=>deskMode(false));
  listen($('#messy-about'),'click',()=>deskMode(true));
  listen(compact,'change',()=>{if(compact.matches)deskMode(false);});
  listen(window,'resize',()=>{if(!compact.matches)deskMode(root.dataset.arrangement==='messy');});

  // The app icons lift from the folder on hover; touch and keyboard can toggle it too.
  const folder=$('.software-folder'), folderButton=$('#software-folder'), folderApps=$('#software-apps');
  let folderPointerOpen=null;
  function showApps(open){folder.dataset.open=String(open);folderButton.setAttribute('aria-expanded',String(open));folderApps.setAttribute('aria-hidden',String(!open));}
  listen(folder,'mouseenter',()=>showApps(true));
  listen(folder,'mouseleave',()=>{if(!folder.contains(document.activeElement))showApps(false);});
  listen(folder,'focusin',event=>{if(event.target===folderButton)showApps(true);});
  listen(folder,'focusout',event=>{if(!folder.contains(event.relatedTarget))showApps(false);});
  listen(folderButton,'pointerdown',()=>{folderPointerOpen=folderButton.getAttribute('aria-expanded')==='true';});
  listen(folderButton,'pointercancel',()=>{folderPointerOpen=null;});
  listen(folderButton,'click',()=>{showApps(!(folderPointerOpen ?? (folderButton.getAttribute('aria-expanded')==='true')));folderPointerOpen=null;});
  listen(folderButton,'keydown',event=>{if(event.key==='Escape'){event.preventDefault();showApps(false);}});

  // Direct playback of Emily’s supplied recordings; no external player requests.
  const tracks = window.ABOUT_MEDIA?.tracks || [];
  const player = $('#record-player'), play = $('#play-record'), volume = $('#record-volume'), musicNote = $('#music-note');
  const audio = document.createElement('audio'); audio.preload = 'none'; audio.volume = .5; audio.hidden = true; $('#music').append(audio);
  let selected = -1, playing = false, playbackRequest = 0;
  const setPlaying = value => {
    playing=value;player.classList.toggle('is-playing',value);
    play.querySelector('span').textContent=value?'Pause':'Play';play.setAttribute('aria-label',value?'Pause':'Play');play.setAttribute('aria-pressed',String(value));
  };
  function stopMusic() {playbackRequest++;audio.pause();setPlaying(false);}
  async function startMusic() {
    const request=++playbackRequest;
    try {await audio.play();if(request===playbackRequest && !signal.aborted)musicNote.textContent='Playing '+tracks[selected].title+'.';}
    catch (_) {if(request===playbackRequest && !signal.aborted)musicNote.textContent='Tap Play to start the recording.';}
  }
  function discArtwork(track, index) {
    const id='album-disc-'+index;
    return `<defs><clipPath id="${id}"><circle cx="55" cy="55" r="48"/></clipPath><linearGradient id="${id}-silver" x2="1" y2="1"><stop stop-color="#dddde3"/><stop offset=".3" stop-color="#fff"/><stop offset=".55" stop-color="#b8c3c7"/><stop offset=".8" stop-color="#f4e4ef"/><stop offset="1" stop-color="#d3d6d7"/></linearGradient></defs><circle cx="55" cy="55" r="51" fill="url(#${id}-silver)" stroke="#d1d2d4" stroke-width=".5"/><image href="${track.coverSrc}" x="7" y="7" width="96" height="96" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/><circle cx="55" cy="55" r="48" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/><circle cx="55" cy="55" r="12" fill="url(#${id}-silver)" fill-opacity=".9"/><circle cx="55" cy="55" r="7" fill="#efeee9" stroke="#a9adb0" stroke-width=".6"/><circle cx="55" cy="55" r="4" fill="#faf9f7" stroke="#c1beb5" stroke-width=".5"/>`;
  }
  function selectRecord(index, continuePlaying=false) {
    if(!tracks.length)return;
    index=(index+tracks.length)%tracks.length;
    if(index===selected)return;
    stopMusic();selected=index;
    const track=tracks[index];
    $('.player-disc').innerHTML=`<svg x="58" y="43" width="204" height="204" viewBox="0 0 110 110">${discArtwork(track,index)}</svg>`;
    player.classList.remove('record-changing');void player.offsetWidth;player.classList.add('record-changing');
    $('#track-title').textContent=`${track.title} · ${track.artist}`;
    player.setAttribute('aria-label',`${track.title} album artwork. CD player.`);
    play.disabled=!track.audioSrc;volume.disabled=!track.audioSrc;
    audio.src=track.audioSrc;audio.currentTime=0;
    musicNote.textContent=`Selected ${track.title} by ${track.artist}.`;
    if(continuePlaying)startMusic();
  }
  listen($('#next-song'),'click',()=>selectRecord(selected+1,playing));
  listen($('#previous-song'),'click',()=>selectRecord(selected-1,playing));
  listen(play,'click',()=>{if(audio.paused)startMusic();else stopMusic();});
  listen(audio,'playing',()=>setPlaying(true));listen(audio,'pause',()=>setPlaying(false));listen(audio,'ended',()=>setPlaying(false));
  listen(audio,'error',()=>{setPlaying(false);musicNote.textContent='This recording couldn’t load. Try Next song.';});
  listen(volume,'input',()=>{audio.volume=Number(volume.value);volume.style.setProperty('--volume-fill',`${audio.volume*100}%`);});
  selectRecord(0);
  listen(document,'visibilitychange',()=>{if(document.hidden)stopMusic();});


  const cleanup = () => {flightObserver.disconnect(); flight?.pause(); cursorObserver.disconnect();cursorVideo?.pause();cancelCursorFrame();cursorVideo?.removeAttribute('src');cursorVideo?.load();timers.forEach(clearTimeout); timers.clear(); stopMusic(); audio.removeAttribute('src'); audio.load(); local.abort();};
  if (page) page.cleanups.push(cleanup); else window.addEventListener('pagehide', cleanup, {once:true});
})();
