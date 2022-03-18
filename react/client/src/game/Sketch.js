import React, { useEffect, useState } from 'react';
import Sketch from "react-p5";





const Canvas = (props) => {
    const [p5Api, setApi] = useState(null);
    const [disableDraw, setDisableDraw] = useState(false);

    //繪畫中，滑鼠按下後變為true，放開後變回false;
    const [drawing, setDrawing] = useState(false);

    const setup = (p5, canvasParentRef) => {
        // use parent to render the canvas in this ref
        // (witho   ut that p5 will render the canvas outside of your component)
        const gameCanvas = p5.createCanvas(props.width, props.height).parent(canvasParentRef);
        gameCanvas.id('gameCanvas');
        p5.background(255);
        setApi(p5);
    };

    useEffect(() => {
        if (p5Api != null && props.undrawedRecord) {
            drawLines(p5Api, props.undrawedRecord);
        }
    }, [props.undrawedRecord]);

    useEffect(() => {
        setDisableDraw(props.disable);
    }, [props.disable]);

    useEffect(() => {
        if (p5Api != null && props.undrawedRecord) {
            p5Api.background(255);
        }

    }, [props.clear]);

    const draw = (p5) => {

        let x = p5.mouseX;
        let y = p5.mouseY;
        let px = p5.pmouseX;
        let py = p5.pmouseY;

        if (
            p5.mouseIsPressed &&
            p5.mouseButton === p5.LEFT &&
            !disableDraw &&
            x >= 0 &&
            x <= props.width &&
            y >= 0 &&
            y <= props.height
        ) {
            if (!drawing) {
                setDrawing(true);
            }
            let position = [x, y, px, py];
            p5.strokeWeight(props.strokeWeight);
            p5.stroke(props.strokeColor);
            p5.line(position[0], position[1], position[2], position[3]);
            const record = {
                position: {
                    mouseX: x,
                    mouseY: y,
                    pMouseX: px,
                    pMouseY: py
                },
                color: props.strokeColor,
                weight: props.strokeWeight
            };
            props.emitNewRecord(record);
        }

    };

    const drawLines = (p5, record) => {
        p5.strokeWeight(record.weight);
        p5.stroke(record.color);
        const position = record.position;
        p5.line(position.mouseX, position.mouseY, position.pMouseX, position.pMouseY);
    }

    const mouseReleased = (p5) => {
        if (drawing) {
            setDrawing(false);
            setDisableDraw(true);
            props.emitNextTurn();
        }
    }

    // function mousePressed() {
    //     socket.emit('start clock')
    //     startClock();
    // }



    // function setStrokeColor(color) {
    //     strokeColor = color;
    //     colorSelector.value = color;
    // }

    // function setStrokeWeight(value) {
    //    p5.weight = value;
    //     weightValue.innerHTML = props.strokeWeight;
    // }

    // function drawLine(w, color, position) {
    //     strokeWeight(w);
    //     stroke(color);
    //     line(position[0], position[1], position[2], position[3]);
    // }

    // function saveLine(w, color, position) {
    //     let line = new Map();
    //     line.set('weight', w);
    //     line.set('color', color);
    //     line.set('position', position);
    //     lines.push(line);
    //     tempLineCnt++;
    // }


    // function undoBtnClick() {
    //     // socket.emit('undo', roomId);
    //     undo();
    // }

    // function undo() {
    //     clear();
    //     let last = stepLines.length - 1;
    //     if (last > 0) {
    //         lines.splice(stepLines[last - 1], stepLines[last] - stepLines[last - 1]);
    //         stepLines.splice(last, 1);
    //         reDraw();
    //     } else {
    //         lines = [];
    //         stepLines = [];
    //     }
    // }


    // function reDraw() {
    //     lines.forEach(line => {
    //         let w = line.get('weight');
    //         let color = line.get('color');
    //         let position = line.get('position');
    //         drawLine(w, color, position);
    //     });
    // }
    // // setInterval(() => {
    // //     // socket.emit('start clock')
    // //     startClock();
    // // }, 60000);

    // // function mousePressed() {
    // //     socket.emit('start clock')
    // //     startClock();
    // // }


    // function mouseReleased() {
    //     if (drawing && drawTurn) {
    //         drawing = false;
    //         finishDrawTurn();
    //     }
    // }


    // let lastSec = false;

    // function setClock(turnTotalTime, startSec, recentSec) {
    //     if (drawTurn && !lastSec) {
    //         //因為第0秒跟第60秒的usedTime是一樣的
    //         //所以第59秒時停止計時，透過finishDrawTurn()來記最後一秒
    //         usedTime = ((recentSec - startSec) + 60) % 60;
    //         const turnLeftTime = turnTotalTime - usedTime;
    //         clock.innerHTML = turnLeftTime;
    //         if (turnLeftTime <= 1) {
    //             lastSec = true;
    //             finishDrawTurn();
    //         }
    //     } else if (guessTurn && !lastSec) {
    //         usedTime = ((recentSec - startSec) + 60) % 60;
    //         const countDown = roundLeftTime - usedTime;
    //         clock.innerHTML = countDown;
    //         if (countDown <= 1) {
    //             lastSec = true;
    //             finishGuessTurn();
    //         }
    //     }
    // }

    // function finishDrawTurn() {
    //     //lastSec表示是否因為時間到而停止(最後一秒進入此function)
    //     if (lastSec) {
    //         timeout = 1000;
    //     } else {
    //         timeout = 100;
    //     }
    //     setTimeout(() => {
    //         lastSec = false;
    //         drawTurn = false;
    //         roundLeftTime -= usedTime;
    //         socket.emit('record step', roomId);
    //         recordStep();
    //         socket.emit('end turn', roomId, roundLeftTime);
    //         clock.innerHTML = 0;
    //     }, timeout);
    // }

    // function recordStep() {
    //     let last = stepLines.length - 1;
    //     if (last >= 0) {
    //         tempLineCnt += stepLines[last];
    //     }
    //     stepLines.push(tempLineCnt);
    //     tempLineCnt = 0;
    // }



    // function guessAnswer() {
    //     if (guessTurn) {
    //         let temp = JSON.parse(JSON.stringify(answerInput.value));
    //         if (temp == roundAnswer) {
    //             //剩幾秒就加幾分
    //             const countDown = roundLeftTime - usedTime;
    //             socket.emit('guess right', roomId, countDown);
    //             finishGuessTurn();
    //         } else {
    //             socket.emit('guess wrong', roomId, temp);
    //             answerInput.value = "";
    //         }
    //     }
    // }

    // function finishGuessTurn() {
    //     //lastSec表示是否因為時間到而停止(最後一秒進入此function)
    //     if (lastSec) {
    //         timeout = 1000;
    //     } else {
    //         timeout = 100;
    //     }
    //     setTimeout(() => {
    //         answerInput.readOnly = true;
    //         lastSec = false;
    //         guessTurn = false;
    //         socket.emit('guesser end round', roomId);
    //         clock.innerHTML = 0;
    //     }, timeout);
    // }


    return <Sketch setup = { setup }
    draw = { draw }
    mouseReleased = { mouseReleased }
    />;
};

export default Canvas;