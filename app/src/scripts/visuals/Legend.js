/*global osmo:true $:true*/


/*
	*ADD AUTHOUR AND LISCENSE*
*/

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:	Legend
 * desc:
 * ------------------------------------------------
 */
osmo.Legend = class {

	constructor(){
		console.log('osmo.Legend - constructor');
		// ----------------
		// Lib
		// ----------------
		this.PAPER = osmo.scroll.PAPER;

		//@private
		this.datasets = {};
		this.earlySVGDataPromises = [];
		this.allSVGDataPromises = [];
		this.popupBBoxes = {};
		this.maskFiles = [];
		this.legendFiles = [];
		this.maskLayer;
		this.legendLayer;
		this.mousePos = null;
		this.maskHitOptions = {
			segments: false,
			stroke: false,
			fill: true,
			tolerance: 5
		};
		this.prevBoundsCenter = null;
		this.prevZoom = null;
		this.backgroundTweenItem;

		// Methods
		this.init;
		this.loadDatasets;
	}


	init(){
		console.log('osmo.Legend - init');
		//
		let dataURL = 'assets/data/dataSummary.json' + '?v=' + window.version;
		console.log('dataURL: ' + dataURL);
		//
		let self = this;
		$.getJSON(dataURL, function( data ) {
		  console.log('Loaded datasets summary');
		  //
		  let dataWaitInterval = setInterval(function(){
		  	if(osmo.datasvg){
		  		if(osmo.datasvg.mainScroll != null){
						clearInterval(dataWaitInterval);
						self.datasets = data;
			  		self.loadDatasets();
				  }
		  	}
		  },1000);
		  //
		});
		//
		this.maskLayer = new this.PAPER.Layer();
		this.legendLayer = new this.PAPER.Layer();
		//
		//
		this.backgroundTweenItem = new this.PAPER.Shape.Circle(new this.PAPER.Point(0,0), 30);
		this.backgroundTweenItem.fill = 'none';
		this.backgroundTweenItem.stroke = 'none';
		this.backgroundTweenItem.position = new this.PAPER.Point(0,0);
		this.maskLayer.addChild(this.backgroundTweenItem);
		//
	}

	loadDataset(id, early=true){
		if (this.datasets.hasOwnProperty(id)) {
	    console.log('Loading data for : ' + id);
	    //
	    let mpath = this.datasets[id].maskpath;
	    /*
	    if(window.debug){
	      let pieces = mpath.split('/');
	      let fname = pieces[pieces.length-1];
	      pieces[pieces.length-1] = 'Debug';
	      pieces.push(fname);
	      mpath = pieces.join('/');
	    }
	    */
	    let morder = this.datasets[id].order;
	    if(morder != 'front' && morder != 'back')
	    	morder = null;
	    //
	    let maskpromise = this.maskLoad(mpath, id, morder);
	    let legendpromise = this.legendLoad(this.datasets[id].legendpath, id);
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
	    if(this.datasets[id].hasOwnProperty('popdimensions')){
	    	console.log('Loading dimensions for : ' + id);
	    	//
	    	let dim = this.datasets[id].popdimensions;
	    	this.popupBBoxes[id] = {
	    		mask: null,
	    		legend: null,
	      	paths: [],
	      	rects: [],
	      	dimensions: dim
	      };
	      //
	      //
	      let count = this.popupBBoxes[id]['dimensions'].length;
				console.log('boxes: ' + count);
				//
				for(let i=0; i < count; i++){
					let s = osmo.scroll.paperHeight/osmo.datasvg.mainScroll.height;
		      //
					let _x = parseInt(this.popupBBoxes[id]['dimensions'][i].x) + (osmo.scroll.paperWidth*3/4);
					let _y = parseInt(this.popupBBoxes[id]['dimensions'][i].y);
					let _width = parseInt(this.popupBBoxes[id]['dimensions'][i].width);
					let _height = parseInt(this.popupBBoxes[id]['dimensions'][i].height);
					//
					let p1 = new this.PAPER.Point(_x, _y);
					let p2 = new this.PAPER.Point(_x+_width, _y+_height);
					let rectPath = this.newPopRect(p1,p2);
					this.legendLayer.addChild(rectPath);
					//
					let arec = new this.PAPER.Rectangle(p1,p2);
					let aprec = new this.PAPER.Path.Rectangle(arec);
					//
					this.popupBBoxes[id]['paths'].push(rectPath);
					this.popupBBoxes[id]['paths'][i].visible = false;
					this.popupBBoxes[id]['rects'].push(aprec);
					//console.log(popupBBoxes[id]['paths'][i]);
				}
				//
				this.maskLayer.visible = false;
	    }
	    //
	    //
		}
	}


	newPopRect(p1, p2) {
		// Create pixel perfect dotted rectable for drag selections.
		var half = new this.PAPER.Point(0.5 / this.PAPER.view.zoom, 0.5 / this.PAPER.view.zoom);
		var start = p1.add(half);
		var end = p2.add(half);
		var rect = new this.PAPER.CompoundPath();
		rect.moveTo(start);
		rect.lineTo(new this.PAPER.Point(start.x, end.y));
		rect.lineTo(end);
		rect.moveTo(start);
		rect.lineTo(new this.PAPER.Point(end.x, start.y));
		rect.lineTo(end);
		rect.strokeColor = '#009DEC';
		rect.strokeWidth = 1.0 / this.PAPER.view.zoom;
		rect.dashOffset = 0.5 / this.PAPER.view.zoom;
		rect.dashArray = [1.0 / this.PAPER.view.zoom, 1.0 / this.PAPER.view.zoom];
		rect.data.guide = true;
		rect.selected = false;
		return rect;
	};


	loadDatasets(){
		let self = this;
		//
		for (let id in this.datasets) {
			this.loadDataset(id, true);
			/*
			if(parseInt(id) < 15){
				loadDataset(id, true);
			}else{// delayed by 100 seconds
				setTimeout(function(){
					loadDataset(id, false);
				},100000);
			}
			*/
		}
		//
		//
		Promise.all(this.earlySVGDataPromises).then((values) => {
			console.log('Processing early datasets...');
			setTimeout(function(){
				console.log('Loaded all datasets');
			  osmo.scroll.loaded.svgdata = true;
	      if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata)
	      	window.loading_screen.finish();
				self.correctMaskOrder();
				//
			}, 4000);
		});

		//
		/*
		setTimeout(function(){// delayed by 120 seconds
			//
			Promise.all(allSVGDataPromises).then((values) => {
				console.log('Processing remaining datasets...');
				$('#status').text('Processing remaining datasets...');
				setTimeout(function(){
					correctMaskOrder();
					console.log('Loaded remaining datasets');
				}, 1500);
			});
			//
		}, 120000);
		*/
	}


	correctMaskOrder(){
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
	}

	//
	//
	//
	maskLoad(svgxml, num, order = null){
		let self = this;
		//
		console.log('maskLoad called');
		const mpromise = new Promise((resolve, reject) => {
			//
			this.PAPER.project.importSVG(svgxml, function(item){
				console.log('Loaded '+num+' mask');
				//
				let mask = item;
				self.maskFiles.push(mask);
				//
				if(self.popupBBoxes[num] != undefined)
					self.popupBBoxes[num]['mask'] = mask;
				//
				//
				//
				mask.data.legendName = 'legend-'+num;
				mask.data.maskName = 'mask-' + num;
				mask.name = 'mask-' + num;
				mask.data.order = order;
				//
				if(order == 'back')
					mask.sendToBack();
				if(order == 'front')
					mask.bringToFront();
				//
				if(mask.children != undefined)
					self.updateChildLegend(mask.children, mask.data.legendName);
				//
				//
				let s = osmo.scroll.paperHeight/osmo.datasvg.mainScroll.height;
				let lms = osmo.scroll.paperHeight/mask.bounds.height;//mask-scale
				//
				let percmask = 0.5*parseFloat(self.maskFiles.length)/parseFloat(Object.keys(self.datasets).length);
				let percleg = 0.5*parseFloat(self.legendFiles.length)/parseFloat(Object.keys(self.datasets).length);
				let percentage = '&nbsp;&nbsp;' + parseInt((percmask + percleg)*100) + '%';
				$('#percentage').html(percentage);
				//
				mask.scale(lms);
				mask.position = self.PAPER.view.center;
				mask.position.x = (osmo.scroll.paperWidth*3/4) + (mask.bounds.width/2) + (osmo.datasvg.mainScroll.width*s - mask.bounds.width);
				//
				self.maskLayer.addChild(mask);
				//
				resolve('m'+num);
			});
			//
		});
		//
		//
		return mpromise;
	}

	//
	//
	//
	updateChildLegend(ch, d){
		for(let i=0; i < ch.length; i++){
			let child = ch[i];
			child.data.legendName = d;
			if(child.children != undefined)
				this.updateChildLegend(child.children, d);
		}
	}

	//
	//
	//
	legendLoad(svgxml, num){
		let self = this;
		//
		const lpromise = new Promise((resolve, reject) => {
			//
			this.PAPER.project.importSVG(svgxml, function(item){
				console.log('Loaded '+num+' legend');
				$('#status').text('Loaded '+num+' legend');

				//
				let legend = item;
				self.legendFiles.push(legend);
				if(self.popupBBoxes[num] != undefined)
					self.popupBBoxes[num]['legend'] = legend;
				//
				//
				legend.name = 'legend-'+num;
				legend.visible = false;
				//
				//
				let s = osmo.scroll.paperHeight/osmo.datasvg.mainScroll.height;
				let lms = osmo.scroll.paperHeight/legend.bounds.height;//mask-scale
				//
				let percmask = 0.5*parseFloat(self.maskFiles.length)/parseFloat(Object.keys(self.datasets).length);
				let percleg = 0.5*parseFloat(self.legendFiles.length)/parseFloat(Object.keys(self.datasets).length);
				let percentage = '&nbsp;&nbsp;' + parseInt((percmask + percleg)*100) + '%';
				$('#percentage').html(percentage);
				//
				legend.scale(lms);
				legend.position = self.PAPER.view.center;
				legend.position.x = (osmo.scroll.paperWidth*3/4) + (legend.bounds.width/2) + (osmo.datasvg.mainScroll.width*s - legend.bounds.width);
				//
				self.legendLayer.addChild(legend);
				//
				resolve('l'+num);
			});
			//
		});
		//
		return lpromise;
	}


	/**
	 * ------------------------------------------------
	 * mouseMoved
	 * ------------------------------------------------
	 */
	mouseMoved(event){
		//
		let self = this;
		this.mousePos = event.point;
		//
		if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata){
			if(osmo.scroll.hitPopupMode != 'focused'){
				this.maskLayer.visible = true;

				Object.keys(this.popupBBoxes).forEach(function(key) {
					//
					let xMin = self.PAPER.view.center.x - osmo.scroll.paperWidth/2.0;
					let xMax = self.PAPER.view.center.x + osmo.scroll.paperWidth/2.0;
					//
					//
					if(self.popupBBoxes[key]['mask'].bounds.rightCenter.x > xMin && self.popupBBoxes[key]['mask'].bounds.leftCenter.x < xMax)
						self.popupBBoxes[key]['mask'].visible = true;
					//
				});

				//maskLayer.fillColor = 'black';
				//maskLayer.opacity = 0.5;
				this.hitMaskEffect(event.point, 'hover');
			}
		}
		//
	}

	/**
	 * ------------------------------------------------
	 * hitMaskEffect
	 * ------------------------------------------------
	 */
	hitMaskEffect(pt, ctype){
		let self = this;
		var hitResult = this.maskLayer.hitTest(pt, this.maskHitOptions);
		//
		let fromOpacity = osmo.datasvg.backgroundLayer.opacity, toOpacity;
		let fromColor = new this.PAPER.Color($('body').css('background-color')), toColor;
		let tweening = false;
		let dur = 800;
		let lg;
		let currentFocus = null;
		//
		//
		if(hitResult != null){
			//
			this.legendLayer.visible = true;
			lg = this.PAPER.project.getItem({name: hitResult.item.data.legendName});
			if(lg == null)	return;
			//
			if(ctype == 'hover'){
				//
				toOpacity = 0.25;
				toColor =  new this.PAPER.Color('#6d7c80');
				document.body.style.cursor = 'pointer';
				//
				this.prevBoundsCenter = null;
				this.prevZoom = null;
				currentFocus = null;
				//
			}
			//
			if(ctype == 'click'){
				//
				toOpacity = 0;
				toColor =  new this.PAPER.Color('#24292b');
				//
				osmo.scroll.hitPopupMode = 'focused';
				this.maskLayer.visible = false;
				document.body.style.cursor = 'zoom-in';
				//
				currentFocus = parseInt(hitResult.item.data.legendName.replace('legend-', ''));
				console.log('Focused on: ' + currentFocus );
				//
				if(this.popupBBoxes.hasOwnProperty(currentFocus)){
					let count = this.popupBBoxes[currentFocus]['paths'].length;
					for(let i=0; i < count; i++){
						this.popupBBoxes[currentFocus]['paths'][i].visible = false;// true to show rect box
						this.popupBBoxes[currentFocus]['paths'][i].selected = false;
					}
					//
					// Zoom into selected area!
					let fac = 1.005/(this.PAPER.view.zoom*this.PAPER.view.zoom);
					let currentViewCenter = this.PAPER.view.bounds.center;
					let newViewCenter = this.popupBBoxes[currentFocus]['paths'][0].bounds.center;
					let zoomFac = fac * 0.5 * osmo.scroll.paperWidth / (1.0 * this.popupBBoxes[currentFocus]['paths'][0].bounds.width);
					let deltaValX = newViewCenter.x - currentViewCenter.x + 250.0/zoomFac;
					let deltaValY = -(newViewCenter.y - currentViewCenter.y);
					//
					prevBoundsCenter = new this.PAPER.Point(this.PAPER.view.center.x, this.PAPER.view.center.y);
					this.PAPER.view.center = changeCenter(this.PAPER.view.center, deltaValX, deltaValY, fac, false);
					//
					//
					prevZoom = zoomFac;
					this.PAPER.view.zoom = changeZoom(this.PAPER.view.zoom, -1, zoomFac, false);
					//
				}
				//
			}
			//
			//
		}else{
			toOpacity = 1.0;
			toColor =  new this.PAPER.Color('#b5ced5');
			//
			this.legendLayer.visible = false;
			document.body.style.cursor = 'default';
			for(let i=0; i<this.legendLayer.children.length; i++){
				let child = this.legendLayer.children[i];
				child.visible = false;
			}
			//
		}
		//
		if(!tweening){
			setTimeout(function(){tweening = false;}, dur*1.2);
			self.backgroundTweenItem.tween(
			    { val: 1.0 },
			    { val: 0.0 },
			    { easing: 'easeInOutQuad', duration: dur }
			).onUpdate = function(event) {
				tweening = true;
				//
				let currentVal = self.backgroundTweenItem.val;
				let lerpedColor = new self.PAPER.Color(
					toColor.red+(fromColor.red-toColor.red)*currentVal,
					toColor.green+(fromColor.green-toColor.green)*currentVal,
					toColor.blue+(fromColor.blue-toColor.blue)*currentVal);
				//
				osmo.datasvg.backgroundLayer.opacity = toOpacity + (fromOpacity - toOpacity) * currentVal;
				$('body').css('background-color',  lerpedColor.toCSS(true));
				//
				if(typeof lg !== 'undefined'){
					if(!lg.visible && currentVal == 0){
						for(let i=0; i<self.legendLayer.children.length; i++){
							let child = self.legendLayer.children[i];
							child.visible = false;
						}
						lg.visible = true;
					}
				}
				//
			};
		}
		//
		//
	}


};