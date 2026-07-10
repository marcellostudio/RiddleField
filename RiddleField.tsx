import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

// Embedded "All we need is love" sticker (downloaded on correct answer)
// TODO: paste your full original STICKER base64 data-URI string here, replacing
// this placeholder. It was intentionally left blank during this edit to avoid
// corrupting the long base64 data through manual re-typing/truncation.
const STICKER = ""

const HEART_D =
    "M-1 9.78C-1 8.211 -0.527 6.678 0.355 5.385C1.238 4.092 2.49 3.098 3.944 2.537C5.399 1.975 6.989 1.871 8.503 2.239C10.018 2.606 11.386 3.428 12.427 4.595C12.501 4.674 12.589 4.737 12.688 4.78C12.786 4.824 12.893 4.846 13 4.846C13.107 4.846 13.214 4.824 13.312 4.78C13.411 4.737 13.499 4.674 13.573 4.595C14.611 3.42 15.979 2.592 17.496 2.22C19.013 1.848 20.607 1.95 22.065 2.513C23.523 3.076 24.776 4.073 25.657 5.371C26.539 6.669 27.007 8.207 27 9.78C27 13.01 24.9 15.422 22.8 17.538L15.111 25.031C14.85 25.333 14.529 25.576 14.168 25.743C13.807 25.91 13.414 25.997 13.017 26C12.62 26.002 12.227 25.92 11.864 25.757C11.5 25.595 11.176 25.357 10.911 25.058L3.2 17.538C1.1 15.422 -1 13.024 -1 9.78Z"

// Inject Inter font + placeholder colour once
function useGlobalStyle() {
    useEffect(() => {
        if (typeof document === "undefined") return
        if (!document.getElementById("riddle-font")) {
            const l = document.createElement("link")
            l.id = "riddle-font"
            l.rel = "stylesheet"
            l.href =
                "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
            document.head.appendChild(l)
        }
        if (!document.getElementById("riddle-style")) {
            const s = document.createElement("style")
            s.id = "riddle-style"
            s.textContent =
                ".riddle-input::placeholder{color:rgba(0,0,0,.5);opacity:1}" +
                ".riddle-input{caret-color:#000}"
            document.head.appendChild(s)
        }
    }, [])
}

// Build a perfect circle once (no DOM measurement needed — always available
// immediately, even before layout/fonts are ready on mobile).
function buildCircle(N) {
    const cx = 13,
        cy = 13,
        r = 12.5
    const pts = []
    for (let i = 0; i < N; i++) {
        const th = Math.PI + (2 * Math.PI * i) / N
        pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)])
    }
    return pts
}

// Sample the exact heart path into N points. Requires the DOM, so this is
// only ever called from inside a useEffect (after mount), never during render.
function buildHeart(N, fallback) {
    if (typeof document === "undefined") return fallback
    try {
        const ns = "http://www.w3.org/2000/svg"
        const tmp = document.createElementNS(ns, "svg")
        tmp.style.cssText =
            "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"
        const p = document.createElementNS(ns, "path")
        p.setAttribute("d", HEART_D)
        tmp.appendChild(p)
        document.body.appendChild(tmp)
        const total = p.getTotalLength()
        const pts = []
        if (total > 0) {
            for (let i = 0; i < N; i++) {
                const pt = p.getPointAtLength((total * i) / N)
                pts.push([pt.x, pt.y])
            }
        }
        document.body.removeChild(tmp)
        return pts.length === N ? pts : fallback
    } catch (e) {
        return fallback
    }
}

const POINT_COUNT = 200

// ---------------------------------------------------------------------------
// Full-screen confetti burst — square pieces only (GitHub-contribution-graph
// style), colored from the site's background gradient palette. Bursts
// outward from a given origin point (the field itself), renders into a
// fixed, full-viewport canvas appended to document.body (so it always
// covers the whole screen). Self-contained: mounts, plays once, cleans
// itself up.
// ---------------------------------------------------------------------------

