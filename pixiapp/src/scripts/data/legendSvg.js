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
 * class:  Legend
 * desc:
 * ------------------------------------------------
 */
osmo.legendSvg = class {

  constructor(){
    console.log('osmo.Legend - constructor');
    // ----------------
    // Lib
    // ----------------
    this.PIXI = osmo.scroll.PIXI;

    //@private
    this.datasets = {};
    this.loadIndividualFiles = false;
    this.mergedPolygons = {};
    this.mergedLegends = {};
    this.earlySVGDataPromises = [];
    this.allSVGDataPromises = [];
    this.popupBBoxes = {};
    this.maskAreas = [];
    this.legendFiles = [];
    this.maskContainer;
    this.legendContainer;
    this.maskAlpha = 0;

    // Methods
    this.init;
    this.loadDatasets;
  }

  init(){
    let self = this;
    console.log('osmo.Legend - init');
    //
    //
    let dataURL = './assets/data/dataSummary.json' + '?v=' + window.version;
    console.log('dataURL: ' + dataURL);
    $.getJSON(dataURL, function( data ) {
      console.log('Loaded datasets summary');
      //
      let dataWaitInterval = setInterval(function(){
        if(osmo.datasvg){
          if(osmo.scroll.mainScroll != null && !jQuery.isEmptyObject(self.mergedLegends) && !jQuery.isEmptyObject(self.mergedPolygons)){
            //
            clearInterval(dataWaitInterval);
            self.datasets = data;
            self.loadDatasets();
            //
          }
        }
      },1000);
      //
    });
    //
    let legendsURL = './assets/data/mergedLegends.json' + '?v=' + window.version;
    console.log('mergedLegendURL: ' + legendsURL);
    $.getJSON(legendsURL, function( data ) {
      self.mergedLegends = data;
      console.log('Loaded legend files');
    });
    //
    let polygonsURL = './assets/data/mergedPolygons.json' + '?v=' + window.version;
    console.log('mergedPolygonsURL: ' + polygonsURL);
    $.getJSON(polygonsURL, function( data ) {
      self.mergedPolygons = data;
      console.log('Loaded polgon files');
    });
    //
    //
    this.legendContainer = new this.PIXI.Container();
    this.maskContainer = new this.PIXI.Container();
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
  loadDataset(id, early=true){
    if (this.datasets.hasOwnProperty(id)) {
      console.log('Loading data for : ' + id);
      //
      let legenddata = this.mergedLegends[id];
      let polygondata = JSON.parse(this.mergedPolygons[id]);
      //
      //
      let lpath = this.datasets[id].legendpath;
      let title = this.datasets[id].title;
      //
      //
      let morder = this.datasets[id].order;
      if(morder != 'front' && morder != 'back')
        morder = null;
      //
      //
      if(this.datasets[id].hasOwnProperty('popdimensions')){
        console.log('Loading dimensions for : ' + id);
        //
        let dim = this.datasets[id].popdimensions;
        this.popupBBoxes[id] = {
          mask: null,
          legend: null,
          paths: [],
          rects: [],
          dimensions: dim,
          polygons: this.datasets[id].physics
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
      let maskpromise = this.maskLoad(title, polygondata, id, morder);
      let legendpromise = this.legendLoad(title, legenddata, lpath, id, this.loadIndividualFiles);
      //
      if(early){
        this.earlySVGDataPromises.push(maskpromise);
        this.earlySVGDataPromises.push(legendpromise);
      }else{
        this.allSVGDataPromises.push(maskpromise);
        this.allSVGDataPromises.push(legendpromise);
      }
      //
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
    let count = 0;
    for (let id in this.datasets){
      count++;
      setTimeout(function(){self.loadDataset(id, true);}, 10*count);
    }
    //
    //
    Promise.all(this.earlySVGDataPromises).then((values) => {
      console.log('Processing early datasets...');
      $('#percentage').html('Processing datasets...');
      setTimeout(function(){
        console.log('Loaded all datasets');
        osmo.scroll.loaded.svgdata = true;
        if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata){
          //
          osmo.navinteract.loadNav();
          osmo.navinteract.initNav();
          //
          //
          window.loading_screen.finish();
          osmo.bgaudio.start();
          //
          ///document.body.style.cursor = 'none';
          ///$('.cursor-pointer-wrapper').css('opacity', 1);
          //
        }
        ///self.correctMaskOrder();
        //
      }, 4000);
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
  maskLoad(title, polygons, num, order = null){
    let self = this;
    //
    console.log('maskLoad called');
    const mpromise = new Promise((resolve, reject) => {
      //
      if(self.popupBBoxes[num] != undefined){
        //
        let _x = parseInt(self.popupBBoxes[num]['dimensions'][0].x);
        let _y = parseInt(self.popupBBoxes[num]['dimensions'][0].y);
        let _width = parseInt(self.popupBBoxes[num]['dimensions'][0].width);
        let _height = parseInt(self.popupBBoxes[num]['dimensions'][0].height);
        //
        let rs = (osmo.scroll.pixiHeight/osmo.scroll.refPopupSize.height);
        _x *= rs;
        _y *= rs;
        _width *= rs;
        _height *= rs;
        //
        let graphics = new self.PIXI.Graphics();
        graphics.beginFill(0xFFA500);
        graphics.lineStyle(1, 0xFF0000);
        graphics.alpha = self.maskAlpha;
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
        }
        //
        mask.scale.set(maskScale, maskScale);
        mask.x = osmo.scroll.pixiWidth*3/4;
        //
        //
        mask.interactive = true;
        mask.buttonMode = true;
        mask.on('pointerdown', function(){
          //
          console.log('Clicked inside hitArea for mask-'+num);
          //showLegend(num);
          //
        });
        mask.on('pointerover', function(){
          //
          console.log('Hover on mask-'+num);
          osmo.scroll.mainScroll['part1'].alpha = 0.1;
          osmo.scroll.mainScroll['part2'].alpha = 0.1;
          //
          for(let i=0; i<self.maskAreas.length; i++)
            self.maskAreas[i].alpha = 0;
          mask.alpha = self.maskAlpha;
          //
          self.legendContainer.visible = true;
          for(let i=0; i<self.legendFiles.length; i++)
            if(self.legendFiles[i].visible)
              self.legendFiles[i].visible = false;
          //
          self.popupBBoxes[num].legend.visible = true;
        });
        mask.on('pointerout', function(){
          //
          console.log('Hover out of mask-'+num);
          osmo.scroll.mainScroll['part1'].alpha = 1;
          osmo.scroll.mainScroll['part2'].alpha = 1;
          for(let i=0; i<self.maskAreas.length; i++)
            self.maskAreas[i].alpha = self.maskAlpha;
          //
          self.legendContainer.visible = false;
          for(let i=0; i<self.legendFiles.length; i++)
            if(self.legendFiles[i].visible)
              self.legendFiles[i].visible = false;
          //
        });
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
  legendLoad(title, svgxml, svgpath, num, frompath){
    //
    let self = this;
    const lpromise = new Promise((resolve, reject) => {
      //
      //
      //
      //
      //
      //
      let svgScale = 8.0;
      let newViewPort_x, legendTexture;
      if(!frompath){
        //
        [svgxml, newViewPort_x] = self.updateSVGviewbox(svgxml, num);
        //
        var parser = new DOMParser();
        var doc = parser.parseFromString(svgxml, 'image/svg+xml');
        let serialized = new XMLSerializer().serializeToString(doc);
        var svgEncoded = 'data:image/svg+xml;base64,' + window.btoa(serialized);
        //
        let resource = new self.PIXI.SVGResource (svgEncoded, {scale: svgScale});
        legendTexture = self.PIXI.Texture.from(resource, {resolution: 1.0});
        //
      }else
        legendTexture = self.PIXI.Texture.from(svgpath, {resolution: 1.0});
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
          let percmask = 0.5*parseFloat(self.maskAreas.length)/parseFloat(Object.keys(self.datasets).length);
          let percleg = 0.5*parseFloat(self.legendFiles.length)/parseFloat(Object.keys(self.datasets).length);
          let percentage = '&nbsp;&nbsp;' + parseInt((percmask + percleg)*100) + '%';
          $('#percentage').html(percentage);
          //
          //
          if(self.popupBBoxes[num] != undefined)
            self.popupBBoxes[num]['legend'] = legend;
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
          //
          //
          let lms = osmo.scroll.pixiHeight/legendTexture.height;
          console.log('LEGEND SCALE: ' + lms);
          //
          if(!frompath)
            legend.x = newViewPort_x*lms*svgScale + osmo.scroll.pixiWidth*3/4;
          else
            legend.x = osmo.scroll.pixiWidth*3/4;
          legend.scale.set(lms, lms);
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
   * updateSVGviewbox
   * ------------------------------------------------
   */
  updateSVGviewbox(svgxml, num){
    let self = this;
    //
    var svgContainer = document.createElement('div');
    svgContainer.innerHTML = svgxml;
    let svgEle = svgContainer.getElementsByTagName('svg')[0];
    let viewPort = svgEle.getAttribute('viewBox');
    if (!viewPort)
      viewPort = svgEle.getAttribute('x') 
                 + ' ' + svgEle.getAttribute('y')
                 + ' ' + svgEle.getAttribute('width') 
                 + ' ' + svgEle.getAttribute('height');
    console.log(num + ' old viewport: ' + viewPort)
    let currentViewPort_x = viewPort.split(' ')[0];
    let currentViewPort_y = viewPort.split(' ')[1];
    let currentViewPort_width = viewPort.split(' ')[2];
    let currentViewPort_height = viewPort.split(' ')[3];
    //
    let newViewPort = viewPort;
    let newViewPort_x = currentViewPort_x;
    let newViewPort_y = currentViewPort_y;
    let newViewPort_width = currentViewPort_width;
    let newViewPort_height = currentViewPort_height;
    //
    let midX = 0;
    if(self.popupBBoxes.hasOwnProperty(num)){
      // Position of selected area!
      let _x = parseFloat(self.popupBBoxes[num]['dimensions'][0].x);
      let _y = parseFloat(self.popupBBoxes[num]['dimensions'][0].y);
      let _width = parseFloat(self.popupBBoxes[num]['dimensions'][0].width);
      let _height = parseFloat(self.popupBBoxes[num]['dimensions'][0].height);
      //
      let rs = (osmo.scroll.pixiHeight/osmo.scroll.refPopupSize.height);
      _x *= rs; _y *= rs;
      _width *= rs;
      _height *= rs;
      console.log(num + ' popupBBoxes: '+ _x + ' ' + _y + ' ' + _width + ' ' + _height)
      //
      midX = _x + _width/2;
      let xRange = 2000;
      if(_width > xRange) xRange = _width;  
      //
      newViewPort_x = midX - xRange;
      if(newViewPort_x < 0) newViewPort_x = 0;
      newViewPort_width = xRange;
    }
    newViewPort = newViewPort_x + ' ' + newViewPort_y + ' '  + newViewPort_width + ' '  + newViewPort_height;
    //
    if(num != '0a' || num != '0b'){
      svgEle.removeAttribute('style');
      svgEle.removeAttribute('x');
      svgEle.removeAttribute('y');
      svgEle.removeAttribute('width'); 
      svgEle.removeAttribute('height');
      svgEle.removeAttribute('viewBox');
      //
      svgEle.setAttribute('x', newViewPort_x + 'px');
      svgEle.setAttribute('y', newViewPort_y + 'px');
      svgEle.setAttribute('width', newViewPort_width + 'px');
      svgEle.setAttribute('height', newViewPort_height + 'px');
      svgEle.setAttribute('viewBox', newViewPort);
      console.log(num + ' new viewport: ' + newViewPort);
    } 
    //
    svgxml = svgEle.outerHTML;
    return [svgxml, newViewPort_x];
  }

};