"use strict";

var _express = _interopRequireDefault(require("express"));

var _http = _interopRequireDefault(require("http"));

var _path = _interopRequireDefault(require("path"));

var _socket = require("socket.io");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var PORT = process.env.PORT || 3001;

var _dirname = _path["default"].resolve();

var app = (0, _express["default"])(); //Creates an Express application.

var server = _http["default"].Server(app);

app.use('/', _express["default"]["static"](_dirname));
server.listen(PORT, function () {
  console.log("正在聽" + PORT);
});
var io = new _socket.Server(server);
var loginIO = io.of("/lobby"); //遊戲大廳IO

var gameIO = io.of("/game"); //遊戲IO

var qBank = ['錢包', '電風扇', '冷氣', '腳踏車', '運動褲', '烘碗機', '豆腐', '音樂家', '鋼琴', '書桌', '長笛', '抽油煙機', '直排輪', '布鞋', '按摩椅', '記憶卡', '火車', '計程車', '茶杯', '水壺', '炸蝦', '內褲', '帥哥', '美女', '口罩', '紅酒', '菜瓜布', '洗手台', '壽司', '傘蜥', '鉛筆', '鏡子', '行李箱', '機車', '梳子', '棒球', '籃球', '音響', '耳機', '鍋子', '窗戶', '窗簾', '手槍', '面具', '獨角獸', '鍋燒意麵', '義大利麵', '油漆', '遊艇', '毛巾', '月球', '地球', '外星人', '眼鏡', '高跟鞋', '果汁機', '電梯', '牛奶', '章魚', '白膠', '榕樹', '狗', '冰淇淋', '電磁爐', '手扶梯', '牛仔褲', '衣架', '同學', '相機', '棉被', '枕頭']; // const rooms = gameIO.adapter.rooms; //rooms: Map<Room, Set<SocketId>> //socketId=player

var roomInfo = new Map(); //roomId => {name: '房間1',playerCnt:人數}

var playerOrder = new Map(); //roomId => [{id:'socketId', name:'user名稱'},{id:'socketId2', name:'user2名稱'}]

var answer = new Map(); //roomId => answer
//測資 (房間1'idididid1213')

roomInfo.set('idididid1213', {
  name: '房間1',
  playerCnt: 0
});
playerOrder.set('idididid1213', []);
loginIO.on('connection', function (socket) {
  socket.on('load login page', function () {
    socket.emit('set login page', Array.from(roomInfo));
  });
  socket.on('add new room', function (roomId, roomName) {
    console.log(roomId + "'s name is " + roomName);
    roomInfo.set(roomId, {
      name: roomName,
      playerCnt: 0
    });
    playerOrder.set(roomId, []);
    answer.set(roomId, null);
  });
});
gameIO.on('connection', function (socket) {
  socket.on('enter room', function (roomId, username) {
    var room = roomInfo.get(roomId);

    if (room === undefined) {
      socket.emit('room not exists');
      return;
    }

    if (room.playerCnt < 6) {
      var order = playerOrder.get(roomId);
      order.push({
        id: socket.id,
        name: username
      }); //ps:"leave-room"時要刪除此筆資料

      socket.join(roomId);

      if (room.playerCnt < 2) {
        socket.emit('wait for teammate');
      } else if (room.playerCnt == 2) {
        gameIO.to(roomId).emit('start game', order);
      }
    } else {
      socket.emit('full seat');
    }
  });
  socket.on('draw record', function (record, roomId) {
    //此socket外的其他網頁都會觸發'hi'事件
    socket.broadcast.to(roomId).emit('draw record', record); //在server端的反應
  });
  socket.on('end round', function (roomId) {
    var currentAns = answer.get(roomId);
    var order = playerOrder.get(roomId);
    gameIO.to(order[0]).emit('show answer', currentAns);
    var num = Math.floor(Math.random() * qBank.length);
    var nextAns = qBank[num];

    while (currentAns == nextAns) {
      num = Math.floor(Math.random() * qBank.length);
      nextAns = qBank[num];
    }

    setTimeout(function () {
      gameIO.to(roomId).emit('new round', order);
    });
  });
});
gameIO.adapter.on("join-room", function (roomId, socketId) {
  if (roomId != socketId) {
    roomInfo.get(roomId).playerCnt += 1;
    var name = roomInfo.get(roomId).name;
    var order = playerOrder.get(roomId); //該room的player order

    gameIO.to(roomId).emit('set room page', name, order); //更新其他同room的room畫面

    loginIO.emit('set login page', Array.from(roomInfo)); //更新其他在(loginIO的sockets)的login畫面

    console.log('socket:' + socketId + ' has joined room ' + roomId);
  }
});
gameIO.adapter.on("leave-room", function (roomId, socketId) {
  if (roomId != socketId) {
    //socketId:預設會進入與自己名稱相同的roomId(roomId == socketId)
    // 另外，透過程式會進入另一個與其他人共用的roomId (roomId !== socketId)
    //=>一個用戶會同時進入兩個socket(自己和與大家共用)
    var order = playerOrder.get(roomId);
    order = order.filter(function (player) {
      return player.id != socketId;
    });
    playerOrder.set(roomId, order);
    var info = roomInfo.get(roomId);
    info.playerCnt -= 1;

    if (info.playerCnt == 0) {
      //該房間所有人都離開時，delete房間
      roomInfo["delete"](roomId);
      playerOrder["delete"](roomId);
    } else if (info.playerCnt == 1) {
      gameIO.to(roomId).emit('wait for teammate');
    } else {
      gameIO.to(roomId).emit('set room page', info.name, order); //更新其他同room的room畫面
    }

    loginIO.emit('set login page', Array.from(roomInfo)); //更新其他在(loginIO的sockets)的login畫面

    console.log('socket:' + socketId + ' has leaved room ' + roomId);
  }
});