
/**
 * ------------------------------------------------
 * AUTHOR:  Ashish Lijhara (ashish@hyperreality.in)
 * Copyright 2019 Hyper Reality Studio
 * MODIFIED: Mike Cj (mikecj184)
 * Copyright 2020 - 2021 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */

// Sounds function
Sounds = function (callback){
    this.callback = callback;
    //
    let filesMap = {};
    for (let id in datasets) {
        //console.log(datasets[id]);
        if(datasets[id].hasOwnProperty('audiofile')){
            //console.log('Loading audio for : ' + id);
            filesMap[id] = datasets[id].audiofile;
        }
        //
    }
    //

    let status = $('#status').text();
    $('#status').text(status + ' & ' + 'Loading Sound buffers');


    this.loaded=function(){
      console.log('Completed loading all buffers');
      //
      //this.callback();
      let statusinterval = setInterval(function(){
        if(svgLoaded){
            $('#start-btn').show();
            $('#status').text('Loaded');
            clearInterval(statusinterval);
        }else{
            console.log('Audio loaded before SVG, trying again...');
        }
      }, 1000);
      //
      console.log(adf);
    }

    this.buffers = new Tone.Buffers(filesMap, this.loaded);

    this.getBaseline = function(num){
      return (this.files.length-1)-(7-num);
    }
}

