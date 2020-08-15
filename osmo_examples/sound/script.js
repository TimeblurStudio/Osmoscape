let paperHeight, paperWidth;
let scrollMousePos, scrollPosition;
let scrollWidth, scrollHeight;
let mousePos;
let maxZoom = 2;
let svgLoaded = false;
let soundInstance = null;// sound function instance
let audioInstance = null;//audio function instance
//
let scrollType = '300-HIGH';// 150-LOW, 300-HIGH, 600-RETINA
//
//
//
//
console.log('Initializing');
init();
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
	$('#start-btn').hide();
	//
  //
  audioInstance = new Audio(soundInstance.buffers, 1);
  console.log(audioInstance);
  console.log(soundInstance.buffers);
  audioInstance.playFile(1);
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

	// Setup PAPER canvas
	let canvas = document.getElementById('main-scroll-canvas');
	paper.setup(canvas);
	paperHeight = canvas.offsetHeight;
	paperWidth = canvas.offsetWidth;

	// INTERACTIONS
	initPanZoom();

	//
	loadHQ();

	//
	soundInstance = new Sounds();

	// Draw PAPER
	paper.view.draw();
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
function loadHQ(){
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
  downloadingImage.src = '../../assets/images/SCROLL_cs6_ver23_APP_final_'+scrollType+'.png';
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
