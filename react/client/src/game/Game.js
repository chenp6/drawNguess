import React, { useState } from 'react';
import { io } from "socket.io-client";
import Board from './Board';
import ProgressBar from './ProgressBar';
import './Game.css';
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




class Game extends React.Component {

  constructor(props) {
    super(props);

    this.setStrokeColor = this.setStrokeColor.bind(this);
    this.setStrokeWeight = this.setStrokeWeight.bind(this);
    this.guessAnswer = this.guessAnswer.bind(this);
    const url = "http://localhost:3001/game";

    this.socket = io.connect(url, {
      "transports": ['websocket']
    });
    this.state = {
      'strokeColor': '#000000',
      'strokeWeight': 4,
      'undrawedRecord': null,
      'infoContent': "",
      'drawOrder': "",
      "drawer": "",
      'guesser': '',
      'disableToDraw': true,
      'disableToGuess': true,
      'turnProgress': 0,
      'roundTime': 60,
      'progressBarSec': 0,
      'answer': '',
    };
  }

  render() {
    return (
      <div className='Game'>
        <p style={{ height: '10px', margin: "0px" }}>
          <span>得分:</span>
          <span id="score">0</span>
          <button style={{ marginLeft: "20px" }} onClick={() => { this.goBackgoBack() }}>不要按，很痛</button>
        </p>
        <div>
          <p id="info" style={{ height: '10px' }}>{this.state.answer}{this.state.infoContent}</p>
          <p id="order" style={{ height: '10px' }}>{this.state.guesser} {this.state.drawer} {this.state.drawOrder}</p>
        </div>
        <AnswerBox disable={this.state.disableToGuess} guessAnswer={this.guessAnswer} />

        {/* <div id="canvasSpace"> */}
        {/* <Toolbar roundTime={this.state.roundTime} strokeColor={this.state.strokeColor} strokeWeight={this.state.strokeWeight} setStrokeColor={this.setStrokeColor} setStrokeWeight={this.setStrokeWeight} undoState={this.onUndo} /> */}
        <Board disable={this.state.disableToDraw} roundTime={this.state.roundTime} undrawedRecord={this.state.undrawedRecord} emitNewRecord={this.emitNewRecord} />
        <ProgressBar counter={this.state.progressBarSec} turnProgress={this.state.turnProgress} />
        {/* </div> */}
      </div>
    );
  }
  componentDidMount() {

    this.socket.on("connect", () => {
      //連上線後node console 顯示 'this device connected'
      console.log('this player connected');
      this.socket.emit('enter room', roomId, username);
    });

    this.socket.on("room not exists", () => {
      alert("房間已不存在");
      window.location.href = './lobby';
    });

    this.socket.on("full seat", () => {
      alert("房間人數已滿");
      window.location.href = './lobby';
    });

    this.socket.on("wait for teammate", () => {
      this.setState({ 'answer': "" });
      this.resetScreen();
      this.setState({ 'infoContent': "等待玩家進入。。。" });
    });



    this.socket.on('wait new round', () => {
      this.setState({ 'infoContent': "開啟下一輪遊戲中~" });
    });


    this.socket.on('reset screen', () => {
      this.resetScreen();//除了answer其他清空
    });

    this.socket.on("update round time", (time) => {
      const sec = Math.floor(time / 1000);
      this.setState({ 'roundTime': 60 - sec });
    });

    this.socket.on("update turn time", (current, end) => {
      this.setState({ 'turnProgress': (current / end)*100 });
    });


    this.socket.on("update turn order", (order) => {
      this.setState({ 'infoContent': "" });
      const nameList = order.map(player => player.name);
      this.setState({ 'guesser': "猜題者：" + nameList[0] + "\u2003" });
      this.setState({ 'drawer': "繪題者：" + nameList[1] + "\u2003" });
      nameList.splice(0, 1);//第0個為出題者不加入繪畫
      this.setState({ "drawOrder": "繪畫順序 : " + nameList.toString() });
    });

    this.socket.on("draw turn", () => {
      this.setState({ 'disableToDraw': false });
      this.setState({ 'drawer': "繪題者：" + username + "【You!!】" + "\u2003" });
    });

    this.socket.on("guess turn", () => {
      this.setState({ 'disableToGuess': false });
      this.setState({ 'guesser': "猜題者：" + username + "【You!!】\u2003" });
    });

    this.socket.on("show answer", (answer) => {
      this.setState({ 'answer': "答案：" + answer + "\u2003" });
    });

    this.socket.on("show guess answer",(guessAnswer,right)=>{
      if(right){
        this.setState({ 'infoContent': "猜測者猜到了!!" + "\u2003" });
      }else{
        this.setState({ 'infoContent': "猜測者猜"+guessAnswer + "\u2003" });
      }
    })


    this.socket.on("draw record", (record) => {
      this.setState({ 'undrawedRecord': record });
    });


  }

  /**
   * 除了answer其他round screen物件清空
   */
  resetScreen = () => {
    this.setState({ 'drawOrder': "" });
    this.setState({ 'drawer': "" });
    this.setState({ 'guesser': "" });
    this.setState({ 'disableToDraw': true });
    this.setState({ 'disableToGuess': true });
    this.setState({ 'turnProgress': 0 });
    this.setState({ 'roundTime': 0 });
    this.setState({ 'progressBarSec': 0 });
  }

  goBackgoBack = () => {
    window.location.href = 'https://www.youtube.com/watch?v=7VFTcmGRM-k';
  }

  guessAnswer = () => {

  }
  setStrokeColor = (color) => {
    console.log(color);
    this.setState({ 'strokeColor': color });
  }

  setStrokeWeight = (weight) => {
    this.setState({ 'strokeWeight': weight });
  }

  emitNewRecord = (record) => {
    this.socket.emit('draw record', record, roomId);
  }

  // progressCounter() {
  //   let sec = this.state.progressBarSec;
  //   if (sec < 60) {
  //     sec++;
  //     this.setState({ 'progressBarSec': sec })
  //     setTimeout(() => { this.progressCounter() }, 500)
  //   } else {
  //     this.setState({ 'progressBarSec': 0 })
  //   }
  // }

  // setUndoState(){
  //   this.setState({'onUndo':true});
  // }

}

export default Game;

const AnswerBox = function (props) {
  const [answerInput, setAnswerInput] = useState('');
  return (
    <div id="answerSpace">
      <input id="answerInput" type="text" name="answer" readOnly={props.disable}
        value={props.disableToGuess} onChange={(event) => setAnswerInput(event.target.value)}
      />
      <button onClick={(e) => { props.guessAnswer() }}>送出</button>
    </div>
  );
}
