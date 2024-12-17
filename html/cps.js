(function(){
    // TODO: refactor: move state control to waterfall-control.js, keep only rendering here
    // cps plot render
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

    compareCheckbox.addEventListener('change', async () => await cps.renderCpsAsync());
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
    
    window.cps = {
        initCpsControls: () => initCpsControls(),
        renderCps: () => renderCps(),
        renderCpsAsync: () => common.executeWithStatusAsync('Rendering cps...', () => renderCps()),
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

    async function onChannelIndexInputChange() {
        waterfallState.channelRange1 = getChannelRange(fromChannelInput1, toChannelInput1);
        waterfallState.channelRange2 = getChannelRange(fromChannelInput2, toChannelInput2);

        await cps.renderCpsAsync();
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
            await waterfall.renderSpectrumImageAsync();
            await waterfall.renderWaterfallImageAsync();
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
            waterfallControl.showPreview();
            if (waterfallState.spectrumRange && waterfallState.spectrumRange.length === 2) {
                await waterfall.renderSpectrumImageAsync();
                await waterfall.renderWaterfallImageAsync();
            }
        } else {
            waterfallControl.hidePreview();
        }
    }

    function getCountsInRange(from, to) {
        from = from < 0 ? 0 : from;
        to = to >= waterfallData.baseSpectrum.channelCount 
            ? waterfallData.baseSpectrum.channelCount - 1
            : to; 

        const countsInRange = {};
        waterfallData.deltas.forEach((delta, deltaIndex) => {
            for (let ci = from; ci <= to; ci++) {
                if (countsInRange[deltaIndex] === undefined) {
                    countsInRange[deltaIndex] = delta.channels[ci];
                } else {
                    countsInRange[deltaIndex] += delta.channels[ci];
                }

                if (waterfallState.subtractBase) {
                    countsInRange[deltaIndex] -= waterfallData.baseSpectrum.channels[ci] * (delta.duration / waterfallData.baseSpectrum.duration);
                }
            }

            if (countsInRange[deltaIndex] < 0) {
                countsInRange[deltaIndex] = 0;
            }
        });
        
        return countsInRange;
    }
    
    function countsToCps(countsInRange) {
        const cpsInRange = {};
        Object.keys(countsInRange).forEach(deltaIndex => {
            cpsInRange[deltaIndex] = countsInRange[deltaIndex] / waterfallData.deltas[deltaIndex].duration;
        });
        
        return cpsInRange;
    }
    
    function getRenderData(valuesInRange) {
        let max = 0;
        let min = Infinity;
        for (let i = 0; i < waterfallData.deltas.length; i++) {
            if (valuesInRange[i] === undefined) {
                continue;
            }

            max = Math.max(max, valuesInRange[i]);
            min = Math.min(min, valuesInRange[i]);
        }

        return {
            values: valuesInRange,
            max: max,
            min: min
        }
    }

    function renderCps() {
        const cpsCanvas = document.getElementById('cps-plot');
        cpsCanvas.width = waterfallData.deltas.length + constants.channelAxisHeight;
        cpsCanvas.height = constants.cpsPlotHeight;
    
        const range1 = waterfallState.channelRange1;
        if (!range1 || range1.length !== 2) {
            cpsToMapButton.disabled = true;
            comparisonToMapButton.disabled = true;
            renderCpsData(cpsCanvas);
            return;
        }
        
        const range2 = waterfallState.channelRange2;
        if (compareCheckbox.checked && (!range2 || range2.length !== 2)) {
            cpsToMapButton.disabled = true;
            comparisonToMapButton.disabled = true;
            renderCpsData(cpsCanvas);
            return;
        }

        if (compareCheckbox.checked) {
            comparisonToMapButton.disabled = false;
            cpsToMapButton.disabled = false;
            const countsInRange1 = getCountsInRange(range1[0], range1[1]);
            const cpsInRange1 = countsToCps(countsInRange1);
            const countsInRange2 = getCountsInRange(range2[0], range2[1]);
            const cpsInRange2 = countsToCps(countsInRange2);
            const ratio = {};
            for (let i = 0; i < waterfallData.deltas.length; i++) {
                if (cpsInRange1[i] !== undefined && cpsInRange2[i] > 0) {
                    ratio[i] = cpsInRange1[i] / cpsInRange2[i];
                }
            }

            window.cpsData = {
                range1: cpsInRange1,
                range2: cpsInRange2,
                ratio: ratio,
            }

            const plotHeight = constants.cpsPlotHeight / 3;
            cpsCanvas.height = plotHeight * 3;
            renderCpsData(cpsCanvas, getRenderData(cpsInRange1), 0, plotHeight, 'range_1 cps');
            renderCpsData(cpsCanvas, getRenderData(cpsInRange2), plotHeight, plotHeight, 'range_2 cps');
            renderCpsData(cpsCanvas, getRenderData(ratio), plotHeight * 2, plotHeight, 'range_1 / range_2');
        } else {
            cpsToMapButton.disabled = false;
            comparisonToMapButton.disabled = true;
            const countsInRange1 = getCountsInRange(range1[0], range1[1]);
            const cpsInRange1 = countsToCps(countsInRange1);
            const renderData = getRenderData(cpsInRange1);

            window.cpsData = {
                range1: cpsInRange1,
            }

            renderCpsData(cpsCanvas, renderData, 0, cpsCanvas.height, 'range_1 cps');
        }
    }

    function renderCpsData(canvas, data, offset, height, label) {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = constants.backgroundColor;
        ctx.fillRect(0, offset, canvas.width, height);

        if (!data) {
            return;
        }

        let displayMax = data.max;
        let displayMin = data.min;
        switch (waterfallState.scale) {
            case 'log':
                displayMax = Math.log(displayMax);
                displayMin = Math.log(displayMin);
                break;
            case 'sqrt':
                displayMax = Math.sqrt(displayMax);
                displayMin = Math.sqrt(displayMin);
                break;
            default:
                break;
        }
        if (displayMax === 0 && displayMin === 0) {
            displayMax = 1;
            displayMin = -1;
        }
        let displayRange = displayMax - displayMin;
        displayMax += constants.cpsExtendRange * (displayRange === 0 ? displayMax : displayRange);
        displayMin -= constants.cpsExtendRange * (displayRange === 0 ? displayMax : displayRange);
        displayRange = displayMax - displayMin;

        // line
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.setLineDash([1, 0]);
        ctx.strokeStyle = constants.lineColor;
        let firstMove = true;
        for (let x = 0; x < waterfallData.deltas.length; x++) {
            if (data.values[x] === undefined) {
                continue;
            }

            let displayValue = data.values[x];
            switch (waterfallState.scale) {
                case 'log':
                    displayValue = Math.log(displayValue);
                    break;
                case 'sqrt':
                    displayValue = Math.sqrt(displayValue);
                    break;
                default:
                    break;
            }

            const y = height - ((displayValue - displayMin) / displayRange) * height + offset;

            if (firstMove) {
                ctx.moveTo(x, y);
                firstMove = false;
            } else {
                ctx.lineTo(x, y);
                ctx.moveTo(x, y);
            }
        }
        ctx.stroke();

        // separator line
        if (offset > 0) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = constants.separatorLineColor;
            ctx.moveTo(0, offset - 0.5);
            ctx.lineTo(canvas.width, offset - 0.5);
            ctx.stroke();
        }

        // labels
        const range = data.max - data.min;
        ctx.fillStyle = constants.textColor;
        ctx.textBaseline = 'top';
        ctx.fillText(data.max.toFixed(range < 0.01 ? 4 : 2) + ' (max)', 0, offset);
        ctx.textBaseline = 'bottom';
        ctx.fillText(data.min.toFixed(range < 0.01 ? 4 : 2) + ' (min)', 0, offset + height);
        ctx.textBaseline = 'top';
        ctx.fillText(label + ' (' + waterfallState.scale + ')', canvas.width / 2 - label.length * 2, offset);
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

        saveFile(filename + '-cps.rctrk', data, 'text/rctrk');
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

        waterfallControl.setSubstractBase(true);
        waterfallControl.markBaseChanged();
        await waterfallControl.applyBinningAndAverageAsync();        
        await waterfall.renderWaterfallImageAsync();
        await waterfall.renderSpectrumImageAsync();
        await cps.renderCpsAsync();
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
