'use strict';
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x6d7c80,
    resolution: window.devicePixelRatio || 1,
    antialias: true,
    view: canvas
});

const csvData = {
    "-1" : [0.75,0.80],
    "6" : [0.71,0.52,0.83,1,0.31,0.51,0.18,0.46,0.34,0.68,0.87,0.90,0.74,0.74,0.11,0.03],
    "21" : [0.14,1,0.97,0.23,0,0.43,0.05,0.59],
    "53" : [0.004,0.02,0,1,0.002,0.82,0.129,0.23,0.124,0.0138],
    "54" : [0.30,0,0,0.08,0.064,1,0.074,0.30,0.004,0.5,0.29,0.5,0.166,0.019,0.5,0.053,0.19,0,0.016]
};
const effectData = {
    "4" : {
        "invertY" : true
    },
    "5" : {
        "invertY" : true
    },
    "7" : {
        "invertY" : true
    },
    "11" : {
        "invertY" : true
    },
    "14" : {
        "invertY" : true
    },
    "15" : {
        "pitchshift" : {
            "min" : -12,
            "max" : 36
        }
    },
    "16" : {
        "pitchshift" : {
            "min" : -12,
            "max" : 36
        }
    },
    "17" : {
        "pitchshift" : {
            "min" : -12,
            "max" : -36
        },
    },
    "19" : {
        "invertY" : true
    },
    "20" : {
        "invertY" : true
    },
    "25" : {
        "invertY" : true
    },
    "29" : {
        "invertY" : true
    },
    "30" : {
        "pitchshift" : {
            "min" : -36,
            "max" : 36
        },
        "grainsize" : {
            "min" : 0.01,
            "max" : 0.8
        },
        "invertY" : true
    },
    "32" : {
        "invertY" : true
    },
    "33" : {
        "pitchshift" : {
            "min" : -36,
            "max" : 12
        }
    },
    "35" : {
        "pitchshift" : {
            "min" : -36,
            "max" : 12
        }
    },
    "36" : {
        "pitchshift" : {
            "min" : -48,
            "max" : -12
        }
    },
    "37" : {
        "pitchshift" : {
            "min" : -18,
            "max" : 6
        },
        invertY : "true"
    },
    "38" : {
        "pitchshift" : {
            "min" : -18,
            "max" : 6
        }
    },
    "40" : {
        "pitchshift" : {
            "min" : -36,
            "max" : -12
        },
        "invertY" : true
    },
    "41" : {
        "pitchshift" : {
            "min" : -24,
            "max" : -12
        },
        "invertY" : true
    },
    "42" : {
        "pitchshift" : {
            "min" : -36,
            "max" : -30
        },
        "detune" : {
            "min" : 0,
            "max" : 24
        },
        "grainsize" : {
            "min" : 2,
            "max" : 3
        },
        "freq" : {
            "min" : 0.3,
            "max" : 1
        },
        "depth" : {
            "min" : 0,
            "max" : 1
        },
    },
    "43" : {
        "grainsize" : {
            "min" : 0.01,
            "max" : 0.5
        },
        "detune" : {
            "min" : -24,
            "max" : 2
        },
        "freq" : {
            "min" : 0.3,
            "max" : 10
        },
        "depth" : {
            "min" : 0,
            "max" : 0.2
        },
        "pitchshift" : {
            "min" : -24,
            "max" : 7
        },
        "delay" : {
            "min" : 0.01,
            "max" : 0.8
        }
    },
    "44" : {
        "pitchshift" : {
            "min" : -36,
            "max" : 0
        },
        "invertY" : true
    },
    "45" : {
        "invertY" : true
    },
    "46" : {
        "pitchshift" : {
            "min" : -36,
            "max" : 12
        }
    },
    "48" : {
        "pitchshift" : {
            "min" : -36,
            "max" : 12
        }
    },
    "50" : {
        "grainsize" : {
            "min" : 0.01,
            "max" : 0.5
        },
        "detune" : {
            "min" : -40,
            "max" : 10
        },
        "freq" : {
            "min" : 0.3,
            "max" : 2
        },
        "depth" : {
            "min" : 0,
            "max" : 1
        },
        "pitchshift" : {
            "min" : -10,
            "max" : 0
        },
        "delay" : {
            "min" : 0,
            "max" : 1
        },
        "invertY" : true
    },
    "52" : {
        "grainsize" : {
            "min" : 0.01,
            "max" : 1
        },
        "detune" : {
            "min" : -10,
            "max" : 10
        },
        "freq" : {
            "min" : 0.3,
            "max" : 4
        },
        "depth" : {
            "min" : 0,
            "max" : 0.5
        },
        "pitchshift" : {
            "min" : -24,
            "max" : 1
        },
        "delay" : {
            "min" : 0,
            "max" : 1
        }
    },
    "53" : {
        "grainsize" : {
            "min" : 0.01,
            "max" : 1
        },
        "detune" : {
            "min" : -10,
            "max" : 10
        },
        "freq" : {
            "min" : 0.3,
            "max" : 4
        },
        "depth" : {
            "min" : 0,
            "max" : .01
        },
        "pitchshift" : {
            "min" : -24,
            "max" : 1
        },
        "delay" : {
            "min" : 0,
            "max" : 1
        },
        "invertY" : true
    },
    "55" : {
        "grainsize" : {
            "min" : 0.01,
            "max" : 2
        },
        "detune" : {
            "min" : -5,
            "max" : 24
        },
        "freq" : {
            "min" : 0.3,
            "max" : 4
        },
        "depth" : {
            "min" : 0,
            "max" : 1
        },
        "pitchshift" : {
            "min" : -24,
            "max" : 30
        },
        "delay" : {
            "min" : 0,
            "max" : 0.05
        },
        "invertY" : true
    },
    "58" : {
        "grainsize" : {
            "min" : 0.01,
            "max" : 0.5
        },
        "detune" : {
            "min" : -24,
            "max" : 24
        },
        "freq" : {
            "min" : 0.3,
            "max" : 0.5
        },
        "depth" : {
            "min" : 0,
            "max" : 1
        },
        "pitchshift" : {
            "min" : -5,
            "max" : 24
        },
        "delay" : {
            "min" : 0.01,
            "max" : 0.6
        },
        "invertY" : true
    },
    "60" : {
        "grainsize" : {
            "min" : 0.01,
            "max" : 0.5
        },
        "detune" : {
            "min" : -24,
            "max" : 24
        },
        "freq" : {
            "min" : 0.3,
            "max" : 0.5
        },
        "depth" : {
            "min" : 0,
            "max" : 1
        },
        "pitchshift" : {
            "min" : -5,
            "max" : 24
        },
        "delay" : {
            "min" : 0.01,
            "max" : 0.6
        }
    },
    "63" : {
        "grainsize" : {
            "min" : 0.01,
            "max" : 0.5
        },
        "detune" : {
            "min" : -24,
            "max" : 24
        },
        "freq" : {
            "min" : 0.3,
            "max" : 1.5
        },
        "depth" : {
            "min" : 0,
            "max" : 1
        },
        "pitchshift" : {
            "min" : -5,
            "max" : 15
        },
        "delay" : {
            "min" : 0.01,
            "max" : 0.1
        },
        "invertY" : true
    },
    "64" : {
        "grainsize" : {
            "min" : 0.01,
            "max" : 0.3
        },
        "detune" : {
            "min" : -24,
            "max" : 10
        },
        "freq" : {
            "min" : 0.3,
            "max" : 0.7
        },
        "depth" : {
            "min" : 0,
            "max" : 1
        },
        "pitchshift" : {
            "min" : -3,
            "max" : 0
        },
        "delay" : {
            "min" : 0.01,
            "max" : 1
        }
    }
}



