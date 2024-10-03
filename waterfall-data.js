(function(){
	const sp = require('./spectrum.js');

	exports.createWaterfallData = function(baseSpectrum, deltas, channelReduceFactor) {
		const baseChannels = sp.reduceChannelCount(baseSpectrum.channels, channelReduceFactor);
		let waterfall = {
			deltas: [],
			baseSpectrum: {
				...baseSpectrum,
				channels: baseChannels,
				channelCount: baseChannels.length,
				calibration: sp.getCalibration(baseSpectrum.calibration, channelReduceFactor)
			},
		};
		deltas.forEach(delta8k => {
			waterfall.deltas.push({
				...delta8k,
				channels: sp.reduceChannelCount(delta8k.channels, channelReduceFactor)
			});
		});

		return waterfall;
	}
})();
