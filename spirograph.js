function gcd(a, b) { return !b ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }
function resize(array, length, fill) {
    var resized = new Array(length);
    for (var i = 0; i < length; i++) {
        if (i < array.length) resized[i] = array[i];
        else resized[i] = fill || 0;
    }
    return resized;
}

function Engine(canvas) {
    
    var context = canvas.getContext("2d");
    this.points = [];
    
    this.count = 1;
    this.velocities = [0];
    this.angles = [0];
    this.lengths = [20]
        
    this.completion = 0;
    this.current = 0;
    
    var x, y;
    
    // LCM {LCM a 360} {LCM b 360} {LCM c 360}  
    
    this.setCount = function(n) {
        this.count = n;
        this.velocities = resize(this.velocities, n);
        this.angles = resize(this.angles, n);
        this.lengths = resize(this.lengths, n, 20);
    }
    
    this.setVelocities = function(v) {
        this.reset();
        var gcds = [];
        for (var i = 0; i < this.count; i++) {
            this.velocities[i] = v[i];
            gcds[i] = 360 / gcd(v[i] || 0, 360);
        }
        this.completion = gcds.reduce(lcm) + 1;
    }
    
    this.reset = function() {
        this.current = 0;
        this.clear();
        for (var i = 0; i < this.count; i++) {
            this.velocities[i] = 1;
            this.angles[i] = 0;
            this.lengths[i] = 20;
        }
    }
    
    this.clear = function() {
        this.points = [];
    }
    
    this.drawArms = function() {
        context.beginPath();
        x = canvas.width / 2;
        y = canvas.height / 2;
        context.moveTo(x, y);
        for (var i = 0; i < this.count; i++) {
            var angle = this.angles[i];
            var length = this.lengths[i];
            x += length * Math.cos(angle * Math.PI / 180);
            y += length * Math.sin(angle * Math.PI / 180);
            context.lineTo(x, y);
        }
        this.points.push([x, y]);  // Also writes the new point
        context.stroke();
    }
    
    this.drawPoints = function() {
        context.beginPath();
        if (this.points.length <= 1) return;
        var first = this.points[0];
        context.moveTo(first[0], first[1]);
        for (var i = 1; i < this.points.length; i++) {
            var next = this.points[i];
            context.lineTo(next[0], next[1]);
        }
        context.stroke();
    }
    
    this.draw = function() {
        
        requestAnimationFrame(this.draw.bind(this));
        
        for (var i = 0; i < this.count; i++)
            this.angles[i] += this.velocities[i];
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.current++ < this.completion) 
            this.drawArms();
        
        this.drawPoints();
        
    }
    
}

var engine;

window.onload = function() {
    engine = new Engine(document.getElementById("canvas"));
    engine.setCount(3);
    engine.setVelocities([1.5, 2.0, 2.5])
    engine.draw();
}
