'use strict';

function drawLine(context, x1, y1, x2, y2, c) {
  context.strokeStyle = c;
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function drawCircle(context, x, y, r, c) {
  context.strokeStyle = c;
  context.beginPath();
  context.arc(x, y, r, 0, 2 * Math.PI);
  context.stroke();
}

function formula2expression(formula, defaultValue = "0") {
  var expression = formula;
  expression = expression.replace(/ /g, "");
  expression = expression.replace(/Math\.sin/gi, "sin").replace(/sin/gi, "Math.sin");
  expression = expression.replace(/Math\.cos/gi, "cos").replace(/cos/gi, "Math.cos");
  expression = expression.replace(/Math\.PI/gi, "PI").replace(/PI/gi, "Math.PI");
  expression = expression.replace(/\^/gi, "**");
  if (expression)
    return expression;
  else
    return defaultValue;
}

function getMin(f, low, high) {
  let min = f(low);
  for (let x = low; x <= high; x += (high - low) / 256) {
    min = Math.min(min, f(x));
  }
  return min;
}

function getMax(f, low, high) {
  let max = f(low);
  for (let x = low; x <= high; x += (high - low) / 256) {
    max = Math.max(max, f(x));
  }
  return max;
}

class Leg {

  constructor(canvas, c1, c2, c3) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.c1 = c1;
    this.c2 = c2;
    this.c3 = c3;
  }

  setState(aAngle, bAngle) {
    let h = this.canvas.height;
    let w = this.canvas.width;
    let l = Math.abs(this.l1) + Math.abs(this.l2);
    let m = Math.min(w / 2, h);
    let l1 = m * 8 / 10 * this.l1 / l;
    let l2 = m * 8 / 10 * this.l2 / l;

    this.x1 = w / 2;
    this.y1 = h / 10;
    this.x2 = this.x1 + l1 * Math.cos(aAngle);
    this.y2 = this.y1 + l1 * Math.sin(aAngle);
    this.x3 = this.x2 + l2 * Math.cos(bAngle);
    this.y3 = this.y2 + l2 * Math.sin(bAngle);
    this.x4 = this.x3 + l2 * Math.cos(bAngle + Math.PI / 2) / 4;
    this.y4 = this.y3 + l2 * Math.sin(bAngle + Math.PI / 2) / 4;
    let r = h / 50;
  }

  get height() {
    let yMin = Math.min(this.y1, this.y2, this.y3, this.y4);
    let yMax = Math.max(this.y1, this.y2, this.y3, this.y4);
    return (yMax - yMin)
  }

  draw(aAngle, bAngle, height) {
    let h = this.canvas.height;
    let w = this.canvas.width;

    let l = Math.abs(this.l1) + Math.abs(this.l2);
    let m = Math.min(w / 2, h);
    let l1 = m * 8 / 10 * this.l1 / l;
    let l2 = m * 8 / 10 * this.l2 / l;

    let x1 = w / 2;
    let y1 = h / 10;
    let x2 = x1 + l1 * Math.cos(aAngle);
    let y2 = y1 + l1 * Math.sin(aAngle);
    let x3 = x2 + l2 * Math.cos(bAngle);
    let y3 = y2 + l2 * Math.sin(bAngle);
    let x4 = x3 + l2 * Math.cos(bAngle + Math.PI / 2) / 4;
    let y4 = y3 + l2 * Math.sin(bAngle + Math.PI / 2) / 4;
    let dy = height - (9 / 10 * h - Math.min(y1, y2, y3, y4));
    y1 -= dy;
    y2 -= dy;
    y3 -= dy;
    y4 -= dy;

    let r = h / 50;

    this.context.lineWidth = 3;

    drawLine(this.context, x1, y1, x2, y2, this.c1);
    drawLine(this.context, x2, y2, x3, y3, this.c2);
    drawLine(this.context, x3, y3, x4, y4, this.c2);

    drawCircle(this.context, x1, y1, r, this.c3);
    drawCircle(this.context, x2, y2, r, this.c3);
    drawCircle(this.context, x3, y3, r, this.c3);
  }
}

