/*
遊戲規則說明:

(1)每輪:
    a)時間為60秒
    b)一題題目
    c)一個猜題者，其他皆為繪畫者
    d)猜題與繪圖者，每輪會輪流擔任

(2)猜題者:
    在60秒的猜題時間內，猜出隊友所畫的圖  (畫面右上方會顯示從60秒開始的倒數計時)

(3)繪畫者:
    a)每輪，一名繪畫者僅有一筆
    b)若輪到該繪畫者時，其右上角倒數計時器會開始從【該筆的時間限制】開始倒數  (該筆的時間限制:由該輪剩餘秒數平分決定)

*/


const roomId = sessionStorage.getItem("room_id");
const username = sessionStorage.getItem("username");
let roomName;
let playerOrder;
let playerName = [];



const url = "/game";
const socket = io.connect(url, {
    "transports": ['websocket']
});

socket.on('connect', () => {
    socket.emit('enter room', roomId, username);
});

socket.on('Full seat', () => {
    location.href = '../index.html';
    alert('此房間人數已滿');
});

socket.on('Room not exists', () => {
    location.href = '../index.html';
    alert('此房間已不存在');
});

let roundAnswer;
const answerInput = document.getElementById('answerInput');
socket.on('set room page', (name, order, drawIndex, answer, score) => {
    roomName = name;
    playerOrder = order;
    playerName = [];
    roundAnswer = answer;
    for (let i = 0; i < order.length; i++) {
        const player = order[i];
        let pushStr = "";
        if (player.id === socket.id) {
            pushStr += player.name + "(you)";
        } else {
            pushStr += player.name;
        }

        if (i === drawIndex) {
            pushStr = "【" + pushStr + "】";
        }
        playerName.push(pushStr);
    }

    if(answerInput.readOnly){
        if (order[0].id === socket.id) { //猜測者在第一turn才會進=>answerInput還是唯讀
            answerInput.value = "";
            answerInput.setAttribute("placeholder", answer.length + "個字");
            answerInput.readOnly = false;
        } else {
            answerInput.value = answer;
            answerInput.readOnly = true;
        }
    }


    document.getElementById('score').innerHTML = score;

    test(playerName[drawIndex], playerName[0]);
});

socket.on('wait other player', () => {
    document.getElementById('test').innerHTML = '須至少兩人才能開始，正在等候其他玩家';
    init();
});

socket.on('restart round', () => {
    init();
});

let guessTurn = false;//是否為該輪猜測者
let drawTurn = false;//是否為該筆繪畫者
let roundLeftTime; //該round所剩時間
let usedTime; //該turn已使用時間
let startSec;//該筆畫開始計時的時鐘second
let turnTotalTime;//該筆畫的時間
let guessRight = false;//猜測者是否猜對
let initTime = false;//正在更新時間

socket.on('guess turn', (roundLeft) => {
    document.getElementById('tempGuess').innerHTML = "開始猜測。。。";
    guessTurn = true;
    roundLeftTime = roundLeft;
    const date = new Date();
    startSec = date.getSeconds();
});


socket.on('draw turn', (turnTime, roundLeft) => {
    drawTurn = true;
    roundLeftTime = roundLeft;
    turnTotalTime = turnTime;
    const date = new Date();
    startSec = date.getSeconds();
});

socket.on('draw line', (id, w, color, position) => {

    //輪與輪之間的更新過程，所有玩家的畫皆不能傳送及繪畫
    if(!initTime){
        drawLine(w, color, position);
        saveLine(w, color, position);
    }
});

socket.on('record step', (id) => {
    recordStep();
});

socket.on('undo', (id) => {
    undo();
});

socket.on('guess right', (id, leftTime) => {
    guessRight = true;
    document.getElementById('tempGuess').innerHTML = "猜測者答對了!得分!";
    setTimeout(() => {
        document.getElementById('tempGuess').innerHTML = "等待猜測者猜測。。。";
    }, 1800);
});

socket.on('guess wrong', (id, wrongAns) => {
    //playerName[0]為猜題者
    document.getElementById('tempGuess').innerHTML = playerName[0] + "猜【" + wrongAns + "】=>答錯了!";
    setTimeout(() => {
        if(!guessRight)
            document.getElementById('tempGuess').innerHTML = "等待猜測者猜測。。。";
    }, 2500);
});


socket.on('show guesser answer',(answer)=>{
    document.getElementById('answerShow').innerHTML = "答案為" + answer;
    setTimeout(() => {
        document.getElementById('answerShow').innerHTML = "&nbsp;&nbsp;";
    }, 1800);
});



//測資
function test(drawer, guesser) {
    const drawerLine = [...playerName]

    drawerLine.shift();
    document.getElementById('test').innerHTML = "my name:" + username + "<br>room name :" + roomName + "<br>" + "drawerLine:" + drawerLine + "<br>draw:" + drawer + "<br>guess:" + guesser;
}


const colorSelector = document.getElementById('colorSelector');
const weightValue = document.getElementById('weightValue');
const clock = document.getElementById('clock');

