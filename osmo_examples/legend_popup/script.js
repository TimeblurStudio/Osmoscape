let loaded = {
	"HQimage" : false,
	"svgdata": false
}
//
let paperHeight, paperWidth;
let scrollMousePos, scrollPosition;
let scrollWidth, scrollHeight;
let mousePos = null;
let maxZoom = 2;
let scrollScale = 1;
let isModalOpen = false;
//
let scrollType = '300ppi-HIGH';// 150ppi-LOW, 300ppi-HIGH, 600ppi-RETINA
let mainScroll;
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
//
console.log('Initializing');
init();
//
//
//
//
let datasets = {};
let publishFiles = [];
//
//
let uploadedLegendFile = [], uploadedMaskFile = [];
let maskFiles = [], legendFiles = [];

/**
 * ------------------------------------------------
 * Main Init
 * ------------------------------------------------
 */
function init(){
	//
	//
	console.log('init called');
	$('#status').text('Started');
	//
	//
	$.getJSON( "../../assets/data/dataSummary.json", function( data ) {
	  console.log('Loaded datasets summary');
	  //
	  let dataWaitInterval = setInterval(function(){
	  	if(mainScroll != null){
				clearInterval(dataWaitInterval);
				//
	  		datasets = data;
	  		//
	  		//
				let pF = {
					fileName: 'dataSummary.json',
					content: JSON.stringify (datasets),
					exists: false,
					sha: null,
					updated: false
				};
				publishFiles.push(pF);
	  		//
				loadDatasets();
		  }
	  },1000);
	  //
	});

	//
	// Setup PAPER canvas
	let canvas = document.getElementById('main-scroll-canvas');
	paper.setup(canvas);
	/*
	var canvasCtx = document.getElementById('main-scroll-canvas').getContext('2d');
	canvasCtx.mozImageSmoothingEnabled = true;
	canvasCtx.webkitImageSmoothingEnabled = true;
	canvasCtx.msImageSmoothingEnabled = true;
	canvasCtx.imageSmoothingEnabled = true;
	canvasCtx.imageSmoothingQuality = 'high';
	canvasCtx.filter = 'none';
	console.log(canvasCtx);
	*/

	//
	paperHeight = canvas.offsetHeight;
	paperWidth = canvas.offsetWidth;
	//
	backgroundLayer = new paper.Layer();
	maskLayer = new paper.Layer();
	legendLayer = new paper.Layer();
	//
	// INTERACTIONS
	initPanZoom();
	//
	//
	loadHQ();

	//
	paper.project.activeLayer = maskLayer;

	// Draw PAPER
	paper.view.draw();

	//
	paper.view.onMouseMove = function(event) {
		//
		//console.log(event.point);
		mousePos = event.point;
		//
		hitMaskEffect(event.point);
		//
		//
	};
}

//
//
//
function maskLoad(svgxml, num){
	//
	console.log('maskLoad called');
	//
	const mpromise = new Promise((resolve, reject) => {
		//
		paper.project.importSVG(svgxml, function(item){
			console.log('Loaded '+num+' mask');
			resolve('m'+num);
			//
			let mask = item;
			maskFiles.push(mask);
			//
			mask.data.legendName = 'legend-'+num;
			mask.data.maskName = 'mask-' + num;
			//
			if(mask.children != undefined)
				updateChildLegend(mask.children, mask.data.legendName);
			//
			//
			let s = paperHeight/mainScroll.height;
			let lms = paperHeight/mask.bounds.height;//mask-scale
			console.log('MAIN SCALE: ' + s);
			console.log('MASK SCALE: ' + lms);
			//
			mask.scale(lms);
			mask.position = paper.view.center;
			mask.position.x = (paperWidth*3/4) + (mask.bounds.width/2) + (mainScroll.width*s - mask.bounds.width);
			//
			mask.onDoubleClick = function(event) {
				//
				console.log('Double clicked, fitBounds activated!');
				//
				// FIX ME!!
				// Actually consilder LEGEND!!
				//paper.view.zoom = paperHeight/mask.bounds.height;
				//paper.view.center = mask.position;
				//
				console.log(mask);
				//
				//console.log(paper.view.zoom);
				//console.log(paper.view.center);
			};
			//
			maskLayer.addChild(mask);
		});
		//
	});
	//
	//
	return mpromise;
}

//
//
//
function updateChildLegend(ch, d){
	for(let i=0; i < ch.length; i++){
		let child = ch[i];
		child.data.legendName = d;
		if(child.children != undefined)
			updateChildLegend(child.children, d);
	}
}

