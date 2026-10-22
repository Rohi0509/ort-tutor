/* Figures for maths questions, drawn as inline SVG so they stay sharp on phones and follow light/dark mode.
   A question (free or paid) may carry `fig`; the app shows it above the question. Text in figures can be a plain
   string or { ru, ky, en }; `figText` (set by app.js) picks the language. validateFig() checks a spec.

   Types:
   numberline  { type, min, max, points: [{ at, label }], ticks?: [numbers] }
               Points are placed by value; for "order only" questions just choose values in the right order.
   geo         { type, points: { A: [x, y], ... }, segments?: [["A","B"]], polygons?: [["A","B","C"]],
                 rays?: [["B","A"]] (from B through A, with an arrow), circles?: [{ c: "O", r }],
                 angles?: [{ at: "B", from: "A", to: "C", label?: "48°", right?: true }],
                 sides?: [{ from: "A", to: "B", label: "5 см" }], hide?: ["O"] (points without a label), dots?: true }
               Coordinates are in any units with y pointing up; the drawing is scaled to fit.
   coord       { type, xmin, xmax, ymin, ymax, step?: 1, numbers?: false,
                 points?: [{ x, y, label? }], polygons?: [[[x, y], ...]], segments?: [[[x1, y1], [x2, y2]]],
                 curves?: [{ pts: [[x, y], ...], smooth?: true, label? }] }
   table       { type, head: [text], rows: [[text]] }   (an HTML table, not SVG) */
let figText = t => (t && typeof t === "object" ? t.ru || t.ky || t.en : String(t));
const FIG_TYPES = ["numberline", "geo", "coord", "table"];

