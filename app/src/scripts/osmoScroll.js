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
import paper from 'paper';
import tone from 'tone';
import WaveformData from 'waveform-data';
import screenfull from 'screenfull/dist/screenfull';
//
import {} from './audio/backgroundAudio';
import {} from './visuals/dataSvg';
import {} from './visuals/legendSvg';
import {} from './visuals/audioWaveform';
import {} from './interactions/panAndZoom';
import {} from './interactions/navigation';
import {} from './interactions/legend';
import {} from './interactions/popup';
import {} from './interactions/speakerMicroInteraction';
//
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
		this.PAPER;
		this.TONE;
		this.WAVEFORMDATA;

		// ----------------
		// new Class objects/instance
		// ----------------
		// Screens
		this.MAINSCREEN;
		//
		this.paperHeight;
		this.paperWidth;
		this.splashWidth;
		this.mouseLoc;
		this.loaded = {  'HQimage' : false,  'svgdata': false  };
		this.Volume_db = { min : -12,  max: 6 };
		this.refPopupSize = { width: 1440.0,  height: 821.0  };
		//
		this.hitPopupMode = 'hovering';
		this.prevBoundsCenter = null;
		this.prevZoom = null;
		this.maskHitOptions = {
			segments: false,
			stroke: false,
			fill: true,
			tolerance: 5
		};
		//

		// Methods
		this.init;
		this.addBackground;
		this.loadHQ;
		this.loadRQ;
		this.loadMQ;
	}

	/**
   * ------------------------------------------------
   * Init
   * ------------------------------------------------
   */
	init(){
		console.log('osmo.Scroll - init');

		// Setup UI
		this.renderAnimations();
		this.addActionButtons();
		this.initModal(false);


		// Setup PAPER canvas
		let canvas = document.getElementById('main-scroll-canvas');
		paper.setup(canvas);
		osmo.scroll.PAPER = paper;
		osmo.scroll.paperHeight = canvas.offsetHeight;
		osmo.scroll.paperWidth = canvas.offsetWidth;

		// Setup LIBS
		osmo.scroll.TONE = tone;
		osmo.scroll.WAVEFORMDATA = WaveformData;

		// AUDIO
		osmo.bgaudio  = new osmo.backgroundAudio();
		osmo.bgaudio.loadAudio();

		// INTERACTIONS
		osmo.pzinteract = new osmo.panAndZoom();
		osmo.pzinteract.init();
		osmo.navinteract = new osmo.navigationInteraction();
		osmo.navinteract.init();

		// LEGEND
		osmo.legendsvg = new osmo.legendSvg();
		osmo.legendsvg.init();
		osmo.legendinteract = new osmo.legendInteraction();

		// POPUP
		osmo.popupinteract = new osmo.popupInteraction();
		osmo.popupinteract.init();
		//

		// Draw PAPER
		paper.view.draw();

		//
		// Custom Mouse follow
		document.addEventListener('mousemove', function(e) {
			osmo.scroll.mouseLoc = new osmo.scroll.PAPER.Point(e.pageX, e.pageY);
			let mouseX = e.pageX;
			let mouseY = e.pageY;
			//if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata)
			$('.cursor-pointer-wrapper').css('transform', 'translate3d('+mouseX+'px, '+mouseY+'px, 0px)');
		});

		document.addEventListener('mousemove', function(e) {
			let deltaX = e.movementX * -1;
			let deltaY = e.movementY;
			//
			if(!osmo.navinteract.isOnDiv){
				osmo.popupinteract.mouseMoved(deltaX, deltaY);
			}
		});

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
		// Update on paper events
		paper.view.onFrame = function(event) {
			window.meter.tick();
		};

		paper.view.onMouseMove = function(event) {
			if(!osmo.navinteract.isOnDiv)
				osmo.legendinteract.mouseMoved(event);
		};

		paper.view.onMouseDown = function(event) {
			if(!osmo.navinteract.isOnDiv)
				osmo.popupinteract.mouseClicked(event);
		};

		paper.view.onMouseUp = function(event) {
			if(!osmo.navinteract.isOnDiv)
				osmo.popupinteract.mouseUp(event);
		};
		//
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

	renderAnimations(){
		lottie.loadAnimation({
			container: document.getElementById('headphones'), // the dom element that will contain the animation
			renderer: 'svg',
			loop: true,
			autoplay: true,
			path: 'assets/12308-headphone.json' // the path to the animation json
		});
	}

	addActionButtons(){
		// INFO BUTTON
		$('#show-info').on('click', function(event) {
			/*
      var icon = $('#show-info');
      icon.toggleClass('on');
      if ( icon.hasClass('on') ) {
        console.log('modal to be opened');
        icon.text('close');
      } else {
        icon.text('info');
      }
      */
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
			}
			//
			console.log(screenfull);
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
   * map
   * desc : <ADD>
   * ------------------------------------------------
   */
	map( value, istart, istop, ostart, ostop ){
		return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	}

	/**
   * ------------------------------------------------
   * High Quality Image
   * ------------------------------------------------
   */
	loadHQ(){
		console.log('osmo.scroll.loadHQ - called');
		//
		let self = this;
		osmo.pzinteract.setMaxZoom(2);
		//
		let please_wait_spinner = '<div id="percentage" style="color: #b97941; font-weight: 400;"></div><br><div class="sk-three-bounce"><div class="sk-child sk-bounce1" style="background-color: #b97941"></div><div class="sk-child sk-bounce2" style="background-color: #b97941"></div><div class="sk-child sk-bounce3" style="background-color: #b97941"></div></div>';
		$('.pg-loading-html').empty();
		$('.pg-loading-html').append($.parseHTML( please_wait_spinner ));
		//
		/*
    //
    // APPROACH 1
    var downloadingImage = new Image();
    downloadingImage.onload = function(){
        console.log('Loaded HQ image');
        console.log(this.src);
        image.src = this.src;
        //
        osmo.datasvg = new osmo.dataSvg();
        osmo.datasvg.init('High');
        osmo.datasvg.initSplash(osmo.scroll.splashWidth);
        //
        osmo.navinteract.loadNav();
        osmo.navinteract.initNav();
        //
        //
        self.loaded.HQimage = true;
        osmo.datasvg.backgroundLayer.sendToBack();
        if(self.loaded.HQimage && self.loaded.svgdata){
          window.loading_screen.finish();
          osmo.bgaudio.start();
        }
    };
    downloadingImage.src = 'assets/images/SCROLL_cs6_ver23_APP_final_300ppi-HIGH.png';
    */
		//
		// APPROACH 2
		this.load_fetch_retry('assets/images/SCROLL_cs6_ver23_APP_final_300ppi-HIGH-or8.png', 3, 'High', 'HQscroll');
		//
		//
	}

	/**
   * ------------------------------------------------
   * Retina Quality Image
   * ------------------------------------------------
   */
	loadRQ(){
		console.log('osmo.scroll.loadRQ - called');
		//
		let self = this;
		osmo.pzinteract.setMaxZoom(4);
		//
		let please_wait_spinner = '<div id="percentage" style="color: #b97941; font-weight: 400;"></div><br><div class="sk-three-bounce"><div class="sk-child sk-bounce1" style="background-color: #b97941"></div><div class="sk-child sk-bounce2" style="background-color: #b97941"></div><div class="sk-child sk-bounce3" style="background-color: #b97941"></div></div>';
		$('.pg-loading-html').empty();
		$('.pg-loading-html').append($.parseHTML( please_wait_spinner ));
		//
		//
		/*
    //
    // APPROACH 1
    var downloadingImage = new Image();
    downloadingImage.onload = function(){
      //
      console.log('Loaded RQ image');
      console.log(this.src);
      image.src = this.src;
      //
      osmo.datasvg = new osmo.dataSvg();
      osmo.datasvg.init('Retina');
      osmo.datasvg.initSplash(osmo.scroll.splashWidth);
      //
      osmo.navinteract.loadNav();
      osmo.navinteract.initNav();
      //
      self.loaded.HQimage = true;
      osmo.datasvg.backgroundLayer.sendToBack();
      if(self.loaded.HQimage && self.loaded.svgdata){
        window.loading_screen.finish();
        osmo.bgaudio.start();
      }
    };
    downloadingImage.src = 'assets/images/SCROLL_cs6_ver23_APP_final_600ppi-RETINA.png';
    */
		//
		// APPROACH 2
		this.load_fetch_retry('assets/images/SCROLL_cs6_ver23_APP_final_600ppi-RETINA-or8.png', 3, 'Retina', 'RQscroll');
		//
	}


	/**
   * ------------------------------------------------
   * Mobile Quality Image
   * ------------------------------------------------
   */
	loadMQ(){
		console.log('osmo.scroll.loadMQ - called');
		//
		let self = this;
		osmo.pzinteract.setMaxZoom(2);
		//
		let image = document.getElementById('');
		/*
    //
    // APPROACH 1
    var downloadingImage = new Image();
    downloadingImage.onload = function(){
        //
        console.log('Loaded MQ image');
        console.log(this.src);
        image.src = this.src;
        //
        osmo.datasvg = new osmo.dataSvg();
        osmo.datasvg.init('Mobile');
        osmo.datasvg.initSplash(osmo.scroll.splashWidth);
        //
        osmo.navinteract.loadNav();
        osmo.navinteract.initNav();
        //
        self.loaded.HQimage = true;
        osmo.datasvg.backgroundLayer.sendToBack();
        if(self.loaded.HQimage && self.loaded.svgdata){
          window.loading_screen.finish();
          //osmo.bgaudio.start(); //Mandate to click on a start button to start audio interactions
        }
    };
    downloadingImage.src = 'assets/images/SCROLL_cs6_ver23_APP_final_150ppi-LOW.png';
    */
		//
		// APPROACH 2
		this.load_fetch_retry('assets/images/SCROLL_cs6_ver23_APP_final_150ppi-LOW-or8.png', 3, 'Mobile', 'MQscroll');
		//
	}


	/**
   * ------------------------------------------------
   * Fetch and load with retry
   * ref: https://dev.to/ycmjason/javascript-fetch-retry-upon-failure-3p6g
   * FIX ME!!!
   * Show indicator if loading fails
   * ------------------------------------------------
   */
	load_fetch_retry(url, n, type, typeID) {
		let self = this;
		console.log('Trying fetch count - ' + n);
		//
		return fetch(url).then(res => {
			if(!res.ok)  throw res.statusText;
			//
			console.log('Got scroll image data');
			self.onScrollData(res, type, typeID);
			//
		}).catch(function(error) {
			if (n === 1){
				$('.pg-loaded').html('<p style="color: #b97941">Failed to load main scroll. Please try later!</p>');
				throw error;
			}
			return self.load_fetch_retry(url, n - 1, type, typeID);
		});
		//
	}

	/**
   * ------------------------------------------------
   * On scroll data initilize interaction and start audio
   * ------------------------------------------------
   *
   */
	onScrollData(blob_data, type, typeID){
		//
		blob_data.blob()
			.then(blob => {
				//
				var reader  = new FileReader();
				reader.addEventListener('load', function () {
					//
					console.log('Loaded ' + type + ' image');
					let image = document.getElementById(typeID);
					image.src = reader.result;
					//
					osmo.datasvg = new osmo.dataSvg();
					osmo.datasvg.init(type);
					osmo.datasvg.initSplash(osmo.scroll.splashWidth);
					//
					osmo.audiowaveform  = new osmo.audioWaveform();
					osmo.audiowaveform.init();
					//
					osmo.scroll.loaded.HQimage = true;
					osmo.datasvg.backgroundLayer.sendToBack();
					// if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata){
					//   window.loading_screen.finish();
					//   osmo.bgaudio.start();
					// }
					//
				}, false);
				//
				reader.onerror = (error) => {
					console.log(error);
					console.error(this);
				};
				reader.readAsDataURL(blob);
				//
			})
			.catch(err => console.log(err));
		//
	}


};