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
import {} from './Visuals/movingStars';
import {} from './Visuals/svgScroll';
import {} from './Visuals/testShapes';
import {} from './Interactions/PanAndZoom';

window.osmo = window.osmo || {};
window.$ = $;
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

		// Methods
		this.init;
		this.addBackground;
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
		osmo.scroll.paperHeight = canvas.offsetHeight ;

		// Setup TONE
		osmo.scroll.TONE = tone;

		// INTERACTIONS
		osmo.pzinteract = new osmo.PanAndZoom();
		osmo.pzinteract.init();


		// Star instance
		//osmo.mstars = new osmo.movingStars();
		//osmo.mstars.init();

		// data SVG instance
		osmo.datasvg = new osmo.svgScroll();
		osmo.datasvg.init();

		// test Visuals instance
		//osmo.test = new osmo.testShapes();
		//osmo.test.init();


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
		};

		paper.view.onKeyDown = function(event) {
			//osmo.mstars.keyDown(event);
		};
		//
		//
	}



};