"use client";

import { useEffect, useRef } from "react";
import styles from "./CatWidget.module.css";

// Ported from cat-widget.html. The drawing, numbers and timings are unchanged;
// the script now runs inside an effect and tears itself down on unmount.

type Pose = {
  body: number[];
  tail: number[];
  tw: number;
  hx: number;
  hy: number;
  hr: number;
  hs: number;
};

const SIT: Pose = {
  // The bottom-left corner was a bulge that read as a foot; it's now a plain curve.
  body: [96, 110, 86, 150, 80, 195, 76, 236, 74, 256, 78, 276, 96, 282, 110, 286, 180, 294, 222, 292, 246, 280, 252, 252, 246, 222, 240, 175, 228, 138, 200, 118, 170, 96, 120, 96, 96, 110],
  tail: [104, 322, 140, 328, 190, 330, 220, 312, 232, 304, 238, 294, 236, 284],
  tw: 18,
  hx: 150,
  hy: 130,
  hr: 0,
  hs: 1,
};

const SHOULDER = { x: 92, y: 190 }; // in drawing units
const REST = 12;
const RAISED = 150;
const RETURN_MS = 320; // swinging the arm back down after a swat
const ARM_FADE_MS = 90;
const PAW = 72; // paw distance from the shoulder
const MAXLEN = 1.3; // how far the leg can stretch
const RANGE = 165;
const NEAR = 175;
const FAR = 215;

