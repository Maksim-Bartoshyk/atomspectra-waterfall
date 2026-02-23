(function () {
  // TODO: split into separate files
  // waterfall binning/average control
  const spectrumBinningInput = document.getElementById('spectrum-binning');
  const channelBinningInput = document.getElementById('channel-binning');
  const movingAverageVerticalInput = document.getElementById('moving-average-vertical');
  const movingAverageHorizontalInput = document.getElementById('moving-average-horizontal');
  spectrumBinningInput.addEventListener('change', e => onSpectrumBinningChange(e.target.value));
  channelBinningInput.addEventListener('change', e => onChannelBinningChange(e.target.value));
  movingAverageVerticalInput.addEventListener('change', e => onVerticalMovingAverageChange(e.target.value));
  movingAverageHorizontalInput.addEventListener('change', e => onHorizontalMovingAverageChange(e.target.value));
  // end

  // scale control
  const linBtn = document.getElementById('lin');
  const sqrtBtn = document.getElementById('sqrt');
  const logBtn = document.getElementById('log');
  linBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
  sqrtBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
  logBtn.addEventListener('change', (e) => onWaterfallScaleChange(e.target.value));
  // end

  // misc
  const timezoneInput = document.getElementById('timezone');
  const subtractCheckbox = document.getElementById('subtract-base');
  const subtractLabel = document.getElementById('subtract-base-label');
  timezoneInput.addEventListener('change', (e) => onTimezoneChange(e.target.value));
  subtractCheckbox.addEventListener('change', (e) => onWaterfallSubtractChange(e.target.checked));
  // end

  // palette
  const blurCheckbox = document.getElementById('blur-waterfall');
  const maxCpsInput = document.getElementById('max-cps');
  const minCpsInput = document.getElementById('min-cps');
  const palette = document.getElementById('palette');
  maxCpsInput.addEventListener('change', (e) => onMaxCpsChange(e.target.value));
  minCpsInput.addEventListener('change', (e) => onMinCpsChange(e.target.value));
  palette.addEventListener('change', (e) => onWaterfallPaletteChange(palette.value));
  blurCheckbox.addEventListener('change', (e) => onWaterfallBlurChange(e.target.checked));
  // end

  // bottom section (cps related)
  const fromChannelInput1 = document.getElementById('from-channel-1');
  const toChannelInput1 = document.getElementById('to-channel-1');
  const previewCheckbox = document.getElementById('preview-enabled');
  const fromChannelInput2 = document.getElementById('from-channel-2');
  const toChannelInput2 = document.getElementById('to-channel-2');
  const fromSpectrumInput = document.getElementById('from-spectrum');
  const toSpectrumInput = document.getElementById('to-spectrum');
  const cpsRatioCheckbox = document.getElementById('cps-ratio');
  const cpsCsvExportRadio = document.getElementById('cps-csv-export');
  const cpsExportButton = document.getElementById('export-cps');
  const cpsBinAvgExportButton = document.getElementById('export-bin-avg-cps');
  const cpsRatioExportButton = document.getElementById('export-cps-ratio');
  const cpsRatioBinAvgExportButton = document.getElementById('export-bin-avg-cps-ratio');
  const spgToSpectrumFileButton = document.getElementById('spg-range-to-file');
  const spgAsBaseButton = document.getElementById('spg-range-as-base');
  cpsRatioCheckbox.addEventListener('change', async () => onCompareCheckboxChange());
  cpsExportButton.addEventListener('click', () => exportCps(false, cpsCsvExportRadio.checked));
  cpsRatioExportButton.addEventListener('click', () => exportCpsRatio(false, cpsCsvExportRadio.checked));
  cpsBinAvgExportButton.addEventListener('click', () => exportCps(true, cpsCsvExportRadio.checked));
  cpsRatioBinAvgExportButton.addEventListener('click', () => exportCpsRatio(true, cpsCsvExportRadio.checked));
  spgToSpectrumFileButton.addEventListener('click', () => exportSpectrumRange());
  spgAsBaseButton.addEventListener('click', () => spectrumRangeAsBase());
  previewCheckbox.addEventListener('change', async () => await previewEnabledChange());
  fromChannelInput1.addEventListener('change', async () => await onChannelIndexInputChange());
  toChannelInput1.addEventListener('change', async () => await onChannelIndexInputChange());
  fromChannelInput2.addEventListener('change', async () => await onChannelIndexInputChange());
  toChannelInput2.addEventListener('change', async () => await onChannelIndexInputChange());
  fromSpectrumInput.addEventListener('change', async () => await onSpectrumIndexInputChange());
  toSpectrumInput.addEventListener('change', async () => await onSpectrumIndexInputChange());
  // end

  const plotContainer = document.getElementById('plot-container');
  const waterfallCanvas = document.getElementById('waterfall-plot');
  const cpsCanvas = document.getElementById('cps-plot');
  const previewContainer = document.getElementById('preview-container');
  const previewCanvas = document.getElementById('preview-plot');

  // hotkeys
  const keyboardState = {
    pressedKeyCode: undefined,
    alt: false
  };
  document.body.addEventListener('keydown', (e) => onKeyDown(e));
  document.body.addEventListener('keyup', (e) => onKeyUp(e));
  waterfallCanvas.addEventListener('dblclick', (e) => onWaterfallPaletteChange());
  waterfallCanvas.addEventListener('click', (e) => onWaterfallClick(e));
  cpsCanvas.addEventListener('click', (e) => onCpsClick(e));
  // end

  window.controlPanel = {
    setSubtractBase: (value) => setSubtractBase(value),
    markBaseChanged: () => markBaseChanged(),
    resetBaseChanged: () => resetBaseChanged(),
    ensureValidWaterfallBinning: (channelBinning) => ensureValidWaterfallBinning(channelBinning),
    resetMovingAverage: () => resetMovingAverage(),
    applyBinningAndAverage: () => applyBinningAndAverage(),
    applyBinningAndAverageAsync: () => {
      return common.executeWithStatusAsync('Processing...', () => applyBinningAndAverage());
    },
    showPreview: () => showPreview(),
    hidePreview: () => hidePreview(),
    initCpsControls: () => initCpsControls(),
  };

  let tmpRangeStart = -1;
  function onKeyDown(e) {
    if (e.code.startsWith('Key')) {
      const previousCode = keyboardState.pressedKeyCode;
      keyboardState.pressedKeyCode = e.code;

      switch (e.code) {
        case 'KeyS':
        case 'KeyC':
        case 'KeyA':
          if (previousCode !== e.code) {
            tmpRangeStart = -1;
          }

          break;
      }
    }
  }

  function onKeyUp(e) {
    if (e.code.startsWith('Key')) {
      keyboardState.pressedKeyCode = undefined;
    }
  }

  async function onWaterfallClick(e) {
    if (keyboardState.pressedKeyCode === 'KeyS') {
      const spectrumIndex = cursorControl.getWFOriginalSpectrumIndex(e);
      if (tmpRangeStart === -1) {
        fromSpectrumInput.value = spectrumIndex;
        toSpectrumInput.value = spectrumIndex;
        tmpRangeStart = spectrumIndex;
      } else {
        fromSpectrumInput.value = spectrumIndex < tmpRangeStart ? spectrumIndex : tmpRangeStart;
        toSpectrumInput.value = spectrumIndex > tmpRangeStart ? spectrumIndex : tmpRangeStart;
        tmpRangeStart = -1;
      }

      await onSpectrumIndexInputChange();
    }

    if (keyboardState.pressedKeyCode === 'KeyC') {
      const channelIndex = cursorControl.getWFChannelIndex(e);
      if (tmpRangeStart === -1) {
        fromChannelInput1.value = channelIndex;
        toChannelInput1.value = channelIndex;
        tmpRangeStart = channelIndex;
      } else {
        fromChannelInput1.value = channelIndex < tmpRangeStart ? channelIndex : tmpRangeStart;
        toChannelInput1.value = channelIndex > tmpRangeStart ? channelIndex : tmpRangeStart;
        tmpRangeStart = -1;
      }

      await onChannelIndexInputChange();
    }

    if (keyboardState.pressedKeyCode === 'KeyA') {
      const channelIndex = cursorControl.getWFChannelIndex(e);
      if (tmpRangeStart === -1) {
        fromChannelInput2.value = channelIndex;
        toChannelInput2.value = channelIndex;
        tmpRangeStart = channelIndex;
      } else {
        fromChannelInput2.value = channelIndex < tmpRangeStart ? channelIndex : tmpRangeStart;
        toChannelInput2.value = channelIndex > tmpRangeStart ? channelIndex : tmpRangeStart;
        tmpRangeStart = -1;
      }

      await onChannelIndexInputChange();
    }
  }

  async function onCpsClick(e) {
    if (keyboardState.pressedKeyCode === 'KeyS') {
      const spectrumIndex = cursorControl.getCpsOriginalSpectrumIndex(e);
      if (tmpRangeStart === -1) {
        fromSpectrumInput.value = spectrumIndex;
        toSpectrumInput.value = spectrumIndex;
        tmpRangeStart = spectrumIndex;
      } else {
        fromSpectrumInput.value = spectrumIndex < tmpRangeStart ? spectrumIndex : tmpRangeStart;
        toSpectrumInput.value = spectrumIndex > tmpRangeStart ? spectrumIndex : tmpRangeStart;
        tmpRangeStart = -1;
      }

      await onSpectrumIndexInputChange();
    }
  }

  async function onWaterfallPaletteChange(value) {
    const paletteList = ['iron', 'lime', 'yellow', 'glow', 'gray'];
    if (value) {
      waterfallState.palette = value;
    } else {
      const selected = paletteList.indexOf(waterfallState.palette);
      if (selected === paletteList.length - 1) {
        waterfallState.palette = paletteList[0];
      } else {
        waterfallState.palette = paletteList[selected + 1];
      }

      palette.value = waterfallState.palette;
    }

    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
  }

  function showPreview() {
    waterfallState.previewEnabled = true;
    plotContainer.classList.add('with-preview');
    previewContainer.style.display = 'block';
    previewCanvas.height = 0;
  }

  function hidePreview() {
    waterfallState.previewEnabled = false;
    plotContainer.classList.remove('with-preview');
    previewContainer.style.display = 'none';
  }

  function setSubtractBase(value) {
    if (value && waterfallData.baseSpectrum.duration <= 0) {
      alert('Error: cannot subtract base spectrum because its duration is zero.');
      value = false;
    }
    subtractCheckbox.checked = value;
    waterfallState.subtractBase = value;
  }

  function markBaseChanged() {
    if (subtractLabel.innerText.indexOf('*') === -1) {
      subtractLabel.innerText += '*';
      subtractLabel.title = 'base has been set from spectrogram';
    }
  }

  function resetBaseChanged() {
    if (subtractLabel.innerText.indexOf('*') !== -1) {
      subtractLabel.innerText = subtractLabel.innerText.replace('*', '');
      subtractLabel.title = '';
    }
  }

  function ensureValidWaterfallBinning() {
    spectrumBinningInput.value = waterfallState.spectrumBinning;

    const currentChannelBinning = waterfallState.channelBinning;
    waterfallState.channelBinning = currentChannelBinning >= originalWaterfallData.channelBinning
      ? currentChannelBinning
      : originalWaterfallData.channelBinning;
    channelBinningInput.value = waterfallState.channelBinning;
    const opts = channelBinningInput.getElementsByTagName('option');
    [...opts].forEach(opt => {
      opt.disabled = parseInt(opt.value) < originalWaterfallData.channelBinning;
    });
  }

  function resetMovingAverage() {
    waterfallState.movingAverageVertical = 0;
    waterfallState.movingAverageHorizontal = 0;
    movingAverageVerticalInput.value = 0;
    movingAverageHorizontalInput.value = 0;
  }

  async function onWaterfallScaleChange(value) {
    waterfallState.scale = value;
    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
    await cpsPlot.renderCpsAsync();
  }

  async function onWaterfallBlurChange(value) {
    waterfallState.blur = value;
    await waterfallPlot.renderWaterfallImageAsync();
  }

  async function onWaterfallSubtractChange(value) {
    setSubtractBase(value);
    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
    await cpsPlot.renderCpsAsync();
  }

  async function onSpectrumBinningChange(value) {
    let newBin = parseInt(value);
    if (isNaN(newBin) || newBin < 1) {
      newBin = 1;
      spectrumBinningInput.value = newBin;
    }

    waterfallState.spectrumBinning = newBin;

    await controlPanel.applyBinningAndAverageAsync();
    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
    await cpsPlot.renderCpsAsync();
  }

  async function onChannelBinningChange(value) {
    const newBin = parseInt(value);
    const prevBin = waterfallState.channelBinning;
    waterfallState.channelBinning = newBin;

    await controlPanel.applyBinningAndAverageAsync();
    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();

    updateInputChannelValue(fromChannelInput1, newBin, prevBin);
    updateInputChannelValue(toChannelInput1, newBin, prevBin);
    updateInputChannelValue(fromChannelInput2, newBin, prevBin);
    updateInputChannelValue(toChannelInput2, newBin, prevBin);

    await onChannelIndexInputChange();
  }

  async function onVerticalMovingAverageChange(value) {
    let windowSize = parseInt(value);

    if (isNaN(windowSize) || windowSize < 0) {
      movingAverageVerticalInput.value = 0;
      windowSize = 0;
    }

    if (windowSize === waterfallState.movingAverageVertical) {
      return;
    }

    waterfallState.movingAverageVertical = windowSize;
    await controlPanel.applyBinningAndAverageAsync();
    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
    await cpsPlot.renderCpsAsync();
  }

  async function onHorizontalMovingAverageChange(value) {
    let windowSize = parseInt(value);

    if (isNaN(windowSize) || windowSize < 0) {
      movingAverageHorizontalInput.value = 0;
      windowSize = 0;
    }

    if (windowSize === waterfallState.movingAverageHorizontal) {
      return;
    }

    waterfallState.movingAverageHorizontal = windowSize;
    await controlPanel.applyBinningAndAverageAsync();
    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
    await cpsPlot.renderCpsAsync();
  }

  async function onMaxCpsChange(value) {
    let newVal = parseFloat(value);
    if (isNaN(newVal) || newVal < 1) {
      newVal = 100;
      maxCpsInput.value = newVal;
    }

    waterfallState.maxCpsPercent = newVal;
    if (waterfallState.minCpsPercent > newVal) {
      waterfallState.minCpsPercent = newVal - 1;
      minCpsInput.value = waterfallState.minCpsPercent;
    }

    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
  }

  async function onMinCpsChange(value) {
    let newVal = parseFloat(value);
    if (isNaN(newVal) || newVal < 0) {
      newVal = 0;
      minCpsInput.value = newVal;
    }

    waterfallState.minCpsPercent = newVal;
    if (waterfallState.maxCpsPercent < newVal) {
      waterfallState.maxCpsPercent = newVal + 1;
      maxCpsInput.value = waterfallState.maxCpsPercent;
    }

    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
  }

  async function onTimezoneChange(value) {
    if (value === 'local') {
      waterfallState.timeOffsetHours = common.getLocalTimeOffsetHours();
    } else {
      waterfallState.timeOffsetHours = parseInt(value);
    }

    // TODO: call 'render axis' would be better here
    await waterfallPlot.renderSpectrumSelectionAsync();
  }

  function updateInputChannelValue(input, newBin, prevBin) {
    const prevVal = parseInt(input.value);

    if (!isNaN(prevVal)) {
      let newVal = Math.round((prevVal / newBin) * prevBin);
      if (newVal < 0) {
        newVal = 0;
      }
      if (newVal > waterfallData.baseSpectrum.channelCount - 1) {
        newVal = waterfallData.baseSpectrum.channelCount - 1;
      }
      input.value = newVal;
    }
  }

  function applyBinningAndAverage() {
    waterfallData = exports.createWaterfallData(
      originalWaterfallData.baseSpectrum,
      originalWaterfallData.deltas,
      waterfallState.channelBinning / originalWaterfallData.channelBinning,
      waterfallState.spectrumBinning
    );

    applyMovingAverage();
  }

  function applyMovingAverage() {
    // horizontal average
    let windowSize = waterfallState.movingAverageHorizontal;
    let leftNeighbors = Math.floor(windowSize / 2);
    let rightNeighbors = Math.ceil(windowSize / 2);
    let avgDeltas = [];
    for (let i = 0; i < waterfallData.deltas.length; i++) {
      const avgDelta = {
        ...waterfallData.deltas[i],
        channels: new Float32Array(waterfallData.baseSpectrum.channelCount)
      };
      for (let j = 0; j < waterfallData.deltas[i].channels.length; j++) {
        avgDelta.channels[j] = waterfallData.deltas[i].channels[j];
        let appliedSize = 0;
        for (let k = j - leftNeighbors; k <= j + rightNeighbors; k++) {
          if (k < 0 || k === j) {
            continue;
          }
          if (k >= waterfallData.deltas[i].channels.length) {
            break;
          }
          avgDelta.channels[j] += waterfallData.deltas[i].channels[k];
          appliedSize++;
        }
        avgDelta.channels[j] /= appliedSize + 1;
      }

      avgDeltas.push(avgDelta);
    }
    waterfallData.deltas = avgDeltas;

    // base spectrum
    const channels = new Float32Array(waterfallData.baseSpectrum.channelCount);
    for (let j = 0; j < waterfallData.baseSpectrum.channels.length; j++) {
      channels[j] = waterfallData.baseSpectrum.channels[j];
      let appliedSize = 0;
      for (let k = j - leftNeighbors; k <= j + rightNeighbors; k++) {
        if (k < 0 || k === j) {
          continue;
        }
        if (k >= waterfallData.baseSpectrum.channels.length) {
          break;
        }
        channels[j] += waterfallData.baseSpectrum.channels[k];
        appliedSize++;
      }
      channels[j] /= appliedSize + 1;
    }
    waterfallData.baseSpectrum.channels = channels;

    // vertical average
    windowSize = waterfallState.movingAverageVertical;
    leftNeighbors = Math.floor(windowSize / 2);
    rightNeighbors = Math.ceil(windowSize / 2);
    avgDeltas = [];
    for (let i = 0; i < waterfallData.deltas.length; i++) {
      const avgDelta = {
        ...waterfallData.deltas[i],
        channels: new Float32Array(waterfallData.deltas[i].channels)
      };
      for (let j = 0; j < avgDelta.channels.length; j++) {
        let appliedSize = 0;
        for (let k = i - leftNeighbors; k <= i + rightNeighbors; k++) {
          if (k < 0 || k === i) {
            continue;
          }

          if (k >= waterfallData.deltas.length) {
            break;
          }

          avgDelta.channels[j] += waterfallData.deltas[k].channels[j] * (waterfallData.deltas[i].duration / waterfallData.deltas[k].duration);
          appliedSize++;
        }

        avgDelta.channels[j] /= appliedSize + 1;
      }

      avgDeltas.push(avgDelta);
    }

    waterfallData.deltas = avgDeltas;
  }

  function initCpsControls() {
    waterfallState.channelRange1 = [0, waterfallData.baseSpectrum.channelCount - 1];
    waterfallState.channelRange2 = [0, waterfallData.baseSpectrum.channelCount - 1];
    waterfallState.spectrumRange = [0, waterfallData.deltas.length - 1];

    fromChannelInput1.value = waterfallState.channelRange1[0];
    toChannelInput1.value = waterfallState.channelRange1[1];
    fromChannelInput2.value = waterfallState.channelRange2[0];
    toChannelInput2.value = waterfallState.channelRange2[1];
    fromSpectrumInput.value = waterfallState.spectrumRange[0];
    toSpectrumInput.value = waterfallState.spectrumRange[1];
  }

  async function onCompareCheckboxChange() {
    waterfallState.compareCps = cpsRatioCheckbox.checked;
    cpsRatioExportButton.disabled = !waterfallState.compareCps;
    cpsRatioBinAvgExportButton.disabled = !waterfallState.compareCps;

    await waterfallPlot.renderChannelSelectionAsync();
    await cpsPlot.renderCpsAsync();
  }

  async function onChannelIndexInputChange() {
    waterfallState.channelRange1 = getChannelRange(fromChannelInput1, toChannelInput1);
    waterfallState.channelRange2 = getChannelRange(fromChannelInput2, toChannelInput2);

    await waterfallPlot.renderChannelSelectionAsync();
    await cpsPlot.renderCpsAsync();
  }

  function getChannelRange(fromInput, toInput) {
    let fromChannel = parseInt(fromInput.value);
    let toChannel = parseInt(toInput.value);

    if (isNaN(fromChannel) || fromChannel < 0) {
      fromChannel = 0;
      fromInput.value = 0;
    }

    if (fromChannel > waterfallData.baseSpectrum.channelCount - 1) {
      fromChannel = waterfallData.baseSpectrum.channelCount - 1;
      fromInput.value = waterfallData.baseSpectrum.channelCount - 1;
    }

    if (isNaN(toChannel) || toChannel > waterfallData.baseSpectrum.channelCount - 1) {
      toChannel = waterfallData.baseSpectrum.channelCount - 1;
      toInput.value = waterfallData.baseSpectrum.channelCount - 1;
    }

    if (fromChannel > toChannel) {
      toChannel = fromChannel;
      fromInput.value = fromChannel;
      toInput.value = toChannel;
    }

    return [fromChannel, toChannel];
  }

  async function onSpectrumIndexInputChange() {
    waterfallState.spectrumRange = getSpectrumRange();
    if (waterfallState.spectrumRange && waterfallState.spectrumRange.length === 2) {
      await waterfallPlot.renderSpectrumSelectionAsync();
      await waterfallPlot.renderSpectrumImageAsync();
    }
  }

  function getSpectrumRange() {
    let fromSpectrum = parseInt(fromSpectrumInput.value);
    let toSpectrum = parseInt(toSpectrumInput.value);
    if (isNaN(fromSpectrum) || fromSpectrum < 0) {
      fromSpectrum = 0;
      fromSpectrumInput.value = 0;
    }

    if (fromSpectrum > originalWaterfallData.deltas.length - 1) {
      fromSpectrum = originalWaterfallData.deltas.length - 1;
      fromSpectrumInput.value = originalWaterfallData.deltas.length - 1;
    }

    if (isNaN(toSpectrum) || toSpectrum > originalWaterfallData.deltas.length - 1) {
      toSpectrum = originalWaterfallData.deltas.length - 1;
      toSpectrumInput.value = originalWaterfallData.deltas.length - 1;
    }

    if (fromSpectrum > toSpectrum) {
      toSpectrum = fromSpectrum;
      fromSpectrumInput.value = fromSpectrum;
      toSpectrumInput.value = toSpectrum;
    }

    return [fromSpectrum, toSpectrum];
  }

  async function previewEnabledChange() {
    if (previewCheckbox.checked) {
      controlPanel.showPreview();
      if (waterfallState.spectrumRange && waterfallState.spectrumRange.length === 2) {
        await waterfallPlot.renderSpectrumImageAsync();
      }
    } else {
      controlPanel.hidePreview();
    }
  }

  function exportCps(binAvg, csv) {
    const range = waterfallState.channelRange1;
    if (!range || range.length !== 2) {
      alert('Error: invalid channel range 1.');
      return;
    }

    const energyRange = getEnergyRangeStr(range);
    const description = originalWaterfallData.baseSpectrum.name + ' CP2S: cps in range ' + energyRange;
    let data = '';
    if (csv) {
      if (binAvg) {
        data = exports.getCSV(
          waterfallData.deltas,
          range,
          undefined,
          waterfallState.timeOffsetHours
        );
      } else {
        data = exports.getCSV(
          originalWaterfallData.deltas,
          common.rangeToOriginalRange(range),
          undefined,
          waterfallState.timeOffsetHours
        );
      }
    } else {
      if (binAvg) {
        data = exports.getRctrkData(
          description,
          waterfallData.deltas,
          range,
          undefined,
        );
      } else {
        data = exports.getRctrkData(
          description,
          originalWaterfallData.deltas,
          common.rangeToOriginalRange(range),
          undefined
        );
      }
    }

    let filename = originalWaterfallData.baseSpectrum.name + '-' + energyRange + '-cps';
    if (csv) {
      saveFile(filename, 'csv', data, 'text/csv');
    } else {
      saveFile(filename, 'rctrk', data, 'text/rctrk');
      return;
    }
  }

  function exportCpsRatio(binAvg, csv) {
    const range = waterfallState.channelRange1;
    if (!range || range.length !== 2) {
      alert('Error: invalid channel range 1.');
      return;
    }
    const compareRange = waterfallState.channelRange2;
    if (!compareRange || compareRange.length !== 2) {
      alert('Error: invalid channel range 2.');
      return;
    }
    const energyRange = getEnergyRangeStr(range);
    const compareEnergyRange = getEnergyRangeStr(compareRange);
    const description = originalWaterfallData.baseSpectrum.name + ' CP2S: cps ratio for ranges ' + energyRange + '/' + compareEnergyRange;

    let data = '';
    if (csv) {
      if (binAvg) {
        data = exports.getCSV(
          waterfallData.deltas,
          range,
          compareRange,
          waterfallState.timeOffsetHours
        );
      } else {
        data = exports.getCSV(
          originalWaterfallData.deltas,
          common.rangeToOriginalRange(range),
          common.rangeToOriginalRange(compareRange),
          waterfallState.timeOffsetHours
        );
      }
    } else {
      if (binAvg) {
        data = exports.getRctrkData(
          description,
          waterfallData.deltas,
          range,
          compareRange
        );
      } else {
        data = exports.getRctrkData(
          description,
          originalWaterfallData.deltas,
          common.rangeToOriginalRange(range),
          common.rangeToOriginalRange(compareRange)
        );
      }
    }

    let filename = originalWaterfallData.baseSpectrum.name + '-' + energyRange + compareEnergyRange + '-cps-ratio';
    if (csv) {
      saveFile(filename, 'csv', data, 'text/csv');
    } else {
      saveFile(filename, 'rctrk', data, 'text/rctrk');
    }
  }

  function exportSpectrumRange() {
    const range = waterfallState.spectrumRange;
    if (!range || range.length !== 2) {
      alert('Error: invalid from or to spectrum index.');
      return;
    }

    if (originalWaterfallData.channelBinning !== 1) {
      alert('Export to ' + originalWaterfallData.baseSpectrum.channelCount + ' channels due to channel binning applied by CLI or during import.');
    }

    const combinedSpectrum = exports.combineDeltas(
      originalWaterfallData.deltas,
      range[0],
      range[1],
      originalWaterfallData.baseSpectrum,
      originalWaterfallData.filename
    );
    const spectrumText = exports.serializeSpectrum(combinedSpectrum);
    const filename = originalWaterfallData.baseSpectrum.name + '-[' + range[0] + ', ' + range[1] + ']';

    saveFile(filename + '-combined', 'txt', spectrumText, 'text/plain');
  }

  async function spectrumRangeAsBase() {
    const range = waterfallState.spectrumRange;
    if (!range || range.length !== 2) {
      alert('Error: invalid from or to spectrum index.');
      return;
    }

    const combinedSpectrum = exports.combineDeltas(
      originalWaterfallData.deltas,
      range[0],
      range[1],
      originalWaterfallData.baseSpectrum,
      originalWaterfallData.filename
    );
    originalWaterfallData.baseSpectrum = combinedSpectrum;

    controlPanel.setSubtractBase(true);
    controlPanel.markBaseChanged();
    await controlPanel.applyBinningAndAverageAsync();
    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
    await cpsPlot.renderCpsAsync();
  }

  function saveFile(filename, extension, data, mimeType) {
    let userFilename = prompt("Please enter file name", filename);
    if (userFilename == null) {
      return;
    }

    if (!userFilename) {
      userFilename = filename;
    }

    const blob = new Blob([data], { type: mimeType });
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = userFilename + '.' + extension;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }

  function getEnergyRangeStr(range) {
    let fromE = common.channelToEnergy(range[0]).toFixed(0);
    if (fromE < 0) {
      fromE = 0;
    }
    let toE = common.channelToEnergy(range[1]).toFixed(0);
    if (toE < 0) {
      toE = 0;
    }

    return '[' + fromE + '-' + toE + ' keV]';
  }
})();
