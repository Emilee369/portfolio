/* Hold to lift the pencil; release onto the paper and move to draw. */
(() => {
  const pencil = document.querySelector('#pick-up-pencil');
  if (!pencil) return;
  const page = window.PortfolioNavigation?.page;
  const listen = (target,type,handler,options={}) => target?.addEventListener(type,handler,{...options,signal:page?.signal});
  const colors = [
    {name:'Rose',hex:'#c8859b'}, {name:'Lavender',hex:'#a194cc'},
    {name:'Sky',hex:'#88aec6'}, {name:'Mint',hex:'#89b49b'}, {name:'Peach',hex:'#d6a07d'}
  ];
  const ns = 'http://www.w3.org/2000/svg';
  const ink = document.createElementNS(ns,'svg');
  ink.classList.add('page-sketch'); ink.setAttribute('aria-hidden','true');
  const cursor = document.createElement('button');
  cursor.type = 'button'; cursor.className = 'drawing-pencil'; cursor.hidden = true;
  cursor.append(pencil.querySelector('svg').cloneNode(true));
  const tools = document.createElement('div');
  tools.className = 'drawing-tools'; tools.hidden = true;
  tools.setAttribute('role','group'); tools.setAttribute('aria-label','Drawing controls');
  tools.innerHTML = '<button type="button" data-pencil="clear">Clear drawing</button><button type="button" data-pencil="return">Put pencil back</button>';
  document.body.append(ink,cursor,tools);
  let colorIndex=0, placed=false, tip=null, drag=null, offset={x:0,y:0};
  let stroke=null, data='', points=0, frame=0, pending=null, lastPoint=null;
  const clickSuppression = new WeakMap();
  function updateControls() {
    tools.hidden = !placed && ink.childElementCount===0;
    tools.querySelector('[data-pencil="return"]').hidden = !placed;
    tools.querySelector('[data-pencil="clear"]').disabled = ink.childElementCount===0;
  }
  function breakStroke() {
    flush(); cancelAnimationFrame(frame); frame=0; pending=null; stroke=null; lastPoint=null;
  }
  function selectColor(index) {
    breakStroke(); colorIndex=index;
    const color=colors[index];
    for(const button of [pencil,cursor]) {
      button.querySelector('[data-pencil-body]').setAttribute('fill',color.hex);
      button.title = `${color.name} ink · Click to switch; hold to lift, release and move to draw; Esc to return`;
      button.setAttribute('aria-label',button.title);
    }
  }
  function size() {
    const width=document.documentElement.clientWidth||innerWidth;
    const height=Math.max(innerHeight,...[...document.querySelectorAll('body>main,body>header,body>footer')].map(el=>el.getBoundingClientRect().bottom+scrollY));
    ink.setAttribute('width',width); ink.setAttribute('height',height); ink.setAttribute('viewBox',`0 0 ${width} ${height}`);
  }
  function move(point) {
    tip=point; cursor.style.left=`${point.x}px`; cursor.style.top=`${point.y}px`;
  }
  function flush() {
    frame=0;
    if(!pending) return;
    const point=pending; pending=null;
    if(points>=12000) return;
    if(lastPoint && Math.hypot(point.x-lastPoint.x,point.y-lastPoint.y)<2) return;
    if(!stroke) {
      stroke=document.createElementNS(ns,'path'); stroke.style.stroke=colors[colorIndex].hex;
      const first=lastPoint||point; data=`M${first.x.toFixed(1)} ${first.y.toFixed(1)}`; ink.append(stroke);
    }
    data+=` L${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    stroke.setAttribute('d',data); lastPoint=point; points++; updateControls();
  }
  function releaseCapture() {
    if(!drag) return;
    try { drag.target.releasePointerCapture?.(drag.id); } catch (_) { /* Capture may already be released. */ }
  }
  function returnHome() {
    breakStroke(); releaseCapture(); drag=null; placed=false;
    cursor.hidden=true; cursor.style.pointerEvents=''; pencil.classList.remove('is-picked-up');
    cursor.classList.remove('is-lifted'); document.body.classList.remove('drawing-active'); updateControls();
  }
  function clear() { breakStroke(); ink.replaceChildren(); points=0; updateControls(); }
  function start(event,target) {
    if(event.button!==0 || event.isPrimary===false || drag) return;
    if(target===pencil && placed) return;
    event.preventDefault(); breakStroke();
    let startTip=tip;
    if(target===pencil) {
      const rect=pencil.querySelector('svg').getBoundingClientRect(), fallback=pencil.getBoundingClientRect();
      const scale=rect.width ? rect.width/86 : 1;
      startTip={x:(rect.width?rect.left:fallback.left)+7*scale+scrollX,y:(rect.height?rect.top:fallback.top+5)+17*scale+scrollY};
    }
    drag={target,id:event.pointerId,start:{x:event.clientX,y:event.clientY},startTip,wasPlaced:placed,
      offset:{x:event.clientX+scrollX-startTip.x,y:event.clientY+scrollY-startTip.y},moved:false};
    try { target.setPointerCapture?.(event.pointerId); } catch (_) { /* Synthetic events have no pointer capture. */ }
    cursor.classList.add('is-lifted'); document.body.classList.add('drawing-active'); size();
  }
  function finish(event,cancelled=false) {
    if(!drag || (event.pointerId!==undefined && event.pointerId!==drag.id)) return;
    const current=drag;
    if(current.moved && !cancelled) {
      const home=pencil.getBoundingClientRect();
      if(event.clientX>=home.left && event.clientX<=home.right && event.clientY>=home.top && event.clientY<=home.bottom) {
        clickSuppression.set(current.target,performance.now()+400); returnHome(); return;
      }
      move({x:event.clientX+scrollX-current.offset.x,y:event.clientY+scrollY-current.offset.y});
      if(points<12000) {
        const mark=document.createElementNS(ns,'circle'); mark.setAttribute('cx',tip.x); mark.setAttribute('cy',tip.y);
        mark.setAttribute('r','1.5'); mark.setAttribute('fill',colors[colorIndex].hex); ink.append(mark); points++;
      }
      placed=true; offset=current.offset; lastPoint=tip; clickSuppression.set(current.target,performance.now()+400);
    } else if(cancelled) {
      if(current.wasPlaced) move(current.startTip);
      else {cursor.hidden=true;pencil.classList.remove('is-picked-up');}
    }
    releaseCapture(); drag=null;
    cursor.classList.remove('is-lifted'); document.body.classList.remove('drawing-active'); updateControls();
  }
  // Pause over page controls so navigation and the drawing buttons stay usable.
  function overControl(event) {
    const elements=document.elementsFromPoint?.(event.clientX,event.clientY)||[event.target];
    return elements.some(el=>el!==cursor && !cursor.contains(el) && el.closest?.('a,button,input,textarea,select,dialog,[contenteditable="true"]'));
  }
  for(const button of [pencil,cursor]) {
    listen(button,'pointerdown',event=>start(event,button));
    listen(button,'click',event=>{
      if(event.detail!==0 && (clickSuppression.get(button)||0)>performance.now()) {event.preventDefault();return;}
      selectColor((colorIndex+1)%colors.length);
    });
  }
  listen(document,'pointerdown',event=>{
    if(placed && !drag && !overControl(event)) start(event,cursor);
  });
  listen(document,'pointermove',event=>{
    if(drag) {
      if(event.pointerId!==undefined && event.pointerId!==drag.id) return;
      if(!drag.moved && Math.hypot(event.clientX-drag.start.x,event.clientY-drag.start.y)<=4) return;
      drag.moved=true; cursor.hidden=false; pencil.classList.add('is-picked-up');
      move({x:event.clientX+scrollX-drag.offset.x,y:event.clientY+scrollY-drag.offset.y}); return;
    }
    if(!placed) return;
    if(overControl(event) || event.buttons>0) {
      breakStroke(); cursor.style.pointerEvents='none'; return;
    }
    cursor.style.pointerEvents='';
    move({x:event.clientX+scrollX-offset.x,y:event.clientY+scrollY-offset.y});
    pending=tip; if(!frame) frame=requestAnimationFrame(flush);
  });
  listen(document,'pointerup',event=>finish(event));
  listen(document,'pointercancel',event=>finish(event,true));
  listen(tools.querySelector('[data-pencil="clear"]'),'click',clear);
  listen(tools.querySelector('[data-pencil="return"]'),'click',()=>{returnHome();pencil.focus();});
  listen(document,'keydown',event=>{if(event.key==='Escape'&&(placed||drag)){returnHome();pencil.focus();}});
  listen(window,'resize',size);
  listen(window,'blur',()=>{if(placed||drag)returnHome();});
  listen(document,'visibilitychange',()=>{if(document.hidden&&(placed||drag))returnHome();});
  listen(document.querySelector('#replay'),'click',()=>{returnHome();clear();selectColor(0);});
  page?.cleanups.push(()=>{
    releaseCapture(); drag=null; cancelAnimationFrame(frame);
    document.body.classList.remove('drawing-active'); ink.remove(); cursor.remove(); tools.remove();
  });
  selectColor(0); updateControls();
})();
