/*global osmo:true $:true*/

/**
 * ------------------------------------------------
 * AUTHOR: Himanshu erande (rndexe)
 * Copyright 2021 - 2022
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:   MoleculeController
 * desc:
 * ------------------------------------------------
 */
osmo.MoleculeController = class {

  constructor(){
    console.log('osmo.MoleculeController - constructor');

    // ----------------
    // Lib
    // ----------------
    this.TONE = osmo.scroll.TONE;
    this.PIXI = osmo.scroll.PIXI;
    //
    //@private
    //
    this.moleculeContainer;
    this.molecule;
    this.fftvisualizer;
    this.dragging;
    this.data;
    this.alpha;
    this.x;
    this.y;
    //
    this.tick = 0;
  }


  /**
   * ------------------------------------------------
   * Init
   * ------------------------------------------------
   */
  init(pos){
    console.log('osmo.MoleculeController - init');
    //
    this.moleculeContainer = new this.PIXI.Container();
    this.moleculeContainer.interactive = true;
    this.moleculeContainer.buttonMode = true;
    //
    this.molecule = new this.PIXI.Graphics()
      .beginFill(0xeaf1f3, 0.5)
      .lineStyle(2, 0xb67339, 1)
      .drawCircle(0, 0, 137.5)
      .endFill()
      .drawCircle(0, 0, 132.5)
      .drawCircle(0, 0, 127.5)
      .drawCircle(0, 0, 122.5)
      .moveTo(97.22,-97.22)
      .lineTo(97.22+48.5,-97.22-48.5)
      .moveTo(97.22,97.22)
      .lineTo(97.22+48.5,97.22+48.5)
      .drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 37.5)
      .drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 37.5)
      .lineStyle(2, 0xFFFFFF, 1)
      .drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 12.5)
      .drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 12.5);
    this.molecule.scale.set(0.5,0.5);
    this.shadow = new this.PIXI.Graphics();
    this.shadow.lineStyle(5, 0x222222, 0.5);
    this.shadow.drawCircle(0, 0, 137.5);
    this.shadow.moveTo(97.22,-97.22);
    this.shadow.lineTo(97.22+48.5,-97.22-48.5);
    this.shadow.moveTo(97.22,97.22);
    this.shadow.lineTo(97.22+48.5,97.22+48.5);
    this.shadow.drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 37.5);
    this.shadow.drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 37.5);
    //this.moleculeContainer.filters = [new PIXI.filters.DropShadowFilter()];
    this.shadow.filters = [new this.PIXI.filters.BlurFilter(4)];
    this.shadow.x += 2.0;
    this.shadow.y += 2.0;
    //
    this.fftVisualizer = new this.PIXI.Graphics();
    this.fftVisualizer.scale.set(0.75,0.75);
    this.fftVisualizer.lineStyle(1,0xFFFFFF,1);
    //
    this.molecule.addChild(this.shadow);
    this.moleculeContainer.addChild(this.molecule);
    this.moleculeContainer.addChild(this.fftVisualizer);
    //
    this.moleculeContainer.on('pointerdown', this.onDragStart)
      .on('pointerup', this.onDragEnd)
      .on('pointerupoutside', this.onDragEnd)
      .on('pointermove', this.onDragMove);
    //
    let normalizedScale = osmo.scroll.mainStage.scale.x/osmo.scroll.pixiScale;
    this.moleculeContainer.x = (osmo.scroll.pixiWidth/2) + (osmo.scroll.pixiWidth/6) - (pos.x/osmo.scroll.pixiScale);
    this.moleculeContainer.y = (osmo.scroll.pixiHeight/2) - (pos.y/osmo.scroll.pixiScale);
    //
    this.moleculeContainer.x /= normalizedScale;
    this.moleculeContainer.y /= normalizedScale;
    //
    this.dragging = false;
    //app.stage.addChild(this.moleculeContainer);
  }

  /**
   * ------------------------------------------------
   * Molecule drag
   * ------------------------------------------------
   */
  onDragStart(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.dragging = true;
    osmo.mc.dragging = true;
  }
  onDragEnd() {
    //
    this.alpha = 1;
    this.dragging = false;
    osmo.mc.dragging = false;
    // set the interaction data to null
    this.data = null;
  }
  onDragMove() {
    if (this.dragging) {
      //
      const newPosition = this.data.global;
      this.x = (newPosition.x - osmo.scroll.mainStage.x)/osmo.scroll.mainStage.scale.x;// + osmo.scroll.mainStage.x;
      this.y = (newPosition.y - osmo.scroll.mainStage.y)/osmo.scroll.mainStage.scale.y;// + osmo.scroll.mainStage.y;
      //console.log(parseInt(this.x) + ' ' + parseInt(this.y))
      //
      //
      let hitShape = osmo.soundareas.containsPoint(newPosition);
      if(hitShape.contains) {
        //console.log(newPosition.x + ' ' + newPosition.y);
        osmo.soundeffects.crossfade.fade.rampTo(1,1.0);
        let np = osmo.mc.getNormalizedPosition(newPosition);
        //console.log(np);
        osmo.soundeffects.changeParameters(np,hitShape.shapeIndex);
      }else
        osmo.soundeffects.crossfade.fade.rampTo(0,1.0);
      //
    }
  }

  /**
   * ------------------------------------------------
   * get normalized position
   * ------------------------------------------------
   */
  getNormalizedPosition(pos) {
    //
    let np = {};
    np.x = pos.x - osmo.soundareas.currentBounds.x;
    np.y = pos.y - osmo.soundareas.currentBounds.y;
    np.nx = np.x/osmo.soundareas.currentBounds.width;
    np.ny = np.y/osmo.soundareas.currentBounds.height;
    np.navg = (np.nx+np.ny)/2;
    //
    //
    //console.log(np.x + ' ' + np.y + ' ' + osmo.soundareas.currentBounds.width +  ' ' + osmo.soundareas.currentBounds.height +  ' ' + np.nx + ' ' + np.ny);
    //
    return np;
  }

  /**
   * ------------------------------------------------
   * animate molecule with audio 
   * ------------------------------------------------
   */
  
  animateMolecule() {
    osmo.mc.fftVisualizer.clear();
    osmo.mc.fftVisualizer.lineStyle(1,0xFFFFFF,1);

    const fftData = osmo.soundeffects.fft.getValue();
    const ampData = fftData.map(x => {
      let y= (x + 140);
      return y;
    });
    ampData.forEach((x,i) => {

      if ( i%2 ) 
        osmo.mc.fftVisualizer.lineStyle(1, 0xb67339, 1);
      else 
        osmo.mc.fftVisualizer.lineStyle(1,0xFFFFFF,1);
      osmo.mc.fftVisualizer.drawCircle(0, 0, x);

      if(i > 5 && i < 8 ) {
        osmo.mc.fftVisualizer.lineStyle(1,0xFFFFFF,1);
        osmo.mc.fftVisualizer.drawCircle(97.22 + 17.5, -97.22 - 17.5, x/4);
        osmo.mc.fftVisualizer.drawCircle(97.22+17.5, +97.22+17.5, x/4);
      }
    });
    osmo.mc.molecule.clear();
    osmo.mc.molecule
      .beginFill(0xeaf1f3, 0.5)
      .lineStyle(2 , 0xb67339, 1)
      .drawCircle(0, 0, 137.5)
      .endFill()
      .drawCircle(0, 0, 132.5)
      .drawCircle(0, 0, 127.5)
      .drawCircle(0, 0, 122.5)
      .lineStyle(2 , 0xb67339, 1)
      .moveTo(97.22,-97.22)
      .lineTo(97.22 + ampData[6],-97.22 - ampData[6])
      .moveTo(97.22,97.22)
      .lineTo(97.22 + ampData[6],97.22 + ampData[6])
      .lineStyle(2 , 0xb67339, 1)
      .drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 37.5 + ampData[6]/4)
      .drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 37.5 + ampData[6]/4);
    //.lineStyle(2, 0xFFFFFF, 1)
    //.drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 12.5)
    osmo.mc.shadow.clear();
    osmo.mc.shadow 
      .lineStyle(0.7, 0x222222, 0.5)
      .drawCircle(0, 0, 137.5)
      .lineStyle(2, 0x222222, 0.5)
      .moveTo(97.22,-97.22)
      .lineTo(97.22+49.5 -ampData[6]/4,-97.22-49.5+ampData[6]/4)
      .moveTo(97.22,97.22)
      .lineTo(97.22+49.5 -ampData[6]/4,97.22+49.5-ampData[6]/4)
      .drawCircle(97.22+37.5+37.5, -97.22-37.5-37.5, 37.5 + ampData[6]/4)
      .drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 37.5 + ampData[6]/4);
    //.drawCircle(97.22+37.5+37.5, +97.22+37.5+37.5, 12.5);
 
  }
  
  updateMoleculeScale(val){
    this.moleculeContainer.scale.x = this.moleculeContainer.scale.y = val;
  }

};
