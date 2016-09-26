function gcd(a, b) { return !b ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }

function Engine(canvas) {
    
    var context = canvas.getContext("2d");
    this.count = 3;
    this.velocities = [0.5, 1.0, 2.0];
    this.angles = [0, 0, 0];
    this.lengths = [30, 30, 30];
    this.points = [];
    
    
    var total = ;
    var z = 0;
    
    var x, y;
    
    // LCM {LCM a 360} {LCM b 360} {LCM c 360}  
    
    this.draw = function() {
        
        requestAnimationFrame(this.draw.bind(this));
        
        console.log(z, total);
        if (++z >= total) return
        
        for (var i = 0; i < this.count; i++)
            //for (var j = i; j < this.count; j++)
                this.angles[i] += this.velocities[i];
        
        context.clearRect(0, 0, canvas.width, canvas.height);
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
        
        this.points.push([x, y]);
        
        if (this.points.length <= 1) return;
        var first = this.points[0];
        context.moveTo(first[0], first[1]);
        for (var i = 1; i < this.points.length; i++) {
            var next = this.points[i];
            context.lineTo(next[0], next[1]);
        }
        
        context.stroke();
        
    }
    
}

var engine;

window.onload = function() {
    engine = new Engine(document.getElementById("canvas"));
    engine.draw();
}
