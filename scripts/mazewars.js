'use strict';

var testMode = true;

window.onload = function()
{
    window.game = new cGame(gameCanvas);
    if (testMode)
    {
        window.game.test();
        window.setTimeout(function(){window.game.start();}, 1000);
    }
    else
        window.game.start();
}

class cTileSet
{
    constructor(context, imageFile, tileHeight, tileWidth = tileHeight)
    {
        var that = this;
        this.context = context;
        this.image = new Image();
        this.image.src = imageFile;
        this.tileHeight = tileHeight;
        this.tileWidth = tileWidth;
        this.tiles = [];
        this.compiled = false;
    }

    compile()
    {
        if (this.image.complete)
        {
            let w = Math.floor(this.image.width/this.tileWidth);
            let h = Math.floor(this.image.height/this.tileHeight);
            for (let i = 0; i < h; i++)
                for (let j = 0; j < w; j++)
                    this.tiles[i*w + j] = {x: j*this.tileWidth, y: i*this.tileHeight};
            console.log("cTileSet: " + this.image.src.substring(this.image.src.lastIndexOf('/')+1) + " is loaded");
            this.compiled = true;
            return true;
        }
        return false;
    }

    draw(id, x, y)
    {
        if (this.compiled || this.compile())
            this.context.drawImage(this.image, 
                              this.tiles[id].x, this.tiles[id].y, this.tileWidth, this.tileHeight,
                              x,                y,                this.tileWidth, this.tileHeight);
    }
}

class cMapSet
{
    constructor()
    {
        this.mapData    = null;
        this.tileSet    = null;
        this.tileSize   = null;
        this.dimensions = {x: null, y: null};
    }
    
    setTileSet(tileSet)
    {
        this.tileSet    = tileSet;
        this.tileWidth  = tileSet.tileWidth;
        this.tileHeight = tileSet.tileHeight;
    }

    setMapData(mapTiles, width, height)
    {
        this.dimensions.x = width;
        this.dimensions.y = height;
        this.mapData = [];
        for (let i = 0; i < height; i++)
        {
            this.mapData[i] = [];
            for (let j = 0; j < width; j++)
                this.mapData[i][j] = mapTiles[i*height + j]
        }
    }

    readMapData(mapDataFile)
    {
        console.log(window.location);
    }

    draw()
    {
        let h = this.dimensions.y;
        let w = this.dimensions.x;
        for (let i = 0; i < h; i++)
            for (let j = 0; j < w; j++)
                this.tileSet.draw(this.mapData[i][j], j*this.tileWidth, i*this.tileHeight);
    }
}

class cFPSCounter
{
    constructor()
    {
        this.fps = 60;
        this.oldTime = new Date();
    }

    update()
    {
        let newTime = new Date();
        let d = newTime.getTime() - this.oldTime.getTime();
        this.oldTime = newTime;
        this.fps = (19*this.fps + 1000/d)/20;
    }
}

class cGame
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.UPS = 60;
        this.camera = {x: 960, y: 960, vx: 0, vy: 0, angle: Math.PI/4};
        this.FPSCounter = new cFPSCounter();
        this.keysStatus = {};
        console.log("Game: Initialization")
        this.resize();
        let that = this;
        window.addEventListener("resize", function(){that.resize();});
    }

    resize()
    {
        let canvas = this.canvas;
        canvas.style.width = "100%";
        let w = canvas.clientWidth;
        let h;
        if (innerHeight === outerHeight) //fullscreen
            h = innerHeight;
        else
            h = innerHeight - 30;
        canvas.style.height = h + "px";
        canvas.height = h;
        canvas.width = w;
    }

    drawFrame()
    {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.translate(this.canvas.width/2, this.canvas.height/2);
        this.context.rotate(this.camera.angle);
        this.context.translate(-this.camera.x, -this.camera.y);
        this.testMapSet.draw();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        let that = this;
        this.FPSCounter.update();
        this.context.font = "64pt Serif";
        this.context.fillStyle = "red";
        if (this.FPSCounter.fps < 55)
            this.context.fillText(Math.round(this.FPSCounter.fps), 10, 70);
        requestAnimationFrame(function(){that.drawFrame();});
    }

    test()
    {
        console.log("Game: Testing");
        this.testTileSet = new cTileSet(this.context, "scripts/data/test.png", 64);
        let that = this;
        window.setTimeout(function()
        {
            console.log("-tileSet");
            that.testTileSet.draw(2, 42, 42);
            console.log("-mapSet");
            that.context.setTransform(1, 0, 0, 1, 0, 0);
            that.context.translate(250, 20);
            that.context.rotate(Math.PI/4);
            that.testMapSet = new cMapSet();
            that.testMapSet.setTileSet(that.testTileSet);
            let size = 30;
            let data = [];
            for (let i = 0; i <= size**2; i++)
                data[i] = i%3;
            that.testMapSet.setMapData(data, size, size);
            that.testMapSet.draw();
            console.log("Game: Testing is complete");
        },10);
    }

    start()
    {
        let that = this;
        window.setInterval(function(){that.tick();}, 1000/this.UPS);
        requestAnimationFrame(function(){that.drawFrame();});
    }

    tick()
    {
        // that.camera.x--;
        // that.camera.y--;
        this.camera.angle += Math.PI/180;
    }
}