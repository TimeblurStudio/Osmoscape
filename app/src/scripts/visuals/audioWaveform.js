/*global osmo:true $:true*/

/**
 * ------------------------------------------------
 * AUTHOR: Mike Cj (mikecj184)
 * Copyright 2020 - 2021 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:  audioWaveform
 * desc:
 * ------------------------------------------------
 */
osmo.audioWaveform = class {

	constructor(){
		console.log('osmo.audioWaveform - constructor');

		// ----------------
		// Lib
		// ----------------
		this.WAVEFORMDATA = osmo.scroll.WAVEFORMDATA;
		//
		//@private
		this.allWaveformData = {};
		//
	}

	init(){
		console.log('osmo.audioWaveform - init');
		let self = this;
		//
		fetch('assets/audio/allwaveforms.json')
			.then(response => response.json())
			.then(function(json){
				//
				self.allWaveformData = json;
				console.log('Waveform data');
				let i = 0;
				Object.keys(self.allWaveformData).forEach(key => {
					//console.log(key, self.allWaveformData[key]);
					//
					let dp = self.allWaveformData[key];
					let index = i+1;
					i++;
					//
					//
					const waveform = self.WAVEFORMDATA.create(dp);
					//console.log(`Waveform ${dp} has ${waveform.channels} channels`);
					//console.log(`Waveform ${dp} has length ${waveform.length} points`);
					//
					let canvas = document.createElement('canvas');
					canvas.id = index+'_waveform';
					canvas.width = 350;
					canvas.height = self.scaleY(1.0, 180);
					canvas.style.display = 'none';
					//console.log('Added ' + index+'_waveform' + ' of dimension '+ canvas.width + ' ' + canvas.height);
					//
					const ctx = canvas.getContext('2d');
					ctx.beginPath();
					const channel = waveform.channel(0);
					// Loop forwards, drawing the upper half of the waveform
					for (let x = 0; x < waveform.length; x++) {
						const val = channel.max_sample(x);
						ctx.lineTo(x + 0.5, self.scaleY(val*8, canvas.height));
					}
					// Loop backwards, drawing the lower half of the waveform
					for (let x = waveform.length - 1; x >= 0; x--) {
						const val = channel.min_sample(x);
						ctx.lineTo(x + 0.5, self.scaleY(val*8, canvas.height));
					}
					ctx.closePath();
					ctx.strokeStyle = '#fff';
					ctx.fillStyle = '#b97941';
					ctx.stroke();
					ctx.fill();
					//
					if(osmo.legendsvg.datasets[key] != undefined){
						if(osmo.legendsvg.datasets[key].audiofile != undefined){
							//
							var sound = document.createElement('audio');
							sound.id = index+'_audio';
							sound.controls = 'controls';
							//
							sound.src = osmo.legendsvg.datasets[key].audiofile;
							sound.type = 'audio/mp3';
							sound.style.display = 'none';
							//
							document.getElementById('focused_waveforms').appendChild(canvas);
							document.getElementById('focused_waveforms').appendChild(sound);
							//
						}
					}
					//
					//
				});
				//
				//$('.draggable').show();
			});
		//
	}

	scaleY(amplitude, height) {
		const range = 256;
		const offset = 128;

		return height - ((amplitude + offset) * height) / range;
	}

};