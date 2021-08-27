class Icon{

    constructor(rect, icon, scroll){
        this.rect = rect;
        this.icon = icon;
        this.scroll = scroll;
    }

    render(){
        image(this.icon, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }

    mousePressed(){
        var contains = this.rect.contains(new Point(mouseX/4, mouseY/4))
        if(contains){
            window.scrollTo({left:this.scroll.x, top:this.scroll.y, behavior:'smooth'});
        }
        return contains;
    }
}