import express from 'express'; //載入express框架模組
import https from 'https'; //載入http框架模組
import path from 'path';
import cors from 'cors';
import fs from 'fs';
const __dirname = path.resolve();
const PORT = process.env.PORT;

let app = express(); //Creates an Express application.
// let server = https.Server(app);
app.use(cors());

const options = {
    key: fs.readFileSync("privkey.pem"),
    cert: fs.readFileSync("cert.pem"),
};

let server = https.createServer(options, app).listen(PORT, () => {
    console.log("開始監聽port " + PORT);
});



import {
    Server
} from 'socket.io';
let io = new Server(server);



const loginIO = io.of("/lobby"); //遊戲大廳IO
const gameIO = io.of("/game"); //遊戲IO
const qBank = ['銀行', '電風扇', '畫框', '冷氣', '腳踏車', '運動褲', '烘碗機', '皮蛋豆腐', '音樂家', '合唱團', '噴漆', '鋼琴', '書桌', '長笛', '抽油煙機', '直排輪', '布鞋', '按摩椅', '記憶卡', '火車', '計程車', '海螺', '作夢', '茶杯', '水壺', '炸蝦', '望遠鏡', '和室椅', '帥哥', '美女', '口罩', '紅酒', '菜瓜布', '書包', '洗手台', '壽司', '傘蜥', '鉛筆', '鏡子', '行李箱', '機車', '梳子', '棒球', '籃球', '音響', '土星', '耳機', '鍋子', '窗戶', '窗簾', '手槍', '面具', '獨角獸', '鍋燒意麵', '義大利麵', '油漆', '高鐵', '拖鞋', '遊艇', '毛巾', '月球', '地球', '外星人', '墨鏡', '高跟鞋', '果汁機', '電梯', '學校', '糖葫蘆', '拍立得', '運動飲料', '牛奶', '章魚', '白膠', '榕樹', '狗', '冰淇淋', '電磁爐', '手扶梯', '牛仔褲', '衣架', '同學', '相機', '鯊魚', '棉被', '枕頭', '螃蟹', '遙控器', '啤酒', '扁面蛸', '花園鰻', '眼罩', '課本', '鮭魚', '茶碗蒸', '貓頭鷹', '玩偶', '鼓棒', '鴨子', '蝦子', '犀牛', '月老', '鱷魚', '外套', '帳篷', '光碟', '大象', '蓮蓬頭', '垃圾', '檯燈', '羽毛球拍', '衛生紙', '籃子', '洋裝', '蜘蛛', '直升機', '襪子', '魚板', '內褲', '火爐', '流星', '玫瑰花', '炸豬排', '襪子', '披薩', '糖果', '巧克力派', '鬆餅', '牛排', '刀子', '雙節棍', '垃圾桶', '臉盆', '櫃子', '火箭', '串燒', '手電筒', '電視', '梯子', '門把', '海膽', '海星', '企鵝', '巧克力', '滑板', '沙發', '吊燈', '報紙', '鈕扣', '貓咪', '雨衣', '操場', '煙火', '草叢', '雞腿', '電影院', '蜘蛛人', '小提琴', '毛衣', '咖哩飯', '海灘球', '海灘', '機器人', '太陽', '香蕉', '蝴蝶', '地瓜球', '雨傘', '弓箭', '月亮', '燕窩', '滑鼠', '圖書館', '排球', '珍珠奶茶', '紅茶', '綠茶', '剪刀', '膠帶', '手帕', '風箏', '幽靈', '飛碟', '兔子', '長頸鹿', '天線寶寶', '甜甜圈', '恐龍', '烏龍茶', '櫻桃', '蓮霧', '獎盃', '酪梨', '地瓜', '手機', '電腦', '起司', '老鼠', '洋蔥', '蜂蜜', '蜜蜂', '白雲', '龍舟', '聖誕樹'];

// const rooms = gameIO.adapter.rooms; //rooms: Map<Room, Set<SocketId>> //socketId=player


const roomInfo = new Map(); //roomId => {name: '房間1',playerCnt:人數}

//order第0位為猜題者，每輪更新
const playerOrder = new Map(); //roomId => [{id:'socketId', name:'user名稱'},{id:'socketId2', name:'user2名稱'}]

//繪畫者順序，每turn更新
const drawerOrder = new Map(); //roomId => [{id:'socketId', name:'user名稱'},{id:'socketId2', name:'user2名稱'}]

const answerIndex = new Map(); //roomId => 答案的Index
const roundTime = new Map(); //roomId => {current:round時間,roundEnd:round結束時間，-1表示計時停止} //當答對會進行stopRoundTimer，計時停止
const turnTime = new Map(); //roomId => {current:turn時間,turnEnd:turn結束時間，-1表示計時停止} //當畫完一筆會進行stopTurnTimer，計時停止
const roomScore = new Map(); //roomId=>score

//測資 (房間1'idididid1213')
roomInfo.set('idididid1213', {
    name: '房間1',
    playerCnt: 0,
});
playerOrder.set('idididid1213', []);
drawerOrder.set('idididid1213', []);

answerIndex.set('idididid1213', null);
roundTime.set('idididid1213', { current: 0, roundEnd: 60000 });
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
        roundTime.set(roomId, { current: 0, roundEnd: 60000 });
        turnTime.set(roomId, { current: 0, turnEnd: 0 });
        roomScore.set(roomId, 0);
    });

});



