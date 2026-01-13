(function () {
  const statusText = document.getElementById('status-text');

  // display configuration/state
  window.constants = {
    timeAxisWidth: 150, // note: the same in css
    timestampHeight: 20,
    timestampTickWidth: 10,
    channelAxisHeight: 32,
    channelAxisTickHeight: 4,
    backgroundColor: 'black',
    previewHeight: 125,
    textColor: 'lightgray',
    lineColor: 'lightgray',
    separatorLineColor: '#777777',
    dotColor: 'white',
    cpsPlotHeight: 300,
    cpsExtendRange: 0.1,
    blurRadius: 1,
    cursorOffset: 3,
  };
  window.waterfallState = {
    scale: 'sqrt',
    palette: 'iron',
    spectrumBinning: 1,
    channelBinning: 16,
    blur: false,
    subtractBase: false,
    movingAverageVertical: 0,
    movingAverageHorizontal: 0,
    maxCpsPercent: 100,
    minCpsPercent: 0,
    timeOffsetHours: getLocalTimeOffsetHours(),
    previewEnabled: false,
    compareCps: false,
    channelRange1: [],
    channelRange2: [],
    spectrumRange: [],
  };
  window.common = {
    timeToString: timestamp => {
      const isoFormat = new Date(timestamp + waterfallState.timeOffsetHours * 60 * 60 * 1000).toISOString();
      let offsetStr;
      if (waterfallState.timeOffsetHours > 0) {
        offsetStr = '+' + waterfallState.timeOffsetHours + 'h';
      } else if (waterfallState.timeOffsetHours < 0) {
        offsetStr = '' + waterfallState.timeOffsetHours + 'h';
      } else {
        offsetStr = 'UTC';
      }

      return isoFormat.split('T').join(' ').split('.')[0] + ' ' + offsetStr;
    },
    /**
     * Converts channel number to energy using current calibration for waterfall data
     * NOT ORIGINAL WATERFALL DATA, but the one after binning and other modifications
     * @param {*} channel channel number
     * @returns energy in keV
     */
    channelToEnergy: channel => {
      return waterfallData.baseSpectrum.calibration.reduce((e, c, i) => e += Math.pow(channel, i) * c, 0);
    },
    rangeToOriginalRange: (range) => {
      return exports.rangeToOriginalRange(range, waterfallState.channelBinning / originalWaterfallData.channelBinning);
    },
    getLocalTimeOffsetHours: () => getLocalTimeOffsetHours(),
    executeWithStatusAsync: (status, func) => executeWithStatusAsync(status, func),
  }

  function getLocalTimeOffsetHours() {
    return -(new Date().getTimezoneOffset() / 60);
  }

  let hideOverlayTimeout = -1;
  function executeWithStatusAsync(status, func) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        clearTimeout(hideOverlayTimeout);
        statusText.innerText = status;
        statusText.style.display = 'block';
        statusText.classList.add('fadein');

        setTimeout(() => {
          try {
            func();
            res();
          } catch (e) {
            rej(e);
          } finally {
            hideOverlayTimeout = setTimeout(() => { // debounce time to avoid flickering
              statusText.innerText = '';
              statusText.classList.remove('fadein');
              statusText.style.display = 'none';
            }, 250);
          }
        }, 25); // let status to be rendered
      }, 0);
    });
  }
})();
