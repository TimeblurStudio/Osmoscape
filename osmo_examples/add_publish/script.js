// Note on 96 vs 72 ppi SVG issue with illustrator
// https://community.adobe.com/t5/illustrator/svg-is-being-resized-when-saved-from-illustrator-cc/td-p/5767194?page=2

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
let bboxTool = null;
let currentFocus = null;
let popupBBoxes = {};
let commitversion = '';
//
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
let dataURL = "../../assets/data/dataSummary.json"+ "?v=" + commitversion;
console.log('dataURL: ' + dataURL);
$.getJSON( dataURL, function( data ) {
  console.log('Loaded datasets summary');
  //
  let dataWaitInterval = setInterval(function(){
  	if(mainScroll != null){
			clearInterval(dataWaitInterval);
			//
  		datasets = data;
  		//
  		//
  		//
			let pF = {
				fileName: 'dataSummary.json',
				content: JSON.stringify (datasets, null, 2),
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
let uploadedLegendFile = [], uploadedMaskFile = [], uploadedAudioFile = [];
let maskFiles = [], legendFiles = [];
//
//
//
function readSvg(file, type, number, path) {
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
			 updated: false,
			 type: type,
			 path: path
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
function readAudio(file, type, number, path){
	console.log('readAudio for : ' + type + '-' + number);
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
			 updated: false,
			 type: type,
			 path: path
		 };
		 publishFiles.push(pF);
		 //
	   // reader.result contains the contents of blob as a typed array
	   // we insert content of file in DOM here
	   //if(type == 'mask')
	   //	maskLoad(reader.result, number);
	   //if(type == 'legend')
	   //	legendLoad(reader.result, number);
	});
  //
}
//
//
//
function initFileLoader(){
	window.notyf = new Notyf();
	//
	$('#currentLegend').hide();
	$('#currentMask').hide();
	$('#currentAudio').hide();
	//
	$('#currentLegend .cancel').click(function(){
		console.log('Cancel clicked!');
		$('#currentLegend .filename').text('');
		$('#currentLegend').hide();
		$('#newLegend').show();
		//
		let value = parseInt($("#data-id").val());
		console.log('Removing legend - ' + value);
		//
		let lg = paper.project.getItem({name: 'legend-'+value});
		lg.remove();
		lg = null;
		//
	});
	$('#currentMask .cancel').click(function(){
		console.log('Cancel clicked!');
		$('#currentMask .filename').text('');
		$('#currentMask').hide();
		$('#newMask').show();
		//
		let value = parseInt($("#data-id").val());
		console.log('Removing mask - ' + value);
		//
		let ms = paper.project.getItem({name: 'mask-'+value});
		ms.remove();
		ms = null;
		//
	});
	$('#currentAudio .cancel').click(function(){
		console.log('Cancel clicked!');
		$('#currentAudio .filename').text('');
		$('#currentAudio').hide();
		$('#newAudio').show();
		//
		let value = parseInt($("#data-id").val());
		console.log('Removing audio - ' + value);
		//
		// Fix ME!!
		//
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
			$('#currentLegend .filename').text('');
			$('#currentMask .filename').text('');
			$('#currentAudio .filename').text('');
			$('#currentLegend').hide();
			$('#currentMask').hide();
			$('#currentAudio').hide();
			//
			$('#load-btn').text('Load');
			//
		}else{
			console.log('Update dataset');
			//
			//
			$('#newLegend').hide();
			$('#newMask').hide();
			$('#newAudio').hide();
			$('#currentLegend').show();
			$('#currentMask').show();
			$('#currentAudio').show();
			//
			$('#load-btn').text('Update');
			//
			$('#data-title').val(datasets[value].title);
			$('#data-desc').val(datasets[value].desc);
			let legendFName = datasets[value].legendpath.substring(datasets[value].legendpath.lastIndexOf('/')+1);
			let legendFPath = 'https://raw.githubusercontent.com/TimeblurStudio/Osmoscape/master/assets/data/legends/'+encodeURI(legendFName);
			$('#currentLegend .filename').text(legendFName);
			$('#currentLegend .filename').attr("href", legendFPath);
			let maskFName = datasets[value].maskpath.substring(datasets[value].maskpath.lastIndexOf('/')+1);
			let maskFPath = 'https://raw.githubusercontent.com/TimeblurStudio/Osmoscape/master/assets/data/legends/'+encodeURI(maskFName);
			$('#currentMask .filename').text(maskFName);
			$('#currentMask .filename').attr("href", maskFPath);
			let audioFName = datasets[value].audiofile.substring(datasets[value].audiofile.lastIndexOf('/')+1);
			let audioFPath = 'https://raw.githubusercontent.com/TimeblurStudio/Osmoscape/master/assets/audio/loops/'+encodeURI(audioFName);
			$('#currentAudio .filename').text(audioFName);
			$('#currentAudio .filename').attr("href", audioFPath);
			//
			//
		}
		//
    $('#clear-btn').show();
	});
	//
	//
	//
	const legendFileSelector = document.getElementById('legend-selector');
	const maskFileSelector = document.getElementById('mask-selector');
	const audioFileSelector = document.getElementById('audio-selector');
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
  audioFileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files;
    console.log(fileList);
    uploadedAudioFile = fileList;
    //
    $('#clear-btn').show();
  });
  //
  // LOAD BUTTON
  $('#load-btn').click(function(){
		//
  	let prefilledsvg = false;
  	let error = false;
  	let errorMessage = '';
  	//
  	//console.log(uploadedLegendFile.length);
  	//console.log(uploadedMaskFile.length);
  	//
  	if(uploadedLegendFile.length === 1 || uploadedMaskFile.length === 1 || uploadedAudioFile.length === 1 ){
  		console.log('Both files present');
  		//
  		//
  		if(uploadedLegendFile.length === 1){
  			if (uploadedLegendFile[0].type && uploadedLegendFile[0].type.indexOf('image/svg+xml') === -1) {
		  		error = true;
		  		errorMessage += 'File is not a svg image - found ' + uploadedLegendFile[0].type;
			    console.log(errorMessage);
			  }
  		}
  		if(uploadedMaskFile.length === 1){
  			if (uploadedMaskFile[0].type && uploadedMaskFile[0].type.indexOf('image/svg+xml') === -1) {
		  		error = true;
		  		errorMessage += 'File is not a svg image - found ' + uploadedMaskFile[0].type;
			    console.log(errorMessage);
			  }
  		}
  		if(uploadedAudioFile.length === 1){
  			if (uploadedAudioFile[0].type && uploadedAudioFile[0].type.indexOf('audio/mpeg') === -1) {
		  		error = true;
		  		errorMessage += 'File is not a mp3 audio - found ' + uploadedAudioFile[0].type;
			    console.log(errorMessage);
			  }
  		}
  		//
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
	  	//
  	}else if (($('#currentMask .filename').text() != '') && ($('#currentLegend .filename').text() != '') && ($('#currentAudio .filename').text() != '')){
  		//
  		console.log('All three files were present beforehand');
  		prefilledsvg = true;
  		//
  	}
  	else{
  		error = true;
  		errorMessage += 'ERROR: Missing files\n';
  	}
  	//
  	// Now load
  	if(!error){
  		$('#pub').prop('disabled', false);
  		//
			let index = $('#data-id').val();
			let svgpath = '../../assets/data/legends/';
			let audiopath = '../../assets/audio/loops/';
			let lpf = (uploadedLegendFile.length === 0)?$('#currentLegend .filename').text():uploadedLegendFile[0].name;
			let mpf = (uploadedMaskFile.length === 0)?$('#currentMask .filename').text():uploadedMaskFile[0].name;
			let mpa = (uploadedAudioFile.length === 0)?$('#currentAudio .filename').text():uploadedAudioFile[0].name;
			//
			if(($('#currentMask .filename').text() != '') && ($('#currentLegend .filename').text() != ''))
  			prefilledsvg = true;
			//
			datasets[index] = {
				id: index,
				title: $('#data-title').val(),
				desc: $('#data-desc').val(),
				legendpath: svgpath + lpf,
				maskpath: svgpath + mpf,
				audiofile: audiopath + mpa
			};
			//
			if(!prefilledsvg){
				//
				readSvg(uploadedMaskFile[0], 'mask', index, svgpath);
				readSvg(uploadedLegendFile[0], 'legend', index, svgpath);
				//
		  	$('#currentMask .filename').text(uploadedMaskFile[0]);
		  	$('#currentLegend .filename').text(uploadedLegendFile[0]);
			}

			if((uploadedAudioFile.length === 1)){
				readAudio(uploadedAudioFile[0], 'audio', index, audiopath);
				$('#currentAudio .filename').text(uploadedAudioFile[0]);
			}

			//
			toggleModal();
	    window.notyf.success('Added');
	    //
  	}else{
  		console.log(errorMessage);
  		//
			window.notyf.error(errorMessage);
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
  	//
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
  			let type = pF.type;
  			//content: pF.content;
				//exists: false,
				//sha: null,
				//updated: false
  			//
  			let geturl = '';
  			if(i == 0 )
  				geturl = 'https://api.github.com/repos/TimeblurStudio/Osmoscape/contents/assets/data/'+encodeURIComponent(filename)+'?ref=gh-pages';
  			else{
  				if(type == 'audio')
  					geturl = 'https://api.github.com/repos/TimeblurStudio/Osmoscape/contents/assets/audio/loops/'+encodeURIComponent(filename)+'?ref=gh-pages';
  				else
  					geturl = 'https://api.github.com/repos/TimeblurStudio/Osmoscape/contents/assets/data/legends/'+encodeURIComponent(filename)+'?ref=gh-pages';
  			}
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
					    	console.log('Mostly file doesnt exist');
					    	//window.notyf.error('Error JSON request');
					    	//
					    	resolve(i);
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
  		console.log(errorMessage);
  		//
  		window.notyf.error(errorMessage);
  	}
  });
}

//
//
//
//
let requestsIndex = 0;
let uploadBranch = 'gh-pages';// Note sha for 'master' files will be different from 'gh-pages',
															// changes needed under #submit-btn onclick for master to work
function uploadAllPubFiles(status){
	console.log(publishFiles);
	//
	uploadReFile(requestsIndex);
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
		geturl = 'https://api.github.com/repos/TimeblurStudio/Osmoscape/contents/assets/data/'+encodeURIComponent(filename);
	else
		geturl = 'https://api.github.com/repos/TimeblurStudio/Osmoscape/contents/assets/data/legends/'+encodeURIComponent(filename);
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
	$.ajax({
	    type: 'PUT',
	    headers: { "Authorization": 'Bearer ' + $('#pub-token').val() },
	    url: geturl,
	    data: JSON.stringify (databody),
	    success: function(data) {
	    	//
	    	console.log('Completed JSON PUT request!');
	    	let commitid = data.commit.sha.substring(0,7);
				console.log(data);
	    	//
	    	//
	    	publishFiles[i].updated = true;
	    	//
	    	requestsIndex++;
	    	if(requestsIndex < publishFiles.length){
	    		setTimeout(function(){
	    			uploadReFile(requestsIndex);
	    		}, 1000);
	    	}
				else{
					//
					console.log('Completed all requests!');
					//
		  		window.notyf.success('Completed publishing!');
		  		$('#status').text('Page will reload in few seconds.');
		  		//
					$('#pub-message').val('');
					toggleModal();
					//
					$('#pub').prop('disabled', true);
					//
					setTimeout(function(){
						console.log('Completed');
						window.location.href = window.location.href.replace( /[\?#].*|$/, "?commit="+commitid);
					}, 2500);
				}
	    },
	    error : function(error){
	    	console.log('Error JSON PUT request');
	    	console.log(error);
	    	//
	  		//
	  		window.notyf.error('Error JSON PUT request\nTry again!');
	  		toggleModal();
	    },
	    contentType: "application/json",
	    dataType: 'json'
	});
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
	$('#currentAudio .cancel').click();
	//
	$('#load-btn').text('Load');
}

/**
 * ------------------------------------------------
 * Main Init
 * ------------------------------------------------
 */
function init(){
	commitversion = $('#commitid').text();
	console.log(commitversion);
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
	//
	paper.view.onMouseDown = function(event) {
		//
		mousePos = event.point;
		//
		if(hitPopupMode != 'focused'){
			hitMaskEffect(event.point, 'click');
		}
		//
		//
	};

	// Ideally stoppropgation only if modal is open
	$( ".modal" ).mousemove(function( event ) {
		event.stopPropagation();
	});

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

function initSelect(){
	// Create Paper tool
	let tool = new paper.Tool();
	tool.mouseStartPos = new paper.Point();
	tool.mouseCurrentPos = new paper.Point();
	tool.mousePrevPastePos = new paper.Point();
	tool.box = null;
	tool.PAPER = paper;
	tool.SelectionBoundsChanged = false;
	tool.hitItem = null;
	tool.selectionBoundsShape = null;
	tool.selectionBounds = null;
	tool.selectionBounds = null;
	tool.originalContent = null;
	tool.getSelectionBoundsShape = function(){	return this.selectionBoundsShape;	};
	tool.getSelectionBounds = function(){	return this.selectionBounds;	};
	//
	//
	//
	bboxTool = tool;

	// Hit test
	tool.hitItemTest = function(event) {
		let hitItem = null;
		// Hit test items
		hitItem = paper.project.hitTest(event.point, this.settings.HitOptions);
		return hitItem;
	};

	tool.dragRect = function(p1, p2) {
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
		rect.removeOn({
			drag: true,
			up: false
		});
		return rect;
	};

	//
	tool.on({

		mousedown: function(event) {

			this.SelectionBoundsChanged = false;
			this.mouseStartPos = null;

			// Clicked on empty area, engage box select.
			console.log('Drag to engage box-select');
			// Store mouse start position
			this.mouseStartPos = event.point.clone();
			//
			if(popupBBoxes.hasOwnProperty(currentFocus)){
				let count = popupBBoxes[currentFocus]['paths'].length;
				for(let i=0; i < count; i++){
					popupBBoxes[currentFocus]['paths'][i].visible = true;
					popupBBoxes[currentFocus]['paths'][i].selected = true;
				}
			}
			//
			this.box = null;
		},

		mousedrag: function(event) {

			// Confirmed box select
			this.box = this.dragRect(this.mouseStartPos, event.point);
		},

		mouseup: function(event){
			console.log('mouse-up happened');
			if(!popupBBoxes.hasOwnProperty(currentFocus)){
				popupBBoxes[currentFocus] = {
					paths : [],
					dimensions: []
				}
			}
			//
			if(this.box != null){
				this.box.selected = true;
				//
				let s = paperHeight/mainScroll.height;
				//
				popupBBoxes[currentFocus]['paths'].push(this.box);
				popupBBoxes[currentFocus]['dimensions'].push({
					x : this.box.bounds.x - (paperWidth*3/4),
					y : this.box.bounds.y,
					width : this.box.bounds.width,
					height : this.box.bounds.height
				});
				//
				//
				//
				//
			}
			//
			$('#popsave').show();
			$('#popcancel').show();
			//
			// Also, save to dataset
			/*
			var box = new paper.Rectangle(this.mouseStartPos, event.point);

			var selectedPaths = this.getPathsIntersectingRect(box);
			for (var i = 0; i < selectedPaths.length; i++){
				selectedPaths[i].selected = !selectedPaths[i].selected;
				selectedPaths[i].fullySelected = selectedPaths[i].selected;
				selectedPaths[i].selectedColor = 'rgba(0,0,0,0)';
			}
			*/
			//this.updateSelectionBounds();
		}

	});
}



function maskLoad(svgxml, num, order = null){
	//
	console.log('maskLoad called');
	const mpromise = new Promise((resolve, reject) => {
	  //
	  //
		paper.project.importSVG(svgxml, function(item){
			console.log('Loaded '+num+' mask');
			if(window.debug)
				$('#status').text('Loaded '+num+' mask-debug');
			else
				$('#status').text('Loaded '+num+' mask');
			resolve('m'+num);
			//
			let mask = item;
			maskFiles.push(mask);
			//
			mask.data.legendName = 'legend-'+num;
			mask.data.maskName = 'mask-' + num;
			mask.name = 'mask-' + num;
			mask.data.order = order;
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
	  //
	});
	//
	return mpromise;
}

function updateChildLegend(ch, d){
	for(let i=0; i < ch.length; i++){
		let child = ch[i];
		child.data.legendName = d;
		if(child.children != undefined)
			updateChildLegend(child.children, d);
	}
}

function legendLoad(svgxml, num){
	//
	const lpromise = new Promise((resolve, reject) => {
		paper.project.importSVG(svgxml, function(item){
			console.log('Loaded '+num+' legend');
			$('#status').text('Loaded '+num+' legend');
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
  	if(loaded.svgdata){
  		$('#status').text('Loaded');
  		setInterval(function(){	$('#status').hide();	},2000);
  	}
  	else
  		$('#status').text('Loading datasets');
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
	    let maskpromise = maskLoad(mpath, id, morder);
      let legendpromise = legendLoad(datasets[id].legendpath, id);
      //
      allSVGDataPromises.push(maskpromise);
      allSVGDataPromises.push(legendpromise);
			//
      if(datasets[id].hasOwnProperty('popdimensions')){
      	console.log('Loading dimensions for : ' + id);
      	//
      	let dim = datasets[id].popdimensions;
      	popupBBoxes[id] = {
	      	paths: [],
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
					popupBBoxes[id]['paths'].push(rectPath);
					popupBBoxes[id]['paths'][i].visible = true;
					console.log(popupBBoxes[id]['paths'][i]);
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
		console.log('Processing datasets...');
		$('#status').text('Processing datasets...');
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
function initPanZoom(){
	console.log('Initializing pan and zoom interactions');
	// Main scrolling functionality
	$('#main-scroll-canvas').on('mousewheel', function(event) {
		mousePos = new paper.Point(event.offsetX,event.offsetY);
		//
		clearInterval(window.interval);
		window.interval = setInterval(function() {
        console.log("Haven't scrolled in 100ms!");
        //
        var dx = mousePos.x - prevMouse.x;
				var dy = mousePos.y - prevMouse.y;
				var c = Math.sqrt( dx*dx + dy*dy );
				//
				if(c < window.minval){
					clearInterval(window.interval);
					if(hitPopupMode != 'focused'){
						maskLayer.visible = true;
						hitMaskEffect(event.point, 'hover');
					}
				}
		    prevMouse.x = mousePos.x;
		    prevMouse.y = mousePos.y;
		    //
    }, 100);
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
		if(hitPopupMode != 'focused' &&  maskLayer.visible){ // Makes scrolling experince way smooth
			maskLayer.visible = false;
			mousePos = new paper.Point(0,0);
			hitMaskEffect(mousePos, 'scrolling');
		}
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
function hitMaskEffect(pt, ctype){
	var hitResult = maskLayer.hitTest(pt, maskHitOptions);
	if(hitResult != null){
		$('#status').text('Showing: ' + hitResult.item.data.legendName);
		$('#status').show();
		//
		legendLayer.visible = true;
		let lg = paper.project.getItem({name: hitResult.item.data.legendName});
		if(lg == null)	return;
		if(!lg.visible){
			for(let i=0; i<legendLayer.children.length; i++){
				let child = legendLayer.children[i];
				child.visible = false;
			}
			//
			//console.log('Finding legend...' + hitResult.item.data.legendName);
			lg.visible = true;
			//backgroundLayer.fillColor = 'black';
		}
		//
		if(ctype == 'hover'){
			backgroundLayer.opacity = 0.08;
			$("body").css("background-color","#5f6d70");
			document.body.style.cursor = 'pointer';
			//
			//
			let id = parseInt(hitResult.item.data.legendName.replace('legend-', ''));
			if(popupBBoxes.hasOwnProperty(id)){
				let count = popupBBoxes[id]['paths'].length;
				for(let i=0; i < count; i++){
					popupBBoxes[id]['paths'][i].visible = true;
					popupBBoxes[id]['paths'][i].selected = false;
				}
			}
			//
			currentFocus = null;
			//
		}
		if(ctype == 'click'){
			backgroundLayer.opacity = 0;
			$("body").css("background-color","#252525");
			hitPopupMode = 'focused';
			maskLayer.visible = false;
			document.body.style.cursor = 'default';
			//
			$('#new').hide();
			$('#pub').hide();
			$('#popcancel').show();
			//
			//
			setTimeout(function(){	initSelect();	}, 300);
			//
			currentFocus = parseInt(hitResult.item.data.legendName.replace('legend-', ''));
			console.log('Focused on: ' + currentFocus );
			//
			if(popupBBoxes.hasOwnProperty(currentFocus)){
				let count = popupBBoxes[currentFocus]['paths'].length;
				for(let i=0; i < count; i++){
					popupBBoxes[currentFocus]['paths'][i].visible = true;
					popupBBoxes[currentFocus]['paths'][i].selected = true;
				}
			}
			//
		}
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
	//
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
		publishFiles[0].content = JSON.stringify (datasets, null, 2);
		console.log(publishFiles);
		//
	});
	//

	$('#popsave').click(function(){
		//
		$('#new').show();
		$('#pub').show();
		$('#pub').removeAttr('disabled');
		$('#popsave').hide();
		$('#popcancel').hide();
		//
		//
		for (let key in popupBBoxes)
			datasets[key]['popdimensions'] = popupBBoxes[key]['dimensions'];
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
		bboxTool = null;
		hitMaskEffect(new paper.Point(0,0), 'exit');
		//
		console.log(datasets);
	});

	//
	$('#popcancel').click(function(){
		//
		$('#new').show();
		$('#pub').show();
		$('#popsave').hide();
		$('#popcancel').hide();
		//
		//
		console.log(popupBBoxes);
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
		bboxTool = null;
		hitMaskEffect(new paper.Point(0,0), 'exit');
		//
	});
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

