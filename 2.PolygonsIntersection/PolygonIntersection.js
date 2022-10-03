/**
 *  @file
 *
 *  Summary.
 * 
 * Intersection between circles and convex polygons. 
 * When two or more polygons intersect, your colors will change.
 *
 *  @author Gabriele Jandres Cavalcanti
 *  @since 20/09/2022
 *  @see https://gabrielejandres.github.io/computer-graphics-2022.2/2.PolygonIntersection/PolygonIntersection.html
 */

"use strict";

import * as util2d from "./utils/2d.js";

// -------- Global variables --------

/**
 * Two dimensional vector.
 * @type {glvec2}
 */
const vec2d = (function () {
  /**
   * @member {Object} glvec2 an extended vec2d from gl-matrix.
   */
  let glvec2 = Object.assign({}, vec2);
  let glmat3 = mat3;

  /**
   * Orientation between 3 points.
   * @param {Array<Number,Number>} a first point.
   * @param {Array<Number,Number>} b second point.
   * @param {Array<Number,Number>} c third point.
   * @returns {Number} orientation.
   * @see https://en.wikipedia.org/wiki/Cross_product
   * @see http://www.cs.tufts.edu/comp/163/OrientationTests.pdf
   * @see <img src="../orient.png" width="320">
   * @global
   * @function
   */
  glvec2.orient = function (a, b, c) {
    return Math.sign(
      glmat3.determinant([1, a[0], a[1], 1, b[0], b[1], 1, c[0], c[1]])
    );
  };

  /**
   * Returns true iff line segments a-b and c-d intersect.
   * @param {Array<Number,Number>} a starting vertex.
   * @param {Array<Number,Number>} b end vertex.
   * @param {Array<Number,Number>} c starting vertex.
   * @param {Array<Number,Number>} d end vertex.
   * @returns {Boolean} intersect or not.
   * @global
   * @function
   */
  glvec2.segmentsIntersect = function (a, b, c, d) {
    return (
      glvec2.orient(a, b, c) != glvec2.orient(a, b, d) &&
      glvec2.orient(c, d, a) != glvec2.orient(c, d, b)
    );
  };

  /**
   * <p>Line intersection.</p>
   *
   * Sets 'out' to the intersection point between
   * lines [x1,y1]-[x2,y2] and [x3,y3]-[x4,y4].
   * @param {Array<Number,Number>} out intersection point.
   * @param {Array<Number,Number>} param1 starting vertex.
   * @param {Array<Number,Number>} param2 end vertex.
   * @param {Array<Number,Number>} param3 starting vertex.
   * @param {Array<Number,Number>} param4 end vertex.
   * @returns {Array<Number,Number>} intersection point.
   * @see https://en.wikipedia.org/wiki/Lineâ€“line_intersection
   * @global
   * @function
   */
  glvec2.lineIntersection = function (
    out,
    [x1, y1],
    [x2, y2],
    [x3, y3],
    [x4, y4]
  ) {
    const D = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const a = x1 * y2 - y1 * x2,
      b = x3 * y4 - y3 * x4;

    out[0] = (a * (x3 - x4) - (x1 - x2) * b) / D;
    out[1] = (a * (y3 - y4) - (y1 - y2) * b) / D;
    return out;
  };
  return glvec2;
})();

// -------- Functions --------

/**
 * Fills the canvas with a solid color and border.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} width width.
 * @param {Number} height height.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
function fillCanvas(ctx, width, height) {
  ctx.fillStyle = "#EFEFEF";
  ctx.strokeStyle = "#565656";
  ctx.lineWidth = 10;

  // Clear canvas
  ctx.fillRect(0, 0, width, height);

  // Draw canvas border
  ctx.strokeRect(0, 0, width, height);
  ctx.lineWidth = 1;
}

/**
 * Returns the 3 vertices of an isosceles triangle
 * defined by the center point of its base and the
 * opposite vertex.
 * @param {Array<Number,Number>} basePoint base midpoint.
 * @param {Array<Number,Number>} oppositeVertex opposite vertex.
 * @return {Array<Array<Number,Number>, Array<Number,Number>, Array<Number,Number>>}
 * an isosceles triangle (a convex polygon).
 */
