function startGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.classList.add('shown');
    document.getElementById('mainMenu').classList.add('hidden');
    document.body.style.padding = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.imageSmoothingEnabled = false;
    ctx.textRendering = "optimizeSpeed";

    const playerImg = new Image();
    playerImg.src = 'src/images/ddededodediamante.png';

    const catImg = new Image();
    catImg.src = 'src/images/alpacalli_cat.png';

    const jumpSound = new Audio('src/sounds/boing.wav');
    const meowSound = new Audio('src/sounds/meow.mp3');
    const owieSound = new Audio('src/sounds/owie.wav');

    function playSound(sound) {
        const audioMap = {
            'jump': jumpSound,
            'meow': meowSound,
            'owie': owieSound
        };

        const audio = audioMap[sound];

        if (audio) {
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
        image: playerImg
    };

    const entities = {};
    const keys = {};
    var gameStopped = false;
    var globalId = 0;
    var rainDelay = 700;
    var timer = 0;
    var lastFrameTime = performance.now();
    var fps = 60;

    document.addEventListener('keydown', event => keys[event.code] = true);
    document.addEventListener('keyup', event => keys[event.code] = false);

    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function colliding(objA, objB) {
        return objA.x < objB.x + objB.width &&
            objA.x + objA.width > objB.x &&
            objA.y < objB.y + objB.height &&
            objA.y + objA.height > objB.y;
    }

    function drawPlayer() {
        if (player.x + player.dx > 0 && player.x + player.dx + player.width < canvas.width) {
            player.x += player.dx;
        } else {
            player.dx = 0;
        }

        if (player.y + player.dy > 0 && player.y + player.dy + player.height < canvas.height) {
            player.y += player.dy;
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
                entity.y += 3;

                if (entity.y >= canvas.height + 20) {
                    delete entities[key];
                } else {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);

                    if (colliding(entity, player)) {
                        playSound('owie');

                        gameStopped = true;

                        window.alert('ahhhh');
                    }
                }
            } else if (entity.type === 'catCollectible') {
                entity.y += 5;

                if (entity.y >= canvas.height + 20) {
                    delete entities[key];
                } else {
                    ctx.drawImage(catImg, entity.x, entity.y, entity.width, entity.height);

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

    function spawnEntity(type, width, height) {
        globalId++;
        entities[globalId] = {
            type: type,
            x: getRandom(width, canvas.width - width),
            y: 0,
            width: width,
            height: height
        };
    }

    function createRain() {
        if (gameStopped) return;

        spawnEntity('rain', 20, 20);
        if (getRandom(0, 20) === 20) spawnEntity('catCollectible', 40, 50);

        if (rainDelay > 250) rainDelay = Math.round(rainDelay * 0.993);
        else if (rainDelay > 150) rainDelay -= 1;
        else rainDelay = 150;

        setTimeout(createRain, rainDelay);
    }

    function gameLoop() {
        if (gameStopped) return;

        var focused = document.hasFocus();

        player.dx *= 0.7;
        player.dy += player.gravity;

        if (keys['KeyA']) {
            player.dx = -player.speed;
        } else if (keys['KeyD']) {
            player.dx = player.speed;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawEntities();
        drawPlayer();

        var now = performance.now();
        var deltaTime = now - lastFrameTime;
        fps = Math.round(1000 / deltaTime);
        lastFrameTime = now;

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
