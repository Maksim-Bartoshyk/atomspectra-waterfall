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
    };
    window.common = {
        timeToString: timestamp => {
            const utcISO = new Date(timestamp).toISOString();

            return utcISO.split('T').join(' ').split('.')[0] + ' UTC';
        },
        channelToEnergy: channel => {
            return waterfallData.baseSpectrum.calibration.reduce((e, c, i) => e += Math.pow(channel, i) * c, 0);
        }
    }
})();
