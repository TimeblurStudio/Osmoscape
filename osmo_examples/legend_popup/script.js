/* DEBUG LINKS HERE */
// https://codebeautify.org/base64-to-image-converter
// https://codebeautify.org/image-to-base64-converter
// https://onlinepngtools.com/change-png-color


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
let navLayer;
//
let hitPopupMode = 'hovering';//'hovering', 'focused'
let prevBoundsCenter = null;
let prevZoom = null;
let currentFocus = null;
let popupBBoxes = {};
let commitversion = '';
//
//
let allTracksCount = 0;
let currentTrack;
let introTrack;
let baseTracks = {};
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
let backgroundTweenItem;
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
	commitversion = $('#commitid').text();
	console.log(commitversion);
	//
	//
	console.log('init called');
	$('#status').text('Started');
	//

	//
	let dataURL = "../../assets/data/dataSummary.json" + "?v=" + commitversion;
	console.log('dataURL: ' + dataURL);
	$.getJSON(dataURL, function( data ) {
	  console.log('Loaded datasets summary');
	  //
	  let dataWaitInterval = setInterval(function(){
	  	if(mainScroll != null){
				clearInterval(dataWaitInterval);
				//
	  		datasets = data;
	  		//
	  		loadDatasets();
	  		//
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
	navLayer = new paper.Layer();
	//
	backgroundTweenItem = new paper.Shape.Circle(new paper.Point(0,0), 30);
	backgroundTweenItem.fill = 'none';
	backgroundTweenItem.stroke = 'none';
	backgroundTweenItem.position = new paper.Point(0,0);
	maskLayer.addChild(backgroundTweenItem);
	//
	// INTERACTIONS
	initPanZoom();
	//
	//
	loadHQ();

	//
	//paper.project.activeLayer = maskLayer;
	//
	paper.project.activeLayer = navLayer;

	// Draw PAPER
	paper.view.draw();

	//
	paper.view.onMouseMove = function(event) {
		//
		//console.log(event.point);
		mousePos = event.point;
		//
		if(loaded.HQimage && loaded.svgdata){
			if(hitPopupMode != 'focused'){
				maskLayer.visible = true;

				Object.keys(popupBBoxes).forEach(function(key) {
					//
					let xMin = paper.view.center.x - paperWidth/2.0;
					let xMax = paper.view.center.x + paperWidth/2.0;
					//
					//
					if(popupBBoxes[key]['mask'].bounds.rightCenter.x > xMin && popupBBoxes[key]['mask'].bounds.leftCenter.x < xMax)
						popupBBoxes[key]['mask'].visible = true;
					//
				});

				//maskLayer.fillColor = 'black';
				//maskLayer.opacity = 0.5;
				hitMaskEffect(event.point, 'hover');
			}
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
			paper.view.zoom = changeZoom(paper.view.zoom, -1, 1.015, false);
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
		let fac = 1.005/(paper.view.zoom*paper.view.zoom);
		let currentCenter = paper.view.center;
		let newCenter = prevBoundsCenter;
		let zoomFac = prevZoom;
		//
		//let zoomFac = 1;
		if(popupBBoxes.hasOwnProperty(currentFocus)){
			let count = popupBBoxes[currentFocus]['paths'].length;
			console.log(count);
			for(let i=0; i < count; i++){
				popupBBoxes[currentFocus]['paths'][i].selected = false;
				popupBBoxes[currentFocus]['paths'][i].visible = false;
				console.log(popupBBoxes[currentFocus]['paths'][i]);
			}
			//zoomFac = fac * 0.85 * paperWidth / (1.0 * popupBBoxes[currentFocus]['paths'][0].bounds.width);
			console.log('Decide zoom');
			console.log(zoomFac);
		}
		//
		currentFocus = null;
		hitPopupMode = 'hovering';
		mousePos = new paper.Point(0,0);
		hitMaskEffect(mousePos, 'exit');
		//
		let deltaValX = newCenter.x - currentCenter.x;
		let deltaValY = newCenter.y - currentCenter.y;
		//
		paper.view.zoom = changeZoom(paper.view.zoom, 1, zoomFac, false);
		paper.view.center = changeCenter(paper.view.center, deltaValX, deltaValY, fac);
		//
	});
	//

}

//
//
//
function maskLoad(svgxml, num, order = null){
	//
	console.log('maskLoad called');
	//
	const mpromise = new Promise((resolve, reject) => {

		//svgxml = svgxml.replace("opacity=\"0.01\"","opacity=\"0.5\"");
		//
		paper.project.importSVG(svgxml, function(item){
			console.log('Loaded '+num+' mask');
			if(window.debug)
				$('#status').text('Loaded '+num+' mask-debug');
			else
				$('#status').text('Loaded '+num+' mask');
			//
			let mask = item;
			maskFiles.push(mask);

			//console.log(num + '-mask');
			//console.log(mask);
			//console.log(popupBBoxes[num]);
			if(popupBBoxes[num] != undefined){
				popupBBoxes[num]['mask'] = mask;
			}
			//
			//
			//
			mask.data.legendName = 'legend-'+num;
			mask.data.maskName = 'mask-' + num;
			mask.name = 'mask-' + num;
			mask.data.order = order;
			//
			if(order == 'back')
				mask.sendToBack();
			if(order == 'front')
				mask.bringToFront();
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
			//
			resolve('m'+num);
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
			let s = paperHeight/mainScroll.height;
			let lms = paperHeight/legend.bounds.height;//mask-scale
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
		loadNav();
		initNav();
		//
		backgroundLayer.sendToBack();
  };
  downloadingImage.src = '../../assets/images/SCROLL_cs6_ver23_APP_final_'+scrollType+'.png';
}

function initNav(){
	console.log('Initializing navigation');
	$('.jump').click(function(el){
		let chap_id = parseInt($(el.target.parentElement).attr('data-id'));
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
	let navPath = '../../assets/data/ChapterNavigation.svg';
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
	});
	//
}

//
//
let earlySVGDataPromises = [];
let allSVGDataPromises = [];
//
function loadDatasets(){
	//
	for (let id in datasets) {
		loadDataset(id, true);
		/*
		if(parseInt(id) < 15){
			loadDataset(id, true);
		}else{// delayed by 100 seconds
			setTimeout(function(){
				loadDataset(id, false);
			},100000);
		}
		*/
	}
	//
	//
	Promise.all(earlySVGDataPromises).then((values) => {
		console.log('Processing early datasets...');
		$('#status').text('Processing early datasets...');
		setTimeout(function(){
			//
			correctMaskOrder();
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
	/*
	setTimeout(function(){// delayed by 120 seconds
		//
		Promise.all(allSVGDataPromises).then((values) => {
			console.log('Processing remaining datasets...');
			$('#status').text('Processing remaining datasets...');
			setTimeout(function(){
				correctMaskOrder();
				console.log('Loaded remaining datasets');
			}, 1500);
		});
		//
	}, 120000);
	*/
}

function loadDataset(id, early=true){
	if (datasets.hasOwnProperty(id)) {
      console.log('Loading data for : ' + id);
      //
      let mpath = datasets[id].maskpath;
      if(window.debug){
	      let pieces = mpath.split('/');
	      let fname = pieces[pieces.length-1];
	      pieces[pieces.length-1] = 'Debug';
	      pieces.push(fname);
	      mpath = pieces.join('/');
	    }
	    let morder = datasets[id].order;
	    if(morder != "front" && morder != "back")
	    	morder = null;
	    //
      let maskpromise = maskLoad(mpath, id, morder);
      let legendpromise = legendLoad(datasets[id].legendpath, id);
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
					popupBBoxes[id]['paths'][i].visible = false;
					popupBBoxes[id]['rects'].push(aprec);
					//console.log(popupBBoxes[id]['paths'][i]);
				}
				//
				maskLayer.visible = false;
      }
      //
      //
	}
}

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
prevMouse = new paper.Point(0,0);
window.minval = 10;
window.interval = 0;
window.intransition = false;
function initPanZoom(){
	console.log('Initializing pan and zoom interactions');
	// Main scrolling functionality
	$('#main-scroll-canvas').on('mousewheel', function(event) {
		/*
		if(!window.intransition){
			/
			mousePos = new paper.Point(event.offsetX,event.offsetY);
			//
			clearTimeout(window.interval);
			window.interval = setTimeout(function() {
	        console.log("Haven't scrolled in 500ms!");
	        document.body.style.cursor = 'progress';
					//
	        var dx = mousePos.x - prevMouse.x;
					var dy = mousePos.y - prevMouse.y;
					var c = Math.sqrt( dx*dx + dy*dy );
					//
					if(c < window.minval){
						if(hitPopupMode != 'focused'){
							window.intransition = true;
							maskLayer.visible = true;
							hitMaskEffect(event.point, 'hover');
						}
					}
					if(maskLayer.visible){
						setTimeout(function(){
							clearTimeout(window.interval);
							window.intransition = false;
							window.interval = 0;
							document.body.style.cursor = 'default';
						},2000);
					}
					//
			    prevMouse.x = mousePos.x;
			    prevMouse.y = mousePos.y;
			    //
	    }, 500);
		}
		if(window.intransition)
			document.body.style.cursor = 'progress';
			return;
		*/
		//
		//
		//
		// check inactivity
		clearTimeout($.data(this, 'scrollTimer'));
    $.data(this, 'scrollTimer', setTimeout(function() {
        //
        if(currentNavLoc != -1 && (currentTrack != ('base'+currentNavLoc))){
        	console.log("Changing base track - Haven't scrolled in 250ms!");
        	currentTrack = 'base' + currentNavLoc;
        	//
        	//for(let i=0; i < 7; i++)
        	//	baseTracks['base'+(i+1)].stop();
        	//
        	console.log('Now playing : ' + currentTrack);
        	//baseTracks[currentTrack].start();
        }
    }, 250));
		//
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
		if(hitPopupMode != 'focused' && maskLayer.visible){// Makes scrolling experince way smooth
			console.log('Hide mask on scroll');
			maskLayer.visible = false;
			//
			Object.keys(popupBBoxes).forEach(function(key) {
				popupBBoxes[key]['mask'].visible = false;
			});
			//
			mousePos = new paper.Point(0,0);
			hitMaskEffect(mousePos, 'scrolling');
		}
		//
		hitNavEffect();
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
			navTweenItem.position = paper.view.center;
		}
	});
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
				//introTrack.stop();
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
				//for(let i=0; i < 7; i++)
				//	baseTracks['base'+(i+1)].stop();
        //
				//introTrack.start();
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
 * hitMaskEffect
 * ------------------------------------------------
 */
function hitMaskEffect(pt, ctype){
	var hitResult = maskLayer.hitTest(pt, maskHitOptions);
	//
	let fromOpacity = backgroundLayer.opacity, toOpacity;
	let fromColor = new paper.Color($("body").css("background-color")), toColor;
	let tweening = false;
	let dur = 800;
	let lg;
	//
	//
	if(hitResult != null){
		//
		legendLayer.visible = true;
		lg = paper.project.getItem({name: hitResult.item.data.legendName});
		if(lg == null)	return;
		//console.log('Showing: ' + hitResult.item.data.legendName);
		$('#status').text('Showing: ' + hitResult.item.data.legendName);
		$('#status').show();
		//console.log('Finding legend...' + hitResult.item.data.legendName);
		//
		//backgroundLayer.fillColor = 'black';
		//backgroundLayer.opacity = 0.1;
		//$("body").css("background-color","#6d7c80");
		if(ctype == 'hover'){
			//console.log('on hover');
			toOpacity = 0.25;
			toColor =  new paper.Color("#6d7c80");
			document.body.style.cursor = 'pointer';
			//
			//
			prevBoundsCenter = null;
			prevZoom = null;
			currentFocus = null;
			//
		}
		if(ctype == 'click'){
			//$("#focused-info").css("transition",  'right 1.5s linear');
			//$("#focused-info").css("right",  '0px');
			$("#focused-info").animate({ right:'0px'}, 1200);
			//console.log('on click');
			toOpacity = 0;
			toColor =  new paper.Color("#24292b");
			//
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
				//
				// Zoom into selected area!
				let fac = 1.005/(paper.view.zoom*paper.view.zoom);
				let currentViewCenter = paper.view.bounds.center;
				let newViewCenter = popupBBoxes[currentFocus]['paths'][0].bounds.center;
				let zoomFac = fac * 0.5 * paperWidth / (1.0 * popupBBoxes[currentFocus]['paths'][0].bounds.width);
				let deltaValX = newViewCenter.x - currentViewCenter.x + 250.0/zoomFac;
				let deltaValY = -(newViewCenter.y - currentViewCenter.y);
				//
				prevBoundsCenter = new paper.Point(paper.view.center.x, paper.view.center.y);
				paper.view.center = changeCenter(paper.view.center, deltaValX, deltaValY, fac, false);
				//
				//
				prevZoom = zoomFac;
				paper.view.zoom = changeZoom(paper.view.zoom, -1, zoomFac, false);
			}
			//
		}
		//
		//
	}else{
		//$("#focused-info").css("transition",  'right 0.1s linear');
		//$("#focused-info").css("right",  '-500px');
		$("#focused-info").animate({ right:'-500px'}, 100);
		//console.log('no hover');
		toOpacity = 1.0;
		toColor =  new paper.Color("#b5ced5");
		//
		legendLayer.visible = false;
		document.body.style.cursor = 'default';
		//backgroundLayer.fillColor = 'none';
		for(let i=0; i<legendLayer.children.length; i++){
			let child = legendLayer.children[i];
			child.visible = false;
		}
	}
	//
	//
	if(!tweening){
		setTimeout(function(){tweening = false;}, dur*1.2);
		backgroundTweenItem.tween(
		    { val: 1.0 },
		    { val: 0.0 },
		    {
		    	easing: 'easeInOutQuad',
		    	duration: dur
		    }
		).onUpdate = function(event) {
			tweening = true;
			//
			let currentVal = backgroundTweenItem.val;
			let lerpedColor = new paper.Color(
				toColor.red+(fromColor.red-toColor.red)*currentVal,
				toColor.green+(fromColor.green-toColor.green)*currentVal,
				toColor.blue+(fromColor.blue-toColor.blue)*currentVal);
			//
			backgroundLayer.opacity = toOpacity + (fromOpacity - toOpacity) * currentVal;
			$("body").css("background-color",  lerpedColor.toCSS(true));
			//

			if(typeof lg !== "undefined"){
				if(!lg.visible && currentVal == 0){
					for(let i=0; i<legendLayer.children.length; i++){
						let child = legendLayer.children[i];
						child.visible = false;
					}
					lg.visible = true;
				}
			}
			//
		};
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
  	//if(oldCenter.x < paperWidth/2)
	  //	oldCenter.x  = paperWidth/2;
	  //if(oldCenter.x > scrollWidth)
	  //	oldCenter.x  = scrollWidth;
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
function changeZoom(oldZoom, delta, factor=1.015, restricted=true){
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
	   // reader.result contains the contents of blob as a typed array
	   // we insert content of file in DOM here
	   if(type == 'mask')
	   	maskLoad(reader.result, number);
	   if(type == 'legend')
	   	legendLoad(reader.result, number);
	});
  //
}
