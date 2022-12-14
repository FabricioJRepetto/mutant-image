import { useState, useEffect, useRef } from 'react'
import './App.css';
import { mutator } from './utils/mutator';

function App() {
    const [bluePrint, setBluePrint] = useState(false)
    const [loading, setLoading] = useState(false)
    const [style, setStyle] = useState('dots')
    const [res, setRes] = useState(5)
    const [invertSize, setInvertSize] = useState(false)
    const [margin, setMargin] = useState(false)
    const [imgData, setImgData] = useState()
    const [fontSize, setFontSize] = useState(1)
    const [showText, setShowText] = useState(false)
    const [containedDots, setContainedDots] = useState(true)

    const canvas = useRef(null)
    const cntx = useRef(null)

    useEffect(() => {
        if (canvas.current && !cntx.current) {
            cntx.current = canvas.current.getContext('2d')
        }
    }, [])

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

    const print = async (size) => {
        setLoading(() => true)
        cntx.current.clearRect(0, 0, canvas.current.width, canvas.current.height)
        if (margin) {
            canvas.current.width = imgData.width + res * 4
            canvas.current.height = imgData.height + res * 4
        }
        const data = await mutator(imgData, res, style, containedDots, invertSize, setBluePrint)

        switch (style) {
            case 'dots':
                data.forEach(e => drawCircle(margin ? e.x + res * 1.7 : e.x, margin ? e.y + res * 1.7 : e.y + res * 1.7, e.dotSize, e.color))
                break;

            default:
                //? fonts: Courier Prime / Inconsolata
                cntx.current.font = Math.round(Math.round(res * (size ? size : fontSize))) + 'px Inconsolata'

                data.forEach(e => {
                    cntx.current.fillStyle = e.color
                    cntx.current.fillText(e.char, margin ? e.x + res * 1.7 : e.x, margin ? e.y + res * 2.3 : e.y)
                })
                break;
        }
        setLoading(() => false)

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

    // const drawSquare = (x, y, size, color) => {

    // }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Image mutator</h1>
            </header>

            <canvas ref={canvas} className='canvas'></canvas>
            {loading && <h1>···LOADING···</h1>}

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
                <p>Resolution: {res}{imgData && <i> ({Math.ceil(imgData.width / res)} per row)</i>}</p>
                <input type="range" min={1} max={150} defaultValue={5} onChange={(e) => setRes(parseInt(e.target.value))}></input>
            </div>

            {style === 'dots' &&
                <>
                    <label htmlFor="limitDots">limit dot size to cell</label>
                    <input type="checkbox" name="limitDots" id="limitDots" defaultChecked onChange={() => setContainedDots(() => !containedDots)}></input>
                </>}

            {style === 'ascii' &&
                <>
                    <>
                        <p>Font size: <i>{fontSize}</i></p>
                        <input type="range" min={0} max={19} defaultValue={10} onChange={fontSizeHandler}></input>
                        <br />
                    </>
                    <button onClick={() => setShowText(() => !showText)} disabled={!bluePrint}>SHOW TEXT</button>
                </>}

            <div>
                <>
                    <label htmlFor="invert">Invert sizes: {invertSize ? 'yes' : 'no'}</label>
                    <input type="checkbox" name="invert" id="invert" onChange={() => setInvertSize(() => !invertSize)}></input>
                    <br />
                    <label htmlFor="margin">Margin: {margin ? 'yes' : 'no'}</label>
                    <input type="checkbox" name="margin" id="margin" onChange={() => setMargin(() => !margin)}></input>
                    <br />
                </>
                <button onClick={print} disabled={!imgData}>MUTATE</button>
            </div>
            {/* <button onClick={testCircle}>CIRCLE</button> */}

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