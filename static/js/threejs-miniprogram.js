export function createEarthScene(canvas) {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return {
      start() {},
      stop() {}
    }
  }

  const state = {
    stars: [],
    frameId: 0,
    rotation: 0,
    width: 0,
    height: 0,
    dpr: 1
  }

  function resize() {
    const dpr = uni.getSystemInfoSync().pixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const width = rect.width || 375
    const height = rect.height || 812

    state.width = width
    state.height = height
    state.dpr = dpr

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    state.stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.2 + 0.6,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.2 + 0.08
    }))
  }

  function drawStars() {
    ctx.save()
    for (const star of state.stars) {
      const drift = (Math.sin((state.rotation * 0.2) + star.x) * 6)
      const x = (star.x + drift) % state.width
      const y = (star.y + star.speed * 10) % state.height

      ctx.beginPath()
      ctx.fillStyle = `rgba(255,255,255,${star.alpha})`
      ctx.arc(x, y, star.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  function drawEarth() {
    const cx = state.width / 2
    const cy = state.height / 2
    const size = Math.min(state.width, state.height) * 0.31

    ctx.save()
    ctx.translate(cx, cy)

    const glow = ctx.createRadialGradient(0, 0, size * 0.15, 0, 0, size * 1.4)
    glow.addColorStop(0, 'rgba(94, 159, 255, 0.38)')
    glow.addColorStop(0.45, 'rgba(18, 59, 120, 0.25)')
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2)
    ctx.fill()

    const earthGrad = ctx.createRadialGradient(-size * 0.35, -size * 0.3, size * 0.12, 0, 0, size)
    earthGrad.addColorStop(0, '#4ea8ff')
    earthGrad.addColorStop(0.35, '#113354')
    earthGrad.addColorStop(0.7, '#071f3a')
    earthGrad.addColorStop(1, '#020b16')

    ctx.fillStyle = earthGrad
    ctx.beginPath()
    ctx.arc(0, 0, size, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(0, 0, size, 0, Math.PI * 2)
    ctx.clip()

    ctx.beginPath()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.arc(-size * 0.38, -size * 0.25, size * 0.72, 0, Math.PI * 2)
    ctx.fill()

    for (let i = 0; i < 160; i++) {
      const angle = (i / 160) * Math.PI * 2 + state.rotation
      const x = Math.cos(angle) * size * 0.92
      const y = Math.sin(angle) * size * 0.82
      const nightSide = Math.sin(angle + state.rotation * 0.8) < 0

      if (nightSide) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(255, 201, 96, 0.9)'
        ctx.arc(x, y, 4.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.restore()
  }

  function render() {
    ctx.clearRect(0, 0, state.width, state.height)

    const bg = ctx.createRadialGradient(
      state.width / 2,
      state.height / 2,
      80,
      state.width / 2,
      state.height / 2,
      state.width * 0.6
    )
    bg.addColorStop(0, 'rgba(12, 20, 35, 0.9)')
    bg.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, state.width, state.height)

    drawStars()
    drawEarth()

    state.rotation += 0.012
    state.frameId = requestAnimationFrame(render)
  }

  function start() {
    resize()
    render()
  }

  function stop() {
    if (state.frameId) {
      cancelAnimationFrame(state.frameId)
      state.frameId = 0
    }
  }

  return {
    start,
    stop
  }
}
