/**
 * @file
 *
 * Summary.
 * <p>Hierarchical Robot object using a matrix stack.</p>
 *
 * @author Gabriele Jandres Cavalcanti
 * @since 27/09/2016
 * @see https://gabrielejandres.github.io/computer-graphics-2022.2/3.Hierarchy/Hierarchy.html
 */

"use strict";

/**
 * A very basic stack class,
 * for keeping a hierarchy of transformations.
 * @class
 */
class Stack {
  /**
   * Constructor.
   * @constructs Stack
   */
  constructor() {
    /** Array for holding the stack elements. */
    this.elements = [];
    /** Top of the stack. */
    this.t = 0;
  }

  /**
   * Pushes a given matrix onto this stack.
   * @param {Matrix4} m transformation matrix.
   */
  push(m) {
    this.elements[this.t++] = m;
  }

  /**
   * Return the matrix at the top of this stack.
   * @return {Matrix4} m transformation matrix.
   */
  top() {
    if (this.t <= 0) {
      console.log("top = ", this.t);
      console.log("Warning: stack underflow");
    } else {
      return this.elements[this.t - 1];
    }
  }

  /**
   * Pops the matrix at the top of this stack.
   * @return {Matrix4} m transformation matrix.
   */
  pop() {
    if (this.t <= 0) {
      console.log("Warning: stack underflow");
    } else {
      this.t--;
      var temp = this.elements[this.t];
      this.elements[this.t] = undefined;
      return temp;
    }
  }

  /**
   * Returns whether this stack is empty.
   * @returns {Boolean} true if the stack is empty.
   */
  isEmpty() {
    return this.t <= 0;
  }
}

/**
 * <p>Creates data for vertices, colors, and normal vectors for
 * a unit cube. </p>
 *
 * Return value is an object with three attributes:
 * vertices, colors, and normals, each referring to a Float32Array.<br>
 * (Note this is a "self-invoking" anonymous function.)
 * @return {Object<{numVertices: Number, vertices: Float32Array, colors: Float32Array, normals: Float32Array}>}
 * vertex array with associated color and normal arrays.
 * @function
 * @global
 */
var cube = (function makeCube() {
  // vertices of cube
  // prettier-ignore
  var rawVertices = new Float32Array([
       -0.5, -0.5, 0.5,
       0.5, -0.5, 0.5,
       0.5, 0.5, 0.5,
       -0.5, 0.5, 0.5,
       -0.5, -0.5, -0.5,
       0.5, -0.5, -0.5,
       0.5, 0.5, -0.5,
       -0.5, 0.5, -0.5
     ]);

  // prettier-ignore
  var rawColors = new Float32Array([
       1.0, 0.0, 0.0, 1.0,  // red
       0.0, 1.0, 0.0, 1.0,  // green
       0.0, 0.0, 1.0, 1.0,  // blue
       1.0, 1.0, 0.0, 1.0,  // yellow
       1.0, 0.0, 1.0, 1.0,  // magenta
       0.0, 1.0, 1.0, 1.0,  // cyan
     ]);

  // prettier-ignore
  var rawNormals = new Float32Array([
       0, 0, 1,
       1, 0, 0,
       0, 0, -1,
       -1, 0, 0,
       0, 1, 0,
       0, -1, 0
     ]);

  // prettier-ignore
  var indices = new Uint16Array([
       0, 1, 2, 0, 2, 3,  // z face
       1, 5, 6, 1, 6, 2,  // +x face
       5, 4, 7, 5, 7, 6,  // -z face
       4, 0, 3, 4, 3, 7,  // -x face
       3, 2, 6, 3, 6, 7,  // + y face
       4, 5, 1, 4, 1, 0   // -y face
     ]);

  var verticesArray = [];
  var colorsArray = [];
  var normalsArray = [];
  for (var i = 0; i < 36; ++i) {
    // for each of the 36 vertices...
    var face = Math.floor(i / 6);
    var index = indices[i];

    // (x, y, z): three numbers for each point
    for (var j = 0; j < 3; ++j) {
      verticesArray.push(rawVertices[3 * index + j]);
    }

    // (r, g, b, a): four numbers for each point
    for (var j = 0; j < 4; ++j) {
      colorsArray.push(rawColors[4 * face + j]);
    }

    // three numbers for each point
    for (var j = 0; j < 3; ++j) {
      normalsArray.push(rawNormals[3 * face + j]);
    }
  }

  return {
    numVertices: 36,
    vertices: new Float32Array(verticesArray),
    colors: new Float32Array(colorsArray),
    normals: new Float32Array(normalsArray),
  };
})();

