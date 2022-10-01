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

function createRectangle(center, width, height) {
  return [
    vec2d.add([], center, [width, 0]),
    vec2d.add([], center, [0, height]),
    vec2d.add([], center, [-width, 0]),
    vec2d.add([], center, [0, -height]),
  ];
}

/**
 * Returns the closest point of the border of the polygon poly to p.
 * @param {Array<Number,Number>} p point.
 * @param {Array<Array<Number,Number>>} poly polygon.
 * @returns {Array<Number,Number>} closest point.
 * @see <img src="../closest.jpg" width="384">
 */
function closestPolyPoint(p, poly) {}

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
 * @param {Array<Array<Number,Number>>} poly first polygon.
 * @param {Array<Array<Number,Number>>} poly2 second polygon.
 * @returns {Boolean} intersect or not.
 */
function convexPolysIntersect(poly, poly2) {
  let n = poly.length;
  let n2 = poly2.length;
  let i, j, p, q, r, s;
  let points1 = 0;
  let points2 = 0;

  // Para cada aresta do polígono 1
  for (i = 0; i < n; i++) {
    p = poly[i];
    q = poly[(i + 1) % n];
    // Para cada aresta do polígono 2
    for (j = 0; j < n2; j++) {
      r = poly2[j];
      s = poly2[(j + 1) % n2];
      // Verificamos se as arestas se intersectam
      if (vec2d.segmentsIntersect(p, q, r, s)) {
        return true;
      } else {
        if (util2d.pointInConvexPoly(r, poly)) points1++;
      }
    }
    if (util2d.pointInConvexPoly(p, poly2)) points2++;
  }

  // Caso em que as arestas nao se intersectam e um poligono esta dentro do outro
  if (points1 >= 3 || points2 >= 3) return true;

  return false;
}

/**
 * Returns true iff convex polygon poly a circle with the given center and radius.
 * @param {Array<Array<Number,Number>>} poly polygon.
 * @param {Array<Number,Number>} center circle center.
 * @param {Number} radius circle radius.
 * @returns {Boolean} intersect or not.
 */
function convexPolyCircleIntersect(poly, center, radius) {}

/**
 * Returns true if a circle intersects another circle with the given center and radius.
 * @param {Array<Number,Number>} center1 first circle center.
 * @param {Number} radius1 first circle radius.
 * @param {Array<Number,Number>} center2 second circle center.
 * @param {Number} radius2 second circle radius.
 * @returns {Boolean} intersect or not.
 */
function circleCircleIntersect(center1, radius1, center2, radius2) {
  const distance = vec2d.dist(center1, center2);
  return distance > radius1 + radius2 ? false : true;
}

function circleRectIntersection(circleCenter, circleRadius, rectanglePoints) {
  if (util2d.pointInConvexPoly(circleCenter, rectanglePoints)) return true;
  for (let i = 0; i < 4; i++) {
    if (
      util2d.distToSegment(
        circleCenter,
        rectanglePoints[i],
        rectanglePoints[(i + 1) % 4]
      ) <= circleRadius
    )
      return true;
  }

  return false;
}

function circleTriangleIntersection(
  circleCenter,
  circleRadius,
  trianglePoints
) {
  // console.log("triangle", trianglePoints);
  if (util2d.pointInConvexPoly(circleCenter, trianglePoints)) return true;
  for (let i = 0; i < 3; i++) {
    if (
      util2d.distToSegment(
        circleCenter,
        trianglePoints[i],
        trianglePoints[(i + 1) % 3]
      ) <= circleRadius
    )
      return true;
  }

  return false;
}

function getRectangleVertices(rectangle) {
  const delta = vec2d.sub([], rectangle.sidePoints[1], rectangle.center);

  return [
    vec2d.add([], rectangle.sidePoints[0], delta),
    vec2d.sub([], rectangle.sidePoints[0], delta),
    vec2d.sub([], rectangle.sidePoints[2], delta),
    vec2d.add([], rectangle.sidePoints[2], delta),
  ];
}

