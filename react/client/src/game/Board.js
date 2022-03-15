import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import Toolbar from './Toolbar';
import Sketch from './Sketch';

const Board = (props) => {
    const [strokeWeight,setStrokeWeight] = useState(4);
    const [strokeColor,setStrokeColor] = useState("#000000");

    return (
        <div>
            <Toolbar roundTime={props.roundTime} strokeColor={strokeColor} strokeWeight={strokeWeight} setStrokeColor={setStrokeColor} setStrokeWeight={setStrokeWeight} />
            <Sketch disable={props.disable} undrawedRecord={props.undrawedRecord} emitNewRecord={props.emitNewRecord} width={1000} height={350} strokeColor={strokeColor} strokeWeight={strokeWeight}  />
        </div>
    );
}
export default Board;