class Drawer {

  a1Angle(t) {
    let result = this.a10 + this.f1(t);
    if (this.a1AngleUnit == "grad")
      result *= Math.PI / 180;
    if (this.a1Inverted)
      result *= -1;
    result += Math.PI / 2
    return result;
  }

  b1Angle(t) {
    let result = this.b10 + this.g1(t);
    if (this.b1AngleUnit == "grad")
      result *= Math.PI / 180;
    if (this.b1Inverted)
      result *= -1;
    if (this.bRelative)
      result += this.a1Angle(t) - Math.PI / 2;
    result += Math.PI / 2;
    return result;
  }

  a2Angle(t) {
    let result = this.a20 + this.f2(t);
    if (this.a2AngleUnit == "grad")
      result *= Math.PI / 180;
    if (this.a2Inverted)
      result *= -1;
    result += Math.PI / 2
    return result;
  }

  b2Angle(t) {
    let result = this.b20 + this.g2(t);
    if (this.b2AngleUnit == "grad")
      result *= Math.PI / 180;
    if (this.b2Inverted)
      result *= -1;
    if (this.bRelative)
      result += this.a2Angle(t) - Math.PI / 2;
    result += Math.PI / 2;
    return result;
  }

  formula2expression(formula, defaultValue = "0") {
    var expression = formula;
    expression = expression.replace(/ /g, "");
    expression = expression.replace(/Math\.sin/gi, "sin").replace(/sin/gi, "Math.sin");
    expression = expression.replace(/Math\.cos/gi, "cos").replace(/cos/gi, "Math.cos");
    expression = expression.replace(/Math\.PI/gi, "PI").replace(/PI/gi, "Math.PI");
    expression = expression.replace(/\^/gi, "**");
    if (expression)
      return expression;
    else
      return defaultValue;
  }

