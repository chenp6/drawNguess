const PORT = process.env.PORT || 3001;
import express from 'express'; //載入express框架模組
import http from 'http'; //載入http框架模組
import path from 'path';
const __dirname = path.resolve();

let app = express(); //Creates an Express application.
let server = http.Server(app);

app.use('/', express.static(__dirname));



server.listen(PORT, () => {
    console.log("正在聽" + PORT);
});

import {
    Server
} from 'socket.io';
let io = new Server(server);

const loginIO = io.of("/lobby"); //遊戲大廳IO
const gameIO = io.of("/game"); //遊戲IO
const qBank = ['錢包', '電風扇', '冷氣', '腳踏車', '運動褲', '烘碗機', '豆腐', '音樂家', '鋼琴', '書桌', '長笛', '抽油煙機', '直排輪', '布鞋', '按摩椅', '記憶卡', '火車', '計程車', '茶杯', '水壺', '炸蝦', '內褲', '帥哥', '美女', '口罩', '紅酒', '菜瓜布', '洗手台', '壽司', '傘蜥', '鉛筆', '鏡子', '行李箱', '機車', '梳子', '棒球', '籃球', '音響', '耳機', '鍋子', '窗戶', '窗簾', '手槍', '面具', '獨角獸', '鍋燒意麵', '義大利麵', '油漆', '遊艇', '毛巾', '月球', '地球', '外星人', '眼鏡', '高跟鞋', '果汁機', '電梯', '牛奶', '章魚', '白膠', '榕樹', '狗', '冰淇淋', '電磁爐', '手扶梯', '牛仔褲', '衣架', '同學', '相機', '棉被', '枕頭'];


// const rooms = gameIO.adapter.rooms; //rooms: Map<Room, Set<SocketId>> //socketId=player


const roomInfo = new Map(); //roomId => {name: '房間1',playerCnt:人數}

//order第0位為猜題者，每輪更新
const playerOrder = new Map(); //roomId => [{id:'socketId', name:'user名稱'},{id:'socketId2', name:'user2名稱'}]

//繪畫者順序，每turn更新
const drawerOrder = new Map(); //roomId => [{id:'socketId', name:'user名稱'},{id:'socketId2', name:'user2名稱'}]

const answerIndex = new Map(); //roomId => 答案的Index
const roundTime = new Map(); //roomId => round時間(0~60000毫秒；-1表示計時停止)
const turnTime = new Map(); //roomId => {turn:turn時間,turnEnd:結束時間，-1表示計時停止}
const roomScore = new Map(); //roomId=>score

//測資 (房間1'idididid1213')
roomInfo.set('idididid1213', {
    name: '房間1',
    playerCnt: 0,
});
playerOrder.set('idididid1213', []);
drawerOrder.set('idididid1213', []);

answerIndex.set('idididid1213', null);
roundTime.set('idididid1213', 0);
turnTime.set('idididid1213', { current: 0, turnEnd: 0 });
roomScore.set('idididid1213', 0);


loginIO.on('connection', (socket) => {
    socket.on('load login page', () => {
        socket.emit('set login page', Array.from(roomInfo));
    });


    socket.on('add new room', (roomId, roomName) => {
        console.log(roomId + "'s name is " + roomName);
        roomInfo.set(roomId, {
            name: roomName,
            playerCnt: 0,
        });
        playerOrder.set(roomId, []);
        drawerOrder.set(roomId, []);
        answerIndex.set(roomId, null);
        roundTime.set(roomId, 0);
        turnTime.set(roomId, { current: 0, turnEnd: 0 });
        roomScore.set(roomId, 0);
    });

});



gameIO.on('connection', (socket) => {
    socket.on('enter room', (roomId, username) => {
        const room = roomInfo.get(roomId);
        if (room === undefined) {
            socket.emit('room not exists');
            return;
        }
        if (room.playerCnt < 6) {
            const order = playerOrder.get(roomId);
            order.push({ id: socket.id, name: username }); //ps:"leave-room"時要刪除此筆資料
            socket.join(roomId);
            if (room.playerCnt < 3) {
                waitForTeammate(roomId);
            } else if (room.playerCnt == 3) {
                startRound(roomId); //達3人後可開始遊戲
            } else {
                updateInfo(socket.id, roomId);
            }
        } else {
            socket.emit('full seat');
        }
    });

    socket.on('draw record', (record, roomId) => {
        //此socket外的其他網頁都會觸發事件
        socket.broadcast.to(roomId).emit('draw record', record);
    });

    socket.on('guess answer', (roomId, guessAnswer) => {
        const correctIndex = answerIndex.get(roomId);
        if (qBank[correctIndex] !== guessAnswer) {
            onWrongAnswer(roomId, guessAnswer);
        } else {
            onRightAnswer(roomId, guessAnswer);
        }
    });

    socket.on('next turn', (roomId) => {
        stopTurnTimer(roomId);
        restartTurn(roomId);
    });

});

