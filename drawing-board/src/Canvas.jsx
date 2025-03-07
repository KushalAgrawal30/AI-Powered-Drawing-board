import {ReactSketchCanvas} from "react-sketch-canvas";
import {ChangeEvent, useRef, useState} from "react"

function Canvas(){
    const canvasRef = useRef(null);
    const [eraseMode, setEraseMode] = useState(false)
    const [strokeWidth, setStrokeWidth] = useState(5)
    const [eraseWidth, setEraseWidth] = useState(5)

    const [strokeColor, setStrokeColor] = useState("#000000")
    const [canvasColor, setCanvasColor] = useState("#1F2023")

    const [aiResponse, setAIResponse] = useState("")

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
        setCanvasColor("#1F2023")
        setStrokeWidth(5)
        setEraseWidth(5)
        setAIResponse("")
    }

    const handleSave = async () => {
        const dataURL = await canvasRef.current?.exportImage('png')
        if(dataURL){
            const link = Object.assign(document.createElement('a'), {
                href: dataURL,
                style: {display: 'none'},
                download: 'sketch.png'
            })
            document.body.appendChild(link)
            link.click()
            link.remove()
        }
    }

    const analyzeImage = async () => {
        setAIResponse("")
        const dataURL = await canvasRef.current?.exportImage('png')
        if(dataURL){
            const blob = await fetch(dataURL).then(res => res.blob())

            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = async () => {
                const base64img = reader.result.split(',')[1]

                const prompt = `
                                Analyze the given sketch and determine.  
                                    - If it contains an equation, identify and solve it step by step in simple language.
                                    - If the sketch is a general drawing or handwriting, describe it briefly without mentioning equations.
                                    - If the sketch is only text without an equation, simply describe what it says without referencing math.
                                Your response should be clear and in full sentences. Do not use symbols, special characters, or unnecessary formatting.
                            `;

                const requestbody = {
                    contents: [
                        {role: 'user', parts:[{text:prompt}]},
                        {role: 'user', parts:[{inline_data: {mime_type: 'image/png', data:base64img}}]}
                    ]
                };

                const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent"
                const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

                try {
                    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(requestbody)
                    })

                    const result = await response.json()
                    const ai_response = result.candidates?.[0]?.content?.parts?.[0]?.text
                    console.log("Gemini rsponse", ai_response)
                    setAIResponse(ai_response)

                    
                }catch(error){
                    console.error("Error processing image:", error);
                    alert("Failed to process image.");
                }
            }
        }
    } 

    return(
        <div className="container">
            <h1>AI Sketch Book</h1>
            <div className="tool-section">
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
                <button type="button" onClick={handleSave}>Save</button>
            </div>
            <div className="color-section">
                <label htmlFor="strokeColor">Stroke Color </label>
                <input type="color" value={strokeColor} id="strokeColor" onChange={handleStrokeColorChange}/>
                <label htmlFor="canvasColor">Canvas Color</label>
                <input type="color" value={canvasColor} id="canvasColor" onChange={handleCanvasColorChange} />
            </div>

            <ReactSketchCanvas
                width="100%"
                ref={canvasRef} 
                height="500px"
                canvasColor={canvasColor}
                strokeWidth={strokeWidth}
                eraserWidth={eraseWidth}
                strokeColor={strokeColor}
            />
            <button type="button" onClick={analyzeImage}>Recognize</button>
            <div className="ai-response">
                <p>{aiResponse}</p>
            </div>
        </div>
    )
}

export default Canvas