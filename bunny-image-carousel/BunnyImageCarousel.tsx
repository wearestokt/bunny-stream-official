import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

export type BunnyCarouselItem = {
    /** Bunny Stream video id (thumbnail from CDN when set with Library ID). */
    videoId?: string
    title?: string
    /** Optional still; wins over Bunny thumbnail when set (e.g. CMS image field). */
    image?: string | { src?: string }
}

/** Same CDN rules as BunnyVideoPlayer (`thumbnail_1.jpg`). Inlined so this file has no local imports. */
function getThumbnailUrlForCarousel(
    libraryId: string,
    videoId: string,
    pullZoneHostname?: string
): string {
    const raw = pullZoneHostname?.trim()
    if (raw) {
        const host = raw.replace(/^https?:\/\//, "").split("/")[0].trim()
        return `https://${host}/${videoId}/thumbnail_1.jpg`
    }
    return `https://vz-${libraryId}.b-cdn.net/${videoId}/thumbnail_1.jpg`
}

function coerceImageField(v: BunnyCarouselItem["image"]): string {
    if (typeof v === "string") return v.trim()
    if (v && typeof v === "object" && "src" in v) {
        const s = (v as { src?: string }).src
        return typeof s === "string" ? s.trim() : ""
    }
    return ""
}

function slideImageUrl(
    item: BunnyCarouselItem,
    libraryId: string,
    pullZoneHostname?: string
): string {
    const img = coerceImageField(item.image)
    if (img) return img
    const vid = item.videoId?.trim()
    const lib = libraryId?.trim()
    if (vid && lib) return getThumbnailUrlForCarousel(lib, vid, pullZoneHostname)
    return ""
}

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n))
}

type CarouselWebglHandle = {
    setSize: (width: number, height: number) => void
    setImageUrl: (url: string) => void
    setVelocity: (vx: number) => void
    setIntensity: (n: number) => void
    tick: (deltaSeconds: number) => void
    render: () => void
    dispose: () => void
}

const webglVertexShader = /* glsl */ `
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const webglFragmentShader = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform float uTime;
uniform float uIntensity;
uniform vec2 uVelocity;
in vec2 vUv;
out vec4 fragColor;

void main() {
  float speed = length(uVelocity);
  float w = uIntensity * (0.35 + speed * 2.5);
  vec2 uv = vUv;
  vec2 warp = vec2(
    sin(uv.y * 20.0 + uTime * 2.8),
    cos(uv.x * 16.0 - uTime * 2.2)
  ) * w * 0.012;
  uv += warp;
  vec2 rgbShift = uVelocity * w * 0.018;
  float r = texture(uMap, uv + rgbShift).r;
  float g = texture(uMap, uv).g;
  float b = texture(uMap, uv - rgbShift).b;
  float vig = smoothstep(0.85, 0.2, length(vUv - 0.5));
  fragColor = vec4(r, g, b, 1.0) * (0.88 + 0.12 * vig);
}
`

function createCarouselWebgl(canvas: HTMLCanvasElement): CarouselWebglHandle | null {
    let renderer: THREE.WebGLRenderer
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
        })
    } catch {
        return null
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    const uniforms = {
        uMap: { value: new THREE.Texture() },
        uTime: { value: 0 },
        uIntensity: { value: 1 },
        uVelocity: { value: new THREE.Vector2(0, 0) },
    }

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: webglVertexShader,
        fragmentShader: webglFragmentShader,
        transparent: true,
        glslVersion: THREE.GLSL3,
    })

    const portraitW = 2 * (9 / 16)
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(portraitW, 2, 1, 1), material)
    scene.add(mesh)

    const loader = new THREE.TextureLoader()
    let currentUrl = ""
    let pendingLoad: string | null = null

    const applyTexture = (tex: THREE.Texture) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        if (uniforms.uMap.value instanceof THREE.Texture) {
            uniforms.uMap.value.dispose()
        }
        uniforms.uMap.value = tex
        material.needsUpdate = true
    }

    const handle: CarouselWebglHandle = {
        setSize(width: number, height: number) {
            if (width <= 0 || height <= 0) return
            renderer.setSize(width, height, false)
            const viewAspect = width / height
            const planeAspect = 9 / 16
            if (viewAspect > planeAspect) {
                const span = planeAspect / viewAspect
                camera.left = -span
                camera.right = span
                camera.top = 1
                camera.bottom = -1
            } else {
                const span = viewAspect / planeAspect
                camera.left = -1
                camera.right = 1
                camera.top = span
                camera.bottom = -span
            }
            camera.updateProjectionMatrix()
        },

        setImageUrl(url: string) {
            if (!url || url === currentUrl) return
            pendingLoad = url
            loader.load(
                url,
                (tex) => {
                    if (pendingLoad !== url) {
                        tex.dispose()
                        return
                    }
                    currentUrl = url
                    pendingLoad = null
                    applyTexture(tex)
                },
                undefined,
                () => {
                    if (pendingLoad === url) pendingLoad = null
                }
            )
        },

        setVelocity(vx: number) {
            uniforms.uVelocity.value.set(vx * 0.02, 0)
        },

        setIntensity(n: number) {
            uniforms.uIntensity.value = Math.max(0, n)
        },

        tick(deltaSeconds: number) {
            uniforms.uTime.value += deltaSeconds
            const v = uniforms.uVelocity.value
            v.multiplyScalar(Math.pow(0.88, 1 + deltaSeconds * 60 * 0.02))
            if (v.lengthSq() < 1e-8) v.set(0, 0)
        },

        render() {
            renderer.render(scene, camera)
        },

        dispose() {
            pendingLoad = null
            if (uniforms.uMap.value instanceof THREE.Texture) {
                uniforms.uMap.value.dispose()
            }
            mesh.geometry.dispose()
            material.dispose()
            renderer.dispose()
        },
    }

    return handle
}

