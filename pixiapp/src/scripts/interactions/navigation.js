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

import { SVGScene } from '@pixi-essentials/svg';

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
    this.PIXI = osmo.scroll.PIXI;
    this.TONE = osmo.scroll.TONE;
    this.TWEENMAX = osmo.scroll.TWEENMAX;
    this.POWER4 = osmo.scroll.POWER4;
    this.BGAUDIO = osmo.bgaudio;

    //@private
    this.mousePos;
    this.currentNavLoc = -1;
    this.navigationFile = './assets/data/ChapterNavigation.svg';
    this.navContainer;
    this.navScene;
    this.navScale;
    this.navChapters;
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
    let self = this;
    //
    this.navContainer = new this.PIXI.Container();
    this.navContainer.visible = false;
    osmo.scroll.mainStage.addChild(this.navContainer);
    
    //
    this.BGAUDIO.loadAudio();
    //

    $('.nav').mouseenter(function(){
      self.isOnDiv = true;
    });
    $('.nav').mouseleave(function(){
      self.isOnDiv = false;
    });
    //
    //
  }

  loadNav(){
    console.log('Loading nav sections');
    //
    let self = this;
    $.get(this.navigationFile, function( data ) {
      //
      let svgEl = data.documentElement;
      self.navScene = new SVGScene(svgEl);
      self.navChapters = self.navScene.content.children[4].children;
      //
      self.navScale = osmo.scroll.pixiHeight/self.navScene.height;//nav-scale
      console.log('Navigation SCALE: ' + self.navScale);
      //
      self.navScene.x = (osmo.scroll.pixiWidth*3/4);//Change the sprite's position
      self.navScene.scale.set(self.navScale, self.navScale);
      self.navScene.alpha = 1;
      //
      //self.navContainer.addChild(self.navScene); // hitTest not required So, no need to add it to layer
      //
    });
    //
    //
  }


  initNav(){
    console.log('Initializing navigation');
    //
    let self = this;
    let pixiWidth = osmo.scroll.pixiWidth;
    //
    $('.jump').click(function(el){
      ///if(maskContainer.visible)
      ///  maskContainer.visible = false;
      //
      //
      let chap_id = parseInt($(el.currentTarget).attr('data-id'));
      let current_chapter = $.grep($(self.navChapters), function(e){ return e.id == 'nav-ch'+chap_id; });
      let locX = -1*parseFloat($(current_chapter).attr('x'))*self.navScale*osmo.scroll.pixiScale;
      let w = parseFloat($(current_chapter).attr('width'))*self.navScale*osmo.scroll.pixiScale;
      //
      if(w > pixiWidth)
        locX -= (pixiWidth/2);
      else
        locX -= w/2;
      //
      //
      let dur = 2000;
      let diff = Math.abs(locX - osmo.scroll.mainStage.position.x);
      if(diff < pixiWidth ){
        let ratio = diff/pixiWidth;
        dur = parseInt(2000 * ratio);
        if(dur < 350)
          dur = 350;
      }
      //
      self.TWEENMAX.to(osmo.scroll.mainStage.position, dur/1000, {
        x: locX,
        ease: self.POWER4.easeInOut
      });
      //
      //
      let elements = $('.jump');
      let navLoc = chap_id;
      for(let i=0; i < elements.length; i++){
        let ele = $(elements[i]);
        let id = parseInt(ele.attr('data-id'));
        if(ele.hasClass('selected') ){
          ele.removeClass('selected');
          ele.find('img')[0].src = ele.find('img')[0].src.replace('_selected','_default');
        }
        if(id == navLoc){
          console.log('Updated - ' + navLoc);
          self.currentNavLoc = navLoc;
          ele.addClass('selected');
          //
          ele.find('img')[0].src = ele.find('img')[0].src.replace('_default','_selected');
        }
      }
      //

      // Stop all tracks and start target track
      for(let i=0; i < 7; i++)
        self.BGAUDIO.baseTracks['base'+(i+1)].stop();
      //
      setTimeout(function(){
        console.log('Completed scroll for - ' + chap_id);
        ///maskContainer.visible = true;
        //
        console.log('Changing base track...');
        self.BGAUDIO.currentTrack = 'base' + chap_id;
        //
        console.log('Now playing : ' + self.BGAUDIO.currentTrack);
        self.BGAUDIO.baseTracks[self.BGAUDIO.currentTrack].start();
        //
      },dur);
      console.log(chap_id + ' clicked -- scroll to: ' + locX);
      //
    });
    //
    /*
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
    */
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
  /*
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
      ///if(name.includes('outro')){
      ///  $('.nav').fadeOut();
      ///  currentNavLoc = -1;
      ///}
    }
  }
  */



  /**
  * ------------------------------------------------
  * scrollNavEffect
  * ------------------------------------------------
  */
  scrollNavEffect(){
    //
    for(let i=0; i < this.navChapters.length-1; i++){
      let this_locX = parseFloat($(this.navChapters[i]).attr('x'))*this.navScale*osmo.scroll.pixiScale;
      let next_locX = parseFloat($(this.navChapters[i+1]).attr('x'))*this.navScale*osmo.scroll.pixiScale;
      //
      if(Math.abs(osmo.scroll.mainStage.position.x) >  this_locX && Math.abs(osmo.scroll.mainStage.position.x) < next_locX){
        let name = this.navChapters[i].id;
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
            console.log('currentNavLoc not same - ' + this.currentNavLoc + ' '  + navLoc);
            let elements = $('.jump');
            for(let i=0; i < elements.length; i++){
              let ele = $(elements[i]);
              let id = parseInt(ele.attr('data-id'));
              if(ele.hasClass('selected') ){
                ele.removeClass('selected');
                ele.find('img')[0].src = ele.find('img')[0].src.replace('_selected','_default');
              }
              if(id == navLoc){
                console.log('Updated - ' + navLoc);
                this.currentNavLoc = navLoc;
                ele.addClass('selected');
                //
                ele.find('img')[0].src = ele.find('img')[0].src.replace('_default','_selected');
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
        //
      }
      //
    }
    osmo.pzinteract.navScrolledUpdate = true;
  }


};