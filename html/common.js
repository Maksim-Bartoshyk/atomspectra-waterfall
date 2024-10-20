(function () {
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
        movingAverage: 0,
        maxCpsPercent: 100,
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
    }

    function getLocalTimeOffsetHours() {
        return -(new Date().getTimezoneOffset() / 60);
    }
})();