function updateInfo(socketId, roomId) {
    const players = playerOrder.get(roomId);
    const drawers = drawerOrder.get(roomId);
    const ansIndex = answerIndex.get(roomId);
    gameIO.to(roomId).emit('update turn order', drawers); //更新order(加入此user
    gameIO.to(socketId).emit('start new round', players[0].name);
    showAnswer(socketId, ansIndex); //除猜題者外其他皆須收到答案
}

function startRound(roomId, currentIndex = null) {
    const players = playerOrder
    let arr = Object.assign([], players)
    drawerOrder.set(roomId, arr.slice(0, 1)); //drawers:除了players第0位為繪者

    gameIO.to(roomId).emit('wait new round');

    const ansIndex = randomAnswerIndex(currentIndex);
    answerIndex.set(roomId, ansIndex);
    setTimeout(() => {
        if (players && players.length >= 3) {
            gameIO.to(roomId).emit('start new round', players[0].name);
            initRoundTimer(roomId);
            const drawers = drawerOrder.get(roomId);
            for (let i = 0; i < drawers.length; i++) {
                showAnswer(drawers[i].id, ansIndex); //除猜題者外其他皆須收到答案
            }
            emitNewGuesser(roomId);
            roundTimer(roomId);
            startTurn(roomId);
        } else {
            waitForTeammate(roomId)
        }

    }, 2000);
}
/**
 * 房間的round計時器開始計時
 * @param {*} roomId 該房間ID
 */
function roundTimer(roomId) {
    const time = roundTime.get(roomId); //目前時間
    if (time == undefined) return;
    if (time >= 60000) { //超過60秒(本round結束)，停止計時器
        endRound(roomId);
    } else if (time >= 0) {
        //time==-1時表示停止該輪計時，所以不會繼續遞迴
        //所以time>=0時便會繼續遞迴
        gameIO.to(roomId).emit('update round time', time);
        setTimeout(() => {
            roundTime.set(roomId, time + 500);
            roundTimer(roomId);
        }, 500);
    }
}

function emitNewGuesser(roomId) {
    const order = playerOrder.get(roomId);
    gameIO.to(order[0].id).emit('guess turn');
}

function startTurn(roomId) {
    const leftTime = 60000 - roundTime.get(roomId);
    if (leftTime == 60001) { //round已停止 60000-(-1)
        return;
    }
    const playerCnt = roomInfo.get(roomId).playerCnt;
    const end = leftTime / (playerCnt - 1); //繪者人數為所有玩家人數-1

    let isLastTurn = false;
    if (leftTime <= 3000) {
        isLastTurn = true;
        initTurnTimer(roomId, leftTime);
        console.log(leftTime + " " + playerCnt + " leftTime <= 3000")
    } else if (end <= 3000) { //&& leftTime>3000
        initTurnTimer(roomId, 3000);
        console.log(leftTime + " " + playerCnt + " end <= 3000")
    } else {
        initTurnTimer(roomId, end);
        console.log(leftTime + " " + playerCnt + " end")

    }
    emitNewOrder(roomId, isLastTurn);
    turnTimer(roomId, isLastTurn);
}



function turnTimer(roomId, isLastTurn) {
    const round = roundTime.get(roomId);
    const turn = turnTime.get(roomId);
    if (turn == undefined) {
        return;
    }
    const current = turn.current;
    const turnEnd = turn.turnEnd;
    const drawers = drawerOrder.get(roomId);

    if (round == -1 || turn.turnEnd == -1 || round == undefined) {
        //round已停止
        return;
    }
    if (current >= turnEnd) {
        // console.log("here")
        stopTurnTimer(roomId);
        gameIO.to(drawers[0].id).emit('update turn time', 0, 1);
        if (!isLastTurn) { //若非最後一輪則restartTurn
            console.log("end from here")
            restartTurn(roomId);
        }
    } else {
        if (drawers.length >= 3) {
            gameIO.to(drawers[0].id).emit('update turn time', current, turnEnd);
            // console.log(current + " " + turnEnd);
        }
        setTimeout(() => {
            turn.current += 500;
            turnTimer(roomId, isLastTurn);
        }, 500);
    }
}

function emitNewOrder(roomId, isLastTurn) {
    const drawers = drawerOrder.get(roomId);
    gameIO.to(roomId).emit('reset turn order');
    gameIO.to(roomId).emit('update turn order', drawers);
    gameIO.to(drawers[0].id).emit('draw turn', isLastTurn);

}



function restartRound(roomId, currentIndex = null) {
    updateGuesser(roomId);
    startRound(roomId, currentIndex);
}

function restartTurn(roomId) {
    updateDrawer(roomId);
    startTurn(roomId);
}

function onRightAnswer(roomId, guessAnswer) {
    gameIO.to(roomId).emit('show guess answer', guessAnswer, true);
    const score = roomScore.get(roomId);
    const time = roundTime.get(roomId);
    const addScore = (60 - time) / 60;
    roomScore.set(roomId, score + addScore);
    gameIO.to(roomId).emit('update score', roomScore);
    endRound(roomId);
}