let datasets,mergedSoundAreas,mergedLegends;
let mainScrollScale;
let mainScrollWidth;
document.body.appendChild(app.view);

class Molecule {
    constructor() {
        this.moleculeContainer = new PIXI.Container();
        this.moleculeContainer.interactive = true;
        this.moleculeContainer.buttonMode = true;
        this.molecule = new PIXI.Graphics()
        //            .lineStyle(1, 0xb67339, 1)
        this.molecule.beginFill(0xeaf1f3, 0.05)
        //            .drawCircle(0, 0, 75)
        //            .endFill()
        //            .drawCircle(0, 0, 25)
        this.molecule.lineStyle(2, 0xb67339, 1);
        this.molecule.drawCircle(0, 0, 137.5);
        this.molecule.endFill();
        this.molecule.drawCircle(0, 0, 132.5);
        this.molecule.drawCircle(0, 0, 127.5);
        this.molecule.drawCircle(0, 0, 122.5);
        this.molecule.moveTo(97.22,-97.22);
        this.molecule.lineTo(97.22+48.5,-97.22-48.5);
        this.molecule.moveTo(97.22,97.22);
        this.molecule.lineTo(97.22+48.5,97.22+48.5);
        this.molecule.drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 37.5);
        this.molecule.drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 37.5);
        this.molecule.lineStyle(2, 0xFFFFFF, 1);
        this.molecule.drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 12.5);
        this.molecule.drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 12.5);
       
        this.shadow = new PIXI.Graphics();
        this.shadow.lineStyle(5, 0x121212, 0.5);
        this.shadow.drawCircle(0, 0, 137.5);
        this.shadow.moveTo(97.22,-97.22);
        this.shadow.lineTo(97.22+48.5,-97.22-48.5);
        this.shadow.moveTo(97.22,97.22);
        this.shadow.lineTo(97.22+48.5,97.22+48.5);
        this.shadow.drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 37.5);
        this.shadow.drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 37.5);
        this.shadow.lineStyle(2, 0xFFFFFF, 1);
        this.shadow.drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 12.5);
        this.shadow.drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 12.5);
        //this.moleculeContainer.filters = [new PIXI.filters.DropShadowFilter()];
        this.shadow.filters = [new PIXI.filters.BlurFilter()];
        this.shadow.x += 5;
        this.shadow.y += 5;
        this.moleculeContainer.scale.set(0.75,0.75);
        this.moleculeContainer.addChild(this.molecule);
        this.moleculeContainer.addChild(this.shadow);
        this.moleculeContainer.on('pointerdown', this.onDragStart)
            .on('pointerup', this.onDragEnd)
            .on('pointerupoutside', this.onDragEnd)
            .on('pointermove', this.onDragMove);

        this.fftVisualizer = new PIXI.Graphics();
        this.fftVisualizer.lineStyle(1,0xFFFFFF,1)
        this.moleculeContainer.addChild(this.fftVisualizer);
        this.moleculeContainer.x = app.screen.width / 2;
        this.moleculeContainer.y = app.screen.height / 2;
        app.stage.addChild(this.moleculeContainer);
    }
    onDragStart(event) {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this.data = event.data;
        this.dragging = true;
    }
    onDragEnd() {
        this.alpha = 1;
        this.dragging = false;
        // set the interaction data to null
        this.data = null;
    }
    onDragMove() {
        if (this.dragging) {
            const newPosition = this.data.global;
            this.x = newPosition.x;
            this.y = newPosition.y;
            //            const local = graphics.toLocal(newPosition)
            //            console.log("global",newPosition)
            soundeffects.crossfade.fade.rampTo(0,1.0)
            let hitArea = soundareas.containsPoint(newPosition)
            if(hitArea.contains) {
                soundeffects.crossfade.fade.rampTo(1,1.0)
                let np = getNormalizedPosition(newPosition)
                soundeffects.changeParameters(np,hitArea.shape);
            }
        }
    }
}