// Same hue family as the marcello.design hero background gradient, but
// with a bit more saturation/depth so the pieces stay readable against a
// background made of nearly the same tones.
const VIVID_COLORS = [
    "#E888D4", // pink/magenta
    "#A481DE", // lavender purple
    "#8B86CC", // muted periwinkle
    "#D9BE8E", // warm cream/beige
    "#B8B0A2", // warm gray
    "#B98FCB", // pale mauve
    "#8E9DCC", // blue-lavender
    "#CC96AE", // dusty rose
]

// Reusable Path2D built once from the same heart outline used for the
// button-morph animation, so confetti hearts and the button heart match.
const CONFETTI_HEART_PATH =
    typeof Path2D !== "undefined" ? new Path2D(HEART_D) : null

function fireConfetti({
    originX,
    originY,
    particleCount = 260,
    duration = 4200,
} = {}) {
    if (typeof document === "undefined") return

    const canvas = document.createElement("canvas")
    canvas.style.cssText =
        "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647;"
    document.body.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
        canvas.width = window.innerWidth * dpr
        canvas.height = window.innerHeight * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    const W = () => window.innerWidth
    const H = () => window.innerHeight

    // Origin defaults to the screen center if no coordinates are passed in,
    // but callers should pass the field's own on-screen position so the
    // explosion visibly originates from it.
    const ox = originX ?? W() / 2
    const oy = originY ?? H() / 2

    const rand = (a, b) => a + Math.random() * (b - a)

    const particles = Array.from({ length: particleCount }).map(() => {
        const angle = rand(0, Math.PI * 2)

        // Roughly a third of the pieces are deliberately "lazy" — much
        // slower and lighter, so they drift and hang in the air rather
        // than shooting out, giving the burst some depth instead of every
        // piece moving at a uniform speed.
        const isSlow = Math.random() < 0.32
        const speed = isSlow ? rand(1, 4) : rand(5, 17)

        return {
            x: ox,
            y: oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - rand(2, 7), // slight upward bias
            size: rand(5, 11),
            rotation: rand(0, Math.PI * 2),
            rotationSpeed: rand(-0.22, 0.22),
            gravity: isSlow ? rand(0.04, 0.09) : rand(0.14, 0.26),
            drag: isSlow ? rand(0.992, 0.998) : rand(0.985, 0.994),
            opacity: 1,
            // Vivid colors from the site's background palette; opacity
            // still varies per-piece (about half fully opaque, the rest
            // lighter) purely to add depth/variability to the burst.
            color: VIVID_COLORS[
                Math.floor(Math.random() * VIVID_COLORS.length)
            ],
            baseOpacity: Math.random() < 0.5 ? 1 : rand(0.4, 0.75),
            // fade-out start point varies a little per-particle so they
            // don't all disappear in lockstep at the very end
            fadeStart: rand(0.55, 0.75),
            // ~22% of pieces are little hearts mixed in with the squares
            shape: Math.random() < 0.22 ? "heart" : "square",
        }
    })

    const start = performance.now()
    let raf = 0

    const tick = (now) => {
        const elapsed = now - start
        const t = elapsed / duration

        ctx.clearRect(0, 0, W(), H())

        let anyAlive = false

        for (const p of particles) {
            // physics
            p.vx *= p.drag
            p.vy = p.vy * p.drag + p.gravity
            p.x += p.vx
            p.y += p.vy
            p.rotation += p.rotationSpeed

            // fade out over the remaining time after each particle's own
            // fadeStart point
            p.opacity =
                (t < p.fadeStart
                    ? 1
                    : Math.max(0, 1 - (t - p.fadeStart) / (1 - p.fadeStart))) *
                p.baseOpacity

            if (p.opacity > 0 && p.y < H() + 40) {
                anyAlive = true
                ctx.save()
                ctx.translate(p.x, p.y)
                ctx.rotate(p.rotation)
                ctx.globalAlpha = p.opacity
                ctx.fillStyle = p.color

                if (p.shape === "heart" && CONFETTI_HEART_PATH) {
                    // The heart path's native coordinate space is roughly
                    // 26x26 (same as the button icon), centered around
                    // (13, 14) — scale it down to the particle's size and
                    // re-center it on the particle's own origin.
                    const scale = p.size / 20
                    ctx.scale(scale, scale)
                    ctx.translate(-13, -14)
                    ctx.fill(CONFETTI_HEART_PATH)
                } else {
                    // Square pieces, GitHub-contribution-graph style —
                    // slightly rounded corners read better at small sizes
                    // than hard right angles.
                    const s = p.size
                    const r = s * 0.18
                    ctx.beginPath()
                    ctx.moveTo(-s / 2 + r, -s / 2)
                    ctx.arcTo(s / 2, -s / 2, s / 2, s / 2, r)
                    ctx.arcTo(s / 2, s / 2, -s / 2, s / 2, r)
                    ctx.arcTo(-s / 2, s / 2, -s / 2, -s / 2, r)
                    ctx.arcTo(-s / 2, -s / 2, s / 2, -s / 2, r)
                    ctx.closePath()
                    ctx.fill()
                }
                ctx.restore()
            }
        }

        if (elapsed < duration && anyAlive) {
            raf = requestAnimationFrame(tick)
        } else {
            window.removeEventListener("resize", resize)
            canvas.remove()
        }
    }

    raf = requestAnimationFrame(tick)
}

