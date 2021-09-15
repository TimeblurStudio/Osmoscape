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
import * as Tone from 'tone'
import { SVGScene } from '@pixi-essentials/svg';
//
window.PIXI = PIXI
require('pixi-layers')
//
let started = false;
//
let pixiHeight, pixiWidth;
let scrollMousePos, scrollPosition;
let scrollWidth, scrollHeight;
let mousePos = null;
let maxZoom = 2;
//
let scrollType = '150ppi-HIGH';// 150ppi-LOW, 300ppi-HIGH, 600ppi-RETINA
let mainScroll;
let mainApp;
let mainStage;
let navChapters;
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
//
//
//
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
}


/**
 * ------------------------------------------------
 * Main Init
 * ------------------------------------------------
 */
function init(){
	console.log('init called');
	$('#status').text('Started');
	$('#start-btn').on('click', function(){
		start();
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
	mainApp = app;
	mainStage = mainApp.stage = new PIXI.display.Stage();


	//
	backgroundLayer = new PIXI.display.Layer();
	navLayer = new PIXI.display.Layer();
	mainStage.addChild(backgroundLayer, navLayer);

	// INTERACTIONS
	initPanZoom();

	//
	loadAudio();
	loadHQ();

	/*
	// Draw PIXI
	pixi.view.draw();
	*/
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
  //
  //load an image and run the `setup` function when it's done
  let HQpath = './assets/images/SCROLL_cs6_ver23_APP_final_150ppi-LOW-';
	PIXI.Loader.shared
	  .add(HQpath+'01-or8.png')
	  .add(HQpath+'02-or8.png')
	  .load(function(){
	  	console.log('Loaded HQ image');
	    //
	    initSVGscroll(HQpath);
	    initSplash(800);
	    //
			loadNav();
			initNav();
			//
			if(allTracksCount == 8){
	  		$('#status').text('Loaded');
	  		$('#status').show();
	  		$('#start-btn').show();
	  		setInterval(function(){	$('#status').hide();	}, 2000);
	  	}else{
	  		$('#start-btn').hide();
	  		let waitTillTracksLoad = setInterval(function(){
	  			console.log('Total tracks loaded = ' + allTracksCount);
	  			if(allTracksCount == 8){
	  				clearInterval(waitTillTracksLoad);
	  				$('#status').text('Loaded');
	  				$('#status').show();
	  				$('#start-btn').show();
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

function initNav(){
	console.log('Initializing navigation');
	$('.jump').click(function(el){
		let chap_id = parseInt($(el.target.parentElement).attr('data-id'));
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
		console.log(diff + ' ' + dur);
		mainStage.position = new PIXI.Point(locX, mainStage.position.y);
		/*
		navTweenItem.tween(
		    { position: mainStage.position },
		    { position: new pixi.Point(locX, mainStage.position.y) },
		    {
		    	easing: 'easeInOutQuad',
		    	duration: dur
		    }
		).onUpdate = function(event) {
			mainStage.position = navTweenItem.position;
			//
			hitNavEffect();
			//
		};
		*/
		// Stop all tracks and start target track
		for(let i=0; i < 7; i++)
  		baseTracks['base'+(i+1)].stop();
  	setTimeout(function(){
			console.log('Completed scroll for - ' + chap_id);
			console.log('Changing base track...');
    	currentTrack = 'base' + chap_id;
    	//
    	console.log('Now playing : ' + currentTrack);
    	baseTracks[currentTrack].start();
			//
		},dur);
		//
		console.log(chap_id + ' clicked -- scroll to: ' + locX);
		//console.log('duration: ' + dur);
	});
	//
}

/*
function initNav(){
	console.log('Initializing navigation');
	$('.jump').click(function(el){
		let chap_id = parseInt($(el.target.parentElement).attr('data-id'));
		let locX = pixi.project.getItem({name: 'nav-ch'+chap_id}).bounds.left;
		let w = pixi.project.getItem({name: 'nav-ch'+chap_id}).bounds.width;
		//
		if(w > pixiWidth)
			locX += (pixiWidth/2);
		else
			locX += w/2;
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
		navTweenItem.tween(
		    { position: mainStage.position },
		    { position: new pixi.Point(locX, mainStage.position.y) },
		    {
		    	easing: 'easeInOutQuad',
		    	duration: dur
		    }
		).onUpdate = function(event) {
			mainStage.position = navTweenItem.position;
			//
			hitNavEffect();
			//
		};
		//
		// Stop all tracks and start target track
		for(let i=0; i < 7; i++)
  		baseTracks['base'+(i+1)].stop();
  	//
		setTimeout(function(){
			console.log('Completed scroll for - ' + chap_id);
			console.log("Changing base track...");
    	currentTrack = 'base' + chap_id;
    	//
    	console.log('Now playing : ' + currentTrack);
    	baseTracks[currentTrack].start();
			//
		},dur);
		//
		console.log(chap_id + ' clicked -- scroll to: ' + locX);
		console.log('duration: ' + dur);
	});
	//
	navTweenItem = new pixi.Shape.Circle(mainStage.position, 30);
	navTweenItem.fill = '#222';
	navTweenItem.stroke = 'none';
	navTweenItem.position = mainStage.position;
	//
	//console.log(navTweenItem);
}
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
	  navScene.alpha = 0.3;
		//
		navLayer.addChild(navScene);
		//
		$('.nav').fadeIn()
  });
	//
}

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
	//
	//
	//Add the scroll to the stage
  backgroundLayer.addChild(scroll_01);
	backgroundLayer.addChild(scroll_02);
	//
}


function initSplash(_width){
	//
	// SPLASH
	//
	let splashURL = './assets/images/OsmoSplash.png';
  PIXI.Loader.shared
		  .add(splashURL)
		  .load(function(){
		  	console.log('Loaded sprite');
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
		if(!started)
			return;
		// check inactivity
		clearTimeout($.data(this, 'scrollTimer'));
    $.data(this, 'scrollTimer', setTimeout(function() {
        //
        if(currentNavLoc != -1 && (currentTrack != ('base'+currentNavLoc))){
        	console.log('Changing base track - Haven\'t scrolled in 250ms!');
        	currentTrack = 'base' + currentNavLoc;
        	//
        	for(let i=0; i < 7; i++)
        		baseTracks['base'+(i+1)].stop();
        	//
        	console.log('Now playing : ' + currentTrack);
        	baseTracks[currentTrack].start();
        }
    }, 250));

		//
		let et;
		et = event.originalEvent;
		event.preventDefault();
		//
		$('#status').text('Scrolling...');
		$('#status').show();
		//
		//
		//
		//hitNavEffect();
		//
		//
		//
		let fac = 1.005/(mainStage.scale.x*mainStage.scale.y);
		//
		let deltaValX, deltaValY;
		deltaValX = et.deltaY;
		deltaValY = et.deltaY;
		//
		mainStage.position = changeCenter(mainStage.position, deltaValX, 0, fac);
		//navTweenItem.position = mainStage.position;
		//
	});
}

/**
 * ------------------------------------------------
 * hitNavEffect
 * ------------------------------------------------
 */
/*
function hitNavEffect(){
	//
	var hitResult = navLayer.hitTest(mainStage.position, navHitOptions);
	if(hitResult != null){
		let name = hitResult.item.name;
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
				//console.log('Not same - ' + currentNavLoc + ' '  + navLoc);
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
	}
}
*/

/**
 * ------------------------------------------------
 * changeCenter
 * ------------------------------------------------
 */
function changeCenter(oldCenter, deltaX, deltaY, factor){
  //
  let offset = new PIXI.Point(deltaX, -deltaY);
  offset = new PIXI.Point(offset.x*factor, -offset.y*factor);
  oldCenter = new PIXI.Point(oldCenter.x+offset.x, -oldCenter.y+offset.y);
  /*
  if(oldCenter.x < pixiWidth/2)
  	oldCenter.x  = pixiWidth/2;
  if(oldCenter.x > (scrollWidth + pixiWidth/2))
  	oldCenter.x  = (scrollWidth + pixiWidth/2);
  //
  //
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
