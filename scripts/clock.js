'use strict';

class Clock {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.dimensions = null;
    this.resize();
    window.addEventListener("resize", (e) => { this.resize(); });
  }

  resize() {
    let d = this.canvas.scrollWidth;
    this.canvas.width = d;
    this.canvas.style.height = d + "px";
    this.canvas.height = d;
    this.dimensions = d;
    this.draw(new Date());
  }

  drawFace() {
    let d = this.dimensions;
    let x = d / 2;
    let y = d / 2;
    let r = d / 2 - 5;

    this.context.lineWidth = 3;
    this.context.strokeStyle = "#000000";
    this.context.fillStyle = "#000000"

    this.context.beginPath();
    this.context.arc(x, y, r, 0, 2 * Math.PI);
    this.context.stroke();

    this.context.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
      let angle = Math.PI / 2 - i / 60 * 2 * Math.PI;
      x = d / 2 + (d / 2 - 20) * Math.cos(angle);
      y = d / 2 - (d / 2 - 20) * Math.sin(angle);
      if (i % 5) {
        r = 1;
      } else {
        r = 3;
      }
      this.context.beginPath();
      this.context.arc(x, y, r, 0, 2 * Math.PI);
      this.context.fill();
      this.context.stroke();
    }

    this.context.font = "36px Verdana";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    let romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    for (let i = 1; i <= 12; i++) {
      let angle = Math.PI / 2 - i / 12 * 2 * Math.PI;
      x = d / 2 + (d / 2 - 55) * Math.cos(angle);
      y = d / 2 - (d / 2 - 55) * Math.sin(angle);
      this.context.fillText(romanNumerals[i - 1], x, y);
    }
  }

  drawHand(params) {
    let d = this.dimensions;
    this.context.lineWidth = params.width;
    this.context.strokeStyle = params.color;
    this.context.beginPath();
    let x = d / 2 - 25 * Math.cos(params.angle);
    let y = d / 2 + 25 * Math.sin(params.angle);
    this.context.moveTo(x, y);
    x = d / 2 + params.length * Math.cos(params.angle);
    y = d / 2 - params.length * Math.sin(params.angle);
    this.context.lineTo(x, y);
    this.context.stroke();

  }

  draw(time) {
    let d = this.dimensions;
    this.context.clearRect(0, 0, d, d);
    this.drawFace();

    let radius = d / 2 - 30;
    let seconds = time.getSeconds();
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
    this.context.arc(d / 2, d / 2, 10, 0, 2 * Math.PI);
    this.context.fill();
    this.context.stroke();
  }

  tick() {
    let time = new Date();
    this.draw(time);
    window.setTimeout(() => {
      window.requestAnimationFrame(() => { this.tick() });
    }, 1000 - time.getMilliseconds());
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