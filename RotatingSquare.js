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
function draw(ctx, angle) {
    // Desenha o background
    ctx.fillStyle = 'rgba(0, 204, 204, 1)';
    ctx.rect(0, 0, w, h);
    ctx.fill();
  
    let squareSize = 80;
    let borderWidth = 8;
    let firstVertex = 'red';
    let secondVertex = 'white';
    let thirdVertex = 'blue';
    let fourthVertex = 'green';
  
    let [x, y] = mapToViewport(...getVertex(5).map((x) => x));
    console.log(x, y);
  
    // Non-rotated 
    // Create a linear gradient
    // The start gradient point is at x=20, y=0
    // The end gradient point is at x=220, y=0
    const gradient = ctx.createLinearGradient(x, y, x + squareSize, y + squareSize);

    // Add three color stops
    gradient.addColorStop(0, firstVertex);
    gradient.addColorStop(1, thirdVertex);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, squareSize, squareSize);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = 'rgba(111, 115, 120, 1)';
    ctx.strokeRect(x, y, squareSize, squareSize);
  
    // Matrix transformation
    ctx.translate(x, y); // First translate the context to the center you wish to rotate around.
    ctx.rotate(angle * Math.PI / 180); // Then do the actual rotation.
    ctx.translate(-x, -y); // Then translate the context back.

    // Vertexs
    for (let i = 0; i < numPoints; i++) {
      if (i == 3 || i == 4) continue;
      let [x, y] = mapToViewport(...getVertex(i).map((x) => x));

      ctx.beginPath();

      if (i == 0) {
        ctx.fillStyle = fourthVertex;
        ctx.arc(x + borderWidth / 2, y - borderWidth / 2, 4, 0, 2 * Math.PI);
      }

      if (i == 5) {
        ctx.fillStyle = firstVertex;
        ctx.arc(x + borderWidth / 2, y + borderWidth / 2, 4, 0, 2 * Math.PI);
      }

      if (i == 1) {
        ctx.fillStyle = thirdVertex;
        ctx.arc(x - borderWidth / 2, y - borderWidth / 2, 4, 0, 2 * Math.PI);
      }

      if (i == 2) {
        ctx.fillStyle = secondVertex;
        ctx.arc(x - borderWidth / 2, y + borderWidth / 2, 4, 0, 2 * Math.PI);
      }

      ctx.fill();
      ctx.closePath();
    }

  // ctx.translate(x, y); // First translate the context to the center you wish to rotate around.
  // ctx.rotate(angle * Math.PI/180); // Then do the actual rotation.
  // ctx.translate(-x,-y); // Then translate the context back.

  // Desenha o quadrado
  // ctx.beginPath();
  // for (let i = 0; i < numPoints; i++) {
  //   if (i == 3 || i == 4) continue;
  //   let [x, y] = mapToViewport(...getVertex(i).map((x) => x));
  //   console.log("dentro do for", i, x, y);
  //   if (i == 0) ctx.moveTo(x, y);
  //   else ctx.lineTo(x, y);
  //   // ctx.arc(x, y, 4, 0, 2 * Math.PI);
  //   // ctx.fill();
  // }
  // ctx.closePath();

  // // the fill color
  // ctx.fillStyle = "red";
  // ctx.fill();
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

  w = canvasElement.width;
  h = canvasElement.height;

   /**
    * A closure to set up an animation loop in which the
    * scale grows by "increment" each frame.
    * @global
    * @function
    */
   var runanimation = (() => {
  
       var angle = 0;

       return () => {
           draw(ctx, angle);
           angle += 1;
           if (angle === 360) angle = 0;

           // request that the browser calls runanimation() again "as soon as it can"
           setTimeout(() => {
            requestAnimationFrame(runanimation);
          }, "10000000000000");
       };
   })();

   // draw!
   runanimation();
}
