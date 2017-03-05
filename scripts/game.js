var x, y, mouseX, mouseY, mouseOver, Vx = 0, Vy = 0, r = 50, w = 1920, h = 1080;
const UPS = 60, dt = 1/UPS;

function initialize()
{
    addEventListener("resize", updateSize)
    game_area.addEventListener("mousemove",  updateMousePosition);
    game_area.addEventListener("mouseover",  updateMouseOver);
    game_area.addEventListener("mouseout",   updateMouseOut);
    game_area.addEventListener("touchmove",  updateMousePosition);
    game_area.addEventListener("touchstart", updateMouseOver);
    game_area.addEventListener("touchend",   updateMouseOut);
    updateSize();
    game_area.width = w;
    game_area.height = h;
    mouseX = game_area.width/2;
    mouseY = game_area.height/2;
    x = game_area.width/2;
    y = game_area.height/2;
    window.setInterval(gameTick, 1000/UPS);
}

function updateSize()
{
    game_area.style.width = "100%";
    let h = game_area.clientWidth*9/16;
    game_area.style.height = h + "px";
    if (h > window.innerHeight - 70)
    {
        h = window.innerHeight - 70;
        game_area.style.height = h + "px";
        game_area.style.width = h*16/9 + "px";
    }
}

function updateMousePosition(p)
{
    b = game_area.getBoundingClientRect();
    mouseX = (p.pageX - b.left)*game_area.width /parseInt(game_area.clientWidth);
    mouseY = (p.pageY - b.top) *game_area.height/parseInt(game_area.clientHeight);
}

function updateMouseOver(p)
{
    mouseOver = true;
}

function updateMouseOut(p)
{
    mouseOver = false;
}

function gameTick()
{
    x += Vx*dt;
    y += Vy*dt;
    if (mouseOver)
    {
        let dax = 5*(mouseX - x) - 0.01*Vx;
        Vx += dax*dt;
        x  += dax*dt**2/2;
        let day = 5*(mouseY - y) - 0.01*Vy;
        Vy += day*dt;
        y  += day*dt**2/2;
    }
    {
        let dax = -0.1*Vx;
        Vx += dax*dt;
        x  += dax*dt**2/2;
        let day = -0.1*Vy;
        Vy += day*dt;
        y  += day*dt**2/2;
    }
    if (x < r)
    {
        x = 2*r - x;
        Vx *= -0.75;
    }
    if (x > w - r)
    {
        x = 2*(w - r) - x;
        Vx *= -0.75;
        Vy *= 0.95;
    }
    if (y < r)
    {
        y = 2*r - y;
        Vx *= 0.95;
        Vy *= -0.75;
    }
    if (y > h - r)
    {
        y = 2*(h - r) - y;
        Vx *= 0.95;
        Vy *= -0.75;
    }

    var context = game_area.getContext("2d");
    context.clearRect(0, 0, game_area.width, game_area.height);
    context.beginPath();
    context.arc(x, y, 50, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
}