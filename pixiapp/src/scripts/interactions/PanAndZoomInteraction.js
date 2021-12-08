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
    this.isNormalDragging = false;
    this.isfocusedDragging = false;
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
    //
    // zoom init
    this.defaultZoom = osmo.scroll.mainStage.scale.x;
    this.setZoomRange(1, 6);//1x to 6x // Also there is dynamic value calculated from image width
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
      let currentLegendID = osmo.legendinteract.currentFocus;
      if(osmo.scroll.datasets[currentLegendID].hasOwnProperty('zoom')){
        //
        let defaultZoomPercentage = osmo.scroll.datasets[currentLegendID].zoom.default;
        let minZoomPercentage = osmo.scroll.datasets[currentLegendID].zoom.min;
        let maxZoomPercentage = osmo.scroll.datasets[currentLegendID].zoom.max;
        //
        osmo.pzinteract.changeZoomAt(centerPosX, centerPosY, -50, true, minZoomPercentage/100, maxZoomPercentage/100);
      }else{
        let img_width = parseInt(osmo.legendsvg.popupBBoxes[currentLegendID]['dimensions'][0].width);
        let rs = (osmo.scroll.pixiHeight/osmo.scroll.refPopupSize.height);
        img_width *= rs;
        let zoomFac = 0.5 * osmo.scroll.pixiWidth / (1.0 * img_width);
        let minZoomFac = self.minZoom*zoomFac/osmo.scroll.pixiScale;
        let maxZoomFac = self.maxZoom*zoomFac/osmo.scroll.pixiScale;
        //
        osmo.pzinteract.changeZoomAt(centerPosX, centerPosY, -50, true, minZoomFac, maxZoomFac);  
      }
      //
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
      let currentLegendID = osmo.legendinteract.currentFocus;
      if(osmo.scroll.datasets[currentLegendID].hasOwnProperty('zoom')){
        //
        let defaultZoomPercentage = osmo.scroll.datasets[currentLegendID].zoom.default;
        let minZoomPercentage = osmo.scroll.datasets[currentLegendID].zoom.min;
        let maxZoomPercentage = osmo.scroll.datasets[currentLegendID].zoom.max;
        //
        osmo.pzinteract.changeZoomAt(centerPosX, centerPosY, 50, true, minZoomPercentage/100, maxZoomPercentage/100);
      }else{
        let img_width = parseInt(osmo.legendsvg.popupBBoxes[currentLegendID]['dimensions'][0].width);
        let rs = (osmo.scroll.pixiHeight/osmo.scroll.refPopupSize.height);
        img_width *= rs;
        let zoomFac = 0.5 * osmo.scroll.pixiWidth / (1.0 * img_width);
        let minZoomFac = self.minZoom*zoomFac/osmo.scroll.pixiScale;
        let maxZoomFac = self.maxZoom*zoomFac/osmo.scroll.pixiScale;
        //
        osmo.pzinteract.changeZoomAt(centerPosX, centerPosY, 50, true, minZoomFac, maxZoomFac); 
      }
      //
    });
    
    //
    // Custom Mouse follow
    document.addEventListener('mousemove', function(e) {
      if(osmo.pzinteract.isTrackpadDetected){
        self.prevMouseLoc = self.mouseLoc;
        self.mouseLoc = new osmo.scroll.PIXI.Point(e.pageX, e.pageY);
        $('.cursor-pointer-wrapper').css('transform', 'translate3d('+self.mouseLoc.x+'px, '+self.mouseLoc.y+'px, 0px)');
      }
    });

    //
    // Click and drag when focused
    document.addEventListener('mousedown', function(e) {
      if(osmo.pzinteract.isTrackpadDetected){
        if(osmo.scroll.hitPopupMode == 'focused')
          self.isfocusedDragging = true;
      }
    });

    document.addEventListener('mouseup', function(e) {
      if(osmo.pzinteract.isTrackpadDetected){
        if(osmo.scroll.hitPopupMode == 'focused')
          self.isfocusedDragging = false;
      }
    }); 

    document.addEventListener('mousemove', function(e) {
      // If focused - click and drag feature
      if(osmo.scroll.hitPopupMode == 'focused' && osmo.legendinteract.dragMode && self.isfocusedDragging){
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
    // HOT FIX:
    // touch events on dom are also being propogated to canvas leading to un-expected behaviours
    // So, Prevent touchevents for doms and manually trigger centain dom elements when you have to...
    //
    let dom_elements = ['focused-info', 'focused-cta', 'zoom-level'];
    for(let i=0; i < dom_elements.length; i++){
      $('#'+dom_elements[i]).on('touchstart touchmove touchend', function (e) {
        e.preventDefault();
      });
    }
    let dom_interactive_elements = ['popcancel', 'zoom-in', 'zoom-out', 'addcomp', 'dragmol', 'popup-info-toggle', 'show-info'];
    for(let i=0; i < dom_interactive_elements.length; i++){
      $('#'+dom_interactive_elements[i]).on('touchstart touchmove touchend', function (e) {
        e.preventDefault();
        $('#'+dom_interactive_elements[i]).trigger('click');
      });
    }
    let dom_interactive_classes = ['jump'];
    for(let i=0; i < dom_interactive_classes.length; i++){
      $('.'+dom_interactive_classes[i]).on('touchstart touchmove touchend', function (e) {
        e.preventDefault();
        $(this).trigger('click');
      });
    }
    
    $('#focused-description').on('touchend', function (e) {
      e.preventDefault();
      $(this).trigger('click');
    });
    
    //
    //
    //touchmove works for iOS, and Android
    let avgPrevTouch = new self.PIXI.Point(0,0);
    let prevTouchFingerTorR = new self.PIXI.Point(0,0);//Top-or-right-finger
    let prevTouchFingerBorL = new self.PIXI.Point(0,0);//Bottom-or-left-finger
    let TORFingerIndex = -1, BORLFingerIndex = -1;
    //
    // NOTE: 
    // Try to use canvas events rather than document events
    $(document).on('touchstart', function(event) {
      //
      if(self.mouseLoc)
        self.prevMouseLoc = new osmo.scroll.PIXI.Point(self.mouseLoc.x, self.mouseLoc.y);
      self.mouseLoc = new osmo.scroll.PIXI.Point(event.touches[0].clientX, event.touches[0].clientY);
      $('.cursor-pointer-wrapper').css('transform', 'translate3d('+self.mouseLoc.x+'px, '+self.mouseLoc.y+'px, 0px)');
      if(osmo.scroll.hitPopupMode == 'focused'){
        self.isfocusedDragging = true;
        self.isNormalDragging = false;
      }
      else{
        self.isfocusedDragging = false;
        self.isNormalDragging = true;
      }
      //
      if(osmo.legendsvg.highlightedLegendId){
        // Something is highlighted, if hitpopup is not focused in 100ms remove all highlights
        if(osmo.scroll.hitPopupMode != 'focused'){
          setTimeout(function(){
            osmo.legendsvg.removeHighlight();
          }, 100);
        }
        //
      }
      //
      TORFingerIndex = -1;
      BORLFingerIndex = -1;
      prevTouchFingerTorR.x = -1;
      prevTouchFingerTorR.y = -1;
      prevTouchFingerBorL.x = -1;
      prevTouchFingerBorL.y = -1;
      //
      //
    });
    $(document).on('touchmove', function(event) {
      //
      // 1 finger touch or scroll
      if(event.touches.length == 1){
        self.prevMouseLoc = new osmo.scroll.PIXI.Point(self.mouseLoc.x, self.mouseLoc.y);
        self.mouseLoc = new osmo.scroll.PIXI.Point(event.touches[0].clientX, event.touches[0].clientY);
        $('.cursor-pointer-wrapper').css('transform', 'translate3d('+self.mouseLoc.x+'px, '+self.mouseLoc.y+'px, 0px)');
        //
        // Clearing wait for highlight legend on pointerdown event if the intended behaviour is to scroll
        if(osmo.legendsvg.highlightedLegendWaitTimeout != null)
          clearTimeout(osmo.legendsvg.highlightedLegendWaitTimeout);
        osmo.legendsvg.highlightedLegendWaitTimeout = null;
        // If focused - click and drag feature
        if(osmo.scroll.hitPopupMode == 'focused' && osmo.legendinteract.dragMode && self.isfocusedDragging){
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
        // If normal - click & drag feature
        if(osmo.scroll.hitPopupMode != 'focused' && self.isNormalDragging){
          let deltaX = -1*(self.mouseLoc.x - self.prevMouseLoc.x);
          let deltaY = (self.mouseLoc.y - self.prevMouseLoc.y);
          //
          let newEvent = event;
          newEvent.type = 'mousewheel';
          newEvent.deltaX = deltaX;
          newEvent.deltaY = deltaY;
          newEvent.originalEvent = JSON.parse(JSON.stringify(event));
          //
          self.onOsmoScroll(self, newEvent);
          //
        }
        //
      }
      // 2 finger pinch and zoom
      else if(event.touches.length == 2) {
        //
        let avgNewTouch = new self.PIXI.Point(0,0);
        let newEvent = event;
        if(osmo.scroll.hitPopupMode != 'focused'){
          ;//do nothing
        }
        // PINCH TO ZOOM IMPLEMENTATION
        else{
          //
          self.isfocusedDragging = false;
          self.isNormalDragging = false;
          //
          avgNewTouch.x = (event.touches[0].clientX + event.touches[1].clientX)/2;
          avgNewTouch.y = (event.touches[0].clientY + event.touches[1].clientY)/2;
          // Mouse needs to be centered for pinchZoom to work
          self.prevMouseLoc = self.mouseLoc;
          self.mouseLoc = new osmo.scroll.PIXI.Point(avgNewTouch.x, avgNewTouch.y);
          $('.cursor-pointer-wrapper').css('transform', 'translate3d('+self.mouseLoc.x+'px, '+self.mouseLoc.y+'px, 0px)');
          //
          if(TORFingerIndex == -1 && BORLFingerIndex == -1){
            if(event.touches[0].clientX < event.touches[1].clientX){
              TORFingerIndex = 1;// right is 1
              BORLFingerIndex = 0;// left is 0
            }
            if(event.touches[0].clientY < event.touches[1].clientY){// Note: y-axis is given priority for pinch
              TORFingerIndex = 0;// top is 0
              BORLFingerIndex = 1;// bottom is 1
            }
          }
          //
          // Also, delta has to be based on two fingers
          if(prevTouchFingerTorR.x == -1)  prevTouchFingerTorR.x = event.touches[TORFingerIndex].clientX;
          if(prevTouchFingerTorR.y == -1)  prevTouchFingerTorR.y = event.touches[TORFingerIndex].clientY;
          if(prevTouchFingerBorL.x == -1)  prevTouchFingerBorL.x = event.touches[BORLFingerIndex].clientX;
          if(prevTouchFingerBorL.y == -1)  prevTouchFingerBorL.y = event.touches[BORLFingerIndex].clientY;
          //
          let delta1X = prevTouchFingerTorR.x - event.touches[TORFingerIndex].clientX;
          let delta1Y = prevTouchFingerTorR.y - event.touches[TORFingerIndex].clientY;
          let delta2X = prevTouchFingerBorL.x - event.touches[BORLFingerIndex].clientX;
          let delta2Y = prevTouchFingerBorL.y - event.touches[BORLFingerIndex].clientY;
          //
          let deltaX = -1*(delta2X - delta1X)/2;
          let deltaY = -1*(delta2Y - delta1Y)/2;
          //
          avgPrevTouch.x = avgNewTouch.x;
          avgPrevTouch.y = avgNewTouch.y;
          prevTouchFingerTorR.x = event.touches[TORFingerIndex].clientX;
          prevTouchFingerTorR.y = event.touches[TORFingerIndex].clientY;
          prevTouchFingerBorL.x = event.touches[BORLFingerIndex].clientX;
          prevTouchFingerBorL.y = event.touches[BORLFingerIndex].clientY;
          //
          newEvent.type = 'mousewheel';
          newEvent.deltaX = deltaX;
          newEvent.deltaY = deltaY;
          newEvent.originalEvent = JSON.parse(JSON.stringify(event));
          //
          //
          // Further smooth movement - https://medium.com/creative-technology-concepts-code/native-browser-touch-drag-using-overflow-scroll-492dc92ac737
          // Implement this for touch devices
          //
          self.onOsmoScroll(self, newEvent);
        }
      }
      //
      //
    });
    $(document).on('touchend touchcancel', function(event) {
      //
      TORFingerIndex = -1;
      BORLFingerIndex = -1;
      prevTouchFingerTorR.x = -1;
      prevTouchFingerTorR.y = -1;
      prevTouchFingerBorL.x = -1;
      prevTouchFingerBorL.y = -1;
      //
      if(osmo.scroll.hitPopupMode == 'focused')
        self.isfocusedDragging = false;
      else
        self.isNormalDragging = false;
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
    if($('#scrollm').is(':visible'))
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
      // Consilder only deltaValX for pan
      let delta = deltaValX;
      if(!osmo.pzinteract.isTrackpadDetected)
        delta *= -1;
      //
      let oldPos = new osmo.scroll.PIXI.Point(osmo.scroll.mainStage.position.x, osmo.scroll.mainStage.position.y);
      osmo.scroll.mainStage.position = osmo.pzinteract.calculateCenter(oldPos, delta, 0, fac*osmo.scroll.pixiScale);
      //
    } else{
      //
      deltaValX = et.deltaX;
      deltaValY = et.deltaY;
      //
      let mouseX = osmo.pzinteract.mouseLoc.x*osmo.scroll.pixiScale;
      let mouseY = osmo.pzinteract.mouseLoc.y*osmo.scroll.pixiScale;
      // Consilder only deltaValY for zoom
      let delta = deltaValY;
      if(!osmo.pzinteract.isTrackpadDetected)
        delta *= -1;
      //
      let currentLegendID = osmo.legendinteract.currentFocus;
      if(osmo.scroll.datasets[currentLegendID].hasOwnProperty('zoom')){
        //
        let defaultZoomPercentage = osmo.scroll.datasets[currentLegendID].zoom.default;
        let minZoomPercentage = osmo.scroll.datasets[currentLegendID].zoom.min;
        let maxZoomPercentage = osmo.scroll.datasets[currentLegendID].zoom.max;
        //
        osmo.pzinteract.changeZoomAt(mouseX, mouseY, delta, false, minZoomPercentage/100, maxZoomPercentage/100);
      }else{
        let img_width = parseInt(osmo.legendsvg.popupBBoxes[currentLegendID]['dimensions'][0].width);
        let rs = (osmo.scroll.pixiHeight/osmo.scroll.refPopupSize.height);
        img_width *= rs;
        let zoomFac = 0.5 * osmo.scroll.pixiWidth / (1.0 * img_width);
        let minZoomFac = self.minZoom*zoomFac/osmo.scroll.pixiScale;
        let maxZoomFac = self.maxZoom*zoomFac/osmo.scroll.pixiScale;
        //
        osmo.pzinteract.changeZoomAt(mouseX, mouseY, delta, false, minZoomFac, maxZoomFac);
      }
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
  calculateZoom(oldZoom, delta, factor=1.0,  min, max, restricted=true){
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
      if(newZoom <= this.defaultZoom*min)
        newZoom = this.defaultZoom*min;
      if(newZoom > this.defaultZoom*max)
        newZoom = this.defaultZoom*max;
    }
    //
    return newZoom;
  }

  /**
   * ------------------------------------------------
   * changeZoomAt
   * ------------------------------------------------
   */
  changeZoomAt(mouseX, mouseY, delta, animate=false, min = this.minZoom, max = this.maxZoom){
    //
    let fac = 1.0;
    let currentZoom = osmo.scroll.mainStage.scale.x;
    let newScale = osmo.pzinteract.calculateZoom(currentZoom, delta, fac,  min, max, true);
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
        self.updateSoundArea();
        //
        console.log(zoomPercentage + ' ' + min + ' ' + max);
        if(zoomPercentage <= min){
          // Out of min range
          $('#zoom-out').attr('disabled', true);
          $('#zoom-out').removeClass('zoom-active');
          $('#zoom-out').addClass('zoom-inactive');
        }else if(zoomPercentage >= max){
          // Out of max range
          $('#zoom-in').attr('disabled', true);
          $('#zoom-in').removeClass('zoom-active');
          $('#zoom-in').addClass('zoom-inactive');
        }else{
          // Must be in-between
          if($('#zoom-in').is(':disabled')){
            $('#zoom-in').attr('disabled', false);
            $('#zoom-in').removeClass('zoom-inactive');
            $('#zoom-in').addClass('zoom-active');
          }
          if($('#zoom-out').is(':disabled')){
            $('#zoom-out').attr('disabled', false);
            $('#zoom-out').removeClass('zoom-inactive');
            $('#zoom-out').addClass('zoom-active');
          }
        }
        //
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
      if(zoomPercentage <= min){
        // Out of min range
        $('#zoom-out').attr('disabled', true);
        $('#zoom-out').removeClass('zoom-active');
        $('#zoom-out').addClass('zoom-inactive');
      }else if(zoomPercentage >= max){
        // Out of max range
        $('#zoom-in').attr('disabled', true);
        $('#zoom-in').removeClass('zoom-active');
        $('#zoom-in').addClass('zoom-inactive');
      }else{
        // Must be in-between
        if($('#zoom-in').is(':disabled')){
          $('#zoom-in').attr('disabled', false);
          $('#zoom-in').removeClass('zoom-inactive');
          $('#zoom-in').addClass('zoom-active');
        }
        if($('#zoom-out').is(':disabled')){
          $('#zoom-out').attr('disabled', false);
          $('#zoom-out').removeClass('zoom-inactive');
          $('#zoom-out').addClass('zoom-active');
        }
      }
      //
      if(osmo.mc)
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
