function newMatrix(rows, cols, value) {
    arr = new Array(rows);
    for (let row = 0; row < rows; row++) {
        arr[row] = new Array(cols);
        for (let col = 0; col < cols; col++) {
            arr[row][col] = value;
        }
    }
    return arr;
}

function map(x, fromLow, fromHigh, toLow, toHigh) {
    return (x - fromLow) / (fromHigh - fromLow) * (toHigh - toLow) + toLow;
}

class App {
    constructor(config) {
        this.canvas = config.canvas;
        this.context = this.canvas.getContext("2d");
        this.rows = config.rows;
        this.cols = config.cols;
        this.field = newMatrix(this.rows, this.cols);
        this.count = 0;        
        this.reset();
        window.addEventListener("resize", this.resizeCanvas.bind(this));
        this.resizeCanvas();
    }

    reset() {
        this.hashes = [];
        this.initField();
    }

    get hash() {
        let hash = 0;

        for (let row of this.field) {
            for (let cell of row) {
                hash *= 3;
                if (cell) {
                    hash += 1;
                }

                hash %= 1 << 31;
            }
        }

        return hash;
    }

    initField() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.field[row][col] = Math.random() > 0.3125;
            }
        }
    }

    resizeCanvas() {
        const w = this.canvas.scrollWidth;
        const h = w / 16 * 9;
        this.canvas.width = w;
        this.canvas.style.height = `${h}px`;
        this.canvas.height = h;
    }

    drawRectangle(rect, fillColor, borderColor = fillColor) {
        this.context.fillStyle = fillColor;
        this.context.fillRect(rect.x, rect.y, rect.w, rect.h);

        this.context.strokeStyle = borderColor;
        this.context.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }

    drawCell(row, col) {
        if (!this.field[row][col]) {
            return;
        }

        const rect = {
            x: map(col, 0, this.cols, 0, this.canvas.width),
            y: map(row, 0, this.rows, 0, this.canvas.height),
            w: map(1, 0, this.cols, 0, this.canvas.width),
            h: map(1, 0, this.rows, 0, this.canvas.height),
        };
        const fillColor = "#7700FF";
        this.drawRectangle(rect, fillColor);
    }
    
    drawField() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.drawCell(row, col);
            }
        }
    }

    draw() {
        this.drawField();
    }

    addMod(value, delta, modulo) {
        return (value + delta + modulo) % modulo;
    }

    getNeighboursCount(field) {
        let neighboursCount = newMatrix(this.rows, this.cols, 0);

        const dirsCount = 8;
        const dRow = [0, -1, -1, -1, 0, 1, 1, 1];
        const dCol = [1, 1, 0, -1, -1, -1, 0, 1];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                for (let dir = 0; dir < dirsCount; dir++) {
                    const newRow = this.addMod(row, dRow[dir], this.rows);
                    const newCol = this.addMod(col, dCol[dir], this.cols);
                    if (this.field[newRow][newCol]) {
                        neighboursCount[row][col] += 1;            
                    }
                }
            }
        }

        return neighboursCount;
    }

    calcNextGeneration() {
        let neighboursCount = this.getNeighboursCount(this.field);

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const count = neighboursCount[row][col];
                if (this.field[row][col] && ((count < 2) || (count > 3))) {
                    this.field[row][col] = false;
                } else if (!(this.field[row][col]) && count === 3) {
                    this.field[row][col] = true;
                }
            }
        }
    }

    handleRepetitions() {
        const maxHashesSize = 1000;

        this.hashes.push(this.hash);
        if (this.hashes.length > maxHashesSize) {
            this.hashes.splice(0, 1);
        }

        for (let i = Math.floor((this.hashes.length + 1) / 2); i < this.hashes.length - 1; i++) {
            const delta = this.hashes.length - i - 1;
            if (this.hashes[i + delta] === this.hashes[i] && this.hashes[i] === this.hashes[i - delta]) {
                this.reset();
                break;
            }
        }
    }

    update() {
        this.calcNextGeneration();
        this.handleRepetitions();
    }

    loop() {
        this.count += 1;
        this.count %= 1;
        if (this.count === 0) {
            this.draw();
            this.update() 
        }

        window.requestAnimationFrame(this.loop.bind(this));
    }

    run() {
        this.loop()
    }
}

function main() {
    const canvas = document.getElementById("canvas");
    const config = {
        canvas: canvas,
        rows: 72,
        cols: 128   ,
    };
    const app = new App(config);
    app.run()
}

main()