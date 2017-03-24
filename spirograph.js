function gcd(a, b) { return !b ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }

class Arm {

    constructor(length, velocity) {
        this.length = length || 20;
        this.velocity = velocity;
        this.angle = 0;
    }

    reset() {
        this.angle = 0;
    }

    toHTML() {
        let div = document.createElement("div");
        div.classList.add("arm");

        return div;
    }

}

class Engine {

    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.points = [];
        this.arms = [];
        this.precision = 2;
        this.independent = false;
        this.completion = 0;
        this.current = 0;
        this.paused = false;
    }

    /* Add an arm to the spirograph. */
    add(l, v) {
        this.pause();
        this.count += 1;
        let arm = new Arm(l, v);
        this.arms.push(arm);
        this.reset();
        return arm;
    }

    /* Modify an arm of the spirograph. */
    modify(i, l, v) {
        this.pause();
        this.arms[i].length = l || this.arms[i].length;
        this.arms[i].velocity = v || this.arms[i].velocity;
        this.reset();
    }

    /* Remove an arm of the spirograph. */
    remove() {
        this.pause();
        if (this.count <= 1) return;
        this.count -= 1;
        this.arms.pop();
        this.reset();
    }

    pause() { this.paused = true; }
    play() { this.paused = false; }

    /* Clear the spirograph. */
    clear() {
        this.points = [];
    }

    /* Recalculate spirograph timing. */
    recalculate() {
        let gcds = [];
        for (let i = 0; i < this.arms.length; i++)
            gcds[i] = 360 / gcd(Math.abs(this.arms[i].velocity) || 0, 360);
        console.log(gcds);
        this.completion = gcds.reduce(lcm) * this.precision + 1;
    }

    /* Reset and clear the spirograph. */
    reset() {
        this.pause();
        this.current = 0;
        this.clear();
        for (let arm of this.arms)
            arm.reset();
        this.recalculate();
    }

    update() {
        for (let arm of this.arms)
            arm.angle += arm.velocity;
    }

    drawArms(context, canvas) {
        context.beginPath();
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        context.moveTo(x, y);
        for (let arm of this.arms) {
            let angle = arm.angle / this.precision;
            let length = arm.length;
            x += length * Math.cos(angle * Math.PI / 180);
            y += length * Math.sin(angle * Math.PI / 180);
            context.lineTo(x, y);
        }
        this.points.push([x, y]);
        context.stroke();
    }
    
    drawPoints(context, canvas) {
        context.beginPath();
        if (this.points.length <= 1) return;
        let first = this.points[0];
        context.moveTo(first[0], first[1]);
        for (let point of this.points.slice(1))
            context.lineTo(point[0], point[1]);
        context.stroke();
    }
    
    draw() {
        requestAnimationFrame(this.draw.bind(this));
        if (!this.paused) {
            this.update();  // Probably fine in draw loop...
            let canvas = this.canvas;
            let context = this.context;
            context.clearRect(0, 0, canvas.width, canvas.height);
            if (this.current++ < this.completion)
                this.drawArms(context, canvas);
            this.drawPoints(context, canvas);
        }
    }

    start() {
        this.draw();
    }
    
}
