(function(){
    // startup - check if we have to run with nodejs prepared data or user loads it in browser
    const uploadControl = document.getElementById('upload-control');
    const infoContainer = document.getElementById('file-info-container');
    const infoSpan = document.getElementById('file-info');
    const overlay = document.getElementById('blocking-overlay');
    const fileInput = document.getElementById('file-input');
    const importChannelBinInput = document.getElementById('import-channel-binning');
    const v6614Checkbox = document.getElementById('v-6.6.14');

    v6614Checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            fileInput.setAttribute('multiple', '');
        } else {
            fileInput.removeAttribute('multiple', '');
        }
    });

    fileInput.addEventListener('change', (e) => onFileChange(e.target));
    importChannelBinInput.addEventListener('change', (e) => { 
        fileInput.value = ''; 
    });

    if (window.originalWaterfallData === 'waterfall-data-placeholder') {
        uploadControl.style.display = 'block';
        infoContainer.style.display = 'none';
    } else {
        uploadControl.style.display = 'none';
        overlay.style.display = 'none';
        infoContainer.style.display = 'block';
        infoSpan.innerText = 'Atomspectra file: ' + originalWaterfallData.filename + '; already applied binning - '
            + 'spectrum: ' + originalWaterfallData.spectrumBinning + ', channel: ' + originalWaterfallData.channelBinning;
        
        window.waterfallData = { ...originalWaterfallData };
        binning.resetWaterfallBinning();
        waterfall.renderWaterfallImage();
        cps.initCpsControls();
        cps.renderCps();
    }

    function onFileChange(input) {
        const file = input.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        if (v6614Checkbox.checked) {
            let fileIndex = 0;
            let baseSpectrum;
            let deltas = [];

            reader.onload = (e) => {
                const fileText = e.target.result;
                
                if (fileIndex === 0) {
                    baseSpectrum = exports.deserializeSpectrum(fileText);
                }

                if (fileIndex < input.files.length) {
                    deltas.push(exports.deserializeSpectrum(fileText));
                }

                if (fileIndex === input.files.length - 1) {
                    overlay.style.display = 'none';
                    const importChannelBin = parseInt(importChannelBinInput.value);
                    const spectrumBin = 1;
                    deltas = deltas.sort((d1, d2) => d1.timestamp > d2.timestamp ? 1 : -1);
                    window.originalWaterfallData = exports.createWaterfallData(baseSpectrum, deltas, importChannelBin, spectrumBin, file.name);
                    window.waterfallData = { ...originalWaterfallData };

                    binning.resetMovingAverage();
                    binning.resetWaterfallBinning();
                    cps.initCpsControls();
                    waterfall.renderWaterfallImage();
                    cps.renderCps();
                } else {
                    fileIndex++;
                    reader.readAsText(input.files[fileIndex]);
                }
            };

            reader.readAsText(file);
        } else {
            reader.onload = (e) => {
                overlay.style.display = 'none';
                const fileText = e.target.result;
                const baseSpectrum = exports.deserializeSpectrum(fileText);
                const deltaInfo = exports.deserializeDeltas(fileText, baseSpectrum);
                const deltas = deltaInfo.deltas;

                const importChannelBin = parseInt(importChannelBinInput.value);
                const spectrumBin = 1;
                window.originalWaterfallData = exports.createWaterfallData(baseSpectrum, deltas, importChannelBin, spectrumBin, file.name);
                window.waterfallData = { ...originalWaterfallData };

                binning.resetMovingAverage();
                binning.resetWaterfallBinning();
                cps.initCpsControls();
                waterfall.renderWaterfallImage();
                cps.renderCps();
            };

            reader.readAsText(file);
        }
    }
})();