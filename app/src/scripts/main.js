/*global osmo:true, $:true*/

import {} from './osmoScroll';


window.osmo = window.osmo || {};

//
//
window.onload = function() {
	//
	console.log('Window loaded');

	// Scroll instance
	osmo.scroll = new osmo.Scroll();
	osmo.scroll.init();

};


