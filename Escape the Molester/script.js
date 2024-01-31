
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const clipDisplay = document.querySelector("#clip");
const clipCount = document.querySelector("#clipCount");
const jail = document.getElementById("jail");
const endGame = document.getElementById("endGame");
const playerCSS = document.getElementById("player");
const timer = document.getElementById("timer");
const timerCount = document.getElementById("timerCount");
const winScreen = document.getElementById("winScreen");
const startInstructions = document.getElementById("startInstructions");
const jailBars = document.querySelector(".jailBar");
const backgroundMusic = document.getElementById("backgroundMusic");
const outline = document.getElementById("outline");
const escape = document.getElementById("escape");
const legend = document.getElementById("legend");
const hideLegend = document.getElementById("hideLegend");
const colorLegend = document.getElementById("colorLegend");
const showLegend = document.getElementById("showLegend");
const myRecord = document.getElementById("myRecord");
const introScreen = document.getElementById("introScreen");
const startGameBattle = document.getElementById("battle");
const startGameSurvival = document.getElementById("survival");
const startGameInvisibleMolester = document.getElementById("invisibleMolester");

// original molester image https://t4.ftcdn.net/jpg/02/04/69/05/360_F_204690549_UsqU23WU9hck1w5Zn46x1mFtIKuMnIP7.jpg

const bulletDirection = {x: 0, y: 0}
const game = {running: true, mode: ["survival", "battle", "invisibleMonster"]}

startGameBattle.onclick = function() {
    introScreen.style.display = "none"
    game.mode = "battle"
}
startGameSurvival.onclick = function() {
    introScreen.style.display = "none"
    game.mode = "survival"
}

canvas.width = innerWidth;
canvas.height = innerHeight;
legend.style.display = "flex";

backgroundMusic.currentTime = 10.8
backgroundMusic.volume = 0.3

timerCount.innerText = 0

let survivalTime = 0;

let playerCSSx = 35
let playerCSSy = 35
playerCSS.style.left = playerCSSx + "px";
playerCSS.style.top = playerCSSy + "px";

let monstaHealth = 250;
const monstaHealthPixelWidth = innerWidth / monstaHealth / 2;
let boost = 100;
const boostPixelWidth = innerWidth / boost / 2;

let monstaMove = false;
let motionAllowed = true;
let lastBulletTime = 0;

const clip = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const floors = [];
const bullets = [];

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    },
    h: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    },
    ArrowDown: {
        pressed: false
    },
    " ": {
        pressed: false
     }
}

const monstaVelocity = {
    x: 0,
    y: 0
}

class Player {
    static radius = 25
    static speed = 5
    static fillStyle = "hsl(140, 90%, 40%)"
    static skip = 97 + Player.radius * 2
    static sprint = 5
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = Player.radius;
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, Player.radius, 0, 2 * Math.PI)
        c.fillStyle = Player.fillStyle
        c.fill()
        c.closePath()
    }
    update() {
        if (motionAllowed == true) {
        this.draw()
        movePlayer()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        }
    } 
}

class Monsta {
    static radius = 40
    static speed = 1
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = Monsta.radius
        }
    draw() {
        this.image = new Image()
        this.image.src = "images/yup.jpg";
        c.beginPath()
        c.arc(this.position.x, this.position.y, Monsta.radius, 0, 2 * Math.PI)
        c.fillStyle = this.image.src
        c.fill()
        c.closePath()
        c.drawImage(this.image, this.position.x - Monsta.radius - 3, this.position.y - Monsta.radius - 3, 2.3 * Monsta.radius, 2.3 * Monsta.radius)
    }
    update() {
        if (motionAllowed == true) {
        this.draw()
        setMonstaVelocity()
        this.position.x += monstaVelocity.x
        this.position.y += monstaVelocity.y
        }
    } 
}

