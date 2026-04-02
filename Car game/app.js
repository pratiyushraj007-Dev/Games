const container = document.getElementById("container");
const containerHeight = container.clientHeight;
const userCarContainer = document.getElementById('userCarContainer');
const scorePara = document.getElementById("score");
const startButton = document.getElementById("startButton");
const obstaclesList = ['blue_pickup.webp', 'blue_sedan.webp', 'green_pickup.webp', 'green_sedan.webp', 'sky_blue_sedan.webp'];
let carAnimationId;
let gameRunning=false;
let score=0;
const speed = 150;//150 pixel per second
let obstacleSpeed = 120;
let scoreRate=10;


startButton.addEventListener(('click'), () => {
    score=0;
    cancelAnimationFrame(carAnimationId);
    gameRunning=true;
    const music = document.getElementById("car_audio");
    music.play();
    music.loop = true;
    userCarContainer.style.transform = "translate(0px,0px)";
    const startContainer = document.getElementById("startContainer");
    startContainer.style.visibility = "hidden";
    const obstacleContainer = document.querySelectorAll(".obstacleContainer");
    if (obstacleContainer.length != 0) {
        obstacleContainer.forEach((element) => {
            element.remove();
        })
    }
    container.style.animation = "highway 1.8s linear infinite";
    let spawnTimer = 0;

    // car control function

    let carX = 0;
    let carY = 0;
    let lastTime = performance.now();

    let keys = {
        "ArrowUp": false,
        "ArrowDown": false,
        "ArrowRight": false,
        "ArrowLeft": false
    }

    const keyPressOn = (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }
    }
    const keyPressoff = (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    }
    let handleMouseOn = (e) => {
        const id = e.target.getAttribute('id');
        keys[id] = true;
    }

    let handleMouseOff = (e) => {
        const id = e.target.getAttribute('id');
        keys[id] = false;
    }

    window.addEventListener('keydown', keyPressOn)

    window.addEventListener('keyup', keyPressoff)

    document.querySelectorAll('.carButtons').forEach((element) => {
        element.addEventListener('mousedown', handleMouseOn)
        element.addEventListener('mouseup', handleMouseOff)
        element.addEventListener('touchstart', handleMouseOn)
        element.addEventListener('touchend', handleMouseOff)
    })

    function gameLoop(timestamp) {
        const deltaTime = Math.min(((timestamp - lastTime) / 1000),0.1); //millisecond to second;
        lastTime = timestamp;
        const userCarContainerHeight = userCarContainer.clientHeight;
        let userCarContainerProp = userCarContainer.getBoundingClientRect();
        let containerProp = container.getBoundingClientRect();
        if (keys.ArrowUp) {
            if (carY > -(containerHeight - userCarContainerHeight)) {
                carY -= speed * deltaTime;
            }
        } else if (keys.ArrowRight) {
            if (userCarContainerProp.right + 10 <= containerProp.right) {
                carX += speed * deltaTime;
            }
        } else if (keys.ArrowDown) {
            if (carY > 0) {
                carY = 0;
            }
            carY += speed * deltaTime;
        } else if (keys.ArrowLeft) {
            if (userCarContainerProp.left - 10 >= containerProp.left) {
                carX -= (speed + 30) * deltaTime;
            }
        }
        userCarContainer.style.transform = `translate(${carX}px,${carY}px)`

        // obstacle creation
        let spawnInterval = Math.random() + 1.2; //ms
        spawnTimer += deltaTime;
        if (spawnTimer > spawnInterval) {
            spawnTimer = 0;
            spawnInterval = Math.random() + 1.2;
            let obstacle = obstaclesList[Math.floor(obstaclesList.length * Math.random())];
            let obstaclePosition = (Math.random() * 9) * 10;
            const obstacleContainer = document.createElement("div");
            obstacleContainer.dataset.y = -75;
            obstacleContainer.setAttribute("class", "obstacleContainer");
            const obstacleImage = document.createElement("img");
            obstacleImage.setAttribute('class', 'obstcaleImage');
            obstacleImage.setAttribute("src", `./obstacles/${obstacle}`)
            obstacleImage.setAttribute("alt","obstacleImage");
            obstacleContainer.appendChild(obstacleImage);
            obstacleContainer.style.right = `${obstaclePosition}%`;
            container.insertAdjacentElement('afterbegin', obstacleContainer);
        }

        //move obstacle

        document.querySelectorAll(".obstacleContainer").forEach((element) => {
            let y = Number(element.dataset.y);
            y += obstacleSpeed * deltaTime;
            element.dataset.y = y;
            element.style.transform = `translateY(${y}px)`;
            const obstacleProp = element.getBoundingClientRect();
            if (obstacleProp.top > containerHeight) {
                container.removeChild(element);
            }
            if (userCarContainerProp.right > obstacleProp.left
                && userCarContainerProp.left < obstacleProp.right
                && userCarContainerProp.top < obstacleProp.bottom
                && userCarContainerProp.bottom > obstacleProp.top) {
                gameOver();
            }
        })

        //score function
        const highestScorePara = document.getElementById("highestScore");
        let highestScore = Number(localStorage.getItem("highest score"));

        if (highestScore == null) {
            localStorage.setItem("highest score", 0);
        }
        highestScorePara.innerText = Math.floor(highestScore);
        score+=deltaTime*scoreRate;
        scorePara.innerText=Math.floor(score);
        if(gameRunning){
            carAnimationId = requestAnimationFrame(gameLoop);
        }
    }
    function gameOver() {
        window.removeEventListener('keydown', keyPressOn);
        container.style.animation = "none";
        let highestScore = Number(localStorage.getItem("highest score"));
        if (score > highestScore) {
            localStorage.setItem("highest score", score);
        }
        music.pause();
        startContainer.style.visibility = "visible";
        document.querySelectorAll(".carButtons").forEach((element) => {
            element.removeEventListener("mousedown", handleMouseOn);
            element.removeEventListener("touchstart", handleMouseOn);
        })
        gameRunning=false;
        cancelAnimationFrame(carAnimationId);
    }
    requestAnimationFrame(gameLoop);
});