/**
 * Return a matrix to transform normals, so they stay
 * perpendicular to surfaces after a linear transformation.
 * @param {Matrix4} model model matrix.
 * @param {Matrix4} view view matrix.
 * @returns {Float32Array} modelview transposed inverse.
 */
function makeNormalMatrixElements(model, view) {
  var n = new Matrix4(view).multiply(model);
  n.transpose();
  n.invert();
  n = n.elements;
  // prettier-ignore
  return new Float32Array([
       n[0], n[1], n[2],
       n[4], n[5], n[6],
       n[8], n[9], n[10]
     ]);
}

// A few global variables...

/**
 * The OpenGL context.
 * @type {WebGL2RenderingContext}
 */
var gl;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var vertexBuffer;

/**
 * Handle to a buffer on the GPU.
 * @type {WebGLBuffer}
 */
var vertexNormalBuffer;

/**
 * Handle to the compiled shader program on the GPU.
 * @type {WebGLProgram}
 */
var lightingShader;

/**
 * Transformation matrix that is the root of 5 objects in the scene.
 * @type {Matrix4}
 */
var torsoMatrix = new Matrix4().setTranslate(0, 0, 0);
/**  @type {Matrix4} */
var rightShoulderMatrix = new Matrix4().setTranslate(6.5, 2, 0);
/**  @type {Matrix4} */
var leftShoulderMatrix = new Matrix4().setTranslate(-6.5, 2, 0);
/**  @type {Matrix4} */
var rightArmMatrix = new Matrix4().setTranslate(0, -5, 0);
/**  @type {Matrix4} */
var leftArmMatrix = new Matrix4().setTranslate(0, -5, 0);
/**  @type {Matrix4} */
var rightHandMatrix = new Matrix4().setTranslate(0, -4, 0);
/**  @type {Matrix4} */
var leftHandMatrix = new Matrix4().setTranslate(0, -4, 0);
/**  @type {Matrix4} */
var headMatrix = new Matrix4().setTranslate(0, 7, 0);
/**  @type {Matrix4} */
var rightLegMatrix = new Matrix4().setTranslate(2, -7, 0);
/**  @type {Matrix4} */
var leftLegMatrix = new Matrix4().setTranslate(-2, -7, 0);
/**  @type {Matrix4} */
var rightFootMatrix = new Matrix4().setTranslate(0, -4, 0);
/**  @type {Matrix4} */
var leftFootMatrix = new Matrix4().setTranslate(0, -4, 0);
/**  @type {Matrix4} */
var rightEyeMatrix = new Matrix4().setTranslate(1, 1, 2);
/**  @type {Matrix4} */
var leftEyeMatrix = new Matrix4().setTranslate(-1, 1, 2);
/**  @type {Matrix4} */
var mouthMatrix = new Matrix4().setTranslate(0, -0.75, 2);

var torsoAngle = 0.0;
var shoulderAngle = 0.0;
var armAngle = 0.0;
var handAngle = 0.0;
var headAngle = 0.0;
var legAngle = 0.0;
var footAngle = 0.0;

