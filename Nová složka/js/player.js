class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 5;
        this.health = 100;
        this.maxHealth = 100;
        this.facing = 0;
        this.inventory = {
            wood: 0,
            stone: 0,
            iron: 0
        };
        this.isMining = false;
        this.miningProgress = 0;
        this.miningSpeed = 0.01;
        this.targetResource = null;
    }
    
    update() {
        let dx = 0;
        let dy = 0;
        
        if (keyIsDown(87)) dy -= 1; // W
        if (keyIsDown(83)) dy += 1; // S
        if (keyIsDown(65)) dx -= 1; // A
        if (keyIsDown(68)) dx += 1; // D
        
        // Aktualizace směru
        if (dx !== 0 || dy !== 0) {
            this.facing = atan2(dy, dx);
        }
        
        this.x += dx * this.speed;
        this.y += dy * this.speed;
        
        // Těžba
        if (keyIsDown(69)) { // E
            this.mine();
        } else {
            this.isMining = false;
            this.miningProgress = 0;
            this.targetResource = null;
        }
        
        // Útok
        if (keyIsDown(32)) { // Mezerník
            this.attack();
        }
    }
    
    display() {
        push();
        translate(this.x, this.y);
        rotate(this.facing);
        
        // Tělo hráče
        fill(255, 200, 0);
        stroke(0);
        circle(0, 0, this.size);
        
        // Směrový indikátor
        stroke(0);
        line(0, 0, this.size/2, 0);
        
        pop();
        
        // Health bar
        fill(255, 0, 0);
        noStroke();
        rect(this.x - 15, this.y - 20, 30 * (this.health/this.maxHealth), 5);
        
        // Mining progress
        if (this.isMining) {
            fill(0, 255, 0);
            rect(this.x - 15, this.y - 25, 30 * this.miningProgress, 5);
        }
    }
    
    mine() {
        if (!this.targetResource) {
            let closestResource = null;
            let closestDist = 50;
            
            for (let resource of resources) {
                let d = dist(this.x, this.y, resource.x, resource.y);
                let angle = atan2(resource.y - this.y, resource.x - this.x);
                let angleDiff = abs(this.facing - angle);
                
                if (d < closestDist && angleDiff < PI/2) {
                    closestDist = d;
                    closestResource = resource;
                }
            }
            
            if (closestResource) {
                this.targetResource = closestResource;
                this.isMining = true;
            }
        }
        
        if (this.targetResource) {
            this.miningProgress += this.miningSpeed;
            
            if (this.miningProgress >= 1) {
                this.inventory[this.targetResource.type]++;
                resources = resources.filter(r => r !== this.targetResource);
                this.miningProgress = 0;
                this.targetResource = null;
            }
        }
    }
    
    attack() {
        let attackRange = 50;
        
        push();
        stroke(255, 255, 0);
        noFill();
        arc(this.x, this.y, attackRange * 2, attackRange * 2,
            this.facing - PI/4, this.facing + PI/4);
        pop();
        
        enemies.forEach(enemy => {
            let d = dist(this.x, this.y, enemy.x, enemy.y);
            if (d < attackRange) {
                let angle = atan2(enemy.y - this.y, enemy.x - this.x);
                let angleDiff = abs(angle - this.facing);
                if (angleDiff < PI/4 || angleDiff > TWO_PI - PI/4) {
                    enemy.damage(20);
                }
            }
        });
    }
} 