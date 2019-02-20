export default class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    get length() {
        return Math.hypot(this.x, this.y);
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    multiply(value) {
        return new Vector(this.x * value, this.y * value)
    }

    negate() {
        return this.multiply(-1);
    }

    normalize() {
        const length = this.length;
        if (length) {
            this.x /= length;
            this.y /= length;
        }
    }
}