/*global osmo:true $:true*/

/**
 * ------------------------------------------------
 * AUTHOR: Himanshu erande (rndexe)
 * Copyright 2021 - 2022
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:   SoundInteractionArea
 * desc:
 * ------------------------------------------------
 */
osmo.SoundInteractionArea = class {

  constructor(){
    console.log('osmo.SoundInteractionArea - constructor');
    //
    // ----------------
    // Lib
    // ----------------
    this.PIXI = osmo.scroll.PIXI;
    this.TONE = osmo.scroll.TONE;
    //
    //@private
    //
    this.areaContainer;
    //
  }

  /**
   * ------------------------------------------------
   * Init
   * ------------------------------------------------
   */
  init(){
    console.log('osmo.SoundInteractionArea - init');
    this.areaContainer = new this.PIXI.Container();
  }

  /**
   * ------------------------------------------------
   * set new
   * ------------------------------------------------
   */
  setNew(num,s,pos) {
    this.loadNew(num);
    this.setInitialPositionAndScale(num,s,pos);
  }

  /**
   * ------------------------------------------------
   * set inital position and scale
   * ------------------------------------------------
   */
  setInitialPositionAndScale(num,s,pos) {
    this.areaContainer.scale.set(s);
    this.areaContainer.position = pos;
    this.currentBounds = this.areaContainer.getBounds();
  }

  /**
   * ------------------------------------------------
   * update position and scale
   * ------------------------------------------------
   */
  updatePositionAndScale(num,s,pos) {
    this.areaContainer.scale.set(s);
    this.areaContainer.position = pos;
    this.currentBounds = this.areaContainer.getBounds();
  }
    
  /**
   * ------------------------------------------------
   * set new position and scale
   * ------------------------------------------------
   */
  setNewPositionAndScale(num, newx, newy) {
    this.areas[num].x = newx;
    this.areas[num].y = newy;
    this.currentBounds = this.areas[num].getBounds();
    //     console.log("Position:",this.areas[num].getBounds());
  }


  /**
   * ------------------------------------------------
   * load new
   * ------------------------------------------------
   */
  loadNew(num) {
    //
    let splid = num;
    let hasSpecialFile = osmo.scroll.datasets[num].hasOwnProperty('speciallegend');
    if(osmo.scroll.includeSpecialCase && hasSpecialFile)
      splid = num + '_spl';
    //
    this.areaContainer.removeChildren();
    let soundArea = JSON.parse(osmo.legendsvg.mergedSoundAreas[splid]);
    let shapeArray = soundArea.shapes;
    for ( const shape in shapeArray) {
      console.log('Loading ' + shape + ' sound area');
      let s = shapeArray[shape].reduce((graphics, shape, index, array) => {
        graphics.beginFill(0x00A555);
        graphics.alpha = 0.1;
        graphics.drawPolygon(shape.shape);
        if (index === array.length - 1) {
          graphics.endFill();
          graphics.visible = true;
        }
        return graphics;
      }, new this.PIXI.Graphics());
      this.areaContainer.addChild(s);
    }
    //
  }

  /**
   * ------------------------------------------------
   * contains point
   * ------------------------------------------------
   */
  containsPoint(pos) {
    //
    let shapeArray = this.areaContainer.children; 
    let contains = false;
    //
    for (const shape in shapeArray) {
      if (shapeArray[shape].containsPoint(pos)){
        contains = true;
        return contains;
      }
    }
    //
    return contains;
  }

};
