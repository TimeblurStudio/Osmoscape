/*global osmo:true $:true*/


/*
	*ADD AUTHOUR AND LISCENSE*
*/

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:	LegendInteraction
 * desc:
 * ------------------------------------------------
 */
osmo.LegendInteraction = class {

	constructor(){
		console.log('osmo.LegendInteraction - constructor');
		//
		this.PAPER = osmo.scroll.PAPER;
		this.LEGENDSVG = osmo.legendsvg;
		this.DATASVG = osmo.datasvg;
		//
	}

	/**
	 * ------------------------------------------------
	 * mouseMoved
	 * ------------------------------------------------
	 */
	mouseMoved(event){
		let legendsvg = this.LEGENDSVG;
		//
		if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata){
			if(osmo.scroll.hitPopupMode != 'focused'){
				legendsvg.maskLayer.visible = true;

				Object.keys(legendsvg.popupBBoxes).forEach(function(key) {
					//
					let xMin = osmo.scroll.PAPER.view.center.x - osmo.scroll.paperWidth/2.0;
					let xMax = osmo.scroll.PAPER.view.center.x + osmo.scroll.paperWidth/2.0;
					//
					//
					if(legendsvg.popupBBoxes[key]['mask'].bounds.rightCenter.x > xMin && legendsvg.popupBBoxes[key]['mask'].bounds.leftCenter.x < xMax)
						legendsvg.popupBBoxes[key]['mask'].visible = true;
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
		let legendsvg = this.LEGENDSVG;
		//
		//
		let fromOpacity = osmo.datasvg.backgroundLayer.opacity, toOpacity;
		let fromColor = new this.PAPER.Color($('body').css('background-color')), toColor;
		let tweening = false;
		let dur = 800;
		let lg;
		//
		let hitResult = legendsvg.maskLayer.hitTest(pt, osmo.scroll.maskHitOptions);
		if(hitResult != null){
			//
			legendsvg.legendLayer.visible = true;
			lg = this.PAPER.project.getItem({name: hitResult.item.data.legendName});
			if(lg == null)	return;
			//
			if(ctype == 'hover'){
				//
				toOpacity = 0.25;
				toColor =  new this.PAPER.Color('#6d7c80');
				document.body.style.cursor = 'pointer';
				//
				osmo.scroll.prevBoundsCenter = null;
				osmo.scroll.prevZoom = null;
				//
			}
			//
			//
		}else{
			toOpacity = 1.0;
			toColor =  new this.PAPER.Color('#b5ced5');
			//
			legendsvg.legendLayer.visible = false;
			document.body.style.cursor = 'default';
			for(let i=0; i<legendsvg.legendLayer.children.length; i++){
				let child = legendsvg.legendLayer.children[i];
				child.visible = false;
			}
			//
		}
		//
		if(!tweening){
			setTimeout(function(){tweening = false;}, dur*1.2);
			osmo.datasvg.backgroundTweenItem.tween(
			    { val: 1.0 },
			    { val: 0.0 },
			    { easing: 'easeInOutQuad', duration: dur }
			).onUpdate = function(event) {
				tweening = true;
				//
				let currentVal = osmo.datasvg.backgroundTweenItem.val;
				let lerpedColor = new osmo.scroll.PAPER.Color(
					toColor.red+(fromColor.red-toColor.red)*currentVal,
					toColor.green+(fromColor.green-toColor.green)*currentVal,
					toColor.blue+(fromColor.blue-toColor.blue)*currentVal);
				//
				osmo.datasvg.backgroundLayer.opacity = toOpacity + (fromOpacity - toOpacity) * currentVal;
				$('body').css('background-color',  lerpedColor.toCSS(true));
				//
				if(typeof lg !== 'undefined'){
					if(!lg.visible && currentVal == 0){
						for(let i=0; i<legendsvg.legendLayer.children.length; i++){
							let child = legendsvg.legendLayer.children[i];
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


