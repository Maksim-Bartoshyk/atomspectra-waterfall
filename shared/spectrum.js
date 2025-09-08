// TODO: try use typed array to optimize memory consumption (float32, for instance)
(function () {
  exports.deserializeSpectrum = function (fileText) {
    if (!fileText) {
      throw new Error('spectrum file text is empty');
    }

    const lines = fileText.split('\n');
    const format = lines[0];
    const note = lines[1];
    const time = parseInt(lines[2]);
    const time2 = parseInt(lines[3]);
    const latStr = lines[4];
    const lonStr = lines[5];
    const name = lines[6];
    const foundIsotopes = lines[7];
    const duration = parseFloat(lines[8]);
    const channelsCount = parseInt(lines[9]);
    const calibrationOrder = parseInt(lines[10]);
    const calibration = [];
    for (let i = 0; i < calibrationOrder + 1; i++) {
      calibration.push(parseFloat(lines[11 + i]));
    }

    let index = 0;
    const channels = new Float32Array(channelsCount);
    while (index < channelsCount) {
      channels[index] = parseFloat(lines[12 + calibrationOrder + index]);
      index++;
    }

    return {
      format: format,
      note: note,
      timestamp: time,
      timestamp2: time2,
      latStr: latStr,
      lonStr: lonStr,
      name: name,
      foundIsotopes: foundIsotopes,
      duration: duration,
      channelCount: channels.length,
      calibration: calibration,
      channels: channels
    };
  }

  exports.serializeSpectrum = function (spectrum) {
    if (!spectrum) {
      throw new Error('spectrum is not provided');
    }

    let text = spectrum.format + '\n';
    text += spectrum.note + '\n';
    text += spectrum.timestamp + '\n';
    text += spectrum.timestamp2 + '\n';
    text += spectrum.latStr + '\n';
    text += spectrum.lonStr + '\n';
    text += spectrum.name + '\n';
    text += spectrum.foundIsotopes + '\n';
    text += spectrum.duration + '\n';
    text += spectrum.channelCount + '\n';
    text += (spectrum.calibration.length - 1) + '\n';
    for (let i = 0; i < spectrum.calibration.length; i++) {
      text += spectrum.calibration[i] + '\n';
    }

    let index = 0;
    while (index < spectrum.channelCount) {
      text += spectrum.channels[index] + '\n';
      index++;
    }

    return text;
  }

  exports.deserializeDeltas = function (fileText, baseSpectrum, noZeros) {
    if (!fileText) {
      throw new Error('spectrum file text is empty');
    }

    const lines = fileText.split('\n');
    const deltaLinesCount = 5;
    const deltas = [];
    let deltaIndex = baseSpectrum.calibration.length + baseSpectrum.channelCount + 11; // skip base spectrum
    while (deltaIndex <= lines.length - deltaLinesCount) {
      const delta = readNextDelta(lines, deltaIndex, baseSpectrum.channelCount);
      if (noZeros) {
        if (delta.channels.some(c => c !== 0) && delta.duration > 0) {
          deltas.push(delta);
        }
      } else {
        deltas.push(delta);
      }

      deltaIndex += deltaLinesCount;
    }

    return {
      deltas: deltas
    };
  }

  exports.reduceDeltasCount = function (deltas, binning) {
    if (binning < 1) {
      throw new Error('invalid factor: ' + binning);
    }

    if (!deltas || !deltas.length) {
      throw new Error('no spectrums provided');
    }

    let reduced = [];
    for (let i = 0; i < deltas.length; i += binning) {
      let summ = {
        ...deltas[i],
        channels: new Float32Array(deltas[i].channels)
      };
      for (let j = 1; j < binning && (i + j) < deltas.length; j++) {
        for (let k = 0; k < summ.channels.length; k++) {
          summ.channels[k] += deltas[i + j].channels[k];
        }

        summ.duration += deltas[i + j].duration;
        // binned delta takes timestamp, lat, lon of the last delta in the bin
        summ.timestamp = deltas[i + j].timestamp;
        summ.lat = deltas[i + j].lat;
        summ.lon = deltas[i + j].lon;
      }

      reduced.push(summ);
    }

    return reduced;
  }

  exports.reduceChannelCount = function (channels, channelBinning) {
    if (channelBinning < 1) {
      throw new Error('invalid channel binning: ' + channelBinning);
    }

    if (!channels || !channels.length) {
      throw new Error('no channels provided');
    }

    let reduced = [];
    for (let i = 0; i < channels.length; i += channelBinning) {
      let summ = 0;
      for (let j = 0; j < channelBinning && (i + j) < channels.length; j++) {
        summ += channels[i + j];
      }

      reduced.push(summ);
    }

    return new Float32Array(reduced);
  }

  exports.getCalibration = function (calibration, channelBinning) {
    const newCalibration = [];
    for (let i = 0; i < calibration.length; i++) {
      newCalibration.push(Math.pow(channelBinning, i) * calibration[i]);
    }

    return newCalibration;
  }

  exports.combineDeltas = function (deltas, fromIndex, toIndex, baseSpectrum, filename) {
    if (fromIndex < 0) {
      fromIndex = 0;
    }

    if (toIndex > deltas.length - 1) {
      toIndex = deltas.length - 1;
    }

    if (fromIndex > toIndex) {
      const tmp = fromIndex;
      fromIndex = toIndex;
      toIndex = tmp;
    }

    const deltasToCombine = deltas.slice(fromIndex, toIndex + 1);
    const combinedDelta = this.reduceDeltasCount(deltasToCombine, deltasToCombine.length)[0];
    const combinedSpectrum = {
      format: 'FORMAT: 3',
      note: 'Counts: ' + combinedDelta.channels.reduce((a, v) => a += v, 0) + ', '
        + 'combined from spectrogram ' + filename + ', '
        + 'from index: ' + fromIndex + ', '
        + 'to index: ' + toIndex + ', '
        + 'from time: ' + formatTime(deltas[fromIndex].timestamp) + ', '
        + 'to time: ' + formatTime(deltas[toIndex].timestamp),
      timestamp: combinedDelta.timestamp,
      timestamp2: '0',
      latStr: '0.0',
      lonStr: '0.0',
      name: baseSpectrum.name,
      foundIsotopes: '',
      duration: combinedDelta.duration,
      channelCount: combinedDelta.channels.length,
      calibration: baseSpectrum.calibration,
      channels: combinedDelta.channels
    };

    return combinedSpectrum;
  }

  exports.cpsInChannelRange = function (channels, duration, range) {
    return channels.slice(range[0], range[1] + 1).reduce((a, v) => a + v, 0) / duration;
  };

  function readNextDelta(lines, fromIndex, channelCount) {
    const timestamp = parseInt(lines[fromIndex]);
    const lat = parseFloat(lines[fromIndex + 1]);
    const lon = parseFloat(lines[fromIndex + 2]);
    const duration = parseFloat(lines[fromIndex + 3]);
    const channels = new Float32Array(channelCount);
    lines[fromIndex + 4]
      .split('\t')
      .slice(0, channelCount)
      .forEach((str, index) => channels[index] = parseFloat(str));

    return {
      timestamp: timestamp,
      duration: duration,
      lat: lat,
      lon: lon,
      channels: channels
    }
  }

  /**
   * Converts binned range to original range before binning
   * @param {*} range Range after binning applied
   * @param {*} channelBinning Binning factor
   * @returns original range before binning
   */
  exports.rangeToOriginalRange = function (range, channelBinning) {
    return [range[0] * channelBinning, range[1] * channelBinning + (channelBinning - 1)];
  };

  function formatTime(timestamp) {
    const utcISO = new Date(timestamp).toISOString();

    return utcISO.split('T').join(' ').split('.')[0] + ' UTC';
  }
})();