//
//
//
function legendLoad(svgxml, num){

	const lpromise = new Promise((resolve, reject) => {
		//
		paper.project.importSVG(svgxml, function(item){
			console.log('Loaded '+num+' legend');
			resolve('l'+num);
			//
			let legend = item;
			legendFiles.push(legend);
			//
			legend.name = 'legend-'+num;
			legend.visible = false;
			//
			//
			let s = paperHeight/mainScroll.height;
			let lms = paperHeight/legend.bounds.height;//mask-scale
			console.log('LEGEND SCALE: ' + lms);
			//
			legend.scale(lms);
			legend.position = paper.view.center;
			legend.position.x = (paperWidth*3/4) + (legend.bounds.width/2) + (mainScroll.width*s - legend.bounds.width);
			//
			legendLayer.addChild(legend);
		});
		//
	});
	//
	return lpromise;
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
  	loaded.HQimage = true;
  	//
  	//
  	if(loaded.svgdata){
  		$('#status').text('Loaded');
  		setInterval(function(){	$('#status').hide();	},2000);
  	}
  	else
  		$('#status').text('Loading datasets');
  	//
  	//
		console.log('Loaded HQ image');
    image.src = this.src;
    //
    initSVGscroll();
		initSplash(800);//splashWidth: 800px
		//
		backgroundLayer.sendToBack();
  };
  downloadingImage.src = '../../assets/images/SCROLL_cs6_ver23_APP_final_'+scrollType+'.png';
}

//
//
let allSVGDataPromises = [];
//
function loadDatasets(){
	//
	for (let id in datasets) {
	  if (datasets.hasOwnProperty(id)) {
      console.log('Loading data for : ' + id);
      //
      let maskpromise = maskLoad(datasets[id].maskpath, id);
      let legendpromise = legendLoad(datasets[id].legendpath, id);
      //
      allSVGDataPromises.push(maskpromise);
      allSVGDataPromises.push(legendpromise);
			//
      //
	  }
	}
	//
	//
	Promise.all(allSVGDataPromises).then((values) => {
	  console.log('Loaded all datasets');
	  console.log(values);
	  loaded.svgdata = true;
  	//
  	if(loaded.HQimage){
  		$('#status').text('Loaded');
  		setInterval(function(){	$('#status').hide();	},2000);
  	}
  	else
  		$('#status').text('Still loading HQ scroll image...');
  	//
	});
	//
}


//
//
//
function initSVGscroll(){
	//
	//
	//HQscroll
	// Create a raster item using the image tag with id=''
	let raster = new paper.Raster('HQscroll');
	mainScroll = raster;
	//
	// Scale the raster
	let s = paperHeight/mainScroll.height;
	console.log('SCALE: ' + s);
	mainScroll.scale(s);
	//
	// Move the raster to the center of the view
	mainScroll.position = paper.view.center;
	mainScroll.position.x = (paperWidth*3/4) + (mainScroll.width*s/2);
	//
	//
	scrollWidth = mainScroll.width*s;
	scrollHeight = paperHeight;
	//
	backgroundLayer.addChild(mainScroll);
}

//
//
//
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
		if(!loaded.svgdata || !loaded.HQimage)
			return;
		//
		//
		$('#status').text('Scrolling...');
		$('#status').show();
		//
		//
		if(mousePos != null){
			mousePos.x += et.deltaX;
			mousePos.y += et.deltaY;
		}
		//
		hitMaskEffect(mousePos);
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
	});
}

/**
 * ------------------------------------------------
 * hitMaskEffect
 * ------------------------------------------------
 */
function hitMaskEffect(pt){
	var hitResult = maskLayer.hitTest(pt, maskHitOptions);
	if(hitResult != null){
		$('#status').text('Showing: ' + hitResult.item.data.legendName);
		$('#status').show();
		//
		legendLayer.visible = true;
		for(let i=0; i<legendLayer.children.length; i++){
			let child = legendLayer.children[i];
			child.visible = false;
		}
		//
		//console.log('Finding legend...' + hitResult.item.data.legendName);
		let lg = paper.project.getItem({name: hitResult.item.data.legendName});
		lg.visible = true;
		//backgroundLayer.fillColor = 'black';
		backgroundLayer.opacity = 0.1;
		$("body").css("background-color","#5f6d70");
	}else{
		$("body").css("background-color","#b5ced5");
		legendLayer.visible = false;
		//backgroundLayer.fillColor = 'none';
		backgroundLayer.opacity = 1.0;
		for(let i=0; i<legendLayer.children.length; i++){
			let child = legendLayer.children[i];
			child.visible = false;
		}
	}
	//
	//
	//
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

//
//
//
function readSvg(file, type, number) {
	console.log('readSvg for : ' + type + '-' + number);
	//
  const reader = new FileReader();
  //
  try
  {
		reader.readAsText(file);
  }
  catch(err) {console.log(err.message);}
  //
  //
	// attach event, that will be fired, when read is end
	reader.addEventListener("loadend", function() {
	   $('#status').text('Applying ' + type + '...');
		 $('#status').show();
		 //
		 let pF = {
			 fileName: file.name,
			 content: reader.result,
			 exists: false,
			 sha: null,
			 updated: false
		 };
		 publishFiles.push(pF);
		 //
	   // reader.result contains the contents of blob as a typed array
	   // we insert content of file in DOM here
	   if(type == 'mask')
	   	maskLoad(reader.result, number);
	   if(type == 'legend')
	   	legendLoad(reader.result, number);
	});
  //
}
