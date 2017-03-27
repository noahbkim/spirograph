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
    mode: document.getElementById("mode"),
    text: document.getElementById("text"),
    editor: document.getElementById("editor"),
    randomize: document.getElementById("randomize"),
};



/* Instantiate the engine. */
const engine = new Engine(e.canvas);


function updateJSON() {
    e.editor.innerHTML = JSON.stringify(engine.toJSON(), null, 2);
}

function updateHTML() {
    while (e.arms.getChildren().length() > 1)
        e.arms.removeChild(e.arms.firstChild);
    for (let i = 0; i < engine.count; i++)
        e.arms.appendChild(armToHTML(engine.arms[i], i+1));
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
    header.classList.add("header");
    header.appendChild(summary);
    div.appendChild(header);

    let updateSummary = function() {
        summary.innerHTML = "(" + arm.length + ", " + arm.velocity + ")";
    };

    let menubar = document.createElement("span");
    menubar.classList.add("menubar", "right");
    header.appendChild(menubar);
    let randomize = document.createElement("span");
    randomize.classList.add("randomize");
    randomize.innerHTML = "&#x21cc;";
    menubar.appendChild(randomize);
    let dropdown = document.createElement("span");
    dropdown.classList.add("dropdown");
    dropdown.innerHTML = "&#x25b3;";
    menubar.appendChild(dropdown);

    if (number > 1) {
        let remove = document.createElement("span");
        remove.classList.add("remove");
        remove.innerHTML = "&#x2613;";
        menubar.appendChild(remove);
        remove.addEventListener("click", function() {
            removeArm(arm);
        });
    }

    let controls = document.createElement("div");
    controls.classList.add("controls", "closed");
    div.appendChild(controls);

    let toggleControls = function() {
        dropdown.classList.toggle("closed");
        controls.classList.toggle("closed");
    };

    dropdown.addEventListener("click", function() {
        toggleControls();
    });
    header.addEventListener("click", function(e) {
        if (e.target !== this && e.target !== summary)
            return;
        toggleControls();
    });

    let lengthContainer = document.createElement("div");
    controls.appendChild(lengthContainer);
    let lengthLabel = document.createElement("label");
    lengthLabel.innerHTML = "Length";
    lengthContainer.appendChild(lengthLabel);
    let lengthInput = document.createElement("input");
    lengthInput.type = "number";
    lengthInput.step = "1";
    lengthInput.value = arm.length;
    lengthContainer.appendChild(lengthInput);
    lengthInput.addEventListener("change", function() {
        arm.length = parseInt(this.value);
        engine.reset();
        engine.play();
        updateSummary();
    });

    let velocityContainer = document.createElement("div");
    controls.appendChild(velocityContainer);
    let velocityLabel = document.createElement("label");
    velocityLabel.innerHTML = "Velocity";
    velocityContainer.appendChild(velocityLabel);
    let velocityInput = document.createElement("input");
    velocityInput.type = "number";
    velocityInput.step = "0.001";
    velocityInput.value = arm.velocity;
    velocityInput.addEventListener("change", function() {
        arm.velocity = parseFloat(this.value);
        engine.reset();
        engine.play();
        div.updateSummary();
    });
    velocityContainer.appendChild(velocityInput);

    randomize.addEventListener("click", function() {
        randomizeArm(arm);
        updateSummary();
    });

    return div;
}


/* Arm functionality. */
function addArm(arm) {
    arm = arm || randomizeArmValues(new Arm());
    engine.add(arm);
    e.arms.insertBefore(armToHTML(arm, engine.count), e.arms.lastElementChild);
    engine.play();
    updateJSON();
}

function removeArm(arm) {
    let index = engine.remove(arm);
    e.arms.removeChild(e.arms.children[index]);
    engine.play();
    updateJSON();
}

function randomizeArm(arm) {
    randomizeArmValues(arm);
    engine.reset();
    engine.play();
    if (arm.control) {
        arm.control.updateSummary();
        arm.control.lengthInput.value = arm.length;
        arm.control.velocityInput.value = arm.velocity;
    }
    updateJSON();
}

function randomizeArmValues(arm) {
    arm.length = Math.floor(Math.random() * 55) + 5;
    arm.velocity = Math.floor(Math.random() * 40) / 4 - 5;
    return arm;
}


/* Bind to menu click. */
e.menu.addEventListener("click", function() {
    e.wrapper.classList.toggle("centered");
    e.controls.classList.toggle("centered");
    e.menu.classList.toggle("centered");
});

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
    addArm();
});

e.randomize.addEventListener("click", function() {
    for (let arm of engine.arms)
        randomizeArmValues(arm);
    engine.reset();
    engine.play();
    updateJSON();
    updateHTML();
});


e.mode.addEventListener("change", function() {
    if (this.value == "Default") {
        e.arms.style.display = "block";
        e.text.style.display = "none";
    } else if (this.value == "Text") {
        e.arms.style.display = "none";
        e.text.style.display = "block";
    }

});


e.canvas.addEventListener("click", function() {
    engine.reset();
    engine.play();
});

window.onload = function() {
    engine.start();
    addArm();
    engine.play();
};
