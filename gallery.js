/* Authored photo wall: visitors can enlarge and read, without changing its contents. */
(() => {
  const lifecycle = window.PortfolioNavigation?.page;
  const listen = (target,type,callback) => target.addEventListener(type,callback,{signal:lifecycle?.signal});
  const wall = document.querySelector('#photo-wall');
  if (!wall) return;
  const photos = [...(window.GALLERY_CONFIG || [])];
  // Shuffle entries once per visit; grouped moments keep their authored order.
  for (let i = photos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [photos[i],photos[j]] = [photos[j],photos[i]];
  }
  const dialog = document.querySelector('#photo-dialog');
  let lastTrigger = null, lastWidth = -1;
  function surface(photo, large = false) {
    const frame = document.createElement('span'); frame.className = 'polaroid-image';
    const image = document.createElement('img'); image.src = large ? photo.fullSrc || photo.src : photo.src;
    image.alt = large ? photo.alt || photo.caption : '';
    image.width = photo.width; image.height = photo.height;
    image.draggable = false; image.decoding = 'async'; image.loading = large ? 'eager' : 'lazy';
    frame.append(image); return frame;
  }
  function openPhoto(photo, trigger) {
    lastTrigger = trigger;
    document.querySelector('#photo-dialog-title').textContent = photo.caption;
    for (const [id, text] of [
      ['photo-community',[photo.community,photo.date].filter(Boolean).join(' · ')],
      ['photo-contribution',photo.role ? 'My contribution: '+photo.role : ''],
      ['photo-context',photo.story || '']
    ]) {
      const element = document.getElementById(id); element.textContent = text; element.hidden = !text;
    }
    document.querySelector('#photo-detail-image').replaceChildren(surface(photo,true));
    const related = document.querySelector('#photo-related');
    related.replaceChildren(); related.hidden = !photo.relatedPhotos?.length;
    (photo.relatedPhotos || []).forEach(extra => {
      const figure = document.createElement('figure');
      const caption = document.createElement('figcaption');
      caption.textContent = [extra.caption,extra.date].filter(Boolean).join(' · ');
      figure.append(surface(extra,true),caption); related.append(figure);
    });
    dialog.scrollTop = 0; dialog.showModal();
  }
  const cards = photos.map((photo,index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'polaroid'+(photo.portrait ? ' is-portrait' : '');
    button.dataset.photoId = photo.id; button.dataset.frame = String(index);
    button.setAttribute('aria-label',`View ${photo.caption}`);
    button.setAttribute('aria-haspopup','dialog'); button.style.setProperty('--photo-angle',(Math.random()*12-6).toFixed(1)+'deg');
    button.dataset.offsetX = Math.round(Math.random()*24-12);
    button.dataset.offsetY = Math.round(Math.random()*36);
    const caption = document.createElement('span'); caption.className = 'polaroid-caption'; caption.textContent = photo.shortCaption || photo.caption;
    button.append(surface(photo),caption); wall.append(button);
    listen(button,'click',()=>openPhoto(photo,button)); return button;
  });
  function layout() {
    if (lifecycle && !lifecycle.alive) return;
    const width = wall.clientWidth; if (width === lastWidth) return; lastWidth = width;
    const mobile = width < 720;
    const columns = width >= 1100 ? 5 : width >= 900 ? 4 : width >= 720 ? 3 : width >= 340 ? 2 : 1;
    const rows = Math.ceil(cards.length/columns), step = mobile ? 230 : 300;
    const deskSpace = Math.max(300,width*.30);
    wall.parentElement.style.setProperty('--room-height',Math.max(1000,rows*step+deskSpace+60)+'px');
    cards.forEach((card,i)=>{
      const row = Math.floor(i/columns), col = i%columns;
      const inRow = Math.min(columns,cards.length-row*columns);
      const center = width*((columns-inRow)/2+col+.5)/columns;
      card.style.left = Math.max(12,center-card.offsetWidth/2+Number(card.dataset.offsetX))+'px';
      card.style.top = (26+row*step+Number(card.dataset.offsetY))+'px';
    });
  }
  const observer = new ResizeObserver(layout); observer.observe(wall);
  lifecycle?.cleanups.push(()=>observer.disconnect());
  listen(document.querySelector('#close-photo'),'click',()=>dialog.close());
  listen(dialog,'close',()=>{if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});});
  listen(dialog,'click',event=>{
    if(event.target!==dialog)return;
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  });
  layout();
})();
