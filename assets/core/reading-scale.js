/* 文字保持阅读尺度，图形仍按容器铺开；不改变数据、坐标或模型。 */
(function(){'use strict';
const root=document.documentElement,cache=new WeakMap(),watched=new Set();let frame=0;
const scale=()=>parseFloat(getComputedStyle(root).getPropertyValue('--atlas-scale'))||1;
function fitText(node,zoom,story){
 const m=node.getScreenCTM();if(!m)return;const ratio=Math.hypot(m.a,m.b);if(!Number.isFinite(ratio)||ratio<.001)return;
 if(!node.dataset.readingRaw)node.dataset.readingRaw=node.textContent;
 const raw=node.dataset.readingRaw;
 const target=+(node.dataset.readingSize||16),font=target*zoom/ratio,max=+(node.dataset.readingWidth||0),key=[ratio.toFixed(4),zoom,target,max,raw].join('|');
 if(cache.get(node)===key)return;cache.set(node,key);node.style.fontSize=font.toFixed(3)+'px';
 if(!story||!max)return;
 node.textContent='';const lines=[];let line='';for(const ch of raw){node.textContent=line+ch;if(line&&node.getComputedTextLength()>max){lines.push(line);line=ch;}else line+=ch;}if(line)lines.push(line);
 node.textContent='';lines.forEach((value,i)=>{const t=document.createElementNS('http://www.w3.org/2000/svg','tspan');t.setAttribute('x',node.getAttribute('x')||'0');t.setAttribute('dy',i?String(font*1.25):'0');t.textContent=value;node.append(t);});
}
function update(){
 frame=0;const zoom=scale(),logical=innerWidth/zoom;root.dataset.readingColumns=logical>=3100?'4':logical>=1800?'2':'1';
 const graphics=[...document.querySelectorAll('.story-figure svg,#views svg.plot-line')],live=new Set(graphics);
 for(const el of watched)if(!el.isConnected){observer.unobserve(el);watched.delete(el);}
 for(const svg of graphics){if(!watched.has(svg)){watched.add(svg);observer.observe(svg);}if(!svg.getClientRects().length)continue;const story=!!svg.closest('.story-figure');svg.querySelectorAll('text').forEach(node=>fitText(node,zoom,story));
  if(svg.closest('.story-overview')){const labels=[...svg.querySelectorAll(':scope>g>text')],height=Math.max(140,...labels.map(n=>{const b=n.getBBox();return Math.ceil(b.y+b.height+12);}));if(Math.abs(svg.viewBox.baseVal.height-height)>.5){svg.setAttribute('viewBox','0 0 1080 '+height);svg.querySelectorAll('[data-reading-card]').forEach(r=>r.setAttribute('height',String(height-24)));}}
 }
}
function schedule(){if(!frame)frame=requestAnimationFrame(update);}
const observer=new ResizeObserver(schedule);
new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1)))schedule();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
addEventListener('resize',schedule);addEventListener('hashchange',schedule);addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();watched.clear();});schedule();
})();
