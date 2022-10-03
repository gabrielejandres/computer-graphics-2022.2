/**
 *  @file
 *
 *  <p>Representacao de pontos, vetores, poli­gonos, segmentos de retas e retas.</p>
 *
 *  <p>Usamos um array com dois valores numÃ©ricos para representar,
 *  tanto um ponto em 2d quanto um vetor em 2d.</p>
 *
 *  Assim, [1, 2] pode representar tanto um ponto como um vetor:
 * <ul>
 *  <li>segmentos de reta sÃ£o representados por pares de pontos,</li>
 *  <li>retas sÃ£o representadas por um ponto e um vetor,</li>
 *  <li>polÃ­gonos sÃ£o representados por um array de pontos.</li>
 * </ul>
 *
 *  <pre>
 *  Documentation:
 *  - Ubuntu:
 *     - sudo apt install jsdoc-toolkit
 *  - MacOS:
 *     - sudo port install npm7 (or npm8)
 *     - sudo npm install -g jsdoc
 *  - jsdoc -d docUtil util2d.js
 *
 *  Requirements:
 *  - npm init
 *  - npm install gl-matrix
 *  </pre>
 *
 *  @author Paulo Roma & Claudio EsperanÃ§a
 *  @since 08/08/2022
 *  @see http://lcg.ufrj.br/cwdc/10-html5css3/circRec.html
 *  @see https://observablehq.com/@esperanc/funcoes-2d-uteis
 *  @see https://drive.google.com/file/d/13G0A6oq7iyiXrVm1_oOYFp3gwaEErzQZ/view
 *  @see http://orion.lcg.ufrj.br/gc/download/Primitivas Geometricas.pdf
 */
"use strict";

/**
 * DistÃ¢ncia entre dois pontos.
 * @param {Number[]} param0 primeiro ponto.
 * @param {Number[]} param1 segundo ponto.
 * @returns {Number} distÃ¢ncia.
 */
export function dist([x0, y0], [x1, y1]) {
  return Math.hypot(x1 - x0, y1 - y0);
}

/**
 * <p>Retorna -1, 1 ou 0 conforme a circulaÃ§Ã£o entre os pontos a, b e c seja:
 * anti-horÃ¡ria, horÃ¡ria ou nula (pontos colineares).</p>
 *
 * Observe que usamos um sistema de coordenadas onde o eixo y aponta para baixo,
 * o que faz com que o sinal do operador seja invertido.
 * @param {Number[]} a primeiro ponto.
 * @param {Number[]} b segundo ponto.
 * @param {Number[]} c terceiro ponto.
 * @returns {Number} circulaÃ§Ã£o.
 */
export function orient(a, b, c) {
  return Math.sign(
    mat3.determinant([1, a[0], a[1], 1, b[0], b[1], 1, c[0], c[1]])
  );
}

/**
 * Retorna true se e somente se dois segmentos de reta a-b e c-d se intersectam.
 * @param {Number[]} a vÃ©rtice inicial.
 * @param {Number[]} b vÃ©rtice final.
 * @param {Number[]} c vÃ©rtice inicial.
 * @param {Number[]} d vÃ©rtice final.
 * @returns {Boolean} true se e somente se dois segmentos de reta se intersectam.
 */
export function segmentsIntersect(a, b, c, d) {
  return (
    Math.abs(orient(a, b, c) - orient(a, b, d)) >= 1 &&
    Math.abs(orient(c, d, a) - orient(c, d, b)) >= 1
  );
}

/**
 * O predicado segmentsIntersectProper (a,b,c,d) retorna true somente se
 * a interseÃ§Ã£o, entre o os dois segmentos Ã© prÃ³pria,<br>
 * isto Ã©, o ponto de interseÃ§Ã£o Ã© diferente de a, b, c ou d.
 * @param {Number[]} a vÃ©rtice inicial.
 * @param {Number[]} b vÃ©rtice final.
 * @param {Number[]} c vÃ©rtice inicial.
 * @param {Number[]} d vÃ©rtice final.
 * @returns {Boolean} true somente se a interseÃ§Ã£o
 * entre o os dois segmentos Ã© prÃ³pria.
 */
export function segmentsIntersectProper(a, b, c, d) {
  return (
    Math.abs(orient(a, b, c) - orient(a, b, d)) == 2 &&
    Math.abs(orient(c, d, a) - orient(c, d, b)) == 2
  );
}

/**
 * Retorna true se e somente se o ponto p estÃ¡ dentro do polÃ­gono convexo
 * dado pelo array de pontos poly.<br>
 * O algoritmo consiste em testar a orientaÃ§Ã£o de p com relaÃ§Ã£o a todas as arestas de poly.<br>
 * Se a orientaÃ§Ã£o Ã© consistentemente positiva ou negativa, p estÃ¡ dentro de poly.
 * @param {Number[]} p ponto.
 * @param {Array<Number>} poly polÃ­gono.
 * @returns {Boolean} true.
 */
