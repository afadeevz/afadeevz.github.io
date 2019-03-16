export default class Random {
    static inRange(n) {
        return Math.min(n - 1, Math.floor(Math.random() * n));
    }
};