/**
 * @framerDisableUnlink
 * @framerDisableEdit
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 520
 *
 * Self-contained: copy this one file into Framer and add the `three` npm package.
 */
export function BunnyImageCarousel(props: {
    libraryId?: string
    pullZoneHostname?: string
    items?: BunnyCarouselItem[]
    /** Max Y rotation in degrees for cards away from center. */
    maxRotation?: number
    /** Horizontal spacing between card centers (px). */
    slideSpacing?: number
    /** Spring stiffness when snapping (higher = snappier). */
    snapStiffness?: number
    /** Spring damping 0–1 (lower = more bounce). */
    snapDamping?: number
    enableWebGL?: boolean
    /** Scales distortion + RGB shift. */
    webglIntensity?: number
    /** Show WebGL on Framer canvas (heavier). */
    previewWebGLOnCanvas?: boolean
    style?: React.CSSProperties
}) {
    const {
        libraryId = "",
        pullZoneHostname = "",
        items = [],
        maxRotation = 42,
        slideSpacing = 200,
        snapStiffness = 0.18,
        snapDamping = 0.82,
        enableWebGL = true,
        webglIntensity = 1,
        previewWebGLOnCanvas = false,
        style,
    } = props

    const list = useMemo(() => (Array.isArray(items) ? items : []).filter(Boolean), [items])
    const n = list.length

    const containerRef = useRef<HTMLDivElement>(null)
    const heroSlotRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const webglRef = useRef<CarouselWebglHandle | null>(null)

    const [focus, setFocus] = useState(0)
    const focusRef = useRef(0)
    focusRef.current = focus

    const dragRef = useRef(false)
    const pointerIdRef = useRef<number | null>(null)
    const lastClientXRef = useRef(0)
    const lastTRef = useRef(0)
    const velPxRef = useRef(0)
    const springVelRef = useRef(0)
    const rafRef = useRef<number | null>(null)
    const lastFrameRef = useRef<number | null>(null)

    const [cardW, setCardW] = useState(200)
    const cardH = cardW * (16 / 9)

    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const useWebGL =
        enableWebGL &&
        (previewWebGLOnCanvas || !isCanvas) &&
        typeof window !== "undefined" &&
        !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches

    const activeIndex = clamp(Math.round(focus), 0, Math.max(0, n - 1))
    const activeUrl = n > 0 ? slideImageUrl(list[activeIndex]!, libraryId, pullZoneHostname) : ""

    const propsRef = useRef({
        snapStiffness,
        snapDamping,
        webglIntensity,
        useWebGL,
        n,
    })
    propsRef.current = { snapStiffness, snapDamping, webglIntensity, useWebGL, n }

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0]?.contentRect
            if (!cr) return
            const w = Math.max(120, cr.width)
            const nextW = Math.min(w * 0.68, slideSpacing * 1.35)
            setCardW(nextW)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [slideSpacing])

    useEffect(() => {
        setFocus((f) => clamp(f, 0, Math.max(0, n - 1)))
    }, [n])

    useEffect(() => {
        if (!useWebGL) {
            webglRef.current?.dispose()
            webglRef.current = null
            return
        }
        const canvas = canvasRef.current
        const slot = heroSlotRef.current
        if (!canvas || !slot) return

        const gl = createCarouselWebgl(canvas)
        webglRef.current = gl
        if (!gl) return
        const ro = new ResizeObserver(() => {
            const r = slot.getBoundingClientRect()
            gl.setSize(Math.floor(r.width), Math.floor(r.height))
        })
        ro.observe(slot)
        const r = slot.getBoundingClientRect()
        gl.setSize(Math.floor(r.width), Math.floor(r.height))
        return () => {
            ro.disconnect()
            webglRef.current?.dispose()
            webglRef.current = null
        }
    }, [useWebGL, cardW, cardH])

    useEffect(() => {
        const gl = webglRef.current
        if (!gl || !activeUrl) return
        gl.setImageUrl(activeUrl)
        gl.setIntensity(webglIntensity)
    }, [activeUrl, webglIntensity])

    useEffect(() => {
        if (n === 0) return

        const loop = () => {
            const { snapStiffness: k, snapDamping: d, webglIntensity: wi, useWebGL: wg, n: count } =
                propsRef.current
            const target = clamp(Math.round(focusRef.current), 0, Math.max(0, count - 1))
            const diff = target - focusRef.current

            if (!dragRef.current) {
                if (count > 1 && (Math.abs(diff) > 1e-5 || Math.abs(springVelRef.current) > 1e-5)) {
                    springVelRef.current += diff * k
                    springVelRef.current *= d
                    const next = focusRef.current + springVelRef.current
                    focusRef.current = next
                    setFocus(next)
                } else if (count > 1) {
                    springVelRef.current = 0
                    focusRef.current = target
                    setFocus(target)
                }
            }

            const gl = webglRef.current
            if (gl && wg) {
                const now = performance.now()
                const last = lastFrameRef.current ?? now
                const dt = Math.min(0.08, (now - last) / 1000)
                lastFrameRef.current = now
                gl.setVelocity(velPxRef.current * 0.0006)
                gl.setIntensity(wi)
                gl.tick(dt)
                gl.render()
                velPxRef.current *= 0.94
            }

            rafRef.current = requestAnimationFrame(loop)
        }

        rafRef.current = requestAnimationFrame(loop)
        return () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
            rafRef.current = null
            lastFrameRef.current = null
        }
    }, [n])

    const onPointerDown = (e: React.PointerEvent) => {
        if (n <= 1) return
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        pointerIdRef.current = e.pointerId
        dragRef.current = true
        lastClientXRef.current = e.clientX
        lastTRef.current = performance.now()
        velPxRef.current = 0
        springVelRef.current = 0
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current || e.pointerId !== pointerIdRef.current || n <= 1) return
        const dx = e.clientX - lastClientXRef.current
        lastClientXRef.current = e.clientX
        const now = performance.now()
        const dt = Math.max(1e-4, (now - lastTRef.current) / 1000)
        lastTRef.current = now
        velPxRef.current = dx / dt

        const span = Math.max(80, slideSpacing)
        const dFocus = dx / span
        const next = clamp(focusRef.current + dFocus, 0, n - 1)
        focusRef.current = next
        setFocus(next)

        const gl = webglRef.current
        const { useWebGL: wg, webglIntensity: wi } = propsRef.current
        if (gl && wg) {
            gl.setVelocity(velPxRef.current * 0.0008)
            gl.setIntensity(wi)
            gl.tick(1 / 60)
            gl.render()
        }
    }

    const endDrag = (e: React.PointerEvent) => {
        if (e.pointerId !== pointerIdRef.current) return
        try {
            ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
        } catch {
            /* ignore */
        }
        pointerIdRef.current = null
        dragRef.current = false
        springVelRef.current = 0
    }

    const perspectivePx = 1100

    if (n === 0) {
        return (
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#141414",
                    color: "#888",
                    fontSize: 14,
                    ...style,
                }}
            >
                Add slides (CMS or manual) in Properties
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                touchAction: "pan-y",
                userSelect: "none",
                background: "#0a0a0a",
                ...style,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    perspective: `${perspectivePx}px`,
                    perspectiveOrigin: "50% 50%",
                }}
            >
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        transformStyle: "preserve-3d",
                    }}
                >
                    {list.map((item, i) => {
                        const rel = i - focus
                        const absRel = Math.abs(rel)
                        const rotY = -rel * maxRotation
                        const scale = 1 - absRel * 0.07
                        const tz = -absRel * 55
                        const opacity = 1 - absRel * 0.12
                        const offsetX = rel * slideSpacing
                        const zIndex = 500 - Math.round(absRel * 100)

                        const url = slideImageUrl(item, libraryId, pullZoneHostname)
                        const isHero = Math.abs(rel) < 0.52

                        return (
                            <div
                                key={i}
                                style={{
                                    position: "absolute",
                                    left: "50%",
                                    top: "50%",
                                    width: cardW,
                                    height: cardH,
                                    marginLeft: -cardW / 2,
                                    marginTop: -cardH / 2,
                                    transform: `translateX(${offsetX}px) rotateY(${rotY}deg) translateZ(${tz}px) scale(${scale})`,
                                    transformStyle: "preserve-3d",
                                    opacity,
                                    zIndex,
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    boxShadow:
                                        absRel < 0.6
                                            ? "0 24px 48px rgba(0,0,0,0.45)"
                                            : "0 8px 24px rgba(0,0,0,0.35)",
                                    background: "#111",
                                }}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                        width: "100%",
                                        height: "100%",
                                        aspectRatio: "9 / 16",
                                    }}
                                >
                                    <img
                                        src={url || undefined}
                                        alt={item.title || ""}
                                        draggable={false}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            pointerEvents: "none",
                                            opacity: useWebGL && isHero ? 0 : 1,
                                        }}
                                    />
                                </div>
                                {item.title ? (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: "10px 12px",
                                            background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                                            color: "#fff",
                                            fontSize: 13,
                                            fontWeight: 600,
                                            pointerEvents: "none",
                                        }}
                                    >
                                        {item.title}
                                    </div>
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            </div>

            {useWebGL ? (
                <div
                    ref={heroSlotRef}
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: cardW,
                        height: cardH,
                        marginLeft: -cardW / 2,
                        marginTop: -cardH / 2,
                        pointerEvents: "none",
                        zIndex: 2000,
                        borderRadius: 12,
                        overflow: "hidden",
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                        }}
                    />
                </div>
            ) : null}
        </div>
    )
}

