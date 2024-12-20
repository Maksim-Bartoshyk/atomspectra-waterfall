(function(){
    // mouse cursor render
    const previewContainer = document.getElementById('preview-container');
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

    window.cursorControl = {
        getWFOriginalSpectrumIndex: (mouseEvent) => getWFOriginalSpectrumIndex(mouseEvent),
        getWFChannelIndex: (mouseEvent) => getWFChannelIndex(mouseEvent),
    };

    function getWFSpectrumOffset(mouseEvent) {
        let offsetY = mouseEvent.offsetY - constants.cursorOffset;
        if (offsetY < 0) {
            offsetY = 0;
        } else if (mouseEvent.offsetY >= waterfallData.deltas.length) {
            offsetY = waterfallData.deltas.length - 1;
            offsetY = waterfallData.deltas.length - 1;
        }

        return offsetY;
    }

    function getWFChannelOffset(mouseEvent) {
        let offsetX = mouseEvent.offsetX - constants.cursorOffset;
        if (offsetX < constants.timeAxisWidth) {
            offsetX = constants.timeAxisWidth;
        } else if (offsetX > constants.timeAxisWidth + waterfallData.baseSpectrum.channelCount - 1) {
            offsetX = constants.timeAxisWidth + waterfallData.baseSpectrum.channelCount - 1;
        }

        return offsetX;
    }

    function getWFOriginalSpectrumIndex(mouseEvent) {
        const spectrumIndex = getWFSpectrumIndex(mouseEvent);

        return spectrumIndex * waterfallState.spectrumBinning * originalWaterfallData.spectrumBinning;
    }

    function getWFSpectrumIndex(mouseEvent) {
        const offsetY = getWFSpectrumOffset(mouseEvent);

        return offsetY;
    }

    function getWFChannelIndex(mouseEvent) {
        const offsetX = getWFChannelOffset(mouseEvent);

        return offsetX - constants.timeAxisWidth;
    }

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
        const offsetX = getWFChannelOffset(e);
        // spectrum cursor
        const offsetY = getWFSpectrumOffset(e);
        // tooltip
        const spectrumIndex = getWFSpectrumIndex(e);
        const channelIndex = getWFChannelIndex(e);
        let tooltipText = spectrumInfoText(spectrumIndex);
        tooltipText += '\n' + 'channel: ' + channelIndex;
        tooltipText += '\n' + 'energy: ' + common.channelToEnergy(channelIndex).toFixed(1) + ' keV';
        tooltipText = appendCpsInfoText(tooltipText, spectrumIndex);
        waterfallPlot.setAttribute('title', tooltipText);

        // vertical line
        const wfContainerRect = wfContainer.getBoundingClientRect();
        wfVerticalCursor.style.left = offsetX + wfContainerRect.left - wfContainer.scrollLeft + window.scrollX;
        if (wfContainerRect.height < waterfallData.deltas.length + constants.channelAxisHeight) {
            wfVerticalCursor.style.height = wfContainerRect.height + 'px';
        } else {
            wfVerticalCursor.style.height = waterfallData.deltas.length + constants.channelAxisHeight + 'px';
        }
        
        // horizontal line
        const cpsContainerRect = cpsContainer.getBoundingClientRect();
        wfHorizontalCursor.style.top = offsetY + wfContainerRect.top - wfContainer.scrollTop + window.scrollY;
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
        let tooltipText = spectrumInfoText(spectrumIndex);
        tooltipText = appendCpsInfoText(tooltipText, spectrumIndex);
        cpsPlot.setAttribute('title', tooltipText);

        // horizontal line
        const wfContainerRect = wfContainer.getBoundingClientRect();
        const cpsContainerRect = cpsContainer.getBoundingClientRect();
        wfHorizontalCursor.style.top = offsetX + cpsContainerRect.top - cpsContainer.scrollTop + window.scrollY;
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

        if (previewContainer.scrollLeft !== wfContainer.scrollLeft) {
            previewContainer.scrollLeft = wfContainer.scrollLeft;
        }
    }

    function spectrumInfoText(spectrumIndex) {
        return 'spectrum: ' + spectrumIndex
            + '\n' + 'time: ' + common.timeToString(waterfallData.deltas[spectrumIndex].timestamp)
            + '\n' + 'duration: ' + waterfallData.deltas[spectrumIndex].duration.toFixed(1) + ' s';
    }

    function appendCpsInfoText(tooltipText, spectrumIndex) {
        if (!window.cpsData) {
            return tooltipText;
        }

        if (window.cpsData.range1 && window.cpsData.range1[spectrumIndex] !== undefined) {
            tooltipText += '\n' + 'range1: ' + formatFloat(window.cpsData.range1[spectrumIndex]) + ' cps';
        }
        if (window.cpsData.range2 && window.cpsData.range2[spectrumIndex] !== undefined) {
            tooltipText += '\n' + 'range2: ' + formatFloat(window.cpsData.range2[spectrumIndex]) + ' cps';
        }
        if (window.cpsData.ratio && window.cpsData.ratio[spectrumIndex] !== undefined) {
            tooltipText += '\n' + 'ratio: ' + formatFloat(window.cpsData.ratio[spectrumIndex]);
        }

        return tooltipText;
    }    

    function formatFloat(val) {
        return val > 0.1
            ? val.toFixed(2)
            : val.toFixed(4);
    }
})();
