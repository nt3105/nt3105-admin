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
 ["comments","☏","Bình luận"],["personal","☆","Góc riêng"],["code","</>","Góc code"],["donate","♧","Ủng hộ"]
];
const defaults={
 hero:{title:"Xin chào, mình là Ngân Tú Dev.",subtitle:"Đang học lập trình và khám phá công nghệ.",image:"",position:50,overlay:35,visible:true,roles:"",primaryLabel:"",primaryUrl:"",secondaryLabel:"",secondaryUrl:""},
 about:{title:"Một chút về mình",body:"",visible:false},
 gallery:[],gallerySettings:{title:"Một chút ngoài những dòng code.",subtitle:"NHỮNG KHOẢNH KHẮC CỦA MÌNH"},
 skillsSettings:{title:"Kỹ năng & công cụ.",description:"Những ngôn ngữ và công cụ mình đang thực hành."},
 projectsSettings:{title:"Những gì mình làm."},socialsSettings:{title:"Kết nối với mình."},
 music:{enabled:true,tracks:[]},
 effects:{glass:true,reveal:true,parallax:true,glow:true,softMotion:true,intensity:35,blur:18},
 brand:{logoText:"NT3105",tagline:"Code · Life · Music",favicon:""},
 navigation:{home:"Trang chủ",about:"Về mình",skills:"Kỹ năng",projects:"Dự án",contact:"Liên hệ"},
 skills:[],projects:[],
 journey:{title:"Hành trình",body:"",visible:true},
 contact:{title:"Kết nối với mình",description:"",email:"",visible:true},
 socials:{telegram:"",facebook:"",tiktok:"",github:""},
 theme:{accent:"#a6b9ff",background:"#080b14",surface:"#111728",text:"#f6f8ff",light:false},
 layout:{radius:22,spacing:24,cardColumns:3},
 seo:{title:"NT3105 | Website cá nhân",description:"Lập trình và những dự án của NT3105.",ogImage:""},
 footer:{text:"© 2026 NT3105",credit:"Made with HTML, CSS & JavaScript"},
 comments:{enabled:true,title:"Lời nhắn từ khách"},
 personal:{visible:true,title:"Một chút về sở thích của mình.",memoryTitle:"Giữ lại một khoảnh khắc.",memoryDescription:"Những tấm ảnh ngoài màn hình code."},
 code:{visible:true,title:"Góc code.",description:"Những ví dụ nhỏ để đọc, thử và học. Chọn ngôn ngữ rồi sao chép để chạy trên máy.",c:"",objc:"",swift:"",cOutput:"",objcOutput:"",swiftOutput:"",pythonHello:"",pythonHelloOutput:"",pythonIntro:"",pythonIntroOutput:"",pythonCalculator:"",pythonCalculatorOutput:""},
 donate:{visible:true,title:"Góp gió thành bão.",qrImage:""}
};
const schema={
hero:[["title","Tiêu đề","text"],["subtitle","Mô tả đầu trang","textarea"],["image","Ảnh đầu trang","image"],["position","Vị trí ảnh (%)","range",0,100],["overlay","Độ tối lớp phủ (%)","range",0,90],["visible","Hiện đầu trang","check"],["roles","Vai trò luân phiên (cách nhau bằng dấu phẩy)","textarea"],["primaryLabel","Chữ nút chính","text"],["primaryUrl","Liên kết nút chính (https:// hoặc #mục)","text"],["secondaryLabel","Chữ nút phụ","text"],["secondaryUrl","Liên kết nút phụ","text"]],
about:[["title","Tiêu đề","text"],["body","Nội dung giới thiệu","textarea"],["visible","Hiện phần Về mình","check"]],
music:[["enabled","Bật trình phát nhạc","check"]],
effects:[["glass","Kính mờ Liquid Glass","check"],["reveal","Hiện dần khi cuộn","check"],["parallax","Parallax","check"],["glow","Ánh sáng tương tác","check"],["softMotion","Chuyển động đàn hồi","check"],["intensity","Cường độ hiệu ứng","range",0,100],["blur","Độ mờ kính","range",0,35]],
brand:[["logoText","Chữ logo","text"],["tagline","Khẩu hiệu","text"],["favicon","Favicon","image"]],
navigation:[["home","Mục Trang chủ","text"],["about","Mục Về mình","text"],["skills","Mục Kỹ năng","text"],["projects","Mục Dự án","text"],["contact","Mục Liên hệ","text"],["journey","Mục Hành trình","text"],["personal","Mục Góc riêng","text"],["code","Mục Góc code","text"],["donate","Mục Ủng hộ","text"],["social","Mục Mạng xã hội","text"]],
journey:[["title","Tiêu đề Hành trình","text"],["body","Nội dung","textarea"],["visible","Hiển thị","check"]],
contact:[["title","Tiêu đề Liên hệ","text"],["description","Lời nhắn","textarea"],["email","Email công khai","text"],["visible","Hiển thị","check"]],
socials:[["telegram","Telegram URL","url"],["facebook","Facebook URL","url"],["tiktok","TikTok URL","url"],["github","GitHub URL","url"]],
theme:[["accent","Màu nhấn","color"],["background","Màu nền tổng thể","color"],["surface","Nền tối","color"],["text","Màu chữ","color"],["light","Chế độ sáng","check"]],
layout:[["radius","Độ bo góc","range",0,44],["spacing","Khoảng cách","range",8,52],["cardColumns","Số cột thẻ","range",1,4]],
seo:[["title","Tiêu đề SEO","text"],["description","Mô tả SEO","textarea"],["ogImage","Ảnh chia sẻ","image"]],
footer:[["text","Bản quyền","text"],["credit","Dòng ghi chú","text"]],
comments:[["enabled","Hiện phần bình luận","check"],["title","Tiêu đề phần bình luận","text"]],
 gallerySettings:[["title","Tiêu đề thư viện","text"],["subtitle","Dòng giới thiệu thư viện","text"]],
 skillsSettings:[["title","Tiêu đề kỹ năng","text"],["description","Mô tả kỹ năng","textarea"]],
 projectsSettings:[["title","Tiêu đề dự án","text"]],
 socialsSettings:[["title","Tiêu đề liên kết mạng xã hội","text"]],
 personal:[["visible","Hiển thị Góc riêng","check"],["title","Tiêu đề Góc riêng","text"],["memoryTitle","Tiêu đề khung ảnh","text"],["memoryDescription","Mô tả khung ảnh","textarea"]],
 code:[["visible","Hiển thị Góc code","check"],["title","Tiêu đề Góc code","text"],["description","Giới thiệu Góc code","textarea"],["pythonHello","hello.py — Mã nguồn Python (để trống dùng mẫu)","textarea"],["pythonHelloOutput","hello.py — Kết quả Output (để trống dùng mẫu)","textarea"],["pythonIntro","intro.py — Mã nguồn Python (để trống dùng mẫu)","textarea"],["pythonIntroOutput","intro.py — Kết quả Output (để trống dùng mẫu)","textarea"],["pythonCalculator","calculator.py — Mã nguồn Python (để trống dùng mẫu)","textarea"],["pythonCalculatorOutput","calculator.py — Kết quả Output (để trống dùng mẫu)","textarea"]],
 donate:[["visible","Hiển thị mục ủng hộ","check"],["title","Tiêu đề mục ủng hộ","text"],["qrImage","Ảnh QR đang hiển thị (nếu có)","image"]]
};
const listSchemas={
 gallery:[["title","Tiêu đề","text"],["src","Ảnh gốc","image"],["thumb","Ảnh thumbnail (tuỳ chọn)","image"],["visible","Công khai","check"]],
 skills:[["name","Tên kỹ năng","text"],["description","Mô tả","text"],["icon","Icon kỹ năng (URL)","image"],["level","Mức tiến độ (%)","range",0,100],["status","Nhãn tiến độ","text"],["visible","Công khai","check"]],
 projects:[["title","Tên dự án","text"],["description","Mô tả","textarea"],["url","URL demo","url"],["image","Ảnh","image"],["type","Loại dự án","text"],["tags","Các thẻ (ngăn cách bằng dấu phẩy)","text"],["source","URL mã nguồn","url"],["visible","Công khai","check"]],
 tracks:[["title","Tên bài hát","text"],["artist","Nghệ sĩ","text"],["cover","Ảnh bìa","image"],["src","File nhạc","audio"],["visible","Công khai","check"]]
};
const $=s=>document.querySelector(s);
const clean=(s)=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const validUrl=(s)=>{try{const u=new URL(s);return ["https:","http:"].includes(u.protocol)}catch{return false}};
const safeAsset=(s)=>validUrl(s)?clean(s):"";
const clone=o=>JSON.parse(JSON.stringify(o));
const isHttpUrl=v=>{try{const u=new URL(String(v));return u.protocol==="https:"}catch{return false}};
function validateContent(content){
 const errors=[];
 const urlFields=[["hero","image"],["hero","primaryUrl"],["hero","secondaryUrl"],["brand","favicon"],["seo","ogImage"],["donate","qrImage"]];
 for(const [group,key] of urlFields){
  const val=content[group]?.[key];if(!val)continue;
  if(group==="hero"&&key.endsWith("Url")&&/^#[a-zA-Z0-9_-]+$/.test(val))continue;
  if(!isHttpUrl(val))errors.push(group+"."+key+" cần URL http/https hợp lệ.");
 }
 if(content.socials){
  for(const [kind,url] of Object.entries(content.socials)){
    if(url&&!isHttpUrl(url))errors.push("Mạng xã hội "+kind+": cần liên kết HTTPS.");
  }
 }
 for(const [area,fields] of Object.entries({gallery:["src","thumb"],projects:["image","url","source"],tracks:["cover","src"],skills:["icon"]})){
  const list=area==="tracks"?content.music?.tracks:content[area];
  if(!Array.isArray(list))continue;
  list.forEach((item,i)=>fields.forEach(key=>{const val=item?.[key];
    if(val&&!isHttpUrl(val)&&!(key==="url"&&/^#[a-zA-Z0-9_-]+$/.test(val)))errors.push(area+" "+(i+1)+" — "+key+" không hợp lệ.");
  }));
 }
 if(content.music?.tracks?.length>100||content.gallery?.length>100)errors.push("Danh sách vượt giới hạn 100 mục.");
 return errors;
}
function merge(a,b){for(const [k,v] of Object.entries(b||{})){if(Array.isArray(v))a[k]=v;else if(v&&typeof v==="object")a[k]=Object.assign({},a[k]||{},v);else a[k]=v;}return a}
function initial(){return clone(defaults)}
let client=null,state=initial(),editingState=initial(),panel=null,tab="overview",lastPublished=null,loadOkay=false,publishing=false,previewMobile=true,pendingUploads=0;
let previewRevision=0,awaitingRevision=0,confirmedRevision=0;
let previewFrameReady=false,previewRefreshTimer=null,previewResizeObserver=null;
const toast=(s,isError=false)=>{const t=$("#cmsNotice");if(t){t.textContent=s;t.className="cms-notice "+(isError?"error":"");}};
function makeField(area,key,label,type,min=0,max=100,idx=-1){
 const source=area==="tracks"?editingState.music.tracks:editingState[area];
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
 const items=name==="tracks"?editingState.music.tracks:editingState[name];
 return '<div class="cms-list-head"><h3>'+headline+' <small>('+items.length+')</small></h3><button type="button" data-add="'+name+'" class="cms-btn">＋ Thêm mới</button></div>'+
 (items.length?items.map((it,i)=>'<div class="cms-item"><div class="cms-item-head"><b>#'+(i+1)+' · '+clean(it.title||it.name||"Mới")+'</b><div><button type="button" data-move="'+name+'" data-index="'+i+'" data-dir="-1" aria-label="Di chuyển lên">↑</button><button type="button" data-move="'+name+'" data-index="'+i+'" data-dir="1" aria-label="Di chuyển xuống">↓</button><button type="button" data-delete="'+name+'" data-index="'+i+'" aria-label="Xoá">✕</button></div></div>'+listSchemas[name].map(f=>makeField(name,f[0],f[1],f[2],f[3]||0,f[4]||100,i)).join("")+'</div>').join(""):'<div class="cms-empty">Chưa có nội dung. Nhấn “Thêm mới” để bắt đầu.</div>');
}
function renderEditor(){
 const root=$("#cmsEditor");if(!root)return;
 if(tab==="overview"){
   root.innerHTML='<h2>Bảng điều khiển nội dung</h2><p>Chỉnh trên Admin → Lưu bản nháp → Xem trước → Xuất bản. Mọi thay đổi chỉ xuất hiện trên website công khai sau khi xuất bản.</p>'+
   '<div class="cms-metrics"><div><strong>'+groups.length+'</strong><span>Phần quản trị</span></div><div><strong>'+editingState.gallery.length+'</strong><span>Ảnh</span></div><div><strong>'+editingState.music.tracks.length+'</strong><span>Bài hát</span></div></div>'+
   '<div class="cms-info">Bảo mật: Supabase RLS chỉ cho tài khoản Admin có quyền cập nhật. Ảnh và nhạc tải lên bucket công khai; không tải tệp riêng tư.</div>';
   return;
 }
 if(tab==="gallery"||tab==="skills"||tab==="projects"){
   const settings={gallery:"gallerySettings",skills:"skillsSettings",projects:"projectsSettings"}[tab];
   const head={gallery:"Tuỳ chỉnh thư viện",skills:"Tiêu đề kỹ năng",projects:"Tiêu đề dự án"}[tab];
   root.innerHTML='<div class="cms-field-head"><h3>'+head+'</h3></div><div class="cms-fields">'+(schema[settings]||[]).map(f=>makeField(settings,...f)).join("")+'</div>'+
   listEditor(tab,{gallery:"Ảnh “Một chút về mình”",skills:"Danh sách kỹ năng",projects:"Danh sách dự án"}[tab]);return;
 }
 let fields=schema[tab]||[];
 root.innerHTML='<h2>'+clean(groups.find(x=>x[0]===tab)?.[2]||"")+'</h2>'+
 '<div class="cms-fields">'+fields.map(f=>makeField(tab,...f)).join("")+'</div>'+
 (tab==="music"?listEditor("tracks","Danh sách bài hát"):"")+(tab==="socials"?'<div class="cms-fields cms-extra-fields">'+schema.socialsSettings.map(f=>makeField("socialsSettings",...f)).join("")+"</div>":"")+
 (tab==="comments"?'<p class="cms-info">Bảng kiểm duyệt bình luận gốc vẫn ở bên dưới. Cấu hình này chỉ kiểm soát cách hiện nhận xét trên website chính.</p>':"");
}
const PUBLIC_ORIGIN="https://nt3105.io.vn";
const previewSection={overview:"hero",hero:"hero",about:"about",gallery:"gallery",
 music:"music",effects:"effects",brand:"brand",navigation:"navigation",skills:"skills",
 projects:"projects",journey:"journey",contact:"contact",socials:"socials",theme:"theme",
 layout:"layout",seo:"seo",footer:"footer",comments:"comments",
 personal:"personal",code:"code",donate:"donate",gallerySettings:"gallery",skillsSettings:"skills",projectsSettings:"projects",socialsSettings:"socials"};
function previewStatus(text,error=false){
 const el=$("#cmsPreviewStatus");if(!el)return;
 el.textContent=text;el.classList.toggle("error",Boolean(error));
}
function sendPreview(type,extra={}){
 const iframe=$("#cmsWebsiteFrame");
 if(!previewFrameReady||!iframe?.contentWindow)return;
 iframe.contentWindow.postMessage({type,...extra},PUBLIC_ORIGIN);
}
function sendPreviewPing(){
 const frame=$("#cmsWebsiteFrame");
 if(frame?.contentWindow)frame.contentWindow.postMessage({type:"nt3105:cms-preview-ping"},PUBLIC_ORIGIN);
}
function renderPreview(){
 clearTimeout(previewRefreshTimer);
 const revision=++previewRevision;
 if(!previewFrameReady){
   previewStatus("Đang chờ website phản hồi để xem trước bản đã xác nhận...");
   return;
 }
 awaitingRevision=revision;
 previewStatus("Đang áp dụng bản đã xác nhận vào website xem trước...");
 previewRefreshTimer=setTimeout(()=>{
   sendPreview("nt3105:cms-preview-update",{content:clone(state),revision});
   setTimeout(()=>{
     if(previewFrameReady&&awaitingRevision===revision&&confirmedRevision!==revision){
       previewStatus("Trang xem trước chưa xác nhận cập nhật. Bấm Tải lại xem trước để kết nối lại.",true);
     }
   },6500);
 },100);
}
function previewNavigate(section,field=""){
 sendPreview("nt3105:cms-preview-navigate",{section:previewSection[section]||"hero",field});
}
function resizePreviewFrame(){
 const viewport=$("#cmsPreviewViewport"),iframe=$("#cmsWebsiteFrame");
 if(!viewport||!iframe)return;
 const mobile=previewMobile;
 const baseWidth=mobile?390:1280,baseHeight=mobile?840:1400;
 const available=viewport.clientWidth||350;
 const zoom=Math.min(1,available/baseWidth);
 iframe.style.width=baseWidth+"px";
 iframe.style.height=baseHeight+"px";
 iframe.style.transform="scale("+zoom+")";
 viewport.style.height=Math.round(baseHeight*zoom)+"px";
}
function onPreviewMessage(event){
 if(event.origin!==PUBLIC_ORIGIN||event.source!==$("#cmsWebsiteFrame")?.contentWindow)return;
 if(!$("#cmsStudio")||!client||!event.data||typeof event.data!=="object")return;
 if(event.data.type==="nt3105:cms-preview-ready"){
   previewFrameReady=true;
   previewStatus("● Đã kết nối website thật. Đang tải bản đã xác nhận...");
   renderPreview();
   setTimeout(()=>previewNavigate(tab),220);
 }
 if(event.data.type==="nt3105:cms-preview-applied"){
   const revision=Number(event.data.revision);
   if(Number.isInteger(revision)&&revision===awaitingRevision){
     confirmedRevision=revision;
     previewStatus("✓ Đã xác nhận và hiển thị trong bản xem trước · Chưa xuất bản");
   }
 }
 if(event.data.type==="nt3105:cms-preview-error"){
   previewStatus("Không áp dụng được bản xem trước: "+String(event.data.message||"Có lỗi khi cập nhật").slice(0,120),true);
 }
 if(event.data.type==="nt3105:cms-preview-select"){
   const section=String(event.data.section||"");
   if(groups.some(g=>g[0]===section)&&section!==tab)switchTab(section);
 }
}
window.addEventListener("message",onPreviewMessage);
function hasPendingChanges(){return JSON.stringify(editingState)!==JSON.stringify(state)}
function updatePendingUI(){
 const dirty=hasPendingChanges();
 const accept=$("#cmsAccept"),cancel=$("#cmsDiscard"),note=$("#cmsPendingNote");
 if(accept)accept.disabled=!dirty||pendingUploads>0;
 if(cancel)cancel.disabled=!dirty||pendingUploads>0;
 if(note)note.textContent=dirty?"● Có chỉnh sửa chưa xác nhận. Nhấn Xác nhận để đổi bản xem trước.":"✓ Mục này đã khớp bản xem trước.";
}
function acceptChanges(){
 if(pendingUploads){toast("Đợi tệp ảnh hoặc nhạc tải xong rồi xác nhận.",true);return}
 if(!hasPendingChanges()){toast("Không có chỉnh sửa mới cần xác nhận.");return}
 const errors=validateContent(editingState);
 if(errors.length){toast("Không thể xác nhận: "+errors.slice(0,2).join(" "),true);return}
 state=clone(editingState);
 updatePendingUI();
 renderPreview();
 previewNavigate(tab);
 toast("✓ Đã xác nhận sửa đổi. Đang gửi lên bản xem trước; chưa xuất bản.");
}
function discardChanges(){
 if(!hasPendingChanges())return;
 if(!confirm("Bỏ những chỉnh sửa chưa xác nhận ở mục này?"))return;
 editingState=clone(state);
 renderEditor();
 updatePendingUI();
 toast("Đã huỷ các chỉnh sửa chưa xác nhận. Bản xem trước không thay đổi.");
}
function switchTab(name){
 if(!groups.some(g=>g[0]===name))return;
 if(tab!==name&&hasPendingChanges()){
   if(pendingUploads){toast("Đợi tải tệp xong rồi Xác nhận hoặc Huỷ sửa đổi.",true);return}
   if(!confirm("Có chỉnh sửa chưa Xác nhận. Bỏ qua để chuyển sang mục khác?"))return;
   editingState=clone(state);
 }
 tab=name;
 document.querySelectorAll(".cms-tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 $("#cmsCurrent").textContent=groups.find(x=>x[0]===tab)?.[2]||"";
 renderEditor();
 updatePendingUI();
 previewNavigate(tab);
}
function getList(area){return area==="tracks"?editingState.music.tracks:editingState[area]}
function handleChanges(event){
 const t=event.target;if(!(t instanceof HTMLElement))return;
 if(t.matches("[data-area][data-key]")){
   const area=t.dataset.area,key=t.dataset.key,idx=t.dataset.idx;
   const record=idx!==undefined?getList(area)[Number(idx)]:editingState[area];
   if(!record)return;
   let val=t.type==="checkbox"?t.checked:t.type==="range"?Number(t.value):t.value;
   record[key]=val;
   if(t.type==="range")t.closest("label")?.querySelector("output")?.replaceChildren(String(val));
   updatePendingUI();
 }
}
function addItem(name){
 const base={gallery:{title:"Ảnh mới",src:"",thumb:"",visible:true},skills:{name:"Kỹ năng mới",description:"",icon:"",level:50,status:"Đang học",visible:true},
 projects:{title:"Dự án mới",description:"",url:"",image:"",source:"",tags:"",type:"",visible:true},
 tracks:{title:"Bài hát mới",artist:"",cover:"",src:"",visible:true}};
 getList(name).push({...base[name]});renderEditor();updatePendingUI();
}
function moveItem(name,idx,delta){const list=getList(name),to=idx+delta;if(to<0||to>=list.length)return;[list[idx],list[to]]=[list[to],list[idx]];renderEditor();updatePendingUI()}
function removeItem(name,idx){if(!confirm("Bỏ mục này khỏi bản nháp? Tệp đã tải lên Storage sẽ không bị xoá."))return;getList(name).splice(idx,1);renderEditor();updatePendingUI()}
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
   const record=idx!==undefined?getList(area)[Number(idx)]:editingState[area];
   if(!record)throw Error("Mục đã bị xoá trong khi tải tệp.");
   record[key]=data.publicUrl;renderEditor();updatePendingUI();
   toast("✓ Đã tải tệp. Nhấn Xác nhận để thấy trên bản xem trước, sau đó Xuất bản khi hoàn tất.");
 }catch(e){console.error(e);toast("Không tải được: "+String(e.message||e).slice(0,100),true)}
 finally{pendingUploads=Math.max(0,pendingUploads-1); if(input.isConnected)input.disabled=false;updatePendingUI()}
}
async function saveDraft(){
 if(hasPendingChanges()){toast("Bạn còn chỉnh sửa chưa Xác nhận. Nhấn Xác nhận để cập nhật bản xem trước trước khi lưu.",true);return false}
 const invalid=validateContent(state);
 if(invalid.length){toast("Bản nháp chưa hợp lệ: "+invalid.slice(0,2).join(" "),true);return false}
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
 if(hasPendingChanges()){toast("Hãy nhấn Xác nhận để cập nhật bản xem trước trước khi Xuất bản.",true);return}
 if(!previewFrameReady||awaitingRevision<1||confirmedRevision!==awaitingRevision){
  toast("Bản xem trước chưa xác nhận hiển thị đầy đủ. Nhấn Tải lại xem trước, đợi thông báo ✓ rồi hãy Xuất bản.",true);
  return;
 }
 if(!confirm("Xuất bản nội dung mới cho khách truy cập nt3105.io.vn?"))return;
 if(!await saveDraft())return;
 publishing=true;$("#cmsPublish").disabled=true;
 try{
   const payload={...clone(state),__cmsReady:true};
   const {data,error}=await client.from("nt3105_cms_published").upsert({id:KEY,content:payload,updated_at:new Date().toISOString()}).select("content,updated_at").single();
   if(error)throw error;
   if(!data||data.content?.__cmsReady!==true)throw Error("Supabase chưa xác nhận dữ liệu xuất bản.");
   if(JSON.stringify(data.content)!==JSON.stringify(payload)){
    // JSONB can return keys in different order; compare known values instead.
    if(data.content.hero?.title!==payload.hero?.title)throw Error("Dữ liệu xuất bản không khớp với bản đã xác nhận.");
   }
   lastPublished=clone(state);
   toast("✓ Supabase đã xác nhận xuất bản. Web chính sẽ nhận nội dung mới khi tải lại hoặc sau tối đa 30 giây.");
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
 editingState=clone(state);
 $("#cmsSave").disabled=false;$("#cmsPublish").disabled=false;
 switchTab(tab);renderPreview();toast("✓ Đã tải bản nháp từ Supabase. Chỉnh sửa → Xác nhận → Xuất bản.");
}
function downloadJson(){
 const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download="nt3105-cms-draft.json";link.click();URL.revokeObjectURL(url);
}
function restorePublished(){
 if(!lastPublished){toast("Chưa có phiên bản đã xuất bản để khôi phục.",true);return}
 if(!confirm("Khôi phục dữ liệu đã xuất bản vào bản nháp? Website công khai không thay đổi."))return;
 state=clone(lastPublished);editingState=clone(state);renderEditor();updatePendingUI();renderPreview();toast("✓ Đã phục hồi bản nháp. Chọn Lưu nháp để lưu lại.");
}
async function importJSON(file){
 if(!file||file.size>512000){toast("Tệp JSON phải nhỏ hơn 500 KB.",true);return}
 try{
  const x=JSON.parse(await file.text());
  if(!x||typeof x!=="object"||Array.isArray(x))throw Error("Không phải cấu hình CMS hợp lệ.");
  const unsafe=["__proto__","constructor","prototype"];
  if(Object.keys(x).some(key=>unsafe.includes(key)))throw Error("Các thuộc tính JSON không được hỗ trợ.");
  const unknown=Object.keys(x).filter(k=>!Object.hasOwn(defaults,k));
  if(unknown.length)throw Error("Tệp có trường không hỗ trợ.");
  if(x.gallery&&!Array.isArray(x.gallery))throw Error("Gallery phải là mảng.");
  if(x.skills&&!Array.isArray(x.skills))throw Error("Skills phải là mảng.");
  if(x.projects&&!Array.isArray(x.projects))throw Error("Projects phải là mảng.");
  if(x.music?.tracks&&!Array.isArray(x.music.tracks))throw Error("Playlist phải là mảng.");
  if(!confirm("Thay toàn bộ bản nháp hiện tại bằng dữ liệu JSON?"))return;
  editingState=merge(initial(),x);renderEditor();updatePendingUI();toast("✓ Đã nhập JSON vào ô chỉnh sửa. Nhấn Xác nhận để cập nhật bản xem trước.");
 }catch(error){console.error(error);toast("Không đọc được tệp JSON hợp lệ.",true)}
}
function setupUI(){
 const parent=$("#portal");if(!parent||$("#cmsStudio"))return;
 const section=document.createElement("section");section.id="cmsStudio";section.className="cms-studio glass";
 section.innerHTML='<div class="cms-head"><div><span class="cms-kicker">CONTENT STUDIO · V3</span><h2>Quản trị website</h2><p>Sửa nội dung · Xem trước · Lưu nháp · Xuất bản</p></div><div class="cms-actions"><button type="button" id="cmsExport" class="cms-btn">↓ JSON</button><button type="button" id="cmsImport" class="cms-btn">↑ Nhập JSON</button><input id="cmsImportFile" type="file" accept="application/json,.json" hidden><button type="button" id="cmsRestore" class="cms-btn">↶ Bản đã xuất bản</button><button type="button" id="cmsSave" class="cms-btn">Lưu nháp</button><button type="button" id="cmsPublish" class="cms-btn cms-primary">Xuất bản ↗</button></div></div>'+
 '<div id="cmsNotice" class="cms-notice" role="status" aria-live="polite">Đang xác thực kết nối CMS...</div>'+
 '<div class="cms-tabs" role="navigation" aria-label="Chuyên mục Admin">'+groups.map(g=>'<button class="cms-tab'+(g[0]==="overview"?" active":"")+'" type="button" data-tab="'+g[0]+'"><span>'+g[1]+'</span> '+g[2]+'</button>').join("")+'</div>'+
 '<div class="cms-workspace"><div class="cms-edit-panel"><div class="cms-panel-title"><h3 id="cmsCurrent">Tổng quan</h3><span>BẢN NHÁP</span></div><div id="cmsEditor"></div><div class="cms-confirm-panel"><p id="cmsPendingNote" class="cms-pending-note" role="status">✓ Mục này đã khớp bản xem trước.</p><div class="cms-confirm-actions"><button type="button" id="cmsDiscard" class="cms-btn" disabled>↶ Huỷ sửa đổi</button><button type="button" id="cmsAccept" class="cms-btn cms-primary" disabled>✓ Xác nhận → Xem trước</button></div></div></div><div class="cms-preview-panel"><div class="cms-panel-title"><h3>Xem trước</h3><div class="cms-preview-toolbar"><button type="button" id="cmsReload" class="cms-btn">↻ Tải lại xem trước</button><button type="button" id="cmsExpand" class="cms-btn">⤢ Mở rộng</button><button type="button" id="cmsDevice" class="cms-btn">▣ Máy tính</button><a class="cms-btn" href="https://nt3105.io.vn/" target="_blank" rel="noopener noreferrer">↗ Web chính</a></div></div><div class="cms-preview-status" id="cmsPreviewStatus" role="status" aria-live="polite">Đang kết nối bản xem trước với website thật...</div><div id="cmsLivePreview" class="cms-mobile"><div class="cms-preview-viewport" id="cmsPreviewViewport"><iframe title="Website nt3105.io.vn · bản xem trước theo thời gian thực" id="cmsWebsiteFrame" src="https://nt3105.io.vn/?nt3105_preview=1&amp;cms_ui=v7" sandbox="allow-scripts allow-same-origin" referrerpolicy="strict-origin-when-cross-origin" loading="eager"></iframe></div></div><p>Đây là giao diện website thật. Chọn mục → sửa → nhấn Xác nhận để xem tại đây. Khi sửa hết, nhấn Xuất bản để cập nhật web chính.</p></div></div>';
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
 $("#cmsAccept").addEventListener("click",acceptChanges);
 $("#cmsDiscard").addEventListener("click",discardChanges);
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
   resizePreviewFrame();
 });
 $("#cmsReload").addEventListener("click",()=>{
   previewFrameReady=false;awaitingRevision=0;confirmedRevision=0;
   const frame=$("#cmsWebsiteFrame");
   frame.src="https://nt3105.io.vn/?nt3105_preview=1&cms_ui=v7&retry="+Date.now();
   previewStatus("↻ Đang kết nối lại bản xem trước...");
 });
 $("#cmsWebsiteFrame").addEventListener("load",()=>{
   setTimeout(()=>{
     if(!previewFrameReady)sendPreviewPing();
   },150);
 });
 $("#cmsExpand").addEventListener("click",()=>{
   const expanded=$("#cmsStudio").classList.toggle("cms-expanded");
   $("#cmsExpand").textContent=expanded?"⤡ Thu gọn":"⤢ Mở rộng";
   setTimeout(resizePreviewFrame,60);
 });
 previewResizeObserver?.disconnect();
 if("ResizeObserver" in window){
   previewResizeObserver=new ResizeObserver(resizePreviewFrame);
   previewResizeObserver.observe($("#cmsLivePreview"));
 }
 window.addEventListener("resize",resizePreviewFrame,{passive:true});
 setTimeout(resizePreviewFrame,20);
 setTimeout(()=>{
   if(!previewFrameReady&&$("#cmsStudio"))previewStatus("Chưa nhận được phản hồi từ web chính. Kiểm tra mạng hoặc mở thử bằng nút ↗ Web chính.",true);
 },12000);
 section.addEventListener("focusin",event=>{
   const field=event.target.closest("[data-area][data-key],[data-upload-area][data-upload-key]");
   if(!field)return;
   const sectionName=field.dataset.area||field.dataset.uploadArea||tab;
   const fieldName=field.dataset.key||field.dataset.uploadKey||"";
   previewNavigate(sectionName==="tracks"?"music":sectionName.endsWith("Settings")?tab:sectionName,fieldName);
 });
 renderEditor();renderPreview();
}
window.addEventListener("nt3105:admin-auth",async event=>{
 if(!event.detail?.active){client=null;loadOkay=false;state=initial();editingState=initial();lastPublished=null;pendingUploads=0;previewFrameReady=false;awaitingRevision=0;confirmedRevision=0;clearTimeout(previewRefreshTimer);previewResizeObserver?.disconnect();document.getElementById("cmsStudio")?.remove();return}
 client=event.detail.client;previewFrameReady=false;awaitingRevision=0;confirmedRevision=0;setupUI();await loadData();
});
})();
