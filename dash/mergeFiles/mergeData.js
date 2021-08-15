// Node.js program to read all SVG files from dataSummary
// and merge into single mask and legend files


const fs = require('fs');

let datasets = null;
let mergedMasks = {};
let mergedLegends = {};


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
      let mpath = datasets[id].maskpath;
      let lpath = datasets[id].legendpath;
      //
      let mask_data = fs.readFileSync(mpath, {encoding:'utf8', flag:'r'});
			let legend_data = fs.readFileSync(lpath, {encoding:'utf8', flag:'r'});
      //
      mergedMasks[id] = mask_data;
      mergedLegends[id] = legend_data;
      //
  	}
  }
  //
  console.log('Saving mergedMasks');
  let masksURL = "../../assets/data/mergedMasks.json";
  fs.writeFileSync(masksURL, JSON.stringify(mergedMasks), {encoding:'utf8'});
  //
  console.log('Saving mergedLegends');
  let legendsURL = "../../assets/data/mergedLegends.json";
  fs.writeFileSync(legendsURL, JSON.stringify(mergedLegends), {encoding:'utf8'});
  //
  //
}

