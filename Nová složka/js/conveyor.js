class Conveyor {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.items = [];
    }
    
    update() {
        // Pohyb předmětů na pásu
        this.items.forEach(item => {
            switch(this.direction) {
                case 'right':
                    item.x += 1;
                    break;
                case 'left':
                    item.x -= 1;
                    break;
                case 'up':
                    item.y -= 1;
                    break;
                case 'down':
                    item.y += 1;
                    break;
            }
        });
    }
    
    display() {
        fill(100);
        stroke(0);
        rect(this.x, this.y, tileSize, tileSize);
        
        // Vykreslení směru pásu
        fill(150);
        let arrowSize = tileSize / 2;
        triangle(
            this.x + tileSize/2, this.y + tileSize/4,
            this.x + tileSize/4, this.y + tileSize*3/4,
            this.x + tileSize*3/4, this.y + tileSize*3/4
        );
    }
} 