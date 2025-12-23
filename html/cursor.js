(function(){
//mousecursorrender
constpreviewContainer=document.getElementById('preview-container');
constwfContainer=document.getElementById('waterfall-container');
constcpsContainer=document.getElementById('cps-container');
constwaterfallPlot=document.getElementById('waterfall-plot');
constcpsPlot=document.getElementById('cps-plot');
constwfHorizontalCursor=document.getElementById('horizontal-cursor');
constwfVerticalCursor=document.getElementById('vertical-cursor');

wfContainer.addEventListener('scroll',(e)=>onWfContainerScroll(e));
cpsContainer.addEventListener('scroll',(e)=>onCpsContainerScroll(e));
waterfallPlot.addEventListener('mouseleave',e=>plotOnMouseLeave(e));
waterfallPlot.addEventListener('mousemove',e=>waterfallOnMouseMove(e));
cpsPlot.addEventListener('mouseleave',e=>plotOnMouseLeave(e));
cpsPlot.addEventListener('mousemove',e=>cpsOnMouseMove(e));

window.cursorControl={
getWFOriginalSpectrumIndex:(mouseEvent)=>getWFOriginalSpectrumIndex(mouseEvent),
getWFChannelIndex:(mouseEvent)=>getWFChannelIndex(mouseEvent),
getCpsOriginalSpectrumIndex:(mouseEvent)=>getCpsOriginalSpectrumIndex(mouseEvent),
};

functiongetWFSpectrumOffset(mouseEvent){
letoffsetY=mouseEvent.offsetY-constants.cursorOffset;
if(offsetY<0){
offsetY=0;
}elseif(mouseEvent.offsetY>=waterfallData.deltas.length){
offsetY=waterfallData.deltas.length-1;
offsetY=waterfallData.deltas.length-1;
}

returnoffsetY;
}

functiongetCpsSpectrumOffset(mouseEvent){
letoffsetX=mouseEvent.offsetX-constants.cursorOffset;
if(offsetX<0){
offsetX=0;
}elseif(offsetX>waterfallData.deltas.length-1){
offsetX=waterfallData.deltas.length-1;
}

returnoffsetX;
}

functiongetWFChannelOffset(mouseEvent){
letoffsetX=mouseEvent.offsetX-constants.cursorOffset;
if(offsetX<constants.timeAxisWidth){
offsetX=constants.timeAxisWidth;
}elseif(offsetX>constants.timeAxisWidth+waterfallData.baseSpectrum.channelCount-1){
offsetX=constants.timeAxisWidth+waterfallData.baseSpectrum.channelCount-1;
}

returnoffsetX;
}

functiongetWFOriginalSpectrumIndex(mouseEvent){
constspectrumIndex=getWFSpectrumOffset(mouseEvent);

returnspectrumIndex*waterfallState.spectrumBinning*originalWaterfallData.spectrumBinning;
}

functiongetCpsOriginalSpectrumIndex(mouseEvent){
constspectrumIndex=getCpsSpectrumIndex(mouseEvent);

returnspectrumIndex*waterfallState.spectrumBinning*originalWaterfallData.spectrumBinning;
}

functiongetWFSpectrumIndex(mouseEvent){
constoffsetY=getWFSpectrumOffset(mouseEvent);

returnoffsetY;
}

functiongetCpsSpectrumIndex(mouseEvent){
constoffsetX=getCpsSpectrumOffset(mouseEvent);

returnoffsetX;
}

functiongetWFChannelIndex(mouseEvent){
constoffsetX=getWFChannelOffset(mouseEvent);

returnoffsetX-constants.timeAxisWidth;
}

functionplotOnMouseLeave(e){
wfHorizontalCursor.style.display='none';
wfVerticalCursor.style.display='none';

waterfallPlot.setAttribute('title','');
cpsPlot.setAttribute('title','');
}

functionwaterfallOnMouseMove(e){
wfHorizontalCursor.style.display='block';
wfVerticalCursor.style.display='block';

//channelcursor
constoffsetX=getWFChannelOffset(e);
//spectrumcursor
constoffsetY=getWFSpectrumOffset(e);
//tooltip
constspectrumIndex=getWFSpectrumIndex(e);
constoriginalSpectrumIndex=getWFOriginalSpectrumIndex(e);
constchannelIndex=getWFChannelIndex(e);
lettooltipText=spectrumInfoText(spectrumIndex,originalSpectrumIndex);
tooltipText+='\n'+'channel:'+channelIndex;
tooltipText+='\n'+'energy:'+common.channelToEnergy(channelIndex).toFixed(1)+'keV';
tooltipText=appendCpsInfoText(tooltipText,spectrumIndex);
waterfallPlot.setAttribute('title',tooltipText);

//verticalline
constwfContainerRect=wfContainer.getBoundingClientRect();
wfVerticalCursor.style.left=offsetX+wfContainerRect.left-wfContainer.scrollLeft+window.scrollX;
if(wfContainerRect.height<waterfallData.deltas.length+constants.channelAxisHeight){
wfVerticalCursor.style.height=wfContainerRect.height+'px';
}else{
wfVerticalCursor.style.height=waterfallData.deltas.length+constants.channelAxisHeight+'px';
}

//horizontalline
constcpsContainerRect=cpsContainer.getBoundingClientRect();
wfHorizontalCursor.style.top=offsetY+wfContainerRect.top-wfContainer.scrollTop+window.scrollY;
wfHorizontalCursor.style.left=wfContainerRect.left;
wfHorizontalCursor.style.width=wfContainerRect.width+cpsContainerRect.width+'px';
}

functioncpsOnMouseMove(e){
wfHorizontalCursor.style.display='block';
wfVerticalCursor.style.display='none';

//spectrumcursor
letoffsetX=getCpsSpectrumOffset(e);

//tooltip
constspectrumIndex=getCpsSpectrumIndex(e);
constoriginalSpectrumIndex=getCpsOriginalSpectrumIndex(e);
lettooltipText=spectrumInfoText(spectrumIndex,originalSpectrumIndex);
tooltipText=appendCpsInfoText(tooltipText,spectrumIndex);
cpsPlot.setAttribute('title',tooltipText);

//horizontalline
constwfContainerRect=wfContainer.getBoundingClientRect();
constcpsContainerRect=cpsContainer.getBoundingClientRect();
wfHorizontalCursor.style.top=offsetX+cpsContainerRect.top-cpsContainer.scrollTop+window.scrollY;
wfHorizontalCursor.style.left=wfContainerRect.left;
wfHorizontalCursor.style.width=wfContainerRect.width+cpsContainerRect.width+'px';
}

functiononCpsContainerScroll(event){
if(wfContainer.scrollTop!==cpsContainer.scrollTop){
wfContainer.scrollTop=cpsContainer.scrollTop;
}
}

functiononWfContainerScroll(event){
if(cpsContainer.scrollTop!==wfContainer.scrollTop){
cpsContainer.scrollTop=wfContainer.scrollTop;
}

if(previewContainer.scrollLeft!==wfContainer.scrollLeft){
previewContainer.scrollLeft=wfContainer.scrollLeft;
}
}

functionspectrumInfoText(spectrumIndex,originalSpectrumIndex){
if(spectrumIndex<0||spectrumIndex>=waterfallData.deltas.length){
console.warn('invalidspectrumindex',spectrumIndex,waterfallData);
return'';
}

return'spectrum:'+originalSpectrumIndex
+'\n'+'time:'+common.timeToString(waterfallData.deltas[spectrumIndex].timestamp)
+'\n'+'duration:'+waterfallData.deltas[spectrumIndex].duration.toFixed(1)+'s'
+'\n'+'lat:'+waterfallData.deltas[spectrumIndex].lat.toFixed(8)
+'\n'+'lon:'+waterfallData.deltas[spectrumIndex].lon.toFixed(8);
}

functionappendCpsInfoText(tooltipText,spectrumIndex){
if(!window.cpsData){
returntooltipText;
}

if(window.cpsData.range1&&window.cpsData.range1[spectrumIndex]!==undefined){
tooltipText+='\n'+'range1:'+formatFloat(window.cpsData.range1[spectrumIndex])+'cps';
}
if(window.cpsData.range2&&window.cpsData.range2[spectrumIndex]!==undefined){
tooltipText+='\n'+'range2:'+formatFloat(window.cpsData.range2[spectrumIndex])+'cps';
}
if(window.cpsData.ratio&&window.cpsData.ratio[spectrumIndex]!==undefined){
tooltipText+='\n'+'ratio:'+formatFloat(window.cpsData.ratio[spectrumIndex]);
}

returntooltipText;
}

functionformatFloat(val){
returnval>0.1
?val.toFixed(2)
:val.toFixed(4);
}
})();
