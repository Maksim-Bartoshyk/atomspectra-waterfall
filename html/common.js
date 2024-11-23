(function () {
    const statusOverlay = document.getElementById('status-overlay');
    const statusText = document.getElementById('status-text');

    // display configuration/state
    window.constants = {
        timeAxisWidth: 150, // note: the same in css
        timestampHeight: 20,
        timestampTickWidth: 10,
        channelAxisHeight: 32,
        channelAxisTickHeight: 4,
        backgroundColor: 'black',
        textColor: 'lightgray',
        lineColor: 'lightgray',
        separatorLineColor: '#777',
        dotColor: 'white',
        cpsPlotHeight: 300,
        cpsExtendRange: 0.1,
        blurRadius: 1,
        cursorOffset: 3,
    };
    window.waterfallState = {
        scale: 'sqrt',
        spectrumBinning: 1,
        channelBinning: 1,
        blur: false,
        subtractBase: false,
        movingAverageVertical: 0,
        movingAverageHorizontal: 0,
        maxCpsPercent: 100,
        minCpsPercent: 0,
        timeOffsetHours: getLocalTimeOffsetHours(),
    };
    window.common = {
        timeToString: timestamp => {
            const utcISO = new Date(timestamp + waterfallState.timeOffsetHours * 60 * 60 * 1000).toISOString();
            let offsetStr;
            if (waterfallState.timeOffsetHours > 0) {
                offsetStr = '+' + waterfallState.timeOffsetHours + 'h';
            } else if (waterfallState.timeOffsetHours < 0) {
                offsetStr = '' + waterfallState.timeOffsetHours + 'h';
            } else {
                offsetStr = 'UTC';
            }

            return utcISO.split('T').join(' ').split('.')[0] + ' ' + offsetStr;
        },
        channelToEnergy: channel => {
            return waterfallData.baseSpectrum.calibration.reduce((e, c, i) => e += Math.pow(channel, i) * c, 0);
        },
        getLocalTimeOffsetHours: () => getLocalTimeOffsetHours(),
        executeWithStatusAsync: (status, func) => executeWithStatusAsync(status, func),
    }

    function getLocalTimeOffsetHours() {
        return -(new Date().getTimezoneOffset() / 60);
    }

    function executeWithStatusAsync(status, func) {
        return new Promise((res, rej) => {
            requestAnimationFrame(() => {
                statusText.innerText = status;
                statusOverlay.style.display = 'block';

                requestAnimationFrame(() => {
                    try {
                        func();
                        res();
                    } catch(e) {
                        rej(e);
                    } finally {
                        statusText.innerText = '';
                        statusOverlay.style.display = 'none';
                    }
                });
            });
        });
    }
})();
