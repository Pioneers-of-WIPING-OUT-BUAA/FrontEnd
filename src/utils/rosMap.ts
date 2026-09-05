import ROSLIB from 'roslib'

export interface MapPoint { x: number; y: number; theta: number; name?: string }

let viewerId = 0

export function quaternionYaw(q: { x: number; y: number; z: number; w: number }) {
  return Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z))
}

export function createRosMap(element: HTMLElement, ros: any, onMap: () => void, onError: () => void) {
  const { ROS2D, createjs } = window as any
  element.id = `ros-map-${++viewerId}`
  const viewer = new ROS2D.Viewer({ divID: element.id, width: 600, height: 600 })
  let grid: any = null
  let disposed = false
  let pose: any = null
  let transform = { x: 0, y: 0, theta: 0 }
  let waypoints: any[] = []
  const marker = new ROS2D.NavigationArrow({ size: 12, strokeSize: 1, fillColor: createjs.Graphics.getRGB(255, 128, 0, 0.66) })
  marker.visible = false
  viewer.scene.addChild(marker)

  function scaleMarkers() {
    for (const item of [marker, ...waypoints]) {
      item.scaleX = 1 / viewer.scene.scaleX
      item.scaleY = 1 / viewer.scene.scaleY
    }
  }

  function drawPose() {
    if (!pose || disposed) return
    const { x, y } = pose.position
    const cos = Math.cos(transform.theta), sin = Math.sin(transform.theta)
    marker.x = cos * x - sin * y + transform.x
    marker.y = -(sin * x + cos * y + transform.y)
    marker.rotation = -(quaternionYaw(pose.orientation) + transform.theta) * 180 / Math.PI
    marker.visible = true
    scaleMarkers()
  }

  const mapTopic = new ROSLIB.Topic({ ros, name: '/map', messageType: 'nav_msgs/OccupancyGrid', compression: 'png' })
  const poseTopic = new ROSLIB.Topic({ ros, name: '/odom', messageType: 'nav_msgs/Odometry', throttle_rate: 50, queue_length: 1 })
  const tfTopic = new ROSLIB.Topic({ ros, name: '/tf', messageType: 'tf2_msgs/TFMessage', throttle_rate: 50, queue_length: 1 })
  mapTopic.subscribe((message: any) => {
    if (disposed) return
    try {
      if (!(message.info?.width > 0 && message.info?.height > 0 && message.info?.resolution > 0) || message.data?.length !== message.info.width * message.info.height) throw new Error('Invalid map')
      const next = new ROS2D.OccupancyGrid({ message })
      if (grid) viewer.scene.removeChild(grid)
      grid = next
      viewer.scene.addChildAt(grid, 0)
      viewer.scaleToDimensions(grid.width, grid.height)
      viewer.shift(grid.pose.position.x, grid.pose.position.y)
      scaleMarkers()
      onMap()
    } catch {
      onError()
    }
  })
  poseTopic.subscribe((message: any) => {
    pose = message.pose?.pose
    drawPose()
  })
  tfTopic.subscribe((message: any) => {
    const frame = message.transforms?.find((item: any) => item.child_frame_id?.replace(/^\//, '') === 'odom' && item.header?.frame_id?.replace(/^\//, '') === 'map')
    if (!frame) return
    transform = { x: frame.transform.translation.x, y: frame.transform.translation.y, theta: quaternionYaw(frame.transform.rotation) }
    drawPose()
  })

  return {
    setPoints(points: MapPoint[]) {
      if (disposed) return
      for (const point of waypoints) viewer.scene.removeChild(point)
      waypoints = points.filter(point => Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.theta)).map(point => {
        const arrow = new ROS2D.NavigationArrow({ size: 8, strokeSize: 1.2, fillColor: createjs.Graphics.getRGB(0, 128, 5, 0.66) })
        arrow.x = point.x
        arrow.y = -point.y
        arrow.rotation = -point.theta * 180 / Math.PI
        viewer.scene.addChild(arrow)
        return arrow
      })
      scaleMarkers()
    },
    dispose() {
      if (disposed) return
      disposed = true
      for (const topic of [mapTopic, poseTopic, tfTopic]) topic.unsubscribe()
      createjs.Ticker.removeEventListener('tick', viewer.scene)
      viewer.scene.removeAllChildren()
      element.replaceChildren()
    }
  }
}
