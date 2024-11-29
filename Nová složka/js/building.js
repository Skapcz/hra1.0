class Building {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.storage = {
            input: [],
            output: []
        };
        this.progress = 0;
        this.maxProgress = 100;
        this.active = true;
        
        // Specifické vlastnosti podle typu budovy
        switch(type) {
            case 'miner':
                this.productionTime = 120;
                this.range = 2;
                break;
            case 'furnace':
                this.productionTime = 180;
                this.recipe = {
                    input: { iron: 1 },
                    output: { ironPlate: 1 }
                };
                break;
            case 'factory':
                this.productionTime = 240;
                this.recipe = {
                    input: { ironPlate: 2 },
                    output: { circuits: 1 }
                };
                break;
            case 'storage':
                this.capacity = 100;
                break;
            case 'house':
                this.residents = 0;
                this.maxResidents = 4;
                break;
        }
    }
    
    update() {
        if (!this.active) return;

        switch(this.type) {
            case 'miner':
                this.updateMiner();
                break;
            case 'furnace':
                this.updateFurnace();
                break;
            case 'factory':
                this.updateFactory();
                break;
            case 'storage':
                this.updateStorage();
                break;
            case 'house':
                this.updateHouse();
                break;
        }
    }

    updateMiner() {
        if (frameCount % this.productionTime === 0) {
            let nearbyResource = this.findNearbyResource();
            if (nearbyResource) {
                this.storage.output.push(nearbyResource.type);
            }
        }
    }

    updateFurnace() {
        if (this.hasRequiredResources() && this.progress < this.maxProgress) {
            this.progress++;
            if (this.progress >= this.maxProgress) {
                this.produceOutput();
                this.progress = 0;
            }
        }
    }

    display() {
        push();
        strokeWeight(2);
        switch(this.type) {
            case 'miner':
                fill(100, 100, 150);
                rect(this.x, this.y, tileSize, tileSize);
                // Zobrazení vrtáku
                fill(70);
                circle(this.x + tileSize/2, this.y + tileSize/2, tileSize/2);
                break;
            case 'furnace':
                fill(200, 100, 100);
                rect(this.x, this.y, tileSize, tileSize);
                // Zobrazení ohně
                if (this.progress > 0) {
                    fill(255, 100, 0);
                    triangle(
                        this.x + tileSize/4, this.y + tileSize,
                        this.x + tileSize/2, this.y + tileSize/2,
                        this.x + tileSize*3/4, this.y + tileSize
                    );
                }
                break;
            case 'factory':
                fill(150, 150, 150);
                rect(this.x, this.y, tileSize, tileSize);
                // Zobrazení ozubených kol
                fill(100);
                circle(this.x + tileSize/3, this.y + tileSize/3, tileSize/3);
                circle(this.x + tileSize*2/3, this.y + tileSize*2/3, tileSize/3);
                break;
            case 'storage':
                fill(139, 69, 19);
                rect(this.x, this.y, tileSize, tileSize);
                // Zobrazení dveří
                fill(101, 67, 33);
                rect(this.x + tileSize/3, this.y + tileSize/4, tileSize/3, tileSize*3/4);
                break;
            case 'house':
                fill(200, 200, 250);
                rect(this.x, this.y, tileSize, tileSize);
                // Zobrazení střechy
                fill(150, 75, 75);
                triangle(
                    this.x, this.y,
                    this.x + tileSize/2, this.y - tileSize/2,
                    this.x + tileSize, this.y
                );
                break;
        }
        
        // Zobrazení progress baru
        if (this.progress > 0) {
            fill(0, 255, 0);
            rect(this.x, this.y - 5, (this.progress/this.maxProgress) * tileSize, 3);
        }
        pop();
    }

    hasRequiredResources() {
        if (!this.recipe) return false;
        return Object.entries(this.recipe.input).every(([resource, amount]) =>
            this.storage.input.filter(r => r === resource).length >= amount
        );
    }

    produceOutput() {
        if (this.recipe) {
            // Odebrat vstupní suroviny
            Object.entries(this.recipe.input).forEach(([resource, amount]) => {
                for (let i = 0; i < amount; i++) {
                    let index = this.storage.input.indexOf(resource);
                    if (index !== -1) {
                        this.storage.input.splice(index, 1);
                    }
                }
            });

            // Přidat výstupní produkty
            Object.entries(this.recipe.output).forEach(([resource, amount]) => {
                for (let i = 0; i < amount; i++) {
                    this.storage.output.push(resource);
                }
            });
        }
    }

    findNearbyResource() {
        return resources.find(resource => 
            dist(this.x + tileSize/2, this.y + tileSize/2, resource.x, resource.y) < this.range * tileSize
        );
    }
} 