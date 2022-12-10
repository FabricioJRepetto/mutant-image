import { useState, useEffect, useRef } from 'react'
import './App.css';

function App() {
    const [bluePrint, setBluePrint] = useState()
    const [res, setRes] = useState(5)
    const [imgData, setImgData] = useState()

    const canvas = useRef(null)
    const cntx = useRef(null)

    useEffect(() => {
        if (canvas.current && !cntx.current) {
            cntx.current = canvas.current.getContext('2d')
        }
    }, [])

    const ascii = (imgData) => {
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
                    char = rgbToChar(average),
                    rgb = `rgb(${r}, ${g}, ${b})`

                imageToArray.push({
                    x,
                    y,
                    char,
                    color: rgb
                })
            }
        }

        setBluePrint(() => toText(imageToArray, Math.ceil(width / res)))
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
            //? console.log(canvas.current.toDataURL()) // convierte a base64
            const data = cntx.current.getImageData(0, 0, width, height)
            setImgData(() => data)
        }
    }

    const print = () => {
        cntx.current.clearRect(0, 0, canvas.current.width, canvas.current.height)
        cntx.current.font = res * 1.2 + 'px Courier Prime'
        ascii(imgData).forEach(e => {
            cntx.current.fillStyle = e.color
            cntx.current.fillText(e.char, e.x, e.y)
        })
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Image mutator</h1>
            </header>

            <canvas ref={canvas}></canvas>

            <section>
                <input type="file" onChange={loadImage}></input>
                <p>{res}{imgData && <i> ({Math.ceil(imgData.width / res)} per row)</i>}
                </p>
                <input type="range" min={1} max={15} defaultValue={5} onChange={(e) => setRes(parseInt(e.target.value))}></input>
                <button onClick={print}>MUTATE</button>
            </section>

            <div className='ascciContainer'>
                {bluePrint && bluePrint.map((string, i) => <p key={i}>{string}</p>)}
            </div>
        </div>
    );
}

export default App;

//: https://github.com/benwiley4000/gif-frames
//? gif frames