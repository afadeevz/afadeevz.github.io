export default class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    get length() {
        return Math.hypot(this.x, this.y);
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
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


    get clone() {
        return new Vector(this.x, this.y);
    }
}