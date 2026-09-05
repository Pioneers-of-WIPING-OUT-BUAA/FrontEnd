import { beforeEach, expect, it, vi } from 'vitest'
import { createRosMap } from '@/utils/rosMap'

const { topics } = vi.hoisted(() => ({ topics: [] as any[] }))
vi.mock('roslib', () => ({ default: { Topic: class {
  name: string
  callback: any
  unsubscribe = vi.fn()
  constructor(options: any) { this.name = options.name; topics.push(this) }
  subscribe(callback: any) { this.callback = callback }
} } }))

let children: any[]
let ticker: any
beforeEach(() => {
  topics.length = 0
  children = []
  ticker = { removeEventListener: vi.fn() }
  ;(window as any).createjs = { Graphics: { getRGB: () => '' }, Ticker: ticker }
  ;(window as any).ROS2D = {
    Viewer: class {
      scene = {
        scaleX: 2, scaleY: 2,
        addChild: (item: any) => children.push(item),
        addChildAt: (item: any, index: number) => children.splice(index, 0, item),
        removeChild: (item: any) => { children = children.filter(child => child !== item) },
        removeAllChildren: () => { children = [] }
      }
      scaleToDimensions() {}
      shift() {}
    },
    NavigationArrow: class {},
    OccupancyGrid: class {
      width = 3
      height = 2
      pose = { position: { x: 0, y: 0 } }
    }
  }
})

it('reuses subscriptions and markers through map updates, then disposes everything', () => {
  const element = document.createElement('div')
  const map = createRosMap(element, {}, vi.fn(), vi.fn())
  const topic = topics.find(topic => topic.name === '/map')
  for (let index = 0; index < 50; index++) topic.callback({ info: { width: 3, height: 2, resolution: 0.03 }, data: [0, 0, 0, 0, 0, 0] })
  expect(topics).toHaveLength(3)
  expect(children).toHaveLength(2)
  map.setPoints([{ x: 1, y: 2, theta: 0 }])
  map.setPoints([{ x: 3, y: 4, theta: 0 }])
  expect(children).toHaveLength(3)
  map.dispose()
  map.dispose()
  expect(children).toHaveLength(0)
  for (const topic of topics) expect(topic.unsubscribe).toHaveBeenCalledTimes(1)
  expect(ticker.removeEventListener).toHaveBeenCalledTimes(1)
})

it('finds the correct TF entry and applies translation and rotation to position', () => {
  const map = createRosMap(document.createElement('div'), {}, vi.fn(), vi.fn())
  const pose = topics.find(topic => topic.name === '/odom')
  const tf = topics.find(topic => topic.name === '/tf')
  pose.callback({ pose: { pose: { position: { x: 1, y: 0 }, orientation: { x: 0, y: 0, z: 0, w: 1 } } } })
  tf.callback({ transforms: [
    { child_frame_id: 'camera', header: { frame_id: 'base_link' } },
    { child_frame_id: '/odom', header: { frame_id: '/map' }, transform: { translation: { x: 2, y: 3 }, rotation: { x: 0, y: 0, z: Math.SQRT1_2, w: Math.SQRT1_2 } } }
  ] })
  expect(children[0].x).toBeCloseTo(2)
  expect(children[0].y).toBeCloseTo(-4)
  expect(children[0].rotation).toBeCloseTo(-90)
  expect(() => tf.callback({ transforms: [] })).not.toThrow()
  map.dispose()
})
