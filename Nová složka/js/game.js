let player;
let resources = [];
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
        resources.push(new Resource(
            random(worldSize),
            random(worldSize),
            random(['wood', 'stone', 'iron'])
        ));
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
    
    // Vykreslení herních prvků
    resources.forEach(resource => {
        if (isOnScreen(resource.x, resource.y)) {
            resource.display();
        }
    });
    
    enemies.forEach(enemy => {
        if (isOnScreen(enemy.x, enemy.y)) {
            enemy.update();
            enemy.display();
        }
    });
    
    player.update();
    player.display();
    
    pop();
    
    // UI
    drawUI();
}

function drawUI() {
    fill(0, 0, 0, 150);
    noStroke();
    rect(10, 10, 150, 100);
    
    fill(255);
    textSize(16);
    text(`Dřevo: ${player.inventory.wood}`, 20, 35);
    text(`Kámen: ${player.inventory.stone}`, 20, 60);
    text(`Železo: ${player.inventory.iron}`, 20, 85);
}

function isOnScreen(x, y) {
    return x > player.x - width/2 - tileSize && 
           x < player.x + width/2 + tileSize && 
           y > player.y - height/2 - tileSize && 
           y < player.y + height/2 + tileSize;
} 