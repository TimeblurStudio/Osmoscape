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
      if(self.isSidebarOpen()){
        $('#popup-info-toggle').html('&gt;');
        $('#focused-info').animate({ left:'-33%'}, 600);
      }else {
        $('#popup-info-toggle').html('&lt;');
        $('#focused-info').animate({ left:'0%'}, 600);
      }
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
              self.showLegend(id);
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
        $('.cursor-txt').show();
        setTimeout(function(){  $('.cursor-txt').html('Scroll to zoom');  }, 4000);
        setTimeout(function(){  $('.cursor-txt').hide();  }, 8000);
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
      <p>${osmo.scroll.datasets[this.currentFocus].desc}</p>
      <br>
      <br>
      <span style="font-weight: 400;">Sound description:</span>
      <p style="margin-top: 0;">${osmo.scroll.datasets[this.currentFocus].sounddesc}</p>`;
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
    let zoomFac = 0.5 * osmo.scroll.pixiWidth / (1.0 * _width);
    let delta = -1*(zoomFac - 1)*100*0.5;//75% of required scale
    let focusedCenterX = (left_shift+focused_width/2)*osmo.scroll.pixiScale;
    let focusedCenterY = (osmo.scroll.pixiHeight/2)*osmo.scroll.pixiScale;
    let newScale = osmo.pzinteract.changeZoomAt(focusedCenterX, focusedCenterY, delta, true);
    //mainStage.scale.x = mainStage.scale.y = changeZoom(this.prevZoom, -1, zoomFac, false);
    //
    // MOLECULE INTERACTION
    this.createMoleculeInteraction(newScale);
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
    osmo.scroll.mainStage.position = osmo.pzinteract.calculateCenter(osmo.scroll.mainStage.position, deltaValX, deltaValY, fac);
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
    // POSITION SOUND INATRACTION AREA
    let maskScale = osmo.legendsvg.popupBBoxes[this.currentFocus].maskScale;
    let offset = 0;
    if (this.currentFocus === '-1') offset = 495;//(9945 - 9693);
    else if (this.currentFocus === '0') offset = (9945 - 9601);
    else if (this.currentFocus === '64')  offset = (9945 - 9459);
    else  offset = 495;
    offset -= 2; // NOTE: CORRECTING FOR MINOR OFFSET (WHILE GENERATING THE SOUND AREA MAY BE?)
    osmo.soundareas.setNew(this.currentFocus, maskScale, new this.PIXI.Point(offset*maskScale+osmo.scroll.pixiWidth*3/4,0));
    // ADD SOUND EFFECTS
    osmo.soundeffects = new osmo.SoundEffects();
    osmo.soundeffects.init();
    osmo.soundeffects.setNewBuffer(this.currentFocus, osmo.scroll.datasets[this.currentFocus].audiofile);
    //
    // ADD MOLECULE
    osmo.mc = new osmo.MoleculeController();
    osmo.mc.init(osmo.scroll.mainStage.position);
    osmo.scroll.mainStage.addChild(osmo.mc.moleculeContainer);
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
    //
    osmo.scroll.mainStage.removeChild(osmo.mc.moleculeContainer);
    osmo.mc = null;
    delete osmo.mc;
    //
    osmo.soundeffects.stopPlayers();
    //
    osmo.scroll.mainStage.removeChild(osmo.soundareas.areaContainer);
    osmo.soundareas = null;
    delete osmo.soundareas;
    //
  }

};