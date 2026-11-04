/* 纯 Canvas 概念视觉：透视地层网格、传播波前和井轨迹，不代表现场模拟结果。 */
(function(){'use strict';
 window.mountPetroleumField=function(canvas){
  const ctx=canvas.getContext('2d'),host=canvas.parentElement,media=matchMedia('(prefers-reduced-motion: reduce)');
  let width=1,height=1,dpr=1,raf=0,last=0,time=0,visible=true,destroyed=false,paused=media.matches,frames=0;
  const pointer={x:0,y:0},view={x:0,y:0};
  
  const api={onChange:null,isPaused:()=>paused,setPaused(value){paused=!!value;canvas.dataset.motion=paused?'paused':'running';cancelAnimationFrame(raf);raf=0;last=0;if(!paused)schedule();else draw();},destroy(){destroyed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);media.removeEventListener('change',preference);canvas.dataset.motion='destroyed';}};
  function surface(u,v){return .048*Math.sin(3.1*u+2.4*v)+.025*Math.cos(5*v-1.7*u)+.028*Math.sin(5.5*u-2*v)+(u>.28?.035:0);}
  let size,cx,cy,mobile;
  function project(u,v,depth=0){const angle=.035*Math.sin(time*.3)+view.x*.13,c=Math.cos(angle),s=Math.sin(angle),U=u*c-v*s,V=u*s+v*c;return [cx+(U*.86+V*.49)*size+view.x*depth*18,cy+(-U*.19+V*.28+surface(u,v)+depth)*size+view.y*12];}
  function path(points,close=false){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));if(close)ctx.closePath();}
  function line(points,color,weight=1,alpha=1,glow=0){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=weight;if(glow){ctx.shadowColor=color;ctx.shadowBlur=glow;}path(points);ctx.stroke();ctx.restore();}
  function dot(p,r,color,glow=0){ctx.save();ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=glow;ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.fill();ctx.restore();}
  function perimeter(depth){const p=[];for(let i=0;i<=24;i++)p.push(project(-1+i/12,-1,depth));for(let i=1;i<=24;i++)p.push(project(1,-1+i/12,depth));for(let i=1;i<=24;i++)p.push(project(1-i/12,1,depth));for(let i=1;i<24;i++)p.push(project(-1,1-i/12,depth));return p;}
  function glowLine(points,color,weight=2){line(points,color,weight+6,.12,18);line(points,color,weight,.95,9);}
  function label(p,text,dx,dy,color){if(width<650)return;const x=Math.max(width*.48,Math.min(width-155,p[0]+dx)),y=p[1]+dy;if(y<35||y>height-150)return;line([p,[x-12,y-5],[x+95,y-5]],color,.8,.5);ctx.save();ctx.fillStyle=color;ctx.font='500 '+Math.max(13,Math.min(20,width*.009))+'px "Microsoft YaHei",sans-serif';ctx.fillText(text,x,y-15);ctx.restore();}
  function solidLayer(depth,index){
   const warm=index===3||index===4,thick=index===3?.065:.045,color=warm?'#ff8b35':'#4acddd';
   // 前侧的厚度与明暗让每层成为岩层体，而非重叠的线框。
   for(const edge of [0,1]){
    const top=[],bottom=[];for(let j=0;j<=40;j++){const q=-1+j/20;top.push(edge?project(q,1,depth):project(1,q,depth));bottom.push(edge?project(q,1,depth+thick):project(1,q,depth+thick));}
    path([...top,...bottom.reverse()],true);const g=ctx.createLinearGradient(0,cy+depth*size,0,cy+(depth+.3)*size);g.addColorStop(0,warm?'#ff9b44':'#17627a');g.addColorStop(1,warm?'#632b1c':'#071f30');ctx.fillStyle=g;ctx.fill();
    line(top,color,warm?2.8:1.2,warm?.95:.65,warm?13:0);
   }
   const bound=perimeter(depth);path(bound,true);ctx.fillStyle=warm?'#6a301e':'#09212f';ctx.fill();
   // 着色网格面以起伏和剖面强调地下空间，暖色层表示概念储层。
   const N=26,M=15;
   for(let row=0;row<M;row++)for(let col=0;col<N;col++){
    const u=-1+2*col/N,v=-1+2*row/M,du=2/N,dv=2/M;
    const light=.5+.5*Math.sin(u*3.4+v*2.3+index*.6),scan=.5+.5*Math.sin(u*4-v*3-time*.65);
    path([project(u,v,depth),project(u+du,v,depth),project(u+du,v+dv,depth),project(u,v+dv,depth)],true);
    ctx.fillStyle=warm?'rgb('+Math.round(132+light*85)+','+Math.round(48+light*56)+','+Math.round(16+scan*16)+')':'rgb('+Math.round(7+light*13)+','+Math.round(32+light*39)+','+Math.round(48+light*48)+')';
    ctx.fill();
   }
   for(let row=0;row<=M;row++){const pts=[];for(let j=0;j<=N*2;j++)pts.push(project(-1+j/N,-1+2*row/M,depth));line(pts,color,.6,warm?.35:.33);}
   for(let col=0;col<=N;col++){const pts=[];for(let j=0;j<=M*2;j++)pts.push(project(-1+2*col/N,-1+j/M,depth));line(pts,color,.65,warm?.28:.23);}
   line([...bound,bound[0]],warm?'#ffc17a':'#62dbe6',warm?2:1.4,.8,warm?10:0);
  }
  function draw(){
   if(destroyed||!ctx)return;frames++;canvas.dataset.frame=String(frames);
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
   mobile=width<=800;size=mobile?Math.min(width*.58,250):Math.min(Math.min(width,1920)*.30,height*.66,560);cx=mobile?width*.54:Math.max(0,(width-1920)/2)+Math.min(width,1920)*.72;cy=mobile?height*(width>600?.62:.55):height*.30;
   view.x+=(pointer.x-view.x)*.055;view.y+=(pointer.y-view.y)*.055;
   const center=[cx,cy+size*.25],radius=size*1.3;
   const halo=ctx.createRadialGradient(center[0],center[1],0,center[0],center[1],radius);halo.addColorStop(0,'#ff7d243b');halo.addColorStop(.40,'#1b69773a');halo.addColorStop(.8,'#15253322');halo.addColorStop(1,'#060e1700');ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
   // 地球物理扫描环形成主视觉的能量中心，不作坐标或速度解释。
   ctx.save();ctx.translate(cx,cy+size*.28);ctx.rotate(-.27);
   for(let ring=0;ring<6;ring++){
    const r=size*(.67+ring*.055),sweep=time*.16+ring*.36;
    ctx.beginPath();ctx.ellipse(0,0,r,r*.62,0,0,Math.PI*2);ctx.strokeStyle=ring===2?'#ff8d3550':'#58adc822';ctx.lineWidth=ring===2?3:1;ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,0,r,r*.62,0,sweep,sweep+.48);ctx.strokeStyle=ring%2?'#79eaff':'#ffb15b';ctx.lineWidth=ring===2?4:2;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=19;ctx.stroke();ctx.shadowBlur=0;
   }
   ctx.restore();
   // 低亮度流线与采样粒子穿过整幅画面。
   for(let i=0;i<100;i++){const x=(i*131.37+time*(7+i%5))%width,y=(i*83.13)%height;dot([x,y],i%13===0?1.6:.65,i%4?'#71cddd':'#ffab69');}
   for(let k=0;k<9;k++){const points=[];for(let j=0;j<=90;j++){const x=j/90*width,y=height*(.60+k*.032)+Math.sin(j*.10+k*.4+time*.4)*height*.04;points.push([x,y]);}line(points,k%3?'#6edbe5':'#ffa34e',.8,.13);}
   // 分解剖面：岩层分开呈现，金色储层与冷色盖层形成强烈对照。
   const depths=[0,.18,.36,.55,.72];for(let k=4;k>=0;k--)solidLayer(depths[k],k);
   ctx.save();ctx.globalCompositeOperation='lighter';
   // 以井位为中心的明亮扫描体：大尺度能量弧与地层剖面形成空间交叉。
   const focal=project(-.05,-.12,-.04);
   ctx.save();ctx.translate(focal[0],focal[1]+size*.04);ctx.rotate(-.28);
   const aura=ctx.createRadialGradient(0,0,size*.2,0,0,size*.88);aura.addColorStop(0,'#ff8d2000');aura.addColorStop(.64,'#ff9a2b00');aura.addColorStop(.77,'#ff9b3a30');aura.addColorStop(.86,'#ff732315');aura.addColorStop(1,'#ff732300');ctx.scale(1,.74);ctx.fillStyle=aura;ctx.fillRect(-size,-size,size*2,size*2);
   for(let n=0;n<3;n++){
    const r=size*(.70+n*.035),a=time*.12+n*.6;
    ctx.beginPath();ctx.arc(0,0,r,a+.16,a+Math.PI*1.65);ctx.strokeStyle=n===1?'#ffb557':'#ed813c';ctx.lineWidth=n===1?3.2:1;ctx.shadowColor='#ff8a24';ctx.shadowBlur=n===1?28:12;ctx.globalAlpha=n===1?.95:.45;ctx.stroke();
   }
   ctx.globalAlpha=.7;ctx.shadowBlur=12;ctx.strokeStyle='#ffd8a0';ctx.lineWidth=1.3;
   for(let j=0;j<70;j++){const a=j/70*Math.PI*2,r=size*.77;ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a)*(r+size*(j%5===0?.026:.012)),Math.sin(a)*(r+size*(j%5===0?.026:.012)));ctx.stroke();}
   ctx.restore();
   // 地表移动光幕与传播波。
   const scan=-.8+(time*.25%1.6),scanTop=[],scanBottom=[];
   for(let j=0;j<=50;j++){const v=-1+j/25;scanTop.push(project(scan,v,-.01));scanBottom.push(project(scan,v,.76));}
   path([...scanTop,...scanBottom.reverse()],true);const scanFill=ctx.createLinearGradient(0,cy,0,cy+size);scanFill.addColorStop(0,'#63e8ff30');scanFill.addColorStop(1,'#ff89231a');ctx.fillStyle=scanFill;ctx.fill();glowLine(scanTop,'#a7f7ff',2.8);
   for(let n=0;n<3;n++){const r=((time*.13+n*.34)%1)*1.7,pts=[];for(let j=0;j<=120;j++){const a=j/120*Math.PI*2,u=-.05+Math.cos(a)*r,v=-.12+Math.sin(a)*r;if(Math.abs(u)>1||Math.abs(v)>1){if(pts.length>1)line(pts,'#86efff',2,(1-r/1.7)*.72,5);pts.length=0;continue;}pts.push(project(u,v,-.005));}if(pts.length>1)line(pts,'#86efff',2,(1-r/1.7)*.72,5);}
   // 储层发光粒子带，取样为稳定的教学概念分布。
   for(let j=0;j<100;j++){const u=-.9+(j%20)/19*1.7,v=.15+Math.floor(j/20)*.09+.045*Math.sin(j*2.7),p=project(u,v,.548),b=.45+.4*Math.sin(j+time*1.2);ctx.globalAlpha=b;dot(p,j%7===0?2.5:1.1,'#ffd8a1',j%7===0?8:0);}ctx.globalAlpha=1;
   const well=[];for(let i=0;i<=45;i++)well.push(project(-.05,-.12,i/45*.48));for(let i=1;i<=45;i++){const a=i/45;well.push(project(-.05+.75*a,-.12+.3*a,.48+.07*Math.sin(a*Math.PI/2)));}
   line(well,'#ff6c23',15,.15,32);glowLine(well,'#ffbb6a',3.6);line(well,'#fff6d0',1.3,.95);
   for(let i=0;i<8;i++){const a=(time*.16+i*.125)%1,idx=Math.floor(a*(well.length-1)),q=well[idx],r=well[idx+1],f=a*(well.length-1)-idx;dot([q[0]+(r[0]-q[0])*f,q[1]+(r[1]-q[1])*f],3,'#fff8d9',16);}
   const end=well[well.length-1];dot(end,7,'#fff0b0',30);for(let n=0;n<2;n++){const r=10+(time*17+n*17)%35;ctx.beginPath();ctx.arc(end[0],end[1],r,0,Math.PI*2);ctx.strokeStyle='#ffbe75';ctx.lineWidth=1.5;ctx.globalAlpha=(45-r)/45;ctx.stroke();}ctx.globalAlpha=1;
   // 上方井架以高亮轮廓建立石油作业锚点。
   const origin=project(-.05,-.12,-.01),rig=mobile?64:Math.min(135,size*.24),x=origin[0],y=origin[1];
   glowLine([[x-rig*.27,y],[x,y-rig],[x+rig*.27,y]],'#a8edee',1.8);
   for(let i=1;i<=4;i++){const f=i/5,yy=y-rig*f,half=rig*.27*(1-f);line([[x-half,yy],[x+half,yy]],'#b6f4ef',1.4,.9);if(i<4)line([[x-half,yy],[x+half*.65,yy-rig*.2]],'#b6f4ef',1.2,.8);}
   line([[x,y-rig-11],[x,y]],'#d9fdff',1.8,.95);dot(origin,5,'#c0faff',20);
   ctx.restore();
   label(project(-.8,-.7,0),'地震波场',-50,-25,'#a9e9f7');label(project(.75,.75,.55),'智能寻层',-80,-15,'#ffd49a');canvas.dataset.ready='true';
  }
  function frame(stamp){raf=0;if(destroyed||paused||document.hidden||!visible)return;if(!last)last=stamp;const delta=stamp-last;if(delta>=32){time+=Math.min(delta,80)/1000;last=stamp;draw();}schedule();}
  function schedule(){if(!raf&&!destroyed&&!paused&&!document.hidden&&visible)raf=requestAnimationFrame(frame);}
  function resize(){const rect=host.getBoundingClientRect();width=host.clientWidth;height=host.clientHeight;dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);draw();}
  function visibility(){cancelAnimationFrame(raf);raf=0;last=0;if(!document.hidden)schedule();}
  function preference(){api.setPaused(media.matches);api.onChange?.();}
  function move(event){if(paused)return;const r=host.getBoundingClientRect();pointer.x=(event.clientX-r.left)/r.width-.5;pointer.y=(event.clientY-r.top)/r.height-.5;}
  function leave(){pointer.x=pointer.y=0;}
  const resizeObserver=new ResizeObserver(resize),intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;cancelAnimationFrame(raf);raf=0;last=0;schedule();},{threshold:.02});
  resizeObserver.observe(host);intersection.observe(host);document.addEventListener('visibilitychange',visibility);host.addEventListener('pointermove',move);host.addEventListener('pointerleave',leave);media.addEventListener('change',preference);
  canvas.dataset.motion=paused?'paused':'running';resize();schedule();return api;
 };
})();