export function pointInConvexPoly(p, poly) {
  let equalsX = false;
  let equalsY = false;

  for (let i = 1; i < poly.length; i++) {
    if (poly[0][0] == poly[i][0]) equalsX = true;
    if (poly[0][1] == poly[i][1]) equalsY = true;
  }

  if (equalsX && equalsY) return false;

  let o = orient(poly[0], poly[1], p);
  for (let i = 1; i < poly.length; i++) {
    let o2 = orient(poly[i], poly[(i + 1) % poly.length], p);
    if (o2 != o) return false;
  }
  return true;
}

/**
 * <p>Assumindo que duas retas dadas por (p1,v1) e (p2,v2) se intersectam,
 * retorna o ponto de interseÃ§Ã£o entre elas.</p>
 *
 * O algoritmo consiste em usar a representaÃ§Ã£o paramÃ©trica das retas,
 * isto Ã©, p1 + tv1 = p2 + uv2, para resolver o sistema de equaÃ§Ãµes
 * e achar t e u.
 *
 * <p>Observe que, como estamos em 2D, temos duas equaÃ§Ãµes (para x e y)
 * e duas incÃ³gnitas, t e u.</p>
 *
 * @param {Number[]} p1 vÃ©rtice inicial.
 * @param {Number[]} v1 vÃ©rtice final.
 * @param {Number[]} p2 vÃ©rtice inicial.
 * @param {Number[]} v2 vÃ©rtice final.
 * @returns {Array<Number>} ponto de interseÃ§Ã£o.
 */
export function lineLineIntersection(p1, v1, p2, v2) {
  const D = v1[0] * v2[1] - v1[1] * v2[0];
  const t = (v2[1] * (p2[0] - p1[0]) + p1[1] * v2[0] - p2[1] * v2[0]) / D;
  return [p1[0] + v1[0] * t, p1[1] + v1[1] * t];
}

/**
 * Dados 2 vetores u e v, retorna o vetor u projetado sobre v.
 * @param {Number[]} u vetor.
 * @param {Number[]} v vetor.
 * @returns {Array<Number>} vetor u projetado sobre v.
 * @see <img src="../img/proj.png" width="512">
 */
export function vectorProj(u, v) {
  const vnorm = vec2.normalize([], v);
  return vec2.scale([], vnorm, vec2.dot(vnorm, u));
}

/**
 * Dada uma reta dada por p e v, retorna a distÃ¢ncia desta ao ponto q.<br>
 * O algoritmo Ã© uma aplicaÃ§Ã£o da operaÃ§Ã£o de decomposiÃ§Ã£o ortogonal.
 * @param {Number[]} q ponto.
 * @param {Number[]} p vÃ©rtice inicial.
 * @param {Number[]} v vÃ©rtice final.
 * @returns {Number} distÃ¢ncia.
 * @see <img src="../img/dist-point-line.png" width="256">
 */
export function distToLine(q, p, v) {
  const pq = vec2.sub([], q, p);
  const pqProj = vectorProj(pq, v);
  return vec2.len(vec2.sub([], pq, pqProj));
}

/**
 * <p>Dado um ponto p e um segmento de reta a-b, retorna a menor distÃ¢ncia entre p
 * e o ponto q mais prÃ³ximo contido no segmento.</p>
 *
 * <p>O algoritmo para esta funÃ§Ã£o Ã© anÃ¡logo ao usado para computar a distÃ¢ncia
 * entre um ponto e uma reta.</p>
 *
 * Se consideramos os pontos q sobre a reta de suporte do segmento,
 * o ponto mais prÃ³ximo de p pode estar entre a e b, antes de a ou depois de b.<br>
 * No primeiro caso, o resultado Ã© dado pela distÃ¢ncia Ã  reta de suporte.
 * Nos demais casos, o ponto mais prÃ³ximo Ã© a ou b, respectivamente.
 * @param {Number[]} p ponto.
 * @param {Number[]} a vÃ©rtice inicial.
 * @param {Number[]} b vÃ©rtice final.
 * @returns {Number} distÃ¢ncia.
 * @see <img src="../img/dist-point-seg.png" width="512">
 */
export function distToSegment(p, a, b) {
  const v = vec2.sub([], b, a);
  const vlen = dist(a, b);
  const vnorm = vec2.scale([], v, 1 / vlen);
  const ap = vec2.sub([], p, a);
  const t = vec2.dot(vnorm, ap);
  if (t < 0) return dist(p, a);
  if (t > vlen) return dist(p, b);
  return vec2.len(vec2.sub([], ap, vec2.scale([], vnorm, t)));
}

