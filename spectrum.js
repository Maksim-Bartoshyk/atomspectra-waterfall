exports.readSpectrum = function(fileText, channelReduceFactor) {
	if (!fileText) {
		throw new Error('spectrum file text is empty');
	}

	if (channelReduceFactor < 1) {
		throw new Error('invalid factor: ' + factor);
	}

	const lines = fileText.split('\n');
	const time = parseInt(lines[2]);
	const name = lines[6];
	const duration = parseFloat(lines[8]);
	const channelsCount = parseInt(lines[9]);
	const calibrationOrder = parseInt(lines[10]);
	const calibration = [];
	for (let i = 0; i < calibrationOrder + 1; i++) {
		calibration.push(Math.pow(channelReduceFactor, i) * parseFloat(lines[11 + i]));
	}

	let index = 0;
	const channels = [];
	while (index < channelsCount) {
		channels.push(parseInt(lines[12 + calibrationOrder + index]));
		index++;
	}

	return {
		name: name,
		timestamp: time,
		duration: duration,
		calibration: calibration,
		channels: this.reduceChannelCount(channels, channelReduceFactor)
	};
}

exports.reduceSpectrumCount = function(spectrums, factor) {
	if (factor < 1) {
		throw new Error('invalid factor: ' + factor);
	}

	if (!spectrums || !spectrums.length) {
		throw new Error('no spectrums provided');
	}

	let reduced = [];
	for (let i = 0; i < spectrums.length; i += factor) {
		let summ = { ...spectrums[i] };
		for (let j = 1; j < factor && (i + j) < spectrums.length; j++) {
			for (let k = 0; k < summ.channels.length; k++) {
				summ.channels[k] += spectrums[i + j].channels[k];
			}

			summ.duration += spectrums[i + j].duration;
		}

		reduced.push(summ);
	}

	return reduced;
}

exports.reduceChannelCount = function(channels, factor) {
	if (factor < 1) {
		throw new Error('invalid factor: ' + factor);
	}

	if (!channels || !channels.length) {
		throw new Error('no channels provided');
	}

	let reduced = [];
	for (let i = 0; i < channels.length; i += factor) {
		let summ = 0;
		for (let j = 0; j < factor && (i + j) < channels.length; j++) {
			summ += channels[i + j];
		}

		reduced.push(summ);
	}

	return reduced;
}
