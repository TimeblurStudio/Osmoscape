let Point=function(x,y){
  this.x = x;
  this.y = y;
}

let CollTest=function(x,y){
  //
	for (const dp in dataPicks) {
		if(dataPicks[dp] && (x > dataPickedPositions[dp].x)
			&& (y > dataPickedPositions[dp].y)
			&& (x < dataPickedPositions[dp].x + $("#drag-"+dp).width())
			&& (y < dataPickedPositions[dp].y + $("#drag-"+dp).height())
		){    return dp;  }
	}
  // for(let dp=Object.keys(dataPicks).length - 1; i >= 0; i--){
  //   //
    
  // }
  //
  return 0;
}

Molecule = function(x,y, buff, bufNum){
    let PIBy4 = Math.PI/2.5;
    this.x = x;
    this.y = y;
    this.diameter = 150;
    this.innerRadius = 60;
    this.radius = 75;
    //this.height = 150;

    this.vol = 10;
    this.innerDia = 120;
    this.col = color(184,115, 51);
    //this.start = 0;
    //this.stop = this.vol*(Math.PI)/180;

    this.OAtom = new Atom(this.x,this.y,this.diameter, null, 0);
    this.bondLength1 = 110;
    this.bondLength2 = 110;
    this.HAtom1 = new Atom(this.x,this.y-this.bondLength1, 50, this.OAtom, this.bondLength1);
    this.HAtom2 = new Atom(this.x,this.y+this.bondLength2, 50, this.OAtom, this.bondLength2);

    this.OAtom.children.push(this.HAtom1);
    this.OAtom.children.push(this.HAtom2);

    this.atoms = [this.OAtom, this.HAtom1, this.HAtom2];

    //var angle = Math.atan2(this.OAtom.y,this.OAtom.x);
    //var atomAngle2 = Math.atan2(this.HAtom2.y,this.HAtom2.x);
    //var atomAngle1 = Math.atan2(this.HAtom1.y,this.HAtom1.x);
    this.HAtom1.ang = -PI/4;
    this.HAtom2.ang = PI/4;
    this.buff = buff;
    this.bufNum = bufNum;
    var tempbuf = 0;
    console.log(tempbuf);
    if(tempbuf!==-1)
        this.bufNum = tempbuf;
    this.prevBuf = bufNum;
    let buf = buff.get(bufNum);

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
    this.grainPlayer.connect(this.reverb);

    this.grainPlayer.toMaster();


    this.PlayerProperties=[["VOLUME", "REVERB WET"], ["PLAYBACK RATE","DETUNE"], ["GRAIN SIZE","OVERLAP"], ["","DURATION"], ["REVERB DECAY","REVERB PRE-DELAY"]];


    this.ripples = [];
    var prevSecond=0;

    this.touchActive = false;

    this.propertiesIndex = 0;

    this.clamp = function(min, max) {
        return Math.min(Math.max(this, min), max);
      };

    this.render = function(pg){
        /*noFill();
        stroke(this.col);
        strokeWeight(1);
        ellipse(this.x, this.y, this.radius, this. radius);
        stroke(3);
        strokeWeight(5);
        arc(this.x, this.y, this.innerRadius, this.innerRadius, this.start, this.stop);*/
        //this.OAtom.render();
        //this.HAtom1.render();
        //this.HAtom2.render();

        if((this.prevBuf!==this.bufNum))
        {
            this.reverb = new Tone.Reverb().toMaster();
            this.reverb.generate().then(()=>{this.grainPlayer.start();});
            if(this.bufNum != -1){
                let buf = this.buff.get(this.bufNum);
                this.grainPlayer.stop();
                this.grainPlayer = new Tone.GrainPlayer(buf);
                this.buffLen = buf.duration;
                this.grainPlayer.grainSize = 0.1;
                this.grainPlayer.detune = 0;
                this.grainPlayer.overlap = 0.05;
                this.grainPlayer.loop = true;
                this.grainPlayer.loopStart = 0;
                this.grainPlayer.loopEnd = this.buffLen;

                this.grainPlayer.playbackRate = 1;

                this.grainPlayer.connect(this.reverb);
                this.grainPlayer.toMaster();

            this.prevBuf = this.bufNum;
            }else{

                this.grainPlayer.stop();
            }

        }
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        pg.stroke(this.col);
        pg.strokeWeight(2);
        //for(var i=0; i<this.atoms.length;i++)
        //    this.atoms[i].render();
        this.OAtom.render(pg,0,0,0);
        //pg.noFill();
        this.HAtom2.render(pg, this.PlayerProperties[this.propertiesIndex][1]);
        //pg.noFill();
        this.HAtom1.render(pg, this.PlayerProperties[this.propertiesIndex][0]);
        var x = Math.sin(PI/4)*this.radius+this.OAtom.x;//Math.sin(angle)*this.radius+this.OAtom.x;
        var y = Math.cos(PI/4)*this.radius+this.OAtom.y;//Math.cos(angle)*this.radius+this.OAtom.y;
        var x1 = this.HAtom2.x-(this.HAtom2.radius*Math.cos(PI/4));//this.HAtom2.x-(this.HAtom2.radius*Math.cos(atomAngle2));
        var y1 = this.HAtom2.y-(this.HAtom2.radius*Math.sin(PI/4));//this.HAtom2.y-(this.HAtom2.radius*Math.sin(atomAngle2));
        this.HAtom2.bondLength = Math.hypot(x-x1, y-y1);// dist(this.OAtom.x,this.OAtom.y,this.HAtom2.x,this.HAtom2.y);

        pg.line(x,y,x1, y1);

        x = this.OAtom.x+(this.radius)*Math.sin(3*PI/4);//Math.PI-angle);
        y = this.OAtom.y+(this.radius)*Math.cos(3*PI/4);//Math.PI-angle);
        var x2 = this.HAtom1.x-(this.HAtom1.radius*Math.cos(-PI/4));//atomAngle1-PIBy4));
        var y2 = this.HAtom1.y-(this.HAtom1.radius*Math.sin(-PI/4));//atomAngle1-PIBy4));
        this.HAtom1.bondLength = Math.hypot(x-x2, y-y2);//dist(x,y,x2,y2);

        pg.line(x,y,x2,y2);
        if(!this.touchActive){
        var cursecond = second();
         if(prevSecond!=cursecond){
            this.ripples.push(0);
            prevSecond = cursecond;
         }
         //console.log(millis());
         //noFill();
         //pg.noFill();
         for(var i=0; i<this.ripples.length;i++){

            pg.strokeWeight(1);
            //pg.noFill();

             pg.ellipse(this.OAtom.x,this.OAtom.y, this.ripples[i],this.ripples[i]);
             this.ripples[i]+=1;
             if(this.ripples[i]>this.innerDia)
                this.ripples.splice(i,1);
         }
        }
    }

    this.clicked = function(event){
        var d = Math.hypot(event.x-this.OAtom.x, event.y-this.OAtom.y);//dist(event.x, event.y, this.OAtom.x, this.OAtom.y);
        var v = [];

        if(this.innerRadius<d && d<this.radius){
            this.propertiesIndex++;
            if(this.propertiesIndex==this.PlayerProperties.length)this.propertiesIndex=0;
            this.calcProps();
        }
        else{
            for(var i=0; i<this.atoms.length;i++)
                v.push(this.atoms[i].clicked(event));
            }
        this.touchActive = v.includes(true);
        return this.touchActive;
    }

    this.moving = function(event){
        var d = Math.hypot(event.x-this.OAtom.x, event.y-this.OAtom.y);//dist(event.x, event.y, this.OAtom.x, this.OAtom.y);
        var v = [];

        if(this.innerRadius<d && d<this.radius){
            this.propertiesIndex++;
            if(this.propertiesIndex==this.PlayerProperties.length)this.propertiesIndex=0;
            this.calcProps();
        }
        else{
            for(var i=0; i<this.atoms.length;i++)
                v.push(this.atoms[i].clicked(event));
        }
        //
        if(v.includes(true)){
					interact('.wave-drag').draggable(false);
            // for(let i=0; i < Object.keys(dataPicks).length; i++){
            //     let dp = dataPicks[i];
            //     let index = i + 1;
            //     interact("#drag-"+index).draggable(false);
            // }
        }else{
					interact('.wave-drag').draggable(true);
            // for(let i=0; i < Object.keys(dataPicks).length; i++){
            //     let dp = dataPicks[i];
            //     let index = i + 1;
            //     interact("#drag-"+index).draggable(true);
            // }
        }

    }

    this.dragged = function(event){
        //
        if(this.touchActive){
            this.atoms[0].dragged(event, -1, 0, null, null);
            this.atoms[1].dragged(event, this.propertiesIndex,1, this.grainPlayer, this.reverb);
            this.atoms[2].dragged(event, this.propertiesIndex,2, this.grainPlayer, this.reverb);
            //
            this.bufNum = -1;
            var tempbuf = CollTest(this.OAtom.x, this.OAtom.y);
            console.log(tempbuf);
            if(tempbuf!==-1)
                this.bufNum = tempbuf;
            //
            //
						interact('.wave-drag').draggable(false);
						// for(const dp in dataPicks){
						// 	interact("#drag-"+dp).draggable(false);
						// }
            // for(let i=0; i < Object.keys(dataPicks).length; i++){
            //     let dp = dataPicks[i];
            //     let index = i + 1;
            //     interact("#drag-"+index).draggable(false);
            // }
        }else{
					interact('.wave-drag').draggable(true);
            // for(let i=0; i < Object.keys(dataPicks).length; i++){
            //     let dp = dataPicks[i];
            //     let index = i + 1;
            //     interact("#drag-"+index).draggable(true);
            // }
        }
    }

    this.mReleased = function(){
        //
        if(this.touchActive){
            this.touchActive = false;
            for(let atom of this.atoms){
                atom.hasMouse = false;
            }
        }
    }
    this.getMappedValFor=function(val, val1, val2){
        return map(val, val1,val2,70,100);
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
        this.HAtom1.x = this.OAtom.x+h1;
        this.HAtom1.y = this.OAtom.y-h1;
        this.HAtom2.x = this.OAtom.x+h2;
        this.HAtom2.y = this.OAtom.y+h2;
    }

    /*this.getNormalizedValue = function(val, min, max){
        return val/(max-min);
    }*/
}