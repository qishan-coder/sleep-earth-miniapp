export function createEarthScene(options) {
  const config = typeof options === 'string' ? { canvasId: options } : options || {}
  const canvasId = config.canvasId || 'earthCanvas'
  const target = config.vm || null

  const state = {
    ctx: null,
    stars: [],
    rafId: null,
    width: 375,
    height: 812,
    rotation: 0
  }

  function generateStars() {
    const starCount = 180
    state.stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      r: Math.random() * 2.4 + 0.6,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.4 + 0.12
    }))
  }

  function syncCanvasSize() {
    const info = uni.getSystemInfoSync ? uni.getSystemInfoSync() : {}
    state.width = info.windowWidth || 375
    state.height = info.windowHeight || 812
    generateStars()
  }

  function initContext() {
    const ctx = uni.createCanvasContext(canvasId, target)
    state.ctx = ctx
    return ctx
  }

  function drawBackground(ctx) {
    const gradient = ctx.createRadialGradient(
      state.width / 2,
      state.height / 2,
      80,
      state.width / 2,
      state.height / 2,
      Math.max(state.width, state.height) * 0.7
    )
    gradient.addColorStop(0, 'rgba(12,20,35,0.95)')
    gradient.addColorStop(0.55, 'rgba(3,9,18,0.97)')
    gradient.addColorStop(1, 'rgba(0,0,0,1)')

    ctx.setFillStyle(gradient)
    ctx.fillRect(0, 0, state.width, state.height)
  }

  function drawStars(ctx) {
    for (const star of state.stars) {
      const drift = Math.sin((state.rotation * 0.2) + star.x) * 5
      const x = (star.x + drift + state.width) % state.width
      const y = (star.y + star.speed * 18 + state.height) % state.height

      ctx.beginPath()
      ctx.setFillStyle(`rgba(255,255,255,${star.alpha})`)
      ctx.arc(x, y, star.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function drawEarth(ctx) {
    const cx = state.width / 2
    const cy = state.height / 2
    const radius = Math.min(state.width, state.height) * 0.27

    const glow = ctx.createRadialGradient(cx, cy, radius * 0.12, cx, cy, radius * 1.5)
    glow.addColorStop(0, 'rgba(94,159,255,0.55)')
    glow.addColorStop(0.35, 'rgba(25,74,128,0.30)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.setFillStyle(glow)
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 1.45, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.setFillStyle('#0d2445')
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()

    const ocean = ctx.createRadialGradient(
      cx - radius * 0.38,
      cy - radius * 0.42,
      radius * 0.2,
      cx,
      cy,
      radius
    )
    ocean.addColorStop(0, '#5ea8ff')
    ocean.addColorStop(0.35, '#1a486f')
    ocean.addColorStop(0.7, '#0d2038')
    ocean.addColorStop(1, '#030a14')
    ctx.setFillStyle(ocean)
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)

    for (let i = 0; i < 180; i++) {
      const a = (i / 180) * Math.PI * 2 + state.rotation * 1.4
      const x = cx + Math.cos(a) * radius * (0.85 + (i % 7) * 0.015)
      const y = cy + Math.sin(a) * radius * 0.78
      const isNight = Math.sin(a + state.rotation) < 0

      if (isNight) {
        ctx.beginPath()
        ctx.setFillStyle('rgba(255, 203, 92, 0.9)')
        ctx.arc(x, y, 3.6, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.restore()

    ctx.beginPath()
    ctx.setStrokeStyle('rgba(173, 221, 255, 0.18)')
    ctx.lineWidth = 2
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  function render() {
    const ctx = state.ctx || initContext()
    if (!ctx) return

    drawBackground(ctx)
    drawStars(ctx)
    drawEarth(ctx)
    ctx.draw(true)

    state.rotation += 0.012
    state.rafId = setTimeout(render, 16)
  }

  function start() {
    syncCanvasSize()
    initContext()
    render()
  }

  function stop() {
    if (state.rafId) {
      clearTimeout(state.rafId)
      state.rafId = null
    }
  }

  return {
    start,
    stop
  }
}