class SoundEffects {
    constructor() {
        this.context = new Tone.Context({ latencyHint: "balanced"});
        Tone.setContext(this.context);
        this.crossfade = new Tone.CrossFade({fade : 0});
        this.player = new Tone.Player({loop : true});
        this.baseplayer = new Tone.Player({loop : true}).toDestination();
        this.grainplayer = new Tone.GrainPlayer({loop : true});
        this.pitchshift = new Tone.PitchShift();
        this.vibrato = new Tone.Vibrato();
        this.delay = new Tone.Delay({maxDelay: 5});
this.fft = new Tone.FFT ({
    size: 16,
    smoothing : 0.75,
    normalRange : false
});

        this.makeEffectChain();
    }
    makeEffectChain() {
        this.player.connect(this.crossfade.a)

        this.grainplayer.connect(this.delay)
        this.delay.connect(this.vibrato);
        this.vibrato.connect(this.pitchshift);
        this.pitchshift.connect(this.crossfade.b);

        this.crossfade.connect(Tone.getDestination());
        Tone.getDestination().connect(this.fft);
    }
    setNewBuffer(path, num) {
        const currentBuffer = new Tone.ToneAudioBuffer({
            url:   path,
            onload: () => {
                this.grainplayer.buffer = currentBuffer; 
                this.player.buffer = currentBuffer;
                this.id = num;
                this.setDefaultParameterRangeFromInput();
                this.player.start();
                this.grainplayer.start();
            }
        }
        );

        let chapterName = (datasets[num].ch.slice(-1));
        console.log("Chapter:",chapterName)
        const baseBuffer = new Tone.ToneAudioBuffer({
            url:   "../../assets/audio/tracks/Baseline_"+chapterName+".mp3",
            onload: () => {
                this.baseplayer.buffer = baseBuffer; 
                this.baseplayer.start();
            }
        })
    }
    setDefaultParameterRange() {

        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("delay")) {
            this.delayRange = (effectData[this.id].delay.max - effectData[this.id].delay.min);
            this.delayMin = effectData[this.id].delay.min;
        } else {
            this.delayRange = (0.6 - 0.01);
            this.delayMin = 0.01;
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("freq")) {
            this.freqRange = (effectData[this.id].freq.max - effectData[this.id].freq.min);
            this.freqMin = effectData[this.id].freq.min;
        } else {
            this.freqRange = (10 - 0.3);
            this.freqMin = 0.3;
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("depth")) {
            this.depthRange = (effectData[this.id].depth.max - effectData[this.id].depth.min);
            this.depthMin = effectData[this.id].depth.min;
        } else {
            this.depthRange = (1 - 0);
            this.depthMin = 0;
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("pitchshift")) {
            this.pitchRange = (effectData[this.id].pitchshift.max - effectData[this.id].pitchshift.min);
            this.pitchMin = effectData[this.id].pitchshift.min;
        } else {
            this.pitchRange = (24 + 24);
            this.pitchMin = -24;
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("detune")) {
            this.detuneRange = (effectData[this.id].detune.max - effectData[this.id].detune.min);
            this.detuneMin = effectData[this.id].detune.min;

        } else {
            this.detuneRange = (24 + 24);
            this.detuneMin = -24;
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("grainsize")) {
            this.grainSizeRange = (effectData[this.id].grainsize.max - effectData[this.id].grainsize.min);
            this.grainSizeMin = effectData[this.id].grainsize.min;
        } else {
            this.grainSizeRange = (3 - 0.01);
            this.grainSizeMin = 0.01;
        }
        this.loopStartRange = this.grainplayer.buffer.duration/2;
        this.loopStartMin = 0;
        this.loopEndRange = this.grainplayer.buffer.duration/2;
        this.loopEndMin = this.grainplayer.buffer.duration/2;

    }
    readDefaultParameterRangeFromInput() {
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("delay")) {
            $("#dtmn").val(effectData[this.id].delay.min);
            $("#dtmx").val(effectData[this.id].delay.max);
        } else {
            $("#dtmn").val(0.01);
            $("#dtmx").val(0.6);
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("freq")) {
            $("#vfmn").val(effectData[this.id].freq.min);
            $("#vfmx").val(effectData[this.id].freq.max);
        } else {
            $("#vfmn").val(0.3);
            $("#vfmx").val(10);
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("depth")) {
            $("#vdmn").val(effectData[this.id].depth.min);
            $("#vdmx").val(effectData[this.id].depth.max);
        } else {
            ($("#vdmn").val(0));
            ($("#vdmx").val(1));
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("pitchshift")) {
            console.log("effect data value found")
            $("#pmn").val(effectData[this.id].pitchshift.min);
            $("#pmx").val(effectData[this.id].pitchshift.max);
        } else {
            ($("#pmn").val(-24));
            ($("#pmx").val(24));
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("detune")) {
            ($("#dmn").val(effectData[this.id].pitchshift.min));
            ($("#dmx").val(effectData[this.id].pitchshift.max));

        } else {
            ($("#dmn").val(-24));
            ($("#dmx").val(24));
        }
        if (effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("grainsize")) {
            ($("#gsmn").val(effectData[this.id].grainsize.min));
            ($("#gsmx").val(effectData[this.id].grainsize.max));
        } else {
            ($("#gsmn").val(0.01));
            ($("#gsmx").val(3));
        }
    }
    setDefaultParameterRangeFromInput() {
        this.delayRange = ($("#dtmx").val()-$("#dtmn").val())
        this.delayMin = $("#dtmn").val()

        this.freqRange = ($("#vfmx").val()-$("#vfmn").val())
        this.freqMin = ($("#vfmn").val())
        this.depthRange = ($("#vdmx").val()-$("#vdmn").val())
        this.depthMin = $("#vdmn").val()

        this.pitchRange = ($("#pmx").val()-$("#pmn").val())
        this.pitchMin = $("#pmn").val()

        this.detuneRange = ($("#dmx").val()-$("#dmn").val())
        this.detuneMin = $("#dmn").val()
        this.grainSizeRange = ($("#gsmx").val()-$("#gsmn").val())
        this.grainSizeMin = $("#gsmn").val();
        this.loopStartRange = this.grainplayer.buffer.duration/2;
        this.loopStartMin = 0;
        this.loopEndRange = this.grainplayer.buffer.duration/2;
        this.loopEndMin = this.grainplayer.buffer.duration/2;
    }
    changeParameters(np,shape) {

        if ( effectData.hasOwnProperty(this.id) && effectData[this.id].hasOwnProperty("invertY")){
            np.ny = 1.0 - np.ny;
            np.navg = (np.nx+np.ny)/2;
        }

        if (shape && csvData.hasOwnProperty(this.id)) {
            console.log(csvData[this.id][shape]);
            np.ny = csvData[this.id][shape];
            np.nx = csvData[this.id][shape];
            np.navg = csvData[this.id][shape];
        } else if (this.id === "1") {
            np.navg = (4*np.nx + np.ny)/5;
            np.nx = np.navg;
            np.ny = np.navg;
        }
        this.delay.delayTime.rampTo(np.navg * this.delayRange + this.delayMin*1,0.1);

        this.vibrato.frequency.rampTo(np.ny * this.freqRange + this.freqMin*1,0.1);
        this.vibrato.depth.rampTo(np.nx * this.depthRange + this.depthMin*1,0.1);

        this.pitchshift.pitch = np.navg * this.pitchRange + this.pitchMin*1;

        this.grainplayer.detune = np.nx * this.detuneRange + this.detuneMin*1;
        this.grainplayer.grainSize = np.nx * this.grainSizeRange + this.grainSizeMin*1; 
        this.grainplayer.loopStart = np.ny * this.loopStartRange + this.loopStartMin;
        this.grainplayer.loopEnd = np.nx * this.loopEndRange + this.loopEndMin;
    }
}
class SoundInteractionArea {
    constructor() {
        this.areaContainer = new PIXI.Container();
    }
    setNew(num,s,pos) {
        this.loadNew(num)
        this.setInitialPositionAndScale(num,s,pos)
    }
    setInitialPositionAndScale(num,s,pos) {
        this.areaContainer.scale.set(s)
        //this is only for loading sound areas, not legends with them
        this.currentBounds = this.areaContainer.getBounds();
        if (this.currentBounds.height > this.currentBounds.width) {
            this.areaContainer.scale.set(app.screen.height/this.currentBounds.height * 0.5)
        } else {
            this.areaContainer.scale.set(app.screen.width/this.currentBounds.width * 0.45)
        }
        this.currentBounds = this.areaContainer.getBounds();
        this.areaContainer.x -= this.currentBounds.x
        this.areaContainer.y -= this.currentBounds.y
        this.areaContainer.y += 100
        this.areaContainer.x += 300


        this.currentBounds = this.areaContainer.getBounds();
        console.log(this.currentBounds)

        //console.log(this.areaContainer.x) 
    }
    setNewPositionAndScale(num, newx, newy) {
        this.areas[num].x = newx;
        this.areas[num].y = newy;
        this.currentBounds = this.areas[num].getBounds()
        //     console.log("Position:",this.areas[num].getBounds());
    }
    loadNew(num) {
        this.areaContainer.removeChildren()
        let soundArea = JSON.parse(mergedSoundAreas[num]);
        //let rect = soundArea.shapes[0][0].shape;
        let shapeArray = soundArea.shapes;
        //console.log(shapeArray)
        for ( const shape in shapeArray) {
            console.log(shape);
            let s = shapeArray[shape].reduce((graphics, shape, index, array) => {
                if (index === 0) { 
                    graphics.beginFill(0xFFA500);
                    graphics.alpha = 0.2;
                }
                graphics.drawPolygon(shape.shape)
                if (index === array.length - 1) {
                    graphics.endFill();
                    graphics.visible = true;
                };
                return graphics;
            }, new PIXI.Graphics());
            this.areaContainer.addChild(s)
        }
    }
    containsPoint(pos) {
        let shapeArray = this.areaContainer.children; 
        let contains = false;
        let pos1 =pos.clone();
        pos1.x -=5;
        pos1.y -=5;
        let pos2 =pos.clone();
        pos2.x +=5;
        pos2.y -=5;
        let pos3 =pos.clone();
        pos3.x -=5;
        pos3.y +=5;
        let pos4 =pos.clone();
        pos4.x +=5;
        pos4.y +=5;
        for (const shape in shapeArray) {
            if (shapeArray[shape].containsPoint(pos1) || 
                shapeArray[shape].containsPoint(pos2) ||
                shapeArray[shape].containsPoint(pos3) ||
                shapeArray[shape].containsPoint(pos4)
            ) {
                contains = true;
                return {"contains":true,"shape":shape}
            }
        }
        return {"contains":false}
    }
}

