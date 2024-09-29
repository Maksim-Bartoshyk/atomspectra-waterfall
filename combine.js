const fs = require('fs');
const path = require('path');
const sp = require('./spectrum.js');

let combineFromIndex = 0;
let combineToIndex = 0;

function combineDeltas(filepath) {
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
	console.log('spectrums read: ' + deltas.length);
	if (isNaN(combineFromIndex) || isNaN(combineToIndex) 
		|| combineFromIndex < 0 || combineToIndex > (deltas.length - 1) 
		|| combineToIndex < combineFromIndex) {
		console.error('invalid indices provided, from: ' + combineFromIndex + ', to: ' + combineToIndex);
		return;
	}

	console.log('combining spectrums from: ' + combineFromIndex + ', to: ' + combineToIndex);
	deltas.sort((s1, s2) => s1.timestamp > s2.timestamp ? 1 : -1); // ascending
	deltas = deltas.slice(combineFromIndex, combineToIndex);

	const combined = sp.reduceSpectrumCount(deltas, deltas.length)[0];
	baseSpectrum.channels = combined.channels;
	baseSpectrum.timestamp = combined.timestamp;
	baseSpectrum.duration = combined.duration;
	const spectrumText = sp.serializeSpectrum(baseSpectrum);
	const filename = basename.split('.')[0] + '_combined.txt';
	fs.writeFileSync(filename, spectrumText);
	console.info(filename + ' has been created');
}

function paramValue(paramName) {
	let paramIndex = process.argv.indexOf(paramName);
	if (paramIndex > 2) {
		return process.argv[paramIndex + 1];
	}
}

let filepath = process.argv[2]
combineFromIndex = parseInt(paramValue('-from-index'));
combineToIndex = parseInt(paramValue('-to-index'));
combineDeltas(filepath);
console.info('DONE');
