/* Colmigo — Demo / production-ready frontend shell
   Arquitectura: UI -> services -> adapter. En producción solo se sustituye el adapter.
*/
const CONFIG={
  mode:"demo",
  backendUrl:"",
  authRequired:false,
  plan:"free",
  appVersion:"0.2.0"
};

const DEFAULT_DATA={
  tasks:[
    {id:"internet",title:"Pagar internet",detail:"Vence mañana · $89.900",done:false,type:"pago"},
    {id:"cumple",title:"Comprar regalo",detail:"Cumpleaños de mamá · sábado",done:false,type:"recordatorio"},
    {id:"cita",title:"Cita médica",detail:"Hoy · 4:30 p. m.",done:true,type:"recordatorio"}
  ],
  documents:[
    {id:"cedula",title:"Cédula",detail:"Vigente",type:"identidad"},
    {id:"pasaporte",title:"Pasaporte",detail:"Vence en 2028",type:"viaje"},
    {id:"soat",title:"SOAT",detail:"Vence próximamente",type:"movilidad"},
    {id:"garantia",title:"Garantía lavadora",detail:"Vigente hasta 2027",type:"hogar"}
  ],
  payments:[
    {id:"internet",title:"Internet hogar",detail:"Mañana · $89.900"},
    {id:"celular",title:"Celular",detail:"10 de septiembre · $49.900"},
    {id:"admin",title:"Administración",detail:"15 de septiembre · $250.000"}
  ],
  vehicles:[{id:"vehiculo-1",title:"Mi vehículo",detail:"SOAT y tecnomecánica por controlar"}],
  family:[],
  settings:{notifications:true,biometric:false,compact:false}
};

const LIMITS={free:{tasks:10,documents:5,vehicles:1},plus:{tasks:Infinity,documents:Infinity,vehicles:Infinity}};

const Storage={
  key:"colmigo-demo-v2",
  load(){
    try{
      const raw=localStorage.getItem(this.key);
      return raw?merge(DEFAULT_DATA,JSON.parse(raw)):structured(DEFAULT_DATA);
    }catch(_){return structured(DEFAULT_DATA)}
  },
  save(data){try{localStorage.setItem(this.key,JSON.stringify(data))}catch(_){}},
  clear(){try{localStorage.removeItem(this.key)}catch(_){}}
};
function structured(x){return JSON.parse(JSON.stringify(x))}
function merge(base,extra){
  const out=structured(base);
  Object.keys(extra||{}).forEach(k=>{out[k]=extra[k]});
  return out;
}
const data=Storage.load();

