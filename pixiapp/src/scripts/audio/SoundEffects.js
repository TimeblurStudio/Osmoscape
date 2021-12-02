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
    this.grainplayer;
    this.pitchshift;
    this.vibrato;
    this.delay;
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
  }

  /**
   * ------------------------------------------------
   * Init
   * ------------------------------------------------
   */
  init(){
    console.log('osmo.SoundEffects - init');
    //
    this.crossfade = new this.TONE.CrossFade({fade : 0.0});
    this.player = new this.TONE.Player({loop : true});
    this.grainplayer = new this.TONE.GrainPlayer({loop : true});
    this.pitchshift = new this.TONE.PitchShift();
    this.vibrato = new this.TONE.Vibrato();
    this.delay = new this.TONE.Delay();
    //
    this.makeEffectChain();
    this.setDefaultParameterRange();
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
  }

  /**
   * ------------------------------------------------
   * Set default paramter range
   * ------------------------------------------------
   */
  setDefaultParameterRange() {
    this.delayRange = (0.6 - 0.01);
    this.delayMin = 0.01;
    this.freqRange = (10 - 0.1);
    this.freqMin = 0.1;
    this.depthRange = (1 - 0);
    this.depthMin = 0;
    this.pitchRange = (12 + 12);
    this.pitchMin = -12;
    this.detuneRange = (12 + 12);
    this.detuneMin = -12;
    this.grainSizeRange = (3 - 0.01);
    this.grainSizeMin = 0.01;
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
  changeParameters(np) {
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
    this.grainplayer.loopStart = np.ny * this.loopStartRange + this.loopStartMin;
    this.grainplayer.loopEnd = np.nx * this.loopEndRange + this.loopEndMin;
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
    //
    this.grainplayer.buffer = currentBuffer; 
    this.player.buffer = currentBuffer;
    //
    this.player.start();
    this.grainplayer.start();
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
  }

};