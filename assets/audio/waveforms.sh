#!/bin/bash

#brew install jq
#brew tap bbc/audiowaveform
#brew install audiowaveform

#
#
#


# TMP FOLDER FOR WAVEFORMS
if [ ! -d "./audio_waveforms/" ]
then
	mkdir './audio_waveforms';
fi
#

# GENERATE WAVEFORMS
for i in *.mp3; do
	[ -f "$i" ] || break
	NAME=${i%.*};
	#
	if [[ $NAME == *"Baseline"* ]]; then
	  break
	fi
	#
	echo "creating waveform for:  $NAME";
	audiowaveform -i $i -o "./audio_waveforms/$NAME.json" -b 8 -z 256;
done
#


# COMBINE ALL WAVEFORMS
for i in ./audio_waveforms/*; do y=${i%.json}; echo -n "\"${y##*/}\":"; cat "$i"; echo ","; done > allwaveforms.json
sed -i allwaveforms.json '1s;^;{;' allwaveforms.json
echo "}" >> allwaveforms.json #NOTE: Please remove trailing comma before adding this bracket
rm allwaveforms.jsonallwaveforms.json
rm -r ./audio_waveforms
#