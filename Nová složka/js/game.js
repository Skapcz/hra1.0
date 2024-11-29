let player;
let resources = [];
let buildings = [];
let enemies = [];
let tileSize = 32;
let cameraX = 0;
let cameraY = 0;
let worldSize = 5000;

function setup() {
    createCanvas(800, 600);
    player = new Player(worldSize/2, worldSize/2);
    
    // Generování zdrojů
    for (let i = 0; i < 100; i++) {
        let validPosition = false;
        let x, y;
        
        while (!validPosition) {
            x = random(worldSize);
            y = random(worldSize);
            validPosition = true;
            
            // Kontrola vzdálenosti od ostatních zdrojů
            for (let resource of resources) {
                if (dist(x, y, resource.x, resource.y) < tileSize * 2) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        resources.push(new Resource(x, y, random(['wood', 'stone', 'iron'])));
    }
    
    // Generování nepřátel
    for (let i = 0; i < 20; i++) {
        enemies.push(new Enemy(random(worldSize), random(worldSize)));
    }
}

function draw() {
    background(50);
    
    // Aktualizace kamery
    cameraX = width/2 - player.x;
    cameraY = height/2 - player.y;
    
    push();
    translate(cameraX, cameraY);
    
    // Vykreslení mřížky pro stavění
    drawGrid();
    
    // Vykreslení herních prvků
    resources.forEach(resource => {
        if (isOnScreen(resource.x, resource.y)) {
            resource.display();
        }
    });
    
    buildings.forEach(building => {
        if (isOnScreen(building.x, building.y)) {
            if (building.update) building.update();
            building.display();
        }
    });
    
    enemies.forEach(enemy => {
        if (isOnScreen(enemy.x, enemy.y)) {
            enemy.update();
            enemy.display();
        }
    });
    
    // Náhled stavby
    if (player.selectedBuilding && !player.isDead) {
        let gridX = floor((mouseX - cameraX) / tileSize) * tileSize;
        let gridY = floor((mouseY - cameraY) / tileSize) * tileSize;
        
        push();
        noFill();
        stroke(255, 255, 255, 100);
        rect(gridX, gridY, tileSize, tileSize);
        
        // Zobrazení dosahu pro střílnu
        if (player.selectedBuilding === 'turret') {
            stroke(255, 255, 0, 50);
            circle(gridX + tileSize/2, gridY + tileSize/2, 400);
        }
        pop();
    }
    
    player.update();
    player.display();
    
    pop();
    
    // UI
    drawUI();
}

function drawGrid() {
    stroke(70);
    strokeWeight(1);
    
    let startX = floor((player.x - width/2) / tileSize) * tileSize;
    let endX = ceil((player.x + width/2) / tileSize) * tileSize;
    let startY = floor((player.y - height/2) / tileSize) * tileSize;
    let endY = ceil((player.y + height/2) / tileSize) * tileSize;
    
    for (let x = startX; x <= endX; x += tileSize) {
        line(x, startY, x, endY);
    }
    for (let y = startY; y <= endY; y += tileSize) {
        line(startX, y, endX, y);
    }
}

function drawUI() {
    // Inventář
    fill(0, 0, 0, 150);
    noStroke();
    rect(10, 10, 150, 100);
    
    fill(255);
    textSize(16);
    text(`Dřevo: ${player.inventory.wood}`, 20, 35);
    text(`Kámen: ${player.inventory.stone}`, 20, 60);
    text(`Železo: ${player.inventory.iron}`, 20, 85);
    
    // Nápověda
    fill(255);
    textSize(12);
    text('WASD - pohyb', 10, height - 60);
    text('B - stavební menu', 10, height - 45);
    text('E - těžba', 10, height - 30);
    text('Mezerník - útok', 10, height - 15);
}

function isOnScreen(x, y) {
    return x > player.x - width/2 - tileSize && 
           x < player.x + width/2 + tileSize && 
           y > player.y - height/2 - tileSize && 
           y < player.y + height/2 + tileSize;
}

function mousePressed() {
    if (mouseButton === RIGHT && player.selectedBuilding) {
        player.build();
    }
}

function keyPressed() {
    if (key === 'b' || key === 'B') {
        player.showBuildMenu = !player.showBuildMenu;
    }
} 