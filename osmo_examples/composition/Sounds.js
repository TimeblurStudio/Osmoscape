
Sounds = function (callback){
    this.callback = callback;
let files = ["./audio/-1.mp3",
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
"./audio/9.mp3",];
    this.buffers = new Tone.Buffers(files,{
        "onload":this.loaded,
      });
    
      this.loaded=function(){
        this.callback();
      }

      
}

