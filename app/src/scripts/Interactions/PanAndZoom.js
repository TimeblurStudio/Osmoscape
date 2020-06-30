/*global osmo:true $:true*/


/*
	*ADD AUTHOUR AND LISCENSE*
*/

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:	PanAndZoom
 * desc:
 * ------------------------------------------------
 */
osmo.PanAndZoom = class {

	constructor(){
		console.log('osmo.PanAndZoom - constructor');

		// ----------------
		// Lib
		// ----------------
		this.PAPER = osmo.scroll.PAPER;

		//@private
		this.mousePos;

		// Methods
		this.init;
		this.update;
	}

	/**
	 * ------------------------------------------------
	 * init
	 * ------------------------------------------------
	 */
	init(){
		console.log('Initlaized Pan & Zoom');
		//
		$('#main-scroll-canvas').on('mousewheel', function(event) {
			let et = event.originalEvent;

			if(event.altKey){
				osmo.scroll.PAPER.view.zoom = osmo.pzinteract.changeZoom(osmo.scroll.PAPER.view.zoom, et.deltaY);
				event.preventDefault();
			}else{
				if(osmo.scroll.PAPER.view.zoom == 1){
					if(osmo.scroll.PAPER.view.center.y < osmo.scroll.paperHeight/2 + 1 && et.deltaY < 0)
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, et.deltaY, 1.05);
					else if(osmo.scroll.PAPER.view.center.y > osmo.scroll.paperHeight/2 - 1 && et.deltaY > 0)
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, et.deltaY, 1.05);
					else{
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, 0, 1.05);
					}
				}
				else{
					if((osmo.scroll.PAPER.view.center.y*osmo.scroll.PAPER.view.zoom - osmo.scroll.paperHeight/2) <= 0 && et.deltaY > 0){
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, 0, 1.05);
					}
					else if(osmo.scroll.PAPER.view.center.y*osmo.scroll.PAPER.view.zoom > (-osmo.scroll.paperHeight/2 + osmo.scroll.paperHeight*osmo.scroll.PAPER.view.zoom) && et.deltaY < 0){
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, 0, 1.05);
					}
					else{
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, et.deltaY, 1.05);
					}

				}
				event.preventDefault();
			}

		});
	}

	/**
	 * ------------------------------------------------
	 * changeCenter
	 * ------------------------------------------------
	 */
	changeCenter(oldCenter, deltaX, deltaY, factor){
		let offset = new this.PAPER.Point(deltaX, -deltaY);
    offset = offset.multiply(factor);
    oldCenter = oldCenter.add(offset);
    //
    return oldCenter;
	}

	/**
	 * ------------------------------------------------
	 * changeZoom
	 * ------------------------------------------------
	 */
	changeZoom(oldZoom, delta){
		let factor = 1.04;
		let newZoom = oldZoom;
		//
		if(delta < 0)
			newZoom = oldZoom * factor;
    if(delta > 0)
    	newZoom = oldZoom / factor;
    //
		if(newZoom <= 1)
			newZoom = 1;
		if(newZoom > 25)
			newZoom = 25;
		//
    return newZoom;
	}


};