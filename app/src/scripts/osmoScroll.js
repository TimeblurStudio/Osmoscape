/*global osmo:true $:true*/

'use strict';
export default class {}

//
//
import $ from 'jquery';
import paper from 'paper';
import tone from 'tone';
//
import {} from './visuals/movingStars';

window.osmo = window.osmo || {};
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

		// Setup TONE
		osmo.scroll.TONE = tone;

		// Scroll instance
		osmo.mstars = new osmo.movingStars();
		osmo.mstars.init();

		//this.addBackground();

		// Draw PAPER
		paper.view.draw();

		//
		// Update on paper events
		//
		paper.view.onFrame = function(event) {
			osmo.mstars.update(event);
		};

		paper.view.onMouseMove = function(event) {
			osmo.mstars.mouseMoved(event);
		};

		paper.view.onKeyDown = function(event) {
			osmo.mstars.keyDown(event);
		};

	}

	/**
	 * ------------------------------------------------
	 * addBackground
	 * ------------------------------------------------
	 */
	addBackground(){
		//
		var rect = new paper.Path.Rectangle({
		    point: [0, 0],
		    size: [paper.view.size.width, paper.view.size.height],
		    strokeColor: 'black',
		    fillColor: 'black'
		});
		rect.sendToBack();
	}


};