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
 * class:   BackgroundAudio
 * desc:
 * ------------------------------------------------
 */
osmo.BackgroundAudio = class {

  constructor(){
    console.log('osmo.BackgroundAudio - constructor');

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
    this.allBackgroundTrackPaths = [];
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
    console.log('osmo.BackgroundAudio - loadAudio');
    //
    let self = this;
    let base_path = './assets/audio/tracks/Baseline_';
    let urls = {};
    // Load base tracks
    for(let i=0; i < 7; i++){
      let index = (i+1);
      let path = base_path + index + '.mp3';
      this.allBackgroundTrackPaths.push(path);
      //
      //
      let bplayer = new this.TONE.Player({
        url: path,
        loop: true,
        fadeOut: 10,
        fadeIn: 2,
        onload: function(){
          //
          self.allTracksCount++;
          console.log(self.allTracksCount + ' Loaded audio file: ' + path);
          //
          if(self.allTracksCount == self.allBackgroundTrackPaths.length)
            osmo.scroll.loaded.backgroundaudio = true;
          //
        }
      }).toDestination();
      //
      //
      this.baseTracks['base'+index] = bplayer;
    }
    //
    // the intro player
    let intro_path = './assets/audio/loops/-1.mp3';
    this.allBackgroundTrackPaths.push(intro_path);
    this.introTrack = new this.TONE.Player({
      url: intro_path,
      loop: true,
      loopStart: 0,
      loopEnd: 20,
      fadeOut: 4,
      fadeIn: 2,
      onload: function(){
        self.allTracksCount++;
        console.log(self.allTracksCount + ' Loaded audio file: ' + intro_path);
      }
    }).toDestination();
    //
    //
    //
  }

};