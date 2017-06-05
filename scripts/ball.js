var x, y, mouseX, mouseY, mouseOver, mousePressed, Vx = 0,
  Vy = 0,
  r = 50,
  w = 1920,
  h = 1080;
const UPS = 60,
  dt = 1 / UPS;

function initialize() {
  addEventListener("resize", updateSize);
  ["mousemove", "touchstart", "touchmove"].forEach(function(e) { game_area.addEventListener(e, updateMousePosition); });
  ["mousedown", "touchstart"].forEach(function(e) { game_area.addEventListener(e, function() { mousePressed = true; }); });
  ["mouseup", "touchend"].forEach(function(e) { window.addEventListener(e, function() { mousePressed = false; }); });
  ["mouseover"].forEach(function(e) { game_area.addEventListener(e, function() { mouseOver = true; }); });
  ["mouseout"].forEach(function(e) { game_area.addEventListener(e, function() { mouseOver = false; }); });

  updateSize();
  game_area.width = w;
  game_area.height = h;
  mouseX = game_area.width / 2;
  mouseY = game_area.height / 2;
  x = game_area.width / 2;
  y = game_area.height / 2;

  let context = game_area.getContext("2d");
  context.font = "64pt Serif"
  context.fillText("Press mouse button or\ntouch the screen to move the ball", 10, 100);
  1
  window.setTimeout(function() { window.setInterval(gameTick, 1000 / UPS); }, 1500);
}

function updateSize() {
  game_area.style.width = "100%";
  let h = game_area.clientWidth * 9 / 16;
  game_area.style.height = h + "px";
  if (h > window.innerHeight - 70) {
    h = window.innerHeight - 70;
    game_area.style.height = h + "px";
    game_area.style.width = h * 16 / 9 + "px";
  }
}

function updateMousePosition(p) {
  b = game_area.getBoundingClientRect();
  if (!p.clientX) {
    mouseX = (p.touches[0].clientX - b.left) * w / game_area.clientWidth;
    mouseY = (p.touches[0].clientY - b.top) * h / game_area.clientHeight;
    if (mouseX < 0 || mouseX > w || mouseY < 0 || mouseY > h)
      mouseOver = false;
    else
      mouseOver = true;
  } else {
    mouseX = (p.clientX - b.left) * w / game_area.clientWidth;
    mouseY = (p.clientY - b.top) * h / game_area.clientHeight;
  }
}

const kFres = -0.25;

function gameTick() {
  x += Vx * dt;
  y += Vy * dt;
  if (mouseOver && mousePressed) {
    let ax = 5 * (mouseX - x);
    Vx += ax * dt;
    x += ax * dt ** 2 / 2;
    let ay = 5 * (mouseY - y);
    Vy += ay * dt;
    y += ay * dt ** 2 / 2;
  } {
    let ax = kFres * Vx;
    Vx += ax * dt;
    x += ax * dt ** 2 / 2;
    let ay = kFres * Vy;
    Vy += ay * dt;
    y += ay * dt ** 2 / 2;
  }
  if (x < r) {
    x = 2 * r - x;
    Vx *= -0.75;
  }
  if (x > w - r) {
    x = 2 * (w - r) - x;
    Vx *= -0.75;
    Vy *= 0.95;
  }
  if (y < r) {
    y = 2 * r - y;
    Vx *= 0.95;
    Vy *= -0.75;
  }
  if (y > h - r) {
    y = 2 * (h - r) - y;
    Vx *= 0.95;
    Vy *= -0.75;
  }

  let context = game_area.getContext("2d");
  context.clearRect(0, 0, game_area.width, game_area.height);
  context.beginPath();
  context.arc(x, y, 50, 0, 2 * Math.PI, false);
  context.fillStyle = "#01BACE";
  context.fill();
}