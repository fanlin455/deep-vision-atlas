/* ZIP 入口复用原有文件导入器：解包后仍由原校验与试跑流程处理。 */
(function(){'use strict';
const LIMIT=6*1024*1024; let generation=0;
function message(s,error){const el=document.querySelector('#zip-message');if(el){el.textContent=s;el.style.color=error?'#a34126':'#2f7d6b';}}
function clearPack(){document.querySelector('#imp-clear').click();for(const s of ['#imp-title-in','#imp-id','#imp-ver'])document.querySelector(s).value='';document.querySelector('#imp-scene').value='';}
async function load(file){const token=++generation;clearPack();const ok=document.querySelector('#imp-ok');ok.disabled=true;message('正在解压并检查案例包…');try{
 if(!file || !/\.zip$/i.test(file.name))throw Error('请选择 ZIP 格式的单个案例压缩包。');
 if(file.size>10*1024*1024)throw Error('压缩包超过 10 MB，请选择单个案例包。');
 const zip=await JSZip.loadAsync(await file.arrayBuffer(),{checkCRC32:false,decodeFileName:bytes=>{try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{return new TextDecoder('gb18030').decode(bytes);}}});
 const entries=Object.values(zip.files).filter(x=>!x.dir&&!x.name.startsWith('__MACOSX/')&&!x.name.endsWith('/.DS_Store'));
 if(entries.length>500)throw Error('文件超过 500 个，请仅打包一个案例。');
 for(const e of entries){const n=e.unsafeOriginalName||e.name;if(n.startsWith('/')||n.includes('\\')||n.split('/').includes('..')||/^[A-Za-z]:/.test(n))throw Error('压缩包包含不安全的文件路径。');}
 const manifests=entries.filter(x=>/(^|\/)case\.json$/i.test(x.name));
 if(manifests.length!==1)throw Error('压缩包需包含且仅包含一个 case.json；请压缩单个案例文件夹。');
 const root=manifests[0].name.slice(0,-'case.json'.length);const selected=entries.filter(x=>x.name.startsWith(root));
 let total=0;for(const e of selected){total+=e._data?.uncompressedSize??0;if(total>LIMIT)throw Error('解压后文件超过原门户 6 MB 限制。');}
 const dt=new DataTransfer();for(const e of selected){const bytes=await e.async('uint8array');if(bytes.length>(e._data?.uncompressedSize??bytes.length))throw Error('文件大小异常。');dt.items.add(new File([bytes],e.name.slice(root.length)));}
 if(token!==generation||document.querySelector('#imp-drop')?.closest('[hidden]'))return;
 const input=document.querySelector('#imp-file');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));ok.disabled=false;message('压缩包已解开，请查看校验结果并试跑。');
 }catch(e){if(token===generation){clearPack();ok.disabled=true;message('导入失败：'+(e.message||'无法读取 ZIP'),true);}}}
function install(){const drop=document.querySelector('#imp-drop');if(!drop||drop.dataset.zipReady)return;drop.dataset.zipReady='1';const choose=drop.querySelector('.imp-choose');const button=document.createElement('button');button.className='btn sm ghost';button.type='button';button.textContent='选择 ZIP 压缩包';button.id='imp-pick-zip';const input=document.createElement('input');input.type='file';input.accept='.zip,application/zip';input.id='imp-zip';input.hidden=true;choose.append(button,input);const note=document.createElement('span');note.id='zip-message';note.setAttribute('role','status');note.className='imp-sub';note.textContent='支持单个案例 ZIP（含 case.json）；解压后沿用原有校验。';drop.append(note);button.onclick=e=>{e.stopPropagation();input.click();};input.onclick=e=>e.stopPropagation();input.onchange=()=>{load(input.files[0]);input.value='';};
 const fileInput=drop.querySelector('#imp-file');fileInput.addEventListener('change',e=>{const files=[...fileInput.files];if(files.some(f=>/\.zip$/i.test(f.name))){e.stopImmediatePropagation();if(files.length===1)load(files[0]);else{clearPack();document.querySelector('#imp-ok').disabled=true;message('请一次选择一个 ZIP 压缩包。',true);}fileInput.value='';}else{generation++;document.querySelector('#imp-ok').disabled=false;}},true);
 drop.querySelector('#imp-dir').addEventListener('change',()=>{generation++;document.querySelector('#imp-ok').disabled=false;},true);
 drop.querySelector('#imp-pick-dir').addEventListener('click',()=>{generation++;document.querySelector('#imp-ok').disabled=false;},true);
 drop.addEventListener('drop',e=>{const files=[...e.dataTransfer.files];if(files.some(f=>/\.zip$/i.test(f.name))){e.preventDefault();e.stopImmediatePropagation();drop.classList.remove('on');if(files.length===1)load(files[0]);else{clearPack();document.querySelector('#imp-ok').disabled=true;message('请一次拖入一个 ZIP 压缩包。',true);}}else{generation++;document.querySelector('#imp-ok').disabled=false;}},true);
}
document.addEventListener('click',e=>{if(e.target.closest('[data-import]')){generation++;setTimeout(()=>{install();document.querySelector('#imp-ok').disabled=false;},0);}});
})();
