import { useState, useEffect } from 'react'
import './App.css';

function App() {
    const [image, setImage] = useState()
    const [preview, setPreview] = useState()

    const img = (e) => {
        e.preventDefault()
        const file = Array.from(e.target.files)
        console.log(file)
        setImage(() => file)
    }

    useEffect(() => {
        const newImageUrls = [];
        if (image) {
            for (const i of image) {
                newImageUrls.push(URL.createObjectURL(i));
            }
            setPreview(newImageUrls);
        }
    }, [image]);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Image mutator</h1>
            </header>
            <section>
                <>{
                    preview && <img src={preview} alt='preview img' />
                }</>
                <input type="file" onChange={img}></input>
            </section>
        </div>
    );
}

export default App;