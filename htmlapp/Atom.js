Atom = function(x,y, diameter,parent, bondLength){
    this.x = x;
    this.y = y;
    if(parent!==null){
        this.parent = parent;
        this.child = true;
    }
    this.diameter = diameter;
    this.radius = diameter/2;
    this.innerRadius = 60;
    this.bondLength = bondLength;
    this.children = [];
    this.ang = 0;
    //this.fillColor = color(255);
    this.hasMouse = false;
    this.timestamp = 0;

    const sensitivity = 10;
    const minBondLength = 7.8;
    const maxBondLength = 55.8;
    const minXY = 70;
    const maxXY = 110;
    if(this.child){
        this.x += this.bondLength;
    }

    this.render = function(pg, prop)
    {
        //fill('rgba(255,255,255,0.4)');
        //pg.noFill();
        

        //pg.noFill();
        //fill(c); 
        pg.strokeWeight(2.5);
        
        if(!this.child){
            //fill(color('rgba(255,255,255,0.5)'));
            //pg.push();
            pg.fill(color('rgba(255,255,255,0.15)'));
            pg.ellipse(this.x, this.y, this.diameter, this.diameter);
            pg.push();
            //pg.noFill();
            //pg.ellipse(this.x, this.y, this.diameter, this.diameter);
            for(var i=0; i<4;i++){
                pg.strokeWeight(1.5);
                pg.ellipse(this.x, this.y, this.diameter-(i*7), this.diameter-(i*7));
            }
            pg.pop();
        }
        else{
            //noFill();
            //pg.noFill();
            pg.push();
            //pg.noFill();
            pg.ellipse(this.x, this.y, this.diameter, this.diameter);
            pg.stroke(255);
            pg.ellipse(this.x, this.y, this.diameter/3, this.diameter/3);
            pg.fill(255);
            pg.textSize(32);
            pg.textStyle(BOLD);
            pg.text(prop,this.x+this.radius+20, this.y);
            pg.pop();
            pg.stroke(color(184,115, 51));
            
        }

        /*if(this.child){
            strokeWeight(1);
            var atomAngle = Math.atan2(this.y,this.x);
            line(x,y,this.x-(this.radius*Math.cos(atomAngle)), this.y-(this.radius*Math.sin(atomAngle)));
        }*/

        
    }

    this.clicked = function(event){
        var d = Math.hypot(event.x-this.x, event.y-this.y);//dist(event.x, event.y, this.x, this.y);
        this.hasMouse = false;
        //console.log(this.x,this.y);
        if(d<this.radius){
            this.hasMouse = true;
        }
        return this.hasMouse;
    }
    
    this.dragged = function(event, propIndex, molNum, player, reverb){
        if(this.hasMouse){
        var mil = millis();
        if(mil-this.timestamp>20){
            this.timestamp = mil;
        //dist(event.x, event.y, this.x, this.y);
        
        //if(d<this.radius){
            //event.preventDefault();
            if(!this.child){
                //console.log(this.children[1].ang);
                //if(this.innerRadius>d){
                    
                    var x = (this.x-event.x);
                    var y = (this.y-event.y);
                    
                    this.children[0].x -= x;
                    this.children[0].y -= y;
                    
                    this.children[1].x -= x;
                    this.children[1].y -= y;
                    this.x =  event.x;
                    this.y =  event.y;
                //}
            }
            else{
                var hasBoolVal=false;
                /*switch(propIndex){
                    case 0:
                            if(molNum==2)
                                hasBoolVal = true;
                            break;
                    case 3:
                            hasBoolVal = true;
                        break;
                    default:
                        break;
                }*/
                var x=0;
                    var y=0;
                    if(hasBoolVal){
                        x = this.x-70;
                        y = this.y-70;
                    }
                    else{
                        x = event.x;
                        y = event.y;
                    }
                    //var d1 = Math.hypot(this.x-this.parent.x, this.y-this.parent.y);
                    var d = Math.hypot(x-this.x, y-this.y);
                    //this.bondLength = constrain(this.bondLength, minBondLength, maxBondLength);//mouseX, leftWall, rightWall);//this.clamp(
                switch(propIndex){
                    case 0:
                        if(molNum==1){
                            player.volume.value =  this.getMappedValFor(this.bondLength,-10,10);
                            //console.log(this.bondLength, d1);
                        }
                        else{
                            reverb.wet.value = Math.abs(this.getMappedValFor(this.bondLength, 0, 1));
                            //console.log(reverb.wet.value);
                            //reverb.generate().then(()=>{player.connect(reverb)});
                        }
                        /*else{
                            //player.mute =  (this.getMappedValFor(this.bondLength,0,1)<0.5)?false:true;
                            //Check if bond length is better
                            //player.volume.value =  this.getMappedValFor(this.bondLength,-10,10);
                            //console.log(this.bondLength, d1);
                        }*/
                        break;
                    case 1:
                        if(molNum==1){
                            player.playbackRate = Math.abs(this.getMappedValFor(this.bondLength, 0, 2));
                        }
                        else
                            player.detune = Math.abs(this.getMappedValFor(this.bondLength, -1200, 1200));
                        break;
                    case 2:
                        if(molNum==1)
                            player.grainSize = Math.abs(this.getMappedValFor(this.bondLength, 0.01, 0.5));
                        else
                            player.overlap = Math.abs(this.getMappedValFor(this.bondLength, 0.01, 0.2));
                        break;
                    case 3:
                        if(molNum==1)
                            break; //player.loopStart = Math.abs(this.getMappedValFor(this.bondLength, 0, this.buffLen));
                        else
                        {
                            var val = Math.abs(this.getMappedValFor(this.bondLength, 0, this.buffLen));
                            player.loopEnd = isFinite(val)?val:this.buffLen;
                        }
                        break;
                    case 4:
                        if(molNum==1)
                           reverb.decay = Math.abs(this.getMappedValFor(reverb.decay, 0.1, 4));
                        else
                            reverb.preDelay = Math.abs(this.getMappedValFor(reverb.preDelay, 0, 0.1));
                        //reverb.generate().then(()=>{player.connect(reverb)});
                        break;
                }
                    
                //console.log(this.ang);
                //var x = (mouseX-this.x)*Math.cos(this.ang)-(mouseY-this.y)*Math.sin(this.ang);
                //var y = (mouseX-this.x)*Math.sin(this.ang)+(mouseY-this.y)*Math.cos(this.ang);
                //var d = 
                //console.log(this.x-this.parent.x,this.y-this.parent.y);
                //if(this.bondLength>minBondLength&&this.bondLength<maxBondLength){
                    //console.log(this.bondLength);
                    //var sign = Math.sign((this.y-this.parent.y));
                    //console.log((x-this.x),(y-this.y));
                    this.x = this.x+sensitivity*(x-this.x)*Math.cos(this.ang)/d;
                    this.y = this.y+sensitivity*(x-this.x)*Math.sin(this.ang)/d;
                    var yComp = this.y-this.parent.y;
                    sign = Math.sign(yComp);
                    this.x = this.parent.x+constrain(this.x-this.parent.x,minXY, maxXY);
                    this.y = this.parent.y+sign*constrain(Math.abs(yComp),minXY, maxXY);
                //}
            }
        //}
            //return true;
        }
        //return false;
    }
}
    this.clamp = function(val, min, max){
        return Math.min(Math.max(val, min), max);
    }
    this.getMappedValFor=function(val, val1,val2){
        return map(val, minBondLength,maxBondLength, val1,val2);
    }
    this.mReleased=function(){
        this.hasMouse = false;
    }

}