const clone = (p: Pose): Pose => JSON.parse(JSON.stringify(p));
const round1 = (n: number) => Math.round(n * 10) / 10;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const overshoot = (t: number) => {
  const c = 2.2;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function pathD(a: number[], close = false) {
  let d = "M" + a[0] + " " + a[1];
  for (let i = 2; i < a.length; i += 6) d += " C" + a.slice(i, i + 6).join(" ");
  return close ? d + " Z" : d;
}

export default function CatWidget() {
  const catRef = useRef<HTMLDivElement>(null);
  const toyRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cat = catRef.current;
    const toy = toyRef.current;
    const hit = hitRef.current;
    if (!cat || !toy || !hit) return;

    const svgEl = cat.querySelector("svg")!;
    const part = <T extends SVGElement>(name: string) =>
      cat.querySelector<T>(`[data-part="${name}"]`)!;
    const el = {
      body: part("body"),
      tail: part("tail"),
      head: part("head"),
      pl: part("pl"),
      pr: part("pr"),
      arm: part("arm"),
    };
    const eyes = Array.from(cat.querySelectorAll<SVGCircleElement>("[data-eye]"));
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    const frames = new Set<number>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const raf = (fn: FrameRequestCallback) => {
      const id = requestAnimationFrame((now) => {
        frames.delete(id);
        if (!disposed) fn(now);
      });
      frames.add(id);
    };
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });

    const cur = clone(SIT);
    let tilt = 0;
    let tiltGoal = 0;
    let state: "idle" | "swiping" = "idle";
    let last = 0;
    let gen = 0;
    let agitation = 0;
    let agitationGoal = 0;
    let phase = 0;
    let prev = performance.now();

    function render(now: number) {
      const dt = Math.min(50, now - prev);
      prev = now;
      tilt += (tiltGoal - tilt) * 0.12;
      agitation += (agitationGoal - agitation) * 0.06;
      // the tail tip flicks faster and wider the closer the mouse is
      phase += (dt / 1000) * (1.2 + agitation * 7);
      const w = reduce ? 0 : Math.sin(phase) * (3 + agitation * 9);
      // The path starts at the free tip and ends where it joins the body, so
      // only the start moves; the end stays put and the tail stays attached.
      const tail = cur.tail.slice();
      tail[0] += w * 1.3;
      tail[1] -= w * 0.9;
      tail[2] += w;
      tail[3] -= w * 0.6;
      tail[4] += w * 0.4;
      tail[5] -= w * 0.3;
      el.body.setAttribute("d", pathD(cur.body.map(round1), true));
      el.tail.setAttribute("d", pathD(tail.map(round1)));
      el.tail.setAttribute("stroke-width", String(round1(cur.tw)));
      el.head.setAttribute(
        "transform",
        `translate(${round1(cur.hx)} ${round1(cur.hy)}) rotate(${round1(cur.hr + tilt)}) scale(${cur.hs.toFixed(3)}) translate(-150 -130)`,
      );
      raf(render);
    }
    raf(render);

    function tween(target: Pose, ms: number, ease = easeInOut) {
      const my = gen;
      const from = clone(cur);
      const to = clone(target);
      const t0 = performance.now();
      return new Promise<void>((done) => {
        const step = (now: number) => {
          if (my !== gen) return done();
          const t = Math.min(1, (now - t0) / ms);
          const k = ease(t);
          (Object.keys(to) as (keyof Pose)[]).forEach((key) => {
            const a = from[key];
            const b = to[key];
            if (Array.isArray(b)) {
              (cur[key] as number[]) = b.map((v, i) => (a as number[])[i] + (v - (a as number[])[i]) * k);
            } else {
              (cur[key] as number) = (a as number) + (b - (a as number)) * k;
            }
          });
          if (t < 1) raf(step);
          else done();
        };
        step(t0);
      });
    }

    // Convert between screen pixels and the drawing's own coordinates.
    const box = () => svgEl.getBoundingClientRect();
    const toView = (x: number, y: number) => {
      const r = box();
      return { x: ((x - r.left) / r.width) * 440 - 80, y: ((y - r.top) / r.height) * 400 - 20 };
    };
    const toScreen = (vx: number, vy: number) => {
      const r = box();
      return { x: r.left + ((vx + 80) / 440) * r.width, y: r.top + ((vy + 20) / 400) * r.height };
    };

    const arm = { rot: REST, len: 1 };
    const drawArm = () =>
      el.arm.setAttribute(
        "transform",
        `translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${arm.rot.toFixed(1)}) scale(1 ${arm.len.toFixed(3)})`,
      );
    function swing(
      rot: number,
      len: number,
      ms: number,
      ease: (t: number) => number,
      onFrame?: () => void,
    ) {
      const my = gen;
      const r0 = arm.rot;
      const l0 = arm.len;
      const t0 = performance.now();
      if (reduce) ms = 1;
      return new Promise<void>((done) => {
        const step = (now: number) => {
          if (my !== gen) return done();
          const t = Math.min(1, (now - t0) / ms);
          const k = ease(t);
          arm.rot = r0 + (rot - r0) * k;
          arm.len = l0 + (len - l0) * k;
          drawArm();
          onFrame?.();
          if (t < 1) raf(step);
          else done();
        };
        step(t0);
      });
    }

    // The leg points straight down at rotate(0); rotating clockwise swings the paw to the left and up.
    function where(x: number, y: number) {
      const v = toView(x, y);
      const dx = v.x - SHOULDER.x;
      const dy = v.y - SHOULDER.y;
      let r = (Math.atan2(-dx, dy) * 180) / Math.PI;
      if (r < 0) r += 360;
      return { rot: r, dist: Math.hypot(dx, dy) };
    }
    // Only swat at things that are really within reach of the paw, in front of the cat.
    function inReach(x: number, y: number, slack = 14) {
      const w = where(x, y);
      return w.rot >= 20 && w.rot <= 175 && w.dist <= PAW * MAXLEN + slack;
    }
    function pawScreen() {
      const a = (arm.rot * Math.PI) / 180;
      const L = 72 * arm.len;
      return toScreen(SHOULDER.x - Math.sin(a) * L, SHOULDER.y + Math.cos(a) * L);
    }
    function look(x: number, y: number) {
      const r = cat!.getBoundingClientRect();
      const hx = r.left + r.width * 0.55;
      const hy = r.top + r.height * 0.25;
      const up = (Math.atan2(-(y - hy), -(x - hx)) * 180) / Math.PI;
      tiltGoal = Math.max(-16, Math.min(10, (up - 45) * 0.4));
      const a = (-(cur.hr + tilt) * Math.PI) / 180;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      eyes.forEach((e, i) => {
        const b = e.getBoundingClientRect();
        const ex = b.left + b.width / 2;
        const ey = b.top + b.height / 2;
        const vx = x - ex;
        const vy = y - ey;
        const d = Math.hypot(vx, vy) || 1;
        const lx = (vx * ca - vy * sa) / d;
        const ly = (vx * sa + vy * ca) / d;
        const m = Math.min(5, d / 25);
        [el.pl, el.pr][i].setAttribute("transform", `translate(${(lx * m).toFixed(2)} ${(ly * m).toFixed(2)})`);
      });
    }

    function burst() {
      const p = pawScreen();
      hit!.style.left = p.x + "px";
      hit!.style.top = p.y + "px";
      hit!.animate(
        [
          { opacity: 1, transform: "scale(.5) rotate(0deg)" },
          { opacity: 0, transform: "scale(1.25) rotate(12deg)" },
        ],
        { duration: 280, easing: "ease-out" },
      );
    }

    let px = -1e4;
    let py = -1e4;
    const distance = () => {
      const s = toScreen(SHOULDER.x, SHOULDER.y);
      return Math.hypot(px - s.x, py - s.y);
    };

    async function strike() {
      await swing(RAISED, 0.9, 150, easeInOut); // paw up by the face
      const w = where(px, py);
      const target = Math.max(22, Math.min(170, w.rot));
      const len = Math.max(0.9, Math.min(MAXLEN, w.dist / PAW));
      await swing(target - 6, len, 110, easeOut); // slash so the paw lands on the cursor
      if (inReach(px, py, 22)) {
        if (!reduce) burst();
        if (yarnOn) knock();
      }
      await swing(target + 6, Math.max(0.9, len - 0.12), 90, easeInOut); // little recoil
    }
    const showArm = () => {
      el.arm.style.transition = "none";
      el.arm.style.opacity = "1";
    };
    const hideArm = () => {
      el.arm.style.transition = `opacity ${ARM_FADE_MS}ms ease-out`;
      el.arm.style.opacity = "0";
    };

    async function swipe() {
      if (state !== "idle") return;
      state = "swiping";
      gen++;
      cat!.classList.add(styles.alert);
      // The arm only shows while swatting; at rest it's hidden.
      showArm();
      tween({ ...clone(SIT), hr: -6 }, 200);
      await strike();
      if (inReach(px, py) && Math.random() < 0.7) {
        await wait(40);
        await strike();
      }
      await wait(120);
      tween(SIT, 300);
      // Fade the arm out once it's halfway down instead of letting it hang
      // there. (By angle, not time: the swing covers most of the way early.)
      const halfway = (arm.rot + REST) / 2;
      let hidden = false;
      await swing(REST, 1, RETURN_MS, overshoot, () => {
        if (!hidden && arm.rot <= halfway) {
          hidden = true;
          hideArm();
        }
      });
      if (!hidden) hideArm();
      last = Date.now();
      state = "idle";
    }

    // ---- the cursor turns into a ball of yarn near the cat ----
    let yarnOn = false;
    let kx = 0;
    let ky = 0;
    let vx = 0;
    let vy = 0;
    let spin = 0;
    let spinV = 0;
    let lastX = 0;
    function setYarn(on: boolean) {
      if (on === yarnOn) return;
      yarnOn = on;
      toy!.classList.toggle(styles.toyOn, on);
      root.classList.toggle("yarn", on);
    }
    function knock() {
      // push the ball away from the paw, the way the paw was moving, and spin it
      const s = toScreen(SHOULDER.x, SHOULDER.y);
      const dx = px - s.x;
      const dy = py - s.y;
      const d = Math.hypot(dx, dy) || 1;
      vx += (dx / d) * 9 - 2;
      vy += (dy / d) * 6 - 5;
      spinV += -22;
    }
    const yarnLoop = () => {
      // a springy offset that throws the ball off and brings it back under the pointer
      vx += -kx * 0.12;
      vy += -ky * 0.12;
      vx *= 0.78;
      vy *= 0.78;
      kx += vx;
      ky += vy;
      spin += spinV + (px - lastX) * 2;
      spinV *= 0.9;
      lastX = px;
      toy!.style.transform = `translate(${(px + kx).toFixed(1)}px,${(py + ky).toFixed(1)}px) rotate(${spin.toFixed(1)}deg)`;
      raf(yarnLoop);
    };
    yarnLoop();

    const onWindowPointerLeave = () => setYarn(false);
    const onDocumentMouseLeave = () => setYarn(false);
    const onDocumentPointerLeave = () => {
      agitationGoal = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      look(px, py);
      const d = distance();
      agitationGoal = Math.max(0, Math.min(1, 1 - (d - RANGE) / 300));
      if (state === "idle") cat.classList.toggle(styles.alert, d < RANGE + 120);
      if (e.pointerType === "mouse") setYarn(yarnOn ? d < FAR : d < NEAR);
      if (e.pointerType === "mouse" && inReach(px, py) && Date.now() - last > 500) swipe();
    };

    // Touch: tap near the cat and it swats at your finger.
    let yarnTimer: ReturnType<typeof setTimeout> | undefined;
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      px = e.clientX;
      py = e.clientY;
      look(px, py);
      if (distance() < NEAR) {
        setYarn(true);
        clearTimeout(yarnTimer);
        yarnTimer = setTimeout(() => setYarn(false), 1600);
      }
      if (inReach(px, py, 40)) swipe();
    };

    window.addEventListener("pointerleave", onWindowPointerLeave);
    document.addEventListener("mouseleave", onDocumentMouseLeave);
    document.addEventListener("pointerleave", onDocumentPointerLeave);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    // A slow happy blink now and then.
    (async () => {
      while (!disposed) {
        await wait(3000 + Math.random() * 3500);
        if (disposed) return;
        if (state !== "idle" || cat.classList.contains(styles.alert)) continue;
        cat.classList.add(styles.happy);
        await wait(160);
        cat.classList.remove(styles.happy);
        if (Math.random() < 0.5) {
          await wait(200);
          cat.classList.add(styles.happy);
          await wait(900);
          cat.classList.remove(styles.happy);
        }
      }
    })();

    // calm down when the mouse sits still
    const calm = setInterval(() => {
      if (state === "idle" && agitationGoal > 0) agitationGoal *= 0.9;
    }, 600);

    return () => {
      disposed = true;
      gen++;
      frames.forEach(cancelAnimationFrame);
      timers.forEach(clearTimeout);
      clearTimeout(yarnTimer);
      clearInterval(calm);
      window.removeEventListener("pointerleave", onWindowPointerLeave);
      document.removeEventListener("mouseleave", onDocumentMouseLeave);
      document.removeEventListener("pointerleave", onDocumentPointerLeave);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      root.classList.remove("yarn");
    };
  }, []);

  return (
    <>
      <div ref={catRef} className={styles.kitty} aria-hidden="true">
        <svg viewBox="-80 -20 440 400">
          <defs>
            <clipPath id="kitty-eyeclip">
              <circle cx="121" cy="66" r="13" />
              <circle cx="158" cy="96" r="13" />
            </clipPath>
          </defs>
          <g>
            <path data-part="tail" fill="none" stroke="#000" strokeLinecap="round" />
            <path data-part="body" fill="#000" />
            <g
              data-part="arm"
              transform="translate(92 190) rotate(12)"
              style={{ opacity: 0 }}
            >
              <circle r="12" fill="#000" />
              <path d="M-12 0 C-12 28 -10 52 -9 68 L9 68 C10 52 12 28 12 0 Z" fill="#000" />
              {/* Cartoon paw: a round mitten with three puffy toes making a
                  scalloped edge, toe beans and a heart-shaped main pad. */}
              <g transform="translate(0 74) scale(1.15) translate(0 -74)">
                <ellipse cx="0" cy="74" rx="14.5" ry="12" fill="#000" />
                <circle cx="-9" cy="81.5" r="6.4" fill="#000" />
                <circle cx="0" cy="85" r="6.8" fill="#000" />
                <circle cx="9" cy="81.5" r="6.4" fill="#000" />
                <g fill="#B9A2FF">
                  <ellipse cx="-8.8" cy="82" rx="2.9" ry="3.4" transform="rotate(-18 -8.8 82)" />
                  <ellipse cx="0" cy="85.6" rx="3" ry="3.5" />
                  <ellipse cx="8.8" cy="82" rx="2.9" ry="3.4" transform="rotate(18 8.8 82)" />
                  <path d="M0 67 C5 67 8.2 70.6 8.2 73.6 C8.2 76.2 5.6 77.4 3.4 76.6 C1.9 76.1 1 75.8 0 75.8 C-1 75.8 -1.9 76.1 -3.4 76.6 C-5.6 77.4 -8.2 76.2 -8.2 73.6 C-8.2 70.6 -5 67 0 67 Z"
                    transform="rotate(180 0 72)"
                  />
                </g>
              </g>
            </g>
            <g data-part="head">
              <path
                d="M88 110 C78 90 78 62 92 46 C104 32 122 26 140 26 L169 8 C176 4 183 7 182 14 L180 52 C192 58 204 64 214 68 L235 72 C243 73 245 80 239 84 L214 104 C212 124 196 140 170 146 C140 152 104 136 88 110 Z"
                fill="#000"
              />
              <g className={styles.open}>
                <circle data-eye cx="121" cy="66" r="13" fill="#FFFFFF" />
                <circle data-eye cx="158" cy="96" r="13" fill="#FFFFFF" />
                <g clipPath="url(#kitty-eyeclip)" fill="#000">
                  <g data-part="pl">
                    <circle className={styles.pupil} cx="121" cy="66" r="7.6" />
                    <circle cx="123.6" cy="63" r="2.2" fill="#FFFFFF" />
                  </g>
                  <g data-part="pr">
                    <circle className={styles.pupil} cx="158" cy="96" r="7.6" />
                    <circle cx="160.6" cy="93" r="2.2" fill="#FFFFFF" />
                  </g>
                </g>
              </g>
              <g className={styles.closed} fill="none" stroke="#FFFFFF" strokeWidth="3.6" strokeLinecap="round">
                <path d="M110 70 Q121 57 132 70" />
                <path d="M147 100 Q158 87 169 100" />
              </g>
              <g fill="none" style={{ stroke: "var(--rim)" }} strokeWidth="1.6" strokeLinecap="round" opacity=".9">
                <path d="M100 58 Q70 40 40 32" />
                <path d="M98 64 Q68 58 36 58" />
                <path d="M194 128 Q212 138 228 152" />
                <path d="M190 133 Q204 146 214 160" />
              </g>
            </g>
          </g>
        </svg>
      </div>
      <div ref={toyRef} className={styles.toy} aria-hidden="true">
        <svg viewBox="-24 -24 48 48">
          <circle r="20" fill="#B9A2FF" />
          <g fill="none" stroke="#6D4FD1" strokeWidth="2.2" strokeLinecap="round">
            <path d="M-17 -8 Q0 -2 15 -12" />
            <path d="M-19 2 Q0 8 18 -3" />
            <path d="M-14 13 Q2 16 13 14" />
            <path d="M-6 -19 Q-13 0 -4 19" />
            <path d="M6 -19 Q13 -2 8 18" />
          </g>
          <path d="M12 15 Q20 22 16 28" fill="none" stroke="#B9A2FF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div ref={hitRef} className={styles.hit} aria-hidden="true">
        <svg viewBox="-23 -23 46 46" fill="none" stroke="#B9A2FF" strokeWidth="2.6" strokeLinecap="round">
          <path d="M-9 -9 L-17 -17" />
          <path d="M0 -12 L0 -21" />
          <path d="M9 -9 L17 -17" />
          <path d="M12 0 L21 0" />
          <path d="M-12 0 L-21 0" />
        </svg>
      </div>
    </>
  );
}
