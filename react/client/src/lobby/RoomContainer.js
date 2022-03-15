import React from 'react';
import './RoomContainer.css';

class RoomContainer extends React.Component {


    render() {
        return (
            // room_window:捲軸容器
            <div  id="room_window"> 
                <div id="room_box">
                        <b id="loadingBar">loading...</b>
                        {/* <select id="roomSelector"> */}

                        {this.props.rooms}
                        {/* </select> */}
                        {/* <CustomRoom key="custom"/> */}
                </div>
            </div>
        )
    }



    componentDidMount(){
       
        // const a = React.Children.getElementById('roomContainer')
        // const child = React.createElement("Room")
        // a.appendChild(child)
        const loadingBar = document.getElementById('loadingBar');
        loadingBar.style.display = "none";
        console.log("mounted!")
    }
}

export default RoomContainer;

// //set select option button html
// let roomNameHTML = "<input className='room_input' id='roomNameInput' placeholder='自建房間'/>"; //預設:自建房間名稱顯示框

// $("#roomSelector option").unwrap().each(function roomBtnSetting() {
//     let info = "<div className='counter_container'><img srcSet={`${avatar1x} 1x, ${avatar1x} 2x,${avatar1x} 3x`} src={avatar1x} alt='painter'/> <div className='counter'> $(this).text()</div></div>";
//     let btn = $('<button value="custom" className="room" >'  +roomNameHTML+ info + '</button>');
//     if (!$(this).is(':checked')) btn.addClass('on');
//     $(this).replaceWith(btn);
// });