function rectanglesIntersection(rectangle, rectTwo) {
  let V = SAT.Vector;
  let P = SAT.Polygon;

  let polygon1 = new P(new V(), [
    new V(rectangle[0][0], rectangle[0][1]),
    new V(rectangle[1][0], rectangle[1][1]),
    new V(rectangle[2][0], rectangle[2][1]),
    new V(rectangle[3][0], rectangle[3][1]),
  ]);

  let polygon2 = new P(new V(), [
    new V(rectTwo[0][0], rectTwo[0][1]),
    new V(rectTwo[1][0], rectTwo[1][1]),
    new V(rectTwo[2][0], rectTwo[2][1]),
    new V(rectTwo[3][0], rectTwo[3][1]),
  ]);

  let response;
  let collided = SAT.testPolygonPolygon(polygon1, polygon2, response);

  return collided;
}

function rectTriangleIntersection(rectangle, triangle) {
  let V = SAT.Vector;
  let P = SAT.Polygon;

  let polygon1 = new P(new V(), [
    new V(rectangle[0][0], rectangle[0][1]),
    new V(rectangle[1][0], rectangle[1][1]),
    new V(rectangle[2][0], rectangle[2][1]),
    new V(rectangle[3][0], rectangle[3][1]),
  ]);

  let polygon2 = new P(new V(), [
    new V(triangle[0][0], triangle[0][1]),
    new V(triangle[1][0], triangle[1][1]),
    new V(triangle[2][0], triangle[2][1]),
  ]);

  let response;
  let collided = SAT.testPolygonPolygon(polygon1, polygon2, response);

  return collided;
}

function trianglesIntersection(triangle, triangleTwo) {
  let V = SAT.Vector;
  let P = SAT.Polygon;

  let polygon1 = new P(new V(), [
    new V(triangle[0][0], triangle[0][1]),
    new V(triangle[1][0], triangle[1][1]),
    new V(triangle[2][0], triangle[2][1]),
  ]);

  let polygon2 = new P(new V(), [
    new V(triangleTwo[0][0], triangleTwo[0][1]),
    new V(triangleTwo[1][0], triangleTwo[1][1]),
    new V(triangleTwo[2][0], triangleTwo[2][1]),
  ]);

  let response;
  let collided = SAT.testPolygonPolygon(polygon1, polygon2, response);

  return collided;
}

const dragCircleCenter = (delta, circle) => {
  vec2d.add(circle[0], circle[0], delta);
  vec2d.add(circle[1], circle[1], delta);
};

const dragCircleEdge = (delta, circle) => {
  vec2d.add(circle[1], circle[1], delta);
};

const dragTriangleCenter = (delta, tri) => {
  let v = vec2d.sub([], tri[1], tri[0]);
  vec2d.add(tri[0], tri[0], delta);
  vec2d.add(tri[1], tri[0], v);
};

const dragTriangleEdge = (delta, tri) => {
  vec2d.add(tri[1], tri[1], delta);
};

const dragVtx = (delta, i, rectangle) => {
  const vtx = rectangle[i];
  vec2d.add(vtx, vtx, delta);
  vec2d.sub(rectangle[((i + 1) % 4) + 1], rectangle[((i + 1) % 4) + 1], delta);

  const size = Math.abs(vec2d.dist(rectangle[(i % 4) + 1], rectangle[0]));

  vec2d.rotate(rectangle[(i % 4) + 1], vtx, rectangle[0], -Math.PI / 2);
  vec2d.sub(rectangle[(i % 4) + 1], rectangle[(i % 4) + 1], rectangle[0]);
  vec2d.normalize(rectangle[(i % 4) + 1], rectangle[(i % 4) + 1]);
  vec2d.scale(rectangle[(i % 4) + 1], rectangle[(i % 4) + 1], size);
  vec2d.add(rectangle[(i % 4) + 1], rectangle[(i % 4) + 1], rectangle[0]);

  vec2d.rotate(
    rectangle[((i - 2 + 4) % 4) + 1],
    rectangle[(i % 4) + 1],
    rectangle[0],
    Math.PI
  );
};

const dragBase = (delta, rectPoints) => {
  vec2d.add(rectPoints[0], rectPoints[0], delta);
  for (let i = 1; i < 5; i++) {
    vec2d.add(rectPoints[i], rectPoints[i], delta);
  }
};

function makePts(triangles, rectangles, circles) {
  for (let triangle of triangles) {
    triangle.poly = createIsoceslesTriangle(triangle);
    triangle.anchors = [triangle.basePoint, triangle.oppositeVertex];
  }

  for (let rectangle of rectangles) {
    rectangle.sidePoints = createRectangle(rectangle.center, rectangle.width, rectangle.height);
    rectangle.vertices = getRectangleVertices(rectangle);
    rectangle.anchors = [rectangle.center].concat(rectangle.sidePoints);
  }

  for (let circle of circles) {
    circle.control = [circle.center[0], circle.center[1] - circle.radius];
    circle.anchors = [circle.center, circle.control];
  }
};

