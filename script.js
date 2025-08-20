import { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Query } from "matter-js"

const canvas = document.getElementById("matter-world")

const engine = Engine.create()
const world = engine.world

const render = Render.create({
    canvas,
    engine,
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

var chicken = Bodies.rectangle(400, 200, 32, 32)

Composite.add(world, chicken)

const mouse = Mouse.create(render.canvas)
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
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
        setTimeout(() => {
            chickenHit = false
            console.log("chicken fine!")
        }, 2000)
    }
})
