if (navigator.userAgent.indexOf("Safari") > -1 &&
    navigator.userAgent.indexOf("Chrome") == -1 &&
    navigator.userAgent.indexOf("Chromium") == -1)
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
    error: document.getElementById("error"),
    run: document.getElementById("run"),
    copy: document.getElementById("copy"),
};



/* Instantiate the engine. */
const engine = new Engine(e.canvas);


function updateJSON() {
    e.editor.value = JSON.stringify(engine.toJSON(), null, 2);
}

function updateHTML() {
    while (e.arms.children.length > 1)
        e.arms.removeChild(e.arms.firstChild);
    let add = e.arms.firstChild;
    for (let i = 0; i < engine.count; i++)
        e.arms.insertBefore(armToHTML(engine.arms[i], i+1), add);
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
        updateJSON();
    });

    let velocityContainer = document.createElement("div");
    controls.appendChild(velocityContainer);
    let velocityLabel = document.createElement("label");
    velocityLabel.innerHTML = "Velocity";
    velocityContainer.appendChild(velocityLabel);
    let velocityInput = document.createElement("input");
    velocityInput.type = "number";
    velocityInput.step = "0.01";
    velocityInput.value = arm.velocity;
    velocityInput.addEventListener("change", function() {
        arm.velocity = parseFloat(this.value);
        engine.reset();
        engine.play();
        updateSummary();
        updateJSON();
    });
    velocityContainer.appendChild(velocityInput);

    let startContainer = document.createElement("div");
    controls.appendChild(startContainer);
    let startLabel = document.createElement("label");
    startLabel.innerHTML = "Start angle";
    startContainer.appendChild(startLabel);
    let startInput = document.createElement("input");
    startInput.type = "number";
    startInput.step = "0.01";
    startInput.value = arm.start;
    startInput.addEventListener("change", function() {
        arm.start = parseFloat(this.value);
        engine.reset();
        engine.play();
        updateSummary();
        updateJSON();
    });
    startContainer.appendChild(startInput);

    randomize.addEventListener("click", function() {
        randomizeArm(arm);
        updateSummary();
    });

    arm.updateSummary = updateSummary;
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
    updateJSON();
}

function randomizeArmValues(arm) {
    arm.length = Math.floor(Math.random() * 55) + 5;
    arm.velocity = Math.floor(Math.random() * 40) / 4 - 5;
    return arm;
}


function loadJSON() {
    let json;
    try {
        json = JSON.parse(e.editor.value);
    } catch (exception) {
        e.error.innerText = "Invalid JSON!";
        return;
    }
    if (json.arms.length < 1) {
        e.error.innerText = "No arms defined!";
        return;
    }
    engine.pause();
    engine.independent = e.independent.checked = json.independent == true;
    engine.infinite = e.infinite.checked = json.infinite == true;
    engine.arms = [];
    for (let arm of json.arms) {
        if (!arm.hasOwnProperty("length")) {
            e.error.innerText = "Missing arm length!";
            return;
        }
        if (!arm.hasOwnProperty("velocity")) {
            e.error.innerText = "missing arm velocity!";
            return;
        }
        engine.arms.push(new Arm(arm.length, arm.velocity, arm.start));
    }
    updateHTML();
    engine.reset();
    engine.play();
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
    updateJSON();
});
e.independent.checked = engine.independent;

e.infinite.addEventListener("change", function() {
    engine.infinite = this.checked;
    updateJSON();
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

e.run.addEventListener("click", function() {
    loadJSON();
});

e.copy.addEventListener("click", function() {
    e.editor.focus();
    e.editor.select();
    document.execCommand("copy");
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
