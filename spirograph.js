
function Point(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

var P = Point;

function Line(a, b) {
    this.a = a;
    this.b = b;
}

function Drawing(points) {
    this.points = points || [];
    this.last = null;
    this.line = function(l) { 
        this.points.push(l.a);
        this.points.push(l.b);
    }
    this.point = function(p) {
        if (this.last) {
            this.points.push(this.last);
            this.points.push(p);
        }
        this.last = p;
    }
}

function Engine(canvas) {

    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.azimuth = 0;
    this.elevation = 0;
    this.scale = 200;
    this.nearToEye = 5;
    this.nearToObject = 10;
    
    this.drawings = [];
    
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
        that.azimuth -= (e.x - mouseX) / 360;
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
        
        context.strokeStyle = "black";
        context.beginPath();
        
        for (var i = 0; i < this.drawings.length; i++) {
            var last, x, y;
            var points = this.drawings[i].points;
            for (var j = 0; j < points.length; j++) {
                var point = points[j];
                if (point != last) {
                    var x0 = point.x;
                    var y0 = point.y;
                    var z0 = point.z;
                    var x1 = cosT * x0 + sinT * z0;
                    var y1 = -sinTsinP * x0 + cosP * y0 + cosTsinP * z0;
                    var z1 = cosTcosP * z0 - sinTcosP * x0 - sinP * y0;
                    var x1 = x1 * nearToEye / (z1 + nearToEye + nearToObject);
                    var y1 = y1 * nearToEye / (z1 + nearToEye + nearToObject);
                    var $x = width / 2 + scale * x1;
                    var $y = height / 2 - scale * y1;
                    
                    //if (j % 2 == 0) 
                    context.lineTo($x, $y);
                    //else context.moveTo($x, $y);
                    x = $x;
                    y = $y;
                }
                last = point;   
            }
        }
        
        context.stroke();
    }
    
    this.render = function() {
        requestAnimationFrame(this.render.bind(this));
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
    }
    
}

var engine;
window.onload = function() {
    engine = new Engine(document.getElementById("canvas"));
    var cube = new Drawing();
    cube.point(new P(1, -1, 1));
    cube.point(new P(1, 1, 1));
    cube.point(new P(-1, 1, 1));
    cube.point(new P(-1, -1, 1));
    cube.point(new P(-1, -1, -1));
    cube.point(new P(1, -1, -1));
    cube.point(new P(1, 1, -1));
    cube.point(new P(-1, 1, -1));
    cube.point(new P(-1, -1, -1));
    engine.drawings.push(cube);
    engine.render();
}
