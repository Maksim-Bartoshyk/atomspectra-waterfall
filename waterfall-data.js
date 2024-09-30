const sp = require('./spectrum.js');

exports.createWaterfallData = function(baseSpectrum, deltas, channelReduceFactor) {
	const baseChannels = sp.reduceChannelCount(baseSpectrum.channels, channelReduceFactor);
	let waterfall = {
		spectrums: [],
		spectrumsCount: deltas.length,
		channelCount: baseChannels.length,
		timestamps: [],
		durations: [],
		calibration: sp.getCalibration(baseSpectrum.calibration, channelReduceFactor),
		baseSpectrum: baseChannels,
		baseSpectrumDuration: baseSpectrum.duration
	};
	deltas.forEach(delta => {
		waterfall.timestamps.push(delta.timestamp);
		waterfall.durations.push(delta.duration);

		const wfSpectrum = sp.reduceChannelCount(delta.channels, channelReduceFactor);
		waterfall.spectrums.push(wfSpectrum);
	});

	return waterfall;
}
