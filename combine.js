const fs = require('fs');
const path = require('path');
const sp = require('./spectrum.js');

let combineFromIndex = 0;
let combineToIndex = 0;

function combineFiles(dirname, onProgress, onError) {
	let spectrums = [];
	let files = fs.readdirSync(dirname, { withFileTypes: true });
	files.forEach(function(file) {
		if (file.isDirectory() || !file.name.endsWith('auto.txt')) {
			return;
		}

		try {
			let content = fs.readFileSync(path.join(dirname, file.name), 'utf-8');
			spectrums.push(sp.deserializeSpectrum(content, 1));
			console.info('Read success for file ' + file.name);
		} catch (e) {
			console.error('FAILURE for ' + file.name + ' error: ' + e.message);
		}
	});

	if (spectrums.length === 0) {
		console.error('no spectrums found!');
		return;
	}

	console.log('spectrums read: ' + spectrums.length);
	if (isNaN(combineFromIndex) || isNaN(combineToIndex) 
		|| combineFromIndex < 0 || combineToIndex > (spectrums.length - 1) 
		|| combineToIndex < combineFromIndex) {
		console.error('invalid indices provided, from: ' + combineFromIndex + ', to: ' + combineToIndex);
		return;
	}

	console.log('combining spectrums from: ' + combineFromIndex + ', to: ' + combineToIndex);
	spectrums.sort((s1, s2) => s1.timestamp > s2.timestamp ? 1 : -1); // ascending
	spectrums = spectrums.slice(combineFromIndex, combineToIndex);

	const spectrum = sp.reduceSpectrumCount(spectrums, spectrums.length)[0];
	const spectrumText = sp.serializeSpectrum(spectrum);
	const filename = spectrum.name + '.txt';
	fs.writeFileSync(filename, spectrumText);
	console.info(filename + ' has been created');
}

function paramValue(paramName) {
	let paramIndex = process.argv.indexOf(paramName);
	if (paramIndex > 2) {
		return process.argv[paramIndex + 1];
	}
}

let folder = process.argv[2]
combineFromIndex = parseInt(paramValue('-from-index'));
combineToIndex = parseInt(paramValue('-to-index'));
combineFiles(folder);
console.info('DONE');
