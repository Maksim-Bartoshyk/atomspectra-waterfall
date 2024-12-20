# atomspectra-waterfall

Simplest waterfall image creator for atom spectra delta file (starting from atomspectra 6.6.15).

Provided as is, use at your own risk. This software is not sertified as a measurement tool, any results obtained with this software could not be used for official statements, conclusions or decisions.

# Usage (basic, might work on mobile/tablet as well):
1) download repository
2) save spectrogram file on computer
3) open ```offline/waterfall-offline.html``` file in browser, (Chrome is recommended)
4) upload spectrogram file
5) apply spectrum/channel binning
6) right mouse click on spectrogram - save image as
7) to convert your atomstectra spectrogram to radiacode format use ```offline/rcspg-ofline.html```

# Advanced Usage (mostly for large spectrograms, when broswer version fails to render it):
1) install nodejs - https://nodejs.org/
2) download repository
3) save spectrogram file on computer
4) open folder containing waterfall-cli.js in console
5) run ```node waterfall-cli.js <delta spectrum file>```, for example ```node waterfall-cli.js "sample-data/nano-3/Spectrum-2024-09-29_20-48-55-Spectrum_auto.txt"```
6) open generated ```Spectrum-2024-09-29_20-48-55-Spectrum_auto.html``` in web browser
7) right mouse click on spectrogram - save image as

Parameters:
1) ```-channel-binning X``` reduce channel count (spectrogram width) by provided factor (X), i.e. ```-channel-binning 8``` makes 1024 channes from 8192, default is 4
2) ```-spectrum-binning X``` reduce spectrum count (spectrogram height) by provided factor (X), i.e. ```-spectrum-binning 2``` makes 100 spectrums from 200, default is 1
3) ```--rcspg``` outputs data in radiacode spectrogram format

Combining spectrums into single one (if you want to examine some part of spectrogram in [BecqMoni](https://github.com/Am6er/BecqMoni), for instance):

run ```node combine-cli.js <delta spectrum file> -from-index X -to-index Y```, for example ```node combine-cli.js "sample-data/nano-3/Spectrum-2024-09-29_20-48-55-Spectrum_auto.txt" -from-index 270 -to-index 330```

```<delta spectrum file name>_combined.txt``` is created

Index of spectrum is rendered next to timestamp on spectrogram.

# Limitations
1) browser version could open spectrogram files up to 500 Mb in Chrome
2) spectrogram is rendered as a single image, large image like 8k channels * 20k spectrums might not be rendered, apply channel and spectrum binning to reduce image size
3) spectrogram data is stored in browser memory, working with large spectrograms might easily hit the 4 Gb limit, if do not have strong reason to view spectrum as 8k channels, apply channel binning during import (4x by default)

# How to create spectrogram file?
1) update [AtomSpectra](https://github.com/Am6er/AtomSpectra) application to version 6.6.15.112 or higher, you could download it from [software_kbradar](https://t.me/software_kbradar) Telegram channel
2) go to `settings`, set `Save delta every XX s` to desired interval, each new spectrogram row will be created with this interval
3) got to `spectrum -> set description`, enter description
4) start spectrum recording, after configured interval you will see message `Delta autosave function is started`, do NOT stop spectrum recording until spectrogram is done, `stop -> start` will create a new spectrogram file
5) if spectrogram is started from already collected spectrum (or loaded from file), it is stored as `base spectrum` in the beginning of spectrogram file
6) stop spectrum recording when needed, go to application folder and search for `Spectrogram-<spectrum description>-<date>-auto.txt`

Tip: if you want to check what is recorded to spectrogram at the moment:
1) go to `settings`, set `Diff time: XX s` to similar interval (or whatever you need), this setting is independent and does not affect `Save delta every XX s`
2) while recording is in progress, go to `spectrum -> spectrum change` setting, enable it
3) application starts collecting and displaying delta-spectrum (in green color) in memory for XX seconds (set in #1), once XX seconds elapsed, it will show spectrum for the latest XX seconds (sliding window)
4) disable `spectrum -> spectrum change` to view spectrum collected since recording start

