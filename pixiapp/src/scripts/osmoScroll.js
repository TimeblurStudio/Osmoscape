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

//
//
import lottie from 'lottie-web';
import 'jquery-mousewheel';
import 'jquery-ui';
import * as PIXI from 'pixi.js';
import '@pixi/math-extras';
import tone from 'tone';
import WaveformData from 'waveform-data';
import screenfull from 'screenfull/dist/screenfull';
import { TweenMax, Power4 } from 'gsap';
import { Cull } from '@pixi-essentials/cull';
//
//
import {} from './audio/backgroundAudio';
import {} from './data/dataSvg';
import {} from './interactions/navigation';
import {} from './interactions/panAndZoom';
import {} from './interactions/speakerMicroInteraction';
//
window.osmo = window.osmo || {};
//
//
/**
 * ------------------------------------------------
 * class:  Scroll
 * desc: This is where you initialize necessary components and manage app states
 * ------------------------------------------------
 */
osmo.Scroll = class {

  constructor(){
    console.log('osmo.Scroll - constructor');

    // ----------------
    // Lib
    // ----------------
    this.PIXI;
    this.TONE;
    this.WAVEFORMDATA;
    this.TWEENMAX;
    this.POWER4;

    // ----------------
    // new Class objects/instance
    // ----------------
    // Screens
    this.MAINSCREEN;
    //
    this.mainApp;
    this.mainStage;
    this.mainScroll;
    this.mainScrollScale;
    //
    this.navContainer;
    this.legendContainer;
    this.maskContainer;
    
    //
    this.pixiHeight;
    this.pixiWidth;
    this.splashWidth;
    this.mouseLoc;
    this.loaded = {  'HQimage' : false,  'svgdata': true  };
    this.pixiScale = 2;
    this.Volume_db = { min : -12,  max: 6 };
    this.refPopupSize = { width: 1440.0,  height: 821.0  };
    //
    this.hitPopupMode = 'hovering';
    this.prevBoundsCenter = null;
    this.prevZoom = null;
    //
    this.started = false;
    
    // Methods
    this.init;
    this.initPixi;
    this.initModal;
    this.start;
    this.addActionButtons;
    this.loadHQ;
    this.loadMQ;
  }

  /**
   * ------------------------------------------------
   * Init
   * ------------------------------------------------
   */
  init(){
    console.log('osmo.Scroll - init');

    // Setup LIBS
    osmo.scroll.PIXI = PIXI;
    osmo.scroll.TONE = tone;
    osmo.scroll.WAVEFORMDATA = WaveformData;
    osmo.scroll.TWEENMAX = TweenMax;
    osmo.scroll.POWER4 = Power4;

    // Setup UI
    this.initPixi();
    this.renderAnimations();
    this.addActionButtons();
    this.initModal(false);

    // AUDIO
    osmo.bgaudio  = new osmo.backgroundAudio();
    osmo.bgaudio.loadAudio();

    // INTERACTIONS
    osmo.pzinteract = new osmo.panAndZoom();
    osmo.pzinteract.init();
    osmo.navinteract = new osmo.navigationInteraction();
    osmo.navinteract.init();

    // Custom mouse hide/show
    // HEAD ACTIONS
    $('.head-actions').mouseenter(function(){
      document.body.style.cursor = 'auto';
      $('.cursor-pointer-wrapper').css('opacity', 0);
    });
    $('.head-actions').mouseleave(function(){
      document.body.style.cursor = 'none';
      $('.cursor-pointer-wrapper').css('opacity', 1);
    });
    // NAVIGATION
    $('.nav').mouseenter(function(){
      document.body.style.cursor = 'auto';
      $('.cursor-pointer-wrapper').css('opacity', 0);
    });
    $('.nav').mouseleave(function(){
      document.body.style.cursor = 'none';
      $('.cursor-pointer-wrapper').css('opacity', 1);
    });


    //
    // Update on events
    //
    this.mainApp.ticker.add(function(delta) {
      window.meter.tick();
      //obtain the position of the mouse on the stage
      //let mousePosition = app.renderer.plugins.interaction.mouse.global;
      //
    });
    //
  }

  /**
   * ------------------------------------------------
   * start - after button press 
   * ------------------------------------------------
   */
  start(){
    console.log('Starting the audio context');
    this.TONE.start();
    //
    //currentTrack = 'intro';
    //introTrack.start();
    //
    this.started = true;
    $('#start-btn').hide();
    //
    //
    let please_wait_spinner = '<div id="percentage" style="color: #b97941; font-weight: 400;"></div><br><div class="sk-three-bounce"><div class="sk-child sk-bounce1" style="background-color: #b97941"></div><div class="sk-child sk-bounce2" style="background-color: #b97941"></div><div class="sk-child sk-bounce3" style="background-color: #b97941"></div></div>';
    $('.pg-loading-html').empty();
    $('.pg-loading-html').append($.parseHTML( please_wait_spinner ));
    //
    this.loadHQ();
    //
    window.loading_screen.finish();
  }

  /**
   * ------------------------------------------------
   * initPixi
   * ------------------------------------------------
   */
  initPixi(){
    let self = this;
    // Setup PIXI canvas
    let canvas = document.getElementById('main-scroll-canvas');
    self.pixiHeight = canvas.offsetHeight;
    self.pixiWidth = canvas.offsetWidth;
    
    //Create a Pixi Application
    PIXI.utils.skipHello();
    let app = new PIXI.Application({
      width: self.pixiWidth*self.pixiScale,
      height: self.pixiHeight*self.pixiScale,
      antialias: true,
      backgroundAlpha: 0,
      view: canvas
    }
    );
    self.mainApp = app;
    self.mainStage = self.mainApp.stage;
    self.mainStage.scale.set(self.pixiScale, self.pixiScale);
    //
    //
    // CULLING
    //
    // Cull the entire scene graph, starting from the stage
    const cull = new Cull({ recursive: true, toggle: 'renderable' });
    cull.add(self.mainStage);
    // "prerender" is fired right before the renderer draws the scene
    self.mainApp.renderer.on('prerender', () => {
      // Cull out all objects that don't intersect with the screen
      cull.cull(self.mainApp.renderer.screen);
    });

    self.navContainer = new PIXI.Container();
    self.legendContainer = new PIXI.Container();
    self.maskContainer = new PIXI.Container();
    //
    self.navContainer.visible = false;
    self.legendContainer.visible = false;
    //
    //self.mainStage.addChild(self.backgroundContainer, self.navContainer, self.legendContainer, self.maskContainer);
    //

  }

  /**
   * ------------------------------------------------
   * initModal
   * ------------------------------------------------
   */
  initModal(start_opened){
    var modal = document.querySelector('.modal');
    var closeButton = document.querySelector('.close-button');
    let self = this;

    function windowOnClick(event) {
      if (event.target === modal) {
        self.toggleModal();
      }
    }
    //
    closeButton.addEventListener('click', self.toggleModal);
    window.addEventListener('click', windowOnClick);
    //
    $(document).keydown(function(event) {
      if (event.keyCode == 27) {
        self.toggleModal();
      }
    });
    //
    if(start_opened)
      self.toggleModal();
  }

  toggleModal() {
    //
    var modal = document.querySelector('.modal');
    modal.classList.toggle('show-modal');
    //
  }

  /**
   * ------------------------------------------------
   * render lottie - headphone
   * ------------------------------------------------
   */
  renderAnimations(){
    lottie.loadAnimation({
      container: document.getElementById('headphones'), // the dom element that will contain the animation
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/12308-headphone.json' // the path to the animation json
    });
  }

  /**
   * ------------------------------------------------
   * Action Buttons
   * ------------------------------------------------
   */
  addActionButtons(){
    // INFO BUTTON
    $('#show-info').on('click', function(event) {
      osmo.scroll.toggleModal();
    });

    // FULLSCREEN BUTTON
    $('#enter-fullscreen').on('click', function(event) {
      var icon = $('#enter-fullscreen');
      icon.toggleClass('on');
      if ( icon.hasClass('on') ) {
        console.log('screenfull to be enabled');
        icon.text('fullscreen_exit');
      } else {
        icon.text('fullscreen');
        //window.location.reload(true);
      }
      //
      screenfull.toggle();
      //
    });

    //
    // SPEAKER
    osmo.smi = new osmo.speakerMicroInteraction();
    osmo.smi.init();
    //
    //
  }


  /**
   * ------------------------------------------------
   * High Quality Image
   * ------------------------------------------------
   */
  loadHQ(){
    console.log('osmo.scroll.loadHQ - called');
    console.log('loading High Quality Image');
    //
    let self = this;
    //osmo.pzinteract.setMaxZoom(2);
    //
    //load an image and run the `setup` function when it's done
    let HQpath = './assets/images/SCROLL_cs6_ver23_APP_final_150ppi-LOW-';
    osmo.scroll.PIXI.Loader.shared
      .add(HQpath+'01-or8.png')
      .add(HQpath+'02-or8.png')
      .load(function(){
        console.log('Loaded HQ image');
        //
        self.onScrollData(HQpath);
        //
      });

  }


  /**
   * ------------------------------------------------
   * On scroll data initilize interaction and start audio
   * ------------------------------------------------
   *
   */
  onScrollData(_path){
    //
    //
    osmo.datasvg = new osmo.dataSvg();
    osmo.datasvg.init('High');
    osmo.datasvg.initSplash(osmo.scroll.splashWidth);
    osmo.datasvg.initSVGscroll(_path);
    /*
    osmo.audiowaveform  = new osmo.audioWaveform();
    osmo.audiowaveform.init();
    */
    osmo.scroll.loaded.HQimage = true;
    //
    //
    osmo.navinteract.loadNav();
    osmo.navinteract.initNav();
    //
    /*
    if(allTracksCount == 8){
      //
      $('#status').text('Loaded');
      $('#status').show();
      $('#start-btn').show();
      setInterval(function(){ $('#status').hide();  }, 2000);
    }else{
      //
      $('#start-btn').hide();
      let waitTillTracksLoad = setInterval(function(){
        if(allTracksCount == 8 && loaded.HQimage && loaded.svgdata){
          console.log('Total tracks loaded = ' + allTracksCount);
          //
          clearInterval(waitTillTracksLoad);
          $('#status').text('Loaded');
          $('#status').show();
          $('#start-btn').show();
          if(performance_test){
            $('#performance-stats table').append('<tr> <td>App Ready</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
            $('#performance-stats table').append('<tr> <td>-----</td> <td>-----</td> <td>-----</td></tr>');
          }
          setInterval(function(){ $('#status').hide();  }, 2000);
        }else{
          console.log('Waiting for data to complete loading -- allTracks: ' + allTracksCount + ' HQimage: ' + loaded.HQimage + ' SVGdata: ' + loaded.svgdata );
        }
      },2000);
    }
    */
    //backgroundContainer.sendToBack();
    //
    //osmo.datasvg.backgroundLayer.sendToBack();
    if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata){
      window.loading_screen.finish();
      osmo.bgaudio.start();
    }
    //
  }


  /**
   * ------------------------------------------------
   * map
   * desc : <ADD>
   * ------------------------------------------------
   */
  map( value, istart, istop, ostart, ostop ){
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
  }


};