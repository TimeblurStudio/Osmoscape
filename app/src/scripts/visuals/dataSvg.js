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
		this.PAPER = osmo.scroll.PAPER;

		//@private
		this.quality = 'HQ';
		this.scrollWidth;
		this.scrollHeight;
		this.scale;
		this.mainScroll;
		this.backgroundLayer;
		this.backgroundTweenItem;

		// Methods
		this.init;
		this.update;
	}


	/**
   * ------------------------------------------------
   * Initalize splash
   * ------------------------------------------------
   */
	initSplash(_width){
		//
		console.log('osmo.dataSvg - initSplash');
		//
		// SPLASH
		//
		let raster = new this.PAPER.Raster('splash');
		// Scale the raster
		this.scale = _width/raster.width;
		raster.scale(this.scale);
		console.log('Main image scale - ' + this.scale);
		// Move the raster to the center of the view
		raster.position = this.PAPER.view.center;
		raster.position.y -= 20;
		//
		// SCROLL TEXT
		//
		let textLoc = new this.PAPER.Point(raster.position.x - raster.width*this.scale/3, raster.position.y + raster.height*this.scale*0.65);
		let text = new this.PAPER.PointText(textLoc);
		text.justification = 'left';
		text.fillColor = '#b97941';
		text.fontFamily = 'Roboto';
		text.fontSize = window.isMobile?'12px':'18px';
		text.content = window.isMobile?'Hold & Scroll to explore':'Scroll to explore';
		let textWidth = text.bounds.width;
		//
		// SCROLL ARROW
		//
		let start = new this.PAPER.Point(textLoc.x + textWidth + 10, textLoc.y - 5);
		let end = new this.PAPER.Point(start.x+(raster.width*this.scale/2)-textWidth, start.y);
		let line = new this.PAPER.Path();
		line.strokeColor = '#b97941';
		line.moveTo(start);
		line.lineTo(end);
		let size = window.isMobile?4:8;
		var triangle = new this.PAPER.Path.RegularPolygon(new this.PAPER.Point(end.x, end.y+(size/4)), 3, size);
		triangle.rotate(90);
		triangle.fillColor = '#b97941';
		//
		//
	}


	/**
   * ------------------------------------------------
   * Initalize
   * ------------------------------------------------
   */
	init(q){
		this.backgroundLayer = new this.PAPER.Layer();
		//
		//
		this.backgroundTweenItem = new this.PAPER.Shape.Circle(new this.PAPER.Point(0,0), 30);
		this.backgroundTweenItem.fill = 'none';
		this.backgroundTweenItem.stroke = 'none';
		this.backgroundTweenItem.position = new this.PAPER.Point(0,0);
		this.backgroundLayer.addChild(this.backgroundTweenItem);
		//

		//
		console.log('osmo.dataSvg - initStars');
		this.quality = q;
		//
		if(this.quality == 'High'){
			//
			let self = this;
			//HQscroll
			// Create a raster item using the image tag with id=''
			var imageElementHQ = document.getElementById('HQscroll');
			let raster = new this.PAPER.Raster(imageElementHQ);
			raster.on('load', function() {
				self.mainScroll = raster;
				self.backgroundLayer.addChild(self.mainScroll);
				// Scale the raster
				self.scale = osmo.scroll.paperHeight/raster.height;
				raster.scale(self.scale);
				//
				// Move the raster to the center of the view
				raster.position = self.PAPER.view.center;
				raster.position.x = (osmo.scroll.paperWidth*3/4) + (raster.width*self.scale/2);
				//
				self.scrollWidth = raster.width*self.scale;
				self.scrollHeight = osmo.scroll.paperHeight;
			});
			//
		}else if(this.quality == 'Mobile'){
			//
			let self = this;
			//MQscroll
			// Create a raster item using the image tag with id=''
			var imageElementMQ = document.getElementById('MQscroll');
			let raster = new this.PAPER.Raster(imageElementMQ);
			raster.on('load', function() {
				//
				self.mainScroll = raster;
				self.backgroundLayer.addChild(self.mainScroll);
				// Scale the raster
				self.scale = osmo.scroll.paperHeight/raster.height;
				raster.scale(self.scale);
				// Move the raster to the center of the view
				raster.position = self.PAPER.view.center;
				raster.position.x = (osmo.scroll.paperWidth*3/4) + (raster.width*self.scale/2);
				//
				self.scrollWidth = raster.width*self.scale;
				self.scrollHeight = osmo.scroll.paperHeight;
				//
			});
		}else if(this.quality == 'Retina'){
			//
			let self = this;
			//RQscroll
			// Create a raster item using the image tag with id=''
			var imageElementRQ = document.getElementById('RQscroll');
			let raster = new this.PAPER.Raster(imageElementRQ);
			raster.on('load', function() {
				self.mainScroll = raster;
				self.backgroundLayer.addChild(self.mainScroll);
				// Scale the raster
				self.scale = osmo.scroll.paperHeight/raster.height;
				raster.scale(self.scale);
				//
				// Move the raster to the center of the view
				raster.position = self.PAPER.view.center;
				raster.position.x = (osmo.scroll.paperWidth*3/4) + (raster.width*self.scale/2);
				//
				self.scrollWidth = raster.width*self.scale;
				self.scrollHeight = osmo.scroll.paperHeight;
			});
		}
		//
	}

	/**
   * ------------------------------------------------
   * Frame updated
   * ------------------------------------------------
   */
	update(event){

	}


};