const monsta = new Monsta({
    position: {
        x: innerWidth - 1.5 * Monsta.radius,
        y: innerHeight / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
})

function setMonstaVelocity() {
    if (player.position.x > monsta.position.x) {
        monstaVelocity.x = Monsta.speed
    } else if (player.position.x < monsta.position.x) {
        monstaVelocity.x = -Monsta.speed
    } else {
        monstaVelocity.x = 0
    }
    if (player.position.y > monsta.position.y) {
        monstaVelocity.y = Monsta.speed
    } else if (player.position.y < monsta.position.y) {
        monstaVelocity.y = -Monsta.speed
    } else {
        monstaVelocity.y = 0
    }
}

const player = new Player({
    position: {
        x: 60,
        y: 60,
    },
    velocity: {
        x: 0,
        y: 0
    }
})

class Floor {
    static width = 60
    constructor({position}) {
        this.position = position
        this.width = Floor.width
        this.height = Floor.width
    }
    draw() {
        c.beginPath()
        c.fillStyle = "hsl(270, 100%, 15%)"
        c.strokeStyle = "hsl(270, 100%, 60%)"
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.strokeRect(this.position.x, this.position.y, this.width, this.height)
        c.closePath()
    }
    update() {
        this.draw()
    }
}

class Bullet {
    static speed = 15
    static radius = 10
    static damage = 1
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = Bullet.radius
        this.hit = false
        this.timeStamp = Date.now()
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, Bullet.radius, 0, Math.PI * 2)
        c.fillStyle = "hsl(140, 100%, 85%)"
        c.fill()
        c.closePath()
    }
    update() {
        if (motionAllowed && !this.hit) {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if (this.position.x + this.radius >= monsta.position.x - monsta.radius &&
            this.position.x - this.radius <= monsta.position.x + monsta.radius &&
            this.position.y + this.radius >= monsta.position.y - monsta.radius &&
            this.position.y - this.radius <= monsta.position.y + monsta.radius)
            {
                this.hit = true;
                if (game.mode != "survival") {
                    monstaHealth -= Bullet.damage;
                }
            }
        }
    }
}

function setBulletDirection() {
    bulletDirection.x = 0
    bulletDirection.y = 0
    if (keys.ArrowUp.pressed && !keys.ArrowDown.pressed) {
        bulletDirection.y = -Bullet.speed
    } else if (keys.ArrowDown.pressed) {
        bulletDirection.y = Bullet.speed
    }
    if (keys.ArrowLeft.pressed && !keys.ArrowRight.pressed) {
        bulletDirection.x = -Bullet.speed
    } else if (keys.ArrowRight.pressed) {
        bulletDirection.x = Bullet.speed
    }
}

const bullet = new Bullet({
    position: {
        x: player.position.x,
        y: player.position.y
    },
    velocity: {
        x: bulletDirection.x,
        y: bulletDirection.y
    }
})

const floor = new Floor({
    position: {
        x: 0,
        y: 0
    }
})

const floorMap = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    
]

function handleLegend() {
        if (legend.style.display == "flex") {
            legend.style.display = "none"
            colorLegend.style.display = "none"
            hideLegend.style.display = "none"
            showLegend.style.display = "flex"
        } else {
            legend.style.display = "flex"
            colorLegend.style.display = "flex"
            hideLegend.style.display = "flex"
            showLegend.style.display = "none"
        }
    }

addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = true;
            break;
        case "a":
            keys.a.pressed = true;
            break;
        case "s":
            keys.s.pressed = true;
            break;
        case "d":
            keys.d.pressed = true;
            break;
        case "r":
            if (clip.length <= 42) {
                clip.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            }
            break;
        case "g":
            Player.fillStyle = "hsl(140, 90%, 40%)"
            playerCSS.style.background = "hsl(140, 90%, 40%)"
            break;
        case "b":
            Player.fillStyle = "hsl(240, 90%, 60%)"
            playerCSS.style.background = "hsl(240, 90%, 60%)"
            break;
        case "k":
            Player.fillStyle = "hsl(30, 90%, 40%)"
            playerCSS.style.background = "hsl(30, 90%, 40%)"
            break;
        case "n":
            Player.fillStyle = "hsl(60, 90%, 40%)"
            playerCSS.style.background = "hsl(60, 90%, 40%)"
            break;
        case "j":
            Player.fillStyle = "hsl(0, 90%, 40%)"
            playerCSS.style.background = "hsl(0, 90%, 40%)"
            break;
        case "m":
            Player.fillStyle = "hsl(160, 90%, 40%)"
            playerCSS.style.background = "hsl(160, 90%, 40%)"
            break;
        case "h":
            handleLegend()
            break;
        case "ArrowRight":
            keys.ArrowRight.pressed = true
            if (Date.now() - lastBulletTime > 100) {
            createNewBullet()
            }
            break;
        case "ArrowLeft":
            keys.ArrowLeft.pressed = true
            if (Date.now() - lastBulletTime > 100) {
            createNewBullet()
            }
            break;
        case "ArrowUp":
            keys.ArrowUp.pressed = true
            if (Date.now() - lastBulletTime > 100) {
            createNewBullet()
            }
            break;
        case "ArrowDown":
            keys.ArrowDown.pressed = true
            if (Date.now() - lastBulletTime > 100) {
            createNewBullet()
            }
            break;
        case "0":
            location.reload()
            break;
        case " ":
            keys[" "].pressed = true;
            break;
    }
})

//BOOST CONSUMPTION

setInterval(function() {
    if (motionAllowed && keys[" "].pressed && boost > 0) {
        if ( keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
            boost -= 2;
        }
    }
}, 1000 * 0.01)


function createNewBullet() {
    setBulletDirection()
    if (clip.length > 0) {
        bullets.push(
            new Bullet({
                position: {
                    x: player.position.x,
                    y: player.position.y
                },
                velocity: {
                    x: bulletDirection.x,
                    y: bulletDirection.y
                }
            })
        )
        lastBulletTime = Date.now()
        if (bullets.length > 100) {
            bullets.shift()
        }
    }
    clip.shift()
}

addEventListener("keyup", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = false;
            break;
        case "a":
            keys.a.pressed = false;
            break;
        case "s":
            keys.s.pressed = false;
            break;
        case "d":
            keys.d.pressed = false;
            break;
        case "ArrowRight":
            keys.ArrowRight.pressed = false;
            break;
        case "ArrowLeft":
            keys.ArrowLeft.pressed = false;
            break;
        case "ArrowUp":
            keys.ArrowUp.pressed = false;
            break;
        case "ArrowDown":
            keys.ArrowDown.pressed = false;
            break;
        case " ":
            keys[" "].pressed = false;
            break;
    }
})

floorMap.forEach((row, i) => {
    row.forEach((char, j) => {
        switch (char) {
            case 0:
                floors.push(
                    new Floor({
                        position: {
                            x: j * Floor.width,
                            y: i * Floor.width
                        }
                    })
                )
            break;
        }
    })
})

