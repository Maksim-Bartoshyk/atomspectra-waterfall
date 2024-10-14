const fs = require('fs');
const path = require('path');
const sp = require('./shared/spectrum.js');
const rc = require('./shared/radiacode.js');
const wf = require('./shared/waterfall-data.js');

let channelBinningParam = 8;
let spectrumBinningParam = 1;
let rcspg = false;

function printItervalsStats(deltas) {
	const intervalsDict = {};
	deltas.forEach(delta => {
		const rounded  = delta.duration.toFixed(1);
		if (intervalsDict[rounded] === undefined) {
			intervalsDict[rounded] = 1;
		} else {
			intervalsDict[rounded]++;
		}
	});

	console.info('');
	console.info('count of spectrums in source file:', deltas.length);
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

function convertFiles(filepath) {
	const filestat = fs.lstatSync(filepath);
	if (!filestat.isFile()) {
		throw new Error('path "' + filepath + '" is not a file');
	}
	const basename = path.basename(filepath);
	if (basename.split('.')[1] !== 'txt') {
		throw new Error('txt file expected');
	}

	const content = fs.readFileSync(filepath, 'utf-8');
	const baseSpectrum = sp.deserializeSpectrum(content);
	const deltaInfo = sp.deserializeDeltas(content, baseSpectrum);
	console.info('Read success for file ' + filepath);

	if (deltaInfo.deltas.length === 0) {
		console.error('no deltas found!');
		return;
	}

	let deltas = deltaInfo.deltas;
	printItervalsStats(deltas);

	const resultFilename = basename.split('.')[0];
	if (rcspg) {
		const rcspgData = rc.createRcspgData(baseSpectrum, deltas);
		fs.writeFileSync(resultFilename + '.rcspg', rcspgData);
		console.info(resultFilename + '.rcspg has been created');
	} else {
		const waterfall = wf.createWaterfallData(baseSpectrum, deltas, channelBinningParam, spectrumBinningParam, basename);
		// Float32Arrays are serialized by JSON.stringify as key/value objects, while template expects array-like value
		waterfall.baseSpectrum.channels = [...waterfall.baseSpectrum.channels];
		waterfall.deltas.forEach(delta => delta.channels = [...delta.channels]);
		const template = fs.readFileSync('waterfall.html', 'utf-8');
		fs.writeFileSync(resultFilename + '.html', template.replace("'waterfall-data-placeholder'", JSON.stringify(waterfall)));
		console.info(resultFilename + '.html has been created');
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

if (paramIsSet('-channel-binning')) {
	if (rcspg) {
		console.warn('channel binning param is not suported for rcspg export');
	} else {
		const allowed = [1, 2, 4, 8, 16, 32];
		const value = parseInt(paramValue('-channel-binning'));
		if (isNaN(value) || allowed.indexOf(value) === -1) {
			console.error('invalid channel binning param, allowed values: ', allowed);
			return;
		} else {
			channelBinningParam = value;
		}
	}
}

if (paramIsSet('-spectrum-binning')) {
	const value = parseInt(paramValue('-spectrum-binning'));
	if (isNaN(value) || value < 1) {
		console.error('invalid spectrum binning param, must be positive integer');
		return;
	} else {
		spectrumBinningParam = value;
	}
}

const filepath = process.argv[2]
convertFiles(filepath);
console.info('DONE');
