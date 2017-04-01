/* To do list:
   //-moveable objects
   //-camera following objects
   -mapSet drawing optimization
   -make camera use controller
   -fix camera positioning
*/

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

class cCounter
{
    constructor(expectedRate = null)
    {
        this.rate = expectedRate;
        this.oldTime = null;
    }

    update()
    {
        let newTime = new Date();
        if (this.oldTime == null)
            this.oldTime = newTime;
        else 
        {
            let d = newTime.getTime() - this.oldTime.getTime();
            if (this.rate == null)
                this.rate = 1000/d;
            else
                this.rate = (24*this.rate + 1000/d)/25;
            this.oldTime = newTime;
        }
        
    }
}

class cKeyboard
{
    constructor()
    {
        this.pressed = [];
    }

    update(e)
    {  
        if (e.type == "keypress" || e.type == "keydown")
            this.pressed[e.code] = true;
        else if (e.type == "keyup")
            this.pressed[e.code] = false;
        this.isPressed(e.code);
    }

    isPressed(keyCode)
    {
        if (this.pressed[keyCode] == undefined)
            return false;
        return this.pressed[keyCode];
    }
}

function setTrueInterval(f, delay, counter = new cCounter(1000/delay))
{
    f();
    counter.update();
    window.setTimeout(function(){setTrueInterval(f, delay, counter)}, 2*delay - 1000/counter.rate);
}

/* Multiplication of 2 matrices with sizes MxN and NxL */
function mMultiply(A, B, n)
{
    let C = [];
    let m = A.length/n;
    let l = B.length/n; 
    for (let i = 0; i < m; i++)
        for (let j = 0; j < l; j++)
        {
            C[l*i + j] = 0;
            for (let k = 0; k < n; k++)
                C[l*i + j] += A[n*i + k]*B[l*k + j];
        }
    return C;
}

class cTranformationMatrix
{
    constructor()   
    {
        this.matrix = [1, 0, 0,
                       0, 1, 0,
                       0, 0, 1];
    }

    translate(x, y) 
    {
        this.matrix = mMultiply([1, 0, x,
                                 0, 1, y,
                                 0, 0, 1], this.matrix, 3);
    }

    rotate(a)
    {
        this.matrix = mMultiply([Math.cos(a),-Math.sin(a), 0,
                                 Math.sin(a), Math.cos(a), 0,
                                 0,           0,           1], this.matrix, 3);
    }

    rotateP(a, x, y)
    {
        this.translate(-x, -y);
        this.rotate(a);
        this.translate(x, y);
    }

    scale(f)
    {
        this.matrix = mMultiply([f, 0, 0,
                                 0, f, 0,
                                 0, 0, 1], this.matrix, 3);
    }

    scaleP(f, x, y)
    {
        this.translate(-x, -y);
        this.scale(f);
        this.translate(x, y);
    }

    apply(context)
    {
        context.setTransform(this.matrix[0],this.matrix[3],this.matrix[1],this.matrix[4],this.matrix[2],this.matrix[5]);
    }
}

