class Leg {

    constructor(canvas, c1, c2, c3) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.c1 = c1;
        this.c2 = c2;
        this.c3 = c3;
    }

    drawLine(x1, y1, x2, y2, c) {
        this.context.strokeStyle = c;
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    drawCircle(x, y, r, c) {
        this.context.strokeStyle = c;
        this.context.beginPath();
        this.context.arc(x, y, r, 0, 2 * Math.PI);
        this.context.stroke();
    }

    draw(aAngle, bAngle) {
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
        let r = h / 50;

        this.context.lineWidth = 3;

        this.drawLine(x1, y1, x2, y2, this.c1);
        this.drawLine(x2, y2, x3, y3, this.c2);
        this.drawLine(x3, y3, x4, y4, this.c2);

        this.drawCircle(x1, y1, r, this.c3);
        this.drawCircle(x2, y2, r, this.c3);
        this.drawCircle(x3, y3, r, this.c3);
    }
}

class Drawer {

    aAngle(t) {
        let result = this.a0 + this.a(t);
        if (this.aAngleUnit == "grad")
            result *= Math.PI / 180;
        if (this.aInverted)
            result *= -1;
        result += Math.PI / 2
        return result;
    }

    bAngle(t) {
        let result = this.b0 + this.b(t);
        if (this.bAngleUnit == "grad")
            result *= Math.PI / 180;
        if (this.bInverted)
            result *= -1;
        if (this.bRelative)
            result += this.aAngle(t) - Math.PI / 2;
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
        console.log("l1 = " + this.l1);
        try {
            this.l2 = (new Function('return (' + this.formula2expression(lDown.value) + ');'))();
            lDown.style.backgroundColor = "";
        } catch (error) {
            this.l2 = 1;
            lDown.style.backgroundColor = "red";
        }
        this.legFront.l2 = this.l2;
        this.legBack.l2 = this.l2;
        console.log("l2 = " + this.l2);
        try {
            this.a0 = (new Function('return (' + this.formula2expression(aStart.value) + ');'))();
            aStart.style.backgroundColor = "";
        } catch (error) {
            this.a0 = 0;
            aStart.style.backgroundColor = "red";
        }
        console.log("a0 = " + this.a0);
        try {
            this.b0 = (new Function('return (' + this.formula2expression(bStart.value) + ');'))();
            bStart.style.backgroundColor = "";
        } catch (error) {
            this.b0 = 0;
            bStart.style.backgroundColor = "red";
        }
        console.log("b0 = " + this.b0);
        try {
            this.t0 = (new Function('return (' + this.formula2expression(tStart.value) + ');'))();
            tStart.style.backgroundColor = "";
        } catch (error) {
            this.t0 = 0;
            tStart.style.backgroundColor = "red";
        }
        console.log("t0 = " + this.t0);
        try {
            this.tf = (new Function('return (' + this.formula2expression(tFinish.value, Infinity) + ');'))();
            tFinish.style.backgroundColor = "";
        } catch (error) {
            this.tf = Infinity;
            tFinish.style.backgroundColor = "red";
        }
        console.log("tf = " + this.tf);
        try {
            this.dt = (new Function('return (' + this.formula2expression(dt.value, 0) + ');'))();
            dt.style.backgroundColor = "";
        } catch (error) {
            this.dt = 0;
            dt.style.backgroundColor = "red";
        }
        console.log("dt = " + this.dt);
        try {
            this.a = new Function('t', 'return (' + this.formula2expression(at.value) + ');');
            this.a(this.t0);
            at.style.backgroundColor = "";
        } catch (error) {
            this.a = new Function('t', 'return 0;')
            at.style.backgroundColor = "red";
        }
        console.log("a(t) = ", this.a);
        try {
            this.b = new Function('t', 'return (' + this.formula2expression(bt.value) + ');');
            this.b(this.t0);
            bt.style.backgroundColor = "";
        } catch (error) {
            this.b = new Function('t', 'return 0;')
            bt.style.backgroundColor = "red";
        }
        console.log("b(t) = ", this.b);
        this.aInverted = aInverted.checked;
        console.log("aInverted = ", this.aInverted);
        this.bInverted = bInverted.checked;
        console.log("bInverted = ", this.bInverted);
        this.bRelative = bRelative.checked;
        console.log("bRelative = ", this.bRelative);
        this.aAngleUnit = aAngleUnit.value;
        console.log("aAngleUnit = ", this.aAngleUnit);
        this.bAngleUnit = bAngleUnit.value;
        console.log("bAngleUnit = ", this.bAngleUnit);
    }

    resize(e) {
        let h = this.canvas.scrollHeight;
        this.canvas.height = h;
        let w = this.canvas.scrollWidth;
        this.canvas.width = w;
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.legFront = new Leg(canvas, "#EE0000", "#00EE00", "#000000");
        this.legBack = new Leg(canvas, "#EE7777", "#77EE77", "#777777");
        this.update();
        this.t = this.t0;
        window.addEventListener("input", (e) => { this.update(e) });
        window.addEventListener("change", (e) => { this.update(e) });
        this.resize();
        window.addEventListener("resize", (e) => { this.resize(e) });
    }

    draw(t1, t2) {
        let h = this.canvas.height;
        let w = this.canvas.width;
        this.context.clearRect(0, 0, w, h);

        this.legBack.draw(this.aAngle(t2), this.bAngle(t2));
        this.legFront.draw(this.aAngle(t1), this.bAngle(t1));
    }

    tick() {
        let t1 = this.t;
        let t2 = this.t - this.dt;
        if (t2 < this.t0) {
            t2 += this.tf - this.t0;
        }
        this.draw(t1, t2);
        this.t += 1 / 600;
        if (this.t < this.tf) {
            window.requestAnimationFrame(() => { this.tick() });
        } else {
            if (this.t > this.tf) {
                this.t += this.t0 - this.tf;
            }
            window.requestAnimationFrame(() => { this.tick() });
            //setTimeout(() => { window.requestAnimationFrame(() => { this.tick() }) }, 1000);
        }
    }

    start() {
        this.tick();
    }
}

function main() {
    var drawer = new Drawer(drawerCanvas);
    drawer.start();
}

main();