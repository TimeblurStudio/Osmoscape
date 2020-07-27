let paperHeight, paperWidth;
let scrollMousePos, scrollPosition;
let scrollWidth, scrollHeight;
let mousePos = null;
let maxZoom = 2;
let scrollScale = 1;
let isModalOpen = false;
//
let scrollType = 'Mobile';// Mobile, RQ, HQ
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
initModal(false);
//
//
//
//
let datasets = {};
let publishFiles = [];
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
let uploadedLegendFile = [], uploadedMaskFile = [];
let maskFiles = [], legendFiles = [];
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
//
//
//
function initFileLoader(){
	$('#currentLegend').hide();
	$('#currentMask').hide();
	//
	$('#currentLegend .cancel').click(function(){
		console.log('Cancel clicked!');
		$('#currentLegend').hide();
		$('#newLegend').show();
	});
	$('#currentMask .cancel').click(function(){
		console.log('Cancel clicked!');
		$('#currentMask').hide();
		$('#newMask').show();
	});
	//
	$("#data-id").change(function(){
		let value = $("#data-id").val();
		//
		if(!(value.toString() in datasets)){
			console.log('New dataset');
			//
			$('#newLegend').show();
			$('#newMask').show();
			$('#currentLegend').hide();
			$('#currentMask').hide();
			//
			$('#load-btn').text('Load');
			//
		}else{
			console.log('Update dataset');
			//
			//
			$('#newLegend').hide();
			$('#newMask').hide();
			$('#currentLegend').show();
			$('#currentMask').show();
			//
			$('#load-btn').text('Update');
			//
			$('#data-title').val(datasets[value].title);
			$('#data-desc').val(datasets[value].desc);
			let legendFName = datasets[value].legendpath.substring(datasets[value].legendpath.lastIndexOf('/')+1);
			$('#currentLegend .filename').text(legendFName);
			let maskFName = datasets[value].maskpath.substring(datasets[value].maskpath.lastIndexOf('/')+1);
			$('#currentMask .filename').text(maskFName);
		}
		//
    $('#clear-btn').show();
	});
	//
	//
	//
	const legendFileSelector = document.getElementById('legend-selector');
	const maskFileSelector = document.getElementById('mask-selector');
	//
  legendFileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files;
    console.log(fileList);
    uploadedLegendFile = fileList;
    //
    $('#clear-btn').show();
  });
  maskFileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files;
    console.log(fileList);
    uploadedMaskFile = fileList;
    //
    $('#clear-btn').show();
  });
  //
  // LOAD BUTTON
  $('#load-btn').click(function(){

		//
  	let error = false;
  	let errorMessage = '';
  	//
  	//console.log(uploadedLegendFile.length);
  	//console.log(uploadedMaskFile.length);
  	//
  	if(uploadedLegendFile.length === 1 && uploadedMaskFile.length === 1 ){
  		console.log('Both files present');
  		//
  		if (uploadedLegendFile[0].type && uploadedLegendFile[0].type.indexOf('image/svg+xml') === -1) {
	  		error = true;
	  		errorMessage += 'File is not a svg image - found ' + uploadedLegendFile[0].type;
		    console.log(errorMessage);
		  }
		  if (uploadedMaskFile[0].type && uploadedMaskFile[0].type.indexOf('image/svg+xml') === -1) {
	  		error = true;
	  		errorMessage += 'File is not a svg image - found ' + uploadedMaskFile[0].type;
		    console.log(errorMessage);
		  }
		  if($('#data-id').val() == ''){
	  		error = true;
	  		errorMessage += 'Error: Data id not filled\n';
	  	}
	  	if($('#data-title').val() == ''){
	  		error = true;
	  		errorMessage += 'Error: title not filled\n';
	  	}
	  	if($('#data-desc').val() == ''){
	  		error = true;
	  		errorMessage += 'Error: Description not filled\n';
	  	}
  	}else{
  		error = true;
  		errorMessage += 'ERROR: No files\n';
  	}
  	//
  	// Now load
  	if(!error){
  		$('#pub').prop('disabled', false);
  		//
			let index = $('#data-id').val();
			datasets[index] = {
				id: index,
				title: $('#data-title').val(),
				desc: $('#data-desc').val(),
				legendpath: '../../assets/data/legends/' + uploadedLegendFile[0].name,
				maskpath: '../../assets/data/legends/' + uploadedMaskFile[0].name
			};
			//
			readSvg(uploadedMaskFile[0], 'mask', index);
			readSvg(uploadedLegendFile[0], 'legend', index);
			//
			//
    	$('#clear-btn').hide();
    	toggleModal();
    	setTimeout(clearAll, 1500);
	  	//
  	}else{
  		let default_color = $('#status').css('color');
  		//
  		$('#status').text(errorMessage);
			$('#status').show();
			$('#status').css('color', 'red');
			//
			setTimeout(function(){
				$('#status').css('color', default_color);
			},1500);
  		//
  		console.log(errorMessage);
  	}
  	//
  });
  // CLEAR BUTTON
  $('#clear-btn').click(function(){
		$('#pub').prop('disabled', true);
  	clearAll();
  });
  //
  // SUBMIT BUTTON
  $('#submit-btn').click(function(){
  	$('.close-button').hide();
  	//
  	console.log('Submit button clicked!!!');
  	let error = false;
  	let errorMessage = '';
  	//
  	if($('#pub-name').val() == ''){
  		error = true;
  		errorMessage = 'Publishing name required\n';
  	}
  	//
  	if($('#pub-email').val() == ''){
  		error = true;
  		errorMessage = 'Publishing email required\n';
  	}
  	//
  	if($('#pub-message').val() == ''){
  		error = true;
  		errorMessage = 'Publishing message required\n';
  	}
  	//
  	if($('#pub-token').val() == ''){
  		error = true;
  		errorMessage = 'Publishing token required\n';
  	}
  	//
  	//
  	if(!error){
  		console.log('Processing...');
  		$('#progress').show();
  		$('#Publishing').hide();
  		//**** Get all information
  		let allGetPromises = [];
  		//**** Get the files and SHA
  		for(let i=0; i < publishFiles.length; i++){
  			let pF = publishFiles[i];
  			//
  			let filename = pF.fileName;
  			//content: pF.content;
				//exists: false,
				//sha: null,
				//updated: false
  			//
  			let geturl = '';
  			if(i == 0 )
  				geturl = 'https://api.github.com/repos/mikecjtio/testrepository/contents/assets/data/'+encodeURIComponent(filename);
  			else
  				geturl = 'https://api.github.com/repos/mikecjtio/testrepository/contents/assets/data/legends/'+encodeURIComponent(filename);
  			//
	  		let getpromise = new Promise((resolve, reject) => {
	  			//
	  			$.ajax({
					    type: 'GET',
					    headers: { "Authorization": 'Bearer ' + $('#pub-token').val() },
					    url: geturl,
					    success: function(data) {
					    	//
					    	console.log('Completed JSON request!');
					    	console.log(data);
					    	//
					    	publishFiles[i].exists = true;
					    	publishFiles[i].sha = data.sha;
					    	//
					    	resolve(i);
					    },
					    error : function(error){
					    	console.log('Error JSON request');
					    	console.log(error);
					    	//
					    	reject(i);
					    },
					    contentType: "application/json",
					    dataType: 'json'
					});
	  			//
	  		});
	  		allGetPromises.push(getpromise);
	  		//
  		}
  		console.log(allGetPromises);
  		//
  		//
  		//

  		//
  		//***** Wait for all GET promises
  		Promise.all(allGetPromises)
  			.then((index)=>{
					console.log('All promises to get meta data completed!');
					uploadAllPubFiles('then')
				})
				.catch((index)=>{
          // log that I have an error, return the entire array;
          console.log('All promises to get meta data finished, but one or more failed!');
          uploadAllPubFiles('catch')
	      });
			//
			//
			//
  	}else{
  		console.log('Error submitting');
  		//
  		let default_color = $('#status').css('color');
  		//
  		$('#status').text(errorMessage);
			$('#status').show();
			$('#status').css('color', 'red');
			//
			setTimeout(function(){
				$('#status').css('color', default_color);
			},1500);
  		//
  		console.log(errorMessage);
  	}
  });
}

