/* NT3105 CMS Studio V3 — loaded only on Admin page. Backend authorization: Supabase RLS. */
(()=>{
"use strict";
const KEY="main",BUCKET="nt3105-content";
const groups=[
 ["overview","◈","Tổng quan"],["hero","▧","Đầu trang"],["about","♡","Về mình"],
 ["gallery","▦","Thư viện ảnh"],["music","♫","Âm nhạc"],["effects","✧","Hiệu ứng"],
 ["brand","◉","Thương hiệu"],["navigation","☷","Menu"],
 ["skills","◇","Kỹ năng"],["projects","▤","Dự án"],["journey","↗","Hành trình"],
 ["contact","✉","Liên hệ"],["socials","◎","Mạng xã hội"],["theme","◐","Màu sắc"],
 ["layout","▥","Bố cục"],["seo","⌕","SEO"],["footer","⌑","Chân trang"],
 ["comments","☏","Bình luận"]
];
const defaults={
 hero:{title:"Xin chào, mình là Ngân Tú Dev.",subtitle:"Đang học lập trình và khám phá công nghệ.",image:"",position:50,overlay:35,visible:true},
 about:{title:"Một chút về mình",body:"",visible:false},
 gallery:[],music:{enabled:true,tracks:[]},
 effects:{glass:true,reveal:true,parallax:true,glow:true,softMotion:true,intensity:35,blur:18},
 brand:{logoText:"NT3105",tagline:"Code · Life · Music",favicon:""},
 navigation:{home:"Trang chủ",about:"Về mình",skills:"Kỹ năng",projects:"Dự án",contact:"Liên hệ"},
 skills:[],projects:[],
 journey:{title:"Hành trình",body:"",visible:true},
 contact:{title:"Kết nối với mình",description:"",email:"",visible:true},
 socials:{telegram:"",facebook:"",tiktok:"",github:""},
 theme:{accent:"#a6b9ff",surface:"#111728",text:"#f6f8ff",light:false},
 layout:{radius:22,spacing:24,cardColumns:3},
 seo:{title:"NT3105 | Website cá nhân",description:"Lập trình và những dự án của NT3105.",ogImage:""},
 footer:{text:"© 2026 NT3105",credit:"Made with HTML, CSS & JavaScript"},
 comments:{enabled:true,title:"Lời nhắn từ khách"}
};
const schema={
hero:[["title","Tiêu đề","text"],["subtitle","Mô tả đầu trang","textarea"],["image","Ảnh đầu trang","image"],["position","Vị trí ảnh (%)","range",0,100],["overlay","Độ tối lớp phủ (%)","range",0,90],["visible","Hiện đầu trang","check"]],
about:[["title","Tiêu đề","text"],["body","Nội dung giới thiệu","textarea"],["visible","Hiện phần Về mình","check"]],
music:[["enabled","Bật trình phát nhạc","check"]],
effects:[["glass","Kính mờ Liquid Glass","check"],["reveal","Hiện dần khi cuộn","check"],["parallax","Parallax","check"],["glow","Ánh sáng tương tác","check"],["softMotion","Chuyển động đàn hồi","check"],["intensity","Cường độ hiệu ứng","range",0,100],["blur","Độ mờ kính","range",0,35]],
brand:[["logoText","Chữ logo","text"],["tagline","Khẩu hiệu","text"],["favicon","Favicon","image"]],
navigation:[["home","Mục Trang chủ","text"],["about","Mục Về mình","text"],["skills","Mục Kỹ năng","text"],["projects","Mục Dự án","text"],["contact","Mục Liên hệ","text"]],
journey:[["title","Tiêu đề Hành trình","text"],["body","Nội dung","textarea"],["visible","Hiển thị","check"]],
contact:[["title","Tiêu đề Liên hệ","text"],["description","Lời nhắn","textarea"],["email","Email công khai","text"],["visible","Hiển thị","check"]],
socials:[["telegram","Telegram URL","url"],["facebook","Facebook URL","url"],["tiktok","TikTok URL","url"],["github","GitHub URL","url"]],
theme:[["accent","Màu nhấn","color"],["surface","Nền tối","color"],["text","Màu chữ","color"],["light","Chế độ sáng","check"]],
layout:[["radius","Độ bo góc","range",0,44],["spacing","Khoảng cách","range",8,52],["cardColumns","Số cột thẻ","range",1,4]],
seo:[["title","Tiêu đề SEO","text"],["description","Mô tả SEO","textarea"],["ogImage","Ảnh chia sẻ","image"]],
footer:[["text","Bản quyền","text"],["credit","Dòng ghi chú","text"]],
comments:[["enabled","Hiện phần bình luận","check"],["title","Tiêu đề phần bình luận","text"]]
};
const listSchemas={
 gallery:[["title","Tiêu đề","text"],["src","Ảnh","image"],["visible","Công khai","check"]],
 skills:[["name","Tên kỹ năng","text"],["description","Mô tả","text"],["visible","Công khai","check"]],
 projects:[["title","Tên dự án","text"],["description","Mô tả","textarea"],["url","URL","url"],["image","Ảnh","image"],["visible","Công khai","check"]],
 tracks:[["title","Tên bài hát","text"],["artist","Nghệ sĩ","text"],["cover","Ảnh bìa","image"],["src","File nhạc","audio"],["visible","Công khai","check"]]
};
const $=s=>document.querySelector(s);
const clean=(s)=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const validUrl=(s)=>{try{const u=new URL(s);return ["https:","http:"].includes(u.protocol)}catch{return false}};
const safeAsset=(s)=>validUrl(s)?clean(s):"";
const clone=o=>JSON.parse(JSON.stringify(o));
function merge(a,b){for(const [k,v] of Object.entries(b||{})){if(Array.isArray(v))a[k]=v;else if(v&&typeof v==="object")a[k]=Object.assign({},a[k]||{},v);else a[k]=v;}return a}
function initial(){return clone(defaults)}
let client=null,state=initial(),panel=null,tab="overview",lastPublished=null,loadOkay=false,publishing=false,previewMobile=false,pendingUploads=0;
const toast=(s,isError=false)=>{const t=$("#cmsNotice");if(t){t.textContent=s;t.className="cms-notice "+(isError?"error":"");}};
function makeField(area,key,label,type,min=0,max=100,idx=-1){
 const source=area==="tracks"?state.music.tracks:state[area];
 const val=idx>=0?source[idx]?.[key]:source?.[key];
 const attrs=idx>=0?' data-idx="'+idx+'"':'';
 const path='data-area="'+area+'" data-key="'+key+'"'+attrs;
 if(type==="check")return '<label class="cms-check"><input type="checkbox" '+path+' '+(val?"checked":"")+'/><span>'+clean(label)+'</span></label>';
 if(type==="range")return '<label class="cms-field"><span>'+clean(label)+' <output>'+Number(val||0)+'</output></span><input type="range" min="'+min+'" max="'+max+'" value="'+Number(val||0)+'" '+path+' /></label>';
 if(type==="image"||type==="audio")return '<div class="cms-field"><span>'+clean(label)+'</span><div class="cms-upload">'+(type==="image"&&safeAsset(val)?'<img src="'+safeAsset(val)+'" alt="Ảnh đang chọn" loading="lazy">':"")+'<input class="cms-input" type="url" placeholder="Hoặc dán liên kết HTTPS" value="'+clean(val||"")+'" '+path+'/><label class="cms-file">↥ Tải '+(type==="audio"?"nhạc":"ảnh")+'<input type="file" accept="'+(type==="audio"?"audio/mpeg,audio/wav,audio/ogg,audio/mp4":"image/jpeg,image/png,image/webp,image/gif")+'" data-upload-area="'+area+'" data-upload-key="'+key+'"'+attrs+' /></label></div></div>';
 const tag=type==="textarea"?'<textarea class="cms-input" rows="3" '+path+'>'+clean(val||"")+'</textarea>':'<input class="cms-input" type="'+(type==="color"?"color":type==="url"?"url":"text")+'" maxlength="400" value="'+clean(val||"")+'" '+path+' />';
 return '<label class="cms-field"><span>'+clean(label)+'</span>'+tag+'</label>';
}
function listEditor(name,headline) {
 const items=name==="tracks"?state.music.tracks:state[name];
 return '<div class="cms-list-head"><h3>'+headline+' <small>('+items.length+')</small></h3><button type="button" data-add="'+name+'" class="cms-btn">＋ Thêm mới</button></div>'+
 (items.length?items.map((it,i)=>'<div class="cms-item"><div class="cms-item-head"><b>#'+(i+1)+' · '+clean(it.title||it.name||"Mới")+'</b><div><button type="button" data-move="'+name+'" data-index="'+i+'" data-dir="-1" aria-label="Di chuyển lên">↑</button><button type="button" data-move="'+name+'" data-index="'+i+'" data-dir="1" aria-label="Di chuyển xuống">↓</button><button type="button" data-delete="'+name+'" data-index="'+i+'" aria-label="Xoá">✕</button></div></div>'+listSchemas[name].map(f=>makeField(name,f[0],f[1],f[2],f[3]||0,f[4]||100,i)).join("")+'</div>').join(""):'<div class="cms-empty">Chưa có nội dung. Nhấn “Thêm mới” để bắt đầu.</div>');
}
function renderEditor(){
 const root=$("#cmsEditor");if(!root)return;
 if(tab==="overview"){
   root.innerHTML='<h2>Bảng điều khiển nội dung</h2><p>Chỉnh trên Admin → Lưu bản nháp → Xem trước → Xuất bản. Mọi thay đổi chỉ xuất hiện trên website công khai sau khi xuất bản.</p>'+
   '<div class="cms-metrics"><div><strong>18</strong><span>Phần quản trị</span></div><div><strong>'+state.gallery.length+'</strong><span>Ảnh</span></div><div><strong>'+state.music.tracks.length+'</strong><span>Bài hát</span></div></div>'+
   '<div class="cms-info">Bảo mật: Supabase RLS chỉ cho tài khoản Admin có quyền cập nhật. Ảnh và nhạc tải lên bucket công khai; không tải tệp riêng tư.</div>';
   return;
 }
 if(tab==="gallery"||tab==="skills"||tab==="projects"){
   root.innerHTML=listEditor(tab,{gallery:"Ảnh “Một chút về mình”",skills:"Danh sách kỹ năng",projects:"Danh sách dự án"}[tab]);return;
 }
 let fields=schema[tab]||[];
 root.innerHTML='<h2>'+clean(groups.find(x=>x[0]===tab)?.[2]||"")+'</h2>'+
 '<div class="cms-fields">'+fields.map(f=>makeField(tab,...f)).join("")+'</div>'+
 (tab==="music"?listEditor("tracks","Danh sách bài hát"):"")+
 (tab==="comments"?'<p class="cms-info">Bảng kiểm duyệt bình luận gốc vẫn ở bên dưới. Cấu hình này chỉ kiểm soát cách hiện nhận xét trên website chính.</p>':"");
}
function renderPreview(){
 const p=$("#cmsLivePreview");if(!p)return;
 const accent=state.theme.accent||"#a6b9ff",cover=safeAsset(state.hero.image);
 p.style.setProperty("--cms-preview-accent",accent);
 p.style.borderRadius=Number(state.layout.radius||18)+"px";
 p.innerHTML='<div class="cms-preview-hero" style="'+(cover?'background-image:linear-gradient(90deg,rgba(0,0,0,.6),rgba(0,0,0,.25)),url(\''+cover+'\');':'')+'background-position:center '+Number(state.hero.position||50)+'%">'+
 '<div class="cms-preview-logo">'+clean(state.brand.logoText)+'</div><small>'+clean(state.brand.tagline)+'</small>'+
 '<h2>'+clean(state.hero.title||"Trang chủ")+'</h2><p>'+clean(state.hero.subtitle||"")+'</p></div>'+
 '<div class="cms-preview-about"><h3>'+clean(state.about.title)+'</h3><p>'+clean(state.about.body||"Bạn có thể chỉnh nội dung từ bảng quản trị.")+'</p></div>'+
 '<div class="cms-preview-gallery">'+state.gallery.filter(x=>x.visible!==false).slice(0,5).map(x=>'<div>'+ (safeAsset(x.src)?'<img src="'+safeAsset(x.src)+'" alt="'+clean(x.title||"Ảnh")+'">':'<span>▦</span>') +'<small>'+clean(x.title||"Ảnh")+'</small></div>').join("")+'</div>'+
 '<div class="cms-preview-bottom">♫ '+clean(state.music.tracks[0]?.title||"Playlist")+'　·　'+clean(state.footer.text)+'</div>';
}
function switchTab(name){
 tab=name;
 document.querySelectorAll(".cms-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 $("#cmsCurrent").textContent=groups.find(x=>x[0]===tab)?.[2]||"";
 renderEditor();renderPreview();
 if(name==="comments")$("#commentList")?.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function getList(area){return area==="tracks"?state.music.tracks:state[area]}
function handleChanges(event){
 const t=event.target;if(!(t instanceof HTMLElement))return;
 if(t.matches("[data-area][data-key]")){
   const area=t.dataset.area,key=t.dataset.key,idx=t.dataset.idx;
   const record=idx!==undefined?getList(area)[Number(idx)]:state[area];
   if(!record)return;
   let val=t.type==="checkbox"?t.checked:t.type==="range"?Number(t.value):t.value;
   record[key]=val;
   if(t.type==="range")t.closest("label")?.querySelector("output")?.replaceChildren(String(val));
   renderPreview();
 }
}
function addItem(name){
 const base={gallery:{title:"Ảnh mới",src:"",visible:true},skills:{name:"Kỹ năng mới",description:"",visible:true},
 projects:{title:"Dự án mới",description:"",url:"",image:"",visible:true},
 tracks:{title:"Bài hát mới",artist:"",cover:"",src:"",visible:true}};
 getList(name).push({...base[name]});renderEditor();renderPreview();
}
function moveItem(name,idx,delta){const list=getList(name),to=idx+delta;if(to<0||to>=list.length)return;[list[idx],list[to]]=[list[to],list[idx]];renderEditor();renderPreview()}
function removeItem(name,idx){if(!confirm("Bỏ mục này khỏi bản nháp? Tệp đã tải lên Storage sẽ không bị xoá."))return;getList(name).splice(idx,1);renderEditor();renderPreview()}
async function uploadFile(input){
 if(!client){toast("Hãy đăng nhập Admin trước.",true);return}
 const file=input.files?.[0];if(!file)return;
 const area=input.dataset.uploadArea,key=input.dataset.uploadKey,idx=input.dataset.idx;
 const isAudio=key==="src"&&area==="tracks";
 const types=isAudio?["audio/mpeg","audio/wav","audio/ogg","audio/mp4"]:["image/jpeg","image/png","image/webp","image/gif"];
 if(!types.includes(file.type)||file.size>20*1024*1024){toast("Định dạng không hợp lệ hoặc vượt giới hạn 20 MB.",true);return}
 pendingUploads++;input.disabled=true;toast("Đang tải tệp lên Supabase Storage...");
 const ext=(file.name.split(".").pop()||"bin").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,6);
 const dir=area==="tracks"?(key==="cover"?"covers":"music"):area==="gallery"?"gallery":area;
 const filepath=dir+"/"+crypto.randomUUID()+"."+ext;
 try{
   const {error}=await client.storage.from(BUCKET).upload(filepath,file,{contentType:file.type,cacheControl:"3600",upsert:false});
   if(error)throw error;
   const {data}=client.storage.from(BUCKET).getPublicUrl(filepath);
   const record=idx!==undefined?getList(area)[Number(idx)]:state[area];
   if(!record)throw Error("Mục đã bị xoá trong khi tải tệp.");
   record[key]=data.publicUrl;renderEditor();renderPreview();
   toast("✓ Đã tải lên. Hãy lưu nháp và xuất bản khi sẵn sàng.");
 }catch(e){console.error(e);toast("Không tải được: "+String(e.message||e).slice(0,100),true)}
 finally{pendingUploads=Math.max(0,pendingUploads-1); if(input.isConnected)input.disabled=false}
}
async function saveDraft(){
 if(!client||!loadOkay){toast("Chưa kết nối CMS. Hãy chạy SQL migration trước.",true);return false}
 if(pendingUploads>0){toast("Đang tải ảnh/nhạc lên, hãy đợi tải xong rồi lưu.",true);return false}
 $("#cmsSave").disabled=true;
 try{
   const {error}=await client.from("nt3105_cms_drafts").upsert({id:KEY,content:state,updated_at:new Date().toISOString()});
   if(error)throw error;toast("✓ Bản nháp đã lưu. Website công khai chưa thay đổi.");return true;
 }catch(e){console.error(e);toast("Không thể lưu nháp: "+String(e.message||e).slice(0,120),true);return false}
 finally{$("#cmsSave").disabled=false}
}
async function publish(){
 if(publishing)return;
 if(!confirm("Xuất bản nội dung mới cho khách truy cập nt3105.io.vn?"))return;
 if(!await saveDraft())return;
 publishing=true;$("#cmsPublish").disabled=true;
 try{
   const {error}=await client.from("nt3105_cms_published").upsert({id:KEY,content:{...state,__cmsReady:true},updated_at:new Date().toISOString()});
   if(error)throw error;
   lastPublished=clone(state);
   toast("✓ Đã xuất bản lên nt3105.io.vn. Trang khách đang mở sẽ tự kiểm tra cập nhật.");
 }catch(e){console.error(e);toast("Xuất bản thất bại: "+String(e.message||e).slice(0,120),true)}
 finally{publishing=false;$("#cmsPublish").disabled=false}
}
async function loadData(){
 const [draft,published]=await Promise.all([
 client.from("nt3105_cms_drafts").select("content").eq("id",KEY).maybeSingle(),
 client.from("nt3105_cms_published").select("content").eq("id",KEY).maybeSingle()
 ]);
 if(draft.error||published.error){console.error(draft.error||published.error);loadOkay=false;toast("Chưa có bảng CMS/RLS: hãy chạy supabase/nt3105_cms_v3.sql.",true);$("#cmsSave").disabled=true;$("#cmsPublish").disabled=true;return}
 loadOkay=true;
 lastPublished=published.data?.content?merge(initial(),published.data.content):null;
 state=merge(initial(),draft.data?.content||published.data?.content||{});
 $("#cmsSave").disabled=false;$("#cmsPublish").disabled=false;
 switchTab(tab);toast("✓ Đã tải bản nháp từ Supabase.");
}
function downloadJson(){
 const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download="nt3105-cms-draft.json";link.click();URL.revokeObjectURL(url);
}
function restorePublished(){
 if(!lastPublished){toast("Chưa có phiên bản đã xuất bản để khôi phục.",true);return}
 if(!confirm("Khôi phục dữ liệu đã xuất bản vào bản nháp? Website công khai không thay đổi."))return;
 state=clone(lastPublished);renderEditor();renderPreview();toast("✓ Đã phục hồi bản nháp. Chọn Lưu nháp để lưu lại.");
}
async function importJSON(file){
 if(!file||file.size>512000){toast("Tệp JSON phải nhỏ hơn 500 KB.",true);return}
 try{
  const x=JSON.parse(await file.text());
  if(!x||typeof x!=="object"||Array.isArray(x))throw Error("Không phải cấu hình CMS hợp lệ.");
  const unknown=Object.keys(x).filter(k=>!Object.hasOwn(defaults,k));
  if(unknown.length)throw Error("Tệp có trường không hỗ trợ.");
  if(x.gallery&&!Array.isArray(x.gallery))throw Error("Gallery phải là mảng.");
  if(x.skills&&!Array.isArray(x.skills))throw Error("Skills phải là mảng.");
  if(x.projects&&!Array.isArray(x.projects))throw Error("Projects phải là mảng.");
  if(x.music?.tracks&&!Array.isArray(x.music.tracks))throw Error("Playlist phải là mảng.");
  if(!confirm("Thay toàn bộ bản nháp hiện tại bằng dữ liệu JSON?"))return;
  state=merge(initial(),x);renderEditor();renderPreview();toast("✓ Đã nhập vào bản xem trước. Hãy Lưu nháp để lưu.");
 }catch(error){console.error(error);toast("Không đọc được tệp JSON hợp lệ.",true)}
}
function setupUI(){
 const parent=$("#portal");if(!parent||$("#cmsStudio"))return;
 const section=document.createElement("section");section.id="cmsStudio";section.className="cms-studio glass";
 section.innerHTML='<div class="cms-head"><div><span class="cms-kicker">CONTENT STUDIO · V3</span><h2>Quản trị website</h2><p>Sửa nội dung · Xem trước · Lưu nháp · Xuất bản</p></div><div class="cms-actions"><button type="button" id="cmsExport" class="cms-btn">↓ JSON</button><button type="button" id="cmsImport" class="cms-btn">↑ Nhập JSON</button><input id="cmsImportFile" type="file" accept="application/json,.json" hidden><button type="button" id="cmsRestore" class="cms-btn">↶ Bản đã xuất bản</button><button type="button" id="cmsSave" class="cms-btn">Lưu nháp</button><button type="button" id="cmsPublish" class="cms-btn cms-primary">Xuất bản ↗</button></div></div>'+
 '<div id="cmsNotice" class="cms-notice" role="status" aria-live="polite">Đang xác thực kết nối CMS...</div>'+
 '<div class="cms-tabs" role="navigation" aria-label="Chuyên mục Admin">'+groups.map(g=>'<button class="cms-tab'+(g[0]==="overview"?" active":"")+'" type="button" data-tab="'+g[0]+'"><span>'+g[1]+'</span> '+g[2]+'</button>').join("")+'</div>'+
 '<div class="cms-workspace"><div class="cms-edit-panel"><div class="cms-panel-title"><h3 id="cmsCurrent">Tổng quan</h3><span>BẢN NHÁP</span></div><div id="cmsEditor"></div></div><div class="cms-preview-panel"><div class="cms-panel-title"><h3>Xem trước</h3><button type="button" id="cmsDevice" class="cms-btn">📱 Điện thoại</button></div><div id="cmsLivePreview"></div><p>Bản xem trước nội dung; website thực tế sẽ giữ hiệu ứng riêng đang có.</p></div></div>';
 parent.insertBefore(section,parent.firstChild);
 section.addEventListener("input",handleChanges);
 section.addEventListener("change",e=>{
   if(e.target instanceof HTMLInputElement&&e.target.type==="file")uploadFile(e.target);
   else handleChanges(e);
 });
 section.addEventListener("click",e=>{
   const target=e.target.closest("button");if(!target)return;
   if(target.dataset.tab)switchTab(target.dataset.tab);
   if(target.dataset.add)addItem(target.dataset.add);
   if(target.dataset.move)moveItem(target.dataset.move,Number(target.dataset.index),Number(target.dataset.dir));
   if(target.dataset.delete)removeItem(target.dataset.delete,Number(target.dataset.index));
 });
 $("#cmsSave").addEventListener("click",saveDraft);
 $("#cmsPublish").addEventListener("click",publish);
 $("#cmsExport").addEventListener("click",downloadJson);
 $("#cmsRestore").addEventListener("click",restorePublished);
 $("#cmsImport").addEventListener("click",()=>$("#cmsImportFile").click());
 $("#cmsImportFile").addEventListener("change",e=>{importJSON(e.target.files?.[0]);e.target.value="";});
 $("#cmsDevice").addEventListener("click",()=>{
   previewMobile=!previewMobile;
   $("#cmsLivePreview").classList.toggle("cms-mobile",previewMobile);
   $("#cmsDevice").textContent=previewMobile?"▣ Máy tính":"📱 Điện thoại";
 });
 renderEditor();renderPreview();
}
window.addEventListener("nt3105:admin-auth",async event=>{
 if(!event.detail?.active){client=null;loadOkay=false;state=initial();lastPublished=null;pendingUploads=0;document.getElementById("cmsStudio")?.remove();return}
 client=event.detail.client;setupUI();await loadData();
});
})();
