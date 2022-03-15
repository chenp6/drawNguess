import React from 'react';
import Sketch from "react-p5";

const ProgressBar = (props) => {

    const setup = (p5, canvasParentRef) => {
        const progressBar = p5.createCanvas(1000, 20).parent(canvasParentRef);
        progressBar.id('progressBar');
        p5.background('#b8d6da');

    };
    const draw = (p5) => {

        p5.background('#b8d6da');
        let middle = 0;
        let sVal = props.turnProgress;
        // console.log(props.counter);

        //map(currentValue,rateStart,rateEnd,realStart,realEnd)
        //current:相對現在位置 rateStart:相對比起始點  rateEnd:相對比例結束點
        //realStart:畫面上實際起始位置   realEnd:畫面上實際結束位置
        let Progress = p5.map(sVal, 0, 100, 0, p5.width);

        p5.fill(63, 72, 294);
        // p5.textSize(32);
        // p5.textFont('monospace')
        // let txt = p5.text('Progress : ' + sVal + '%', 0, middle - 20);

        p5.rect(0, middle, Progress, 20, 15)
        p5.stroke(63, 72, 294)
        p5.noFill();
        p5.rect(0, middle, p5.width, 20, 15)

    };



    return <Sketch setup = { setup }
    draw = { draw }
    />;
};

export default ProgressBar;