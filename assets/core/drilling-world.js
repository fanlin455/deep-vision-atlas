/* 离线 Canvas 三维井场：透视相机、面深度排序和井架结构。场地为教学重建。 */
(function(){'use strict';
 window.createDrillingWorld=function(canvas,{enter=false,stageId='drilling',sceneIds=[],onProject=()=>{},onView=()=>{}}={}){
  const ctx=canvas.getContext('2d',{alpha:false}),host=canvas.parentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const objects=[],equipment={},markers=stageId==='drilling'?{d1:[0,22,0],d2:[0,3,0],d3:[-3,7,0],d4:[7,4,3],d5:[-26,4,8],d6:[-25,2,18],d7:[-26,3,-3],d8:[26,6,-9]}:{};let targetHeight=17,distance=118,eyeHeight=3;
  let w=1,h=1,ratio=1,raf=0,dead=false,visible=true,camera=enter&&!reduce.matches?0:1,from=camera,to=1,start=0,duration=0,yaw=0,drag=null;
  const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const l=Math.hypot(...a);return a.map(v=>v/l);};
  function face(points,color){objects.push({points,color,type:'face'});}
  function wire(points,color='#b4c5c5',width=.9){objects.push({points,color,width,type:'line'});}
  function box(x,y,z,a,b,c,color){const p=[[x,y,z],[x+a,y,z],[x+a,y+b,z],[x,y+b,z],[x,y,z+c],[x+a,y,z+c],[x+a,y+b,z+c],[x,y+b,z+c]];for(const ids of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]])face(ids.map(i=>p[i]),color);}
  function cylinder(x,y,z,r,height,color,n=24){const top=[],bottom=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;top.push([x+Math.cos(a)*r,y+height,z+Math.sin(a)*r]);bottom.push([x+Math.cos(a)*r,y,z+Math.sin(a)*r]);}for(let i=0;i<n;i++)face([bottom[i],bottom[(i+1)%n],top[(i+1)%n],top[i]],color);face(top,color);}
  function cabin(x,z,a,c,color){box(x,0,z,a,5,c,color);box(x-.3,5,z-.3,a+.6,.45,c+.6,'#75888b');for(let u=1;u<a-1;u+=2.8)box(x+u,1.8,z-.07,1.8,1.6,.08,'#193443');box(x+a-.05,.3,z+c*.4,.08,3.8,1.5,'#506875');for(let u=0;u<a;u+=1.3)wire([[x+u,0,z-.08],[x+u,5,z-.08]],'#aebbbc',.45);}
  if(stageId==='drilling'){
  // 场地、道路和排水沟。
  box(-56,-.35,-36,112,.35,83,'#9b9583');box(-8,-.14,46,18,.12,130,'#686c66');
  for(let z=51;z<130;z+=10)box(.6,.01,z,.3,.02,4,'#d5c69f');
  for(let j=0;j<120;j++){const x=-54+(j*29.37)%108,z=-35+(j*17.17)%80;box(x,.01,z,.15,.04,.25,j%3?'#aaa48f':'#858572');}
  for(const x of [-54,52])wire([[x,.1,-34],[x,.1,44]],'#5c6660',2);
  // 地面先绘制，避免大场坪的平均深度遮住远侧矮设备。
  for(const [x,z,a,c]of [[-35,-12,17,34],[18,-20,21,18],[20,5,18,22],[-9,-9,20,18]])face([[x+.8,.03,z+1],[x+a+5,.03,z+1],[x+a+9,.03,z+c+5],[x+4,.03,z+c+5]],'#28363055');
  for(const o of objects)o.ground=true;
  // 钻台、转盘、司钻房、立管和绞车。
  box(-7,0,-6,14,5.8,13,'#334b56');box(-8,5.8,-7,16,1,15,'#647c84');
  for(const x of [-6.5,6.5])for(const z of [-5.5,5.5])box(x,0,z,.6,6,.6,'#7a9298');
  box(7,6,-4,5,3.2,5,'#768e94');box(7.1,7.2,-4.08,4.7,1.4,.1,'#254958');
  cylinder(0,6.9,0,2.1,.25,'#93917c');cylinder(0,7.2,0,.6,1.5,'#c7c6ac');
  box(-5,7,3,4.5,2.4,3,'#3d6373');cylinder(-2.8,7,4.5,1.2,2.5,'#536a76');
  // 井架四角钢构，逐层收分，交叉腹杆和平台。
  const levels=[7,13,20,27,34,41,48];
  for(let k=0;k<levels.length-1;k++){const y=levels[k],yy=levels[k+1],r=5.6-(y-7)*.105,rr=5.6-(yy-7)*.105;for(const [sx,sz]of [[-1,-1],[1,-1],[1,1],[-1,1]]){wire([[sx*r,y,sz*r],[sx*rr,yy,sz*rr]],'#c2cdc7',2.4);}
   for(const [a,b]of [[[1,1],[-1,1]],[[1,-1],[-1,-1]],[[1,1],[1,-1]],[[-1,1],[-1,-1]]]){wire([[a[0]*r,y,a[1]*r],[b[0]*r,y,b[1]*r]],'#b1c0be',1.6);wire([[a[0]*r,y,a[1]*r],[b[0]*rr,yy,b[1]*rr]],'#a4b5b8',1.1);wire([[b[0]*r,y,b[1]*r],[a[0]*rr,yy,a[1]*rr]],'#8d9fa7',.85);}}
  box(-1.9,47.7,-1.9,3.8,1.4,3.8,'#405766');cylinder(0,49.1,0,.55,1.4,'#a1aaa5');
  wire([[0,48,0],[0,19,0]],'#e1c98f',1.2);box(-.6,18,-.5,1.2,2,1,'#e2ab61');wire([[0,18,0],[0,7.3,0]],'#c5bda1',2);
  for(let y=9;y<44;y+=.8)wire([[-3.2+(y-7)*.06,y,-5.7+(y-7)*.105],[-2.1+(y-7)*.06,y,-5.7+(y-7)*.105]],'#b6c5c2',.65);
  box(-5,25.8,-5,10,.35,3,'#6a7d80');
  // 钻台护栏与通向地面的楼梯。
  for(let i=0;i<15;i++){const x=8+i*.52,y=5.8-i*.39;box(x,y,5,1,.2,3,'#98a6a1');}
  wire([[8,7.2,5],[15.2,1.6,5]],'#f2bb6d',1.4);wire([[-8,8.3,7],[8,8.3,7]],'#d8b67b',1.5);
  for(let x=-8;x<=8;x+=2)wire([[x,6.8,7],[x,8.3,7]],'#c1c6ad',1);
  // 钻井液循环系统：泥浆罐、搅拌器、泵组、连接管汇。
  for(let j=0;j<3;j++){box(-34,0,-10+j*10,13,3.7,8,'#3e6868');box(-34,3.7,-10+j*10,13,.3,8,'#849e94');for(let q=0;q<3;q++){cylinder(-31+q*4,4,-6+j*10,.7,1,'#4d6f75');wire([[-31+q*4,4.4,-7+j*10],[-31+q*4,4.4,-5+j*10]],'#c3cbba',1);}}
  for(let j=0;j<2;j++){box(-23,0,-22+j*5,9,2.3,3.5,'#3f7184');cylinder(-18,2.3,-20.3+j*5,1,1.5,'#8faaa7');}
  wire([[-20,2,-20],[-12,2,-20],[-12,2,-4],[-6,2,-4]],'#c9ac7c',3);wire([[-7,5.5,3],[-16,5.5,3],[-16,4,-7],[-21,4,-7]],'#6f9697',4);
  for(const z of [-10,0,10]){wire([[-35,5,z],[-35,5,z+8]],'#d9c185',1.3);for(let zz=z;zz<z+8;zz+=2)wire([[-35,3.9,zz],[-35,5,zz]],'#c3b88a',.8);}
  // 井场房、发电机组、管架、车辆。
  cabin(19,-18,17,7,'#849da4');cabin(22,-7,14,6,'#718f98');
  for(let j=0;j<3;j++){box(23,0,7+j*6,12,3.3,4,'#315969');box(25,3.3,8+j*6,2,1,2,'#6e8990');cylinder(33,3.2,9+j*6,.18,3,'#b6bbad');}
  box(15,.4,27,24,1,7,'#4f6369');for(let j=0;j<8;j++)cylinder(17+j*2.7,1.4,30,.5,0.5,'#9b9b84');
  for(let j=0;j<9;j++)wire([[16+j*2.3,1.5,27],[16+j*2.3,1.5,34]],'#b6aaa0',2.4);
  box(-43,0,29,7,2.5,14,'#91a0a0');box(-43,2.5,38,7,2.5,5,'#aeb5aa');box(-42.6,3.4,42.9,6.2,1,.12,'#224355');for(const z of [32,40])for(const x of [-43.4,-35.6])cylinder(x,1,z,.9,.7,'#242e34');
  // 辅助设备细节：罐体加强肋、泵电机、管材支撑和作业房门窗。
  for(let z=-10;z<18;z+=10)for(let x=-32;x<-21;x+=2.6)wire([[x,.1,z+8],[x,3.6,z+8]],'#81a49c',.8);
  for(let j=0;j<2;j++)cylinder(-21,1.3,-20.3+j*5,1.1,1.6,'#9aa5a0');
  for(let j=0;j<4;j++)box(17+j*6,.2,26,.35,1.3,9,'#847a63');
  for(let j=0;j<3;j++)box(20+j*4.4,2.2,-18.12,2.3,1.8,.16,'#2c5666');
  // 围栏与工区灯杆.
  for(let x=-52;x<=52;x+=5){wire([[x,0,-33],[x,2.6,-33]],'#b9b6a1',.7);wire([[x,0,44],[x,2.6,44]],'#b9b6a1',.7);}
  wire([[-52,2.5,-33],[52,2.5,-33]],'#969d90',.7);wire([[-52,1.2,-33],[52,1.2,-33]],'#7e8c83',.7);
  for(const [x,z]of [[-45,-26],[43,-25],[42,35],[-46,18]]){wire([[x,0,z],[x,15,z]],'#b7b6a2',1.5);box(x-2,14.8,z-1,4,.4,2,'#ffe0a0');}
  }else{
   const model=buildPetroleumStage(stageId,{box,cylinder,wire,face,cabin,ground(){for(const o of objects)o.ground=true;}});
   targetHeight=model.targetHeight*.6;distance=model.distance;eyeHeight=18;sceneIds.forEach((key,i)=>{markers[key]=model.spots[i];equipment[key]=model.labels[i];});
  }
  canvas.dataset.stage=stageId;canvas.dataset.geometryCount=String(objects.length);
  let basis;
  function setup(){const t=camera,a=.32+yaw,eye=[Math.sin(a)*distance,170*(1-t)+eyeHeight*t,Math.cos(a)*distance*(.18+.82*t)],target=[-2,5+(targetHeight-5)*t,1],forward=unit(sub(target,eye)),right=unit(cross(forward,[0,1,0])),up=cross(right,forward);basis={eye,forward,right,up,f:h*(w/h<1.1?1.06:stageId==='drilling'?1.48:1.8)};}
  function project(p){const v=sub(p,basis.eye),z=dot(v,basis.forward);return{x:w*.5+dot(v,basis.right)*basis.f/z,y:h*.50-dot(v,basis.up)*basis.f/z,z};}
  function paint(){if(dead||!ctx)return;setup();ctx.clearRect(0,0,w,h);const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#24404e');sky.addColorStop(.5,'#a4a696');sky.addColorStop(1,'#b19b77');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
   const horizon=h*(.57+.03*(1-camera));ctx.fillStyle='#b9ab8a';ctx.beginPath();ctx.arc(w*.82,h*.20,h*.045,0,Math.PI*2);ctx.fill();
   for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(0,horizon+70);for(let j=0;j<=20;j++)ctx.lineTo(j/20*w,horizon-15-k*12-Math.sin(j*.7+k)*17-Math.cos(j*1.9+k)*11);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fillStyle=['#6b7a77','#5c706e','#4a6264'][k];ctx.fill();}
   const soil=ctx.createLinearGradient(0,horizon,0,h);soil.addColorStop(0,'#8a8b77');soil.addColorStop(1,'#5e6259');ctx.fillStyle=soil;ctx.fillRect(0,horizon+24,w,h-horizon-24);
   const render=[];
   for(const item of objects){const points=item.points.map(project);if(points.some(p=>p.z<1))continue;render.push({...item,screen:points,depth:points.reduce((s,p)=>s+p.z,0)/points.length});}render.sort((a,b)=>a.ground!==b.ground?(a.ground?-1:1):b.depth-a.depth);
   for(const o of render){ctx.beginPath();o.screen.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));if(o.type==='face'){ctx.closePath();const n=unit(cross(sub(o.points[1],o.points[0]),sub(o.points[2],o.points[0]))),light=.68+.25*Math.abs(dot(n,unit([-.7,1,.6])));ctx.fillStyle=o.color;ctx.fill();ctx.fillStyle='rgba(0,10,18,'+(1-light)+')';ctx.fill();ctx.strokeStyle='#0c233018';ctx.lineWidth=.4;ctx.stroke();}else{ctx.strokeStyle=o.color;ctx.lineWidth=Math.max(.65,o.width*Math.min(1.4,h/600));ctx.stroke();}}
   // 暖光与画面边缘的柔和遮罩。
   const vignette=ctx.createLinearGradient(0,h*.75,0,h);vignette.addColorStop(0,'#081c2600');vignette.addColorStop(1,'#081c2670');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
   const projected={};for(const [key,value]of Object.entries(markers)){const p=project(value);projected[key]={x:p.x/w,y:p.y/h};}onProject(projected);canvas.dataset.camera=camera.toFixed(3);canvas.dataset.ready='true';canvas.dataset.frame=String(+(canvas.dataset.frame||0)+1);
  }
  function tick(now){raf=0;if(dead||!visible||document.hidden)return;if(duration){const t=Math.min(1,(now-start)/duration),ease=t*t*(3-2*t);camera=from+(to-from)*ease;paint();if(t<1)raf=requestAnimationFrame(tick);else{duration=0;canvas.dataset.moving='false';onView(to===0?'top':'eye');}}}
  function setView(view,animate=true){from=camera;to=view==='top'?0:1;start=performance.now();duration=animate&&!reduce.matches?1650:0;canvas.dataset.moving=String(duration>0);if(!duration){camera=to;paint();onView(view);}else if(!raf)raf=requestAnimationFrame(tick);}
  function resize(){
   if(dead)return;w=host.clientWidth;h=host.clientHeight;if(!w||!h)return;
   const rect=canvas.getBoundingClientRect(),display=Math.max(rect.width/w,rect.height/h),density=(devicePixelRatio||1)*display;
   // 按真实物理显示像素绘制，并留25%的抗锯齿余量；24MP/8192边长限制显存开销。
   ratio=Math.min(Math.max(1.5,density*1.25),Math.sqrt(24000000/(w*h)),8192/w,8192/h);
   const bw=Math.max(1,Math.round(w*ratio)),bh=Math.max(1,Math.round(h*ratio));
   if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh;}
   ctx.setTransform(bw/w,0,0,bh/h,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   canvas.dataset.pixelRatio=ratio.toFixed(3);canvas.dataset.displayDensity=density.toFixed(3);paint();
  }
  const ro=new ResizeObserver(resize),io=new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible&&duration){start=performance.now();from=camera;if(!raf)raf=requestAnimationFrame(tick);}},{threshold:.01});ro.observe(host);io.observe(host);
  function down(e){drag={x:e.clientX,yaw};canvas.setPointerCapture(e.pointerId);}
  function move(e){if(!drag)return;yaw=drag.yaw+(e.clientX-drag.x)/Math.max(400,w)*1.1;paint();}
  function up(){drag=null;}
  function pref(){if(reduce.matches)setView(to===0?'top':'eye',false);}
  function visibility(){if(!document.hidden&&duration){start=performance.now();from=camera;if(!raf)raf=requestAnimationFrame(tick);}}
  window.addEventListener('resize',resize);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);reduce.addEventListener('change',pref);document.addEventListener('visibilitychange',visibility);
  resize();if(enter)setView('eye',true);else onView('eye');
  return{setView,equipment,destroy(){dead=true;window.removeEventListener('resize',resize);cancelAnimationFrame(raf);ro.disconnect();io.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);reduce.removeEventListener('change',pref);document.removeEventListener('visibilitychange',visibility);canvas.dataset.moving='false';canvas.dataset.destroyed='true';}};
 };
})();