const molecule = new Molecule();
const soundareas = new SoundInteractionArea();
const soundeffects = new SoundEffects();
let mergedSoundURL = '_data/mergedSoundAreas_mine.json';
let mergedCsvURL = '_data/mergedCsvData.json';
let legendsURL = '_data/encodedSVG.json';
let dataURL = '../../assets/data/dataSummary.json';
let buffers = {};

$(document).ready(function() {
    // executes when HTML-Document is loaded and DOM is ready
    console.log("Document is ready");
    console.log("Started loading assets");
    console.log("Loading dataSummary from: " + dataURL);
    $.getJSON(dataURL, function( data ) {
        datasets = data;
        console.log('Loaded dataSummary.json');
    });
    console.log("Loading Soundarea data from: " + mergedSoundURL);
    $.getJSON(mergedSoundURL, function( data ) {
        mergedSoundAreas = data;
        console.log("Loaded Soundarea data");
    });
    /*
    console.log("Loading CSV data from: " + mergedCsvURL);
    $.getJSON(mergedCsvURL, function( data ) {
        mergedCsvData = data;
        console.log();
        console.log("Loaded CSV data");
    });
    */
    console.log("Loading Legends from " + legendsURL);
    $.getJSON(legendsURL, function( data ) {
        mergedLegends = data;
        console.log('Loaded Legend files');
    });
    let _url = '../../assets/images/SCROLL_cs6_ver23_APP_final_150ppi-LOW-';
    PIXI.Loader.shared.add(_url+'01-or8.png').load(() => {
        let scroll_01 = new PIXI.Sprite(PIXI.Loader.shared.resources[_url+'01-or8.png'].texture);
        mainScrollScale = app.screen.height/scroll_01.height;
        mainScrollWidth=scroll_01.width*2*mainScrollScale;
    });

    $("#p").on("click",async () => {
        $("#p").prop("disabled", true);
        await Tone.start();
        console.log("Context started");
        $("#p").text("Started");
    });
});

