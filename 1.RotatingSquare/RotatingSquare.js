/**
 * @file
 *
 * Summary.
 *
 * Square with different colors at each vertex that rotates counterclockwise around the purple vertex
 * at a rate of two degrees per frame.
 *
 * When a key is pressed, the square starts to rotate around a different vertex depending on which key is pressed:
 * -> 'g' for the gray corner
 * -> 'y' for the yellow corner
 * -> 'l' for the lilac corner
 * -> 'p ' to the purple corner
 *
 * @author Gabriele Jandres Cavalcanti
 * @since 06/09/2022
 * @see https://gabrielejandres.github.io/computer-graphics-2022.2/1.RotatingSquare/RotatingSquare.html
 */

"use strict";

// -------- Global variables --------

/**
 * Raw data for some point positions - this will be a square, consisting of two triangles.
 *
 * We provide two values per vertex for the x and y coordinates (z will be zero by default).
 *
 * @type {Float32Array}
 */
var vertices = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);

/**
 * Number of points (vertices) of the square.
 *
 * @type {Number}
 */
var numPoints = vertices.length / 2;

/**
 * Canvas width.
 *
 * @type {Number}
 */
var w;

/**
 * Canvas height.
 *
 * @type {Number}
 */
var h;

// -------- Functions --------

/**
 * Maps a point in world coordinates to viewport coordinates.
 *
 * - [-n,n] x [-n,n] -> [-w,w] x [h,-h]
 *
 * Note that the Y axix points downwards.
 *
 * @param {Number} x point x coordinate.
 * @param {Number} y point y coordinate.
 * @param {Number} n window size.
 *
 * @returns {Array<Number>} transformed point.
 */
function mapToViewport(x, y, n = 5) {
  return [((x + n / 2) * w) / n, ((-y + n / 2) * h) / n];
}

/**
 * Returns the coordinates of the vertex at index i.
 *
 * @param {Number} i vertex index.
 *
 * @returns {Array<Number>} vertex coordinates.
 */
function getVertex(i) {
  let j = (i % numPoints) * 2;
  return [vertices[j], vertices[j + 1]];
}

/**
 * Code to actually render our geometry.
 *
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} angle rotation angle in degrees. If you want a counterclockwise rotation, you have to provide negative values.
 * @param {Number} vertexIndex optional param that indicates fixed vertex in square rotation. The default vertex is the purple one.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
function draw(ctx, angle, vertexIndex = 5) {
  let squareSize = 80; // Estimated square size for use in creating the gradient
  let borderWidth = 6; // The border widht of the square
  let gradient; // Gradient to fill the square
  let [x, y] = mapToViewport(...getVertex(vertexIndex).map((x) => x)); // The coordinates of the given vertex

  // Draw background
  ctx.fillStyle = "#f2f2f2";
  ctx.rect(0, 0, w, h);
  ctx.fill();

  // JSON that maps vertices indexes to colors
  let colorByIndex = {
    5: "#480048", // purple -> purple
    2: "#a15a9e", // lilac -> lilac
    1: "#fab950", // yellow -> yellow
    0: "#333333", // gray -> gray
  };

  // Create gradients according to vertices indexes
  if (vertexIndex == 1 || vertexIndex == 5) {
    // Create a linear gradient where the start gradient point is at x, y and the end gradient point is at x + squareSize, y + squareSize
    gradient = ctx.createLinearGradient(
      160,
      160,
      160 + squareSize,
      160 + squareSize
    );
    gradient.addColorStop(0, colorByIndex[5]); // purple
    gradient.addColorStop(1, colorByIndex[1]); // yellow
  } else {
    // Create a rotated linear gradient
    gradient = ctx.createLinearGradient(
      160,
      160,
      160 + squareSize,
      160 + Math.sin(-Math.PI / 2) * squareSize
    );
    gradient.addColorStop(0, colorByIndex[0]); // gray
    gradient.addColorStop(0.5, colorByIndex[2]); // lilac
    gradient.addColorStop(1, colorByIndex[2]); // lilac
  }

  // Draw square
  ctx.beginPath();
  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    let [x, y] = mapToViewport(...getVertex(i).map((x) => x));
    if (i == 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw border
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = "rgba(111, 115, 120, 1)";
  ctx.stroke();

  // Draw vertices
  for (let i = 0; i < numPoints; i++) {
    if (i == 3 || i == 4) continue;
    let [x, y] = mapToViewport(...getVertex(i).map((x) => x));

    ctx.beginPath();
    ctx.fillStyle = colorByIndex[i]; // Color to fill this vertex
    ctx.arc(x, y, 4, 0, 2 * Math.PI); // Demarcates the circle for vertex
    ctx.fill();
    ctx.closePath();
  }

  // Square rotation
  ctx.translate(x, y); // First, we translate the context to the center that we wish to rotate around (coordinates of the given vertex)
  ctx.rotate((angle * Math.PI) / 180); // Then, we perform the rotation with the value of angle
  ctx.translate(-x, -y); // Finally, we translate the context back
}

/**
 * Entry point when page is loaded.
 *
 * Basically this function does setup that "should" only have to be done once,
 * while draw() does things that have to be repeated each time the canvas is purplerawn.
 */
function mainEntrance() {
  // Retrieve <canvas> element
  let canvasElement = document.querySelector("#theCanvas");
  let ctx = canvasElement.getContext("2d");

  let vertexIndex; // The vertex index selected by user
  w = canvasElement.width; // Set up the width of the canvas
  h = canvasElement.height; // Set up the height of the canvas

  // Listener to capture keyboard events
  document.addEventListener("keydown", (event) => {
    switch (event.code) {
      case "KeyP":
        console.log(event.key, "was pressed"); // Indicates in console that P or p was pressed
        vertexIndex = 5;
        break;
      case "KeyG":
        console.log(event.key, "was pressed"); // Indicates in console that G or g was pressed
        vertexIndex = 0;
        break;
      case "KeyY":
        console.log(event.key, "was pressed"); // Indicates in console that Y or y was pressed
        vertexIndex = 1;
        break;
      case "KeyL":
        console.log(event.key, "was pressed"); // Indicates in console that L or l was pressed
        vertexIndex = 2;
        break;
    }
  });

  /**
   * A closure to set up an animation loop in which the square rotates by incrementing the angle of rotation
   * @global
   * @function
   */
  var runanimation = (() => {
    var angle = 0;
    return () => {
      draw(ctx, angle, vertexIndex);
      angle -= 2;
      if (angle <= -4) angle += 2;

      // Request that the browser calls runanimation() again "as soon as it can"
      requestAnimationFrame(runanimation);
    };
  })();

  // Draw
  runanimation();
}
