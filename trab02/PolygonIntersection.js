/**
 *  @file
 *
 *  <p>Intersecao entre ci­rculos e poli­gonos convexos.</p>
 *
 *  @author Gabriele Jandres Cavalcanti
 *  @since 20/09/2022
 *  @see https://gabrielejandres.github.io/computer-graphics-2022.2/trab02/PolygonIntersection.html
 */

"use strict";

import * as util2d from "./utils/2d.js";

const curry = fn => {
  const curried = (...args) => {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...argsNext) => curried(...args, ...argsNext);
  };
  return curried;
};

/**
 * Two dimensional vector.
 * @type {glvec2}
 */
let vec2d = (function () {
  /**
   * @member {Object} glvec2 an extended vec2 from gl-matrix.
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

/**
 * Fills the canvas with a solid color and border.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} w width.
 * @param {Number} h height.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
function fillCanvas(ctx, w, h) {
  ctx.fillStyle = "white";
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 10;
  // clear canvas.
  ctx.fillRect(0, 0, w, h);
  // draw canvas border.
  ctx.strokeRect(0, 0, w, h);
  ctx.lineWidth = 1;
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
  console.log(poly);
  console.log(poly2);
  // for each edge of poly.
  for (i = 0; i < n; i++) {
    p = poly[i];
    q = poly[(i + 1) % n];
    // for each edge of poly2.
    for (j = 0; j < n2; j++) {
      r = poly2[j];
      s = poly2[(j + 1) % n2];
      // check if the edges intersect.
      if (vec2d.segmentsIntersect(p, q, r, s)) {
        return true;
      } 
      if (util2d.pointInConvexPoly(r, poly)) points1++;
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
 * Returns true iff a circle intersects another circle with the given center and radius.
 * @param {Array<Number,Number>} center1 first circle center.
 * @param {Number} radius1 first circle radius.
 * @param {Array<Number,Number>} center2 second circle center.
 * @param {Number} radius2 second circle radius.
 * @returns {Boolean} intersect or not.
 * @see https://milania.de/blog/Intersection_area_of_two_circles_with_implementation_in_C%2B%2B
 * @see <img src="../IntersectingCirclesArea_CircularSegmentsSmallAngle.png" width="320">
 */
function circleCircleIntersect(center1, radius1, center2, radius2) {}

/**
 * Returns a rectangular polygon in the form of a vertex circulation,
 * given:
 * <ul>
 * <li>its center, </li>
 * <li>a vector (u) pointing from the center to the midpoint
 *       of one of its sides, </li>
 * <li>and the size of that side.</li>
 * </ul>
 * @param {Array<Number,Number>} center rectangle center.
 * @param {Array<Number,Number>} u orientation vector.
 * @param {Number} size side size.
 * @returns {Array<Array<Number,Number>>} a rectangle (a polygon).
 * @see <img src="../cRv2l.png" width="320">
 */
function makeRectangle(center, u, size) {
  const v = vec2.rotate([], u, Math.PI / 2);
  const halfSize = size / 2;
  return [
    vec2.add([], center, vec2.scale([], u, halfSize)),
    vec2.add([], center, vec2.scale([], v, halfSize)),
    vec2.sub([], center, vec2.scale([], u, halfSize)),
    vec2.sub([], center, vec2.scale([], v, halfSize)),
  ];
}
const vScale = curry((sc, v) => [v[0] * sc, v[1] * sc]);
const vAdd = curry((v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]]);
const vMidpoint = curry((v, v2) => vScale(0.5, vAdd(v, v2)));

/**
 * Returns an array with the mid-points of the edges of polygon poly.
 * @param {Array<Array<Number,Number>>} poly polygon.
 * @returns {Array<Array<Number,Number>>} mid-points.
 */
function midPoints(poly) {
  let n = poly.length;
  let midPoints = [];
  for (let i = 0; i < n; i++) {
    midPoints.push(vMidpoint(poly[i], poly[(i + 1) % n]));
  }
  return midPoints;
}

/**
 * <p>Demo: Teste de intersecao entre triangulos.</p>
 *
 * Mova interativamente os pontos ancora para alterar a configuracao dos trianngulos.<br>
 * Se houver intersecao, o desenho sera vermelho, caso contrario, preto.
 *
 * <p>Triangulos sao descritos por objetos:</p>
 * { basePoint: [270, 350], oppositeVertex: [300, 200], color: "black" }
 *
 * @name isoscelesDemo
 * @function
 */
(function isoscelesDemo() {
  const demo = document.querySelector("#theCanvas");
  const ctx = demo.getContext("2d");
  let [w, h] = [demo.clientWidth, demo.clientHeight];
  const iso = [
    { basePoint: [270, 350], oppositeVertex: [300, 200], color: "black" },
    { basePoint: [100, 100], oppositeVertex: [50, 20], color: "black" },
    { basePoint: [250, 150], oppositeVertex: [150, 100], color: "black" },
  ];

  function makePts() {
    for (let t of iso) {
      t.poly = isosceles(t);
      t.anchors = [t.basePoint, t.oppositeVertex];
    }
  }

  makePts();
  let sel = null;
  let prevMouse = null;

  const update = () => {
    fillCanvas(ctx, w, h);

    // tri âˆ© tri
    for (let t1 of iso) {
      t1.color = "black";
      for (let t2 of iso) {
        if (t1 == t2) continue;
        let intersect = convexPolysIntersect(t1.poly, t2.poly);
        if (intersect) {
          t1.color = "red";
          t2.color = "red";
        }
      }
    }

    for (let t of iso) {
      ctx.fillStyle = ctx.strokeStyle = t.color;
      for (let p of t.anchors) {
        ctx.beginPath();
        ctx.arc(...p, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      for (let p of t.poly) {
        ctx.lineTo(...p);
      }
      ctx.closePath();
      ctx.stroke();
    }
  };
  update();

  demo.onmousemove = (e) => {
    if (sel) {
      let mouse = [e.offsetX, e.offsetY];
      let [tri, ianchor] = sel;
      let delta = vec2d.sub([], mouse, prevMouse);
      prevMouse = mouse;
      if (ianchor == 0) {
        let v = vec2d.sub([], tri.oppositeVertex, tri.basePoint);
        vec2d.add(tri.basePoint, tri.basePoint, delta);
        vec2d.add(tri.oppositeVertex, tri.basePoint, v);
      } else {
        vec2d.add(tri.oppositeVertex, tri.oppositeVertex, delta);
      }
      makePts();
      update();
    }
  };

  demo.onmousedown = (e) => {
    sel = null;
    const mouse = [e.offsetX, e.offsetY];
    prevMouse = mouse;
    for (let tri of iso) {
      for (let [ianchor, p] of tri.anchors.entries()) {
        if (vec2d.distance(mouse, p) <= 5) {
          sel = [tri, ianchor];
        }
      }
    }
  };

  demo.onmouseup = () => {
    sel = null;
  };
  update();
})();

// (function rectangleDemo() {
//   const demo = document.querySelector("#theCanvas");
//   const ctx = demo.getContext("2d");
//   let [w, h] = [demo.clientWidth, demo.clientHeight];
//   const rect = [
//     { center: [100, 100], u: [1, 0], size: 100, color: "black" },
//     { center: [200, 200], u: [1, 0], size: 100, color: "black" },
//     { center: [300, 300], u: [1, 0], size: 100, color: "black" },
//   ];

//   function makePts() {
//     for (let t of rect) {
//       t.poly = makeRectangle(t.center, t.u, t.size);
//       t.anchors = [t.center, t.u];
//     }
//   }

//   makePts();
//   let sel = null;
//   let prevMouse = null;

//   const update = () => {
//     fillCanvas(ctx, w, h);

//     // rect âˆ© rect
//     for (let t1 of rect) {
//       t1.color = "black";
//       for (let t2 of rect) {
//         if (t1 == t2) continue;
//         let intersect = convexPolysIntersect(t1.poly, t2.poly);
//         if (intersect) {
//           t1.color = "red";
//           t2.color = "red";
//         }
//       }
//     }

//     for (let t of rect) {
//       ctx.fillStyle = ctx.strokeStyle = t.color;
//       for (let p of t.anchors) {
//         ctx.beginPath();
//         ctx.arc(...p, 5, 0, Math.PI * 2);
//         ctx.fill();
//       }
//       ctx.beginPath();
//       for (let p of t.poly) {
//         ctx.lineTo(...p);
//       }
//       ctx.closePath();
//       ctx.stroke();
//     }
//   };
//   update();

//   demo.onmousemove = (e) => {
//     if (sel) {
//       let mouse = [e.offsetX, e.offsetY];
//       let [r, ianchor] = sel;
//       let delta = vec2d.sub([], mouse, prevMouse);
//       prevMouse = mouse;
//       if (ianchor == 0) {
//         vec2d.add(r.center, r.center, delta);
//       } else {
//         vec2d.add(r.u, r.u, delta);
//         vec2d.normalize(r.u, r.u);
//       }
//       makePts();
//       update();
//     }
//   };

//   demo.onmousedown = (e) => {
//     sel = null;
//     const mouse = [e.offsetX, e.offsetY];
//     prevMouse = mouse;
//     for (let r of rect) {
//       for (let [ianchor, p] of r.anchors.entries()) {
//         if (vec2d.distance(mouse, p) <= 5) {
//           sel = [r, ianchor];
//         }
//       }
//     }
//   };

//   demo.onmouseup = () => {
//     sel = null;
//   };
//   update();
// })();

// (function rectangleDemo() {
//   const demo = document.querySelector("#theCanvas");
//   const ctx = demo.getContext("2d");
//   let [w, h] = [demo.clientWidth, demo.clientHeight];
//   const rect = [
//     { center: [270, 350], u: [1, 0], size: 100, color: "black" },
//     { center: [100, 100], u: [1, 0], size: 100, color: "black" },
//     { center: [250, 150], u: [1, 0], size: 100, color: "black" },
//   ];

//   const update = () => {
//     fillCanvas(ctx, w, h);

//     // rect âˆ© rect
//     for (let r1 of rect) {
//       r1.color = "black";
//       for (let r2 of rect) {
//         if (r1 == r2) continue;
//         let intersect = convexPolysIntersect(r1.poly, r2.poly);
//         if (intersect) {
//           r1.color = "red";
//           r2.color = "red";
//         }
//       }
//     }

//     for (let r of rect) {
//       ctx.fillStyle = ctx.strokeStyle = r.color;
//       ctx.beginPath();
//       for (let p of r.poly) {
//         ctx.lineTo(...p);
//       }
//       ctx.closePath();
//       ctx.stroke();
//     }
//   }

//   function makePts() {
//     for (let r of rect) {
//       r.poly = makeRectangle(r.center, r.u, r.size);
//       r.anchors = midPoints(r.poly);
//     }
//   }

//   makePts();
//   let sel = null;
//   let prevMouse = null;

//   demo.onmousemove = (e) => {
//     if (sel) {
//       let mouse = [e.offsetX, e.offsetY];
//       let [r, ianchor] = sel;
//       let delta = vec2d.sub([], mouse, prevMouse);
//       prevMouse = mouse;
//       if (ianchor == 0) {
//         vec2d.add(r.center, r.center, delta);
//       } else {
//         vec2d.add(r.u, r.u, delta);
//       }
//       makePts();
//       update();
//     }
//   }

//   demo.onmousedown = (e) => {
//     sel = null;
//     const mouse = [e.offsetX, e.offsetY];
//     prevMouse = mouse;
//     for (let r of rect) {
//       for (let [ianchor, p] of r.anchors.entries()) {
//         if (vec2d.distance(mouse, p) <= 5) {
//           sel = [r, ianchor];
//         }
//       }
//     }
//   }

//   demo.onmouseup = () => {
//     sel = null;
//   }
//   update();
// })();

/**
 * Returns the 3 vertices of an isosceles triangle
 * defined by the center point of its base and the
 * opposite vertex.
 * @param {Array<Number,Number>} basePoint base midpoint.
 * @param {Array<Number,Number>} oppositeVertex opposite vertex.
 * @return {Array<Array<Number,Number>, Array<Number,Number>, Array<Number,Number>>}
 * an isosceles triangle (a convex polygon).
 * @see https://en.wikipedia.org/wiki/Isosceles_triangle
 * @see <img src="../Isosceles-Triangle.png" width="256">
 */
function isosceles({ basePoint, oppositeVertex }) {
  const u = vec2d.sub([], basePoint, oppositeVertex);
  const v = [-u[1], u[0]];
  const w = [u[1], -u[0]];
  return [
    oppositeVertex,
    vec2d.add([], basePoint, v),
    vec2d.add([], basePoint, w),
  ];
}