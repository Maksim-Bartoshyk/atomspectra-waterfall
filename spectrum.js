exports.deserializeSpectrum = function(fileText, channelReduceFactor) {
	if (!fileText) {
		throw new Error('spectrum file text is empty');
	}

	if (channelReduceFactor < 1) {
		throw new Error('invalid factor: ' + factor);
	}

	const lines = fileText.split('\n');
	const format = lines[0];
	const note = lines[1];
	const time = parseInt(lines[2]);
	const time2 = parseInt(lines[3]);
	const latStr = lines[4];
	const lonStr = lines[5];
	const name = lines[6];
	const foundIsotopes = lines[7];
	const duration = parseFloat(lines[8]);
	const channelsCount = parseInt(lines[9]);
	const calibrationOrder = parseInt(lines[10]);
	const calibration = [];
	for (let i = 0; i < calibrationOrder + 1; i++) {
		calibration.push(Math.pow(channelReduceFactor, i) * parseFloat(lines[11 + i]));
	}

	let index = 0;
	let channels = [];
	while (index < channelsCount) {
		channels.push(parseInt(lines[12 + calibrationOrder + index]));
		index++;
	}

	channels = this.reduceChannelCount(channels, channelReduceFactor);

	return {
		format: format,
		note: note,
		timestamp: time,
		timestamp2: time2,
		latStr: latStr,
		lonStr: lonStr,
		name: name,
		foundIsotopes: foundIsotopes,
		duration: duration,
		channelCount: channels.length,
		calibration: calibration,
		channels: channels
	};
}

exports.serializeSpectrum = function(spectrum) {
	if (!spectrum) {
		throw new Error('spectrum is not provided');
	}

	let text = spectrum.format + '\n';
	text += spectrum.note + '\n';
	text += spectrum.timestamp + '\n';
	text += spectrum.timestamp2 + '\n';
	text += spectrum.latStr + '\n';
	text += spectrum.lonStr + '\n';
	text += spectrum.name + '\n';
	text += spectrum.foundIsotopes + '\n';
	text += spectrum.duration + '\n';
	text += spectrum.channelCount + '\n';
	text += (spectrum.calibration.length - 1) + '\n';
	for (let i = 0; i < spectrum.calibration.length; i++) {
		text += spectrum.calibration[i] + '\n';
	}

	let index = 0;
	while (index < spectrum.channelCount) {
		text += spectrum.channels[index] + '\n';
		index++;
	}

	return text;
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
