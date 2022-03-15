// import logo from './logo.svg';
import React, { useState ,useEffect} from 'react';
import { io } from "socket.io-client";

import RoomContainer from './RoomContainer';
import Room from './Room';
import CustomRoom from './CustomRoom';
import './Lobby.css';


const Lobby = () => {
  const [rooms, setRoom] = useState([]);
  const [selectedId,selectId] = useState("custom");
  const [customRoomName,inputRoomName] = useState("");
  const [username,setUsername] = useState("");
  const url = "http://localhost:3001/lobby";

  const socket=io.connect(url, { "transports": ['websocket'] });


  useEffect(() => {
    // setSocket(webSocket(url));
    // // setSocket();
    socket.on("connect", () => {
      //連上線後node console 顯示 'this player connected'
      console.log('this player connected');
      socket.emit('load login page');//傳送load login畫面請求
    });
    socket.on('set login page', (roomInfo) => { //接收到login畫面資訊
      setLoginPage(roomInfo);//依照畫面資訊(房間資訊)設定login畫面
    });
  },[]);


  return (
    <div className="Lobby">
      <main className="big_container">
        <div>
          <RoomContainer rooms={rooms}/>
        </div>
        <div className="login_container">
          <input type="text" className="username_input" id="usernameInput" placeholder="Enter your name" onChange={(e)=>{setUsername(e.target.value)}}/>
          <button className="loginBtn" onClick={()=>{enterRoom()}}>進入房間</button>
        </div>
      </main>
    </div>
  );



  function setLoginPage(roomInfo){
    const roomList = [<CustomRoom key={"customRoom"} select={selectId} inputName={inputRoomName}/>];
    const roomMap = new Map(roomInfo);
    for (const [id, info] of roomMap) {
      console.log(id+" "+info.playerCnt);
      roomList.push(<Room id={id} key={id} roomId={id} name={info.name} playerCnt={info.playerCnt} select={selectId}/>);
    }
    setRoom(roomList);
  }



  function enterRoom(){
    let roomId;
    if (username === "") {
        alert('請在下方輸入框輸入你的暱稱');
        return;
    }

    if (selectedId === undefined) { //未選擇房間
        alert('請選擇房間');
        return;
    } else if (selectedId === "custom") { //自建房間
        roomId = randomRoomNum();
        if (customRoomName === "") {
            alert('請輸入你的房間名稱');
            return;
        }
        if(socket){
          socket.emit('add new room', roomId, customRoomName);
        }
    } else { //進入他人房間
        roomId = selectedId;
    }

    sessionStorage.setItem("room_id", roomId);
    sessionStorage.setItem("username", username);
    window.location.href = './game';

  }




}

export default Lobby;



function randomRoomNum(){
  let str = "";
  for (let i = 0; i < 6; i++) {

      let toLowercase = Math.floor(Math.random() * 2) * 32; // 97 - 65 = 32  //小寫:toLowercase = 32  // 大寫:toLowercase = 0
      let temp = Math.floor(Math.random() * 26) + 65 + toLowercase;
      str += String.fromCharCode(temp);
  }
  return str;
}