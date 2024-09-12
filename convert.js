var fs = require('fs');
var path = require('path');

function reduceChannelNumber(channels, factor) {
	var reduced = [];
	for (var i = 0; i < channels.length; i += factor) {
		var summ = 0;
		for (j = 0; j < factor; j++) {
			summ += channels[i + j];
		}

		reduced.push(summ);
	}

	return reduced;
}

function readSpectrum(fileText) {
	var lines = fileText.split('\n');
	var time = parseInt(lines[2]);
	var channelsCount = parseInt(lines[9]);
	var index = 0;
	var channels = [];
	while (index < channelsCount) {
		channels.push(parseInt(lines[14 + index]));
		index++;
	}

	return {
		timestamp: time,
		channels: reduceChannelNumber(channels, 8)
	};
}

function createWaterfall(spectrums) {
	var waterfall = {
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
				waterfall.max = Math.max(waterfall.max, channelValue);
				waterfall.points.push({
					x: channelIndex,
					y: spectrumIndex,
					value: channelValue
				});
			}
		});
	});

	return waterfall;
}

function convertFiles(dirname, onProgress, onError) {
	var spectrums = [];
	var filenames = fs.readdirSync(dirname);
	filenames.forEach(function(filename) {
		try {
			var content = fs.readFileSync(path.join(dirname, filename), 'utf-8');
			spectrums.push(readSpectrum(content));
			console.log('Read success for file ' + filename);
		} catch (e) {
			console.error('FAILURE for ' + filename + ' error: ' + e.message);
		}
	});

	spectrums.sort((s1, s2) => s1.timestamp < s2.timestamp ? 1 : -1);
	var waterfall = createWaterfall(spectrums);

	var template = fs.readFileSync('waterfall-template.html', 'utf-8');
	fs.writeFileSync('waterfall.html', template.replace('{waterfall_data}', JSON.stringify(waterfall)));
}

if (!process.argv[2]) {
	console.error('Provide source dir as a parameter');
	return;
}

convertFiles(process.argv[2]);
console.log('DONE');