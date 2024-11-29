class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 2;
        this.detectionRange = 200;
        this.health = 100;
    }
    
    update() {
        // Pohyb směrem k hráči, když je v dosahu
        let d = dist(this.x, this.y, player.x, player.y);
        if (d < this.detectionRange) {
            let angle = atan2(player.y - this.y, player.x - this.x);
            this.x += cos(angle) * this.speed;
            this.y += sin(angle) * this.speed;
            
            // Kontrola kolize s hráčem
            if (checkCollision(this, player)) {
                player.damage(1);
            }
        } else {
            // Náhodný pohyb
            this.x += random(-1, 1) * this.speed/2;
            this.y += random(-1, 1) * this.speed/2;
        }
    }
    
    display() {
        push();
        fill(255, 0, 0);
        stroke(200, 0, 0);
        circle(this.x, this.y, this.size);
        
        // Zdraví nepřítele
        fill(255, 0, 0);
        rect(this.x - 15, this.y - 20, 30 * (this.health/100), 5);
        pop();
    }
    
    damage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            enemies = enemies.filter(e => e !== this);
        }
    }
} 