/*global osmo:true $:true*/

/**
 * ------------------------------------------------
 * AUTHOR: Mike Cj (mikecj184)
 * Copyright 2020 - 2021 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */

let chapter_names = {
  'ch1': '1. Water in space',
  'ch2': '2. Water and Planet',
  'ch3': '3. Water and Atmospheric systems',
  'ch4': '4. Water and Glacier',
  'ch5': '5. Water and Industrial agriculture',
  'ch6': '6. Water and River',
  'ch7': '7. Water and Ocean'
};

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:  Navigation
 * desc:
 * ------------------------------------------------
 */
osmo.navigationInteraction = class {

  constructor(){
    console.log('osmo.navigationInteraction - constructor');

    // ----------------
    // Lib
    // ----------------
    this.PAPER = osmo.scroll.PAPER;
    this.TONE = osmo.scroll.TONE;
    this.BGAUDIO = osmo.bgaudio;

    //@private
    this.mousePos;
    this.navigationFile = null;
    this.navHitOptions = {
      segments: false,
      stroke: false,
      fill: true,
      tolerance: 5
    };
    this.currentNavLoc = -1;
    this.navTweenItem;
    this.navLayer;
    this.isOnDiv = false;

    // Methods
    this.init;
    this.update;
  }

  /**
   * ------------------------------------------------
   * init
   * ------------------------------------------------
   */
  init(){
    console.log('Initlaizing Navigation');

    //
    this.navLayer = new this.PAPER.Layer();
    //console.log(this.PAPER.project.activeLayer);
    //this.PAPER.project.activeLayer = this.navLayer;

    //
    this.BGAUDIO.loadAudio();
    //

    let self = this;
    $('.nav').mouseenter(function(){
      self.isOnDiv = true;
    });
    $('.nav').mouseleave(function(){
      self.isOnDiv = false;
    });
  }

  loadNav(){
    console.log('Loading nav sections');
    //
    //
    let navPath = './assets/data/ChapterNavigation.svg';
    this.PAPER.project.importSVG(navPath, function(item){
      console.log('Loaded Navigation');
      let navigationFile = item;
      //
      let lms = osmo.scroll.paperHeight/item.bounds.height;//mask-scale
      item.scale(lms);
      console.log('Navigation SCALE: ' + lms);
      //
      item.position = osmo.scroll.PAPER.view.center;
      item.position.x = (osmo.scroll.paperWidth*3/4) + (osmo.datasvg.scrollWidth/2);
      item.opacity = 0.01;
      //
      osmo.navinteract.navLayer.addChild(item);
      //
    });
    //
  }


  initNav(){
    console.log('Initializing navigation');

    let self = this;
    $('.jump').click(function(el){
      console.log(el);
      //
      let chap_id = parseInt($(el.target.parentElement).attr('data-id'));
      let locX = osmo.scroll.PAPER.project.getItem({name: 'nav-ch'+chap_id}).bounds.left;
      let w = osmo.scroll.PAPER.project.getItem({name: 'nav-ch'+chap_id}).bounds.width;
      //
      console.log(chap_id);
      console.log(locX);
      console.log(w);
      // Code below makes scrolling experince way smooth
      if(osmo.scroll.hitPopupMode != 'focused'){
        osmo.legendinteract.hitMaskEffect(new osmo.scroll.PAPER.Point(0,0), 'scrolling');
        if(osmo.legendsvg.maskLayer.visible)
          osmo.legendsvg.maskLayer.visible = false;
      }
      //
      if(w > osmo.scroll.paperWidth)
        locX += (osmo.scroll.paperWidth/2);
      else
        locX += w/2;
      //
      let dur = 2000;
      let diff = Math.abs(locX - osmo.scroll.PAPER.view.center.x);
      if(diff < osmo.scroll.paperWidth ){
        let ratio = diff/osmo.scroll.paperWidth;
        dur = parseInt(2000 * ratio);
        if(dur < 350)
          dur = 350;
      }
      //
      osmo.navinteract.navTweenItem.tween(
        { position: osmo.scroll.PAPER.view.center },
        { position: new osmo.scroll.PAPER.Point(locX, osmo.scroll.PAPER.view.center.y) },
        {
          easing: 'easeInOutQuad',
          duration: dur
        }
      ).onUpdate = function(event) {
        //
        osmo.scroll.PAPER.view.center = osmo.navinteract.navTweenItem.position;
        osmo.navinteract.hitNavEffect();
        //
      };
      //
      // Stop all tracks and start target track
      for(let i=0; i < 7; i++)
        osmo.bgaudio.baseTracks['base'+(i+1)].stop();
      //
      setTimeout(function(){
        console.log('Completed scroll for - ' + chap_id);
        console.log('Changing base track...');
        osmo.bgaudio.currentTrack = 'base' + chap_id;
        //
        console.log('Now playing : ' + osmo.bgaudio.currentTrack);
        osmo.bgaudio.baseTracks[osmo.bgaudio.currentTrack].start();
        //
        osmo.pzinteract.enableMaskInteractions();
      },dur);
      //
      console.log(chap_id + ' clicked -- scroll to: ' + locX);
      console.log('duration: ' + dur);
    });
    //
    this.navTweenItem = new this.PAPER.Shape.Circle(this.PAPER.view.center, 30);
    this.navTweenItem.fill = '#222';
    this.navTweenItem.stroke = 'none';
    this.navTweenItem.position = this.PAPER.view.center;

    //console.log(navTweenItem);
    //
    //
  }

  /**
   * ------------------------------------------------
   * updateBasetrack
   * ------------------------------------------------
   */
  updateBasetrack(){
    //
    if(this.currentNavLoc != -1 && (this.BGAUDIO.currentTrack != ('base'+this.currentNavLoc))){
      console.log('Changing base track - Haven\'t scrolled in 250ms!');
      this.BGAUDIO.currentTrack = 'base' + this.currentNavLoc;
      //
      for(let i=0; i < 7; i++)
        this.BGAUDIO.baseTracks['base'+(i+1)].stop();
      //
      console.log('Now playing : ' + this.BGAUDIO.currentTrack);
      this.BGAUDIO.baseTracks[this.BGAUDIO.currentTrack].start();
      //
    }
  }

  /**
   * ------------------------------------------------
   * hitNavEffect
   * ------------------------------------------------
   */
  hitNavEffect(){
    //
    var hitResult = this.navLayer.hitTest(this.PAPER.view.center, this.navHitOptions);
    if(hitResult != null){
      //
      let name = hitResult.item.name;
      if(name == undefined)
        return;
      //
      if(name.includes('nav-ch')){
        if(this.currentNavLoc == -1){
          $('.nav').fadeIn();
          //
          this.BGAUDIO.introTrack.stop();
          this.BGAUDIO.currentTrack = 'none';
        }
        let navLoc = parseInt(name.replace('nav-ch', ''));
        if(this.currentNavLoc != navLoc){
          //console.log('Not same - ' + currentNavLoc + ' '  + navLoc);
          let elements = $('.jump');
          for(let i=0; i < elements.length; i++){
            let ele = $(elements[i]);
            let id = parseInt(ele.attr('data-id'));
            if(ele.hasClass('selected') ){
              ele.removeClass('selected');
              ele[0].firstChild.src = ele[0].firstChild.src.replace('_selected','_default');
            }
            if(id == navLoc){
              console.log('Updated - ' + navLoc);
              for(var key in chapter_names)
              {
                if('ch' + id==`${key}`)
                {
                  console.log(`${chapter_names[key]}`);
                  $('#text').text(`${chapter_names[key]}`);
                }
              }
              this.currentNavLoc = navLoc;
              ele.addClass('selected');

              ele[0].firstChild.src = ele[0].firstChild.src.replace('_default','_selected');
            }
          }
        }
      }
      //
      if(name.includes('intro')){
        $('.nav').fadeOut();
        this.currentNavLoc = -1;
        //
        if(this.BGAUDIO.currentTrack != 'intro'){
          //
          for(let i=0; i < 7; i++)
            this.BGAUDIO.baseTracks['base'+(i+1)].stop();
          //
          this.BGAUDIO.introTrack.start();
          this.BGAUDIO.currentTrack = 'intro';
        }
      }
      /*
      if(name.includes('outro')){
        $('.nav').fadeOut();
        currentNavLoc = -1;
      }
      */
    }
  }

  update(){

  }

};