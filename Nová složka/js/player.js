class Player {
    constructor(x, y) {
        this.respawn(x, y);
    }

    respawn(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 5;
        this.health = 100;
        this.maxHealth = 100;
        this.armor = 5;
        this.facing = 0;
        this.isBlocking = false;
        this.inventory = {
            wood: 0,
            stone: 0,
            iron: 0
        };
        
        this.currentWeapon = 'sword';
        this.weapons = {
            sword: {
                damage: 20,
                range: 50,
                cooldown: 20,
                currentCooldown: 0
            },
            bow: {
                damage: 15,
                range: 200,
                cooldown: 30,
                currentCooldown: 0,
                projectiles: []
            },
            spear: {
                damage: 30,
                range: 80,
                cooldown: 40,
                currentCooldown: 0
            }
        };
        
        this.isMining = false;
        this.miningProgress = 0;
        this.miningSpeed = 0.01;
        this.targetResource = null;
        this.isDead = false;
        
        this.buildInventory = {
            wall: { count: 0, cost: { stone: 5 } },
            turret: { count: 0, cost: { iron: 10, stone: 5 } },
            chest: { count: 0, cost: { wood: 10 } }
        };
        
        this.selectedBuilding = null;
    }
    
    update() {
        if (this.isDead) {
            push();
            fill(0, 0, 0, 150);
            rect(0, 0, width, height);
            textSize(32);
            fill(255, 0, 0);
            textAlign(CENTER);
            text('GAME OVER', width/2, height/2);
            textSize(20);
            fill(255);
            text('Stiskni R pro respawn', width/2, height/2 + 40);
            pop();
            
            if (keyIsDown(82)) {
                this.respawn(width/2, height/2);
            }
            return;
        }

        let dx = 0;
        let dy = 0;
        
        if (keyIsDown(87)) dy -= 1; // W
        if (keyIsDown(83)) dy += 1; // S
        if (keyIsDown(65)) dx -= 1; // A
        if (keyIsDown(68)) dx += 1; // D
        
        if (dx !== 0 || dy !== 0) {
            this.facing = atan2(dy, dx);
        }
        
        let newX = this.x + dx * this.speed;
        let newY = this.y + dy * this.speed;
        
        let canMove = true;
        let newPos = { x: newX, y: newY, size: this.size };
        
        for (let resource of resources) {
            if (checkCollision(newPos, resource)) {
                canMove = false;
                break;
            }
        }
        
        if (canMove) {
            this.x = newX;
            this.y = newY;
        }
        
        Object.values(this.weapons).forEach(weapon => {
            if (weapon.currentCooldown > 0) weapon.currentCooldown--;
        });
        
        if (keyIsDown(32) && this.weapons[this.currentWeapon].currentCooldown <= 0) {
            this.attack();
        }
        
        if (keyIsDown(69)) {
            this.mine();
        } else {
            this.isMining = false;
            this.miningProgress = 0;
            this.targetResource = null;
        }
        
        if (keyIsDown(49)) this.currentWeapon = 'sword';
        if (keyIsDown(50)) this.currentWeapon = 'bow';
        if (keyIsDown(51)) this.currentWeapon = 'spear';
        
        if (keyIsDown(66)) {
            this.showBuildMenu = true;
        }
        
        if (this.showBuildMenu) {
            if (keyIsDown(52)) this.selectedBuilding = 'wall';
            if (keyIsDown(53)) this.selectedBuilding = 'turret';
            if (keyIsDown(54)) this.selectedBuilding = 'chest';
        }
        
        if (mouseIsPressed && mouseButton === RIGHT && this.selectedBuilding) {
            this.build();
        }
    }
    
    attack() {
        let weapon = this.weapons[this.currentWeapon];
        weapon.currentCooldown = weapon.cooldown;
        
        switch(this.currentWeapon) {
            case 'sword':
                this.swordAttack();
                break;
            case 'bow':
                this.bowAttack();
                break;
            case 'spear':
                this.spearAttack();
                break;
        }
    }
    
    swordAttack() {
        push();
        stroke(255, 255, 0);
        strokeWeight(2);
        noFill();
        
        arc(this.x, this.y, 
            this.weapons.sword.range * 2, 
            this.weapons.sword.range * 2,
            this.facing - PI/4, 
            this.facing + PI/4);
        pop();
        
        enemies.forEach(enemy => {
            if (dist(this.x, this.y, enemy.x, enemy.y) < this.weapons.sword.range) {
                let enemyAngle = atan2(enemy.y - this.y, enemy.x - this.x);
                let angleDiff = abs(enemyAngle - this.facing);
                if (angleDiff < PI/4 || angleDiff > TWO_PI - PI/4) {
                    enemy.damage(this.weapons.sword.damage);
                }
            }
        });
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
    
    damage(amount) {
        let actualDamage = Math.max(1, amount - this.armor);
        this.health -= actualDamage;
        
        if (this.health <= 0 && !this.isDead) {
            this.isDead = true;
            this.health = 0;
        }
    }
    
    display() {
        if (this.isDead) return;

        push();
        translate(this.x, this.y);
        rotate(this.facing);
        
        fill(255, 200, 0);
        stroke(0);
        circle(0, 0, this.size);
        
        stroke(0);
        line(0, 0, this.size/2, 0);
        
        pop();
        
        push();
        fill(100, 0, 0);
        rect(this.x - 15, this.y - 25, 30, 5);
        fill(255, 0, 0);
        rect(this.x - 15, this.y - 25, 30 * (this.health/this.maxHealth), 5);
        
        if (this.isMining) {
            fill(0, 255, 0);
            rect(this.x - 15, this.y - 30, 30 * this.miningProgress, 5);
        }
        
        textSize(12);
        fill(255);
        text(`${this.currentWeapon} | Armor: ${this.armor}`, this.x - 30, this.y - 35);
        pop();
        
        if (this.showBuildMenu) {
            push();
            fill(0, 0, 0, 150);
            rect(10, height - 100, 200, 90);
            textSize(12);
            fill(255);
            text('Stavební Menu (B)', 20, height - 85);
            text('4 - Zeď (5 kamene)', 20, height - 70);
            text('5 - Střílna (10 železa, 5 kamene)', 20, height - 55);
            text('6 - Truhla (10 dřeva)', 20, height - 40);
            
            if (this.selectedBuilding) {
                text('Vybraná stavba: ' + this.selectedBuilding, 20, height - 20);
            }
            pop();
        }
    }
    
    bowAttack() {
        // Střelba lukem ve směru pohybu
        let projectile = new Projectile(
            this.x,
            this.y,
            this.facing,
            this.weapons.bow.damage
        );
        this.weapons.bow.projectiles.push(projectile);
    }
    
    spearAttack() {
        // Bodnutí kopím ve směru pohybu
        push();
        stroke(200, 200, 200);
        strokeWeight(4);
        let spearX = this.x + cos(this.facing) * this.weapons.spear.range;
        let spearY = this.y + sin(this.facing) * this.weapons.spear.range;
        line(this.x, this.y, spearX, spearY);
        pop();
        
        enemies.forEach(enemy => {
            if (dist(this.x, this.y, enemy.x, enemy.y) < this.weapons.spear.range) {
                let enemyAngle = atan2(enemy.y - this.y, enemy.x - this.x);
                let angleDiff = abs(enemyAngle - this.facing);
                if (angleDiff < PI/8 || angleDiff > TWO_PI - PI/8) {
                    enemy.damage(this.weapons.spear.damage);
                }
            }
        });
    }
    
    build() {
        let building = this.buildInventory[this.selectedBuilding];
        if (this.canAffordBuilding(this.selectedBuilding)) {
            let gridX = floor((mouseX - cameraX) / tileSize) * tileSize;
            let gridY = floor((mouseY - cameraY) / tileSize) * tileSize;
            
            let canBuild = true;
            for (let building of buildings) {
                if (dist(gridX, gridY, building.x, building.y) < tileSize) {
                    canBuild = false;
                    break;
                }
            }
            
            if (canBuild) {
                for (let [resource, amount] of Object.entries(building.cost)) {
                    this.inventory[resource] -= amount;
                }
                
                switch(this.selectedBuilding) {
                    case 'wall':
                        buildings.push(new Wall(gridX, gridY));
                        break;
                    case 'turret':
                        buildings.push(new Turret(gridX, gridY));
                        break;
                    case 'chest':
                        buildings.push(new Chest(gridX, gridY));
                        break;
                }
            }
        }
    }
    
    canAffordBuilding(type) {
        let building = this.buildInventory[type];
        return Object.entries(building.cost).every(([resource, amount]) => 
            this.inventory[resource] >= amount
        );
    }
}

class Projectile {
    constructor(x, y, angle, damage) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 10;
        this.damage = damage;
        this.active = true;
        this.range = 400;
        this.distanceTraveled = 0;
    }
    
    update() {
        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;
        this.distanceTraveled += this.speed;
        
        // Kontrola zásahu nepřátel
        enemies.forEach(enemy => {
            if (dist(this.x, this.y, enemy.x, enemy.y) < enemy.size/2) {
                enemy.damage(this.damage);
                this.active = false;
            }
        });
        
        // Deaktivace šípu po překročení maximálního dosahu
        if (this.distanceTraveled > this.range) {
            this.active = false;
        }
    }
    
    display() {
        push();
        translate(this.x, this.y);
        rotate(this.angle);
        
        // Vykreslení šípu
        stroke(200);
        strokeWeight(2);
        line(-10, 0, 10, 0);
        // Špička šípu
        fill(200);
        triangle(10, 0, 5, -3, 5, 3);
        pop();
    }
}

