import React from 'react';
import './Palatte.css';
const Palatte = (props)=>{

        return (           
          <div className='Palatte'>
            <div className='defaultColor'>
            <button style={{backgroundColor: '#000000'}} onClick={()=>props.onSelect('#000000')}></button> 
            <button style={{backgroundColor: '#7F7F7F'}} onClick={()=>props.onSelect('#7F7F7F')}></button>
            <button style={{backgroundColor: '#880015'}} onClick={()=>props.onSelect('#880015')}></button>
            <button style={{backgroundColor: '#ff0000'}} onClick={()=>props.onSelect('#ff0000')}></button>
            <button style={{backgroundColor: '#FF7F27'}} onClick={()=>props.onSelect('#FF7F27')}></button>
            <button style={{backgroundColor: '#22B14C'}} onClick={()=>props.onSelect('#22B14C')}></button>
            <button style={{backgroundColor: '#0000ff'}} onClick={()=>props.onSelect('#0000ff')}></button>
            <button style={{backgroundColor: '#3F48CC'}} onClick={()=>props.onSelect('#3F48CC')}></button>
            <button style={{backgroundColor: '#A349A4'}} onClick={()=>props.onSelect('#A349A4')}></button>

            <br/>
            <button style={{backgroundColor: '#ffffff'}} onClick={()=>props.onSelect('#ffffff')}></button> 
            <button style={{backgroundColor: '#C3C3C3'}} onClick={()=>props.onSelect('#C3C3C3')}></button>
            <button style={{backgroundColor: '#B5895E'}} onClick={()=>props.onSelect('#B5895E')}></button>        
            <button style={{backgroundColor: '#FFAEC9'}} onClick={()=>props.onSelect('#FFAEC9')}></button>
            <button style={{backgroundColor: '#FFC90E'}} onClick={()=>props.onSelect('#FFC90E')}></button>
            <button style={{backgroundColor: '#B5E61D'}} onClick={()=>props.onSelect('#B5E61D')}></button>
            <button style={{backgroundColor: '#99D9EA'}} onClick={()=>props.onSelect('#99D9EA')}></button>
            <button style={{backgroundColor: '#7092BE'}} onClick={()=>props.onSelect('#7092BE')}></button>
            <button style={{backgroundColor: '#C8BFE7'}} onClick={()=>props.onSelect('#C8BFE7')}></button>
            </div>

            <input className="color_selector" id="colorSelector" type="color"  value={props.color} onInput={(event)=>props.onSelect(event.target.value)}/>

          </div>
        );	
}

export default Palatte;

