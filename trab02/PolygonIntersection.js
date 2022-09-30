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

/**
 * Fills the canvas with a solid color and border.
 * @param {CanvasRenderingContext2D} ctx canvas context.
 * @param {Number} w width.
 * @param {Number} h height.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
function fillCanvas(ctx, w, h) {
  ctx.fillStyle = "#EFEFEF";
  ctx.strokeStyle = "#565656";
  ctx.lineWidth = 10;

  // Clear canvas
  ctx.fillRect(0, 0, w, h);

  // Draw canvas border
  ctx.strokeRect(0, 0, w, h);
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
  // console.log(poly);
  // console.log(poly2);
  
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

function makeRectangle(center, width, height) {
    return [
      vec2d.add([], center, [width, 0]),
      vec2d.add([], center, [0, height]),
      vec2d.add([], center, [-width, 0]),
      vec2d.add([], center, [0, -height])
    ];
}

// function makeRectangle(center, u, size) {
//   const v = [-u[1], u[0]];
//   const halfSize = size / 2;
//   return [
//     vec2d.add([], center, vec2d.scale([], u, halfSize)),
//     vec2d.add([], center, vec2d.scale([], v, halfSize)),
//     vec2d.add([], center, vec2d.scale([], u, -halfSize)),
//     vec2d.add([], center, vec2d.scale([], v, -halfSize)),
//   ];
// }

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

function getRectVertices(rect) {
  let delta = vec2d.sub([], rect.sides[1], rect.center);

    return [
      vec2d.add([], rect.sides[0], delta),
      vec2d.sub([], rect.sides[0], delta),
      vec2d.sub([], rect.sides[2], delta),
      vec2d.add([], rect.sides[2], delta)
    ];
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
 * @name polygonsDemo
 * @function
 */
