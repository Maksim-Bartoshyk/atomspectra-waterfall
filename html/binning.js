(function(){
    // waterfall binning/average control
    const spectrumBinningInput = document.getElementById('spectrum-binning');
    const channelBinningInput = document.getElementById('channel-binning');
    const movingAverageInput = document.getElementById('moving-average');
    spectrumBinningInput.addEventListener('change', e => onSpectrumBinningChange(e.target.value));
    channelBinningInput.addEventListener('change', e => onChannelBinningChange(e.target.value));
    movingAverageInput.addEventListener('change', e => onMovingAverageChange(e.target.value));

    const linBtn = document.getElementById('lin');
    const sqrtBtn = document.getElementById('sqrt');
    const logBtn = document.getElementById('log');
    linBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
    sqrtBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
    logBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));

    const blurCheckbox = document.getElementById('blur-waterfall');
    blurCheckbox.addEventListener('change', (e) => onWaterfallBlurChange(e.target.checked));

    const subtractCheckbox = document.getElementById('subtract-base');
    subtractCheckbox.addEventListener('change', (e) => onWaterfallSubtractChange(e.target.checked));

    const maxCpsInput = document.getElementById('max-cps');
    maxCpsInput.addEventListener('change', (e) => onMaxCpsChange(e.target.value));
    
    window.binning = {
        resetWaterfallBinning: () => resetWaterfallBinning(),
        resetMovingAverage: () => resetMovingAverage(),
        applyBinningAndAverage: () => applyBinningAndAverage(),
    };

    function resetWaterfallBinning() {
        waterfallState.spectrumBinning = 1;
        spectrumBinningInput.value = waterfallState.spectrumBinning;
        
        waterfallState.channelBinning = originalWaterfallData.channelBinning;
        channelBinningInput.value = waterfallState.channelBinning;
        const opts = channelBinningInput.getElementsByTagName('option');
        [...opts].forEach(opt => {
            opt.disabled = parseInt(opt.value) < waterfallState.channelBinning;
        });
    }

    function resetMovingAverage() {
        waterfallState.movingAverage = 0;
        movingAverageInput.value = 0;
    }

    function onWaterfallScaleChange(value) {
        waterfallState.scale = value;
        waterfall.renderWaterfallImage();
    }

    function onWaterfallBlurChange(value) {
        waterfallState.blur = value;
        waterfall.renderWaterfallImage();
    }

    function onWaterfallSubtractChange(value) {
        waterfallState.subtractBase = value;
        waterfall.renderWaterfallImage();
        cps.renderCps();
    }

    function onSpectrumBinningChange(value) {
        const newBin = parseInt(value);
        waterfallState.spectrumBinning = newBin;

        binning.applyBinningAndAverage();
        waterfall.renderWaterfallImage();
        cps.renderCps();
    }

    function onChannelBinningChange(value) {
        const newBin = parseInt(value);
        const prevBin = waterfallState.channelBinning;
        waterfallState.channelBinning = newBin;

        binning.applyBinningAndAverage();
        waterfall.renderWaterfallImage();

        // TODO: refactor duplicated code
        const fromChannelInput1 = document.getElementById('from-channel-1');
        const toChannelInput1 = document.getElementById('to-channel-1');
        const fromChannelInput2 = document.getElementById('from-channel-2');
        const toChannelInput2 = document.getElementById('to-channel-2');

        updateInputChannelValue(fromChannelInput1, newBin, prevBin);
        updateInputChannelValue(toChannelInput1, newBin, prevBin);
        updateInputChannelValue(fromChannelInput2, newBin, prevBin);
        updateInputChannelValue(toChannelInput2, newBin, prevBin);

        cps.renderCps();
    }

    function onMovingAverageChange(value) {
        const windowSize = parseInt(value);
        if (windowSize === waterfallState.movingAverage) {
            return;
        }
        waterfallState.movingAverage = windowSize;

        binning.applyBinningAndAverage();
        waterfall.renderWaterfallImage();
        cps.renderCps();
    }

    function onMaxCpsChange(value) {
        waterfallState.maxCpsPercent = parseInt(value);
        waterfall.renderWaterfallImage();
    }
    
    function updateInputChannelValue(input, newBin, prevBin) {
        const prevVal = parseInt(input.value);

        if (!isNaN(prevVal)) {
            let newVal = Math.round((prevVal / newBin) * prevBin);
            if (newVal < 0) {
                newVal = 0;
            }
            if (newVal > waterfallData.baseSpectrum.channelCount - 1) {
                newVal = waterfallData.baseSpectrum.channelCount - 1;
            }
            input.value = newVal;
        }
    }

    function applyBinningAndAverage() {
        waterfallData = exports.createWaterfallData(
            originalWaterfallData.baseSpectrum, 
            originalWaterfallData.deltas, 
            waterfallState.channelBinning / originalWaterfallData.channelBinning, 
            waterfallState.spectrumBinning
        );

        applyMovingAverage();
    }

    function applyMovingAverage() {
        windowSize = waterfallState.movingAverage;
        // horizontal average
        let avgDeltas = [];
        for (let i = 0; i < waterfallData.deltas.length; i++) {
            const avgDelta = {
                ...waterfallData.deltas[i],
                channels: new Float32Array(waterfallData.baseSpectrum.channelCount)
            };
            for (let j = 0; j < waterfallData.deltas[i].channels.length; j++) {
                avgDelta.channels[j] = waterfallData.deltas[i].channels[j];
                let appliedSize = 0;
                for (let k = j - windowSize / 2; k <= j + windowSize / 2; k++) {
                    if (k < 0 || k === j) {
                        continue;
                    }
                    if (k >= waterfallData.deltas[i].channels.length) {
                        break;
                    }
                    avgDelta.channels[j] += waterfallData.deltas[i].channels[k];
                    appliedSize++;
                }
                avgDelta.channels[j] /= appliedSize + 1;
            }

            avgDeltas.push(avgDelta);
        }
        waterfallData.deltas = avgDeltas;

        // vertical average
        avgDeltas = [];
        for (let i = 0; i < waterfallData.deltas.length; i++) {
            const avgDelta = {
                ...waterfallData.deltas[i],
                channels: new Float32Array(waterfallData.deltas[i].channels)
            };
            for (let j = 0; j < avgDelta.channels.length; j++) {
                let appliedSize = 0;
                for (let k = i - windowSize / 2; k <= i + windowSize / 2; k++) {
                    if (k < 0 || k === i) {
                        continue;
                    }

                    if (k >= waterfallData.deltas.length) {
                        break;
                    }

                    avgDelta.channels[j] += waterfallData.deltas[k].channels[j] * (waterfallData.deltas[i].duration / waterfallData.deltas[k].duration);
                    appliedSize++;
                }

                avgDelta.channels[j] /= appliedSize + 1;
            }

            avgDeltas.push(avgDelta);
        }

        waterfallData.deltas = avgDeltas;
    }
})();
