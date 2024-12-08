(function(){
    // waterfall binning/average control
    const spectrumBinningInput = document.getElementById('spectrum-binning');
    const channelBinningInput = document.getElementById('channel-binning');
    const movingAverageVerticalInput = document.getElementById('moving-average-vertical');
    const movingAverageHorizontalInput = document.getElementById('moving-average-horizontal');
    spectrumBinningInput.addEventListener('change', e => onSpectrumBinningChange(e.target.value));
    channelBinningInput.addEventListener('change', e => onChannelBinningChange(e.target.value));
    movingAverageVerticalInput.addEventListener('change', e => onVerticalMovingAverageChange(e.target.value));
    movingAverageHorizontalInput.addEventListener('change', e => onHorizontalMovingAverageChange(e.target.value));

    // scale control
    const linBtn = document.getElementById('lin');
    const sqrtBtn = document.getElementById('sqrt');
    const logBtn = document.getElementById('log');
    linBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
    sqrtBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
    logBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));

    const blurCheckbox = document.getElementById('blur-waterfall');
    blurCheckbox.addEventListener('change', (e) => onWaterfallBlurChange(e.target.checked));

    const subtractCheckbox = document.getElementById('subtract-base');
    const substractLabel = document.getElementById('subtract-base-label');
    subtractCheckbox.addEventListener('change', (e) => onWaterfallSubtractChange(e.target.checked));

    const maxCpsInput = document.getElementById('max-cps');
    maxCpsInput.addEventListener('change', (e) => onMaxCpsChange(e.target.value));

    const minCpsInput = document.getElementById('min-cps');
    minCpsInput.addEventListener('change', (e) => onMinCpsChange(e.target.value));

    const timezoneInput = document.getElementById('timezone');
    timezoneInput.addEventListener('change', (e) => onTimezoneChange(e.target.value));

    const plotContainer = document.getElementById('plot-container');
    const previewContainer = document.getElementById('preview-container');
    const previewBlackStub = document.getElementById('black-stub');
    const previewCanvas = document.getElementById('preview-plot');
    
    window.waterfallControl = {
        setSubstractBase: (value) => setSubstractBase(value),
        markBaseChanged: () => markBaseChanged(),
        resetBaseChanged: () => resetBaseChanged(),
        resetWaterfallBinning: (channelBinning) => resetWaterfallBinning(channelBinning),
        resetMovingAverage: () => resetMovingAverage(),
        applyBinningAndAverage: () => applyBinningAndAverage(),
        applyBinningAndAverageAsync: () => {
            return common.executeWithStatusAsync('Processing...', () => applyBinningAndAverage());
        },
        showPreview: () => showPreview(),
        hidePreview: () => hidePreview()
    };

    function showPreview() {
        waterfallState.previewEnabled = true;
        plotContainer.classList.add('with-preview');
        previewContainer.style.display = 'block';
        previewCanvas.height = 0;
    }

    function hidePreview() {
        waterfallState.previewEnabled = false;
        plotContainer.classList.remove('with-preview');
        previewContainer.style.display = 'none';
    }

    function setSubstractBase(value) {
        subtractCheckbox.checked = value;
        waterfallState.subtractBase = value;
    }

    function markBaseChanged() {
        if (substractLabel.innerText.indexOf('*') === -1) {
            substractLabel.innerText += '*';
            substractLabel.title = 'base has been set from spectrogram';
        }
    }

    function resetBaseChanged() {
        if (substractLabel.innerText.indexOf('*') !== -1) {
            substractLabel.innerText = substractLabel.innerText.replace('*', '');
            substractLabel.title = '';
        }
    }

    function resetWaterfallBinning(channelBinning) {
        waterfallState.spectrumBinning = 1;
        spectrumBinningInput.value = waterfallState.spectrumBinning;
        
        waterfallState.channelBinning = channelBinning >= originalWaterfallData.channelBinning
            ? channelBinning
            : originalWaterfallData.channelBinning;
        channelBinningInput.value = waterfallState.channelBinning;
        const opts = channelBinningInput.getElementsByTagName('option');
        [...opts].forEach(opt => {
            opt.disabled = parseInt(opt.value) < originalWaterfallData.channelBinning;
        });
    }

    function resetMovingAverage() {
        waterfallState.movingAverageVertical = 0;
        waterfallState.movingAverageHorizontal = 0;
        movingAverageVerticalInput.value = 0;
        movingAverageHorizontalInput.value = 0;
    }

    async function onWaterfallScaleChange(value) {
        waterfallState.scale = value;
        await waterfall.renderWaterfallImageAsync();
        await waterfall.renderSpectrumImageAsync();
    }

    async function onWaterfallBlurChange(value) {
        waterfallState.blur = value;
        await waterfall.renderWaterfallImageAsync();
    }

    async function onWaterfallSubtractChange(value) {
        waterfallState.subtractBase = value;
        await waterfall.renderWaterfallImageAsync();
        await waterfall.renderSpectrumImageAsync();
        await cps.renderCpsAsync();
    }

    async function onSpectrumBinningChange(value) {
        let newBin = parseInt(value);
        if (isNaN(newBin) || newBin < 1) {
            newBin = 1;
            spectrumBinningInput.value = newBin;
        }

        waterfallState.spectrumBinning = newBin;

        await waterfallControl.applyBinningAndAverageAsync();
        await waterfall.renderWaterfallImageAsync();
        await waterfall.renderSpectrumImageAsync();
        await cps.renderCpsAsync();
    }

    async function onChannelBinningChange(value) {
        const newBin = parseInt(value);
        const prevBin = waterfallState.channelBinning;
        waterfallState.channelBinning = newBin;

        await waterfallControl.applyBinningAndAverageAsync();
        await waterfall.renderWaterfallImageAsync();
        await waterfall.renderSpectrumImageAsync();

        // TODO: refactor duplicated code
        const fromChannelInput1 = document.getElementById('from-channel-1');
        const toChannelInput1 = document.getElementById('to-channel-1');
        const fromChannelInput2 = document.getElementById('from-channel-2');
        const toChannelInput2 = document.getElementById('to-channel-2');

        updateInputChannelValue(fromChannelInput1, newBin, prevBin);
        updateInputChannelValue(toChannelInput1, newBin, prevBin);
        updateInputChannelValue(fromChannelInput2, newBin, prevBin);
        updateInputChannelValue(toChannelInput2, newBin, prevBin);

        await cps.renderCpsAsync();
    }

    async function onVerticalMovingAverageChange(value) {
        const windowSize = parseInt(value);
        if (windowSize === waterfallState.movingAverageVertical) {
            return;
        }
        waterfallState.movingAverageVertical = windowSize;

        await waterfallControl.applyBinningAndAverageAsync();
        await waterfall.renderWaterfallImageAsync();
        await waterfall.renderSpectrumImageAsync();
        await cps.renderCpsAsync();
    }

    async function onHorizontalMovingAverageChange(value) {
        const windowSize = parseInt(value);
        if (windowSize === waterfallState.movingAverageHorizontal) {
            return;
        }
        waterfallState.movingAverageHorizontal = windowSize;

        await waterfallControl.applyBinningAndAverageAsync();
        await waterfall.renderWaterfallImageAsync();
        await waterfall.renderSpectrumImageAsync();
        await cps.renderCpsAsync();
    }

    async function onMaxCpsChange(value) {
        let newVal = parseInt(value);
        if (isNaN(newVal) || newVal < 1) {
            newVal = 100;
            maxCpsInput.value = newVal;
        }

        waterfallState.maxCpsPercent = newVal;
        if (waterfallState.minCpsPercent > newVal) {
            waterfallState.minCpsPercent = newVal - 1;
            minCpsInput.value = waterfallState.minCpsPercent;
        }

        await waterfall.renderWaterfallImageAsync();
        await waterfall.renderSpectrumImageAsync();
    }

    async function onMinCpsChange(value) {
        let newVal = parseInt(value);
        if (isNaN(newVal) || newVal < 0) {
            newVal = 0;
            minCpsInput.value = newVal;
        }

        waterfallState.minCpsPercent = newVal;
        if (waterfallState.maxCpsPercent < newVal) {
            waterfallState.maxCpsPercent = newVal + 1;
            maxCpsInput.value = waterfallState.maxCpsPercent;
        }

        await waterfall.renderWaterfallImageAsync();
        await waterfall.renderSpectrumImageAsync();
    }

    async function onTimezoneChange(value) {
        if (value === 'local') {
            waterfallState.timeOffsetHours = common.getLocalTimeOffsetHours();
        } else {
            waterfallState.timeOffsetHours = parseInt(value);
        }
        
        await waterfall.renderWaterfallImageAsync();
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
        // horizontal average
        let windowSize = waterfallState.movingAverageHorizontal;
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
        windowSize = waterfallState.movingAverageVertical;
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
