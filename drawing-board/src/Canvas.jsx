import {ReactSketchCanvas} from "react-sketch-canvas";
import {ChangeEvent, useRef, useState} from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {GoogleGenerativeAI} from "@google/generative-ai"
import {faPaintbrush, faEraser, faRotateLeft, faRotateRight, faArrowsRotate, faBroom, faDownload} from '@fortawesome/free-solid-svg-icons'

function Canvas(){
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent"
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({model: "gemini-1.5-pro"})

    const canvasRef = useRef(null);
    const [eraseMode, setEraseMode] = useState(false)
    const [strokeWidth, setStrokeWidth] = useState(5)
    const [eraseWidth, setEraseWidth] = useState(5)

    const [strokeColor, setStrokeColor] = useState("#000000")
    const [canvasColor, setCanvasColor] = useState("#e9eaed")

    const [aiResponse, setAIResponse] = useState("")
    const [aiDescription, seTAIDescription] = useState("")

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
        setCanvasColor("#e9eaed")
        setStrokeWidth(5)
        setEraseWidth(5)
        setAIResponse("")
        seTAIDescription("")
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

                const requestbody = [
                    prompt,
                    {inline_data: {mime_type: 'image/png', data:base64img}}
                ]

                try {
                    const response = await model.generateContent(requestbody)
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

    const handleSuggestion = async () => {
        seTAIDescription("")
        const inputField = document.getElementById("user-prompt")
        const value = inputField.value;

        const prompt = `Role: You are an art instructor AI that provides helpful, step-by-step drawing guidance based on the user’s description.
                        Task: The user will describe what they want to draw (for example, “I want to draw a forest with a deer in the middle”). In response, you should:
                        Summarize what they want to draw in your own words.
                        Provide clear, step-by-step instructions on how to sketch the scene, focusing on composition, basic shapes, proportions, and perspective.
                        Keep the language clear, short, positive, and encouraging.
                        Keep the instructions short and clear, no more than a few lines.
                        Keep your response short and clear, without any unnecessary symbols. Format your answer in simple words in a short paragraph. Avoid extra punctuation and use plain language.`

        const requestbody = [
            prompt,
            value
        ]

        try{
            const response = await model.generateContent(requestbody)
            const ai_response = response.response.text()
            seTAIDescription(ai_response)
        }catch(error){
            console.log("Error",error)
            alert("Failed to process prompt")
        }


    }

    return(
        <div className="container">
            <div className="tool-container">
                <div className="tool-section">
                    <button type="button" disabled={!eraseMode} title="Pen" onClick={handlePenClick}><FontAwesomeIcon icon={faPaintbrush} /></button>
                    <button type="button" disabled={eraseMode} title="Erase" onClick={handleEraser}><FontAwesomeIcon icon={faEraser} /></button>
                    <label htmlFor="strokeWidth">Stroke Width </label>
                    <input type="range" disabled={eraseMode} id="strokeWidth" value={strokeWidth} onChange={handleStrokeWidth} min="1" max="20" step="1"/>
                    <label htmlFor="eraseWidth">Eraser Width </label>
                    <input type="range" disabled={!eraseMode} id="eraseWidth" value={eraseWidth} onChange={handleEraserWidth} min="1" max="20" step="1"/>
                    <button type="button" title="Undo" onClick={handleUndoClick}><FontAwesomeIcon icon={faRotateLeft} /></button>
                    <button type="button" title="Redo" onClick={handleRedoClick}><FontAwesomeIcon icon={faRotateRight} /></button>
                    <button type="button" title="Clear" onClick={handleClearClick}><FontAwesomeIcon icon={faBroom} /></button>
                    <button type="button" title="Reset" onClick={handleResetClick}><FontAwesomeIcon icon={faArrowsRotate} /></button>
                    <button type="button" title="Save" onClick={handleSave}><FontAwesomeIcon icon={faDownload} /></button>
                </div>
                <div className="color-section">
                    <label htmlFor="strokeColor">Stroke Color </label>
                    <input type="color" value={strokeColor} id="strokeColor" onChange={handleStrokeColorChange}/>
                    <label htmlFor="canvasColor">Canvas Color</label>
                    <input type="color" value={canvasColor} id="canvasColor" onChange={handleCanvasColorChange} />
                </div>
            </div>
            <button type="button" onClick={analyzeImage}>Recognize</button>
            <div className="ai-response">
                <p>{aiResponse}</p>
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
            
            <div className="ai-prompt">
                <textarea id="user-prompt" placeholder="Describe"></textarea>
                <button type="button" onClick={handleSuggestion}>Generate</button>
                <p>{aiDescription}</p>
            </div>
           
        </div>
    )
}

export default Canvas