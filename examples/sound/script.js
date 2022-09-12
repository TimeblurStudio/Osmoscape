/**
 * ------------------------------------------------
 * AUTHOR:  Mike Cj (mikecj184)
 * Copyright 2020 - 2021 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */

let paperHeight, paperWidth;
let scrollMousePos, scrollPosition;
let scrollWidth, scrollHeight;
let mousePos;
let maxZoom = 2;
let svgLoaded = false;
let soundInstance = null;// sound function instance
let audioInstance = null;//audio function instance
let autoplay = false;
let playSpeed = 1.5;
let playing = false;
//
let scrollType = '150ppi-LOW';// 150ppi-LOW, 300ppi-HIGH, 600ppi-RETINA
let refPopupSize = { width: 1440.0,	height: 821.0	};
//
//
//
//
console.log('Initializing');
init();
//

//
let datasets = {};
let audio_players = {};
//
//
//
function start(){
	console.log('Starting the audio context');
	Tone.start();
	//
	if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }
	//
	//
	started = true;
	autoplay = true;
	$('#start-btn').hide();
	$('#trackProgress').show();
	//
  /*
  audioInstance = new Audio(soundInstance.buffers, 1);
  console.log(audioInstance);
  console.log(soundInstance.buffers);
  audioInstance.playFile(1);
  */
  playing = true;
  $('#play_pause').show();
  $('#play_pause').click(function(){
  	//
  	if($('#play_pause').html() == '▶'){
  		//
  		console.log('Resuming player');
  		$('#play_pause').html('▶');
  		// Use the Tone.Transport to start again
      if (!playing){
        Tone.Transport.start();
        playing = true;
      }
  		//
  	}else if($('#play_pause').html() == '❚❚'){
  		//
  		console.log('Pausing player');
  		$('#play_pause').html('❚❚');
  		// Use the Tone.Transport to pause audio
      if (playing){
        Tone.Transport.pause();
        playing = false;
      }
    	//
  	}else{
  		;//'Ignore this case'
  	}
  	//
  });

  //
}
//
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

	//
	let dataURL = "../../../assets/data/dataSummary.json";
	console.log('dataURL: ' + dataURL);
	$.getJSON(dataURL, function( data ) {
	  console.log('Loaded datasets summary');
		//
		//
		datasets = data;
		soundInstance = new Sounds();

	  //
	  let dataWaitInterval = setInterval(function(){
	  	if(svgLoaded){
				clearInterval(dataWaitInterval);
				loadDatasetBoundaries();
	  		//
		  }
	  },1000);
	  //
	});
	//

	// Setup PAPER canvas
	let canvas = document.getElementById('main-scroll-canvas');
	paper.setup(canvas);
	paperHeight = canvas.offsetHeight;
	paperWidth = canvas.offsetWidth;

	// INTERACTIONS
	initPanZoom();

	//
	loadScrollImage();

	// Draw PAPER
	paper.view.draw();

	//
	let s = paperHeight/scrollHeight;
  let rs = (paperHeight/refPopupSize.height);
  let crossfadeDuration = 120;//in seconds
	console.log('paper scale ratio: ' + rs);
	//
	paper.view.onFrame = function(event) {
		//
		if(autoplay && playing){
			let fac = 1.005/(paper.view.zoom*paper.view.zoom);
			paper.view.center = changeCenter(paper.view.center, playSpeed, 0, fac);
			//
			//
		  var elem = document.getElementById("trackBar");
		  elem.style.width = (paper.view.center.x / scrollWidth)*100 + "%";//in percentage
	    //
	    if((paper.view.center.x / scrollWidth) > 0.12){
	    	$('#lineIndicator').show();
	    	//
	    	for(let id in datasets){
	    		let dim = datasets[id].popdimensions;
	    		if(dim != undefined){
	    			//
	    			//
		    		let count = dim.length;
		    		for(let i=0; i < count; i++ ){
		    			let crossfadeOffset = crossfadeDuration*playSpeed;
		    			//
							let _x = parseInt(dim[i].x);
							let _y = parseInt(dim[i].y);
							let _width = parseInt(dim[i].width);
							let _height = parseInt(dim[i].height);
							//
							_x *= rs; _x += (paperWidth*3/4) + (paperWidth*0.3);//0.2 offset for playbar
							_y *= rs;
							_width *= rs;
							_height *= rs;
							//
							let p1 = new paper.Point(_x, _y);
							let p2 = new paper.Point(_x+_width, _y+_height);
							//
		    			if(paper.view.center.x > (_x-crossfadeOffset) && paper.view.center.x <= _x){
		    				if(!audio_players[id].playing){
		    					audio_players[id].playing = true;
		    					//console.log((paper.view.center.x) + ' ' + _x);
		    					console.log('Enabled: '+ id + ' ' + datasets[id].title);
		    					$('#audio_players_info').append('<div class="playerInfo" id="playerInfo-'+id+'"><p class="playerTextContent">'+datasets[id].title+'</p><div class="playerProgress"><div class="playerBar" id="playerBar-'+id+'"></div></div></div>');
		    					if(audio_players[id].player == null)
		    						addGrainPlayerLoop(id);
		    					audio_players[id].player.start();
		    					audio_players[id].player.volume.rampTo(0, crossfadeDuration/60 );
		    					audio_players[id].crossfading = true;
		    				}
		    				//
		    				//
		    				var elem = document.getElementById("playerBar-"+id);
		  					elem.style.width = Tone.dbToGain(audio_players[id].player.volume.value)*100 + "%";//in percentage
		  					//
		  					//
				    	}else if(paper.view.center.x > _x && paper.view.center.x <= (_x+_width)){
				    		//
				    		if(audio_players[id].crossfading){
				    			audio_players[id].crossfading = false;//Completed crossfading
				    			// Map should be at 100%
				    			var elem = document.getElementById("playerBar-"+id);
		  						elem.style.width = 100 + "%";//in percentage
	    						//
				    			console.log('Crossfading completed: ' + Tone.dbToGain(audio_players[id].player.volume.value));
				    		}
				    		//
				    	}else if(paper.view.center.x > (_x+_width) && (paper.view.center.x) <= (_x+_width+crossfadeOffset)){
				    		// Start fading
				    		if(!audio_players[id].crossfading){
				    			audio_players[id].crossfading = true;
				    			audio_players[id].player.volume.rampTo(-Infinity, crossfadeDuration/60 );
				    		}
				    		//
				    		var elem = document.getElementById("playerBar-"+id);
		  					elem.style.width = Tone.dbToGain(audio_players[id].player.volume.value)*100 + "%";//in percentage
		  					//
		  					//
				    	}
				    	else if(paper.view.center.x > (_x+_width+crossfadeOffset)){
				    		if(audio_players[id].playing){
				    			audio_players[id].playing = false;
		    					//console.log(paper.view.center.x + ' ' + (_x+_width));
		    					console.log('Disabled: '+ id + ' ' + datasets[id].title);
		    					audio_players[id].player.stop();
		    					audio_players[id].crossfading = false;
		    					//
		    					var elem = document.getElementById("playerBar-"+id);
		  						elem.style.width = 0 + "%";//in percentage
		    					$("#playerInfo-"+id).remove();
		    					console.log('Crossfading completed: ' + Tone.dbToGain(audio_players[id].player.volume.value));
		    				}
				    	}else{
				    		;//Ignore this case
				    	}
				    	//
		    		}
	    			//
	    		}
	    	}
	    	//
	    }
	    //
		}
		//
	};
}

