(function(){
//startup-checkifwehavetorunwithnodejsprepareddataoruserloadsitinbrowser
constuploadControl=document.getElementById('upload-control');
constinfoContainer=document.getElementById('file-info-container');
constinfoSpan=document.getElementById('file-info');
constoverlay=document.getElementById('blocking-overlay');
constfileInput=document.getElementById('file-input');
constimportChannelBinInput=document.getElementById('import-channel-binning');
constv6614Checkbox=document.getElementById('v-6.6.14');
constnoZerosCheckbox=document.getElementById('no-zeros');

v6614Checkbox.addEventListener('change',(e)=>{
if(e.target.checked){
fileInput.setAttribute('multiple','');
}else{
fileInput.removeAttribute('multiple','');
}
});

noZerosCheckbox.addEventListener('change',(e)=>{
fileInput.value='';
});

fileInput.addEventListener('change',(e)=>onFileChange(e.target));
importChannelBinInput.addEventListener('change',(e)=>{
fileInput.value='';
});

if(window.originalWaterfallData==='waterfall-data-placeholder'){
uploadControl.style.display='block';
infoContainer.style.display='none';
}else{
uploadControl.style.display='none';
overlay.style.display='none';
infoContainer.style.display='block';
infoSpan.innerText='Atomspectrafile:'+originalWaterfallData.filename+';alreadyappliedbinning-'
+'spectrum:'+originalWaterfallData.spectrumBinning+',channel:'+originalWaterfallData.channelBinning;

startupAsync();
}

functiononFileChange(input){
constfile=input.files[0];
if(!file){
return;
}

constnoZeros=noZerosCheckbox.checked;
constreader=newFileReader();
if(v6614Checkbox.checked){
letfileIndex=0;
letbaseSpectrum;
letdeltas=[];

reader.onload=async(e)=>{
constfileText=e.target.result;

if(fileIndex===0){
baseSpectrum=exports.deserializeSpectrum(fileText);
}

if(fileIndex<input.files.length){
constspectrum=exports.deserializeSpectrum(fileText);
if(noZeros){
if(spectrum.channels.some(c=>c!==0)&&spectrum.duration>0){
deltas.push(spectrum);
}
}else{
deltas.push(spectrum);
}
}

if((fileIndex+1)%25===0){
awaitcommon.executeWithStatusAsync('Deserializing('+(fileIndex+1)+'/'+input.files.length+')...',()=>{});
}

if(fileIndex===input.files.length-1){
overlay.style.display='none';
constimportChannelBin=parseInt(importChannelBinInput.value);
constspectrumBin=1;
deltas=deltas.sort((d1,d2)=>d1.timestamp>d2.timestamp?1:-1);
window.originalWaterfallData=exports.createWaterfallData(baseSpectrum,deltas,importChannelBin,spectrumBin,file.name);

awaitstartupAsync();
}else{
fileIndex++;
reader.readAsText(input.files[fileIndex]);
}
};
}else{
reader.onload=async(e)=>{
awaitcommon.executeWithStatusAsync('Deserializing...',()=>{
overlay.style.display='none';
constfileText=e.target.result;
constbaseSpectrum=exports.deserializeSpectrum(fileText);
constdeltaInfo=exports.deserializeDeltas(fileText,baseSpectrum,noZeros);
constdeltas=deltaInfo.deltas;

constimportChannelBin=parseInt(importChannelBinInput.value);
constspectrumBin=1;
window.originalWaterfallData=exports.createWaterfallData(baseSpectrum,deltas,importChannelBin,spectrumBin,file.name);
});

awaitstartupAsync();
};
}

common.executeWithStatusAsync('Openingfile...',()=>{
reader.readAsText(file);
});
}

asyncfunctionstartupAsync(){
controlPanel.setSubtractBase(false);
controlPanel.resetBaseChanged();
controlPanel.resetMovingAverage();
controlPanel.resetWaterfallBinning(16);
awaitcontrolPanel.applyBinningAndAverageAsync();//firstsetupofwaterfalldata
controlPanel.initCpsControls();//dependsonwaterfalldata
awaitwaterfallPlot.renderWaterfallImageAsync();
awaitwaterfallPlot.renderSpectrumImageAsync();
awaitcpsPlot.renderCpsAsync();
}
})();