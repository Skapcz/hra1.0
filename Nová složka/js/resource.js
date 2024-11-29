class Resource {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = tileSize * 0.8;
    }
    
    display() {
        push();
        switch(this.type) {
            case 'stone':
                fill(120, 120, 120);
                stroke(80, 80, 80);
                rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
                break;
            case 'wood':
                fill(139, 69, 19);
                stroke(101, 67, 33);
                rect(this.x - this.size/4, this.y - this.size/2, this.size/2, this.size);
                fill(34, 139, 34);
                circle(this.x, this.y - this.size/2, this.size);
                break;
            case 'iron':
                fill(169, 169, 169);
                stroke(105, 105, 105);
                rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
                stroke(165, 42, 42);
                line(this.x - this.size/3, this.y, this.x + this.size/3, this.y);
                line(this.x, this.y - this.size/3, this.x, this.y + this.size/3);
                break;
        }
        pop();
    }
} 