//
//
//
//
let requestsIndex = 0;
let uploadBranch = 'master';
function uploadAllPubFiles(status){
	console.log(publishFiles);
	//
	uploadReFile(requestsIndex);
	//
	//
}

function uploadReFile(i){
	console.log('Uploading file at index: ' + i );
	// Put the files
	let pF = publishFiles[i];
	//
	let filename = pF.fileName;
	let text_content = pF.content;
	//exists: false,
	//sha: null,
	//updated: false
	//
	let geturl = '';
	if(i == 0)
		geturl = 'https://api.github.com/repos/mikecjtio/testrepository/contents/assets/data/'+encodeURIComponent(filename);
	else
		geturl = 'https://api.github.com/repos/mikecjtio/testrepository/contents/assets/data/legends/'+encodeURIComponent(filename);
	//
	let msg = '';
	if(i == 0)
		msg = $('#pub-message').val() + '-dataset';
	else{
		if(i%2 == 0)
			msg = $('#pub-message').val() + '-legend' + parseInt(i/2);
		else
			msg = $('#pub-message').val() + '-mask' + parseInt((i+1)/2);
	}
	//
	let databody;
	if(pF.exists){
		databody = {
			message: msg,
			sha: pF.sha,
			branch: uploadBranch,
			committer:{
				name: $('#pub-name').val(),
				email:$('#pub-email').val()
			},
			content: window.btoa(unescape(encodeURIComponent(text_content)))
		};
	}else{
		databody = {
			message: msg,
			branch: uploadBranch,
			committer:{
				name: $('#pub-name').val(),
				email:$('#pub-email').val()
			},
			content: window.btoa(unescape(encodeURIComponent(text_content)))
		};
	}
	//
	console.log(databody);
	//
	//
	//
	//
	$.ajax({
	    type: 'PUT',
	    headers: { "Authorization": 'Bearer ' + $('#pub-token').val() },
	    url: geturl,
	    data: JSON.stringify (databody),
	    success: function(data) {
	    	//
	    	console.log('Completed JSON PUT request!');
	    	console.log(data);
	    	//
	    	//
	    	publishFiles[i].updated = true;
	    	//
	    	requestsIndex++;
	    	if(requestsIndex < publishFiles.length)
					uploadReFile(requestsIndex);
				else{
					if(uploadBranch == 'master'){
						uploadBranch = 'gh-pages';
						requestsIndex = 0;
						uploadReFile(requestsIndex);
					}else{
						console.log('Completed all requests!');
						//
						$('#pub-message').val('');
						toggleModal();
						//
						$('#pub').prop('disabled', true);
					}
				}
	    },
	    error : function(error){
	    	console.log('Error JSON PUT request');
	    	console.log(error);
	    	//
	    },
	    contentType: "application/json",
	    dataType: 'json'
	});
	//
	//
}



