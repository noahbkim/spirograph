/* Container for used elements. */
const e = {
    canvas: document.getElementById("canvas"),
    wrapper: document.getElementById("wrapper"),
    controls: document.getElementById("controls"),
    menu: document.getElementById("menu"),
};

/* Bind to menu click. */
e.menu.addEventListener("click", function() {
    e.wrapper.classList.toggle("centered");
    e.controls.classList.toggle("centered");
    e.menu.classList.toggle("centered");
});


const engine = new Engine(e.canvas);

e.canvas.addEventListener("click", function() {
    engine.reset();
    engine.play();
});

window.onload = function() {
    engine.start();
    engine.add(20, 2.0);
    engine.play();
};
