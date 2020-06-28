/*global osmo:true $:true*/


/*
	*ADD AUTHOUR AND LISCENSE*
*/

'use strict';
export default class {}

window.osmo = window.osmo || {};
/**
 * ------------------------------------------------
 * class:	movingStars
 * desc:
 * ------------------------------------------------
 */
osmo.movingStars = class {

	constructor(){
		console.log('osmo.movingStars - constructor');

		// ----------------
		// Lib
		// ----------------
		this.PAPER = osmo.scroll.PAPER;

		//@private
		this.position;
		this.mousePos;
		this.count;

		// Methods
		this.init;
		this.update;
		this.mouseMoved;
		this.keyDown;
		this.moveStars;
	}


	/**
	 * ------------------------------------------------
	 * Initalize stars
	 * ------------------------------------------------
	 */
	init(){
		console.log('osmo.movingStars - initStars');

		//
		this.count = 50;
		this.mousePos = this.PAPER.view.center.add(new this.PAPER.Point(this.PAPER.view.bounds.width/3, 100 ));
		this.position = this.PAPER.view.center;
		//

		// Create a symbol, which we will use to place instances of later:
		var path = new this.PAPER.Path.Circle({
			center: [0, 0],
			radius: 5,
			fillColor: 'white',
			strokeColor: 'black'
		});

		var symbol = new this.PAPER.SymbolDefinition(path);

		// Place the instances of the symbol:
		for (var i = 0; i < this.count; i++) {
			// The center position is a random point in the view:
			var center = this.PAPER.Point.random().multiply(this.PAPER.view.size);
			var placed = new this.PAPER.SymbolItem(symbol);// symbol.place(center);
			placed.position = center;
			//
			placed.scale(i / this.count + 0.01);
			placed.data = {
				vector: new this.PAPER.Point({
					angle: Math.random() * 360,
					length : (i / this.count) * Math.random() / 5
				})
			};
		}

	}

	/**
	 * ------------------------------------------------
	 * Frame updated
	 * ------------------------------------------------
	 */
	update(event){
		// Frame updates will be added here
		this.position = this.position.add((this.mousePos.subtract(this.position)).divide(10));
		var vector = (this.PAPER.view.center.subtract(this.position)).divide(10);
		this.moveStars(vector.multiply(3));
	}

	/**
	 * ------------------------------------------------
	 * mouse and keypad interactions
	 * ------------------------------------------------
	 */
	mouseMoved(event){
		this.mousePos = event.point;
	}

	keyDown(event){
		if (event.key == 'space')
				this.PAPER.project.activeLayer.selected = !this.PAPER.project.activeLayer.selected;
	}


	/*
	 * ------------------------------------------------
	 * Move Stars
	 * ------------------------------------------------
	*/
	moveStars(sPos) {
		var vector = sPos;
		// Run through the active layer's children list and change
		// the position of the placed symbols:
		var layer = this.PAPER.project.activeLayer;
		for (var i = 0; i < this.count; i++) {
			var item = layer.children[i];
			var size = item.bounds.size;
			var length = vector.length / 10 * size.width / 10;
			item.position = item.position.add(vector.normalize(length).add(item.data.vector));
			keepInView(item);
		}


		function keepInView(item) {
			var position = item.position;
			var viewBounds = osmo.scroll.PAPER.view.bounds;
			if (position.isInside(viewBounds))
				return;
			var itemBounds = item.bounds;
			if (position.x > viewBounds.width + 5) {
				position.x = -item.bounds.width;
			}

			if (position.x < -itemBounds.width - 5) {
				position.x = viewBounds.width;
			}

			if (position.y > viewBounds.height + 5) {
				position.y = -itemBounds.height;
			}

			if (position.y < -itemBounds.height - 5) {
				position.y = viewBounds.height
			}
		}


	}

};