function createIsoceslesTriangle({ basePoint, oppositeVertex }) {
  const u = vec2d.sub([], basePoint, oppositeVertex);
  const v = [-u[1], u[0]];
  const w = [u[1], -u[0]];

  return [
    oppositeVertex,
    vec2d.add([], basePoint, v),
    vec2d.add([], basePoint, w),
  ];
}

/**
 * Returns the 4 vertices of a rectangle
 * defined by the center point and the side anchor points (midpoints)
 * @param {Object} rectangle
 * @return {Array<Array<Number,Number>, Array<Number,Number>, Array<Number,Number>, Array<Number,Number>>} a rectangle (a convex polygon).
*/
function createRectangle(rectangle) {
  const delta = vec2d.sub([], rectangle.midPoints[1], rectangle.center);

  return [
    vec2d.add([], rectangle.midPoints[0], delta),
    vec2d.sub([], rectangle.midPoints[0], delta),
    vec2d.sub([], rectangle.midPoints[2], delta),
    vec2d.add([], rectangle.midPoints[2], delta),
  ];
}

/**
 * Returns the midpoints of each side of a rectangle
 * @param {Number} center the rectangle center
 * @param {Number} width the rectangle width
 * @param {Number} height the rectangle height
 * @return {Array<Array<Number,Number>, Array<Number,Number>, Array<Number,Number>, Array<Number,Number>>} midpoints of each rectangle side.
*/
function createMidPoints(center, width, height) {
  return [
    vec2d.add([], center, [width, 0]),
    vec2d.add([], center, [0, height]),
    vec2d.add([], center, [-width, 0]),
    vec2d.add([], center, [0, -height]),
  ];
}

/**
 * Returns true if convex polygons poly and poly2 intersect.
 *
 * The algorithm is based on the separated axis theorem (SAT), which states that,
 * if two polys do not intersect, then there is a separation line between them,
 * in such a way that the vertices of poly are on one side of the line,
 * and the vertices of poly2 are on the other side.
 *
 * It is enough to test the edges of each polygon as a separation line.
 * If none of them do separate the polys, then they must intersect each other.
 *
 * @param {Array<Array<Number,Number>>} polygon first polygon.
 * @param {Array<Array<Number,Number>>} polygon2 second polygon.
 * @returns {Boolean} intersect or not.
 */
 function convexPolysIntersect(polygon, polygon2) {
  let response;
  let vectors = [];
  let vectors2 = [];

  for (let i = 0; i < polygon.length; i++)
    vectors.push(new SAT.Vector(polygon[i][0], polygon[i][1]));

  for (let i = 0; i < polygon2.length; i++) 
    vectors2.push(new SAT.Vector(polygon2[i][0], polygon2[i][1]));

  return SAT.testPolygonPolygon(new SAT.Polygon(new SAT.Vector(), vectors), new SAT.Polygon(new SAT.Vector(), vectors2), response);
}

/**
 * Returns true if convex polygon intersects a circle with the given center and radius.
 * @param {Array<Array<Number,Number>>} poly polygon.
 * @param {Array<Number,Number>} circleCenter circle center.
 * @param {Number} circleRadius circle radius.
 * @returns {Boolean} intersect or not.
 */
function convexPolyCircleIntersect(circleCenter, circleRadius, poly) {
  if (util2d.pointInConvexPoly(circleCenter, poly)) return true;

  for (let i = 0; i < poly.length; i++) 
    if (util2d.distToSegment(circleCenter, poly[i], poly[(i + 1) % poly.length]) <= circleRadius)
      return true;

  return false;
}

/**
 * Returns true if a circle intersects another circle with the given center and radius.
 * @param {Array<Number,Number>} center1 first circle center.
 * @param {Number} radius1 first circle radius.
 * @param {Array<Number,Number>} center2 second circle center.
 * @param {Number} radius2 second circle radius.
 * @returns {Boolean} intersect or not.
 */
function circlesIntersect(center1, radius1, center2, radius2) {
  return vec2d.dist(center1, center2) > radius1 + radius2 ? false : true;
}

/**
 * Drag a circle using the center point
 * @param {Object} delta difference between prevMouse and mouse position
 * @param {Object} circle circle to drag 
*/
function dragCircleCenter(delta, circle) {
  vec2d.add(circle[0], circle[0], delta);
  vec2d.add(circle[1], circle[1], delta);
}

