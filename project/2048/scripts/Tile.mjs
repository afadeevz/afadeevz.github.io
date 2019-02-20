import Random from "../../common/Random.mjs";

const Status = {
    Empty: "empty",
    Spawned: "spawned",
    Still: "still",
    Moved: "moved",
    Merged: "merged",
};

export default class Tile {
    constructor(index) {
        this.index = index;
        this.level = null;
        this.prevIndex = null;
        this.prevLevel = null;
        this.status = Status.Empty;
    }

    reset() {
        this.level = null;
        this.prevIndex = null;
        this.prevLevel = null;
        this.status = Status.Empty;
    }

    get isEmpty() {
        return (this.status === Status.Empty);
    }

    get ableToMerge() {
        return (this.status !== Status.Merged && this.status !== Status.Empty);
    }

    get scoreValue() {
        if (this.isEmpty) {
            return null;
        } else {
            return Math.pow(2, this.level);
        }
    }

    prepareForMove() {
        if (!this.isEmpty) {
            this.prevIndex = [this.index];
            this.prevLevel = [this.level];
            this.status = Status.Still;
        }
    }

    spawn() {
        this.level = 1 + Math.floor(Random.inRange(10) / 9);
        this.status = Status.Spawned;
    }

    mergeWith(tile) {
        if (!this.isEmpty) {
            tile.level++;
            tile.prevIndex.push(this.prevIndex[0]);
            tile.prevLevel.push(this.prevLevel[0]);
            tile.status = Status.Merged;
            this.reset();
        }
    }

    moveTo(tile) {
        if (!this.isEmpty) {
            tile.level = this.level;
            tile.prevLevel = this.prevLevel;
            tile.prevIndex = this.prevIndex;
            tile.status = Status.Moved;
            this.reset();
        }
    }

    equals(tile) {
        return (this.index === tile.index && this.level === tile.level);
    }

    clone() {
        let clonedTile = new Tile(this.index);
        clonedTile.level = this.level;
        clonedTile.prevLevel = this.prevLevel;
        clonedTile.prevIndex = this.prevIndex;
        clonedTile.status = this.status;
        return clonedTile;
    }

    static get Status() {
        return Status;
    }
}