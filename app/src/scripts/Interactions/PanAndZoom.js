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

		osmo.pzinteract.detectMouseType();

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
		$('#main-scroll-canvas').on('mousewheel', function(event) {
			osmo.navinteract.updateBasetrack();
			osmo.navinteract.hitNavEffect();
			// check inactivity
			clearTimeout($.data(this, 'scrollTimer'));
	    $.data(this, 'scrollTimer', setTimeout(function() {
	        //
	        if(osmo.navinteract.currentNavLoc != -1 && (osmo.bgaudio.currentTrack != ('base'+osmo.navinteract.currentNavLoc))){
	        	console.log('Changing base track - Haven\'t scrolled in 250ms!');
	        	osmo.bgaudio.currentTrack = 'base' + osmo.navinteract.currentNavLoc;
	        	//
	        	//for(let i=0; i < 7; i++)
	        	//	baseTracks['base'+(i+1)].stop();
	        	//
	        	console.log('Now playing : ' + osmo.bgaudio.currentTrack);
	        	//baseTracks[currentTrack].start();
	        }
	    }, 250));
			//
			let et;
			if(!window.isMobile){
				et = event.originalEvent;
				event.preventDefault();
			}else{
				et = event;
			}
			//
			if(!osmo.scroll.loaded.svgdata || !osmo.scroll.loaded.HQimage)
				return;

			//
			//
			if(osmo.scroll.hitPopupMode != 'focused' && osmo.legendsvg.maskLayer.visible){// Makes scrolling experince way smooth
				console.log('Hide mask on scroll');
				osmo.legendsvg.maskLayer.visible = false;
				//
				Object.keys(osmo.legendsvg.popupBBoxes).forEach(function(key) {
					osmo.legendsvg.popupBBoxes[key]['mask'].visible = false;
				});
				//
				osmo.legendinteract.hitMaskEffect(new osmo.scroll.PAPER.Point(0,0), 'scrolling');
			}
			//
			//
			let fac = 1.005/(osmo.scroll.PAPER.view.zoom*osmo.scroll.PAPER.view.zoom);
			//
			if(osmo.scroll.hitPopupMode != 'focused'){
				let deltaValX, deltaValY;
				if(Math.abs(et.deltaY) > Math.abs(et.deltaX)){
					deltaValX = et.deltaY;
					deltaValY = et.deltaY;
				}else{
					deltaValX = et.deltaX;
					deltaValY = et.deltaX;
				}
				//
				osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, deltaValX, 0, fac);
			}
			else{
				let deltaValX, deltaValY;
				deltaValX = et.deltaX;
				deltaValY = et.deltaY;
				//
				osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, deltaValX, deltaValY, fac, false);
				osmo.navinteract.navTweenItem.position = osmo.scroll.PAPER.view.center;
			}

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

		});
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
					document.removeEventListener('mousewheel', detectTrackPad, false);
					document.removeEventListener('DOMMouseScroll', detectTrackPad, false);
			  }
			}
			//
			document.addEventListener('mousewheel', detectTrackPad, false);
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
		let offset = new this.PAPER.Point(deltaX, -deltaY);
	  offset = offset.multiply(factor);
	  oldCenter = oldCenter.add(offset);
	  //
	  //
	  if(restricted){
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