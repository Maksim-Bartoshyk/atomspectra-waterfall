(function () {
  // startup - check if we have to run with nodejs prepared data or user loads it in browser
  const uploadControl = document.getElementById('upload-control');
  const infoContainer = document.getElementById('file-info-container');
  const infoSpan = document.getElementById('file-info');
  const overlay = document.getElementById('blocking-overlay');
  const fileInput = document.getElementById('file-input');
  const importChannelBinInput = document.getElementById('import-channel-binning');
  const spgConcatCheckbox = document.getElementById('spg-concat');
  const noZerosCheckbox = document.getElementById('no-zeros');

  spgConcatCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      fileInput.setAttribute('multiple', '');
    } else {
      fileInput.removeAttribute('multiple', '');
    }
  });

  noZerosCheckbox.addEventListener('change', (e) => {
    fileInput.value = '';
  });

  fileInput.addEventListener('change', (e) => onFileChange(e.target));
  importChannelBinInput.addEventListener('change', (e) => {
    fileInput.value = '';
  });

  if (window.originalWaterfallData === 'waterfall-data-placeholder') {
    uploadControl.style.display = 'block';
    infoContainer.style.display = 'none';
  } else {
    uploadControl.style.display = 'none';
    overlay.style.display = 'none';
    infoContainer.style.display = 'block';
    infoSpan.innerText = 'Atomspectra file: ' + originalWaterfallData.filename + '; already applied binning - '
      + 'spectrum: ' + originalWaterfallData.spectrumBinning + ', channel: ' + originalWaterfallData.channelBinning;

    startupAsync();
  }

  function onFileChange(input) {
    const file = input.files[0];
    if (!file) {
      return;
    }

    const noZeros = noZerosCheckbox.checked;
    const reader = new FileReader();
    if (spgConcatCheckbox.checked) {
      // concat multiple spectrograms
      let fileIndex = 0;
      let baseSpectrums = [];
      let deltas = [];

      reader.onload = async (e) => {
        const fileText = e.target.result;
        if (fileIndex < input.files.length) {
          const baseSpectrum = exports.deserializeSpectrum(fileText);
          baseSpectrums.push(baseSpectrum);
          const deltaInfo = exports.deserializeDeltas(fileText, baseSpectrum, noZeros);
          deltas = deltas.concat(deltaInfo.deltas);
        }

        await common.executeWithStatusAsync('Deserializing(' + (fileIndex + 1) + '/' + input.files.length + ')...', () => { });

        if (fileIndex === input.files.length - 1) {
          overlay.style.display = 'none';
          const importChannelBin = parseInt(importChannelBinInput.value);
          const spectrumBin = 1;
          deltas = deltas.sort((d1, d2) => d1.timestamp > d2.timestamp ? 1 : -1);
          baseSpectrums = baseSpectrums.sort((b1, b2) => b1.timestamp > b2.timestamp ? 1 : -1);
          window.originalWaterfallData = exports.createWaterfallData(baseSpectrums[0], deltas, importChannelBin, spectrumBin, 'Concatenated_spectrograms');

          await startupAsync();
        } else {
          fileIndex++;
          reader.readAsText(input.files[fileIndex]);
        }
      };
    } else {
      reader.onload = async (e) => {
        await common.executeWithStatusAsync('Deserializing...', () => {
          overlay.style.display = 'none';
          const fileText = e.target.result;
          const baseSpectrum = exports.deserializeSpectrum(fileText);
          const deltaInfo = exports.deserializeDeltas(fileText, baseSpectrum, noZeros);
          const deltas = deltaInfo.deltas;

          const importChannelBin = parseInt(importChannelBinInput.value);
          const spectrumBin = 1;
          window.originalWaterfallData = exports.createWaterfallData(baseSpectrum, deltas, importChannelBin, spectrumBin, file.name);
        });

        await startupAsync();
      };
    }

    common.executeWithStatusAsync('Opening file...', () => {
      reader.readAsText(file);
    });
  }

  async function startupAsync() {
    controlPanel.setSubtractBase(false);
    controlPanel.resetBaseChanged();
    controlPanel.resetMovingAverage();
    controlPanel.resetWaterfallBinning(16);
    await controlPanel.applyBinningAndAverageAsync(); // first setup of waterfall data
    controlPanel.initCpsControls(); // depends on waterfall data
    await waterfallPlot.renderWaterfallImageAsync();
    await waterfallPlot.renderSpectrumImageAsync();
    await cpsPlot.renderCpsAsync();
  }
})();