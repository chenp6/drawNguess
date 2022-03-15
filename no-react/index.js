const roomContainer = document.getElementById('roomContainer');

//==============================================
//socket on listen

const url = "/";
const socket = io.connect(url, {
    "transports": ['websocket']
});

let rooms = new Map(); //roomId => {name: '房間1',player:人數}

socket.on('connect', () => {
    socket.emit('load login page');
});

socket.on('set login page', (roomInfo) => {
    roomContainer.innerHTML = ""; //清空room container
    buildRoom('custom', 'custom', 0); //建立自訂房間按鈕
    rooms = new Map(roomInfo);
    for (const [id, info] of rooms) {
        buildRoom(id, info.name, info.player); //建立一般房間按鈕
    }
});
//========================================================================



//================================================
//設定房間按鈕  room button setting

//房間名稱框html
let roomNameHTML = "<input class='room_input' id='roomNameInput' placeholder='自建房間'>"; //預設:自建房間名稱顯示框

//set select option button html
$(".room_selector option").unwrap().each(function roomBtnSetting() {
    let info = "<div class='counter_container'> <img srcset='img/avatar1x.png 1x, img/avatar1x.png 2x,img/avatar1x.png 3x' src='img/avatar1x.png'>   <div class='counter'>" + $(this).text() + "</div></div>";
    let btn = $('<button value="custom" class="room" onclick="selectRoom(this.value)">' + roomNameHTML + info + '</button>');
    if (!$(this).is(':checked')) btn.addClass('on');
    $(this).replaceWith(btn);
});

//select room action
let selectedRoom;
//set select button isSelected css class
$(document).on('click', '.room', function() {
    $('.room').removeClass('on');
    $(this).addClass('on');;
});

function selectRoom(id) {
    selectedRoom = id;
}

function buildRoom(id, name, player) { //custom的id,name為custom

    //建立按鈕
    let roomBtn = document.createElement('button');
    roomBtn.setAttribute('class', 'room');
    roomBtn.setAttribute('value', id);
    let onclick = roomBtn.getAttribute("onclick");
    roomBtn.setAttribute('onclick', 'selectRoom(this.value);' + onclick); // for FF,IE8,Chrome
    if (id === 'custom')
        roomNameHTML = "<input class='room_input' id='roomNameInput' placeholder='自建房間'>"; //預設:自建房間名稱顯示框
    else
        roomNameHTML = "  <div class='room_input'>" + name + "</div> "; //一般房間名稱顯示框
    let info = " <div class='counter_container'>    <img srcset='img/avatar1x.png 1x, img/avatar1x.png 2x,img/avatar1x.png 3x' src='img/avatar1x.png'>       <div  class='counter'>" + player + "/6</div></div>";
    roomBtn.innerHTML = roomNameHTML + info;

    //新增選項
    roomContainer.appendChild(roomBtn);
}


//==============================================

//=======================================================================
//enter room
function enterRoom() {
    let roomId;
    const username = document.getElementById('usernameInput').value;

    if (username === "") {
        alert('請在下方輸入框輸入你的暱稱');
        return;
    }

    if (selectedRoom === undefined) { //未選擇房間
        alert('請選擇房間');
        return;
    } else if (selectedRoom === "custom") { //自建房間
        roomId = randomRoomNum();
        let roomName = document.getElementById('roomNameInput').value;
        if (roomName === "") {
            alert('請輸入你的房間名稱');
            return;
        }
        socket.emit('add new room', roomId, roomName);
    } else { //進入他人房間
        roomId = selectedRoom;
    }

    sessionStorage.setItem("room_id", roomId);
    sessionStorage.setItem("username", username);
    location.href = 'game/index.html';

}

function randomRoomNum() {
    let str = "";
    for (let i = 0; i < 6; i++) {

        let toLowercase = Math.floor(Math.random() * 2) * 32; // 97 - 65 = 32  //小寫:toLowercase = 32  // 大寫:toLowercase = 0
        let temp = Math.floor(Math.random() * 26) + 65 + toLowercase;
        str += String.fromCharCode(temp);
    }
    return str;
}