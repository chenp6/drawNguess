const PORT = process.env.PORT || 3000;
import express from 'express'; //載入express框架模組
import http from 'http'; //載入http框架模組
import path from 'path';
const __dirname = path.resolve();

let app = express(); //Creates an Express application.
let server = http.Server(app);



app.use('/', express.static(__dirname));


app.get('/', (req, res) => {
    res.sendFile("/index.html");
});

server.listen(PORT, () => {
    console.log("正在聽" + PORT);
});

import {
    Server
} from 'socket.io';


const io = new Server(server);

const loginIO = io.of("/");
const gameIO = io.of("/game");

// const rooms = gameIO.adapter.rooms; //rooms: Map<Room, Set<SocketId>> //socketId=player


const roomInfo = new Map(); //roomId => {name: '房間1',player:人數}
const playerOrder = new Map(); //roomId => [{id:'socketId', name:'user名稱'},{id:'socketId2', name:'user2名稱'}]
const drawTurn = new Map(); //roomId => index 繪畫者index (p.s.猜測者為第0個)
const roomScore = new Map(); //roomId => score
const answer = new Map(); //roomId => answer
// const playerMap = new Map(); //socketId => playerName
const qBank = ['運動褲','烘碗機','豆腐','音樂家','鋼琴','書桌','長笛','抽油煙機','直排輪','休閒鞋','按摩椅','記憶卡','火車','計程車','茶杯','水壺','內褲','帥哥','美女','口罩','菜瓜布','洗手台','壽司','鍋燒意麵','義大利麵','油漆','遊艇','毛巾','月球','地球','外星人','眼鏡','高跟鞋','果汁機','電梯','牛奶', '章魚', '白膠', '榕樹', '狗', '冰淇淋', '電磁爐', '手扶梯', '牛仔褲', '衣架', '同學', '相機', '棉被', '枕頭'];



//測資
// roomInfo.set('idididid1213', {
//     name: '房間1',
//     player: 0
// });
// playerOrder.set('idididid1213', []);
// drawTurn.set('idididid1213', 1);

// let nameMap = []; //[room_id ,房間名稱} 
loginIO.on('connection', (socket) => {

    socket.on('load login page', () => {
        socket.emit('set login page', Array.from(roomInfo));
    });


    socket.on('add new room', (roomId, roomName) => {
        console.log(roomId + "'s name is " + roomName);
        roomInfo.set(roomId, {
            name: roomName,
            player: 0
        });
        playerOrder.set(roomId, []);
        roomScore.set(roomId, 0);
        answer.set(roomId, null);
    });

});



gameIO.on('connection', (socket) => {

    socket.on('enter room', (roomId, username) => {
        const room = roomInfo.get(roomId);
        if (room === undefined) {
            socket.emit('Room not exists');
            return;
        }
        if (room.player < 6) {
            playerOrder.get(roomId).push({
                id: socket.id,
                name: username
            }); //ps:"leave-room"時要刪除此筆資料
            socket.join(roomId);
        } else {
            socket.emit('Full seat');
        }
    });


    socket.on('draw line', (roomId, weight, color, position) => {
        socket.broadcast.to(roomId).emit('draw line', roomId, weight, color, position);
    });

    socket.on('record step', (roomId) => {
        socket.broadcast.to(roomId).emit('record step', roomId);
    });

    socket.on('undo', (roomId) => {
        socket.broadcast.to(roomId).emit('undo', roomId);
    });

    socket.on('end turn', (roomId, roundLeftTime) => {
        const index = drawTurn.get(roomId);
        const order = playerOrder.get(roomId);

        if (roundLeftTime === 1 || (index >= order.length - 1)) {
            gameIO.to(order[0]).emit('show guesser answer', answer.get(roomId));
            restartRound(roomId);
        } else {
            const next = index + 1;
            const name = roomInfo.get(roomId).name;
            gameIO.to(roomId).emit('set room page', name, order, next, answer.get(roomId), roomScore.get(roomId)); //更新所有(包含自己)同room的room畫面
            const turnTime = Math.floor(roundLeftTime / (order.length - next));
            console.log(index + " " + roundLeftTime + " " + turnTime);
            gameIO.to(order[0].id).emit('guess turn', roundLeftTime);
            gameIO.to(order[next].id).emit('draw turn', turnTime, roundLeftTime);
            drawTurn.set(roomId, next);
        }
    });

    socket.on('guesser end round', (roomId) => {
        const order = playerOrder.get(roomId);
        gameIO.to(order[0]).emit('show guesser answer', answer.get(roomId));     
        restartRound(roomId);
    })


    socket.on('guess right', (roomId, leftTime) => {
        const score = roomScore.get(roomId);
        roomScore.set(roomId, score + leftTime);
        gameIO.to(roomId).emit('guess right', roomId, leftTime);
    });

    socket.on('guess wrong', (roomId, wrongAns) => {
        gameIO.to(roomId).emit('guess wrong', roomId, wrongAns);
    });
});




