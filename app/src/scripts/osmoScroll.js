/*global osmo:true $:true*/

'use strict';
export default class {}

//
//
import lottie from 'lottie-web';
import 'jquery-mousewheel';
import 'jquery-ui';
import paper from 'paper';
import tone from 'tone';
import WaveformData from 'waveform-data';
import screenfull from 'screenfull/dist/screenfull';
//
import {} from './Audio/BackgroundAudio';
import {} from './Visuals/DataSvg';
import {} from './Visuals/LegendSvg';
import {} from './Visuals/AudioWaveform';
import {} from './Interactions/PanAndZoom';
import {} from './Interactions/Navigation';
import {} from './Interactions/Legend';
import {} from './Interactions/Popup';
//
//
window.osmo = window.osmo || {};
//
//
/**
 * ------------------------------------------------
 * class:	Scroll
 * desc: This is where you initialize necessary components and manage app states
 * ------------------------------------------------
 */
osmo.Scroll = class {

	constructor(){
		console.log('osmo.Scroll - constructor');

		// ----------------
		// Lib
		// ----------------
		this.PAPER;
		this.TONE;
		this.WAVEFORMDATA;

		// ----------------
		// new Class objects/instance
		// ----------------
		// Screens
		this.MAINSCREEN;
		//
		this.paperHeight;
		this.paperWidth;
		this.splashWidth;
		this.mouseLoc;
		this.loaded = {	'HQimage' : false,	'svgdata': false	};
		this.Volume_db = { min : -12,  max: 6 };
		this.refPopupSize = { width: 1440.0,	height: 821.0	};
		//
		this.hitPopupMode = 'hovering';
		this.prevBoundsCenter = null;
		this.prevZoom = null;
		this.maskHitOptions = {
			segments: false,
			stroke: false,
			fill: true,
			tolerance: 5
		};
		//

		// Methods
		this.init;
		this.addBackground;
		this.loadHQ;
		this.loadRQ;
		this.loadMQ;
	}

	/**
	 * ------------------------------------------------
	 * Init
	 * ------------------------------------------------
	 */
	init(){
		console.log('osmo.Scroll - init');

		// Setup UI
		this.renderAnimations();
		this.addActionButtons();
		this.initModal(false);


		// Setup PAPER canvas
		let canvas = document.getElementById('main-scroll-canvas');
		paper.setup(canvas);
		osmo.scroll.PAPER = paper;
		osmo.scroll.paperHeight = canvas.offsetHeight;
		osmo.scroll.paperWidth = canvas.offsetWidth;

		// Setup LIBS
		osmo.scroll.TONE = tone;
		osmo.scroll.WAVEFORMDATA = WaveformData;

		// AUDIO
		osmo.bgaudio  = new osmo.BackgroundAudio();
		osmo.bgaudio.loadAudio();

		// INTERACTIONS
		osmo.pzinteract = new osmo.PanAndZoom();
		osmo.pzinteract.init();
		osmo.navinteract = new osmo.NavigationInteraction();
		osmo.navinteract.init();

		// LEGEND
		osmo.legendsvg = new osmo.LegendSvg();
		osmo.legendsvg.init();
		osmo.legendinteract = new osmo.LegendInteraction();

		// POPUP
		osmo.popupinteract = new osmo.PopupInteraction();
		osmo.popupinteract.init();
		//

		// Draw PAPER
		paper.view.draw();

		//
		// Custom Mouse follow
		document.addEventListener('mousemove', function(e) {
				osmo.scroll.mouseLoc = new osmo.scroll.PAPER.Point(e.pageX, e.pageY);
		    let mouseX = e.pageX;
		    let mouseY = e.pageY;
		    //if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata)
				$('.cursor-pointer-wrapper').css('transform', 'translate3d('+mouseX+'px, '+mouseY+'px, 0px)');

		});

		document.addEventListener('mousemove', function(e) {
		    let deltaX = e.movementX * -1;
		    let deltaY = e.movementY;
		    //
		    if(!osmo.navinteract.isOnDiv){
					osmo.popupinteract.mouseMoved(deltaX, deltaY);
				}

		});

		// Custom mouse hide/show
		// HEAD ACTIONS
		$('.head-actions').mouseenter(function(){
			document.body.style.cursor = 'auto';
			$('.cursor-pointer-wrapper').css('opacity', 0);
		});
		$('.head-actions').mouseleave(function(){
			document.body.style.cursor = 'none';
			$('.cursor-pointer-wrapper').css('opacity', 1);
		});
		// NAVIGATION
		$('.nav').mouseenter(function(){
			document.body.style.cursor = 'auto';
			$('.cursor-pointer-wrapper').css('opacity', 0);
		});
		$('.nav').mouseleave(function(){
			document.body.style.cursor = 'none';
			$('.cursor-pointer-wrapper').css('opacity', 1);
		});


		//
		// Update on paper events

		paper.view.onFrame = function(event) {
			window.meter.tick();
		};

		paper.view.onMouseMove = function(event) {
			if(!osmo.navinteract.isOnDiv)
				osmo.legendinteract.mouseMoved(event);
		};

		paper.view.onMouseDown = function(event) {
			if(!osmo.navinteract.isOnDiv)
				osmo.popupinteract.mouseClicked(event);
		};

		paper.view.onMouseUp = function(event) {
			if(!osmo.navinteract.isOnDiv)
				osmo.popupinteract.mouseUp(event);
		};
		//
		//
	}


	/**
	 * ------------------------------------------------
	 * initModal
	 * ------------------------------------------------
	 */
	initModal(start_opened){
		var modal = document.querySelector('.modal');
		var closeButton = document.querySelector('.close-button');
		let self = this;

		function windowOnClick(event) {
			if (event.target === modal) {
				self.toggleModal();
			}
		}
		//
		closeButton.addEventListener('click', self.toggleModal);
		window.addEventListener('click', windowOnClick);
		//
		$(document).keydown(function(event) {
			if (event.keyCode == 27) {
				self.toggleModal();
			}
		});
		//
		if(start_opened)
			self.toggleModal();
	}

	toggleModal() {
		//
		var modal = document.querySelector('.modal');
		modal.classList.toggle('show-modal');
		//
	}

	renderAnimations(){
		lottie.loadAnimation({
		  container: document.getElementById('headphones'), // the dom element that will contain the animation
		  renderer: 'svg',
		  loop: true,
		  autoplay: true,
		  path: 'assets/12308-headphone.json' // the path to the animation json
		});
	}

	addActionButtons(){
		// INFO BUTTON
		$('#show-info').on('click', function(event) {
			/*
		  var icon = $('#show-info');
		  icon.toggleClass('on');
		  if ( icon.hasClass('on') ) {
		  	console.log('modal to be opened');
		    icon.text('close');
		  } else {
		    icon.text('info');
		  }
		  */
		  osmo.scroll.toggleModal();
		});

		// FULLSCREEN BUTTON
		$('#enter-fullscreen').on('click', function(event) {
		  var icon = $('#enter-fullscreen');
		  icon.toggleClass('on');
		  if ( icon.hasClass('on') ) {
		  	console.log('screenfull to be enabled');
		    icon.text('fullscreen_exit');
		  } else {
		    icon.text('fullscreen');
			}
		  //
		  console.log(screenfull);
			screenfull.toggle();
			//
		});

		// SPEAKER
		// https://dribbble.com/shots/2904489-Volume-Control-Micro-Animation
		this.speakerMicroInteraction();
		//
		//
	}

	//
	/**
	 * ------------------------------------------------
	 * Speaker micro interaction
	 * https://codepen.io/mudrenok/pen/bBdoLJ
	 * ------------------------------------------------
	 */
	speakerMicroInteraction(){
		console.log('speakerMicroInteraction');
		$(document).ready(function () {

			// Speaker interaction
			let isOnCtrl = false;
			let isOnSpeaker = false;

			// Check if mouse is on volume control
			$('.vlCtrl').mouseenter(function(){
				isOnCtrl = true;
			});
			$('.vlCtrl').mouseleave(function(){
				isOnCtrl = false;
				//
				if(!isOnSpeaker)
					$('.vlCtrl').hide();
				//
			});

			// Check if mouse is on speaker control
			$('.speaker').hover(function(){
				isOnSpeaker = true;
				$('.vlCtrl').show();
			}, function(){
				isOnSpeaker = false;
				console.log('speaker off-hover, now check for vlCtrl');
				//if(!isOnCtrl)
				//		$('.vlCtrl').hide();
				setTimeout(function(){
					if(!isOnCtrl || isOnSpeaker)
						$('.vlCtrl').fadeOut();
				},1500);
			});
			//

		  var qs = (el = '') => document.querySelector(el);
		  var fromTo = (from, to, prgrs = 0) => from + (to - from) * prgrs;
		  var getCenter = (line = {}) => {
		    return {
		      x: (+line.getAttribute('x1') + +line.getAttribute('x2')) / 2,
		      y: (+line.getAttribute('y1') + +line.getAttribute('y2')) / 2
		    }
		  };
		  var getScalePoint = (obj = {}, onScene = true) => {
		    if (!onScene) {
		      let svgRect = obj.getBBox();
		      return {
		        x: svgRect.x + svgRect.width / 2,
		        y: svgRect.y + svgRect.height / 2
		      }
		    }
		    let rect = obj.getBoundingClientRect();
		    return {
		      x: rect.width / 2,
		      y: rect.height / 2
		    }
		  };

		  var volObj = {
		    speakB: qs('#speakB'),
		    arcBigB: qs('#arcBigB'),
		    arcSmB: qs('#arcSmB'),

		    speakF: qs('#speakF'),
		    arcBigF: qs('#arcBigF'),
		    arcSmF: qs('#arcSmF'),

		    crossLtRb: qs('#crossLtRb'),
		    crossLbRt: qs('#crossLbRt'),

		    ctrlCirce: qs('#ctrlCirce'),
		    ctrlLineF: qs('#ctrlLineF'),
		    ctrlLineB: qs('#ctrlLineB')
		  };

		  var pathLen = {
		    arcBigLen: volObj.arcBigF.getTotalLength(),
		    arcSmLen: volObj.arcSmF.getTotalLength(),
		    speakLen: volObj.speakF.getTotalLength()
		  };

		  var transforms = {
		    translate3D: function (x = 0, y = 0, z = 0, el = 'px') {
		      return `translate3D(${x}${el}, ${y}${el}, ${z}${el})`;
		    },

		    translate: function (x = 0, y = 0, el = 'px') {
		      return `translate(${x}${el}, ${y}${el})`;
		    },

		    rotate3d: function (x = 0, y = 0, z = 0, deg = 0) {
		      return `rotate3d(${x}, ${y}, ${z}, ${deg}deg)`;
		    },

		    rotate: function (deg = 0) {
		      return `rotate(${deg}deg)`;
		    },

		    scale: function (x = 1, y = 1) {
		      return `scale(${x}, ${y})`;
		    },

		    perspective: function (val = 0, el = 'px') {
		      return `perspective(${val}${el})`;
		    }
		  };

		  var easing = {
		    inCubic: function (t, b, c, d) {
		      var ts = (t /= d) * t;
		      var tc = ts * t;
		      return b + c * (1.7 * tc * ts - 2.05 * ts * ts + 1.5 * tc - 0.2 * ts + 0.05 * t);
		    },

		    outElastic: function (t, b, c, d) {
		      var ts = (t /= d) * t;
		      var tc = ts * t;
		      return b + c * (33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t);
		    },

		    customSin: function (t, b, c, d) {
		      var ts = (t /= d) * t;
		      var tc = ts * t;
		      return b + c * (81 * tc * ts + -210 * ts * ts + 190 * tc + -70 * ts + 10 * t);
		    }
		  };

		  var play = {
		    dx: 1 / 5,
		    ds: 0.03,
		    flag: true,
		    step: 0,
		    speed: 5,

		    curPosBig: {
		      x: 0,
		      y: 0,
		      scale: 1
		    },

		    curPosSm: {
		      x: 0,
		      y: 0,
		      scale: 1
		    },

		    curPos: 1,
		    prevPos: 1,

		    off: false,
		    offCurStep: 100,
		    offMaxStep: 100,
		    offSpeed: 2,
		    offRefresh: function () {
		      this.offCurStep = this.offMaxStep;
		      this.off = true;
		    },

		    on: false,
		    onCurStep: 0,
		    onMaxStep: 20,
		    onSpeed: 2,
		    onRefresh: function () {
		      this.off = false;
		      this.onCurStep = 0;
		      this.on = true;
		    },

		    pointLbRt: getCenter(volObj.crossLbRt),
		    pointLtRb: getCenter(volObj.crossLtRb),

		    animation: function () {
		      if (this.off) { // animation when volume became 0
		      	osmo.scroll.TONE.Master.mute = true;
		        [volObj.arcBigB, volObj.arcBigF, volObj.arcSmB, volObj.arcSmF].forEach((el) => {
		          el.setAttribute('visibility', 'hidden');
		        });
		        [volObj.crossLbRt, volObj.crossLtRb].forEach((el) => {
		          el.setAttribute('visibility', 'visible');
		        });

		        let len = pathLen.speakLen;
		        let step1 = 20;
		        let step2 = this.offMaxStep - step1;
		        let backLen = 0.7;

		        if (this.offCurStep >= this.offMaxStep - step1) {
		          let progress = (step1 + this.offCurStep - this.offMaxStep) / step1;
		          let progressB = fromTo(1, backLen, 1 - progress);
		          volObj.speakF.setAttribute('stroke-dasharray', len * progress + ',' + len * 1.05);
		          volObj.speakF.setAttribute('stroke-dashoffset', -len * (1 - progress) / 2 + '');
		          volObj.speakB.setAttribute('stroke-dasharray', len * progressB + ',' + len * 1.05);
		          volObj.speakB.setAttribute('stroke-dashoffset', -len * (1 - progressB) / 2 + '');
		        }

		        if (this.offCurStep < step2 && this.offCurStep >= step2 - step1) {
		          let progress = 1 - (this.offCurStep - step2 + step1) / step1;
		          let progressB = fromTo(backLen, 1, progress);
		          volObj.speakB.setAttribute('stroke-dasharray', len * progressB + ',' + len * 1.05);
		          volObj.speakB.setAttribute('stroke-dashoffset', -len * (1 - progressB) / 2 + '');
		        }

		        if (this.offCurStep < step2 && this.offCurStep >= 0) {
		          volObj.speakF.setAttribute('visibility', 'hidden');
		          let progress = this.offCurStep / step2;
		          [volObj.crossLbRt, volObj.crossLtRb].forEach((el, index) => {
		            let scale = easing.outElastic(1 - progress, 0, 1, 1);
		            let dx = index == 0 ?
		              easing.customSin(1 - progress, -3, 3, 1) :
		              easing.customSin(1 - progress, -2, 2, 1);
		            let dy = index == 0 ?
		              easing.customSin(1 - progress, -2, 2, 1) :
		              easing.customSin(1 - progress, 2, -2, 1);
		            let x = -this.pointLbRt.x * (scale - 1) + dx;
		            let y = -this.pointLbRt.y * (scale - 1) + dy;
		            el.setAttribute('transform',
		              transforms.translate(x, y, '') +
		              transforms.scale(scale, scale));
		          });
		        }
		        this.offCurStep += -this.offSpeed;
		      }
		      else {
		        if (this.on) {
		          [volObj.speakF, volObj.arcBigB, volObj.arcSmB, volObj.arcSmF].forEach((el) => {
		            el.setAttribute('visibility', 'visible');
		          });
		          [volObj.crossLbRt, volObj.crossLtRb].forEach((el) => {
		            el.setAttribute('visibility', 'hidden');
		            el.setAttribute('transform', 'scale(0)');
		          });
		          let len = pathLen.speakLen;
		          let progress = this.onCurStep / this.onMaxStep;
		          volObj.speakF.setAttribute('stroke-dasharray', len * progress + ',' + len * 1.05);
		          volObj.speakF.setAttribute('stroke-dashoffset', -len * (1 - progress) / 2 + '');
		          this.onCurStep += this.onSpeed;
		        }

		        let dxBig, dxSm, sclFactB, sclFactSm;
		        if (this.step >= this.speed) {
		          this.flag = !this.flag;
		          this.step = 0;
		        }
		        let progress = this.step / this.speed;
		        let amplitudeB = 1 - easing.inCubic(1 - this.curPos, 0, 1, 0.5);
		        let amplitudeS = 1 - easing.inCubic(1 - this.curPos, 0, 1, 1);

		        if (this.curPos < 0.5) amplitudeB = 0;
		        if (amplitudeS <= 0 || !amplitudeS) amplitudeS = 0;
		        //
		        if(osmo.scroll.TONE.Master.mute)
		        	osmo.scroll.TONE.Master.mute = false;
		        if(this.prevPos != this.curPos){
		        	console.log('Changed volume - ' + this.curPos);
		        	osmo.scroll.TONE.Master.volume.value = osmo.scroll.map(
								this.curPos,
								0,
								1,
								osmo.scroll.Volume_db.min,
								osmo.scroll.Volume_db.max
							);
							localStorage.setItem('master_volume',this.curPos);
		        }
		        this.prevPos = this.curPos;

		        if (this.flag) {
		          dxBig = fromTo(0, this.dx * 3, progress);
		          dxSm = fromTo(0, -this.dx * 2, progress);
		          sclFactB = fromTo(0, this.ds, progress);
		          sclFactSm = fromTo(0, -this.ds, progress);
		        }
		        else {
		          dxBig = fromTo(this.dx * 3, 0, progress);
		          dxSm = fromTo(-this.dx * 2, 0, progress);
		          sclFactB = fromTo(this.ds, 0, progress);
		          sclFactSm = fromTo(-this.ds, 0, progress);
		        }

		        [volObj.arcBigF, volObj.arcBigB].forEach((el) => {
		          let scale = this.curPosBig.scale + sclFactB * amplitudeB;
		          let y = -drag.pointBig.y * (scale - 1) * 1.5;
		          el.setAttribute('transform',
		            transforms.translate(this.curPosBig.x + dxBig * amplitudeB, y, '')
		            + transforms.scale(scale, scale)
		          );
		        });

		        [volObj.arcSmF, volObj.arcSmB].forEach((el) => {
		          let scale = this.curPosSm.scale + sclFactSm * amplitudeS;
		          let y = -drag.pointSm.y * (scale - 1) * 3;
		          el.setAttribute('transform',
		            transforms.translate(this.curPosSm.x + dxSm * amplitudeS, y, '')
		            + transforms.scale(scale, scale)
		          );
		        });
		        this.step++;
		      }
		      requestAnimationFrame(this.animation.bind(play));
		    }
		  };

		  requestAnimationFrame(play.animation.bind(play));

		  var drag = {
		    dx: 0,
		    maxX: +volObj.ctrlLineB.getAttribute('x2'),
		    minX: +volObj.ctrlLineB.getAttribute('x1'),
		    curCx: +volObj.ctrlCirce.getAttribute('cx'),

		    pointBig: getScalePoint(volObj.arcBigF),
		    pointSm: getScalePoint(volObj.arcSmF),

		    interact: false,

		    animateDrag: function () {
		      this.curCx += this.dx;
		      let cx = this.curCx;

		      let smLen = pathLen.arcSmLen;
		      let bgLen = pathLen.arcBigLen;

		      if (cx > this.maxX) { cx = this.maxX; }
		      if (cx < this.minX) { cx = this.minX; }

		      let progress = (cx - this.minX) / (this.maxX - this.minX);
		      play.curPos = progress;

		      volObj.ctrlCirce.setAttribute('cx', cx);
		      volObj.ctrlLineF.setAttribute('x2', cx);

		      let scaleFactor = fromTo(1, 0.85, 1 - progress);
		      let scaleDxBig = fromTo(0, -3, 1 - progress);
		      let scaleDxSm = fromTo(0, -1, 1 - progress);

		      [volObj.arcBigF, volObj.arcBigB].forEach((el) => {
		        play.curPosBig.x = -this.pointBig.x * (scaleFactor - 1) + scaleDxBig;
		        play.curPosBig.y = -this.pointBig.y * (scaleFactor - 1) * 1.5;
		        play.curPosBig.scale = scaleFactor;
		        el.setAttribute('transform',
		          transforms.translate(play.curPosBig.x, play.curPosBig.y, '')
		          + transforms.scale(scaleFactor, scaleFactor)
		        );
		      });

		      [volObj.arcSmF, volObj.arcSmB].forEach((el) => {
		        play.curPosSm.x = -this.pointSm.x * (scaleFactor - 1) + scaleDxSm;
		        play.curPosSm.y = -this.pointSm.y * (scaleFactor - 1) * 3;
		        play.curPosSm.scale = scaleFactor;
		        el.setAttribute('transform',
		          transforms.translate(play.curPosSm.x, play.curPosSm.y, '')
		          + transforms.scale(scaleFactor, scaleFactor)
		        );
		      });

		      if (progress > 0.5) {
		        if (play.off) { play.onRefresh(); }
		        let prgForBig = fromTo(1, -1, 1 - progress);
		        volObj.arcBigF.setAttribute('visibility', 'visible');
		        volObj.arcSmF.setAttribute('visibility', 'visible');
		        volObj.arcBigF.setAttribute('stroke-dasharray', bgLen * prgForBig + ',' + bgLen * 1.05);
		        volObj.arcBigF.setAttribute('stroke-dashoffset', -bgLen * (1 - prgForBig) / 2 + '');
		        volObj.arcSmF.setAttribute('stroke-dasharray', smLen + '');
		        volObj.arcSmF.setAttribute('stroke-dashoffset', '0');
		      }

		      if (progress <= 0.5 && progress > 0) {
		        if (play.off) { play.onRefresh(); }
		        let prgForSm = fromTo(1, 0, 1 - progress * 2);
		        volObj.arcBigF.setAttribute('visibility', 'hidden');
		        volObj.arcSmF.setAttribute('visibility', 'visible');
		        volObj.arcSmF.setAttribute('stroke-dasharray', smLen * prgForSm + ',' + smLen * 1.05);
		        volObj.arcSmF.setAttribute('stroke-dashoffset', -smLen * (1 - prgForSm) / 2 + '');
		      }

		      if (progress <= 0) {
		        volObj.arcSmF.setAttribute('visibility', 'hidden');
		        if (play.off == false) { play.offRefresh(); }
		      }
		    }
		  };
		  // FIX ME!! - MUTE IS NOT CONSILDERED
		  // ALSO, SPEAKER ICON NEEDS TO BE UPDATED ON LOAD
		  let currentVolume = localStorage.getItem('master_volume');
		  if(currentVolume == undefined){
		  	currentVolume = (drag.curCx - drag.minX)/(drag.maxX - drag.minX);
		  }else{
		  	//
		  	let newX = (drag.maxX - drag.minX)*currentVolume;
		  	volObj.ctrlLineF.setAttribute('x2', newX);
		    volObj.ctrlCirce.setAttribute('cx', newX);
		    drag.curCx = newX;
		  	//
		  }
		  console.log('Current Volume = ' + currentVolume);
		  osmo.scroll.TONE.Master.volume.value = osmo.scroll.map(
				currentVolume,
				0,
				1,
				osmo.scroll.Volume_db.min,
				osmo.scroll.Volume_db.max
			);
		  //
		  $(document).on('mousedown touchstart', '#ctrlCirce, #ctrlLineB, #ctrlLineF', function (e) {
		    let startX = -1*(e.pageY || e.originalEvent.touches[0].pageY);
		    e.preventDefault();
		    drag.interact = true;

		    if (this == volObj.ctrlLineB || this == volObj.ctrlLineF) {
		      let rect = volObj.ctrlCirce.getBoundingClientRect();
		      let center = (rect.left + rect.right) / 2.0;
		      drag.dx = startX - center;
		      drag.animateDrag();
		    	//console.log('drag.dx - ' + drag.dx);
		    }
		    //
		    //
		    //

		    $(document).on('mousemove touchmove', function (e) {
		      e.preventDefault();
		      let curX = -1*(e.pageY || e.originalEvent.touches[0].pageY);
		      drag.dx = curX - startX;
		      startX = curX;
		    	//console.log('drag.dx - ' + drag.dx);
		    	//console.log('curX - ' + curX);
		      drag.animateDrag();
		    });

		    $(document).on('mouseup touchend', function (e) {
		      if (drag.curCx < drag.minX) drag.curCx = drag.minX;
		      if (drag.curCx > drag.maxX) drag.curCx = drag.maxX;
		      $(document).off('mousemove touchmove mouseup touchend');
		    });
		  });

		  let memory = {
		    flag: true,
		    last: 0
		  };

		  $(document).on('mousedown touchstart', '.speaker', function (e) {
		    e.preventDefault();
		    drag.interact = true;
		    drag.dx = 0;
		    if (memory.flag) {
		      memory.flag = false;
		      memory.last = drag.curCx;
		      drag.curCx = 0;
		      drag.animateDrag();
		    }
		    else {
		      memory.flag = true;
		      drag.curCx = memory.last;
		      drag.animateDrag();
		    }
		  });

		  // 2much animations in feed to do this ↓ smooth
		  // (function pevAnimation() {
		  //   for (let i = drag.maxX; i > -1; i -= 5) {
		  //     setTimeout(() => {
		  //       if (!drag.interact) {
		  //         drag.curCx = i;
		  //         drag.animateDrag();
		  //       }
		  //     }, 300 + drag.maxX - i);
		  //   }
		  //   for (let i = 50; i <= drag.maxX; i += 3) {
		  //     setTimeout(() => {
		  //       if (!drag.interact) {
		  //         drag.curCx = i;
		  //         drag.animateDrag();
		  //       }
		  //     }, 1400 + i);
		  //   }
		  // })();
		});
	}

	/**
	 * ------------------------------------------------
	 * map
	 * desc : <ADD>
	 * ------------------------------------------------
	 */
	map( value, istart, istop, ostart, ostop ){
		return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
	}

	/**
	 * ------------------------------------------------
	 * High Quality Image
	 * ------------------------------------------------
	 */
	loadHQ(){
	  console.log('osmo.scroll.loadHQ - called');
	  //
	  let self = this;
	  osmo.pzinteract.setMaxZoom(2);
	  //
	  let please_wait_spinner = '<div id="percentage" style="color: #b97941; font-weight: 400;"></div><br><div class="sk-three-bounce"><div class="sk-child sk-bounce1" style="background-color: #b97941"></div><div class="sk-child sk-bounce2" style="background-color: #b97941"></div><div class="sk-child sk-bounce3" style="background-color: #b97941"></div></div>';
  	$('.pg-loading-html').empty();
  	$('.pg-loading-html').append($.parseHTML( please_wait_spinner ));
	  //
	  /*
	  //
	  // APPROACH 1
	  var downloadingImage = new Image();
	  downloadingImage.onload = function(){
	  		console.log('Loaded HQ image');
	      console.log(this.src);
	      image.src = this.src;
	      //
	      osmo.datasvg = new osmo.DataSvg();
	      osmo.datasvg.init('High');
	      osmo.datasvg.initSplash(osmo.scroll.splashWidth);
	      //
	      osmo.navinteract.loadNav();
	      osmo.navinteract.initNav();
	      //
	      //
	      self.loaded.HQimage = true;
				osmo.datasvg.backgroundLayer.sendToBack();
	      if(self.loaded.HQimage && self.loaded.svgdata){
	      	window.loading_screen.finish();
	      	osmo.bgaudio.start();
	      }
	  };
	  downloadingImage.src = 'assets/images/SCROLL_cs6_ver23_APP_final_300ppi-HIGH.png';
	  */
	  //
	  // APPROACH 2
	  this.load_fetch_retry('assets/images/SCROLL_cs6_ver23_APP_final_300ppi-HIGH.png', 3, 'High', 'HQscroll');
	  //
	  //
	}

	/**
	 * ------------------------------------------------
	 * Retina Quality Image
	 * ------------------------------------------------
	 */
	loadRQ(){
	  console.log('osmo.scroll.loadRQ - called');
	  //
	  let self = this;
	  osmo.pzinteract.setMaxZoom(4);
	  //
	  let please_wait_spinner = '<div id="percentage" style="color: #b97941; font-weight: 400;"></div><br><div class="sk-three-bounce"><div class="sk-child sk-bounce1" style="background-color: #b97941"></div><div class="sk-child sk-bounce2" style="background-color: #b97941"></div><div class="sk-child sk-bounce3" style="background-color: #b97941"></div></div>';
  	$('.pg-loading-html').empty();
  	$('.pg-loading-html').append($.parseHTML( please_wait_spinner ));
	  //
	  //
	  /*
	  //
	  // APPROACH 1
	  var downloadingImage = new Image();
	  downloadingImage.onload = function(){
  		//
      console.log('Loaded RQ image');
      console.log(this.src);
	    image.src = this.src;
    	//
      osmo.datasvg = new osmo.DataSvg();
			osmo.datasvg.init('Retina');
      osmo.datasvg.initSplash(osmo.scroll.splashWidth);
      //
      osmo.navinteract.loadNav();
      osmo.navinteract.initNav();
      //
      self.loaded.HQimage = true;
      osmo.datasvg.backgroundLayer.sendToBack();
      if(self.loaded.HQimage && self.loaded.svgdata){
      	window.loading_screen.finish();
      	osmo.bgaudio.start();
      }
	  };
	  downloadingImage.src = 'assets/images/SCROLL_cs6_ver23_APP_final_600ppi-RETINA.png';
	  */
	  //
	  // APPROACH 2
		this.load_fetch_retry('assets/images/SCROLL_cs6_ver23_APP_final_600ppi-RETINA.png', 3, 'Retina', 'RQscroll');
	  //
	}


	/**
	 * ------------------------------------------------
	 * Mobile Quality Image
	 * ------------------------------------------------
	 */
	loadMQ(){
	  console.log('osmo.scroll.loadMQ - called');
	  //
	  let self = this;
	  osmo.pzinteract.setMaxZoom(2);
	  //
	  let image = document.getElementById('');
	  /*
	  //
	  // APPROACH 1
	  var downloadingImage = new Image();
	  downloadingImage.onload = function(){
	  		//
	  		console.log('Loaded MQ image');
	  		console.log(this.src);
	      image.src = this.src;
	  		//
	      osmo.datasvg = new osmo.DataSvg();
				osmo.datasvg.init('Mobile');
	      osmo.datasvg.initSplash(osmo.scroll.splashWidth);
	      //
	      osmo.navinteract.loadNav();
	      osmo.navinteract.initNav();
	      //
	      self.loaded.HQimage = true;
				osmo.datasvg.backgroundLayer.sendToBack();
	      if(self.loaded.HQimage && self.loaded.svgdata){
	      	window.loading_screen.finish();
	      	//osmo.bgaudio.start(); //Mandate to click on a start button to start audio interactions
	      }
	  };
	  downloadingImage.src = 'assets/images/SCROLL_cs6_ver23_APP_final_150ppi-LOW.png';
	  */
	  //
	  // APPROACH 2
	  this.load_fetch_retry('assets/images/SCROLL_cs6_ver23_APP_final_150ppi-LOW.png', 3, 'Mobile', 'MQscroll');
	  //
	}


	/**
	 * ------------------------------------------------
	 * Fetch and load with retry
	 * ref: https://dev.to/ycmjason/javascript-fetch-retry-upon-failure-3p6g
	 * FIX ME!!!
	 * Show indicator if loading fails
	 * ------------------------------------------------
	 */
	load_fetch_retry(url, n, type, typeID) {
		let self = this;
		console.log('Trying fetch count - ' + n);
		//
    return fetch(url).then(res => {
    	if(!res.ok)	throw res.statusText;
    	//
	  	console.log('Got scroll image data');
	  	self.onScrollData(res, type, typeID);
	  	//
	  }).catch(function(error) {
        if (n === 1){
        	$('.pg-loaded').html('<p style="color: #b97941">Failed to load main scroll. Please try later!</p>');
    			throw error;
        }
        return self.load_fetch_retry(url, n - 1, type, typeID);
    });
    //
	}

	/**
	 * ------------------------------------------------
	 * On scroll data initilize interaction and start audio
	 * ------------------------------------------------
	 *
	 */
	onScrollData(blob_data, type, typeID){
		//
		blob_data.blob()
				.then(blob => {
					//
					var reader  = new FileReader();
			    reader.addEventListener('load', function () {
			        //
			        console.log('Loaded ' + type + ' image');
    					let image = document.getElementById(typeID);
	  					image.src = reader.result;
				      //
				      osmo.datasvg = new osmo.DataSvg();
				      osmo.datasvg.init(type);
				      osmo.datasvg.initSplash(osmo.scroll.splashWidth);
				      //
				      osmo.navinteract.loadNav();
				      osmo.navinteract.initNav();
				      //
				      osmo.audiowaveform  = new osmo.AudioWaveform();
							osmo.audiowaveform.init();
				      //
				      osmo.scroll.loaded.HQimage = true;
							osmo.datasvg.backgroundLayer.sendToBack();
				      if(osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata){
				      	window.loading_screen.finish();
				      	osmo.bgaudio.start();
				      }
			        //
			    }, false);
			    //
			    reader.onerror = (error) => {
			    	console.log(error);
			      console.error(this);
			    };
			    reader.readAsDataURL(blob);
			    //
				})
				.catch(err => console.log(err));
	  //
	}


};