/**
 * Se um polÃ­gono poly Ã© dado por uma circulaÃ§Ã£o de vÃ©rtices,
 * a funÃ§Ã£o abaixo retorna sua Ã¡rea com sinal,<br>
 * isto Ã©, se a circulaÃ§Ã£o Ã© dada na ordem trigonomÃ©trica
 * (sentido contrÃ¡rio dos ponteiros do relÃ³gio),
 * entÃ£o a Ã¡rea Ã© positiva, caso contrÃ¡rio, Ã© negativa.
 *
 * <p>O algoritmo consiste em somar as Ã¡reas dos trapÃ©zios formados
 * entre as arestas do polÃ­gono e o eixo x.</p>
 * @param {Array<Number>} poly polÃ­gono.
 * @returns {Number} Ã¡rea com sinal.
 */
export function polygonArea(poly) {
  let [px, py] = poly[poly.length - 1];
  let area = 0;
  for (let [x, y] of poly) {
    area += (px - x) * (y + py);
    [px, py] = [x, y];
  }
  return area / 2;
}

/**
 * Dado um ponto p e um triÃ¢ngulo a, b, c,
 * retorna um array com as coordenadas baricÃªntricas de p.
 * @param {Number[]} p ponto.
 * @param {Number[]} a primeiro vÃ©rtice.
 * @param {Number[]} b segundo vÃ©rtice.
 * @param {Number[]} c terceiro vÃ©rtice.
 * @returns {Array<Number>} coordenadas baricÃªntricas.
 */
export function barycentric(p, a, b, c) {
  const A = polygonArea([a, b, c]);
  return [
    polygonArea([a, b, p]) / A,
    polygonArea([b, c, p]) / A,
    polygonArea([c, a, p]) / A,
  ];
}

/**
 * <p>Predicado ponto em polÃ­gono simples.</p>
 *
 * <p>Retorna true se e somente se o ponto p estÃ¡ dentro do polÃ­gono simples
 * dado pelo array de pontos poly.<br>
 * Um polÃ­gono simples Ã© formado por apenas uma circulaÃ§Ã£o de vÃ©rtices,
 * onde as arestas nÃ£o se intersectam.</p>
 *
 * <p>Nesta implementaÃ§Ã£o usamos o teorema de Jordan,
 * que diz que uma semi-reta que comeÃ§a em um ponto p
 * no interior do polÃ­gono,<br>
 * e vai atÃ© o infinito em qualquer direÃ§Ã£o,
 * deve atravessar a fronteira do polÃ­gono um nÃºmero Ã­mpar de vezes.</p>
 *
 * Ã‰ preciso um cuidado especial para tratar os vÃ©rtices do polÃ­gono.
 * Cada vÃ©rtice precisa ser considerado apenas uma vez, <br>
 * e portanto cada aresta da polÃ­gono Ã© considerada "aberta" numa extremidade
 * e "fechada" em outra extremidade.<br>
 * Se a semi-reta passa por um vÃ©rtice, precisamos distinguir os casos
 * onde ela atravessa a borda do polÃ­gono (a),<br>
 * daqueles onde ele apenas toca a borda (b).
 * @param {Number[]} p ponto.
 * @param {Array<Number>} poly polÃ­gono.
 * @returns {Boolean} true se e somente se o ponto p estÃ¡ dentro do polÃ­gono simples.
 * @see <img src="../img/point-in-poly.png" width="512">
 */
export function pointInPoly(p, poly) {
  // The y coordinate of p
  const py = p[1];
  // 1d orientation of a point's y with respect to py
  const yOrient = (p) => Math.sign(p[1] - py);
  // Number of vertices
  const n = poly.length;
  // Previous point (the last of poly) and its y orientation
  let prev = poly[n - 1];
  let prevYOr = yOrient(prev);
  // Intersection counter
  let count = 0;
  // Test all vertices
  for (let i = 0; i < n; i++) {
    const q = poly[i];
    const yOr = yOrient(q);
    if (Math.abs(yOr - prevYOr) >= 1) {
      // Point within y range of segment prev-q
      const pOr = orient(prev, q, p);
      const far = [Math.max(prev[0], q[0]) * 2, py]; // Point to the right of segment prev-q
      const farOr = orient(prev, q, far);
      if (Math.abs(pOr - farOr) == 2) {
        // segment p-far crosses segment prev-q
        if (yOr == 0) {
          // Intersection at q ?
          // Test if next endPoint on opposite y orientations
          const next = poly[(i + 1) % n];
          const nextYOr = yOrient(next);
          if (Math.abs(nextYOr - prevYOr) == 2) count++;
        } else {
          if (prevYOr != 0) count++; // Ignore intersections passing through prev
        }
      }
    }
    prevYOr = yOr;
    prev = q;
  }
  return count % 2 == 1;
}