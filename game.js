const ddededodediamanteImg = new Image();
ddededodediamanteImg.src = 'src/images/ddededodediamante.png';

const catImg = new Image()
catImg.src = 'src/images/alpacalli_cat.png';
const catImg2 = new Image()
catImg2.src = 'src/images/gen1x_cat.png';

const jumpSound = new Audio('src/sounds/boing.wav');
const meowSound = new Audio('src/sounds/meow.mp3');
const owieSound = new Audio('src/sounds/owie.wav');
const ddededodediamanteSound = new Audio('src/sounds/ddededodediamante.mp3');

ddededodediamanteSound.onloadeddata = () => {
    document.getElementById('startGameButton').disabled = false;
};

function getRandom(min, max) {
    if (min > max) {
        let tmp = max;
        max = min;
        min = tmp;
    }

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
        return Math.random() * (max - min) + min;
    } else {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

function startGame() {
    ddededodediamanteSound.play();

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.classList.add('shown');
    document.getElementById('mainMenu').classList.add('hidden');
    document.body.style.padding = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.imageSmoothingEnabled = false;
    ctx.textRendering = "optimizeSpeed";

    function playSound(sound) {
        const audioMap = {
            'jump': jumpSound,
            'meow': meowSound,
            'owie': owieSound
        };

        const audio = audioMap[sound];

        if (sound && audio) {
            audio.currentTime = 0;
            audio.play();
        }
    }

    const player = {
        x: canvas.width / 2,
        y: canvas.height - 466 / 4,
        width: 314 / 4 - 40,
        height: 466 / 4,
        imgwidth: 314 / 4,
        imgheight: 466 / 4,
        dx: 0,
        dy: 0,
        speed: 4,
        gravity: 0.8,
        jumpPower: -15,
        isJumping: false,
        image: ddededodediamanteImg
    };

    const entities = {};
    const keys = {};

    var gameStopped = false;
    var globalId = 0;
    var rainDelay = 700;
    var timer = 0;
    var lastFrameTime = performance.now();
    var fps = 60;
    var deltatimeMulti = 1;

    document.addEventListener('keydown', event => keys[event.code] = true);
    document.addEventListener('keyup', event => keys[event.code] = false);

    function colliding(objA, objB) {
        return objA.x < objB.x + objB.width &&
            objA.x + objA.width > objB.x &&
            objA.y < objB.y + objB.height &&
            objA.y + objA.height > objB.y;
    }

    function drawPlayer() {
        let playerdx = player.dx * deltatimeMulti;

        if (player.x + playerdx > 0 && player.x + playerdx + player.width < canvas.width) {
            player.x += playerdx;
        } else {
            player.dx = 0;
        }

        let playerdy = player.dy * deltatimeMulti;

        if (player.y + playerdy > 0 && player.y + playerdy + player.height < canvas.height) {
            player.y += playerdy;
        } else {
            player.dy = 0;

            if (keys['KeyW'] && player.dy <= 0) {
                player.dy = -13;

                playSound('jump');
            }
        }

        let calcX = player.x - (player.imgwidth - player.width) / 2;
        ctx.drawImage(player.image, calcX, player.y, player.imgwidth, player.imgheight);
    }

    function drawEntities() {
        for (let key in entities) {
            const entity = entities[key];

            if (entity.type === 'rain') {
                entity.y += 3 * deltatimeMulti;

                if (entity.y >= canvas.height + 20) {
                    delete entities[key];
                } else {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);

                    if (colliding(entity, player)) {
                        playSound('owie');

                        gameStopped = true;

                        setTimeout(function () {
                            window.alert('ahhhh');
                        }, 500);
                    }
                }
            } else if (entity.type === 'catCollectible') {
                entity.y += 5 * deltatimeMulti;

                if (entity.y >= canvas.height + 20) {
                    delete entities[key];
                } else {
                    ctx.drawImage(entity.image || catImg2, entity.x, entity.y, entity.width, entity.height);

                    if (colliding(entity, player)) {
                        delete entities[key];

                        playSound('meow');

                        player.speed += 2;
                        player.width *= 0.95;
                        player.imgwidth *= 0.95;
                        player.height *= 0.95;
                        player.imgheight *= 0.95;

                        setTimeout(() => {
                            player.speed -= 2;
                            player.width *= 1.0526315789473684;
                            player.imgwidth *= 1.0526315789473684;
                            player.height *= 1.0526315789473684;
                            player.imgheight *= 1.0526315789473684;
                        }, 8000);
                    }
                }
            }
        }
    }

    function spawnEntity(type, width, height, image) {
        globalId++;
        entities[globalId] = {
            type: type,
            x: getRandom(width, canvas.width - width),
            y: 0,
            width: width,
            height: height,
            image: image
        };
    }

    function createRain() {
        if (gameStopped) return;

        spawnEntity('rain', 20, 20);

        if (getRandom(0, 20) === 20) {
            spawnEntity('catCollectible', 40, 50, getRandom(0, 1) == 0 ? catImg : catImg2);
        }

        if (rainDelay > 250) rainDelay = Math.round(rainDelay * 0.993);
        else if (rainDelay > 150) rainDelay -= 1;
        else rainDelay = 150;

        setTimeout(createRain, rainDelay);
    }

    function gameLoop() {
        if (gameStopped) return;

        var now = performance.now();
        var deltaTime = now - lastFrameTime;
        fps = Math.round(1000 / deltaTime);
        deltatimeMulti = (1000 / deltaTime) / 60;
        lastFrameTime = now;

        var focused = document.hasFocus();

        player.dx *= 0.7;
        player.dy += player.gravity * deltatimeMulti;

        if (keys['KeyA']) {
            player.dx = -player.speed;
        } else if (keys['KeyD']) {
            player.dx = player.speed;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawEntities();
        drawPlayer();

        if (focused) {
            if (!gameStopped) {
                timer += deltaTime / 1000;
            }

            ctx.font = '25px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText('FPS: ' + fps, 8, 30);
            ctx.fillText('Rain delay: ' + rainDelay + 'ms', 8, 55);
            ctx.fillText('Player speed: ' + player.speed, 8, 80);
            ctx.fillText('Time survived: ' + timer.toFixed(2) + 's', 8, 105);
        }

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
    createRain();
}
