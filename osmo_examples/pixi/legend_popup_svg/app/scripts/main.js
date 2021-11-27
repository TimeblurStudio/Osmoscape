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
let maskAlpha = 0.05;
//
let scrollType = '150ppi-LOW';// 150ppi-LOW, 300ppi-HIGH, 600ppi-RETINA
let mainScroll;
let mainApp;
let mainStage;
let navChapters;
let navScrolledUpdate = true;
let mainScrollScale;
let navScale;
let pixiScale;
let exploreGroup;
//
let allTracksCount = 0;
let currentTrack;
let introTrack;
let baseTracks = {};
//
let backgroundContainer;
let navContainer;
let legendContainer;
let maskContainer;
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
let loadIndividualFiles = false;
let mergedLegends = {}, mergedPolygons = {};
let uploadedLegendFile = [];
let maskAreas = [], legendFiles = [];
let earlySVGDataPromises = [], allSVGDataPromises = [];
//
//
let performance_test = false;
let commitversion = '';
//
window.maskAreas = maskAreas;
window.legendFiles = legendFiles;
window.popupBBoxes = popupBBoxes;
//
window.earlySVGDataPromises = earlySVGDataPromises;
window.allSVGDataPromises = allSVGDataPromises;
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
		let nav_children = $('.nav').children();
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
      if(mainScroll != null && !$.isEmptyObject(mergedLegends) && !$.isEmptyObject(mergedPolygons)){
        clearInterval(dataWaitInterval);
        datasets = data;
        loadDatasets();
        //
      }
    },1000);
	  //
	});
	//
	//
  //
  let legendsURL = './assets/data/mergedLegends.json' + '?v=' + commitversion;
  console.log('mergedLegendURL: ' + legendsURL);
  $.getJSON(legendsURL, function( data ) {
    mergedLegends = data;
    console.log('Loaded legend files');
  });

  //
  let polygonsURL = './assets/data/mergedPolygons.json' + '?v=' + commitversion;
  console.log('mergedPolygonsURL: ' + polygonsURL);
  $.getJSON(polygonsURL, function( data ) {
    mergedPolygons = data;
    console.log('Loaded polgon files');
  });

	// Setup PIXI canvas
	let canvas = document.getElementById('main-scroll-canvas');
	pixiScale = 2;
	pixiWidth = canvas.offsetWidth;
	pixiHeight = canvas.offsetHeight;

	//Create a Pixi Application
	//PIXI.utils.skipHello();
	let app = new PIXI.Application({
	    width: pixiWidth*pixiScale,
	    height: pixiHeight*pixiScale,
	    antialias: false,
	    backgroundAlpha: 0,
	    view: canvas
	  }
	);
	const cull = new Cull({ recursive: true, toggle: 'renderable' });
	//
	mainApp = app;
	mainStage = mainApp.stage;
	mainStage.scale.set(pixiScale, pixiScale);
	//
	mainApp.ticker.add(function(delta) {
		window.meter.tick();
		//obtain the position of the mouse on the stage
    //let mousePosition = app.renderer.plugins.interaction.mouse.global;
    //
	});
	// Cull the entire scene graph, starting from the stage
	cull.add(mainStage);
	// "prerender" is fired right before the renderer draws the scene
	mainApp.renderer.on('prerender', () => {
	    // Cull out all objects that don't intersect with the screen
	    cull.cull(mainApp.renderer.screen);
	});

	backgroundContainer = new PIXI.Container();
	navContainer = new PIXI.Container();
	legendContainer = new PIXI.Container();
	maskContainer = new PIXI.Container();
	//
	navContainer.visible = false;
	legendContainer.visible = false;
	//
	mainStage.addChild(backgroundContainer, navContainer, legendContainer, maskContainer);
	//

	//
	//
	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Pixi setup</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');

	// INTERACTIONS
	initPanZoom();

	//
	loadAudio();
	loadHQ();


	//
	//
	//
	//
	$('#popcancel').click(function(){
		$('#focused-cta').hide();
		//
		$('#focused-info').animate({ left:'-500px'}, 600);
		//$('#focused-info').hide();
		$('.nav').show();
		$('body').css('background-color',  '#b5ced5');
		//
		document.body.style.cursor = 'default';
		//
		//
		backgroundContainer.visible = true;
		maskContainer.visible = true;
		legendContainer.visible = false;
		for(let i=0; i<legendFiles.length; i++)
			if(legendFiles[i].visible)
				legendFiles[i].visible = false;
		//
		let fac = 1.005;//1.005/(mainStage.scale.x*mainStage.scale.y);
		let newCenter = prevBoundsCenter;
		let zoomFac = prevZoom;
		let deltaValX = newCenter.x - mainStage.position.x;
		let deltaValY = -(newCenter.y - mainStage.position.y);
		//
		//mainStage.scale.x = mainStage.scale.y = changeZoom(mainStage.scale.x, -1, zoomFac, false);
		mainStage.position = changeCenter(mainStage.position, deltaValX, deltaValY, fac);
		//
		currentFocus = null;
		hitPopupMode = 'hovering';
	});
	//

	$(window).on('resize', function(){
		window.location.reload(true);
	});
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
      //
      //if(loadIndividualFiles){

      //}
      //
      let legenddata = mergedLegends[id];
      let polygondata = JSON.parse(mergedPolygons[id]);
      //
      let lpath = datasets[id].legendpath;
      let title = datasets[id].title;
      //
	    let morder = datasets[id].order;
	    if(morder != 'front' && morder != 'back')
	    	morder = null;
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
	      	dimensions: dim,
	      	polygons: datasets[id].physics
	      };
	      //
	      //
	      let count = popupBBoxes[id]['dimensions'].length;
				console.log('boxes: ' + count);
				//
				let s = mainScrollScale;
		    let rs = (pixiHeight/refPopupSize.height);
				console.log('pixi scale ratio: ' + rs);
				//
				//
				maskContainer.visible = false;
				//
      }
      //
	    //
      let maskpromise = maskLoad(title, polygondata, id, morder);
      let legendpromise = legendLoad(title, legenddata, lpath, id, loadIndividualFiles);
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
	}
}

