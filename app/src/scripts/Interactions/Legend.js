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
		this.cursorLoading = null;
		this.tweenTimeout = null;
		this.prevHitResultName = null;
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
				this.hitMaskEffect(event.point, 'hover');
			}
		}
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
		// Fix ME!!
		// 1. Wait atleast 4s before you start fading
		// 2. Switching from one dataset to another does not fix the cursor i.e. it's both loading and click mode
		//
		// APPROACH 1:
		//let hitResult = legendsvg.maskLayer.hitTest(pt, osmo.scroll.maskHitOptions);// <- Slow method
		// APPROACH 2
		//NOW TEST WHICH MASK INTERSECTS & ALSO DEAL WITH OVERLAPPING MASKS
		let hitResult = null;
		Object.keys(osmo.legendsvg.popupBBoxes).forEach(function(key) {
			if(hitResult == null)
				if(osmo.legendsvg.popupBBoxes[key]['mask'].visible)
					hitResult = osmo.legendsvg.popupBBoxes[key]['mask'].hitTest(pt, osmo.scroll.maskHitOptions);
		});
		if(hitResult != null){
			console.log('hit: ' + this.prevHitResultName + ' ' + hitResult.item.data.legendName);
			if(this.prevHitResultName == hitResult.item.data.legendName)
				return;
			//
			if(!legendsvg.legendLayer.visible)
				legendsvg.legendLayer.visible = true;
			lg = this.PAPER.project.getItem({name: hitResult.item.data.legendName});
			if(lg == null)	return;
			//
			if(ctype == 'hover'){
				//
				toOpacity = 0.25;
				toColor =  new this.PAPER.Color('#6d7c80');
				//document.body.style.cursor = 'pointer';
				if(this.cursorLoading != null)
					clearTimeout(this.cursorLoading);
				this.cursorLoading = null;
				//
				if(this.cursorLoading == null){
					//
					$('.cursor-pointer').css('border', 'none');
					$('.cursor-loading').show();
					$('.cursor-pointer-dot').hide();
					$('.cursor-txt').hide();
					this.reset_animation('cursor-clc', 'cursor-loading-circle');
					this.reset_animation('cursor-cl', 'cursor-loading');
					//
					let self = this;
					this.cursorLoading = setTimeout(function(){
						//
						self.cursorLoading = null;
						//
						$('.cursor-pointer').css('border', '2px solid white');
						$('.cursor-loading').hide();
						$('.cursor-pointer-dot').show();
						$('.cursor-txt').html('Click to open');
						$('.cursor-txt').show();
						//
					},8000);//
				}
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
			if(!legendsvg.legendLayer.visible)
				legendsvg.legendLayer.visible = false;
			if(this.cursorLoading != null)
				clearTimeout(this.cursorLoading);
			this.cursorLoading = null;
			//document.body.style.cursor = 'default';
			$('.cursor-pointer').css('border', '2px solid white');
			$('.cursor-loading').hide();
			$('.cursor-loading-full').hide();
			$('.cursor-pointer-dot').hide();
			$('.cursor-txt').hide();

			//
			for(let i=0; i<legendsvg.legendLayer.children.length; i++){
				let child = legendsvg.legendLayer.children[i];
				if(child.visible)
					child.visible = false;
			}
			//
		}
		//
		//
		let timeout = 10;
		if(this.cursorLoading != null)
			timeout = 5800;
		//
		let self = this;
		if(!tweening){
			if(hitResult != null){
				//console.log('tweening: ' + this.prevHitResultName + ' ' + hitResult.item.data.legendName);
				if(this.prevHitResultName == hitResult.item.data.legendName)
					return;
			}
			//
			if(this.tweenTimeout != null)
				clearTimeout(this.tweenTimeout);
			this.tweenTimeout = null;
			this.tweenTimeout = setTimeout(function(){
				//
				if(self.tweenTimeout != null)
					clearTimeout(self.tweenTimeout);
				self.tweenTimeout = null;
				//
				//Tween
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
								if(child.visible)
									child.visible = false;
							}
							lg.visible = true;
						}
					}
					//
				};
				//
			}, timeout);
		}
		//
		//
		if(hitResult != null){
			//console.log('updating prev: ' + hitResult.item.data.legendName);
			this.prevHitResultName = hitResult.item.data.legendName;
		}else{
			this.prevHitResultName = null;
		}
		//
	}

};