# Available controls
## Upload
1) set initial channel binning: AtomSpectra writes to spectrogram all 8k channels which requires time and memory to process, if you do not have clear reasons to view spectrum as 8k channels, use binning during import to reduce cpu/memory usage and improve rendering performance
2) click upload button to open spectrogram file you want to render
3) observe spectrogram and CPS plot

6.6.14 checkbox: use it for compatibility with older AtomSpectra app (6.6.12 - 6.6.14), which stores each delta file as a separate spectrum.

## Save spectrogram or CPS plot
1) use right mouse click on either spectrogram or CPS plot -> `Save image as...`
2) CPS plot is saved in horizontal orientation, despite rendered vertically to be in sync with spectrogram

## Scale/Palette control
1) Lin/Sqrt/Log - applies linear/non-linear scale on top of color palette and CPS plot view, `Sqrt` is default
2) Palette selector - changes color palette, you could also use double click on spectrogram image, `Iron` is default
3) Scale max(%) - defines maximum value for a chosen color palette, i.e setting to 50% will use max palette color for any CPS higher than 50% of max CPS over whole spectrogram (values above 100 are allowed via manual typing)
4) Scale min(%) - same as max, but for minimum value (calculated relative to max CPS over whole spectrogram)
5) Blur waterfall image - applies blur effects, sometimes makes spectrogram more smooth

## Time axis
1) time axis displays two values: time and spectrum index. Spectrum index is always original index in source file (even with spectrum binning)
2) timezone dropdown - selects which timezone should be used on timespamps (AtomSpectra writes timestamps in UTC), default is Local (browser local, not local time where spectrogram was recorded)

## Binning
1) Spectrum bin - reduce spectrogram height by combining delta-spectrums, default is 1
2) Channel bin - reduce spectrogram width by combining channels, default is 16 (512 channels)

## Averaging
1) Moving avg(v) - moving average applied to spectrums (vertically on spectrogram), defines number of neighbors used, ex. 5 means that each point will be an average of 2 neighbors back, 3 ahead and point itself
2) Moving avg(h) - moving average applied to channels (horizontally on spectrogram), defines number of neighbors used, ex. 4 means that each point will be an average of 2 neighbors back, 2 ahead and point itself

## Base spectrum
1) Subtract base - subtracts base spectrum stored in spectrogram from each delta-spectrum, affects both spectrogram and CPS plot

## CPS plot range
CPS plot displays count rate for a specific range of channels.
1) CPS trend in channel range_1 - defines main range as [from channel index, to channel index]
'c' key + left mouse click - set channel under cursor as range_1 start
'c' key + right mouse click - set channel under cursor as range_1 end
2) Compare to CPS in channel range_2 - enables comparison mode, renders 3 plots:
  a. count rate in range_1
  b. count rate in range_2
  c. ratio of count rate in range_1 to count rate in range_2 (range_1/range_2)
'a' key + left mouse click - set channel under cursor as range_2 start
'a' key + right mouse click - set channel under cursor as range_2 end
3) Range_1 cps to map - click to generate .rctrk map file, count rate in selected range will be used as value for CPS channel (use if AtomSpectra configured to write GPS to each delta), .rctrk map could be imported to AtomSwift (Atom Dosimeter) application
4) Range_1/range_2 comparison to map - click to generate .rctrk map file, range_1/range_2 rate in selected range will be used as value for CPS channel (use if AtomSpectra configured to write GPS to each delta), .rctrk map could be imported to AtomSwift (Atom Dosimeter) application

## Spectrum preview and export
Preview shows spectrum combined from selected spectrogram range as [from delta index, to delta index], index is always original, despite binning applied
1) Preview spectrum in spectrorgam range - enables spectrum preview
's' key + left mouse click - set delta spectrum index under cursor as spectrum range start
's' key + right mouse click - set delta spectrum index under cursor as spectrum range end
2) Spg range as base - overrides base spectrum, sets it from selected spectrogram range
3) Spg range to file - exports spectrum combined from selected spectrogram range (with channel binning applied during spectrogram import)