/**
 * Drag a circle using the control point
 * @param {Object} delta difference between prevMouse and mouse position
 * @param {Object} circle circle to drag 
*/
function dragCircleControl(delta, circle) {
  vec2d.add(circle[1], circle[1], delta);
}

/**
 * Drag a triangle using the base point
 * @param {Object} delta difference between prevMouse and mouse position
 * @param {Object} triangle triangle to drag 
*/
function dragTriangleBasePoint(delta, triangle) {
  const v = vec2d.sub([], triangle[1], triangle[0]);
  vec2d.add(triangle[0], triangle[0], delta);
  vec2d.add(triangle[1], triangle[0], v);
}

/**
 * Drag a triangle using the opposite vertex
 * @param {Object} delta difference between prevMouse and mouse position
 * @param {Object} triangle triangle to drag 
*/
function dragTriangleOppositeVertex(delta, tri) {
  vec2d.add(tri[1], tri[1], delta);
}

/**
 * Drag a rectangle using some midpoint
 * @param {Object} delta difference between prevMouse and mouse position
 * @param {Number} i index of midpoint
 * @param {Object} rectangle rectangle to drag 
*/
function dragRectangleMidPoint(delta, i, rectangle) {
  const vertex = rectangle[i];
  const size = Math.abs(vec2d.dist(rectangle[(i % 4) + 1], rectangle[0]));

  vec2d.add(vertex, vertex, delta);
  vec2d.sub(rectangle[((i + 1) % 4) + 1], rectangle[((i + 1) % 4) + 1], delta);
  vec2d.rotate(rectangle[(i % 4) + 1], vertex, rectangle[0], -Math.PI / 2);
  vec2d.sub(rectangle[(i % 4) + 1], rectangle[(i % 4) + 1], rectangle[0]);
  vec2d.normalize(rectangle[(i % 4) + 1], rectangle[(i % 4) + 1]);
  vec2d.scale(rectangle[(i % 4) + 1], rectangle[(i % 4) + 1], size);
  vec2d.add(rectangle[(i % 4) + 1], rectangle[(i % 4) + 1], rectangle[0]);
  vec2d.rotate(rectangle[((i - 2 + 4) % 4) + 1], rectangle[(i % 4) + 1], rectangle[0], Math.PI);
}

/**
 * Drag a rectangle using center
 * @param {Object} delta difference between prevMouse and mouse position
 * @param {Object} rectangle rectangle to drag 
*/
function dragRectangleCenter(delta, rectangle) {
  vec2d.add(rectangle[0], rectangle[0], delta);
  for (let i = 1; i < 5; i++)
    vec2d.add(rectangle[i], rectangle[i], delta);
}

/**
 * Create points for triangles, rectangles, circles
 * @param {Array<Object>} triangles triangles to receive new points
 * @param {Array<Object>} rectangles rectangles to receive new points
 * @param {Array<Object>} circles circles to receive new points
*/
function makePts(triangles, rectangles, circles) {
  for (let triangle of triangles) {
    triangle.poly = createIsoceslesTriangle(triangle);
    triangle.anchors = [triangle.basePoint, triangle.oppositeVertex];
  }

  for (let rectangle of rectangles) {
    rectangle.midPoints = createMidPoints(rectangle.center, rectangle.width, rectangle.height);
    rectangle.poly = createRectangle(rectangle);
    rectangle.anchors = [rectangle.center].concat(rectangle.midPoints);
  }

  for (let circle of circles) {
    circle.control = [circle.center[0], circle.center[1] - circle.radius];
    circle.anchors = [circle.center, circle.control];
  }
}

/**
 * Update points for triangles, rectangles, circles
 * @param {Array<Object>} triangles triangles to receive new points
 * @param {Array<Object>} rectangles rectangles to receive new points
 * @param {Array<Object>} circles circles to receive new points
*/
function updateInfo(triangles, rectangles, circles) {
  for (let triangle of triangles)
    triangle.poly = createIsoceslesTriangle(triangle);

  for (let rectangle of rectangles)
    rectangle.poly = createRectangle(rectangle);

  for (let circle of circles)
    circle.radius = vec2d.len(vec2d.sub([], circle.control, circle.center));
}