class cCamera
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.target = null;
        this.reset(); 
    }

    reset()
    {
        this.x = 0;
        this.y = 0;
        this.a = 0;
        this.zoomLevel = 0;
        this.xPrev = 0;
        this.yPrev = 0;
        this.aPrev = 0;
        this.vx = 0;
        this.vy = 0;
        this.matrix = new cTranformationMatrix();
        // this.matrix.translate(this.canvas.width/2, this.canvas.height/2);
    }

    follow(object)
    {
    	this.target = object;
    }

    update()
    {
    	if (this.target)
    	{
            // this.reset();
	    	this.x = this.target.x;
	    	this.y = this.target.y;
	    	this.a = this.target.a;
            let f = 1.1**this.zoomLevel;
            let fcos = f*Math.cos(this.a);
            let fsin = f*Math.sin(this.a);
            this.matrix.matrix = [fcos, fsin,-this.x*fcos - this.y*fsin + this.canvas.width/2 ,
                                 -fsin, fcos, this.x*fsin - this.y*fcos + this.canvas.height/2,
                                  0   , 0,    1                                               ]
            // this.matrix.translate(-this.x, -this.y);
            // this.matrix.rotateP(this.a, this.canvas.width/2, this.canvas.height/2);
    	}
    	else
    	{
    		this.translate(this.x - this.xPrev, this.y - this.yPrev);
	        this.rotate(this.a - this.aPrev);
	    	this.xPrev = this.x;
	    	this.yPrev = this.y;
	    	this.aPrev = this.a;
    	}
    }

    translate(x, y)
    {
        this.x += x;
        this.y += y;
        this.matrix.translate(x, y);
    }

    rotate(a)
    {
        this.a += a;
        this.matrix.rotateP(a, this.canvas.width/2, this.canvas.height/2);
    }

    zoom(e)
    {
        // let f;
        if (e.wheelDelta > 0)
            this.zoomLevel++;
        else
            this.zoomLevel--;
        // this.matrix.scaleP(f, this.canvas.width/2, this.canvas.height/2);
    }
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

    draw(matrix)
    {
        matrix.apply(this.tileSet.context);
        let h = this.dimensions.y;
        let w = this.dimensions.x;
        for (let i = 0; i < h; i++)
            for (let j = 0; j < w; j++)
            {
                let coords = mMultiply(matrix.matrix,[(j + 0.5)*this.tileWidth, (i + 0.5)*this.tileHeight, 1], 3);
                if (-100 < coords[0] && coords[0] < 1500 && -100 < coords[1] && coords[1] < 1500)
                    this.tileSet.draw(this.mapData[i][j], j*this.tileWidth, i*this.tileHeight);
            }
    }
}

class cAnimationSet extends cTileSet
{
    constructor(frames, context, imageFile, tileHeight, tileWidth = tileHeight)
    {
        super(context, imageFile, tileHeight, tileWidth);
        this.frames = frames;
        this.currentFrame = 0;
        this.period = 15;
        this.progress = 0;
    }

    setFrames(frames)
    {
        this.frames = frames;
    }

    advance()
    {
        this.progress = (this.progress + 1)%this.period;
        if (this.progress == 0)
            this.currentFrame = (this.currentFrame + 1)%this.frames.length; 
    }

    draw(x, y, a, camera)
    {
    	this.context.save();
    	let M = new cTranformationMatrix();
    	M.rotateP(a, x + this.tileWidth/2, y + this.tileHeight/2);
        M.translate(-this.tileWidth/2, -this.tileHeight/2);
    	M.matrix = mMultiply(camera.matrix.matrix, M.matrix, 3);
    	M.apply(this.context);
        super.draw(this.currentFrame, x, y);
    	this.context.restore();
    }
}

class cObject
{
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.a = 0;//-Math.PI/4;
        this.vx = 1;
        this.vy = 1;
        this.va = 0;//.1;
        this.animSet = null;
        this.controller = null;
    }

    setAnimSet(animSet)
    {
        this.animSet = animSet;
    }

    setController(controller)
    {
    	this.controller = controller;
    }

    draw(camera)
    {
        this.animSet.draw(this.x, this.y, this.a, camera);
    }

    move()
    {
        if (this.controller)
        {
        	let ins = this.controller.instructions;

            let cos = Math.cos(this.a);
            let sin = Math.sin(this.a)
            this.vx += 0.01*(-ins.x*cos + ins.y*sin);
            this.vy += 0.01*(-ins.x*sin - ins.y*cos);
        	this.va += 0.1*ins.a;
        }
        this.x += this.vx;
        this.y += this.vy;
        this.a += this.va;
    }
}

class cHumanController
{
	constructor(keyboard)
	{
		this.keyboard = keyboard;
	}

	get instructions()
	{
		let x = 0, y = 0;
        if (this.keyboard.isPressed("KeyW"))
            y++;
        if (this.keyboard.isPressed("KeyS"))
            y--;
        if (this.keyboard.isPressed("KeyA"))
            x++;
        if (this.keyboard.isPressed("KeyD"))
            x--;
        let a = 0;
        if (this.keyboard.isPressed("KeyQ"))   
        {
            a -= Math.PI/900;
        }
        if (this.keyboard.isPressed("KeyE"))   
        {
            a += Math.PI/900;
        }
        return {x: x, y: y, a: a};
	}
}

