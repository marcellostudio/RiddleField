import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

// Embedded "All we need is love" sticker (downloaded on correct answer)
const STICKER =
    "data:image/png;base64,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"

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
            // black caret on all devices (overrides mobile default blue cursor),
            // 16px font-size in the media query block prevents iOS auto-zoom-on-focus
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

export default function RiddleField(props) {
    const answer = props.correctAnswer || "love"
    const sticker = props.stickerUrl || STICKER

    useGlobalStyle()

    // Circle is available synchronously on first render — the button outline
    // is therefore never blank on mount, even on mobile.
    const circleRef = useRef(buildCircle(POINT_COUNT))
    const [heart, setHeart] = useState(null)

    // Sample the heart only after mount, once the DOM/layout is reliably
    // ready. This replaces the old in-render DOM hack that could silently
    // fail on first paint on mobile and only "fix itself" after a re-render.
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
    const labelRef = useRef(null)
    const morphRef = useRef(0)
    const raf = useRef(0)

    // Custom drag — same approach as the clock component: handled entirely
    // here, started only from the outer wrapper. The input and button each
    // call e.stopPropagation() on their own onPointerDown (already in
    // place below), so a drag can never start from clicking/tapping into
    // them — only from the border, label, background, or feedback text.
    // IMPORTANT: turn OFF the native "Drag" toggle for this layer in
    // Framer's right-hand panel — Framer's own drag listener sits outside
    // this component and fights with ours if both are active.
    const [pos, setPos] = useState({ x: 0, y: 0 })
    const dragRef = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        baseX: 0,
        baseY: 0,
    })

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

    // Morphing button outline (circle -> exact heart)
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

    // Pill outline (240x50) with a real gap around the floating label
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
                        stroke="#000"
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
                        // Prevent Framer's drag-to-move from grabbing the
                        // pointer when the person just wants to tap/click
                        // into the field and type.
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
                        // 16px prevents iOS Safari from auto-zooming the
                        // page on focus on tap — that zoom is what made the
                        // field feel "broken" on mobile (label/button jump
                        // out of place). 2px larger than desktop's 14px but
                        // barely noticeable, and worth it for usability.
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
                        // Same fix as the input: keep Framer's drag from
                        // starting here so the click reliably reaches the
                        // submit/download action instead.
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
                            stroke="#000"
                            strokeWidth={1}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <g
                            transform={`translate(0 ${m * 1.25}) rotate(${
                                m * 90
                            } 13 13)`}
                            stroke="#000"
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