var torsoMatrixLocal = new Matrix4().setScale(10, 10, 5);
var shoulderMatrixLocal = new Matrix4().setScale(3, 5, 2);
var armMatrixLocal = new Matrix4().setScale(3, 5, 2);
var handMatrixLocal = new Matrix4().setScale(1, 3, 3);
var headMatrixLocal = new Matrix4().setScale(4, 4, 4);
var legMatrixLocal = new Matrix4().setScale(1, 8, 2);
var footMatrixLocal = new Matrix4().setScale(2, 1, 4);
var eyeMatrixLocal = new Matrix4().setScale(0.7, 0.7, -0.25);
var mouthMatrixLocal = new Matrix4().setScale(2.5, 0.5, -0.25);

/**
 * View matrix.
 * @type {Matrix4}
 */
// prettier-ignore
var view = new Matrix4().setLookAt(
         20, 20, 20,   // eye
         0, 0, 0,      // at - looking at the origin
         0, 1, 0); // up vector - y axis

/**
 * <p>Projection matrix.</p>
 * Here use aspect ratio 3/2 corresponding to canvas size 600 x 400.
 * @type {Matrix4}
 */
var projection = new Matrix4().setPerspective(45, 1.5, 0.1, 1000);

/**
 * Translate keypress events to strings.
 * @param {KeyboardEvent} event key pressed.
 * @return {String | null}
 * @see http://javascript.info/tutorial/keyboard-events
 */
function getChar(event) {
  if (event.which == null) {
    return String.fromCharCode(event.keyCode); // IE
  } else if (event.which != 0 && event.charCode != 0) {
    return String.fromCharCode(event.which); // the rest
  } else {
    return null; // special key
  }
}

/**
 * <p>Handler for key press events.</p>
 * Adjusts object rotations.
 * @param {KeyboardEvent} event key pressed.
 */
function handleKeyPress(event) {
  var ch = getChar(event);
  let opt = document.getElementById("options");
  switch (ch) {
    case "t":
      torsoAngle += 15;
      torsoMatrix.setTranslate(0, 0, 0).rotate(torsoAngle, 0, 1, 0);
      break;
    case "T":
      torsoAngle -= 15;
      torsoMatrix.setTranslate(0, 0, 0).rotate(torsoAngle, 0, 1, 0);
      break;
    case "s":
      shoulderAngle += 15;
      // rotate shoulder clockwise about a point 2 units above its center
      var currentShoulderRot = new Matrix4()
        .setTranslate(0, 2, 0)
        .rotate(-shoulderAngle, 1, 0, 0)
        .translate(0, -2, 0);
      rightShoulderMatrix.setTranslate(6.5, 2, 0).multiply(currentShoulderRot);
      leftShoulderMatrix.setTranslate(-6.5, 2, 0).multiply(currentShoulderRot);
      break;
    case "S":
      shoulderAngle -= 15;
      var currentShoulderRot = new Matrix4()
        .setTranslate(0, 2, 0)
        .rotate(-shoulderAngle, 1, 0, 0)
        .translate(0, -2, 0);
      rightShoulderMatrix.setTranslate(6.5, 2, 0).multiply(currentShoulderRot);
      leftShoulderMatrix.setTranslate(-6.5, 2, 0).multiply(currentShoulderRot);
      break;
    case "a":
      armAngle += 15;
      // rotate arm clockwise about its top front corner
      var currentArm = new Matrix4()
        .setTranslate(0, 2.5, 1.0)
        .rotate(-armAngle, 1, 0, 0)
        .translate(0, -2.5, -1.0);
      rightArmMatrix.setTranslate(0, -5, 0).multiply(currentArm);
      leftArmMatrix.setTranslate(0, -5, 0).multiply(currentArm);
      break;
    case "A":
      armAngle -= 15;
      var currentArm = new Matrix4()
        .setTranslate(0, 2.5, 1.0)
        .rotate(-armAngle, 1, 0, 0)
        .translate(0, -2.5, -1.0);
      rightArmMatrix.setTranslate(0, -5, 0).multiply(currentArm);
      leftArmMatrix.setTranslate(0, -5, 0).multiply(currentArm);
      break;
    case "h":
      handAngle += 15;
      rightHandMatrix.setTranslate(0, -4, 0).rotate(handAngle, 0, 1, 0);
      leftHandMatrix.setTranslate(0, -4, 0).rotate(handAngle, 0, 1, 0);
      break;
    case "H":
      handAngle -= 15;
      rightHandMatrix.setTranslate(0, -4, 0).rotate(handAngle, 0, 1, 0);
      leftHandMatrix.setTranslate(0, -4, 0).rotate(handAngle, 0, 1, 0);
      break;
    case "l":
      headAngle += 15;
      headMatrix.setTranslate(0, 7, 0).rotate(headAngle, 0, 1, 0);
      break;
    case "L":
      headAngle -= 15;
      headMatrix.setTranslate(0, 7, 0).rotate(headAngle, 0, 1, 0);
      break;
    case "e":
      legAngle += 15;
      var currentLegRot = new Matrix4()
        .setTranslate(0, 4, 0)
        .rotate(-legAngle, 1, 0, 0)
        .translate(0, -4, 0);
      rightLegMatrix.setTranslate(2, -8, 0).multiply(currentLegRot);
      leftLegMatrix.setTranslate(-2, -8, 0).multiply(currentLegRot);
      break;
    case "E":
      legAngle -= 15;
      var currentLegRot = new Matrix4()
        .setTranslate(0, 4, 0)
        .rotate(-legAngle, 1, 0, 0)
        .translate(0, -4, 0);
      rightLegMatrix.setTranslate(2, -8, 0).multiply(currentLegRot);
      leftLegMatrix.setTranslate(-2, -8, 0).multiply(currentLegRot);
      break;
    default:
      return;
  }
  opt.innerHTML = `<br>${gl.getParameter(
    gl.SHADING_LANGUAGE_VERSION
  )}<br>${gl.getParameter(gl.VERSION)}`;
}