const API={
  async request(path,options={}){
    if(!CONFIG.backendUrl) throw new Error("DEMO_MODE");
    const response=await fetch(CONFIG.backendUrl+path,{credentials:"include",headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
    if(!response.ok) throw new Error("API_"+response.status);
    return response.status===204?null:response.json();
  },
  async getSession(){return this.request("/api/auth/session")},
  async save(resource,payload){return this.request("/api/"+resource,{method:"POST",body:JSON.stringify(payload)})}
};

const pages={
  recordatorios:{title:"Recordatorios",sub:"Lo importante, sin tener que acordarte de todo.",icon:"fa-bell"},
  documentos:{title:"Documentos",sub:"Tus documentos importantes y sus fechas.",icon:"fa-file-lines"},
  hogar:{title:"Mi hogar",sub:"Servicios, garantías, mantenimiento y más.",icon:"fa-house"},
  movilidad:{title:"Movilidad",sub:"Ten tu vehículo y sus vencimientos bajo control.",icon:"fa-car-side"},
  pagos:{title:"Mis pagos",sub:"Saber qué viene antes de que llegue el vencimiento.",icon:"fa-wallet"},
  familia:{title:"Familia",sub:"Comparte lo que importa sin llenar el chat.",icon:"fa-people-roof"},
  colombia:{title:"Colombia",sub:"Herramientas pensadas para la vida colombiana.",icon:"fa-mountain-sun"},
  premium:{title:"Colmigo Plus",sub:"Más organización, más automatización.",icon:"fa-sparkles"},
  asistente:{title:"Asistente Colmigo",sub:"Una forma más natural de usar tu vida digital.",icon:"fa-wand-magic-sparkles"},
  cuenta:{title:"Mi cuenta",sub:"Perfil, seguridad, preferencias y suscripción.",icon:"fa-user"}
};

function iconFor(type){
  return ({pago:"fa-wallet",recordatorio:"fa-bell",identidad:"fa-id-card",viaje:"fa-passport",movilidad:"fa-car",hogar:"fa-house",documento:"fa-file-lines"})[type]||"fa-circle";
}
function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#039;"}[c]));
}
function toast(message){
  const el=document.querySelector("#appToast"); if(!el)return;
  el.querySelector(".toast-body").textContent=message;
  bootstrap.Toast.getOrCreateInstance(el,{delay:2400}).show();
}
function save(){Storage.save(data);updateDashboard()}
function updateDashboard(){
  const pending=data.tasks.filter(x=>!x.done).length;
  const pc=document.querySelector("#pendingCount"); if(pc)pc.textContent=pending;
  const dc=document.querySelector("#documentCount"); if(dc)dc.textContent=data.documents.length;
  const pay=document.querySelector("#paymentCount"); if(pay)pay.textContent=data.payments.length;
}
function limitFor(type){return LIMITS[CONFIG.plan]?.[type]??Infinity}
function canAdd(type,current){
  const max=limitFor(type);
  if(current>=max){toast("Has alcanzado el límite del plan Gratis. Colmigo Plus lo amplía.");return false}
  return true;
}

function pageMarkup(key){
  if(key==="recordatorios")return remindersPage();
  if(key==="documentos")return documentsPage();
  if(key==="pagos")return paymentsPage();
  if(key==="movilidad")return mobilityPage();
  if(key==="hogar")return homePage();
  if(key==="familia")return familyPage();
  if(key==="colombia")return colombiaPage();
  if(key==="premium")return premiumPage();
  if(key==="asistente")return assistantPage();
  if(key==="cuenta")return accountPage();
  return "";
}
function pageHead(key){
  const p=pages[key];
  return '<div class="page-head"><span class="eyebrow"><i class="fa-solid '+p.icon+' me-1"></i> Colmigo</span><h1>'+p.title+'</h1><p>'+p.sub+'</p></div>';
}
function list(items,kind){
  if(!items.length)return '<div class="empty-state"><i class="fa-regular fa-folder-open"></i><strong>Aún no tienes registros</strong><span>Usa el botón + para agregar el primero.</span></div>';
  return '<div class="content-card">'+items.map((x,i)=>'<div class="list-item"><span class="list-icon"><i class="fa-solid '+iconFor(x.type)+'"></i></span><span class="list-main"><strong>'+escapeHtml(x.title)+'</strong><small>'+escapeHtml(x.detail||"Sin detalle")+'</small></span><button class="mini-btn" data-remove="'+escapeHtml(kind)+'" data-id="'+escapeHtml(x.id)+'" aria-label="Eliminar"><i class="fa-solid fa-trash-can"></i></button></div>').join("")+'</div>';
}
function remindersPage(){
  return pageHead("recordatorios")+
    '<div class="page-actions"><button class="btn btn-dark rounded-pill" data-action="new"><i class="fa-solid fa-plus me-1"></i> Agregar</button><span class="badge-soft">'+data.tasks.length+' registros</span></div>'+
    list(data.tasks.map(x=>({...x,type:x.type||"recordatorio"})),"task")+
    '<div class="content-card info-card"><i class="fa-solid fa-cloud-arrow-up"></i><div><strong>Preparado para sincronización</strong><p>En producción estos datos pasarán de este almacenamiento local a la API y se sincronizarán entre dispositivos.</p></div></div>';
}
function documentsPage(){
  return pageHead("documentos")+
    '<div class="page-actions"><button class="btn btn-dark rounded-pill" data-action="documento"><i class="fa-solid fa-plus me-1"></i> Documento</button><span class="badge-soft">'+data.documents.length+' / '+(CONFIG.plan==="plus"?"∞":LIMITS.free.documents)+'</span></div>'+
    list(data.documents,"document")+
    '<div class="content-card info-card"><i class="fa-solid fa-shield-halved"></i><div><strong>Privacidad preparada</strong><p>La demo no sube archivos. En producción se conectará almacenamiento privado con URLs temporales y permisos por usuario.</p></div></div>';
}
function paymentsPage(){
  return pageHead("pagos")+
    '<div class="page-actions"><button class="btn btn-dark rounded-pill" data-action="pago"><i class="fa-solid fa-plus me-1"></i> Pago</button></div>'+
    list(data.payments,"payment")+
    '<div class="content-card"><span class="eyebrow">Producción</span><h3 class="mt-2 fs-5">Pagos sin guardar tarjetas</h3><p class="text-secondary mb-0">Los pagos reales se delegarán a un proveedor especializado y se confirmarán mediante webhooks del servidor.</p></div>';
}
function mobilityPage(){
  return pageHead("movilidad")+
    '<div class="content-card mobility-hero"><span class="eyebrow">Tu vehículo</span><h3>Controla SOAT, tecnomecánica y mantenimiento.</h3><p>La base está lista para agregar varios vehículos cuando uses Colmigo Plus.</p></div>'+
    list(data.vehicles,"vehicle")+
    '<div class="feature-grid"><button class="feature-tile" data-action="vehiculo"><i class="fa-solid fa-car"></i><strong>Agregar vehículo</strong><small>Placa, marca, modelo y fechas</small></button><button class="feature-tile" data-view="colombia"><i class="fa-solid fa-road"></i><strong>Colombia</strong><small>Herramientas de movilidad</small></button></div>';
}
function homePage(){
  return pageHead("hogar")+
    '<div class="feature-grid"><div class="feature-tile"><i class="fa-solid fa-bolt"></i><strong>Servicios</strong><small>Internet, energía y otros pagos</small></div><div class="feature-tile"><i class="fa-solid fa-screwdriver-wrench"></i><strong>Mantenimiento</strong><small>Garantías y tareas del hogar</small></div><div class="feature-tile"><i class="fa-solid fa-receipt"></i><strong>Garantías</strong><small>Fechas y comprobantes</small></div><div class="feature-tile"><i class="fa-solid fa-house"></i><strong>Inventario</strong><small>Próximamente</small></div></div>'+
    '<div class="content-card info-card mt-3"><i class="fa-solid fa-lightbulb"></i><div><strong>Un hogar más organizado</strong><p>En servidor podremos asociar documentos, pagos y recordatorios a cada servicio.</p></div></div>';
}
function familyPage(){
  return pageHead("familia")+
    '<div class="content-card"><div class="family-head"><span class="avatar-stack"><span>DA</span><span>+</span></span><div><strong>Espacio familiar</strong><small>Comparte sin perder privacidad</small></div></div><hr class="border-secondary-subtle"><button class="btn btn-outline-secondary rounded-pill" data-family><i class="fa-solid fa-user-plus me-1"></i> Invitar familiar</button></div>'+
    '<div class="feature-grid"><div class="feature-tile"><i class="fa-solid fa-calendar-days"></i><strong>Calendario</strong><small>Eventos compartidos</small></div><div class="feature-tile"><i class="fa-solid fa-folder-open"></i><strong>Documentos</strong><small>Con permisos</small></div><div class="feature-tile"><i class="fa-solid fa-wallet"></i><strong>Pagos</strong><small>Responsabilidades</small></div></div>';
}
function colombiaPage(){
  return pageHead("colombia")+
    '<div class="colombia-grid">'+
    [["fa-calendar-check","Festivos","Calendario colombiano"],["fa-car","Movilidad","Pico y placa y trámites"],["fa-landmark","Trámites","Guías y fuentes oficiales"],["fa-id-card","Documentos","Fechas y renovaciones"],["fa-cloud-sun","Clima","Información por ciudad"],["fa-location-dot","Servicios","Directorio preparado"]].map(x=>'<button class="feature-tile colombia-tile"><i class="fa-solid '+x[0]+'"></i><strong>'+x[1]+'</strong><small>'+x[2]+'</small></button>').join("")+
    '</div><div class="content-card info-card mt-3"><i class="fa-solid fa-circle-info"></i><div><strong>Fuentes oficiales</strong><p>Cuando se conecte el backend, las consultas que cambian con frecuencia se podrán actualizar desde fuentes oficiales sin depender de datos fijos en la app.</p></div></div>';
}
function premiumPage(){
  return '<div class="premium-hero mt-3"><span class="eyebrow">COLMIGO PLUS</span><h1 class="mt-2">Más cosas resueltas.</h1><p>La cuenta premium se activará en servidor con límites y suscripción reales.</p><button class="btn btn-light rounded-pill px-4" data-demo-premium>Ver planes</button></div>'+
    '<div class="page-head"><h1>Incluye</h1><p>Funciones diseñadas para crecer contigo.</p></div><div class="feature-grid">'+
    [["fa-folder-open","Documentos ampliados","Más capacidad y almacenamiento"],["fa-people-roof","Familia","Espacios y permisos compartidos"],["fa-wand-magic-sparkles","Automatizaciones","Reglas, recurrencias y avisos"],["fa-robot","Asistente","Acciones sobre tus propios datos"],["fa-bell","Notificaciones","Push, correo y recordatorios"],["fa-shield-halved","Seguridad","Sesiones, recuperación y 2FA"]].map(x=>'<div class="feature-tile"><i class="fa-solid '+x[0]+'"></i><strong>'+x[1]+'</strong><small>'+x[2]+'</small></div>').join("")+'</div>';
}
function assistantPage(){
  return pageHead("asistente")+
    '<div class="assistant-panel"><div class="assistant-big"><i class="fa-solid fa-wand-magic-sparkles"></i></div><h2>¿Qué quieres organizar?</h2><p>Puedes probar comandos de ejemplo. En producción el asistente tendrá acceso únicamente a los datos y permisos de tu cuenta.</p><div class="assistant-prompts"><button data-assistant="pendientes">¿Qué tengo pendiente?</button><button data-assistant="vence">¿Qué vence pronto?</button><button data-assistant="semana">Organiza mi semana</button></div><div id="assistantAnswer" class="assistant-answer" hidden></div></div>';
}
function accountPage(){
  return pageHead("cuenta")+
    '<div class="content-card profile-card"><span class="avatar-large">DA</span><div><strong>Cuenta de prueba</strong><small>Modo GitHub Pages · Sin login</small></div><span class="badge-soft">FREE</span></div>'+
    '<div class="settings-list content-card">'+
    '<button data-setting="notifications"><span><i class="fa-regular fa-bell"></i> Notificaciones</span><b>'+ (data.settings.notifications?"Activadas":"Desactivadas") +'</b></button>'+
    '<button data-setting="compact"><span><i class="fa-solid fa-mobile-screen-button"></i> Vista compacta</span><b>'+ (data.settings.compact?"Activada":"Desactivada") +'</b></button>'+
    '<button data-demo-auth><span><i class="fa-solid fa-lock"></i> Iniciar sesión</span><b>Servidor</b></button>'+
    '<button data-reset><span><i class="fa-solid fa-rotate-left"></i> Restablecer demo</span><b>Local</b></button></div>'+
    '<div class="content-card"><span class="eyebrow">Arquitectura</span><p class="mb-0 mt-2 text-secondary">Auth, correo, base de datos, almacenamiento, notificaciones, automatizaciones y pagos están separados de la interfaz para poder activarse sin rehacer las pantallas.</p></div>';
}

function showView(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  const target=document.querySelector("#view-"+view);
  if(target&&view!=="inicio")target.innerHTML=pageMarkup(view);
  if(target)target.classList.add("active");
  document.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  window.scrollTo(0,0);
  updateDashboard();
}

function openAction(type){
  const modal=document.querySelector("#actionModal");
  if(type){modal.dataset.prefill=type}
  bootstrap.Modal.getOrCreateInstance(modal).show();
}
function formMarkup(type){
  const titles={recordatorio:"Nuevo recordatorio",documento:"Nuevo documento",pago:"Nuevo pago",vehiculo:"Nuevo vehículo"};
  const labels={recordatorio:["Qué quieres recordar","Ej. Renovar seguro"],documento:["Nombre del documento","Ej. Cédula"],pago:["Qué pago es","Ej. Internet"],vehiculo:["Vehículo","Ej. Mazda 3 · ABC123"]};
  const l=labels[type]||labels.recordatorio;
  return '<div class="form-panel"><div class="form-head"><span class="list-icon"><i class="fa-solid '+iconFor(type)+'"></i></span><div><strong>'+titles[type]+'</strong><small>Se guarda solo en esta demo.</small></div></div><label>'+l[0]+'<input class="form-control" id="newTitle" placeholder="'+l[1]+'" autocomplete="off"></label><label>Detalle<input class="form-control" id="newDetail" placeholder="Fecha, valor o nota"></label><div class="d-flex gap-2 justify-content-end"><button class="btn btn-light rounded-pill" data-cancel-form>Cancelar</button><button class="btn btn-dark rounded-pill" data-save-form>Guardar</button></div></div>';
}
function saveForm(type){
  const title=document.querySelector("#newTitle")?.value.trim();
  const detail=document.querySelector("#newDetail")?.value.trim();
  if(!title){toast("Escribe un nombre.");return}
  const collection=type==="documento"?"documents":type==="pago"?"payments":type==="vehiculo"?"vehicles":"tasks";
  if(!canAdd(type==="documento"?"documents":type==="vehiculo"?"vehicles":"tasks",data[collection].length))return;
  const item={id:Date.now().toString(),title,detail:detail||"Sin detalle",type:type==="documento"?"documento":type};
  if(type==="recordatorio")item.done=false;
  data[collection].unshift(item);save();
  bootstrap.Modal.getOrCreateInstance("#actionModal").hide();
  toast("Guardado en Colmigo.");
  const current=document.querySelector(".view.active")?.id?.replace("view-","");
  if(current&&current!=="inicio")showView(current);
}
document.addEventListener("click",e=>{
  const view=e.target.closest("[data-view]"); if(view){showView(view.dataset.view);return}
  const action=e.target.closest("[data-action]"); if(action){openAction(action.dataset.action==="new"?null:action.dataset.action);return}
  const task=e.target.closest("[data-task]"); if(task){const t=data.tasks.find(x=>x.id===task.dataset.task);if(t){t.done=!t.done;save();const check=task.querySelector(".check");if(check){check.className="check "+(t.done?"done":"pending");check.innerHTML=t.done?'<i class="fa-solid fa-check"></i>':""}toast(t.done?"Listo.":"Volvió a pendientes.")}return}
  const remove=e.target.closest("[data-remove]");if(remove){const map={task:"tasks",document:"documents",payment:"payments",vehicle:"vehicles"};const c=map[remove.dataset.remove];if(c){data[c]=data[c].filter(x=>x.id!==remove.dataset.id);save();showView(document.querySelector(".view.active").id.replace("view-",""));toast("Registro eliminado.")}return}
  if(e.target.closest("[data-demo-premium]")){toast("Los planes y pagos se activarán al conectar el backend.");return}
  if(e.target.closest("[data-demo-auth]")){toast("El login queda reservado para el servidor; la demo no lo bloquea.");return}
  if(e.target.closest("[data-reset]")){Storage.clear();location.reload();return}
  const setting=e.target.closest("[data-setting]");if(setting){const key=setting.dataset.setting;data.settings[key]=!data.settings[key];save();showView("cuenta");toast("Preferencia actualizada.");return}
  if(e.target.closest("[data-family]")){toast("Invitaciones y permisos se activarán con cuentas reales.");return}
  const prompt=e.target.closest("[data-assistant]");if(prompt){const ans={pendientes:"Tienes "+data.tasks.filter(x=>!x.done).length+" pendientes en la demo.",vence:"Hay "+data.payments.length+" pagos registrados y documentos que puedes revisar.",semana:"Para la semana: revisa pagos, documentos y los recordatorios pendientes."}[prompt.dataset.assistant];const box=document.querySelector("#assistantAnswer");box.hidden=false;box.textContent=ans;return}
});
document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{const type=b.dataset.add;document.querySelector("#actionModal .modal-body").innerHTML=formMarkup(type);}));
document.querySelector("#actionModal").addEventListener("shown.bs.modal",()=>{const modal=document.querySelector("#actionModal");if(!modal.dataset.prefill)return;const type=modal.dataset.prefill;modal.dataset.prefill="";modal.querySelector(".modal-body").innerHTML=formMarkup(type)});
document.addEventListener("click",e=>{if(e.target.closest("[data-save-form]"))saveForm(document.querySelector("#actionModal .modal-body .form-panel strong")?.textContent==="Nuevo documento"?"documento":document.querySelector("#actionModal .modal-body .form-panel strong")?.textContent==="Nuevo pago"?"pago":document.querySelector("#actionModal .modal-body .form-panel strong")?.textContent==="Nuevo vehículo"?"vehiculo":"recordatorio");if(e.target.closest("[data-cancel-form]"))bootstrap.Modal.getOrCreateInstance("#actionModal").hide()});

const theme=localStorage.getItem("colmigo-theme");if(theme==="dark")document.body.classList.add("dark");
function syncThemeIcon(){const i=document.querySelector("#themeBtn i");if(i)i.className=document.body.classList.contains("dark")?"fa-solid fa-sun":"fa-solid fa-moon"}
document.querySelector("#themeBtn")?.addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("colmigo-theme",document.body.classList.contains("dark")?"dark":"light");syncThemeIcon()});syncThemeIcon();
document.querySelector("#profileBtn")?.addEventListener("click",()=>showView("cuenta"));

let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;setTimeout(()=>document.querySelector("#installBanner")?.classList.add("show"),1800)});
document.querySelector("#installBtn")?.addEventListener("click",async()=>{if(!deferredPrompt){toast("En iPhone: Compartir → Añadir a pantalla de inicio.");return}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.querySelector("#installBanner")?.classList.remove("show")});
document.querySelector("#installClose")?.addEventListener("click",()=>document.querySelector("#installBanner")?.classList.remove("show"));

if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
window.addEventListener("load",()=>setTimeout(()=>document.querySelector("#splash")?.classList.add("hide"),450));
updateDashboard();
