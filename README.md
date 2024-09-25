# atomspectra-waterfall

Simplest waterfall image creator for atom spectra delta files.
Provided as is, use at your own risk.

Usage:
1) install nodejs - https://nodejs.org/
2) download repository
3) save all delta-spectrum files in a single folder
4) open folder containing waterfall.js in console
5) run ```node waterfall.js <spectrums folder>```, for example ```node waterfall.js "sample-data/nano-3"```
6) open generated "waterfall.html" in browser
7) right mouse click on specrtogram - save image as

Parameters:
1) ```-rc X``` reduce channel count (spectrogram width) by provided factor (X), i.e. ```--rc 8``` makes 1024 channes from 8192, default is 8
2) ```-rs X``` reduce spectrum count (spectrogram height) by provided factor (X), i.e. ```--rc 2``` makes 100 spectrums from 200, default is 1
3) ```--rcspg``` outputs data in radiacode spectrogram format

Combining spectrums into single one (if you want to examine some part of spectrogram in becqmoni, for instance):
run ```node combine.js <spectrums folder>```, for example ```node combine.js "sample-data/nano-3" -from-index 190 -to-index 210```

Important: from and to indices when -rc parameter is 1, channel count is unchanged
