import { useState, useEffect, useRef } from 'react'
import './App.css';

function App() {
    // const [image, setImage] = useState()
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

    useEffect(() => {
        if (imgData) {
            console.log('effect', res);
            ascii(imgData)
        }
        // eslint-disable-next-line
    }, [imgData])


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
            else if (c > 100) return 'i'
            else if (c > 80) return 'l'
            else if (c > 60) return 'j'
            else if (c > 40) return 'n'
            else if (c > 20) return 'Y'
            else return 'X'
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
            <section>
                <canvas ref={canvas} style={{ border: '1px solid skyblue' }}></canvas>
                <input type="file" onChange={loadImage}></input>
                <p>{res}</p>
                <input type="range" min={1} max={15} defaultValue={5} onChange={(e) => setRes(parseInt(e.target.value))}></input>
                {bluePrint && <button onClick={print}>PRINT</button>}
            </section>
        </div>
    );
}

export default App;