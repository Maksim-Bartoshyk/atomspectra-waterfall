(function(){
    // mouse cursor render
    const wfContainer = document.getElementById('waterfall-container');
    const cpsContainer = document.getElementById('cps-container');
    const waterfallPlot = document.getElementById('waterfall-plot');
    const cpsPlot = document.getElementById('cps-plot');
    const wfHorizontalCursor = document.getElementById('horizontal-cursor');
    const wfVerticalCursor = document.getElementById('vertical-cursor');
    
    wfContainer.addEventListener('scroll', (e) => onWfContainerScroll(e));
    cpsContainer.addEventListener('scroll', (e) => onCpsContainerScroll(e));
    waterfallPlot.addEventListener('mouseleave', e => plotOnMouseLeave(e));
    waterfallPlot.addEventListener('mousemove', e => waterfallOnMouseMove(e));
    cpsPlot.addEventListener('mouseleave', e => plotOnMouseLeave(e));
    cpsPlot.addEventListener('mousemove', e => cpsOnMouseMove(e));

    function plotOnMouseLeave(e) {
        wfHorizontalCursor.style.display = 'none';
        wfVerticalCursor.style.display = 'none';

        waterfallPlot.setAttribute('title', '');
        cpsPlot.setAttribute('title', '');
    }

    function waterfallOnMouseMove(e) {
        wfHorizontalCursor.style.display = 'block';
        wfVerticalCursor.style.display = 'block';

        // channel cursor
        let offsetX = e.offsetX - constants.cursorOffset;
        if (offsetX < constants.timeAxisWidth) {
            offsetX = constants.timeAxisWidth;
        } else if (offsetX > constants.timeAxisWidth + waterfallData.baseSpectrum.channelCount - 1) {
            offsetX = constants.timeAxisWidth + waterfallData.baseSpectrum.channelCount - 1;
        }

        // spectrum cursor
        let offsetY = e.offsetY - constants.cursorOffset;
        if (offsetY < 0) {
            offsetY = 0;
        } else if (e.offsetY >= waterfallData.deltas.length) {
            offsetY = waterfallData.deltas.length - 1;
            offsetY = waterfallData.deltas.length - 1;
        }
        
        // tooltip
        const spectrumIndex = offsetY;
        const channelIndex = offsetX - constants.timeAxisWidth;
        const tooltipText = 'spectrum: ' + spectrumIndex * waterfallState.spectrumBinning * originalWaterfallData.spectrumBinning
            + '\n' + 'channel: ' + channelIndex
            + '\n' + 'energy: ' + common.channelToEnergy(channelIndex).toFixed(1) + ' keV'
            + '\n' + 'time: ' + common.timeToString(waterfallData.deltas[spectrumIndex].timestamp);
        waterfallPlot.setAttribute('title', tooltipText);

        // vertical line
        const wfContainerRect = wfContainer.getBoundingClientRect();
        wfVerticalCursor.style.left = offsetX + wfContainerRect.left - wfContainer.scrollLeft;
        wfVerticalCursor.style.height = wfContainerRect.height + 'px';

        // horizontal line
        const cpsContainerRect = cpsContainer.getBoundingClientRect();
        wfHorizontalCursor.style.top = offsetY + wfContainerRect.top - wfContainer.scrollTop;
        wfHorizontalCursor.style.left = wfContainerRect.left;
        wfHorizontalCursor.style.width = wfContainerRect.width + cpsContainerRect.width + 'px';
    }

    function cpsOnMouseMove(e) {
        wfHorizontalCursor.style.display = 'block';
        wfVerticalCursor.style.display = 'none';

        // spectrum cursor
        let offsetX = e.offsetX - constants.cursorOffset;
        if (offsetX < 0) {
            offsetX = 0;
        } else if (offsetX > waterfallData.deltas.length - 1) {
            offsetX = waterfallData.deltas.length - 1;
        }

        // tooltip
        const spectrumIndex = offsetX;
        const tooltipText = 'spectrum: ' + spectrumIndex * waterfallState.spectrumBinning * originalWaterfallData.spectrumBinning
            + '\n' + 'time: ' + common.timeToString(waterfallData.deltas[spectrumIndex].timestamp);
        cpsPlot.setAttribute('title', tooltipText);

        // horizontal line
        const wfContainerRect = wfContainer.getBoundingClientRect();
        const cpsContainerRect = cpsContainer.getBoundingClientRect();
        wfHorizontalCursor.style.top = offsetX + cpsContainerRect.top - cpsContainer.scrollTop;
        wfHorizontalCursor.style.left = wfContainerRect.left;
        wfHorizontalCursor.style.width = wfContainerRect.width + cpsContainerRect.width + 'px';
    }

    function onCpsContainerScroll(event) {
        if (wfContainer.scrollTop !== cpsContainer.scrollTop) {
            wfContainer.scrollTop = cpsContainer.scrollTop;
        }
    }

    function onWfContainerScroll(event) {
        if (cpsContainer.scrollTop !== wfContainer.scrollTop) {
            cpsContainer.scrollTop = wfContainer.scrollTop;
        }
    }
})();
