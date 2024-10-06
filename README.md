# atomspectra-waterfall

Simplest waterfall image creator for atom spectra delta file (starting from atomspectra 6.6.15). For older version - https://github.com/Maksim-Bartoshyk/atomspectra-waterfall/releases/tag/AS-6.6.14

Provided as is, use at your own risk. This software is not sertified as a measurement tool, any results obtained with this software could not be used for official statements, conclusions or decisions.

Usage (simple, might work on mobile/tablet as well - check files in ```offline``` folder):
1) download repository
2) save delta-spectrum file on computer
3) open ```waterfall.html``` file in browser
4) upload spectrogram file
5) apply spectrum/channel binning
6) right mouse click on spectrogram - save image as
7) for radiacode spectrogram conversion use ```rcspg.html```

Usage (advanced, mostly for large spectrograms):
1) install nodejs - https://nodejs.org/
2) download repository
3) save delta-spectrum file on computer
4) open folder containing waterfall.js in console
5) run ```node waterfall-cli.js <delta spectrum file>```, for example ```node waterfall-cli.js "sample-data/nano-3/Spectrum-2024-09-29_20-48-55-Spectrum_auto.txt"```
6) open generated ```Spectrum-2024-09-29_20-48-55-Spectrum_auto.html``` in web browser
7) right mouse click on spectrogram - save image as

Parameters:
1) ```-channel-binning X``` reduce channel count (spectrogram width) by provided factor (X), i.e. ```-channel-binning 8``` makes 1024 channes from 8192, default is 8
2) ```-spectrum-binning X``` reduce spectrum count (spectrogram height) by provided factor (X), i.e. ```-spectrum-binning 2``` makes 100 spectrums from 200, default is 1
3) ```--rcspg``` outputs data in radiacode spectrogram format

Combining spectrums into single one (if you want to examine some part of spectrogram in [BecqMoni](https://github.com/Am6er/BecqMoni), for instance):

run ```node combine-cli.js <delta spectrum file> -from-index X -to-index Y```, for example ```node combine-cli.js "sample-data/nano-3/Spectrum-2024-09-29_20-48-55-Spectrum_auto.txt" -from-index 270 -to-index 330```

```<delta spectrum file name>_combined.txt``` is created

Index of spectrum is rendered next to timestamp on spectrogram.
