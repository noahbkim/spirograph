/**
 * Spirograph.js
 * Noah Kim, 2017
 * A cool tool for generating interesting spirographs.
 */


/* Some useful math functions. */
function gcd(a, b) { return !b ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }


/* A single arm in the spirograph. */
class Arm {

    constructor(length, velocity, angle) {
        this.length = length;
        this.velocity = velocity;
        this.start = angle || 0;
        this.angle = this.start;
    }

    reset() {
        this.angle = this.start;
    }

    toJSON() {
        return {length: this.length, velocity: this.velocity, start: this.start}
    }

}

class Engine {

    constructor(canvas) {

        /* Canvas and context. */
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        /* Drawing utilities. */
        this.arms = [];
        this.points = [];

        /* Precision of curve. Higher is more accurate. */
        this.precision = 1;

        /* Arm angles are accumulated when dependent. */
        this.independent = true;

        /* Continues rotating without drawing points. */
        this.infinite = true;

        /* Whether drawing is paused. */
        this.paused = false;

        /* Automatic termination. */
        this.completion = 0;
        this.current = 0;

        /* Trail. */
        this.trail = 0;

    }

    /* Count the number of arms. */
    get count() { return this.arms.length; }

    /* Get whether the spirograph has finished. */
    get finished() { return this.current >= this.completion; }

    /* Play and pause. */
    pause() { this.paused = true; }
    play() { this.paused = false; }

    /* Clear the spirograph. */
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.points = [];
    }

    /* Recalculate spirograph timing. */
    recalculate() {
        let gcds = [];
        for (let i = 0; i < this.arms.length; i++)
            gcds[i] = 360 / gcd(Math.abs(this.arms[i].velocity) || 0, 360);
        this.completion = gcds.reduce(lcm) * this.precision + 2;
    }

    /* Reset and clear the spirograph. */
    reset() {
        this.pause();
        this.clear();
        this.current = 0;
        for (let arm of this.arms)
            arm.reset();
        this.recalculate();
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
        if (this.count <= 1)
            return;
        this.pause();
        let index = this.arms.indexOf(arm);
        this.arms.splice(index, 1);
        this.reset();
        return index;
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
        if (!this.finished || this.trail) {
            this.points.push([x, y]);
            if (this.trail > 0)
                this.points.splice(0, this.points.length - this.trail);
        } else if (this.trail > 0) {
            this.points.splice(this.trail.length - 1, 1);
        }
        context.stroke();
    }
    
    drawPoints(context) {
        context.beginPath();
        if (this.points.length <= 1) return;
        let first = this.points[0];
        context.moveTo(first[0], first[1]);
        for (let point of this.points.slice(1))
            context.lineTo(point[0], point[1]);
        context.stroke();
    }

    update() {
        if (!this.paused) {
            for (let arm of this.arms)
                arm.angle += arm.velocity;
            this.current++;
        }
    }

    draw() {
        requestAnimationFrame(this.draw.bind(this));
        let canvas = this.canvas;
        let context = this.context;
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.update();
        if (!this.finished || this.infinite)
            this.drawArms(context, canvas);
        this.drawPoints(context, canvas);
    }

    start() {
        this.draw();
        //setInterval(this.update.bind(this), 1000 / 60);
    }

    toJSON() {
        let arms = [];
        for (let arm of this.arms)
            arms.push(arm.toJSON());
        return {arms: arms, independent: this.independent, infinite: this.infinite}
    }

}
