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

}

class Engine {

    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.points = [];
        this.arms = [];
        this.precision = 2;
        this.independent = true;
        this.infinite = false;
        this.paused = false;

        this.completion = 0;
        this.current = 0;
        this.finished = false;
    }

    get count() {
        return this.arms.length;
    }

    /* Add an arm to the spirograph. */
    add(arm) {
        this.pause();
        this.arms.push(arm);
        this.reset();
        return arm;
    }

    /* Remove an arm of the spirograph. */
    remove(arm) {
        this.pause();
        if (this.count <= 1) return;
        let index = this.arms.indexOf(arm);
        this.arms.splice(index, 1);
        this.reset();
        return index;
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
        this.completion = gcds.reduce(lcm) * this.precision + 1;
    }

    /* Reset and clear the spirograph. */
    reset() {
        this.pause();
        this.current = 0;
        this.clear();
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        for (let arm of this.arms)
            arm.reset();
        this.recalculate();
    }

    drawArms(context, canvas) {
        context.beginPath();
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        context.moveTo(x, y);
        let last = 0;
        for (let arm of this.arms) {
            let angle = arm.angle / this.precision;
            if (!this.independent) angle += last;
            last = angle;
            let length = arm.length;
            x += length * Math.cos(angle * Math.PI / 180);
            y += length * Math.sin(angle * Math.PI / 180);
            context.lineTo(x, y);
        }
        if (!this.finished)
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
        let canvas = this.canvas;
        let context = this.context;
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (!this.finished || this.infinite)
            this.drawArms(context, canvas);
        this.drawPoints(context, canvas);
    }

    update() {
        if (!this.paused) {
            for (let arm of this.arms)
                arm.angle += arm.velocity;
        }
        if (this.current++ >= this.completion)
            this.finished = true;
    }

    start() {
        this.draw();
        setInterval(this.update.bind(this), 1000 / 60);
    }
    
}
