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
 * class:  legendInteraction
 * desc:
 * ------------------------------------------------
 */
osmo.legendInteraction = class {

  constructor(){
    console.log('osmo.legendInteraction - constructor');
    //
    this.PIXI = osmo.scroll.PIXI;
    //
    this.cursorLoading = null;
    this.prevHitResultName = null;
    this.currentFocus = null;
    this.prevBoundsCenter = null;
    this.prevZoom = null;
    //
  }


  init(){
    console.log('osmo.legendInteraction.init - started');
    //
    //
    //
    let self = this;
    $('#popcancel').click(function(){
      self.closeLegendPopup();
    });
    //
    //
  }

  initMaskInteractions(){
    console.log('osmo.legendInteraction.initMaskInteractions - started'); 
    //
    let self = this;
    for (let id in osmo.legendsvg.datasets){
      if(osmo.legendsvg.popupBBoxes.hasOwnProperty(id)){
        let mask = osmo.legendsvg.popupBBoxes[id]['mask'];
        if(mask != null){
          //
          mask.interactive = true;
          mask.buttonMode = true;
          //
          //
          mask.on('pointerdown', function(){
            //
            console.log('Clicked inside hitArea for mask-'+id);
            self.showLegend(id);
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
            osmo.legendsvg.removeHighlight(id);
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



  /*
   * ------------------------------------------------
   * Show legend
   * ------------------------------------------------
   */
  showLegend(number){
    console.log('Opening legend ' + number);
    //
    $('#focused-info').animate({ left:'0px'}, 1200);
    $('.nav').hide();
    //
    osmo.scroll.hitPopupMode = 'focused';
    osmo.datasvg.backgroundContainer.visible = false;
    osmo.legendsvg.maskContainer.visible = false;
    osmo.legendsvg.legendContainer.visible = true;
    //
    this.currentFocus = number;
    console.log('Focused on: ' + this.currentFocus );
    //
    //
    $('#focused-heading').text(osmo.legendsvg.datasets[this.currentFocus].title);
    $('#focused-description').text(osmo.legendsvg.datasets[this.currentFocus].desc);
    //
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
    //
    this.prevBoundsCenter = new this.PIXI.Point(osmo.scroll.mainStage.position.x, osmo.scroll.mainStage.position.y);
    var newViewCenter = new this.PIXI.Point(-1*_x*osmo.scroll.pixiScale, osmo.scroll.pixiHeight/2 - _y - _height/2);
    osmo.scroll.mainStage.position = newViewCenter;
    /*
    // Zoom into selected area!
    this.prevZoom = zoomFac;
    let zoomFac = fac * 0.5 * pixiWidth / (1.0 * _width);
    mainStage.scale.x = mainStage.scale.y = changeZoom(this.prevZoom, -1, zoomFac, false);
    */
    //
    $('body').css('background-color',  '#6d7c80'); 
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
    $('#focused-cta').hide();
    //
    $('#focused-info').animate({ left:'-500px'}, 600);
    //$('#focused-info').hide();
    $('.nav').show();
    $('body').css('background-color',  '#b5ced5');
    //
    document.body.style.cursor = 'default';
    //
    //
    osmo.datasvg.backgroundContainer.visible = true;
    osmo.legendsvg.maskContainer.visible = true;
    osmo.legendsvg.legendContainer.visible = false;
    for(let i=0; i<osmo.legendsvg.legendFiles.length; i++)
      if(osmo.legendsvg.legendFiles[i].visible)
        osmo.legendsvg.legendFiles[i].visible = false;
    let fac = 1.005;//1.005/(mainStage.scale.x*mainStage.scale.y);
    let newCenter = this.prevBoundsCenter;
    let zoomFac = this.prevZoom;
    let deltaValX = newCenter.x - osmo.scroll.mainStage.position.x;
    let deltaValY = -(newCenter.y - osmo.scroll.mainStage.position.y);
    //
    //mainStage.scale.x = mainStage.scale.y = changeZoom(mainStage.scale.x, -1, zoomFac, false);
    osmo.scroll.mainStage.position = osmo.pzinteract.changeCenter(osmo.scroll.mainStage.position, deltaValX, deltaValY, fac);
    //
    this.currentFocus = null;
    osmo.scroll.hitPopupMode = 'hovering';
    //
  }


};