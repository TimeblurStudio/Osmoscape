/*global osmo:true $:true*/

'use strict';
export default class {}

//
//
import $ from 'jquery';
import 'jquery-mousewheel';
import paper from 'paper';
import tone from 'tone';
//
import {} from './Visuals/DataSvg';
import {} from './Visuals/LegendSvg';
import {} from './Interactions/PanAndZoom';
import {} from './Interactions/Navigation';
import {} from './Interactions/Legend';
import {} from './Interactions/Popup';
//
//
window.osmo = window.osmo || {};
window.$ = $;
//
//
/**
 * ------------------------------------------------
 * class:	Scroll
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

		// ----------------
		// new Class objects/instance
		// ----------------
		// Screens
		this.MAINSCREEN;
		//
		this.paperHeight;
		this.paperWidth;
		this.splashWidth;
		this.loaded = {	'HQimage' : false,	'svgdata': false	};
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

		// Setup PAPER canvas
		let canvas = document.getElementById('main-scroll-canvas');
		paper.setup(canvas);
		osmo.scroll.PAPER = paper;
		osmo.scroll.paperHeight = canvas.offsetHeight;
		osmo.scroll.paperWidth = canvas.offsetWidth;

		// Setup TONE
		osmo.scroll.TONE = tone;

		// INTERACTIONS
		osmo.pzinteract = new osmo.PanAndZoom();
		osmo.pzinteract.init();
		osmo.navinteract = new osmo.NavigationInteraction();
		osmo.navinteract.init();

		// LEGEND
		osmo.legendsvg = new osmo.LegendSvg();
		osmo.legendsvg.init();
		osmo.legendinteract = new osmo.LegendInteraction();

		// POPUP & AUDIO
		//
		osmo.popupinteract = new osmo.PopupInteraction();
		osmo.popupinteract.init();
		//

		// Draw PAPER
		paper.view.draw();

		//
		// Update on paper events
		//
		paper.view.onFrame = function(event) {
			//osmo.mstars.update(event);
		};

		paper.view.onMouseMove = function(event) {
			//osmo.mstars.mouseMoved(event);
			osmo.legendinteract.mouseMoved(event);
		};

		paper.view.onMouseDown = function(event) {
			//osmo.mstars.mouseMoved(event);
			osmo.popupinteract.mouseClicked(event);
		};



		paper.view.onKeyDown = function(event) {
			//osmo.mstars.keyDown(event);
		};
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
	  //
	  let self = this;
	  osmo.pzinteract.setMaxZoom(2);
	  //
	  let please_wait_spinner = '<div id="percentage" style="color: #b97941; font-weight: 400;"></div><br><div class="sk-three-bounce"><div class="sk-child sk-bounce1" style="background-color: #b97941"></div><div class="sk-child sk-bounce2" style="background-color: #b97941"></div><div class="sk-child sk-bounce3" style="background-color: #b97941"></div></div>';
  	$('.pg-loading-html').empty();
  	$('.pg-loading-html').append($.parseHTML( please_wait_spinner ));
	  //
	  let image = document.getElementById('HQscroll');
	  var downloadingImage = new Image();
	  downloadingImage.src = 'assets/images/SCROLL_cs6_ver23_APP_final_300ppi-HIGH.png';
	  downloadingImage.onload = function(){
	  		console.log('Loaded HQ image');
	      image.src = this.src;
	      //
	      osmo.datasvg = new osmo.DataSvg();
	      osmo.datasvg.init('High');
	      osmo.datasvg.initSplash(osmo.scroll.splashWidth);
	      //
	      osmo.navinteract.loadNav();
	      osmo.navinteract.initNav();
	      //
	      //
	      self.loaded.HQimage = true;
				osmo.datasvg.backgroundLayer.sendToBack();
	      if(self.loaded.HQimage && self.loaded.svgdata)
	      	window.loading_screen.finish();
	  };
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
	  let image = document.getElementById('RQscroll');
	  var downloadingImage = new Image();
	  downloadingImage.src = 'assets/images/SCROLL_cs6_ver23_APP_final_600ppi-RETINA.png';
	  downloadingImage.onload = function(){
  		console.log('Loaded RQ image');
      //
      image.src = this.src;
    	//
      osmo.datasvg = new osmo.DataSvg();
			osmo.datasvg.init('Retina');
      osmo.datasvg.initSplash(osmo.scroll.splashWidth);
      //
      osmo.navinteract.loadNav();
      osmo.navinteract.initNav();
      //
      self.loaded.HQimage = true;
      osmo.datasvg.backgroundLayer.sendToBack();
      if(self.loaded.HQimage && self.loaded.svgdata)
      	window.loading_screen.finish();
	  };
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
	  let image = document.getElementById('MQscroll');
	  image.src = this.src;
	  var downloadingImage = new Image();
	  downloadingImage.onload = function(){
	  		console.log('Loaded MQ image');
	      //
	      osmo.datasvg = new osmo.DataSvg();
				osmo.datasvg.init('Mobile');
	      osmo.datasvg.initSplash(osmo.scroll.splashWidth);
	      //
	      osmo.navinteract.loadNav();
	      osmo.navinteract.initNav();
	      //
	      self.loaded.HQimage = true;
				osmo.datasvg.backgroundLayer.sendToBack();
	      if(self.loaded.HQimage && self.loaded.svgdata)
	      	window.loading_screen.finish();
	  };
	  downloadingImage.src = 'assets/images/SCROLL_cs6_ver23_APP_final_300ppi-HIGH.png';
	}

};