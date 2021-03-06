
// Sounds function
Sounds = function (callback){
    this.callback = callback;

    let filesMap = [
        "./audio/-1.mp3",
        "./audio/0.mp3",
        "./audio/1.mp3",
        "./audio/10.mp3",
        "./audio/11.mp3",
        "./audio/12.mp3",
        "./audio/13.mp3",
        "./audio/14.mp3",
        "./audio/15.mp3",
        "./audio/16.mp3",
        "./audio/17.mp3",
        "./audio/19.mp3",
        "./audio/20.mp3",
        "./audio/21.mp3",
        "./audio/23.mp3",
        "./audio/24.mp3",
        "./audio/25.mp3",
        "./audio/28.mp3",
        "./audio/29.mp3",
        "./audio/30.mp3",
        "./audio/32.mp3",
        "./audio/33.mp3",
        "./audio/35.mp3",
        "./audio/36.mp3",
        "./audio/37.mp3",
        "./audio/38.mp3",
        "./audio/4.mp3",
        "./audio/40.mp3",
        "./audio/41.mp3",
        "./audio/43.mp3",
        "./audio/44.mp3",
        "./audio/45.mp3",
        "./audio/46.mp3",
        "./audio/48.mp3",
        "./audio/5.mp3",
        "./audio/50.mp3",
        "./audio/52.mp3",
        "./audio/53.mp3",
        "./audio/54.mp3",
        "./audio/58.mp3",
        "./audio/6.mp3",
        "./audio/60.mp3",
        "./audio/62.mp3",
        "./audio/63.mp3",
        "./audio/7.mp3",
        "./audio/8.mp3",
        "./audio/9.mp3",
        "./audio/Baseline1.mp3",
        "./audio/Baseline2.mp3",
        "./audio/Baseline3.mp3",
        "./audio/Baseline4.mp3",
        "./audio/Baseline5.mp3",
        "./audio/Baseline6.mp3",
        "./audio/Baseline7.mp3"
    ];

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

