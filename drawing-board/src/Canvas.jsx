import {ReactSketchCanvas} from "react-sketch-canvas";

import {ChangeEvent, useRef, useState} from "react"

function Canvas(){
    const canvasRef = useRef(null);
    const [eraseMode, setEraseMode] = useState(false)
    const [strokeWidth, setStrokeWidth] = useState(5)
    const [eraseWidth, setEraseWidth] = useState(5)

    const [strokeColor, setStrokeColor] = useState("#000000")
    const [canvasColor, setCanvasColor] = useState("#ffffff")


    const handleEraser = () => {
        setEraseMode(true)
        canvasRef.current?.eraseMode(true);
    }

    const handlePenClick = () => {
        setEraseMode(false)
        canvasRef.current?.eraseMode(false)
    }

    const handleStrokeWidth = (event) => {
        setStrokeWidth(+event.target.value)
    }

    const handleEraserWidth = (event) => {
        setEraseWidth(+event.target.value)
    }

    const handleStrokeColorChange = (event) => {
        setStrokeColor(event.target.value)
    }

    const handleCanvasColorChange = (event) => {
        setCanvasColor(event.target.value)
    }

    const handleUndoClick = () => {
        canvasRef.current?.undo()
    }

    const handleRedoClick = () => {
        canvasRef.current?.redo()
    }

    const handleClearClick = () => {
        canvasRef.current?.clearCanvas()
    }

    const handleResetClick = () => {
        canvasRef.current?.resetCanvas()
        setStrokeColor("#000000")
        setCanvasColor("#ffffff")
        setStrokeWidth(5)
        setEraseWidth(5)
    }

    return(
        <div>
            <div className="tool-section">
                <h1>Tools</h1>
                <button type="button" disabled={!eraseMode} onClick={handlePenClick}>Pen</button>
                <button type="button" disabled={eraseMode} onClick={handleEraser}>Eraser</button>
                <label htmlFor="strokeWidth">Stroke Width </label>
                <input type="range" disabled={eraseMode} id="strokeWidth" value={strokeWidth} onChange={handleStrokeWidth} min="1" max="20" step="1"/>
                <label htmlFor="eraseWidth">Eraser Width </label>
                <input type="range" disabled={!eraseMode} id="eraseWidth" value={eraseWidth} onChange={handleEraserWidth} min="1" max="20" step="1"/>
                <button type="button" onClick={handleUndoClick}>Undo</button>
                <button type="button" onClick={handleRedoClick}>Redo</button>
                <button type="button" onClick={handleClearClick}>Clear</button>
                <button type="button" onClick={handleResetClick}>Reset</button>
            </div>
            <div className="color-section">
                <h1>Color</h1>
                <label htmlFor="strokeColor">Stroke Color </label>
                <input type="color" value={strokeColor} id="strokeColor" onChange={handleStrokeColorChange}/>
                <label htmlFor="canvasColor">Canvas Color</label>
                <input type="color" value={canvasColor} id="canvasColor" onChange={handleCanvasColorChange} />
            </div>

            <ReactSketchCanvas
                width="100%"
                ref={canvasRef} 
                height="250px"
                canvasColor={canvasColor}
                strokeWidth={strokeWidth}
                eraserWidth={eraseWidth}
                strokeColor={strokeColor}
            />
        </div>
    )
}

export default Canvas