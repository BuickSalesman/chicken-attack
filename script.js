import { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Query, Body } from "matter-js"

import walkRight1 from "./sprites/walkRight1.png"
import walkRight2 from "./sprites/walkRight2.png"
import walkLeft1 from "./sprites/walkLeft1.png"
import walkLeft2 from "./sprites/walkLeft2.png"

const walkFramesRight = [walkRight1, walkRight2]
const walkFramesLeft = [walkLeft1, walkLeft2]

const canvas = document.getElementById("matter-world")

const engine = Engine.create()
const world = engine.world

const render = Render.create({
    canvas,
    engine,
    options: {
        wireframes: false,
        background: "green"
    }
})

world.gravity.x = 0
world.gravity.y = 0

const width = canvas.width
const height = canvas.height
const thickness = 50

const borders = [
    Bodies.rectangle(width / 2, -thickness / 2, width, thickness, { isStatic: true }),
    Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, { isStatic: true }),
    Bodies.rectangle(-thickness / 2, height / 2, thickness, height, { isStatic: true }),
    Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, { isStatic: true })
]

Composite.add(world, borders)

let chicken = Bodies.rectangle(400, 200, 30, 30, {
    restitution: 0.9,
    render: {
        sprite: {
            texture: walkFramesLeft[0],
            xScale: 2,
            yScale: 2,
        }
    }
})

Composite.add(world, chicken)

let house1 = Bodies.rectangle(200, 400, 300, 300, {
    isStatic: true,
    restitution: 0.8,
    render: {
        fillStyle: "red"
    }
})

Composite.add(world, house1)

let house2 = Bodies.rectangle(600, 150, 200, 100, {
    isStatic: true,
    restitution: 0.8,
    render: {
        fillStyle: "blue"
    }
})

Composite.add(world, house2)

const mouse = Mouse.create(render.canvas)
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    collisionFilter: {
        mask: 0
    },
    constraint: {
        stiffness: 0,
        angularStiffness: 0,
        render: {
            visible: true
        }
    }
})

Composite.add(world, mouseConstraint)

render.mouse = mouse

Render.run(render)

const runner = Runner.create()
Runner.run(runner, engine)


let chickenHit = false
let loopDuration = 1000 + Math.random() * 1000

Events.on(mouseConstraint, "mousedown", function(e) {
    const mousePosition = e.mouse.position

    const bodies = Query.point([chicken], mousePosition)
    if (bodies.length > 0) {
        chickenHit = true
        setTimeout(() => {
            chickenHit = false
            if (!loopAI) {
                loopAI = setInterval(chickenAI, loopDuration)
            }
        }, 2800)
    }
})

let firstHit
let facingRight = true

function chickenAI() {

    const randDir = () => {
        const a = Math.random() * Math.PI * 2
        const dir = { x: Math.cos(a), y: Math.sin(a) }

        return dir
    }

    const dir = randDir()
    Body.applyForce(chicken, chicken.position, {
        x: dir.x * .005,
        y: dir.y * .005
    })

    const walkDuration = 200 + Math.random() * 400

    setTimeout(() => {
        Body.setVelocity(chicken, { x: 0, y: 0 })
        Body.setAngularVelocity(chicken, 0)
    }, walkDuration + walkDuration)
    loopDuration = 1000 + Math.random() * 1000
}

let loopAI = null
loopAI = setInterval(chickenAI, loopDuration)

Events.on(engine, "beforeUpdate", () => {

    Body.setAngularVelocity(chicken, 0)
    Body.setAngle(chicken, 0)

    if (chickenHit) {
        if (loopAI) {
            firstHit = 10
        }
        clearInterval(loopAI)
        loopAI = null

        const dx = chicken.position.x - mouse.position.x
        const dy = chicken.position.y - mouse.position.y

        const d = Math.hypot(dx, dy)

        const ux = dx / d;
        const uy = dy / d;

        const mag = firstHit ? 0.0002 : .0075

        firstHit--

        const force = { x: ux * mag, y: uy * mag }

        Body.applyForce(chicken, chicken.position, force)
    }
})

let lastDir = 1;

Events.on(engine, "afterUpdate", () => {
    const vx = chicken.velocity.x;
    const EPS = 0.1;

    if (Math.abs(vx) > EPS) {
        lastDir = Math.sign(vx);
    }

    const facingRight = lastDir > 0;
    chicken.render.sprite.texture = facingRight ? walkFramesRight[0] : walkFramesLeft[0];
});
