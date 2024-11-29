class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 2;
        this.health = 100;
        this.maxHealth = 100;
        this.detectionRange = 200;
    }
    
    update() {
        let d = dist(this.x, this.y, player.x, player.y);
        if (d < this.detectionRange) {
            let angle = atan2(player.y - this.y, player.x - this.x);
            this.x += cos(angle) * this.speed;
            this.y += sin(angle) * this.speed;
            
            if (d < 30) {
                player.health -= 0.5;
            }
        }
    }
    
    display() {
        push();
        fill(255, 0, 0);
        stroke(200, 0, 0);
        circle(this.x, this.y, this.size);
        
        // Health bar
        fill(255, 0, 0);
        noStroke();
        rect(this.x - 15, this.y - 20, 30 * (this.health/this.maxHealth), 5);
        pop();
    }
    
    damage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            enemies = enemies.filter(e => e !== this);
        }
    }
} 