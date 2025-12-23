(function(){
//cpsplotrender
window.cpsPlot={
renderCps:()=>renderCps(),
renderCpsAsync:()=>common.executeWithStatusAsync('Renderingcps...',()=>renderCps()),
}

functiongetCountsInRange(from,to){
from=from<0?0:from;
to=to>=waterfallData.baseSpectrum.channelCount
?waterfallData.baseSpectrum.channelCount-1
:to;

constcountsInRange={};
waterfallData.deltas.forEach((delta,deltaIndex)=>{
for(letci=from;ci<=to;ci++){
if(countsInRange[deltaIndex]===undefined){
countsInRange[deltaIndex]=delta.channels[ci];
}else{
countsInRange[deltaIndex]+=delta.channels[ci];
}

if(waterfallState.subtractBase&&waterfallData.baseSpectrum.duration>0){
countsInRange[deltaIndex]-=waterfallData.baseSpectrum.channels[ci]*(delta.duration/waterfallData.baseSpectrum.duration);
}
}

if(countsInRange[deltaIndex]<0){
countsInRange[deltaIndex]=0;
}
});

returncountsInRange;
}

functioncountsToCps(countsInRange){
constcpsInRange={};
Object.keys(countsInRange).forEach(deltaIndex=>{
cpsInRange[deltaIndex]=countsInRange[deltaIndex]/waterfallData.deltas[deltaIndex].duration;
});

returncpsInRange;
}

functiongetRenderData(valuesInRange){
letmax=0;
letmin=Infinity;
for(leti=0;i<waterfallData.deltas.length;i++){
if(valuesInRange[i]===undefined){
continue;
}

max=Math.max(max,valuesInRange[i]);
min=Math.min(min,valuesInRange[i]);
}

return{
values:valuesInRange,
max:max,
min:min
}
}

functionrenderCps(){
constcpsCanvas=document.getElementById('cps-plot');
cpsCanvas.width=waterfallData.deltas.length+constants.channelAxisHeight;
cpsCanvas.height=constants.cpsPlotHeight;

constrange1=waterfallState.channelRange1;
if(!range1||range1.length!==2){
renderCpsData(cpsCanvas);
return;
}

constrange2=waterfallState.channelRange2;
if(waterfallState.compareCps&&(!range2||range2.length!==2)){
renderCpsData(cpsCanvas);
return;
}

if(waterfallState.compareCps){
constcountsInRange1=getCountsInRange(range1[0],range1[1]);
constcpsInRange1=countsToCps(countsInRange1);
constcountsInRange2=getCountsInRange(range2[0],range2[1]);
constcpsInRange2=countsToCps(countsInRange2);
constratio={};
for(leti=0;i<waterfallData.deltas.length;i++){
if(cpsInRange1[i]!==undefined&&cpsInRange2[i]>0){
ratio[i]=cpsInRange1[i]/cpsInRange2[i];
}
}

window.cpsData={
range1:cpsInRange1,
range2:cpsInRange2,
ratio:ratio,
}

constplotHeight=constants.cpsPlotHeight/3;
cpsCanvas.height=plotHeight*3;
renderCpsData(cpsCanvas,getRenderData(cpsInRange1),0,plotHeight,'range_1cps');
renderCpsData(cpsCanvas,getRenderData(cpsInRange2),plotHeight,plotHeight,'range_2cps');
renderCpsData(cpsCanvas,getRenderData(ratio),plotHeight*2,plotHeight,'range_1/range_2');
}else{
constcountsInRange1=getCountsInRange(range1[0],range1[1]);
constcpsInRange1=countsToCps(countsInRange1);
constrenderData=getRenderData(cpsInRange1);

window.cpsData={
range1:cpsInRange1,
}

renderCpsData(cpsCanvas,renderData,0,cpsCanvas.height,'range_1cps');
}
}

functionrenderCpsData(canvas,data,offset,height,label){
constctx=canvas.getContext("2d");
ctx.fillStyle=constants.backgroundColor;
ctx.fillRect(0,offset,canvas.width,height);

if(!data){
return;
}

letdisplayMax=data.max;
letdisplayMin=data.min;
switch(waterfallState.scale){
case'log':
displayMax=Math.log(displayMax+0.1);
displayMin=Math.log(displayMin+0.1);
break;
case'sqrt':
displayMax=Math.sqrt(displayMax);
displayMin=Math.sqrt(displayMin);
break;
default:
break;
}
if(displayMax===0&&displayMin===0){
displayMax=1;
displayMin=-1;
}
letdisplayRange=displayMax-displayMin;
displayMax+=constants.cpsExtendRange*(displayRange===0?displayMax:displayRange);
displayMin-=constants.cpsExtendRange*(displayRange===0?displayMax:displayRange);
displayRange=displayMax-displayMin;

//line
ctx.beginPath();
ctx.lineWidth=1;
ctx.setLineDash([1,0]);
ctx.strokeStyle=constants.lineColor;
letfirstMove=true;
for(letx=0;x<waterfallData.deltas.length;x++){
if(data.values[x]===undefined){
continue;
}

letdisplayValue=data.values[x];
switch(waterfallState.scale){
case'log':
displayValue=Math.log(displayValue+0.1);
break;
case'sqrt':
displayValue=Math.sqrt(displayValue);
break;
default:
break;
}

consty=height-((displayValue-displayMin)/displayRange)*height+offset;

if(firstMove){
ctx.moveTo(x,y);
firstMove=false;
}else{
ctx.lineTo(x,y);
ctx.moveTo(x,y);
}
}
ctx.stroke();

//separatorline
if(offset>0){
ctx.beginPath();
ctx.lineWidth=1;
ctx.setLineDash([2,2]);
ctx.strokeStyle=constants.separatorLineColor;
ctx.moveTo(0,offset-0.5);
ctx.lineTo(canvas.width,offset-0.5);
ctx.stroke();
}

//labels
constrange=data.max-data.min;
ctx.fillStyle=constants.textColor;
ctx.textBaseline='top';
ctx.fillText(data.max.toFixed(range<0.01?4:2)+'(max)',0,offset);
ctx.textBaseline='bottom';
ctx.fillText(data.min.toFixed(range<0.01?4:2)+'(min)',0,offset+height);
ctx.textBaseline='top';
ctx.fillText(label+'('+waterfallState.scale+')',canvas.width/2-label.length*2,offset);
}
})();
