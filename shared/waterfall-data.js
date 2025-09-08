(function () {
  const sp = require('./spectrum.js');

  exports.createWaterfallData = function (baseSpectrum, deltas, channelBinning, spectrumBinning, filename) {
    const baseChannels = sp.reduceChannelCount(baseSpectrum.channels, channelBinning);
    let waterfall = {
      deltas: [],
      baseSpectrum: {
        ...baseSpectrum,
        channels: baseChannels,
        channelCount: baseChannels.length,
        calibration: sp.getCalibration(baseSpectrum.calibration, channelBinning)
      },
      channelBinning: channelBinning,
      spectrumBinning: spectrumBinning,
      filename: filename
    };

    sp.reduceDeltasCount(deltas, spectrumBinning).forEach(delta8k => {
      waterfall.deltas.push({
        ...delta8k,
        channels: sp.reduceChannelCount(delta8k.channels, channelBinning)
      });
    });

    return waterfall;
  }
})();
