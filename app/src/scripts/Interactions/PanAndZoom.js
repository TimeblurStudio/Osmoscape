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
		this.isCompletedDetecting = false;
		this.isTrackpadDetected = false;

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

		if(!window.isMobile){
			function detectTrackPad(e) {
			  var isTrackpad = false;
			  if (e.wheelDeltaY) {
			    if (e.wheelDeltaY === (e.deltaY * -3)) {
			      isTrackpad = true;
			    }
			  }
			  else if (e.deltaMode === 0) {
			    isTrackpad = true;
			  }
			  console.log(isTrackpad ? 'Trackpad detected' : 'Mousewheel detected');
			  osmo.pzinteract.isCompletedDetecting = true;
			  osmo.pzinteract.isTrackpadDetected = isTrackpad;
			  //
			  if(osmo.pzinteract.isCompletedDetecting){
					document.removeEventListener('mousewheel', detectTrackPad, false);
					document.removeEventListener('DOMMouseScroll', detectTrackPad, false);
			  }
			}

			document.addEventListener('mousewheel', detectTrackPad, false);
			document.addEventListener('DOMMouseScroll', detectTrackPad, false);
		}else{
			this.isCompletedDetecting = true;
			this.isTrackpadDetected = true;
		}


		//touchmove works for iOS, and Android
		let prevX = 0;
		let prevY = 0;
		$(document).on('touchmove', function(event) {
			//console.log('touchmove');
			//console.log(event);
			//
			let newX = event.touches[0].clientX;
			let newY = event.touches[0].clientY;
			//
			let deltaX = (prevX - newX); if(deltaX > 10 || deltaX < -10)	deltaX = 0;
			let deltaY = (prevY - newY); if(deltaY > 10 || deltaY < -10)	deltaY = 0;
			//
			prevX = newX;
			prevY = newY;
			//
			let newEvent = event;
			newEvent.type = 'mousewheel';
			newEvent.deltaX = deltaX;
			newEvent.deltaY = deltaY;
			//
			// Further smooth movement - https://medium.com/creative-technology-concepts-code/native-browser-touch-drag-using-overflow-scroll-492dc92ac737
			// Implement this for phone

			//
		  $('#main-scroll-canvas').trigger(newEvent);
		});

		// Main scrolling functionality
		$('#main-scroll-canvas').on('mousewheel', function(event) {
			//console.log('mousewheel');
			//console.log(event);
			let et;

			if(!window.isMobile){
				et = event.originalEvent;
				event.preventDefault();
			}else{
				et = event;
			}
			// Pinch-Zoom
			// Tricky spec - https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
			if(et.ctrlKey && osmo.pzinteract.isTrackpadDetected){
				osmo.scroll.PAPER.view.zoom = osmo.pzinteract.changeZoom(osmo.scroll.PAPER.view.zoom, et.deltaY);
				// Center Y-axis on zoom-out
				let bounds = osmo.scroll.PAPER.view.bounds;
		    if (bounds.y < 0) osmo.scroll.PAPER.view.center = osmo.scroll.PAPER.view.center.subtract(new osmo.scroll.PAPER.Point(0, bounds.y));
		    bounds = osmo.scroll.PAPER.view.bounds;
		    let h = bounds.y + bounds.height;
				if (h > osmo.scroll.PAPER.view.viewSize.height) osmo.scroll.PAPER.view.center = osmo.scroll.PAPER.view.center.subtract(new osmo.scroll.PAPER.Point(0, h - osmo.scroll.PAPER.view.viewSize.height));
			}else{
				let fac = 1.005/(osmo.scroll.PAPER.view.zoom*osmo.scroll.PAPER.view.zoom);
				if(window.isMobile)
					fac *= 6;
				//
				if(osmo.scroll.PAPER.view.zoom == 1){
					let deltaValX, deltaValY;
					if(osmo.pzinteract.isTrackpadDetected){
						deltaValX = et.deltaX;
						deltaValY = et.deltaY;
					}else{
						deltaValY = et.deltaX;
						deltaValX = et.deltaY;
					}
					//
					osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, deltaValX, 0, fac);
				}
				else{
					osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, et.deltaX, et.deltaY, fac);
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
		//
		let offset = new this.PAPER.Point(deltaX, -deltaY);
    offset = offset.multiply(factor);
    oldCenter = oldCenter.add(offset);
    //
    if(oldCenter.x < osmo.scroll.paperWidth/2)
    	oldCenter.x  = osmo.scroll.paperWidth/2;
    if(oldCenter.x > osmo.datasvg.scrollWidth)
    	oldCenter.x  = osmo.datasvg.scrollWidth;
    //
    //
		if((oldCenter.y*osmo.scroll.PAPER.view.zoom - osmo.scroll.paperHeight/2) <= 0 && deltaY > 0)
    	oldCenter.y = osmo.scroll.paperHeight/(2*osmo.scroll.PAPER.view.zoom);
    if(oldCenter.y*osmo.scroll.PAPER.view.zoom > (-osmo.scroll.paperHeight/2 + osmo.scroll.paperHeight*osmo.scroll.PAPER.view.zoom) && deltaY < 0)
    	oldCenter.y = (-osmo.scroll.paperHeight/(2*osmo.scroll.PAPER.view.zoom) + osmo.scroll.paperHeight);
    //
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