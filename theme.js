/* A tab-wide light switch, shared by every page and reset by Replay the magic. */
(() => {
  if (window.PortfolioTheme) return;
  let night=false;
  try { night=sessionStorage.getItem('portfolio-night')==='1'; } catch {}
  const api=window.PortfolioTheme={
    get night(){return night;},
    set(value){
      night=Boolean(value);
      document.documentElement.dataset.theme=night?'night':'day';
      try {sessionStorage.setItem('portfolio-night',night?'1':'0');} catch {}
      document.dispatchEvent(new CustomEvent('portfolio:theme',{detail:{night}}));
    },
    toggle(){api.set(!night);}
  };
  document.documentElement.dataset.theme=night?'night':'day';
  document.addEventListener('click',event=>{
    if(event.target.closest('#replay'))api.set(false);
  },true);
})();
