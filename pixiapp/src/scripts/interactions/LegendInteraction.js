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

//
import {} from '../audio/SoundEffects';
import {} from '../data/SoundInteractionArea';
import {} from '../interactions/MoleculeController';

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:  LegendInteraction
 * desc:
 * ------------------------------------------------
 */
osmo.LegendInteraction = class {

  constructor(){
    console.log('osmo.LegendInteraction - constructor');
    //
    this.PIXI = osmo.scroll.PIXI;
    this.TWEENMAX = osmo.scroll.TWEENMAX;
    this.POWER4 = osmo.scroll.POWER4;
    //
    this.prevHitResultName = null;
    //
    this.currentFocus = null;
    this.dragMode = false;
    this.loadingStage = null;
    //
    this.prevBoundsCenter = null;
    this.prevZoom = null;
    //
  }


  init(){
    console.log('osmo.LegendInteraction.init - started');
    //
    //
    //
    let self = this;
    $('#popcancel').click(function(){
      self.closeLegendPopup();
      osmo.pzinteract.resetZoom();
    });
    //    
    $('#popup-info-toggle').click(function(){
      if(self.isSidebarOpen())
        setTimeout(function(){  self.closeSidebar();  }, 100);
      else
        setTimeout(function(){  self.openSidebar();  }, 100);
    });
    
    let desc = $('#focused-description');
    
    desc[0].scrollTop = desc.offset().top;
    
    desc.click(function(){
      
      console.log(desc[0].scrollTop);
      console.log(desc[0].scrollHeight);
      // if scroll is at bottom of div, click to scroll to top again
      // otherwise scroll down in increments of clientheight
      if ((desc[0].clientHeight+desc[0].scrollTop) >= desc[0].scrollHeight) {
        desc.animate({
          scrollTop: 0 
        }, 'slow');
      } else {
        desc.animate({
          scrollTop: desc[0].clientHeight + desc[0].scrollTop
        }, 'slow');
      }
      //$('#focused-description')[0].scrollTo({
      //  top: ($('#focused-description')[0].scrollHeight),
      //  behavior: 'smooth'
      //});

    });
    //
    $('#focused-info').mouseenter(function(){
      $('#cursor').hide();
    });
    $('#focused-info').mouseleave(function(){
      $('#cursor').show();
    });
    //
  }

  openSidebar(){
    let dur = 600;
    $('#popup-info-toggle').html('&lt;');
    $('#focused-info').animate({ left:'0%'}, dur);
    //
    let fac = 0.5;///osmo.scroll.mainStage.scale.x;
    let deltaValX = (osmo.scroll.pixiWidth/3);
    let oldPos = new osmo.scroll.PIXI.Point(osmo.scroll.mainStage.position.x, osmo.scroll.mainStage.position.y);
    let newPos = osmo.pzinteract.calculateCenter(oldPos, deltaValX, 0, fac*osmo.scroll.pixiScale, false);
    //console.log('open to: ' + oldPos.x + ' ' + newPos.x + ' ' + fac);
    this.TWEENMAX.to(osmo.scroll.mainStage.position, dur/1000, {
      x: newPos.x,
      ease: this.POWER4.easeInOut
    });
  }

  closeSidebar(){
    let dur = 600;
    $('#popup-info-toggle').html('&gt;');
    $('#focused-info').animate({ left:'-33%'}, dur);
    //
    let fac = 0.5;///osmo.scroll.mainStage.scale.x;
    let deltaValX = -1*(osmo.scroll.pixiWidth/3);
    let oldPos = new osmo.scroll.PIXI.Point(osmo.scroll.mainStage.position.x, osmo.scroll.mainStage.position.y);
    let newPos = osmo.pzinteract.calculateCenter(oldPos, deltaValX, 0, fac*osmo.scroll.pixiScale, false);
    //console.log('close to: ' + oldPos.x + ' ' + newPos.x + ' ' + fac);
    this.TWEENMAX.to(osmo.scroll.mainStage.position, dur/1000, {
      x: newPos.x,
      ease: this.POWER4.easeInOut
    });
  }

  initMaskInteractions(){
    console.log('osmo.LegendInteraction.initMaskInteractions - started'); 
    //
    let self = this;
    for (let id in osmo.scroll.datasets){
      if(osmo.legendsvg.popupBBoxes.hasOwnProperty(id)){
        let mask = osmo.legendsvg.popupBBoxes[id]['mask'];
        if(mask != null){
          //
          mask.interactive = true;
          //mask.buttonMode = true;
          //mask.cursor = 'none';
          //
          //
          //
          mask.on('pointerdown', function(){
            //
            console.log('Clicked inside hitArea for mask-'+id);
            if(osmo.legendsvg.cursorLoading == null){
              //
              if(osmo.legendsvg.cursorTextTimeout != null)
                clearTimeout(osmo.legendsvg.cursorTextTimeout);
              osmo.legendsvg.cursorTextTimeout = null;
              //
              if(!osmo.pzinteract.isTrackpadDetected){
                if(osmo.legendsvg.highlightedLegendId == null){
                  setTimeout(function(){
                    console.log('Hover on mask -'+id);
                    osmo.legendsvg.highlightLegend(id, mask);
                  }, 100);
                }else{
                  if(osmo.legendsvg.highlightedLegendId == id){
                    console.log('open legend -'+id);
                    self.showLegend(id);  
                  }
                }
              }else{
                self.showLegend(id);
              }
              //
            }
            //
          });
          mask.on('pointerover', function(){
            //
            console.log('Hover on mask-'+id);
            osmo.legendsvg.highlightLegend(id, mask);
            //
          });
          mask.on('pointerout', function(){
            //
            console.log('Hover out of mask-'+id);
            osmo.legendsvg.removeHighlight();
            //
          });
          //
          //
        }
      }
      //
      //
    }
    //
  }


  isSidebarOpen(){
    return $('#popup-info-toggle').html() == '&lt;';
  }

  /*
   * ------------------------------------------------
   * Show legend
   * ------------------------------------------------
   */
  showLegend(number){
    //
    for(let i=0; i<osmo.legendsvg.legendFiles.length; i++)
      if(osmo.legendsvg.legendFiles[i].visible)
        osmo.legendsvg.legendFiles[i].visible = false;
    //
    console.log('Opening legend ' + number);
    osmo.legendsvg.legendClicksCount++;
    //
    // Stop all tracks from playing
    for (let audioid in osmo.scroll.datasets)
      osmo.legendaudio.audioPlayerInstances[audioid].stop();
    
    //
    $('#focused-info').animate({ left:'0px'}, 1200);
    $('.nav').hide();
    $('#chapter-text').hide();
    //
    osmo.scroll.hitPopupMode = 'focused';
    osmo.datasvg.backgroundContainer.visible = false;
    osmo.legendsvg.maskContainer.visible = false;
    osmo.legendsvg.legendContainer.visible = true;
    //
    //
    if(this.loadingStage != null)
      clearTimeout(this.loadingStage);
    this.loadingStage = null;
    // Also make sure it's not in loading stage
    $('.cursor-pointer').css('border', 'none');
    $('.cursor-loading-full').show();
    $('.cursor-pointer-dot').hide();
    $('.cursor-txt').hide();
    //this.reset_animation('cursor-clcf', 'cursor-loading-circle');
    //this.reset_animation('cursor-clf', 'cursor-loading-full');
    this.dragMode = false;
    //
    let self = this;
    this.loadingStage = setTimeout(function(){
      //
      if(this.loadingStage != null)
        clearTimeout(this.loadingStage);
      this.loadingStage = null;
      //
      $('.cursor-loading-full').hide();
      $('.cursor-pointer-dot').show();
      if(osmo.legendsvg.legendClicksCount < 2){
        $('.cursor-txt').html('Click & drag');
        $('.cursor-txt').fadeIn(1000);
        setTimeout(function(){  $('.cursor-txt').html('Pinch to zoom');  }, 4000);
        setTimeout(function(){  $('.cursor-txt').fadeOut();  }, 8000);
      }
      self.dragMode = true;
    },1000);
    //
    //document.body.style.cursor = 'zoom-in';
    //
    
    //
    this.currentFocus = number;
    console.log('Focused on: ' + this.currentFocus );
    //
    //
    $('#focused-heading').text(osmo.scroll.datasets[this.currentFocus].title);
    let description = `
      <br>
      <span style="font-weight: 400;">Sound description:</span>
      <p style="margin-top: 0;">${osmo.scroll.datasets[this.currentFocus].sounddesc}</p>
      <br>
      <span style="font-weight: 400;">Data description:</span>
      <p style="margin-top: 0;">${osmo.scroll.datasets[this.currentFocus].desc}</p>`;
    $('#focused-description').html(description);
    //
    setTimeout(function(){
      let headingHeight = $('#focused-heading').height();
      $('#focused-description').height(`calc(100% - ${headingHeight}px)`);
    },50);
    //
    $('#head-normal-view').hide();
    $('#focused-cta').show();
    $('#focused-info').show();
    //
    //
    let legend = osmo.legendsvg.popupBBoxes[this.currentFocus].legend;
    let hasSpecialFile = osmo.legendsvg.popupBBoxes[number].spllegend;
    if(osmo.scroll.includeSpecialCase && hasSpecialFile){
      legend = osmo.legendsvg.popupBBoxes[this.currentFocus].spllegend;
    }
    legend.visible = true;
    //
    //
    // Position into selected area!
    let _x = parseInt(osmo.legendsvg.popupBBoxes[this.currentFocus]['dimensions'][0].x);
    let _y = parseInt(osmo.legendsvg.popupBBoxes[this.currentFocus]['dimensions'][0].y);
    let _width = parseInt(osmo.legendsvg.popupBBoxes[this.currentFocus]['dimensions'][0].width);
    let _height = parseInt(osmo.legendsvg.popupBBoxes[this.currentFocus]['dimensions'][0].height);
    //
    let rs = (osmo.scroll.pixiHeight/osmo.scroll.refPopupSize.height);
    _x *= rs;
    _y *= rs;
    _width *= rs;
    _height *= rs;
    _x += osmo.scroll.pixiWidth*3/4;
    let left_corner = -1*_x;
    let left_shift = osmo.scroll.pixiWidth*0.33;
    let focused_width = osmo.scroll.pixiWidth*(1-0.33);
    let centerShiftX = (focused_width/2) - (_width/2);
    //
    this.prevBoundsCenter = new this.PIXI.Point(osmo.scroll.mainStage.position.x, osmo.scroll.mainStage.position.y);
    let newViewCenter = new this.PIXI.Point((left_corner + left_shift + centerShiftX)*osmo.scroll.pixiScale, (-1*_y + (osmo.scroll.pixiHeight- _height)/2)*osmo.scroll.pixiScale);//  *osmo.scroll.pixiScale + osmo.scroll.pixiHeight*osmo.scroll.pixiScale/2 - _height*osmo.scroll.pixiScale/2);
    osmo.scroll.mainStage.position = newViewCenter;
    //
    // Zoom into selected area!
    this.prevZoom = osmo.scroll.mainStage.scale.x;
    let focusedCenterX = (left_shift+focused_width/2)*osmo.scroll.pixiScale;
    let focusedCenterY = (osmo.scroll.pixiHeight/2)*osmo.scroll.pixiScale;
    //
    let newScale = this.prevZoom;
    if(osmo.scroll.datasets[this.currentFocus].hasOwnProperty('zoom')){
      //
      let defaultZoomPercentage = osmo.scroll.datasets[this.currentFocus].zoom.default;
      let minZoomPercentage = osmo.scroll.datasets[this.currentFocus].zoom.min;
      let maxZoomPercentage = osmo.scroll.datasets[this.currentFocus].zoom.max;
      //
      newScale = (defaultZoomPercentage/osmo.pzinteract.defaultZoom)*osmo.scroll.pixiScale;
      newScale /= 100;
      //
      let delta = delta = (1-newScale)*100;
      newScale = osmo.pzinteract.changeZoomAt(focusedCenterX, focusedCenterY, delta, true, minZoomPercentage/100, maxZoomPercentage/100);
      //
    }else{
      let zoomFac = 0.5 * osmo.scroll.pixiWidth / (1.0 * _width);
      let delta = -1*(zoomFac - 1)*100*0.75;//75% of required scale
      let minZoomFac = osmo.pzinteract.minZoom*zoomFac/osmo.scroll.pixiScale;
      let maxZoomFac = osmo.pzinteract.maxZoom*zoomFac/osmo.scroll.pixiScale;
      newScale = osmo.pzinteract.changeZoomAt(focusedCenterX, focusedCenterY, delta, true, minZoomFac, maxZoomFac);
    }

    //
    // MOLECULE INTERACTION
    $('#dragmol').click(function() {
      if(osmo.mc == null)
        self.createMoleculeInteraction(newScale);
    });
    $('#addcomp').click(function() {
      window.open('https://app.osmoscape.com/nonlinear-composition', '_blank').focus();
    });
    //
    $('body').css('background-color',  '#A3BDC7'); 
    //
    //
  }

  /*
   * ------------------------------------------------
   * Close popup
   * ------------------------------------------------
   */
  closeLegendPopup(){
    //
    osmo.legendsvg.removeHighlight();
    osmo.pzinteract.isDragging = false;
    //
    $('dragmol').unbind();
    // REMOVE MOLECULE INTERACTION
    this.destroyMoleculeInteraction();
    //
    $('#focused-description').height('100%');
    $('#head-normal-view').show();
    $('#focused-cta').hide();
    $('#popup-info-toggle').html('&lt;');
    $('#focused-info').animate({ left:'-33%'}, 600);
    $('#focused-info').hide();
    $('#zoom-level').text('100%');
    //
    $('.nav').show();
    $('#chapter-text').show();
    $('body').css('background-color',  '#b5ced5');
    //
    //document.body.style.cursor = 'default';
    //
    //
    osmo.datasvg.backgroundContainer.visible = true;
    osmo.legendsvg.maskContainer.visible = true;
    osmo.legendsvg.legendContainer.visible = false;
    for(let i=0; i<osmo.legendsvg.legendFiles.length; i++)
      if(osmo.legendsvg.legendFiles[i].visible)
        osmo.legendsvg.legendFiles[i].visible = false;
    //
    //
    
    if(this.loadingStage != null)
      clearTimeout(this.loadingStage);
    this.loadingStage = null;
    //
    $('.cursor-pointer').css('border', '2px solid white');
    $('.cursor-loading').hide();
    $('.cursor-loading-full').hide();
    $('.cursor-pointer-dot').hide();
    $('.cursor-txt').html('');
    $('.cursor-txt').hide();
    this.dragMode = false;
    //document.body.style.cursor = 'default';
    //
    let fac = 1.005;//1.005/(mainStage.scale.x*mainStage.scale.y);
    let newCenter = this.prevBoundsCenter;
    let zoomFac = this.prevZoom;
    let deltaValX = newCenter.x - osmo.scroll.mainStage.position.x;
    let deltaValY = -(newCenter.y - osmo.scroll.mainStage.position.y);
    //
    //mainStage.scale.x = mainStage.scale.y = changeZoom(mainStage.scale.x, -1, zoomFac, false);
    let oldPos = new osmo.scroll.PIXI.Point(osmo.scroll.mainStage.position.x, osmo.scroll.mainStage.position.y);
    osmo.scroll.mainStage.position = osmo.pzinteract.calculateCenter(oldPos, deltaValX, deltaValY, fac);
    //
    this.currentFocus = null;
    osmo.scroll.hitPopupMode = 'hovering';
    //
  }

  /*
   * ------------------------------------------------
   * createMoleculeInteraction
   * desc: Create sound areas, add sound effects and add molecule
   * ------------------------------------------------
   */
  createMoleculeInteraction(newScale){
    //
    // ADD SOUND INTERACTION AREA
    osmo.soundareas = new osmo.SoundInteractionArea();
    osmo.soundareas.init();
    osmo.scroll.mainStage.addChild(osmo.soundareas.areaContainer);
    // POSITION SOUND INTERACTION AREA
    let maskScale = osmo.legendsvg.popupBBoxes[this.currentFocus].maskScale;
    let offset = 0;
    if (this.currentFocus === '-1') offset = 495;//(9945 - 9693);
    else if (this.currentFocus === '0') offset = (9945 - 9601);
    else if (this.currentFocus === '64')  offset = (9945 - 9459);
    else  offset = 495;
    offset -= 2; // NOTE: CORRECTING FOR MINOR OFFSET (OFFSET GOT ADDED WHILE GENERATING THE SOUND AREA MAY BE?)
    osmo.soundareas.setNew(this.currentFocus, maskScale, new this.PIXI.Point(offset*maskScale+osmo.scroll.pixiWidth*3/4,0));
    // ADD SOUND EFFECTS
    osmo.soundeffects = new osmo.SoundEffects();
    osmo.soundeffects.init(this.currentFocus);
    osmo.soundeffects.setNewBuffer(this.currentFocus, osmo.scroll.datasets[this.currentFocus].audiofile);
    let currentTrack = osmo.bgaudio.currentTrack;
    if (currentTrack !== 'intro') {
      if ( currentTrack === 'base3' )
        osmo.bgaudio.baseTracks[currentTrack].volume.rampTo(-18,1);
      else if (currentTrack === 'base5' )
        osmo.bgaudio.baseTracks[currentTrack].volume.rampTo(-12,1);
      else 
        osmo.bgaudio.baseTracks[currentTrack].volume.rampTo(-6,1);
    }
    //
    // ADD MOLECULE
    osmo.mc = new osmo.MoleculeController();
    osmo.mc.init(osmo.scroll.mainStage.position);
    osmo.scroll.mainStage.addChild(osmo.mc.moleculeContainer);
    
    // START TICKER AND ANIMATION
    osmo.scroll.mainApp.ticker.add(osmo.mc.animateMolecule);
    //
    let zoomPercentage = (newScale/osmo.pzinteract.defaultZoom);
    let dur = 500;// half a second
    this.TWEENMAX.to(osmo.mc.moleculeContainer.scale, dur/1000, {
      x: 1/zoomPercentage,
      y: 1/zoomPercentage,
      ease: this.POWER4.easeInOut
    });
    //
    //
  }

  /*
   * ------------------------------------------------
   * destroyMoleculeInteraction
   * desc: Destroy molecule and sound effects
   * ------------------------------------------------
   */
  destroyMoleculeInteraction(){
    
    if (osmo.bgaudio.currentTrack !== 'intro')
      osmo.bgaudio.baseTracks[osmo.bgaudio.currentTrack].volume.rampTo(0,1);
    if(osmo.mc){
      // STOP TICKER AND ANIMATION
      osmo.scroll.mainApp.ticker.remove(osmo.mc.animateMolecule);
      //
      osmo.scroll.mainStage.removeChild(osmo.mc.moleculeContainer);
      osmo.mc.moleculeContainer = null;
      osmo.mc = null;
      delete osmo.mc;
    }
    //
    if(osmo.soundeffects)
      osmo.soundeffects.stopPlayers();
    //
    if(osmo.soundareas){
      osmo.scroll.mainStage.removeChild(osmo.soundareas.areaContainer);
      osmo.soundareas = null;
      delete osmo.soundareas;
    }
    //
  }

};
