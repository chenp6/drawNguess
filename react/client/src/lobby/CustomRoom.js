import React from 'react';
import avatar1x from './img/avatar1x.png';
import './Room.css';

class CustomRoom extends React.Component {
    render() {
        return (
            <label>
                <input type="radio"  name="roomSelector"  value="custom" onChange={(e)=>{this.props.select("custom");}}/>
                <span  className="room">
                    <input className='room_input' id='roomNameInput' placeholder='自建房間' onChange={(e)=>{this.props.inputName(e.target.value);}}/>
                    <div className="counter_container">
                        <img srcSet={`${avatar1x} 1x, ${avatar1x} 2x,${avatar1x} 3x`} src={avatar1x} alt="painter"/>
                        <div className="counter">0/6</div>
                 </div>
                </span>
            </label>
        )
    }
}

export default CustomRoom;

