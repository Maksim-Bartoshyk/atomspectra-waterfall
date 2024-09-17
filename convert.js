let fs = require('fs');
let path = require('path');
let channelReduceFactor = 8;
let spectrumReduceFactor = 1;
let useCps = false;
let rcspg = false;

function filetimeFromJSTime(jsTime) {  
	return jsTime * 1e4 + 116444736e9;
}

function reduceSpectrumCount(spectrums, factor) {
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

function reduceChannelCount(channels, factor) {
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

function readSpectrum(fileText) {
	let lines = fileText.split('\n');
	let time = parseInt(lines[2]);
	let duration = parseInt(lines[8]);
	let channelsCount = parseInt(lines[9]);
	let calibration = parseInt(lines[10])

	let index = 0;
	let channels = [];
	while (index < channelsCount) {
		channels.push(parseInt(lines[12 + calibration + index]));
		index++;
	}

	// filter out accidential spectrums from microphone input
	//if ((channels.slice(0, 80).reduce((s, v) => s += v, 0)) > 3) {
	//	channels = Array(channelsCount).fill(0);
	//}

	return {
		timestamp: time,
		duration: duration,
		channels: reduceChannelCount(channels, channelReduceFactor)
	};
}

function createWaterfall(spectrums) {
	let waterfall = {
		points: [],
		min: 0,
		max: 0,
		width: spectrums[0].channels.length,
		height: spectrums.length,
		timestamps: []
	};
	spectrums.forEach((spectrum, spectrumIndex) => {
		waterfall.timestamps.push(spectrum.timestamp);

		spectrum.channels.forEach((channelValue, channelIndex) => {
			if (channelValue > 0) {
				let wfValue = useCps
					? channelValue / spectrum.duration
					: channelValue;
				waterfall.max = Math.max(waterfall.max, wfValue);
				waterfall.points.push({
					x: channelIndex,
					y: spectrumIndex,
					value: wfValue
				});
			}
		});
	});

	return waterfall;
}

function convertFiles(dirname, onProgress, onError) {
	let spectrums = [];
	let filenames = fs.readdirSync(dirname);
	filenames.forEach(function(filename) {
		try {
			let content = fs.readFileSync(path.join(dirname, filename), 'utf-8');
			spectrums.push(readSpectrum(content));
			console.log('Read success for file ' + filename);
		} catch (e) {
			console.error('FAILURE for ' + filename + ' error: ' + e.message);
		}
	});

	spectrums.sort((s1, s2) => s1.timestamp > s2.timestamp ? 1 : -1); // ascending

	if (rcspg) {
		let fromTimestamp = spectrums[0].timestamp;
		let toTimestamp = spectrums[spectrums.length - 1].timestamp;
		// header
		let rcspgData = 'Spectrogram: ' + new Date(fromTimestamp).toISOString() + 
						'\tTime: ' + new Date(toTimestamp).toISOString() + 
						'\tTimestamp: ' + filetimeFromJSTime(fromTimestamp - 1000) + // just in case to avoid any potential division by zero
						'\tAccumulation time: ' + Math.floor((toTimestamp - fromTimestamp) / 1000) + 
						'\tChannels: 1024\tDevice serial: unknown\tFlags: 1\tComment: exported from atomspectra data';
		// base spectrum, linear calibration, all zeros
		rcspgData += '\nSpectrum: ' +
					/*int32 base spectrum duration*/'00 00 00 01' + ' ' +
					/*float A0*/'00 00 00 00' + ' ' +
					/*float A1*/'3F 80 00 00 ' + ' ' +
					/*float A2*/'00 00 00 00' + ' ' +
					Array(1024).fill('00 00 00 00').join(' ');
		// deltas
		spectrums.forEach(spectrum => {
			rcspgData += '\n' + filetimeFromJSTime(spectrum.timestamp);
			rcspgData += '\t' + Math.round(spectrum.duration);
			// no space optimization so far
			spectrum.channels.forEach(channel => {
				rcspgData += '\t' + channel;
			});
		});
		fs.writeFileSync('waterfall.rcspg', rcspgData);
	} else {
		let waterfall = createWaterfall(reduceSpectrumCount(spectrums, spectrumReduceFactor));
		let template = fs.readFileSync('waterfall-template.html', 'utf-8');
		fs.writeFileSync('waterfall.html', template.replace('{waterfall_data}', JSON.stringify(waterfall)));
	}
}

function paramIsSet(paramName) {
	return process.argv.indexOf(paramName) > 2;
}

function paramValue(paramName) {
	let paramIndex = process.argv.indexOf(paramName);
	if (paramIndex > 2) {
		return process.argv[paramIndex + 1];
	}
}

rcspg = paramIsSet('--rcspg');
useCps = paramIsSet('--cps');
if (rcspg && useCps) {
	console.error('cps is not suported for rcspg export');
	return;
}

if (paramIsSet('-rc')) {
	if (rcspg) {
		console.error('reduce channels param is not suported for rcspg export');
		return;
	}

	let value = parseInt(paramValue('-rc'));
	if (isNaN(value) || value < 1) {
		console.error('invalid reduce channels factor, must be positive integer');
		return;
	} else {
		channelReduceFactor = value;
	}
}

if (paramIsSet('-rs')) {
	let value = parseInt(paramValue('-rs'));
	if (isNaN(value) || value < 1) {
		console.error('invalid reduce spectrum factor, must be positive integer');
		return;
	} else {
		spectrumReduceFactor = value;
	}
}

let folder = process.argv[2]
convertFiles(folder);
console.log('DONE');