function animate() {
    const dx = monsta.position.x - player.position.x
    const dy = monsta.position.y - player.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    let lastBoostTime = 0;
    c.clearRect(0, 0, canvas.width, canvas.height)
    floors.forEach((floor) => {
        floor.draw()
    })
    bullets.forEach((bullet) => {
        bullet.update()
    })
    clipCount.innerText = clip.length
    monsta.draw()
    if (motionAllowed) {
        player.update()
    }
    bullets.forEach((bullet) => {
        if (bullet.position.x + bullet.radius >= monsta.position.x - monsta.radius &&
            bullet.position.x - bullet.radius <= monsta.position.x + monsta.radius &&
            bullet.position.y + bullet.radius >= monsta.position.y - monsta.radius &&
            bullet.position.y - bullet.radius <= monsta.position.y + monsta.radius)
            {
                monstaMove = true
            }
    })
    // BOOST
    if (keys[" "].pressed) {
        lastBoostTime = Date.now()
    }
    if (motionAllowed && boost < 100 && Date.now() - lastBoostTime > 1000) {
        boost += 0.4
    }
    for (let i = 0; i < boost; i++) {
        let x = i * boostPixelWidth
        c.fillStyle = "hsl(210, 100%, 65%)"
        c.fillRect(x + innerWidth * 0.25, innerHeight - 15, boostPixelWidth, 5)
    }
    //MONSTA STARTS MOVING
    if (monstaMove == true) {
        outline.style.animation = "outline 0.7s ease-in-out infinite";
        monsta.update()
        backgroundMusic.play()
        jailBars.style.transform = "rotate(35deg)"
        startInstructions.style.display = "none"
        if (game.mode == "survival" ) {
            timer.style.display = "flex"
            const survivalTimePixelWidth = innerWidth / 2 / 90
            for (let i = 0; i < survivalTime; i++) {
            let x = i * survivalTimePixelWidth
            c.fillStyle = "hsl(90, 100%, 50%)"
            c.fillRect(x + innerWidth * 0.25, 10, innerWidth / 2 / 90, 10)
            }
        }
        if (game.mode == "battle") {
            c.fillStyle = "black"
            c.fillRect(innerWidth * 0.25, 10, innerWidth * 0.5, 10)
            for (let i = 0; i < monstaHealth; i++) {
            let x = i * monstaHealthPixelWidth
            c.fillStyle = "hsl(0, 100%, 40%)"
            c.fillRect(x + innerWidth * 0.25, 10, monstaHealthPixelWidth, 10)
            }
        }
    }
    // LOSE CONDITION
    if (distance <= Monsta.radius + Player.radius) {
            motionAllowed = false
            player.draw()
            endGame.style.display = "flex"
            if (game.mode == "survival") {
                myRecord.style.display = "flex"
            }
    }
    // WIN CONDITION
    if (monstaHealth <= 0) {
        motionAllowed = false
        outline.style.animation = "";
        player.draw()
        player.velocity.x = player.velocity.y = 0
        winScreen.style.display = "flex"
        bullets.forEach((bullet) => {
            bullet.draw()
        })
    }
    // FIX PLAYER FOR NOW
    if (player.position.y - Player.radius < 0) {
        player.position.y += 10
    }
    if (player.position.y + Player.radius > innerHeight) {
        player.position.y -= 10
    }
    if (player.position.x - Player.radius < 0) {
        player.position.x += 10
    }
    if (player.position.x + Player.radius > innerWidth) {
        player.position.x -= 10
    }
    playerCSSx = player.position.x - Player.radius;
    playerCSSy = player.position.y - Player.radius;
    playerCSS.style.left = playerCSSx + "px";
    playerCSS.style.top = playerCSSy + "px";
    console.log(survivalTime)
    requestAnimationFrame(animate)
} animate()

function movePlayer() {
    if (keys.w.pressed == true) {
            player.velocity.y = -Player.speed
    } else if (keys.s.pressed == true) {
        player.velocity.y = Player.speed
    } else if (keys.w.pressed == false && keys.s.pressed == false) {
        player.velocity.y = 0
    }
    if (keys.a.pressed == true) {
        player.velocity.x = -Player.speed
    } else if (keys.d.pressed == true) {
        player.velocity.x = Player.speed
    } else if (keys.a.pressed == false && keys.d.pressed == false) {
        player.velocity.x = 0
    }
    if (keys[" "].pressed && boost > 0) {
        if (player.velocity.y > 0) {
            player.velocity.y += Player.sprint
        } else if (player.velocity.y < 0) {
            player.velocity.y -= Player.sprint
        }
        if (player.velocity.x > 0) {
            player.velocity.x += Player.sprint
        } else if (player.velocity.x < 0) {
            player.velocity.x -= Player.sprint
        }
    }
}

// INCREASE MONSTA SPEED BY GAMEMODE

setInterval(function() {
    if (monstaMove && motionAllowed == true) {
        timerCount.innerText ++;
        if (game.mode == "survival") {
            Monsta.speed += 0.04;
        } else if (game.mode == "battle") {
            Monsta.speed += 0.07;
        }
    }
}, 1000 * 1)

// SURVIVAL

setInterval(function() {
    if (game.mode == "survival" && monstaMove) {
        survivalTime ++;
    }
}, 1000 * 1)