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
 * class:  testShapes
 * desc:
 * ------------------------------------------------
 */
osmo.testShapes = class {

  constructor(){
    console.log('osmo.testShapes - constructor');

    // ----------------
    // Lib
    // ----------------
    this.PAPER = osmo.scroll.PAPER;

    //@private

    // Methods
    this.init;
  }


  /**
   * ------------------------------------------------
   * Initalize stars
   * ------------------------------------------------
   */
  init(){
    console.log('osmo.testShapes - initStars');
    //


    //
    //
    this.addBackground();
    // Add grid
    let grid = this.createGrid();
    grid.position = this.PAPER.view.center;
    grid.opacity = 1;
    // Add shapes
    let shapes = this.newRandomShapes();
    shapes.position = this.PAPER.view.center;
    shapes.opacity = 1;

  }


  /**
   * ------------------------------------------------
   * addBackground
   * ------------------------------------------------
   */
  addBackground(){
    //
    var rect = new this.PAPER.Path.Rectangle({
      point: [0, 0],
      size: [this.PAPER.view.size.width, this.PAPER.view.size.height],
      strokeColor: '#222',
      fillColor: '#222'
    });
    rect.sendToBack();
  }

  /**
   * ------------------------------------------------
   * createLines - Add '+' shape at the center
   * ------------------------------------------------
   */
  createGrid(){
    // NOTE
    // - Grid doesn't appear in Android devices, Problem with pixel ratio? OR works only on Apple devices!?
    // - Grid size dynamic i.e. based on screen size! Little scalling would help. Min - 300px Max - SomeX pixels
    // - Also whatsup with retina display? - Again, Consilder pixel ratio globally!

    // Add grid from center of the canvas - and - store in group
    let group = new this.PAPER.Group();
    //
    let settings = {
      Size : new this.PAPER.Size(120, 120),
      UnitLength : 5
    };


    let size = settings.Size;
    let unit_length = settings.UnitLength;
    let color = settings.Color;
    let stroke_width = settings.StrokeWidth;

    // Vertical lines
    for (let i = 0; i <= unit_length*size.width; i += unit_length){
      let vLine = new this.PAPER.Path.Line({ segments: [[i , 0], [i, unit_length*size.width]] });
      vLine.set(this.lineStyle(i));
      group.addChild(vLine);
    }

    // Horizontal lines
    for (let i = 0; i <= unit_length*size.height; i += unit_length){
      let hLine = new this.PAPER.Path.Line({ segments: [[0 , i], [unit_length*size.height, i]] });
      hLine.set(this.lineStyle(i));
      group.addChild(hLine);
    }

    return group;

  }

  /**
   * ------------------------------------------------
   * lineStyle - Thick and Thin lines
   * ------------------------------------------------
   */
  lineStyle(coord){
    let settings = {
      Color : 'rgba(255,255,255,0.5)',
      ThinLineOpacity : 0.25,
      ThickLineOpacity : 0.5,
      ThinLineStrokeWidth : 0.4,
      ThickLineStrokeWidth : 1
    };

    if (coord % 50 === 0)
      return {
        strokeColor: settings.Color,
        strokeWidth: settings.ThickLineStrokeWidth,
        opacity: settings.ThickLineOpacity
      };
    else
      return {
        strokeColor: settings.Color,
        strokeWidth: settings.ThinLineStrokeWidth,
        opacity: settings.ThinLineOpacity
      };
  }


  /**
   * ------------------------------------------------
   * Random shapes inside grid
   * ------------------------------------------------
   */
  newRandomShapes(){
    let settings = {
      Size : new this.PAPER.Size(120, 120),
      UnitLength : 5
    };

    // Add grid from center of the canvas - and - store in group
    let group = new this.PAPER.Group();

    //
    let circles;
    let colors = ['orange', 'pink', 'purple', 'lightgreen', 'tomato'];
    //
    for(let i=0; i < 6; i++){
      let randomPosition = this.PAPER.Point.random().multiply(settings.Size).multiply(5);
      let randomSize = Math.random() * 100;
      let col = colors[Math.floor(Math.random() * colors.length)];
      //
      let circle = new this.PAPER.Shape.Circle(randomPosition, randomSize);
      circle.fillColor = col;
      group.addChild(circle);
    }
    //
    return group;
  }



};