const svgEsc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const r1 = n => Math.round(n * 10) / 10;
// Letters and single variables are set in italic, as in printed maths; numbers and words stay upright.
const isVar = s => /^[A-Za-zА-Яа-я](?:[₀-₉0-9′']*)?$/.test(s);
function svgText(x, y, s, opts = {}) {
  const t = figText(s);
  const anchor = opts.anchor || "middle", cls = opts.cls || (isVar(t) ? "v" : "");
  return `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}" dominant-baseline="middle"${cls ? ` class="${cls}"` : ""}>${svgEsc(t)}</text>`;
}
const arrowDefs = `<defs><marker id="fig-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="head"/></marker></defs>`;
const wrapSvg = (w, h, body, label) => `<svg viewBox="0 0 ${r1(w)} ${r1(h)}" role="img" aria-label="${svgEsc(label)}" style="max-width:${Math.round(Math.min(w * 1.25, 420))}px">${arrowDefs}${body}</svg>`;

function figNumberline(f) {
  const W = 320, H = 64, x0 = 20, x1 = 296, y = 26;
  const X = v => x0 + (v - f.min) / (f.max - f.min) * (x1 - x0);
  let s = `<line x1="${x0 - 8}" y1="${y}" x2="${x1 + 14}" y2="${y}" marker-end="url(#fig-arrow)"/>`;
  for (const t of f.ticks || []) s += `<line x1="${r1(X(t))}" y1="${y - 4}" x2="${r1(X(t))}" y2="${y + 4}"/>` + svgText(X(t), y + 18, String(t).replace("-", "−"), { cls: "n" });
  // With tick numbers below the line, point labels go above it so the two never collide.
  const ly = (f.ticks || []).length ? y - 17 : y + 20;
  for (const p of f.points || []) s += `<line x1="${r1(X(p.at))}" y1="${y - 7}" x2="${r1(X(p.at))}" y2="${y + 7}" class="mark"/>` + svgText(X(p.at), ly, p.label);
  return wrapSvg(W, H, s, "number line");
}

function figGeo(f) {
  const names = Object.keys(f.points);
  const xs = names.map(n => f.points[n][0]), ys = names.map(n => f.points[n][1]);
  for (const c of f.circles || []) { const [cx, cy] = f.points[c.c]; xs.push(cx - c.r, cx + c.r); ys.push(cy - c.r, cy + c.r); }
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = 30, k = Math.min(260 / Math.max(maxX - minX, 1e-9), 200 / Math.max(maxY - minY, 1e-9));
  const W = (maxX - minX) * k + 2 * pad, H = (maxY - minY) * k + 2 * pad;
  const P = n => [pad + (f.points[n][0] - minX) * k, pad + (maxY - f.points[n][1]) * k];
  const cx = names.reduce((a, n) => a + P(n)[0], 0) / names.length, cy = names.reduce((a, n) => a + P(n)[1], 0) / names.length;
  let s = "";
  for (const poly of f.polygons || []) s += `<polygon points="${poly.map(n => P(n).map(r1).join(",")).join(" ")}"/>`;
  for (const [a, b] of f.segments || []) { const [ax, ay] = P(a), [bx, by] = P(b); s += `<line x1="${r1(ax)}" y1="${r1(ay)}" x2="${r1(bx)}" y2="${r1(by)}"/>`; }
  for (const [a, b] of f.rays || []) { const [ax, ay] = P(a), [bx, by] = P(b); s += `<line x1="${r1(ax)}" y1="${r1(ay)}" x2="${r1(bx)}" y2="${r1(by)}" marker-end="url(#fig-arrow)"/>`; }
  for (const c of f.circles || []) { const [ox, oy] = P(c.c); s += `<circle cx="${r1(ox)}" cy="${r1(oy)}" r="${r1(c.r * k)}"/>`; }
  for (const g of f.angles || []) {
    const [vx, vy] = P(g.at), [ax, ay] = P(g.from), [bx, by] = P(g.to);
    let a1 = Math.atan2(ay - vy, ax - vx), a2 = Math.atan2(by - vy, bx - vx);
    let d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const R = g.right ? 11 : 18;
    if (g.right) {
      const u = [Math.cos(a1), Math.sin(a1)], v = [Math.cos(a1 + d), Math.sin(a1 + d)];
      s += `<path class="arc" d="M${r1(vx + u[0] * R)} ${r1(vy + u[1] * R)} L${r1(vx + (u[0] + v[0]) * R)} ${r1(vy + (u[1] + v[1]) * R)} L${r1(vx + v[0] * R)} ${r1(vy + v[1] * R)}"/>`;
    } else {
      const e = a1 + d;
      s += `<path class="arc" d="M${r1(vx + Math.cos(a1) * R)} ${r1(vy + Math.sin(a1) * R)} A${R} ${R} 0 0 ${d > 0 ? 1 : 0} ${r1(vx + Math.cos(e) * R)} ${r1(vy + Math.sin(e) * R)}"/>`;
    }
    if (g.label) { const m = a1 + d / 2; s += svgText(vx + Math.cos(m) * (R + 14), vy + Math.sin(m) * (R + 12), g.label, { cls: "lab" }); }
  }
  for (const sd of f.sides || []) {
    const [ax, ay] = P(sd.from), [bx, by] = P(sd.to), mx = (ax + bx) / 2, my = (ay + by) / 2;
    let nx = -(by - ay), ny = bx - ax; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    if ((mx + nx - cx) ** 2 + (my + ny - cy) ** 2 < (mx - cx) ** 2 + (my - cy) ** 2) { nx = -nx; ny = -ny; }  // outside the shape
    s += svgText(mx + nx * 15, my + ny * 15, sd.label, { cls: "lab" });
  }
  for (const n of names) {
    const [x, y] = P(n);
    if (f.dots) s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="2.5" class="dot"/>`;
    if ((f.hide || []).includes(n)) continue;
    let dx = x - cx, dy = y - cy; const l = Math.hypot(dx, dy) || 1;
    s += svgText(x + dx / l * 13, y + dy / l * 13, n);
  }
  return wrapSvg(W, H, s, "figure " + names.join(""));
}

function figCoord(f) {
  const step = f.step || 1;
  const k = Math.min(280 / (f.xmax - f.xmin), 240 / (f.ymax - f.ymin));
  const pad = 22, W = (f.xmax - f.xmin) * k + 2 * pad, H = (f.ymax - f.ymin) * k + 2 * pad;
  const X = x => pad + (x - f.xmin) * k, Y = y => pad + (f.ymax - y) * k;
  let s = "";
  for (let x = Math.ceil(f.xmin / step) * step; x <= f.xmax + 1e-9; x += step) s += `<line class="grid" x1="${r1(X(x))}" y1="${r1(Y(f.ymin))}" x2="${r1(X(x))}" y2="${r1(Y(f.ymax))}"/>`;
  for (let y = Math.ceil(f.ymin / step) * step; y <= f.ymax + 1e-9; y += step) s += `<line class="grid" x1="${r1(X(f.xmin))}" y1="${r1(Y(y))}" x2="${r1(X(f.xmax))}" y2="${r1(Y(y))}"/>`;
  const ox = Math.min(Math.max(0, f.xmin), f.xmax), oy = Math.min(Math.max(0, f.ymin), f.ymax);
  s += `<line x1="${r1(X(f.xmin) - 6)}" y1="${r1(Y(oy))}" x2="${r1(X(f.xmax) + 12)}" y2="${r1(Y(oy))}" marker-end="url(#fig-arrow)"/>`;
  s += `<line x1="${r1(X(ox))}" y1="${r1(Y(f.ymin) + 6)}" x2="${r1(X(ox))}" y2="${r1(Y(f.ymax) - 12)}" marker-end="url(#fig-arrow)"/>`;
  // Axis names sit beside the arrow tips, clear of the grid; O sits below-left of the origin.
  s += svgText(X(f.xmax) + 8, Y(oy) - 13, "x") + svgText(X(ox) + 13, Y(f.ymax) - 8, "y") + svgText(X(ox) - 10, Y(oy) + 13, "O");
  if (f.numbers) {  // grid numbers, leaving out zero and the last line before each arrow
    for (let x = Math.ceil(f.xmin / step) * step; x < f.xmax - 1e-9; x += step) if (Math.abs(x) > 1e-9) s += svgText(X(x), Y(oy) + 11, String(x).replace("-", "−"), { cls: "n" });
    for (let y = Math.ceil(f.ymin / step) * step; y < f.ymax - 1e-9; y += step) if (Math.abs(y) > 1e-9) s += svgText(X(ox) - 9, Y(y), String(y).replace("-", "−"), { cls: "n", anchor: "end" });
  }
  for (const poly of f.polygons || []) s += `<polygon points="${poly.map(([x, y]) => `${r1(X(x))},${r1(Y(y))}`).join(" ")}"/>`;
  for (const [[x1, y1], [x2, y2]] of f.segments || []) s += `<line x1="${r1(X(x1))}" y1="${r1(Y(y1))}" x2="${r1(X(x2))}" y2="${r1(Y(y2))}"/>`;
  for (const c of f.curves || []) {
    const p = c.pts.map(([x, y]) => [X(x), Y(y)]);
    let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
    if (c.smooth && p.length > 2) {
      for (let i = 0; i < p.length - 1; i++) {  // Catmull-Rom through the points, as cubic Béziers
        const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
        d += ` C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
      }
    } else for (const [x, y] of p.slice(1)) d += ` L${r1(x)} ${r1(y)}`;
    s += `<path class="curve" d="${d}"/>`;
    if (c.label) { const [lx, ly] = p[p.length - 1]; s += svgText(lx + 4, ly - 10, c.label, { anchor: "start", cls: "lab" }); }
  }
  for (const pt of f.points || []) {
    s += `<circle cx="${r1(X(pt.x))}" cy="${r1(Y(pt.y))}" r="3" class="dot"/>`;
    // Labels sit on the side away from the axes: left/right of the y-axis, above/below the x-axis.
    if (pt.label) s += svgText(X(pt.x) + (pt.x < ox ? -6 : 6), Y(pt.y) + (pt.y < oy ? 13 : -11), pt.label, { anchor: pt.x < ox ? "end" : "start", cls: "lab" });
  }
  return wrapSvg(W, H, s, "coordinate plane");
}