function onWrongAnswer(roomId, guessAnswer) {
    gameIO.to(roomId).emit('show guess answer', guessAnswer, false);
}

function waitForTeammate(roomId) {
    gameIO.to(roomId).emit('wait for teammate');
    stopRoundTimer(roomId);

}

function endRound(roomId) {
    const currentIndex = answerIndex.get(roomId);
    const order = playerOrder.get(roomId);
    if (order != undefined) {
        stopRoundTimer(roomId);
        showAnswer(order[0].id, currentIndex);
        restartRound(roomId, currentIndex);
    }

}

function showAnswer(socketId, currentIndex) {
    gameIO.to(socketId).emit('show answer', qBank[currentIndex]);
}

// function resetScreen(roomId) {
//     gameIO.to(roomId).emit('reset screen');
// }


function initRoundTimer(roomId) {
    roundTime.set(roomId, 0);
}

function stopRoundTimer(roomId) { //當round結束時timer設為-1
    roundTime.set(roomId, -1);
}


function initTurnTimer(roomId, end) {
    turnTime.set(roomId, { current: 0, turnEnd: end })
        // console.log(turnTime.get(roomId).current)
        // console.log(turnTime.get(roomId).turnEnd)
}


function stopTurnTimer(roomId) { //當round結束時timer設為-1
    const time = turnTime.get(roomId);
    time.turnEnd = -1;
}


function updateDrawer(roomId) {
    const order = drawerOrder.get(roomId);
    switchToLast(order, 0);
}

function updateGuesser(roomId) {
    const order = playerOrder.get(roomId);
    switchToLast(order, 0);
}



/**
 * 將該room的某index之user，移到最後一位
 * @param {*} roomId 該房間ID
 * @param {*} index 要移動的index
 */
function switchToLast(order, index) {
    // const order = playerOrder.get(roomId);
    if (order != undefined) {

        const pre = order[index]; //該user
        order.splice(index, 1); //刪除該user
        order.push(pre); //將該user插入到隊伍最後
    }
}


function randomAnswerIndex(currentIndex) {
    let index = Math.floor(Math.random() * (qBank.length));

    if (currentIndex === null) {
        return index;
    }
    //隨機index

    //避免與前次相同
    if (index === currentIndex) {
        if (index === 0) {
            index += 1;
        } else if (index === qBank.length - 1) {
            index -= 1;
        } else {
            const rand = Math.floor(Math.random());
            if (rand > 0.5) {
                index += 1;
            } else {
                index -= 1;
            }
        }
    }
    return index;
}



gameIO.adapter.on("join-room", (roomId, socketId) => {
    if (roomId != socketId) {
        roomInfo.get(roomId).playerCnt += 1;

        const name = roomInfo.get(roomId).name;
        const order = playerOrder.get(roomId); //該room的player order
        gameIO.to(roomId).emit('set room page', name, order); //更新其他同room的room畫面

        loginIO.emit('set login page', Array.from(roomInfo)); //更新其他在(loginIO的sockets)的login畫面

        console.log('socket:' + socketId + ' has joined room ' + roomId);
    }
});

/**
 * socketId:預設會進入與自己名稱相同的roomId(roomId == socketId) 
 * 另外，透過程式會進入另一個與其他人共用的roomId (roomId !== socketId)
 * =>一個用戶會同時進入兩個socket(自己和與大家共用)
 */
gameIO.adapter.on("leave-room", (roomId, socketId) => {
    if (roomId != socketId) {
        let players = playerOrder.get(roomId);
        let drawers = drawerOrder.get(roomId);

        const guesser = players[0];
        const drawer = drawers[0];

        players = players.filter(player => player.id != socketId);
        playerOrder.set(roomId, players);

        drawers = drawers.filter(player => player.id != socketId);
        drawerOrder.set(roomId, drawers);


        const info = roomInfo.get(roomId);
        info.playerCnt -= 1;

        if (info.playerCnt == 0) { //該房間所有人都離開時，delete房間
            stopRoundTimer(roomId);
            roomInfo.delete(roomId);
            playerOrder.delete(roomId);
            answerIndex.delete(roomId);
            roundTime.delete(roomId);
            turnTime.delete(roomId);
            drawerOrder.delete(roomId);
        } else if (info.playerCnt < 3) {
            stopRoundTimer(roomId);
            waitForTeammate(roomId);
        } else {
            if (socketId === guesser.id) { //離開者為猜測者，則重開一round
                endRound(roomId);
            } else if (socketId === drawer.id) { //離開者為繪畫者，則更新繪畫者
                emitNewOrder(roomId);
            }
        }
        loginIO.emit('set login page', Array.from(roomInfo)); //更新其他在(loginIO的sockets)的login畫面
        console.log('socket:' + socketId + ' has leaved room ' + roomId);
    }
});