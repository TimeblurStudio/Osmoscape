/**
 * ------------------------------------------------
 * AUTHOR:  Mike Cj (mikecj184)
 * Copyright 2020 - 2021 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */
//
//
import * as PIXI from 'pixi.js'
import '@pixi/math-extras'
import * as Tone from 'tone'
import { TweenMax, Power4 } from 'gsap'
import { SVGScene } from '@pixi-essentials/svg'
import { Cull } from '@pixi-essentials/cull'
window.PIXI = PIXI
require('pixi-layers')
//
window.debug = true;
let loaded = {
	'HQimage' : false,
	'svgdata': false
}
//
let pixiHeight, pixiWidth;
let scrollMousePos, scrollPosition;
let scrollWidth, scrollHeight;
let mousePos = null;
let maxZoom = 2;
let started = false;
//
let scrollType = '150ppi-LOW';// 150ppi-LOW, 300ppi-HIGH, 600ppi-RETINA
let mainScroll;
let mainApp;
let mainStage;
let navChapters;
let navScrolledUpdate = true;
let mainScrollScale;
let navScale;
let exploreGroup;
//
let allTracksCount = 0;
let currentTrack;
let introTrack;
let baseTracks = {};
//
//
let backgroundLayer;
let navLayer;
let legendLayer;
let maskLayer;
//
let hitPopupMode = 'hovering';//'hovering', 'focused'
let prevBoundsCenter = null;
let prevZoom = null;
let currentFocus = null;
let popupBBoxes = {};
let refPopupSize = {
	width: 1440.0,
	height: 821.0
};
//
let datasets = {};
let mergedMasks = {};
let mergedLegends = {};
let uploadedLegendFile = [], uploadedMaskFile = [];
let maskFiles = [], legendFiles = [];
let earlySVGDataPromises = [], allSVGDataPromises = [];
//
//
let performance_test = false;
let commitversion = '';
//
window.maskFiles = maskFiles;
//
// Meter to keep track of FPS
window.FPSMeter.theme.transparent.container.transform = 'scale(0.75)';
window.meter = new window.FPSMeter({ margin: '-8px -16px', theme: 'transparent', graph: 1, history: 16 });
//
let t0 = null;
if(performance_test){
	t0 = performance.now();
	$('#performance-stats table').append('<tr> <td>Started</td> <td>'+Math.round(t0-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
}else{
	$('#performance-stats').hide();
}
//
console.log('Initializing');
init();
//
//
//
//
let navigationFile = null;
var navHitOptions = {
	segments: false,
	stroke: false,
	fill: true,
	tolerance: 5
};
let currentNavLoc = -1;
let navTweenItem;
//
//
//
function start(){
	console.log('Starting the audio context');
	Tone.start();
	//
	currentTrack = 'intro';
	introTrack.start();
	//
	started = true;
	$('#start-btn').hide();
	//
	if(performance_test){
		$('#performance-stats table').append('<tr> <td>Started</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
		$('.nav').show();
		let nav_children = $('.nav').children()
		//
		let _clicks = 0;
		let max_clicks = 10;
		let randomNavClicks = setInterval(function(){
			//
			let choosen_index = Math.floor(Math.random()*nav_children.length);
			$('#performance-stats table').append('<tr> <td>Clicked on: nav-ch'+choosen_index+'</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
			//
			$(nav_children[choosen_index]).trigger('click')
			//
			if(_clicks > max_clicks){
				clearInterval(randomNavClicks);
				$('#performance-stats table').append('<tr> <td>-----</td> <td>-----</td> <td>-----</td></tr>');
			}
			_clicks++;
			//
		}, 1000)
		//
	}
	//
}


/**
 * ------------------------------------------------
 * Main Init
 * ------------------------------------------------
 */
function init(){
	console.log('init called');
	//
	commitversion = $('#commitid').text();
	console.log('commit version: ' + commitversion);
	//
	//
	$('#status').text('Started');
	$('#start-btn').on('click', function(){
		if(performance_test)
			$('#performance-stats table').append('<tr> <td>Start clicked</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
		start();
	});
	//
	//
	let dataURL = './assets/data/dataSummary.json' + '?v=' + commitversion;
	console.log('dataURL: ' + dataURL);
	$.getJSON(dataURL, function( data ) {
	  console.log('Loaded datasets summary');
	  //
	  let dataWaitInterval = setInterval(function(){
      if(mainScroll != null && !$.isEmptyObject(mergedMasks) && !$.isEmptyObject(mergedLegends)){
        clearInterval(dataWaitInterval);
        datasets = data;
        loadDatasets();
      }
    },1000);
	  //
	});
	//
	//
  let masksURL = './assets/data/mergedMasks.json' + '?v=' + commitversion;
  console.log('mergedMasksURL: ' + masksURL);
  $.getJSON(masksURL, function( data ) {
    mergedMasks = data;
    console.log('Loaded mask files');
  });
  //
  //
  let legendsURL = './assets/data/mergedLegends.json' + '?v=' + commitversion;
  console.log('mergedLegendURL: ' + legendsURL);
  $.getJSON(legendsURL, function( data ) {
    mergedLegends = data;
    console.log('Loaded legend files');
  });


	// Setup PIXI canvas
	let canvas = document.getElementById('main-scroll-canvas');
	pixiWidth = canvas.offsetWidth;
	pixiHeight = canvas.offsetHeight;

	//Create a Pixi Application
	PIXI.utils.skipHello();
	let app = new PIXI.Application({
	    width: pixiWidth,
	    height: pixiHeight,
	    antialias: true,
	    backgroundAlpha: 0,
	    resolution: 1,
	    view: canvas
	  }
	);
	const cull = new Cull({ recursive: true, toggle: 'renderable' });
	//
	mainApp = app;
	mainStage = mainApp.stage = new PIXI.display.Stage();
	//
	mainApp.ticker.add(function(delta) {
		window.meter.tick();
		//obtain the position of the mouse on the stage
    let mousePosition = app.renderer.plugins.interaction.mouse.global;

    let hit;
    if (hit = app.renderer.plugins.interaction.hitTest(mousePosition)) {
        // hit
        console.log(hit);
    }
    //
	});
	// Cull the entire scene graph, starting from the stage
	cull.add(mainStage);
	// "prerender" is fired right before the renderer draws the scene
	mainApp.renderer.on('prerender', () => {
	    // Cull out all objects that don't intersect with the screen
	    cull.cull(mainApp.renderer.screen);
	});

	//
	backgroundLayer = new PIXI.display.Layer();
	navLayer = new PIXI.display.Layer();
	maskLayer = new PIXI.display.Layer();
	mainStage.addChild(backgroundLayer, navLayer, maskLayer);
	//
	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Pixi setup</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');

	// INTERACTIONS
	initPanZoom();

	//
	loadAudio();
	loadHQ();
}


//
function loadDatasets(){
	//
	for (let id in datasets)
		loadDataset(id, true);
	//
	//
	Promise.all(earlySVGDataPromises).then((values) => {
		console.log('Processing early datasets...');
		$('#status').text('Processing early datasets...');
		setTimeout(function(){
			//
			//correctMaskOrder();
			//
			console.log('Loaded all datasets');
		  loaded.svgdata = true;
	  	//
	  	if(loaded.HQimage){
	  		$('#status').text('Loaded');
	  		setInterval(function(){	$('#status').hide();	},2000);
	  	}
	  	else
	  		$('#status').text('Still loading HQ scroll image...');
	  	//
		}, 4000);
	});
	//
}

function loadDataset(id, early=true){
	if (datasets.hasOwnProperty(id)) {
      console.log('Loading data for : ' + id);
      let maskdata = mergedMasks[id];
      let legenddata = mergedLegends[id];
      //
      let mpath = datasets[id].maskpath;
      let lpath = datasets[id].legendpath;
      let title = datasets[id].title;
      //
      if(window.debug){
	      let pieces = mpath.split('/');
	      let fname = pieces[pieces.length-1];
	      pieces[pieces.length-1] = 'Debug';
	      pieces.push(fname);
	      mpath = pieces.join('/');
	    }
	    //
	    let morder = datasets[id].order;
	    if(morder != 'front' && morder != 'back')
	    	morder = null;
	    //
      let maskpromise = maskLoad(title, maskdata, mpath, id, morder);
      let legendpromise = legendLoad(title, legenddata, id);
      //
      if(early){
      	earlySVGDataPromises.push(maskpromise);
      	earlySVGDataPromises.push(legendpromise);
      }else{
      	allSVGDataPromises.push(maskpromise);
	      allSVGDataPromises.push(legendpromise);
      }
      //
			//
      if(datasets[id].hasOwnProperty('popdimensions')){
      	console.log('Loading dimensions for : ' + id);
      	//
      	let dim = datasets[id].popdimensions;
      	popupBBoxes[id] = {
      		mask: null,
      		legend: null,
	      	paths: [],
	      	rects: [],
	      	dimensions: dim
	      };
	      //
	      //
	      let count = popupBBoxes[id]['dimensions'].length;
				console.log('boxes: ' + count);
				/*
				let s = pixiHeight/mainScroll.height;
		    let rs = (pixiHeight/refPopupSize.height);
				console.log('paper scale ratio: ' + rs);
				//
				for(let i=0; i < count; i++){
					//
					let _x = parseInt(popupBBoxes[id]['dimensions'][i].x);
					let _y = parseInt(popupBBoxes[id]['dimensions'][i].y);
					let _width = parseInt(popupBBoxes[id]['dimensions'][i].width);
					let _height = parseInt(popupBBoxes[id]['dimensions'][i].height);
					//
					_x *= rs; _x += (paperWidth*3/4);
					_y *= rs;
					_width *= rs;
					_height *= rs;
					//
					let p1 = new paper.Point(_x, _y);
					let p2 = new paper.Point(_x+_width, _y+_height);
					let rectPath = newPopRect(p1,p2);
					legendLayer.addChild(rectPath);
					//
					let arec = new paper.Rectangle(p1,p2);
					let aprec = new paper.Path.Rectangle(arec);
					//
					popupBBoxes[id]['paths'].push(rectPath);
					popupBBoxes[id]['paths'][i].visible = false;
					popupBBoxes[id]['rects'].push(aprec);
					//console.log(popupBBoxes[id]['paths'][i]);
				}
				//
				maskLayer.visible = false;
				*/
      }
      //
      //
	}
}

/*
function correctMaskOrder(){
		// bring some masks to front and others back
		for(let i=0; i<maskLayer.children.length; i++){
			let child = maskLayer.children[i];
			//
			let order = child.data.order;
			//
			if(order == 'back')
				child.sendToBack();
			if(order == 'front')
				child.bringToFront();
			//
			//
		}
}


function newPopRect(p1, p2) {
	// Create pixel perfect dotted rectable for drag selections.
	var half = new paper.Point(0.5 / paper.view.zoom, 0.5 / paper.view.zoom);
	var start = p1.add(half);
	var end = p2.add(half);
	var rect = new paper.CompoundPath();
	rect.moveTo(start);
	rect.lineTo(new paper.Point(start.x, end.y));
	rect.lineTo(end);
	rect.moveTo(start);
	rect.lineTo(new paper.Point(end.x, start.y));
	rect.lineTo(end);
	rect.strokeColor = '#009DEC';
	rect.strokeWidth = 1.0 / paper.view.zoom;
	rect.dashOffset = 0.5 / paper.view.zoom;
	rect.dashArray = [1.0 / paper.view.zoom, 1.0 / paper.view.zoom];
	rect.data.guide = true;
	rect.selected = false;
	return rect;
};
*/

//
//
//
function maskLoad(title, svgxml, svgpath, num, order = null){
	//
	let skipLoad = false;
	const mpromise = new Promise((resolve, reject) => {
		//
		//
		if(skipLoad)
			resolve('m'+num);
		else{
			//
			let svgDOM = new DOMParser().parseFromString(svgxml, 'image/svg+xml');
			let svgEl = svgDOM.documentElement;
			let mask = new SVGScene(svgEl);
			maskFiles.push(mask);
			//
			console.log('Loaded '+num+' mask');
			if(window.debug)
				$('#status').text('Loaded '+num+' mask-debug');
			else
				$('#status').text('Loaded '+num+' mask');
			//
			//
			//
			//
			if(mask.data == undefined)
				mask.data = {};
			mask.data.legendName = 'legend-'+num;
			mask.data.maskName = 'mask-' + num;
			mask.name = 'mask-' + num;
			mask.data.order = order;
			//
			//if(order == 'back')
			//	mask.sendToBack();
			//if(order == 'front')
			//	mask.bringToFront();
			//
			//if(mask.children != undefined)
			//	updateChildLegend(mask.children, mask.data.legendName);
			//
			//
			let s = mainScrollScale;
			let lms = pixiHeight/mask.height;//mask-scale
			console.log('MAIN SCALE: ' + s);
			console.log('MASK SCALE: ' + lms);
			//
			//
			let offset = 625 + (pixiWidth*s*3/4);
			mask.scale.set(lms, lms);
			mask.x = offset ;//+ (pixiWidth*3/4);//Change the sprite's position
		  //mask.alpha = 0.3;
		  mask.interactive = true;
			mask.buttonMode = true;
			//
			mask._pointerDown = false;
			mask._pointerDragging = false;
			//mask._pointerPosition = new Point();
			mask._pointerMoveTarget = null;
			mask.on('mousedown', function(){
				console.log('mask mousedown');
			}, this);
			mask.on('mouseup',  function(){
				console.log('mask mouseup');
			}, this);
			mask.on('mouseupoutside',  function(){
				console.log('mask mouseupoutside');
			}, this);
			mask.on('click', function(){
				console.log('mask click');
			});
			mask.on('mouseenter', function(){
				console.log('mask mouseenter');
			});
			mask.on('added', function(){
				console.log('mask added');
			});
			/*
			maskLayer.on('pointerdown', function(){
				console.log('Clicked on - ' +num);
			});
			*/
			if(popupBBoxes[num] != undefined){
				popupBBoxes[num]['mask'] = mask;
				//
				let _x = parseInt(popupBBoxes[num]['dimensions'][0].x);
				let _y = parseInt(popupBBoxes[num]['dimensions'][0].y);
				let _width = parseInt(popupBBoxes[num]['dimensions'][0].width);
				let _height = parseInt(popupBBoxes[num]['dimensions'][0].height);
				// Add a hit area..
				mask.hitArea = new PIXI.Rectangle(_x, _y, _width, _height);
				//
				mask.click = function (e) {
					console.log(this, e);
					console.log(num);
				}

			}
			//
		  maskLayer.addChild(mask);
			//
			//
			/*
			// APPROACH - A //
			let maskTexture = PIXI.Texture.from(svgpath);
			let maskLoaded = false;
			maskTexture.on('update', () => {
				if(!maskLoaded){
					let mask = new PIXI.Sprite(maskTexture);
					maskFiles.push(mask);
					//
					console.log('Loaded '+num+' mask');
					if(window.debug)
						$('#status').text('Loaded '+num+' mask-debug');
					else
						$('#status').text('Loaded '+num+' mask');
					//
					//
					if(popupBBoxes[num] != undefined)
						popupBBoxes[num]['mask'] = mask;
					//
					//
					//
					if(mask.data == undefined)
						mask.data = {};
					mask.data.legendName = 'legend-'+num;
					mask.data.maskName = 'mask-' + num;
					mask.name = 'mask-' + num;
					mask.data.order = order;
					//
					//if(order == 'back')
					//	mask.sendToBack();
					//if(order == 'front')
					//	mask.bringToFront();
					//
					//if(mask.children != undefined)
					//	updateChildLegend(mask.children, mask.data.legendName);
					//
					//
					let s = mainScrollScale;
					let lms = pixiHeight/maskTexture.height;//mask-scale
					console.log('MAIN SCALE: ' + s);
					console.log('MASK SCALE: ' + lms);
					//
					let offset = 630;
					mask.scale.set(lms, lms);
					mask.x = offset ;//+ (pixiWidth*3/4);//Change the sprite's position
				  //mask.alpha = 0;
					//
				  maskLayer.addChild(mask);
				}
				maskLoaded = true;
			});
			*/
			resolve('m'+num);
			//
		}
		//
		//
	});
	//
	//
	return mpromise;
}

function measureSVG(svg) {
	const viewBox = svg.getAttribute('viewBox').split(' ');
	const width = parseInt(viewBox[2]);
	const height = parseInt(viewBox[3]);
	svg.dataset.width = width;
	svg.dataset.height = height;
}

//
//
//
function legendLoad(title, svgxml, num){

	const lpromise = new Promise((resolve, reject) => {
		resolve('l'+num);
		/*
		paper.project.importSVG(svgxml, function(item){
			console.log('Loaded '+num+' legend');
			$('#status').text('Loaded '+num+' legend');

			//
			let legend = item;
			legendFiles.push(legend);
			//console.log(num + '-legend');
			//console.log(legend);
			//console.log(popupBBoxes[num]);
			if(popupBBoxes[num] != undefined){
				popupBBoxes[num]['legend'] = legend;
			}
			//
			//
			legend.name = 'legend-'+num;
			legend.visible = false;
			//
			//
			let s = pixiHeight/mainScroll.height;
			let lms = pixiHeight/legend.bounds.height;//mask-scale
			console.log('LEGEND SCALE: ' + lms);
			//
			legend.scale(lms);
			legend.position = paper.view.center;
			legend.position.x = (paperWidth*3/4) + (legend.bounds.width/2) + (mainScroll.width*s - legend.bounds.width);
			//
			legendLayer.addChild(legend);
			//
			resolve('l'+num);
		});
		*/
	});
	//
	return lpromise;
}
//



function loadAudio(){
	$('#status').text('Loading audio');
	//
	let base_path = './assets/audio/tracks/Baseline_'
	let urls = {};
	// Load base tracks
	for(let i=0; i < 7; i++){
		let index = (i+1);
		let path = base_path + index + '.mp3';
		//
		//
		let bplayer = new Tone.Player({
			url: path,
			loop: true,
			fadeOut: 1,
			fadeIn: 1,
			onload: function(){
				allTracksCount++;
				if(performance_test)
					if(allTracksCount == 8)
						$('#performance-stats table').append('<tr> <td>Loaded 8 tracks</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');

			}
		}).toDestination();
		//
		//
		baseTracks['base'+index] = bplayer;
	}
	//
	// the intro player
	introTrack = new Tone.Player({
		url: './assets/audio/loops/-1.mp3',
		loop: true,
		loopStart: 0,
		loopEnd: 20,
		fadeOut: 1,
		onload: function(){
				allTracksCount++;
				if(performance_test)
					if(allTracksCount == 8)
						$('#performance-stats table').append('<tr> <td>Loaded 8 tracks</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');

			}
	}).toDestination();
	//
	//
	//
}

/**
 * ------------------------------------------------
 * High Quality Image
 * ------------------------------------------------
 */
function loadHQ(){
	$('#status').text('Loading '+scrollType+' Quality scroll...');
  console.log('loading High Quality Image');
  if(performance_test)
		$('#performance-stats table').append('<tr> <td>Started load 150ppi-images</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
	//
  //load an image and run the `setup` function when it's done
  let HQpath = './assets/images/SCROLL_cs6_ver23_APP_final_150ppi-LOW-';
	PIXI.Loader.shared
	  .add(HQpath+'01-or8.png')
	  .add(HQpath+'02-or8.png')
	  .load(function(){
	  	console.log('Loaded HQ image');
	  	if(performance_test)
				$('#performance-stats table').append('<tr> <td>Loaded 150ppi-images</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
	    //
	    initSVGscroll(HQpath);
	    initSplash(800);
	    //
			loadNav();
			initNav();
			//
			loaded.HQimage = true;
			if(performance_test)
				$('#performance-stats table').append('<tr> <td>Background Layer ready</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
			if(allTracksCount == 8){
				//
	  		$('#status').text('Loaded');
	  		$('#status').show();
	  		$('#start-btn').show();
	  		if(performance_test){
					$('#performance-stats table').append('<tr> <td>App Ready</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
	  			$('#performance-stats table').append('<tr> <td>-----</td> <td>-----</td> <td>-----</td></tr>');
	  		}
				setInterval(function(){	$('#status').hide();	}, 2000);
	  	}else{
	  		$('#start-btn').hide();
	  		let waitTillTracksLoad = setInterval(function(){
	  			if(allTracksCount == 8 && loaded.HQimage && loaded.svgdata){
	  				console.log('Total tracks loaded = ' + allTracksCount);
	  				//
	  				clearInterval(waitTillTracksLoad);
	  				$('#status').text('Loaded');
	  				$('#status').show();
	  				$('#start-btn').show();
		  			if(performance_test){
							$('#performance-stats table').append('<tr> <td>App Ready</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
		  				$('#performance-stats table').append('<tr> <td>-----</td> <td>-----</td> <td>-----</td></tr>');
		  			}
						setInterval(function(){	$('#status').hide();	}, 2000);
	  			}else
	  				console.log('Waiting for allTracks to complete loading');
		  	},2000);
	  	}
	  	//
	  	//backgroundLayer.sendToBack();
			//
	  });
}

/**
 * ------------------------------------------------
 * Initialize navigation
 * ------------------------------------------------
 */
function initNav(){
	console.log('Initializing navigation');
	//
	$('.jump').click(function(el){
		if(maskLayer.visible)
			maskLayer.visible = false;
		//
		//
		let chap_id = parseInt($(el.currentTarget).attr('data-id'));
		let current_chapter = $.grep($(navChapters), function(e){ return e.id == 'nav-ch'+chap_id; });
		let locX = -1*parseFloat($(current_chapter).attr('x'))*navScale;
		let w = parseFloat($(current_chapter).attr('width'))*navScale;
		//
		if(w > pixiWidth)
			locX -= (pixiWidth/2);
		else
			locX -= w/2;
		//
		//
		let dur = 2000;
		let diff = Math.abs(locX - mainStage.position.x);
		if(diff < pixiWidth ){
			let ratio = diff/pixiWidth;
			dur = parseInt(2000 * ratio);
			if(dur < 350)
				dur = 350;
		}
		//
		TweenMax.to(mainStage.position, dur/1000, {
			x: locX,
			ease: Power4.easeInOut
		})
		//
		//
		let elements = $('.jump');
		let navLoc = chap_id;
		for(let i=0; i < elements.length; i++){
			let ele = $(elements[i]);
			let id = parseInt(ele.attr('data-id'));
			if(ele.hasClass('selected') ){
				ele.removeClass('selected');
				ele.find('img')[0].src = ele.find('img')[0].src.replace('_selected','_default');
			}
			if(id == navLoc){
				console.log('Updated - ' + navLoc);
				currentNavLoc = navLoc;
				ele.addClass('selected');
				//
				ele.find('img')[0].src = ele.find('img')[0].src.replace('_default','_selected');
			}
		}
		//

		// Stop all tracks and start target track
		for(let i=0; i < 7; i++)
  		baseTracks['base'+(i+1)].stop();
  	setTimeout(function(){
			console.log('Completed scroll for - ' + chap_id);
			maskLayer.visible = true;
			//
			console.log('Changing base track...');
    	currentTrack = 'base' + chap_id;
    	//
    	console.log('Now playing : ' + currentTrack);
    	baseTracks[currentTrack].start();
			//
		},dur);
		console.log(chap_id + ' clicked -- scroll to: ' + locX);
		//
	});
	//
}


/**
 * ------------------------------------------------
 * Load navigation layer
 * ------------------------------------------------
 */
function loadNav(){
	console.log('Loading nav sections');
	//
	let navPath = './assets/data/ChapterNavigation.svg';

	$.get(navPath, function( data ) {
		let svgEl = data.documentElement;
		let navScene = new SVGScene(svgEl);
		//
		navChapters = navScene.content.children[4].children;
		//
		let lms = pixiHeight/navScene.height;//mask-scale
		console.log('Navigation SCALE: ' + lms);
		navScale = lms;
		//
		navScene.scale.set(lms, lms);
	  navScene.x = (pixiWidth*mainScrollScale*3/4);//Change the sprite's position
	  navScene.alpha = 0;
		//
		//navLayer.addChild(navScene); // hitTest not required So, no need to add it to layer
		if(performance_test)
			$('#performance-stats table').append('<tr> <td>Loaded nav</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
		//
  });
	//
}

/**
 * ------------------------------------------------
 * scrollNavEffect
 * ------------------------------------------------
 */
function scrollNavEffect(){
	for(let i=0; i < navChapters.length-1; i++){
		let this_locX = parseFloat($(navChapters[i]).attr('x'))*navScale;
		let next_locX = parseFloat($(navChapters[i+1]).attr('x'))*navScale;
		//
		if(Math.abs(mainStage.position.x) >  this_locX && Math.abs(mainStage.position.x) < next_locX){
			let name = navChapters[i].id
			//
			if(name.includes('nav-ch')){
				if(currentNavLoc == -1){
					$('.nav').fadeIn();
					//
					introTrack.stop();
					currentTrack = 'none';
				}
				let navLoc = parseInt(name.replace('nav-ch', ''));
				if(currentNavLoc != navLoc){
					console.log('currentNavLoc not same - ' + currentNavLoc + ' '  + navLoc);
					let elements = $('.jump');
					for(let i=0; i < elements.length; i++){
						let ele = $(elements[i]);
						let id = parseInt(ele.attr('data-id'));
						if(ele.hasClass('selected') ){
							ele.removeClass('selected');
							ele.find('img')[0].src = ele.find('img')[0].src.replace('_selected','_default');
						}
						if(id == navLoc){
							console.log('Updated - ' + navLoc);
							currentNavLoc = navLoc;
							ele.addClass('selected');
							//
							ele.find('img')[0].src = ele.find('img')[0].src.replace('_default','_selected');
						}
					}
				}
			}
			//
			if(name.includes('intro')){
				$('.nav').fadeOut();
				currentNavLoc = -1;
				//
				if(currentTrack != 'intro'){
					//
					for(let i=0; i < 7; i++)
						baseTracks['base'+(i+1)].stop();
	        //
					introTrack.start();
					currentTrack = 'intro';
				}
			}
			//
		}
		//
	}
	navScrolledUpdate = true;
}


/**
 * ------------------------------------------------
 * Initialize scroll image(background layer)
 * ------------------------------------------------
 */
function initSVGscroll(_url){
	//
	//Create the sprite
  let scroll_01 = new PIXI.Sprite(PIXI.Loader.shared.resources[_url+'01-or8.png'].texture);
  let scroll_02 = new PIXI.Sprite(PIXI.Loader.shared.resources[_url+'02-or8.png'].texture);
  //
  // Scale the raster
	let s = pixiHeight/scroll_01.height;
	mainScrollScale = s;
	console.log('SCALE: ' + s);
	scroll_01.scale.set(s, s);
	scroll_02.scale.set(s, s);
	//Change the sprite's position
  scroll_01.x = (pixiWidth*s*3/4);// + (scroll_01.width*s/2);
	scroll_02.x = scroll_01.x + scroll_01.width;
	//
	scrollWidth = scroll_01.width*s*2;
	scrollHeight = pixiHeight;
	/*
	scroll_01.interactive = true;
	scroll_01.buttonMode = true;
	scroll_01.on('pointerdown', function(){
		console.log('Clicked on scroll_01')
	});
	*/
	//Add the scroll to the stage
  backgroundLayer.addChild(scroll_01);
	backgroundLayer.addChild(scroll_02);
	mainScroll = {
		'part1': scroll_01,
		'part2' : scroll_02
	};
	//
	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Init 150ppi-images</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
	//
}

/**
 * ------------------------------------------------
 * Initialize splash image (background layer)
 * ------------------------------------------------
 */
function initSplash(_width){
	//
	// SPLASH
	//
	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Started splash</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
	//
	let splashURL = './assets/images/OsmoSplash.png';
  PIXI.Loader.shared
		  .add(splashURL)
		  .load(function(){
		  	console.log('Loaded sprite');
		  	if(performance_test)
					$('#performance-stats table').append('<tr> <td>Loaded splash</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
		  	//Create the sprite
				let splashSprite = new PIXI.Sprite(PIXI.Loader.shared.resources[splashURL].texture);
			  backgroundLayer.addChild(splashSprite);
			  //
			  // Scale the raster
				let s = _width/splashSprite.width;
				splashSprite.scale.set(s, s);
				//
				splashSprite.anchor.x = 0.5;
				splashSprite.anchor.y = 0.5;
				// Move the raster to the center of the view
				splashSprite.x = pixiWidth/2;
			  splashSprite.y = pixiHeight/2;
			  //
			  // START BUTTON
				$('#start-btn').css('position', 'fixed');
				$('#start-btn').css('left', splashSprite.x - $('#start-btn').outerWidth()/2);//;
				$('#start-btn').css('top', splashSprite.y + splashSprite.height*0.65);//);

				//
				// SCROLL TEXT & ARROW
				//
				const style = new PIXI.TextStyle({
				    fontFamily: 'Roboto',
				    fontSize: window.isMobile?12:18,
				    fill: '#b97941'
				});
				let text = new PIXI.Text(window.isMobile?'Hold & Scroll to explore':'Scroll to explore',style);
				let textLoc = new PIXI.Point(splashSprite.x - splashSprite.width/3 + 15, splashSprite.y + splashSprite.height*0.4);
				text.x = textLoc.x;
				text.y = textLoc.y;
				//
				let start = new PIXI.Point(textLoc.x + text.width + 10, textLoc.y+12);
				let end = new PIXI.Point((splashSprite.width - text.width)/2, 0);
				let line = new PIXI.Graphics();
				line.position.set(start.x, start.y);
				line.lineStyle(1, 0xb97941)
			       .moveTo(0, 0)
			       .lineTo(end.x, end.y);
				let size = window.isMobile?4:8;
				let triangle = createTriangle(start.x+end.x, start.y+end.y+(size/2), size, 0xb97941);
				triangle.rotation = -Math.PI/2;
				//
				backgroundLayer.addChild(text);
				backgroundLayer.addChild(line);
				backgroundLayer.addChild(triangle);
				//
				if(performance_test)
					$('#performance-stats table').append('<tr> <td>Splash ready</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
				//
		  });
	//
}


function createTriangle(xPos, yPos, _scale, _color) {
  var _triangle = new PIXI.Graphics();
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


/**
 * ------------------------------------------------
 * Pan & Zoom Interaction
 * ------------------------------------------------
 */
function initPanZoom(){
	console.log('Initializing pan and zoom interactions');
	// Main scrolling functionality
	$('#main-scroll-canvas').on('mousewheel', function(event) {
		// NOTE ADD - PERFORMACE STATS FOR THIS ASWELL
		if(!started) return; // Wait for start button press
		//
		// Prevent multiple events
		//
		let et;
		et = event.originalEvent;
		event.preventDefault();
		//
		if(maskLayer.visible)
			maskLayer.visible = false;
		//
		if(navScrolledUpdate){
			//
			let scrolling_id = Date.now();
			if(performance_test)
				$('#performance-stats table').append('<tr> <td>Start scrolling '+scrolling_id+'</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
			//
			navScrolledUpdate = false;
			setTimeout(function(){	scrollNavEffect();	},150);
			//
			// Check inactivity and then change baseTracks
			//
			clearTimeout($.data(this, 'scrollTimer'));
	    $.data(this, 'scrollTimer', setTimeout(function() {
	        //
	        maskLayer.visible = true;
	        //
	        if(currentNavLoc != -1 && (currentTrack != ('base'+currentNavLoc))){
	        	console.log('Changing base track - Haven\'t scrolled in 250ms!');
	        	currentTrack = 'base' + currentNavLoc;
	        	//
	        	for(let i=0; i < 7; i++)
	        		baseTracks['base'+(i+1)].stop();
	        	//
	        	console.log('Now playing : ' + currentTrack);
	        	//
	        	if(performance_test)
							$('#performance-stats table').append('<tr> <td>Baselnie change '+scrolling_id+'</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
						//
						baseTracks[currentTrack].start();
	        }
	    }, 250));
	    //
			$('#status').text('Scrolling...');
			$('#status').show();
			//
			//
			if(performance_test)
				$('#performance-stats table').append('<tr> <td>End scrolling '+scrolling_id+'</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
			//
			//
		}
		//
		// Change mainStage position with scroll
		//
		let fac = 1.005/(mainStage.scale.x*mainStage.scale.y);
		let deltaValX, deltaValY;
		deltaValX = et.deltaY;
		deltaValY = et.deltaY;
		mainStage.position = changeCenter(mainStage.position, deltaValX, 0, fac);
		//
		//
	});
	//
	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Init pan-zoom</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
	//
}

/**
 * ------------------------------------------------
 * changeCenter
 * ------------------------------------------------
 */
function changeCenter(oldCenter, deltaX, deltaY, factor){
  //
  let offset = new PIXI.Point(deltaX, -deltaY);
  offset.multiplyScalar(factor, offset);
  oldCenter.add(offset, oldCenter);
  //
  if(oldCenter.x > 0)
  	oldCenter.x  = 0;
  if(oldCenter.x < -1*(scrollWidth + 2*(pixiWidth + pixiWidth*mainScrollScale*3/4)))
  	oldCenter.x  = -1*(scrollWidth + 2*(pixiWidth + pixiWidth*mainScrollScale*3/4));
  //
  /*
	if((oldCenter.y*window.app.stage.scale.x - pixiHeight/2) <= 0 && deltaY > 0)
  	oldCenter.y = pixiHeight/(2*window.app.stage.scale.x);
  if(oldCenter.y*window.app.stage.scale.x > (-pixiHeight/2 + pixiHeight*window.app.stage.scale.x) && deltaY < 0)
  	oldCenter.y = (-pixiHeight/(2*window.app.stage.scale.x) + pixiHeight);
  */
  //
  return oldCenter;
}

/**
 * ------------------------------------------------
 * changeZoom
 * ------------------------------------------------
 */
function changeZoom(oldZoom, delta){
	let factor = 1.015;
	let newZoom = oldZoom;
	//
	if(delta < 0)
		newZoom = oldZoom * factor;
  if(delta > 0)
  	newZoom = oldZoom / factor;
  //
	if(newZoom <= 1)
		newZoom = 1;
	if(newZoom > maxZoom)
		newZoom = maxZoom;
	//
  return newZoom;
}