gameIO.on('connection', (socket) => {
    socket.on('enter room', (roomId, username) => {
        const room = roomInfo.get(roomId);
        console.log(roomId)
        if (room === undefined) {
            socket.emit('room not exists');
            console.log(room)
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
                updateInfo(socket.id, roomId, username);
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
    });

});

function updateInfo(socketId, roomId, username) {
    const players = playerOrder.get(roomId);
    const drawers = drawerOrder.get(roomId);

    drawers.push({ id: socketId, name: username }); //ps:"leave-room"時要刪除此筆資料
    const ansIndex = answerIndex.get(roomId);
    gameIO.to(roomId).emit('update turn order', drawers); //更新order(加入此user
    gameIO.to(socketId).emit('start new round', players[0].name);
    showAnswer(socketId, ansIndex); //除猜題者外其他皆須收到答案
}

function startRound(roomId, currentIndex = null) {
    const players = playerOrder.get(roomId);
    let arr = Object.assign([], players);
    arr.splice(0, 1);
    drawerOrder.set(roomId, arr); //drawers:除了players第0位為繪者

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

function roundTimer(roomId, roundTimeout = null) {
    const time = roundTime.get(roomId); //目前時間

    if (time == undefined) return;
    const current = time.current;
    const roundEnd = time.roundEnd;
    if (current >= roundEnd) { //當current >= roundEnd時，結束此輪。(包括當roundEnd=-1)
        if (roundTimeout != null) {
            clearTimeout(roundTimeout);
        }
        // console.log("clearTimeout" + " " + roundTimeout + " " + current)
        endRound(roomId);
    } else if (current >= 0) {
        gameIO.to(roomId).emit('update round time', current);
        const rt = setTimeout(() => {
            time.current += 500;
            roundTimer(roomId, rt);
        }, 500);
    }
}

function emitNewGuesser(roomId) {
    const order = playerOrder.get(roomId);
    gameIO.to(order[0].id).emit('guess turn');
}



function startTurn(roomId) {
    const leftTime = 60000 - roundTime.get(roomId).current;
    if (leftTime == 60001) { //round已停止 60000-(-1)
        return;
    }
    const playerCnt = roomInfo.get(roomId).playerCnt;
    const end = leftTime / (playerCnt - 1); //繪者人數為所有玩家人數-1

    let isLastTurn = false;
    if (leftTime <= 3000) {
        isLastTurn = true;
        initTurnTimer(roomId, leftTime);
        // console.log(leftTime + " " + leftTime + " playerCnt " + " leftTime <= 3000")
    } else if (end <= 3000) { //&& leftTime>3000
        initTurnTimer(roomId, 3000);
        // console.log(leftTime + " 3000 " + playerCnt + " end <= 3000")
    } else {
        initTurnTimer(roomId, end);
        // console.log(leftTime + " " + end + " " + playerCnt + " end")

    }
    emitNewOrder(roomId, isLastTurn);
    turnTimer(roomId, isLastTurn);
}



function turnTimer(roomId, isLastTurn, turnTimeout = null) {
    const round = roundTime.get(roomId);
    if (round == undefined) return;
    const roundEnd = roundTime.get(roomId).roundEnd;
    const turn = turnTime.get(roomId);

    if (turn == undefined) {
        return;
    }
    if (roundEnd == -1 || roundEnd == undefined) {
        //round已停止
        return;
    }

    const current = turn.current;
    const turnEnd = turn.turnEnd;
    const drawers = drawerOrder.get(roomId);

    if (current >= turnEnd) { //turnEnd == -1(畫完該turn)或該turn時間到
        stopTurnTimer(roomId);
        gameIO.to(drawers[0].id).emit('update turn time', 0, 1);
        if (turnTimeout != null) {
            clearTimeout(turnTimeout);
        }
        if (!isLastTurn) { //若非最後一輪則restartTurn
            restartTurn(roomId);
        }
    } else {
        if (drawers.length >= 2) {
            gameIO.to(drawers[0].id).emit('update turn time', current, turnEnd);
        }
        const tT = setTimeout(() => {
            turn.current += 500;
            turnTimer(roomId, isLastTurn, turnTimeout);
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
    const time = roundTime.get(roomId).current;
    const addScore = Math.floor((60000 - time) / 60000 * 100);
    roomScore.set(roomId, score + addScore);
    gameIO.to(roomId).emit('update score', score + addScore);
    stopRoundTimer(roomId);
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
    roundTime.set(roomId, { current: 0, roundEnd: 60000 });
}

function stopRoundTimer(roomId) { //當round結束時roundEnd設為-1
    const time = roundTime.get(roomId);
    if (time != undefined) {
        time.roundEnd = -1;
    }
}


function initTurnTimer(roomId, end) {
    turnTime.set(roomId, { current: 0, turnEnd: end })
        // console.log(turnTime.get(roomId).current)
        // console.log(turnTime.get(roomId).turnEnd)
}


function stopTurnTimer(roomId) { //當round結束時turnEnd設為-1
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
    // console.log(order[0])

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
                stopRoundTimer(roomId);
            } else if (socketId === drawer.id) { //離開者為繪畫者，則更新繪畫者
                emitNewOrder(roomId, false);
            }
        }
        loginIO.emit('set login page', Array.from(roomInfo)); //更新其他在(loginIO的sockets)的login畫面
        console.log('socket:' + socketId + ' has leaved room ' + roomId);
    }
});