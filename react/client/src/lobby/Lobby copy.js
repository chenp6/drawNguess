// import logo from './logo.svg';
import React, { useState ,useEffect} from 'react';
import webSocket from "socket.io-client";
import RoomContainer from './RoomContainer';
import Room from './Room';
import CustomRoom from './CustomRoom';
import './Lobby.css';

const Lobby = () => {

  const [rooms, setRoom] = useState([]);
  const [selectedId,selectId] = useState("");
  const [customRoomName,inputRoomName] = useState("");
  const [username,setUsername] = useState("");
  const [socket,setWs] = useState(null)

  setWs(webSocket('https://cip.nknu.edu.tw:57502/lobby'));

  useEffect(()=>{
    if(socket){
        //連線成功在 console 中打印訊息
        console.log('success connect!')
        //設定監聽
    }
  },[socket])


  // const url = "http://localhost:57502/lobby";

  // const socket=io.connect(url, { "transports": ['websocket'] });
  // const socket= webSocket(url);

  useEffect(() => { 
    // setSocket(webSocket(url));
    // // setSocket();
    if(socket){
      socket.on("connect", () => {
        //連上線後node console 顯示 'this player connected'
        console.log('this player connected');
        socket.emit('load login page');//傳送load login畫面請求
      });
      socket.on('set login page', (roomInfo) => { //接收到login畫面資訊
        setLoginPage(roomInfo);//依照畫面資訊(房間資訊)設定login畫面
      });
    }

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

    if (selectedId === "") { //未選擇房間
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

    sessionStorage.setItem("username", username);
    sessionStorage.setItem("room_id", roomId);

    window.location.href = './#/game';

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