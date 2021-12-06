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
osmo.PanAndZoomInteraction = class {

  constructor(){
    console.log('osmo.PanAndZoomInteraction - constructor');

    // ----------------
    // Lib
    // ----------------
    this.PIXI = osmo.scroll.PIXI;
    this.TWEENMAX = osmo.scroll.TWEENMAX;
    this.POWER4 = osmo.scroll.POWER4;
    

    //@private
    this.defaultZoom = null;
    this.minZoom = 1;
    this.maxZoom = 1;
    //
    this.isCompletedDetecting = false;
    this.isTrackpadDetected = false;
    this.navScrolledUpdate = true;
    //
    this.deltaValX = 0;
    this.deltaValY = 0;
    this.isDragging = false;
    this.prevMouseLoc = null;
    this.mouseLoc = null;


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

    // zoom init
    this.defaultZoom = osmo.scroll.mainStage.scale.x;
    this.setZoomRange(0.85, 4);//0.85x to 4x
    let zoomPercentage = parseInt((osmo.scroll.mainStage.scale.x/this.defaultZoom)*100).toString() + '%';
    $('#zoom-level').text(zoomPercentage);
    $('#zoom-in').on('click', function(){
      //
      let centerPosX = (osmo.scroll.pixiWidth/2)*osmo.scroll.pixiScale;
      let centerPosY = (osmo.scroll.pixiHeight/2)*osmo.scroll.pixiScale;
      // consilder if left panel is open
      if(osmo.legendinteract.isSidebarOpen()){
        let left_shift = osmo.scroll.pixiWidth*0.33;
        let focused_width = osmo.scroll.pixiWidth*(1-0.33);
        centerPosX = (left_shift+focused_width/2)*osmo.scroll.pixiScale;
        centerPosY = (osmo.scroll.pixiHeight/2)*osmo.scroll.pixiScale;
      }
      //
      osmo.pzinteract.changeZoomAt(centerPosX, centerPosY, -50, true);
    });
    $('#zoom-out').on('click', function(){
      let centerPosX = (osmo.scroll.pixiWidth/2)*osmo.scroll.pixiScale;
      let centerPosY = (osmo.scroll.pixiHeight/2)*osmo.scroll.pixiScale;
      // consilder if left panel is open
      if(osmo.legendinteract.isSidebarOpen()){
        let left_shift = osmo.scroll.pixiWidth*0.33;
        let focused_width = osmo.scroll.pixiWidth*(1-0.33);
        centerPosX = (left_shift+focused_width/2)*osmo.scroll.pixiScale;
        centerPosY = (osmo.scroll.pixiHeight/2)*osmo.scroll.pixiScale;
      }
      //      
      osmo.pzinteract.changeZoomAt(centerPosX, centerPosY, 50, true);
    });
    
    //
    // Custom Mouse follow
    document.addEventListener('mousemove', function(e) {
      self.prevMouseLoc = self.mouseLoc;
      self.mouseLoc = new osmo.scroll.PIXI.Point(e.pageX, e.pageY);
      $('.cursor-pointer-wrapper').css('transform', 'translate3d('+self.mouseLoc.x+'px, '+self.mouseLoc.y+'px, 0px)');
    });

    //
    // Click and drag when focused
    document.addEventListener('mousedown', function(e) {
      if(osmo.scroll.hitPopupMode == 'focused')
        self.isDragging = true;
    });

    document.addEventListener('mouseup', function(e) {
      if(osmo.scroll.hitPopupMode == 'focused')
        self.isDragging = false;
    });

    document.addEventListener('mousemove', function(e) {
      // If focused - click and drag feature
      if(osmo.scroll.hitPopupMode == 'focused' && osmo.legendinteract.dragMode && self.isDragging){
        //
        let dragging_enabled = true;
        if(osmo.mc != null)
          if(osmo.mc.dragging)
            dragging_enabled = false;
        //
        //
        if(dragging_enabled){
          let deltaX = self.mouseLoc.x - self.prevMouseLoc.x;
          let deltaY = -1*(self.mouseLoc.y - self.prevMouseLoc.y);
          let fac = 1.005;
          let oldPos = new osmo.scroll.PIXI.Point(osmo.scroll.mainStage.position.x, osmo.scroll.mainStage.position.y);
          osmo.scroll.mainStage.position = osmo.pzinteract.calculateCenter(oldPos, deltaX, deltaY, fac*osmo.scroll.pixiScale, false);//
        }
        //
      }
      //
    });

    //
    //
    /* EARLY METHOD BELOW FOR TOUCH */
    //touchmove works for iOS, and Android
    let prevX = 0;
    let prevY = 0;
    $(document).on('touchmove', function(event) {
      //console.log('touchmove');
      //console.log(event);
      // 2/3 finger scroll
      if(event.touches.length > 1) {
        //
        let newX = event.touches[0].clientX;
        let newY = event.touches[0].clientY;
        //
        let deltaX = (prevX - newX); //if(deltaX > 10 || deltaX < -10)  deltaX = 0;
        let deltaY = (prevY - newY); //if(deltaY > 10 || deltaY < -10)  deltaY = 0;
        //
        prevX = newX;
        prevY = newY;
        //
        let newEvent = event;
        newEvent.type = 'mousewheel';
        newEvent.deltaX = deltaX;
        newEvent.deltaY = deltaY;
        newEvent.originalEvent = JSON.parse(JSON.stringify(event));
        //
        // Further smooth movement - https://medium.com/creative-technology-concepts-code/native-browser-touch-drag-using-overflow-scroll-492dc92ac737
        // Implement this for phone
        //
        //
        //$('#main-scroll-canvas').trigger(newEvent);
        self.onOsmoScroll(self, newEvent);
      }
    });
    $(document).on('touchstart', function(event) {
      // 2/3 finger scroll
      if(event.touches.length > 1) {
        prevX = event.touches[0].clientX;
        prevY = event.touches[0].clientY;
      }
      //
    });
    //
    //
    //
    // Trackpad scrolling functionality
    //$('#main-scroll-canvas').on('mousewheel', function(event) {
    $('#main-scroll-canvas').on('wheel', function(event){
      self.onOsmoScroll(self, event);
    });
    //
    document.addEventListener('keydown', this.onKeyDown);
  }


  /**
   * ------------------------------------------------
   * on scroll event trigger
   * ------------------------------------------------
   */
  onOsmoScroll(self, event){
    // Wait for start button press
    if(!osmo.scroll.started) return; 
    // Wait for items to load
    if(!osmo.scroll.loaded.svgdata || !osmo.scroll.loaded.HQimage)
      return;
    //
    //
    if($('#scrollm').is(":visible"))
      $('#scrollm').hide();
    //
    //
    self.disableMaskInteractions();
    //
    // NOTE: navScrolledUpdate flag is used to
    // Reduce number of times this snippet runs while scrolling
    //
    if(self.navScrolledUpdate){
      //
      if(osmo.scroll.hitPopupMode != 'focused'){
        self.navScrolledUpdate = false;
        setTimeout(function(){  osmo.navinteract.scrollNavEffect();  },50);
        // check inactivity and when scrolling stops - update basetrack
        clearTimeout($.data(this, 'scrollTimer'));
        $.data(this, 'scrollTimer', setTimeout(function() {
          osmo.navinteract.updateBasetrack();
        }, 250));
        //
        // Code below makes scrolling experince way smooth
        //
        // HIDING MASK NEEDS TO BE ADDED
        //
        // check inactivity and when scrolling stops - enable mask
        clearTimeout($.data(this, 'scrollTimerLong'));
        $.data(this, 'scrollTimerLong', setTimeout(function() {
          osmo.pzinteract.enableMaskInteractions();
        }, 500));
        //
      }
      //
    }
    //
    let et;
    if(!window.isMobile){
      et = event.originalEvent;
      //if(event.preventDefault)
      //  event.preventDefault();
    }else{
      et = event;
    }
    //
    let fac = 1.005;///(osmo.scroll.mainStage.scale.x*osmo.scroll.mainStage.scale.y);
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
      if(!osmo.pzinteract.isTrackpadDetected)
        deltaValX *= -1;
      //
      let oldPos = new osmo.scroll.PIXI.Point(osmo.scroll.mainStage.position.x, osmo.scroll.mainStage.position.y);
      osmo.scroll.mainStage.position = osmo.pzinteract.calculateCenter(oldPos, deltaValX, 0, fac*osmo.scroll.pixiScale);
      //
    }
    else{
      //
      deltaValX = et.deltaX;
      deltaValY = et.deltaY;
      //
      let mouseX = osmo.pzinteract.mouseLoc.x*osmo.scroll.pixiScale;
      let mouseY = osmo.pzinteract.mouseLoc.y*osmo.scroll.pixiScale;
      osmo.pzinteract.changeZoomAt(mouseX, mouseY, deltaValY);// Consilder only deltaY for zoom
      //
    }
  }

  /*
  $(document).ready(function(){
    $('#myCanvas').on('mousewheel', function(event) {
      var newZoom = paper.view.zoom; 
      var oldZoom = paper.view.zoom;
      
      if (event.deltaY > 0) {     
        newZoom = paper.view.zoom * 1.05;
      } else {
        newZoom = paper.view.zoom * 0.95;
      }
      
      var beta = oldZoom / newZoom;
      
      var mousePosition = new paper.Point(event.offsetX, event.offsetY);
      
      //viewToProject: gives the coordinates in the Project space from the Screen Coordinates
      var viewPosition = paper.view.viewToProject(mousePosition);
      
      var mpos = viewPosition;
      var ctr = paper.view.center;
      
      var pc = mpos.subtract(ctr);
      var offset = mpos.subtract(pc.multiply(beta)).subtract(ctr);  
      
      paper.view.zoom = newZoom;
      paper.view.center = paper.view.center.add(offset);
      
      event.preventDefault();
      paper.view.draw();      
    }); 
  }); 
  */


  onKeyDown(event) {
    //
    // 107 Num Key  +
    // 109 Num Key  -
    // 173 Min Key  hyphen/underscore key
    // 61 Plus key  +/= key
    //
    if ((event.ctrlKey || event.metaKey) && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'  || event.which == '187'  || event.which == '189'  ) ) {
      console.log('Pressed ' + event.which + ' - disabling zoom');
      event.preventDefault();
      //
      //
      let self = osmo.pzinteract;
      if(osmo.scroll.hitPopupMode == 'focused'){
        let zoomChanged = false;
        let deltaValY = 0;
        //
        if ((event.ctrlKey || event.metaKey) && (event.key === '=' || event.key === '+')) {// Equivalent to +
          console.log('Zooming in');
          deltaValY = -50;
          zoomChanged = true;
        }
        if ((event.ctrlKey || event.metaKey) && (event.key === '-' || event.key === '_')) {
          console.log('Zooming out');
          deltaValY = 50;
          zoomChanged = true;
        }
        //
        if(zoomChanged){
          let mouseX = osmo.pzinteract.mouseLoc.x*osmo.scroll.pixiScale;
          let mouseY = osmo.pzinteract.mouseLoc.y*osmo.scroll.pixiScale;
          osmo.pzinteract.changeZoomAt(mouseX, mouseY, deltaValY, true);
        }
        //
      }
      //
      //
      return;
    }
    //
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
   * disableMaskInteractions
   * ------------------------------------------------
   */
  disableMaskInteractions(){  
    //
    // Check mask container, if visible
    if(osmo.legendsvg.maskContainer.visible){
      // Remove highlight if any
      osmo.legendsvg.removeHighlight();
    
      // Show background
      let scrollLength = Object.keys(osmo.scroll.mainScroll).length;
      for(let i=0; i < scrollLength; i++){
        let index = i+1;
        osmo.scroll.mainScroll['part' + index].alpha = 1;
      }
      // Disable all masks and legends
      osmo.legendsvg.maskContainer.visible = false;
      osmo.legendsvg.legendContainer.visible = false;
      for(let i=0; i<osmo.legendsvg.legendFiles.length; i++)
        if(osmo.legendsvg.legendFiles[i].visible)
          osmo.legendsvg.legendFiles[i].visible = false;
      //
    }
    //
    //
  }

  /**
   * ------------------------------------------------
   * enableMaskInteractions
   * ------------------------------------------------
   */
  enableMaskInteractions(){
    if(osmo.legendsvg.maskContainer.visible == false){
      osmo.legendsvg.maskContainer.visible = true;
      // NOTE: mask.on('pointerover' is not triggered unless pointer goes out and comes back into the mask
      console.log('Enabled mask after 500ms');
      //
      /*
      // Just keep legends in and around current view
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
      */
    }
    
  }
  
  /**
   * ------------------------------------------------
   * calculateCenter
   * ------------------------------------------------
   */
  calculateCenter(oldCenter, deltaX, deltaY, factor, restricted=true){
    let scrollWidth = osmo.datasvg.scrollWidth;
    let pixiWidth = osmo.scroll.pixiWidth;
    let pixiScale = osmo.scroll.pixiScale;
    //
    let offset = new this.PIXI.Point(deltaX, -deltaY);
    offset.multiplyScalar(factor, offset);
    oldCenter.add(offset, oldCenter);
    if(restricted){
      if(oldCenter.x > 0)
        oldCenter.x  = 0;
      if(oldCenter.x < -1*(scrollWidth*pixiScale - pixiWidth*3/4))
        oldCenter.x  = -1*(scrollWidth*pixiScale - pixiWidth*3/4);
    }
    //
    return oldCenter;
  }

  /**
   * ------------------------------------------------
   * calculateZoom
   * ------------------------------------------------
   */
  calculateZoom(oldZoom, delta, factor=1.015, restricted=true){
    //
    factor = factor+Math.abs(delta*0.01);
    //
    let newZoom = oldZoom;
    if(delta < 0)
      newZoom = oldZoom * factor;
    if(delta > 0)
      newZoom = oldZoom / factor;
    //
    if(restricted){
      if(newZoom <= this.defaultZoom*this.minZoom)
        newZoom = this.defaultZoom*this.minZoom;
      if(newZoom > this.defaultZoom*this.maxZoom)
        newZoom = this.defaultZoom*this.maxZoom;
    }
    //
    return newZoom;
  }

  /**
   * ------------------------------------------------
   * changeZoomAt
   * ------------------------------------------------
   */
  changeZoomAt(mouseX, mouseY, delta, animate=false){
    //
    let fac = 1.0;
    let currentZoom = osmo.scroll.mainStage.scale.x;
    let newScale = osmo.pzinteract.calculateZoom(currentZoom, delta, fac, true);
    //
    let worldPos = new osmo.scroll.PIXI.Point((mouseX - osmo.scroll.mainStage.x) / currentZoom, (mouseY - osmo.scroll.mainStage.y)/currentZoom);
    let newScreenPos = new osmo.scroll.PIXI.Point(worldPos.x*newScale + osmo.scroll.mainStage.x, worldPos.y*newScale + osmo.scroll.mainStage.y);
    //
    if(animate){
      let dur = 500;// half a second
      let zoomPercentage = (newScale/this.defaultZoom);
      //
      this.TWEENMAX.to(osmo.scroll.mainStage.position, dur/1000, {
        x: osmo.scroll.mainStage.x - (newScreenPos.x-mouseX),
        y: osmo.scroll.mainStage.y - (newScreenPos.y-mouseY),
        ease: this.POWER4.easeInOut
      });
      //
      this.TWEENMAX.to(osmo.scroll.mainStage.scale, dur/1000, {
        x: newScale,
        y: newScale,
        ease: this.POWER4.easeInOut
      });
      if(osmo.mc){
        this.TWEENMAX.to(osmo.mc.moleculeContainer.scale, dur/1000, {
          x: 1/zoomPercentage,
          y: 1/zoomPercentage,
          ease: this.POWER4.easeInOut
        });
      }
      //
      let self = this;
      setTimeout(function(){
        $('#zoom-level').text(parseInt(zoomPercentage*100).toString() + '%');
        //osmo.mc.updateMoleculeScale(1/zoomPercentage);
        self.updateSoundArea();
      }, dur);
      //
    }else{
      osmo.scroll.mainStage.x -= (newScreenPos.x-mouseX) ;
      osmo.scroll.mainStage.y -= (newScreenPos.y-mouseY) ;
      //
      osmo.scroll.mainStage.scale.x = osmo.scroll.mainStage.scale.y = newScale;
      //
      let zoomPercentage = (osmo.scroll.mainStage.scale.x/this.defaultZoom);
      $('#zoom-level').text(parseInt(zoomPercentage*100).toString() + '%');
      osmo.mc.updateMoleculeScale(1/zoomPercentage);
      this.updateSoundArea();
      //
    }
    //
    //
    return newScale;
  }

  updateSoundArea(){
    let num = osmo.legendinteract.currentFocus;
    if(num != null){
      let maskScale = osmo.legendsvg.popupBBoxes[num].maskScale;
      let offset = 0;
      if (num === '-1') offset = 495;//(9945 - 9693);
      else if (num === '0') offset = (9945 - 9601);
      else if (num === '64')  offset = (9945 - 9459);
      else  offset = 495;
      offset -= 2; // NOTE: CORRECTING FOR MINOR OFFSET (WHILE GENERATING THE SOUND AREA MAY BE?)
      //
      if(osmo.soundareas)
        osmo.soundareas.updatePositionAndScale(num, maskScale, new osmo.scroll.PIXI.Point(offset*maskScale+osmo.scroll.pixiWidth*3/4,0));
    }
    
  }

  /**
   * ------------------------------------------------
   * resetZoom
   * ------------------------------------------------
   */
  resetZoom(){
    osmo.scroll.mainStage.scale.x = osmo.scroll.mainStage.scale.y = this.defaultZoom;
  }

  /**
   * ------------------------------------------------
   * setZoomRange
   * ------------------------------------------------
   */
  setZoomRange(minval, maxval){
    this.minZoom = minval;
    this.maxZoom = maxval;
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