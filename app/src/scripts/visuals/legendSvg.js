/*global osmo:true $:true*/

/*
 *ADD AUTHOUR AND LISCENSE*
 */

"use strict";
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:	Legend
 * desc:
 * ------------------------------------------------
 */
osmo.legendSvg = class {
  constructor() {
    console.log("osmo.Legend - constructor");
    // ----------------
    // Lib
    // ----------------
    this.PAPER = osmo.scroll.PAPER;

    //@private
    this.datasets = {};
    this.earlySVGDataPromises = [];
    this.allSVGDataPromises = [];
    this.popupBBoxes = {};
    this.maskFiles = [];
    this.legendFiles = [];
    this.maskLayer;
    this.legendLayer;

    // Methods
    this.init;
    this.loadDatasets;
  }

  init() {
    console.log("osmo.Legend - init");
    //
    let dataURL = "assets/data/dataSummary.json" + "?v=" + window.version;
    console.log("dataURL: " + dataURL);
    //
    let self = this;
    $.getJSON(dataURL, function (data) {
      console.log("Loaded datasets summary");
      //
      let dataWaitInterval = setInterval(function () {
        if (osmo.datasvg) {
          if (osmo.datasvg.mainScroll != null) {
            clearInterval(dataWaitInterval);
            self.datasets = data;
            self.loadDatasets();
          }
        }
      }, 1000);
      //
    });
    //
    this.maskLayer = new this.PAPER.Layer();
    this.legendLayer = new this.PAPER.Layer();
    //
  }

  /**
   * ------------------------------------------------
   * loadDataset
   * ------------------------------------------------
   */
  loadDataset(id, early = true) {
    if (this.datasets.hasOwnProperty(id)) {
      console.log("Loading data for : " + id);
      //
      let mpath = this.datasets[id].maskpath;
      let title = this.datasets[id].title;
      /*
	    if(window.debug){
	      let pieces = mpath.split('/');
	      let fname = pieces[pieces.length-1];
	      pieces[pieces.length-1] = 'Debug';
	      pieces.push(fname);
	      mpath = pieces.join('/');
	    }
	    */
      let morder = this.datasets[id].order;
      if (morder != "front" && morder != "back") morder = null;
      //
      let maskpromise = this.maskLoad(title, mpath, id, morder);
      let legendpromise = this.legendLoad(
        title,
        this.datasets[id].legendpath,
        id
      );
      //
      if (early) {
        this.earlySVGDataPromises.push(maskpromise);
        this.earlySVGDataPromises.push(legendpromise);
      } else {
        this.allSVGDataPromises.push(maskpromise);
        this.allSVGDataPromises.push(legendpromise);
      }
      //
      //
      if (this.datasets[id].hasOwnProperty("popdimensions")) {
        console.log("Loading dimensions for : " + id);
        //
        let dim = this.datasets[id].popdimensions;
        this.popupBBoxes[id] = {
          mask: null,
          legend: null,
          paths: [],
          dimensions: dim,
        };
        //
        //
        let count = this.popupBBoxes[id]["dimensions"].length;
        console.log("boxes: " + count);
        //
        let s = osmo.scroll.paperHeight / osmo.datasvg.mainScroll.height;
        let rs = osmo.scroll.paperHeight / osmo.scroll.refPopupSize.height;
        console.log("paper scale ratio: " + rs);
        //
        for (let i = 0; i < count; i++) {
          //
          let _x = parseInt(this.popupBBoxes[id]["dimensions"][i].x);
          let _y = parseInt(this.popupBBoxes[id]["dimensions"][i].y);
          let _width = parseInt(this.popupBBoxes[id]["dimensions"][i].width);
          let _height = parseInt(this.popupBBoxes[id]["dimensions"][i].height);
          //
          _x *= rs;
          _x += (osmo.scroll.paperWidth * 3) / 4;
          _y *= rs;
          _width *= rs;
          _height *= rs;
          //
          let p1 = new this.PAPER.Point(_x, _y);
          let p2 = new this.PAPER.Point(_x + _width, _y + _height);
          let rectPath = this.newPopRect(p1, p2);
          this.legendLayer.addChild(rectPath);
          //
          this.popupBBoxes[id]["paths"].push(rectPath);
          this.popupBBoxes[id]["paths"][i].visible = false;
          //
        }
        //
        this.maskLayer.visible = false;
        // Turn off all visuals
      }
      //
      //
    }
  }

  /**
   * ------------------------------------------------
   * newPopRect
   * ------------------------------------------------
   */
  newPopRect(p1, p2) {
    // Create pixel perfect dotted rectable for drag selections.
    var half = new this.PAPER.Point(
      0.5 / this.PAPER.view.zoom,
      0.5 / this.PAPER.view.zoom
    );
    var start = p1.add(half);
    var end = p2.add(half);
    var rect = new this.PAPER.CompoundPath();
    rect.moveTo(start);
    rect.lineTo(new this.PAPER.Point(start.x, end.y));
    rect.lineTo(end);
    rect.moveTo(start);
    rect.lineTo(new this.PAPER.Point(end.x, start.y));
    rect.lineTo(end);
    rect.strokeColor = "#009DEC";
    rect.strokeWidth = 1.0 / this.PAPER.view.zoom;
    rect.dashOffset = 0.5 / this.PAPER.view.zoom;
    rect.dashArray = [1.0 / this.PAPER.view.zoom, 1.0 / this.PAPER.view.zoom];
    rect.data.guide = true;
    rect.selected = false;
    return rect;
  }

  /**
   * ------------------------------------------------
   * loadDatasets
   * ------------------------------------------------
   */
  loadDatasets() {
    let self = this;
    //
    for (let id in this.datasets) this.loadDataset(id, true);
    //
    //
    Promise.all(this.earlySVGDataPromises).then((values) => {
      console.log("Processing early datasets...");
      $("#percentage").html("Processing datasets...");
      setTimeout(function () {
        console.log("Loaded all datasets");
        osmo.scroll.loaded.svgdata = true;
        if (osmo.scroll.loaded.HQimage && osmo.scroll.loaded.svgdata) {
          window.loading_screen.finish();
          osmo.bgaudio.start();
          //
          document.body.style.cursor = "none";
          $(".cursor-pointer-wrapper").css("opacity", 1);
          //
        }
        self.correctMaskOrder();
        //
      }, 4000);
    });
    //
  }

  /**
   * ------------------------------------------------
   * correctMaskOrder
   * ------------------------------------------------
   */
  correctMaskOrder() {
    // bring some masks to front and others back
    for (let i = 0; i < this.maskLayer.children.length; i++) {
      let child = this.maskLayer.children[i];
      //
      let order = child.data.order;
      //
      if (order == "back") child.sendToBack();
      if (order == "front") child.bringToFront();
      //
    }
  }

  /**
   * ------------------------------------------------
   * maskLoad
   * ------------------------------------------------
   */
  maskLoad(title, svgxml, num, order = null) {
    let self = this;
    //
    console.log("maskLoad called");
    const mpromise = new Promise((resolve, reject) => {
      //
      this.PAPER.project.importSVG(svgxml, function (item) {
        console.log("Loaded " + num + " mask");
        //
        let mask = item;
        self.maskFiles.push(mask);
        //
        if (self.popupBBoxes[num] != undefined)
          self.popupBBoxes[num]["mask"] = mask;
        //
        //
        //
        mask.data.titleName = title;
        mask.data.legendName = "legend-" + num;
        mask.data.maskName = "mask-" + num;
        mask.name = "mask-" + num;
        mask.data.order = order;
        //
        if (order == "back") mask.sendToBack();
        if (order == "front") mask.bringToFront();
        //
        if (mask.children != undefined)
          self.updateChildLegend(
            mask.children,
            mask.data.legendName,
            mask.data.titleName
          );
        //
        //
        let s = osmo.scroll.paperHeight / osmo.datasvg.mainScroll.height;
        let lms = osmo.scroll.paperHeight / mask.bounds.height; //mask-scale
        //
        let percmask =
          (0.5 * parseFloat(self.maskFiles.length)) /
          parseFloat(Object.keys(self.datasets).length);
        let percleg =
          (0.5 * parseFloat(self.legendFiles.length)) /
          parseFloat(Object.keys(self.datasets).length);
        let percentage =
          "&nbsp;&nbsp;" + parseInt((percmask + percleg) * 100) + "%";
        $("#percentage").html(percentage);
        //
        mask.scale(lms);
        mask.position = self.PAPER.view.center;
        mask.position.x =
          (osmo.scroll.paperWidth * 3) / 4 +
          mask.bounds.width / 2 +
          (osmo.datasvg.mainScroll.width * s - mask.bounds.width);
        mask.visible = false;
        //
        self.maskLayer.addChild(mask);
        resolve("m" + num);
        //
      });
      //
    });
    //
    //
    return mpromise;
  }

  /**
   * ------------------------------------------------
   * legendLoad
   * ------------------------------------------------
   */
  legendLoad(title, svgxml, num) {
    let self = this;
    //
    const lpromise = new Promise((resolve, reject) => {
      //
      this.PAPER.project.importSVG(svgxml, function (item) {
        console.log("Loaded " + num + " legend");
        $("#status").text("Loaded " + num + " legend");

        //
        let legend = item;
        self.legendFiles.push(legend);
        if (self.popupBBoxes[num] != undefined)
          self.popupBBoxes[num]["legend"] = legend;
        //
        //
        legend.name = "legend-" + num;
        legend.visible = false;
        //
        //
        let s = osmo.scroll.paperHeight / osmo.datasvg.mainScroll.height;
        let lms = osmo.scroll.paperHeight / legend.bounds.height; //mask-scale
        //
        let percmask =
          (0.5 * parseFloat(self.maskFiles.length)) /
          parseFloat(Object.keys(self.datasets).length);
        let percleg =
          (0.5 * parseFloat(self.legendFiles.length)) /
          parseFloat(Object.keys(self.datasets).length);
        let percentage =
          "&nbsp;&nbsp;" + parseInt((percmask + percleg) * 100) + "%";
        $("#percentage").html(percentage);
        //
        legend.scale(lms);
        legend.position = self.PAPER.view.center;
        legend.position.x =
          (osmo.scroll.paperWidth * 3) / 4 +
          legend.bounds.width / 2 +
          (osmo.datasvg.mainScroll.width * s - legend.bounds.width);
        //
        self.legendLayer.addChild(legend);
        //
        resolve("l" + num);
      });
      //
    });
    //
    return lpromise;
  }

  /**
   * ------------------------------------------------
   * updateChildLegend
   * ------------------------------------------------
   */
  updateChildLegend(ch, d, t) {
    for (let i = 0; i < ch.length; i++) {
      let child = ch[i];
      child.data.legendName = d;
      child.data.titleName = t;
      if (child.children != undefined)
        this.updateChildLegend(child.children, d, t);
    }
  }
};
