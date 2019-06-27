'use strict';

class Clock {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.dimensions = null;
        this.resize();
        window.addEventListener("resize", () => {
            this.resize();
        });
        this.mouseOver = false;
        this.mousePressed = false;
        this.initializeMouseEvents();
    }

    initializeMouseEvents() {
        this.canvas.addEventListener("mousedown", () => {
            this.mousePressed = true;
        });
        this.canvas.addEventListener("mouseup", () => {
            this.mousePressed = false;
        });
        this.canvas.addEventListener("mouseover", () => {
            this.mouseOver = true;
        });
        this.canvas.addEventListener("mouseout", () => {
            this.mouseOver = false;
        });
    }

    get isPaused() {
        return (this.mousePressed && this.mouseOver);
    }

    resize() {
        let d = this.canvas.scrollWidth;
        this.canvas.width = d;
        this.canvas.style.height = d + "px";
        this.canvas.height = d;
        this.dimensions = d;
        this.center = new Vec2(d / 2, d / 2);
        this.draw(new Date());
    }

    vec2FromPolar(length, angle, center = new Vec2(0, 0)) {
        let x = length * Math.cos(angle);
        let y = length * Math.sin(-angle);
        return center.add(new Vec2(x, y), true);
    }

    drawFace() {
        this.context.lineWidth = 3;
        this.context.strokeStyle = "#000000";
        this.context.fillStyle = "#000000"

        let radius = this.dimensions / 2 - 5;
        this.context.beginPath();
        this.context.arc(this.center.x, this.center.y, radius, 0, 2 * Math.PI);
        this.context.stroke();

        this.context.lineWidth = 1;
        for (let i = 0; i < 60; i++) {
            let angle = Math.PI / 2 - i / 60 * 2 * Math.PI;
            let radius = this.dimensions / 2 - 20;
            let pos = this.vec2FromPolar(radius, angle, this.center);
            let dotRadius = 1;
            if (i % 5 === 0) {
                dotRadius = 3;
            }
            this.context.beginPath();
            this.context.arc(pos.x, pos.y, dotRadius, 0, 2 * Math.PI);
            this.context.fill();
            this.context.stroke();
        }

        this.context.font = "36px Verdana";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        let romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
        for (let i = 1; i <= 12; i++) {
            let angle = Math.PI / 2 - i / 12 * 2 * Math.PI;
            let radius = this.dimensions / 2 - 55;
            let pos = this.vec2FromPolar(radius, angle, this.center);
            this.context.fillText(romanNumerals[i - 1], pos.x, pos.y);
        }
    }

    drawHand(params) {
        this.context.lineWidth = params.width;
        this.context.strokeStyle = params.color;
        this.context.beginPath();
        let pos = this.vec2FromPolar(-25, params.angle, this.center);
        this.context.moveTo(pos.x, pos.y);
        pos = this.vec2FromPolar(params.length, params.angle, this.center);
        this.context.lineTo(pos.x, pos.y);
        this.context.stroke();

    }

    draw(time) {
        let d = this.dimensions;
        this.context.clearRect(0, 0, d, d);
        this.drawFace();

        let radius = d / 2 - 30;
        let milliseconds = time.getMilliseconds();
        let seconds = time.getSeconds() + milliseconds / 1000;
        let minutes = time.getMinutes() + seconds / 60;
        let hours = (time.getHours() + minutes / 60) % 12;

        this.drawHand({
            angle: Math.PI / 2 - hours / 12 * 2 * Math.PI,
            length: radius * 3 / 5,
            width: 5,
            color: "#000000",
        });

        this.drawHand({
            angle: Math.PI / 2 - minutes / 60 * 2 * Math.PI,
            length: radius * 7 / 8,
            width: 3,
            color: "#000000",
        });

        this.drawHand({
            angle: Math.PI / 2 - seconds / 60 * 2 * Math.PI,
            length: radius,
            width: 2,
            color: "#F44336",
        });

        this.context.strokeStyle = "#000000";
        this.context.beginPath();
        this.context.arc(this.center.x, this.center.y, 10, 0, 2 * Math.PI);
        this.context.fill();
        this.context.stroke();
    }

    get time() {
        return new Date();
    }

    tick() {
        if (!this.isPaused) {
            this.draw(this.time);
        }
        window.requestAnimationFrame(this.tick.bind(this));
    }

    start() {
        this.tick();
    }
}

function main() {
    let myClock = new Clock(canvas);
    myClock.start();
}

main();