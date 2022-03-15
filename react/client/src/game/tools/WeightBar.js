import React from 'react';
const  WeightBar=(props)=>{
        return (           
            <div className="WeightBar">
                <input type="range" name="weightValue" min="1" max="20" value={props.weight} onChange={(event)=>{props.onChange(event.target.value)}}/>
                <div style={{textAlign:'center'}}>
                    筆刷大小:
                    <b id="weightValue" style={{fontSize: 'large'}}>{props.weight}</b>
                    </div>
            </div>
        );	
}

export default WeightBar;

