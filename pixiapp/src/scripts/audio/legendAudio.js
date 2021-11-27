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
 * class:   legendAudio
 * desc:
 * ------------------------------------------------
 */
osmo.legendAudio = class {

  constructor(){
    console.log('osmo.legendAudio - constructor');

    // ----------------
    // Lib
    // ----------------
    this.TONE = osmo.scroll.TONE;
    //
    //@private
    //
    this.allTracksLoadedCount = 0;
    this.allAudioPaths = [];
    this.audioPlayerInstances = {};
  }

  loadAudio(){
    console.log('osmo.legendAudio - loadAudio');
    //
    let self = this;
    //
    // Load loops
    for (let id in osmo.scroll.datasets){
      console.log('Load audio for ' + id);
      let path = osmo.scroll.datasets[id].audiofile;
      this.allAudioPaths.push(path);
      //
      //
      let player = new this.TONE.Player({
        url: path,
        loop: true,
        fadeOut: 1,
        fadeIn: 1,
        onload: function(){
          self.allTracksLoadedCount++;
          console.log(self.allTracksLoadedCount + ' Loaded audio file: ' + path);
          //
          if(self.allTracksLoadedCount == Object.keys(osmo.scroll.datasets).length)
            osmo.scroll.loaded.legendaudio = true;
          //
        }
      }).toMaster();
      //
      //
      this.audioPlayerInstances[id] = player;
    }
    //   
    //
  }

};