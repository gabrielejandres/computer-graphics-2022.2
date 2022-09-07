/**
 * @file
 *
 * Summary.
 * <p>Assignment 1 - 2D Sierpinsk Gasket with twist.</p>
 *
 *  @author Paulo Roma Cavalcanti
 *  @since 07/07/2015
 *  @see https://en.wikipedia.org/wiki/Sierpiński_triangle
 *  @see http://orion.lcg.ufrj.br/WebGL/Assignment_1/twist.html
 *  @see http://codepen.io/promac/pen/yNxMWz
 */
 "use strict";
 /**
  * WebGL canvas.
  * @type {HTMLElement}
  * @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
  */
 var canvas;
 /**
  * The OpenGL context.
  * @type {WebGLRenderingContext}
  * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext
  */
 var gl;
 /**
  * A 2D point.
  * @typedef {Array<Number>} vec2
  * @property {Number} - x coordinate.
  * @property {Number} - y coordinate.
  */
 /**
  * A 4D point.
  * @typedef {Array<Number>} vec4
  * @property {Number} - x coordinate.
  * @property {Number} - y coordinate.
  * @property {Number} - z coordinate.
  * @property {Number} - w coordinate.
  */
 /**
  * Vertices for rendering.
  * @type {Array<vec2>}
  */
 var points = [];
 /**
  * Whether to draw the fourth triangle.
  * @type {Boolean}
  */
 var fill = true;
 /**
  * Spinning angle.
  * @type {Number}
  */
 var ang = 0.0;
 /**
  * Controls the spin speed.
  * @type {Number}
  */
 var delay = 100;
 /**
  * Whether not using the gpu.
  * @type {Boolean}
  */
 var cpu = false;
 /**
  * Twist state.
  * @type {Boolean}
  */
 var deform = true;
 /**
  * Maximum recursion depth.
  * @type {Number}
  */
 var NumTimesToSubdivide = 5;
 /**
  * Initial rotation angle.
  * @type {Number}
  */
 var RotationAngle = 45.0;
 /**
  *  <p>Uniform variables are used to communicate with your vertex or fragment shader from "outside".<br>
  *  In the shader, just use the uniform qualifier to declare the variable:</p>
  *        uniform float myVariable;
  *
  *  <p>Uniform variables are read-only and have the same value among all processed vertices.
  *  They can only be changed within your javascript/C++ program.</p>
  *
  *  @see http://www.opengl.org/sdk/docs/tutorials/ClockworkCoders/uniform.php
  *  @see http://en.wikibooks.org/wiki/GLSL_Programming/Vector_and_Matrix_Operations
  */
 /**
  * Rotation angle.
  * @type {Number}
  */
 var theta;
 /**
  * Toggle twist on/off.
  * @type {Boolean}
  */
 var twist;
 /**
  * Toggle gpu on/off.
  * @type {Boolean}
  */
 var gpu;
 /**
  * Fixed point - centroid of the triangle.
  * @type {vec2}
  */
 var origin;
 /**
  * Fragment color.
  * @type {vec4}
  */
 var fColor;
 /**
  * Black color.
  * @type {vec4}
  */
 var black = vec4(0.0, 0.0, 0.0, 1.0);
 /**
  * Red color.
  * @type {vec4}
  */
 var red = vec4(1.0, 0.0, 0.0, 1.0);
 /**
  * Initial triangle centroid.
  * @type {vec2}
  */
 var centroid;
 /** Where to start execution when all code is loaded. */
 function init() {
   // gets WebGL context from HTML file
   canvas = document.getElementById("gl-canvas");
   // get the rendering context for WebGL, using the utility from Google.
   gl = WebGLUtils.setupWebGL(canvas);
   if (!gl) {
     alert("WebGL isn't available");
   }
   setUpShaders();
   drawTriangle(NumTimesToSubdivide, true, true, RotationAngle);
 }
 /** Sets up shaders and buffers. */
 function setUpShaders() {
   // Load shaders and initialize attribute buffers
   // Used to load, compile and link shaders to form a program object
   //
   // handle to the compiled shader program on the GPU
   var program = initShaders(gl, "vertex-shader", "fragment-shader");
   // bind the shader
   gl.useProgram(program);
   // Load data onto GPU by creating a vertex buffer object on the GPU
   var bufferId = gl.createBuffer();
   // bind the buffer
   gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
   // Associate the shader variables with the data buffer
   // vPosition was defined in twist.html
   // Connect variable in program with variable in shader
   // get the index for the vPosition attribute defined in the vertex shader
   var vPosition = gl.getAttribLocation(program, "vPosition");
   // associate the data in the currently bound buffer with the vPosition attribute
   // The '2' specifies there are 2 floats per vertex in the buffer.
   // Don't worry about the last three args just yet.
   gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(vPosition);
   // gets the value of the uniform variable fColor, defined in twist.html
   fColor = gl.getUniformLocation(program, "fColor");
   //
   //  Configure WebGL
   //
   // The portion of the view (projection) plane, intersected by the view frustrum,
   // will be mapped to the viewport
   gl.viewport(0, 0, canvas.width, canvas.height);
   gl.clearColor(1.0, 1.0, 1.0, 1.0); // background color
   // enlarge the window, by setting a new orthographic projection matrix, defined in twist.html
   var projection = ortho(-1.5, 1.5, -2.0, 1.0, -1, 1);
   // the projection matrix will be applied in the vertex shader, also defined in twist.html
   gl.uniformMatrix4fv(
     gl.getUniformLocation(program, "Projection"),
     false,
     flatten(projection)
   );
   theta = gl.getUniformLocation(program, "theta");
   twist = gl.getUniformLocation(program, "twist");
   gpu = gl.getUniformLocation(program, "gpu");
   origin = gl.getUniformLocation(program, "origin");
   // Initialize event handlers
   document.getElementById("slider").onchange = function (event) {
     document.getElementById("div").value = event.target.value.toString();
     clickCallBack();
   };
 }
 /**
  * Draws a triangle. Each edge can be recursively subdivided at its middle point.
  *
  *  @param {Number} ndiv number of subdivisions.
  *  @param {Boolean} doTwist toggle twist on/off.
  *  @param {Boolean} useGPU toggle gpu on/off.
  *  @param {Number} angle rotation angle.
  */
 function drawTriangle(ndiv, doTwist, useGPU, angle) {
   // In javascript, arguments can be omitted...
   if (typeof ndiv === "undefined") nd = NumTimesToSubdivide;
   if (typeof angle === "undefined") angle = RotationAngle;
   if (typeof doTwist === "undefined") doTwist = true;
   if (typeof useGPU === "undefined") useGPU = true;
   // Set reasonable values...
   ndiv = Math.max(Math.min(ndiv, 7), 0);
   angle = Math.max(Math.min(angle, 360), -360);
   gl.uniform1f(theta, angle);
   gl.uniform1i(twist, doTwist);
   gl.uniform1i(gpu, useGPU);
   cpu = !useGPU;
   ang = angle;
   //
   //  Initialize data for the Sierpinski Gasket
   //
   /**
    * Initialize the corners of the gasket with three points,
    * creating an equilateral triangle:
    * <ul>
    *  <li>height (√3) </li>
    *  <li>angles 60° </li>
    *  <li>side length 2 </li>
    * </ul>
    *
    * <p>Use vec2 type in {@link http://lcg.ufrj.br/WebGL/labs/WebGL/Common/MV.js MV.js}</p>
    *
    * @see https://en.wikipedia.org/wiki/Equilateral_triangle
    * @type {Array<vec2>}
    * @global
    */
   var vertices = [vec2(-1, -1), vec2(0, Math.sqrt(3) - 1), vec2(1, -1)];
   points = [];
   // console.log ( Number(ndiv), Number(angle) );
   // points is filled up here...
   divideTriangle(vertices[0], vertices[1], vertices[2], ndiv);
   // Load the data into the GPU
   centroid = vertices
     .reduce((previous, current) => add(previous, current))
     .map((value) => value / vertices.length);
   gl.uniform2fv(origin, centroid);
   if (useGPU) {
     // load our data onto the GPU (uses the currently bound buffer)
     gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
   }
   render();
 }
 /** Pushes three vertices to global array points. */
 function triangle(a, b, c) {
   points.push(a, b, c);
 }
 /**
  *  Partitions triangle (a,b,c) into four new triangles,
  *  by recursively subdividing each edge at its middle point.
  *
  *  @param {vec2} first vertex coordinate.
  *  @param {vec2} second vertex coordinate.
  *  @param {vec2} third vertex coordinate.
  *  @param {Number} count number of subdivisions on each edge (depth of recursion).
  */
 function divideTriangle(a, b, c, count) {
   // check for end of recursion
   if (count === 0) {
     triangle(a, b, c);
   } else {
     // bisect the sides
     var ab = mix(a, b, 0.5); // (a+b)/2
     var ac = mix(a, c, 0.5); // (a+c)/2
     var bc = mix(b, c, 0.5); // (b+c)/2
     --count;
     // three new triangles
     divideTriangle(a, ab, ac, count);
     divideTriangle(c, ac, bc, count);
     divideTriangle(b, bc, ab, count);
     // add the middle triangle
     if (fill) {
       divideTriangle(ac, bc, ab, count);
     }
   }
 }
 /**
  *  Returns a 2D rotation matrix through an angle theta.
  *
  *  @param {Number} theta rotation angle.
  *  @return {Array<vec2>} 2D rotation matrix.
  */
 function rotate2(theta) {
   let c = Math.cos(theta);
   let s = Math.sin(theta);
   return mat2(c, -s, s, c);
 }
 /**
  *  Returns a new array with all vectors in (global) points, rotated by an angle theta.
  *  This transformation is performed on the CPU.
  *
  *  @param {Number} theta rotation angle.
  *  @param {vec2} center fixed point (center of rotation).
  *  @param {Boolean} twist if true, then twist is applied.
  *  @return {Array<vec2>} a new array with same size of points.
  */
 function rotateAndTwist(theta, center, twist) {
   var result = [];
   var m = rotate2(theta);
   for (var p of points) {
     p = subtract(p, center);
     if (twist) m = rotate2(theta + length(p));
     result.push(add(vec2(dot(m[0], p), dot(m[1], p)), center));
   }
   return result;
 }
 /** What to do when the left mouse button is clicked. */
 function clickCallBack() {
   fill = document.getElementById("fill").checked;
   delay = document.getElementById("spin").checked ? 0 : 100;
   deform = document.getElementById("twist").checked;
   document.getElementById("slider").value =
     document.getElementById("div").value;
   drawTriangle(
     document.getElementById("div").value,
     document.getElementById("twist").checked,
     document.getElementById("gpu").checked,
     document.getElementById("ang").value
   );
 }
 /** Display function. Renders the graphics of this assignment. */
 function render() {
   setTimeout(function () {
     gl.clear(gl.COLOR_BUFFER_BIT);
     gl.uniform4fv(fColor, flatten(red));
     ang += 0.1;
     ang = ang % 360;
     if (!cpu) {
       gl.uniform1f(theta, ang);
     } else {
       // this is brute force!
       let res = rotateAndTwist(radians(ang), centroid, deform);
       gl.bufferData(gl.ARRAY_BUFFER, flatten(res), gl.STATIC_DRAW);
     }
     document.getElementById("ang").value = ang.toFixed(1).toString();
     gl.drawArrays(gl.TRIANGLES, 0, points.length);
     // draw the triangle boundaries (black)
     gl.uniform4fv(fColor, flatten(black));
     for (var i = 0; i < points.length; i += 3) {
       gl.drawArrays(gl.LINE_LOOP, i, 3);
     }
     requestAnimFrame(render);
   }, delay);
 }