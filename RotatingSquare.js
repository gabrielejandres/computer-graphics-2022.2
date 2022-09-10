/**
 * @file
 *
 * Summary.
 *
 * Vertices are scaled by an amount that varies by
 * frame, and this value is passed to the draw function.
 *
 * @author Gabriele Jandres Cavalcanti
 * @since 06/09/2022
 * @see
 */

"use strict";

/**
 * Raw data for some point positions -
 * this will be a square, consisting of two triangles.
 * <p>We provide two values per vertex for the x and y coordinates
 * (z will be zero by default).</p>
 * @type {Float32Array}
 */
var vertices = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);

/**
 * Number of points (vertices).
 * @type {Number}
 */
var numPoints = vertices.length / 2;

// A few global variables...

/**
 * Canvas width.
 * @type {Number}
 */
var w;

/**
 * Canvas height.
 * @type {Number}
 */
var h;

/**
 * Maps a point in world coordinates to viewport coordinates.<br>
 * - [-n,n] x [-n,n] -> [-w,w] x [h,-h]
 * <p>Note that the Y axix points downwards.</p>
 * @param {Number} x point x coordinate.
 * @param {Number} y point y coordinate.
 * @param {Number} n window size.
 * @returns {Array<Number>} transformed point.
 */
function mapToViewport(x, y, n = 5) {
  return [((x + n / 2) * w) / n, ((-y + n / 2) * h) / n];
}

/**
 * Returns the coordinates of the vertex at index i.
 * @param {Number} i vertex index.
 * @returns {Array<Number>} vertex coordinates.
 */
function getVertex(i) {
  let j = (i % numPoints) * 2;
  return [vertices[j], vertices[j + 1]];
}

/**
 * Code to actually render our geometry.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
function draw(ctx, angle, vertexIndex = 5) {
    // Desenha o background
    ctx.fillStyle = 'rgba(0, 204, 204, 1)';
    ctx.rect(0, 0, w, h);
    ctx.fill();
  
    let squareSize = 80;
    let borderWidth = 6;
    let colors = {
      5: 'red',
      2: 'white',
      1: 'blue',
      0: 'green'
    };
  
    let [x, y] = mapToViewport(...getVertex(vertexIndex).map((x) => x));

    let gradient;

    // Create gradients according to vertexs indices
    if (vertexIndex == 1 || vertexIndex == 5) {
      gradient = ctx.createLinearGradient(160, 160, 160 + squareSize, 160 + squareSize); // Create a linear gradient where the start gradient point is at x, y and the end gradient point is at x + squareSize, y + squareSize
      gradient.addColorStop(0, colors[5]);
      gradient.addColorStop(1, colors[1]);
    } else {
      gradient = ctx.createLinearGradient(160, 160, 160 + squareSize, 160 + Math.sin(-Math.PI/2) * squareSize); // Create a linear gradient where the start gradient point is at x, y and the end gradient point is at x + squareSize, y + squareSize
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[2]);
      gradient.addColorStop(1, colors[2]);
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
    ctx.strokeStyle = 'rgba(111, 115, 120, 1)';
    ctx.stroke();
    
    // Draw vertexs
    for (let i = 0; i < numPoints; i++) {
      if (i == 3 || i == 4) continue;
      let [x, y] = mapToViewport(...getVertex(i).map((x) => x));

      ctx.beginPath();
      ctx.fillStyle = colors[i];
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }

    // Matrix transformation
    ctx.translate(x, y); // First translate the context to the center you wish to rotate around.
    ctx.rotate(angle * Math.PI / 180); // Then do the actual rotation.
    ctx.translate(-x, -y); // Then translate the context back.
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while draw() does things that have to be repeated each time the canvas is
 * redrawn.
 */
function mainEntrance() {
  // retrieve <canvas> element
  var canvasElement = document.querySelector("#theCanvas");
  var ctx = canvasElement.getContext("2d");
  let vertexIndex;

  w = canvasElement.width;
  h = canvasElement.height;

  document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case "KeyR":
        console.log(event.key, "was pressed");
        vertexIndex = 5;
        break;
      case "KeyG":
        console.log(event.key, "was pressed");
        vertexIndex = 0;
        break;
      case "KeyB":
        console.log(event.key, "was pressed");
        vertexIndex = 1;
        break;
      case "KeyW":
        console.log(event.key, "was pressed");
        vertexIndex = 2;
        break;
    }
  });

   /**
    * A closure to set up an animation loop in which the
    * scale grows by "increment" each frame.
    * @global
    * @function
    */
   var runanimation = (() => {
       var angle = 0;
       return () => {
           draw(ctx, angle, vertexIndex);
           angle -= 2;
           if (angle <= -4) angle += 2;
           requestAnimationFrame(runanimation);
       };
   })();

   // draw!
   runanimation();
}
