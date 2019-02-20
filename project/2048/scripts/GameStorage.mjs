import {LocalStorage} from "../../common/Storage.mjs";

export default class GameStorage {
    constructor() {
        this._impl = new LocalStorage("2048");
    }

    get bestScore() {
        const str = this._impl.getItem("bestScore");
        if (typeof str !== "string") {
            return 0;
        }
        let result = parseInt(str);
        if (isNaN(result)) {
            return 0;
        }
        return result;
    }

    set bestScore(value) {
        this._impl.setItem("bestScore", value);
    }
}