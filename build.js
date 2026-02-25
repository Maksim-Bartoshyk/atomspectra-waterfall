const fs = require('fs');

let waterfall = fs.readFileSync('./waterfall.html', 'utf-8');
waterfall = waterfall.replace('<link rel="stylesheet" href="./html/style.css" />', '<style>' + fs.readFileSync('./html/style.css') + '</style>');
waterfall = waterfall.replace('<script src="./shared/spectrum.js"></script>', '<script>' + fs.readFileSync('./shared/spectrum.js') + '</script>');
waterfall = waterfall.replace('<script src="./shared/waterfall-data.js"></script>', '<script>' + fs.readFileSync('./shared/waterfall-data.js') + '</script>');
waterfall = waterfall.replace('<script src="./shared/radiacode.js"></script>', '<script>' + fs.readFileSync('./shared/radiacode.js') + '</script>');
waterfall = waterfall.replace('<script src="./shared/csv.js"></script>', '<script>' + fs.readFileSync('./shared/csv.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/common.js"></script>', '<script>' + fs.readFileSync('./html/common.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/waterfall-plot.js"></script>', '<script>' + fs.readFileSync('./html/waterfall-plot.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/cps-plot.js"></script>', '<script>' + fs.readFileSync('./html/cps-plot.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/cursor.js"></script>', '<script>' + fs.readFileSync('./html/cursor.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/control-panel.js"></script>', '<script>' + fs.readFileSync('./html/control-panel.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/startup.js"></script>', '<script>' + fs.readFileSync('./html/startup.js') + '</script>');
fs.writeFileSync('./offline/waterfall-offline.html', waterfall);

waterfall = waterfall.replace('<!-- REGISTER SERVICE WORKER -->', `
  <script>
    if ('serviceWorker' in navigator) { 
      navigator.serviceWorker.register('./service-worker.js'); 
    }
  </script>
`);
waterfall = waterfall.replace('<!-- PWA META -->', `
  <meta name="theme-color" content="#000000">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="WF">
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="icons/icon-192.png"></link>
`);
fs.writeFileSync('./pwa/waterfall.html', waterfall);

let rcspg = fs.readFileSync('./rcspg.html', 'utf-8');
rcspg = rcspg.replace('<script src="./shared/spectrum.js"></script>', '<script>' + fs.readFileSync('./shared/spectrum.js') + '</script>');
rcspg = rcspg.replace('<script src="./shared/radiacode.js"></script>', '<script>' + fs.readFileSync('./shared/radiacode.js') + '</script>');
rcspg = rcspg.replace('<script src="./shared/csv.js"></script>', '<script>' + fs.readFileSync('./shared/csv.js') + '</script>');
fs.writeFileSync('./offline/rcspg-offline.html', rcspg);



