/* Same-document navigation, with ordinary page URLs and a full-load fallback. */
(() => {
  if (window.PortfolioNavigation) return;
  const initial = new URL(location.href);
  const base = new URL('./', initial);
  const routes = new Set(['', 'index.html', 'about.html', 'gallery.html', 'resume.html', 'threadit.html', 'project-02.html', 'threadit-research.html']);
  const documents = new Map(), scripts = new Map(), images = new Set(), styleLoads = new Map();
  let activeURL = initial, sequence = 0, hoverTimer, scrollTimer;
  const api = window.PortfolioNavigation = {isNavigating:false, page:null};
  function makePage() {
    const controller = new AbortController();
    return {signal:controller.signal, alive:true, cleanups:[], leave() {
      this.alive = false; controller.abort();
      this.cleanups.forEach(cleanup => cleanup()); this.cleanups.length = 0;
    }};
  }
  api.page = makePage();
  const samePage = (a,b) => a.pathname === b.pathname && a.search === b.search;
  function supported(url) {
    return /^https?:$/.test(url.protocol) && url.origin === base.origin &&
      url.pathname.startsWith(base.pathname) && routes.has(url.pathname.slice(base.pathname.length));
  }
  function destination(link) {
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return null;
    const url = new URL(link.href, location.href);
    return supported(url) && !samePage(activeURL,url) ? url : null;
  }
  function scriptSource(url) {
    if (!scripts.has(url)) scripts.set(url, fetch(url,{cache:'no-cache'}).then(response => {
      if (!response.ok) throw new Error('Script unavailable'); return response.text();
    }).catch(error => {scripts.delete(url);throw error;}));
    return scripts.get(url);
  }
  function warmImage(url) {
    if (images.has(url)) return;
    images.add(url); const image = new Image(); image.decoding = 'async'; image.src = url;
  }
  function loadPage(url) {
    const key = url.origin+url.pathname+url.search;
    if (!documents.has(key)) {
      const request = fetch(key,{cache:'no-cache'}).then(async response => {
        if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('Page unavailable');
        const doc = new DOMParser().parseFromString(await response.text(),'text/html');
        if (!doc.querySelector('main')) throw new Error('Unknown page');
        const sources = [...doc.querySelectorAll('script[src]')]
          .map(script=>new URL(script.getAttribute('src'),url).href)
          .filter(src=>src !== new URL('navigation.js',base).href);
        if (sources.some(src=>new URL(src).origin !== base.origin)) throw new Error('External script');
        const code = Promise.all(sources.map(scriptSource));
        doc.querySelectorAll('img[src]:not([loading="lazy"])').forEach(image=>warmImage(new URL(image.getAttribute('src'),url).href));
        if (url.pathname.endsWith('/threadit.html')) {
          ['closet-wardrobe.png','closet-wishlist.png'].forEach(name=>warmImage(new URL('assets/threadit/'+name,base).href));
        }
        if (url.pathname.endsWith('/gallery.html')) warmImage(new URL('assets/gallery/drawn-desk.png',base).href);
        const styles = [...doc.querySelectorAll('link[rel="stylesheet"]')].map(link=>new URL(link.getAttribute('href'),url).href);
        const [sourceCode] = await Promise.all([code,Promise.all(styles.map(prepareStyle))]);
        return {doc,sources,code:sourceCode,styles};
      }).catch(error => {documents.delete(key);throw error;});
      documents.set(key,request);
    }
    return documents.get(key);
  }
  function prepareStyle(url) {
    if(styleLoads.has(url))return styleLoads.get(url);
    const existing = [...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.href===url);
    if (existing) return Promise.resolve();
    const loaded = new Promise((resolve,reject)=>{
      const link = document.createElement('link'); link.rel='stylesheet'; link.href=url; link.media='not all';
      link.onload=resolve; link.onerror=()=>{link.remove();styleLoads.delete(url);reject(new Error('Style unavailable'));};
      document.head.append(link);
    });
    styleLoads.set(url,loaded);return loaded;
  }
  function rememberScroll() {
    if (api.isNavigating) return;
    history.replaceState({...history.state,portfolio:true,scroll:[scrollX,scrollY]},'',location.href);
  }
  function place(url,scroll) {
    if (scroll) window.scrollTo({left:scroll[0],top:scroll[1],behavior:'instant'});
    else if (url.hash) {
      let id; try {id=decodeURIComponent(url.hash.slice(1));} catch {id=url.hash.slice(1);}
      const anchor=document.getElementById(id);
      if(anchor)anchor.scrollIntoView({behavior:'instant'}); else window.scrollTo({top:0,left:0,behavior:'instant'});
    } else window.scrollTo({top:0,left:0,behavior:'instant'});
  }
  async function navigate(url,{pop=false,scroll=null}={}) {
    if (samePage(activeURL,url)) {activeURL=url;return;}
    const ticket=++sequence, start=performance.now();
    if (!pop) rememberScroll();
    api.isNavigating=true;
    try {
      const page=await loadPage(url);
      if(ticket!==sequence)return;
      api.page.leave();
      document.querySelectorAll('video').forEach(video=>{
        video.pause(); video.removeAttribute('src');video.querySelectorAll('source').forEach(source=>source.remove());video.load();
      });
      if (!pop) history.pushState({portfolio:true,scroll:[0,0]},'',url.href);
      activeURL=url;
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link=>{link.media=page.styles.includes(link.href)?'all':'not all';});
      document.title=page.doc.title;
      const description=page.doc.querySelector('meta[name="description"]');
      let liveDescription=document.querySelector('meta[name="description"]');
      if(description){if(!liveDescription){liveDescription=document.createElement('meta');liveDescription.name='description';document.head.append(liveDescription);}liveDescription.content=description.content;}
      else liveDescription?.remove();
      document.documentElement.classList.remove('entry-active');
      [...document.body.attributes].forEach(attribute=>document.body.removeAttribute(attribute.name));
      [...page.doc.body.attributes].forEach(attribute=>document.body.setAttribute(attribute.name,attribute.value));
      // Scripts in this HTML are inert; run the site's trusted, same-origin files in their original order.
      document.body.innerHTML=page.doc.body.innerHTML;
      document.body.querySelectorAll('script').forEach(script=>script.remove());
      api.page=makePage();
      page.code.forEach((source,i)=>{
        const script=document.createElement('script');script.textContent=source+'\n//# sourceURL='+page.sources[i];
        document.body.append(script);script.remove();
      });
      place(url,scroll);
      const main=document.querySelector('main');main.tabIndex=-1;main.focus({preventScroll:true});
      api.isNavigating=false;
      document.documentElement.dataset.navigationMs=String(Math.round(performance.now()-start));
      document.documentElement.dataset.navigationCount=String(Number(document.documentElement.dataset.navigationCount||0)+1);
    } catch {
      if(ticket===sequence){api.isNavigating=false;location.assign(url.href);}
    }
  }
  function prepare(link) {
    const url=destination(link); if(url)loadPage(url).catch(()=>{});
  }
  document.addEventListener('pointerover',event=>{
    if(event.pointerType!=='mouse')return;
    const link=event.target.closest('a[href]');clearTimeout(hoverTimer);
    if(link)hoverTimer=setTimeout(()=>prepare(link),100);
  },{passive:true});
  document.addEventListener('pointerout',event=>{
    if(event.target.closest('a[href]') && !event.target.closest('a[href]').contains(event.relatedTarget))clearTimeout(hoverTimer);
  },{passive:true});
  document.addEventListener('focusin',event=>prepare(event.target.closest('a[href]')));
  document.addEventListener('touchstart',event=>prepare(event.target.closest('a[href]')),{passive:true});
  document.addEventListener('click',event=>{
    if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
    const url=destination(event.target.closest('a[href]'));if(!url)return;
    event.preventDefault();navigate(url);
  });
  window.addEventListener('popstate',event=>{
    const url=new URL(location.href);
    if(samePage(activeURL,url)){activeURL=url;return;}
    navigate(url,{pop:true,scroll:event.state?.scroll||null});
  });
  window.addEventListener('hashchange',()=>{activeURL=new URL(location.href);});
  window.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(rememberScroll,100);},{passive:true});
  rememberScroll();
})();
