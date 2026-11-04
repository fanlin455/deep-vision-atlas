/* 以统一逻辑视口排版；高分辨率或浏览器缩小时，文字与画面同步适配。 */
(function(){'use strict';
 const root=document.documentElement;let pending=0;
 function fit(){
  pending=0;const scale=Math.max(1,Math.min(innerWidth/1920,innerHeight/900)),logicalWidth=innerWidth/scale,logicalHeight=innerHeight/scale;
  root.style.setProperty('--atlas-scale',String(scale));
  root.style.setProperty('--atlas-page-width',logicalWidth+'px');
  root.style.setProperty('--atlas-page-height',logicalHeight+'px');
  const inset=Math.max(20,Math.min(68,logicalWidth*.035));root.style.setProperty('--atlas-inset',inset+'px');root.style.setProperty('--atlas-content-inset',(Math.max(0,(logicalWidth-1920)/2)+inset)+'px');root.classList.toggle('atlas-compact',logicalHeight<760&&logicalWidth>800);
  root.classList.toggle('atlas-scaled',scale>1.001);
 }
 addEventListener('resize',()=>{if(!pending)pending=requestAnimationFrame(fit);});fit();
})();
