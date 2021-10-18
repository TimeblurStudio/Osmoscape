// Node.js program to read all SVG files from dataSummary
// and merge into single mask and legend files


const fs = require('fs');

let datasets = null;
let mergedMasks = {};
let mergedLegends = {};
let mergedPolygons = {};
let mergedSoundAreas = {};

//
//
console.log('Starting merge process');
mergeData();


function mergeData(){
	console.log('Loading dataSummary file');
	//
	let dataURL = "../../assets/data/dataSummary.json";
	console.log('dataURL: ' + dataURL);
	//
	let data = fs.readFileSync(dataURL, {encoding:'utf8', flag:'r'});
	datasets = JSON.parse(data);
	for (let id in datasets) {
	  if (datasets.hasOwnProperty(id)) {
      console.log('Merging data for : ' + id);
      let poly_data = "{}";
      let soundarea_data = "{}";
      //
      let mpath = datasets[id].maskpath;
      let lpath = datasets[id].legendpath;
      let ppath = datasets[id].maskpath.replace("/legends/", "/polygons/")  + '.json';
      let spath = datasets[id].maskpath.replace("/legends/", "/sound_areas/")  + '.json';
      //
      let mask_data = fs.readFileSync(mpath, {encoding:'utf8', flag:'r'});
			let legend_data = fs.readFileSync(lpath, {encoding:'utf8', flag:'r'});
      try{
        poly_data = fs.readFileSync(ppath, {encoding:'utf8', flag:'r'});
      }
      catch(e){
        console.log('Couldn\'t find file: ' + ppath);
      }
      try{
        soundarea_data = fs.readFileSync(spath, {encoding:'utf8', flag:'r'});
      }
      catch(e){
        console.log('Couldn\'t find file: ' + spath);
      }
      //
      mergedMasks[id] = mask_data;
      mergedLegends[id] = legend_data;
      mergedPolygons[id] = poly_data;
      mergedSoundAreas[id] = soundarea_data;
      //
  	}
  }
  //
  //
  //
  console.log('Saving mergedMasks');
  let masksURL = "../../assets/data/mergedMasks.json";
  fs.writeFileSync(masksURL, JSON.stringify(mergedMasks), {encoding:'utf8'});
  //
  console.log('Saving mergedLegends');
  let legendsURL = "../../assets/data/mergedLegends.json";
  fs.writeFileSync(legendsURL, JSON.stringify(mergedLegends), {encoding:'utf8'});
  //
  console.log('Saving mergedPolygons');
  let polygonsURL = "../../assets/data/mergedPolygons.json";
  fs.writeFileSync(polygonsURL, JSON.stringify(mergedPolygons), {encoding:'utf8'});
  //
  console.log('Saving mergedSoundAreas');
  let soundAreasURL = "../../assets/data/mergedSoundAreas.json";
  fs.writeFileSync(soundAreasURL, JSON.stringify(mergedSoundAreas), {encoding:'utf8'});
  //
}

