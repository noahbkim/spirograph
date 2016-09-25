
class Point {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
}

class Line {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}

function Engine(canvas) {

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.points = [];
    this.azimuth = 0;
    this.elevation = 0;
    this.scale = 20;
    this.nearToEye = 5;
    this.nearToObject = 1.5;
    
    var mouseX = null;
    var mouseY = null;
    var mouseDown = false;
    var that = this;
    window.addEventListener("mousedown", function(e) {
        mouseX = e.x;
        mouseY = e.y;
        mouseDown = true; 
    });
    window.addEventListener("mouseup", function() { mouseDown = false; });
    window.addEventListener("mousemove", function(e) {
        if (!mouseDown) return;
        that.azimuth += (e.x - mouseX) / 360;
        that.elevation += (e.y - mouseY) / 360;
        mouseX = e.x;
        mouseY = e.y;
    });
    
    this.draw = function() {
        var context = this.context;
        var height = this.canvas.height;
        var width = this.canvas.width;
        var scale = this.scale;
        var nearToEye = this.nearToEye;
        var nearToObject = this.nearToObject;
        var theta = Math.PI * this.azimuth;
        var phi = Math.PI * this.elevation;
        var cosT = Math.cos(theta);
        var sinT = Math.sin(theta);
        var cosP = Math.cos(phi);
        var sinP = Math.sin(phi);
        var cosTcosP = cosT * cosP;
        var sinTcosP = sinT * cosP;
        var cosTsinP = cosT * sinP;
        var sinTsinP = sinT * sinP;
        context.fillStyle = "black";
        context.beginPath();
        for (var i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            var x0 = point.x;
            var y0 = point.y;
            var z0 = point.z;
            var x1 = cosT * x0 + sinT * z0;
            var y1 = -sinTsinP * x0 + cosP * y0 + cosTsinP * z0;
            var z1 = cosTcosP * z0 - sinTcosP * x0 - sinP * y0;
            var x1 = x1 * nearToEye / (z1 + nearToEye + nearToObject);
            var y1 = y1 * nearToEye / (z1 + nearToEye + nearToObject);
            var x = width / 2 + scale * x1;
            var y = height / 2 - scale * y1;
            if (i > 0) context.lineTo(x, y);
            context.fillStyle = "black";
        }
        context.stroke();
    }
    
    this.render = function() {
        requestAnimationFrame(this.render.bind(this));
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
    }
    
}

window.onload = function() {
    var engine = new Engine(document.getElementById("canvas"));
    engine.points.push(new Point(0, 0, 1));
    engine.points.push(new Point(0, 0, -5));
    engine.points.push(new Point(0, 0, 0));
    engine.points.push(new Point(0, 5, 0));
    engine.points.push(new Point(0, -5, 0));
    engine.points.push(new Point(0, 0, 0));
    engine.points.push(new Point(5, 0, 0));
    engine.points.push(new Point(-5, 0, 0));
    engine.render();
}