/*
function correctMaskOrder(){
		// bring some masks to front and others back
		for(let i=0; i<maskContainer.children.length; i++){
			let child = maskContainer.children[i];
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
function maskLoad(title, polygons, num, order = null){
	//
	let skipLoad = false;
	const mpromise = new Promise((resolve, reject) => {
		//
		//
		if(skipLoad)
			resolve('m'+num);
		else{
			console.log('Loaded '+num+' mask');
			//
			if(window.debug)
				$('#status').text('Loaded '+num+' mask-debug');
			else
				$('#status').text('Loaded '+num+' mask');
			//
			//
			if(popupBBoxes[num] != undefined){
		  	//
				let _x = parseInt(popupBBoxes[num]['dimensions'][0].x);
				let _y = parseInt(popupBBoxes[num]['dimensions'][0].y);
				let _width = parseInt(popupBBoxes[num]['dimensions'][0].width);
				let _height = parseInt(popupBBoxes[num]['dimensions'][0].height);
				//
				let rs = (pixiHeight/refPopupSize.height);
				_x *= rs;
				_y *= rs;
				_width *= rs;
				_height *= rs;
				//
				let graphics = new PIXI.Graphics();
				graphics.beginFill(0xFFA500);
				graphics.lineStyle(1, 0xFF0000);
				graphics.alpha = maskAlpha;
				//graphics.drawRect(_x, _y, _width, _height);
				if(polygons.shapes != undefined){
					for (let s of polygons.shapes){
	          graphics.drawPolygon(s.shape);
	        }
				}
				popupBBoxes[num]['paths'].push(graphics);

				//
				let mask = graphics;
				maskAreas.push(mask);
				//
				if(mask.data == undefined)	mask.data = {};
				mask.data.legendName = 'legend-'+num;
				mask.data.maskName = 'mask-' + num;
				mask.data.id = num;
				mask.name = 'mask-' + num;
				mask.data.order = order;
				//
				//if(order == 'back')
				//	mask.sendToBack();
				//if(order == 'front')
				//	mask.bringToFront();
				//
				//mask.x = (pixiWidth*mainScrollScale*3/4);
				let maskScale = 1;
				if(polygons.viewport){
					let maskHeight = polygons.viewport.split(' ')[3];
					maskScale = pixiHeight/maskHeight;
				}
				//
				mask.scale.set(maskScale, maskScale);
				mask.x = pixiWidth*3/4;
			  //
			  //
	  		mask.interactive = true;
				mask.buttonMode = true;
				mask.on('pointerdown', function(){
				  //
				  console.log('Clicked inside hitArea for mask-'+num);
				  showLegend(num);
				  //
				});
				mask.on('pointerover', function(){
					//
					console.log('Hover on mask-'+num);
				  mainScroll['part1'].alpha = 0.1;
				  mainScroll['part2'].alpha = 0.1;
				  //
				  for(let i=0; i<maskAreas.length; i++)
				  	maskAreas[i].alpha = 0;
				  mask.alpha = maskAlpha;
				  //
				  legendContainer.visible = true;
					for(let i=0; i<legendFiles.length; i++)
						if(legendFiles[i].visible)
							legendFiles[i].visible = false;
				  //
				  popupBBoxes[num].legend.visible = true;
				});
        mask.on('pointerout', function(){
        	//
					console.log('Hover out of mask-'+num);
        	mainScroll['part1'].alpha = 1;
        	mainScroll['part2'].alpha = 1;
        	for(let i=0; i<maskAreas.length; i++)
				  	maskAreas[i].alpha = maskAlpha;
				  //
        	legendContainer.visible = false;
					for(let i=0; i<legendFiles.length; i++)
						if(legendFiles[i].visible)
							legendFiles[i].visible = false;
				  //
        });
				//
				popupBBoxes[num]['mask'] = mask;
				maskContainer.addChild(mask);
				//
			}
			//
			resolve('m'+num);
			//
			//
		}
		//
		//
	});
	//
	//
	return mpromise;
}

//
//
//
function legendLoad(title, svgxml, svgpath, num, frompath){
	//
	const lpromise = new Promise((resolve, reject) => {
		//
		let svgScale = 8.0;
		let newViewPort_x, legendTexture;
		if(!frompath){
			//
			[svgxml, newViewPort_x] = updateSVGviewbox(svgxml, num);
			//
			var parser = new DOMParser();
			var doc = parser.parseFromString(svgxml, 'image/svg+xml');
			let serialized = new XMLSerializer().serializeToString(doc);
			var svgEncoded = 'data:image/svg+xml;base64,' + window.btoa(serialized);
			//
			let resource = new PIXI.SVGResource (svgEncoded, {scale: svgScale});
			legendTexture = PIXI.Texture.from(resource, {resolution: 1.0});
			//
		}else{
			svgpath = '../' + svgpath;// Fix relative path before loading
			legendTexture = PIXI.Texture.from(svgpath, {resolution: 1.0});
		}
		//
		let legendLoaded = false;
		legendTexture.on('update', () => {
			if(!legendLoaded){
				//
				let legend = new PIXI.Sprite(legendTexture);
				legendFiles.push(legend);
				//
				console.log('Loaded '+num+' legend');
				$('#status').text('Loaded '+num+' legend');
				//
				console.log('Loaded '+num+' legend');
				$('#status').text('Loaded '+num+' legend');
				//
				//
				if(popupBBoxes[num] != undefined)
					popupBBoxes[num]['legend'] = legend;
				//
				//
				//
				if(legend.data == undefined)
					legend.data = {};
				legend.data.legendName = 'legend-'+num;
				legend.data.maskName = 'mask-' + num;
				legend.name = 'legend-' + num;
				legend.visible = false;
				//
				//
				//
				//
				let lms = pixiHeight/legendTexture.height;
				console.log('LEGEND SCALE: ' + lms);
				//
				if(!frompath)
					legend.x = newViewPort_x*lms*svgScale + pixiWidth*3/4;
			  else
			  	legend.x = pixiWidth*3/4;
			  legend.scale.set(lms, lms);
				//
			  legendContainer.addChild(legend);
			  resolve('l'+num);
			}
			legendLoaded = true;
		});
		//
	});
	//
	return lpromise;
}
//


function updateSVGviewbox(svgxml, num){
	//
	var svgContainer = document.createElement('div');
	svgContainer.innerHTML = svgxml;
	let svgEle = svgContainer.getElementsByTagName('svg')[0];
	let viewPort = svgEle.getAttribute('viewBox');
  if (!viewPort)
    viewPort = svgEle.getAttribute('x') 
  						 + ' ' + svgEle.getAttribute('y')
               + ' ' + svgEle.getAttribute('width') 
               + ' ' + svgEle.getAttribute('height');
  console.log(num + ' old viewport: ' + viewPort)
  let currentViewPort_x = viewPort.split(' ')[0];
  let currentViewPort_y = viewPort.split(' ')[1];
  let currentViewPort_width = viewPort.split(' ')[2];
  let currentViewPort_height = viewPort.split(' ')[3];
  //
  let newViewPort = viewPort;
  let newViewPort_x = currentViewPort_x;
  let newViewPort_y = currentViewPort_y;
  let newViewPort_width = currentViewPort_width;
  let newViewPort_height = currentViewPort_height;
  //
  let midX = 0;
  if(popupBBoxes.hasOwnProperty(num)){
		// Position of selected area!
		let _x = parseFloat(popupBBoxes[num]['dimensions'][0].x);
		let _y = parseFloat(popupBBoxes[num]['dimensions'][0].y);
		let _width = parseFloat(popupBBoxes[num]['dimensions'][0].width);
		let _height = parseFloat(popupBBoxes[num]['dimensions'][0].height);
		//
		let rs = (pixiHeight/refPopupSize.height);
		_x *= rs; _y *= rs;
		_width *= rs;
		_height *= rs;
		console.log(num + ' popupBBoxes: '+ _x + ' ' + _y + ' ' + _width + ' ' + _height)
		//
		midX = _x + _width/2;
		let xRange = 2000;
		if(_width > xRange)	xRange = _width;	
		//
		newViewPort_x = midX - xRange;
		if(newViewPort_x < 0)	newViewPort_x = 0;
		newViewPort_width = xRange;
	}
	newViewPort = newViewPort_x + ' ' + newViewPort_y + ' '  + newViewPort_width + ' '  + newViewPort_height;
	//
	if(num != '0a' || num != '0b'){
		svgEle.removeAttribute('style');
		svgEle.removeAttribute('x');
		svgEle.removeAttribute('y');
		svgEle.removeAttribute('width'); 
		svgEle.removeAttribute('height');
		svgEle.removeAttribute('viewBox');
		//
		svgEle.setAttribute('x', newViewPort_x + 'px');
		svgEle.setAttribute('y', newViewPort_y + 'px');
		svgEle.setAttribute('width', newViewPort_width + 'px');
		svgEle.setAttribute('height', newViewPort_height + 'px');
		svgEle.setAttribute('viewBox', newViewPort);
		console.log(num + ' new viewport: ' + newViewPort);
	} 
	//
	svgxml = svgEle.outerHTML;
	return [svgxml, newViewPort_x];
}

function measureSVG(svg) {
	const viewBox = svg.getAttribute('viewBox').split(' ');
	const width = parseInt(viewBox[2]);
	const height = parseInt(viewBox[3]);
	svg.dataset.width = width;
	svg.dataset.height = height;
}



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
	  		//
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
	  			}else{
	  				console.log('Waiting for data to complete loading -- allTracks: ' + allTracksCount + ' HQimage: ' + loaded.HQimage + ' SVGdata: ' + loaded.svgdata );
	  			}
		  	},2000);
	  	}
	  	//
	  	//backgroundContainer.sendToBack();
			//
	  });
}

function showLegend(number){
	console.log('Opening legend ' + number);
	//
	$('#status').text('Showing: legend-' + number);
	$('#status').show();
	//
	$('#focused-info').animate({ left:'0px'}, 1200);
	$('.nav').hide();
	//
	hitPopupMode = 'focused';
	maskContainer.visible = false;
	backgroundContainer.visible = false;
	legendContainer.visible = true;
	//
	currentFocus = number;
	console.log('Focused on: ' + currentFocus );
	//
	//
	$('#focused-heading').text(datasets[currentFocus].title);
	$('#focused-description').text(datasets[currentFocus].desc);
	//
	$('#focused-cta').show();
	$('#focused-info').show();
	//
	if(popupBBoxes.hasOwnProperty(currentFocus)){
		//
		let legend = popupBBoxes[currentFocus].legend;
		legend.visible = true;
		//
		//
		// Position into selected area!
		let _x = parseInt(popupBBoxes[currentFocus]['dimensions'][0].x);
		let _y = parseInt(popupBBoxes[currentFocus]['dimensions'][0].y);
		let _width = parseInt(popupBBoxes[currentFocus]['dimensions'][0].width);
		let _height = parseInt(popupBBoxes[currentFocus]['dimensions'][0].height);
		//
		let rs = (pixiHeight/refPopupSize.height);
		_x *= rs;// _x += (pixiWidth*mainScrollScale*3/4);
		_y *= rs;
		_width *= rs;
		_height *= rs;
		//
		prevBoundsCenter = new PIXI.Point(mainStage.position.x, mainStage.position.y);
		var newViewCenter = new PIXI.Point(-1*_x*pixiScale, pixiHeight/2 - _y - _height/2);
		mainStage.position = newViewCenter;
		/*
		// Zoom into selected area!
		prevZoom = zoomFac;
		let zoomFac = fac * 0.5 * pixiWidth / (1.0 * _width);
		mainStage.scale.x = mainStage.scale.y = changeZoom(prevZoom, -1, zoomFac, false);
		*/
	}
	//
	//
	$('body').css('background-color',  '#6d7c80'); //
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
		if(maskContainer.visible)
			maskContainer.visible = false;
		//
		//
		let chap_id = parseInt($(el.currentTarget).attr('data-id'));
		let current_chapter = $.grep($(navChapters), function(e){ return e.id == 'nav-ch'+chap_id; });
		let locX = -1*parseFloat($(current_chapter).attr('x'))*navScale*pixiScale;
		let w = parseFloat($(current_chapter).attr('width'))*navScale*pixiScale;
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
			maskContainer.visible = true;
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
		let lms = pixiHeight/navScene.height;//nav-scale
		console.log('Navigation SCALE: ' + lms);
		navScale = lms;
		//
		navScene.x = (pixiWidth*3/4);//Change the sprite's position
	  navScene.scale.set(lms, lms);
	  navScene.alpha = 1;
		//
		//navContainer.addChild(navScene); // hitTest not required So, no need to add it to layer
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
		let this_locX = parseFloat($(navChapters[i]).attr('x'))*navScale*pixiScale;
		let next_locX = parseFloat($(navChapters[i+1]).attr('x'))*navScale*pixiScale;
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
	//
	scroll_01.scale.set(s, s);
	scroll_02.scale.set(s, s);
	//
	scrollWidth = scroll_01.width*2;
	scrollHeight = pixiHeight;
	//
	//Change the sprite's position
	// NOTE: Offset required since -1 and 0 datasets were added at the end 
	//       (effectively increasing the canvas width)
	//
	let svgOffset = 495;
	let legendHeight = 623.5;
  let offsetRatio = 495/623.5;
	scroll_01.x = -1*offsetRatio*pixiHeight + pixiWidth*3/4;
	scroll_02.x = scroll_01.x + scroll_01.width;
	//
	//Add the scroll to the stage
  backgroundContainer.addChild(scroll_01);
	backgroundContainer.addChild(scroll_02);
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
			  backgroundContainer.addChild(splashSprite);
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
				$('#start-btn').css('left', 'calc(50% - 30px)');
				$('#start-btn').css('bottom', 'calc(50% - 200px)');
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
				backgroundContainer.addChild(text);
				backgroundContainer.addChild(line);
				backgroundContainer.addChild(triangle);
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
		if(maskContainer.visible){
			mainScroll['part1'].alpha = 1;
      mainScroll['part2'].alpha = 1;
			maskContainer.visible = false;
			//
		  legendContainer.visible = true;
			for(let i=0; i<legendFiles.length; i++)
				if(legendFiles[i].visible)
					legendFiles[i].visible = false;
		 	//
		}
		//
		if(navScrolledUpdate){
			//
			let scrolling_id = Date.now();
			if(performance_test)
				$('#performance-stats table').append('<tr> <td>Start scrolling '+scrolling_id+'</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
			//
			if(hitPopupMode != 'focused'){
				navScrolledUpdate = false;
				setTimeout(function(){	scrollNavEffect();	},150);
			}
			//
			// Check inactivity and then change baseTracks
			//
			clearTimeout($.data(this, 'scrollTimer'));
	    $.data(this, 'scrollTimer', setTimeout(function() {
	    		console.log(mainStage.position);
	    		//
	    		if(hitPopupMode != 'focused'){
						maskContainer.visible = true;
						Object.keys(popupBBoxes).forEach(function(key) {
							/*
							let xMin = paper.view.center.x - pixiWidth/2.0;
							let xMax = paper.view.center.x + pixiWidth/2.0;
							//
							//
							if(popupBBoxes[key]['mask'].bounds.rightCenter.x > xMin && popupBBoxes[key]['mask'].bounds.leftCenter.x < xMax)
								popupBBoxes[key]['mask'].visible = true;
							*/
						});
						//
						//hitMaskEffect(event.point, 'hover');
						//

	        }
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
		let fac = 1.005;//(mainStage.scale.x*mainStage.scale.y);
		let deltaValX, deltaValY;
		deltaValX = et.deltaY;
		deltaValY = et.deltaY;
		mainStage.position = changeCenter(mainStage.position, deltaValX, 0, fac*pixiScale);
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
  if(oldCenter.x < -1*(scrollWidth*pixiScale - pixiWidth*3/4))
  	oldCenter.x  = -1*(scrollWidth*pixiScale - pixiWidth*3/4);
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