const fs = require('fs');
const path = require('path');
const sp = require('./spectrum.js');
const rc = require('./radiacode.js');

let channelReduceFactor = 8;
let spectrumReduceFactor = 1;
let rcspg = false;

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
			spectrums.push(sp.readSpectrum(content, channelReduceFactor));
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
	spectrums = sp.reduceSpectrumCount(spectrums, spectrumReduceFactor);
	printItervalsStats(spectrums);

	if (rcspg) {
		let rcspgData = rc.createRcspgData(spectrums);
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
		console.warn('reduce channels param is not suported for rcspg export');
	} else {
		let value = parseInt(paramValue('-rc'));
		if (isNaN(value) || value < 1) {
			console.error('invalid reduce channels factor, must be positive integer');
			return;
		} else {
			channelReduceFactor = value;
		}
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
