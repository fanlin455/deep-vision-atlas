/* 只整理显示层：保留原控件节点、事件和案例导入模块。 */
(function(){'use strict';
 function apply(){
  const page=location.hash.split('?')[0].split('/')[1]||'home';document.body.dataset.atlasPage=page;
  if(page==='scene'){
   const main=document.querySelector('main.wrap');
   if(main){
    main.classList.add('scene-workspace');main.querySelectorAll(':scope>.panel').forEach(panel=>panel.classList.add('scene-content'));
    const head=main.querySelector('.detail-head');if(head)head.dataset.sceneShort=location.hash.split('?')[0].split('/')[2]?.toUpperCase()||'';
    const tabs=main.querySelector('#tabs');if(tabs&&!tabs.dataset.floatingReady){
     tabs.dataset.floatingReady='true';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','案例内容导航');
     const buttons=[...tabs.querySelectorAll('[data-tab]')];
     function sync(){buttons.forEach(button=>{const on=button.classList.contains('on'),panel=main.querySelector('[data-panel="'+button.dataset.tab+'"]');button.setAttribute('role','tab');button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;if(panel){panel.id='case-panel-'+button.dataset.tab;button.id='case-tab-'+button.dataset.tab;button.setAttribute('aria-controls',panel.id);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);}});scheduleWorkbench();}
     tabs.addEventListener('click',sync);tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=buttons.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();buttons[next].click();});sync();
    }
   }
  }
 }
 // 自建实验台仅通过来源校验的消息获得父页面视口；不改写原沙箱宿主。
 const workbenches=new Set();let workbenchFrame=0;
 function updateWorkbench(){workbenchFrame=0;for(const f of workbenches){if(!f.isConnected){workbenches.delete(f);continue;}if(!f.closest('[data-panel=demo].on'))continue;const header=document.querySelector('.hdr')?.getBoundingClientRect().height||0,dock=document.querySelector('#tabs')?.getBoundingClientRect().height||70,r=f.getBoundingClientRect(),scale=r.width/f.offsetWidth||1;
  if(!f.dataset.workbenchFocused){f.dataset.workbenchFocused='true';const panel=f.closest('[data-panel=demo]');window.scrollTo({top:scrollY+panel.getBoundingClientRect().top-header-10,behavior:'instant'});}
  const rect=f.getBoundingClientRect();f.contentWindow.postMessage({kind:'atlas-workbench-viewport',height:Math.max(360,(innerHeight-header-dock-34)/scale),top:Math.max(0,(header+12-rect.top)/scale)},'*');
 }}
 function scheduleWorkbench(){if(!workbenchFrame)workbenchFrame=requestAnimationFrame(updateWorkbench);}
 addEventListener('scroll',scheduleWorkbench,{passive:true});addEventListener('resize',scheduleWorkbench);addEventListener('hashchange',scheduleWorkbench);
 addEventListener('message',event=>{const d=event.data;if(!d||!['atlas-workbench-ready','atlas-workbench-size'].includes(d.kind)||!window.SUBMISSION_CASES?.some(c=>c.id===d.caseId))return;const frame=[...document.querySelectorAll('iframe.cd-iframe')].find(f=>f.contentWindow===event.source);if(!frame)return;
  if(!workbenches.has(frame)){workbenches.add(frame);frame.classList.add('workbench-frame');frame.setAttribute('scrolling','no');new MutationObserver(()=>{const h=+frame.dataset.workbenchHeight;if(h&&Math.abs(parseFloat(frame.style.height)-h)>2)frame.style.height=h+'px';}).observe(frame,{attributes:true,attributeFilter:['style']});}
  if(d.kind==='atlas-workbench-size'&&Number.isFinite(d.height)&&d.height>=220&&d.height<=30000){frame.dataset.workbenchHeight=String(Math.ceil(d.height));frame.style.height=frame.dataset.workbenchHeight+'px';}scheduleWorkbench();
 });
 // 自建案例通过消息请求定位，使用实际显示比例换算；不读取跨源文档。
 addEventListener('message',event=>{
  const data=event.data;if(!data||data.kind!=='atlas-case-scroll'||!Number.isFinite(data.top)||data.top<0)return;
  const frame=[...document.querySelectorAll('iframe.cd-iframe')].find(el=>el.contentWindow===event.source);
  if(!frame||data.top>frame.clientHeight+1000)return;
  const rect=frame.getBoundingClientRect(),scale=rect.width/frame.offsetWidth,target=rect.top+(data.top+frame.clientTop)*scale,behavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
  const modal=frame.closest('.mdl-b');
  if(modal){const box=modal.getBoundingClientRect(),zoom=box.width/modal.offsetWidth;modal.scrollTo({top:modal.scrollTop+(target-box.top)/zoom-20,behavior});return;}
  if(!frame.closest('[data-panel="demo"].on'))return;
  const header=document.querySelector('.hdr')?.getBoundingClientRect().height||0;
  window.scrollTo({top:window.scrollY+target-header-20*scale,behavior});
 });
 addEventListener('hashchange',()=>setTimeout(apply,0));apply();
})();