//
//
function clearAll(){
	//
  $('#clear-btn').hide();
	//
	$('#legend-selector').val('');
	$('#mask-selector').val('');
	//
	$('#chapter-select').prop('selectedIndex',0);
	//
	$('#data-id').val('');
	$('#data-title').val('');
	$('#data-desc').val('');
	//
	$('#currentLegend .cancel').click();
	$('#currentMask .cancel').click();
	//
	$('#load-btn').text('Load');
}

/**
 * ------------------------------------------------
 * Main Init
 * ------------------------------------------------
 */
function init(){
	//
	initFileLoader();
	//
	//
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



function maskLoad(svgxml, num){
	//
	console.log('maskLoad called');
	//
	paper.project.importSVG(svgxml, function(item){
		console.log('Loaded 01 mask');
		//
		let mask = item;
		maskFiles.push(mask);
		//
		mask.data.legendName = 'legend-'+maskFiles.length;
		mask.data.maskName = 'mask-' + maskFiles.length;
		//
		if(mask.children != undefined)
			updateChildLegend(mask.children, mask.data.legendName);
		//
		//
		let s = paperHeight/mainScroll.height;
		let lms = paperHeight/mask.bounds.height;//mask-scale
		console.log('MASK SCALE: ' + lms);
		//
		mask.scale(lms);
		mask.position = paper.view.center;
		mask.position.x = (paperWidth*3/4) + (mask.bounds.width/2) + (mainScroll.width*s - mask.bounds.width) - 5;
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
}

function updateChildLegend(ch, d){
	for(let i=0; i < ch.length; i++){
		let child = ch[i];
		child.data.legendName = d;
		if(child.children != undefined)
			updateChildLegend(child.children, d);
	}
}

function legendLoad(svgxml){
	//
	paper.project.importSVG(svgxml, function(item){
		console.log('Loaded 01 legend');
		let legend = item;
		legendFiles.push(legend);
		//
		legend.name = 'legend-'+legendFiles.length;
		legend.visible = false;
		//
		//
		let s = paperHeight/mainScroll.height;
		let lms = paperHeight/legend.bounds.height;//mask-scale
		console.log('LEGEND SCALE: ' + lms);
		//
		legend.scale(lms);
		legend.position = paper.view.center;
		legend.position.x = (paperWidth*3/4) + (legend.bounds.width/2) + (mainScroll.width*s - legend.bounds.width)  - 5;
		//
		legendLayer.addChild(legend);
	});
	//
}

/**
 * ------------------------------------------------
 * High Quality Image
 * ------------------------------------------------
 */
function loadHQ(){
	$('#status').text('Loading '+scrollType+' scroll...');
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
		backgroundLayer.sendToBack();
  };
  downloadingImage.src = '../../assets/images/SCROLL_cs6_ver23_APP_final_'+scrollType+'.png';
}

//
//
//
function loadDatasets(){
	//
	for (let id in datasets) {
	  if (datasets.hasOwnProperty(id)) {
      console.log('Loading data for : ' + id);
      //
      maskLoad(datasets[id].maskpath, id);
      legendLoad(datasets[id].legendpath, id);
      //
	  }
	}
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
	let s = paperHeight/raster.height;
	console.log('SCALE: ' + s);
	raster.scale(s);
	//
	// Move the raster to the center of the view
	raster.position = paper.view.center;
	raster.position.x = (paperWidth*3/4) + (raster.width*s/2);
	//
	//
	scrollWidth = raster.width*s;
	scrollHeight = paperHeight;
	//
	backgroundLayer.addChild(raster);
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


/**
 * ------------------------------------------------
 * initModal
 * ------------------------------------------------
 */
function initModal(start_opned){
	$('#new').click(function(){
		//
  	$('.close-button').show();
		//
		$('#progress').hide();
		$('#Publishing').hide();
		$('#newDataset').show();
		//
		toggleModal();
	});
	//
	//
	$('#pub').click(function(){
		//
  	$('.close-button').show();
		//
		console.log('Publish clicked!!!');
		//
		$('#progress').hide();
		$('#Publishing').show();
		$('#newDataset').hide();
		//
		toggleModal();
		//
		//
		//console.log(datasets);
		publishFiles[0].content = JSON.stringify (datasets);
		console.log(publishFiles);
		//
	});
	//
	//
	var modal = document.querySelector('.modal');
	var closeButton = document.querySelector('.close-button');
	// FIX-ME!!!!!
	// ADD RESET modal when the form is closed.
	resetModal();
	//
	function windowOnClick(event) {
		if (event.target === modal) {
			toggleModal();
		}
	}
	//
	closeButton.addEventListener('click', function(){
		resetModal();
		toggleModal();
	});
	window.addEventListener('click', windowOnClick);
	//
	$(document).keydown(function(event) {
		if (event.keyCode == 27) {
			resetModal();
			toggleModal();
		}
	});
	//
	if(start_opned){
		console.log('Starting opened...');
		toggleModal();
	}
}


function toggleModal() {
	console.log('toggleModal called...');
	var modal = document.querySelector('.modal');
	modal.classList.toggle('show-modal');
	//
	isModalOpen = !isModalOpen;
}

function resetModal(){
	console.log('resetModal called...');
	console.log('can hide on-enter');
}