(function polygonsDemo() {
  const demo = document.querySelector("#theCanvas");
  const ctx = demo.getContext("2d");
  let [w, h] = [demo.clientWidth, demo.clientHeight];

  const iso = [
    { basePoint: [100, 100], oppositeVertex: [100, 50], color: "black" },
    { basePoint: [250, 100], oppositeVertex: [250, 50], color: "black" },
    { basePoint: [400, 100], oppositeVertex: [400, 50], color: "black" },
  ];

  const rect = [
    { center: [100, 230], sides: "", width: 50, height: 80, color: "black" },
    { center: [250, 230], sides: "", width: 50, height: 80, color: "black" },
    { center: [400, 230], sides: "", width: 50, height: 80, color: "black" },
  ];

  const circ = [
    { center: [100, 410], radius: 50, radiusControl: [100, 360], color: "black" },
    { center: [250, 410], radius: 50, radiusControl: [250, 360], color: "black" },
    { center: [400, 410], radius: 50, radiusControl: [400, 360], color: "black" },
  ];

  function makePts() {
    for (let t of iso) {
      t.poly = isosceles(t);
      t.anchors = [t.basePoint, t.oppositeVertex];
    }

    for (let t of rect) {
      t.sides = makeRectangle(t.center, t.width, t.height);
      t.anchors = t.sides;
    }
  }

  function updateRadius() {
    for (let c of circ) {
      c.radius = vec2d.len(vec2d.sub([], c.radiusControl, c.center));
    }
  }

  makePts();
  let sel = null;
  let prevMouse = null;

  const update = () => {
    fillCanvas(ctx, w, h);
    updateRadius();

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

    // rect âˆ© rect
    for (let t1 of rect) {
      t1.color = "black";
      for (let t2 of rect) {
        if (t1 == t2) continue;
        let intersect = convexPolysIntersect(t1.sides, t2.sides); // TODO: adicionar um parametro pra saber qual eh  poligono
        if (intersect) {
          t1.color = "red";
          t2.color = "red";
        }
      }
    }

    for (let t of rect) {
      ctx.fillStyle = ctx.strokeStyle = t.color;

      // Desenha o centro
      ctx.beginPath();
      ctx.arc(...t.center, 5, 0, Math.PI * 2);
      ctx.fill();

      // Desenha os pontos das laterais
      for (let p of t.sides) {
        ctx.beginPath();
        ctx.arc(...p, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Desenha as linhas do retangulo
      ctx.beginPath();
      for (let p of getRectVertices(t)) {
        ctx.lineTo(...p);
      }
      ctx.closePath();
      ctx.stroke();
    }

    for (let c of circ) {
      ctx.fillStyle = ctx.strokeStyle = c.color;

      // Desenha o circulo
      ctx.beginPath();
      ctx.arc(...c.center, c.radius, 0, Math.PI * 2);
      ctx.stroke();

      //let radius = vec2d.len(vec2d.sub([], c.radiusControl, c.center));
      ctx.beginPath();
      ctx.arc(...c.center, c.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Desenha o centro
      ctx.beginPath();
      ctx.arc(...c.center, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Desenha o controlador
      ctx.beginPath();
      ctx.arc(...c.radiusControl, 5, 0, Math.PI * 2);
      ctx.fill();
    }

  };
  update();

  // funcao do retangulo
    const dragBase = (e, rectPoints) => {
        let mouse = [e.offsetX, e.offsetY];
        let delta = vec2d.sub([], mouse, prevMouse);
        prevMouse = mouse;
        vec2d.add(rectPoints[0], rectPoints[0], delta);
        for (let i = 1; i < 5; i++) {
            vec2d.add(rectPoints[i], rectPoints[i], delta);
        }
    };

    const dragCircleCenter = (delta, circle) => {
      vec2d.add(circle[0], circle[0], delta);
      vec2d.add(circle[1], circle[1], delta);
  };

  const dragCircleEdge = (delta, circle) => {
      vec2d.add(circle[1], circle[1], delta);
  }

    // funcao do retangulo
    const dragVtx = (e, i, rect) => {
        let mouse = [e.offsetX, e.offsetY];
        let vtx = rect[i];
        let delta = vec2d.sub([], mouse, prevMouse);
        prevMouse = mouse;
        vec2d.add(vtx, vtx, delta);
        vec2d.sub(rect[(i + 1) % 4 + 1], rect[(i + 1) % 4 + 1], delta);

        let size = Math.abs(vec2d.dist(rect[(i % 4) + 1], rect[0]));

        vec2d.rotate(rect[(i % 4) + 1], vtx, rect[0], -Math.PI / 2);
        vec2d.sub(rect[(i % 4) + 1], rect[(i % 4) + 1], rect[0]);
        vec2d.normalize(rect[(i % 4) + 1], rect[(i % 4) + 1]);
        vec2d.scale(rect[(i % 4) + 1], rect[(i % 4) + 1], size);
        vec2d.add(rect[(i % 4) + 1], rect[(i % 4) + 1], rect[0]);


        vec2d.rotate(rect[(i - 2 + 4) % 4 + 1], rect[(i % 4) + 1], rect[0], Math.PI);

    };

    const dragTriangleCenter = (delta, tri) => {
        let v = vec2d.sub([], tri[1], tri[0]);
        vec2d.add(tri[0], tri[0], delta);
        vec2d.add(tri[1], tri[0], v);
    };

    const dragTriangleEdge = (delta, tri) => {
        vec2d.add(tri[1], tri[1], delta);
    };

  // demo.onmousemove = (e) => {
  //   if (sel) {
  //     let mouse = [e.offsetX, e.offsetY];
  //     let [tri, ianchor] = sel;
  //     let delta = vec2d.sub([], mouse, prevMouse);
  //     prevMouse = mouse;
  //     if (ianchor == 0) {
  //       let v = vec2d.sub([], tri.oppositeVertex, tri.basePoint);
  //       vec2d.add(tri.basePoint, tri.basePoint, delta);
  //       vec2d.add(tri.oppositeVertex, tri.basePoint, v);
  //     } else {
  //       vec2d.add(tri.oppositeVertex, tri.oppositeVertex, delta);
  //     }
  //     makePts();
  //     update();
  //   }
  // };

  // demo.onmousedown = (e) => {
  //   sel = null;
  //   const mouse = [e.offsetX, e.offsetY];
  //   prevMouse = mouse;
  //   for (let tri of iso) {
  //     for (let [ianchor, p] of tri.anchors.entries()) {
  //       if (vec2d.distance(mouse, p) <= 5) {
  //         sel = [tri, ianchor];
  //       }
  //     }
  //   }
  // };

  // demo.onmouseup = () => {
  //   sel = null;
  // };
  // update();

    demo.onmousedown = (e) => {
      const mouse = [e.offsetX, e.offsetY];
      prevMouse = mouse;
      demo.onmousemove = null;

      for (let r of rect) {
          let points = [r.center].concat(r.sides);
          // console.log("points", points);
            for (let i of [0, 1, 2, 3, 4]) {
                let p = points[i];
                let d = vec2d.distance(mouse, p);
                if (d <= 5) {
                    demo.onmousemove =
                        i == 0
                            ? (e) => {
                              console.log("entrou no base");
                                dragBase(e, points);
                                update();
                            }
                            : (e) => {
                                console.log("entrou no drag");
                                dragVtx(e, i, points);
                                update();
                            };
                }
            }
      }

      for (let c of circ) {
          let circlePoints = [c.center, c.radiusControl];
          // console.log("circlepoints", circlePoints);
          for (let i of [0, 1]) {
              let p = circlePoints[i];
              let d = vec2d.distance(mouse, p);
              if (d <= 5) {
                  demo.onmousemove = (e) => {
                      let mouse = [e.offsetX, e.offsetY];
                      let delta = vec2d.sub([], mouse, prevMouse);
                      prevMouse = mouse;

                      i == 0 ? dragCircleCenter(delta, circlePoints) : dragCircleEdge(delta, circlePoints);
                      update();     
                  }
              }
          }
      }

      for (let t of iso) {
        let trianglePoints = [t.basePoint, t.oppositeVertex];
        console.log("trianglePoints", trianglePoints);
          for (let i of [0, 1]) {
              let p = trianglePoints[i];
              let d = vec2d.distance(mouse, p);
              if (d <= 5) {
                demo.onmousemove = (e) => {
                    let mouse = [e.offsetX, e.offsetY];
                    let delta = vec2d.sub([], mouse, prevMouse);
                    prevMouse = mouse;

                    i == 0 ? dragTriangleCenter(delta, trianglePoints) : dragTriangleEdge(delta, trianglePoints);
                    makePts();
                    update();     
                }
            }
          }
      }
  };

  demo.onmouseup = () => {
      demo.onmousemove = null;
  };
  update();
})();