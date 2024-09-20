let fs = require('fs');
let path = require('path');
let channelReduceFactor = 8;
let spectrumReduceFactor = 1;
let rcspg = false;

function getBigEndianFloat(value) {
	const getHex = i => ('00' + i.toString(16)).slice(-2);

	var view = new DataView(new ArrayBuffer(4));
	view.setFloat32(0, value);
	const result = Array
		.apply(null, { length: 4 })
		.map((_, i) => getHex(view.getUint8(i)))
		.reverse()
		.join(' ');

	return result;
}

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
	let duration = parseFloat(lines[8]);
	let channelsCount = parseInt(lines[9]);
	let calibrationOrder = parseInt(lines[10]);
	let calibration = [];
	for (let i = 0; i < calibrationOrder + 1; i++) {
		calibration.push(Math.pow(channelReduceFactor, i) * parseFloat(lines[11 + i]));
	}

	let index = 0;
	let channels = [];
	while (index < channelsCount) {
		channels.push(parseInt(lines[12 + calibrationOrder + index]));
		index++;
	}

	// filter out accidential spectrums from microphone input
	//if ((channels.slice(0, 80).reduce((s, v) => s += v, 0)) > 3) {
	//	channels = Array(channelsCount).fill(0);
	//}

	return {
		timestamp: time,
		duration: duration,
		calibration: calibration,
		channels: reduceChannelCount(channels, channelReduceFactor)
	};
}

function createWaterfallData(spectrums) {
	let waterfall = {
		points: [],
		channelCount: spectrums[0].channels.length,
		spectrumsCount: spectrums.length,
		timestamps: [],
		durations: [],
		calibration: spectrums[0].calibration,
	};
	spectrums.forEach((spectrum, spectrumIndex) => {
		waterfall.timestamps.push(spectrum.timestamp);
		waterfall.durations.push(spectrum.duration);

		spectrum.channels.forEach((channelValue, channelIndex) => {
			if (channelValue > 0) {
				waterfall.points.push({
					ci: channelIndex,
					si: spectrumIndex,
					cnt: channelValue
				});
			}
		});
	});

	return waterfall;
}

function createRcspgData(spectrums) {
	let fromTimestamp = spectrums[0].timestamp;
	let toTimestamp = spectrums[spectrums.length - 1].timestamp;

	// header
	let rcspgData = 'Spectrogram: ' + new Date(fromTimestamp).toISOString() + 
					'\tTime: ' + new Date(toTimestamp).toISOString() + 
					'\tTimestamp: ' + filetimeFromJSTime(fromTimestamp - 1000) + // just in case to avoid any potential division by zero
					'\tAccumulation time: ' + Math.floor((toTimestamp - fromTimestamp) / 1000) + 
					'\tChannels: 1024\tDevice serial: unknown\tFlags: 1\tComment: exported from atomspectra data';

	// base spectrum, zero duration, y=x calibration, all zero channels
	let a0 = 0;
	let a1 = 1;
	let a2 = 0;
	switch (spectrums[0].calibration.length) {
		case 2:
			a0 = spectrums[0].calibration[0];
			a1 = spectrums[0].calibration[1];
			break;
		case 3:
			a0 = spectrums[0].calibration[0];
			a1 = spectrums[0].calibration[1];
			a2 = spectrums[0].calibration[2];
			break;
		default:
			console.warn('calibration polynom order (' + spectrums[0].calibration.length + ') is not supported, y=x applied');
	}
	rcspgData += '\nSpectrum: ' +
				/*int32 duration*/'00 00 00 00' + ' ' +
				/*float A0*/getBigEndianFloat(a0) + ' ' +
				/*float A1*/getBigEndianFloat(a1) + ' ' +
				/*float A2*/getBigEndianFloat(a2) + ' ' +
				Array(1024).fill('00 00 00 00').join(' ');

	// deltas
	spectrums.forEach(spectrum => {
		rcspgData += '\n' + filetimeFromJSTime(spectrum.timestamp);
		rcspgData += '\t' + Math.round(spectrum.duration);
		spectrum.channels.forEach(channel => {
			rcspgData += '\t' + channel;
		});
	});

	return rcspgData;
}

function printItervalsStats(spectrums) {
	const intervalsDict = {};
	spectrums.forEach(spectrum => {
		const rounded  = spectrum.duration.toFixed(1);
		if (intervalsDict[rounded] === undefined) {
			intervalsDict[rounded] = 1;
		} else {
			intervalsDict[rounded]++;
		}
	});

	console.info('');
	console.info('spectrums to render:', spectrums.length);
	console.info('intervals:');
	Object.keys(intervalsDict)
		.map(k => [k, intervalsDict[k]])
		.sort((i1, i2) => i1[1] < i2[1] ? 1 : -1)
		.forEach(interval => {
		console.info(interval[0] + ' sec: ' + interval[1] + ' spectrums');
	});
	console.info('---------');
	Object.keys(intervalsDict)
		.map(k => [k, intervalsDict[k]])
		.sort((i1, i2) => i1[0] > i2[0] ? 1 : -1)
		.forEach(interval => {
		console.info(interval[0] + ' sec: ' + interval[1] + ' spectrums');
	});
	console.info('\n');
}

function convertFiles(dirname, onProgress, onError) {
	let spectrums = [];
	let files = fs.readdirSync(dirname, { withFileTypes: true });
	files.forEach(function(file) {
		if (file.isDirectory() || !file.name.endsWith('auto.txt')) {
			return;
		}

		try {
			let content = fs.readFileSync(path.join(dirname, file.name), 'utf-8');
			spectrums.push(readSpectrum(content));
			console.info('Read success for file ' + file.name);
		} catch (e) {
			console.error('FAILURE for ' + file.name + ' error: ' + e.message);
		}
	});

	if (spectrums.length === 0) {
		console.error('no spectrums found!');
		return;
	}

	spectrums.sort((s1, s2) => s1.timestamp > s2.timestamp ? 1 : -1); // ascending
	spectrums = reduceSpectrumCount(spectrums, spectrumReduceFactor);
	printItervalsStats(spectrums);

	if (rcspg) {
		let rcspgData = createRcspgData(spectrums);
		fs.writeFileSync('waterfall.rcspg', rcspgData);
		console.info('waterfall.rcspg has been created');
	} else {
		let waterfall = createWaterfallData(spectrums);
		let template = fs.readFileSync('waterfall-template.html', 'utf-8');
		fs.writeFileSync('waterfall.html', template.replace('{waterfall_data}', JSON.stringify(waterfall)));
		console.info('waterfall.html has been created');
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
console.info('DONE');