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
 * class:  LegendSvg
 * desc:
 * ------------------------------------------------
 */
osmo.LegendSvg = class {

  constructor(){
    console.log('osmo.Legend - constructor');
    // ----------------
    // Lib
    // ----------------
    this.PIXI = osmo.scroll.PIXI;
    this.TWEENMAX = osmo.scroll.TWEENMAX;
    this.POWER4 = osmo.scroll.POWER4;

    //@private
    this.mergedPolygons = {};
    this.mergedSoundAreas = {};
    this.allSVGDataPromises = [];
    this.popupBBoxes = {};
    this.maskAreas = [];
    this.legendFiles = [];
    this.maskContainer;
    this.legendContainer;
    this.maskAlpha = 0;
    this.highlightTweens = [];
    this.removeHighlightTweens = [];
    //
    this.legendClicksCount = 0;
    this.highlightedLegendId = null;
    this.highlightedLegendWaitTimeout = null;
    //

    // Methods
    this.init;
    this.loadDatasets;
  }

  init(){
    let self = this;
    console.log('osmo.Legend - init');
    //
    //
    let dataWaitInterval = setInterval(function(){
      if(osmo.datasvg){
        if(osmo.scroll.mainScroll != null && !jQuery.isEmptyObject(self.mergedPolygons) && !jQuery.isEmptyObject(self.mergedSoundAreas)){
          //
          clearInterval(dataWaitInterval);
          self.loadDatasets();
          //
        }
      }
    },1000);
    //
    let polygonsURL = './assets/data/mergedPolygons.json' + '?v=' + window.version;
    console.log('mergedPolygonsURL: ' + polygonsURL);
    $.getJSON(polygonsURL, function( data ) {
      self.mergedPolygons = data;
      console.log('Loaded polygons file');
    });
    //
    let soundAreasURL = './assets/data/mergedSoundAreas.json' + '?v=' + window.version;
    console.log('mergedSoundAreasURL: ' + soundAreasURL);
    $.getJSON(soundAreasURL, function( data ) {
      self.mergedSoundAreas = data;
      console.log('Loaded sound areas');
    });
    //
    //
    this.legendContainer = new this.PIXI.Container();
    this.maskContainer = new this.PIXI.Container();
    this.maskContainer.sortableChildren = true;
    //
    this.maskContainer.visible = true;
    this.legendContainer.visible = false;
    //
    osmo.scroll.mainStage.addChild(this.legendContainer, this.maskContainer);
    //
  }

  /**
   * ------------------------------------------------
   * loadDataset
   * ------------------------------------------------
   */
  loadDataset(id){
    if (osmo.scroll.datasets.hasOwnProperty(id)) {
      console.log('Loading data for : ' + id);
      //
      let polygondata = JSON.parse(this.mergedPolygons[id]);
      //
      //
      let lpath = osmo.scroll.datasets[id].legendpngpath;
      let title = osmo.scroll.datasets[id].title;
      let zorder = osmo.scroll.datasets[id].zorder;
      //
      //
      if(osmo.scroll.datasets[id].hasOwnProperty('popdimensions') && osmo.scroll.datasets[id].hasOwnProperty('boundingbox')){
        console.log('Loading dimensions for : ' + id);
        //
        let dim = osmo.scroll.datasets[id].popdimensions;
        let bbox = osmo.scroll.datasets[id].boundingbox;
        this.popupBBoxes[id] = {
          mask: null,
          legend: null,
          paths: [],
          rects: [],
          boundingbox: bbox,
          dimensions: dim,
          polygons: osmo.scroll.datasets[id].physics,
          maskScale: 1,
          legendScale: 1
        };
        //
        //
        let count = this.popupBBoxes[id]['dimensions'].length;
        console.log('boxes: ' + count);
        //
        let s = osmo.scroll.mainScrollScale;
        let rs = (osmo.scroll.pixiHeight/osmo.scroll.refPopupSize.height);
        console.log('pixi scale ratio: ' + rs);
        //
        //
        this.maskContainer.visible = false;
        // Turn off all visuals
      }
      //
      //
      let maskpromise = this.maskLoad(title, polygondata, id, zorder);
      let legendpromise = this.legendLoad(title, lpath, id);
      this.allSVGDataPromises.push(maskpromise);
      this.allSVGDataPromises.push(legendpromise);
      //
      let hasSpecialFile = osmo.scroll.datasets[id].hasOwnProperty('speciallegend');
      if(osmo.scroll.includeSpecialCase && hasSpecialFile){
        let splid = id + '_spl';
        let spllpath = osmo.scroll.datasets[id].speciallegend;
        let spllegendpromise = this.legendLoad(title, spllpath, splid, true);
        this.allSVGDataPromises.push(spllegendpromise);
      }
      //
      //
    }
  }

  /**
   * ------------------------------------------------
   * loadDatasets
   * ------------------------------------------------
   */
  loadDatasets(){
    let self = this;
    //
    for (let id in osmo.scroll.datasets)
      self.loadDataset(id, true);
    //
    //
    Promise.all(this.allSVGDataPromises).then((values) => {
      console.log('Processing early datasets...');
      $('#percentage').html('Processing datasets...');
      setTimeout(function(){
        console.log('Loaded all datasets');
        osmo.scroll.loaded.svgdata = true;
        //
        ///self.correctMaskOrder();
        //
      }, 400);
    });
    //
  }

  /**
   * ------------------------------------------------
   * correctMaskOrder
   * ------------------------------------------------
   */
  correctMaskOrder(){
    //Enable mask layer to look for z-order index
    /*
    // bring some masks to front and others back
    for(let i=0; i<this.maskLayer.children.length; i++){
      let child = this.maskLayer.children[i];
      //
      let order = child.data.order;
      //
      if(order == 'back')
        child.sendToBack();
      if(order == 'front')
        child.bringToFront();
      //
    }
    */
  }


  /**
   * ------------------------------------------------
   * maskLoad
   * ------------------------------------------------
   */
  maskLoad(title, polygons, num, order = 0){
    let self = this;
    //
    console.log('maskLoad called');
    const mpromise = new Promise((resolve, reject) => {
      //
      if(self.popupBBoxes[num] != undefined){
        //
        let graphics = new self.PIXI.Graphics();
        graphics.beginFill(0xFFA500);
        graphics.lineStyle(1, 0xFF0000);
        graphics.alpha = self.maskAlpha;
        graphics.zIndex = order;
        //
        if(polygons.shapes != undefined){
          for (let s of polygons.shapes){
            graphics.drawPolygon(s.shape);
          }
        }
        self.popupBBoxes[num]['paths'].push(graphics);

        //
        let mask = graphics;
        self.maskAreas.push(mask);
        //
        if(mask.data == undefined)  mask.data = {};
        mask.data.legendName = 'legend-'+num;
        mask.data.maskName = 'mask-' + num;
        mask.data.id = num;
        mask.name = 'mask-' + num;
        mask.data.order = order;
        //
        //if(order == 'back')
        //  mask.sendToBack();
        //if(order == 'front')
        //  mask.bringToFront();
        //
        //mask.x = (pixiWidth*mainScrollScale*3/4);
        let maskScale = 1;
        if(polygons.viewport){
          let maskHeight = polygons.viewport.split(' ')[3];
          maskScale = osmo.scroll.pixiHeight/maskHeight;
          self.popupBBoxes[num].maskScale = maskScale;
        }
        //
        mask.scale.set(maskScale, maskScale);
        //
        // NOTE: Offset required since -1 and 0 datasets were added at the end 
        //       (effectively increasing the canvas width)
        //
        let offset = 0;
        if (num === '-1') offset = 495;//(9945 - 9693);
        else if (num === '0') offset = (9945 - 9601);
        else if (num === '64')  offset = (9945 - 9459);
        else  offset = 495;
        //
        //Change the legend's position with an added offset
        mask.x =  offset*maskScale + osmo.scroll.pixiWidth*3/4;
        //
        self.popupBBoxes[num]['mask'] = mask;
        self.maskContainer.addChild(mask);
        //
        resolve('m'+num);
      }
      //
      //
      //
    });
    //
    //
    return mpromise;
  }

  /**
   * ------------------------------------------------
   * legendLoad
   * ------------------------------------------------
   */
  legendLoad(title, pngpath, num, specialCase=false){
    //
    let self = this;
    const lpromise = new Promise((resolve, reject) => {
      //
      let svgScale = 8.0;
      let newViewPort_x, legendTexture;
      //
      legendTexture = self.PIXI.Texture.from(pngpath, {resolution: 1.0});
      //
      //
      let legendLoaded = false;
      legendTexture.on('update', () => {
        if(!legendLoaded){
          //
          let legend = new self.PIXI.Sprite(legendTexture);
          self.legendFiles.push(legend);
          //
          console.log('Loaded '+num+' legend');
          //
          let percmask = parseFloat(self.maskAreas.length)/parseFloat(Object.keys(osmo.scroll.datasets).length);
          let percleg = parseFloat(self.legendFiles.length)/parseFloat(Object.keys(osmo.scroll.datasets).length);
          let percaud = parseFloat(osmo.legendaudio.allTracksLoadedCount)/parseFloat(Object.keys(osmo.scroll.datasets).length);
          let percentage = '&nbsp;&nbsp;' + parseInt(((percmask + percleg + percaud)/3)*100) + '%';
          $('#percentage').html(percentage);
          //
          //
          if(specialCase){
            let nonsplid = num.replace('_spl', '');
            if(self.popupBBoxes[nonsplid] != undefined)
              self.popupBBoxes[nonsplid]['spllegend'] = legend;
          }else{
            if(self.popupBBoxes[num] != undefined)
              self.popupBBoxes[num]['legend'] = legend;
          }
          //
          //
          //
          if(legend.data == undefined)
            legend.data = {};
          legend.data.legendName = 'legend-'+num;
          legend.data.maskName = 'mask-' + num;
          legend.name = 'legend-' + num;
          legend.visible = false;
          //
          //
          let legendRefHeight = 0;
          if(specialCase){
            let nonsplid = num.replace('_spl', '');
            legendRefHeight = (self.popupBBoxes[nonsplid].boundingbox.height/623.5);
          }else{
            legendRefHeight = (self.popupBBoxes[num].boundingbox.height/623.5);
          }
          let legendScale = (legendRefHeight/legendTexture.height)*osmo.scroll.pixiHeight;
          legend.scale.set(legendScale,legendScale);
          console.log('LEGEND SCALE: ' + legendScale);
          //
          //
          // NOTE: Offset required since -1 and 0 datasets were added at the end 
          //       (effectively increasing the canvas width)
          //
          let offset = 0;
          if (num === '-1') offset = (9945 - 9683);
          else if (num === '0') offset = (9945 - 9601);
          else if (num === '64')  offset = (9945 - 9459);
          else  offset = 495;
          //
          //Change the legend's position with an added offset
          if(specialCase){
            let nonsplid = num.replace('_spl', '');
            legend.x = (self.popupBBoxes[nonsplid].boundingbox.x + offset)*(osmo.scroll.pixiHeight/623.5) + osmo.scroll.pixiWidth*3/4;
            legend.y = (self.popupBBoxes[nonsplid].boundingbox.y)*(osmo.scroll.pixiHeight/623.5);  
          }else{
            legend.x = (self.popupBBoxes[num].boundingbox.x + offset)*(osmo.scroll.pixiHeight/623.5) + osmo.scroll.pixiWidth*3/4;
            legend.y = (self.popupBBoxes[num].boundingbox.y)*(osmo.scroll.pixiHeight/623.5);  
          }
          //
          //
          self.legendContainer.addChild(legend);
          resolve('l'+num);
        }
        legendLoaded = true;
      });
      //
      //
    });
    //
    return lpromise;
  }

  /**
   * ------------------------------------------------
   * updateChildLegend
   * ------------------------------------------------
   */
  updateChildLegend(ch, d, t){
    for(let i=0; i < ch.length; i++){
      let child = ch[i];
      child.data.legendName = d;
      child.data.titleName = t;
      if(child.children != undefined)
        this.updateChildLegend(child.children, d, t);
    }
  }


  /**
   * ------------------------------------------------
   * Highlight a legend on hover
   * ------------------------------------------------
   */
  highlightLegend(id, mask){
    // If there are any active tweens which are from remove highlight,
    // Kill them all and initalize to empty since, we will override tween anyways under highlightLegend
    if(this.removeHighlightTweens.length > 0){
      for(let tweenid in this.removeHighlightTweens)
        this.removeHighlightTweens[tweenid].kill();
      this.removeHighlightTweens = [];
    }
    
    let scrollLength = Object.keys(osmo.scroll.mainScroll).length;
    for(let i=0; i < scrollLength; i++){
      let index = i+1;
      osmo.scroll.mainScroll['part'+index].alpha = 1;
    }
    this.legendContainer.alpha = 0;
    //
    let dur = 1000;
    this.highlightTweens.push(this.TWEENMAX.to(this.legendContainer, dur/1000, {
      alpha: 1,
      ease: this.POWER4.easeInOut
    }));
    for(let i=0; i < scrollLength; i++){
      let index = i+1;
      this.highlightTweens.push(this.TWEENMAX.to(osmo.scroll.mainScroll['part'+index], dur/1000, {
        alpha: 0.05,
        ease: this.POWER4.easeInOut
      }));
    }
    //
    let titleName = osmo.scroll.datasets[id].title;
    //
    this.legendContainer.visible = true;
    for(let i=0; i<this.legendFiles.length; i++)
      if(this.legendFiles[i].visible)
        this.legendFiles[i].visible = false;
    //
    this.popupBBoxes[id].legend.visible = true;
    //
    //
    // Stop all tracks and start target track
    for (let audioid in osmo.scroll.datasets)
      osmo.legendaudio.audioPlayerInstances[audioid].stop();
    console.log('Now playing legend audio: ' + id);
    osmo.legendaudio.audioPlayerInstances[id].start();
    if (osmo.bgaudio.currentTrack !== 'intro')
      osmo.bgaudio.baseTracks[osmo.bgaudio.currentTrack].volume.rampTo(-6,1);
    //
    $('.cursor-pointer').css('border', '2px solid white');
    $('.cursor-loading').hide();
    $('.cursor-pointer-dot').show();
    $('.cursor-txt').html('<p style="text-shadow: 1px 1px 1.7px rgba(0, 0, 0, 0.65); white-space: break-spaces; padding: 2px 2px; transform: translateY(-100px);">'+ titleName + '\n(Tap to open)' +'</p>');
    $('.cursor-txt').fadeIn();
    this.reset_animation('cursor-clc', 'cursor-loading-circle');
    this.reset_animation('cursor-cl', 'cursor-loading');
    //
    //
    this.highlightedLegendId = id;
    this.highlightedLegendWaitTimeout = null;
    //
  }

  reset_animation(_id, _class) {
    /*
    var el = document.getElementById(_id);
    console.log(el);
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = null;
    */
    //
    let $target = $('#'+_id);
    $target.removeClass(_class);
    setTimeout( function(){
      $target.addClass(_class);
    },100);
    //
  }
  
  /**
   * ------------------------------------------------
   * Remove highlighted legend
   * ------------------------------------------------
   */
  removeHighlight(){
    // If there are any active tweens which are from highlight Legend,
    // Kill them all and initalize to empty since, we will override tween anyways under removeHighlight
    if(this.highlightTweens.length > 0){
      for(let tweenid in this.highlightTweens)
        this.highlightTweens[tweenid].kill();
      this.highlightTweens = [];
    }
    //
    let self = this;
    let scrollLength = Object.keys(osmo.scroll.mainScroll).length;
    let dur = 2000;
    for(let i=0; i < scrollLength; i++){
      let index = i+1;
      this.removeHighlightTweens.push(this.TWEENMAX.to(osmo.scroll.mainScroll['part'+index], dur/1000, {
        alpha: 1,
        ease: this.POWER4.easeInOut
      }));
    }
    this.removeHighlightTweens.push(this.TWEENMAX.to(this.legendContainer, dur/1000, {
      alpha: 0,
      ease: this.POWER4.easeInOut,
      onComplete: function(){
        // Hide all legends
        self.legendContainer.visible = false;
        for(let i=0; i<self.legendFiles.length; i++)
          if(self.legendFiles[i].visible)
            self.legendFiles[i].visible = false;
        //
      }
    }));
    // Stop all tracks
    for (let audioid in osmo.scroll.datasets)
      osmo.legendaudio.audioPlayerInstances[audioid].stop();
    //
    if (osmo.bgaudio.currentTrack !== 'intro')
      osmo.bgaudio.baseTracks[osmo.bgaudio.currentTrack].volume.rampTo(0,1);
    //
    $('.cursor-pointer').css('border', '2px solid white');
    $('.cursor-loading').hide();
    $('.cursor-loading-full').hide();
    $('.cursor-pointer-dot').hide();
    $('.cursor-txt').fadeOut();
    this.dragMode = false;
    osmo.pzinteract.isfocusedDragging = false;
    //
    this.highlightedLegendId = null;
    if(this.highlightedLegendWaitTimeout != null) clearTimeout(this.highlightedLegendWaitTimeout);
  }

};