class Wall {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 100;
        this.maxHealth = 100;
    }
    
    display() {
        push();
        fill(100);
        stroke(80);
        rect(this.x, this.y, tileSize, tileSize);
        
        // Health bar
        fill(255, 0, 0);
        noStroke();
        rect(this.x, this.y - 5, tileSize * (this.health/this.maxHealth), 3);
        pop();
    }
}

class Turret {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 150;
        this.maxHealth = 150;
        this.range = 200;
        this.damage = 10;
        this.cooldown = 60;
        this.currentCooldown = 0;
    }
    
    update() {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
            return;
        }
        
        // Hledání nejbližšího nepřítele
        let closestEnemy = null;
        let closestDist = this.range;
        
        for (let enemy of enemies) {
            let d = dist(this.x + tileSize/2, this.y + tileSize/2, enemy.x, enemy.y);
            if (d < closestDist) {
                closestDist = d;
                closestEnemy = enemy;
            }
        }
        
        // Střelba na nepřítele
        if (closestEnemy) {
            closestEnemy.damage(this.damage);
            this.currentCooldown = this.cooldown;
            
            // Vizuální efekt střelby
            push();
            stroke(255, 255, 0);
            line(this.x + tileSize/2, this.y + tileSize/2, 
                 closestEnemy.x, closestEnemy.y);
            pop();
        }
    }
    
    display() {
        push();
        fill(150);
        stroke(100);
        rect(this.x, this.y, tileSize, tileSize);
        
        // Hlaveň
        fill(100);
        circle(this.x + tileSize/2, this.y + tileSize/2, tileSize/2);
        
        // Health bar
        fill(255, 0, 0);
        noStroke();
        rect(this.x, this.y - 5, tileSize * (this.health/this.maxHealth), 3);
        
        // Range indikátor při najetí myší
        if (dist(mouseX - cameraX, mouseY - cameraY, this.x, this.y) < tileSize) {
            noFill();
            stroke(255, 255, 0, 50);
            circle(this.x + tileSize/2, this.y + tileSize/2, this.range * 2);
        }
        pop();
    }
}

class Chest {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 50;
        this.maxHealth = 50;
        this.storage = [];
    }
    
    display() {
        push();
        fill(139, 69, 19);
        stroke(101, 67, 33);
        rect(this.x, this.y, tileSize, tileSize);
        
        // Zámek
        fill(200, 200, 0);
        rect(this.x + tileSize/2 - 5, this.y + tileSize/3, 10, 10);
        
        // Health bar
        fill(255, 0, 0);
        noStroke();
        rect(this.x, this.y - 5, tileSize * (this.health/this.maxHealth), 3);
        pop();
    }
} 