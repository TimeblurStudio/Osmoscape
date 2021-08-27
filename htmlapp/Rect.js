Rect = function(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.contains = function(point){
        //console.log(this.x+", "+this.y+", "+this.width+", "+this.height+", "+point.x+", "+point.y);
        if((point.x>this.x && point.x<this.x+this.width) && (point.y>this.y && point.y<this.y+this.height))
            return true;
        return false;
    }
}