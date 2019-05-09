export default class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    static FromPolar(angle, length) {
        return new Vector(length * Math.cos(angle), length * Math.sin(angle));
    }

    static get Zero() {
        return new Vector(0, 0);
    }

    get length() { // TODO
        // return Math.hypot(this.x, this.y);
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    multiply(value) {
        this.x *= value;
        this.y *= value;
        return this;
    }

    divide(value) {
        return this.multiply(1 / value);
    }

    negate() {
        return this.multiply(-1);
    }

    normalize() {
        const length = this.length;
        if (length === 0) {
            return this;
        }
        return this.divide(length);
    }

    scalarProduct(vec) {
        return (this.x * vec.x + this.y * vec.y);
    }

    vectorProductLength(vec) {
        return Math.abs(this.x * vec.y - this.y * vec.x);
    }

    get clone() {
        return new Vector(this.x, this.y);
    }
}