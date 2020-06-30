/*global osmo:true $:true*/


/*
	*ADD AUTHOUR AND LISCENSE*
*/

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:	svgScroll
 * desc:
 * ------------------------------------------------
 */
osmo.svgScroll = class {

	constructor(){
		console.log('osmo.svgScroll - constructor');

		// ----------------
		// Lib
		// ----------------
		this.PAPER = osmo.scroll.PAPER;

		//@private
		this.position;
		this.mousePos;

		// Methods
		this.init;
		this.update;
		this.mouseMoved;
	}


	/**
	 * ------------------------------------------------
	 * Initalize stars
	 * ------------------------------------------------
	 */
	init(){
		console.log('osmo.svgScroll - initStars');

		//
		this.mousePos = this.PAPER.view.center;
		this.position = this.PAPER.view.center;
		//
		console.log('Loading SVG...');
		let svg_paths = this.PAPER.project.importSVG(
			'./data/SCROLL_cs6_ver23_APP_v2-01.svg'
			, function(){
				console.log('Completed loading data SVG.');
				console.log(svg_paths);
			});


	}

	/**
	 * ------------------------------------------------
	 * Frame updated
	 * ------------------------------------------------
	 */
	update(event){

	}

	/**
	 * ------------------------------------------------
	 * mouse and keypad interactions
	 * ------------------------------------------------
	 */
	mouseMoved(event){
		this.mousePos = event.point;
	}


};