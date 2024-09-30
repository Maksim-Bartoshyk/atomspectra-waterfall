# atomspectra-waterfall

Simplest waterfall image creator for atom spectra delta file (starting from atomspectra 6.6.15). For older version - https://github.com/Maksim-Bartoshyk/atomspectra-waterfall/releases/tag/AS-6.6.14

Provided as is, use at your own risk.

Usage (simple, might work on mobile device as well):
1) download repository
2) save delta-spectrum file on computer
3) open ```waterfall.html``` file in browser
4) upload delta-spectrum file
5) apply binning
6) right mouse click on spectrogram - save image as
7) for radiacode spectrogram conversion use ```rcspg.html```

Usage (advanced, mostly for large spectrograms):
1) install nodejs - https://nodejs.org/
2) download repository
3) save delta-spectrum file on computer
4) open folder containing waterfall.js in console
5) run ```node waterfall.js <delta spectrum file>```, for example ```node waterfall.js "sample-data/nano-3/Spectrum-2024-09-29_20-48-55-Spectrum_auto.txt"```
6) open generated ```Spectrum-2024-09-29_20-48-55-Spectrum_auto.html``` in web browser
7) right mouse click on spectrogram - save image as

Parameters:
1) ```-rc X``` reduce channel count (spectrogram width) by provided factor (X), i.e. ```--rc 8``` makes 1024 channes from 8192, default is 8
2) ```-rs X``` reduce spectrum count (spectrogram height) by provided factor (X), i.e. ```--rs 2``` makes 100 spectrums from 200, default is 1
3) ```--rcspg``` outputs data in radiacode spectrogram format

Combining spectrums into single one (if you want to examine some part of spectrogram in becqmoni, for instance):

run ```node combine.js <delta spectrum file> -from-index X -to-index Y```, for example ```node combine.js "sample-data/nano-3/Spectrum-2024-09-29_20-48-55-Spectrum_auto.txt" -from-index 270 -to-index 330```

```<delta spectrum file name>_combined.txt``` is created

Important: from and to indices when -rs parameter is 1, channel count is unchanged
