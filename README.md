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




## 架構設計
  位於docs/架構設計.ppt

## 檔案位置

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