function addGrainPlayerLoop(id){
	//
	//
	let audio_buffer = soundInstance.buffers.get(id);
	grainPlayer = new Tone.GrainPlayer(audio_buffer);
  //
  grainPlayer.playbackRate = 1;
  grainPlayer.grainSize = 0.1;
  grainPlayer.detune = 0;
  grainPlayer.overlap = 0.05;
  grainPlayer.loop = true;
  grainPlayer.loopStart = 0;
  grainPlayer.loopEnd = audio_buffer.duration;
  grainPlayer.volume.value = -Infinity;
  //
  grainPlayer.toMaster();
  audio_players[id].player = grainPlayer;
  //
  //
}

function loadDatasetBoundaries(){
	//
	let s = paperHeight/scrollHeight;
  let rs = (paperHeight/refPopupSize.height);
	console.log('paper scale ratio: ' + rs);

	//
	for (let id in datasets) {
		//console.log(datasets[id]);
		if(datasets[id].hasOwnProperty('popdimensions')){
    	//console.log('Loading dimensions for : ' + id);
    	//
    	audio_players[id] = {
    		id: id,
    		volume: 0,
    		playing: false,
    		rectPaths: [],
    		player: null,
    		crossfading: false
    	};
    	//
    	let dim = datasets[id].popdimensions;
    	if(dim != undefined){
				//
	  		let count = dim.length;
	  		for(let i=0; i < count; i++ ){
		    	//
					let _x = parseInt(dim[i].x);
					let _y = parseInt(dim[i].y);
					let _width = parseInt(dim[i].width);
					let _height = parseInt(dim[i].height);
					//
					_x *= rs; _x += (paperWidth*3/4);//0.2 offset for playbar
					_y *= rs;
					_width *= rs;
					_height *= rs;
					//
					let p1 = new paper.Point(_x, _y);
					let p2 = new paper.Point(_x+_width, _y+_height);
					//
		    	//
		    	let rectPath = newPopRect(p1,p2);
					paper.project.activeLayer.addChild(rectPath);
					//
					audio_players[id]['rectPaths'].push(rectPath);
					audio_players[id]['rectPaths'][i].visible = true;
		    	//
		    }
		  }
    }
	}
	//
}


