/**
 * ------------------------------------------------
 * AUTHOR:  Mike Cj (mikecj184)
 * Copyright 2020 - 2021 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */
let started = false;
//
let paperHeight, paperWidth;
let scrollMousePos, scrollPosition;
let scrollWidth, scrollHeight;
let mousePos = null;
let maxZoom = 2;
//
let scrollType = '300ppi-HIGH';// 150ppi-LOW, 300ppi-HIGH, 600ppi-RETINA
let mainScroll;
let exploreGroup;
//
let allTracksCount = 0;
let currentTrack;
let introTrack;
let baseTracks = {};
//
let backgroundLayer;
let navLayer;
//
//
//
let performance_test = true;
//
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
	if(performance_test)
			$('#performance-stats table').append('<tr> <td>Start clicked</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
	console.log('Starting the audio context');
	Tone.start();
	//
	currentTrack = 'intro';
	introTrack.start();
	//
	started = true;
	$('#start-btn').hide();
	//
	exploreGroup.tween(
	    { opacity: 0 },
	    { opacity: 1 },
	    1500
	);
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

//
/**
 * ------------------------------------------------
 * Main Init
 * ------------------------------------------------
 */
function init(){
	console.log('init called');
	$('#status').text('Started');
	//
	// Setup PAPER canvas
	let canvas = document.getElementById('main-scroll-canvas');
	paper.setup(canvas);
	paperHeight = canvas.offsetHeight;
	paperWidth = canvas.offsetWidth;

	//
	backgroundLayer = new paper.Layer();
	navLayer = new paper.Layer();

	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Pixi setup</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');

	// INTERACTIONS
	initPanZoom();

	//
	loadAudio();
	loadHQ();

	//
	paper.project.activeLayer = navLayer;

	// Draw PAPER
	paper.view.draw();

  //
  // Update on paper events
  paper.view.onFrame = function(event) {
    window.meter.tick();
  };
}


function loadAudio(){
	$('#status').text('Loading audio');
	//
	let base_path = '../../../assets/audio/tracks/Baseline_'
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
		url: "../../../assets/audio/loops/-1.mp3",
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
  //
  if(performance_test)
			$('#performance-stats table').append('<tr> <td>Started load 150ppi-images</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
  //
  let image = document.getElementById('HQscroll');
  var downloadingImage = new Image();
  downloadingImage.onload = function(){
		//
  	console.log('Loaded HQ image');
    image.src = this.src;
    //
    if(performance_test)
				$('#performance-stats table').append('<tr> <td>Loaded 150ppi-images</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
    //
    initSVGscroll();
		initSplash(800);//splashWidth: 800px
		//
		loadNav();
		initNav();
		//
		if(performance_test)
				$('#performance-stats table').append('<tr> <td>Background Layer ready</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
		//
		if(allTracksCount == 8){
  		$('#status').text('Loaded');
  		$('#status').show();
		  if(performance_test){
				$('#performance-stats table').append('<tr> <td>App Ready</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
				$('#performance-stats table').append('<tr> <td>-----</td> <td>-----</td> <td>-----</td></tr>');
			}
  		setInterval(function(){	$('#status').hide();	}, 2000);
  	}
  	else{
  		$('#start-btn').hide();
  		let waitTillTracksLoad = setInterval(function(){
  			console.log('Total tracks loaded = ' + allTracksCount);
  			if(allTracksCount == 8){
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
  	backgroundLayer.sendToBack();
  };
  downloadingImage.src = '../../../assets/images/SCROLL_cs6_ver23_APP_final_'+scrollType+'.png';
}

function initNav(){
	console.log('Initializing navigation');
	$('.jump').click(function(el){
		let chap_id = parseInt($(el.currentTarget).attr('data-id'));
		let locX = paper.project.getItem({name: 'nav-ch'+chap_id}).bounds.left;
		let w = paper.project.getItem({name: 'nav-ch'+chap_id}).bounds.width;
		//
		if(w > paperWidth)
			locX += (paperWidth/2);
		else
			locX += w/2;
		//
		let dur = 2000;
		let diff = Math.abs(locX - paper.view.center.x);
		if(diff < paperWidth ){
			let ratio = diff/paperWidth;
			dur = parseInt(2000 * ratio);
			if(dur < 350)
				dur = 350;
		}
		//
		navTweenItem.tween(
		    { position: paper.view.center },
		    { position: new paper.Point(locX, paper.view.center.y) },
		    {
		    	easing: 'easeInOutQuad',
		    	duration: dur
		    }
		).onUpdate = function(event) {
			paper.view.center = navTweenItem.position;
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
	navTweenItem = new paper.Shape.Circle(paper.view.center, 30);
	navTweenItem.fill = '#222';
	navTweenItem.stroke = 'none';
	navTweenItem.position = paper.view.center;
	//
	//console.log(navTweenItem);
}

function loadNav(){
	console.log('Loading nav sections');
	//
	//
	let navPath = '../../../assets/data/ChapterNavigation.svg';
	paper.project.importSVG(navPath, function(item){
		console.log('Loaded Navigation');
		let navigationFile = item;
		//
		let s = paperHeight/mainScroll.height;
		let lms = paperHeight/item.bounds.height;//mask-scale
		console.log('Navigation SCALE: ' + lms);
		//
		item.scale(lms);
		item.position = paper.view.center;
		item.position.x = (paperWidth*3/4) + (mainScroll.width*s/2);
		item.opacity = 0.03;
		//
		navLayer.addChild(item);
		//
		if(performance_test)
			$('#performance-stats table').append('<tr> <td>Loaded nav</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
	});
	//
}

function initSVGscroll(){
	//
	//
	//HQscroll
	// Create a raster item using the image tag with id=''
	let raster = new paper.Raster('HQscroll');
	mainScroll = raster;
	// Scale the raster
	let s = paperHeight/mainScroll.height;
	console.log('SCALE: ' + s);
	mainScroll.scale(s);
	//
	// Move the raster to the center of the view
	mainScroll.position = paper.view.center;
	console.log('Test value');
	console.log((paperWidth*3/4));
	console.log((mainScroll.width*s/2));
	raster.position.x = (paperWidth*3/4) + (mainScroll.width*s/2);
	//
	scrollWidth = mainScroll.width*s;
	scrollHeight = paperHeight;
	//
	backgroundLayer.addChild(mainScroll);
	//
	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Init 150ppi-images</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
}

function initSplash(_width){
	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Started splash</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
	//
	// SPLASH
	//
	let raster = new paper.Raster('splash');
	// Scale the raster
	let s = _width/raster.width;
	raster.scale(s);
	// Move the raster to the center of the view
	raster.position = paper.view.center;
	raster.position.y -= 20;

	// START BUTTON
	$('#start-btn').css('position', 'fixed');
	$('#start-btn').css('left', raster.position.x - $('#start-btn').outerWidth()/2);//;
	$('#start-btn').css('top', raster.position.y + raster.height*s*0.65);//);

	//
	// SCROLL TEXT
	//
	exploreGroup = new paper.Group();
	//
	let textLoc = new paper.Point(raster.position.x - raster.width*s/3, raster.position.y + raster.height*s*0.65);
	let text = new paper.PointText(textLoc);
	text.justification = 'left';
	text.fillColor = '#b97941';
	text.fontFamily = 'Roboto';
	text.fontSize = window.isMobile?'12px':'18px';
	text.content = window.isMobile?'Hold & Scroll to explore':'Scroll to explore';
	let textWidth = text.bounds.width;

	//
	// SCROLL ARROW
	//
	let start = new paper.Point(textLoc.x + textWidth + 10, textLoc.y - 5);
	let end = new paper.Point(start.x+(raster.width*s/2)-textWidth, start.y);
	let line = new paper.Path();
	line.strokeColor = '#b97941';
	line.moveTo(start);
	line.lineTo(end);
	let size = window.isMobile?4:8;
	var triangle = new paper.Path.RegularPolygon(new paper.Point(end.x, end.y+(size/4)), 3, size);
	triangle.rotate(90);
	triangle.fillColor = '#b97941';
	//
	exploreGroup.addChild(text);
	exploreGroup.addChild(line);
	exploreGroup.addChild(triangle);
	exploreGroup.opacity = 0;
	//
	backgroundLayer.addChild(raster);
	backgroundLayer.addChild(exploreGroup);
	//
	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Splash ready</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
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
		let scrolling_id = Date.now();
		if(performance_test)
			$('#performance-stats table').append('<tr> <td>Start scrolling '+scrolling_id+'</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
		// check inactivity
		clearTimeout($.data(this, 'scrollTimer'));
    $.data(this, 'scrollTimer', setTimeout(function() {
        //
        if(currentNavLoc != -1 && (currentTrack != ('base'+currentNavLoc))){
        	console.log("Changing base track - Haven't scrolled in 250ms!");
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
		let et;
		et = event.originalEvent;
		event.preventDefault();
		//
		$('#status').text('Scrolling...');
		$('#status').show();
		//
		//
		//
		hitNavEffect();
		//
		//
		//
		let fac = 1.005/(paper.view.zoom*paper.view.zoom);
		//
		let deltaValX, deltaValY;
		deltaValX = et.deltaY;
		deltaValY = et.deltaY;
		//
		paper.view.center = changeCenter(paper.view.center, deltaValX, 0, fac);
		navTweenItem.position = paper.view.center;
		//
		if(performance_test)
			$('#performance-stats table').append('<tr> <td>End scrolling '+scrolling_id+'</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
		//
	});
	//
	if(performance_test)
		$('#performance-stats table').append('<tr> <td>Init pan-zoom</td> <td>'+Math.round(performance.now()-t0)+'</td> <td>'+Math.round(window.meter.fps)+'</td></tr>');
}

/**
 * ------------------------------------------------
 * hitNavEffect
 * ------------------------------------------------
 */
function hitNavEffect(){
	//
	var hitResult = navLayer.hitTest(paper.view.center, navHitOptions);
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
						ele.find('img')[0].src = ele.find('img')[0].src.replace("_selected","_default");
					}
					if(id == navLoc){
						console.log('Updated - ' + navLoc);
						currentNavLoc = navLoc;
						ele.addClass('selected');
						//
						ele.find('img')[0].src = ele.find('img')[0].src.replace("_default","_selected");
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
		/*
		if(name.includes('outro')){
			$('.nav').fadeOut();
			currentNavLoc = -1;
		}
		*/
	}
}

/**
 * ------------------------------------------------
 * changeCenter
 * ------------------------------------------------
 */
function changeCenter(oldCenter, deltaX, deltaY, factor){
	//
	let offset = new paper.Point(deltaX, -deltaY);
  offset = offset.multiply(factor);
  oldCenter = oldCenter.add(offset);
  //
  if(oldCenter.x < paperWidth/2)
  	oldCenter.x  = paperWidth/2;
  if(oldCenter.x > (scrollWidth + paperWidth/2))
  	oldCenter.x  = (scrollWidth + paperWidth/2);
  //
  //
	if((oldCenter.y*paper.view.zoom - paperHeight/2) <= 0 && deltaY > 0)
  	oldCenter.y = paperHeight/(2*paper.view.zoom);
  if(oldCenter.y*paper.view.zoom > (-paperHeight/2 + paperHeight*paper.view.zoom) && deltaY < 0)
  	oldCenter.y = (-paperHeight/(2*paper.view.zoom) + paperHeight);
  //
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
