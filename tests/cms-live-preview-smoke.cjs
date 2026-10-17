'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const editor=fs.readFileSync('assets/cms-v3.js','utf8');
const html=fs.readFileSync('index.html','utf8');
new Function(editor);
assert(html.includes('assets/cms-v3.js?v=admin-preview-visual-7'),'Published Admin must use latest Studio JS');
assert(editor.includes('nt3105_preview=1'),'Preview must load the actual website in Studio mode');
assert(editor.includes('cms_ui=v7'),'Preview reloads must use updated public assets');
assert(editor.includes('id="cmsWebsiteFrame"'),'Studio must have a real website iframe');
assert(editor.includes('sandbox="allow-scripts allow-same-origin"'),'Embed must be sandboxed');
assert(editor.includes('event.origin!==PUBLIC_ORIGIN'),'Only the actual website may send preview messages');
assert(editor.includes('event.source!==$("#cmsWebsiteFrame")?.contentWindow'),'Unrelated windows may not control editor');
assert(editor.includes('nt3105:cms-preview-update'),'Preview updates must flow from editor state');
assert(editor.includes('id="cmsAccept"'),'Users must explicitly confirm a section to update the preview');
assert(editor.includes('id="cmsDiscard"'),'Users must be able to discard unconfirmed changes');
assert(editor.includes('function hasPendingChanges()'),'Staged changes must remain separate');
assert(editor.includes('editingState=clone(state)'),'Editor should reset to the confirmed snapshot');
assert(editor.includes('state=clone(editingState)'),'Only confirmation applies staged edits to the preview state');
assert(editor.includes('nt3105:cms-preview-applied'),'Preview must acknowledge actually applying content');
assert(editor.includes('id="cmsReload"'),'Preview has a retry control when connection fails');

assert(editor.includes('nt3105:cms-preview-navigate'),'Selecting an editor field should navigate site preview');
assert(editor.includes('nt3105:cms-preview-select'),'Clicking a website section should select the corresponding editor section');
assert(editor.includes('resizePreviewFrame'),'Desktop/mobile preview should resize');
assert(editor.includes('const payload={...clone(state),__cmsReady:true}'),'Only explicit Admin Publish may activate a public revision');
assert(editor.includes('if(hasPendingChanges()){toast("Hãy nhấn Xác nhận'),'Unconfirmed edits must block publishing');
assert(editor.includes('const record=idx!==undefined?getList(area)[Number(idx)]:editingState[area]'),'Uploaded files must remain staged until confirmation');
assert(editor.includes('select("content,updated_at").single()'),'Publishing should verify the database response');
assert(editor.includes('confirmedRevision!==awaitingRevision'),'Publishing must reject an unconfirmed iframe preview revision');
assert(!editor.includes('p.innerHTML=\'<div class="cms-preview-hero"'),'Legacy fake mini-site preview must be removed');

const vm=require('node:vm');
const assert2=require('node:assert/strict');
const fragment=editor.replace(/\}\)\(\);\s*$/, 'window.__v5={getState:()=>clone(state),getEdit:()=>clone(editingState),handleChanges,acceptChanges,hasPendingChanges,getRevision:()=>previewRevision,saveDraft,publish};\n})();');
assert.notEqual(fragment,editor,'Must expose test hooks');
class HTMLElement{constructor(){this.dataset={area:'hero',key:'title'};this.type='text';this.value='Tiêu đề thử nghiệm';}matches(){return true}}
const dom={querySelector(){return null},querySelectorAll(){return []}};
const context={window:{addEventListener(){}},document:dom,HTMLElement,console,JSON,
  setTimeout(){return 1},clearTimeout(){},confirm(){return true}};
vm.runInNewContext(fragment,context,{filename:'cms-v3.js'});
const api=context.window.__v5;
assert2(api,'Admin VM hooks must load');
const beforeRevision=api.getRevision();
api.handleChanges({target:new HTMLElement()});
assert2.equal(api.hasPendingChanges(),true,'Typing must stage edits');
assert2.notEqual(api.getEdit().hero.title,api.getState().hero.title,'Public preview snapshot must be untouched while typing');
assert2.equal(api.getRevision(),beforeRevision,'No preview updates while typing');
api.acceptChanges();
assert2.equal(api.hasPendingChanges(),false,'Confirm should apply the staged content');
assert2.equal(api.getState().hero.title,'Tiêu đề thử nghiệm','Confirm should commit the staged title');
assert2.equal(api.getRevision(),beforeRevision+1,'Confirm should trigger one preview revision');
console.log('NT3105 Admin V5 staged-confirm preview smoke checks passed.');

console.log('Admin V3 iframe, security, live preview, and publish wiring checks passed.');