/**
 * ------------------------------------------------
 * newPopRect
 * ------------------------------------------------
 */
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
		let et;

		et = event.originalEvent;
		event.preventDefault();

		// Pinch-Zoom
		// Tricky spec - https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
		if(et.ctrlKey){
			paper.view.zoom = changeZoom(paper.view.zoom, et.deltaY);
			// Center Y-axis on zoom-out
			let bounds = paper.view.bounds;
	    if (bounds.y < 0) paper.view.center = paper.view.center.subtract(new paper.Point(0, bounds.y));
	    bounds = paper.view.bounds;
	    let h = bounds.y + bounds.height;
			if (h > paper.view.viewSize.height) paper.view.center = paper.view.center.subtract(new paper.Point(0, h - paper.view.viewSize.height));
		}else{
			let fac = 1.005/(paper.view.zoom*paper.view.zoom);
			//
			if(paper.view.zoom == 1){
				let deltaValX, deltaValY;
				deltaValX = et.deltaY;
				deltaValY = et.deltaY;
				//
				if(deltaValX > 0)//disable backward scrubbing???
					paper.view.center = changeCenter(paper.view.center, deltaValX, 0, fac);
			}
			else{
				paper.view.center = changeCenter(paper.view.center, et.deltaX, et.deltaY, fac);
			}
		}

	});
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
  if(oldCenter.x > scrollWidth)
  	oldCenter.x  = scrollWidth;
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


/**
 * ------------------------------------------------
 * High Quality Image
 * ------------------------------------------------
 */
function loadScrollImage(){
	$('#status').text('Loading '+scrollType+' Quality scroll...');
  console.log('loading High Quality Image');
  //
  //
  let image = document.getElementById('HQscroll');
  var downloadingImage = new Image();
  downloadingImage.onload = function(){
  	console.log('Loaded HQ image');
    image.src = this.src;
    svgLoaded = true;
    //
    initSVGscroll();
		initSplash(800);//splashWidth: 800px
		//
  };
  downloadingImage.src = '../../../assets/images/SCROLL_cs6_ver23_APP_final_'+scrollType+'.png';
}


function initSVGscroll(){
	//
	scrollMousePos = paper.view.center;
	scrollPosition = paper.view.center;
	//
	//
	//HQscroll
	// Create a raster item using the image tag with id=''
	let raster = new paper.Raster('HQscroll');
	// Scale the raster
	let s = paperHeight/raster.height;
	raster.scale(s);
	//
	// Move the raster to the center of the view
	raster.position = paper.view.center;
	raster.position.x = (paperWidth*3/4) + (raster.width*s/2);
	//
	scrollWidth = raster.width*s;
	scrollHeight = paperHeight;
	//
}

function initSplash(_width){
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
	//
	// SCROLL TEXT
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
}
