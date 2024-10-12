(function(){
    // cps plot render
    const fromChannelInput1 = document.getElementById('from-channel-1');
    const toChannelInput1 = document.getElementById('to-channel-1');
    const dottedCheckbox = document.getElementById('dotted-trend');
    const fromChannelInput2 = document.getElementById('from-channel-2');
    const toChannelInput2 = document.getElementById('to-channel-2');
    const fromSpectrumInput = document.getElementById('from-spectrum');
    const toSpectrumInput = document.getElementById('to-spectrum');
    const compareCheckbox = document.getElementById('cps-comparison');
    const cpsToMapButton = document.getElementById('export-cps-map');
    const comparisonToMapButton = document.getElementById('export-comparison-map');
    const spectrogramToSpectrumButton = document.getElementById('export-spectrum-range');
    const renderCpsButton = document.getElementById('render-cps');

    cpsToMapButton.addEventListener('click', () => exportCpsMap());
    comparisonToMapButton.addEventListener('click', () => exportComparisonMap());
    spectrogramToSpectrumButton.addEventListener('click', () => exportSpectrumRange());
    renderCpsButton.addEventListener('click', () => renderCps());
    
    window.cps = {
        initCpsControls: () => initCpsControls(),
        renderCps: () => renderCps()
    }

    function initCpsControls() {
        fromChannelInput1.value = 0;
        toChannelInput1.value = waterfallData.baseSpectrum.channelCount - 1;
        fromChannelInput2.value = 0;
        toChannelInput2.value = waterfallData.baseSpectrum.channelCount - 1;
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
    
        const fromChannel1 = parseInt(fromChannelInput1.value);
        const toChannel1 = parseInt(toChannelInput1.value);
        if (isNaN(fromChannel1) || isNaN(toChannel1) || fromChannel1 > toChannel1) {
            cpsToMapButton.disabled = true;
            comparisonToMapButton.disabled = true;
            renderCpsData(cpsCanvas);
            return;
        }
        
        const fromChannel2 = parseInt(fromChannelInput2.value);
        const toChannel2 = parseInt(toChannelInput2.value);
        if (compareCheckbox.checked && (isNaN(fromChannel2) || isNaN(toChannel2) || fromChannel2 > toChannel2)) {
            cpsToMapButton.disabled = true;
            comparisonToMapButton.disabled = true;
            renderCpsData(cpsCanvas);
            return;
        }

        if (compareCheckbox.checked) {
            comparisonToMapButton.disabled = false;
            cpsToMapButton.disabled = false;
            const countsInRange1 = getCountsInRange(fromChannel1, toChannel1);
            const cpsInRange1 = countsToCps(countsInRange1);
            const countsInRange2 = getCountsInRange(fromChannel2, toChannel2);
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
            renderCpsData(cpsCanvas, getRenderData(cpsInRange1), 0, plotHeight, 'range 1 cps');
            renderCpsData(cpsCanvas, getRenderData(cpsInRange2), plotHeight, plotHeight, 'range 2 cps');
            renderCpsData(cpsCanvas, getRenderData(ratio), plotHeight * 2, plotHeight, 'range 1 / range 2');
        } else {
            cpsToMapButton.disabled = false;
            comparisonToMapButton.disabled = true;
            const countsInRange1 = getCountsInRange(fromChannel1, toChannel1);
            const cpsInRange1 = countsToCps(countsInRange1);
            const renderData = getRenderData(cpsInRange1);

            window.cpsData = {
                range1: cpsInRange1,
            }

            renderCpsData(cpsCanvas, renderData, 0, cpsCanvas.height, 'range 1 cps');
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
        if (displayMax === 0 && displayMin === 0) {
            displayMax = 1;
            displayMin = -1;
        }
        let displayRange = displayMax - displayMin;
        displayMax += constants.cpsExtendRange * (displayRange === 0 ? displayMax : displayRange);
        displayMin -= constants.cpsExtendRange * (displayRange === 0 ? displayMax : displayRange);
        displayRange = displayMax - displayMin;

        if (dottedCheckbox.checked) {
            // points
            ctx.fillStyle = constants.dotColor;
            for (let x = 0; x < waterfallData.deltas.length; x++) {
                if (data.values[x] === undefined) {
                    continue;
                }

                const y = height - ((data.values[x] - displayMin) / displayRange) * height + offset;
                ctx.fillRect(x, y, 1, 1);
            }
        } else {
            // lines
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.setLineDash([1, 0]);
            ctx.strokeStyle = constants.lineColor;
            let firstMove = true;
            for (let x = 0; x < waterfallData.deltas.length; x++) {
                if (data.values[x] === undefined) {
                    continue;
                }

                const y = height - ((data.values[x] - displayMin) / displayRange) * height + offset;

                if (firstMove) {
                    ctx.moveTo(x, y);
                    firstMove = false;
                } else {
                    ctx.lineTo(x, y);
                    ctx.moveTo(x, y);
                }
            }
            ctx.stroke();
        }

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
        ctx.fillText(label, canvas.width / 2 - label.length * 2, offset);
    }

    function exportCpsMap() {
        const range = [fromChannelInput1.value, toChannelInput1.value];
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
        const range = [fromChannelInput1.value, toChannelInput1.value];
        const compareRange = [fromChannelInput2.value, toChannelInput2.value];
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
        const fromSpectrum = parseInt(fromSpectrumInput.value);
        const toSpectrum = parseInt(toSpectrumInput.value);
        if (isNaN(fromSpectrum) || isNaN(toSpectrum) || fromSpectrum > toSpectrum) {
            // TODO: implement UI validation
            throw new Error('invalid from or to spectrum index');
        }

        if (originalWaterfallData.channelBinning !== 1) {
            alert('Export to ' + originalWaterfallData.baseSpectrum.channelCount + ' channels due to channel binning applied by CLI or during import.');
        }
        
        const combinedSpectrum = exports.combineSpectrums(
            originalWaterfallData.deltas, 
            fromSpectrum, 
            toSpectrum, 
            originalWaterfallData.baseSpectrum, 
            originalWaterfallData.filename
        );
        const spectrumText = exports.serializeSpectrum(combinedSpectrum);
        const filename = originalWaterfallData.baseSpectrum.name + '-[' + fromSpectrum + ', ' + toSpectrum + ']';

        saveFile(filename + '-combined.txt', spectrumText, 'text/plain');
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
