const fs = require('fs');
const path = require('path');
const sp = require('./spectrum.js');
const rc = require('./radiacode.js');

let range = [0, 1023];
let compareRange;

function convertFiles(filepath) {
	const filestat = fs.lstatSync(filepath);
	if (!filestat.isFile()) {
		throw new Error('path "' + filepath + '" is not a file');
	}
	const basename = path.basename(filepath);
	if (basename.split('.')[1] !== 'txt') {
		throw new Error('txt file expected');
	}

	const filename = basename.split('.')[0];
	const content = fs.readFileSync(filepath, 'utf-8');
	const baseSpectrum = sp.deserializeSpectrum(content);
	const deltaInfo = sp.deserializeDeltas(content, baseSpectrum);
	console.info('Read success for file ' + filepath);

	if (deltaInfo.deltas.length === 0) {
		console.error('no deltas found!');
		return;
	}

	let deltas = deltaInfo.deltas;
	deltas.sort((s1, s2) => s1.timestamp > s2.timestamp ? 1 : -1); // ascending

	const trackName = compareRange
	 	? filename + ' CP2S: cps ratio for ranges ' + JSON.stringify(range) + ' / ' + JSON.stringify(compareRange)
		: filename + ' CP2S: cps in range ' + JSON.stringify(range);

	const data = rc.getRctrkData(trackName, deltas, range, compareRange, 8);
	fs.writeFileSync(filename + '.rctrk', data);
	console.info(filename + '.rctrk has been created');
}

function paramValue(paramName) {
	let paramIndex = process.argv.indexOf(paramName);
	if (paramIndex > 2) {
		return process.argv[paramIndex + 1];
	}
}

// TODO: ducplicated code
if (paramValue('-range')) {
	range = JSON.parse(paramValue('-range'));
	if (range.length !== 2 
		|| range[0] < 0 
		|| range[1] > 1023 
		|| range[0] > range[1]) {
			console.error('invalid range: ' + paramValue('-range'));
			return;
		}
}
// TODO: ducplicated code
if (paramValue('-compare-range')) {
	compareRange = JSON.parse(paramValue('-compare-range'));
	if (compareRange.length !== 2 
		|| compareRange[0] < 0 
		|| compareRange[1] > 1023 
		|| compareRange[0] > compareRange[1]) {
			console.error('invalid range: ' + paramValue('-compare-range'));
			return;
		}
}

console.warn('Important: range is for 1024 channel spectrum')
let file = process.argv[2];
convertFiles(file);
console.info('DONE');
