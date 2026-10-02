/* Tiny hand-drawn interactions, mounted once per page without changing link behavior. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const header=document.querySelector('.site-header'),primaryNav=header?.querySelector('nav');
  if(header && primaryNav){
    const compact=matchMedia('(max-width: 900px)'),local=new AbortController();
    const signal=window.PortfolioNavigation?.page?.signal || local.signal;
    const listen=(node,type,fn)=>node.addEventListener(type,fn,{signal});
    const toggle=document.createElement('button');
    toggle.type='button';toggle.className='nav-menu-toggle';
    primaryNav.id='primary-navigation';toggle.setAttribute('aria-controls',primaryNav.id);
    toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path class="menu-upper" d="M4 6h16"/><path class="menu-middle" d="M4 12h16"/><path class="menu-lower" d="M4 18h16"/></svg>';
    header.insertBefore(toggle,primaryNav);header.classList.add('nav-compact-ready');
    let open=false;
    function setOpen(next){
      open=compact.matches && next;header.dataset.menuOpen=String(open);
      toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
      primaryNav.toggleAttribute('inert',compact.matches && !open);
    }
    listen(toggle,'click',()=>setOpen(!open));
    listen(primaryNav,'click',event=>{if(event.target.closest('a'))setOpen(false);});
    listen(document,'keydown',event=>{if(event.key==='Escape' && open){event.preventDefault();setOpen(false);toggle.focus();}});
    listen(document,'pointerdown',event=>{if(open && !header.contains(event.target))setOpen(false);});
    listen(header,'focusout',event=>{if(open && event.relatedTarget && !header.contains(event.relatedTarget))setOpen(false);});
    listen(compact,'change',()=>setOpen(false));setOpen(false);
    if(!window.PortfolioNavigation)window.addEventListener('pagehide',()=>local.abort(),{once:true});
  }
  const icons={
    Work:`<svg viewBox="0 0 32 32"><g class="nav-hammer"><g transform="translate(32 0) scale(-1 1)"><path d="M14 12H18L19 28H13Z"/><path d="M4 6H9V8H14C19 4 25 5 29 10L24 9L27 13C22 10 20 10 18 13H14V11H9V13H4Z"/></g></g></svg>`,
    About:`<svg viewBox="0 0 32 32"><g class="nav-eyes"><path d="M11 5C4 7 3 25 10 27C16 29 17 10 11 5Z"/><path d="M23 5C17 4 17 25 23 27C31 26 29 10 23 5Z"/><g class="nav-pupils"><ellipse cx="10" cy="19" rx="3" ry="4.5"/><ellipse cx="23" cy="18" rx="3" ry="4.5"/></g></g></svg>`,
    Gallery:`<svg viewBox="0 0 32 32"><g class="nav-flower">${Array.from({length:6},(_,i)=>`<path transform="rotate(${i*60} 16 16)" d="M16 13C9 7 11 2 16 3C21 2 23 7 16 13Z"/>`).join('')}<circle cx="16" cy="16" r="4"/></g></svg>`,
    Resume:`<svg viewBox="0 0 32 32"><g class="nav-sheet"><path class="sheet-center" d="M9 4H20L25 9V28H9Z"/><path class="sheet-fold-left" d="M9 4L17 16L9 28Z"/><path class="sheet-fold-right" d="M25 9L17 16L25 28Z"/><path class="sheet-lines" d="M19 4V10H25M13 14H21M13 18H21M13 22H18"/></g><g class="nav-plane"><path d="M3 14L29 4L22 28L15 20L9 24L10 17Z"/><path d="M10 17L29 4L15 20L9 24"/></g></svg>`
  };
  const arrow=`<svg viewBox="0 0 32 32"><path class="nav-arrow-line" d="M24 24C9 30 6 17 12 15C22 11 26 26 16 25C8 24 8 18 10 13"/><path class="nav-arrow-head" d="M6 17L10 13L14 17"/></svg>`;
  function decorate(link,label,icon){
    link.classList.add('nav-pill');link.setAttribute('aria-label',label);
    link.dataset.navKind=label.toLowerCase().replaceAll(' ','-');
    link.innerHTML=`<span class="nav-icon" aria-hidden="true">${icon}</span><span class="nav-label" aria-hidden="true">${Array.from(label).map((ch,i)=>`<span class="nav-letter" style="--letter-index:${i}">${ch===' '?'&nbsp;':ch}</span>`).join('')}</span>`;
  }
  document.querySelectorAll('.site-header nav a').forEach(link=>{
    const label=link.textContent.trim();if(!icons[label])return;decorate(link,label,icons[label]);
    if(label==='About'){
      const pupils=link.querySelector('.nav-pupils');
      link.addEventListener('pointermove',event=>{
        if(reduced.matches||event.pointerType==='touch')return;
        const box=link.querySelector('.nav-icon').getBoundingClientRect();
        const x=Math.max(-3,Math.min(3,(event.clientX-box.left-box.width/2)/12));
        const y=Math.max(-4,Math.min(4,(event.clientY-box.top-box.height/2)/8));
        pupils.style.transform=`translate(${x}px,${y}px)`;
      });
      link.addEventListener('pointerleave',()=>{pupils.style.transform='';});
    }
  });
  document.querySelectorAll('a[href="#top"]').forEach(link=>{
    if(/^Back to top/.test(link.textContent.trim()))decorate(link,'Back to top',arrow);
  });
  document.querySelectorAll('a[href="./#work"]').forEach(link=>{
    if(link.closest('.jcc-project-nav'))return;
    if(/\bBack\b/.test(link.textContent.trim()))decorate(link,'Back',arrow);
  });
})();
