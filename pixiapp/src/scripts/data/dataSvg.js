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
 * class:  dataSvg
 * desc:
 * ------------------------------------------------
 */
osmo.dataSvg = class {

  constructor(){
    console.log('osmo.dataSvg - constructor');

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
    console.log('osmo.dataSvg - init');
    this.quality = q;
    //
    this.backgroundContainer = new this.PIXI.Container();
    osmo.scroll.mainStage.addChild(this.backgroundContainer);
    //
  }

  initSVGscroll(_url){
    //
    //Create the sprite
    let scroll_01 = new this.PIXI.Sprite(this.PIXI.Loader.shared.resources[_url+'01-or8.png'].texture);
    let scroll_02 = new this.PIXI.Sprite(this.PIXI.Loader.shared.resources[_url+'02-or8.png'].texture);
    osmo.scroll.mainScroll = { 'part1': scroll_01, 'part2' : scroll_02 };
    //
    // Scale the raster
    let s = osmo.scroll.pixiHeight/scroll_01.height;
    osmo.scroll.mainScrollScale = s;
    console.log('MAIN SCALE: ' + s);
    //
    scroll_01.scale.set(s, s);
    scroll_02.scale.set(s, s);
    //
    this.scrollWidth = scroll_01.width*2;
    this.scrollHeight = osmo.scroll.pixiHeight;
    //
    //Change the sprite's position
    scroll_01.x = (osmo.scroll.pixiWidth*3/4);
    scroll_02.x = scroll_01.x + scroll_01.width;
    //
    //Add the scroll to the stage
    this.backgroundContainer.addChild(scroll_01);
    this.backgroundContainer.addChild(scroll_02);
    //
  }




  /**
   * ------------------------------------------------
   * Initalize splash
   * ------------------------------------------------
   */
  initSplash(_width){
    console.log('osmo.dataSvg - initSplash');
    let self = this;
    //
    let splashURL = './assets/images/OsmoSplash.png';
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
        splashSprite.y = osmo.scroll.pixiHeight/2;
        //
          
        //
        // SCROLL TEXT & ARROW
        //
        const style = new self.PIXI.TextStyle({
          fontFamily: 'Roboto',
          fontSize: window.isMobile?12:18,
          fill: '#b97941'
        });
        let text = new self.PIXI.Text(window.isMobile?'Hold & Scroll to explore':'Scroll to explore',style);
        let textLoc = new self.PIXI.Point(splashSprite.x - splashSprite.width/3 + 15, splashSprite.y + splashSprite.height*0.4);
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
        self.backgroundContainer.addChild(text);
        self.backgroundContainer.addChild(line);
        self.backgroundContainer.addChild(triangle);
        //
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