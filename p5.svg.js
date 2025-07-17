// Fallback shim for p5.svg.js to prevent errors in Figma
console.warn("⚠️ p5.svg.js shim loaded (SVG renderer not used).");
p5.prototype.createGraphics = function(w, h, renderer) {
  return createGraphics(w, h);
};