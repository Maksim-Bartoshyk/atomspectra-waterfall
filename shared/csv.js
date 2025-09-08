(function () {
  const sp = require('./spectrum.js');

  /**
   * Generates CSV data from deltas
   * @param {*} deltas deltas to export
   * @param {*} range1 range for cps calculation, ex: [100, 300], index is for binned channels
   * @param {*} range2 range for cps2 calculation, ex: [400, 600], index is for binned channels, if provided export contains cps1/cps2 ratio
   * @param {*} channelBin channel binning to be applied to deltas before cps calculation in provided ranges
   * @returns csv data as string
   */
  exports.getCSV = function (deltas, range1, range2, localTimeOffsetHours) {
    let csvData = 'utc_time_unix,utc_time,local_time,latitude,longitude,cps\n';
    deltas.forEach(delta => {
      const channels = delta.channels;
      let newLine = '';
      newLine += Math.round(delta.timestamp / 1000) + ','; // utc_time_unix
      newLine += formatDate(delta.timestamp) + ','; // utc_time
      newLine += formatDate(delta.timestamp + localTimeOffsetHours * 3600 * 1000) + ','; // local_time
      newLine += delta.lat.toFixed(8) + ','; // latitude
      newLine += delta.lon.toFixed(8) + ','; // longitude
      let cps = sp.cpsInChannelRange(channels, delta.duration, range1);
      if (range2) {
        let cps2 = sp.cpsInChannelRange(channels, delta.duration, range2);
        if (cps2 > 0) {
          cps /= cps2;
        } else {
          cps = 0;
        }
      }
      newLine += cps.toFixed(4); // cps
      newLine += '\n';

      csvData += newLine;
    });

    return csvData;
  }

  function formatDate(ts) {
    const splitDate = new Date(ts).toISOString().split('T');

    return splitDate[0] + ' ' + splitDate[1].split('.')[0];
  }
})();