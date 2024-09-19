# atomspectra-waterfall

Simplest waterfall image creator for atom spectra delta files.
Provided as is, use at your own risk.

Usage:
1) install nodejs
2) download repository
3) save all delta-spectrum files in a single folder
4) open folder containing convert.js in console
5) run ```node convert.js <spectrums folder>```, for example ```node convert.js "sample-data/nano-3"```
6) open generated "waterfall.html" in browser
7) right mouse click on specrtogram - save image as

Parameters:
1) ```-rc X``` reduce channel count (spectrogram width) by provided factor (X), i.e. ```--rc 8``` makes 1024 channes from 8192
2) ```-rs X``` reduce spectrum count (spectrogram height) by provided factor (X), i.e. ```--rc 2``` makes 100 spectrums from 200
3) ```--rcspg``` outputs data in radiacode spectrogram format