BunnyImageCarousel.defaultProps = {
    libraryId: "",
    pullZoneHostname: "",
    items: [
        { videoId: "", title: "Slide A", image: "" },
        { videoId: "", title: "Slide B", image: "" },
        { videoId: "", title: "Slide C", image: "" },
    ],
    maxRotation: 42,
    slideSpacing: 200,
    snapStiffness: 0.18,
    snapDamping: 0.82,
    enableWebGL: true,
    webglIntensity: 1,
    previewWebGLOnCanvas: false,
}

addPropertyControls(BunnyImageCarousel, {
    libraryId: { type: ControlType.String, title: "Library ID" },
    pullZoneHostname: { type: ControlType.String, title: "CDN host name" },
    items: {
        title: "Slides",
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                videoId: { type: ControlType.String, title: "Video ID" },
                title: { type: ControlType.String, title: "Title" },
                image: { type: ControlType.Image, title: "Image (optional)" },
            },
        },
        defaultValue: [
            { videoId: "", title: "Slide 1", image: "" },
            { videoId: "", title: "Slide 2", image: "" },
        ],
    },
    maxRotation: {
        type: ControlType.Number,
        title: "Side rotation",
        min: 0,
        max: 75,
        step: 1,
        defaultValue: 42,
        unit: "deg",
    },
    slideSpacing: {
        type: ControlType.Number,
        title: "Slide spacing",
        min: 120,
        max: 400,
        step: 4,
        defaultValue: 200,
        unit: "px",
    },
    snapStiffness: {
        type: ControlType.Number,
        title: "Snap stiffness",
        min: 0.05,
        max: 0.45,
        step: 0.01,
        defaultValue: 0.18,
    },
    snapDamping: {
        type: ControlType.Number,
        title: "Snap damping",
        min: 0.5,
        max: 0.98,
        step: 0.01,
        defaultValue: 0.82,
    },
    enableWebGL: {
        type: ControlType.Boolean,
        title: "WebGL drag effect",
        defaultValue: true,
    },
    webglIntensity: {
        type: ControlType.Number,
        title: "WebGL intensity",
        min: 0,
        max: 2.5,
        step: 0.05,
        defaultValue: 1,
        hidden: (p: { enableWebGL?: boolean }) => !p.enableWebGL,
    },
    previewWebGLOnCanvas: {
        type: ControlType.Boolean,
        title: "WebGL on canvas",
        defaultValue: false,
        hidden: (p: { enableWebGL?: boolean }) => !p.enableWebGL,
        description: "Heavier Framer canvas preview; off uses CSS only on canvas.",
    },
})

/** Default export helps Framer treat the file as a single insertable component in some flows. */
export default BunnyImageCarousel
