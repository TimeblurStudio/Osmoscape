/*global osmo:true, $:true*/

/**
 * ------------------------------------------------
 * AUTHOR: Mike Cj (mikecj184)
 * Copyright 2020 - 2021 Timeblur
 * This code is licensed under MIT license (see LICENSE file for more details)
 * ------------------------------------------------
 */


import './jquery-global.js';
import {} from './osmoScroll';


window.osmo = window.osmo || {};
window.isMobile = mobileCheck();

//
//
window.onload = function() {
  //
  console.log('Window loaded');
  window.version = $('#versionid').text();

  // Scroll instance
  osmo.scroll = new osmo.Scroll();
  osmo.scroll.init();

  // Meter to keep track of FPS
  window.FPSMeter.theme.transparent.container.transform = 'scale(0.75)';
  window.meter = new window.FPSMeter({ margin: '-8px -16px', theme: 'transparent', graph: 1, history: 16 });

  //
  //
  //
  let please_wait_spinner = '<div id="percentage" style="color: #b97941; font-weight: 400;"></div><br><div class="sk-three-bounce"><div class="sk-child sk-bounce1" style="background-color: #b97941"></div><div class="sk-child sk-bounce2" style="background-color: #b97941"></div><div class="sk-child sk-bounce3" style="background-color: #b97941"></div></div>';
  let DesktopHtmlContent = '<div id="main-inner-choice" style="display: block;font-family: \'Roboto\'; font-weight: 300;"><h2 id="quality-choice" style="font-family: \'Roboto\'; font-weight: 300;"><a class="invert" onclick="osmo.scroll.loadHQ();"  href="#" style="cursor: pointer; font-weight: 400;">HIGH RES</a><span style="font-weight: 300;">&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span><a class="invert" id="quality-choice-best" style="cursor: pointer;" href="#" onclick="osmo.scroll.loadRQ();">ULTRA RES</a></h2></div>';
  //
  let loadMobile = !window.isMobile;
  if(loadMobile){
    console.log('Loading screen for desktop');
    window.loading_screen = window.pleaseWait({
      logo: 'assets/images/OsmoSplash.png',
      backgroundColor: '#b4d2da',
      loadingHtml: DesktopHtmlContent
    });
  }else{
    console.log('Loading screen for mobile');
    window.loading_screen = window.pleaseWait({
      logo: 'assets/images/OsmoSplash.png',
      backgroundColor: '#b4d2da',
      loadingHtml: please_wait_spinner
    });
    //
    osmo.scroll.loadMQ();
  }
  //
  //
  let logo = $('.pg-loading-logo');
  osmo.scroll.splashWidth = logo.outerWidth();
};


//
function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}