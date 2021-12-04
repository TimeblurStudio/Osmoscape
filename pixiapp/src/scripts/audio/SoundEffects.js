/*global osmo:true $:true*/

/**
 * ------------------------------------------------
 * AUTHOR: Himanshu erande (rndexe)
 * Copyright 2021 - 2022
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:   SoundEffects
 * desc:
 * ------------------------------------------------
 */
osmo.SoundEffects = class {

  constructor(){
    console.log('osmo.SoundEffects - constructor');
    //
    // ----------------
    // Lib
    // ----------------
    this.TONE = osmo.scroll.TONE;
    //
    //@private
    //
    this.crossfade;
    this.player;
    this.baseplayer;
    this.grainplayer;
    this.pitchshift;
    this.vibrato;
    this.delay;

    this.fft;
    //
    this.delayRange;
    this.delayMin;
    this.freqRange;
    this.freqMin;
    this.depthRange;
    this.depthMin;
    this.pitchRange;
    this.pitchMin;
    this.detuneRange;
    this.detuneMin;
    this.grainSizeRange;
    this.grainSizeMin;
    this.loopStartRange;
    this.loopStartMin;
    this.loopEndRange;
    this.loopEndMin;
    //
    this.currentFocus;
    this.effectData;
    this.csvData;
  }

  /**
   * ------------------------------------------------
   * Init
   * ------------------------------------------------
   */
  init(currentFocus){
    console.log('osmo.SoundEffects - init');
    //
    this.crossfade = new this.TONE.CrossFade({fade : 0.0});
    this.player = new this.TONE.Player({loop : true});
    this.baseplayer = new this.TONE.Player({loop : true});
    this.grainplayer = new this.TONE.GrainPlayer({loop : true});
    this.pitchshift = new this.TONE.PitchShift();
    this.vibrato = new this.TONE.Vibrato();
    this.delay = new this.TONE.Delay();
    this.fft = new this.TONE.FFT ({
      size: 16,
      smoothing : 0.75,
      normalRange : false
    });
    
    this.currentFocus = currentFocus;
    if ( 'effectData' in osmo.scroll.datasets[currentFocus]) {
      this.effectData = osmo.scroll.datasets[currentFocus].effectData;
    } else {
      this.effectData = null;
    } 
    if ( 'csvData' in osmo.scroll.datasets[currentFocus]) {
      this.csvData = osmo.scroll.datasets[currentFocus].csvData;
    } else {
      this.csvData = null;
    } 
    this.makeEffectChain();
    this.setParameterRange();
    //
  }

  /**
   * ------------------------------------------------
   * Make effect chain
   * ------------------------------------------------
   */
  makeEffectChain() {
    this.player.connect(this.crossfade.a);
    //
    this.grainplayer.connect(this.delay);
    this.delay.connect(this.vibrato);
    this.vibrato.connect(this.pitchshift);
    this.pitchshift.connect(this.crossfade.b);
    //
    this.crossfade.connect(this.TONE.getDestination());
    this.TONE.getDestination().connect(this.fft);
  }

  /**
   * ------------------------------------------------
   * Set default paramter range
   * ------------------------------------------------
   */
  setParameterRange() {
    
    if (this.effectData !== null && ('delay' in this.effectData))  {
      this.delayRange = (this.effectData.delay.max - this.effectData.delay.min);
      this.delayMin = this.effectData.delay.min;
    } else {
      this.delayRange = (0.6 - 0.01);
      this.delayMin = 0.01;
    }
    if (this.effectData !== null && ('freq' in this.effectData))  {
      this.freqRange = (this.effectData.freq.max - this.effectData.freq.min);
      this.freqMin = this.effectData.freq.min;
    } else {
      this.freqRange = (10 - 0.3);
      this.freqMin = 0.3;
    }
    if (this.effectData !== null && ('depth' in this.effectData))  {
      this.depthRange = (this.effectData.depth.max - this.effectData.depth.min);
      this.depthMin = this.effectData.depth.min;
    } else {
      this.depthRange = (1 - 0);
      this.depthMin = 0;
    }
    if (this.effectData !== null && ('pitchshift' in this.effectData))  {
      this.pitchRange = (this.effectData.pitchshift.max - this.effectData.pitchshift.min);
      this.pitchMin = this.effectData.pitchshift.min;
    } else {
      this.pitchRange = (24 + 24);
      this.pitchMin = -24;
    }
    if (this.effectData !== null && ('detune' in this.effectData))  {
      this.detuneRange = (this.effectData.detune.max - this.effectData.detune.min);
      this.detuneMin = this.effectData.detune.min;

    } else {
      this.detuneRange = (24 + 24);
      this.detuneMin = -24;
    }
    if (this.effectData !== null && ('grainsize' in this.effectData))  {
      this.grainSizeRange = (this.effectData.grainsize.max - this.effectData.grainsize.min);
      this.grainSizeMin = this.effectData.grainsize.min;
    } else {
      this.grainSizeRange = (3 - 0.01);
      this.grainSizeMin = 0.01;
    }

    this.loopStartRange = this.grainplayer.buffer.length/2;
    this.loopStartMin = 0;
    this.loopEndRange = this.grainplayer.buffer.length/2;
    this.loopEndMin = this.grainplayer.buffer.length/2;
  }

  /**
   * ------------------------------------------------
   * Change parameters
   * ------------------------------------------------
   */
  changeParameters(np,shape) {
    
    
    if (this.effectData!== null && ('invertY' in this.effectData)) {
      np.ny = 1.0 - np.ny;
      np.navg = (np.nx+np.ny)/2;
    }
    if (this.effectData!== null && ('invertX' in this.effectData)) {
      np.nx = 1.0 - np.nx;
      np.navg = (np.nx+np.ny)/2;
    }
    console.log('Shape hit: ',shape);
    if (shape && this.csvData!== null) {
      np.ny = this.csvData[shape];
      np.nx = this.csvData[shape];
      np.navg = this.csvData[shape];
    } else if (this.currentFocus === '1') {
      np.navg = (4*np.nx + np.ny)/5;
      np.nx = np.navg;
      np.ny = np.navg;
    }
    //
    this.delay.delayTime.rampTo(np.navg * this.delayRange + this.delayMin,0.1);
    //
    this.vibrato.frequency.rampTo(np.ny * this.freqRange + this.freqMin,0.1);
    this.vibrato.depth.rampTo(np.nx * this.depthRange + this.depthMin,0.1);
    //
    this.pitchshift.pitch = np.ny * this.pitchRange + this.pitchMin;
    //
    this.grainplayer.detune = np.nx * this.detuneRange + this.detuneMin;
    this.grainplayer.grainSize = np.ny * this.grainSizeRange + this.grainSizeMin; 
    //this.grainplayer.loopStart = np.ny * this.loopStartRange + this.loopStartMin;
    //this.grainplayer.loopEnd = np.nx * this.loopEndRange + this.loopEndMin;
    //
  }

  /**
   * ------------------------------------------------
   * Set new buffer
   * ------------------------------------------------
   */
  setNewBuffer(num, mp3url) {
    //
    let currentBuffer = osmo.legendaudio.audioPlayerInstances[num].buffer;
    let chapter = osmo.scroll.datasets[num].ch.slice(-1);
    console.log('chapter: ',chapter);
    //
    this.baseplayer.buffer = osmo.bgaudio.baseTracks['base'+chapter].buffer;
    this.grainplayer.buffer = currentBuffer; 
    this.player.buffer = currentBuffer;
    //
    this.baseplayer.volume.rampTo(this.effectData.baseVolume,2000);
    this.grainplayer.volume.rampTo(this.effectData.loopVolume,2000);
    this.player.volume.rampTo(this.effectData.loopVolume,2000);
    //
    this.player.start();
    this.grainplayer.start();
    this.baseplayer.start();
    //
  }

  /**
   * ------------------------------------------------
   * stop all audio players
   * ------------------------------------------------
   */
  stopPlayers(){
    this.player.stop();
    this.grainplayer.stop();
    this.baseplayer.stop();
  }

};
