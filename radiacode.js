const sp = require('./spectrum.js');

exports.createRcspgData = function(baseSpectrum, deltas) {
	if (!baseSpectrum || !deltas || deltas.length === 0) {
		throw new Error('no deltas provided for rcspg convertion')
	}

	const fromTimestamp = deltas[0].timestamp;
	const toTimestamp = deltas[deltas.length - 1].timestamp;

	// header
	const utcISO = new Date(fromTimestamp).toISOString();
	const formattedUTC = utcISO.split('T').join(' ').split('.')[0] + ' UTC';
	const spgName = baseSpectrum.name;
	const spgTime = formattedUTC;
	let rcspgData = 'Spectrogram: ' + spgName + 
					'\tTime: ' + spgTime + 
					'\tTimestamp: ' + filetimeFromJSTime(fromTimestamp) + // just in case to avoid any potential division by zero
					'\tAccumulation time: ' + Math.floor((toTimestamp - fromTimestamp) / 1000) + 
					'\tChannels: 1024\tDevice serial: unknown\tFlags: 1\tComment: exported from atomspectra data';

	const calibration = sp.getCalibration(baseSpectrum.calibration, 8);
	// base spectrum, zero duration, y=x calibration, all zero channels
	let a0 = 0;
	let a1 = 1;
	let a2 = 0;
	switch (calibration.length) {
		case 2:
			a0 = calibration[0];
			a1 = calibration[1];
			break;
		case 3:
			a0 = calibration[0];
			a1 = calibration[1];
			a2 = calibration[2];
			break;
		default:
			console.warn('calibration polynom order (' + calibration.length + ') is not supported, y=x applied');
	}

	// TODO: write base spectrum
	rcspgData += '\nSpectrum: ' +
				/*int32 duration*/'00 00 00 00' + ' ' +
				/*float A0*/getBigEndianFloat(a0) + ' ' +
				/*float A1*/getBigEndianFloat(a1) + ' ' +
				/*float A2*/getBigEndianFloat(a2) + ' ' +
				Array(1024).fill('00 00 00 00').join(' ');

	// deltas
	deltas.forEach(delta => {
		const channels = sp.reduceChannelCount(delta.channels, 8);
		rcspgData += '\n' + filetimeFromJSTime(delta.timestamp);
		rcspgData += '\t' + Math.round(delta.duration);
		channels.forEach(channel => {
		rcspgData += '\t' + channel;
		});
	});

	return rcspgData;
}

exports.getRctrkData = function(name, deltas, range1, range2, channelBin) {
	let rctrkData = 'Track: ' + name + '\tAtom Spectra spectrogram\t \tEC\n';
	rctrkData += 'Timestamp\tTime\tLatitude\tLongitude\tAccuracy\tDoseRate\tCountRate\tComment\n';
	deltas.forEach(delta8k => {
		const channels = sp.reduceChannelCount(delta8k.channels, channelBin);
		let newLine = '';
		// ex: '133594869443100000	2024-05-06 16:35:44	60.0006352	30.3515997	6.79	13.3	9.98	 '
		newLine += filetimeFromJSTime(delta8k.timestamp).toString() + '\t';
		newLine += formatDate(delta8k.timestamp) + '\t';
		newLine += delta8k.lat.toFixed(8) + '\t';
		newLine += delta8k.lon.toFixed(8) + '\t';
		newLine += '0.0\t'; // accuracy
		newLine += '0.0\t'; // doserate
		let cps = cpsInRange(channels, delta8k.duration, range1);
		if (range2) {
			let cps2 = cpsInRange(channels, delta8k.duration, range2);
			if (cps2 > 0) {
				cps /= cps2;
			} else {
				cps = 0;
			}
		} 
		newLine += cps.toFixed(4) + '\t'; // cps
		newLine += ' \n'; // comment

		if (cps > 0) {
			rctrkData += newLine;
		}
	});

	return rctrkData;
}

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

function formatDate(ts) {
	const splitDate = new Date(ts).toISOString().split('T');

	return splitDate[0] + ' ' + splitDate[1].split('.')[0];
}

function cpsInRange(channels, duration, range) {
	return channels.slice(range[0], range[1] + 1).reduce((a, v) => a + v, 0) / duration;
}
