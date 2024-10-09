(function(){
    // startup - check if we have to run with nodejs prepared data or user loads it in browser
    const uploadControl = document.getElementById('upload-control');
    const infoContainer = document.getElementById('file-info-container');
    const infoSpan = document.getElementById('file-info');
    const overlay = document.getElementById('blocking-overlay');
    const fileInput = document.getElementById('file-input');

    fileInput.addEventListener('change', (e) => onFileChange(e.target));

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
        reader.onload = (e) => {
            overlay.style.display = 'none';
            const fileText = e.target.result;
            const baseSpectrum = exports.deserializeSpectrum(fileText);
            const deltaInfo = exports.deserializeDeltas(fileText, baseSpectrum);
            const deltas = deltaInfo.deltas;

            window.originalWaterfallData = exports.createWaterfallData(baseSpectrum, deltas, 1, 1, file.name);
            window.waterfallData = { ...originalWaterfallData };

            binning.resetMovingAverage();
            binning.resetWaterfallBinning();
            waterfallState.channelBinning = 8;
            document.getElementById('channel-binning').value = waterfallState.channelBinning;

            binning.applyBinningAndAverage();
            cps.initCpsControls();
            waterfall.renderWaterfallImage();
            cps.renderCps();
        };

        reader.readAsText(file);
    }
})();