function startRound(roomId) {
    const preAns = answer.get(roomId);
    let num = Math.floor(Math.random() * (qBank.length));
    while (preAns == qBank[num]) {
        num = Math.floor(Math.random() * (qBank.length));
    }
    answer.set(roomId, qBank[num]);
    const name = roomInfo.get(roomId).name;
    const order = playerOrder.get(roomId);
    drawTurn.set(roomId, 1);
    console.log('start new round');
    // 'set room page', (name, order, drawIndex, answer, score)
    gameIO.to(roomId).emit('set room page', name, order, 1, answer.get(roomId), roomScore.get(roomId)); //更新所有(包含自己)同room的room畫面
    gameIO.to(order[0].id).emit('guess turn', 60);
    const turnTime = Math.floor(60 / (order.length - 1));
    gameIO.to(order[1].id).emit('draw turn', turnTime, 60);
}


function endRound(roomId) {
    const order = playerOrder.get(roomId); //該room的player order
    const first = order.shift();
    order.push(first);
}

function restartRound(roomId) {
    const order = playerOrder.get(roomId); //該room的player order
    if (order === undefined) {
        console.log('order undefined');
        return;
    }
    endRound(roomId);
    gameIO.to(roomId).emit('restart round');
    setTimeout(() => {
        startRound(roomId);
    }, 2000);

}


gameIO.adapter.on("join-room", (roomId, socketId) => {
    if (roomId != socketId) {
        const info = roomInfo.get(roomId);
        info.player += 1;
        loginIO.emit('set login page', Array.from(roomInfo)); //更新其他在(loginIO的sockets)的login畫面

        if (info.player < 2) {
            gameIO.to(socketId).emit('wait other player');
        } else if (info.player === 2) {
            startRound(roomId);
        } else {
            const order = playerOrder.get(roomId);
            console.log('join room ' + order);
            gameIO.to(roomId).emit('set room page', info.name, order, drawTurn.get(roomId), answer.get(roomId), roomScore.get(roomId)); //更新所有(包含自己)同room的room畫面
        }
    }
});

gameIO.adapter.on("leave-room", (roomId, socketId) => {
    if (roomId != socketId) { //socketId都會預設進入與自己名稱相同的roomId (roomId == socketId)

        let order = playerOrder.get(roomId);
        order = order.filter(player => player.id != socketId);
        playerOrder.set(roomId, order);

        const info = roomInfo.get(roomId);
        info.player -= 1;

        if (info.player == 0) { //該房間所有人都離開時，delete房間
            roomInfo.delete(roomId);
            playerOrder.delete(roomId);
        } else if (info.player == 1) {
            gameIO.to(roomId).emit('wait other player');
        } else {
            restartRound();
        }
        loginIO.emit('set login page', Array.from(roomInfo)); //更新其他在(loginIO的sockets)的login畫面
        console.log('socket:' + socketId + ' has leaved room ' + roomId);
    }
});