$("#m").on("change", function() {
    let i = ($(this).val());
    if(i in datasets) {
        console.log(datasets[i].title)
        app.stage.removeChildren();
        $("p").text(datasets[i].title);
        if(datasets[i].hasOwnProperty("popdimensions")) {
            //loadLegend(i)
            soundeffects.setNewBuffer(datasets[i].audiofile, i);
            app.stage.addChild(molecule.moleculeContainer);
            soundareas.setNew(i,1,50);
            app.stage.addChild(soundareas.areaContainer)
            soundeffects.readDefaultParameterRangeFromInput();
        } else {
            $("p").text(i + datasets[i].title + " has no popdimensions");
        }
    } else {
        $("p").text("No dataset for id number " + i);
        app.stage.removeChildren();
    }
});
$("#t").on("change", function() {
    soundeffects.setDefaultParameterRangeFromInput();
});
$("#bv").on("input", function() {
    soundeffects.baseplayer.volume.value= $("#bv").val();
});
$("#mute").on("change", function() {
    soundeffects.baseplayer.mute= $("#mute").is(":checked");
});
$("#lv").on("input", function() {
    soundeffects.player.volume.value= $("#lv").val();
    soundeffects.grainplayer.volume.value= $("#lv").val();
});

const getNormalizedPosition = (pos) => {

    let np = {};
    np.x = pos.x - soundareas.currentBounds.x;
    np.y = pos.y - soundareas.currentBounds.y;
    np.nx = Math.abs(np.x/soundareas.currentBounds.width);
    np.ny = Math.abs(np.y/soundareas.currentBounds.height);

    np.navg = (np.nx+np.ny)/2;
    //    console.log(np);
    return np;
}

