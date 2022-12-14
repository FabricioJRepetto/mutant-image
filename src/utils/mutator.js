export const mutator = (imgData, res, style, containedDots, invertSize, setBluePrint) => {
    const {
        width,
        height,
        data
    } = imgData

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
        else if (c > 80) return '='
        else if (c > 60) return '+'
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

    const toDots = (average) => {
        // (average * 100) / 255 = tamaño relativo al brillo (regla de 3)
        // / 100 = tamaño convertido a porcentaje
        // res * porcentaje = tamaño del circulo en pixeles
        let aux = Math.floor((res * (((average * 100) / 255)) / 100))
        // / 2 = limitar el tamaño del circulo dentro de la casilla
        if (containedDots && aux > (res / 2)) {
            return aux / 2
        } else return aux
    }

    return new Promise(resolve => {
        let imageToArray = []

        for (let y = 0; y < height; y += res) {
            for (let x = 0; x < width; x += res) {
                const posX = x * 4,
                    posY = y * 4,
                    pos = (posY * width) + posX,
                    r = data[pos],
                    g = data[pos + 1],
                    b = data[pos + 2],
                    average = invertSize ? 255 - ((r + g + b) / 3) : (r + g + b) / 3,
                    dotSize = style === 'dots' && toDots(average),
                    char = style === 'ascii' && rgbToChar(average),
                    rgb = `rgb(${r}, ${g}, ${b})`

                imageToArray.push({
                    x: style === 'dots' ? x + Math.round(res / 2) : x,
                    y: style === 'dots' ? y + Math.round(res / 2) : y,
                    average,//: ascii & dots
                    char,//? ascii
                    dotSize, //* dots
                    r,//! CMYK
                    g,//! CMYK
                    b,//! CMYK
                    color: rgb//: ascii & dots
                })
            }
        }

        style === 'ascii' && setBluePrint(() => toText(imageToArray, Math.round(width / res))) //? ascii text version
        resolve(imageToArray)
    })
}