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
		this.maxZoom = 1;
		this.isCompletedDetecting = false;
		this.isTrackpadDetected = false;
		this.deltaValX = 0;
		this.deltaValY = 0;


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
		console.log('Initlaizing Pan & Zoom interactions');

		this.detectMouseType();

		/* EARLY METHOD BELOW FOR TOUCH */
		/*
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
		*/




		// Main scrolling functionality
		//$('#main-scroll-canvas').on('mousewheel', function(event) {
		$('#main-scroll-canvas').on('wheel', function(event){
			//
			if(!osmo.scroll.loaded.svgdata || !osmo.scroll.loaded.HQimage)
				return;
			//

			osmo.navinteract.hitNavEffect();
			// check inactivity
			clearTimeout($.data(this, 'scrollTimer'));
	    $.data(this, 'scrollTimer', setTimeout(function() {
	    	osmo.navinteract.updateBasetrack();
	    }, 250));
	    clearTimeout($.data(this, 'scrollTimerLong'));
	    $.data(this, 'scrollTimerLong', setTimeout(function() {
	    	osmo.pzinteract.enableMaskInteractions();
	    }, 4000));
			//
			let et;
			if(!window.isMobile){
				et = event.originalEvent;
				event.preventDefault();
			}else{
				et = event;
			}

			//
			//
			// Code below makes scrolling experince way smooth
			if(osmo.scroll.hitPopupMode != 'focused'){
				if(osmo.legendsvg.maskLayer.visible){
					osmo.legendsvg.maskLayer.visible = false;
					osmo.legendinteract.hitMaskEffect(new osmo.scroll.PAPER.Point(0,0), 'scrolling');
				}
				/*
				Object.keys(osmo.legendsvg.popupBBoxes).forEach(function(key) {
					osmo.legendsvg.popupBBoxes[key]['mask'].visible = false;
				});
				*/

			}
			//
			//
			let fac = 1.005/(osmo.scroll.PAPER.view.zoom*osmo.scroll.PAPER.view.zoom);
			//
			let deltaValX, deltaValY;
			if(osmo.scroll.hitPopupMode != 'focused'){
				if(Math.abs(et.deltaY) > Math.abs(et.deltaX)){
					deltaValX = et.deltaY;
					deltaValY = et.deltaY;
				}else{
					deltaValX = et.deltaX;
					deltaValY = et.deltaX;
				}
				//
				osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, deltaValX, 0, fac);
				osmo.navinteract.navTweenItem.position = osmo.scroll.PAPER.view.center;
				//
			}
			else{
				deltaValX = et.deltaX;
				deltaValY = et.deltaY;
				//
				osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, deltaValX, deltaValY, fac, false);
				osmo.navinteract.navTweenItem.position = osmo.scroll.PAPER.view.center;
			}
		});

			// INSIDE on mousewheel
			/* EARLY METHOD BELOW INCLUDES TOUCH, TRACKPAD, MOUSE */
			/*
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
			*/

	}

	/**
	 * ------------------------------------------------
	 * averageDelata
	 * ------------------------------------------------
	 * TO BE IMPLEMENTED FOR A SMOOTHER SCROLL
	 */
	averageDelta(){
		//
	}

	/**
	 * ------------------------------------------------
	 * enableMaskInteractions
	 * ------------------------------------------------
	 */
	enableMaskInteractions(){
		if(osmo.legendsvg.maskLayer.visible == false){
  		osmo.legendsvg.maskLayer.visible = true;
			console.log('Enabled mask after 4000ms');
			//
			// Just enable legends in view
			let xMin = osmo.scroll.PAPER.view.center.x - osmo.scroll.paperWidth/2.0;
			let xMax = osmo.scroll.PAPER.view.center.x + osmo.scroll.paperWidth/2.0;
			Object.keys(osmo.legendsvg.popupBBoxes).forEach(function(key) {
				let allpaths = osmo.legendsvg.popupBBoxes[key]['paths'];
				let enabled = false;
				for(let i=0; i < allpaths.length; i++)
					if(allpaths[i].bounds.rightCenter.x > xMin && allpaths[i].bounds.leftCenter.x < xMax)
						enabled = true;
				if(enabled){
					console.log('Enabled: ' + osmo.legendsvg.popupBBoxes[key]['mask'].id);
					osmo.legendsvg.popupBBoxes[key]['mask'].visible = true;
				}
				else
					osmo.legendsvg.popupBBoxes[key]['mask'].visible = false;
				//
			});
			//
			let cevent = {point:null};
			cevent.point = osmo.scroll.mouseLoc;
			cevent.point.x += xMin;
			if(!osmo.navinteract.isOnDiv)
				osmo.legendinteract.mouseMoved(cevent);
			//
		}
	}

	/**
	 * ------------------------------------------------
	 * detectMouseType
	 * ------------------------------------------------
	 */
	detectMouseType(){
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
			  	$('#scrollm').hide();
			  	//
					document.removeEventListener('wheel', detectTrackPad, false);
					document.removeEventListener('DOMMouseScroll', detectTrackPad, false);
			  }
			}
			//
			document.addEventListener('wheel', detectTrackPad, false);
			document.addEventListener('DOMMouseScroll', detectTrackPad, false);
		}else{
			this.isCompletedDetecting = true;
			this.isTrackpadDetected = true;
		}
	}

	/**
	 * ------------------------------------------------
	 * changeCenter
	 * ------------------------------------------------
	 */
	changeCenter(oldCenter, deltaX, deltaY, factor, restricted=true){
		//
		this.PAPER = osmo.scroll.PAPER;
		let offset = new this.PAPER.Point(deltaX, -deltaY);
	  offset = offset.multiply(factor);
	  oldCenter = oldCenter.add(offset);
	  //
	  //
	  if(restricted){
	  	//
	  	//
		  if(oldCenter.x < osmo.scroll.paperWidth/2)
		  	oldCenter.x  = osmo.scroll.paperWidth/2;
		  if(oldCenter.x > (osmo.datasvg.scrollWidth + osmo.scroll.paperWidth/2))
		  	oldCenter.x  = (osmo.datasvg.scrollWidth + osmo.scroll.paperWidth/2);
		  //
	  	//
		  if((oldCenter.y*this.PAPER.view.zoom - osmo.scroll.paperHeight/2) <= 0 && deltaY > 0)
		  	oldCenter.y = osmo.scroll.paperHeight/(2*this.PAPER.view.zoom);
		  if(oldCenter.y*this.PAPER.view.zoom > (-osmo.scroll.paperHeight/2 + osmo.scroll.paperHeight*this.PAPER.view.zoom) && deltaY < 0)
		  	oldCenter.y = (-osmo.scroll.paperHeight/(2*this.PAPER.view.zoom) + osmo.scroll.paperHeight);
		  //
	  }
	  return oldCenter;
	}

	/**
	 * ------------------------------------------------
	 * changeZoom
	 * ------------------------------------------------
	 */
	changeZoom(oldZoom, delta, factor=1.015, restricted=true){
		let newZoom = oldZoom;
		//
		if(delta < 0)
			newZoom = oldZoom * factor;
	  if(delta > 0)
	  	newZoom = oldZoom / factor;
	  //
	  if(restricted){
	  	if(newZoom <= 1)
				newZoom = 1;
			if(newZoom > maxZoom)
				newZoom = maxZoom;
	  }
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