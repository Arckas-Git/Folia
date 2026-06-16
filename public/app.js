document.addEventListener('DOMContentLoaded',function(){

// Écran d'intro : rejoué à chaque ouverture de l'onglet, SAUF sur un simple
// rafraîchissement (F5). On utilise sessionStorage, qui survit à un refresh
// mais s'efface dès qu'on ferme l'onglet.
(function(){
  const intro=document.getElementById('intro-screen');
  if(!intro)return;

  let sameTab=false;
  try{sameTab=sessionStorage.getItem('folia_session')==='1';}catch(e){}

  if(sameTab){
    // Même onglet (refresh) → masquer immédiatement, pas d'animation
    intro.style.animation='none';
    intro.classList.add('done');
    return;
  }

  // Nouvelle ouverture d'onglet → jouer l'intro et marquer la session
  try{sessionStorage.setItem('folia_session','1');}catch(e){}
  const remove=()=>{intro.classList.add('done');};
  // L'animation introFade démarre à 2.4s et dure .6s → retrait à ~3s
  setTimeout(remove,3050);
  // Permettre de skipper en cliquant
  intro.addEventListener('click',()=>{intro.style.animation='introFade .3s ease forwards';setTimeout(remove,320);});
})();

const COLORS=['#4f8ef7','#34d399','#f97316','#a78bfa','#2dd4bf','#fbbf24','#f87171','#ec4899'];
// Bibliothèque de base : ETF PEA courants proposés par défaut. La bibliothèque
// complète (voir buildEtfLibrary) ajoute aussi les ETF que l'utilisateur a déjà
// utilisés ou supprimés, pour qu'il reste dans un environnement familier.
// Données de composition indicatives par famille d'indice (géographie et secteurs).
// Sources : MSCI, S&P, Stoxx — valeurs arrondies, à titre informatif.
const _COMP={
  'msci-world':{geo:{usa:71,europe:15,japon:6,emergents:0,autre:8},sectors:{tech:25,finance:15,sante:13,industrie:10,conso:11,energie:5,autre:21}},
  'sp500':     {geo:{usa:100,europe:0,japon:0,emergents:0,autre:0},sectors:{tech:31,finance:13,sante:12,industrie:9,conso:10,energie:4,autre:21}},
  'nasdaq100': {geo:{usa:97,europe:0,japon:0,emergents:0,autre:3}, sectors:{tech:50,finance:5,sante:7,industrie:5,conso:18,energie:1,autre:14}},
  'em':        {geo:{usa:0,europe:0,japon:0,emergents:96,autre:4}, sectors:{tech:24,finance:22,sante:5,industrie:7,conso:12,energie:5,autre:25}},
  'russell2000':{geo:{usa:100,europe:0,japon:0,emergents:0,autre:0},sectors:{tech:14,finance:18,sante:17,industrie:16,conso:9,energie:4,autre:22}},
  'europe':    {geo:{usa:0,europe:100,japon:0,emergents:0,autre:0},sectors:{tech:10,finance:18,sante:14,industrie:15,conso:13,energie:7,autre:23}},
  'eurostoxx': {geo:{usa:0,europe:100,japon:0,emergents:0,autre:0},sectors:{tech:10,finance:20,sante:12,industrie:13,conso:13,energie:9,autre:23}},
  'cac40':     {geo:{usa:0,europe:100,japon:0,emergents:0,autre:0},sectors:{tech:8,finance:16,sante:12,industrie:14,conso:20,energie:8,autre:22}},
  'india':     {geo:{usa:0,europe:0,japon:0,emergents:100,autre:0},sectors:{tech:18,finance:25,sante:8,industrie:8,conso:10,energie:12,autre:19}},
  'stoxx600':  {geo:{usa:0,europe:100,japon:0,emergents:0,autre:0},sectors:{tech:10,finance:18,sante:13,industrie:15,conso:12,energie:7,autre:25}},
};
const BASE_ETF_LIBRARY=[
  {name:'Amundi MSCI World',           ticker:'CW8.PA',  isin:'LU0996182563', comp:_COMP['msci-world']},
  {name:'Amundi MSCI World (PEA)',     ticker:'WPEA.PA', isin:'IE0002XZSHO1', comp:_COMP['msci-world']},
  {name:'Lyxor MSCI World',            ticker:'EWLD.PA', isin:'FR0011869353', comp:_COMP['msci-world']},
  {name:'Amundi S&P 500',              ticker:'500.PA',  isin:'LU1681048804', comp:_COMP['sp500']},
  {name:'Amundi PEA S&P 500',          ticker:'PE500.PA',isin:'FR0013412285', comp:_COMP['sp500']},
  {name:'BNP Paribas Easy S&P 500',    ticker:'ESE.PA',  isin:'FR0011550185', comp:_COMP['sp500']},
  {name:'Amundi NASDAQ-100',           ticker:'ANX.PA',  isin:'LU1681038243', comp:_COMP['nasdaq100']},
  {name:'Amundi PEA Nasdaq-100',       ticker:'PUST.PA', isin:'FR0011871110', comp:_COMP['nasdaq100']},
  {name:'Amundi MSCI Emerging Markets',ticker:'PAEEM.PA',isin:'LU1681045370', comp:_COMP['em']},
  {name:'iShares Russell 2000',        ticker:'RS2K.PA', isin:'IE00B3VVMM84', comp:_COMP['russell2000']},
  {name:'Amundi PEA MSCI Emerging Markets',ticker:'PAEEM.PA',isin:'LU1681045370',comp:_COMP['em']},
  {name:'Amundi MSCI Europe',          ticker:'CEU.PA',  isin:'LU1681042609', comp:_COMP['europe']},
  {name:'Lyxor PEA Eurozone (Euro Stoxx 50)',ticker:'MSE.PA',isin:'FR0011869320',comp:_COMP['eurostoxx']},
  {name:'Amundi CAC 40',               ticker:'C40.PA',  isin:'FR0007052782', comp:_COMP['cac40']},
  {name:'Amundi PEA Monde (MSCI World)',ticker:'CW8.PA', isin:'FR001400U5Q4', comp:_COMP['msci-world']},
  {name:'Amundi MSCI India',           ticker:'INR.PA',  isin:'LU1629377730', comp:_COMP['india']},
  {name:'BNP Paribas Easy Stoxx Europe 600',ticker:'ETZ.PA',isin:'FR0011550193',comp:_COMP['stoxx600']},
  {name:'Amundi Euro Stoxx 50',        ticker:'C50.PA',  isin:'FR0007054358', comp:_COMP['eurostoxx']},
];
const INDEX_KEYWORDS=['MSCI World','S&P 500','Russell 2000','Emerging Market','NASDAQ','CAC 40','DAX','Euro Stoxx'];
function load(){try{const d=localStorage.getItem('folia_v3');return d?JSON.parse(d):null;}catch(e){return null;}}

const DEFAULT_STATE={
  etfs:[],
  monthly:500,freq:'monthly',maxDefer:3,expectedReturn:8,expectedInflation:3,
  feePerOrder:1,        // frais par ordre ponctuel (€) — dépend du courtier
  reminderDay:1,        // jour du mois pour le rappel de versement
  driftAlert:8,         // seuil d'écart à la cible (%) qui passe le bandeau en alerte
  history:[],deferredCash:0,nextId:0,rebalMode:'asap',rebalMonths:12,
  twelveDataKey:'',uiMode:'simple',lastCalcDate:null,pendingOrders:null,
  subChoices:{}, // {etfId: subIndex} — quel émetteur acheter pour chaque ETF groupe
  _deferCounters:{}, // {etfId: nb de mois consécutifs où l'ETF a été reporté}
  _archivedEtfs:[], // ETF supprimés, conservés pour récupération via la bibliothèque
  _tourDone:false, // visite guidée déjà vue/passée ?
  _obDismissed:false, // bannière de bienvenue fermée manuellement ?
  _seenChangelog:null, // version du dernier "Quoi de neuf" déjà vu par l'utilisateur
  _section:null, // dernière section ouverte (dca / cashflow) ; null = jamais choisi
  cashflow:{income:[],invest:[],expense:[]}, // données de la section Cashflow
  _cfSeeded:false // modèle de départ déjà pré-rempli ?
};

const _loadedRaw=load();
const _isNewUser=(_loadedRaw===null); // aucune donnée existante = tout premier passage
let state=_loadedRaw||JSON.parse(JSON.stringify(DEFAULT_STATE));
let uiMode='simple';
function save(){try{state.uiMode=uiMode;localStorage.setItem('folia_v3',JSON.stringify(state));}catch(e){}}

// ══════════ NAVIGATION ENTRE SECTIONS (DCA / Cashflow / Hub) ══════════
// Folia devient un hub multi-sections. Chaque section est un grand bloc
// (#section-dca, #section-cashflow) ; le hub (#hub) est l'écran de choix.
// La dernière section utilisée est mémorisée pour rouvrir directement dessus.
function showSection(name,ev){
  // Empêche le clic (venant d'un bouton du menu) de remonter au .tool-switch
  // parent, ce qui rouvrait le menu et pouvait bloquer l'affichage.
  if(ev&&ev.stopPropagation)ev.stopPropagation();
  const hub=document.getElementById('hub');
  const dca=document.getElementById('section-dca');
  const cf=document.getElementById('section-cashflow');
  if(!hub||!dca||!cf)return;
  // Tout masquer
  hub.style.display='none';dca.style.display='none';cf.style.display='none';
  // Le footer (numéro de version) est masqué sur le hub pour éviter un débordement
  // sous l'écran d'accueil plein hauteur ; il reste visible dans les outils.
  const footer=document.querySelector('footer');if(footer)footer.style.display=(name==='hub')?'none':'';
  if(name==='hub'){ hub.style.display='flex'; }
  else if(name==='cashflow'){
    cf.style.display='block'; state._section='cashflow'; save();
    // Filet de sécurité : la navigation interne du DCA a pu retirer la classe
    // .active de cette page ; on la remet pour garantir l'affichage.
    const cfPage=document.getElementById('page-cashflow'); if(cfPage)cfPage.classList.add('active');
    if(typeof cfNav==='function')cfNav('main'); // toujours revenir sur la page principale
    try{ if(typeof cfSeedIfEmpty==='function')cfSeedIfEmpty(); if(typeof renderCashflow==='function')renderCashflow(); }catch(e){ console&&console.warn&&console.warn('Cashflow render:',e); }
    // Entrée animée en cascade des blocs (rejouée à chaque ouverture de la section)
    cf.classList.remove('cf-entering');void cf.offsetWidth;cf.classList.add('cf-entering');
    setTimeout(()=>cf.classList.remove('cf-entering'),700);
  }
  else { dca.style.display='block'; state._section='dca'; save(); }
  if(name==='dca'||name==='cashflow')setActiveToolBubble(name);
  closeSectionMenu();
}
window.showSection=showSection;

// Ouvre/ferme le menu déroulant de bascule (sur le logo).
function toggleSectionMenu(ev){
  if(ev){ev.stopPropagation();}
  const sw=ev?ev.currentTarget:null;
  const menu=sw?sw.querySelector('.section-menu'):null;
  if(!menu)return;
  const willOpen=!menu.classList.contains('open');
  // Fermer tous les autres d'abord
  document.querySelectorAll('.section-menu').forEach(m=>m.classList.remove('open'));
  document.querySelectorAll('.tool-switch').forEach(s=>s.classList.remove('open'));
  if(willOpen){menu.classList.add('open');sw.classList.add('open');}
}
window.toggleSectionMenu=toggleSectionMenu;
// Met en valeur la bulle de l'outil actif (DCA / Cashflow) dans toutes les barres.
function setActiveToolBubble(name){
  document.querySelectorAll('.tool-bubble').forEach(b=>b.classList.toggle('active',b.dataset.sec===name));
}
window.setActiveToolBubble=setActiveToolBubble;
function closeSectionMenu(){
  document.querySelectorAll('.section-menu').forEach(m=>m.classList.remove('open'));
  document.querySelectorAll('.tool-switch').forEach(s=>s.classList.remove('open'));
}
// Clic en dehors → ferme le menu
document.addEventListener('click',e=>{ if(!e.target.closest('.tool-switch'))closeSectionMenu(); });

// ══════════ MOTEUR CASHFLOW ══════════
// Données : state.cashflow = {
//   income : [{name,amount}]                      ← liste simple (1 niveau)
//   invest : [{name, items:[{name,amount}]}]      ← catégories → sous-lignes (2 niveaux)
//   expense: [{name, items:[{name,amount}]}]      ← idem
// }
// Folia calcule les totaux, le reste disponible et le taux d'épargne.
// Aucune incidence sur le DCA.

// Normalise la structure (et migre d'éventuelles anciennes données "à plat").
function cfData(){
  if(!state.cashflow||typeof state.cashflow!=='object')state.cashflow={income:[],invest:[],expense:[]};
  const c=state.cashflow;
  // Revenus : liste simple
  c.income=(Array.isArray(c.income)?c.income:[]).map(r=>(r&&typeof r==='object')?{name:r.name||'',amount:Math.max(0,+r.amount||0)}:{name:'',amount:0});
  // Investissements & Dépenses : 2 niveaux (catégorie → items)
  ['invest','expense'].forEach(key=>{
    let arr=Array.isArray(c[key])?c[key]:[];
    // Migration : si l'ancien format "à plat" est détecté (des objets avec amount
    // mais sans items), on les regroupe sous une catégorie unique.
    if(arr.length&&arr.every(r=>r&&r.items===undefined)){
      arr=[{name:key==='invest'?'Investissements':'Dépenses',items:arr.map(r=>({name:r.name||'',amount:Math.max(0,+r.amount||0)}))}];
    }
    // Normalisation des catégories
    arr=arr.map(cat=>(cat&&typeof cat==='object')
      ?{name:cat.name||'',items:(Array.isArray(cat.items)?cat.items:[]).map(it=>{
          const o={name:it.name||'',amount:Math.max(0,+it.amount||0)};
          if(key==='invest'&&it.dca)o.dca=true;   // lien avec l'épargne DCA (investissements)
          if(key==='expense'&&it.split){           // charge partagée en mode couple (dépenses)
            o.split=true;
            o.splitMode=(it.splitMode==='percent')?'percent':'prorata'; // méthode PAR LIGNE
            if(o.splitMode==='percent')o.splitPct=Math.min(100,Math.max(0,it.splitPct!=null?+it.splitPct:50));
          }
          return o;
        })}
      :{name:'',items:[]});
    c[key]=arr;
  });
  // Mode couple (répartition de certaines charges entre deux salaires)
  const cp=(c.couple&&typeof c.couple==='object')?c.couple:{};
  c.couple={
    enabled:!!cp.enabled,
    partnerName:cp.partnerName||'',
    partnerIncome:Math.max(0,+cp.partnerIncome||0)
  };
  // Matelas de sécurité (épargne de précaution) : montant détenu + objectif en mois de dépenses
  const sf=(c.safety&&typeof c.safety==='object')?c.safety:{};
  c.safety={
    amount:Math.max(0,+sf.amount||0),
    months:Math.min(12,Math.max(1,sf.months!=null?+sf.months:4))
  };
  return c;
}
// Part de l'utilisateur AU PRO-RATA des salaires (fraction 0..1).
function cfProRataShare(){
  const cp=cfData().couple;if(!cp.enabled)return 1;
  const me=cfSumIncome(),other=+cp.partnerIncome||0,tot=me+other;
  return tot>0?me/tot:1;
}
// Part de l'utilisateur sur une ligne donnée (selon sa méthode de partage).
function cfItemShare(it){
  if(!it||!it.split)return 1;
  if(it.splitMode==='percent')return Math.min(1,Math.max(0,(+it.splitPct||0)/100));
  return cfProRataShare();
}
// Montant réellement compté pour un item (part utilisateur si charge partagée).
function cfEffAmount(kind,it){
  if(kind==='expense'&&it&&it.split&&cfData().couple.enabled)return (+it.amount||0)*cfItemShare(it);
  return (+it.amount||0);
}

// Détecte si un nom correspond à un PEA (pour lier à l'épargne DCA).
function cfIsPea(name){return /\bpea\b/i.test(String(name||''));}
// Force le montant des lignes d'investissement liées au DCA = épargne mensuelle DCA.
// Renvoie true si au moins une ligne liée a été trouvée (pour décider d'un re-render).
function cfSyncDcaLinks(){
  const c=cfData();let found=false;const m=+state.monthly||0;
  c.invest.forEach(cat=>cat.items.forEach(it=>{ if(it.dca){it.amount=m;found=true;} }));
  return found;
}
// Appelé quand l'épargne mensuelle DCA change : met à jour le Cashflow s'il est concerné.
function cfOnDcaMonthlyChange(){
  if(cfSyncDcaLinks()){
    save();
    const cf=document.getElementById('section-cashflow');
    if(cf&&cf.style.display!=='none'&&typeof renderCashflow==='function')renderCashflow();
  }
}
window.cfOnDcaMonthlyChange=cfOnDcaMonthlyChange;

// Pré-remplit un modèle de départ la 1re fois que la section est vide.
// Un drapeau (_cfSeeded) évite de re-remplir si l'utilisateur a tout effacé volontairement.
function cfSeedIfEmpty(){
  cfData();
  if(state._cfSeeded)return;
  const c=state.cashflow;
  const empty=c.income.length===0&&c.invest.length===0&&c.expense.length===0;
  if(empty){
    c.income=[{name:'Salaire',amount:0}];
    c.invest=[
      {name:'PEA / Compte-titres',items:[{name:'',amount:0}]},
      {name:'Assurance vie',items:[{name:'',amount:0}]}
    ];
    c.expense=[
      {name:'Logement',items:[{name:'Loyer',amount:0},{name:'Charges',amount:0}]},
      {name:'Vie quotidienne',items:[{name:'Courses',amount:0},{name:'Restaurants',amount:0}]},
      {name:'Abonnements',items:[{name:'Internet / Téléphone',amount:0},{name:'Sport',amount:0}]}
    ];
  }
  state._cfSeeded=true;save();
}

const _esc=s=>String(s||'').replace(/"/g,'&quot;');

// ── Revenus (liste simple) ──
function cfAddIncome(){const c=cfData();pushUndo('ajout d\'un revenu');c.income.push({name:'',amount:0});save();renderCashflow();setTimeout(()=>{const l=document.getElementById('cf-list-income');if(l){const rows=l.querySelectorAll('.cf-row');const last=rows[rows.length-1];if(last)last.classList.add('cf-rowin');const n=l.querySelectorAll('.cf-name');if(n.length)n[n.length-1].focus();}},30);}
function cfDelIncome(i){const c=cfData();if(c.income[i]!==undefined){pushUndo('suppression d\'un revenu');c.income.splice(i,1);save();renderCashflow();}}
function cfSetIncome(i,field,val){const c=cfData();if(!c.income[i])return;if(field==='amount')c.income[i].amount=Math.max(0,+val||0);else c.income[i].name=val;save();cfUpdateTotals();}
window.cfAddIncome=cfAddIncome;window.cfDelIncome=cfDelIncome;window.cfSetIncome=cfSetIncome;

// ── Catégories (investissements & dépenses) ──
function cfAddCat(kind){const c=cfData();pushUndo('ajout d\'une catégorie');c[kind].push({name:'',items:[{name:'',amount:0}]});save();renderCashflow();}
function cfDelCat(kind,ci){const c=cfData();if(c[kind][ci]!==undefined){pushUndo('suppression d\'une catégorie');c[kind].splice(ci,1);save();renderCashflow();}}
function cfSetCat(kind,ci,val){const c=cfData();if(!c[kind][ci])return;c[kind][ci].name=val;save();cfUpdateTotals();}
function cfAddItem(kind,ci){const c=cfData();if(!c[kind][ci])return;pushUndo('ajout d\'une ligne');c[kind][ci].items.push({name:'',amount:0});save();renderCashflow();setTimeout(()=>{const list=document.getElementById(kind==='expense'?'cf-list-expenses':'cf-list-invest');if(list){const cats=list.querySelectorAll('.cf-cat');const cat=cats[ci];if(cat){const rows=cat.querySelectorAll('.cf-cat-items .cf-row');const last=rows[rows.length-1];if(last){last.classList.add('cf-rowin');const nm=last.querySelector('.cf-name');if(nm)nm.focus();}}}},30);}
function cfDelItem(kind,ci,ii){const c=cfData();if(c[kind][ci]&&c[kind][ci].items[ii]!==undefined){pushUndo('suppression d\'une ligne');c[kind][ci].items.splice(ii,1);save();renderCashflow();}}
function cfSetItem(kind,ci,ii,field,val,el){
  const c=cfData();if(!c[kind][ci]||!c[kind][ci].items[ii])return;
  const it=c[kind][ci].items[ii];
  if(field==='amount'){it.amount=Math.max(0,+val||0);save();cfUpdateTotals();return;}
  // field === 'name'
  it.name=val;
  if(kind==='invest'){
    // Détection « PEA » → lien avec l'épargne DCA (sans reconstruire la liste,
    // pour ne pas perdre le focus : on met à jour seulement la ligne concernée).
    if(cfIsPea(val)){ if(it.dca===undefined){it.dca=true;it.amount=+state.monthly||0;} }
    else { if(it.dca)delete it.dca; }
    const row=el&&el.closest?el.closest('.cf-row'):null;
    if(row)cfUpdateInvestRow(row,it);
  }
  save();cfUpdateTotals();
}
// Met à jour en place l'apparence d'une ligne d'investissement (bouton lien visible
// seulement si PEA, verrouillage du montant si lié) — sans recréer les champs.
function cfUpdateInvestRow(row,it){
  const isPea=!!(it.dca||cfIsPea(it.name));
  row.classList.toggle('pea',isPea);
  const link=row.querySelector('.cf-link');if(link)link.classList.toggle('on',!!it.dca);
  const amt=row.querySelector('.cf-amt');
  if(amt){
    if(it.dca){amt.value=(+state.monthly||0);amt.readOnly=true;amt.style.opacity='.75';amt.style.cursor='not-allowed';}
    else{amt.readOnly=false;amt.style.opacity='';amt.style.cursor='';}
  }
}
// Active/désactive manuellement le lien d'une ligne d'investissement avec le DCA.
function cfToggleDca(ci,ii){
  const c=cfData();const it=c.invest[ci]&&c.invest[ci].items[ii];if(!it)return;
  pushUndo('lien DCA');
  if(it.dca){delete it.dca;} else {it.dca=true;it.amount=+state.monthly||0;}
  save();renderCashflow();cfPop('cf-link-'+ci+'-'+ii);
}
window.cfToggleDca=cfToggleDca;

// Petit "pop" visuel sur un bouton après (dé)activation.
function cfPop(id){
  const el=document.getElementById(id);if(!el)return;
  el.classList.remove('cf-pop');void el.offsetWidth;el.classList.add('cf-pop');
  setTimeout(()=>el.classList.remove('cf-pop'),360);
}

// ── Mode couple ──
function cfSetCouple(field,val){
  const c=cfData();
  if(field==='enabled')c.couple.enabled=!!val;
  else if(field==='partnerName')c.couple.partnerName=val;
  else if(field==='partnerIncome')c.couple.partnerIncome=Math.max(0,+val||0);
  save();
}
// Active/coupe le mode couple (reconstruit pour afficher/masquer les boutons de partage).
function cfToggleCouple(on){pushUndo('mode couple');cfSetCouple('enabled',on);renderCashflow();}
// Texte d'info pro-rata (réutilisé pour la mise à jour en direct).
function cfProRataText(cp){
  const me=cfSumIncome(),other=+cp.partnerIncome||0,tot=me+other;
  if(tot<=0)return 'Renseigne les deux salaires pour calculer le pro-rata.';
  const myPct=Math.round(me/tot*100);
  const who=cp.partnerName?_esc(cp.partnerName):'ton/ta conjoint·e';
  return 'Au pro-rata, tu paies <strong style="color:var(--accent);">'+myPct+' %</strong> et '+who+' <strong>'+(100-myPct)+' %</strong> des charges partagées.';
}
// Saisie du salaire / nom / pourcentage du conjoint : recalcule SANS reconstruire le
// panneau (garde le focus), en mettant à jour l'info pro-rata et les notes de part en place.
function cfSetCoupleField(field,val){
  cfSetCouple(field,val);
  const cp=cfData().couple;
  const info=document.getElementById('cf-couple-proinfo');
  if(info){info.innerHTML=cfProRataText(cp);info.style.color=( (cfSumIncome()+(+cp.partnerIncome||0))>0 )?'':'var(--amber)';}
  cfUpdateShareNotes();   // rafraîchit "ta part : X sur Y" sur chaque ligne partagée
  cfUpdateTotals();
  renderSankey();
}
// Met à jour en place les notes de part (sans reconstruire les lignes → focus préservé).
function cfUpdateShareNotes(){
  const cp=cfData().couple;
  const who=cp.partnerName?_esc(cp.partnerName):'conjoint·e';
  const f=v=>Math.round(v).toLocaleString('fr-FR')+' €';
  // Texte du pro-rata dans le panneau couple (dépend AUSSI de ton propre revenu)
  const info=document.getElementById('cf-couple-proinfo');
  if(info){
    info.innerHTML=cfProRataText(cp);
    info.style.color=((cfSumIncome()+(+cp.partnerIncome||0))>0)?'':'var(--amber)';
  }
  // Résultats par ligne (lignes partagées d'une catégorie partiellement partagée)
  cfData().expense.forEach((cat,ci)=>{(cat.items||[]).forEach((it,ii)=>{
    const res=document.getElementById('cf-lineres-'+ci+'-'+ii);if(!res)return;
    const a=+it.amount||0,my=a*cfItemShare(it);
    res.textContent=f(my)+' · '+who+' '+f(a-my);
  });});
  // Notes au niveau catégorie (catégories entièrement partagées) — somme des parts effectives
  cfData().expense.forEach((cat,ci)=>{
    const el=document.getElementById('cf-cat-share-'+ci);if(!el)return;
    const items=cat.items||[];
    const full=items.reduce((s,it)=>s+(+it.amount||0),0);
    const my=items.reduce((s,it)=>s+(+it.amount||0)*cfItemShare(it),0);
    el.innerHTML='👫 ta part <strong style="color:var(--accent);">'+f(my)+'</strong> · '+who+' <strong>'+f(full-my)+'</strong> <span style="color:var(--text3);">(sur '+f(full)+')</span>';
  });
}
// Marque/démarque une dépense comme partagée.
// Définit la méthode de partage d'une ligne : 'prorata' ou 'percent'.
// Recliquer sur la méthode active la désactive (ligne non partagée).
function cfSetLineSplit(ci,ii,mode){
  const c=cfData();const it=c.expense[ci]&&c.expense[ci].items[ii];if(!it)return;
  pushUndo('partage d\'une charge');
  const current=it.split?(it.splitMode==='percent'?'percent':'prorata'):null;
  if(current===mode){ // même méthode → on retire le partage
    delete it.split;delete it.splitMode;delete it.splitPct;
  } else {
    it.split=true;it.splitMode=mode;
    if(mode==='percent'&&it.splitPct==null)it.splitPct=50; // défaut
    else if(mode==='prorata')delete it.splitPct;
  }
  save();renderCashflow();
  cfPop(mode==='percent'?('cf-pct-'+ci+'-'+ii):('cf-pro-'+ci+'-'+ii));
}
// Modifie le pourcentage défini d'une ligne (sans reconstruire → focus du champ préservé).
function cfSetLinePct(ci,ii,val){
  const c=cfData();const it=c.expense[ci]&&c.expense[ci].items[ii];if(!it)return;
  it.splitPct=Math.min(100,Math.max(0,+val||0));save();
  cfUpdateTotals();renderSankey(); // recalcule totaux + diagramme + notes (via cfUpdateTotals)
}
// Partage (ou non) TOUTE une catégorie de dépenses d'un coup, au pro-rata.
function cfToggleSplitCat(ci){
  const c=cfData();const cat=c.expense[ci];if(!cat||!cat.items.length)return;
  pushUndo('partage d\'une catégorie');
  const allSplit=cat.items.every(it=>it.split);
  cat.items.forEach(it=>{ if(allSplit){delete it.split;delete it.splitMode;delete it.splitPct;} else {it.split=true;it.splitMode='prorata';delete it.splitPct;} });
  save();renderCashflow();cfPop('cf-splitcat-'+ci);
}
window.cfToggleSplitCat=cfToggleSplitCat;
window.cfSetCouple=cfSetCouple;window.cfToggleCouple=cfToggleCouple;
window.cfSetCoupleField=cfSetCoupleField;window.cfSetLineSplit=cfSetLineSplit;window.cfSetLinePct=cfSetLinePct;
window.cfAddCat=cfAddCat;window.cfDelCat=cfDelCat;window.cfSetCat=cfSetCat;window.cfAddItem=cfAddItem;window.cfDelItem=cfDelItem;window.cfSetItem=cfSetItem;

// ── Totaux ──
function cfSumIncome(){return cfData().income.reduce((s,r)=>s+(+r.amount||0),0);}
function cfCatTotal(cat,kind){return (cat.items||[]).reduce((s,it)=>s+cfEffAmount(kind,it),0);}
function cfSumCats(key){return cfData()[key].reduce((s,cat)=>s+cfCatTotal(cat,key),0);}

function cfUpdateTotals(){
  const inc=cfSumIncome(),inv=cfSumCats('invest'),exp=cfSumCats('expense');
  const left=inc-inv-exp;
  const rate=inc>0?(inv/inc*100):0;            // taux d'épargne = investi / revenus
  const possible=inc>0?((inc-exp)/inc*100):0;  // taux d'épargne possible = (revenus - dépenses)/revenus
  const fmt=n=>Math.round(n).toLocaleString('fr-FR')+' €';
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('cf-total-income',fmt(inc));set('cf-total-invest',fmt(inv));set('cf-total-expenses',fmt(exp));
  set('cf-hb-income',fmt(inc));set('cf-hb-invest',fmt(inv));set('cf-hb-expenses',fmt(exp));
  set('cf-hb-left',fmt(left));set('cf-hb-rate',inc>0?rate.toFixed(1)+' %':'—');
  const leftEl=document.getElementById('cf-hb-left');if(leftEl)leftEl.style.color=left<0?'var(--red)':'var(--green)';
  // Totaux par catégorie (affichés dans chaque en-tête de catégorie)
  ['invest','expense'].forEach(key=>{
    cfData()[key].forEach((cat,ci)=>{const e=document.getElementById('cf-cat-total-'+key+'-'+ci);if(e)e.textContent=fmt(cfCatTotal(cat,key));});
  });
  if(typeof cfUpdateShareNotes==='function')cfUpdateShareNotes(); // rafraîchit les parts (ligne + catégorie) en direct
  const sum=document.getElementById('cf-summary');
  if(sum){
    if(inc<=0){sum.innerHTML='<span style="color:var(--text3);font-family:var(--mono);font-size:12px;">Ajoute au moins un revenu pour voir ton taux d\'épargne.</span>';}
    else{
      const warn=left<0?'<div style="color:var(--red);font-size:12px;font-family:var(--mono);margin-top:6px;">⚠ Tes sorties dépassent tes revenus : tu puises dans tes réserves.</div>':'';
      // Récapitulatif des charges partagées (mode couple) — somme des parts par ligne,
      // chaque ligne pouvant être au pro-rata OU à un pourcentage défini.
      let couple='';const cp=cfData().couple;
      if(cp.enabled){
        let full=0,myShare=0;
        cfData().expense.forEach(cat=>cat.items.forEach(it=>{if(it.split){const a=+it.amount||0;full+=a;myShare+=a*cfItemShare(it);}}));
        if(full>0){
          const partner=full-myShare;
          const who=cp.partnerName?_esc(cp.partnerName):'ton/ta conjoint·e';
          couple='<div style="margin-top:8px;font-size:12px;color:var(--text2);font-family:var(--mono);border-top:1px solid var(--border);padding-top:8px;">'
            +'👫 Charges communes ('+fmt(full)+') — ta part <strong style="color:var(--accent);">'+fmt(myShare)+'</strong> · part de '+who+' <strong>'+fmt(partner)+'</strong></div>';
        }
      }
      sum.innerHTML='Ton taux d\'épargne est de <strong style="color:var(--accent);">'+rate.toFixed(1)+' %</strong> '
        +'<span style="color:var(--text3);">(possible jusqu\'à '+possible.toFixed(1)+' %)</span>.<br>'
        +'Revenus <strong>'+fmt(inc)+'</strong> · investis <strong>'+fmt(inv)+'</strong> · dépenses <strong>'+fmt(exp)+'</strong> · '
        +'reste disponible <strong style="color:'+(left<0?'var(--red)':'var(--green)')+';">'+fmt(left)+'</strong>.'+warn+couple;
    }
  }
  // (Le tri et le diagramme se mettent à jour à la FIN de la frappe — voir cfOnCommit.)
}

// ── Rendu ──
// Petit suffixe "€" affiché à droite de chaque montant.
const CF_EUR='<span class="cf-eur">€</span>';

function cfRenderCouple(){
  const host=document.getElementById('cf-couple');if(!host)return;
  const cp=cfData().couple;
  const head='<div class="cf-couple-head">'
    +'<label class="cf-couple-toggle"><input type="checkbox" '+(cp.enabled?'checked':'')+' onchange="cfToggleCouple(this.checked)"/> <span>👫 Mode couple</span></label>'
    +'<span class="cf-couple-sub">Répartis certaines charges entre deux salaires</span>'
    +'</div>';
  if(!cp.enabled){host.innerHTML=head;return;}
  const proInfo='<div class="cf-couple-info" id="cf-couple-proinfo">'+cfProRataText(cp)+'</div>';
  const body='<div class="cf-couple-body">'
    +'<div class="cf-couple-fields">'
      +'<label class="cf-couple-field"><span>Prénom du conjoint·e</span><input type="text" placeholder="ex. Alex" value="'+_esc(cp.partnerName)+'" oninput="cfSetCoupleField(\'partnerName\',this.value)"/></label>'
      +'<label class="cf-couple-field"><span>Son salaire net mensuel</span><input type="number" min="0" step="50" placeholder="0" value="'+(cp.partnerIncome||'')+'" oninput="cfSetCoupleField(\'partnerIncome\',this.value)"/></label>'
    +'</div>'
    +proInfo
    +'<div class="cf-couple-hint">Sur chaque ligne de dépense, deux boutons : <strong>👫</strong> partage <strong>au pro-rata</strong> des salaires, <strong>%</strong> partage selon un <strong>pourcentage que tu fixes</strong> pour cette ligne. Tu peux mélanger les deux selon les charges.</div>'
    +'</div>';
  host.innerHTML=head+body;
}
function cfRenderIncome(){
  const list=document.getElementById('cf-list-income');if(!list)return;
  const arr=cfData().income;
  if(!arr.length){list.innerHTML='<div class="cf-empty">Aucun revenu pour l\'instant.</div>';return;}
  // Rendu dans l'ordre des données ; le tri visuel (décroissant) est géré par
  // cfReorder() via l'ordre flexbox, sans reconstruire le HTML (garde le focus).
  list.innerHTML=arr.map((r,i)=>'<div class="cf-row">'
    +'<input class="cf-name" type="text" placeholder="Nom" value="'+_esc(r.name)+'" oninput="cfSetIncome('+i+',\'name\',this.value)" onchange="cfOnCommit()"/>'
    +'<input class="cf-amt" type="number" min="0" step="10" placeholder="0" value="'+(r.amount||0)+'" oninput="cfSetIncome('+i+',\'amount\',this.value)" onchange="cfOnCommit()"/>'+CF_EUR
    +'<button class="cf-del" title="Supprimer" onclick="cfDelIncome('+i+')">&times;</button>'
    +'</div>').join('');
}
function cfRenderCats(key){
  const list=document.getElementById(key==='expense'?'cf-list-expenses':'cf-list-invest');if(!list)return;
  const cats=cfData()[key];
  if(!cats.length){list.innerHTML='<div class="cf-empty">Aucune catégorie pour l\'instant.</div>';return;}
  const coupleOn=cfData().couple.enabled;
  const prorata=cfProRataShare();
  const f=v=>Math.round(v).toLocaleString('fr-FR')+' €';
  list.innerHTML=cats.map((cat,ci)=>{
    const catItems=cat.items||[];
    const allSplit=(key==='expense'&&catItems.length>0&&catItems.every(it=>it.split));
    const items=catItems.map((it,ii)=>{
      const linked=(key==='invest'&&it.dca);
      const isPeaRow=(key==='invest'&&(it.dca||cfIsPea(it.name)));
      const splitOn=(key==='expense'&&it.split);
      const isPct=(splitOn&&it.splitMode==='percent');
      const isPro=(splitOn&&!isPct);
      const amtAttrs=linked
        ? 'value="'+(+state.monthly||0)+'" readonly title="Montant synchronisé avec ton épargne mensuelle DCA" style="opacity:.75;cursor:not-allowed;"'
        : 'value="'+(it.amount||0)+'" oninput="cfSetItem(\''+key+'\','+ci+','+ii+',\'amount\',this.value)" onchange="cfOnCommit()"';
      // Bouton lien PEA : investissements, visible seulement si « PEA » (classe .pea).
      const linkBtn=(key==='invest')
        ? '<button id="cf-link-'+ci+'-'+ii+'" class="cf-link'+(linked?' on':'')+'" title="Lier / délier ce montant à ton épargne mensuelle DCA" onclick="cfToggleDca('+ci+','+ii+')">&#128279;</button>'
        : '';
      // Deux boutons de partage (dépenses, mode couple) : pro-rata (👫) et pourcentage défini (%).
      const splitBtns=(key==='expense')
        ? '<button id="cf-pro-'+ci+'-'+ii+'" class="cf-split cf-pro'+(isPro?' on':'')+'" title="Partager au pro-rata des salaires" onclick="cfSetLineSplit('+ci+','+ii+',\'prorata\')">👫</button>'
          +'<button id="cf-pct-'+ci+'-'+ii+'" class="cf-split cf-pct'+(isPct?' on':'')+'" title="Partager selon un pourcentage défini" onclick="cfSetLineSplit('+ci+','+ii+',\'percent\')">%</button>'
        : '';
      // Note de part PAR LIGNE — seulement si partagée ET catégorie pas entièrement partagée.
      let shareNote='';
      if(splitOn&&coupleOn&&!allSplit){
        const my=(+it.amount||0)*cfItemShare(it),partner=(+it.amount||0)-my;
        const who=cfData().couple.partnerName?_esc(cfData().couple.partnerName):'conjoint·e';
        const res='<span id="cf-lineres-'+ci+'-'+ii+'">'+f(my)+' · '+who+' '+f(partner)+'</span>';
        shareNote=isPct
          ? '<div class="cf-share-note">ta part <input class="cf-pct-in" type="number" min="0" max="100" step="5" value="'+(it.splitPct!=null?it.splitPct:50)+'" oninput="cfSetLinePct('+ci+','+ii+',this.value)"/> % → '+res+'</div>'
          : '<div class="cf-share-note">pro-rata ('+Math.round(prorata*100)+' %) → ta part '+res+'</div>';
      }
      const rowCls='cf-row'+(isPeaRow?' pea':'')+(splitOn?' split':'')+(coupleOn?' couple':'');
      return '<div class="'+rowCls+'">'
        +'<input class="cf-name" type="text" placeholder="Nom" value="'+_esc(it.name)+'" oninput="cfSetItem(\''+key+'\','+ci+','+ii+',\'name\',this.value,this)" onchange="cfOnCommit()"/>'
        +linkBtn+splitBtns
        +'<input class="cf-amt" type="number" min="0" step="10" placeholder="0" '+amtAttrs+'/>'+CF_EUR
        +'<button class="cf-del" title="Supprimer" onclick="cfDelItem(\''+key+'\','+ci+','+ii+')">&times;</button>'
        +shareNote
        +'</div>';
    }).join('');
    // Bouton "partager toute la catégorie au pro-rata" : dépenses, en mode couple.
    const catSplitBtn=(key==='expense'&&coupleOn)
      ? '<button id="cf-splitcat-'+ci+'" class="cf-split cf-split-cat'+(allSplit?' on':'')+'" title="Partager toute la catégorie au pro-rata" onclick="cfToggleSplitCat('+ci+')">👫</button>'
      : '';
    // Récap au niveau CATÉGORIE quand elle est entièrement partagée (somme des parts effectives).
    let catShare='';
    if(allSplit&&coupleOn){
      const full=catItems.reduce((s,it)=>s+(+it.amount||0),0);
      if(full>0){
        const my=catItems.reduce((s,it)=>s+(+it.amount||0)*cfItemShare(it),0),partner=full-my;
        const who=cfData().couple.partnerName?_esc(cfData().couple.partnerName):'ton/ta conjoint·e';
        catShare='<div class="cf-cat-share" id="cf-cat-share-'+ci+'">👫 ta part <strong style="color:var(--accent);">'+f(my)+'</strong> · '+who+' <strong>'+f(partner)+'</strong> <span style="color:var(--text3);">(sur '+f(full)+')</span></div>';
      }
    }
    return '<div class="cf-cat">'
      +'<div class="cf-cat-head">'
      +'<input class="cf-cat-name" type="text" placeholder="Nom de la catégorie" value="'+_esc(cat.name)+'" oninput="cfSetCat(\''+key+'\','+ci+',this.value)" onchange="cfOnCommit()"/>'
      +'<span class="cf-cat-total" id="cf-cat-total-'+key+'-'+ci+'">0 €</span>'
      +catSplitBtn
      +'<button class="cf-del cf-del-cat" title="Supprimer la catégorie" onclick="cfDelCat(\''+key+'\','+ci+')">&times;</button>'
      +'</div>'
      +catShare
      +'<div class="cf-cat-items">'+items+'</div>'
      +'<button class="cf-add-item" onclick="cfAddItem(\''+key+'\','+ci+')">+ Ajouter une ligne</button>'
      +'</div>';
  }).join('');
}
// Réordonne VISUELLEMENT (ordre flexbox) par montant DÉCROISSANT, sans toucher
// au HTML — donc utilisable en direct pendant la saisie sans perdre le focus.
// Si animate=true, on anime le glissement des lignes vers leur nouvelle place (FLIP).
function cfReorderList(container,childSel,animate){
  if(!container)return;
  const els=[...container.querySelectorAll(':scope > '+childSel)];
  if(!els.length)return;
  const amt=el=>{let s=0;el.querySelectorAll('.cf-amt').forEach(i=>s+=(+i.value||0));return s;};
  // FLIP — First : mémoriser la position actuelle de chaque élément
  const first=animate?els.map(el=>el.getBoundingClientRect().top):null;
  // appliquer le nouvel ordre
  els.map(el=>({el,a:amt(el)})).sort((x,y)=>y.a-x.a).forEach((o,rank)=>{o.el.style.order=rank;});
  if(!animate)return;
  // Last + Invert + Play : on inverse le déplacement puis on le laisse revenir à 0
  els.forEach((el,i)=>{
    const dy=first[i]-el.getBoundingClientRect().top;
    if(Math.abs(dy)>1){
      el.style.transition='none';
      el.style.transform='translateY('+dy+'px)';
      requestAnimationFrame(()=>{
        el.style.transition='transform .34s cubic-bezier(.22,1,.36,1)';
        el.style.transform='';
        setTimeout(()=>{el.style.transition='';el.style.transform='';},360);
      });
    }
  });
}
function cfReorder(animate){
  cfReorderList(document.getElementById('cf-list-income'),'.cf-row',animate);
  ['invest','expense'].forEach(key=>{
    const list=document.getElementById(key==='expense'?'cf-list-expenses':'cf-list-invest');
    if(!list)return;
    cfReorderList(list,'.cf-cat',animate); // catégories entre elles (par total)
    list.querySelectorAll('.cf-cat-items').forEach(items=>cfReorderList(items,'.cf-row',animate)); // lignes dans chaque catégorie
  });
}
function renderCashflow(){
  cfData();
  cfSyncDcaLinks();   // aligne les lignes liées sur l'épargne DCA actuelle
  cfRenderCouple();
  cfRenderIncome();
  cfRenderCats('invest');
  cfRenderCats('expense');
  cfUpdateTotals();
  cfReorder();              // tri visuel (décroissant) à l'affichage
  if(typeof renderSankey==='function')renderSankey();
}
window.renderCashflow=renderCashflow;
// Déclenché à la FIN de la frappe (onchange = quand on quitte un champ) :
// c'est là qu'on réordonne et qu'on met à jour le diagramme, pour ne pas
// perturber la saisie en cours.
function cfOnCommit(){
  if(typeof cfReorder==='function')cfReorder(true); // anime le tri à la fin de la frappe
  if(typeof renderSankey==='function')renderSankey();
}
window.cfOnCommit=cfOnCommit;

// ══════════ DIAGRAMME DE FLUX (Sankey maison, SVG pur) ══════════
// 4 colonnes : Revenus → Budget → Catégories (+ Reste disponible) → Sous-postes.
// La largeur de chaque ruban est proportionnelle au montant. Aucune librairie.
function renderSankey(){
  const host=document.getElementById('cf-sankey');if(!host)return;
  const d=cfData();
  const incomes=d.income.filter(r=>(+r.amount||0)>0).map(r=>({name:r.name||'Revenu',value:+r.amount}));
  const T=incomes.reduce((s,r)=>s+r.value,0);
  if(T<=0){host.innerHTML='<div class="cf-empty" style="padding:34px 0;">Renseigne tes revenus (et des montants) pour afficher le diagramme de flux.</div>';if(typeof cfToggleSuggestBtn==='function')cfToggleSuggestBtn(false);return;}
  // Catégories (enveloppes d'invest + catégories de dépenses), seulement celles >0
  // Palette volontairement désaturée (tons doux) pour rester lisible sur fond sombre.
  const palette=['#5fa98c','#9b90c0','#cf9a5f','#5faaa0','#6f97c4','#c182a3','#cc8585','#ccae6f','#8a8fbf','#c8946f'];
  let ci=0;const cats=[];
  const pushCats=(list,fallback,kind)=>{(list||[]).forEach(c=>{
    const items=(c.items||[]).map(it=>({name:it.name||'—',value:cfEffAmount(kind,it)})).filter(it=>it.value>0);
    const tot=items.reduce((s,it)=>s+it.value,0);
    if(tot>0){const col=palette[ci%palette.length];ci++;cats.push({name:c.name||fallback,value:tot,color:col,items});}
  });};
  pushCats(d.invest,'Investissement','invest');
  pushCats(d.expense,'Dépense','expense');
  const allocated=cats.reduce((s,c)=>s+c.value,0);
  const reste=Math.max(0,T-allocated);
  // ── Géométrie ──
  const W=900,nodeW=13,G=10,PAD=12,MINH=4;
  const colX=[6,250,500,W-nodeW-6]; // x gauche de chaque colonne
  const n2=cats.length+(reste>0?1:0),n3=cats.reduce((s,c)=>s+c.items.length,0);
  // Échelle proportionnelle : la plus grande colonne (somme T) occupe ~VHEIGHT px.
  const VHEIGHT=280;
  let scale=T>0?VHEIGHT/T:0.1;
  const hOf=v=>Math.max(MINH,v*scale); // plancher pour que les petites lignes restent visibles
  // Hauteurs par colonne
  const incH=incomes.map(r=>hOf(r.value));
  const budH=[hOf(T)];
  const cat2vals=cats.map(c=>c.value).concat(reste>0?[reste]:[]);
  const catH=cat2vals.map(hOf);
  const itemVals=[];cats.forEach(c=>c.items.forEach(it=>itemVals.push(it.value)));
  const itemH=itemVals.map(hOf);
  const colTotal=arr=>arr.reduce((a,b)=>a+b,0)+Math.max(0,arr.length-1)*G;
  // La hauteur de contenu = la colonne la plus haute (planchers + espacements inclus).
  // On en DÉDUIT H (au lieu de la fixer d'avance), donc plus aucune coupe en bas.
  const contentH=Math.max(colTotal(incH),colTotal(budH),colTotal(catH),colTotal(itemH),120);
  const H=Math.round(contentH+2*PAD);
  // placement vertical d'une colonne, centrée dans la zone de contenu [PAD, PAD+contentH]
  function place(hs){
    const total=hs.reduce((a,b)=>a+b,0)+Math.max(0,hs.length-1)*G;
    let y=PAD+(contentH-total)/2;const out=[];for(let i=0;i<hs.length;i++){out.push({y,h:hs[i]});y+=hs[i]+G;}return out;
  }
  const incPos=place(incH);
  const budPos=place(budH)[0];
  const catPos=place(catH);
  const itemPos=itemH.length?place(itemH):[];
  // ── Helpers SVG ──
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const eur=v=>Math.round(v).toLocaleString('fr-FR')+' €';
  function band(x0,y0,x1,y1,th,color){
    const xm=(x0+x1)/2;
    return '<path d="M '+x0+' '+y0+' C '+xm+' '+y0+', '+xm+' '+y1+', '+x1+' '+y1
      +' L '+x1+' '+(y1+th)+' C '+xm+' '+(y1+th)+', '+xm+' '+(y0+th)+', '+x0+' '+(y0+th)+' Z" '
      +'fill="'+color+'" opacity="0.34"/>';
  }
  function rect(x,p,color){return '<rect x="'+x+'" y="'+p.y+'" width="'+nodeW+'" height="'+p.h+'" rx="3" fill="'+color+'"/>';}
  function pill(x,yc,text,anchor){
    const fs=9,w=text.length*5.1+9,h=14;
    const rx=anchor==='start'?x-4:x-w+4;
    const tx=anchor==='start'?x+2:x-2;
    return '<g><rect x="'+rx+'" y="'+(yc-h/2)+'" width="'+w+'" height="'+h+'" rx="3" fill="#000" opacity="0.5"/>'
      +'<text x="'+tx+'" y="'+(yc+3)+'" font-size="'+fs+'" fill="#e8eaf0" font-family="ui-monospace,monospace" text-anchor="'+anchor+'">'+esc(text)+'</text></g>';
  }
  // ── Construction ──
  let links='',nodes='',labels='';
  const incOut=incPos.map(p=>p.y);
  let budIn=budPos.y, budOut=budPos.y;
  const catIn=catPos.map(p=>p.y), catOut=catPos.map(p=>p.y);
  // 1) Revenus → Budget
  incomes.forEach((r,i)=>{const th=hOf(r.value);links+=band(colX[0]+nodeW,incOut[i],colX[1],budIn,th,'#6b91c4');budIn+=th;});
  // 2) Budget → Catégories (puis Reste)
  cats.forEach((c,j)=>{const th=hOf(c.value);links+=band(colX[1]+nodeW,budOut,colX[2],catIn[j],th,c.color);budOut+=th;});
  if(reste>0){const th=hOf(reste);const j=cats.length;links+=band(colX[1]+nodeW,budOut,colX[2],catIn[j],th,'#555a66');budOut+=th;}
  // 3) Catégories → Sous-postes
  let itemIdx=0;
  cats.forEach((c,j)=>{
    c.items.forEach(it=>{
      const th=hOf(it.value);const p=itemPos[itemIdx];
      links+=band(colX[2]+nodeW,catOut[j],colX[3],p.y,th,c.color);
      catOut[j]+=th;
      nodes+=rect(colX[3],p,c.color);
      labels+=pill(colX[3]-6,p.y+p.h/2,it.name+': '+eur(it.value),'end');
      itemIdx++;
    });
  });
  // ── Nœuds + labels des 3 premières colonnes ──
  incomes.forEach((r,i)=>{nodes+=rect(colX[0],incPos[i],'#6b91c4');labels+=pill(colX[0]+nodeW+6,incPos[i].y+incPos[i].h/2,r.name+': '+eur(r.value),'start');});
  nodes+=rect(colX[1],budPos,'#cf8f5c');labels+=pill(colX[1]+nodeW+6,budPos.y+budPos.h/2,'Budget: '+eur(T),'start');
  cats.forEach((c,j)=>{nodes+=rect(colX[2],catPos[j],c.color);labels+=pill(colX[2]+nodeW+6,catPos[j].y+catPos[j].h/2,c.name+': '+eur(c.value),'start');});
  if(reste>0){const j=cats.length;nodes+=rect(colX[2],catPos[j],'#555a66');labels+=pill(colX[2]+nodeW+6,catPos[j].y+catPos[j].h/2,'Reste disponible: '+eur(reste),'start');}
  host.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="display:block;height:auto;min-width:560px;" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">'+links+nodes+labels+'</svg>';
  if(typeof cfToggleSuggestBtn==='function')cfToggleSuggestBtn(true);
}
window.renderSankey=renderSankey;

// Centre la vue sur la zone « épargne + diagramme » (défilement doux) + mise en valeur.
function cfScrollToDiagram(){
  const target=document.getElementById('cf-discover-target')||document.getElementById('cf-sankey-card');
  if(!target)return;
  target.scrollIntoView({behavior:'smooth',block:'center'});
  target.classList.remove('cf-pulse');
  void target.offsetWidth;            // reflow → rejoue l'animation
  target.classList.add('cf-pulse');
  setTimeout(()=>target.classList.remove('cf-pulse'),1300);
}
window.cfScrollToDiagram=cfScrollToDiagram;

// ══════════ ONGLET « SUGGESTIONS » ══════════
// Affiche/masque l'onglet « Suggestions » (en haut) ET le bouton sous le diagramme :
// disponibles seulement quand le diagramme est généré (revenus > 0).
function cfToggleSuggestBtn(show){
  const w=document.getElementById('cf-suggest-btn-wrap');if(w)w.style.display=show?'block':'none';
  const tab=document.getElementById('cf-tab-suggest');if(tab)tab.style.display=show?'':'none';
  if(!show){const sug=document.getElementById('page-cf-suggest');if(sug&&sug.classList.contains('active'))cfNav('main');}
}
// Bascule entre les pages du cashflow (principale / suggestions / sécurité) + état des onglets.
function cfNav(view){
  const pages={main:'page-cashflow',suggest:'page-cf-suggest',safety:'page-cf-safety'};
  const tabs={main:'cf-tab-main',suggest:'cf-tab-suggest',safety:'cf-tab-safety'};
  if(!document.getElementById(pages.main))return;
  if(view==='suggest')cfRenderSuggestions();
  if(view==='safety')cfRenderSafety();
  Object.keys(pages).forEach(k=>{
    const p=document.getElementById(pages[k]);if(p)p.classList.toggle('active',k===view);
    const t=document.getElementById(tabs[k]);if(t)t.classList.toggle('active',k===view);
  });
}
window.cfNav=cfNav;
function cfShowSuggest(){cfNav('suggest');window.scrollTo({top:0,behavior:'smooth'});}
window.cfShowSuggest=cfShowSuggest;

// Détection grossière des postes « plaisir » (souvent plus faciles à ajuster).
const CF_WANTS=['resto','restaurant','sortie','loisir','abonnement','streaming','shopping','vêtement','vetement','café','cafe','bar','jeu','tabac','alcool','livraison','uber','deliveroo','plaisir','divertissement','netflix','spotify','ciné','cinema','voyage','vacances'];
function cfIsWant(name){const n=(name||'').toLowerCase();return CF_WANTS.some(w=>n.includes(w));}

function cfRenderSuggestions(){
  const host=document.getElementById('cf-suggest-body');if(!host)return;
  const fmt=v=>Math.round(v).toLocaleString('fr-FR')+' €';
  const income=cfSumIncome(),invest=cfSumCats('invest'),expenses=cfSumCats('expense');
  const left=income-invest-expenses;
  const rate=income>0?invest/income*100:0;
  const possible=income>0?(invest+Math.max(0,left))/income*100:0;
  const pc=v=>income>0?Math.round(v/income*100):0;

  // ── Bloc 1 : taux d'épargne + marge non investie ──
  const targets=[10,20,30,40,50];
  const next=targets.find(t=>t>rate+0.5);
  let nextLine='';
  if(next){const need=Math.max(0,income*next/100-invest);
    nextLine='<div class="cf-sg-line">Prochain palier : <strong>'+next+' %</strong> → investir <strong style="color:var(--accent);">'+fmt(need)+'</strong> de plus par mois.</div>';}
  let margin;
  if(left>0.5)margin='<div class="cf-sg-line">Il te reste <strong style="color:var(--green);">'+fmt(left)+'</strong> non affectés chaque mois. En les investissant, tu passerais à <strong>'+possible.toFixed(0)+' %</strong> d\'épargne <em>sans toucher à tes dépenses</em> — c\'est ton levier le plus simple.</div>';
  else if(left<-0.5)margin='<div class="cf-sg-line" style="color:var(--red);">Tes sorties dépassent tes revenus de <strong>'+fmt(-left)+'</strong>. La priorité est d\'équilibrer avant d\'investir davantage.</div>';
  else margin='<div class="cf-sg-line">Tes revenus sont presque entièrement affectés. Pour investir plus, l\'idée est d\'alléger un poste de dépenses ci-dessous.</div>';
  const block1='<div class="cf-sg-card">'
    +'<div class="cf-sg-h">📊 Ton taux d\'épargne</div>'
    +'<div class="cf-sg-line">Tu investis <strong style="color:var(--accent);">'+fmt(invest)+'</strong>/mois, soit <strong>'+rate.toFixed(0)+' %</strong> de tes revenus.</div>'
    +margin+nextLine+'</div>';

  // ── Bloc 2 : plus gros postes de dépenses (leviers) ──
  const cats=cfData().expense.map(cat=>({name:cat.name||'Dépenses',val:cfCatTotal(cat,'expense'),want:cfIsWant(cat.name)}))
    .filter(c=>c.val>0).sort((a,b)=>b.val-a.val);
  let block2='';
  if(cats.length){
    const max=cats[0].val;
    const rows=cats.slice(0,5).map(c=>{
      const w=Math.max(6,Math.round(c.val/max*100));
      const tag=c.want?'<span class="cf-sg-tag">souvent ajustable</span>':'';
      return '<div class="cf-lev"><div class="cf-lev-top"><span>'+_esc(c.name)+' '+tag+'</span><span class="cf-lev-val">'+fmt(c.val)+' · '+pc(c.val)+' %</span></div>'
        +'<div class="cf-lev-track"><div class="cf-lev-bar'+(c.want?' want':'')+'" style="width:'+w+'%;"></div></div></div>';
    }).join('');
    const big=cats[0];
    const hint=big.want
      ? 'Ton plus gros poste, <strong>'+_esc(big.name)+'</strong>, fait partie des dépenses « plaisir » : c\'est souvent là qu\'un petit ajustement se fait sans trop se priver.'
      : '<strong>'+_esc(big.name)+'</strong> est ton plus gros poste. S\'il s\'agit d\'un essentiel (logement…), il est difficile à réduire vite ; regarde plutôt les postes marqués « souvent ajustable ».';
    block2='<div class="cf-sg-card"><div class="cf-sg-h">🎯 Où tu as le plus de levier</div>'
      +'<div class="cf-sg-line" style="margin-bottom:.6rem;">Tes dépenses classées par poids. Réduire les plus gros a le plus d\'effet.</div>'
      +rows+'<div class="cf-sg-line" style="margin-top:.5rem;">'+hint+'</div></div>';
  }

  // ── Cadre / avertissement bienveillant ──
  const note='<div class="cf-sg-foot">Ces pistes sont générales et informatives — ce ne sont pas des conseils financiers personnalisés. Garde une épargne de précaution, et dépenser pour ce qui compte vraiment pour toi reste légitime. L\'objectif est juste de voir où se trouvent tes marges de manœuvre.</div>';

  host.innerHTML='<div class="cf-sg-intro"><div class="cf-sg-title">💡 Investir davantage, en douceur</div>'
    +'<div class="cf-sg-sub">Quelques pistes pour rééquilibrer tes dépenses et orienter un peu plus vers l\'investissement, à ton rythme.</div></div>'
    +block1+block2+note;
}
window.cfRenderSuggestions=cfRenderSuggestions;

// ══════════ ONGLET « SÉCURITÉ » (matelas de précaution) ══════════
function cfSetSafety(field,val){
  const c=cfData();
  if(field==='amount')c.safety.amount=Math.max(0,+val||0);
  else if(field==='months')c.safety.months=Math.min(12,Math.max(1,+val||1));
  save();cfSafetyRefresh();
}
window.cfSetSafety=cfSetSafety;

function cfRenderSafety(){
  const host=document.getElementById('cf-safety-body');if(!host)return;
  const sf=cfData().safety;
  const coupleNote=cfData().couple.enabled
    ? '<div class="cf-sg-line" style="color:var(--text3);">En mode couple, le calcul se base sur <strong>ta part</strong> des dépenses.</div>' : '';
  host.innerHTML='<div class="cf-sg-intro"><div class="cf-sg-title">🛡️ Mon matelas de sécurité</div>'
    +'<div class="cf-sg-sub">Une épargne de précaution, disponible vite, pour absorber les imprévus (panne, coup dur, perte de revenu) sans toucher à tes investissements.</div></div>'
    +'<div class="cf-sg-card">'
      +'<div class="cf-sf-row">'
        +'<label class="cf-sf-field"><span>Ce que tu as aujourd\'hui</span>'
          +'<span class="cf-sf-amt"><input type="number" min="0" step="100" id="cf-sf-amount" value="'+(sf.amount||'')+'" placeholder="0" oninput="cfSetSafety(\'amount\',this.value)"/> €</span>'
        +'</label>'
      +'</div>'
      +'<div class="cf-sf-slider">'
        +'<div class="cf-sf-slider-top"><span>Objectif de couverture</span><strong id="cf-safety-monthslabel">'+sf.months+' mois</strong></div>'
        +'<input type="range" id="cf-sf-months" min="1" max="12" step="1" value="'+sf.months+'" oninput="cfSetSafety(\'months\',this.value)"/>'
        +'<div class="cf-sf-scale"><span style="left:0%">1</span><span style="left:18.18%">3</span><span style="left:45.45%">6</span><span style="left:72.73%">9</span><span style="left:100%">12</span></div>'
      +'</div>'
      +'<div class="cf-sf-target" id="cf-safety-target"></div>'
      +'<div class="cf-sf-bar-track"><div class="cf-sf-bar" id="cf-safety-bar"></div></div>'
      +'<div class="cf-sf-statusrow"><span class="cf-sf-status" id="cf-safety-status"></span><span class="cf-sf-cov" id="cf-safety-coverage"></span></div>'
      +'<div class="cf-sg-line" id="cf-safety-gap" style="margin-top:.7rem;"></div>'
      +coupleNote
    +'</div>'
    +'<div class="cf-sg-card"><div class="cf-sg-h">💡 Quelques repères</div>'
      +'<div class="cf-sg-line">• Garde-le sur un support <strong>liquide et sûr</strong> (Livret A, LDDS…), <strong>séparé de tes investissements</strong> : c\'est de l\'argent qui doit être disponible tout de suite, pas exposé aux marchés.</div>'
      +'<div class="cf-sg-line">• La fourchette courante est <strong>3 à 6 mois</strong> de dépenses. Plutôt vers 6+ si tes revenus sont irréguliers (indépendant, mono-revenu) ; 3 peut suffire si tes revenus sont très stables.</div>'
      +'<div class="cf-sg-line">• L\'idéal se base sur tes <strong>dépenses essentielles</strong> (loyer, courses, factures), souvent un cran sous ton total — ici on prend le total, vois-le comme une marge confortable.</div>'
      +'<div class="cf-sg-line">• L\'ordre des priorités : <strong>d\'abord constituer ce matelas</strong>, ensuite investir le surplus à long terme.</div>'
      +'<div class="cf-sf-foot">Repères généraux et informatifs — ce ne sont pas des conseils financiers personnalisés.</div>'
    +'</div>';
  cfSafetyRefresh();
}
window.cfRenderSafety=cfRenderSafety;

function cfSafetyRefresh(){
  const fmt=v=>Math.round(v).toLocaleString('fr-FR')+' €';
  const sf=cfData().safety;
  const exp=cfSumCats('expense');
  const months=sf.months,cur=sf.amount,target=exp*months;
  const ml=document.getElementById('cf-safety-monthslabel');if(ml)ml.textContent=months+' mois';
  const tt=document.getElementById('cf-safety-target');
  if(tt)tt.innerHTML=exp>0
    ? 'Objectif : <strong>'+months+' mois</strong> × '+fmt(exp)+'/mois = <strong style="color:var(--accent);">'+fmt(target)+'</strong>'
    : 'Renseigne tes dépenses dans l\'onglet <strong>Cashflow</strong> pour calculer ton objectif.';
  const ratio=target>0?cur/target:0;
  const bar=document.getElementById('cf-safety-bar');
  if(bar){bar.style.width=Math.min(100,ratio*100)+'%';
    bar.style.background=ratio>=1?'var(--green)':ratio>=0.5?'var(--amber)':'var(--red)';}
  const cov=exp>0?cur/exp:0;
  const covEl=document.getElementById('cf-safety-coverage');
  if(covEl)covEl.textContent=exp>0?('≈ '+cov.toFixed(1).replace('.0','')+' mois couverts'):'';
  const st=document.getElementById('cf-safety-status');
  if(st){
    let txt='',cls='';
    if(exp<=0){txt='—';cls='';}
    else if(ratio>=1.5){txt='Bien au-delà';cls='over';}
    else if(ratio>=1){txt='Complet ✓';cls='ok';}
    else if(ratio>=0.5){txt='En bonne voie';cls='mid';}
    else if(ratio>0){txt='À constituer';cls='low';}
    else{txt='À démarrer';cls='low';}
    st.textContent=txt;st.className='cf-sf-status '+cls;
  }
  const gapEl=document.getElementById('cf-safety-gap');
  if(gapEl){
    if(exp<=0){gapEl.innerHTML='';}
    else{
      const gap=target-cur;
      const income=cfSumIncome();
      const invest=cfSumCats('invest');
      const left=income-invest-exp;   // reste mensuel en continuant d'investir
      const priority=income-exp;      // reste mensuel si on met l'investissement en pause (matelas d'abord)
      if(gap<=0){
        gapEl.innerHTML='🎉 Objectif atteint — tu as de quoi tenir <strong>'+cov.toFixed(1).replace('.0','')+' mois</strong>.'
          +(ratio>1.5?' Tu es nettement au-dessus : le surplus pourrait être <strong>investi</strong> (voir l\'onglet Suggestions).':'');
      } else if(priority>0.5){
        let html='Il te manque <strong style="color:var(--amber);">'+fmt(gap)+'</strong>.';
        if(invest>0.5){
          // Deux scénarios : matelas prioritaire (investissement en pause) vs rythme actuel.
          html+='<br>• <strong>~'+Math.ceil(gap/priority)+' mois</strong> en priorisant ton matelas — à '+fmt(priority)+'/mois, investissement mis en pause.';
          html+= left>0.5
            ? '<br>• <strong>~'+Math.ceil(gap/left)+' mois</strong> à ton rythme actuel — à '+fmt(left)+'/mois, en continuant d\'investir '+fmt(invest)+'.'
            : '<br>• À ton rythme actuel, ton budget ne dégage presque rien pour le matelas (tu investis '+fmt(invest)+'/mois).';
        } else {
          // Rien à mettre en pause : un seul chiffre.
          html+=' Soit <strong>~'+Math.ceil(gap/priority)+' mois</strong> à '+fmt(priority)+'/mois (ton reste disponible).';
        }
        gapEl.innerHTML=html;
      } else {
        gapEl.innerHTML='Il te manque <strong style="color:var(--amber);">'+fmt(gap)+'</strong>. Même sans investir, ton budget ne dégage pas de surplus mensuel — l\'onglet <strong>Suggestions</strong> peut aider à en libérer.';
      }
    }
  }
}
window.cfSafetyRefresh=cfSafetyRefresh;

// ── Réglages Cashflow ──
function openCfSettings(){const o=document.getElementById('cf-settings-overlay');if(o)o.style.display='flex';}
function closeCfSettings(){const o=document.getElementById('cf-settings-overlay');if(o)o.style.display='none';}
window.openCfSettings=openCfSettings;window.closeCfSettings=closeCfSettings;
// Charge le modèle d'exemple (remplit la section). Demande confirmation si des
// données existent déjà, pour ne pas écraser par accident.
async function cfReseedTemplate(){
  const c=cfData();
  const hasData=(c.income.length||c.invest.length||c.expense.length);
  if(hasData){
    if(!await confirmModal('Remplacer ta saisie actuelle par le modèle d\'exemple (Logement, Vie quotidienne…) ?',{okText:'Charger le modèle'}))return;
  }
  pushUndo('chargement du modèle d\'exemple');
  state.cashflow={income:[],invest:[],expense:[]};
  state._cfSeeded=false;        // autorise le pré-remplissage…
  cfSeedIfEmpty();              // …qui repose le modèle d'exemple
  renderCashflow();
  closeCfSettings();
  toast('Modèle d\'exemple chargé');
}
window.cfReseedTemplate=cfReseedTemplate;
// Efface toutes les données cashflow (après confirmation), sans toucher au DCA.
async function cfResetData(){
  if(!await confirmModal('Effacer toutes tes données Cashflow (revenus, investissements, dépenses) ? Ton outil DCA n\'est pas concerné.',{okText:'Effacer',danger:true}))return;
  pushUndo('effacement du Cashflow');
  state.cashflow={income:[],invest:[],expense:[]};
  state._cfSeeded=true; // on ne re-remplit pas le modèle après un effacement volontaire
  save();renderCashflow();closeCfSettings();toast('Données Cashflow effacées');
}
window.cfResetData=cfResetData;



// Réparation : neutraliser les références de début de mois (_monthPrice) corrompues
// par d'anciennes manipulations (prix de test, 0, mauvaise devise) qui faussaient
// la variation mensuelle affichée. Si la référence est absurde vs le prix actuel, on la réaligne.
(function repairMonthBaselines(){
  const fix=o=>{
    if(!o)return;
    const cur=o.avgPrice;
    if(!(cur>0)){return;}
    if(o._monthPrice>0){
      const pct=Math.abs((cur-o._monthPrice)/o._monthPrice*100);
      if(pct>60){o._monthPrice=cur;} // référence aberrante → réalignée sur le prix actuel
    }
  };
  (state.etfs||[]).forEach(e=>{fix(e);if(e.subs)e.subs.forEach(fix);});
  save();
})();

// ── Système d'annulation / rétablissement (Ctrl+Z / Ctrl+Y) ──
// _undoStack : états AVANT chaque action. _redoStack : états annulés, rejouables.
const _undoStack=[];
const _redoStack=[];
const _UNDO_MAX=40;
let _undoLabel='';
function pushUndo(label){
  try{
    _undoStack.push({snap:JSON.stringify(state),label:label||'action'});
    if(_undoStack.length>_UNDO_MAX)_undoStack.shift();
    // Une nouvelle action invalide tout rétablissement en attente (on a bifurqué).
    _redoStack.length=0;
  }catch(e){}
  refreshUndoBtn();
}
function doUndo(){
  if(!_undoStack.length){toast('Rien à annuler');return;}
  const entry=_undoStack.pop();
  try{
    // Sauvegarder l'état ACTUEL dans la pile redo avant de restaurer
    _redoStack.push({snap:JSON.stringify(state),label:entry.label});
    const restored=JSON.parse(entry.snap);
    Object.keys(state).forEach(k=>delete state[k]);
    Object.assign(state,restored);
    uiMode=state.uiMode||'simple';
    save();
    renderEtfGrid();renderAllocOverview();renderPieChart();updateHealthBar();renderQuickUpdate();renderMonthly();renderHistory();updateOnboarding();
    if(typeof renderCashflow==='function')renderCashflow();
    // Les sous-onglets Cashflow (Sécurité, Suggestions) ne sont pas redessinés par
    // renderCashflow : on les rafraîchit ici pour que Ctrl+Z s'y reflète aussi.
    if(typeof cfRenderSafety==='function')cfRenderSafety();
    if(typeof cfRenderSuggestions==='function')cfRenderSuggestions();
    const pp=document.getElementById('page-projection');if(pp&&pp.classList.contains('active'))updateProj();
    toast('Annulé : '+entry.label);
  }catch(e){toast('Échec de l\'annulation');}
  refreshUndoBtn();
}
function doRedo(){
  if(!_redoStack.length){toast('Rien à rétablir');return;}
  const entry=_redoStack.pop();
  try{
    // Sauvegarder l'état actuel dans la pile undo avant de rejouer
    _undoStack.push({snap:JSON.stringify(state),label:entry.label});
    const restored=JSON.parse(entry.snap);
    Object.keys(state).forEach(k=>delete state[k]);
    Object.assign(state,restored);
    uiMode=state.uiMode||'simple';
    save();
    renderEtfGrid();renderAllocOverview();renderPieChart();updateHealthBar();renderQuickUpdate();renderMonthly();renderHistory();updateOnboarding();
    if(typeof renderCashflow==='function')renderCashflow();
    if(typeof cfRenderSafety==='function')cfRenderSafety();
    if(typeof cfRenderSuggestions==='function')cfRenderSuggestions();
    const pp=document.getElementById('page-projection');if(pp&&pp.classList.contains('active'))updateProj();
    toast('Rétabli : '+entry.label);
  }catch(e){toast('Échec du rétablissement');}
  refreshUndoBtn();
}
// Affiche le bouton « Annuler » seulement s'il y a quelque chose à annuler,
// et indique au survol ce qui sera annulé.
function refreshUndoBtn(){
  const btn=document.getElementById('undo-btn');
  if(btn){
    if(_undoStack.length){
      btn.style.display='inline-flex';
      const last=_undoStack[_undoStack.length-1];
      btn.title='Annuler : '+last.label+' (Ctrl+Z)';
    }else{
      btn.style.display='none';
    }
  }
  const rbtn=document.getElementById('redo-btn');
  if(rbtn){
    if(_redoStack.length){
      rbtn.style.display='inline-flex';
      const last=_redoStack[_redoStack.length-1];
      rbtn.title='Rétablir : '+last.label+' (Ctrl+Y)';
    }else{
      rbtn.style.display='none';
    }
  }
  // Le bouton contextuel "Annuler la validation" ne reste visible qu'immédiatement
  // après une validation. Toute autre action (qui passe par pushUndo) ou une annulation
  // le masque, pour qu'il n'annule jamais autre chose que la validation qu'il désigne.
  const uvb=document.getElementById('undo-validation-btn');if(uvb)uvb.style.display='none';
}
window.doUndo=doUndo;window.doRedo=doRedo;
// Petit message éphémère en bas d'écran
// Spotlight (effet 7) : suit la souris sur les cartes marquées .spotlight.
// Met à jour les variables CSS --mx/--my utilisées par le dégradé radial.
document.addEventListener('mousemove',e=>{
  const card=e.target.closest&&e.target.closest('.card.spotlight');
  if(!card)return;
  const r=card.getBoundingClientRect();
  card.style.setProperty('--mx',(e.clientX-r.left)+'px');
  card.style.setProperty('--my',(e.clientY-r.top)+'px');
},{passive:true});

// Count-up (effet 4) : anime un élément de sa valeur courante vers une valeur cible.
// suffix ex. ' €'. Respecte prefers-reduced-motion (saut direct).
const _reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
function countUp(el,to,suffix){
  if(!el)return;suffix=suffix||'';
  const fmt=v=>Math.round(v).toLocaleString('fr-FR')+suffix;
  if(_reduceMotion){el.textContent=fmt(to);return;}
  const from=el._cuVal||0;
  if(from===to){el.textContent=fmt(to);return;}
  const dur=600,t0=performance.now();
  if(el._cuRAF)cancelAnimationFrame(el._cuRAF);
  const step=now=>{
    const p=Math.min(1,(now-t0)/dur);
    const eased=1-Math.pow(1-p,3); // ease-out cubic
    el.textContent=fmt(from+(to-from)*eased);
    if(p<1)el._cuRAF=requestAnimationFrame(step);else{el._cuVal=to;el.textContent=fmt(to);}
  };
  el._cuVal=to;el._cuRAF=requestAnimationFrame(step);
}

let _toastTimer=null;
function toast(msg){
  let el=document.getElementById('toast');
  if(!el){
    el=document.createElement('div');el.id='toast';
    el.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg2,#1a1c20);border:1px solid var(--border,#2a2d34);color:var(--text,#e6e8ec);font-size:13px;font-family:var(--mono,monospace);padding:10px 18px;border-radius:8px;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.4);opacity:0;transition:opacity .2s;pointer-events:none;';
    document.body.appendChild(el);
  }
  el.textContent=msg;el.style.opacity='1';
  clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>{el.style.opacity='0';},2200);
}
// Confirmation maison (remplace confirm() natif, qui est bloqué dans certains
// environnements et n'est pas stylé). Retourne une promesse résolue à true/false.
function confirmModal(message,opts){
  opts=opts||{};
  // Si le tuto est actif, masquer sa bulle pendant la modale (sauf si la modale
  // est déclenchée par le tuto lui-même, pour ne pas perturber sa logique).
  const suspendTour=tourActive()&&!opts.fromTour;
  if(suspendTour)tourSuspend();
  return new Promise(resolve=>{
    const ov=document.createElement('div');ov.className='overlay';ov.style.zIndex='9999';
    const box=document.createElement('div');box.className='confirm-box';
    const msg=document.createElement('div');msg.className='confirm-msg';
    if(opts.html)msg.innerHTML=message;else msg.textContent=message;
    const actions=document.createElement('div');actions.className='confirm-actions';
    const cancel=document.createElement('button');cancel.className='btn-ghost';cancel.style.flex='1';cancel.textContent=opts.cancelText||'Annuler';
    const ok=document.createElement('button');ok.className='btn-add';ok.style.cssText='flex:1;margin:0;'+(opts.danger?'background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.3);color:var(--red);':'');ok.textContent=opts.okText||'Confirmer';
    const close=v=>{ov.remove();document.removeEventListener('keydown',onKey);if(suspendTour)tourResume();resolve(v);};
    cancel.onclick=()=>close(false);ok.onclick=()=>close(true);
    ov.onclick=e=>{if(e.target===ov)close(false);};
    const onKey=e=>{if(e.key==='Escape')close(false);if(e.key==='Enter')close(true);};
    document.addEventListener('keydown',onKey);
    actions.append(cancel,ok);box.append(msg,actions);ov.append(box);document.body.append(ov);
    ok.focus();
  });
}
// Ouvre/ferme une bulle d'aide (icône ⓘ). L'élément cible est passé.
// On vise le .info-tip qui SUIT immédiatement la ligne/le label cliqué, pour
// éviter d'ouvrir la mauvaise bulle quand plusieurs cohabitent dans un même bloc.
function toggleInfo(ic){
  // 1) Cas "info-row" : le tip est le frère suivant de la ligne.
  const row=ic.closest('.info-row');
  let tip=null;
  if(row){
    let n=row.nextElementSibling;
    // On avance jusqu'au prochain .info-tip, en s'arrêtant si on rencontre
    // une autre .info-row (= on a dépassé la zone de cette bulle).
    while(n){
      if(n.classList&&n.classList.contains('info-tip')){tip=n;break;}
      if(n.classList&&n.classList.contains('info-row'))break;
      n=n.nextElementSibling;
    }
  }
  // 2) Cas "label" (ⓘ dans un <label>) : le tip suit le label parent.
  if(!tip){
    const lbl=ic.closest('label');
    if(lbl&&lbl.nextElementSibling&&lbl.nextElementSibling.classList&&lbl.nextElementSibling.classList.contains('info-tip')){
      tip=lbl.nextElementSibling;
    }
  }
  // 3) Repli : ancien comportement (premier tip du parent).
  if(!tip){tip=ic.closest('.info-row')?.parentElement?.querySelector('.info-tip')||ic.parentElement?.parentElement?.querySelector('.info-tip');}
  if(!tip)return;
  const open=tip.classList.toggle('open');
  ic.classList.toggle('open',open);
}
window.toggleInfo=toggleInfo;
// Déplie/replie l'explication de la "valeur réelle nette" (placée sous la grille
// de métriques, car les tuiles sont trop étroites pour contenir le texte).
function toggleRealNetInfo(ic){
  const tip=document.getElementById('proj-realnet-tip');
  if(!tip)return;
  const open=tip.classList.toggle('open');
  ic.classList.toggle('open',open);
}
window.toggleRealNetInfo=toggleRealNetInfo;

// ════════════════════════════════════════════════════════════════
// "QUOI DE NEUF" — petit pop-up des nouveautés pour les utilisateurs
// qui reviennent après une mise à jour.
//
// COMMENT AJOUTER UNE NOUVEAUTÉ (à faire quand tu veux l'annoncer) :
//   Ajoute une entrée EN HAUT du tableau CHANGELOG ci-dessous, avec :
//     v     : le numéro de version (doit correspondre au footer)
//     d     : la date (texte libre, ex. 'juin 2026')
//     items : la liste des changements (phrases courtes)
//   Tu n'es PAS obligé d'ajouter une entrée à chaque push : seules les
//   versions listées ici déclenchent un pop-up. Les petits correctifs que
//   tu ne veux pas annoncer, tu peux simplement ne pas les lister.
//
// COMPORTEMENT :
//   • Nouveau visiteur : ne voit jamais l'historique (il découvre le site).
//   • Visiteur qui revient : voit UN seul pop-up regroupant tout ce qui est
//     plus récent que ce qu'il a déjà vu (jamais 10 pop-up à la suite).
// ════════════════════════════════════════════════════════════════
const CHANGELOG=[
  {v:'1.59.1',d:'12 juin 2026',items:[
    'Le <strong>diagramme de flux est plus compact</strong> : il tient maintenant entièrement dans l\'écran, sans avoir à faire défiler pour voir les derniers postes.',
    'Onglet <strong>Sécurité</strong> : le montant que tu as aujourd\'hui s\'affiche dans un champ plus compact, aligné à gauche, et les nombres de mois sous le curseur sont enfin <strong>bien alignés</strong> avec la position du curseur.',
    'L\'<strong>annulation (Ctrl+Z)</strong> et le rétablissement (Ctrl+Y) fonctionnent désormais aussi dans l\'onglet Sécurité.',
    'Onglet Sécurité : le <strong>délai pour combler ton matelas</strong> est désormais plus réaliste. Folia affiche <strong>deux estimations</strong> — le nombre de mois <strong>en priorisant ton matelas</strong> (investissement mis en pause, comme le recommandent les repères) et le nombre de mois <strong>à ton rythme actuel</strong> (en continuant d\'investir). Fini les délais absurdes quand tu investis beaucoup.',
    'Petits réglages de lisibilité : le <strong>gras</strong> des textes du Cashflow est un peu plus léger.'
  ]},
  {v:'1.59.0',d:'12 juin 2026',items:[
    '<strong>Nouveau panneau « Exposition du portefeuille »</strong> dans l\'onglet Mon portefeuille : Folia calcule l\'exposition géographique (<strong>États-Unis, Europe, Japon, Marchés émergents…</strong>) et sectorielle (<strong>Tech, Finance, Santé, Industrie…</strong>) de ton portefeuille, pondérée par tes allocations cibles. Les données sont <strong>indicatives</strong>, basées sur la composition des indices suivis par tes ETF.',
    '<strong>Nouvelle disposition de l\'onglet Mon portefeuille</strong> : tes ETF s\'affichent <strong>3 par rangée</strong> au centre, avec le panneau Exposition fixé à droite qui t\'accompagne pendant le défilement.',
    'Les <strong>marges latérales de toutes les pages sont réduites</strong> : plus de place pour le contenu, surtout sur grand écran.',
    '<strong>Améliorations sur mobile</strong> : boutons du Cashflow (supprimer, lier, partager) <strong>plus grands pour le pouce</strong>, cartes de l\'écran d\'accueil adaptées à la largeur, exposition en deux colonnes sur tablette, et des <strong>ombres latérales sur le diagramme de flux</strong> qui montrent qu\'on peut le faire défiler.'
  ]},
  {v:'1.58.0',d:'9 juin 2026',items:[
    '<strong>Nouvel onglet « Sécurité »</strong> dans le Cashflow : suis ton <strong>matelas de précaution</strong>. Indique ce que tu as, choisis ta couverture avec un <strong>curseur (1 à 12 mois)</strong>, et Folia calcule ton objectif à partir de tes dépenses, l\'écart restant et le <strong>temps pour le combler</strong> à ton rythme — avec une jauge de statut et quelques repères.'
  ]},
  {v:'1.57.0',d:'9 juin 2026',items:[
    '<strong>Nouvel onglet « Suggestions »</strong> dans le Cashflow : une fois ton diagramme généré, un onglet apparaît en haut (et un bouton sous le diagramme) qui ouvre des <strong>pistes pour rééquilibrer tes dépenses</strong> — ton <strong>taux d\'épargne</strong> et ta marge non investie, et tes <strong>plus gros postes</strong> classés par poids pour repérer où tu as le plus de levier.',
    'Correction d\'un <strong>défilement inutile sur l\'écran d\'accueil</strong> (le hub tient maintenant dans l\'écran).',
    'Le sélecteur d\'outil (DCA / Cashflow) en haut à gauche passe en <strong>bulles cliquables</strong> : un seul clic pour basculer, le nom sous chaque bulle et la bulle active mise en valeur (fini le menu déroulant à deux clics).'
  ]},
  {v:'1.56.2',d:'8 juin 2026',items:[
    'Mêmes petites <strong>animations soignées sur l\'outil DCA</strong> : entrée en cascade des cartes, survol des lignes du plan d\'achat et de l\'allocation, apparition animée d\'un nouvel ETF, et retour tactile sur les boutons.',
    '<strong>Ctrl+Z fonctionne maintenant aussi dans le Cashflow</strong> pour les modifications de montants et de noms, même quand le curseur est dans un champ.',
    'Correction du <strong>clignotement</strong> de la carte lors de l\'ajout d\'un ETF (apparition propre).',
    'Quand une <strong>catégorie de dépenses est partagée en entier</strong> (mode couple), un récapitulatif affiche <strong>ta part et celle de ton/ta conjoint·e</strong> sur le total de la catégorie.'
  ]},
  {v:'1.56.1',d:'8 juin 2026',items:[
    '<strong>Cashflow plus vivant</strong> : entrée animée des blocs, survol des colonnes et catégories, glissement fluide des lignes lors du tri, et petit « pop » sur les boutons lien (🔗) et partage (÷).'
  ]},
  {v:'1.56.0',d:'8 juin 2026',items:[
    '<strong>Nouveau mode couple</strong> dans le Cashflow : renseigne le <strong>salaire de ton/ta conjoint·e</strong>, puis sur chaque dépense choisis <strong>👫 partage au pro-rata</strong> des salaires ou <strong>% partage à un pourcentage défini</strong> (réglable par ligne) — tu peux mélanger les deux. Folia ne compte alors que <strong>ta part</strong>.',
    'L\'<strong>annulation (Ctrl+Z)</strong> et le rétablissement (Ctrl+Y) fonctionnent désormais aussi pour le Cashflow.'
  ]},
  {v:'1.55.2',d:'8 juin 2026',items:[
    'Un bouton <strong>« Notes de mise à jour »</strong> en bas de l\'écran d\'accueil : reviens voir toutes les nouveautés à tout moment, des grosses fonctionnalités aux petits ajustements.'
  ]},
  {v:'1.55.1',d:'8 juin 2026',items:[
    'Cashflow : un bouton <strong>« Découvrir mon cashflow »</strong> t\'amène directement à ton taux d\'épargne et à ton diagramme de flux, d\'un défilement fluide.',
    'Le <strong>diagramme de flux s\'agrandit</strong> correctement quand tu ajoutes beaucoup de lignes (plus de coupe en bas).'
  ]},
  {v:'1.55.0',d:'8 juin 2026',items:[
    '<strong>Les deux outils communiquent</strong> : dans le Cashflow, nomme une ligne d\'investissement <strong>« PEA »</strong> et son montant se <strong>synchronise avec ton épargne mensuelle du DCA</strong>. Un bouton 🔗 permet de détacher le lien pour saisir un montant libre.'
  ]},
  {v:'1.54.0',d:'8 juin 2026',items:[
    '<strong>Gestion des données unifiée</strong> entre DCA et Cashflow : transfert par code et export/import fichier dans les deux sections. À l\'import, tu choisis ce que tu reprends — <strong>DCA seulement, Cashflow seulement, ou les deux</strong>.'
  ]},
  {v:'1.53.0',d:'7 juin 2026',items:[
    'Nouvelle section <strong>« Cashflow »</strong> : saisis tes revenus, tes investissements mensuels (par enveloppe) et tes dépenses (par catégorie), avec un modèle pré-rempli pour démarrer vite. Folia affiche ton <strong>reste disponible</strong>, ton <strong>taux d\'épargne</strong> et un <strong>diagramme de flux</strong>.'
  ]},
  {v:'1.52.0',d:'7 juin 2026',items:[
    'Folia devient une <strong>boîte à outils multi-sections</strong> ! Un écran d\'accueil pour choisir ton outil, et un sélecteur en haut à gauche pour basculer à tout moment.'
  ]},
  {v:'1.51.0',d:'6 juin 2026',items:[
    'Projection : nouveau <strong>curseur « Inflation »</strong> et affichage de la <strong>« valeur réelle nette »</strong> — ce que ton capital vaudra vraiment en argent d\'aujourd\'hui, une fois l\'impôt PEA et l\'inflation pris en compte, avec sa courbe et une bulle ⓘ explicative.'
  ]},
  {v:'1.50.0',d:'6 juin 2026',items:[
    '✨ Cette fenêtre <strong>« Quoi de neuf »</strong> : tu verras les nouveautés à chaque retour sur le site.',
    '<strong>Synchronisation entre appareils</strong> : transfère tes données mobile ↔ PC avec un simple code, sans fichier.',
    '<strong>Affichage mobile</strong> entièrement repensé : navigation, portefeuille et tutoriel adaptés au téléphone.',
    '<strong>Fréquence bimensuelle</strong> (2×/mois) en plus du mensuel et de l\'hebdomadaire.',
    'Import CSV déplacé dans <strong>« Mon portefeuille »</strong>, et un seul bouton de prix par groupe d\'émetteurs.'
  ]}
];

// Compare deux versions "x.y.z" → -1, 0, 1
function compareVer(a,b){
  const pa=String(a||'0').split('.').map(n=>parseInt(n,10)||0);
  const pb=String(b||'0').split('.').map(n=>parseInt(n,10)||0);
  for(let i=0;i<Math.max(pa.length,pb.length);i++){
    const x=pa[i]||0,y=pb[i]||0;
    if(x<y)return -1;if(x>y)return 1;
  }
  return 0;
}

// Décide s'il faut montrer le "Quoi de neuf", et lequel.
function maybeShowChangelog(isNewUser){
  if(!CHANGELOG.length)return;
  const newest=CHANGELOG[0].v;
  // 1) Nouveau visiteur : on n'affiche rien, on mémorise juste l'état actuel.
  if(isNewUser){ state._seenChangelog=newest; save(); return; }
  const seen=state._seenChangelog;
  let toShow;
  if(seen==null){
    // 2) Utilisateur existant qui découvre la fonctionnalité : on ne déverse pas
    //    tout l'historique, juste la dernière entrée.
    toShow=[CHANGELOG[0]];
  } else {
    // 3) Utilisateur connu : tout ce qui est plus récent que ce qu'il a vu.
    toShow=CHANGELOG.filter(e=>compareVer(e.v,seen)>0);
  }
  // Toujours mémoriser la version la plus récente comme "vue" (même si rien à montrer).
  state._seenChangelog=newest; save();
  if(!toShow.length)return;
  showChangelogModal(toShow);
}

// Affiche le pop-up. Les entrées du même jour sont regroupées sous une seule date.
function showChangelogModal(entries){
  const ov=document.createElement('div');ov.className='overlay';ov.style.zIndex='9998';
  const box=document.createElement('div');box.className='modal';box.style.maxWidth='440px';
  // Regroupement par jour (les entrées sont déjà triées de la plus récente à la plus ancienne)
  const groups=[];
  entries.forEach(e=>{
    const last=groups[groups.length-1];
    if(last&&last.d===e.d){ last.items=last.items.concat(e.items); }
    else groups.push({d:e.d,items:e.items.slice()});
  });
  let h='<div style="position:sticky;top:-1.5rem;z-index:1;display:flex;align-items:center;justify-content:space-between;margin:-1.5rem -1.5rem .25rem;padding:1.5rem 1.5rem .6rem;background:var(--bg2);border-bottom:1px solid var(--border);">'
    +'<div style="font-size:15px;font-weight:600;">&#10024; Quoi de neuf</div>'
    +'<button id="cl-close" style="background:transparent;border:none;color:var(--text3);font-size:20px;padding:2px 8px;cursor:pointer;">&#215;</button></div>';
  groups.forEach(g=>{
    h+='<div style="margin-top:.7rem;">'
      +(g.d?'<div style="font-size:11px;font-family:var(--mono);color:var(--accent);margin-bottom:6px;">'+g.d+'</div>':'')
      +'<ul style="margin:0;padding-left:1.1rem;display:flex;flex-direction:column;gap:5px;">';
    g.items.forEach(it=>{ h+='<li style="font-size:12px;color:var(--text2);line-height:1.45;">'+it+'</li>'; });
    h+='</ul></div>';
  });
  h+='<div style="position:sticky;bottom:-1.5rem;margin:.25rem -1.5rem -1.5rem;padding:1rem 1.5rem;background:var(--bg2);border-top:1px solid var(--border);">'
    +'<button id="cl-ok" class="btn-add" style="width:100%;margin:0;">Super, merci !</button>'
    +'</div>';
  box.innerHTML=h;ov.appendChild(box);
  const close=()=>{ov.remove();document.removeEventListener('keydown',onKey);};
  const onKey=ev=>{if(ev.key==='Escape')close();};
  ov.addEventListener('click',ev=>{if(ev.target===ov)close();});
  document.addEventListener('keydown',onKey);
  document.body.appendChild(ov);
  box.querySelector('#cl-close').onclick=close;
  box.querySelector('#cl-ok').onclick=close;
}
// Ouvre les notes de mise à jour à la demande (tout l'historique), sans modifier
// l'état "_seenChangelog" : c'est une consultation manuelle, pas le pop-up auto.
function openChangelog(){ if(CHANGELOG&&CHANGELOG.length)showChangelogModal(CHANGELOG); }
window.openChangelog=openChangelog;
window.maybeShowChangelog=maybeShowChangelog;
// Replie/déplie un bloc (Projection par ETF, Performances, Fiscalité).
// L'état ouvert/fermé est mémorisé dans le state pour rester comme l'utilisateur l'a laissé.
function toggleCollapse(key){
  const head=document.querySelector('.collapse-head[onclick*="\''+key+'\'"]');
  const body=document.getElementById('body-'+key);
  if(!head||!body)return;
  const willClose=!body.classList.contains('closed');
  if(willClose){
    // Fermeture : repartir de la hauteur réelle actuelle puis laisser le CSS animer vers 0
    body.style.maxHeight=body.scrollHeight+'px';
    void body.offsetHeight; // reflow pour que le navigateur prenne la hauteur de départ
    body.classList.add('closed');
    head.classList.add('closed');
    body.style.maxHeight=''; // laisse la règle .closed (max-height:0) gérer l'animation
  } else {
    // Ouverture : animer jusqu'à la hauteur du contenu...
    head.classList.remove('closed');
    body.classList.remove('closed');
    body.style.maxHeight=body.scrollHeight+'px';
    // ...puis libérer la contrainte une fois l'animation finie, pour que le bloc
    // s'adapte si son contenu grandit ensuite (graphique redessiné, données chargées).
    const release=()=>{body.style.maxHeight='none';body.removeEventListener('transitionend',release);};
    body.addEventListener('transitionend',release);
    // garde-fou si transitionend ne se déclenche pas (animation désactivée)
    setTimeout(release,400);
  }
  if(!state._collapsed)state._collapsed={};
  state._collapsed[key]=willClose;save();
}
window.toggleCollapse=toggleCollapse;
// Applique l'état replié mémorisé aux blocs (appelé après chaque updateProj)
function applyCollapseState(){
  const def={fiscal:false,etf:true,history:true}; // défauts : fiscal ouvert, autres fermés
  ['fiscal','etf','history'].forEach(key=>{
    const head=document.querySelector('.collapse-head[onclick*="\''+key+'\'"]');
    const body=document.getElementById('body-'+key);
    if(!head||!body)return;
    const closed=state._collapsed&&state._collapsed[key]!=null?state._collapsed[key]:def[key];
    body.classList.toggle('closed',closed);
    head.classList.toggle('closed',closed);
    // Bloc ouvert : pas de contrainte de hauteur (évite le contenu coupé après redessin)
    body.style.maxHeight=closed?'':'none';
  });
}
window.applyCollapseState=applyCollapseState;
// Raccourci clavier Ctrl+Z / Ctrl+Y (et Cmd sur Mac)
document.addEventListener('keydown',e=>{
  const mod=e.ctrlKey||e.metaKey;if(!mod)return;
  const k=e.key.toLowerCase();
  const isUndo=(k==='z'&&!e.shiftKey);
  const isRedo=(k==='y'||(k==='z'&&e.shiftKey));
  if(!isUndo&&!isRedo)return;
  const t=document.activeElement;
  const inField=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);
  if(inField){
    const cfSec=document.getElementById('section-cashflow');
    const inCf=cfSec&&cfSec.style.display!=='none'&&cfSec.contains(t);
    if(!inCf)return; // hors Cashflow : on laisse l'annulation native du champ
    if(t.blur)t.blur(); // dans le Cashflow : valider la saisie (capture le snapshot) puis annuler
  }
  e.preventDefault();
  if(isRedo)doRedo();else doUndo();
});
// Annulation des modifications de champs du Cashflow : on mémorise l'état à l'entrée
// dans un champ, et on l'empile dans la pile d'annulation si la valeur a changé à la sortie.
let _cfEditSnap=null;
function cfCommitEditSnapshot(){
  if(_cfEditSnap==null)return;
  if(_cfEditSnap!==JSON.stringify(state)){
    _undoStack.push({snap:_cfEditSnap,label:'modification du Cashflow'});
    if(_undoStack.length>_UNDO_MAX)_undoStack.shift();
    _redoStack.length=0;if(typeof refreshUndoBtn==='function')refreshUndoBtn();
  }
  _cfEditSnap=null;
}
(function(){
  const cfSec=document.getElementById('section-cashflow');if(!cfSec)return;
  cfSec.addEventListener('focusin',e=>{if(e.target&&e.target.matches&&e.target.matches('input,textarea'))_cfEditSnap=JSON.stringify(state);});
  cfSec.addEventListener('focusout',e=>{if(e.target&&e.target.matches&&e.target.matches('input,textarea'))cfCommitEditSnapshot();});
})();
document.getElementById('nav-date').textContent=new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long'});
function nav(id){
  // Ne toucher QUE les pages/onglets de la section DCA (sinon on désactive aussi
  // la page du Cashflow, qui partage la classe .page → écran vide au retour).
  const dca=document.getElementById('section-dca')||document;
  dca.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  dca.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  const p=document.getElementById('page-'+id);
  if(p){
    void p.offsetWidth;p.classList.add('active'); // reflow → rejoue l'animation pageIn
    // Cascade d'entrée des blocs (cohérent avec le Cashflow), en réutilisant blockIn.
    const blocks=[...p.querySelectorAll('.plan-card,.update-card,.card,.onboarding,.etf-card')].filter(b=>b.offsetParent!==null);
    blocks.forEach((b,i)=>{
      b.style.animation='none';void b.offsetWidth;
      b.style.animation='blockIn .34s cubic-bezier(.22,1,.36,1) '+Math.min(0.04+i*0.05,0.4).toFixed(2)+'s both';
    });
    setTimeout(()=>blocks.forEach(b=>{b.style.animation='';}),1000);
  }
  dca.querySelectorAll('.nav-tab').forEach(t=>{if(t.getAttribute('onclick')==="nav('"+id+"')")t.classList.add('active');});
  if(id==='monthly')renderMonthly();
  if(id==='portfolio')renderEtfGrid();
  if(id==='history')renderHistory();
  if(id==='projection'){syncProjSliders();updateProj();}
}
function etfValue(e){if(e.subs&&e.subs.length>0)return e.subs.reduce((s,sub)=>s+(sub.shares*(sub.avgPrice||0)),0);return(e.shares||0)*(e.avgPrice||0);}
function etfPrice(e){if(e.subs&&e.subs.length>0){const t=e.subs.reduce((s,s2)=>s+(s2.shares||0),0);if(!t)return 0;return e.subs.reduce((s,s2)=>s+(s2.shares||0)*(s2.avgPrice||0),0)/t;}return e.avgPrice||0;}
function etfMonthPrice(e){if(e.subs&&e.subs.length>0){const t=e.subs.reduce((s,s2)=>s+(s2.shares||0),0);if(!t)return 0;return e.subs.reduce((s,s2)=>s+(s2.shares||0)*(s2._monthPrice||s2.avgPrice||0),0)/t;}return e._monthPrice||e._prevPrice||0;}
function updateHealthBar(){
  const tv=state.etfs.reduce((s,e)=>s+etfValue(e),0);
  // Folia ne calcule PAS de plus-value (ça reste le rôle de ton courtier, qui
  // connaît tes vrais coûts de revient). On affiche le cash en réserve, que Folia
  // maîtrise exactement — c'est utile pour la planification.
  const reserve=state.deferredCash||0;
  const drifts=state.etfs.map(e=>{const p=tv>0?(etfValue(e)/tv*100):0;return Math.abs(p-e.target);});
  const md=drifts.length?Math.max(...drifts):0;
  document.getElementById('hb-total')&&countUp(document.getElementById('hb-total'),tv,' €');
  const pe=document.getElementById('hb-pv');pe.textContent=reserve.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €';pe.className='health-value'+(reserve>0?' amber':'');
  const da=state.driftAlert||8;
  const de=document.getElementById('hb-drift');de.textContent=md.toFixed(1)+'%';de.className='health-value '+(md<da*0.4?'green':md<da?'amber':'red');
  document.getElementById('hb-monthly').textContent=state.monthly.toLocaleString('fr-FR')+' €';
  document.getElementById('hb-freq').textContent=state.freq==='weekly'?'Hebdomadaire':(state.freq==='biweekly'?'Bimensuelle':'Mensuelle');
  const w=document.getElementById('reminder-wrap');
  const last=state.lastCalcDate?new Date(state.lastCalcDate):null;
  const now=new Date();
  const reminderDay=Math.min(28,Math.max(1,state.reminderDay||1));
  // Calculé ce mois-ci ?
  const calcedThisMonth=last&&last.getFullYear()===now.getFullYear()&&last.getMonth()===now.getMonth();
  // Rappel si : on a atteint/dépassé le jour de rappel ce mois-ci et pas encore calculé ce mois.
  const dueThisMonth=now.getDate()>=reminderDay&&!calcedThisMonth;
  if(dueThisMonth){
    w.innerHTML='<div class="reminder-banner" onclick="calculate()">'+(last?'C\'est le moment d\'investir':'Premier calcul')+' — Calculer →</div>';
  }else if(!last){
    w.innerHTML='<div class="reminder-banner" onclick="calculate()">Premier calcul — Calculer →</div>';
  }else{
    w.innerHTML='';
  }
}
function updateOnboarding(){
  // La bannière de bienvenue guide le tout début. Elle disparaît dès que la config
  // de base est là (au moins un ETF + allocations à ~100 %) — le calcul est ensuite
  // encouragé par le bandeau de rappel. L'utilisateur peut aussi la fermer à la main.
  const hasAnyEtf=state.etfs.length>0;
  const allocOk=state.etfs.some(e=>e.target>0)&&Math.abs(state.etfs.reduce((s,e)=>s+(+e.target||0),0)-100)<0.5;
  const ob=document.getElementById('onboarding');
  if(!ob)return;
  const hide=state._obDismissed||(hasAnyEtf&&allocOk);
  ob.style.display=hide?'none':'block';
}
function dismissOnboarding(){state._obDismissed=true;save();const ob=document.getElementById('onboarding');if(ob)ob.style.display='none';}
window.dismissOnboarding=dismissOnboarding;
function renderMonthly(){
  updateHealthBar();updateOnboarding();renderAllocOverview();renderQuickUpdate();renderPieChart();
  renderSubChoices();
  // Plan du mois
  if(state.pendingOrders){
    renderPlanOrders(state.pendingOrders);
    document.getElementById('confirm-card').classList.add('visible');
    renderConfirmList(state.pendingOrders);
  } else {
    // Remettre à zéro l'affichage du plan
    const planOrders=document.getElementById('plan-orders');
    if(planOrders)planOrders.innerHTML='<div style="text-align:center;padding:1.5rem 0;font-size:12px;color:var(--text3);font-family:var(--mono);">Aucun calcul effectué</div>';
    const planSub=document.getElementById('plan-sub');
    if(planSub)planSub.textContent='Lance le calcul';
    document.getElementById('confirm-card').classList.remove('visible');
    const calcStatus=document.getElementById('calc-status');
    if(calcStatus)calcStatus.textContent='Prêt';
    const calcDot=document.getElementById('calc-dot');
    if(calcDot)calcDot.className='status-dot';
  }
  // Cash reporté
  const def=state.deferredCash||0;
  const dn=document.getElementById('deferred-notice');
  if(def>0){dn.style.display='block';dn.textContent='Reporté: '+def.toFixed(2)+' € → prochain calcul';}
  else dn.style.display='none';
}
function renderQuickUpdate(){
  const el=document.getElementById('quick-update-list');
  if(!state.etfs.length){el.innerHTML='<p style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:8px 0;">Aucun ETF — configure ton portefeuille d\'abord.</p>';return;}
  const hasParts=state.etfs.some(e=>e.subs&&e.subs.length>0?e.subs.some(s=>s.shares>0):e.shares>0);
  const totalParts=state.etfs.filter(e=>e.subs&&e.subs.length>0?e.subs.some(s=>s.shares>0):e.shares>0).length;
  const isinLink=isin=>isin?'<a href="https://www.justetf.com/en/etf-profile.html?isin='+isin+'" target="_blank" class="alloc-isin">'+isin+'</a>':'';

  // Construire le HTML sans oninput inline pour éviter l'imbrication de guillemets
  let html='';
  state.etfs.forEach((e,i)=>{
    const eid=e.id;
    const color=COLORS[i%COLORS.length];
    const hasSubs=e.subs&&e.subs.length>0;
    const etfHasParts=hasSubs?e.subs.some(s=>s.shares>0):e.shares>0;
    if(!hasSubs){
      const val=etfValue(e);
      html+='<div style="padding:8px 0;border-bottom:1px solid var(--border);">'
        +'<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;">'
        +'<span style="width:8px;height:8px;border-radius:50%;background:'+color+';flex-shrink:0;display:inline-block;"></span>'
        +'<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+e.name+'</div>'+(e.isin?'<div>'+isinLink(e.isin)+'</div>':'')+'</div>'
        +(etfHasParts?'<span style="font-size:11px;color:var(--green);flex-shrink:0;">✓</span>':'')
        +'<button data-remove-idx="'+i+'" style="background:transparent;border:none;color:var(--text3);font-size:17px;padding:0 2px;cursor:pointer;line-height:1;flex-shrink:0;">×</button>'
        +'</div>'
        +'<div style="display:flex;align-items:center;gap:8px;">'
        +'<label style="font-size:11px;color:var(--text3);font-family:var(--mono);flex:1;">Parts détenues</label>'
        +'<span id="qu-val-'+eid+'" style="font-size:11px;font-family:var(--mono);color:var(--text3);white-space:nowrap;transition:color .15s;">'+(val>0?val.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €':'')+'</span>'
        +'<input type="number" data-eid="'+eid+'" data-field="shares" value="'+e.shares+'" min="0" step="0.001" class="qu-input" style="width:88px;text-align:right;padding:5px 8px;height:30px;font-size:13px;flex-shrink:0;"/>'
        +'</div>'
        +'</div>';
    } else {
      const tv=etfValue(e);
      let subsH='';
      e.subs.forEach((sub,si)=>{
        const sv=sub.shares*(sub.avgPrice||0);const pct=tv>0?(sv/tv*100):0;
        subsH+='<div style="display:flex;align-items:center;gap:6px;padding:3px 0 3px 10px;border-left:2px solid rgba(79,142,247,.2);">'
          +'<div style="flex:1;min-width:0;"><div style="font-size:11px;color:var(--text2);font-weight:500;">'+(sub.name||'Émetteur '+(si+1))+'</div>'
          +(sub.isin?'<div>'+isinLink(sub.isin)+'</div>':'')
          +'<div style="display:flex;align-items:center;gap:5px;margin-top:2px;">'
          +'<div style="height:2px;background:var(--bg4);border-radius:1px;flex:1;overflow:hidden;max-width:80px;"><div style="height:2px;background:'+color+';width:'+pct.toFixed(0)+'%;border-radius:1px;"></div></div>'
          +'<span style="font-size:10px;font-family:var(--mono);color:var(--text3);">'+pct.toFixed(0)+'% · '+(sub.avgPrice||0).toFixed(2)+' €/p</span>'
          +'</div></div>'
          +(sv>0?'<span style="font-size:10px;font-family:var(--mono);color:var(--text3);white-space:nowrap;">'+sv.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €</span>':'')
          +(sub.shares>0?'<span style="font-size:10px;color:var(--green);">✓</span>':'')
          +'<input type="number" data-eid="'+eid+'" data-si="'+si+'" data-field="shares" value="'+sub.shares+'" min="0" step="0.001" class="qu-sub-input" style="width:80px;text-align:right;padding:3px 7px;height:26px;font-size:12px;flex-shrink:0;"/>'
          +'</div>';
      });
      html+='<div style="padding:5px 0;border-bottom:1px solid var(--border);">'
        +'<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;">'
        +'<span style="width:7px;height:7px;border-radius:50%;background:'+color+';display:inline-block;"></span>'
        +'<span style="font-size:12px;font-weight:600;flex:1;">'+e.name+'</span>'
        +'<span id="qu-val-'+eid+'" style="font-size:11px;font-family:var(--mono);color:var(--text2);transition:color .15s;">'+(tv>0?tv.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €':'')+'</span>'
        +(etfHasParts?'<span style="font-size:10px;color:var(--green);">✓</span>':'')
        +'<button data-remove-idx="'+i+'" style="background:transparent;border:none;color:var(--text3);font-size:16px;padding:0 2px;cursor:pointer;line-height:1;">×</button>'
        +'</div>'+subsH+'</div>';
    }
  });

  // Barre de statut
  html+='<div style="margin-top:8px;padding:7px 10px;border-radius:var(--r);background:'+(hasParts?'rgba(52,211,153,.08)':'rgba(79,142,247,.06)')+';border:1px solid '+(hasParts?'rgba(52,211,153,.2)':'rgba(79,142,247,.15)')+';display:flex;align-items:center;gap:7px;">'
    +'<span style="font-size:12px;">'+(hasParts?'✓':'○')+'</span>'
    +'<span style="font-size:11px;font-family:var(--mono);color:'+(hasParts?'var(--green)':'var(--text3)')+'">'+
    (hasParts?totalParts+' ETF renseigné'+(totalParts>1?'s':'')+' · Étape 2 validée':'Renseigne tes parts ou importe ton CSV pour valider l\'étape 2')
    +'</span></div>'
    +'<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:4px;">parts détenues</div>';

  el.innerHTML=html;

  // Attacher les événements via addEventListener — évite les problèmes d'imbrication de guillemets
  el.querySelectorAll('.qu-input').forEach(inp=>{
    inp.addEventListener('input',function(){
      setEtfField(+this.dataset.eid,this.dataset.field,this.value);
    });
    inp.addEventListener('mouseover',function(){this.style.borderColor='var(--accent)';});
    inp.addEventListener('mouseout',function(){this.style.borderColor='';});
  });
  el.querySelectorAll('.qu-sub-input').forEach(inp=>{
    inp.addEventListener('input',function(){
      setSubField(+this.dataset.eid,+this.dataset.si,this.dataset.field,this.value);
    });
  });
  el.querySelectorAll('[data-remove-idx]').forEach(btn=>{
    const idx=+btn.dataset.removeIdx;
    btn.addEventListener('click',()=>removeEtfFromHome(idx));
    btn.addEventListener('mouseover',()=>{btn.style.color='var(--red)';});
    btn.addEventListener('mouseout',()=>{btn.style.color='var(--text3)';});
  });
}
function saveQuickUpdate(){
  // saveQuickUpdate est gardé pour le bouton "Enregistrer les parts"
  // mais les inputs ont déjà oninput qui appelle setEtfField directement
  // Cette fonction sert juste de confirmation visuelle
  save();
  updateHealthBar();renderAllocOverview();renderPieChart();renderQuickUpdate();updateOnboarding();
  const btn=document.querySelector('.btn-save-parts');
  if(btn){btn.textContent='✓ Enregistré';btn.style.background='var(--green)';setTimeout(()=>{btn.textContent='✓ Enregistrer les parts';btn.style.background='';},2000);}
}
function renderAllocOverview(){
  const el=document.getElementById('alloc-overview');
  const total=state.etfs.reduce((s,e)=>s+etfValue(e),0);
  if(!state.etfs.length){el.innerHTML='<p style="font-size:12px;color:var(--text3);">Aucun ETF configuré.</p>';return;}
  const isinLink=isin=>isin?'<a href="https://www.justetf.com/en/etf-profile.html?isin='+isin+'" target="_blank" class="alloc-isin">'+isin+'</a>':'';
  el.innerHTML=state.etfs.map((e,i)=>{
    const val=etfValue(e);const pct=total>0?(val/total*100):0;const delta=pct-e.target;
    const dCls=Math.abs(delta)<1?'delta-ok':delta>0?'delta-up':'delta-down';
    const color=COLORS[i%COLORS.length];const chip=renderDeltaChip(e);
    const hasSubs=e.subs&&e.subs.length>0;
    const subInfo=hasSubs?'<div style="margin-top:2px;">'+e.subs.map(s=>'<div style="display:flex;align-items:center;gap:4px;"><span style="font-size:10px;color:var(--text3);">↳</span><span style="font-size:11px;color:var(--text2);">'+(s.name||s.isin||'—')+'</span>'+(s.isin?' '+isinLink(s.isin):'')+'</div>').join('')+'</div>':'';
    return '<div class="alloc-item" data-alloc-idx="'+i+'">'
      +'<span class="alloc-dot" style="background:'+color+'"></span>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:500;">'+e.name+'</div>'+(!hasSubs&&e.isin?'<div>'+isinLink(e.isin)+'</div>':'')+subInfo+'</div>'
      +'<div style="flex-shrink:0;text-align:right;">'
      +'<div style="display:flex;align-items:center;gap:5px;justify-content:flex-end;margin-bottom:3px;">'
      +'<div style="height:3px;background:var(--bg3);border-radius:2px;width:70px;overflow:hidden;"><div style="height:3px;border-radius:2px;width:'+Math.min(pct,100).toFixed(1)+'%;background:'+color+';"></div></div>'
      +'<span style="font-size:11px;font-family:var(--mono);font-weight:500;">'+pct.toFixed(1)+'%</span>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:4px;justify-content:flex-end;">'
      +'<span style="font-size:10px;font-family:var(--mono);color:var(--text3);">/'+e.target+'%</span>'
      +'<span class="delta-badge '+dCls+'">'+(delta>=0?'+':'')+delta.toFixed(1)+'%</span>'
      +(chip?'<span>'+chip+'</span>':'')
      +'</div></div></div>';
  }).join('')
  +'<div style="margin-top:12px;padding-top:11px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;gap:10px 14px;font-size:10px;font-family:var(--mono);color:var(--text3);line-height:1.4;">'
    +'<div style="display:flex;align-items:center;gap:5px;"><span class="delta-badge delta-down" style="font-size:9px;">−%</span><span>sous ta cible → à renforcer</span></div>'
    +'<div style="display:flex;align-items:center;gap:5px;"><span class="delta-badge delta-ok" style="font-size:9px;">±0</span><span>aligné sur ta cible</span></div>'
    +'<div style="display:flex;align-items:center;gap:5px;"><span class="delta-badge delta-up" style="font-size:9px;">+%</span><span>au-dessus de ta cible</span></div>'
    +'<div style="display:flex;align-items:center;gap:5px;width:100%;margin-top:2px;"><span class="price-chip up" style="font-size:9px;">▲ %</span><span>variation du prix de l\'ETF ce mois-ci (sa performance)</span></div>'
  +'</div>';
}
function renderDeltaChip(etf){
  const base=etfMonthPrice(etf);const cur=etfPrice(etf);
  if(!cur||!base||base===cur)return'';
  const pct=((cur-base)/base)*100;
  // Garde-fou : un écart mensuel démesuré (>60%) signale presque toujours une
  // référence de début de mois corrompue (prix de test, 0, mauvaise devise…),
  // pas une vraie variation de marché. On n'affiche alors rien plutôt qu'un chiffre faux.
  if(Math.abs(pct)>60)return'';
  const s=pct>=0?'+':'';const cls=pct>=0?'up':'down';const arrow=pct>=0?'▲':'▼';
  return'<span class="price-chip '+cls+'">'+arrow+' '+s+pct.toFixed(2)+'%</span>';
}
// ══════════ EXPOSITION DU PORTEFEUILLE ══════════
function renderExposure(){
  const el=document.getElementById('exposure-content');if(!el)return;
  // Construit un index ticker/isin → composition depuis la bibliothèque
  const look={};
  BASE_ETF_LIBRARY.forEach(lib=>{
    if(!lib.comp)return;
    if(lib.ticker)look[lib.ticker]=lib.comp;
    if(lib.isin)look[lib.isin]=lib.comp;
  });
  const gKeys=['usa','europe','japon','emergents','autre'];
  const sKeys=['tech','finance','sante','industrie','conso','energie','autre'];
  const gAcc={};gKeys.forEach(k=>gAcc[k]=0);
  const sAcc={};sKeys.forEach(k=>sAcc[k]=0);
  let matchedW=0,totalW=0;
  state.etfs.forEach(etf=>{
    const w=+etf.target||0;if(!w)return;
    totalW+=w;
    // Priorité ticker, puis ISIN
    const comp=look[etf.ticker]||look[etf.isin];if(!comp)return;
    matchedW+=w;
    gKeys.forEach(k=>gAcc[k]+=(comp.geo[k]||0)*w);
    sKeys.forEach(k=>sAcc[k]+=(comp.sectors[k]||0)*w);
  });
  if(!matchedW){
    el.innerHTML='<p style="font-size:12px;color:var(--text3);text-align:center;padding:8px 0;">Aucun ETF reconnu dans la bibliothèque — ajoute tes ETF via la bibliothèque pour voir l\'exposition.</p>';
    return;
  }
  // Moyennes pondérées
  const gN={};gKeys.forEach(k=>gN[k]=gAcc[k]/matchedW);
  const sN={};sKeys.forEach(k=>sN[k]=sAcc[k]/matchedW);

  const gLabels={usa:'États-Unis',europe:'Europe',japon:'Japon & Pacif.',emergents:'Marchés émergents',autre:'Autre'};
  const sLabels={tech:'Tech & IT',finance:'Finance',sante:'Santé',industrie:'Industrie',conso:'Consommation',energie:'Énergie',autre:'Autre'};
  const gColors={usa:'#4f8ef7',europe:'#34d399',japon:'#f97316',emergents:'#a78bfa',autre:'#94a3b8'};
  const sColors={tech:'#4f8ef7',finance:'#34d399',sante:'#2dd4bf',industrie:'#f97316',conso:'#fbbf24',energie:'#f87171',autre:'#94a3b8'};

  function bars(keys,vals,labels,colors){
    return keys
      .map(k=>({k,v:vals[k]}))
      .filter(x=>x.v>=0.5)
      .sort((a,b)=>b.v-a.v)
      .map(({k,v})=>'<div class="exp-row">'
        +'<span class="exp-label">'+labels[k]+'</span>'
        +'<div class="exp-bar-wrap"><div class="exp-bar" style="width:'+Math.min(v,100).toFixed(1)+'%;background:'+colors[k]+';"></div></div>'
        +'<span class="exp-pct">'+v.toFixed(0)+'%</span>'
        +'</div>').join('');
  }
  const note=matchedW<totalW
    ?'<p style="font-size:11px;color:var(--text3);font-family:var(--mono);margin-top:10px;text-align:center;">Basé sur '+matchedW.toFixed(0)+'% de l\'allocation (ETF hors bibliothèque ignorés).</p>'
    :'';
  el.innerHTML='<div class="exp-grid">'
    +'<div><div class="exp-title">Géographie</div>'+bars(gKeys,gN,gLabels,gColors)+'</div>'
    +'<div><div class="exp-title">Secteurs</div>'+bars(sKeys,sN,sLabels,sColors)+'</div>'
    +'</div>'+note;
}
window.renderExposure=renderExposure;

let pieChart=null;
function renderPieChart(){
  const ctx=document.getElementById('pie-main');const infoEl=document.getElementById('pie-info');if(!ctx)return;
  const total=state.etfs.reduce((s,e)=>s+etfValue(e),0);
  const data=state.etfs.map(e=>total>0?(etfValue(e)/total*100):e.target);
  const colors=state.etfs.map((_,i)=>COLORS[i%COLORS.length]);
  // Synthèse affichée sous le camembert (pas de doublon avec la liste à côté) :
  // nombre de lignes + plus gros écart à la cible.
  function defInfo(){
    if(!state.etfs.length){infoEl.innerHTML='';return;}
    const drifts=state.etfs.map((e,i)=>({name:e.name,d:data[i]-e.target}));
    const worst=drifts.reduce((a,b)=>Math.abs(b.d)>Math.abs(a.d)?b:a,drifts[0]);
    const aligned=Math.abs(worst.d)<1;
    infoEl.innerHTML='<div style="text-align:center;color:var(--text3);line-height:1.5;">'
      +state.etfs.length+' ETF · '
      +(aligned
        ?'<span style="color:var(--green);">aligné sur ta cible</span>'
        :'écart max <span style="color:'+(Math.abs(worst.d)<8?'var(--amber)':'var(--red)')+';">'+(worst.d>=0?'+':'')+worst.d.toFixed(1)+'%</span>')
      +'</div>';
  }
  // Surligne la ligne correspondante dans la liste (liaison visuelle, sans répéter les chiffres)
  function highlightRow(idx){
    document.querySelectorAll('.alloc-item').forEach(el=>{
      const on=+el.getAttribute('data-alloc-idx')===idx;
      el.style.background=on?'var(--bg3)':'';
      el.style.borderRadius=on?'var(--r)':'';
    });
  }
  if(pieChart)pieChart.destroy();
  pieChart=new Chart(ctx,{type:'doughnut',
    data:{labels:state.etfs.map(e=>e.name),datasets:[{data,backgroundColor:colors.map(c=>c+'99'),borderColor:colors,borderWidth:1.5,hoverBackgroundColor:colors,hoverOffset:5}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{enabled:false}},cutout:'62%',
      onHover:(evt,els)=>{
        if(els.length>0){highlightRow(els[0].index);}
        else{highlightRow(-1);}
      }
    }
  });
  defInfo();
}
// ── Bibliothèque d'ETF ───────────────────────────────────────────
// Construit la liste proposée à l'ajout : base PEA courante + ETF déjà connus
// de l'utilisateur (actuels et archivés/supprimés), dédupliqués par ISIN/ticker.
function buildEtfLibrary(){
  const seen=new Set();const lib=[];
  const key=e=>((e.isin||'')+'|'+(e.ticker||'')).toUpperCase();
  const add=(e,src)=>{
    if(!e||(!e.isin&&!e.ticker&&!e.name))return;
    const k=key(e);if(seen.has(k))return;seen.add(k);
    lib.push({name:e.name||e.isin||e.ticker,ticker:e.ticker||'',isin:e.isin||'',src});
  };
  // 1) ETF actuellement dans le portefeuille (déjà ajoutés) → marqués pour info
  (state.etfs||[]).forEach(e=>{
    if(e.subs&&e.subs.length)e.subs.forEach(s=>add(s,'actuel'));
    else add(e,'actuel');
  });
  // 2) ETF archivés (supprimés auparavant) → récupérables
  (state._archivedEtfs||[]).forEach(e=>add(e,'archive'));
  // 3) Base PEA courante
  BASE_ETF_LIBRARY.forEach(e=>add(e,'base'));
  return lib;
}
// Ouvre la fenêtre bibliothèque pour choisir/récupérer un ETF, ou en saisir un nouveau.
function openEtfLibrary(){
  const lib=buildEtfLibrary();
  const suspendTour=tourActive();if(suspendTour)tourSuspend();
  const ov=document.createElement('div');ov.className='overlay';ov.style.zIndex='9999';
  const box=document.createElement('div');box.className='confirm-box';box.style.width='460px';box.style.maxHeight='80vh';box.style.gap='.8rem';
  const close=()=>{ov.remove();document.removeEventListener('keydown',onKey);if(suspendTour)tourResume();};
  const onKey=e=>{if(e.key==='Escape')close();};
  document.addEventListener('keydown',onKey);
  ov.onclick=e=>{if(e.target===ov)close();};

  let html='<div style="font-size:15px;font-weight:600;">Ajouter un ETF</div>'
    +'<div style="font-size:11px;color:var(--text3);font-family:var(--mono);line-height:1.45;">Choisis un ETF de ta bibliothèque, récupère-en un que tu avais retiré, ou saisis-en un nouveau. Tu renseigneras tes parts ensuite.</div>'
    +'<input id="lib-filter" placeholder="Filtrer par nom, ticker ou ISIN…" autocomplete="off" style="width:100%;padding:8px 11px;height:34px;font-size:13px;"/>'
    +'<div id="lib-list" style="overflow-y:auto;max-height:320px;display:flex;flex-direction:column;gap:5px;"></div>'
    +'<div style="border-top:1px solid var(--border);padding-top:.8rem;">'
    +'<button class="btn-add" style="margin-top:0;width:100%;" id="lib-blank">+ Saisir un nouvel ETF (vide)</button></div>';
  box.innerHTML=html;ov.append(box);document.body.append(ov);

  const listEl=box.querySelector('#lib-list');
  const render=filter=>{
    const q=(filter||'').trim().toLowerCase();
    const items=lib.filter(e=>!q||e.name.toLowerCase().includes(q)||(e.ticker||'').toLowerCase().includes(q)||(e.isin||'').toLowerCase().includes(q));
    if(!items.length){listEl.innerHTML='<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:8px;">Aucun ETF dans la bibliothèque pour « '+filter+' ». Utilise « Saisir un nouvel ETF ».</div>';return;}
    listEl.innerHTML=items.map((e,i)=>{
      const tag=e.src==='actuel'?'<span style="font-size:9px;color:var(--text3);border:1px solid var(--border);padding:1px 5px;border-radius:8px;">déjà ajouté</span>'
        :e.src==='archive'?'<span style="font-size:9px;color:var(--accent);border:1px solid rgba(79,142,247,.3);padding:1px 5px;border-radius:8px;">retiré</span>':'';
      return '<div class="search-result-item" data-i="'+lib.indexOf(e)+'" style="border:1px solid var(--border);border-radius:var(--r);">'
        +'<div><div style="font-size:13px;font-weight:500;">'+e.name+'</div>'
        +'<div style="font-size:11px;font-family:var(--mono);color:var(--text3);">'+(e.ticker||'—')+' · '+(e.isin||'—')+'</div></div>'
        +'<div style="display:flex;align-items:center;gap:6px;">'+tag+'<span class="badge badge-blue" style="font-size:10px;">+ Ajouter</span></div></div>';
    }).join('');
    listEl.querySelectorAll('.search-result-item').forEach(el=>{
      el.onclick=()=>{const e=lib[+el.getAttribute('data-i')];addEtfFromLibrary(e);close();};
    });
  };
  render('');
  box.querySelector('#lib-filter').addEventListener('input',e=>render(e.target.value));
  box.querySelector('#lib-blank').onclick=()=>{close();addEtfBlank();};
  box.querySelector('#lib-filter').focus();
}
// Ajoute un ETF choisi dans la bibliothèque (toujours à 0 part — l'utilisateur saisit ensuite)
function addEtfFromLibrary(e){
  if(!e)return;
  // Éviter le doublon si déjà présent dans le portefeuille
  const exists=state.etfs.some(x=>(x.isin&&e.isin&&x.isin===e.isin)||(x.ticker&&e.ticker&&x.ticker===e.ticker));
  if(exists){toast('Cet ETF est déjà dans ton portefeuille');return;}
  pushUndo('ajout d\'un ETF');
  state.etfs.push({id:state.nextId++,name:e.name,ticker:e.ticker||'',isin:e.isin||'',target:0,shares:0,avgPrice:0,_nameLocked:!!e.name});
  save();renderEtfGrid();
  toast('« '+e.name+' » ajouté — renseigne tes parts et ta cible');
}
window.openEtfLibrary=openEtfLibrary;
document.addEventListener('click',e=>{const res=document.getElementById('search-results');if(res&&!document.getElementById('etf-search')?.contains(e.target))res.classList.remove('open');});
function addSubEtf(eid){
  const etf=state.etfs.find(e=>e.id===eid);if(!etf)return;
  if(!etf.subs){
    // Convertir ETF solo en groupe — migrer ses propres données vers un premier sub
    etf.subs=[{isin:etf.isin||'',ticker:etf.ticker||'',name:etf.name||'',shares:etf.shares||0,avgPrice:etf.avgPrice||0}];
    etf.isin='';etf.ticker='';etf.shares=0;etf.avgPrice=0;
  }
  etf.subs.push({isin:'',ticker:'',name:'',shares:0,avgPrice:0});
  save();renderEtfGrid();
}
async function removeSubEtf(eid,si){
  const etf=state.etfs.find(e=>e.id===eid);if(!etf||!etf.subs)return;
  pushUndo('suppression d\'un émetteur');
  etf.subs.splice(si,1);
  if(etf.subs.length===0){
    // Plus de subs — redevient ETF solo
    delete etf.subs;
  } else if(etf.subs.length===1){
    // Un seul émetteur restant : l'ETF est de fait un solo → conversion automatique.
    const sub=etf.subs[0];
    etf.isin=sub.isin||'';etf.ticker=sub.ticker||'';
    etf.shares=sub.shares||0;etf.avgPrice=sub.avgPrice||0;
    if(sub.name)etf.name=sub.name;
    delete etf.subs;
  }
  save();renderEtfGrid();renderAllocOverview();renderPieChart();updateHealthBar();renderQuickUpdate();
}
function setSubField(eid,si,field,val){
  const etf=state.etfs.find(e=>e.id===eid);if(!etf||!etf.subs||!etf.subs[si])return;
  const sub=etf.subs[si];
  if(field==='ident'){
    const v=val.trim().toUpperCase();
    if(isISIN(v)){sub.isin=v;}
    else{sub.ticker=v;sub.isin='';}
    const a=document.getElementById('sub-jef-'+eid+'-'+si);
    if(a)a.href=justEtfLink(sub);
  } else if(field==='name'){
    sub.name=val;
  } else {
    sub[field]=+val;
  }
  save();
  if(field==='shares'||field==='avgPrice'){
    // Mettre à jour la valeur du sub affichée
    const subVal=(sub.shares||0)*(sub.avgPrice||0);
    const sv=document.getElementById('sub-val-'+eid+'-'+si);
    if(sv){
      sv.textContent=subVal>0?'= '+subVal.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €':'= — €';
      sv.style.color=subVal>0?'var(--green)':'var(--text3)';
      setTimeout(()=>{sv.style.color=subVal>0?'var(--text2)':'var(--text3)';},400);
    }
    refreshFooterPrice(eid);syncAllViews();
  }
}
async function resolveSubEtf(eid,si){
  const etf=state.etfs.find(e=>e.id===eid);if(!etf||!etf.subs||!etf.subs[si])return;
  const sub=etf.subs[si];
  // Le bouton de refresh individuel n'existe plus (un seul bouton par groupe) ;
  // on ne manipule un bouton que si on en trouve un vrai (compat. ascendante).
  const cand=document.querySelector('#sub-jef-'+eid+'-'+si)?.previousElementSibling;
  const btn=(cand&&cand.tagName==='BUTTON')?cand:null;
  if(btn){btn.textContent='…';btn.disabled=true;}
  const info=await fetchByEtf(sub);
  if(btn){btn.textContent='⟳';btn.disabled=false;}
  if(!info?.price){
    if(btn){btn.textContent='✕';btn.style.color='var(--red)';setTimeout(()=>{btn.textContent='⟳';btn.style.color='';},2500);}
    showFetchError(eid,(sub.name||'Émetteur')+' : '+(info?.msg||'échec'));
    return;
  }
  clearFetchError(eid);
  const prevSub=sub.avgPrice||0;
  updateMonthlyBaseline(sub);
  sub.avgPrice=info.price;
  if(info.name&&!sub.name)sub.name=info.name;
  // Rafraîchir le nom affiché de l'émetteur (span) après résolution
  const nameEl=document.getElementById('sub-name-'+eid+'-'+si);
  if(nameEl&&sub.name)nameEl.textContent=sub.name;
  const priceEl=document.getElementById('sub-price-'+eid+'-'+si);
  if(priceEl){priceEl.value=info.price.toFixed(2);priceEl.style.color='var(--green)';setTimeout(()=>{priceEl.style.color='';},2000);}
  const subVal=(sub.shares||0)*(sub.avgPrice||0);
  const sv=document.getElementById('sub-val-'+eid+'-'+si);
  if(sv)sv.textContent=subVal>0?'= '+subVal.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €':'= — €';
  if(btn){btn.textContent='✓';btn.style.color='var(--green)';setTimeout(()=>{btn.textContent='⟳';btn.style.color='';},2000);}
  const sameSub=Math.abs((sub.avgPrice||0)-prevSub)<0.0001;
  showFetchInfo(eid,(sub.name||'Émetteur')+' — '+(sameSub?'prix inchangé : ':'prix mis à jour : ')+sub.avgPrice.toFixed(2)+' €');
  save();renderAllocOverview();renderPieChart();updateHealthBar();refreshFooterPrice(eid);
}
window.addSubEtf=addSubEtf;
window.removeSubEtf=removeSubEtf;
window.setSubField=setSubField;
window.resolveSubEtf=resolveSubEtf;
// Récupère les prix de TOUS les émetteurs d'un groupe en une fois (un seul bouton).
async function resolveGroup(eid){
  const etf=state.etfs.find(e=>e.id===eid);
  if(!etf||!etf.subs||!etf.subs.length)return;
  // Retrouver le bouton "Prix du groupe" pour donner un retour visuel
  const btn=document.querySelector('button[onclick="resolveGroup('+eid+')"]');
  const label=btn?btn.textContent:null;
  if(btn){btn.textContent='⟳ …';btn.disabled=true;}
  // Résoudre chaque émetteur qui a un identifiant (ISIN ou ticker)
  for(let si=0;si<etf.subs.length;si++){
    const sub=etf.subs[si];
    if(sub.isin||sub.ticker){
      try{await resolveSubEtf(eid,si);}catch(e){}
    }
  }
  if(btn){btn.textContent='✓ Prix à jour';btn.style.color='var(--green)';
    setTimeout(()=>{btn.textContent=label||'⟳ Prix du groupe';btn.style.color='';btn.disabled=false;},2000);}
  renderAllocOverview();renderPieChart();updateHealthBar();renderMonthly();
}
window.resolveGroup=resolveGroup;
// Résolution auto d'un sous-ETF (émetteur) quand un ISIN valide vient d'être saisi.
async function autoResolveSubEtf(eid,si){
  const etf=state.etfs.find(e=>e.id===eid);if(!etf||!etf.subs||!etf.subs[si])return;
  const sub=etf.subs[si];
  if(!sub.isin||!isISIN(sub.isin))return;       // seulement sur un ISIN valide
  if(sub.avgPrice>0&&sub.name)return;            // déjà résolu/renseigné
  await resolveSubEtf(eid,si);
}
window.autoResolveSubEtf=autoResolveSubEtf;
function addEtfBlank(){pushUndo('ajout d\'un ETF');state.etfs.push({id:state.nextId++,name:'',ticker:'',isin:'',target:0,shares:0,avgPrice:0});save();renderEtfGrid();}
// Ajoute un ETF vide puis défile jusqu'à lui et met le focus sur le champ ISIN.
function addEtfBlankAndScroll(){
  pushUndo('ajout d\'un ETF');
  const id=state.nextId++;
  state.etfs.push({id,name:'',ticker:'',isin:'',target:0,shares:0,avgPrice:0});
  _newEtfId=id;             // la carte s'animera dès sa création (pas de clignotement)
  save();renderEtfGrid();
  requestAnimationFrame(()=>{
    const card=document.getElementById('etf-card-'+id);
    if(card){card.scrollIntoView({behavior:'smooth',block:'center'});
      const inp=document.getElementById('ident-'+id);if(inp)inp.focus({preventScroll:true});}
  });
}
window.addEtfBlankAndScroll=addEtfBlankAndScroll;
// Archive l'identité d'un ETF supprimé dans la bibliothèque (récupérable ensuite).
// Ne stocke que nom/ISIN/ticker (pas les parts) — l'utilisateur les ressaisira.
function archiveEtf(etf){
  if(!etf)return;
  if(!state._archivedEtfs)state._archivedEtfs=[];
  const stash=o=>{
    if(!o||(!o.isin&&!o.ticker&&!o.name))return;
    const k=((o.isin||'')+'|'+(o.ticker||'')).toUpperCase();
    if(state._archivedEtfs.some(a=>((a.isin||'')+'|'+(a.ticker||'')).toUpperCase()===k))return;
    state._archivedEtfs.unshift({name:o.name||o.isin||o.ticker,ticker:o.ticker||'',isin:o.isin||''});
  };
  if(etf.subs&&etf.subs.length)etf.subs.forEach(stash);else stash(etf);
  if(state._archivedEtfs.length>50)state._archivedEtfs=state._archivedEtfs.slice(0,50);
}
function removeEtf(i){archiveEtf(state.etfs[i]);pushUndo('suppression de « '+(state.etfs[i]?.name||'ETF')+' »');state.etfs.splice(i,1);save();renderEtfGrid();renderAllocOverview();renderPieChart();updateHealthBar();}
async function removeEtfFromHome(i){if(!await confirmModal('Supprimer "'+state.etfs[i].name+'" ?',{okText:'Supprimer',danger:true}))return;archiveEtf(state.etfs[i]);pushUndo('suppression de « '+(state.etfs[i]?.name||'ETF')+' »');state.etfs.splice(i,1);save();renderMonthly();renderEtfGrid();}
function isISIN(v){return/^[A-Z]{2}[A-Z0-9]{10}$/.test((v||'').trim().toUpperCase());}
function justEtfLink(etf){const isin=(etf.isin||'').trim().toUpperCase();if(isin&&isISIN(isin))return'https://www.justetf.com/en/etf-profile.html?isin='+isin;const t=(etf.ticker||'').trim();return t?'https://www.justetf.com/en/search.html?search=ETFS&query='+encodeURIComponent(t):'https://www.justetf.com/en/find-etf.html';}
function onIdentInput(i,val){const v=val.trim().toUpperCase();if(isISIN(v)){state.etfs[i].isin=v;}else{state.etfs[i].ticker=v;state.etfs[i].isin='';}save();const a=document.getElementById('jef-'+i);if(a)a.href=justEtfLink(state.etfs[i]);}
// Helpers exposés sur window pour les oninput inline
function syncAllViews(){
  updateHealthBar();
  renderAllocOverview();
  renderPieChart();
  renderExposure();
  updateOnboarding();
  // Mettre à jour tous les footers de cards portefeuille
  state.etfs.forEach(e=>{
    refreshFooterPrice(e.id);
    // Mettre à jour le total dans "Mes positions" avec animation
    const valEl=document.getElementById('qu-val-'+e.id);
    if(valEl){
      const val=etfValue(e);
      const newText=val>0?val.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €':'';
      if(valEl.textContent!==newText){
        valEl.style.color='var(--green)';
        valEl.textContent=newText;
        setTimeout(()=>{valEl.style.color='';},400);
      }
    }
  });
}
function setEtfField(eid,field,val){
  const etf=state.etfs.find(e=>e.id===eid);if(!etf)return;
  if(field==='name'){etf.name=val;etf._nameLocked=true;}
  else etf[field]=+val;
  save();
  if(field==='target')refreshAllocTotal();
  if(field==='shares'||field==='avgPrice'){refreshFooterPrice(eid);syncAllViews();}
}
function refreshFooterPrice(eid){
  const etf=state.etfs.find(e=>e.id===eid);if(!etf)return;
  const val=etfValue(etf);
  const el=document.getElementById('footer-price-'+eid);
  if(!el)return;
  const newText=val>0?val.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €':'— €';
  const newColor=val>0?'var(--text2)':'var(--text3)';
  el.style.transition='color .15s';
  el.style.color='var(--green)';
  el.innerHTML=newText+(etf._lastUpdated?' <span style="color:var(--text3);font-size:10px;">· '+etf._lastUpdated+'</span>':'');
  setTimeout(()=>{el.style.color=newColor;},400);
}
window.refreshFooterPrice=refreshFooterPrice;
function onIdentInputById(eid,val){
  const etf=state.etfs.find(e=>e.id===eid);if(!etf)return;
  const v=val.trim().toUpperCase();
  if(isISIN(v)){etf.isin=v;}else{etf.ticker=v;etf.isin='';}
  save();
  const a=document.getElementById('jef-'+eid);if(a)a.href=justEtfLink(etf);
}
window.setEtfField=setEtfField;
window.onIdentInputById=onIdentInputById;
let dragSrcIdx=null;
let _newEtfId=null; // id de l'ETF tout juste ajouté → animation d'apparition à la création
function renderEtfGrid(){
  const grid=document.getElementById('etf-grid');grid.innerHTML='';
  // Tri par allocation cible décroissante (sans modifier state.etfs)
  const sorted=state.etfs.map((etf,origIdx)=>({etf,origIdx})).sort((a,b)=>b.etf.target-a.etf.target);
  sorted.forEach(({etf,origIdx:i})=>{
    const eid=etf.id;
    const color=COLORS[i%COLORS.length];const card=document.createElement('div');
    card.className='etf-card';card.id='etf-card-'+eid;card.setAttribute('draggable','true');
    if(_newEtfId===eid)card.classList.add('block-in'); // apparition animée, sans clignotement
    card.addEventListener('mousedown',e=>{if(e.target.tagName==='INPUT'||e.target.closest('button')||e.target.closest('a'))card.setAttribute('draggable','false');});
    card.addEventListener('mouseup',()=>card.setAttribute('draggable','true'));
    card.addEventListener('dragstart',e=>{dragSrcIdx=i;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    card.addEventListener('dragend',()=>{card.classList.remove('dragging');document.querySelectorAll('.etf-card').forEach(c=>c.classList.remove('drag-over'));card.setAttribute('draggable','true');});
    card.addEventListener('dragover',e=>{e.preventDefault();document.querySelectorAll('.etf-card').forEach(c=>c.classList.remove('drag-over'));if(i!==dragSrcIdx)card.classList.add('drag-over');});
    card.addEventListener('drop',e=>{e.preventDefault();card.classList.remove('drag-over');if(dragSrcIdx===null||dragSrcIdx===i)return;pushUndo('réorganisation');const m=state.etfs.splice(dragSrcIdx,1)[0];state.etfs.splice(i,0,m);save();renderEtfGrid();});
    const identVal=etf.isin||etf.ticker||'';const val=etfValue(etf);
    const hasSubs=etf.subs&&etf.subs.length>0;
    const identHint=etf.isin&&etf.ticker
      ?'<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:2px;">Ticker résolu: '+etf.ticker+'</div>'
      :'';

    // Sub-ETF rows (émetteurs alternatifs)
    let subsBody='';
    if(hasSubs){
      subsBody='<div style="grid-column:1/-1;margin-top:4px;display:flex;flex-direction:column;gap:6px;">';
      etf.subs.forEach((sub,si)=>{
        const subIdentVal=sub.isin||sub.ticker||'';
        const subHint=sub.isin&&sub.ticker?'<span style="font-size:10px;font-family:var(--mono);color:var(--text3);">→ '+sub.ticker+'</span>':'';
        const subVal=(sub.shares||0)*(sub.avgPrice||0);
        subsBody+='<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:9px 11px;">'
          +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:7px;">'
          +'<span style="font-size:10px;font-family:var(--mono);padding:1px 6px;border-radius:3px;background:rgba(79,142,247,.1);color:var(--accent);">Émetteur '+(si+1)+'</span>'
          +'<span id="sub-name-'+eid+'-'+si+'" style="font-size:11px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(sub.name||sub.isin||'—')+'</span>'
          +'<button onclick="removeSubEtf('+eid+','+si+')" style="background:transparent;border:none;color:var(--text3);font-size:14px;padding:0 3px;cursor:pointer;line-height:1;" onmouseover="this.style.color=\'var(--red)\'" onmouseout="this.style.color=\'var(--text3)\'">×</button>'
          +'</div>'
          // Ligne identifiant
          +'<div class="etf-ticker-row" style="margin-bottom:7px;">'
          +'<input type="text" id="sub-ident-'+eid+'-'+si+'" value="'+subIdentVal+'" placeholder="ISIN ou ticker" oninput="setSubField('+eid+','+si+',\'ident\',this.value)" onchange="autoResolveSubEtf('+eid+','+si+')"/>'
          +'<a href="'+justEtfLink(sub)+'" target="_blank" class="btn-sm btn-yf" id="sub-jef-'+eid+'-'+si+'">↗</a>'
          +'</div>'
          +(subHint?'<div style="margin-bottom:7px;">'+subHint+'</div>':'')
          // Ligne parts + prix
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">'
          +'<div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);margin-bottom:3px;letter-spacing:.05em;">PARTS</div>'
          +'<input type="number" id="sub-shares-'+eid+'-'+si+'" value="'+(sub.shares||'')+'" min="0" step="0.001" placeholder="0" style="width:100%;text-align:right;padding:5px 8px;height:30px;font-size:12px;" oninput="setSubField('+eid+','+si+',\'shares\',this.value)"/></div>'
          +'<div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);margin-bottom:3px;letter-spacing:.05em;">PRIX (€)</div>'
          +'<input type="number" id="sub-price-'+eid+'-'+si+'" value="'+(sub.avgPrice||'')+'" min="0" step="0.01" placeholder="auto" style="width:100%;text-align:right;padding:5px 8px;height:30px;font-size:12px;" oninput="setSubField('+eid+','+si+',\'avgPrice\',this.value)"/></div>'
          +'</div>'
          // Valeur totale du sub
          +'<div style="margin-top:6px;text-align:right;font-size:11px;font-family:var(--mono);color:'+(subVal>0?'var(--text2)':'var(--text3)')+';" id="sub-val-'+eid+'-'+si+'">'+(subVal>0?'= '+subVal.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €':'= — €')+'</div>'
          +'</div>';
      });
      subsBody+='<button onclick="addSubEtf('+eid+')" style="background:transparent;border:1px dashed var(--border2);color:var(--text3);font-size:11px;font-family:var(--mono);padding:6px;border-radius:var(--r);width:100%;cursor:pointer;" onmouseover="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseout="this.style.borderColor=\'\';this.style.color=\'var(--text3)\'">+ Ajouter un émetteur</button>';
      subsBody+='</div>';
    }

    let body='<div class="etf-card-header"><span class="drag-handle">⠿</span><span class="etf-dot" style="background:'+color+'"></span>'
      +'<input class="etf-name-input" type="text" value="'+etf.name+'" placeholder="Nom de l\'ETF" oninput="setEtfField('+eid+',&quot;name&quot;,this.value)"/>'
      +'<button class="btn-remove-etf" onclick="removeEtf('+i+')">×</button></div>'
      +'<div class="etf-card-body">';

    if(!hasSubs){
      // ETF solo — champ ident (ISIN en priorité) + parts
      body+='<div class="etf-field" style="grid-column:1/-1;"><label>ISIN (recommandé) ou ticker</label>'
        +'<div class="etf-ticker-row">'
        +'<input type="text" id="ident-'+eid+'" value="'+identVal+'" placeholder="Ex : LU0996182563" oninput="onIdentInputById('+eid+',this.value)" onchange="autoResolveEtf('+i+')"/>'
        +'<button class="btn-sm btn-resolve" id="resolve-btn-'+eid+'" onclick="resolveSingle('+i+')" title="Rechercher le nom et le prix">⟳</button>'
        +'<a id="jef-'+eid+'" href="'+justEtfLink(etf)+'" target="_blank" class="btn-sm btn-yf" title="Voir sur justETF">↗</a>'
        +'</div>'
        +'<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:3px;line-height:1.4;">Saisis l\'ISIN (12 caractères, ex. LU0996182563) : Folia trouve le nom et le prix automatiquement.</div>'
        +identHint+'</div>'
        +'<div class="etf-field target-field"><label>Cible %</label><input type="number" class="etf-target-input" value="'+etf.target+'" min="0" max="100" oninput="setEtfField('+eid+',&quot;target&quot;,this.value)"/></div>'
        +'<div class="etf-field"><label>Parts détenues</label><input type="number" value="'+(etf.shares||'')+'" min="0" step="0.001" placeholder="0" oninput="setEtfField('+eid+',&quot;shares&quot;,this.value)"/></div>'
        +'<div class="etf-field"><label>Prix unitaire (€)</label><input type="number" id="price-'+eid+'" value="'+(etf.avgPrice||'')+'" min="0" step="0.01" placeholder="auto" oninput="setEtfField('+eid+',&quot;avgPrice&quot;,this.value)"/></div>';

      // Bouton pour transformer en groupe multi-émetteurs
      body+='<div style="grid-column:1/-1;">'
        +'<button onclick="addSubEtf('+eid+')" style="background:transparent;border:1px dashed var(--border2);color:var(--text3);font-size:11px;font-family:var(--mono);padding:5px;border-radius:var(--r);width:100%;cursor:pointer;" onmouseover="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseout="this.style.borderColor=\'\';this.style.color=\'var(--text3)\'">+ Ajouter un émetteur alternatif</button>'
        +'</div>';
    } else {
      // ETF groupe — cible % + bouton « Prix du groupe » sur la MÊME ligne (en haut), puis émetteurs
      body+='<div style="grid-column:1/-1;display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;">'
        +'<div class="etf-field target-field" style="width:96px;flex-shrink:0;"><label>Cible %</label><input type="number" class="etf-target-input" value="'+etf.target+'" min="0" max="100" oninput="setEtfField('+eid+',&quot;target&quot;,this.value)"/></div>'
        +'<div style="font-size:11px;font-family:var(--mono);color:var(--text2);padding-bottom:9px;flex:1;min-width:80px;">'+etf.subs.length+' émetteur'+(etf.subs.length>1?'s':'')+' · '+(val>0?val.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €':'— €')+'</div>'
        +'<button onclick="resolveGroup('+eid+')" title="Récupérer les prix de tous les émetteurs" style="margin-bottom:4px;background:transparent;border:1px solid var(--border2);color:var(--text2);font-size:11px;font-family:var(--mono);padding:6px 10px;border-radius:var(--r);cursor:pointer;white-space:nowrap;" onmouseover="this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\'" onmouseout="this.style.borderColor=\'var(--border2)\';this.style.color=\'var(--text2)\'">⟳ Prix du groupe</button>'
        +'</div>'
        +subsBody;
    }

    // Écart actuel vs cible (même logique que l'onglet Répartition)
    const gridTotal=state.etfs.reduce((s,e)=>s+etfValue(e),0);
    const curPct=gridTotal>0?(val/gridTotal*100):0;
    const delta=curPct-etf.target;
    const dCls=Math.abs(delta)<1?'delta-ok':delta>0?'delta-up':'delta-down';
    const deltaBadge=gridTotal>0&&val>0
      ?'<span class="delta-badge '+dCls+'" style="font-size:9px;margin-left:6px;">'+curPct.toFixed(1)+'% ('+(delta>=0?'+':'')+delta.toFixed(1)+')</span>'
      :'';

    body+='</div><div class="etf-card-footer">'
      +'<span style="font-size:10px;color:var(--text3);font-family:var(--mono);" id="footer-pct-'+eid+'">'+etf.target+'%</span>'
      +'<div class="etf-alloc-bar-bg"><div class="etf-alloc-bar" id="footer-bar-'+eid+'" style="width:'+Math.min(etf.target,100)+'%;background:'+color+';"></div></div>'
      +(val>0
        ?'<span style="font-size:11px;font-family:var(--mono);color:var(--text2);margin-left:auto;" id="footer-price-'+eid+'">'+val.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €'+(etf._lastUpdated?' <span style="color:var(--text3);font-size:10px;">· '+etf._lastUpdated+'</span>':'')+'</span>'
        :'<span style="font-size:11px;font-family:var(--mono);color:var(--text3);margin-left:auto;" id="footer-price-'+eid+'">— €</span>'
      )
      +deltaBadge
      +'</div>';
    card.innerHTML=body;grid.appendChild(card);
  });
  _newEtfId=null; // marqueur consommé
  refreshAllocTotal();
  renderExposure();
}
let _sortTimer=null;
function refreshAllocTotal(){
  const t=state.etfs.reduce((s,e)=>s+(+e.target||0),0);
  const el=document.getElementById('alloc-total');if(!el)return;
  if(t===100){
    el.innerHTML='<span style="color:var(--green);font-weight:600;">✓ 100% — répartition valide &#10003;</span>';
  } else {
    const diff=100-t;
    el.innerHTML='<span style="color:var(--red);">Total : '+t+'%'+(diff>0?' — il manque '+diff+'%':' — dépasse de '+Math.abs(diff)+'%')+'</span>';
  }
  clearTimeout(_sortTimer);
  _sortTimer=setTimeout(()=>{
    const grid=document.getElementById('etf-grid');if(!grid)return;
    const sorted=[...state.etfs].sort((a,b)=>b.target-a.target);
    // Si la grille est DÉJÀ dans le bon ordre (cas d'un rendu complet, déjà trié),
    // on ne ré-attache rien : inutile, et ça évitait un clignotement ~1 s après.
    const want=sorted.map(e=>'etf-card-'+e.id).join(',');
    const cur=[...grid.children].map(c=>c.id).join(',');
    if(cur===want)return;
    // FLIP : mesure positions avant
    const before={};
    sorted.forEach(etf=>{
      const card=document.getElementById('etf-card-'+etf.id);
      if(card)before[etf.id]=card.getBoundingClientRect();
    });
    // Réordonne dans le DOM
    sorted.forEach(etf=>{
      const card=document.getElementById('etf-card-'+etf.id);
      if(card)grid.appendChild(card);
    });
    // FLIP : mesure positions après et anime la différence
    sorted.forEach(etf=>{
      const card=document.getElementById('etf-card-'+etf.id);
      if(!card||!before[etf.id])return;
      const after=card.getBoundingClientRect();
      const dy=before[etf.id].top-after.top;
      const dx=before[etf.id].left-after.left;
      if(Math.abs(dy)<1&&Math.abs(dx)<1)return; // pas bougé
      card.style.transition='none';
      card.style.transform=`translate(${dx}px,${dy}px)`;
      requestAnimationFrame(()=>{
        card.style.transition='transform 350ms cubic-bezier(0.4,0,0.2,1)';
        card.style.transform='translate(0,0)';
        card.addEventListener('transitionend',()=>{card.style.transition='';card.style.transform='';},{once:true});
      });
    });
  },800);
}
window.refreshAllocTotal=refreshAllocTotal;
window.updateAllocTotal=refreshAllocTotal;
function updateCardFooter(i){
  const etf=state.etfs[i];if(!etf)return;
  const color=COLORS[i%COLORS.length];
  const val=etfValue(etf);
  // Update the footer bar width and % label
  const card=document.getElementById('etf-card-'+i);if(!card)return;
  const bar=card.querySelector('.etf-alloc-bar');
  const pctLabel=card.querySelector('.etf-card-footer span:first-child');
  const valLabel=card.querySelector('.etf-card-footer span:last-child');
  if(bar)bar.style.width=Math.min(etf.target,100)+'%';
  if(pctLabel)pctLabel.textContent=etf.target+'%';
  if(valLabel)valLabel.textContent=val>0?'≈ '+val.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €':'— €';
}
function setMode(m){
  // Flush tous les champs visibles dans state avant de recréer les cards
  document.querySelectorAll('.etf-card').forEach(card=>{
    const eid=+(card.id.replace('etf-card-',''));
    const etf=state.etfs.find(e=>e.id===eid);if(!etf)return;
    const inputs=card.querySelectorAll('input[type=number]');
    if(inputs[0]&&inputs[0].value!=='')etf.target=+inputs[0].value;
    if(inputs[1]&&inputs[1].value!=='')etf.shares=+inputs[1].value;

    // Ne pas réécrire isin/ticker depuis le champ — identVal affiche isin||ticker
    // donc si etf.isin existe, le champ montre l'isin et on ne doit pas le re-parser
    // (ce serait redondant et risquerait d'effacer isin si le champ montre le ticker)
  });
  save();
  uiMode=m;
  // mode buttons removed
  renderEtfGrid();
}

async function fetchByEtf(etf){
  const isin=(etf.isin||'').trim().toUpperCase();
  const ticker=(etf.ticker||'').trim().toUpperCase();
  if(!isin&&!ticker)return{error:'no-id',msg:'Aucun ISIN ni ticker renseigné'};

  // On interroge notre fonction serveur Netlify, qui va chercher le prix sur
  // Yahoo Finance côté serveur (pas de blocage CORS, couvre Euronext Paris).
  // En local (fichier ouvert hors Netlify), la fonction n'existe pas → message clair.
  const qs=[];
  if(isin)qs.push('isin='+encodeURIComponent(isin));
  if(ticker)qs.push('ticker='+encodeURIComponent(ticker));
  const url='/api/price?'+qs.join('&');

  try{
    const r=await fetch(url,{signal:AbortSignal.timeout(12000)});
    if(r.status===404){
      return{error:'no-server',msg:'Récupération auto indisponible ici (ouvre l\'app via son adresse en ligne). En local, saisis les prix à la main.'};
    }
    let d=null;
    try{d=await r.json();}catch(_){}
    if(!d)return{error:'http',msg:'Réponse inattendue du serveur de prix'};
    if(d.error)return{error:'yahoo',msg:d.error};
    if(d.price){
      // Mémoriser le symbole Yahoo résolu comme ticker, pour les fois suivantes
      if(d.symbol&&!etf.ticker)etf.ticker=d.symbol;
      return{price:+d.price,name:d.name||null,source:'Yahoo ✓'};
    }
    return{error:'no-price',msg:'Aucun prix retourné pour '+(ticker||isin)};
  }catch(e){
    if(e.name==='TimeoutError'||e.name==='AbortError')return{error:'timeout',msg:'Délai dépassé — vérifie ta connexion'};
    return{error:'network',msg:'Échec réseau — vérifie ta connexion'};
  }
}
async function fetchAllBatch(){
  const solos=state.etfs.filter(e=>(!e.subs||!e.subs.length)&&(e.ticker||e.isin));
  const subItems=[];
  state.etfs.forEach(e=>{if(e.subs&&e.subs.length)e.subs.forEach((sub,si)=>{if(sub.ticker||sub.isin)subItems.push({etf:e,sub,si});});});
  const results={};

  // Récupération des prix via notre fonction serveur (Yahoo). Chaque ETF est
  // interrogé individuellement par fetchByEtf. Si la fonction n'est pas
  // disponible (app ouverte en local), on retombe sur les prix déjà connus.
  const withId=solos.filter(e=>e.ticker||isISIN(e.isin||''));
  await Promise.all(withId.map(async e=>{
    const info=await fetchByEtf(e);
    if(info&&info.price)results[e.id]={price:info.price,name:info.name,source:info.source};
    else if(e.avgPrice>0)results[e.id]={price:e.avgPrice,name:null,source:'cache'};
  }));

  // Fetch subs individuellement aussi
  const subsWithId=subItems.filter(x=>x.sub.ticker||isISIN(x.sub.isin||''));
  await Promise.all(subsWithId.map(async x=>{
    const info=await fetchByEtf(x.sub);
    if(info&&info.price){x.sub.avgPrice=info.price;updateMonthlyBaseline(x.sub);}
  }));
  save();
  return results;
}
function updateMonthlyBaseline(etf){
  const tag=new Date().getFullYear()+'-'+(new Date().getMonth()+1);
  const p=etf.avgPrice;
  // Ne figer une référence de mois QUE si le prix est valide (>0).
  // Évite de figer 0 ou une valeur aberrante qui fausserait la variation tout le mois.
  if(!(p>0))return;
  if(etf._monthTag!==tag){etf._monthPrice=p;etf._monthTag=tag;}
  else if(!(etf._monthPrice>0))etf._monthPrice=p;
}
function applyFetchResult(etf,i,info,manual){
  // Garde-fou : sur un refresh AUTOMATIQUE, si le prix saute de plus de 5×,
  // c'est probablement un mauvais titre (homonyme US). On refuse et on signale.
  // Sur un clic MANUEL (manual=true), l'utilisateur demande explicitement —
  // on applique toujours (permet de corriger un ancien mauvais prix).
  const old=etf.avgPrice||0;
  if(!manual&&old>0&&info.price>0&&(info.price>old*5||info.price<old/5)){
    etf._priceWarning='Prix suspect ignoré : '+info.price.toFixed(2)+' € (réf. '+old.toFixed(2)+' €). Vérifie l\'ISIN/ticker.';
    const fp=document.getElementById('footer-price-'+etf.id);
    if(fp)fp.innerHTML=old.toFixed(2)+' € <span style="color:var(--amber);font-size:10px;">⚠ prix suspect</span>';
    return false; // refus
  }
  etf._priceWarning=null;
  updateMonthlyBaseline(etf);
  if(!etf._prevPrice)etf._prevPrice=info.price;else if(info.price!==etf.avgPrice)etf._prevPrice=etf.avgPrice;
  etf.avgPrice=info.price;
  etf._lastUpdated=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  if(info.name&&!etf._nameLocked)etf.name=info.name;
  // Rafraîchir le champ nom à l'écran (sinon il reste vide après résolution auto)
  const card=document.getElementById('etf-card-'+etf.id);
  if(card){const ni=card.querySelector('.etf-name-input');if(ni&&etf.name&&ni.value!==etf.name)ni.value=etf.name;}
  const pi=document.getElementById('price-'+etf.id);if(pi)pi.value=info.price.toFixed(2);
  const ui=document.getElementById('updated-'+etf.id);if(ui)ui.textContent=etf._lastUpdated;
  refreshFooterPrice(etf.id);
  return true;
}
let autoRefreshTimer=null;
let _lastRefreshTs=0;
// Délai minimal entre deux refresh AUTOMATIQUES (anti-rafale + économie de crédits).
// Les prix Yahoo sont des cours de clôture (1 valeur/jour), donc rafraîchir plus
// souvent ne récupère aucune nouvelle donnée. Un clic manuel (force=true) ignore ce délai.
const _MIN_AUTO_REFRESH_MS=6*60*60*1000; // 6 h
async function triggerRefresh(force){
  // Garde-fou : ne pas refaire un appel réseau si un refresh récent a déjà eu lieu,
  // sauf demande explicite (force) — clic manuel, import CSV…
  if(!force&&_lastRefreshTs&&(Date.now()-_lastRefreshTs<_MIN_AUTO_REFRESH_MS))return;
  _lastRefreshTs=Date.now();
  const dot=document.getElementById('refresh-dot');const lbl=document.getElementById('refresh-label');
  if(dot)dot.className='status-dot live';if(lbl)lbl.textContent='…';
  const pm=await fetchAllBatch();let n=0;
  state.etfs.forEach((etf,i)=>{const info=pm[etf.id];if(!info?.price)return;applyFetchResult(etf,i,info);n++;});
  save();renderEtfGrid();renderAllocOverview();updateHealthBar();renderPieChart();renderQuickUpdate();
  const now=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  if(dot)dot.className='status-dot'+(n>0?' live':'');if(lbl)lbl.textContent=n>0?'màj '+now:'—';
}
function startAutoRefresh(){
  const hasIds=()=>state.etfs.some(e=>e.isin||e.ticker||(e.subs&&e.subs.some(s=>s.isin||s.ticker)));
  if(!hasIds())return;
  // 1) Refresh au démarrage — mais seulement si le dernier date de plus de 6h
  //    (le garde-fou interne de triggerRefresh s'en charge).
  triggerRefresh();
  // 2) Refresh au retour sur l'onglet, encadré par le même garde-fou (6h).
  //    Plus de timer répétitif : inutile vu les cours de clôture quotidiens.
  if(!window._refocusBound){
    window._refocusBound=true;
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'&&hasIds())triggerRefresh();
    });
  }
}
// Résolution automatique quand l'utilisateur vient de saisir un ISIN valide.
// Ne se déclenche que pour un ISIN (pas un ticker partiel) afin d'éviter des
// appels inutiles, et récupère nom + prix pour confirmer que l'ETF est trouvé.
async function autoResolveEtf(i){
  const etf=state.etfs[i];if(!etf)return;
  // Seulement si on a un ISIN valide et pas encore de prix récupéré
  if(!etf.isin||!isISIN(etf.isin))return;
  if(etf.avgPrice>0&&etf.name)return; // déjà résolu / renseigné
  await resolveSingle(i);
}
window.autoResolveEtf=autoResolveEtf;
async function resolveSingle(i){
  const etf=state.etfs[i];if(!etf)return;
  const eid=etf.id;
  const btn=document.getElementById('resolve-btn-'+eid);
  if(btn){btn.textContent='…';btn.disabled=true;btn.style.color='';}
  const prevPrice=etf.avgPrice||0;
  const info=await fetchByEtf(etf);
  if(btn){btn.disabled=false;}
  if(!info||!info.price){
    if(btn){btn.textContent='✕';btn.style.color='var(--red)';setTimeout(()=>{if(btn){btn.textContent='⟳';btn.style.color='';}},2500);}
    showFetchError(eid,info?.msg||'Échec inconnu — réessaie dans un instant');
    return;
  }
  clearFetchError(eid);
  applyFetchResult(etf,i,info,true);
  save();
  // Mettre à jour les vues annexes SANS reconstruire la grille (sinon le ✓ disparaît)
  renderAllocOverview();updateHealthBar();renderPieChart();refreshFooterPrice(eid);
  // Feedback : ✓ vert, + petit message si le prix est resté identique
  if(btn){btn.textContent='✓';btn.style.color='var(--green)';setTimeout(()=>{if(btn){btn.textContent='⟳';btn.style.color='';}},2000);}
  const same=Math.abs((etf.avgPrice||0)-prevPrice)<0.0001;
  showFetchInfo(eid, same
    ? 'Prix à jour : '+etf.avgPrice.toFixed(2)+' € (inchangé depuis la dernière clôture)'
    : 'Prix mis à jour : '+etf.avgPrice.toFixed(2)+' € · '+(info.source||'Yahoo'));
}
// Message vert temporaire de succès sous la card
function showFetchInfo(eid,msg){
  clearFetchError(eid);
  const card=document.getElementById('etf-card-'+eid);if(!card)return;
  let el=document.getElementById('fetch-info-'+eid);
  if(!el){
    el=document.createElement('div');el.id='fetch-info-'+eid;
    el.style.cssText='font-size:10px;font-family:var(--mono);color:var(--green);margin-top:6px;padding:5px 8px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.25);border-radius:var(--r);line-height:1.4;';
    card.appendChild(el);
  }
  el.textContent='✓ '+msg;
  clearTimeout(el._t);
  el._t=setTimeout(()=>{if(el)el.remove();},4000);
}
// Affiche/efface un message d'erreur de fetch sous la card de l'ETF
function showFetchError(eid,msg){
  const info=document.getElementById('fetch-info-'+eid);if(info)info.remove();
  let el=document.getElementById('fetch-err-'+eid);
  if(!el){
    const footer=document.getElementById('footer-price-'+eid);
    const card=footer?footer.closest('.etf-card'):document.getElementById('etf-card-'+eid);
    if(!card)return;
    el=document.createElement('div');el.id='fetch-err-'+eid;
    el.style.cssText='font-size:10px;font-family:var(--mono);color:var(--amber);margin-top:6px;padding:5px 8px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);border-radius:var(--r);line-height:1.4;';
    card.appendChild(el);
  }
  el.textContent='⚠ '+msg;
}
function clearFetchError(eid){const el=document.getElementById('fetch-err-'+eid);if(el)el.remove();}
function renderSubChoices(){
  const groupEtfs=state.etfs.filter(e=>e.subs&&e.subs.length>0);
  const section=document.getElementById('sub-choice-section');
  if(!section)return;
  if(!groupEtfs.length){section.style.display='none';return;}
  if(!state.subChoices)state.subChoices={};
  let html='<div style="background:rgba(79,142,247,.06);border:1px solid rgba(79,142,247,.2);border-radius:var(--r);padding:10px 13px;">'
    +'<div style="font-size:10px;font-weight:600;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Sur quel émetteur investir ce mois-ci ?</div>';
  groupEtfs.forEach(etf=>{
    const chosen=state.subChoices[etf.id]??0;
    html+='<div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border);">'
      +'<div style="font-size:12px;font-weight:500;margin-bottom:6px;color:var(--text2);">'+etf.name+'</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:5px;">';
    etf.subs.forEach((sub,si)=>{
      const isChosen=chosen===si;
      const hasPrice=sub.avgPrice>0;
      html+='<button onclick="setSubChoice('+etf.id+','+si+')" style="'
        +'padding:5px 11px;border-radius:var(--r);font-size:11px;font-family:var(--mono);cursor:pointer;transition:all .15s;'
        +(isChosen
          ?'background:var(--accent);color:#fff;border:1px solid var(--accent);font-weight:600;'
          :'background:var(--bg3);color:var(--text3);border:1px solid var(--border2);')
        +'">'
        +(sub.name||sub.isin||'Émetteur '+(si+1))
        +(hasPrice?' · '+sub.avgPrice.toFixed(2)+' €':'')
        +(isChosen?' ✓':'')
        +'</button>';
    });
    html+='</div></div>';
  });
  html+='</div>';
  section.innerHTML=html;
  section.style.display='block';
}
window.setSubChoice=function(eid,si){
  if(!state.subChoices)state.subChoices={};
  state.subChoices[eid]=si;
  save();
  renderSubChoices();
};
let _posCheckDone=false;
// Faut-il proposer la vérification des positions ? Oui si on a déjà calculé un jour
// ET que le mois en cours diffère du mois du dernier calcul.
function shouldCheckPositions(){
  if(!state.lastCalcDate)return false; // jamais calculé → onboarding suffit
  if(!state.etfs.length)return false;
  const last=new Date(state.lastCalcDate);
  const now=new Date();
  const lastTag=last.getFullYear()+'-'+last.getMonth();
  const nowTag=now.getFullYear()+'-'+now.getMonth();
  return lastTag!==nowTag; // mois différent
}
function openPosCheck(){
  const list=document.getElementById('poscheck-list');
  list.innerHTML=state.etfs.map((e,i)=>{
    const color=COLORS[i%COLORS.length];
    if(e.subs&&e.subs.length){
      return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:9px 11px;">'
        +'<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;"><span style="width:8px;height:8px;border-radius:50%;background:'+color+';display:inline-block;"></span><span style="font-size:12px;font-weight:600;">'+e.name+'</span></div>'
        +e.subs.map((s,si)=>'<div style="display:flex;align-items:center;gap:8px;margin-top:4px;"><span style="font-size:11px;color:var(--text2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(s.name||s.isin||'Émetteur '+(si+1))+'</span><input type="number" min="0" step="0.0001" value="'+(s.shares||0)+'" id="pc-sub-'+e.id+'-'+si+'" style="width:90px;text-align:right;padding:5px 8px;height:30px;font-size:12px;"/></div>').join('')
        +'</div>';
    }
    return '<div style="display:flex;align-items:center;gap:8px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:9px 11px;">'
      +'<span style="width:8px;height:8px;border-radius:50%;background:'+color+';display:inline-block;flex-shrink:0;"></span>'
      +'<span style="font-size:12px;font-weight:500;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+e.name+'</span>'
      +'<input type="number" min="0" step="0.0001" value="'+(e.shares||0)+'" id="pc-'+e.id+'" style="width:90px;text-align:right;padding:5px 8px;height:30px;font-size:12px;"/>'
      +'<span style="font-size:11px;font-family:var(--mono);color:var(--text3);">parts</span>'
      +'</div>';
  }).join('');
  document.getElementById('poscheck-overlay').style.display='flex';
}
function closePosCheck(){document.getElementById('poscheck-overlay').style.display='none';}
function confirmPosCheck(){
  // Lire les valeurs saisies et mettre à jour les positions
  let changed=false;
  state.etfs.forEach(e=>{
    if(e.subs&&e.subs.length){
      e.subs.forEach((s,si)=>{
        const inp=document.getElementById('pc-sub-'+e.id+'-'+si);
        if(inp){const v=+inp.value||0;if(v!==s.shares){s.shares=v;changed=true;}}
      });
    } else {
      const inp=document.getElementById('pc-'+e.id);
      if(inp){const v=+inp.value||0;if(v!==e.shares){e.shares=v;changed=true;}}
    }
  });
  if(changed)save();
  closePosCheck();
  _posCheckDone=true; // éviter de rouvrir le modal en boucle
  syncAllViews&&syncAllViews();
  renderEtfGrid();
  calculate(); // reprendre le calcul avec les positions confirmées
}
async function calculate(){
  // Garde-fou : aucun ETF → rien à calculer. Message clair, pas de plantage.
  if(!state.etfs||state.etfs.length===0){
    await confirmModal('Tu n\'as pas encore d\'ETF dans ton portefeuille. Ajoute au moins un ETF avec une allocation cible avant de calculer ton plan.',{okText:'Aller à mon portefeuille',cancelText:'Plus tard'}).then(go=>{if(go)nav('portfolio');});
    return;
  }
  const total=state.etfs.reduce((s,e)=>s+(+e.target||0),0);
  // Tolérance de 0,5 % pour les arrondis. Sinon, message clair + possibilité de continuer.
  if(Math.abs(total-100)>0.5){
    const diff=total-100;
    const msg=total===0
      ?'Tu n\'as pas encore défini d\'allocations cibles. Indique le pourcentage souhaité pour chaque ETF (la somme doit faire 100 %).'
      :'La somme de tes allocations cibles fait <strong>'+total.toFixed(1)+' %</strong> au lieu de 100 % ('
        +(diff>0?'+':'')+diff.toFixed(1)+' %).<br><br>Pour une répartition cohérente, ajuste tes cibles pour atteindre 100 %. Tu peux quand même calculer, mais le plan visera une cible incohérente.';
    const proceed=await confirmModal(msg,{okText:'Calculer quand même',cancelText:'Corriger mes cibles',danger:false,html:true});
    if(!proceed){nav('portfolio');return;}
  }
  // Vérification des positions au changement de mois (sauf si on revient du modal)
  if(!_posCheckDone&&shouldCheckPositions()){
    openPosCheck();
    return; // le calcul reprendra après confirmation via confirmPosCheck()
  }
  _posCheckDone=false; // réinitialiser pour le prochain mois
  syncSettingsFromInputs();
  if(!state.subChoices)state.subChoices={};
  const btn=document.getElementById('btn-calc');btn.disabled=true;btn.textContent='Calcul…';btn.classList.add('calculating');
  setCalcStatus('live','Récupération des prix…');
  try{
  const pm=await fetchAllBatch();

  const missingPrices=state.etfs.filter(e=>{
    if(e.subs&&e.subs.length)return e.subs.some(s=>!(s.avgPrice>0));
    return !((pm[e.id]?.price||e.avgPrice)>0);
  });
  if(missingPrices.length){
    setCalcStatus('','⚠ Prix manquants — saisis-les dans « Mon portefeuille » (les prix se récupèrent sinon automatiquement)');
  }
  const getTicker=e=>{
    if(e.subs&&e.subs.length>0){const si=state.subChoices[e.id]??0;const sub=e.subs[si];return sub?.ticker||sub?.isin||'';}
    return e.ticker||'';
  };
  const getDisplayName=e=>{
    if(e.subs&&e.subs.length>0){const si=state.subChoices[e.id]??0;const sub=e.subs[si];return (sub?.name||sub?.isin||e.name)+' ('+e.name+')';}
    return e.name;
  };
  // Prix fetchés utilisés UNIQUEMENT pour le calcul — on ne modifie PAS avgPrice ici
  // (applyFetchResult ne doit être appelé que depuis triggerRefresh ou resolveSingle)
  const getLivePrice=e=>{
    if(e.subs&&e.subs.length>0){const si=state.subChoices[e.id]??0;return e.subs[si]?.avgPrice||0;}
    return pm[e.id]?.price||e.avgPrice||0;
  };
  // Valeur actuelle d'un ETF AU PRIX DE MARCHÉ FRAIS (pas avgPrice figé).
  // Crucial : si un ETF a monté, sa vraie valeur de marché doit être prise en
  // compte pour détecter la sur-pondération et rééquilibrer correctement.
  // Utiliser avgPrice (prix d'achat figé) ferait dériver la répartition.
  const liveValue=e=>{
    if(e.subs&&e.subs.length>0){
      const si=state.subChoices[e.id]??0;
      // valeur totale du groupe au prix de marché : on valorise toutes les parts
      // détenues de chaque sous-ETF à leur prix courant
      return e.subs.reduce((s,sub)=>s+(sub.shares||0)*(sub.avgPrice||0),0);
    }
    const liveP=pm[e.id]?.price||e.avgPrice||0;
    return (e.shares||0)*liveP;
  };
  const budget=state.monthly+(state.deferredCash||0);
  const curTotal=state.etfs.reduce((s,e)=>s+liveValue(e),0);
  // Cible : où chaque ETF devrait être APRÈS avoir investi le budget de ce mois.
  // Folia vise toujours la cible au plus vite (le cash en réserve s'investit dès
  // qu'une part devient achetable sans dépasser la cible).
  const targetTotal=curTotal+budget;

  const etfData=state.etfs.map(e=>({
    ...e,
    price:getLivePrice(e),
    ticker:getTicker(e),
    displayName:getDisplayName(e),
    currentValue:liveValue(e), // valeur au prix de marché frais — permet le rééquilibrage
    idealValue:(e.target/100)*targetTotal // valeur cible en euros (fixe pendant tout le calcul)
  }));

  // ── Algorithme : minimisation de la distance aux valeurs cibles ──
  //
  // Objectif : déployer le budget de façon à rapprocher le portefeuille
  // au maximum de la répartition cible (en euros), en achetant des parts
  // entières. À chaque étape on achète la part qui réduit le PLUS la
  // distance totale entre la valeur de chaque ETF et sa valeur idéale.
  //
  // Conséquences naturelles et voulues :
  //  • un ETF sous-pondéré est priorisé jusqu'à atteindre sa cible
  //  • on n'achète jamais un ETF au-delà de sa cible (ça augmenterait la distance)
  //  • un ETF cher dont l'achat ferait dépasser sa cible est reporté ;
  //    le cash s'accumule jusqu'à ce que son achat rapproche de la cible
  //  • sur le long terme la répartition converge et se maintient à la cible

  let remaining=budget;
  const purchases={};
  etfData.forEach(e=>{purchases[e.id]=0;});

  const distFor=e=>Math.abs((e.currentValue+purchases[e.id]*e.price)-e.idealValue);
  const totalDist=()=>etfData.reduce((s,e)=>s+distFor(e),0);

  let changed=true;
  while(changed){
    changed=false;
    const affordable=etfData.filter(e=>e.price>0&&e.price<=remaining);
    if(!affordable.length)break;
    let best=null;let bestDist=Infinity;
    const curDist=totalDist();
    for(const e of affordable){
      const before=distFor(e);
      const after=Math.abs((e.currentValue+(purchases[e.id]+1)*e.price)-e.idealValue);
      const newTotal=curDist-before+after;
      if(newTotal<bestDist){bestDist=newTotal;best=e;}
    }
    // N'acheter que si ça réduit STRICTEMENT la distance totale à la cible
    if(best&&bestDist<curDist-0.001){
      purchases[best.id]+=1;
      remaining-=best.price;
      changed=true;
    }
  }

  const decisions=etfData.map(etf=>{
    const s=purchases[etf.id];
    if(s>0)return{...etf,shares_to_buy:s,spent:s*etf.price,action:'buy'};
    if(!etf.price)return{...etf,shares_to_buy:0,spent:0,action:'noPrice'};
    // Pas acheté : soit déjà à/au-dessus de la cible, soit reporté
    const underweight=etf.currentValue<etf.idealValue-0.5;
    if(!underweight)return{...etf,shares_to_buy:0,spent:0,action:'overweight'};
    // Sous-pondéré mais pas acheté → reporté. Trois raisons honnêtes et distinctes :
    const deferredMonths=(state._deferCounters&&state._deferCounters[etf.id])||0;
    let deferKind,reason,monthsNeeded=0;
    if(etf.price<=remaining){
      // (a) On a le cash ET la part est abordable, mais l'algo ne l'a pas achetée :
      //     c'est que l'acheter éloignerait de la cible → report d'ÉQUILIBRE.
      deferKind='balance';
      reason='Cet ETF est déjà proche ou au-dessus de sa cible. Il ne sera renforcé que lorsque les autres auront rattrapé, pour respecter ta répartition.';
    } else if(etf.price>budget){
      // (b) La part coûte plus que TOUT le budget du mois (réserve incluse) →
      //     question d'argent : le cash doit s'accumuler plusieurs mois.
      deferKind='budget';
      const shortfall=etf.price-remaining;
      monthsNeeded=state.monthly>0?Math.max(1,Math.ceil(shortfall/state.monthly)):0;
      reason='Part à '+etf.price.toFixed(0)+' €, au-dessus du budget de ce mois. '+remaining.toFixed(0)+' € déjà mis en réserve pour cet achat.';
    } else {
      // (c) Abordable dans l'absolu, mais le budget de CE mois est déjà engagé
      //     ailleurs (priorité au rééquilibrage). Reste en réserve.
      deferKind='accumulating';
      reason='Le budget de ce mois a été dirigé en priorité vers d\'autres ETF plus éloignés de leur cible. '+remaining.toFixed(0)+' € reportés pour le prochain achat.';
    }
    return{...etf,shares_to_buy:0,spent:0,action:'defer',reason,deferKind,monthsNeeded,deferredMonths:deferredMonths+1};
  });
  const totalSpent=budget-remaining;
  state.lastCalcDate=new Date().toISOString();
  // IMPORTANT : on ne modifie PAS state.deferredCash ici.
  // Le calcul doit être déterministe — recalculer ne doit jamais changer le plan.
  // Le cash reporté n'est mis à jour qu'à la CONFIRMATION des ordres.
  const newTotal=etfData.reduce((s,e)=>s+e.currentValue,0)+totalSpent;
  const results=decisions.map(d=>({...d,newPct:newTotal>0?((d.currentValue+d.spent)/newTotal*100):0}));
  state.pendingOrders={results,budget,totalSpent,remaining,newTotal,date:new Date().toISOString()};
  save();
  renderPlanOrders(state.pendingOrders);
  document.getElementById('confirm-card').classList.add('visible');
  renderConfirmList(state.pendingOrders);
  renderAllocOverview();updateHealthBar();renderEtfGrid();updateOnboarding();
  setCalcStatus(totalSpent>0?'live':'','Calcul terminé');
  const dn=document.getElementById('deferred-notice');
  if(remaining>0.5){
    // Identifier vers quel(s) ETF la réserve s'accumule : les sous-pondérés
    // non achetés ce mois, classés par écart à la cible (le plus loin d'abord).
    const waiting=decisions
      .filter(d=>d.action==='defer'||(d.action!=='buy'&&d.currentValue<d.idealValue-0.5))
      .map(d=>({name:d.displayName||d.name,price:d.price,gap:d.idealValue-d.currentValue}))
      .sort((a,b)=>b.gap-a.gap);
    let txt='⏳ '+remaining.toFixed(2)+' € mis en réserve';
    if(waiting.length){
      const tgt=waiting[0];
      // Combien de mois encore avant d'atteindre le prix de la part (au rythme actuel) ?
      const monthsToAfford=tgt.price>remaining&&state.monthly>0
        ?Math.ceil((tgt.price-remaining)/state.monthly):0;
      txt+=' — en attente pour <strong>'+tgt.name+'</strong>';
      if(monthsToAfford>0)txt+=' (part à '+tgt.price.toFixed(0)+' €, atteignable dans ~'+monthsToAfford+' mois)';
      else txt+=' (achetable dès le prochain calcul)';
    }
    txt+='. Ce cash s\'accumule jusqu\'à pouvoir acheter sans casser ta répartition cible.';
    dn.style.display='block';dn.innerHTML=txt;
  }else dn.style.display='none';
  }catch(err){
    setCalcStatus('','Erreur : '+(err.message||err));
    console.error('calculate error:',err);
  }finally{
    btn.disabled=false;btn.textContent='⟳ Calculer le plan';btn.classList.remove('calculating');
  }
}
function renderPlanOrders(pending){
  const el=document.getElementById('plan-orders');
  const sub=document.getElementById('plan-sub');
  const {results,budget,totalSpent,remaining}=pending;

  const buys=results.filter(d=>d.action==='buy');
  const deferred=results.filter(d=>d.action==='defer'||d.action==='noPrice');
  const overweight=results.filter(d=>d.action==='overweight');

  if(sub)sub.textContent='Budget '+budget.toFixed(0)+' € · Investi '+totalSpent.toFixed(2)+' €'+(remaining>0?' · '+remaining.toFixed(2)+' € reportés':'');

  let html='';

  // ── Résumé ───────────────────────────────────────────────────────
  // Frais : un ordre ponctuel par ETF acheté ce mois (selon le courtier).
  const feePer=state.feePerOrder!=null?state.feePerOrder:1;
  const totalFees=feePer>0?buys.length*feePer:0;
  html+='<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:10px 13px;margin-bottom:12px;display:flex;gap:16px;flex-wrap:wrap;">'
    +'<div><div style="font-size:10px;color:var(--text3);font-family:var(--mono);">À INVESTIR</div><div style="font-size:17px;font-weight:600;font-family:var(--mono);color:var(--green);">'+totalSpent.toFixed(2)+' €</div></div>'
    +'<div><div style="font-size:10px;color:var(--text3);font-family:var(--mono);">BUDGET</div><div style="font-size:17px;font-weight:600;font-family:var(--mono);">'+budget.toFixed(0)+' €</div></div>'
    +(remaining>0?'<div><div style="font-size:10px;color:var(--text3);font-family:var(--mono);">REPORTÉ</div><div style="font-size:17px;font-weight:600;font-family:var(--mono);color:var(--amber);">'+remaining.toFixed(2)+' €</div></div>':'')
    +'<div><div style="font-size:10px;color:var(--text3);font-family:var(--mono);">ORDRES</div><div style="font-size:17px;font-weight:600;font-family:var(--mono);">'+buys.length+'</div></div>'
    +(totalFees>0?'<div><div style="font-size:10px;color:var(--text3);font-family:var(--mono);">FRAIS EST.</div><div style="font-size:17px;font-weight:600;font-family:var(--mono);color:var(--text2);">'+totalFees.toFixed(2)+' €</div></div>':'')
    +'</div>';
  const _staggered=(state.freq==='weekly'||state.freq==='biweekly'); // modes étalés (hebdo/bimensuel)
  if(totalFees>0&&!_staggered){
    html+='<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin:-6px 0 12px;line-height:1.4;">Coût total estimé : <strong>'+(totalSpent+totalFees).toFixed(2)+' €</strong> ('+buys.length+' ordre'+(buys.length>1?'s':'')+' × '+feePer.toFixed(2)+' € de frais). Les frais ne sont pas investis.</div>';
  }

  // ── Ordres à passer (MODE MENSUEL uniquement) ────────────────────
  if(buys.length&&!_staggered){
    html+='<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;margin-top:4px;display:flex;align-items:center;gap:6px;">'
      +'<span style="width:3px;height:11px;background:var(--green);border-radius:2px;display:inline-block;"></span>À acheter maintenant</div>';
    buys.forEach((d,i)=>{
      const color=COLORS[results.indexOf(d)%COLORS.length];
      html+='<div style="background:rgba(52,211,153,.05);border:1px solid rgba(52,211,153,.15);border-radius:var(--r);padding:11px 13px;margin-bottom:7px;">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">'
        +'<div style="display:flex;align-items:center;gap:8px;">'
        +'<span style="width:9px;height:9px;border-radius:50%;background:'+color+';display:inline-block;flex-shrink:0;"></span>'
        +'<span style="font-size:13px;font-weight:600;">'+( d.displayName||d.name)+'</span>'
        +'</div>'
        +'<span style="font-size:15px;font-weight:700;font-family:var(--mono);color:var(--green);">'+d.spent.toFixed(2)+' €</span>'
        +'</div>'
        +'<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:11px;font-family:var(--mono);color:var(--text3);">'
        +'<span>'+d.shares_to_buy+' part'+(d.shares_to_buy>1?'s':'')+' × '+d.price.toFixed(2)+' €</span>'
        +'<span>→ '+d.newPct.toFixed(1)+'% du portef. <span style="color:var(--text3);">(cible '+d.target+'%)</span></span>'
        +'</div>'
        +'</div>';
    });
  }

  // ── Plan étalé (si fréquence = hebdo ou bimensuelle) ──────────────
  if((state.freq==='weekly'||state.freq==='biweekly')&&buys.length){
    const isWeekly=state.freq==='weekly';
    const weeks=isWeekly?4:2;            // 4 versements/mois (hebdo) ou 2 (bimensuel)
    const perLabel=isWeekly?'semaine':'quinzaine';   // "/ semaine" ou "/ quinzaine"
    const perAdj=isWeekly?'hebdomadaire':'bimensuel'; // pour les textes d'aide
    const {weekly,single,weeklyTotal}=buildWeeklyPlan(buys,weeks);

    // ── Bloc 1 : ordres programmés (sans frais) ──
    if(weekly.length){
      html+='<div style="margin:14px 0 6px;"><div class="info-row" style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;">'
        +'<span style="width:3px;height:11px;background:var(--accent);border-radius:2px;display:inline-block;"></span>À programmer chaque '+perLabel
        +'<span class="info-ic" onclick="toggleInfo(this)">i</span></div>'
        +'<div class="info-tip">Ordres programmés chez ton courtier. Le montant achète le maximum de parts entières possible chaque '+perLabel+'.</div></div>';
      weekly.forEach(e=>{
        html+='<div style="background:rgba(79,142,247,.04);border:1px solid rgba(79,142,247,.15);border-radius:var(--r);padding:11px 13px;margin-bottom:7px;">'
          +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">'
          +'<span style="width:9px;height:9px;border-radius:50%;background:'+e.color+';display:inline-block;flex-shrink:0;"></span>'
          +'<span style="font-size:13px;font-weight:600;flex:1;">'+e.name+'</span>'
          +'</div>'
          +'<div style="display:flex;align-items:baseline;gap:6px;margin-bottom:5px;">'
          +'<span style="font-size:22px;font-weight:700;font-family:var(--mono);color:var(--accent);">'+e.weeklyEur.toFixed(2)+' €</span>'
          +'<span style="font-size:12px;color:var(--text2);">/ '+perLabel+'</span>'
          +'<span style="font-size:11px;font-family:var(--mono);color:var(--text3);margin-left:auto;">≈ '+e.approxShares.toFixed(1)+' part'+(e.approxShares>=2?'s':'')+'/'+perLabel+'</span>'
          +'</div>'
          +'<div style="font-size:10px;font-family:var(--mono);color:var(--text3);line-height:1.4;border-top:1px solid var(--border);padding-top:6px;">'
          +'Sur le mois : '+e.monthlyEur.toFixed(2)+' € dans cet ETF'
          +'</div>'
          +'</div>';
      });
      html+='<div style="font-size:11px;font-family:var(--mono);color:var(--text2);margin-top:4px;padding:8px 11px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);">'
        +'Total programmé : <strong>'+weeklyTotal.toFixed(2)+' € / '+perLabel+'</strong>'
        +'</div>';
    }

    // ── Bloc 2 : achats uniques ce mois (ETF chers, non étalables) ──
    if(single.length){
      html+='<div style="margin:16px 0 6px;"><div class="info-row" style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;">'
        +'<span style="width:3px;height:11px;background:var(--green);border-radius:2px;display:inline-block;"></span>À acheter en une fois ce mois-ci'
        +'<span class="info-ic" onclick="toggleInfo(this)">i</span></div>'
        +'<div class="info-tip">Ces ETF sont trop chers pour un étalement '+perAdj+' (moins d\'une part par '+perLabel+'). Achète-les en un seul ordre ponctuel en début de mois. Des frais peuvent s\'appliquer sur cet ordre selon ton courtier.</div></div>';
      single.forEach(e=>{
        html+='<div style="background:rgba(52,211,153,.04);border:1px solid rgba(52,211,153,.18);border-radius:var(--r);padding:11px 13px;margin-bottom:7px;">'
          +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">'
          +'<span style="width:9px;height:9px;border-radius:50%;background:'+e.color+';display:inline-block;flex-shrink:0;"></span>'
          +'<span style="font-size:13px;font-weight:600;flex:1;">'+e.name+'</span>'
          +'</div>'
          +'<div style="display:flex;align-items:baseline;gap:6px;margin-bottom:5px;">'
          +'<span style="font-size:22px;font-weight:700;font-family:var(--mono);color:var(--green);">'+e.shares+'</span>'
          +'<span style="font-size:12px;color:var(--text2);">part'+(e.shares>1?'s':'')+' en une fois</span>'
          +'<span style="font-size:11px;font-family:var(--mono);color:var(--text3);margin-left:auto;">'+e.monthlyEur.toFixed(2)+' €'+(e.fee>0?' + '+e.fee.toFixed(2)+' € frais':'')+' = '+e.totalCost.toFixed(2)+' €</span>'
          +'</div>'
          +'<div style="font-size:10px;font-family:var(--mono);color:var(--text3);line-height:1.4;border-top:1px solid var(--border);padding-top:6px;">'
          +'Prix unitaire '+e.price.toFixed(2)+' €'
          +'</div>'
          +'</div>';
      });
    }

    html+='<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:7px;line-height:1.45;">'
      +'⚠ En PEA, seules les parts entières sont achetées. Les montants par '+perLabel+' sont calculés pour atteindre, sur le mois, exactement les achats prévus ci-dessus.</div>';
  }

  // ── Reportés ──────────────────────────────────────────────────────
  if(deferred.length){
    html+='<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;margin-top:10px;display:flex;align-items:center;gap:6px;">'
      +'<span style="width:3px;height:11px;background:var(--amber);border-radius:2px;display:inline-block;"></span>Reportés</div>';
    deferred.forEach(d=>{
      const color=COLORS[results.indexOf(d)%COLORS.length];
      // N'afficher une estimation de délai QUE pour les reports liés au budget
      // (et seulement si elle est fiable). Jamais pour les reports d'équilibre,
      // qui n'ont pas d'échéance prévisible.
      let monthsMsg='';
      if(d.deferKind==='budget'&&d.monthsNeeded>0){
        monthsMsg=d.monthsNeeded===1
          ?'Si rien ne change par ailleurs, atteignable le mois prochain'
          :'En continuant d\'accumuler, atteignable dans ~'+d.monthsNeeded+' mois';
      }
      const label=d.action==='noPrice'?'Prix manquant'
        :d.deferKind==='balance'?'En attente d\'équilibre'
        :d.deferKind==='budget'?'En réserve'
        :'Reporté';
      const icon=d.action==='noPrice'?'⚠':(d.deferKind==='balance'?'⚖':'⏳');
      html+='<div style="background:rgba(251,191,36,.04);border:1px solid rgba(251,191,36,.15);border-radius:var(--r);padding:10px 13px;margin-bottom:7px;">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        +'<div style="display:flex;align-items:center;gap:8px;">'
        +'<span style="width:9px;height:9px;border-radius:50%;background:'+color+';display:inline-block;flex-shrink:0;"></span>'
        +'<span style="font-size:13px;font-weight:500;color:var(--text2);">'+( d.displayName||d.name)+'</span>'
        +'</div>'
        +'<span style="font-size:11px;font-family:var(--mono);color:var(--amber);">'+icon+' '+label+'</span>'
        +'</div>'
        +'<div style="font-size:11px;font-family:var(--mono);color:var(--text3);line-height:1.45;">'+d.reason
        +(monthsMsg?'<br><span style="color:var(--text2);">'+monthsMsg+'</span>':'')
        +'</div>'
        +'</div>';
    });
  }

  // ── Surpondérés ───────────────────────────────────────────────────
  if(overweight.length){
    html+='<div style="margin-bottom:6px;margin-top:10px;"><div class="info-row" style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;">'
      +'<span style="width:3px;height:11px;background:var(--text3);border-radius:2px;display:inline-block;"></span>Déjà à cible ou surpondérés'
      +'<span class="info-ic" onclick="toggleInfo(this)">i</span></div>'
      +'<div class="info-tip">Ces ETF ne sont pas achetés ce mois-ci car ils ont déjà atteint (ou dépassé) leur part cible. Le budget va en priorité vers les ETF sous-pondérés, pour rééquilibrer vers ta répartition voulue sans jamais vendre.</div></div>';
    overweight.forEach(d=>{
      const color=COLORS[results.indexOf(d)%COLORS.length];
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);opacity:.6;">'
        +'<span style="width:7px;height:7px;border-radius:50%;background:'+color+';display:inline-block;flex-shrink:0;"></span>'
        +'<span style="font-size:12px;color:var(--text2);">'+d.name+'</span>'
        +'<span style="font-size:11px;font-family:var(--mono);color:var(--text3);margin-left:auto;">'+d.newPct.toFixed(1)+'% / cible '+d.target+'%</span>'
        +'</div>';
    });
  }

  el.innerHTML=html||'<div style="text-align:center;padding:1rem;font-size:12px;color:var(--text3);font-family:var(--mono);">Aucun ordre à passer ce mois-ci.</div>';
  // Cascade d'apparition (effet 2) : les blocs directs s'animent en décalé.
  if(!_reduceMotion){
    const blocks=Array.from(el.children).filter(c=>c.nodeType===1);
    blocks.forEach((b,i)=>{
      b.classList.add('block-in');
      b.style.animationDelay=Math.min(i*45,360)+'ms';
    });
  }
}
function renderConfirmList(pending){
  const el=document.getElementById('confirm-orders-list');const buys=pending.results.filter(d=>d.action==='buy');
  el.innerHTML=buys.map(d=>'<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);"><span style="font-size:12px;">'+(d.displayName||d.name)+'</span><span style="font-size:12px;font-family:var(--mono);font-weight:600;color:var(--green);">'+d.shares_to_buy+'× · '+d.spent.toFixed(2)+' €</span></div>').join('');
}
// Plan hebdomadaire — PRÉSENTE les achats déjà décidés par calculate() (parts entières,
// réserve, etc.). Ne recalcule JAMAIS les parts : il répartit ou regroupe l'affichage.
// Un ETF n'apparaît que dans UNE seule section.
function buildWeeklyPlan(buys,weeks){
  const weekly=[],single=[];
  buys.forEach(d=>{
    const shares=d.shares_to_buy;        // parts décidées par calculate() (vérité)
    const price=d.price;
    const monthlyEur=d.spent;            // = shares * price
    const color=COLORS_INDEX(d);
    const name=d.displayName||d.name;
    // Étalable seulement si on achète au moins autant de parts que de versements
    // (≈ 1 part par versement : 4 en hebdo, 2 en bimensuel).
    if(shares>=weeks){
      const weeklyEur=monthlyEur/weeks;
      single.length; // no-op lisibilité
      weekly.push({name,color,price,monthlyEur,weeklyEur,shares,approxShares:weeklyEur/price});
    } else {
      // 1 à 3 parts sur le mois → achat ponctuel unique. Frais selon le courtier.
      const fee=state.feePerOrder!=null?state.feePerOrder:1;
      const totalCost=monthlyEur+fee;
      single.push({name,color,price,monthlyEur,shares,fee,totalCost});
    }
  });
  const weeklyTotal=weekly.reduce((s,e)=>s+e.weeklyEur,0);
  return {weekly,single,weeks,weeklyTotal};
}
function COLORS_INDEX(d){
  const r=state.pendingOrders?.results||[];
  const idx=r.indexOf(d);
  return COLORS[(idx>=0?idx:0)%COLORS.length];
}
function confirmOrders(){
  if(!state.pendingOrders)return;
  pushUndo('validation des achats du mois');
  const {results,totalSpent,newTotal,remaining,date}=state.pendingOrders;
  const orders=results.filter(d=>d.action==='buy').map(d=>{
    // Retrouver l'ISIN depuis state.etfs pour le lien JustETF
    const etf=state.etfs.find(e=>e.id===d.id);
    const isin=etf?.isin||(etf?.subs&&etf.subs[state.subChoices?.[d.id]??0]?.isin)||'';
    return{name:d.displayName||d.name,ticker:d.ticker,isin,shares:d.shares_to_buy,price:d.price,spent:d.spent};
  });
  if(orders.length){
    state.history.unshift({date,orders,totalSpent,portfolioValue:newTotal,deferred:remaining,confirmed:true});
    state.etfs.forEach(e=>{
      const d=results.find(x=>x.id===e.id);
      if(d&&d.action==='buy'){
        if(e.subs&&e.subs.length){
          // ETF groupé : créditer le sous-ETF (émetteur) choisi ce mois-ci
          const si=state.subChoices?.[e.id]??0;
          const sub=e.subs[si]||e.subs[0];
          if(sub){
            sub.shares=+(((sub.shares||0)+d.shares_to_buy)).toFixed(4);
            if(d.price>0)sub.avgPrice=d.price;
          }
        } else {
          e.shares=+(e.shares+d.shares_to_buy).toFixed(4);
          if(d.price>0)e.avgPrice=d.price;
        }
      }
    });
  }
  // Mettre à jour les compteurs de report (pour la logique "Report max")
  if(!state._deferCounters)state._deferCounters={};
  results.forEach(d=>{
    if(d.action==='buy'){
      state._deferCounters[d.id]=0;              // acheté → compteur remis à zéro
    } else if(d.action==='defer'){
      state._deferCounters[d.id]=(state._deferCounters[d.id]||0)+1; // reporté → +1
    }
  });
  // Le cash reporté devient réel maintenant que les ordres sont confirmés
  state.deferredCash=remaining;
  state.pendingOrders=null;save();
  document.getElementById('confirm-card').classList.remove('visible');
  const dn=document.getElementById('deferred-notice');if(dn)dn.style.display='none';
  // Rafraîchir TOUTES les vues (parts, camembert, répartition, santé, historique…)
  renderEtfGrid();renderAllocOverview();renderPieChart();renderQuickUpdate();renderMonthly();renderHistory();updateHealthBar();updateOnboarding();
  // Afficher le bouton « Annuler la validation » (contextuel, juste après validation)
  const uvb=document.getElementById('undo-validation-btn');if(uvb)uvb.style.display='block';
}
function skipConfirm(){
  if(!state.pendingOrders)return;
  const {results,totalSpent,newTotal,remaining,date}=state.pendingOrders;
  const orders=results.filter(d=>d.action==='buy').map(d=>{
    const etf=state.etfs.find(e=>e.id===d.id);
    const isin=etf?.isin||(etf?.subs&&etf.subs[state.subChoices?.[d.id]??0]?.isin)||'';
    return{name:d.displayName||d.name,ticker:d.ticker,isin,shares:d.shares_to_buy,price:d.price,spent:d.spent};
  });
  if(orders.length)state.history.unshift({date,orders,totalSpent,portfolioValue:newTotal,deferred:remaining,confirmed:false});
  state.pendingOrders=null;save();
  document.getElementById('confirm-card').classList.remove('visible');
  const dn=document.getElementById('deferred-notice');if(dn)dn.style.display='none';
  renderMonthly();renderHistory();
}
function setCalcStatus(type,msg){document.getElementById('calc-dot').className='status-dot'+(type==='live'?' live':'');document.getElementById('calc-status').textContent=msg;}
function syncSettingsFromInputs(){state.monthly=+document.getElementById('monthly').value||500;save();}
function openSettings(){document.getElementById('settings-overlay').style.display='flex';}
function closeSettings(){document.getElementById('settings-overlay').style.display='none';}
function _dataIoStatus(msg,color){const el=document.getElementById('data-io-status');if(el){el.style.color=color||'var(--text3)';el.textContent=msg;}}
// Exporter toutes les données dans un fichier de sauvegarde JSON téléchargeable
function exportData(){
  try{
    const payload={app:'Folia',type:'folia-backup',version:1,exportedAt:new Date().toISOString(),state:state};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    const d=new Date().toISOString().slice(0,10);
    a.href=url;a.download='folia-sauvegarde-'+d+'.json';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    _dataIoStatus('✓ Sauvegarde téléchargée','var(--green)');
  }catch(e){_dataIoStatus('✕ Échec de l\'export','var(--red)');}
}
// Applique un "state" importé (depuis un fichier OU depuis la synchro par code).
// Remplace les données actuelles, sauvegarde et rafraîchit tout l'affichage.
// Renvoie true si appliqué, false si le state est invalide.
function applyImportedState(incoming){
  if(!incoming||typeof incoming!=='object'||!Array.isArray(incoming.etfs))return false;
  // Fusionner sur DEFAULT_STATE pour garantir toutes les clés attendues
  const fresh=JSON.parse(JSON.stringify(DEFAULT_STATE));
  const merged=Object.assign(fresh,incoming);
  Object.keys(state).forEach(k=>delete state[k]);
  Object.assign(state,merged);
  uiMode=state.uiMode||'simple';
  save();
  // Re-render complet
  document.getElementById('monthly').value=state.monthly;
  document.getElementById('freq').value=state.freq||'monthly';
  document.getElementById('fee-per-order').value=state.feePerOrder!=null?state.feePerOrder:1;
  document.getElementById('reminder-day').value=state.reminderDay||1;
  document.getElementById('drift-alert').value=state.driftAlert||8;
  if(typeof renderDayPicker==='function')renderDayPicker();
  renderEtfGrid();renderAllocOverview();renderPieChart();updateHealthBar();renderQuickUpdate();renderMonthly();renderHistory();updateOnboarding();updateProj();
  startAutoRefresh();
  return true;
}
// Importer une sauvegarde JSON (remplace les données actuelles après confirmation)
function importData(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=async e=>{
    let parsed=null;
    try{parsed=JSON.parse(e.target.result);}catch(_){_dataIoStatus('✕ Fichier illisible (JSON invalide)','var(--red)');return;}
    // Accepter soit notre format {type:'folia-backup',state:...}, soit un state brut
    const incoming=(parsed&&parsed.type==='folia-backup'&&parsed.state)?parsed.state:parsed;
    if(!incoming||typeof incoming!=='object'||!Array.isArray(incoming.etfs)){
      _dataIoStatus('✕ Ce fichier n\'est pas une sauvegarde Folia valide','var(--red)');
      return;
    }
    if(!await confirmModal('Importer cette sauvegarde ? Tes données actuelles seront remplacées.',{okText:'Importer'}))return;
    pushUndo('import d\'une sauvegarde');
    try{
      applyImportedState(incoming);
      _dataIoStatus('✓ Sauvegarde importée avec succès','var(--green)');
    }catch(err){_dataIoStatus('✕ Échec de l\'import','var(--red)');}
  };
  reader.onerror=()=>_dataIoStatus('✕ Impossible de lire le fichier','var(--red)');
  reader.readAsText(file,'utf-8');
}

// ── Import avec choix du périmètre (DCA / Cashflow / les deux) ──
// Clés appartenant au Cashflow ; tout le reste = DCA.
const CF_KEYS=['cashflow','_cfSeeded'];
// Applique un state importé en ne touchant qu'au périmètre choisi.
function applyImportedScoped(incoming,scope){
  if(!incoming||typeof incoming!=='object')return false;
  if(scope==='both'){return applyImportedState(incoming);} // remplace tout (exige etfs)
  if(scope==='cashflow'){
    if(!incoming.cashflow||typeof incoming.cashflow!=='object')return false;
    state.cashflow=JSON.parse(JSON.stringify(incoming.cashflow));
    if(incoming._cfSeeded!=null)state._cfSeeded=incoming._cfSeeded; else state._cfSeeded=true;
    save();
    if(typeof renderCashflow==='function')renderCashflow();
    return true;
  }
  if(scope==='dca'){
    if(!Array.isArray(incoming.etfs))return false;
    // On copie toutes les clés SAUF celles du Cashflow (qu'on préserve)
    const fresh=JSON.parse(JSON.stringify(DEFAULT_STATE));
    const merged=Object.assign(fresh,incoming);
    CF_KEYS.forEach(k=>{ if(k in state)merged[k]=state[k]; else delete merged[k]; });
    Object.keys(state).forEach(k=>{ if(!CF_KEYS.includes(k))delete state[k]; });
    Object.keys(merged).forEach(k=>{ if(!CF_KEYS.includes(k))state[k]=merged[k]; });
    uiMode=state.uiMode||'simple';save();
    // Re-render DCA
    document.getElementById('monthly').value=state.monthly;
    document.getElementById('freq').value=state.freq||'monthly';
    document.getElementById('fee-per-order').value=state.feePerOrder!=null?state.feePerOrder:1;
    document.getElementById('reminder-day').value=state.reminderDay||1;
    document.getElementById('drift-alert').value=state.driftAlert||8;
    if(typeof renderDayPicker==='function')renderDayPicker();
    renderEtfGrid();renderAllocOverview();renderPieChart();updateHealthBar();renderQuickUpdate();renderMonthly();renderHistory();updateOnboarding();updateProj();
    startAutoRefresh();
    return true;
  }
  return false;
}

// Lit un fichier, détecte ce qu'il contient, puis demande le périmètre à importer.
function importDataScoped(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    let parsed=null;
    try{parsed=JSON.parse(e.target.result);}catch(_){_dataIoStatus('✕ Fichier illisible (JSON invalide)','var(--red)');return;}
    const incoming=(parsed&&parsed.type==='folia-backup'&&parsed.state)?parsed.state:parsed;
    if(!incoming||typeof incoming!=='object'){_dataIoStatus('✕ Ce fichier n\'est pas une sauvegarde Folia valide','var(--red)');return;}
    const hasDca=Array.isArray(incoming.etfs);
    const hasCf=incoming.cashflow&&typeof incoming.cashflow==='object'
      &&((incoming.cashflow.income||[]).length||(incoming.cashflow.invest||[]).length||(incoming.cashflow.expense||[]).length);
    if(!hasDca&&!hasCf){_dataIoStatus('✕ Aucune donnée Folia reconnue dans ce fichier','var(--red)');return;}
    showImportScopeModal(incoming,!!hasDca,!!hasCf);
  };
  reader.onerror=()=>_dataIoStatus('✕ Impossible de lire le fichier','var(--red)');
  reader.readAsText(file,'utf-8');
}
window.importDataScoped=importDataScoped;

// Petite fenêtre de choix du périmètre d'import.
function showImportScopeModal(incoming,hasDca,hasCf){
  const ov=document.createElement('div');ov.className='overlay';ov.style.display='flex';ov.style.zIndex='9997';
  const box=document.createElement('div');box.className='modal';box.style.maxWidth='400px';
  const btn=(scope,label,enabled)=>enabled
    ? '<button class="btn-ghost" style="width:100%;margin-bottom:8px;text-align:left;" data-scope="'+scope+'">'+label+'</button>'
    : '<button class="btn-ghost" style="width:100%;margin-bottom:8px;text-align:left;opacity:.4;cursor:not-allowed;" disabled>'+label+' <span style="font-size:10px;">(absent du fichier)</span></button>';
  box.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;">'
    +'<div style="font-size:15px;font-weight:600;">Importer — que veux-tu reprendre ?</div></div>'
    +'<div style="font-size:11px;color:var(--text3);font-family:var(--mono);line-height:1.5;margin-bottom:1rem;">Seul le périmètre choisi sera remplacé ; le reste de tes données est conservé.</div>'
    +btn('dca','&#128200; Données DCA seulement',hasDca)
    +btn('cashflow','&#128176; Données Cashflow seulement',hasCf)
    +btn('both','&#128260; Les deux (remplace tout)',hasDca)
    +'<button id="imp-cancel" style="width:100%;background:transparent;border:1px solid var(--border);color:var(--text2);padding:9px;border-radius:var(--r);margin-top:4px;cursor:pointer;">Annuler</button>';
  ov.appendChild(box);document.body.appendChild(ov);
  const close=()=>ov.remove();
  ov.addEventListener('click',ev=>{if(ev.target===ov)close();});
  box.querySelector('#imp-cancel').onclick=close;
  box.querySelectorAll('button[data-scope]').forEach(b=>{
    b.onclick=async()=>{
      const scope=b.getAttribute('data-scope');
      close();
      const msg=scope==='both'?'Importer et remplacer TOUTES tes données (DCA + Cashflow) ?'
        :scope==='dca'?'Importer les données DCA ? Seul ton DCA sera remplacé.'
        :'Importer les données Cashflow ? Seul ton Cashflow sera remplacé.';
      if(!await confirmModal(msg,{okText:'Importer'}))return;
      if(typeof pushUndo==='function')pushUndo('import ('+scope+')');
      try{
        const ok=applyImportedScoped(incoming,scope);
        _dataIoStatus(ok?'✓ Import réussi':'✕ Rien à importer pour ce périmètre',ok?'var(--green)':'var(--red)');
        if(ok){
          if(typeof toast==='function')toast('Import réussi');
          // Refermer les panneaux de paramètres une fois l'import effectué.
          if(typeof closeSettings==='function')closeSettings();
          if(typeof closeCfSettings==='function')closeCfSettings();
        }
      }catch(err){_dataIoStatus('✕ Échec de l\'import','var(--red)');}
    };
  });
}

// ── Synchronisation par code (mobile ↔ PC) ───────────────────────
// Envoie les données au Worker, qui renvoie un code court à reporter sur
// l'autre appareil. Affiche le code dans la zone prévue de la modale.
async function syncSave(ctx){
  const sfx=ctx==='cf'?'-cf':'';
  const btn=document.getElementById('sync-save-btn'+sfx);
  const out=document.getElementById('sync-code-output'+sfx);
  if(btn){btn.disabled=true;btn.textContent='Envoi…';}
  if(out)out.innerHTML='';
  try{
    const payload={app:'Folia',type:'folia-backup',version:1,exportedAt:new Date().toISOString(),state:state};
    const r=await fetch('/api/sync/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const d=await r.json();
    if(d&&d.code){
      const exp=d.expiresAt?new Date(d.expiresAt).toLocaleDateString('fr-FR'):'';
      if(out)out.innerHTML='<div style="font-size:11px;font-family:var(--mono);color:var(--text3);margin-bottom:6px;">Ton code de récupération :</div>'
        +'<div style="display:flex;align-items:center;gap:8px;">'
        +'<span class="sync-code-val" style="font-size:26px;font-weight:700;font-family:var(--mono);letter-spacing:.12em;color:var(--accent);">'+d.code+'</span>'
        +'<button onclick="copySyncCode(this)" class="btn-ghost" style="font-size:11px;padding:5px 10px;">Copier</button>'
        +'</div>'
        +'<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:8px;line-height:1.45;">Sur ton autre appareil : ouvre Folia → Paramètres → « Récupérer avec un code » → saisis ce code.'
        +(exp?'<br>Ce code expire le '+exp+'.':'')+'</div>';
    } else {
      if(out)out.innerHTML='<div style="font-size:12px;color:var(--red);font-family:var(--mono);">'+((d&&d.error)||'Échec de l\'envoi')+'</div>';
    }
  }catch(e){
    if(out)out.innerHTML='<div style="font-size:12px;color:var(--red);font-family:var(--mono);">Erreur réseau, réessaie.</div>';
  }
  if(btn){btn.disabled=false;btn.textContent='⟳ Générer un nouveau code';}
}
function copySyncCode(btn){
  // Le code à copier est le frère .sync-code-val dans le même bloc
  const el=btn?btn.parentElement.querySelector('.sync-code-val'):document.querySelector('.sync-code-val');
  if(el&&navigator.clipboard){navigator.clipboard.writeText(el.textContent).then(()=>toast('Code copié')).catch(()=>{});}
}
// Récupère les données associées à un code et les applique (après confirmation).
async function syncLoad(ctx){
  const sfx=ctx==='cf'?'-cf':'';
  const inp=document.getElementById('sync-code-input'+sfx);
  const out=document.getElementById('sync-load-output'+sfx);
  const code=(inp?inp.value:'').trim().toUpperCase();
  if(out)out.innerHTML='';
  if(code.length<4){if(out)out.innerHTML='<div style="font-size:12px;color:var(--amber);font-family:var(--mono);">Entre un code valide.</div>';return;}
  const btn=document.getElementById('sync-load-btn'+sfx);
  if(btn){btn.disabled=true;btn.textContent='Récupération…';}
  try{
    const r=await fetch('/api/sync/load?code='+encodeURIComponent(code));
    const d=await r.json();
    if(d&&d.error){
      if(out)out.innerHTML='<div style="font-size:12px;color:var(--red);font-family:var(--mono);">'+d.error+'</div>';
    } else {
      const incoming=(d&&d.type==='folia-backup'&&d.state)?d.state:d;
      if(!incoming||!Array.isArray(incoming.etfs)){
        if(out)out.innerHTML='<div style="font-size:12px;color:var(--red);font-family:var(--mono);">Données illisibles pour ce code.</div>';
      } else {
        if(await confirmModal('Récupérer ces données ? Elles concernent l\'ensemble de Folia (DCA + Cashflow) et remplaceront tes données actuelles sur cet appareil.',{okText:'Récupérer'})){
          pushUndo('récupération par code');
          applyImportedState(incoming);
          closeSettings();closeCfSettings();
          toast('✓ Données récupérées');
        }
      }
    }
  }catch(e){
    if(out)out.innerHTML='<div style="font-size:12px;color:var(--red);font-family:var(--mono);">Erreur réseau, réessaie.</div>';
  }
  if(btn){btn.disabled=false;btn.textContent='Récupérer';}
}
window.syncSave=syncSave;window.syncLoad=syncLoad;window.copySyncCode=copySyncCode;
async function resetAllData(){
  if(!await confirmModal('Réinitialiser toutes les données ? Cette action est irréversible (sauf annulation immédiate par Ctrl+Z).',{okText:'Réinitialiser',danger:true}))return;
  pushUndo('réinitialisation');
  // 1. Effacer localStorage — toutes les clés connues
  ['folia_v3','folia_v2','folia_v1','dca_pea_v5','dca_pea_v4'].forEach(k=>localStorage.removeItem(k));
  // 2. Réassigner state complètement (deep copy) — Object.assign ne suffit pas
  //    on remplace chaque propriété pour que les closures existantes voient la nouvelle valeur
  const fresh=JSON.parse(JSON.stringify(DEFAULT_STATE));
  Object.keys(state).forEach(k=>delete state[k]);
  Object.assign(state,fresh);
  uiMode='simple';
  // 3. Sauvegarder l'état vide dans localStorage immédiatement
  //    pour éviter que load() retrouve de vieilles données
  save();
  // 4. Réinitialiser les inputs du modal réglages
  document.getElementById('monthly').value=state.monthly;
  document.getElementById('freq').value=state.freq||'monthly';
  document.getElementById('fee-per-order').value=state.feePerOrder!=null?state.feePerOrder:1;
  document.getElementById('reminder-day').value=state.reminderDay||1;
  document.getElementById('drift-alert').value=state.driftAlert||8;
  if(typeof renderDayPicker==='function')renderDayPicker();
  // 5. Fermer le modal, re-render toutes les vues
  closeSettings();
  renderEtfGrid();
  renderMonthly();
}
async function testTdKey(){/* Twelve Data retiré — prix récupérés automatiquement via la fonction serveur (Yahoo). */}
let chartHistory=null;
function renderHistory(){
  const list=document.getElementById('history-list');
  const clearBtn=document.getElementById('clear-history-btn');
  if(clearBtn)clearBtn.style.display=state.history.length?'inline-block':'none';
  if(!state.history.length){
    list.innerHTML='<div class="notice notice-info">Aucun ordre enregistré.</div>';
    if(chartHistory){chartHistory.destroy();chartHistory=null;} // vider aussi la courbe d'évolution
    return;
  }
  list.innerHTML=state.history.map((h,idx)=>{
    const d=new Date(h.date);const ds=d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});const ts=d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    const orders=h.orders.map(o=>{
      // Lien JustETF : ISIN en priorité, sinon recherche par ticker
      const isin=(o.isin||'').trim().toUpperCase();
      const href=isin
        ?'https://www.justetf.com/en/etf-profile.html?isin='+isin
        :(o.ticker?'https://www.justetf.com/en/search.html?search=ETFS&query='+encodeURIComponent(o.ticker):'');
      const nameEl=href
        ?'<a href="'+href+'" target="_blank" style="color:var(--accent);text-decoration:none;font-weight:500;" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'">'+(o.name||o.ticker)+'</a>'
        +'<span style="color:var(--text3);"> · </span>'
        :'<span style="font-weight:500;">'+(o.name||o.ticker)+'</span><span style="color:var(--text3);"> · </span>';
      return '<div style="display:flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:6px 10px;flex-wrap:wrap;">'
        +nameEl
        +'<span style="font-size:11px;font-family:var(--mono);color:var(--text3);">'+(o.shares?o.shares+'×':'')+' '+o.price.toFixed(2)+' €/p</span>'
        +'<span style="font-size:12px;font-weight:600;font-family:var(--mono);color:var(--green);margin-left:auto;">'+o.spent.toFixed(2)+' €</span>'
        +'</div>';
    }).join('');
    const badge=h.confirmed?'<span class="history-confirmed">✓ Exécuté</span>':'<span class="history-calculated">⏳ Calculé</span>';
    return '<div class="history-item">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">'
      +'<div><div style="font-size:13px;font-weight:600;">'+ds+' à '+ts+' '+badge+'</div>'
      +'<div style="font-size:11px;font-family:var(--mono);color:var(--green);margin-top:2px;">+'+h.totalSpent.toFixed(2)+' € · '+h.portfolioValue.toFixed(0)+' €</div></div>'
      +'<div style="display:flex;gap:6px;">'
      +(!h.confirmed?'<button class="btn-ghost" style="font-size:11px;padding:3px 9px;" onclick="confirmFromHistory('+idx+')">Confirmer</button>':'')
      +'<button onclick="deleteHistory('+idx+')" style="background:transparent;border:1px solid var(--border);color:var(--text3);font-size:11px;font-family:var(--mono);padding:3px 9px;border-radius:var(--r);">Supprimer</button>'
      +'</div></div>'
      +'<div style="display:flex;flex-direction:column;gap:5px;">'+orders+'</div></div>';
  }).join('');
  const ctx=document.getElementById('chart-history');if(chartHistory)chartHistory.destroy();
  const hist=[...state.history].reverse();
  chartHistory=new Chart(ctx,{type:'line',data:{labels:hist.map(h=>new Date(h.date).toLocaleDateString('fr-FR',{month:'short',year:'2-digit'})),datasets:[
    {label:'Valeur',data:hist.map(h=>h.portfolioValue),borderColor:'#4f8ef7',backgroundColor:'rgba(79,142,247,.08)',fill:true,tension:.4,pointRadius:4,pointBackgroundColor:'#4f8ef7'},
    {label:'Investi',data:hist.map((h,i)=>hist.slice(0,i+1).reduce((s,x)=>s+x.totalSpent,0)),borderColor:'#34d399',fill:true,tension:.4,borderDash:[4,3],pointRadius:0}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#8a8f9e',font:{family:'IBM Plex Mono',size:11}}}},scales:{x:{ticks:{color:'#555a66',font:{family:'IBM Plex Mono',size:11}},grid:{color:'#2a2d33'}},y:{ticks:{color:'#555a66',font:{family:'IBM Plex Mono',size:11},callback:v=>v.toLocaleString('fr-FR')+'€'},grid:{color:'#2a2d33'}}}}});
}
window.deleteHistory=async function(idx){
  const h=state.history[idx];if(!h)return;
  if(!await confirmModal('Supprimer cette entrée d\'historique ? Tes parts ne seront pas modifiées (utilise « Annuler » ou Ctrl+Z pour annuler un achat).',{okText:'Supprimer',danger:true}))return;
  pushUndo('suppression d\'une entrée d\'historique');
  // L'historique est un journal : le supprimer ne touche PAS au portefeuille réel.
  // Pour annuler un achat, on utilise l'undo (bouton Annuler / Ctrl+Z).
  state.history.splice(idx,1);save();renderHistory();updateHealthBar();
};
window.clearAllHistory=async function(){
  if(!state.history.length)return;
  if(!await confirmModal('Effacer tout l\'historique ? Les parts de ton portefeuille ne seront PAS modifiées — seules les entrées d\'historique sont supprimées.',{okText:'Tout effacer',danger:true}))return;
  pushUndo('effacement de tout l\'historique');
  state.history=[];save();renderHistory();updateHealthBar();
};
window.confirmFromHistory=function(idx){
  const h=state.history[idx];if(!h)return;h.confirmed=true;
  h.orders.forEach(o=>{
    // Matching solo
    let etf=state.etfs.find(e=>(!e.subs||!e.subs.length)&&((e.isin&&o.isin&&e.isin===o.isin)||(e.ticker&&o.ticker&&e.ticker===o.ticker)));
    if(etf){etf.shares=+(((etf.shares||0)+(o.shares||0))).toFixed(4);if(o.price>0)etf.avgPrice=o.price;return;}
    // Matching dans un groupe (sous-ETF)
    for(const e of state.etfs){
      if(!e.subs||!e.subs.length)continue;
      const sub=e.subs.find(s=>(s.isin&&o.isin&&s.isin===o.isin)||(s.ticker&&o.ticker&&s.ticker===o.ticker));
      if(sub){sub.shares=+(((sub.shares||0)+(o.shares||0))).toFixed(4);if(o.price>0)sub.avgPrice=o.price;break;}
    }
  });
  save();renderHistory();updateHealthBar();renderAllocOverview();renderPieChart();renderQuickUpdate();renderEtfGrid();
};
function detectIndex(name){const n=(name||'').toLowerCase();for(const kw of INDEX_KEYWORDS){if(n.includes(kw.toLowerCase()))return kw;}const words=n.replace(/[^a-z0-9\s]/g,' ').trim().split(/\s+/).filter(w=>w.length>2);return words.slice(0,2).join(' ')||name;}
function groupByIndex(etfs){const groups={};etfs.forEach(etf=>{const idx=detectIndex(etf.name);if(!groups[idx])groups[idx]={indexName:idx,etfs:[]};groups[idx].etfs.push(etf);});return Object.values(groups).map(g=>({...g,etfs:g.etfs.sort((a,b)=>b.shares-a.shares)})).sort((a,b)=>b.etfs[0].shares-a.etfs[0].shares);}
function openImportModal(){document.getElementById('import-modal').style.display='flex';}
function closeImportModal(force){
  // Pendant l'étape CSV du tuto, ne pas fermer par clic extérieur (le modal fait
  // partie du tuto). La fermeture reste possible via le bouton ×, ou en force.
  if(!force&&typeof _tourOnCsvStep==='function'&&_tourOnCsvStep()){return;}
  document.getElementById('import-modal').style.display='none';document.getElementById('import-preview').innerHTML='';
}
// Fermeture via le bouton × : ferme toujours (force). Si le tuto attendait sur
// l'étape CSV, on l'avance (l'utilisateur a choisi de ne pas importer maintenant).
function closeImportModalAndSkip(){
  const wasTourCsv=typeof _tourOnCsvStep==='function'&&_tourOnCsvStep();
  closeImportModal(true);
  if(wasTourCsv&&typeof tourNext==='function')tourNext();
}
window.closeImportModalAndSkip=closeImportModalAndSkip;
// Depuis le modal d'import : bascule vers la saisie manuelle (page portefeuille + bibliothèque)
function goToManualEntry(){
  closeImportModal();
  nav('portfolio');
  // ouvrir la bibliothèque d'ajout d'ETF après la transition d'onglet
  setTimeout(()=>{if(typeof openEtfLibrary==='function')openEtfLibrary();},120);
}
window.goToManualEntry=goToManualEntry;
const importZone=document.getElementById('import-zone');
// Wire file input via addEventListener — inline onchange ne fonctionne pas dans DOMContentLoaded scope
document.getElementById('csv-file').addEventListener('change',function(){if(this.files[0])handleCsvFile(this.files[0]);});
importZone.addEventListener('dragover',e=>{e.preventDefault();importZone.style.borderColor='var(--accent)';});
importZone.addEventListener('dragleave',()=>importZone.style.borderColor='');
importZone.addEventListener('drop',e=>{e.preventDefault();importZone.style.borderColor='';const f=e.dataTransfer.files[0];if(f)handleCsvFile(f);});
function handleCsvFile(file){if(!file)return;const reader=new FileReader();reader.onload=e=>{renderImportPreview(parseTRCsv(e.target.result));};reader.readAsText(file,'utf-8');}
function parseTRCsv(text){
  const lines=text.split('\n').filter(l=>l.trim());if(!lines.length)return[];
  function splitLine(line){const result=[];let cur='';let inQ=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"')inQ=!inQ;else if(ch===','&&!inQ){result.push(cur.trim());cur='';}else cur+=ch;}result.push(cur.trim());return result;}
  const headers=splitLine(lines[0]).map(h=>h.replace(/"/g,'').toLowerCase().trim());
  const col=n=>headers.indexOf(n);
  const iType=col('type'),iAcc=col('account_type'),iSym=col('symbol'),iName=col('name'),iShares=col('shares'),iPrice=col('price'),iDate=col('date');
  const buys={};
  lines.slice(1).forEach(line=>{if(!line.trim())return;const cols=splitLine(line).map(c=>c.replace(/"/g,'').trim());
    const type=(cols[iType]||'').toUpperCase();const acc=(cols[iAcc]||'').toUpperCase();
    if(type!=='BUY'||acc!=='PEA')return;
    const isin=(cols[iSym]||'').trim().toUpperCase();const name=cols[iName]||isin;
    const shares=parseFloat((cols[iShares]||'0').replace(',','.'));const price=parseFloat((cols[iPrice]||'0').replace(',','.'));const date=cols[iDate]||'';
    if(!isin||!shares||shares<=0)return;
    if(!buys[isin])buys[isin]={isin,name:name.replace(/\s*\(Acc\)|\s*\(Dist\)/i,'').trim(),shares:0,totalCost:0,count:0,lastDate:date};
    buys[isin].shares=+(buys[isin].shares+shares).toFixed(6);buys[isin].totalCost+=shares*price;buys[isin].count++;
    if(date>buys[isin].lastDate)buys[isin].lastDate=date;
  });
  return Object.values(buys).map(b=>({...b,shares:+b.shares.toFixed(4),avgPrice:b.shares>0?+(b.totalCost/b.shares).toFixed(4):0}));
}
function renderImportPreview(data){
  const el=document.getElementById('import-preview');
  if(!data.length){el.innerHTML='<div class="notice notice-warn" style="margin-top:1rem;">Aucune transaction d\'achat PEA trouvée.</div>';return;}
  const groups=groupByIndex(data);const multi=groups.filter(g=>g.etfs.length>1);
  let html='<div style="margin-top:1rem;">';
  if(multi.length)html+='<div class="notice notice-info" style="margin-bottom:.75rem;">'+multi.length+' groupe'+(multi.length>1?'s':'')+' détecté'+(multi.length>1?'s':'')+' — plusieurs émetteurs regroupés.</div>';
  groups.forEach((g,gi)=>{
    const isGroup=g.etfs.length>1;const color=COLORS[gi%COLORS.length];
    html+='<div style="background:var(--bg3);border:1px solid '+(isGroup?'rgba(79,142,247,.35)':'var(--border)')+';border-radius:var(--r2);padding:11px 13px;margin-bottom:9px;">';
    html+='<div style="display:flex;align-items:center;gap:7px;margin-bottom:9px;"><span style="width:8px;height:8px;border-radius:50%;background:'+color+';display:inline-block;"></span><span style="font-size:13px;font-weight:600;">'+g.indexName+'</span>'+(isGroup?'<span class="badge badge-blue" style="font-size:10px;">'+g.etfs.length+' émetteurs</span>':'')+'</div>';
    g.etfs.forEach((d,si)=>{const gi2=data.indexOf(d);
      html+='<div style="'+(si>0?'margin-left:12px;border-left:2px solid rgba(79,142,247,.2);padding-left:10px;margin-top:7px;padding-top:7px;':'')+'">'
        +'<div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">'+(isGroup?'<span style="font-size:10px;font-family:var(--mono);padding:1px 5px;border-radius:3px;background:'+(si===0?'rgba(52,211,153,.12)':'rgba(79,142,247,.12)')+';color:'+(si===0?'var(--green)':'var(--accent)')+';">'+(si===0?'Principal':'Émetteur '+si)+'</span>':'')+'<span style="font-size:12px;font-weight:500;">'+d.name+'</span></div>'
        +'<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:6px;">'+d.isin+' · '+d.count+' ordre'+(d.count>1?'s':'')+' · dernier: '+d.lastDate+'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">'
        +'<div><div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-bottom:2px;">PARTS</div><input type="number" id="imp-shares-'+gi2+'" value="'+d.shares+'" step="0.0001" style="width:100%;text-align:right;padding:4px 8px;height:29px;font-size:12px;"/></div>'
        +'<div><div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-bottom:2px;">PRIX MOY. (€)</div><input type="number" id="imp-price-'+gi2+'" value="'+d.avgPrice.toFixed(4)+'" step="0.0001" style="width:100%;text-align:right;padding:4px 8px;height:29px;font-size:12px;"/></div>'
        +'</div></div>';
    });
    html+='</div>';
  });
  // Stocker dans une variable temporaire au lieu de sérialiser dans onclick
  window._importPending={data,groups};
  html+='<div style="display:flex;gap:7px;margin-top:.75rem;">'
    +'<button class="btn-primary" style="flex:1;" onclick="applyImport(false)">✓ Fusionner</button>'
    +'<button class="btn-ghost" style="flex:1;" onclick="applyImport(true)">Remplacer tout</button>'
    +'</div></div>';
  el.innerHTML=html;
}
function applyImport(replaceAll){
  const pending=window._importPending;
  if(!pending){alert('Erreur : données d\'import introuvables.');return;}
  const {data,groups}=pending;
  const rows=data.map((d,i)=>({...d,shares:+(document.getElementById('imp-shares-'+i)?.value||d.shares),avgPrice:+(document.getElementById('imp-price-'+i)?.value||d.avgPrice)}));
  const byIsin={};rows.forEach(r=>byIsin[r.isin]=r);

  // Détecter si l'import apporte un changement réel (sinon avertir l'utilisateur)
  const findShares=isin=>{
    for(const e of state.etfs){
      if(e.isin===isin)return e.shares||0;
      if(e.subs){const s=e.subs.find(x=>x.isin===isin);if(s)return s.shares||0;}
    }
    return null; // ISIN absent du portefeuille
  };
  let anyNew=false,anyChanged=false;
  rows.forEach(r=>{
    const cur=findShares(r.isin);
    if(cur===null)anyNew=true;
    else if(Math.abs(cur-r.shares)>0.0001)anyChanged=true;
  });
  if(!replaceAll&&!anyNew&&!anyChanged){
    alert('Aucun changement : ce CSV correspond déjà à tes positions actuelles. Tes ETF et tes parts sont à jour.');
    return;
  }
  pushUndo('import CSV');

  if(replaceAll){
    const tMap={};state.etfs.forEach(e=>{if(e.isin)tMap[e.isin]=e.target;if(e.subs)e.subs.forEach(s=>{if(s.isin)tMap[s.isin]=e.target;});});
    state.etfs=[];
    groups.forEach((g)=>{const p=byIsin[g.etfs[0].isin];if(!p)return;const target=tMap[g.etfs[0].isin]||0;
      if(g.etfs.length===1){state.etfs.push({id:state.nextId++,name:p.name,ticker:'',isin:p.isin,target,shares:p.shares,avgPrice:p.avgPrice});}
      else{const subs=g.etfs.map(e=>({ticker:'',isin:e.isin,name:e.name||'',shares:byIsin[e.isin]?.shares||e.shares,avgPrice:byIsin[e.isin]?.avgPrice||e.avgPrice}));state.etfs.push({id:state.nextId++,name:g.indexName,ticker:'',isin:'',target,shares:0,avgPrice:0,subs});}
    });
  } else {
    groups.forEach((g)=>{
      if(g.etfs.length===1){const d=byIsin[g.etfs[0].isin];if(!d)return;let etf=state.etfs.find(e=>e.isin===d.isin)||state.etfs.find(e=>!e.isin&&e.name&&e.name.toLowerCase().includes(d.name.toLowerCase().substring(0,8)));if(!etf){etf={id:state.nextId++,name:d.name,ticker:'',isin:d.isin,target:0,shares:0,avgPrice:0};state.etfs.push(etf);}etf.isin=d.isin;etf.shares=d.shares;if(d.avgPrice)etf.avgPrice=d.avgPrice;if(!etf._nameLocked)etf.name=d.name;}
      else{let gEtf=state.etfs.find(e=>e.subs&&e.subs.some(s=>g.etfs.some(ge=>ge.isin===s.isin)))||state.etfs.find(e=>e.name===g.indexName);if(!gEtf){gEtf={id:state.nextId++,name:g.indexName,ticker:'',isin:'',target:0,shares:0,avgPrice:0,subs:[]};state.etfs.push(gEtf);}if(!gEtf.subs)gEtf.subs=[];
        g.etfs.forEach(ge=>{const d=byIsin[ge.isin];if(!d)return;let sub=gEtf.subs.find(s=>s.isin===d.isin);if(!sub){sub={ticker:'',isin:d.isin,name:d.name||'',shares:0,avgPrice:0};gEtf.subs.push(sub);}sub.shares=d.shares;if(d.avgPrice)sub.avgPrice=d.avgPrice;if(d.name)sub.name=d.name;});
        g.etfs.forEach(ge=>{const idx=state.etfs.findIndex(e=>e.isin===ge.isin&&e!==gEtf);if(idx>=0)state.etfs.splice(idx,1);});}
    });
  }
  save();closeImportModal();window._importPending=null;renderEtfGrid();renderMonthly();
  // Feedback précis selon ce qui a changé
  let msg='Import appliqué.';
  if(replaceAll)msg='Portefeuille remplacé par les données du CSV.';
  else if(anyNew&&anyChanged)msg='Import fusionné : nouveaux ETF ajoutés et parts mises à jour.';
  else if(anyNew)msg='Import fusionné : nouveaux ETF ajoutés.';
  else if(anyChanged)msg='Import fusionné : parts mises à jour.';
  toast(msg);
  // Actualiser automatiquement les prix juste après l'import, pour que le
  // portefeuille importé soit immédiatement à jour (sans clic manuel).
  const hasIds=state.etfs.some(e=>e.isin||e.ticker||(e.subs&&e.subs.some(s=>s.isin||s.ticker)));
  if(hasIds){
    setCalcStatus&&setCalcStatus('live','Récupération des prix…');
    triggerRefresh(true).then(()=>{renderEtfGrid();renderMonthly();}).catch(()=>{});
  }
}
let chartProj=null;
// ── Simulation DCA partagée : génère la série temporelle ET l'état par ETF ──
// Utilisée par le graphique ET la projection par ETF pour garantir la cohérence.
// Retourne {ok, series:[{m,value,invested}], finalEtfs:[...]} ou {ok:false} si prix manquants.
// Charge (à la demande) le rendement annualisé historique de chaque ETF via la
// fonction serveur, calcule une moyenne pondérée par l'allocation cible, et affiche.
// Purement informatif — n'alimente PAS la projection sauf si l'utilisateur le demande.
async function loadHistoricalPerf(){
  const box=document.getElementById('proj-history-content');
  const etfs=state.etfs.filter(e=>e.target>0);
  if(!etfs.length){box.innerHTML='<div style="font-size:12px;color:var(--text3);font-family:var(--mono);">Ajoute des ETF avec une allocation pour voir leurs performances.</div>';return;}
  box.innerHTML='<div style="font-size:12px;color:var(--text3);font-family:var(--mono);">Récupération des historiques… (cela peut prendre quelques secondes)</div>';

  // Identifiant (ISIN/ticker) à interroger pour chaque ETF (émetteur choisi si groupe)
  const idOf=e=>{
    if(e.subs&&e.subs.length>0){const si=state.subChoices?.[e.id]??0;const s=e.subs[si]||e.subs[0];return{isin:s.isin||'',ticker:s.ticker||''};}
    return{isin:e.isin||'',ticker:e.ticker||''};
  };

  const results=await Promise.all(etfs.map(async e=>{
    const {isin,ticker}=idOf(e);
    if(!isin&&!ticker)return{e,err:'pas d\'identifiant'};
    try{
      const qs=new URLSearchParams();if(isin)qs.set('isin',isin);if(ticker)qs.set('ticker',ticker);qs.set('history','1');
      const r=await fetch('/api/price?'+qs.toString());
      const d=await r.json();
      if(d&&typeof d.cagr==='number')return{e,cagr:d.cagr,years:d.years};
      return{e,err:d&&d.error?'historique indisponible':'indisponible'};
    }catch(_){return{e,err:'hors ligne'};}
  }));

  // Moyenne pondérée par l'allocation cible (sur les ETF où on a une donnée)
  let wSum=0,wRet=0,minYears=Infinity,haveData=false;
  results.forEach(x=>{
    if(typeof x.cagr==='number'){haveData=true;wSum+=x.e.target;wRet+=x.e.target*x.cagr;if(x.years<minYears)minYears=x.years;}
  });
  const weighted=wSum>0?wRet/wSum:null;

  let html='<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">';
  results.forEach(x=>{
    const color=COLORS[state.etfs.indexOf(x.e)%COLORS.length];
    html+='<div style="display:flex;align-items:center;gap:8px;font-size:12px;">'
      +'<span style="width:8px;height:8px;border-radius:50%;background:'+color+';display:inline-block;flex-shrink:0;"></span>'
      +'<span style="flex:1;">'+x.e.name+'</span>';
    if(typeof x.cagr==='number'){
      const cls=x.cagr>=0?'var(--green)':'var(--red)';
      html+='<span style="font-family:var(--mono);font-weight:600;color:'+cls+';">'+(x.cagr>=0?'+':'')+x.cagr.toFixed(1)+' %/an</span>'
        +'<span style="font-family:var(--mono);font-size:10px;color:var(--text3);min-width:62px;text-align:right;">sur '+x.years+' an'+(x.years>=2?'s':'')+'</span>';
    }else{
      html+='<span style="font-family:var(--mono);font-size:11px;color:var(--text3);">'+x.err+'</span>';
    }
    html+='</div>';
  });
  html+='</div>';

  if(weighted!=null){
    html+='<div style="border-top:1px solid var(--border);padding-top:10px;margin-bottom:8px;">'
      +'<div style="display:flex;align-items:baseline;gap:8px;">'
      +'<span style="font-size:12px;color:var(--text2);">Moyenne pondérée par ta cible :</span>'
      +'<span style="font-size:18px;font-weight:700;font-family:var(--mono);color:var(--accent);">'+(weighted>=0?'+':'')+weighted.toFixed(1)+' %/an</span>'
      +'</div>'
      +'<div style="font-size:10px;color:var(--text3);font-family:var(--mono);line-height:1.45;margin-top:5px;">'
      +'Repère spéculatif basé sur le passé de chaque ETF, pondéré par ton allocation cible. '
      +(minYears<Infinity&&minYears<5?'⚠ Certains ETF n\'ont que '+minYears+' an'+(minYears>=2?'s':'')+' d\'historique — chiffre à prendre avec prudence. ':'')
      +'Ne tient pas compte de la volatilité ni du rééquilibrage.</div>'
      +'<button class="btn-ghost" style="width:100%;margin-top:9px;" onclick="useHistoricalReturn('+weighted.toFixed(2)+')">Utiliser '+weighted.toFixed(1)+' %/an comme rendement de projection</button>'
      +'</div>';
  }
  box.innerHTML=html;
}
// Reporte (sur demande explicite) la moyenne historique dans le slider de projection
function useHistoricalReturn(r){
  r=Math.max(1,Math.min(20,r)); // borné comme le slider
  const sl=document.getElementById('proj-return');if(sl)sl.value=r;
  const inp=document.getElementById('proj-return-val');if(inp)inp.textContent=r+'%';
  state.expectedReturn=r;save();
  updateProj();
  toast('Rendement de projection réglé sur '+r.toFixed(1)+' %/an');
}
window.loadHistoricalPerf=loadHistoricalPerf;window.useHistoricalReturn=useHistoricalReturn;

function simulateDCA(monthly,months,annualReturn){
  const etfs=state.etfs.filter(e=>e.target>0);
  if(!etfs.length)return{ok:false,reason:'no-etfs'};
  const mg=Math.pow(1+annualReturn/100,1/12)-1;
  const sim=etfs.map(e=>{
    let price,shares,isin;
    if(e.subs&&e.subs.length>0){
      const si=state.subChoices?.[e.id]??0;const sub=e.subs[si]||e.subs[0];
      price=sub.avgPrice||0;shares=e.subs.reduce((s,x)=>s+(x.shares||0),0);isin=sub.isin||'';
    } else {price=e.avgPrice||0;shares=e.shares||0;isin=e.isin||'';}
    return {id:e.id,name:e.name,isin,target:e.target,price,shares,startShares:shares,invested:shares*price};
  });
  if(!sim.every(s=>s.price>0))return{ok:false,reason:'no-prices'};

  const series=[];
  // point initial
  series.push({m:0,value:sim.reduce((s,x)=>s+x.shares*x.price,0),invested:sim.reduce((s,x)=>s+x.invested,0)});
  let deferred=0;
  for(let m=1;m<=months;m++){
    sim.forEach(s=>{s.price*=(1+mg);});
    const budget=monthly+deferred;
    const curTotal=sim.reduce((s,x)=>s+x.shares*x.price,0);
    const targetTotal=curTotal+budget;
    const ideal=sim.map(x=>x.target/100*targetTotal);
    const buys=sim.map(()=>0);
    let remaining=budget;
    const cur=sim.map(x=>x.shares*x.price);
    const distFor=i=>Math.abs((cur[i]+buys[i]*sim[i].price)-ideal[i]);
    let changed=true;
    while(changed){
      changed=false;let best=-1,bd=Infinity;
      const cd=sim.reduce((s,_,i)=>s+distFor(i),0);
      for(let i=0;i<sim.length;i++){
        if(sim[i].price<=0||sim[i].price>remaining)continue;
        const after=Math.abs((cur[i]+(buys[i]+1)*sim[i].price)-ideal[i]);
        const nt=cd-distFor(i)+after;
        if(nt<bd){bd=nt;best=i;}
      }
      if(best>=0&&bd<sim.reduce((s,_,i)=>s+distFor(i),0)-0.001){
        buys[best]+=1;remaining-=sim[best].price;changed=true;
      }
    }
    sim.forEach((s,i)=>{s.shares+=buys[i];s.invested+=buys[i]*s.price;});
    deferred=remaining;
    series.push({m,value:sim.reduce((s,x)=>s+x.shares*x.price,0),invested:sim.reduce((s,x)=>s+x.invested,0)});
  }
  return {ok:true,series,finalEtfs:sim};
}

// Synchronisation curseur ↔ champ ↔ pas pour l'épargne/mois en Projection
function onProjMonthlySlider(){
  const v=+document.getElementById('proj-monthly').value;
  document.getElementById('proj-monthly-input').value=v;
  updateProj();
}
function onProjMonthlyInput(){
  let v=+document.getElementById('proj-monthly-input').value||0;
  if(v<0)v=0;
  const sl=document.getElementById('proj-monthly');
  // Caler le curseur sur la valeur (en restant dans ses bornes pour l'affichage)
  sl.value=Math.min(Math.max(v,+sl.min),+sl.max);
  updateProj();
}
function onProjStepChange(){
  const step=+document.getElementById('proj-monthly-step').value;
  document.getElementById('proj-monthly').step=step;
  document.getElementById('proj-monthly-input').step=step;
}
function syncProjSliders(){document.getElementById('proj-monthly').value=state.monthly;document.getElementById('proj-monthly-val').textContent=state.monthly+' €';const mi=document.getElementById('proj-monthly-input');if(mi)mi.value=state.monthly;const r=state.expectedReturn||8;document.getElementById('proj-return').value=r;document.getElementById('proj-return-val').textContent=r+'%';const inf=state.expectedInflation!=null?state.expectedInflation:3;const infEl=document.getElementById('proj-inflation');if(infEl){infEl.value=inf;document.getElementById('proj-inflation-val').textContent=inf+'%';}}
function updateProj(){
  const years=+document.getElementById('proj-years').value,ret=+document.getElementById('proj-return').value;
  const infl=+(document.getElementById('proj-inflation')?.value||0); // inflation annuelle (%)
  // L'épargne : le champ manuel est la source de vérité (il peut dépasser le max du curseur)
  const mInput=document.getElementById('proj-monthly-input');
  const monthly=mInput?(+mInput.value||0):(+document.getElementById('proj-monthly').value);
  document.getElementById('proj-years-val').textContent=years+' ans';document.getElementById('proj-monthly-val').textContent=monthly+' €';document.getElementById('proj-return-val').textContent=ret+'%';
  const inflValEl=document.getElementById('proj-inflation-val');if(inflValEl)inflValEl.textContent=infl+'%';
  // Le slider de rendement est la source de vérité — on le mémorise
  state.expectedReturn=ret;state.expectedInflation=infl;save();
  const r=ret/100/12,n=years*12;
  const labels=[],base=[],opt=[],pess=[],invested=[];

  // Si des ETF sont renseignés avec prix → simulation réelle par ETF (cohérente avec la projection détaillée)
  const simBase=simulateDCA(monthly,n,ret);
  const usingSim=simBase.ok;
  // Le champ "capital déjà investi" n'est utile QUE pour l'estimation globale (sans ETF)
  const startWrap=document.getElementById('proj-start-wrap');
  if(startWrap)startWrap.style.display=usingSim?'none':'block';
  const alreadyInvested=usingSim?0:(+document.getElementById('proj-start')?.value||0);
  let simOpt=null,simPess=null;
  if(usingSim){
    simOpt=simulateDCA(monthly,n,ret*1.5);
    simPess=simulateDCA(monthly,n,ret*0.5);
    // Construire les séries aux jalons annuels
    for(let i=0;i<=n;i++){
      if(i!==0&&i%12!==0)continue;
      labels.push(i===0?'Auj.':'A'+i/12);
      base.push(Math.round(simBase.series[i].value));
      opt.push(Math.round((simOpt.series[i]||simBase.series[i]).value));
      pess.push(Math.round((simPess.series[i]||simBase.series[i]).value));
      invested.push(Math.round(simBase.series[i].invested));
    }
  } else {
    // Fallback : formule de rendement composé global, en partant du capital déjà investi
    const curVal=alreadyInvested;
    for(let i=0;i<=n;i++){const lbl=i===0?'Auj.':(i%12===0?'A'+i/12:null);if(lbl!==null){labels.push(lbl);const inv=curVal+monthly*i;const v=curVal*Math.pow(1+r,i)+monthly*(Math.pow(1+r,i)-1)/r;const vO=curVal*Math.pow(1+r*1.5,i)+monthly*(Math.pow(1+r*1.5,i)-1)/(r*1.5);const vP=curVal*Math.pow(1+r*0.5,i)+monthly*(Math.pow(1+r*0.5,i)-1)/(r*0.5);base.push(Math.round(v));opt.push(Math.round(vO));pess.push(Math.round(vP));invested.push(Math.round(inv));}}
  }
  const fv=base[base.length-1],fi=invested[invested.length-1];
  // ── Valeur RÉELLE (pouvoir d'achat d'aujourd'hui) ────────────────
  // On déflate chaque jalon annuel par l'inflation cumulée correspondante :
  //   valeur_réelle(année t) = valeur_nominale(t) / (1 + infl)^t
  // La courbe "réelle" montre ce que vaudra réellement ton capital en euros
  // d'aujourd'hui. À 0% d'inflation et sans impôt, elle se confond avec la nominale.
  //
  // ── Courbe "Valeur réelle nette" : impôt PEA + inflation, en € d'aujourd'hui ──
  // Pour chaque jalon annuel t : on retire l'impôt PEA sur la plus-value (PFU 31,4%
  // si retrait avant 5 ans, sinon seuls les prélèvements sociaux 18,6%), puis on
  // déflate par l'inflation cumulée. C'est "ce que tu pourrais réellement dépenser,
  // en argent d'aujourd'hui, si tu retirais cette année-là".
  const realNetSeries=[];
  for(let k=0;k<base.length;k++){
    const t=k; // nombre d'années depuis aujourd'hui
    const gain=Math.max(0,base[k]-invested[k]);
    const rate=t>=5?0.186:0.314;
    const afterTax=base[k]-gain*rate;
    const deflate=Math.pow(1+infl/100,t);
    realNetSeries.push(Math.round(afterTax/deflate));
  }
  const fvRealNet=realNetSeries[realNetSeries.length-1]; // valeur réelle nette finale
  const _netRate=years>=5?0.186:0.314;
  const _netInfo=years>=5?'PS 18,6%':'PFU 31,4%';
  const modeLabel=usingSim
    ?'<span style="font-size:10px;font-family:var(--mono);color:var(--green);">● simulation détaillée par ETF</span>'
    :'<span style="font-size:10px;font-family:var(--mono);color:var(--text3);">● estimation globale (ajoute des ETF avec prix pour affiner)</span>';
  document.getElementById('proj-metrics').innerHTML='<div style="grid-column:1/-1;margin-bottom:6px;">'+modeLabel+'</div>'
    +'<div class="metric"><div class="metric-label">valeur finale (brut)</div><div class="metric-value blue">'+fv.toLocaleString('fr-FR')+' €</div></div>'
    +'<div class="metric"><div class="metric-label">total investi</div><div class="metric-value">'+fi.toLocaleString('fr-FR')+' €</div></div>'
    +'<div class="metric"><div class="metric-label">plus-value</div><div class="metric-value green">+'+(fv-fi).toLocaleString('fr-FR')+' €</div></div>'
    +'<div class="metric"><div class="metric-label">multiplicateur</div><div class="metric-value purple">×'+(fv/Math.max(fi,1)).toFixed(1)+'</div></div>'
    +'<div class="metric"><div class="metric-label" style="display:flex;align-items:center;gap:5px;">valeur réelle nette<span class="info-ic" onclick="toggleRealNetInfo(this)" style="width:13px;height:13px;font-size:9px;">i</span></div><div class="metric-value" style="color:var(--accent);" title="Ce que tu pourrais réellement dépenser en argent d\'aujourd\'hui : valeur finale après impôt PEA ('+_netInfo+') puis corrigée de l\'inflation ('+infl+'%/an sur '+years+' ans).">'+fvRealNet.toLocaleString('fr-FR')+' €</div></div>';
  const ctx=document.getElementById('chart-proj');
  // Mémoriser quelles courbes l'utilisateur avait masquées (cliquées dans la légende)
  // pour les restaurer après recréation du graphique (sinon elles réapparaissent).
  let hiddenLabels=[];
  if(chartProj){
    chartProj.data.datasets.forEach((ds,idx)=>{
      const meta=chartProj.getDatasetMeta(idx);
      if(meta&&meta.hidden)hiddenLabels.push(ds.label);
    });
    chartProj.destroy();
  }
  const eur=v=>Math.round(v).toLocaleString('fr-FR')+' €';
  chartProj=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Optimiste ('+(ret*1.5).toFixed(1)+'%)',data:opt,borderColor:'rgba(52,211,153,.4)',fill:false,tension:.4,pointRadius:0,pointHoverRadius:4,borderDash:[3,3]},{label:'Base ('+ret+'%)',data:base,borderColor:'#4f8ef7',backgroundColor:'rgba(79,142,247,.07)',fill:true,tension:.4,pointRadius:0,pointHoverRadius:5,borderWidth:2},{label:'Prudent ('+(ret*0.5).toFixed(1)+'%)',data:pess,borderColor:'rgba(251,191,36,.4)',fill:false,tension:.4,pointRadius:0,pointHoverRadius:4,borderDash:[3,3]},{label:'Investi',data:invested,borderColor:'#555a66',fill:false,tension:0,pointRadius:0,pointHoverRadius:4,borderDash:[6,4]},{label:'Valeur réelle nette',data:realNetSeries,borderColor:'#a78bfa',fill:false,tension:.4,pointRadius:0,pointHoverRadius:4,borderDash:[2,2],borderWidth:2}]},options:{
    responsive:true,maintainAspectRatio:false,
    interaction:{mode:'index',intersect:false,axis:'x'}, // survol n'importe où en X → toutes les courbes
    plugins:{
      legend:{labels:{color:'#8a8f9e',font:{family:'IBM Plex Mono',size:11}}},
      tooltip:{
        enabled:true,
        backgroundColor:'rgba(20,22,26,.95)',borderColor:'#2a2d34',borderWidth:1,
        titleColor:'#e6e8ec',bodyColor:'#c4c8d0',titleFont:{family:'IBM Plex Mono',size:12,weight:'600'},
        bodyFont:{family:'IBM Plex Mono',size:11},padding:10,boxPadding:5,usePointStyle:true,
        callbacks:{
          title:items=>items.length?(items[0].label==='Auj.'?"Aujourd'hui":'Dans '+items[0].label.replace('A','')+' an'+(items[0].label.replace('A','')==='1'?'':'s')):'',
          label:c=>' '+c.dataset.label+' : '+eur(c.parsed.y)
        }
      }
    },
    scales:{x:{ticks:{color:'#555a66',font:{family:'IBM Plex Mono',size:11}},grid:{color:'#1c1e22'}},y:{ticks:{color:'#555a66',font:{family:'IBM Plex Mono',size:11},callback:v=>Math.round(v).toLocaleString('fr-FR')+'€'},grid:{color:'#1c1e22'}}}
  }});
  // Réappliquer les courbes que l'utilisateur avait masquées avant le changement de durée
  if(hiddenLabels.length){
    chartProj.data.datasets.forEach((ds,idx)=>{
      if(hiddenLabels.includes(ds.label)){
        const meta=chartProj.getDatasetMeta(idx);
        meta.hidden=true;
      }
    });
    chartProj.update();
  }
  const PV=Math.max(0,fv-fi),PS=0.186,FT=0.314,netA=fv-PV*PS,netB=fv-PV*FT,fmt=v=>Math.round(v).toLocaleString('fr-FR');
  const fc=document.getElementById('body-fiscal');
  fc.innerHTML=''
    +(years<5?'<div style="background:rgba(248,113,113,.06);border:1px solid rgba(248,113,113,.2);border-radius:var(--r);padding:.9rem;margin-bottom:.75rem;"><div style="font-size:11px;font-weight:600;color:var(--red);margin-bottom:.65rem;">AVANT 5 ANS — Votre horizon actuel</div><div style="font-size:12px;font-family:var(--mono);display:flex;flex-direction:column;gap:4px;"><div style="display:flex;justify-content:space-between;"><span style="color:var(--text3)">IR (12.8%)</span><span style="color:var(--red)">−'+fmt(PV*.128)+' €</span></div><div style="display:flex;justify-content:space-between;"><span style="color:var(--text3)">PS (18.6%)</span><span style="color:var(--red)">−'+fmt(PV*PS)+' €</span></div><div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:4px;"><span style="color:var(--text3)">Total (31.4%)</span><span style="color:var(--red);font-weight:600;">−'+fmt(PV*FT)+' €</span></div></div><div style="margin-top:8px;background:var(--bg2);padding:7px 9px;border-radius:var(--r);"><div style="font-size:10px;color:var(--text3);">VALEUR NETTE D\'IMPÔT</div><div style="font-size:20px;font-weight:600;font-family:var(--mono);color:var(--red);">'+fmt(netB)+' €</div></div></div>':'')
    +'<div style="background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2);border-radius:var(--r);padding:.9rem;"><div style="font-size:11px;font-weight:600;color:var(--green);margin-bottom:.65rem;">APRÈS 5 ANS'+(years>=5?' — Votre horizon ✓':'')+'</div><div style="font-size:12px;font-family:var(--mono);display:flex;flex-direction:column;gap:4px;"><div style="display:flex;justify-content:space-between;"><span style="color:var(--text3)">IR sur PV</span><span style="color:var(--green)">Exonéré ✓</span></div><div style="display:flex;justify-content:space-between;"><span style="color:var(--text3)">PS (18.6%)</span><span style="color:var(--amber)">−'+fmt(PV*PS)+' €</span></div></div><div style="margin-top:8px;background:var(--bg2);padding:7px 9px;border-radius:var(--r);"><div style="font-size:10px;color:var(--text3);">VALEUR NETTE D\'IMPÔT</div><div style="font-size:20px;font-weight:600;font-family:var(--mono);color:var(--green);">'+fmt(netA)+' €</div></div></div>'
    +'<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:.75rem;">France 2026 · PS 18.6% · Avant 5 ans : PFU 31.4% · Plafond PEA : 150 000 € · Montants en euros futurs (hors inflation)</div>';
  renderEtfProjection(years,monthly,ret,simBase);
  applyCollapseState();
}
// ── Projection par ETF : utilise la simulation partagée (cohérente avec le graphique) ──
function renderEtfProjection(years,monthly,retPct,simResult){
  const card=document.getElementById('body-etf');
  if(!card)return;
  if(!simResult||simResult.reason==='no-etfs'){
    card.innerHTML='<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:.5rem 0;">Ajoute des ETF avec une allocation cible pour voir la projection détaillée.</div>';return;
  }
  if(!simResult.ok){
    card.innerHTML='<div style="font-size:12px;color:var(--amber);font-family:var(--mono);padding:.5rem 0;">⚠ Renseigne le prix de chaque ETF pour projeter l\'accumulation de parts (les prix se récupèrent normalement tout seuls).</div>';
    return;
  }
  const sim=simResult.finalEtfs;
  const totalVal=sim.reduce((s,x)=>s+x.shares*x.price,0);
  const totalInv=sim.reduce((s,x)=>s+x.invested,0);
  let html='<div style="font-size:12px;font-weight:600;margin-bottom:.3rem;">Dans '+years+' an'+(years>1?'s':'')+'</div>'
    +'<div style="font-size:11px;color:var(--text3);font-family:var(--mono);margin-bottom:.85rem;">Estimation de l\'accumulation de parts au rythme DCA actuel (rendement '+retPct+'%/an, prix projetés)</div>';
  html+='<div style="display:flex;flex-direction:column;gap:8px;">';
  sim.forEach((s,i)=>{
    const color=COLORS[state.etfs.findIndex(e=>e.id===s.id)%COLORS.length];
    const val=s.shares*s.price;
    const pct=totalVal>0?val/totalVal*100:0;
    const gain=val-s.invested;
    const gainPct=s.invested>0?(gain/s.invested*100):0;
    const newShares=s.shares-s.startShares;
    html+='<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:11px 13px;">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
      +'<span style="width:9px;height:9px;border-radius:50%;background:'+color+';display:inline-block;flex-shrink:0;"></span>'
      +'<span style="font-size:13px;font-weight:600;flex:1;">'+s.name+'</span>'
      +'<span style="font-size:11px;font-family:var(--mono);color:var(--text3);">'+pct.toFixed(1)+'% · cible '+s.target+'%</span>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">'
      +'<div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:.05em;">PARTS</div><div style="font-size:15px;font-weight:600;font-family:var(--mono);">'+s.shares.toFixed(s.shares<10?2:0)+'</div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);">+'+newShares.toFixed(newShares<10?1:0)+' acquises</div></div>'
      +'<div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:.05em;">VALEUR EST.</div><div style="font-size:15px;font-weight:600;font-family:var(--mono);color:'+color+';">'+val.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €</div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);">@ '+s.price.toFixed(0)+' €/p</div></div>'
      +'<div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:.05em;">INVESTI</div><div style="font-size:15px;font-weight:600;font-family:var(--mono);color:var(--text2);">'+s.invested.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €</div></div>'
      +'<div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:.05em;">PLUS-VALUE EST.</div><div style="font-size:15px;font-weight:600;font-family:var(--mono);color:'+(gain>=0?'var(--green)':'var(--red)')+';">'+(gain>=0?'+':'')+gain.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €</div><div style="font-size:9px;color:'+(gain>=0?'var(--green)':'var(--red)')+';font-family:var(--mono);">'+(gainPct>=0?'+':'')+gainPct.toFixed(0)+'%</div></div>'
      +'</div></div>';
  });
  html+='</div>';
  const totalGain=totalVal-totalInv;
  html+='<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">'
    +'<div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:.05em;">VALEUR TOTALE EST.</div><div style="font-size:18px;font-weight:600;font-family:var(--mono);color:var(--accent);">'+totalVal.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €</div></div>'
    +'<div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:.05em;">TOTAL INVESTI</div><div style="font-size:18px;font-weight:600;font-family:var(--mono);color:var(--text2);">'+totalInv.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €</div></div>'
    +'<div><div style="font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:.05em;">PLUS-VALUE EST.</div><div style="font-size:18px;font-weight:600;font-family:var(--mono);color:'+(totalGain>=0?'var(--green)':'var(--red)')+';">'+(totalGain>=0?'+':'')+totalGain.toLocaleString('fr-FR',{maximumFractionDigits:0})+' €</div></div>'
    +'</div>';
  html+='<div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:.75rem;">Estimation indicative : rendement constant supposé, prix évoluant au même rythme pour tous les ETF. Les parts réelles dépendront des prix de marché.</div>';
  card.innerHTML=html;
}
document.getElementById('monthly').value=state.monthly;
document.getElementById('freq').value=state.freq||'monthly';
document.getElementById('fee-per-order').value=state.feePerOrder!=null?state.feePerOrder:1;
document.getElementById('reminder-day').value=state.reminderDay||1;
document.getElementById('drift-alert').value=state.driftAlert||8;
// Sélecteur visuel du jour de rappel (grille 1-28, repliable)
function renderDayPicker(){
  const box=document.getElementById('reminder-day-picker');if(!box)return;
  const sel=+document.getElementById('reminder-day').value||1;
  const lbl=document.getElementById('reminder-day-label');if(lbl)lbl.textContent=sel;
  let h='';
  for(let d=1;d<=28;d++){h+='<div class="day-cell'+(d===sel?' sel':'')+'" data-day="'+d+'">'+d+'</div>';}
  box.innerHTML=h;
  box.querySelectorAll('.day-cell').forEach(c=>{
    c.onclick=()=>{
      document.getElementById('reminder-day').value=c.getAttribute('data-day');
      renderDayPicker();
      // fermeture animée après le choix
      box.style.animation='dayPickerOut .2s ease forwards';
      setTimeout(()=>{box.style.display='none';box.style.animation='';},190);
      document.getElementById('reminder-day').dispatchEvent(new Event('input',{bubbles:true}));
    };
  });
}
function toggleDayPicker(){
  const box=document.getElementById('reminder-day-picker');if(!box)return;
  const open=box.style.display!=='none';
  if(open){
    // Fermeture animée
    box.style.animation='dayPickerOut .2s ease forwards';
    setTimeout(()=>{box.style.display='none';box.style.animation='';},190);
  }else{
    box.style.display='grid';
    box.style.animation='dayPickerIn .25s cubic-bezier(.22,1,.36,1)';
  }
}
window.toggleDayPicker=toggleDayPicker;
renderDayPicker();
// Synchronisation temps réel des paramètres DCA → state + bandeau + projection
(function(){
  const sync=()=>{
    state.monthly=+document.getElementById('monthly').value||500;
    state.freq=document.getElementById('freq').value;
    const fee=parseFloat(document.getElementById('fee-per-order').value);
    state.feePerOrder=isNaN(fee)||fee<0?0:fee;
    state.reminderDay=Math.min(28,Math.max(1,+document.getElementById('reminder-day').value||1));
    state.driftAlert=Math.min(50,Math.max(1,+document.getElementById('drift-alert').value||8));
    save();
    if(typeof cfOnDcaMonthlyChange==='function')cfOnDcaMonthlyChange(); // répercute sur le Cashflow lié
    updateHealthBar();
    renderMonthly(); // le plan dépend des frais
    const pp=document.getElementById('page-projection');
    if(pp&&pp.classList.contains('active'))updateProj();
  };
  ['monthly','fee-per-order','reminder-day','drift-alert'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('input',sync);});
  ['freq'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('change',sync);});
})();
window.nav=nav;window.calculate=calculate;window.triggerRefresh=triggerRefresh;
window.addEtfBlank=addEtfBlank;window.openEtfLibrary=openEtfLibrary;window.removeEtf=removeEtf;window.removeEtfFromHome=removeEtfFromHome;
window.resolveSingle=resolveSingle;window.onIdentInputById=onIdentInputById;
window.setMode=setMode;window.saveQuickUpdate=saveQuickUpdate;
window.openImportModal=openImportModal;window.closeImportModal=closeImportModal;
window.handleCsvFile=handleCsvFile;window.applyImport=applyImport;
window.updateProj=updateProj;window.testTdKey=testTdKey;
window.onProjMonthlySlider=onProjMonthlySlider;window.onProjMonthlyInput=onProjMonthlyInput;window.onProjStepChange=onProjStepChange;
window.openSettings=openSettings;window.closeSettings=closeSettings;window.resetAllData=resetAllData;
window.closePosCheck=closePosCheck;window.confirmPosCheck=confirmPosCheck;
window.exportData=exportData;window.importData=importData;
window.confirmOrders=confirmOrders;window.skipConfirm=skipConfirm;
// ════════════════════════════════════════════════════════════════
// TUTORIEL GUIDÉ (product tour) — option A : guidé mais non bloquant.
// Met en évidence un élément à la fois (spotlight + bulle), assombrit le reste,
// gère les changements d'onglet automatiquement, et avance soit au clic "Suivant",
// soit automatiquement quand une condition est remplie (ex. un ETF a été ajouté).
// ════════════════════════════════════════════════════════════════
// Libellés lisibles des onglets, pour indiquer où le tuto navigue
const TAB_LABELS={monthly:'Ce mois-ci',portfolio:'Mon portefeuille',history:'Historique',projection:'Projection'};
// Le parcours principal. Certaines étapes sont "centered" (bulle au centre, sans
// spotlight) pour l'intro et la conclusion. La branche CSV est gérée à part.
const TOUR_STEPS=[
  {
    centered:true,
    title:'Bienvenue sur Folia ✨',
    text:'Folia est ton planificateur d\'investissement DCA pour PEA : tu fixes ta répartition cible, et chaque mois Folia te dit exactement quoi acheter pour t\'en rapprocher — sans jamais vendre.<br><br>Comment veux-tu ajouter tes ETF pour commencer ?',
    choices:[
      {label:'Les saisir moi-même',action:'manual'},
      {label:'📥 Importer un CSV',action:'csv'}
    ]
  },
  {
    branch:'manual',
    el:()=>document.querySelector('.btn-add'),
    tab:'portfolio',
    title:'Ajoute ton premier ETF',
    text:'Clique sur « + Ajouter un ETF ». Un bloc vide apparaît, prêt à être renseigné.',
    advanceWhen:()=>state.etfs.length>0,
    waitText:'En attente : ajoute un ETF pour continuer…'
  },
  {
    branch:'manual',
    el:()=>{
      // Cibler le premier ETF sans prix encore résolu (celui qu'on attend), sinon le dernier.
      const pending=state.etfs.find(e=>!(e.avgPrice>0));
      const target=pending||state.etfs[state.etfs.length-1];
      return target?document.getElementById('ident-'+target.id):null;
    },
    tab:'portfolio',
    title:'Saisis l\'ISIN',
    text:'Tape l\'ISIN de ton ETF (12 caractères, ex. <strong>LU0996182563</strong>), puis clique ailleurs. Folia récupère automatiquement son nom et son prix — tu vois tout de suite que ça a marché !',
    advanceWhen:()=>state.etfs.some(e=>e.avgPrice>0),
    waitText:'En attente : saisis un ISIN valide pour voir la magie opérer…'
  },
  {
    branch:'csv',
    openFirst:()=>{if(typeof openImportModal==='function')openImportModal();},
    el:()=>document.querySelector('#import-modal .modal'),
    tab:'portfolio',
    bubblePos:'left',
    title:'Importe ton CSV',
    text:'Dépose ici le fichier exporté depuis ton courtier. Folia y lit tes ETF et tes parts automatiquement. Le tuto reprend dès que tes ETF sont importés.',
    advanceWhen:()=>state.etfs.length>0,
    waitText:'En attente : importe ton CSV pour continuer…',
    onLeave:()=>{if(typeof closeImportModal==='function')closeImportModal(true);}
  },
  {
    common:true,
    requires:()=>state.etfs.length>0,
    el:()=>{
      // En CSV (plusieurs ETF importés) : englober toute la grille. En manuel
      // (un seul ETF créé) : cibler précisément son champ Cible %.
      if(_tourBranch==='csv')return document.getElementById('etf-grid');
      return document.querySelector('#etf-grid .etf-target-input')||document.getElementById('etf-grid');
    },
    tab:'portfolio',
    bubblePos:()=>_tourBranch==='csv'?'left':null,
    title:'Définis tes allocations cibles',
    text:()=>{
      const n=state.etfs.length;
      if(n<=1){
        return 'Indique le pourcentage cible de ton ETF. Comme tu n\'en as qu\'un pour l\'instant, mets <strong>100 %</strong>.<br><br>💡 Après le tuto, pense à <strong>ajouter tes autres ETF</strong> et à répartir tes pourcentages entre eux (le total devra toujours faire 100 %).';
      }
      return 'Répartis tes pourcentages cibles entre tes ETF : indique pour chacun la part qu\'il doit représenter dans ton portefeuille idéal. <strong>Le total doit faire 100 %.</strong><br><br>💡 C\'est ta stratégie personnelle — ton courtier ne la connaît pas, c\'est à toi de la définir ici.';
    },
    advanceWhen:()=>{const t=state.etfs.reduce((s,e)=>s+(+e.target||0),0);return state.etfs.some(e=>e.target>0)&&Math.abs(t-100)<0.5;},
    waitText:'En attente : ajuste tes cibles pour atteindre 100 % au total…'
  },
  {
    common:true,
    el:()=>document.getElementById('monthly'),
    tab:'portfolio',
    title:'Ton épargne mensuelle',
    text:'Indique combien tu veux investir chaque mois. Folia répartira ce montant entre tes ETF pour viser ta cible.',
    next:true
  },
  {
    common:true,
    requires:()=>state.etfs.length>0,
    el:()=>document.getElementById('btn-calc'),
    tab:'monthly',
    title:'Calcule ton plan',
    text:'C\'est ici que tout se joue : Folia te dit exactement quoi acheter ce mois-ci pour te rapprocher de ta cible. Clique sur « Calculer le plan ».',
    arm:()=>{_tourCalcRef=state.lastCalcDate||null;},
    advanceWhen:()=>state.lastCalcDate&&state.lastCalcDate!==_tourCalcRef,
    waitText:'En attente : clique sur « Calculer le plan »…'
  },
  {
    common:true,
    requires:()=>state.etfs.length>0,
    el:()=>document.getElementById('plan-orders'),
    tab:'monthly',
    title:'Voici ton plan du mois',
    text:'Folia vient de calculer <strong>exactement quoi acheter</strong> ce mois-ci pour te rapprocher de ta cible.<br><br>Pour chaque ETF : le nombre de parts entières à acheter et le montant. Si une part est trop chère pour ton budget du mois, son montant est mis <strong>en réserve</strong> et investi dès que possible — rien n\'est perdu. Tu n\'as plus qu\'à passer ces ordres chez ton courtier.<br><br>💡 <strong>Chaque mois</strong>, avant de calculer, Folia te demandera de vérifier que tes parts correspondent bien à celles de ton courtier (les ordres programmés achètent parfois un peu plus ou un peu moins que prévu). Garde les deux synchronisés pour que le plan reste juste.',
    next:true
  },
  {
    centered:true,
    title:'À toi de jouer ! 🎉',
    text:'Tu connais l\'essentiel. Folia a d\'autres choses à découvrir quand tu veux : l\'onglet <strong>Projection</strong> pour visualiser ton capital futur et la fiscalité, l\'<strong>Historique</strong> de tes achats, et plein de réglages. Explore à ton rythme — tout est réversible.<br><br>Veux-tu garder ce que tu viens de configurer, ou repartir de zéro pour ajouter tes vrais ETF ?',
    endChoices:[
      {label:'Garder ma configuration',action:'keep',primary:true},
      {label:'Repartir de zéro',action:'reset'}
    ],
    last:true
  }
];
let _tourIdx=-1,_tourPoll=null,_tourBranch=null,_tourRO=null,_tourReposPoll=null,_curStepBubblePos=null,_tourCalcRef=null;
function tourActive(){return _tourIdx>=0;}
// Vrai si le tuto est actif et actuellement sur l'étape d'import CSV.
function _tourOnCsvStep(){
  if(!tourActive())return false;
  const steps=tourVisibleSteps();const s=steps[_tourIdx];
  return !!(s&&s.branch==='csv'&&s.openFirst);
}
window._tourOnCsvStep=_tourOnCsvStep;
// Masque temporairement la bulle + le spotlight du tuto (quand une autre modale
// s'ouvre par-dessus : confirmation, bibliothèque…). Évite l'empilement de pop-ups.
let _tourSuspendCount=0;
function tourSuspend(){
  if(!tourActive())return;
  _tourSuspendCount++;
  const b=document.querySelector('.tour-bubble');if(b)b.style.display='none';
  const h=document.querySelector('.tour-highlight');if(h)h.style.display='none';
  const ov=document.getElementById('tour-overlay');if(ov)ov.style.display='none';
}
function tourResume(){
  if(!tourActive())return;
  _tourSuspendCount=Math.max(0,_tourSuspendCount-1);
  if(_tourSuspendCount>0)return; // d'autres modales encore ouvertes
  const steps=tourVisibleSteps();const step=steps[_tourIdx];if(!step)return;
  const ov=document.getElementById('tour-overlay');if(ov)ov.style.display='';
  const b=document.querySelector('.tour-bubble');if(b)b.style.display='';
  // Repositionner sans rejouer les effets d'ouverture (openFirst, scroll…)
  if(step.centered){centerBubble();}
  else{const el=typeof step.el==='function'?step.el():step.el;if(el){const h=document.querySelector('.tour-highlight');if(h)h.style.display='block';positionTour(el);}}
}
window.tourSuspend=tourSuspend;window.tourResume=tourResume;
// Renvoie la liste des étapes valides pour la branche choisie (manual/csv) :
// on garde les étapes sans branche (intro, common, fin) + celles de la branche active.
function tourVisibleSteps(){
  return TOUR_STEPS.filter(s=>!s.branch||s.branch===_tourBranch);
}
function startTour(){
  _tourBranch=null;_tourIdx=0;
  if(!document.getElementById('tour-overlay')){
    const ov=document.createElement('div');ov.id='tour-overlay';
    ov.innerHTML='<svg><defs><mask id="tour-hole"><rect width="100%" height="100%" fill="white"/><rect id="tour-hole-rect" rx="8" fill="black"/></mask></defs><rect class="tour-mask-bg" width="100%" height="100%" mask="url(#tour-hole)"/></svg>';
    document.body.appendChild(ov);
  }
  showTourStep();
}
function _tourCleanupWatchers(){
  if(_tourRO){_tourRO.disconnect();_tourRO=null;}
  if(_tourReposPoll){clearInterval(_tourReposPoll);_tourReposPoll=null;}
}
function endTour(skipped){
  // appeler onLeave de l'étape courante si besoin (ex. fermer le modal CSV)
  const steps=tourVisibleSteps();const cur=steps[_tourIdx];
  if(cur&&cur.onLeave)try{cur.onLeave();}catch(e){}
  _tourIdx=-1;_tourBranch=null;
  if(_tourPoll){clearInterval(_tourPoll);_tourPoll=null;}
  _tourCleanupWatchers();
  document.getElementById('tour-overlay')?.remove();
  document.querySelector('.tour-highlight')?.remove();
  document.querySelector('.tour-bubble')?.remove();
  try{state._tourDone=true;save();}catch(e){}
}
window.startTour=startTour;window.endTour=endTour;
// Avance à l'étape suivante (en gérant onLeave de l'étape quittée)
function tourNext(){
  const steps=tourVisibleSteps();const cur=steps[_tourIdx];
  if(cur&&cur.onLeave)try{cur.onLeave();}catch(e){}
  _tourCleanupWatchers();
  _tourIdx++;showTourStep();
}
// Choix dans l'intro : fixe la branche puis avance
function tourChoose(action){
  _tourBranch=action;
  _tourIdx++;showTourStep();
}
window.tourChoose=tourChoose;
// Choix de fin : garder la config, ou repartir de zéro (efface UNIQUEMENT les ETF).
async function tourFinish(action){
  if(action==='reset'){
    // Masquer la bulle + le voile du tuto pendant la confirmation, pour éviter
    // que la modale s'affiche en dessous (empilement de pop-ups).
    const bubble=document.querySelector('.tour-bubble');if(bubble)bubble.style.display='none';
    const ov=document.getElementById('tour-overlay');if(ov)ov.style.display='none';
    const hl=document.querySelector('.tour-highlight');if(hl)hl.style.display='none';
    const ok=await confirmModal('Repartir de zéro effacera les ETF ajoutés pendant la visite (tes réglages, eux, sont conservés). Continuer ?',{okText:'Repartir de zéro',cancelText:'Annuler',danger:true,fromTour:true});
    if(!ok){
      // L'utilisateur annule : on réaffiche la bulle finale pour qu'il puisse rechoisir.
      if(ov)ov.style.display='';
      if(bubble)bubble.style.display='';
      centerBubble();
      return;
    }
    pushUndo('réinitialisation après tuto');
    state.etfs=[];
    state.pendingOrders=null;
    state.subChoices={};
    save();
    renderEtfGrid();renderMonthly();renderAllocOverview();renderPieChart();updateHealthBar();renderQuickUpdate();
    toast('Portefeuille vidé — à toi d\'ajouter tes vrais ETF');
  }
  endTour(false);
}
window.tourFinish=tourFinish;
function positionTour(el){
  const ov=document.getElementById('tour-overlay');if(ov)ov.classList.remove('blocking'); // laisser cliquer la cible mise en avant
  const r=el.getBoundingClientRect();
  // Garde-fou : élément masqué ou sans dimensions (ex. modal fermé) → ne pas
  // repositionner sur (0,0), ce qui ferait "sauter" le spotlight/la bulle dans le coin.
  if(r.width<2||r.height<2)return;
  const pad=6;
  const hole=document.getElementById('tour-hole-rect');
  if(hole){hole.setAttribute('x',r.left-pad);hole.setAttribute('y',r.top-pad);hole.setAttribute('width',r.width+pad*2);hole.setAttribute('height',r.height+pad*2);}
  let hl=document.querySelector('.tour-highlight');
  if(!hl){hl=document.createElement('div');hl.className='tour-highlight';document.body.appendChild(hl);}
  hl.style.display='block';
  hl.style.left=(r.left-pad)+'px';hl.style.top=(r.top-pad)+'px';hl.style.width=(r.width+pad*2)+'px';hl.style.height=(r.height+pad*2)+'px';
  const bubble=document.querySelector('.tour-bubble');
  if(bubble){
    // — Mobile (écran étroit) : la bulle se cale en bas, pleine largeur, quel
    //   que soit le mode demandé. Le spotlight reste visible au-dessus. C'est
    //   plus lisible que d'essayer de la coller à gauche/au-dessus d'une cible
    //   sur un petit écran. —
    if(window.innerWidth<=640){
      const m=Math.round(window.innerWidth*0.03); // marge ~3vw
      bubble.style.left=m+'px';
      bubble.style.right=m+'px';
      bubble.style.width='auto';
      const bhm=bubble.offsetHeight||160;
      bubble.style.top=Math.max(8,window.innerHeight-bhm-12)+'px';
      return;
    }
    const bw=300,bh=bubble.offsetHeight||150;
    // Réinitialise d'éventuels résidus du mode mobile (right/width).
    bubble.style.right='';bubble.style.width='';
    // Position à gauche du spotlight : on place la bulle dans l'espace à gauche de
    // la zone éclairée (utile quand le spotlight est large, comme la grille d'ETF).
    // Si pas assez de place à gauche, on la met au-dessus du spotlight.
    if(_curStepBubblePos==='left'){
      const top=Math.max(20,Math.min(r.top,window.innerHeight-bh-20));
      if(r.left-bw-20>=10){
        bubble.style.left=(r.left-bw-20)+'px';
        bubble.style.top=top+'px';
      } else if(r.top-bh-16>=10){
        // pas de place à gauche → au-dessus
        bubble.style.left=Math.max(10,Math.min(r.left,window.innerWidth-bw-10))+'px';
        bubble.style.top=(r.top-bh-16)+'px';
      } else {
        // ni à gauche ni au-dessus → coin haut-gauche de l'écran
        bubble.style.left='16px';bubble.style.top='16px';
      }
      return;
    }
    // Position forcée en bas (ex. spotlight large comme toute la grille d'ETF :
    // la bulle se place en bas de l'écran pour ne pas recouvrir la zone éclairée).
    if(_curStepBubblePos==='bottom'){
      bubble.style.left=Math.max(10,(window.innerWidth-bw)/2)+'px';
      bubble.style.top=(window.innerHeight-bh-20)+'px';
      return;
    }
    let top=r.bottom+14,left=r.left;
    if(top+bh>window.innerHeight-10)top=Math.max(10,r.top-bh-14);
    if(left+bw>window.innerWidth-10)left=Math.max(10,window.innerWidth-bw-10);
    bubble.style.top=top+'px';bubble.style.left=left+'px';
  }
}
// Place la bulle au centre de l'écran (étapes intro/fin, sans spotlight)
function centerBubble(){
  const ov=document.getElementById('tour-overlay');if(ov)ov.classList.add('blocking'); // bloquer l'arrière-plan
  const hole=document.getElementById('tour-hole-rect');
  if(hole){hole.setAttribute('width',0);hole.setAttribute('height',0);} // pas de trou
  const hl=document.querySelector('.tour-highlight');if(hl)hl.style.display='none';
  const bubble=document.querySelector('.tour-bubble');
  if(bubble){
    if(window.innerWidth<=640){
      // Mobile : bulle pleine largeur, centrée verticalement.
      const m=Math.round(window.innerWidth*0.03);
      bubble.style.left=m+'px';bubble.style.right=m+'px';bubble.style.width='auto';
      bubble.style.top=Math.max(20,(window.innerHeight-bubble.offsetHeight)/2)+'px';
      return;
    }
    // Desktop : on réinitialise right/width au cas où on vient du mode mobile.
    bubble.style.right='';bubble.style.width='';
    bubble.style.top=Math.max(20,(window.innerHeight-bubble.offsetHeight)/2)+'px';
    bubble.style.left=Math.max(10,(window.innerWidth-bubble.offsetWidth)/2)+'px';
  }
}
// Bulle de repli quand une étape ne peut pas s'afficher (prérequis manquant,
// élément introuvable). Évite toute cascade/plantage : message clair + sorties.
function showTourBlocked(step){
  if(_tourPoll){clearInterval(_tourPoll);_tourPoll=null;}
  _tourCleanupWatchers();
  let bubble=document.querySelector('.tour-bubble');
  if(!bubble){bubble=document.createElement('div');bubble.className='tour-bubble';document.body.appendChild(bubble);}
  const hl=document.querySelector('.tour-highlight');if(hl)hl.style.display='none';
  const ov=document.getElementById('tour-overlay');if(ov)ov.classList.add('blocking');
  // S'il existe une étape précédente, on propose d'y revenir (sans quitter le tuto).
  const canGoBack=_tourIdx>0;
  bubble.innerHTML='<div class="tour-step-count">Une étape reste à compléter</div>'
    +'<div class="tour-title">Reprenons l\'étape précédente</div>'
    +'<div class="tour-text">Il manque quelque chose pour continuer (au moins un ETF avec son allocation). Revenons à l\'étape précédente pour la compléter — tu pourras ensuite poursuivre la visite.</div>'
    +'<div class="tour-actions">'
    +(canGoBack?'<button class="tour-next" id="tb-back">← Revenir à l\'étape précédente</button>':'<button class="tour-next" id="tb-go">Aller à mon portefeuille</button>')
    +'<button class="tour-skip">Quitter le tuto</button></div>';
  bubble.querySelector('.tour-skip').onclick=()=>endTour(true);
  const back=bubble.querySelector('#tb-back');
  if(back)back.onclick=()=>tourBack();
  const go=bubble.querySelector('#tb-go');
  if(go)go.onclick=()=>{endTour(true);nav('portfolio');};
  setTimeout(centerBubble,30);
}
// Revient à l'étape précédente du tuto (sans en sortir).
function tourBack(){
  _tourCleanupWatchers();
  if(_tourPoll){clearInterval(_tourPoll);_tourPoll=null;}
  _tourIdx=Math.max(0,_tourIdx-1);
  showTourStep();
}
window.tourBack=tourBack;
function showTourStep(){
  const steps=tourVisibleSteps();
  const step=steps[_tourIdx];
  if(!step){endTour(false);return;}
  _curStepBubblePos=(typeof step.bubblePos==='function'?step.bubblePos():step.bubblePos)||null;
  if(step.arm)try{step.arm();}catch(e){} // capture d'un état de référence (ex. date du dernier calcul)
  // Changement d'onglet si nécessaire
  if(step.tab){
    const pageActive=document.getElementById('page-'+step.tab)?.classList.contains('active');
    if(!pageActive)nav(step.tab);
  }
  // Action d'ouverture éventuelle (ex. ouvrir le modal CSV) — après la bascule d'onglet
  if(step.openFirst)setTimeout(()=>{try{step.openFirst();}catch(e){}},step.tab?280:60);
  const delay=(step.tab?280:60)+(step.openFirst?160:0);
  setTimeout(()=>{
    // Construire / réutiliser la bulle
    let bubble=document.querySelector('.tour-bubble');
    if(!bubble){bubble=document.createElement('div');bubble.className='tour-bubble';document.body.appendChild(bubble);}
    const total=steps.length;
    const tabLine=step.tab&&!step.centered
      ?'<div class="tour-step-count" style="color:var(--text3);margin-top:3px;">📍 Onglet : '+(TAB_LABELS[step.tab]||step.tab)+'</div>':'';
    // Actions selon le type d'étape
    let actions='';
    if(step.choices){
      actions=step.choices.map((c,i)=>'<button class="tour-next" data-choice="'+c.action+'"'+(i>0?' style="background:transparent;border:1px solid var(--border2);color:var(--text2);"':'')+'>'+c.label+'</button>').join('');
    } else if(step.endChoices){
      actions=step.endChoices.map(c=>'<button class="tour-next" data-end="'+c.action+'"'+(c.primary?'':' style="background:transparent;border:1px solid var(--border2);color:var(--text2);"')+'>'+c.label+'</button>').join('');
    } else if(step.next){
      actions='<button class="tour-next">'+(step.last?'Terminer ✓':'Suivant →')+'</button>';
    } else if(step.advanceWhen){
      // En attente d'une action auto-détectée, mais on offre toujours une porte de
      // sortie manuelle (en cas d'échec de résolution, erreur réseau, faute de frappe…).
      actions='<span class="tour-wait">'+(step.waitText||'En attente de ton action…')+'</span>'
        +'<button class="tour-next" style="background:transparent;border:1px solid var(--border2);color:var(--text2);">Continuer quand même →</button>';
    }
    bubble.innerHTML='<div class="tour-step-count">Étape '+(_tourIdx+1)+' / '+total+'</div>'
      +tabLine
      +'<div class="tour-title">'+step.title+'</div>'
      +'<div class="tour-text">'+(typeof step.text==='function'?step.text():step.text)+'</div>'
      +'<div class="tour-actions" style="'+(step.choices?'flex-wrap:wrap;':'')+'">'+actions+'<button class="tour-skip">Passer le tuto</button></div>';
    bubble.querySelector('.tour-skip').onclick=()=>endTour(true);
    // Boutons de choix (intro)
    bubble.querySelectorAll('.tour-next[data-choice]').forEach(b=>{
      b.onclick=()=>tourChoose(b.getAttribute('data-choice'));
    });
    // Boutons de choix de FIN (garder / repartir de zéro)
    bubble.querySelectorAll('.tour-next[data-end]').forEach(b=>{
      b.onclick=()=>tourFinish(b.getAttribute('data-end'));
    });
    // Bouton suivant simple (ni choix d'intro, ni choix de fin)
    const nextBtn=bubble.querySelector('.tour-next:not([data-choice]):not([data-end])');
    if(nextBtn)nextBtn.onclick=()=>{if(step.last)endTour(false);else tourNext();};

    if(step.centered){
      setTimeout(centerBubble,30);
    } else {
      // Vérifier un éventuel prérequis (ex. avoir au moins un ETF). Si non rempli,
      // on n'avance pas en boucle : on affiche un message et on laisse l'utilisateur
      // revenir en arrière ou quitter — pas de plantage.
      if(step.requires&&!step.requires()){
        showTourBlocked(step);
        return;
      }
      const el=typeof step.el==='function'?step.el():step.el;
      if(!el){
        // Élément introuvable : ne PAS enchaîner tourNext en cascade (risque de boucle).
        // On affiche un message de repli centré et on s'arrête proprement sur l'étape.
        showTourBlocked(step);
        return;
      }
      el.scrollIntoView({behavior:'smooth',block:'center'});
      setTimeout(()=>positionTour(el),80);
      const reposition=()=>{const e2=typeof step.el==='function'?step.el():step.el;if(e2&&tourActive())positionTour(e2);};
      window.addEventListener('scroll',reposition,{passive:true});
      window.addEventListener('resize',reposition);
      if(_tourRO){_tourRO.disconnect();_tourRO=null;}
      if(window.ResizeObserver){
        _tourRO=new ResizeObserver(()=>{if(tourActive())reposition();});
        _tourRO.observe(el);
        const modal=el.closest('.modal');if(modal&&modal!==el)_tourRO.observe(modal);
      }
      if(step.advanceWhen){
        _tourReposPoll=setInterval(reposition,400);
      }
    }
    // Avancement automatique si condition remplie
    if(_tourPoll){clearInterval(_tourPoll);_tourPoll=null;}
    if(step.advanceWhen){
      _tourPoll=setInterval(()=>{if(step.advanceWhen()){clearInterval(_tourPoll);_tourPoll=null;tourNext();}},500);
    }
  },delay);
}
renderEtfGrid();
renderMonthly();
startAutoRefresh();
refreshUndoBtn();
// ── Choix de la section au démarrage ──
// Nouvel utilisateur OU section jamais choisie → on montre le HUB d'accueil.
// Sinon → on rouvre directement la dernière section utilisée.
const _bootHub=(_isNewUser || !state._section);
if(_bootHub){ showSection('hub'); }
else { showSection(state._section); }
// Lancement automatique de la visite guidée au tout premier usage
// (portefeuille vide ET tuto jamais terminé/passé) — mais PAS si on est sur le hub.
if(!_bootHub && !state._tourDone && (!state.etfs || state.etfs.length===0)){
  setTimeout(()=>{ if(typeof startTour==='function' && (!state.etfs||state.etfs.length===0)) startTour(); }, 1400);
}
// "Quoi de neuf" pour les utilisateurs qui reviennent (jamais pour un nouveau,
// ni par-dessus la visite guidée, ni sur le hub).
setTimeout(()=>{
  try{ if(_bootHub)return;
       if(typeof tourActive==='function' && tourActive())return;
       maybeShowChangelog(_isNewUser); }catch(e){}
}, _isNewUser?0:900);

}); // DOMContentLoaded
