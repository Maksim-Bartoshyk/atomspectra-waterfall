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
