import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const params = {
    count: 100000,
    size: 0.01,
    radius: 8,
    branches : 6,
    spin: 1,
    randomness: 0.2,
    randPower: 3,
    insideColor: 0xff5588,
    outsideColor: 0x1b3984
}

let geometry = null
let material = null
let galaxy = null

const generateGalaxy = () => {

    //Destroy previous galaxy
    if (galaxy !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(galaxy)
    }
  
    geometry = new THREE.BufferGeometry()
    const positionsArray = new Float32Array(params.count * 3)
    const colorsArray = new Float32Array(params.count * 3)

    const colorInside = new THREE.Color(params.insideColor)
    const colorOutside = new THREE.Color(params.outsideColor)

    for (let i = 0; i < params.count; i++) {

        const i3 = i * 3

        //Position
        const radius = Math.pow(Math.random(), params.randPower ) * params.radius
        const spinAngle = radius * params.spin * 0.5
        const branchAngle = (i % params.branches) / params.branches * 2 * Math.PI

        const randomX = Math.pow(Math.random(), params.randPower) * (Math.random() < 0.5 ? 1 : -1) 
        const randomY = Math.pow(Math.random(), params.randPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), params.randPower) * (Math.random() < 0.5 ? 1 : -1) 

        positionsArray[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positionsArray[i3 + 1] = randomY
        positionsArray[i3 + 2] = Math.sin(branchAngle + spinAngle ) * radius + randomZ

        //Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius/ params.radius)

        colorsArray[i3 + 0] = mixedColor.r
        colorsArray[i3 + 1] = mixedColor.g
        colorsArray[i3 + 2] = mixedColor.b
    }

    const positionAttribute = new THREE.BufferAttribute(positionsArray, 3)
    const colorAttribute = new THREE.BufferAttribute(colorsArray, 3)

    geometry.setAttribute( 'position', positionAttribute )
    geometry.setAttribute( 'color', colorAttribute )

    //Material
    material = new THREE.PointsMaterial({
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    galaxy = new THREE.Points(geometry, material)

    scene.add(galaxy)

    /**
 * Animate
 */
const clock = new THREE.Clock()

  const tick = () =>
  {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    //Update Galaxy
    galaxy.rotation.y = elapsedTime * 0.3

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

  tick()
  console.log('hi')

}

//GUI

gui.add(params, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(params, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(params, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(params, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, 'randPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(params, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(params, 'outsideColor').onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



generateGalaxy()