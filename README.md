# AI-Powered-Drawing-board

A versatile drawing board where users can sketch, customize brushes with different colors and stroke sizes. The interface is smooth, intuitive, and fully responsive, ensuring a seamless experience across all devices.

## Features

- **Sketching & Customization**
  - Freehand drawing on a responsive canvas
  - Customizable brushes: change colors, stroke sizes, and eraser width

- **Canvas Controls**
  - Undo, redo, clear and reset Canvas
  - Save drawings as images (PNG)
  - Share your creations easily

- **AI Integration**
  - **Drawing Recognition:** Click 'Recognize' to analyze your drawing using an API (Gemini API). Get real-time feedback such as "This looks like a cat!"
  - **Guided Drawing:** Describe what you want to draw and receive concise, step-by-step suggestions to help you create your artwork.

## Getting Started

### Prerequisites

- Node.js (v12 or later)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KushalAgrawal30/AI-Powered-Drawing-board.git

2. To enable AI recognition, set your Gemini API Key in an enviroment variable. Create a .env file
    VITE_GEMINI_API_KEY = API_KEY
