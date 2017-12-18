'use strict';

window.onload = function()
{
	let game = new cGame(gameCanvas);
	game.start();
}


class cGame
{
	constructor(canvas)
	{
		this.setState("Start");
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		let that = this;
		window.addEventListener("resize", function(){that.resize();});
		this.resize();

	}

	resize()
	{
		let h = window.innerHeight;
		let w = window.innerWidth;
		this.canvas.style.height = h + 'px';
		this.canvas.style.width  = w + 'px';
		this.canvas.height = h;
		this.canvas.width  = w;
	}

	setState(newState)
	{
		if (this.state)
			console.log("State: [" + this.state + "] => [" + newState + "]");
		else
			console.log("State: [" + newState + "]");
		this.state = newState;
	}

	start()
	{
		this.setState("Load");
		
	}
}