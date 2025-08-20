import { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Query, Body } from "matter-js"

const canvas = document.getElementById("matter-world")

const engine = Engine.create()
const world = engine.world

const render = Render.create({
    canvas,
    engine,
    options: {
        wireframes: false
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

let chicken = Bodies.rectangle(400, 200, 32, 32, {
    restitution: 0.9,
    render: {
        fillStyle: "white"
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

Events.on(mouseConstraint, "mousedown", function(e) {
    const mousePosition = e.mouse.position

    const bodies = Query.point([chicken], mousePosition)
    if (bodies.length > 0) {
        chickenHit = true
        console.log("chicken hit")
        chicken.render.fillStyle = "red"
        setTimeout(() => {
            chickenHit = false
            console.log("chicken fine!")
            chicken.render.fillStyle = "white"

            if (!loopAI) {
                loopAI = setInterval(chickenAI, 1200)
            }
        }, 2000)
    }
})

function chickenAI() {

    const randDir = () => {
        const a = Math.random() * Math.PI * 2
        return { x: Math.cos(a), y: Math.sin(a) }
    }

    const dir = randDir()
    Body.applyForce(chicken, chicken.position, {
        x: dir.x * .005,
        y: dir.y * .005
    })

    const walkDuration = 400 + Math.random() * 700

    setTimeout(() => {
        Body.setVelocity(chicken, { x: 0, y: 0 })
        Body.setAngularVelocity(chicken, 0)
    }, walkDuration)
}

let loopAI = null
loopAI = setInterval(chickenAI, 1200)

Events.on(engine, "beforeUpdate", () => {
    Body.setAngularVelocity(chicken, 0)
    Body.setAngle(chicken, 0)

    if (chickenHit) {
        clearInterval(loopAI)
        loopAI = null
    }
})
