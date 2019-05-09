import Vector from "./Vector.mjs";

export default class Mouse {
    constructor(element = window.document, scale = null) {
        this._element = element;
        this._scale = scale;

        this.position = new Vector();
        this._mouseOver = false;
        this._mousePressed = false;

        this._init();
    }

    get isPressed() {
        return this._mouseOver && this._mousePressed
    }

    onMove(cb) {
        this._element.addEventListener("mousemove", (event) => {
            this._onMouseMove(event);
            cb(this.position);
        })
    }

    _init() {
        this._element.addEventListener("mousemove", this._onMouseMove.bind(this));
        this._element.addEventListener("mousedown", this._onMouseDown.bind(this));
        this._element.addEventListener("mouseup", this._onMouseUp.bind(this));
        this._element.addEventListener("mouseover", this._onMouseOver.bind(this));
        this._element.addEventListener("mouseout", this._onMouseOut.bind(this));
    }

    _onMouseMove(event) {
        const rect = this._element.getBoundingClientRect();
        this.position.x = (event.clientX - rect.left);
        this.position.y = (event.clientY - rect.top);

        if (this._scale) {
            this.position.x *= this._scale.x / this._element.clientWidth;
            this.position.y *= this._scale.y / this._element.clientHeight;
        }

    }

    _onMouseDown() {
        this._mousePressed = true;
        this._mouseOver = true;
    }

    _onMouseUp() {
        this._mousePressed = false;
    }

    _onMouseOver() {
        this._mouseOver = true;
    }

    _onMouseOut() {
        this._mouseOver = false;
    }
}