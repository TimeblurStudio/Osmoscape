
Sounds = function (callback){
    this.callback = callback;
	let files = ["./audio/-1.mp3",
							"./audio/0.mp3",
							"./audio/1.mp3",
							"./audio/10.mp3",
							"./audio/4.mp3",
							"./audio/5.mp3",
							"./audio/6.mp3",
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

