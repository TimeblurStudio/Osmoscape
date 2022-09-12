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
 * class:  DataSvg
 * desc:
 * ------------------------------------------------
 */
osmo.DataSvg = class {

  constructor(){
    console.log('osmo.DataSvg - constructor');

    // ----------------
    // Lib
    // ----------------
    this.PIXI = osmo.scroll.PIXI;

    //@private
    this.quality;
    this.scrollWidth;
    this.scrollHeight;
    this.scale;
    this.mainScroll;
    this.backgroundContainer;
    
    // Methods
    this.init;
    this.initSplash;
    this.createTriangle;
  }



  /**
   * ------------------------------------------------
   * Initalize
   * ------------------------------------------------
   */
  init(q){
    //
    console.log('osmo.DataSvg - init');
    this.quality = q;
    //
    this.backgroundContainer = new this.PIXI.Container();
    osmo.scroll.mainStage.addChild(this.backgroundContainer);
    //
  }

  initSVGscroll(_url){
    //
    //Create sprites
    let scroll_length = 8;
    let scrollArray = [];
    osmo.scroll.mainScroll = {};
    for(let i=0; i < scroll_length; i++){
      let part_index = i+1;
      let png_path = _url+'0'+part_index+'-or8.png';
      console.log('Loading scroll part - ' + png_path);
      let part_scroll = new this.PIXI.Sprite(this.PIXI.Loader.shared.resources[png_path].texture);
      scrollArray.push(part_scroll);
      osmo.scroll.mainScroll['part'+part_index] = part_scroll;
    }
    //
    // Scale the raster
    let s = osmo.scroll.pixiHeight/scrollArray[0].height;
    osmo.scroll.mainScrollScale = s;
    console.log('MAIN SCALE: ' + s);
    //
    for(let i=0; i < scroll_length; i++)
      scrollArray[i].scale.set(s, s);
    //
    this.scrollWidth = scrollArray[0].width*scroll_length;
    this.scrollHeight = osmo.scroll.pixiHeight;
    //
    scrollArray[0].x = osmo.scroll.pixiWidth*3/4;
    for(let i=1; i < scroll_length; i++)
      scrollArray[i].x = scrollArray[i-1].x + scrollArray[0].width;
    //
    //Add the scroll to the stage
    for(let i=0; i < scroll_length; i++)
      this.backgroundContainer.addChild(scrollArray[i]);
    //
  }




  /**
   * ------------------------------------------------
   * Initalize splash
   * ------------------------------------------------
   */
  initSplash(_width){
    console.log('osmo.DataSvg - initSplash');
    let self = this;
    //
    let splashURL = './assets/images/OsmoSplashNew.png';
    self.PIXI.Loader.shared
      .add(splashURL)
      .load(function(){
        console.log('Loaded sprite');
        //Create the sprite
        let splashSprite = new self.PIXI.Sprite(self.PIXI.Loader.shared.resources[splashURL].texture);
        self.backgroundContainer.addChild(splashSprite);
        //
        // Scale the raster
        let s = _width/splashSprite.width;
        splashSprite.scale.set(s, s);
        //
        //
        splashSprite.anchor.x = 0.5;
        splashSprite.anchor.y = 0.5;
        // Move the raster to the center of the view
        splashSprite.x = osmo.scroll.pixiWidth/2;
        splashSprite.y = osmo.scroll.pixiHeight/2;// - splashSprite.height*osmo.scroll.pixiScale/2;
        //
        /*
        //
        // SCROLL TEXT & ARROW
        //
        const style = new self.PIXI.TextStyle({
          fontFamily: 'Roboto',
          fontSize: window.isMobile?12:18,
          fill: '#b97941'
        });
        let text = new self.PIXI.Text(window.isMobile?'Hold & Scroll to explore':'Scroll to explore',style);
        let textLoc = new self.PIXI.Point(splashSprite.x - splashSprite.width/3 + 15, splashSprite.y + splashSprite.height*0.6);
        text.x = textLoc.x;
        text.y = textLoc.y;
        //
        let start = new self.PIXI.Point(textLoc.x + text.width + 10, textLoc.y+12);
        let end = new self.PIXI.Point((splashSprite.width - text.width)/2, 0);
        let line = new self.PIXI.Graphics();
        line.position.set(start.x, start.y);
        line.lineStyle(1, 0xb97941)
          .moveTo(0, 0)
          .lineTo(end.x, end.y);
        let size = window.isMobile?4:8;
        let triangle = self.createTriangle(start.x+end.x, start.y+end.y+(size/2), size, 0xb97941);
        triangle.rotation = -Math.PI/2;
        //
        self.backgroundContainer.addChild(line);
        self.backgroundContainer.addChild(triangle);
        */
      });
    //
  }


  createTriangle(xPos, yPos, _scale, _color) {
    var _triangle = new this.PIXI.Graphics();
    //
    _triangle.x = xPos;
    _triangle.y = yPos;
    //
    var triangleWidth = _scale,
      triangleHeight = triangleWidth,
      triangleHalfway = triangleWidth/2;
    // draw _triangle
    _triangle.beginFill(_color, 1);
    _triangle.lineStyle(0, _color, 1);
    _triangle.moveTo(triangleWidth, 0);
    _triangle.lineTo(triangleHalfway, triangleHeight);
    _triangle.lineTo(0, 0);
    _triangle.lineTo(triangleHalfway, 0);
    _triangle.endFill();
    //
    return _triangle;
  }

};
