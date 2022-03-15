import React from 'react';
import Palatte from './tools/Palatte';
import WeightBar from './tools/WeightBar';
import './Toolbar.css';
const  Toolbar = (props)=>{

        return (           
            <div className="Toolbar">
            <Palatte color={props.strokeColor} onSelect={props.setStrokeColor}/>
            <WeightBar weight={props.strokeWeight} onChange={props.setStrokeWeight}/>

            <div className="clock" id="clock">
                {props.roundTime}
            </div>

            </div>

        );	


}
export default Toolbar; 