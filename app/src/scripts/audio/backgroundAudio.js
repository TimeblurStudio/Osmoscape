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
 * class:   backgroundAudio
 * desc:
 * ------------------------------------------------
 */
osmo.backgroundAudio = class {

  constructor(){
    console.log('osmo.backgroundAudio - constructor');

    // ----------------
    // Lib
    // ----------------
    this.TONE = osmo.scroll.TONE;
    //
    //@private
    this.allTracksCount = 0;
    this.currentTrack;
    this.introTrack;
    this.baseTracks = {};
    //
  }


  start(){
    console.log('Starting the audio context');
    this.TONE.start();
    //
    this.currentTrack = 'intro';
    this.introTrack.start();
    //
  }

  loadAudio(){
    console.log('osmo.backgroundAudio - loadAudio');
    //
    let base_path = './assets/audio/tracks/Baseline_';
    let urls = {};
    // Load base tracks
    for(let i=0; i < 7; i++){
      let index = (i+1);
      let path = base_path + index + '.mp3';
      //
      //
      let bplayer = new this.TONE.Player({
        url: path,
        loop: true,
        fadeOut: 10,
        fadeIn: 2,
        onload: function(){
          this.allTracksCount++;
          console.log(this.allTracksCount);
        }
      }).toMaster();
      //
      //
      this.baseTracks['base'+index] = bplayer;
    }
    //
    // the intro player
    this.introTrack = new this.TONE.Player({
      url: './assets/audio/loops/-1.mp3',
      loop: true,
      loopStart: 0,
      loopEnd: 20,
      fadeOut: 4,
      fadeIn: 2,
      onload: function(){
        allTracksCount++;
        console.log(this.allTracksCount);
      }
    }).toMaster();
    //
    //
    //
  }

};