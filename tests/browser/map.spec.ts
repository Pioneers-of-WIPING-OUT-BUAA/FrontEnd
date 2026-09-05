import { test, expect } from '@playwright/test'

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`renders maps and releases subscriptions at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', error => { errors.push(error.message); console.error(error.message) })
    await page.addInitScript(() => {
      localStorage.setItem('user', JSON.stringify({ username: 'browser-test', role: 0, token: 'test-token', avatar: '' }))
    })
    await page.route(url => url.port === '8000' && url.pathname.startsWith('/api/'), route => {
      const path = new URL(route.request().url()).pathname
      const data = path.endsWith('/log/flag') ? { log: false } : { success: true, connect: true }
      return route.fulfill({ json: data })
    })
    const counts: Record<string, number> = {}
    const grid = { header: { frame_id: 'map' }, info: { width: 20, height: 20, resolution: 0.1, origin: { position: { x: -1, y: -1, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } } }, data: Array.from({ length: 400 }, (_, index) => index % 20 === 0 || index < 20 ? 100 : 0) }
    await page.routeWebSocket('ws://127.0.0.1:9090', socket => {
      socket.onMessage(raw => {
        const message = JSON.parse(String(raw))
        if (message.op === 'subscribe') {
          counts[message.topic] = (counts[message.topic] || 0) + 1
          if (message.topic === '/map') {
            for (let index = 0; index < 5; index++) socket.send(JSON.stringify({ op: 'publish', topic: '/map', msg: grid }))
          }
          if (message.topic === '/odom') socket.send(JSON.stringify({ op: 'publish', topic: '/odom', msg: { pose: { pose: { position: { x: 0, y: 0, z: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } } } } }))
        }
        if (message.op === 'unsubscribe') counts[message.topic]--
      })
    })
    await page.goto('/mapping')
    await expect(page.locator('#app')).not.toBeEmpty({ timeout: 5000 })
    await page.getByRole('button', { name: /未连接机器人/ }).click()
    await expect(page.getByRole('button', { name: /已连接机器人/ })).toBeVisible()
    await page.getByRole('button', { name: '开始工作', exact: true }).click()
    const canvas = page.locator('.ros-map-canvas canvas')
    await expect(canvas).toBeVisible()
    await expect.poll(() => counts['/odom']).toBe(1)
    await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => {
      const pixels = element.getContext('2d')!.getImageData(0, 0, element.width, element.height).data
      const colors = new Set<string>()
      for (let index = 0; index < pixels.length; index += 4) colors.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`)
      return colors.size
    })).toBeGreaterThan(2)
    await page.screenshot({ path: testInfo.outputPath('map.png'), fullPage: true })
    await page.getByRole('button', { name: '取消进度', exact: true }).click()
    await expect(canvas).toHaveCount(0)
    await expect.poll(() => counts['/map']).toBe(0)
    await expect.poll(() => counts['/odom']).toBe(0)
    await expect.poll(() => counts['/tf']).toBe(0)
    expect(errors).toEqual([])
  })
}
