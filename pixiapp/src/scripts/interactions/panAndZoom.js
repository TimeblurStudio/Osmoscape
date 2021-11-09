/*global osmo:true $:true*/

/**
 * ------------------------------------------------
 * AUTHOR: Mike Cj (mikecj184)
 * Copyright 2020 - 2021 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:  panAndZoom
 * desc:
 * ------------------------------------------------
 */
osmo.panAndZoom = class {

  constructor(){
    console.log('osmo.panAndZoom - constructor');

    // ----------------
    // Lib
    // ----------------
    this.PIXI = osmo.scroll.PIXI;

    //@private
    this.maxZoom = 1;
    this.isCompletedDetecting = false;
    this.isTrackpadDetected = false;
    this.deltaValX = 0;
    this.deltaValY = 0;


    // Methods
    this.init;
  }

  /**
   * ------------------------------------------------
   * init
   * ------------------------------------------------
   */
  init(){
    console.log('Initlaizing Pan & Zoom interactions');
    let self = this;
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
      let deltaX = (prevX - newX); if(deltaX > 10 || deltaX < -10)  deltaX = 0;
      let deltaY = (prevY - newY); if(deltaY > 10 || deltaY < -10)  deltaY = 0;
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
      // Wait for start button press
      if(!osmo.scroll.started) return; 
      // Wait for items to load
      if(!osmo.scroll.loaded.svgdata || !osmo.scroll.loaded.HQimage)
        return;
      //
      /*
      osmo.navinteract.hitNavEffect();
      // check inactivity
      clearTimeout($.data(this, 'scrollTimer'));
      $.data(this, 'scrollTimer', setTimeout(function() {
        osmo.navinteract.updateBasetrack();
      }, 250));
      clearTimeout($.data(this, 'scrollTimerLong'));
      $.data(this, 'scrollTimerLong', setTimeout(function() {
        osmo.pzinteract.enableMaskInteractions();
      }, 1500));
      */
      let et;
      if(!window.isMobile){
        et = event.originalEvent;
        event.preventDefault();
      }else{
        et = event;
      }

      //
      /*
      // Code below makes scrolling experince way smooth
      if(osmo.scroll.hitPopupMode != 'focused'){
        osmo.legendinteract.hitMaskEffect(new osmo.scroll.PAPER.Point(0,0), 'scrolling');
        if(osmo.legendsvg.maskLayer.visible)
          osmo.legendsvg.maskLayer.visible = false;
      }
      */
      //
      let fac = 1.005/(osmo.scroll.mainStage.scale.x*osmo.scroll.mainStage.scale.y);
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
        osmo.scroll.mainStage.position = osmo.pzinteract.changeCenter(osmo.scroll.mainStage.position, deltaValX, 0, fac);
        //osmo.navinteract.navTweenItem.position = osmo.scroll.PAPER.view.center;
        //
      }
      else{
        deltaValX = et.deltaX;
        deltaValY = et.deltaY;
        //
        osmo.scroll.PAPER.view.center = osmo.pzinteract.changeCenter(osmo.scroll.PAPER.view.center, deltaValX, deltaValY, fac, false);
        //osmo.navinteract.navTweenItem.position = osmo.scroll.PAPER.view.center;
        //
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
  enableMaskInteractions(){
    if(osmo.legendsvg.maskLayer.visible == false){
      osmo.legendsvg.maskLayer.visible = true;
      console.log('Enabled mask after 1500ms');
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
  */

  /**
   * ------------------------------------------------
   * changeCenter
   * ------------------------------------------------
   */
  changeCenter(oldCenter, deltaX, deltaY, factor, restricted=true){
    let scrollWidth = osmo.datasvg.scrollWidth;
    let pixiWidth = osmo.scroll.pixiWidth;
    //
    let offset = new this.PIXI.Point(deltaX, -deltaY);
    offset.multiplyScalar(factor, offset);
    oldCenter.add(offset, oldCenter);
    if(restricted){
      if(oldCenter.x > 0)
        oldCenter.x  = 0;
      if(oldCenter.x < -1*(scrollWidth + 2*(pixiWidth + pixiWidth*3/4)))
        oldCenter.x  = -1*(scrollWidth + 2*(pixiWidth + pixiWidth*3/4));
    }
    //
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



  /**
   * ------------------------------------------------
   * detectTrackPad
   * ------------------------------------------------
   */
  detectTrackPad(e) {
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
    $('#scrollm').hide();
    //
    document.removeEventListener('wheel', osmo.pzinteract.detectTrackPad, false);
    document.removeEventListener('DOMMouseScroll', osmo.pzinteract.detectTrackPad, false);
  }


  /**
   * ------------------------------------------------
   * detectMouseType
   * ------------------------------------------------
   */
  detectMouseType(){
    if(!window.isMobile){
      document.addEventListener('wheel', osmo.pzinteract.detectTrackPad, false);
      document.addEventListener('DOMMouseScroll', osmo.pzinteract.detectTrackPad, false);
    }else{
      this.isCompletedDetecting = true;
      this.isTrackpadDetected = true;
    }
  }
};