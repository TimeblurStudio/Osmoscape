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
let hitPopupMode = 'hovering';//'hovering', 'focused'
let prevBoundsCenter = null;
let currentFocus = null;
let popupBBoxes = {};
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
//
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
	//
	// Setup PAPER canvas
	let canvas = document.getElementById('main-scroll-canvas');
	paper.setup(canvas);
	//
	//
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
		if(hitPopupMode != 'focused'){
			maskLayer.visible = true;
			hitMaskEffect(event.point, 'hover');
		}
		//
		//
	};

	//
	paper.view.onMouseDown = function(event) {
		//
		mousePos = event.point;

		if(document.body.style.cursor == 'zoom-in'){
			console.log('Zoom-in at this place');
			paper.view.zoom = changeZoom(paper.view.zoom, -1, false);
		}
		//
		if(hitPopupMode != 'focused'){
			hitMaskEffect(event.point, 'click');
		}
		//
		//
	};
	//


	//
	//
	//
	//
	$('#popcancel').click(function(){
		$('#focused-cta').hide();
		$('#focused-info').hide();
		document.body.style.cursor = 'default';
		//
		//
		if(popupBBoxes.hasOwnProperty(currentFocus)){
			let count = popupBBoxes[currentFocus]['paths'].length;
			console.log(count);
			for(let i=0; i < count; i++){
				popupBBoxes[currentFocus]['paths'][i].selected = false;
				popupBBoxes[currentFocus]['paths'][i].visible = false;
				console.log(popupBBoxes[currentFocus]['paths'][i]);
			}
		}
		//
		currentFocus = null;
		hitPopupMode = 'hovering';
		hitMaskEffect(new paper.Point(0,0), 'exit');
		//
		let fac = 1.005/(paper.view.zoom*paper.view.zoom);
		let currentCenter = paper.view.center;
		let newCenter = prevBoundsCenter;
		//
		let deltaValX = newCenter.x - currentCenter.x;
		let deltaValY = -(newCenter.y - currentCenter.y);
		//
		console.log(deltaValX + ' ' + deltaValY);
		//
		paper.view.center = changeCenter(paper.view.center, deltaValX, deltaValY, fac);
		paper.view.zoom = 1;
	});
	//

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
      if(datasets[id].hasOwnProperty('popdimensions')){
      	console.log('Loading dimensions for : ' + id);
      	//
      	let dim = datasets[id].popdimensions;
      	popupBBoxes[id] = {
	      	paths: [],
	      	rects: [],
	      	dimensions: dim
	      };
	      //
	      //
	      let count = popupBBoxes[id]['dimensions'].length;
				console.log('boxes: ' + count);
				//
				for(let i=0; i < count; i++){
					let s = paperHeight/mainScroll.height;
		      //
					let _x = parseInt(popupBBoxes[id]['dimensions'][i].x) + (paperWidth*3/4);
					let _y = parseInt(popupBBoxes[id]['dimensions'][i].y);
					let _width = parseInt(popupBBoxes[id]['dimensions'][i].width);
					let _height = parseInt(popupBBoxes[id]['dimensions'][i].height);
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
					popupBBoxes[id]['paths'][i].visible = true;
					popupBBoxes[id]['rects'].push(aprec);
					//console.log(popupBBoxes[id]['paths'][i]);
				}
				//
      }
      //
      //
	  }
	}
	//
	//
	Promise.all(allSVGDataPromises).then((values) => {
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
	});
	//
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
		if(hitPopupMode != 'focused')
			hitMaskEffect(mousePos, 'hover');
		//
  	//
		//
		let fac = 1.005/(paper.view.zoom*paper.view.zoom);
		//
		if(hitPopupMode != 'focused'){
			let deltaValX, deltaValY;
			deltaValX = et.deltaY;
			deltaValY = et.deltaY;
			//
			paper.view.center = changeCenter(paper.view.center, deltaValX, 0, fac);
		}
		else{
			let deltaValX, deltaValY;
			deltaValX = et.deltaX;
			deltaValY = et.deltaY;
			//
			paper.view.center = changeCenter(paper.view.center, deltaValX, deltaValY, fac, false);
		}
	});
}

/**
 * ------------------------------------------------
 * hitMaskEffect
 * ------------------------------------------------
 */
function hitMaskEffect(pt, ctype){
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
		//backgroundLayer.opacity = 0.1;
		//$("body").css("background-color","#5f6d70");
		if(ctype == 'hover'){
			backgroundLayer.opacity = 0.08;
			$("body").css("background-color","#5f6d70");
			document.body.style.cursor = 'pointer';
			//
			//
			prevBoundsCenter = null;
			currentFocus = null;
			//
		}
		if(ctype == 'click'){
			//
			backgroundLayer.opacity = 0;
			$("body").css("background-color","#252525");
			hitPopupMode = 'focused';
			maskLayer.visible = false;
			document.body.style.cursor = 'zoom-in';
			//
			currentFocus = parseInt(hitResult.item.data.legendName.replace('legend-', ''));
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
				let count = popupBBoxes[currentFocus]['paths'].length;
				for(let i=0; i < count; i++){
					popupBBoxes[currentFocus]['paths'][i].visible = false;// true to show rect box
					popupBBoxes[currentFocus]['paths'][i].selected = false;
				}
			}
			//
			// Zoom into selected area!
			let currentViewCenter = paper.view.bounds.center;
			let newViewCenter = popupBBoxes[currentFocus]['paths'][0].bounds.center;
			let deltaValX = newViewCenter.x - currentViewCenter.x + 250;
			let deltaValY = -(newViewCenter.y - currentViewCenter.y);
			//
			let fac = 1.005/(paper.view.zoom*paper.view.zoom);
			prevBoundsCenter = new paper.Point(paper.view.center.x, paper.view.center.y);
			paper.view.center = changeCenter(paper.view.center, deltaValX, deltaValY, fac, false);
			//
		}
		//
		//
	}else{
		$("body").css("background-color","#b5ced5");
		legendLayer.visible = false;
		document.body.style.cursor = 'default';
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
function changeCenter(oldCenter, deltaX, deltaY, factor, restricted=true){
	//
	let offset = new paper.Point(deltaX, -deltaY);
  offset = offset.multiply(factor);
  oldCenter = oldCenter.add(offset);
  //
  //
  if(restricted){
  	//
  	if(oldCenter.x < paperWidth/2)
	  	oldCenter.x  = paperWidth/2;
	  if(oldCenter.x > scrollWidth)
	  	oldCenter.x  = scrollWidth;
	  //
	  if((oldCenter.y*paper.view.zoom - paperHeight/2) <= 0 && deltaY > 0)
	  	oldCenter.y = paperHeight/(2*paper.view.zoom);
	  if(oldCenter.y*paper.view.zoom > (-paperHeight/2 + paperHeight*paper.view.zoom) && deltaY < 0)
	  	oldCenter.y = (-paperHeight/(2*paper.view.zoom) + paperHeight);
	  //
  }
  return oldCenter;
}

/**
 * ------------------------------------------------
 * changeZoom
 * ------------------------------------------------
 */
function changeZoom(oldZoom, delta, restricted=true){
	let factor = 1.015;
	let newZoom = oldZoom;
	//
	if(delta < 0)
		newZoom = oldZoom * factor;
  if(delta > 0)
  	newZoom = oldZoom / factor;
  //
  if(restricted){
  	if(newZoom <= 1)
			newZoom = 1;
		if(newZoom > maxZoom)
			newZoom = maxZoom;
  }
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
