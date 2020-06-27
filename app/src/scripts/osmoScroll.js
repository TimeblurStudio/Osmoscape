/*global osmo:true $:true*/

'use strict';
export default class {}

import $ from 'jquery';
import paper from 'paper';
import tone from 'tone';

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

		// Draw PAPER
		this.PAPER.view.draw();

		/**
		 * ------------------------------------------------
		 * Update loop
		 * ------------------------------------------------
		 */
		paper.view.onFrame = function(event) {
			// Frame updates will be added here
		};

	}

	/*
	 * ------------------------------------------------
	 * Some function
	 * ------------------------------------------------
	 */
	 someFunction(){

	 }

};