  update(e) {
    try {
      this.l1 = (new Function('return (' + this.formula2expression(lUp.value) + ');'))();
      lUp.style.backgroundColor = "";
    } catch (error) {
      this.l1 = 1;
      lUp.style.backgroundColor = "red";
    }
    this.legFront.l1 = this.l1;
    this.legBack.l1 = this.l1;
    try {
      this.l2 = (new Function('return (' + this.formula2expression(lDown.value) + ');'))();
      lDown.style.backgroundColor = "";
    } catch (error) {
      this.l2 = 1;
      lDown.style.backgroundColor = "red";
    }
    this.legFront.l2 = this.l2;
    this.legBack.l2 = this.l2;
    try {
      this.a10 = (new Function('return (' + this.formula2expression(a1Start.value) + ');'))();
      a1Start.style.backgroundColor = "";
    } catch (error) {
      this.a10 = 0;
      a1Start.style.backgroundColor = "red";
    }
    try {
      this.a20 = (new Function('return (' + this.formula2expression(a2Start.value) + ');'))();
      a2Start.style.backgroundColor = "";
    } catch (error) {
      this.a20 = 0;
      a2Start.style.backgroundColor = "red";
    }
    try {
      this.b10 = (new Function('return (' + this.formula2expression(b1Start.value) + ');'))();
      b1Start.style.backgroundColor = "";
    } catch (error) {
      this.b10 = 0;
      b1Start.style.backgroundColor = "red";
    }
    try {
      this.b20 = (new Function('return (' + this.formula2expression(b2Start.value) + ');'))();
      b2Start.style.backgroundColor = "";
    } catch (error) {
      this.b20 = 0;
      b2Start.style.backgroundColor = "red";
    }
    try {
      this.t0 = (new Function('return (' + this.formula2expression(tStart.value) + ');'))();
      tStart.style.backgroundColor = "";
    } catch (error) {
      this.t0 = 0;
      tStart.style.backgroundColor = "red";
    }
    try {
      this.tf = (new Function('return (' + this.formula2expression(tFinish.value, Infinity) + ');'))();
      tFinish.style.backgroundColor = "";
    } catch (error) {
      this.tf = Infinity;
      tFinish.style.backgroundColor = "red";
    }
    try {
      this.f1 = new Function('t', 'return (' + this.formula2expression(f1.value) + ');');
      this.f1(this.t0);
      f1.style.backgroundColor = "";
    } catch (error) {
      this.f1 = new Function('t', 'return 0;')
      f1.style.backgroundColor = "red";
    }
    try {
      this.f2 = new Function('t', 'return (' + this.formula2expression(f2.value) + ');');
      this.f2(this.t0);
      f2.style.backgroundColor = "";
    } catch (error) {
      this.f2 = new Function('t', 'return 0;')
      f2.style.backgroundColor = "red";
    }
    try {
      this.g1 = new Function('t', 'return (' + this.formula2expression(g1.value) + ');');
      this.g1(this.t0);
      g1.style.backgroundColor = "";
    } catch (error) {
      this.g1 = new Function('t', 'return 0;')
      g1.style.backgroundColor = "red";
    }
    try {
      this.g2 = new Function('t', 'return (' + this.formula2expression(g2.value) + ');');
      this.g2(this.t0);
      g2.style.backgroundColor = "";
    } catch (error) {
      this.g2 = new Function('t', 'return 0;')
      g2.style.backgroundColor = "red";
    }
    this.a1Inverted = a1Inverted.checked;
    this.b1Inverted = b1Inverted.checked;
    this.a2Inverted = a2Inverted.checked;
    this.b2Inverted = b2Inverted.checked;
    this.bRelative = bRelative.checked;
    this.a1AngleUnit = a1AngleUnit.value;
    this.b1AngleUnit = b1AngleUnit.value;
    this.a2AngleUnit = a2AngleUnit.value;
    this.b2AngleUnit = b2AngleUnit.value;
    // console.log("l1 = " + this.l1);
    // console.log("l2 = " + this.l2);
    // console.log("a10 = " + this.a10);
    // console.log("f1(t) = ", this.f1);
    // console.log("a1AngleUnit = ", this.a1AngleUnit);
    // console.log("a1Inverted = ", this.a1Inverted);
    // console.log("b10 = " + this.b10);
    // console.log("g1(t) = ", this.g1);
    // console.log("b1AngleUnit = ", this.b1AngleUnit);
    // console.log("b1Inverted = ", this.b1Inverted);
    // console.log("a20 = " + this.a20);
    // console.log("f2(t) = ", this.f2);
    // console.log("a2AngleUnit = ", this.a2AngleUnit);
    // console.log("a2Inverted = ", this.a2Inverted);
    // console.log("b20 = " + this.b20);
    // console.log("g2(t) = ", this.g2);
    // console.log("b2AngleUnit = ", this.b2AngleUnit);
    // console.log("b2Inverted = ", this.b2Inverted);
    // console.log("bRelative = ", this.bRelative);
    // console.log("t0 = " + this.t0);
    // console.log("tf = " + this.tf);
    this.drawPlots();
  }

  resize(e) {
    let h = this.canvas.scrollHeight;
    this.canvas.height = h;
    let w = this.canvas.scrollWidth;
    this.canvas.width = w;
    h = this.plotCanvas.scrollHeight;
    this.plotCanvas.height = h;
    w = this.plotCanvas.scrollWidth;
    this.plotCanvas.width = w;
    this.drawPlots();
  }

  constructor(drawerCanvas, plotCanvas) {
    this.canvas = drawerCanvas;
    this.context = this.canvas.getContext("2d");
    this.legFront = new Leg(this.canvas, "#EE0000", "#00EE00", "#000000");
    this.legBack = new Leg(this.canvas, "#EE7777", "#77EE77", "#777777");
    this.plotCanvas = plotCanvas;
    this.plotContext = plotCanvas.getContext("2d");
    this.update();
    this.resize();
    window.addEventListener("input", (e) => { this.update(e) });
    window.addEventListener("change", (e) => { this.update(e) });
    window.addEventListener("resize", (e) => { this.resize(e) });
  }

