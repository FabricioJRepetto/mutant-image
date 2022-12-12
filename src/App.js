import { useState, useEffect, useRef } from 'react'
import './App.css';

function App() {
    const [bluePrint, setBluePrint] = useState()
    const [style, setStyle] = useState('dots')
    const [res, setRes] = useState(5)
    const [imgData, setImgData] = useState()
    const [fontSize, setFontSize] = useState(1)
    const [showText, setShowText] = useState(false)

    const canvas = useRef(null)
    const cntx = useRef(null)

    useEffect(() => {
        if (canvas.current && !cntx.current) {
            cntx.current = canvas.current.getContext('2d')
        }
    }, [])

    const mutator = (imgData) => {
        const {
            width,
            height,
            data
        } = imgData

        let imageToArray = []

        const rgbToChar = (c) => {
            if (c > 250) return '@'
            else if (c > 240) return '#'
            else if (c > 220) return '%'
            else if (c > 200) return '&'
            else if (c > 180) return '$'
            else if (c > 160) return '7'
            else if (c > 140) return ')'
            else if (c > 120) return '/'
            else if (c > 100) return '*'
            else if (c > 80) return '+'
            else if (c > 60) return '^'
            else if (c > 40) return '-'
            else if (c > 20) return ':'
            else return '·'
        }

        const toText = (array, size) => {
            let aux = [],
                string = array.map(e => e.char).toString().replaceAll(',', '')
            for (let i = 0; i < array.length / size; i++) {
                aux.push(string.slice(0, size))
                string = string.slice(size)
            }
            return aux
        }

        for (let y = 0; y < height; y += res) {
            for (let x = 0; x < width; x += res) {
                const posX = x * 4,
                    posY = y * 4,
                    pos = (posY * width) + posX,
                    r = data[pos],
                    g = data[pos + 1],
                    b = data[pos + 2],
                    average = (r + g + b) / 3,
                    // (average * 100) / 255 = tamaño relativo al brillo (regla de 3)
                    // / 100 = tamaño convertido a porcentaje
                    // res * porcentaje = tamaño del circulo en pixeles
                    dotSize = style === 'dots' && Math.round(res * (((average * 100) / 255)) / 100),
                    char = style === 'ascii' && rgbToChar(average),
                    rgb = `rgb(${r}, ${g}, ${b})`

                if (average !== 255) console.log('res: ', res, 'avg: ', average, 'size: ', dotSize)

                imageToArray.push({
                    x,
                    y,
                    average,//: ascii & dots
                    char,//? ascii
                    dotSize,//* dots
                    r,//! CMYK
                    g,//! CMYK
                    b,//! CMYK
                    color: rgb//: ascii & dots
                })
            }
        }

        style === 'ascii' && setBluePrint(() => toText(imageToArray, Math.round(width / res))) //? ascii text version
        return imageToArray
    }

    const loadImage = (e) => {
        e.preventDefault()
        const file = Array.from(e.target.files)[0],
            img = new Image();
        img.src = URL.createObjectURL(file)

        img.onload = () => {
            const width = img.width,
                height = img.height

            canvas.current.width = width
            canvas.current.height = height
            cntx.current.drawImage(img, 0, 0, width, height)
            // console.log(canvas.current.toDataURL()) //? convierte a base64
            const data = cntx.current.getImageData(0, 0, width, height)
            setImgData(() => data)
        }
    }

    const print = (size) => {
        cntx.current.clearRect(0, 0, canvas.current.width, canvas.current.height)

        switch (style) {
            case 'dots':
                mutator(imgData).forEach(e => drawCircle(e.x, e.y, e.dotSize, e.color))
                break;

            default:
                size
                    ? cntx.current.font = Math.round(Math.round(imgData.width / res) * size) + 'px Courier Prime'
                    : cntx.current.font = Math.round(Math.round(imgData.width / res) * fontSize) + 'px Courier Prime'

                mutator(imgData).forEach(e => {
                    cntx.current.fillStyle = e.color
                    cntx.current.fillText(e.char, e.x, e.y)
                })
                break;
        }

    }

    const fontSizeHandler = (e) => {
        e.preventDefault()
        if (!imgData) return
        let size = parseInt(e.target.value) / 10
        setFontSize(() => size)
        print(size)
    }

    const styleHandler = (e) => {
        e.preventDefault()
        let value = e.target.value
        setStyle(() => value)
    }

    const drawCircle = (x, y, size, color) => {
        const circle = new Path2D();
        circle.arc(x, y, size, 0, 2 * Math.PI);
        cntx.current.fillStyle = color
        cntx.current.fill(circle)
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Image mutator</h1>
            </header>

            <canvas ref={canvas}></canvas>

            <div>
                <input type="file" onChange={loadImage}></input>
            </div>

            <div>
                <select name="style" id="select" defaultValue={'dots'} onChange={styleHandler}>
                    <option value="ascii">ascii</option>
                    <option value="dots">dots</option>
                </select>
            </div>

            <div>
                <p>{res}{imgData && <i> ({Math.round(imgData.width / res)} per row)</i>}</p>
                <input type="range" min={1} max={150} defaultValue={5} onChange={(e) => setRes(parseInt(e.target.value))}></input>
            </div>

            <div>
                <p>Font size: <i>{fontSize}</i></p>
                <input type="range" min={0} max={19} defaultValue={10} onChange={fontSizeHandler}></input>
            </div>

            <button onClick={print}>MUTATE</button>
            <button onClick={() => setShowText(() => !showText)}>SHOW TEXT</button>
            {/* <button onClick={drawCircle}>CIRCLE</button> */}

            <div className='ascciContainer'>
                {bluePrint && showText && bluePrint.map((string, i) => <p key={i}>{string}</p>)}
            </div>
        </div>
    );
}

export default App;

//: https://github.com/benwiley4000/gif-frames
//? gif frames

//: 1 - carga la imagen: setea el tamaño del canvas y muestra la imagen
//* 2 - imprime: limpia el canvas, setea tamaño de fuente, 
//* genera array de caracteres segun resolución y dibuja en el canvas