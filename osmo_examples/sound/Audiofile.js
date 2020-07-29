Audio = function(buffers, bufNum){
    this.bufNum = bufNum;
    this.prevBuf = bufNum;
    this.prevBuf = bufNum;
    let buf = buff.get(this.bufNum);

    this.reverb = new Tone.Reverb().toMaster();
    this.reverb.generate().then(()=>{this.grainPlayer.start();});
    this.grainPlayer = new Tone.GrainPlayer(buf);
    this.buffLen = buf.duration;
    this.grainPlayer.grainSize = 0.1;
    this.grainPlayer.detune = 0;
    this.grainPlayer.overlap = 0.05;
    this.grainPlayer.loop = true;
    this.grainPlayer.loopStart = 0;
    this.grainPlayer.loopEnd = this.buffLen;
    
    this.grainPlayer.playbackRate = 1;
    this.reverb.generate().then(()=>{this.grainPlayer.start();});
    this.grainPlayer.connect(this.reverb);
    
    this.grainPlayer.toMaster();
    //var _this =this;
    
    this.reset = function(bufNum){
            if(this.grainPlayer!==undefined||this.bufNum===-1)
                this.grainPlayer.stop();
            this.bufNum = bufNum;
            this.grainPlayer = new Tone.GrainPlayer(buf);
            this.buffLen = buf.duration;
            this.grainPlayer.grainSize = 0.1;
            this.grainPlayer.detune = 0;
            this.grainPlayer.overlap = 0.05;
            this.grainPlayer.loop = true;
            this.grainPlayer.loopStart = 0;
            this.grainPlayer.loopEnd = this.buffLen;
            
            this.grainPlayer.playbackRate = 1;
            this.reverb = new Tone.Reverb().toMaster();
            this.reverb.generate().then(()=>{this.grainPlayer.start();});
            this.grainPlayer.connect(this.reverb);
            this.grainPlayer.toMaster();
    }
    
    this.PlayeProperties=[["VOLUME", "REVERB WET"], ["PLAYBACK RATE","DETUNE"], ["GRAIN SIZE","OVERLAP"], ["","DURATION"], ["REVERB DECAY","REVERB PRE-DELAY"]];
    this.playFile=function(num){ //between
        this.reset(num);

    }
    this.getMappedValFor=function(val, val1, val2){
        return map(val, val1,val2,70,100); // using map from p5.js
    }
    this.calcProps = function(){
        //this.stop = this.vol=Math.atan2((mouseY-this.y)/this.radius, (mouseX-this.x)/this.radius);
        var h1, h2;
        switch(this.propertiesIndex){
            case 0:
                h1 =  this.getMappedValFor(this.grainPlayer.volume.value,-10,10);
                h2 =  this.getMappedValFor(this.reverb.wet.value,0,1);
                break;
            case 1:
                h1 = this.getMappedValFor(this.grainPlayer.playbackRate, 0, 2);
                h2 = this.getMappedValFor(this.grainPlayer.detune, -1200, 1200);
                break;
            case 2:
                h1 = this.getMappedValFor(this.grainPlayer.grainSize, 0.01, 0.5);
                h2 = this.getMappedValFor(this.grainPlayer.overlap, 0.01, 0.2);
                break;
            case 3:
                h1 = this.getMappedValFor(this.grainPlayer.loop, 0, 1);
                h2 = this.getMappedValFor(this.grainPlayer.loopEnd, 0, this.buffLen);
                break;
            case 4:
                h1 = this.getMappedValFor(this.reverb.decay, 0.1, 4);
                h2 = this.getMappedValFor(this.reverb.preDelay, 0, 0.1);
                break;
        }

    this.switchBuff = function(bufNum){
        if((this.prevBuf!==bufNum)) //ensure it's not playing
        {
            this.reset(bufNum);
            this.prevBuf = this.bufNum;
        }
        if (Tone.context.state !== 'running') { //Ensure Tone is still playing the sound.
            Tone.context.resume();
        }
    }
}