  draw() {
    let h = this.canvas.height;
    let w = this.canvas.width;
    this.context.clearRect(0, 0, w, h);
    drawLine(this.context, 0, 9 / 10 * h, w, 9 / 10 * h);

    let height = Math.max(this.legFront.height, this.legBack.height);
    this.legBack.draw(this.a2Angle(this.t), this.b2Angle(this.t), height);
    this.legFront.draw(this.a1Angle(this.t), this.b1Angle(this.t), height);
  }

  drawPlot(context, x, y, w, h, f, low, high, axisAbscissa, axisOrdinate) {
    let min = getMin(f, low, high);
    let max = getMax(f, low, high);

    context.beginPath();
    for (let arg = low; arg <= high; arg += (high - low) / 256) {
      let val = f(arg);
      let X = x + w * (arg - low) / (high - low);
      let Y = y + h * (val - min) / (max - min);
      if (arg == low) {
        context.moveTo(X, Y);
      } else {
        context.lineTo(X, Y);
      }
    }
    context.stroke();

    context.beginPath();
    let X = x;
    let Y = y + h * 1.1;
    context.moveTo(X, Y);
    Y -= h * 1.2;
    context.lineTo(X, Y);
    Y += 20;
    X -= 10;
    context.lineTo(X, Y);
    Y -= 20;
    X += 10;
    context.lineTo(X, Y);
    Y += 20;
    X += 10;
    context.lineTo(X, Y);
    context.stroke();
    X -= 25;
    context.font = "25px Verdana";
    context.textAlign = "right";
    this.context.textBaseline = "middle";
    context.fillText(axisOrdinate, X, Y);

    context.beginPath();
    X = x - w * 0.1;
    Y = y + h * (0 - min) / (max - min);
    context.moveTo(X, Y);
    X += w * 1.2;
    context.lineTo(X, Y);
    X -= 20;
    Y -= 10;
    context.lineTo(X, Y);
    X += 20;
    Y += 10;
    context.lineTo(X, Y);
    X -= 20;
    Y += 10;
    context.lineTo(X, Y);
    context.stroke();
    Y += 20;
    X += 15;
    context.textAlign = "right";
    this.context.textBaseline = "top";
    context.fillText(axisAbscissa, X, Y);

  }

  drawPlots() {
    let functions = [
      (t) => this.a10 + this.f1(t),
      (t) => this.b10 + this.g1(t),
      (t) => this.a20 + this.f2(t),
      (t) => this.b20 + this.g2(t),
    ];
    let names = ["α1", "β1", "α2", "β2"];
    let canvas = this.plotCanvas;
    let h = canvas.height;
    let w = canvas.width;
    let x = [w / 20, 11 * w / 20, w / 20, 11 * w / 20];
    let y = [h / 20, h / 20, 11 * h / 20, 11 * h / 20];
    this.plotContext.clearRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      this.drawPlot(this.plotContext, x[i], y[i], 2 * w / 5, 2 * h / 5, functions[i], this.t0, this.tf, 't', names[i]);
    }
  }

  tick() {
    this.legFront.setState(this.a1Angle(this.t), this.b1Angle(this.t));
    this.legBack.setState(this.a2Angle(this.t), this.b2Angle(this.t));

    this.draw();

    this.t += 1 / 60;
    if (this.t > this.tf) {
      this.t += this.t0 - this.tf;
    }
    window.requestAnimationFrame(() => { this.tick() });
  }

  start() {
    this.t = this.t0;
    this.tick();
  }
}

function main() {
  var drawer = new Drawer(drawerCanvas, plotCanvas);
  drawer.start();
}

main();