/**
 * <p>Helper function.</p>
 * Renders the cube based on the model transformation
 * on top of the stack and the given local transformation.
 * @param {Matrix4} matrixStack matrix on top of the stack;
 * @param {Matrix4} matrixLocal local transformation.
 * @param {String} color color of the cube
 */
function renderCube(matrixStack, matrixLocal, color = "") {
  // bind the shader
  gl.useProgram(lightingShader);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(lightingShader, "a_Position");
  if (positionIndex < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  var normalIndex = gl.getAttribLocation(lightingShader, "a_Normal");
  if (normalIndex < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(normalIndex);

  // bind data for points and normals
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);

  var loc = gl.getUniformLocation(lightingShader, "view");
  gl.uniformMatrix4fv(loc, false, view.elements);
  loc = gl.getUniformLocation(lightingShader, "projection");
  gl.uniformMatrix4fv(loc, false, projection.elements);
  loc = gl.getUniformLocation(lightingShader, "u_Color");
  color != "black" ? gl.uniform4f(loc, 0.5, 0, 0.6, 1.0) : gl.uniform4f(loc, 0, 0, 0, 1.0);
  var loc = gl.getUniformLocation(lightingShader, "lightPosition");
  gl.uniform4f(loc, 5.0, 10.0, 5.0, 1.0);

  var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
  var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

  // transform using current model matrix on top of stack
  var current = new Matrix4(matrixStack.top()).multiply(matrixLocal);
  gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
  gl.uniformMatrix3fv(
    normalMatrixLoc,
    false,
    makeNormalMatrixElements(current, view)
  );

  gl.drawArrays(gl.TRIANGLES, 0, 36);

  // on safari 10, buffer cannot be disposed before drawing...
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.useProgram(null);
}

/** Code to actually render our geometry. */
function draw() {
  // clear the framebuffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);

  // set up the matrix stack
  var s = new Stack();
  s.push(torsoMatrix);
  renderCube(s, torsoMatrixLocal);

  // right leg relative to torso
  s.push(new Matrix4(s.top()).multiply(rightLegMatrix));
  renderCube(s, legMatrixLocal);

  // right foot relative to leg
  s.push(new Matrix4(s.top()).multiply(rightFootMatrix));
  renderCube(s, footMatrixLocal);
  s.pop();
  s.pop();

  // left leg relative to torso
  s.push(new Matrix4(s.top()).multiply(leftLegMatrix));
  renderCube(s, legMatrixLocal);

  // left foot relative to leg
  s.push(new Matrix4(s.top()).multiply(leftFootMatrix));
  renderCube(s, footMatrixLocal);
  s.pop();
  s.pop();

  // right shoulder relative to torso
  s.push(new Matrix4(s.top()).multiply(rightShoulderMatrix));
  renderCube(s, shoulderMatrixLocal);

  // right arm relative to shoulder
  s.push(new Matrix4(s.top()).multiply(rightArmMatrix));
  renderCube(s, armMatrixLocal);

  // right hand relative to arm
  s.push(new Matrix4(s.top()).multiply(rightHandMatrix));
  renderCube(s, handMatrixLocal);
  s.pop();
  s.pop();
  s.pop();

  // left shoulder relative to torso
  s.push(new Matrix4(s.top()).multiply(leftShoulderMatrix));
  renderCube(s, shoulderMatrixLocal);

  // left arm relative to torso
  s.push(new Matrix4(s.top()).multiply(leftArmMatrix));
  renderCube(s, armMatrixLocal);

  // left hand relative to torso
  s.push(new Matrix4(s.top()).multiply(leftHandMatrix));
  renderCube(s, handMatrixLocal);
  s.pop();
  s.pop();
  s.pop();

  // head relative to torso
  s.push(new Matrix4(s.top()).multiply(headMatrix));
  renderCube(s, headMatrixLocal);

  // right eye relative to head
  s.push(new Matrix4(s.top()).multiply(rightEyeMatrix));
  renderCube(s, eyeMatrixLocal, "black");
  s.pop();

  // left eye relative to head
  s.push(new Matrix4(s.top()).multiply(leftEyeMatrix));
  renderCube(s, eyeMatrixLocal, "black");
  s.pop();

  // mouth relative to head
  s.push(new Matrix4(s.top()).multiply(mouthMatrix));
  renderCube(s, mouthMatrixLocal, "black");
  s.pop();
  s.pop();
  s.pop();

  if (!s.isEmpty()) {
    console.log("Warning: pops do not match pushes");
  }
}

/**
 * <p>Entry point when page is loaded.</p>
 *
 * Basically this function does setup that "should" only have to be done once,<br>
 * while draw() does things that have to be repeated each time the canvas is
 * redrawn.
 * @function
 * @memberof Window
 * @name anonymous_load
 * @global
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
 */
window.addEventListener("load", (event) => {
  // retrieve <canvas> element
  var canvas = document.getElementById("theCanvas");

  // key handler
  window.onkeypress = handleKeyPress;

  gl = canvas.getContext("webgl2");
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById(
    "vertexLightingShader"
  ).textContent;
  var fshaderSource = document.getElementById(
    "fragmentLightingShader"
  ).textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log("Failed to intialize shaders.");
    return;
  }
  lightingShader = gl.program;
  gl.useProgram(null);

  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

  // buffer for vertex normals
  vertexNormalBuffer = gl.createBuffer();
  if (!vertexNormalBuffer) {
    console.log("Failed to create the buffer object");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.normals, gl.STATIC_DRAW);

  // buffer is not needed anymore (not necessary, really)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  gl.enable(gl.DEPTH_TEST);

  // define an animation loop
  var animate = function () {
    draw();
    requestAnimationFrame(animate);
  };

  // start drawing!
  animate();
});
