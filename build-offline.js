const fs = require('fs');

let waterfall = fs.readFileSync('./waterfall.html', 'utf-8');
waterfall = waterfall.replace('<link rel="stylesheet" href="./html/style.css" />', '<style>' + fs.readFileSync('./html/style.css') + '</style>');
waterfall = waterfall.replace('<script src="./shared/spectrum.js"></script>', '<script>' + fs.readFileSync('./shared/spectrum.js') + '</script>');
waterfall = waterfall.replace('<script src="./shared/waterfall-data.js"></script>', '<script>' + fs.readFileSync('./shared/waterfall-data.js') + '</script>');
waterfall = waterfall.replace('<script src="./shared/radiacode.js"></script>', '<script>' + fs.readFileSync('./shared/radiacode.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/common.js"></script>', '<script>' + fs.readFileSync('./html/common.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/waterfall.js"></script>', '<script>' + fs.readFileSync('./html/waterfall.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/cps.js"></script>', '<script>' + fs.readFileSync('./html/cps.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/cursor.js"></script>', '<script>' + fs.readFileSync('./html/cursor.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/binning.js"></script>', '<script>' + fs.readFileSync('./html/binning.js') + '</script>');
waterfall = waterfall.replace('<script src="./html/startup.js"></script>', '<script>' + fs.readFileSync('./html/startup.js') + '</script>');
fs.writeFileSync('./offline/waterfall-offline.html', waterfall);

let rcspg = fs.readFileSync('./rcspg.html', 'utf-8');
rcspg = rcspg.replace('<script src="./shared/spectrum.js"></script>', '<script>' + fs.readFileSync('./shared/spectrum.js') + '</script>');
rcspg = rcspg.replace('<script src="./shared/radiacode.js"></script>', '<script>' + fs.readFileSync('./shared/radiacode.js') + '</script>');
fs.writeFileSync('./offline/rcspg-offline.html', rcspg);
