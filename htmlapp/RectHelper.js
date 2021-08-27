class RectHelper{
    constructor(){
        this.start = new Point(0,0);
        this.end = new Point(0,0);
    }
    draw(){
        pg.rect(this.start.x,this.start.y,this.end.x-this.start.x,this.end.y-this.start.y); 
        pg.textSize(18);
        pg.text("("+this.start.x+","+this.start.y+")", this.start.x,this.start.y-10);
        pg.text("("+this.end.x+","+this.end.y+")", this.end.x+10,this.end.y+10);
    }
    mousePressed(){
        this.end.X = this.start.x = window.pageXOffset+mouseX;
        this.end.y = this.start.y = window.pageYOffset+mouseY;
    }

    mouseDragged(){
        this.end.x = window.pageXOffset+mouseX;
        this.end.y = window.pageYOffset+mouseY;
    }
}