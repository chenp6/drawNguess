# 一筆鴉鴉
## 規則說明
遊戲規則說明:

(1)每一輪:

    a)時間為60秒
    
    b)一題題目
    
    c)一個猜題者，其他皆為繪畫者
    
    d)猜題與繪圖者，每輪會輪流擔任

(2)猜題者:

    在60秒的猜題時間內，猜出隊友所畫的圖  (畫面右上方會顯示從60秒開始的倒數計時)

(3)繪畫者:

    a)每輪，一名繪畫者僅有一筆
    
    b)若輪到該繪畫者時，其右上角倒數計時器會開始從【該筆的時間限制】開始倒數  (該筆的時間限制:由該輪剩餘秒數平分決定)


## 遊戲啟動方式 (本地端Window)
### Server(Window):  set PORT={自訂port1} && node server_localUse.js
### Client(Window):  set PORT={自訂port2} && react-scripts start
    Game.js與Lobby.js中的url換成 {內網IP}:{自訂port1}/

## 遊戲啟動方式 (遠端Linux)
### Server(Window): cross-env PORT={自訂port} node server.js
### Client(Window): cross-env PORT={自訂port} react-scripts start  
    Game.js與Lobby.js中的url換成 localhost:{自訂port1}/


## 架構設計
  位於docs/架構設計.ppt

## 檔案位置
【react版本持續更新中】   
server    
&emsp;|_server.js (伺服器:控制房間人數、題目與分數等後台資料)   
client   
&emsp;|_public   
&emsp;emsp;|_index.html (遊戲首頁html)     
&emsp;|_src   
&emsp;&emsp;|_index.js (遊戲client React程式起始點)   
&emsp;&emsp;|_lobby (遊戲大廳)    
&emsp;&emsp;&emsp;|_Lobby.js (遊戲大廳元件)   
&emsp;&emsp;&emsp;|_Lobby.css   
&emsp;&emsp;&emsp;|_RoomContainer.js (房間按鈕容器-卷軸視窗)   
&emsp;&emsp;&emsp;|_RoomContainer.css   
&emsp;&emsp;&emsp;|_Room.js (房間按鈕元件)   
&emsp;&emsp;&emsp;|_Room.css   
&emsp;&emsp;&emsp;|_CustomRoom.js (自訂房間按鈕元件)   
&emsp;&emsp;&emsp;|_img (lobby圖片資料夾)   
&emsp;&emsp;|_game (遊戲房間)   
&emsp;&emsp;&emsp;|_Game.js (遊戲房間元件)   
&emsp;&emsp;&emsp;|_Game.css   
&emsp;&emsp;&emsp;|_Board.js (畫布元件)   
&emsp;&emsp;&emsp;|_ProgressBar.js (時間進度條元件)   
&emsp;&emsp;&emsp;|_Sketch.js (畫布元件)   
&emsp;&emsp;&emsp;|_Toolbar.js (繪畫工具列元件)   
&emsp;&emsp;&emsp;|_Toolbar.css   
&emsp;&emsp;&emsp;|_tools (工具列各元件資料夾)   
&emsp;&emsp;&emsp;&emsp;|_Palatte.js (調色盤元件)   
&emsp;&emsp;&emsp;&emsp;|_Palatte.css  
&emsp;&emsp;&emsp;&emsp;|_WeightBar.js (筆刷大小(調整卷軸)元件)   
&emsp;&emsp;&emsp;&emsp;|_img (lobby圖片資料夾)

【no-react版本資料已停止更新】

server.js (伺服器JS) 

index.js (遊戲大廳JS)

index.html(遊戲大廳HTML)

style.css(遊戲大廳CSS)

docs(dir)

&emsp;|_架構設計.ppt

game(dir)

&emsp;|_index.js (遊戲site(房間JS))

&emsp;|_index.html(遊戲site(房間HTML))

&emsp;|_style.css(房間CSS)


