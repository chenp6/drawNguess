import React from 'react';
import avatar1x from './img/avatar1x.png';
import './Room.css';
class Room extends React.Component {

    render() {
        return (
            <label>
                <input disabled={this.props.playerCnt>=6?true:false} type="radio"  name="roomSelector"  value={this.props.roomId} onChange={(e)=>{this.props.select(this.props.roomId)}}/>
                <span  className="room">
                    <div className='room_input'>{this.props.name}</div>
                    <div className="counter_container">
                        <img srcSet={`${avatar1x} 1x, ${avatar1x} 2x,${avatar1x} 3x`} src={avatar1x} alt="painter"/>
                        <div className="counter">{this.props.playerCnt}/6</div>
                 </div>
                </span>
            </label>
        )
    }
}

export default Room;