export default function RiddleField(props) {
    const answer = props.correctAnswer || "love"
    const sticker = props.stickerUrl || STICKER

    useGlobalStyle()

    // Circle is available synchronously on first render — the button outline
    // is therefore never blank on mount, even on mobile.
    const circleRef = useRef(buildCircle(POINT_COUNT))
    const [heart, setHeart] = useState(null)

    useEffect(() => {
        let cancelled = false
        const id = requestAnimationFrame(() => {
            if (cancelled) return
            setHeart(buildHeart(POINT_COUNT, circleRef.current))
        })
        return () => {
            cancelled = true
            cancelAnimationFrame(id)
        }
    }, [])

    const [value, setValue] = useState("")
    const [status, setStatus] = useState("idle") // idle | correct | wrong
    const [morph, setMorph] = useState(0)
    const [labelW, setLabelW] = useState(150)
    const [strokeColor, setStrokeColor] = useState("#000")
    const labelRef = useRef(null)
    const morphRef = useRef(0)
    const raf = useRef(0)
    const cycleRef = useRef({ interval: 0, timeout: 0 })

    // Briefly alternates the field's 1px outline (border pill + button
    // icon) through the vivid confetti colors — quick flashes, e.g. black
    // -> pink -> green-ish/blue -> ... — for a couple of seconds, then
    // settles back to black. Runs alongside the confetti burst.
    const startStrokeColorCycle = () => {
        clearInterval(cycleRef.current.interval)
        clearTimeout(cycleRef.current.timeout)
        let i = 0
        cycleRef.current.interval = window.setInterval(() => {
            setStrokeColor(VIVID_COLORS[i % VIVID_COLORS.length])
            i++
        }, 90)
        cycleRef.current.timeout = window.setTimeout(() => {
            clearInterval(cycleRef.current.interval)
            setStrokeColor("#000")
        }, 1900)
    }

    useEffect(
        () => () => {
            clearInterval(cycleRef.current.interval)
            clearTimeout(cycleRef.current.timeout)
        },
        []
    )

    const [pos, setPos] = useState({ x: 0, y: 0 })
    const dragRef = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        baseX: 0,
        baseY: 0,
    })
    const wrapperRef = useRef(null)

    useLayoutEffect(() => {
        if (labelRef.current) {
            const w = labelRef.current.getBoundingClientRect().width
            if (w && Math.abs(w - labelW) > 0.5) setLabelW(w)
        }
    })

    useEffect(() => () => cancelAnimationFrame(raf.current), [])

    const animate = (target) => {
        cancelAnimationFrame(raf.current)
        const start = morphRef.current,
            t0 = performance.now(),
            dur = 560
        const ease = (p) =>
            p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
        const step = (now) => {
            const p = Math.min(1, (now - t0) / dur)
            const m = start + (target - start) * ease(p)
            morphRef.current = m
            setMorph(m)
            if (p < 1) raf.current = requestAnimationFrame(step)
        }
        raf.current = requestAnimationFrame(step)
    }

    const onInput = (e) => {
        let v = e.target.value
        if (v) v = v.charAt(0).toUpperCase() + v.slice(1)
        if (status !== "idle") {
            animate(0)
            setStatus("idle")
            clearInterval(cycleRef.current.interval)
            clearTimeout(cycleRef.current.timeout)
            setStrokeColor("#000")
        }
        setValue(v)
    }

    const download = () => {
        const a = document.createElement("a")
        a.href = sticker
        a.download = "marcello.design.png"
        document.body.appendChild(a)
        a.click()
        a.remove()
    }

    const onSubmit = () => {
        if (status === "correct") {
            download()
            return
        }
        const t = String(answer).trim().toLowerCase()
        const a = value.trim().toLowerCase()
        if (a && a === t) {
            setStatus("correct")
            animate(1)
            startStrokeColorCycle()
            // Fire the confetti explosion from the field's own on-screen
            // position, so the burst visibly originates from it rather
            // than from the center of the screen.
            const rect = wrapperRef.current?.getBoundingClientRect()
            fireConfetti({
                originX: rect ? rect.left + rect.width / 2 : undefined,
                originY: rect ? rect.top + rect.height / 2 : undefined,
            })
        } else {
            setStatus("wrong")
        }
    }

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            onSubmit()
        }
    }

    const pathFor = (m) => {
        const circle = circleRef.current
        const target = heart || circle
        let d = "M"
        for (let i = 0; i < POINT_COUNT; i++) {
            const a = circle[i],
                b = target[i]
            const x = a[0] + (b[0] - a[0]) * m
            const y = a[1] + (b[1] - a[1]) * m
            d += (i ? "L" : "") + x.toFixed(2) + " " + y.toFixed(2) + " "
        }
        return d + "Z"
    }

    const buildBorder = (lw) => {
        const W = 240,
            H = 50,
            inset = 0.5
        const r = H / 2 - inset
        const cy = H / 2
        const leftC = H / 2,
            rightC = W - H / 2
        const top = inset,
            bottom = H - inset
        const labelLeft = 16,
            pad = 6
        const gapL = labelLeft - pad
        const gapR = labelLeft + lw + pad
        const dx = gapL - leftC
        const dy = -Math.sqrt(Math.max(0, r * r - dx * dx))
        const gapLY = cy + dy
        return (
            `M ${gapR.toFixed(2)} ${top} L ${rightC} ${top}` +
            ` A ${r} ${r} 0 0 1 ${rightC} ${bottom}` +
            ` L ${leftC} ${bottom}` +
            ` A ${r} ${r} 0 0 1 ${gapL} ${gapLY.toFixed(2)}`
        )
    }

    const feedback =
        status === "correct"
            ? "Correct! Love is all we need. Download it."
            : status === "wrong"
              ? "Try again"
              : "\u00A0"

    const m = morph

    return (
        <div
            ref={wrapperRef}
            style={{
                fontFamily: "Inter, sans-serif",
                width: 252,
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                touchAction: "none",
                cursor: "grab",
            }}
            onPointerDown={(e) => {
                e.currentTarget.setPointerCapture?.(e.pointerId)
                dragRef.current = {
                    dragging: true,
                    startX: e.clientX,
                    startY: e.clientY,
                    baseX: pos.x,
                    baseY: pos.y,
                }
            }}
            onPointerMove={(e) => {
                if (!dragRef.current.dragging) return
                const dx = e.clientX - dragRef.current.startX
                const dy = e.clientY - dragRef.current.startY
                setPos({
                    x: dragRef.current.baseX + dx,
                    y: dragRef.current.baseY + dy,
                })
            }}
            onPointerUp={(e) => {
                dragRef.current.dragging = false
                e.currentTarget.releasePointerCapture?.(e.pointerId)
            }}
            onPointerCancel={() => {
                dragRef.current.dragging = false
            }}
        >
            <div style={{ position: "relative", width: 240, height: 50 }}>
                <svg
                    viewBox="0 0 240 50"
                    width={240}
                    height={50}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        overflow: "visible",
                        display: "block",
                        pointerEvents: "none",
                    }}
                >
                    <path
                        d={buildBorder(labelW)}
                        stroke={strokeColor}
                        strokeWidth={1}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span
                    ref={labelRef}
                    style={{
                        position: "absolute",
                        left: 16,
                        top: -4,
                        fontSize: 10,
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                        color: "#000",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                    }}
                >
                    Give it away to have{" "}
                    <span style={{ fontWeight: 600 }}>more</span>. What is it?
                </span>
                <input
                    className="riddle-input"
                    type="text"
                    value={value}
                    onChange={onInput}
                    onKeyDown={onKeyDown}
                    onPointerDown={(e) => {
                        e.stopPropagation()
                    }}
                    placeholder="Type the answer"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="text"
                    style={{
                        position: "absolute",
                        left: 16,
                        right: 46,
                        top: "50%",
                        transform: "translateY(calc(-50% + 1px))",
                        width: "auto",
                        height: 20,
                        lineHeight: "20px",
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 16,
                        WebkitTextSizeAdjust: "100%",
                        fontWeight: 400,
                        letterSpacing: 0,
                        color: "#000",
                        caretColor: "#000",
                        padding: 0,
                        margin: 0,
                        zIndex: 2,
                        pointerEvents: "auto",
                        cursor: "text",
                        WebkitUserSelect: "text",
                        userSelect: "text",
                        touchAction: "manipulation",
                    }}
                />
                <button
                    type="button"
                    onClick={onSubmit}
                    onPointerDown={(e) => {
                        e.stopPropagation()
                    }}
                    aria-label={
                        status === "correct" ? "Download" : "Submit answer"
                    }
                    style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 26,
                        height: 26,
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        touchAction: "manipulation",
                        display: "grid",
                        placeItems: "center",
                    }}
                >
                    <svg
                        viewBox="0 0 26 26"
                        width={26}
                        height={26}
                        style={{ display: "block", overflow: "visible" }}
                    >
                        <path
                            d={pathFor(m)}
                            stroke={strokeColor}
                            strokeWidth={1}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <g
                            transform={`translate(0 ${m * 1.25}) rotate(${
                                m * 90
                            } 13 13)`}
                            stroke={strokeColor}
                            strokeWidth={1}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1={7.75} y1={13} x2={18.25} y2={13} />
                            <polyline points="13,7.75 18.25,13 13,18.25" />
                        </g>
                    </svg>
                </button>
            </div>
            <div
                style={{
                    minHeight: 13,
                    marginTop: 5,
                    marginLeft: 16,
                    fontSize: 10,
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    color: "#000",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                }}
            >
                {feedback}
            </div>
        </div>
    )
}

RiddleField.defaultProps = { correctAnswer: "love", stickerUrl: "" }

addPropertyControls(RiddleField, {
    correctAnswer: {
        type: ControlType.String,
        title: "Answer",
        defaultValue: "love",
    },
    stickerUrl: {
        type: ControlType.String,
        title: "Sticker URL",
        placeholder: "embedded",
        defaultValue: "",
    },
})
