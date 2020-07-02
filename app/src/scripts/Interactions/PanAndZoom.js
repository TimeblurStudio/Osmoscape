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
		this.maxZoom = 1.5;

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
			event.preventDefault();
			// Pinch-Zoom
			// Tricky spec - https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
			if(et.ctrlKey){
				osmo.scroll.PAPER.view.zoom = osmo.pzinteract.changeZoom(osmo.scroll.PAPER.view.zoom, et.deltaY);
				/*
				let zoomObj = { zoomVal: osmo.scroll.PAPER.view.zoom };
				let tween = osmo.scroll.PAPER.Tween( zoomObj,
					{ zoomVal: osmo.scroll.PAPER.view.zoom },
					{ zoomVal: osmo.pzinteract.changeZoom(osmo.scroll.PAPER.view.zoom, et.deltaY) },
					1000
				);
				*/
				/*
				// Install event using on('update') method:
				tween.on('update', function(event) {
						console.log(event);
				    //factorText.content = 'factor: ' + event.factor.toFixed(2);
				});
				*/

				/*
				let bounds = osmo.scroll.PAPER.view.bounds;

		    if (bounds.x < 0) osmo.scroll.PAPER.view.center = osmo.scroll.PAPER.view.center.subtract(new osmo.scroll.PAPER.Point(bounds.x, 0));
		    if (bounds.y < 0) osmo.scroll.PAPER.view.center = osmo.scroll.PAPER.view.center.subtract(new osmo.scroll.PAPER.Point(0, bounds.y));

		    bounds = osmo.scroll.PAPER.view.bounds;
		    var
		        w = bounds.x + bounds.width,
		        h = bounds.y + bounds.height;

		    if (w > osmo.scroll.PAPER.view.viewSize.width) osmo.scroll.PAPER.view.center = osmo.scroll.PAPER.view.center.subtract(new osmo.scroll.PAPER.Point(w - osmo.scroll.PAPER.view.viewSize.width, 0));
		    if (h > osmo.scroll.PAPER.view.viewSize.height) osmo.scroll.PAPER.view.center = osmo.scroll.PAPER.view.center.subtract(new osmo.scroll.PAPER.Point(0, h - osmo.scroll.PAPER.view.viewSize.height));

				*/
			}else{
				let fac = 1.005/(osmo.scroll.PAPER.view.zoom*osmo.scroll.PAPER.view.zoom);
				if(osmo.scroll.PAPER.view.zoom == 1){
					if(osmo.scroll.PAPER.view.center.y < osmo.scroll.paperHeight/2 + 1 && et.deltaY < 0)
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, et.deltaY, fac);
					else if(osmo.scroll.PAPER.view.center.y > osmo.scroll.paperHeight/2 - 1 && et.deltaY > 0)
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, et.deltaY, fac);
					else{
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, 0, fac);
					}
				}
				else{
					if((osmo.scroll.PAPER.view.center.y*osmo.scroll.PAPER.view.zoom - osmo.scroll.paperHeight/2) <= 0 && et.deltaY > 0){
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, 0, fac);
					}
					else if(osmo.scroll.PAPER.view.center.y*osmo.scroll.PAPER.view.zoom > (-osmo.scroll.paperHeight/2 + osmo.scroll.paperHeight*osmo.scroll.PAPER.view.zoom) && et.deltaY < 0){
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, 0, fac);
					}
					else{
						osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, et.deltaY, fac);
					}

				}
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
    if(oldCenter.x < osmo.scroll.paperWidth/2)
    	oldCenter.x  = osmo.scroll.paperWidth/2;
    if(oldCenter.x > osmo.datasvg.scrollWidth)
    	oldCenter.x  = osmo.datasvg.scrollWidth;

    //
    return oldCenter;
	}

	/**
	 * ------------------------------------------------
	 * changeZoom
	 * ------------------------------------------------
	 */
	changeZoom(oldZoom, delta){
		let factor = 1.015;
		let newZoom = oldZoom;
		//
		if(delta < 0)
			newZoom = oldZoom * factor;
    if(delta > 0)
    	newZoom = oldZoom / factor;
    //
		if(newZoom <= 1)
			newZoom = 1;
		if(newZoom > this.maxZoom)
			newZoom = this.maxZoom;
		//
    return newZoom;
	}


	/**
	 * ------------------------------------------------
	 * setMaxZoom
	 * ------------------------------------------------
	 */
	setMaxZoom(val){
		this.maxZoom = val;
	}

};