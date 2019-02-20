import Vector from "../../common/Vector.mjs";
import Mouse from "../../common/Mouse.mjs";

class PIDController {
    constructor(params) {
        this.kP = params.kP;
        this.kI = params.kI;
        this.kD = params.kD;

        this.prevTime = null;
        this.prevError = null;
        this.integral = 0;
    }

    reset() {
        this.prevTime = null;
        this.prevError = null;
        this.integral = 0;
    }

    controlVariable(error) {
        let time = new Date();

        let result = error * this.kP;
        if (this.prevTime) {
            let deltaError = error - this.prevError;
            let deltaTime = (time - this.prevTime) / 1000;

            this.integral += error * deltaTime;
            this.integral += deltaError * deltaTime / 2;
            result += this.integral * this.kI;

            let derivative = deltaError / deltaTime;
            result += derivative * this.kD;
        }

        this.prevTime = time;
        this.prevError = error;
        return result;
    }
}

class BallFactory {
    constructor(canvas, ballParams) {
        this.mouse = new Mouse(canvas);
        this.ballParams = ballParams;
    }

    getBall() {
        return new Ball(this.ballParams);
    }
}

class Ball {
    constructor(params) {
        this.mouse = params.mouse;
        this.position = params.position;
        this.radius = params.radius;
        this.airResistance = params.airResistance;
        this.hitSpeedCoef = params.hitSpeedCoef;
        this.hitSpeedCoefSecondary = params.hitSpeedCoefSecondary;
        this.speed = new Vector(0, 0);
        let PIDParams = params.PIDParams;
        this.controller = {
            x: new PIDController(PIDParams),
            y: new PIDController(PIDParams),
            both: new PIDController(PIDParams),
        };
        this.controller.both.kI = 0; // FIXME
    }

    update(deltaTime) {
        let dt = deltaTime / 1000;
        let shift = this.speed.clone.multiply(dt);
        let acceleration = this.speed.clone.multiply(this.airResistance);
        shift.add(acceleration.clone.multiply(Math.pow(dt, 2) / 2));
        this.position.add(shift);
        this.speed.add(acceleration.clone.multiply(dt));

        const g = 1;
        acceleration = new Vector(0, g);
        shift.add(acceleration.clone.multiply(Math.pow(dt, 2) / 2));
        this.position.add(shift);
        this.speed.add(acceleration.clone.multiply(dt));

        if (this.mouse.isPressed) {
            let acceleration = new Vector(
                this.controller.x.controlVariable(this.mouse.position.x - this.position.x),
                this.controller.y.controlVariable(this.mouse.position.y - this.position.y)
            );
            this.speed.add(acceleration.clone.multiply(dt));
            this.position.add(acceleration.clone.multiply(Math.pow(dt, 2) / 2));

            let deltaPosition = this.mouse.position.clone.add(this.position.clone.negate());
            let accelerationBoth = this.controller.both.controlVariable(deltaPosition.length);
            deltaPosition.normalize();
            let accelerationBothVec = deltaPosition.clone.multiply(accelerationBoth);
            this.speed.add(accelerationBothVec.clone.multiply(dt));
            this.position.add(accelerationBothVec.clone.multiply(Math.pow(dt, 2) / 2));
        } else {
            this.controller.x.reset();
            this.controller.y.reset();
        }

        let h = 1;
        let w = 16 / 9;
        if (this.position.x < this.radius) {
            this.position.x = 2 * this.radius - this.position.x;
            this.speed.x *= -this.hitSpeedCoef;
            this.speed.y *= this.hitSpeedCoefSecondary;
        }
        if (this.position.x > w - this.radius) {
            this.position.x = 2 * (w - this.radius) - this.position.x;
            this.speed.x *= -this.hitSpeedCoef;
            this.speed.y *= this.hitSpeedCoefSecondary;
        }
        if (this.position.y < this.radius) {
            this.position.y = 2 * this.radius - this.position.y;
            this.speed.y *= -this.hitSpeedCoef;
            this.speed.x *= this.hitSpeedCoefSecondary;
        }
        if (this.position.y > h - this.radius) {
            this.position.y = 2 * (h - this.radius) - this.position.y;
            this.speed.y *= -this.hitSpeedCoef;
            this.speed.x *= this.hitSpeedCoefSecondary;
        }
    }
}

class Graphics {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.canvas.addEventListener("resize", this.resize.bind(this));
        this.resize();
    }

    resize() {
        this.canvas.style.width = "100%";
        let w = this.canvas.clientWidth;
        let h = w * 9 / 16;
        const offset = 80;
        if (h > window.innerHeight - offset) {
            h = window.innerHeight - offset;
            this.canvas.style.height = `${h}px`;
            w = h * 16 / 9;
            this.canvas.style.width = `${w}px`;
        } else {
            this.canvas.style.height = `${h}px`;
        }
        this.canvas.width = w;
        this.canvas.height = h;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBall(ball) {
        this.context.beginPath();
        const x = ball.position.x * this.canvas.height;
        const y = ball.position.y * this.canvas.height; // Because y goes up to 16/9
        const r = ball.radius * this.canvas.height;
        this.context.arc(x, y, r, 0, 2 * Math.PI, false);
        this.context.fillStyle = "#01BACE";
        this.context.fill();
    }
}

class Game {
    constructor(canvas) {
        this.graphics = new Graphics(canvas);
        this.factory = new BallFactory(canvas, {
            mouse: new Mouse(canvas, new Vector(16 / 9, 1)),
            position: new Vector(16 / 9 / 2, 1 / 2),
            radius: 1 / 20,
            airResistance: -0.25,
            hitSpeedCoef: 0.75,
            hitSpeedCoefSecondary: 0.95,
            PIDParams: {
                kP: 50,
                kI: 1,
                kD: 10,
            }
        });
        this.ball = this.factory.getBall();
        this.prevTime = new Date();
    }

    update(deltaTime) {
        this.ball.update(deltaTime);
    }

    tick() {
        let time = new Date();
        let deltaTime = time - this.prevTime;
        this.update(deltaTime);
        this.graphics.clear();
        this.graphics.drawBall(this.ball);
        this.prevTime = time;
        window.requestAnimationFrame(this.tick.bind(this));
    }

    start() {
        this.tick();
    }
}

function main() {
    let gameCanvas = document.getElementById("gameCanvas");
    let game = new Game(gameCanvas);
    game.start();
}

main();