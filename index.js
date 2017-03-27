if (navigator.userAgent.indexOf("Safari") > -1)
    document.body.classList.add("safari");


/* Container for elements. */
const e = {
    canvas: document.getElementById("canvas"),
    wrapper: document.getElementById("wrapper"),
    controls: document.getElementById("controls"),
    menu: document.getElementById("menu"),
    arms: document.getElementById("arms"),
    independent: document.getElementById("independent"),
    infinite: document.getElementById("infinite"),
    add: document.getElementById("add"),
};


/* Bind to menu click. */
e.menu.addEventListener("click", function() {
    e.wrapper.classList.toggle("centered");
    e.controls.classList.toggle("centered");
    e.menu.classList.toggle("centered");
});


/* Instantiate the engine. */
const engine = new Engine(e.canvas);


/* Arm functionality. */
function addArm(arm) {
    engine.add(arm);
    e.arms.insertBefore(armToHTML(arm, engine.count), e.arms.lastElementChild);
    engine.play();
}

function removeArm(arm) {
    let index = engine.remove(arm);
    e.arms.removeChild(e.arms.children[index]);
    engine.play();
}


/* Create HTML controls for single arm. */
function armToHTML(arm, number) {

    /* This is why Angular was created... */
    let div = document.createElement("div");
    div.classList.add("arm");
    let header = document.createElement("span");
    header.innerHTML += "Arm " + number + "&nbsp;";
    let summary = document.createElement("span");
    summary.innerHTML = "(" + arm.length + ", " + arm.velocity + ")";
    header.appendChild(summary);
    div.appendChild(header);

    let menubar = document.createElement("span");
    menubar.classList.add("menubar", "right");
    header.appendChild(menubar);
    let dropdown = document.createElement("span");
    dropdown.classList.add("dropdown");
    dropdown.innerHTML = "&#x276C;";
    menubar.appendChild(dropdown);

    if (number > 1) {
        let remove = document.createElement("span");
        remove.classList.add("remove");
        remove.innerHTML = "&#x2a09;";
        menubar.appendChild(remove);
        remove.addEventListener("click", function() {
            removeArm(arm);
        });
    }

    let controls = document.createElement("div");
    controls.classList.add("controls");
    div.appendChild(controls);

    dropdown.controls = controls;
    dropdown.addEventListener("click", function() {
        this.classList.toggle("closed");
        this.controls.classList.toggle("closed");
    });

    let lengthLabel = document.createElement("label");
    lengthLabel.innerHTML = "Length: ";
    controls.appendChild(lengthLabel);
    let lengthValue = document.createElement("span");
    lengthValue.innerHTML = arm.length;
    lengthLabel.appendChild(lengthValue);
    let lengthInput = document.createElement("input");
    lengthInput.type = "number";
    lengthInput.step = "1";
    lengthInput.value = arm.length;
    controls.appendChild(lengthInput);
    lengthInput.addEventListener("input", function() {
        lengthValue.innerHTML = this.value;
    });
    lengthInput.addEventListener("change", function() {
        arm.length = parseInt(this.value);
        engine.reset();
        engine.play();
        summary.innerHTML = "(" + arm.length + ", " + arm.velocity + ")";
    });

    let velocityLabel = document.createElement("label");
    velocityLabel.innerHTML = "Velocity: ";
    controls.appendChild(velocityLabel);
    let velocityValue = document.createElement("span");
    velocityValue.innerHTML = arm.velocity;
    velocityLabel.appendChild(velocityValue);
    let velocityInput = document.createElement("input");
    velocityInput.type = "number";
    velocityInput.step = "0.001";
    velocityInput.value = arm.velocity;
    velocityInput.addEventListener("input", function() {
        velocityValue.innerHTML = this.value;
    });
    velocityInput.addEventListener("change", function() {
        arm.velocity = parseFloat(this.value);
        engine.reset();
        engine.play();
        summary.innerHTML = "(" + arm.length + ", " + arm.velocity + ")";
    });
    controls.appendChild(velocityInput);

    header.classList.add("header");
    return div;
}

e.independent.addEventListener("change", function() {
    engine.independent = this.checked;
    engine.reset();
    engine.play();
});
e.independent.checked = engine.independent;

e.infinite.addEventListener("change", function() {
    engine.infinite = this.checked;
});
e.infinite.checked = engine.infinite;

e.add.addEventListener("click", function() {
    addArm(new Arm(20, 0));
});


e.canvas.addEventListener("click", function() {
    engine.reset();
    engine.play();
});

window.onload = function() {
    engine.start();
    let arm = new Arm(20, 2.0);
    addArm(arm);
    engine.play();
};