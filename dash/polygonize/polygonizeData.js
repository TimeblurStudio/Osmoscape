// Node.js program to read all SVG files from dataSummary
// and polygonize to new mask and legend files
// Should be loaded into pathToPoly after this step
// NodeJS: https://www.npmjs.com/package/svg-path-to-polygons
// Manual: https://www.raincloud.co.uk/svg/paths2polygons/paths2polygons.html
// Discussion: https://inkscape.org/forums/questions/convert-path-to-polygon/

const fs = require('fs');

let datasets = null;

//
var myArgs = process.argv.slice(2);
//
console.log('Starting polygonize process');
polygonizeData();


function polygonizeData(){
	console.log('Loading dataSummary file');
	//
	let dataURL = "../../assets/data/dataSummary.json";
	console.log('dataURL: ' + dataURL);
	//
	let data = fs.readFileSync(dataURL, {encoding:'utf8', flag:'r'});
	datasets = JSON.parse(data);
  let count = 0;
	for (let id in datasets) {
	  if (datasets.hasOwnProperty(id)) {
      console.log('Polygonizing data for : ' + id);
      //
      let debug_mask_path = datasets[id].maskpath;
      debug_mask_path = updatePath(debug_mask_path, 'Debug');
      let sound_path = datasets[id].maskpath;
      sound_path = updatePath(sound_path, 'Sound');
      //
      let mask_data = fs.readFileSync(debug_mask_path, {encoding:'utf8', flag:'r'});


			//console.log('Saving mergedMasks');
      //let masksURL = "../../assets/data/mergedMasks.json";
      //fs.writeFileSync(masksURL, JSON.stringify(mergedMasks), {encoding:'utf8'});//
  	}
  }
  //
  //
  //
}

function updatePath(dat, type){
  let pieces = dat.split('/');
  let fname = pieces[pieces.length-1];
  pieces[pieces.length-1] = type;
  pieces.push(fname);
  dat = pieces.join('/');
  //
  return dat;
}