function figTable(f) {
  return `<table class="figtable"><thead><tr>${f.head.map(h => `<th>${svgEsc(figText(h))}</th>`).join("")}</tr></thead><tbody>${f.rows.map(r => `<tr>${r.map(c => `<td>${svgEsc(figText(c))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function figHtml(f) {
  if (!f) return "";
  const body = f.type === "numberline" ? figNumberline(f) : f.type === "geo" ? figGeo(f) : f.type === "coord" ? figCoord(f) : f.type === "table" ? figTable(f) : "";
  return body ? `<figure class="fig">${body}</figure>` : "";
}

// Problems with a figure spec, in English (used by the paid-question check and tools/check.js).
function validateFig(f) {
  const errs = [], num = v => typeof v === "number" && isFinite(v), txt = v => typeof v === "string" || (v && typeof v === "object" && Object.values(v).every(x => typeof x === "string"));
  if (!f || !FIG_TYPES.includes(f.type)) return [`fig "type" must be one of ${FIG_TYPES.join(", ")}`];
  if (f.type === "numberline") {
    if (!num(f.min) || !num(f.max) || f.min >= f.max) errs.push("numberline needs min < max");
    for (const p of f.points || []) if (!num(p.at) || p.at < f.min || p.at > f.max || !txt(p.label)) errs.push("numberline point needs at (between min and max) and label");
  } else if (f.type === "geo") {
    const pts = f.points || {};
    if (!Object.keys(pts).length) errs.push("geo needs points");
    for (const [n, c] of Object.entries(pts)) if (!Array.isArray(c) || c.length !== 2 || !num(c[0]) || !num(c[1])) errs.push(`geo point ${n} must be [x, y]`);
    const has = n => Object.prototype.hasOwnProperty.call(pts, n);
    for (const list of [f.segments, f.rays, f.polygons]) for (const it of list || []) for (const n of it) if (!has(n)) errs.push(`geo refers to unknown point "${n}"`);
    for (const g of f.angles || []) for (const n of [g.at, g.from, g.to]) if (!has(n)) errs.push(`geo angle refers to unknown point "${n}"`);
    for (const sd of f.sides || []) { if (!has(sd.from) || !has(sd.to)) errs.push("geo side refers to an unknown point"); if (!txt(sd.label)) errs.push("geo side needs a label"); }
    for (const c of f.circles || []) if (!has(c.c) || !num(c.r) || c.r <= 0) errs.push("geo circle needs a known centre c and r > 0");
  } else if (f.type === "coord") {
    if (![f.xmin, f.xmax, f.ymin, f.ymax].every(num) || f.xmin >= f.xmax || f.ymin >= f.ymax) errs.push("coord needs xmin < xmax and ymin < ymax");
    if ((f.xmax - f.xmin) / (f.step || 1) > 40 || (f.ymax - f.ymin) / (f.step || 1) > 40) errs.push("coord grid is too dense: raise step");
    const pt = p => Array.isArray(p) && p.length === 2 && num(p[0]) && num(p[1]);
    for (const p of f.points || []) if (!num(p.x) || !num(p.y)) errs.push("coord point needs x and y");
    for (const poly of f.polygons || []) if (!poly.every(pt)) errs.push("coord polygon points must be [x, y]");
    for (const sg of f.segments || []) if (sg.length !== 2 || !sg.every(pt)) errs.push("coord segment must be [[x1, y1], [x2, y2]]");
    for (const c of f.curves || []) if (!Array.isArray(c.pts) || c.pts.length < 2 || !c.pts.every(pt)) errs.push("coord curve needs 2+ points [x, y]");
  } else if (f.type === "table") {
    if (!Array.isArray(f.head) || !f.head.length || !f.head.every(txt)) errs.push("table needs head cells");
    if (!Array.isArray(f.rows) || !f.rows.length || f.rows.some(r => !Array.isArray(r) || r.length !== (f.head || []).length || !r.every(c => txt(c) || num(c)))) errs.push("table rows must match the head");
  }
  return errs;
}
