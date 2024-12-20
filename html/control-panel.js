(function(){
    // TODO: split into separate files
    // waterfall binning/average control
    const spectrumBinningInput = document.getElementById('spectrum-binning');
    const channelBinningInput = document.getElementById('channel-binning');
    const movingAverageVerticalInput = document.getElementById('moving-average-vertical');
    const movingAverageHorizontalInput = document.getElementById('moving-average-horizontal');
    spectrumBinningInput.addEventListener('change', e => onSpectrumBinningChange(e.target.value));
    channelBinningInput.addEventListener('change', e => onChannelBinningChange(e.target.value));
    movingAverageVerticalInput.addEventListener('change', e => onVerticalMovingAverageChange(e.target.value));
    movingAverageHorizontalInput.addEventListener('change', e => onHorizontalMovingAverageChange(e.target.value));
    // end

    // scale control
    const linBtn = document.getElementById('lin');
    const sqrtBtn = document.getElementById('sqrt');
    const logBtn = document.getElementById('log');
    linBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
    sqrtBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
    logBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
    // end

    // misc
    const timezoneInput = document.getElementById('timezone');
    const subtractCheckbox = document.getElementById('subtract-base');
    const substractLabel = document.getElementById('subtract-base-label');
    timezoneInput.addEventListener('change', (e) => onTimezoneChange(e.target.value));
    subtractCheckbox.addEventListener('change', (e) => onWaterfallSubtractChange(e.target.checked));
    // end

    // palette
    const blurCheckbox = document.getElementById('blur-waterfall');
    const maxCpsInput = document.getElementById('max-cps');
    const minCpsInput = document.getElementById('min-cps');
    const palette = document.getElementById('palette');
    maxCpsInput.addEventListener('change', (e) => onMaxCpsChange(e.target.value));
    minCpsInput.addEventListener('change', (e) => onMinCpsChange(e.target.value));
    palette.addEventListener('change', (e) => onWaterfallPaletteChange(palette.value));
    blurCheckbox.addEventListener('change', (e) => onWaterfallBlurChange(e.target.checked));
    // end

    // bottom section (cps related)
    const fromChannelInput1 = document.getElementById('from-channel-1');
    const toChannelInput1 = document.getElementById('to-channel-1');
    const previewCheckbox = document.getElementById('preview-enabled');
    const fromChannelInput2 = document.getElementById('from-channel-2');
    const toChannelInput2 = document.getElementById('to-channel-2');
    const fromSpectrumInput = document.getElementById('from-spectrum');
    const toSpectrumInput = document.getElementById('to-spectrum');
    const compareCheckbox = document.getElementById('cps-comparison');
    const cpsToMapButton = document.getElementById('export-cps-map');
    const comparisonToMapButton = document.getElementById('export-comparison-map');
    const spgToSpectrumFileButton = document.getElementById('spg-range-to-file');
    const spgAsBaseButton = document.getElementById('spg-range-as-base');
    compareCheckbox.addEventListener('change', async () => onCompareCheckboxChange());
    cpsToMapButton.addEventListener('click', () => exportCpsMap());
    comparisonToMapButton.addEventListener('click', () => exportComparisonMap());
    spgToSpectrumFileButton.addEventListener('click', () => exportSpectrumRange());
    spgAsBaseButton.addEventListener('click', () => spectrumRangeAsBase());
    previewCheckbox.addEventListener('change', async () => await previewEnabledChange());
    fromChannelInput1.addEventListener('change', async () => await onChannelIndexInputChange());
    toChannelInput1.addEventListener('change', async () => await onChannelIndexInputChange());
    fromChannelInput2.addEventListener('change', async () => await onChannelIndexInputChange());
    toChannelInput2.addEventListener('change', async () => await onChannelIndexInputChange());
    fromSpectrumInput.addEventListener('change', async () => await onSpectrumIndexInputChange());
    toSpectrumInput.addEventListener('change', async () => await onSpectrumIndexInputChange());
    // end

    const plotContainer = document.getElementById('plot-container');
    const waterfallCanvas = document.getElementById('waterfall-plot');
    const previewContainer = document.getElementById('preview-container');
    const previewCanvas = document.getElementById('preview-plot');

    // hotkeys
    const keyboardState = {
        pressedKey: undefined,
        alt: false
    };
    document.body.addEventListener('keydown', (e) => onKeyDown(e));
    document.body.addEventListener('keyup', (e) => onKeyUp(e));
    waterfallCanvas.addEventListener('dblclick', (e) => onWaterfallPaletteChange());
    waterfallCanvas.addEventListener('mousedown', (e) => onWaterfallMouseDown(e));
    waterfallCanvas.addEventListener('contextmenu', (e) => onWaterfallContextMenu(e));
    // end
    
    window.controlPanel = {
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
        hidePreview: () => hidePreview(),
        initCpsControls: () => initCpsControls(),
    };

    function onKeyDown(e) {
        if (e.code.startsWith('Key')) {
            keyboardState.pressedKey = e.key.toLowerCase();
        }
        
        if (e.key === 'Alt') {
            keyboardState.alt = true;
        }
    }

    function onKeyUp(e) {
        if (e.code.startsWith('Key')) {
            keyboardState.pressedKey = undefined;
        }
        
        if (e.key === 'Alt') {
            keyboardState.alt = false;
        }
    }

    async function onWaterfallMouseDown(e) {
        if (keyboardState.pressedKey === 's') {
            const spectrumIndex = cursorControl.getWFOriginalSpectrumIndex(e);
            if (e.button === 0) {
                fromSpectrumInput.value = spectrumIndex;
                await onSpectrumIndexInputChange();
            }

            if (e.button === 2) {
                toSpectrumInput.value = spectrumIndex;
                await onSpectrumIndexInputChange();
            }
        }

        if (keyboardState.pressedKey === 'c') {
            const channelIndex = cursorControl.getWFChannelIndex(e);
            if (e.button === 0) {
                fromChannelInput1.value = channelIndex;
                await onChannelIndexInputChange();
            }

            if (e.button === 2) {
                toChannelInput1.value = channelIndex;
                await onChannelIndexInputChange();
            }
        }

        if (keyboardState.pressedKey === 'a') {
            const channelIndex = cursorControl.getWFChannelIndex(e);
            if (e.button === 0) {
                fromChannelInput2.value = channelIndex;
                await onChannelIndexInputChange();
            }

            if (e.button === 2) {
                toChannelInput2.value = channelIndex;
                await onChannelIndexInputChange();
            }
        }
    }

    function onWaterfallContextMenu(e) {
        if (keyboardState.pressedKey === 's' || keyboardState.pressedKey === 'c') {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    async function onWaterfallPaletteChange(value) {
        const paletteList = ['iron', 'lime', 'yellow', 'glow', 'gray'];
        if (value) {
            waterfallState.palette = value;   
        } else {
            const selected = paletteList.indexOf(waterfallState.palette);
            if (selected === paletteList.length - 1) {
                waterfallState.palette = paletteList[0];
            } else {
                waterfallState.palette = paletteList[selected + 1];
            }

            palette.value = waterfallState.palette;
        }

        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();
    }

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
        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();
        await cpsPlot.renderCpsAsync();
    }

    async function onWaterfallBlurChange(value) {
        waterfallState.blur = value;
        await waterfallPlot.renderWaterfallImageAsync();
    }

    async function onWaterfallSubtractChange(value) {
        waterfallState.subtractBase = value;
        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();
        await cpsPlot.renderCpsAsync();
    }

    async function onSpectrumBinningChange(value) {
        let newBin = parseInt(value);
        if (isNaN(newBin) || newBin < 1) {
            newBin = 1;
            spectrumBinningInput.value = newBin;
        }

        waterfallState.spectrumBinning = newBin;

        await controlPanel.applyBinningAndAverageAsync();
        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();
        await cpsPlot.renderCpsAsync();
    }

    async function onChannelBinningChange(value) {
        const newBin = parseInt(value);
        const prevBin = waterfallState.channelBinning;
        waterfallState.channelBinning = newBin;

        await controlPanel.applyBinningAndAverageAsync();
        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();

        // TODO: refactor duplicated code
        const fromChannelInput1 = document.getElementById('from-channel-1');
        const toChannelInput1 = document.getElementById('to-channel-1');
        const fromChannelInput2 = document.getElementById('from-channel-2');
        const toChannelInput2 = document.getElementById('to-channel-2');

        updateInputChannelValue(fromChannelInput1, newBin, prevBin);
        updateInputChannelValue(toChannelInput1, newBin, prevBin);
        updateInputChannelValue(fromChannelInput2, newBin, prevBin);
        updateInputChannelValue(toChannelInput2, newBin, prevBin);

        await cpsPlot.renderCpsAsync();
    }

    async function onVerticalMovingAverageChange(value) {
        let windowSize = parseInt(value);

        if (isNaN(windowSize) || windowSize < 0) {
            movingAverageVerticalInput.value = 0;
            windowSize = 0;
        }

        if (windowSize === waterfallState.movingAverageVertical) {
            return;
        }

        waterfallState.movingAverageVertical = windowSize;
        await controlPanel.applyBinningAndAverageAsync();
        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();
        await cpsPlot.renderCpsAsync();
    }

    async function onHorizontalMovingAverageChange(value) {
        let windowSize = parseInt(value);

        if (isNaN(windowSize) || windowSize < 0) {
            movingAverageHorizontalInput.value = 0;
            windowSize = 0;
        }

        if (windowSize === waterfallState.movingAverageHorizontal) {
            return;
        }

        waterfallState.movingAverageHorizontal = windowSize;
        await controlPanel.applyBinningAndAverageAsync();
        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();
        await cpsPlot.renderCpsAsync();
    }

    async function onMaxCpsChange(value) {
        let newVal = parseFloat(value);
        if (isNaN(newVal) || newVal < 1) {
            newVal = 100;
            maxCpsInput.value = newVal;
        }

        waterfallState.maxCpsPercent = newVal;
        if (waterfallState.minCpsPercent > newVal) {
            waterfallState.minCpsPercent = newVal - 1;
            minCpsInput.value = waterfallState.minCpsPercent;
        }

        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();
    }

    async function onMinCpsChange(value) {
        let newVal = parseFloat(value);
        if (isNaN(newVal) || newVal < 0) {
            newVal = 0;
            minCpsInput.value = newVal;
        }

        waterfallState.minCpsPercent = newVal;
        if (waterfallState.maxCpsPercent < newVal) {
            waterfallState.maxCpsPercent = newVal + 1;
            maxCpsInput.value = waterfallState.maxCpsPercent;
        }

        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();
    }

    async function onTimezoneChange(value) {
        if (value === 'local') {
            waterfallState.timeOffsetHours = common.getLocalTimeOffsetHours();
        } else {
            waterfallState.timeOffsetHours = parseInt(value);
        }
        
        await waterfallPlot.renderWaterfallImageAsync();
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
        let leftNeighbors = Math.floor(windowSize / 2);
        let rightNeighbors = Math.ceil(windowSize / 2);
        let avgDeltas = [];
        for (let i = 0; i < waterfallData.deltas.length; i++) {
            const avgDelta = {
                ...waterfallData.deltas[i],
                channels: new Float32Array(waterfallData.baseSpectrum.channelCount)
            };
            for (let j = 0; j < waterfallData.deltas[i].channels.length; j++) {
                avgDelta.channels[j] = waterfallData.deltas[i].channels[j];
                let appliedSize = 0;
                for (let k = j - leftNeighbors; k <= j + rightNeighbors; k++) {
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

        // base spectrum
        const channels = new Float32Array(waterfallData.baseSpectrum.channelCount);
        for (let j = 0; j < waterfallData.baseSpectrum.channels.length; j++) {
            channels[j] = waterfallData.baseSpectrum.channels[j];
            let appliedSize = 0;
            for (let k = j - leftNeighbors; k <= j + rightNeighbors; k++) {
                if (k < 0 || k === j) {
                    continue;
                }
                if (k >= waterfallData.baseSpectrum.channels.length) {
                    break;
                }
                channels[j] += waterfallData.baseSpectrum.channels[k];
                appliedSize++;
            }
            channels[j] /= appliedSize + 1;
        }
        waterfallData.baseSpectrum.channels = channels;

        // vertical average
        windowSize = waterfallState.movingAverageVertical;
        leftNeighbors = Math.floor(windowSize / 2);
        rightNeighbors = Math.ceil(windowSize / 2);
        avgDeltas = [];
        for (let i = 0; i < waterfallData.deltas.length; i++) {
            const avgDelta = {
                ...waterfallData.deltas[i],
                channels: new Float32Array(waterfallData.deltas[i].channels)
            };
            for (let j = 0; j < avgDelta.channels.length; j++) {
                let appliedSize = 0;
                for (let k = i - leftNeighbors; k <= i + rightNeighbors; k++) {
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

    function initCpsControls() {
        waterfallState.channelRange1 = [0, waterfallData.baseSpectrum.channelCount - 1];
        waterfallState.channelRange2 = [0, waterfallData.baseSpectrum.channelCount - 1];
        waterfallState.spectrumRange = [0, waterfallData.deltas.length - 1];

        fromChannelInput1.value = waterfallState.channelRange1[0];
        toChannelInput1.value = waterfallState.channelRange1[1];
        fromChannelInput2.value = waterfallState.channelRange2[0];
        toChannelInput2.value = waterfallState.channelRange2[1];
        fromSpectrumInput.value = waterfallState.spectrumRange[0];
        toSpectrumInput.value = waterfallState.spectrumRange[1];
    }

    async function onCompareCheckboxChange() {
        waterfallState.compareCps = compareCheckbox.checked;
        comparisonToMapButton.disabled = !waterfallState.compareCps;
        await cpsPlot.renderCpsAsync();
    }

    async function onChannelIndexInputChange() {
        waterfallState.channelRange1 = getChannelRange(fromChannelInput1, toChannelInput1);
        waterfallState.channelRange2 = getChannelRange(fromChannelInput2, toChannelInput2);

        await cpsPlot.renderCpsAsync();
    }

    function getChannelRange(fromInput, toInput) {
        let fromChannel = parseInt(fromInput.value);
        let toChannel = parseInt(toInput.value);

        if (isNaN(fromChannel) || fromChannel < 0) {
            fromChannel = 0;
            fromInput.value = 0;
        }

        if (fromChannel > waterfallData.baseSpectrum.channelCount - 1) {
            fromChannel = waterfallData.baseSpectrum.channelCount - 1;
            fromInput.value = waterfallData.baseSpectrum.channelCount - 1;
        }
        
        if (isNaN(toChannel) || toChannel > waterfallData.baseSpectrum.channelCount - 1) {
            toChannel = waterfallData.baseSpectrum.channelCount - 1;
            toInput.value = waterfallData.baseSpectrum.channelCount - 1;
        }

        if (fromChannel > toChannel) {
            toChannel = fromChannel;
            fromInput.value = fromChannel;
            toInput.value = toChannel;
        }

        return [fromChannel, toChannel];
    }

    async function onSpectrumIndexInputChange() {
        waterfallState.spectrumRange = getSpectrumRange();
        if (waterfallState.previewEnabled && waterfallState.spectrumRange && waterfallState.spectrumRange.length === 2) {
            await waterfallPlot.renderSpectrumImageAsync();
            await waterfallPlot.renderWaterfallImageAsync();
        }
    }

    function getSpectrumRange() {
        let fromSpectrum = parseInt(fromSpectrumInput.value);
        let toSpectrum = parseInt(toSpectrumInput.value);
        if (isNaN(fromSpectrum) || fromSpectrum < 0) {
            fromSpectrum = 0;
            fromSpectrumInput.value = 0;
        }

        if (fromSpectrum > originalWaterfallData.deltas.length - 1) {
            fromSpectrum = originalWaterfallData.deltas.length - 1;
            fromSpectrumInput.value = originalWaterfallData.deltas.length - 1;
        }
        
        if (isNaN(toSpectrum) || toSpectrum > originalWaterfallData.deltas.length - 1) {
            toSpectrum = originalWaterfallData.deltas.length - 1;
            toSpectrumInput.value = originalWaterfallData.deltas.length - 1;
        }

        if (fromSpectrum > toSpectrum) {
            toSpectrum = fromSpectrum;
            fromSpectrumInput.value = fromSpectrum;
            toSpectrumInput.value = toSpectrum;
        }

        return [fromSpectrum, toSpectrum];
    }

    async function previewEnabledChange() {
        if (previewCheckbox.checked) {
            controlPanel.showPreview();
            if (waterfallState.spectrumRange && waterfallState.spectrumRange.length === 2) {
                await waterfallPlot.renderSpectrumImageAsync();
                await waterfallPlot.renderWaterfallImageAsync();
            }
        } else {
            controlPanel.hidePreview();
        }
    }

    function exportCpsMap() {
        const range = waterfallState.channelRange1;
        if (!range || range.length !== 2) {
            alert('Error: invalid channel range 1.');
            return;
        }
        const energyRange = getEnergyRangeStr(range);
        const description = originalWaterfallData.baseSpectrum.name + ' CP2S: cps in range ' + energyRange;
        const data = exports.getRctrkData(
            description, 
            originalWaterfallData.deltas, 
            range, 
            undefined, 
            waterfallState.channelBinning
        );
        const filename = originalWaterfallData.baseSpectrum.name + '-' + energyRange;

        saveFile(filename + '-cpsPlot.rctrk', data, 'text/rctrk');
    }

    function exportComparisonMap() {
        const range = waterfallState.channelRange1;
        if (!range || range.length !== 2) {
            alert('Error: invalid channel range 1.');
            return;
        }
        const compareRange = waterfallState.channelRange2;
        if (!compareRange || compareRange.length !== 2) {
            alert('Error: invalid channel range 2.');
            return;
        }
        const energyRange = getEnergyRangeStr(range);
        const compareEnergyRange = getEnergyRangeStr(compareRange);
        const data = exports.getRctrkData(originalWaterfallData.baseSpectrum.name + 
            ' CP2S: cps comparison for ranges ' + energyRange + '/' + compareEnergyRange, 
            originalWaterfallData.deltas, range, compareRange, waterfallState.channelBinning
        );
        const filename = originalWaterfallData.baseSpectrum.name + '-' + energyRange + compareEnergyRange;

        saveFile(filename + '-cps-comparison.rctrk', data, 'text/rctrk');
    }

    function exportSpectrumRange() {
        const range = waterfallState.spectrumRange;
        if (!range || range.length !== 2) {
            alert('Error: invalid from or to spectrum index.');
            return;
        }

        if (originalWaterfallData.channelBinning !== 1) {
            alert('Export to ' + originalWaterfallData.baseSpectrum.channelCount + ' channels due to channel binning applied by CLI or during import.');
        }
        
        const combinedSpectrum = exports.combineSpectrums(
            originalWaterfallData.deltas, 
            range[0], 
            range[1], 
            originalWaterfallData.baseSpectrum, 
            originalWaterfallData.filename
        );
        const spectrumText = exports.serializeSpectrum(combinedSpectrum);
        const filename = originalWaterfallData.baseSpectrum.name + '-[' + range[0] + ', ' + range[1] + ']';

        saveFile(filename + '-combined.txt', spectrumText, 'text/plain');
    }

    async function spectrumRangeAsBase() {
        const range = waterfallState.spectrumRange;
        if (!range || range.length !== 2) {
            alert('Error: invalid from or to spectrum index.');
            return;
        }
        
        const combinedSpectrum = exports.combineSpectrums(
            originalWaterfallData.deltas, 
            range[0], 
            range[1], 
            originalWaterfallData.baseSpectrum, 
            originalWaterfallData.filename
        );
        originalWaterfallData.baseSpectrum = combinedSpectrum;

        controlPanel.setSubstractBase(true);
        controlPanel.markBaseChanged();
        await controlPanel.applyBinningAndAverageAsync();        
        await waterfallPlot.renderWaterfallImageAsync();
        await waterfallPlot.renderSpectrumImageAsync();
        await cpsPlot.renderCpsAsync();
    }

    function saveFile(filename, data, type) {
        const blob = new Blob([data], { type: type });
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }

    function getEnergyRangeStr(range) {
        return '[' + common.channelToEnergy(range[0]).toFixed(0) + '-' + common.channelToEnergy(range[1]).toFixed(0) + ' keV]';
    }
})();