class cGame
{
    constructor(canvas)
    {
        console.log("Game: Initialization")
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.UPS = 60;
        this.FPSCounter = new cCounter(60);
        this.UPSCounter = new cCounter(60);
        this.keyboard = new cKeyboard();
        this.camera = new cCamera(canvas);
        this.resize();
        let that = this;
        window.addEventListener("mousewheel", function(e){that.camera.zoom(e);});
        window.addEventListener("resize", function(){that.resize();});
        ["keydown", "keypress", "keyup"].forEach(function(e){window.addEventListener(e, function(e){that.keyboard.update(e)});});
    }

    resize()
    {
        this.canvas.style.width = "100%";
        let w = this.canvas.clientWidth;
        let h = innerHeight;
        this.canvas.style.height = h + "px";
        this.canvas.height = h;
        this.canvas.width = w;
    }

    drawFrame()
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.testMapSet.draw(this.camera.matrix);
        this.camera.update();
        this.ship.draw(this.camera);
        this.ship.animSet.advance();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        let that = this;
        this.FPSCounter.update();
        if (testMode)
        {
            this.context.fillStyle = "red";
            this.context.font = "48pt Arial";
            this.context.fillText(Math.round(this.FPSCounter.rate), 10, 50);
            this.context.fillText(Math.round(this.UPSCounter.rate), 10, 100);
            this.context.font = "16pt Arial";
            this.context.fillText("FPS", 80, 50);
            this.context.fillText("UPS", 80, 100);
        }
        requestAnimationFrame(function(){that.drawFrame();});
    }

    test()
    {
        console.log("Game: Testing");
        console.log("-tileSet");
        this.testTileSet = new cTileSet(this.context, "scripts/data/test.png", 64);
        this.shipAnimation = new cAnimationSet([0,1], this.context, "scripts/data/spaceship.png", 128, 64);
        let that = this;
        window.setTimeout(function()
        {
            that.testTileSet.draw(2, 42, 42);
            console.log("-mapSet + camera");
            that.camera.translate(250, 20);
            that.camera.rotate(-Math.PI/4, 250, 20);
            that.camera.matrix.apply(that.context);
            that.testMapSet = new cMapSet();
            that.testMapSet.setTileSet(that.testTileSet);
            let size = 50;
            let data = [];
            for (let i = 0; i <= size**2; i++)
                data[i] = i%3;
            that.testMapSet.setMapData(data, size, size);
            // let data = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            //             1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            //             1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            //             1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            //             1, 0, 0, 0, 2, 2, 0, 0, 0, 1,
            //             1, 0, 0, 0, 2, 2, 0, 0, 0, 1,
            //             1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            //             1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            //             1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            //             1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
            // that.testMapSet.setMapData(data, 10, 10);
            that.testMapSet.draw(that.camera.matrix);
            console.log("-object");
            that.ship = new cObject();
            that.ship.setAnimSet(that.shipAnimation);
            that.ship.setController(new cHumanController(that.keyboard));
            console.log(that.ship);
            that.ship.draw(that.camera);
            that.camera.reset();
            that.camera.follow(that.ship);
        },10);
    }

    start()
    {
        let that = this;
        window.setTrueInterval(function(){that.tick();}, 1000/this.UPS);
        requestAnimationFrame(function(){that.drawFrame();});
    }

    processKeyboard()
    {
        let dx = 0, dy = 0;
        if (this.keyboard.isPressed("KeyW"))
            dy++;
        if (this.keyboard.isPressed("KeyS"))
            dy--;
        if (this.keyboard.isPressed("KeyA"))
            dx++;
        if (this.keyboard.isPressed("KeyD"))
            dx--;
        let ds = Math.hypot(dx,dy);
        if (ds != 0)
        {
            dx *= 10/ds;
            dy *= 10/ds;
        }
        let da = 0;
        if (this.keyboard.isPressed("KeyQ"))   
        {
            da += Math.PI/90;
        }
        if (this.keyboard.isPressed("KeyE"))   
        {
            da -= Math.PI/90;
        }
    }

    tick()
    {
        this.processKeyboard();
        this.UPSCounter.update();
        this.ship.move();
    }
}