/**
 * Draw triangle into canvasElement
 * @param {CanvasRenderingContext2D} ctx context to draw
 * @param {Object} triangle triangle
*/
function drawTriangle(ctx, triangle) {
  ctx.fillStyle = ctx.strokeStyle = triangle.color;

  // Draw anchor points
  for (let p of triangle.anchors) {
    ctx.beginPath();
    ctx.arc(...p, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw line segments
  ctx.beginPath();
  for (let p of triangle.poly) {
    ctx.lineTo(...p);
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * Draw rectangle into canvasElement
 * @param {CanvasRenderingContext2D} ctx context to draw
 * @param {Object} rectangle rectangle
*/
function drawRectangle(ctx, rectangle) {
  ctx.fillStyle = ctx.strokeStyle = rectangle.color;

  // Draw the center
  ctx.beginPath();
  ctx.arc(...rectangle.center, 5, 0, Math.PI * 2);
  ctx.fill();

  // Draw the lateral anchor points
  for (let p of rectangle.midPoints) {
    ctx.beginPath();
    ctx.arc(...p, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw the line segments 
  ctx.beginPath();
  for (let p of rectangle.poly) {
    ctx.lineTo(...p);
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * Draw circle into canvasElement
 * @param {CanvasRenderingContext2D} ctx context to draw
 * @param {Object} circle circle
*/
function drawCircle(ctx, circle) {
  ctx.fillStyle = ctx.strokeStyle = circle.color;

  // Draw the circle
  ctx.beginPath();
  ctx.arc(...circle.center, circle.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw the center
  ctx.beginPath();
  ctx.arc(...circle.center, 5, 0, Math.PI * 2);
  ctx.fill();

  // Draw the controller
  ctx.beginPath();
  ctx.arc(...circle.control, 5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Checks possible intersections between triangle and the others polygons
 * @param {Object} triangle triangle
 * @param {Array<Object>} triangles the triangles on canvas
 * @param {Array<Object>} rectangles the rectangles on canvas
 * @param {Array<Object>} circles the circles on canvas
*/
function checkTriangleIntersections(triangle, triangles, rectangles, circles) {
  for (let triangle2 of triangles)
    if (triangle != triangle2 && convexPolysIntersect(triangle.poly, triangle2.poly)) 
      triangle.color = triangle2.color = "red";

  for (let circle of circles) 
    if (convexPolyCircleIntersect(circle.center, circle.radius, triangle.poly)) 
      circle.color = triangle.color = "red";

  for (let rectangle of rectangles) 
    if (convexPolysIntersect(rectangle.poly, triangle.poly)) 
      rectangle.color = triangle.color = "red";
}

/**
 * Checks possible intersections between rectangle and the others polygons
 * @param {Object} rectangle rectangle
 * @param {Array<Object>} triangles the triangles on canvas
 * @param {Array<Object>} rectangles the rectangles on canvas
 * @param {Array<Object>} circles the circles on canvas
*/
function checkRectangleIntersections(rectangle, triangles, rectangles, circles) {
  for (let rectangle2 of rectangles) {
    if (rectangle != rectangle2 && convexPolysIntersect(rectangle.poly, rectangle2.poly)) {
      rectangle.color = rectangle2.color = "red";
      console.log("rect", rectangle2);
    }
  }

  for (let circle of circles) 
    if (convexPolyCircleIntersect(circle.center, circle.radius, rectangle.poly)) {
      circle.color = rectangle.color = "red";
      console.log("rectC", rectangle);
      console.log("circle", circle);
    }

  for (let triangle of triangles) 
    if (convexPolysIntersect(rectangle.poly, triangle.poly)) 
      triangle.color = rectangle.color = "red";
}

/**
 * Checks possible intersections between circle and the others polygons
 * @param {Object} circle circle
 * @param {Array<Object>} triangles the triangles on canvas
 * @param {Array<Object>} rectangles the rectangles on canvas
 * @param {Array<Object>} circles the circles on canvas
*/
function checkCircleIntersections(circle, triangles, rectangles, circles) {
  for (let circle2 of circles) 
    if (circle != circle2 && circlesIntersect(circle.center, circle.radius, circle2.center, circle2.radius)) 
      circle.color = circle2.color = "red";

  for (let rectangle of rectangles) 
    if (convexPolyCircleIntersect(circle.center, circle.radius, rectangle.poly)) 
      circle.color = rectangle.color = "red";

  for (let triangle of triangles)
    if (convexPolyCircleIntersect(circle.center, circle.radius, triangle.poly)) 
      circle.color = triangle.color = "red";
}

/**
 * Demo: Test of intersection between convex polygons and circles.
 *
 * Interactively move the anchor points to change the configuration of triangles, squares and circles.
 * If there is an intersection, the drawing will be red, otherwise, black.
 *
 * @name polygonsDemo
 * @function
 */
(function polygonsDemo() {
  const demo = document.querySelector("#theCanvas");
  const ctx = demo.getContext("2d");
  const [width, height] = [demo.clientWidth, demo.clientHeight];
  let prevMouse = null;

  // Create triangles, rectangles and circles initialized with default values. If you want to add more polygons, you can use that structure and define a new polygon
  const triangles = [
    { basePoint: [100, 100], oppositeVertex: [100, 50], color: "black" },
    { basePoint: [250, 100], oppositeVertex: [250, 50], color: "black" },
    { basePoint: [400, 100], oppositeVertex: [400, 50], color: "black" },
  ];

  const rectangles = [
    { center: [100, 230], width: 50, height: 80, color: "black" },
    { center: [250, 230], width: 50, height: 80, color: "black" },
    { center: [400, 230], width: 50, height: 80, color: "black" },
  ];

  const circles = [
    { center: [100, 410], radius: 50, color: "black" },
    { center: [250, 410], radius: 50, color: "black" },
    { center: [400, 410], radius: 50, color: "black" },
  ];

  makePts(triangles, rectangles, circles);

  const update = () => {
    fillCanvas(ctx, width, height);
    updateInfo(triangles, rectangles, circles);

    for (let triangle of triangles) {
      triangle.color = "black"; // reset triangle color
      checkTriangleIntersections(triangle, triangles, rectangles, circles);
      drawTriangle(ctx, triangle);
    }

    for (let rectangle of rectangles) {
      rectangle.color = "black"; // reset rectangle color
      checkRectangleIntersections(rectangle, triangles, rectangles, circles);
      drawRectangle(ctx, rectangle);
    }

    for (let circle of circles) {
      circle.color = "black"; // reset circle color
      checkCircleIntersections(circle, triangles, rectangles, circles);
      drawCircle(ctx, circle);
    }
  };
  update();

  demo.onmousedown = (e) => {
    const mouse = [e.offsetX, e.offsetY];
    prevMouse = mouse;
    demo.onmousemove = null;

    for (let triangle of triangles) {
      for (let i of [0, 1]) {
        if (vec2d.distance(mouse, triangle.anchors[i]) <= 5) {
          demo.onmousemove = (e) => {
            const mouse = [e.offsetX, e.offsetY];
            const delta = vec2d.sub([], mouse, prevMouse);
            prevMouse = mouse;
            i == 0 ? dragTriangleBasePoint(delta, triangle.anchors) : dragTriangleOppositeVertex(delta, triangle.anchors);
            update();
          };
        }
      }
    }

    for (let rectangle of rectangles) {
      for (let i of [0, 1, 2, 3, 4]) {
        if (vec2d.distance(mouse, rectangle.anchors[i]) <= 5) {
          demo.onmousemove = (e) => {
            const mouse = [e.offsetX, e.offsetY];
            const delta = vec2d.sub([], mouse, prevMouse);
            prevMouse = mouse;
            i == 0 ? dragRectangleCenter(delta, rectangle.anchors) : dragRectangleMidPoint(delta, i, rectangle.anchors);
            update();
          };
        }
      }
    }

    for (let circle of circles) {
      for (let i of [0, 1]) {
        if (vec2d.distance(mouse, circle.anchors[i]) <= 5) {
          demo.onmousemove = (e) => {
            const mouse = [e.offsetX, e.offsetY];
            const delta = vec2d.sub([], mouse, prevMouse);
            prevMouse = mouse;
            i == 0 ? dragCircleCenter(delta, circle.anchors) : dragCircleControl(delta, circle.anchors);
            update();
          };
        }
      }
    }
  };

  demo.onmouseup = () => {
    demo.onmousemove = null;
  };
  
  update();
})();