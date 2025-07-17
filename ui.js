//created by @ynwumk5

let cols = 6;
let rows = 6;
let radius = 30;
let spacing = 100;
let margin = 80;

let grid = [];
let strokes = [];
let strokeColors = [];
let currentStroke = [];

let useColors = false;
let outlineOnly = true;
let showGrid = true;

window.setup = function () {
  const canvas = createCanvas(800, 800);
  canvas.parent("canvas-container");
  updateValues();
  rebuildGrid();
  attachNativeUIEvents();
};

window.draw = function () {
  background(255);

  if (showGrid) {
    stroke(200);
    noFill();
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        ellipse(grid[i][j].x, grid[i][j].y, radius * 2);
      }
    }
  }

  for (let i = 0; i < strokes.length; i++) {
    drawStroke(strokes[i], useColors ? strokeColors[i] : color(0));
  }
  drawStroke(currentStroke, color(0), false); // solid preview
};

function drawStroke(strokePath, col, isOutline = outlineOnly) {
  if (strokePath.length === 0) return;
  if (isOutline) {
    stroke(col);
    noFill();
  } else {
    fill(col);
    noStroke();
  }

  for (let i = 0; i < strokePath.length; i++) {
    let p = strokePath[i];
    ellipse(p.x, p.y, radius * 2);
    if (i > 0) drawCapsule(strokePath[i - 1], strokePath[i], radius);
  }
}

function drawCapsule(a, b, r) {
  let dir = p5.Vector.sub(b, a).normalize();
  let perp = createVector(-dir.y, dir.x).mult(r);
  let a1 = p5.Vector.add(a, perp);
  let a2 = p5.Vector.sub(a, perp);
  let b1 = p5.Vector.add(b, perp);
  let b2 = p5.Vector.sub(b, perp);
  beginShape();
  vertex(a1.x, a1.y); vertex(b1.x, b1.y);
  vertex(b2.x, b2.y); vertex(a2.x, a2.y);
  endShape(CLOSE);
}

window.mousePressed = function () {
  currentStroke = [];
};

window.mouseDragged = function () {
  let point = findClosestNode(mouseX, mouseY);
  if (point && !pointInStroke(point, currentStroke)) {
    currentStroke.push(point.copy());
  }
};

window.mouseReleased = function () {
  if (currentStroke.length > 0) {
    strokes.push(currentStroke.map(p => p.copy()));
    strokeColors.push(useColors ? color(random(30, 220), random(30, 220), random(30, 220)) : color(0));
    currentStroke = [];
  }
};

function findClosestNode(x, y) {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let node = grid[i][j];
      if (dist(x, y, node.x, node.y) < radius * 1.2) return node.copy();
    }
  }
  return null;
}

function pointInStroke(p, stroke) {
  return stroke.some(pt => p.equals(pt));
}

function updateValues() {
  radius = +document.getElementById('radius').value;
  spacing = +document.getElementById('spacing').value;
  margin = +document.getElementById('margin').value;
  cols = +document.getElementById('cols').value;
  rows = +document.getElementById('rows').value;
  rebuildGrid();
}

function rebuildGrid() {
  grid = [];
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = createVector(margin + i * spacing, margin + j * spacing);
    }
  }
}

function attachNativeUIEvents() {
  document.getElementById('radius').addEventListener('input', updateValues);
  document.getElementById('spacing').addEventListener('input', updateValues);
  document.getElementById('margin').addEventListener('input', updateValues);
  document.getElementById('cols').addEventListener('input', updateValues);
  document.getElementById('rows').addEventListener('input', updateValues);

  document.getElementById('clear').addEventListener('click', () => {
    strokes = [];
    strokeColors = [];
    currentStroke = [];
  });

  document.getElementById('toggleColor').addEventListener('click', () => useColors = !useColors);
  document.getElementById('toggleOutline').addEventListener('click', () => outlineOnly = !outlineOnly);
  document.getElementById('toggleGrid').addEventListener('click', () => showGrid = !showGrid);

  document.getElementById('send-to-figma').addEventListener('click', () => {
    let pg = createGraphics(width, height, SVG);
    pg.background(255);
    for (let i = 0; i < strokes.length; i++) {
      let col = useColors ? strokeColors[i] : color(0);
      pg.stroke(col);
      pg.strokeWeight(radius * 2);
      pg.noFill();
      for (let j = 0; j < strokes[i].length - 1; j++) {
        pg.line(strokes[i][j].x, strokes[i][j].y, strokes[i][j + 1].x, strokes[i][j + 1].y);
      }
    }
    const svgContent = pg.elt.innerHTML;
    parent.postMessage({ pluginMessage: { type: 'svg', data: svgContent } }, '*');
  });
}