const loadLegend = (id) => {

    if (datasets.hasOwnProperty(id)) {
        console.log('Loading data for : ' + id);
        let legenddata = mergedLegends[id];
        let dim = datasets[id].popdimensions;
        let resource = new PIXI.SVGResource (legenddata, {scale: 1.5});
        let legendTexture = PIXI.Texture.from(resource);
        let legendLoaded = false;
        legendTexture.on('update', () => {
            if(!legendLoaded){
                let legend = new PIXI.Sprite(legendTexture);
                let s = mainScrollScale;
                let legendScale = app.screen.height/legendTexture.height;
                legend.scale.set(legendScale, legendScale);
                app.stage.addChild(legend);
                showLegend(id,legend,dim);
                soundareas.setNew(id,app.screen.height/623.5,legend.position);
                app.stage.addChild(soundareas.areaContainer)
            }
            legendLoaded = true;
        });
    }
}


const showLegend = (number,legend,dim) => {
    console.log('Repositioning legend ' + number);
    let _x = parseInt(dim[0].x);
    let _y = parseInt(dim[0].y);
    let _width = parseInt(dim[0].width);
    let _height = parseInt(dim[0].height);
    let s = app.screen.height/821;
    _x = _x*s-(mainScrollWidth-legend.width);
    _y = _y*s;
    _width = _width*s;
    _height = _height*s;
    legend.x -= (_x -app.screen.width/2 + _width/2)
    legend.y -= (_y - app.screen.height/2 + _height/2)
}

app.ticker.speed = 0.5
app.ticker.add(() => {

        molecule.fftVisualizer.clear();
        molecule.fftVisualizer.lineStyle(1,0xFFFFFF,1)

        const fftData = soundeffects.fft.getValue();
        const ampData = fftData.map(x => {
            let y= (x + 140);
            return y
        });
    ampData.forEach((x,i) => {
            molecule.fftVisualizer.drawCircle(0, 0, x);
//            if ( i > 4 && i < 13)
        });
    //tick += 0.02;
});

