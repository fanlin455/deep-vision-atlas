/* 油田概念地图的矢量设施细节。几何尺寸只用于画面辨识，不是工程设计比例。 */
(function(){'use strict';
 const group=(x,y,body,angle=0)=>'<g transform="translate('+x+' '+y+') rotate('+angle+')">'+body+'</g>';
 const rect=(x,y,w,h,fill,stroke='#73959e',r=1)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width=".8"/>';
 const line=(d,color='#9bb7bb',w=1)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-linejoin="round"/>';
 function building(x,y,w,h,angle=0){
  let s=rect(3,5,w,h,'#020e1780','none',2)+rect(0,0,w,h,'url(#fd-roof)','#93adb4',2);
  s+=line('M2 '+(h-2)+'V2H'+(w-2),'#c0d2cc',1.1)+line('M'+w/2+' 2V'+(h-2),'#d2ded0',.8);
  for(let j=7;j<w-3;j+=8)s+=line('M'+j+' 3V'+(h-3),'#91b1b366',.6);
  if(w>32&&h>22){s+=rect(w*.16,h*.24,Math.max(7,w*.16),Math.max(7,h*.22),'#193644','#9bb4b4');s+=rect(w*.61,h*.57,Math.max(6,w*.14),Math.max(6,h*.20),'#1b3946','#769da6');}
  s+=line('M'+(w*.3)+' '+h+'h'+Math.min(w*.25,13),'#e0c58d',2);
  return group(x,y,s,angle);
 }
 function tank(x,y,r){
  let s='<ellipse cx="4" cy="6" rx="'+(r+2)+'" ry="'+(r+1)+'" fill="#020c16aa"/>';
  s+='<circle r="'+r+'" fill="url(#fd-steel)" stroke="#acbcb7" stroke-width="1.3"/><circle r="'+(r-3)+'" fill="none" stroke="#d5d9c2" stroke-opacity=".6"/>';
  for(let j=0;j<12;j++){const a=j*Math.PI/6;s+=line('M'+(Math.cos(a)*4)+' '+(Math.sin(a)*4)+'L'+(Math.cos(a)*(r-5))+' '+(Math.sin(a)*(r-5)),'#a2b8b055',.7);}
  s+='<circle r="'+(r-7)+'" fill="none" stroke="#b5c9c047"/><circle r="3.5" fill="#d3d6b8" stroke="#557f87"/><circle cx="'+(-r*.35)+'" cy="'+(-r*.28)+'" r="2.2" fill="#172f3a" stroke="#a3b9ae"/>';
  s+=line('M'+(r*.62)+' '+(-r*.75)+'L'+(r*.62)+' '+(r*.75),'#d7cda6',1.4);
  for(let j=-r*.57;j<r*.65;j+=4)s+=line('M'+(r*.55)+' '+j+'h'+r*.17,'#e4d6ac',.8);
  s+=line('M'+r+' 0h9v13','#b7c6ba',2)+rect(r+6,9,5,7,'#41626a','#d0c68f');
  return group(x,y,s);
 }
 function truck(x,y,w=14,h=37,color='#789ba7',angle=0){
  let s=rect(2,3,w,h,'#020b1388','none',2)+rect(0,0,w,h,color,'#b7c9c7',2);
  s+=rect(2,2,w-4,h*.23,'#a7b9b3','#c9d2c2')+rect(3,4,w-6,5,'#163749','#6d929b');
  s+=rect(2,h*.34,w-4,h*.52,'#254654','#7b9ea6');
  for(let j=0;j<3;j++)s+=line('M3 '+(h*.43+j*5)+'H'+(w-3),'#91a8aa',.7);
  for(const yy of [h*.19,h*.72])s+=rect(-2,yy,3,6,'#07151e','#5c737b')+rect(w-1,yy,3,6,'#07151e','#5c737b');
  return group(x,y,s,angle);
 }
 function valve(x,y,color='#d7c28a'){
  return group(x,y,line('M-7 0H7M0 -7V7',color,1.4)+'<circle r="4" fill="#1d454c" stroke="'+color+'" stroke-width="1.2"/><circle r="1" fill="'+color+'"/>');
 }
 function pad(x,y,type){
  let s=rect(-55,-43,110,86,'#050f1980','none',5)+rect(-57,-45,110,86,'#132b34','#af9e74',4)+rect(-51,-39,98,74,'url(#fd-concrete)','#456066',2);
  s+=line('M-49 -36h16M-49 -36v13M45 33H29M45 33V20','#e6b66f',2);
  // 周界标识、排水槽和应急物资只在设施内部出现，避免装饰淹没地图。
  s+=line('M-43 -31H38V28H-43Z','#70878866',.7)+rect(-45,25,12,5,'#8d6d44','#ac925c')+rect(35,-32,5,7,'#9a7656','#c7aa78');
  if(type==='rig'){
   s+=rect(-26,-28,41,51,'#21414d','#8caaaf')+rect(-22,-25,33,45,'#375b67','#93abb1');
   s+=line('M-22 -25L11 20M11 -25L-22 20M-22 -10H11M-22 5H11M-6 -25V20','#e0d4aa',1.2);
   s+=rect(-19,22,29,5,'#8da8a9','#bccac0')+building(25,-26,14,44);
   s+=line('M-8 -29V-36H30V-28','#b8c8b5',1.6)+valve(23,-34);
   s+=rect(-43,-26,11,35,'#315666','#83a9ac')+line('M-40 -21v25M-36 -21v25','#90b1b5',1.2);
   s+='<circle cx="-5" cy="-2" r="9" fill="#163944" stroke="#f4c98d" stroke-width="1.4"/>';
  }else if(type==='mudlog'){
   s+=building(-39,-29,24,52)+building(-8,-29,20,37);
   s+=rect(20,-26,17,48,'#39616b','#a2babb');
   for(let j=0;j<4;j++)s+=rect(22,-23+j*11,13,8,'#173e45','#7dacaa');
   s+=line('M-16 15H17V-28M-28 29H28','#8ed8cc',1.7)+valve(17,15,'#91c6c0');
   for(let j=0;j<3;j++)s+=rect(-7,16+j*5,17,3,'#9ba990','#c8c9a6');
   s+='<circle cx="-28" cy="-15" r="3" fill="#87d7cc"/><path d="M-28 -15l-7 -7M-28 -15l6 -6" stroke="#a9d4ca" stroke-width="1"/>';
  }else if(type==='casing'){
   s+=truck(-42,-28,16,44,'#769a9e')+rect(-17,-25,28,48,'#294a54','#7999a1');
   for(let j=0;j<3;j++)s+='<ellipse cx="-3" cy="'+(-17+j*15)+'" rx="9" ry="5" fill="#9da987" stroke="#d1cba0"/><path d="M-12 '+(-17+j*15)+'v7q9 7 18 0v-7" fill="#536f68" stroke="#91a68b"/>';
   s+=rect(19,-24,20,44,'#2b4b55','#7a9aa0')+line('M22 -17H36M22 -8H36M22 1H36M22 10H36','#a0b2ac',1.5);
   s+=line('M-26 23H-3V30H28V12','#e0c38d',2)+valve(-3,25);
  }else if(type==='logging'){
   s+=truck(-40,-29,20,49,'#84a7ae')+rect(-9,-24,36,46,'#294c59','#91afb6');
   s+='<circle cx="9" cy="-2" r="16" fill="#152e3c" stroke="#b2c6c5" stroke-width="2"/>';
   for(let r=5;r<15;r+=3)s+='<circle cx="9" cy="-2" r="'+r+'" fill="none" stroke="#6f959f" stroke-width=".9"/>';
   s+=line('M9 -18V14M-7 -2H25M25 -2H38V27H-12','#e1c28a',1.3)+rect(30,-30,7,21,'#bac5b6','#e0dcc3');
  }else if(type==='perforation'){
   s+=truck(-40,-29,17,46,'#8c9f9b')+truck(-15,-29,17,46,'#738f9c')+truck(22,-25,14,40,'#9a9e8c');
   s+=rect(7,-27,8,49,'#1a343f','#8ca3a7');
   for(let j=0;j<5;j++)s+=line('M9 '+(-22+j*9)+'h4','#dfc799',2.5);
   s+=line('M-29 22H31M-6 17V29H10','#cfad74',1.5)+valve(10,28);
  }else{
   s+=rect(-21,-25,40,49,'#254a51','#7da2a3');
   s+=line('M-15 0H15M0 -20V20','#adc7b7',7)+line('M-15 0H15M0 -20V20','#315c60',3);
   s+='<circle r="8" fill="#133b40" stroke="#d8c292" stroke-width="1.5"/>'+valve(0,-15)+valve(13,0);
   s+=building(27,-24,12,42)+rect(-43,-24,13,40,'#3c5d61','#90aaaa');
   s+=line('M-37 -20v31M-32 -20v31','#a8b7ac',1);
  }
  return group(x,y,s);
 }
 function well(x,y,kind){
  let s=rect(-26,-21,52,42,'#142e32','#6f8e73',3)+rect(-22,-17,44,34,'url(#fd-concrete)','#4f756d');
  if(kind==='injection'){
   s+=line('M-15 0H15M0 -13V13','#a7cbaf',5)+line('M-15 0H15M0 -13V13','#315e59',2.2)+valve(0,0,'#c6dc9e')+valve(13,0,'#c6dc9e');
  }else if(kind==='workover'){
   s+=truck(-18,-16,12,31,'#7d9c9b')+line('M3 -14L17 13M17 -14L3 13M3 -14H17V13H3Z','#b7c7ab',1.4)+valve(10,0,'#cfdaa5');
  }else{
   s+=rect(-7,-15,14,29,'#304f49','#8fa87e')+rect(-4,5,8,8,'#96aa80','#c6d59d');
   s+=line('M-17 -5H15L19 -1 15 2H-16Z','#d6dbac',2)+line('M-5 -5L3 11M3 -5L-5 11','#8fb18d',1.2);
   s+='<circle cx="-15" cy="-3" r="4" fill="#61856b" stroke="#c7d99c"/><path d="M17 2V14" stroke="#b6cea1" stroke-width="1.2"/>';
  }
  return group(x,y,s);
 }
 function terrain(){
  let s='<g opacity=".65">';
  for(let j=0;j<105;j++){
   const x=60+(j*59.31)%340,y=140+(j*37.17)%395;
   if(x>110&&x<350&&y>280&&y<425)continue;
   s+='<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="'+(2+j%3)+'" ry="'+(1.2+j%2)+'" fill="#4f716455"/><path d="M'+(x-2).toFixed(1)+' '+y.toFixed(1)+'l2 -3 3 2" fill="none" stroke="#86a78d55" stroke-width=".6"/>';
  }
  s+='</g><path d="M95 243L150 231 195 239 213 270 189 293 144 276Z" fill="url(#fd-rock)" stroke="#76918455" stroke-width=".7"/><g fill="none" stroke="#99aa8b44" stroke-width=".8"><path d="M103 249l45 -9 35 13 14 19M122 260l31 -6 29 18M157 233l-7 39"/></g>';
  s+=line('M67 515C146 476 244 506 330 467S400 410 444 389','#8b9a7044',5)+line('M67 515C146 476 244 506 330 467S400 410 444 389','#152b2c',2);
  s+='<g fill="none" stroke="#55808b33" stroke-width=".7"><path d="M28 716C198 592 182 794 406 726S771 813 876 859M49 731C203 610 194 805 417 741S779 825 868 868"/></g>';
  s+=truck(131,363,12,27,'#769ca0',-28)+truck(237,397,12,27,'#759992',28)+truck(319,320,12,27,'#7f9ca7',-25);
  s+=group(151,491,rect(-22,-12,45,25,'#1e3d43','#77988b',2)+building(-17,-8,18,17)+rect(6,-7,11,16,'#5e7a66','#a2b496')+line('M-2 -9V-26M-8 -25L-2 -21 4 -25','#a6cdb6',1.2));
  for(const [x,y]of [[83,325],[110,410],[334,285],[334,410]])s+=group(x,y,line('M-4 0H4M0 -4V4','#99c9bc',1)+'<circle r="2" fill="#d7dfb6"/>');
  return '<g data-field-detail="terrain">'+s+'</g>';
 }
 function perimeter(x,y,w,h){let s=line('M'+x+' '+y+'h'+w+'v'+h+'h-'+w+'Z','#65838a66',.9);for(let i=0;i<=w;i+=20)s+=line('M'+(x+i)+' '+(y-2)+'v4M'+(x+i)+' '+(y+h-2)+'v4','#9db0a466',.7);for(let i=20;i<h;i+=20)s+=line('M'+(x-2)+' '+(y+i)+'h4M'+(x+w-2)+' '+(y+i)+'h4','#9db0a466',.7);return s;}
 function siteDetails(){
  let s=perimeter(448,172,495,524)+perimeter(1020,177,430,363)+perimeter(1190,575,355,231);
  // 路肩、井场连接道、停车与桥面。
  for(const d of ['M620 373V364','M790 373V351','M815 473V510','M610 493V510','M625 623V630','M805 603V630'])s+=line(d,'#6e7c6e',10)+line(d,'#bdc0a855',1);
  for(const [x,y]of [[476,390],[716,645],[968,604],[1410,395]]){
   s+=rect(x,y,27,43,'#1a333b','#52696f');for(let j=0;j<4;j++)s+=line('M'+(x+3)+' '+(y+7+j*9)+'h19','#9dab9966',.7);
  }
  s+=truck(478,414,10,25,'#9ba89b')+truck(717,656,11,27,'#8b9c96')+truck(1408,404,11,27,'#729da6',90);
  // 储罐围堰、泵房与管架支撑。
  s+=rect(1274,178,128,127,'none','#93ab8c66',3)+rect(1219,626,153,149,'none','#91a58a77',3);
  s+=building(1426,327,18,53)+building(1162,631,22,43);
  for(const [x,y]of [[1140,277],[1140,392],[1330,326],[1330,424],[1330,520],[980,413],[980,503],[1224,650],[1444,650]])s+=valve(x,y,'#d5b87f');
  for(let y=306;y<625;y+=29)s+=line('M1324 '+y+'h12','#9caaa055',2);
  // 处理列管、换热器风扇、阀组和仪表接点。
  for(let j=0;j<4;j++){const x=1389+j*27;for(let i=0;i<6;i++)s+=line('M'+(x-4)+' '+(616+i*10)+'h8','#c2cdbe',.65);s+='<circle cx="'+x+'" cy="651" r="5.5" fill="#294e5b" stroke="#aac1bf" stroke-width=".8"/>'+line('M'+(x-3)+' 648l6 6m-6 0l6 -6','#d7d4b3',.7);}
  for(let j=0;j<5;j++)s+=rect(1384+j*19,717,13,18,'#365765','#7fa2ad')+line('M'+(1390+j*19)+' 719v14','#aac0c1',.6);
  s+=line('M1362 628V594H1520V694H1483M1376 742H1518V704','#88aaa8',1.8);
  for(const [x,y]of [[1390,594],[1470,594],[1518,724]])s+=valve(x,y,'#99c5d9');
  // 各井场设备互不相同：录井房、测井绞车、固井泵车和射孔车辆。
  return '<g data-field-detail="process">'+s+'</g>';
 }
 function defs(){return '<defs><linearGradient id="fd-roof" x2="1" y2="0"><stop stop-color="#2b4b5a"/><stop offset=".48" stop-color="#688b95"/><stop offset=".52" stop-color="#365d6d"/><stop offset="1" stop-color="#1b3949"/></linearGradient><radialGradient id="fd-steel" cx=".32" cy=".25"><stop stop-color="#b1c1b9"/><stop offset=".3" stop-color="#698c91"/><stop offset=".72" stop-color="#315b6c"/><stop offset="1" stop-color="#183947"/></radialGradient><linearGradient id="fd-rock" x2="1" y2="1"><stop stop-color="#4e6757" stop-opacity=".7"/><stop offset="1" stop-color="#1c3537" stop-opacity=".3"/></linearGradient><pattern id="fd-concrete" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#2a4145"/><path d="M0 9V0H9" stroke="#9bada1" stroke-opacity=".08" stroke-width=".6"/><circle cx="3" cy="6" r=".55" fill="#9cb3a5" opacity=".23"/></pattern></defs>';}
 window.FieldDetail={building,tank,pad,well,terrain,siteDetails,defs};
})();