let strokeColor = "#000000";
let weight = 4;
let lines = []; //紀錄每個line
let stepLines = []; //記錄每step的累加line數
let tempLineCnt = 0;
let drawing = false;

function init() {
    guessTurn = false;
    drawTurn = false;
    guessRight = false;
    initTime = true;
    clock.innerHTML = "";
    lines = []; //紀錄每個line
    stepLines = []; //記錄每step的累加line數
    clear();
    initTime = false;
}

function setup() {
    canvas = createCanvas(550, 450);
    canvas.id('gameCanvas');
    canvas.parent('gameMain');
    background(255);
}

function draw() {

    let x = mouseX;
    let y = mouseY;
    let px = pmouseX;
    let py = pmouseY;

    if (drawTurn || guessTurn) {
        const date = new Date();
        const recentSec = date.getSeconds();
        setClock(turnTotalTime, startSec, recentSec);
    }

    if (
        mouseIsPressed &&
        mouseButton === LEFT &&
        x > 0 &&
        x < 530 &&
        y > 0 &&
        y < 430 &&
        drawTurn
    ) {
        drawing = true;
        let position = [x, y, px, py];
        socket.emit('draw line', roomId, weight, strokeColor, position);
        drawLine(weight, strokeColor, position);
        saveLine(weight, strokeColor, position);
    }
}



function setStrokeColor(color) {
    strokeColor = color;
    colorSelector.value = color;
}

function setStrokeWeight(value) {
    weight = value;
    weightValue.innerHTML = value;
}

function drawLine(w, color, position) {
    strokeWeight(w);
    stroke(color);
    line(position[0], position[1], position[2], position[3]);
}

function saveLine(w, color, position) {
    let line = new Map();
    line.set('weight', w);
    line.set('color', color);
    line.set('position', position);
    lines.push(line);
    tempLineCnt++;
}


function undoBtnClick() {
    socket.emit('undo', roomId);
    undo();
}

function undo() {
    clear();
    let last = stepLines.length - 1;
    if (last > 0) {
        lines.splice(stepLines[last - 1], stepLines[last] - stepLines[last - 1]);
        stepLines.splice(last, 1);
        reDraw();
    } else {
        lines = [];
        stepLines = [];
    }
}


function reDraw() {
    lines.forEach(line => {
        let w = line.get('weight');
        let color = line.get('color');
        let position = line.get('position');
        drawLine(w, color, position);
    });
}
// setInterval(() => {
//     // socket.emit('start clock')
//     startClock();
// }, 60000);

// function mousePressed() {
//     socket.emit('start clock')
//     startClock();
// }


function mouseReleased() {
    if (drawing && drawTurn) {
        drawing = false;
        finishDrawTurn();
    }
}


let lastSec = false;

function setClock(turnTotalTime, startSec, recentSec) {
    if (drawTurn && !lastSec) {
        //因為第0秒跟第60秒的usedTime是一樣的
        //所以第59秒時停止計時，透過finishDrawTurn()來記最後一秒
        usedTime = ((recentSec - startSec) + 60) % 60;
        const turnLeftTime = turnTotalTime - usedTime;
        clock.innerHTML = turnLeftTime;
        if (turnLeftTime <= 1) {
            lastSec = true;
            finishDrawTurn();
        }
    } else if (guessTurn && !lastSec) {
        usedTime = ((recentSec - startSec) + 60) % 60;
        const countDown = roundLeftTime - usedTime;
        clock.innerHTML = countDown;
        if (countDown <= 1) {
            lastSec = true;
            finishGuessTurn();
        }
    }
}

function finishDrawTurn() {
    //lastSec表示是否因為時間到而停止(最後一秒進入此function)
    if (lastSec) {
        timeout = 1000;
    } else {
        timeout = 100;
    }
    setTimeout(() => {
        lastSec = false;
        drawTurn = false;
        roundLeftTime -= usedTime;
        socket.emit('record step', roomId);
        recordStep();
        socket.emit('end turn', roomId, roundLeftTime);
        clock.innerHTML = 0;
    }, timeout);
}

function recordStep() {
    let last = stepLines.length - 1;
    if (last >= 0) {
        tempLineCnt += stepLines[last];
    }
    stepLines.push(tempLineCnt);
    tempLineCnt = 0;
}



function guessAnswer() {
    if (guessTurn) {
        let temp =  JSON.parse(JSON.stringify(answerInput.value));
        if (temp == roundAnswer) {
            //剩幾秒就加幾分
            const countDown = roundLeftTime - usedTime;
            socket.emit('guess right', roomId, countDown);
            finishGuessTurn();
        } else {
            socket.emit('guess wrong', roomId, temp);
            answerInput.value = "";
        }
    }
}

function finishGuessTurn() {
    //lastSec表示是否因為時間到而停止(最後一秒進入此function)
    if (lastSec) {
        timeout = 1000;
    } else {
        timeout = 100;
    }
    setTimeout(() => {
        answerInput.readOnly = true;
        lastSec = false;
        guessTurn = false;
        socket.emit('guesser end round', roomId);
        clock.innerHTML = 0;
    }, timeout);
}