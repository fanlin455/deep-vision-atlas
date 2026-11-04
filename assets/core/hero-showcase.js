/* 首页动效为地球物理概念视觉，统计只取门户实际数据。 */
(function(){
 'use strict';
 let field=null;
 function render(){
  const home=['','#/','#'].includes(location.hash.split('?')[0]);
  document.body.classList.toggle('atlas-immersive',home);
  if(!home){if(field){field.destroy();field=null;}return;}
  const hero=document.querySelector('.hero');
  if(!hero||hero.classList.contains('hero--expedition'))return;
  if(field)field.destroy();
  hero.classList.add('hero--expedition');
  hero.innerHTML=`<div class="expedition-hero hero-main">
   <canvas class="expedition-art" role="img" aria-label="动态概念图：分层展开的岩层、金色储层、传播能量环和发光井轨迹；非实测数据">地震波、地下地层与井轨迹的动态概念示意。</canvas>
   <div class="expedition-shade" aria-hidden="true"></div>
   <div class="expedition-copy">
    <div class="expedition-eyebrow"><i></i> DEEP EXPLORATION / INTELLIGENT ENERGY</div>
    <h1><span>深地</span><em>智境</em></h1>
    <p class="expedition-lead">石油工程智能算法可视化实验平台</p>
    <nav class="expedition-actions" aria-label="探索入口">
     <button type="button" data-explore=".field-map" class="expedition-primary">探索作业地图 <span>↗</span></button>
     <button type="button" data-explore=".method-map" class="expedition-secondary">查看算法关联 <span>→</span></button>
    </nav>
   </div>
   <div class="expedition-art-note">地震扫描 / 地层解构 / 智能寻层 <span>概念示意</span></div>
   <div class="expedition-signal" aria-hidden="true"><i></i><span>感知</span><b>→</b><span>识别</span><b>→</b><span>决策</span></div>
   <div class="expedition-bottom">
    <div class="expedition-stats">
     <div><b>${ATLAS.stages.length}</b><span>作业环节</span></div>
     <div><b>${ATLAS.allScenes.length}</b><span>可运行场景</span></div>
     <div><b>${Object.keys(ATLAS.methods).length}</b><span>智能方法类别</span></div>
    </div>
    <button type="button" class="expedition-motion" aria-pressed="false">暂停动效 <span>Ⅱ</span></button>
   </div>
  </div>`;
  field=window.mountPetroleumField(hero.querySelector('canvas'));
  const motion=hero.querySelector('.expedition-motion');
  function sync(){const paused=field.isPaused();motion.setAttribute('aria-pressed',String(paused));motion.innerHTML=paused?'播放动效 <span>▷</span>':'暂停动效 <span>Ⅱ</span>';}
  field.onChange=sync;sync();
  motion.onclick=()=>{field.setPaused(!field.isPaused());sync();};
  hero.querySelectorAll('[data-explore]').forEach(button=>button.onclick=()=>{
   const target=document.querySelector(button.dataset.explore);if(!target)return;
   target.setAttribute('tabindex','-1');
   target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
   target.focus({preventScroll:true});
  });
 }
 window.addEventListener('hashchange',()=>setTimeout(render,0));render();
})();
