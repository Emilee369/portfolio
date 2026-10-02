/* An original pixel studio companion. Everything is drawn in SVG, with no sprite downloads. */
(() => {
  const footer=document.querySelector('.site-footer');if(!footer)return;
  const lifecycle=window.PortfolioNavigation?.page;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const habitat=document.createElement('div');habitat.className='footer-habitat';
  const controller=new AbortController();
  const contacts=window.PORTFOLIO_CONFIG?.contacts||{};
  const contact=(label,key)=>{
    const value=contacts[key]||'';
    const valid=key==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value):/^https:\/\//.test(value);
    const link=document.createElement('a');link.textContent=label;
    if(valid)link.href=key==='email'?'mailto:'+value:value;
    else {link.setAttribute('aria-disabled','true');link.title='Contact link coming soon';}
    return link;
  };
  habitat.innerHTML=`<aside class="footer-contact" aria-label="Contact Emily"><span>CONTACT</span></aside>
  <div class="footer-studio" data-activity="coffee" data-mode="day">
    <svg class="studio-room" viewBox="0 0 640 240" fill="none" shape-rendering="crispEdges" aria-hidden="true">
      <defs><linearGradient id="studio-day-sky" x2="0" y2="1"><stop stop-color="#c4dee6"/><stop offset="1" stop-color="#eaf0db"/></linearGradient><linearGradient id="studio-night-sky" x2="0" y2="1"><stop stop-color="#262942"/><stop offset="1" stop-color="#49445d"/></linearGradient><clipPath id="studio-window-view"><rect x="441" y="20" width="106" height="82" rx="3"/></clipPath></defs>
      <g class="studio-window" shape-rendering="geometricPrecision">
        <g clip-path="url(#studio-window-view)">
          <g class="studio-window-day"><rect x="441" y="20" width="106" height="82" fill="url(#studio-day-sky)"/><circle cx="515" cy="43" r="12" fill="#efd18d"/><path d="M506 43H524M515 34V52" stroke="#f4daa1" stroke-width="1.5"/><g class="studio-cloud" fill="#fffdf4" opacity=".85"><path d="M451 65C451 58 458 56 462 60C467 51 479 57 478 63C485 62 488 72 481 74H453C448 72 448 68 451 65Z"/><path d="M511 85C511 81 516 78 520 80C523 73 533 77 533 82C540 81 541 89 535 90H516C512 90 510 88 511 85Z"/></g></g>
          <g class="studio-window-night"><rect x="441" y="20" width="106" height="82" fill="url(#studio-night-sky)"/><path d="M521 32A13 13 0 1 0 530 55A11 11 0 0 1 521 32Z" fill="#f2e4be"/><g class="studio-stars" fill="#f8eed4"><circle cx="458" cy="35" r="1.2"/><circle cx="483" cy="29" r="1"/><circle cx="493" cy="56" r="1.3"/><circle cx="467" cy="85" r="1.1"/><circle cx="530" cy="81" r="1"/><path d="M476 50V58M472 54H480M508 74V80M505 77H511" stroke="#f8eed4" stroke-width="1"/></g></g>
        </g>
        <rect x="439" y="18" width="110" height="86" rx="4" stroke="#ae9d8c" stroke-width="4"/><path d="M494 20V103M440 65H548" stroke="#ae9d8c" stroke-width="3"/><path d="M436 106H552" stroke="#ae9d8c" stroke-width="4" stroke-linecap="round"/>
      </g>
      <g transform="translate(0 50)">
      <rect x="285" y="141" width="120" height="4" fill="#e8cbd6"/><rect x="293" y="145" width="104" height="2" fill="#e8cbd6"/>
      <rect x="198" y="111" width="96" height="5" fill="#b19b87"/><rect x="204" y="116" width="4" height="30" fill="#b19b87"/><rect x="282" y="116" width="4" height="30" fill="#b19b87"/>
      <rect x="214" y="76" width="52" height="32" rx="1" fill="#343235"/>
      <g class="studio-figma"><rect x="217" y="79" width="46" height="25" fill="#e8e7e9"/><rect x="217" y="79" width="46" height="4" fill="#333238"/>
      <rect x="217" y="83" width="8" height="21" fill="#faf8f8"/><rect x="256" y="83" width="7" height="21" fill="#faf8f8"/>
      <path d="M219 86H223M219 89H222M219 92H223M258 86H261M258 89H261M258 92H260" stroke="#bbb4bd"/>
      <rect x="231" y="86" width="15" height="15" fill="#faf8f8"/><rect x="233" y="88" width="11" height="3" fill="#df9fba"/><rect x="233" y="93" width="5" height="6" fill="#b2c6bd"/><rect x="239" y="93" width="5" height="6" fill="#e5c49e"/>
      <rect x="230" y="85" width="17" height="17" stroke="#8877df" stroke-width=".5"/><path d="M250 97L250 101L251 100L253 101" fill="#e295b4"/>
      <path d="M219 80H220V81H219ZM220 81H221V82H220ZM218 81H219V82H218Z" fill="#ee9ebd"/></g>
      <rect x="217" y="108" width="49" height="3" fill="#343235"/><rect x="275" y="104" width="8" height="7" fill="#d1aebc"/>
      <rect x="306" y="118" width="26" height="20" fill="#fcfaf5"/><path d="M311 125H323M311 129H320M311 133H325" stroke="#cf9bb0" stroke-width="2"/>
      <g class="studio-bed"><rect x="448" y="133" width="108" height="10" fill="#baa58f"/><rect x="448" y="126" width="108" height="7" fill="#ebd8dc"/><rect x="530" y="121" width="26" height="5" fill="#fffaf1"/><rect x="452" y="143" width="4" height="4" fill="#baa58f"/><rect x="549" y="143" width="4" height="4" fill="#baa58f"/></g>
      <rect x="574" y="128" width="24" height="18" fill="#c39888"/><rect x="571" y="124" width="30" height="5" fill="#b58879"/><path d="M585 125V87M585 108H575V99H568V92H578V100H585M585 104H595V91H602V82H592V91H585" stroke="#779183" stroke-width="5"/>
      <rect x="72" y="136" width="14" height="10" fill="#c4b3a0"/><path d="M79 136V114H85V121H79M79 126H73V119" stroke="#8e9d82" stroke-width="3"/>
      <rect x="373" y="62" width="22" height="2" fill="#d4b8c0"/><rect x="375" y="64" width="18" height="16" fill="#f4e6e8"/><path d="M379 69H391M379 74H388" stroke="#d4b8c0" stroke-width="2"/>
    </g></svg>
    <button class="footer-girl" type="button" aria-label="Studio companion drinking coffee. Make her shy."></button>
    <svg class="studio-blanket" viewBox="0 0 640 240" aria-hidden="true" shape-rendering="crispEdges"><g transform="translate(0 50)"><path d="M451 124H517V136H451Z" fill="#d9adc2"/><path d="M455 128H513M455 132H513" stroke="#ead0da" stroke-width="2"/></g></svg>
    <span class="studio-weather sr-only"></span><span class="studio-status sr-only" role="status"></span>
  </div>
  <button class="studio-light" type="button" aria-label="Pull to turn off the light" aria-pressed="false" title="Pull the light switch">
    <svg viewBox="0 0 64 176" aria-hidden="true"><line class="light-cord" x1="32" y1="0" x2="32" y2="99"/><g class="light-handle"><rect x="27" y="98" width="10" height="22" rx="5"/><path d="M32 104V113"/></g></svg>
  </button>`;
  ['LinkedIn','Email','Instagram'].forEach(label=>habitat.querySelector('.footer-contact').append(contact(label,label.toLowerCase())));
  footer.prepend(habitat);
  const studio=habitat.querySelector('.footer-studio'),girl=habitat.querySelector('.footer-girl'),status=habitat.querySelector('.studio-status');
  const activities=[
    {id:'coffee',x:74,y:62,label:'drinking coffee'},
    {id:'work',x:156,y:62,label:'designing at her laptop'},
    {id:'draw',x:281,y:62,label:'drawing a new idea'},
    {id:'create',x:345,y:62,label:'making something new'},
    {id:'stretch',x:350,y:62,label:'stretching and working out'},
    {id:'plants',x:520,y:62,label:'watering her plants'},
    {id:'chill',x:351,y:62,label:'chilling with music'},
    {id:'dance',x:351,y:62,label:'dancing to her favorite song'}
  ];
  const rect=(x,y,w,h,color,cls='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"${cls?` class="${cls}"`:''}/>`;
  const dark='#30292f',pink='#e6a0bc',light='#f1bad0',skin='#f2c3ad',cream='#fff7ed',green='#315f51';
  function sprite(action) {
    let parts='';
    // Dark roots, a pink middle, and dark ends give her hair its own silhouette.
    parts+=rect(13,1,3,3,dark)+rect(8,4,16,3,dark)+rect(5,7,22,3,dark)+rect(3,10,26,13,dark)+rect(5,23,22,4,dark);
    parts+=rect(5,10,22,11,pink)+rect(4,13,24,8,pink)+rect(5,21,4,4,dark)+rect(23,21,4,4,dark);
    parts+=rect(8,12,16,11,skin)+rect(7,15,18,6,skin)+rect(10,23,12,2,skin);
    parts+=rect(6,9,7,6,pink)+rect(13,9,5,9,pink)+rect(18,9,8,5,pink)+rect(7,10,3,2,light)+rect(22,11,3,2,light);
    parts+='<g class="girl-face">';
    if(['sleep','shy','coffee','chill','plants'].includes(action)) {
      parts+=rect(10,18,3,1,dark)+rect(19,18,3,1,dark)+rect(11,19,2,1,dark)+rect(19,19,2,1,dark);
    } else if(action==='dance') {
      parts+=rect(10,18,3,1,dark)+rect(10,19,2,1,dark)+rect(19,17,3,3,cream)+rect(19,17,2,3,green);
    } else {
      parts+='<g class="girl-open-eyes">';
      parts+=rect(10,16,3,1,dark)+rect(19,16,3,1,dark)+rect(10,17,3,3,cream)+rect(19,17,3,3,cream)+rect(11,17,2,3,green)+rect(19,17,2,3,green);
      parts+='</g><path class="girl-blink" d="M10 18H13M19 18H22" stroke="'+dark+'"/>';
    }
    parts+=rect(8,21,3,1,'#e8a298')+rect(21,21,3,1,'#e8a298');
    if(action==='create')parts+=rect(15,21,2,2,'#b87c78');
    else if(['dance','coffee','plants','chill','stretch'].includes(action))parts+=`<path d="M14 21V22H18V21" stroke="#b87c78" stroke-width="1"/>`;
    else parts+=rect(15,22,2,1,'#b87c78');
    if(['work','draw'].includes(action))parts+=`<path d="M10 15H13M19 14L22 15" stroke="${dark}"/>`;
    parts+='</g>';
    parts+=rect(11,25,10,2,skin)+rect(9,27,14,8,'#c789a5')+rect(10,28,12,2,cream)+rect(10,32,12,2,cream);
    parts+=rect(9,35,14,3,dark)+rect(11,38,4,2,skin)+rect(17,38,4,2,skin)+rect(9,40,6,2,dark)+rect(17,40,6,2,dark);
    if(action==='dance')parts+=`<g class="girl-dance-arms">${rect(7,24,3,8,skin)+rect(4,22,4,3,skin)+rect(22,27,3,6,skin)+rect(24,30,4,3,skin)}</g>`;
    else if(action==='stretch')parts+=rect(7,25,3,3,skin)+rect(5,19,3,7,skin)+rect(22,25,3,3,skin)+rect(24,19,3,7,skin);
    else if(action==='shy') {
      parts+=rect(8,21,5,2,'#e998aa')+rect(19,21,5,2,'#e998aa')+rect(9,24,4,6,skin)+rect(19,24,4,6,skin)+rect(10,21,3,5,skin)+rect(19,21,3,5,skin);
      parts+=`<g class="girl-heart" fill="#d68caa"><path d="M28 5H30V3H32V5H34V7H32V9H30V7H28Z"/></g>`;
    } else {parts+=rect(7,28,3,6,skin);if(action!=='coffee')parts+=rect(22,28,3,6,skin);}
    parts+=rect(4,23,4,5,dark)+rect(24,23,4,5,dark)+rect(3,27,5,2,dark)+rect(24,27,5,2,dark);
    if(action==='coffee')parts+=`<g class="girl-sip">${rect(22,28,3,6,skin)}`+rect(24,28,6,6,'#f6e8dc')+rect(30,29,2,4,'#b99b8e')+rect(25,27,4,1,'#816559')+`<g class="girl-steam" stroke="#baaea3" stroke-width="1"><path d="M26 25V22M29 25V21"/></g></g>`;
    if(action==='work')parts+=rect(22,29,8,3,skin)+rect(28,30,3,2,skin);
    if(action==='draw')parts+=rect(22,30,8,6,cream)+`<g class="girl-pencil"><path d="M25 26L30 31" stroke="#b89b6e" stroke-width="2"/><path d="M29 30L31 32" stroke="${dark}"/></g>`;
    if(action==='create')parts+=rect(24,22,5,5,'#e8c780')+rect(25,27,3,2,dark)+rect(23,30,5,2,skin)+`<g class="girl-idea" stroke="#d8bd86"><path d="M26 18V20M31 23H33M21 23H19"/></g>`;
    if(action==='plants')parts+=rect(24,29,7,5,'#94aaa0')+rect(23,27,4,2,'#94aaa0')+`<path d="M30 30H33V28H35" stroke="#94aaa0" stroke-width="2"/><g class="girl-drops" fill="#9fbec1">${rect(35,32,1,2,'#9fbec1')+rect(36,36,1,2,'#9fbec1')}</g>`;
    if(action==='chill')parts+=`<path d="M3 15V10H6V7H26V10H29V15" stroke="#79958a" stroke-width="2"/>`+rect(2,15,3,5,'#79958a')+rect(27,15,3,5,'#79958a')+`<path class="girl-music" d="M33 10V17H30V19H34V9H38V14H35V16H39V7H33Z" fill="#b89daf"/>`;
    if(action==='dance')parts+=`<g class="girl-music" fill="#b89daf"><path d="M34 9V15H31V17H35V8H39V13H36V15H40V6H34Z"/><path d="M-2 7V12H-5V14H-1V6H3V7Z"/></g>`;
    if(action==='sleep')parts+=`<g transform="translate(-28 -4)"><g transform="rotate(-90 32 8)"><g class="girl-snooze" fill="#b69aae"><path d="M30 6H35V7L32 10H35V11H30V10L33 7H30Z"/></g></g></g>`;
    return `<svg viewBox="0 0 32 44" aria-hidden="true" shape-rendering="crispEdges">${parts}</svg>`;
  }
  let index=0,visible=false,shy=false,timer,shyTimer,walkTimer;
  const lightSwitch=habitat.querySelector('.studio-light'),cord=lightSwitch.querySelector('.light-cord'),handle=lightSwitch.querySelector('.light-handle');
  const night=()=>Boolean(window.PortfolioTheme?.night);
  function render() {
    const activity=night()?{id:'sleep',x:478,y:79,label:'sleeping in her bed'}:activities[index];
    studio.dataset.mode=night()?'night':'day';habitat.querySelector('.studio-weather').textContent=night()?'Moon and stars outside the studio window.':'Sunshine outside the studio window.';studio.dataset.activity=shy?'shy':activity.id;
    girl.style.left=(activity.x/640*100)+'%';girl.style.top=((activity.y+50)/240*100)+'%';
    girl.innerHTML=sprite(shy?'shy':activity.id);
    girl.setAttribute('aria-label',shy?'She is feeling shy.':`Studio companion ${activity.label}. Make her shy.`);
    lightSwitch.setAttribute('aria-pressed',String(night()));lightSwitch.setAttribute('aria-label',night()?'Pull to turn on the light':'Pull to turn off the light');
  }
  function schedule() {
    clearTimeout(timer);
    if(!visible||document.hidden||reduced.matches||shy||night())return;
    timer=setTimeout(()=>{
      index=(index+1)%activities.length;girl.classList.add('is-walking');render();
      clearTimeout(walkTimer);walkTimer=setTimeout(()=>girl.classList.remove('is-walking'),1200);schedule();
    },6500);
  }
  function syncLight() {
    clearTimeout(shyTimer);clearTimeout(walkTimer);shy=false;girl.classList.remove('is-walking');status.textContent='';render();schedule();
  }
  girl.addEventListener('click',()=>{
    clearTimeout(timer);clearTimeout(shyTimer);girl.classList.remove('is-walking');shy=true;render();status.textContent=night()?'She blushes in her sleep.':'She blushes and hides her face.';
    shyTimer=setTimeout(()=>{shy=false;status.textContent='';render();schedule();},2300);
  });
  let pullStart=null,pull=0,lastPull=-Infinity;
  function stretchCord(distance){pull=distance;cord.setAttribute('y2',String(99+pull));handle.setAttribute('transform',`translate(0 ${pull})`);}
  lightSwitch.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;pullStart=event.clientY;lightSwitch.setPointerCapture(event.pointerId);lightSwitch.classList.add('is-pulling');
  });
  lightSwitch.addEventListener('pointermove',event=>{if(pullStart!==null)stretchCord(Math.min(44,Math.max(0,event.clientY-pullStart)));});
  lightSwitch.addEventListener('pointerup',()=>{
    if(pullStart===null)return;
    const pulled=pull>=18;pullStart=null;lightSwitch.classList.remove('is-pulling');stretchCord(0);
    if(pulled){lastPull=performance.now();window.PortfolioTheme?.toggle();}
  });
  lightSwitch.addEventListener('pointercancel',()=>{pullStart=null;lightSwitch.classList.remove('is-pulling');stretchCord(0);});
  lightSwitch.addEventListener('click',event=>{if(event.detail>0&&performance.now()-lastPull<500)return;window.PortfolioTheme?.toggle();});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;habitat.classList.toggle('is-active',visible&&!document.hidden);schedule();},{threshold:.1});observer.observe(habitat);
  document.addEventListener('visibilitychange',()=>{habitat.classList.toggle('is-active',visible&&!document.hidden);schedule();},{signal:controller.signal});
  document.addEventListener('portfolio:theme',syncLight,{signal:controller.signal});
  reduced.addEventListener('change',schedule,{signal:controller.signal});
  lifecycle?.cleanups.push(()=>{controller.abort();observer.disconnect();clearTimeout(timer);clearTimeout(shyTimer);clearTimeout(walkTimer);});
  render();
})();
