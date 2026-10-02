/* Native-detail tiles keep the complete large boards sharp without decoding them all at once. */
(() => {
  const lifecycle = window.PortfolioNavigation?.page;
  const listen = (target,type,callback,options={}) => target.addEventListener(type,callback,{...options,signal:lifecycle?.signal});
  const watch = (Type,callback,options) => {
    const observer = new Type((...args) => {if (!lifecycle || lifecycle.alive) callback(...args);},options);
    lifecycle?.cleanups.push(()=>observer.disconnect()); return observer;
  };
  const boards = window.THREADIT_RESEARCH_BOARDS;
  const key = new URLSearchParams(location.search).get('board') === 'interviews' ? 'interviews' : 'ideation';
  const board = boards[key];
  const viewport = document.querySelector('#board-viewport');
  const world = document.querySelector('#board-world');
  const tiles = document.querySelector('#board-tiles');
  const output = document.querySelector('#zoom-level');
  const status = document.querySelector('#board-status');
  document.querySelector('#board-title').textContent = board.title;
  document.querySelector('#board-description').textContent = board.description;
  document.title = `${board.title} · Threadit`;
  document.querySelector('#board-download').href = `${board.path}/original.png`;
  document.querySelector('#board-download').download = `threadit-${key}-original.png`;
  document.querySelectorAll('[data-board]').forEach(link => {if (link.dataset.board === key) link.setAttribute('aria-current','page');});
  world.style.width = `${board.width}px`; world.style.height = `${board.height}px`;
  const overview = document.querySelector('#board-overview');
  overview.alt = board.description; overview.src = `${board.path}/overview.webp`;
  let scale = 1, fitScale = 1, x = 0, y = 0, scheduled = false, announcement;
  const rendered = new Map(), pointers = new Map();
  let levelId;
  function bounds() {
    const width = board.width*scale, height = board.height*scale;
    x = width <= viewport.clientWidth ? (viewport.clientWidth-width)/2 : Math.min(28,Math.max(viewport.clientWidth-width-28,x));
    y = height <= viewport.clientHeight ? (viewport.clientHeight-height)/2 : Math.min(28,Math.max(viewport.clientHeight-height-28,y));
  }
  function draw() {
    if (lifecycle && !lifecycle.alive) return;
    scheduled = false; bounds();
    world.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    output.textContent = `${Math.round(scale/fitScale*100)}%`;
    const density = scale*Math.min(devicePixelRatio||1,2);
    const level = board.levels.find(l => l.width/board.width >= density) || board.levels.at(-1);
    if (level.id !== levelId) {tiles.replaceChildren();rendered.clear();levelId=level.id;}
    const sx = level.width/board.width, sy = level.height/board.height, size = board.tileSize;
    const c0 = Math.max(0,Math.floor((-x/scale)*sx/size)-1);
    const r0 = Math.max(0,Math.floor((-y/scale)*sy/size)-1);
    const c1 = Math.min(Math.ceil(level.width/size)-1,Math.floor(((viewport.clientWidth-x)/scale)*sx/size)+1);
    const r1 = Math.min(Math.ceil(level.height/size)-1,Math.floor(((viewport.clientHeight-y)/scale)*sy/size)+1);
    const needed = new Set();
    for(let r=r0;r<=r1;r++) for(let c=c0;c<=c1;c++) {
      const id = `${c}-${r}`; needed.add(id); if(rendered.has(id)) continue;
      const image = new Image();image.alt='';image.draggable=false;image.decoding='async';
      image.style.left=`${c*size/sx}px`;image.style.top=`${r*size/sy}px`;
      image.style.width=`${Math.min(size,level.width-c*size)/sx}px`;image.style.height=`${Math.min(size,level.height-r*size)/sy}px`;
      image.src=`${board.path}/${level.id}/${id}.webp`;tiles.append(image);rendered.set(id,image);
    }
    rendered.forEach((image,id)=>{if(!needed.has(id)){image.remove();rendered.delete(id);}});
  }
  lifecycle?.cleanups.push(()=>clearTimeout(announcement));
  function schedule() {if(!scheduled){scheduled=true;requestAnimationFrame(draw);}}
  function announce() {clearTimeout(announcement);announcement=setTimeout(()=>{status.textContent=`${board.title}, ${output.textContent} of fit view.`;},250);}
  function fit() {
    fitScale = Math.min((viewport.clientWidth-32)/board.width,(viewport.clientHeight-32)/board.height);
    scale=fitScale;x=(viewport.clientWidth-board.width*scale)/2;y=(viewport.clientHeight-board.height*scale)/2;schedule();announce();
  }
  function zoom(factor,anchor={x:viewport.clientWidth/2,y:viewport.clientHeight/2}) {
    const next = Math.min(2,Math.max(fitScale*.5,scale*factor));
    x=anchor.x-(anchor.x-x)*next/scale;y=anchor.y-(anchor.y-y)*next/scale;scale=next;schedule();announce();
  }
  document.querySelector('#zoom-in').addEventListener('click',()=>zoom(1.6));
  document.querySelector('#zoom-out').addEventListener('click',()=>zoom(1/1.6));
  document.querySelector('#zoom-fit').addEventListener('click',fit);
  viewport.addEventListener('wheel',event=>{event.preventDefault();const rect=viewport.getBoundingClientRect();zoom(Math.exp(-Math.max(-250,Math.min(250,event.deltaY))*.002),{x:event.clientX-rect.left,y:event.clientY-rect.top});},{passive:false});
  const point = event => {const rect=viewport.getBoundingClientRect();return{x:event.clientX-rect.left,y:event.clientY-rect.top};};
  const pair = () => {const [a,b]=[...pointers.values()];return{center:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance:Math.hypot(a.x-b.x,a.y-b.y)};};
  viewport.addEventListener('pointerdown',event=>{if(event.button!==0)return;pointers.set(event.pointerId,point(event));viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-dragging');viewport.focus({preventScroll:true});});
  viewport.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId))return;
    const previous=pointers.get(event.pointerId),before=pointers.size===2?pair():null,current=point(event);pointers.set(event.pointerId,current);
    if(before){const after=pair();zoom(after.distance/Math.max(1,before.distance),before.center);x+=after.center.x-before.center.x;y+=after.center.y-before.center.y;}
    else{x+=current.x-previous.x;y+=current.y-previous.y;}
    schedule();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>viewport.addEventListener(type,event=>{pointers.delete(event.pointerId);if(!pointers.size)viewport.classList.remove('is-dragging');}));
  viewport.addEventListener('keydown',event=>{
    if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))event.preventDefault();
    const step=event.shiftKey?150:60;
    if(event.key==='+'||event.key==='=')zoom(1.6);else if(event.key==='-')zoom(1/1.6);else if(event.key==='0')fit();
    else{if(event.key==='ArrowLeft')x+=step;if(event.key==='ArrowRight')x-=step;if(event.key==='ArrowUp')y+=step;if(event.key==='ArrowDown')y-=step;schedule();}
  });
  watch(ResizeObserver, fit).observe(viewport);fit();
})();
