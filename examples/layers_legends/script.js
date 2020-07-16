let paperHeight, paperWidth;
let scrollMousePos, scrollPosition;
let scrollWidth, scrollHeight;
let mousePos = null;
let maxZoom = 2;
let scrollScale = 1;
let mask1, legend1;
var maskHitOptions = {
	segments: false,
	stroke: false,
	fill: true,
	tolerance: 5
};
//
let backgroundLayer;
let legendLayer;
let maskLayer;
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
	loadDataLegends();

	//
	paper.project.activeLayer = maskLayer;

	// Draw PAPER
	paper.view.draw();

	//
	paper.view.onMouseMove = function(event) {
		//
		//console.log(event.point);
		mousePos = event.point;
		var hitResult = maskLayer.hitTest(event.point, maskHitOptions);
		if(hitResult != null){
			$('#status').text('Showing: ' + hitResult.item.data.legendName);
			$('#status').show();
			//
			legendLayer.visible = true;
			//
			//console.log('Finding legend...' + hitResult.item.data.legendName);
			let lg = paper.project.getItem({name: hitResult.item.data.legendName});
			lg.visible = true;
			//
			backgroundLayer.opacity = 0.1;
		}else{
			legendLayer.visible = false;
			backgroundLayer.opacity = 1.0;
			for(let i=0; i<legendLayer.children.length; i++){
				let child = legendLayer.children[i];
				child.visible = false;
			}
		}
		//
	};
}

function loadDataLegends(){
	console.log('loading legends');
	//
	maskLoad('data/01_newmask.svg');
	legendLoad('data/01_newlegends.svg');
	//
}

function maskLoad(file){
	//
	maskLayer = new paper.Layer();
	//
	$.ajax({
		type: "GET",
		async: false,
		url: file,
		dataType: "xml",
		success: function(xml){
			//console.log(paper);
			let svgxml = xml.getElementsByTagName("svg")[0];
			paper.project.importSVG(svgxml, function(item){
				console.log('Loaded 01 mask');
				//
				mask1 = item;
				mask1.data.offsetx = parseInt(svgxml.getAttribute('posx'));
				mask1.data.offsety = parseInt(svgxml.getAttribute('posy'));
				mask1.data.rHeight = parseInt(svgxml.getAttribute('refh'));
				mask1.data.legendName = svgxml.getAttribute('legend');
				mask1.data.maskName = 'mask1';
				//
				if(mask1.children != undefined)
					updateChildLegend(mask1.children, mask1.data.legendName);
				//
				maskLayer.addChild(mask1);
			});
		}
  });
	//
}

function updateChildLegend(ch, d){
	for(let i=0; i < ch.length; i++){
		let child = ch[i];
		child.data.legendName = d;
		if(child.children != undefined)
			updateChildLegend(child.children, d);
	}
}

function legendLoad(file){
	//
	legendLayer = new paper.Layer();
	//
	$.ajax({
		type: "GET",
		async: false,
		url: file,
		dataType: "xml",
		success: function(xml){
			//console.log(paper);
			let svgxml = xml.getElementsByTagName("svg")[0];
			paper.project.importSVG(svgxml, function(item){
				console.log('Loaded 01 legend');
				//
				legend1 = item;
				legend1.data.offsetx = parseInt(svgxml.getAttribute('posx'));
				legend1.data.offsety = parseInt(svgxml.getAttribute('posy'));
				legend1.data.rHeight = parseInt(svgxml.getAttribute('refh'));
				legend1.name = svgxml.getAttribute('legend');
				legend1.visible = false;
				//
				legendLayer.addChild(legend1);
			});
		}
  });
	//
}

/**
 * ------------------------------------------------
 * High Quality Image
 * ------------------------------------------------
 */
function loadHQ(){
	backgroundLayer = new paper.Layer();
	$('#status').text('Loading HQ scroll...');
  console.log('loading High Quality Image');
  //
  //
  let image = document.getElementById('HQscroll');
  var downloadingImage = new Image();
  downloadingImage.onload = function(){
  	$('#status').text('Loaded');
  	setInterval(function(){
  		$('#status').hide();
  	},2000);
		console.log('Loaded HQ image');
    image.src = this.src;
    //
    initSVGscroll();
		initSplash(800);//splashWidth: 800px
		//
  };
  downloadingImage.src = 'SCROLL_cs6_ver23_APP_final_HD.png';
}

function initSVGscroll(){
	//
	//scrollMousePos = paper.view.center;
	//scrollPosition = paper.view.center;
	//
	//
	//HQscroll
	// Create a raster item using the image tag with id=''
	let raster = new paper.Raster('HQscroll');
	//
	// Scale the raster
	let s = paperHeight/raster.height;
	console.log('SCALE: ' + s);
	raster.scale(s);
	//
	//
	let lms = paperHeight/mask1.data.rHeight;//mask-scale
	console.log('LEGEND MASK SCALE: ' + lms);
  //
	mask1.scale(lms);
	let posx = (mask1.data.offsetx*lms) + (paperWidth*s*3/4);
	let posy = mask1.data.offsety*lms;
	mask1.position = new paper.Point(posx, posy);
	//
	legend1.scale(lms);
	legend1.position = new paper.Point(posx, posy);
	//
	// Move the raster to the center of the view
	raster.position = paper.view.center;
	raster.position.x = (paperWidth*s*3/4) + (raster.width*s/2);
	//
	scrollWidth = raster.width*s;
	scrollHeight = paperHeight;
	//
	backgroundLayer.addChild(raster);
	backgroundLayer.sendToBack();
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
	backgroundLayer.addChild(raster);
	backgroundLayer.addChild(text);
	backgroundLayer.addChild(line);
	backgroundLayer.addChild(triangle);
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
		//
		$('#status').text('Scrolling...');
		$('#status').show();
		//
		//
		//console.log(event);
		//event.point = new paper.Point(event.clientX, event.clientY);
		//console.log(event.point);
		if(mousePos != null){
			mousePos.x += et.deltaX;
			mousePos.y += et.deltaY;
		}
		var hitResult = maskLayer.hitTest(mousePos, maskHitOptions);
		if(hitResult != null){
			$('#status').text('Showing: ' + hitResult.item.data.legendName);
			$('#status').show();
			//console.log('Finding legend...' + hitResult.item.data.legendName);
			let lg = paper.project.getItem({name: hitResult.item.data.legendName});
			lg.visible = true;
			backgroundLayer.opacity = 0.1;
		}else{
			legendLayer.visible = false;
			backgroundLayer.opacity = 1.0;
			for(let i=0; i<legendLayer.children.length; i++){
				let child = legendLayer.children[i];
				child.visible = false;
			}
		}
		//
  	//
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