function updateRadius(circles) {
  for (let circle of circles) {
    circle.radius = vec2d.len(vec2d.sub([], circle.control, circle.center));
  }
};

function updateVertices(rectangles) {
  for (let rectangle of rectangles) {
    rectangle.vertices = getRectangleVertices(rectangle);
  }
};

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
};

function drawRectangle(ctx, rectangle) {
  ctx.fillStyle = ctx.strokeStyle = rectangle.color;

  // Draw the center
  ctx.beginPath();
  ctx.arc(...rectangle.center, 5, 0, Math.PI * 2);
  ctx.fill();

  // Draw the lateral anchor points
  for (let p of rectangle.sidePoints) {
    ctx.beginPath();
    ctx.arc(...p, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw the line segments 
  ctx.beginPath();
  for (let p of rectangle.vertices) {
    ctx.lineTo(...p);
  }
  ctx.closePath();
  ctx.stroke();
};

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
};

function checkTriangleIntersections(triangle, triangles, rectangles, circles) {
  for (let triangle2 of triangles)
    if (triangle != triangle2 && trianglesIntersection(triangle.poly, triangle2.poly)) 
      triangle.color = triangle2.color = "red";

  for (let circle of circles) 
    if (circleTriangleIntersection(circle.center, circle.radius, triangle.poly)) 
      circle.color = triangle.color = "red";

  for (let rectangle of rectangles) 
    if (rectTriangleIntersection(rectangle.vertices, triangle.poly)) 
      rectangle.color = triangle.color = "red";
};

function checkRectangleIntersections(rectangle, triangles, rectangles, circles) {
  for (let rectangle2 of rectangles)
    if (rectangle != rectangle2 && rectanglesIntersection(rectangle.vertices, rectangle2.vertices)) 
      rectangle.color = rectangle2.color = "red";

  for (let circle of circles) 
    if (circleRectIntersection(circle.center, circle.radius, rectangle.vertices))
      circle.color = rectangle.color = "red";

  for (let triangle of triangles) 
    if (rectTriangleIntersection(rectangle.vertices, triangle.poly)) 
      triangle.color = rectangle.color = "red";
};

function checkCircleIntersections(circle, triangles, rectangles, circles) {
  for (let circle2 of circles) 
    if (circle != circle2 && circleCircleIntersect(circle.center, circle.radius, circle2.center, circle2.radius)) 
      circle.color = circle2.color = "red";

  for (let rectangle of rectangles) 
    if (circleRectIntersection(circle.center, circle.radius, rectangle.vertices)) 
      circle.color = rectangle.color = "red";

  for (let triangle of triangles)
    if (circleTriangleIntersection(circle.center, circle.radius, triangle.poly)) 
      circle.color = triangle.color = "red";
};

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
    updateRadius(circles);
    updateVertices(rectangles);

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

    for (let rectangle of rectangles) {
      for (let i of [0, 1, 2, 3, 4]) {
        if (vec2d.distance(mouse, rectangle.anchors[i]) <= 5) {
          demo.onmousemove = (e) => {
            const mouse = [e.offsetX, e.offsetY];
            const delta = vec2d.sub([], mouse, prevMouse);
            prevMouse = mouse;
            i == 0 ? dragBase(delta, rectangle.anchors) : dragVtx(delta, i, rectangle.anchors);
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
            i == 0 ? dragCircleCenter(delta, circle.anchors) : dragCircleEdge(delta, circle.anchors);
            update();
          };
        }
      }
    }

    for (let triangle of triangles) {
      for (let i of [0, 1]) {
        if (vec2d.distance(mouse, triangle.anchors[i]) <= 5) {
          demo.onmousemove = (e) => {
            const mouse = [e.offsetX, e.offsetY];
            const delta = vec2d.sub([], mouse, prevMouse);
            prevMouse = mouse;
            i == 0 ? dragTriangleCenter(delta, triangle.anchors) : dragTriangleEdge(delta, triangle.anchors);
            makePts(triangles, rectangles, circles);
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