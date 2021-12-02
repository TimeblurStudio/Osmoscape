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
    this.dragging;
    this.data;
    this.alpha;
    this.x;
    this.y;
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
      .lineStyle(1, 0xb67339, 1)
      .beginFill(0xeaf1f3, 0.53)
      .drawCircle(0, 0, 75)
      .endFill()
      .drawCircle(0, 0, 25);
    //
    this.moleculeContainer.addChild(this.molecule);
    this.moleculeContainer.on('pointerdown', this.onDragStart)
      .on('pointerup', this.onDragEnd)
      .on('pointerupoutside', this.onDragEnd)
      .on('pointermove', this.onDragMove);
    this.moleculeContainer.x = (osmo.scroll.pixiWidth/2) - pos.x/2;//-pos.x;// + osmo.scroll.pixiWidth / 2;
    this.moleculeContainer.y = (osmo.scroll.pixiHeight/2) - pos.y;// + osmo.scroll.pixiHeight / 2;
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
      osmo.soundeffects.crossfade.fade.rampTo(0,1.0);
      //
      if(osmo.soundareas.containsPoint(newPosition)) {
        //console.log(newPosition.x + ' ' + newPosition.y);
        osmo.soundeffects.crossfade.fade.rampTo(1,1.0);
        let np = osmo.mc.getNormalizedPosition(newPosition);
        //console.log(np);
        osmo.soundeffects.changeParameters(np);
      }
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

};