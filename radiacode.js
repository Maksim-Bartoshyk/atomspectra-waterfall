exports.createRcspgData = function(spectrums) {
	if (!spectrums || spectrums.length === 0) {
		throw new Error('no spectrums provided for rcspg convertion')
	}

	const fromTimestamp = spectrums[0].timestamp;
	const toTimestamp = spectrums[spectrums.length - 1].timestamp;

	// header
	const utcISO = new Date(fromTimestamp).toISOString();
	const formattedUTC = utcISO.split('T').join(' ').split('.')[0] + ' UTC';
	const spgName = spectrums[0].name;
	const spgTime = formattedUTC;
	let rcspgData = 'Spectrogram: ' + spgName + 
					'\tTime: ' + spgTime + 
					'\tTimestamp: ' + filetimeFromJSTime(fromTimestamp) + // just in case to avoid any potential division by zero
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
