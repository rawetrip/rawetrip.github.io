(function(){
var g=document.getElementById("sponsor-grid");
if(!g) return;
var s=[
 ["Los Pollos Hermanos","lpollos","png",0,"transform:scale(1.125)"],
 ["HHM","hhm","png",0,"transform:scale(1.5)"],
 ["JMM","jmm","png",0,"transform:scale(1.5)"],
 ["Vought International","vought","png",0,"transform:scale(1.5)"],
 ["Los Santos Customs","lsc","webp",0,""],
 ["Black Mesa","blackmesa","svg",1,""],
 ["Aperture Science","aperture","webp",0,""],
 ["Arasaka Corporation","arasaka","webp",0,"transform:scale(1.75)"],
 ["Stark Industries","stark","png",1,""],
 ["Merryweather Security","merryweather","webp",0,""],
 ["LSPD","lspd","webp",0,""],
 ["NERV","nerv","png",1,""],
 ["HAVVK","havvk","webp",1,"transform:scale(1.5)"],
 ["Kiroshi Optics","kiroshi","png",0,""],
 ["Trauma Team","trauma","png",0,"margin-left:-5px"],
 ["Militech","militech","webp",1,""],
 ["Hammond Robotics","hammond","webp",1,"margin-left:95px;transform:scale(1.3125)"],
 ["ATLAS","atlas","webp",0,""],
 ["Vault-Tec","vaulttec","png",1,""],
 ["Umbrella Corp","umbrella","webp",0,"transform:scale(2)"]
];
var h="";
for(var i=0;i<s.length;i++){
  var name=s[i][0], src="images/sponsors/"+s[i][1]+"."+s[i][2], dark=s[i][3];
  var filt=dark?"brightness(0) invert(1)":"";
  h+='<div class="sp-card" style="background:#1a1a1a;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:28px 16px;display:flex;align-items:center;justify-content:center;height:120px;transition:all .25s;position:relative;overflow:hidden;">';
  h+='<img src="'+src+'" alt="'+name+'" style="max-width:85%;max-height:75px;filter:'+filt+';object-fit:contain;'+s[i][4]+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'">';
  h+='<span style="display:none;position:absolute;opacity:.4;font-size:13px;font-weight:700;color:#fff;text-align:center">'+name+'</span>';
  h+='</div>';
}
g.innerHTML=h;
var cards=document.querySelectorAll('.sp-card');
for(var j=0;j<cards.length;j++){
  cards[j].onmouseenter=function(){this.style.transform='translateY(-3px)';this.style.borderColor='rgba(255,255,255,.2)';this.style.background='#222'};
  cards[j].onmouseleave=function(){this.style.transform='';this.style.borderColor='rgba(255,255,255,.08)';this.style.background='#1a1a1a'};
}
})();
