const video01 = document.getElementById("video01");
const playButton01 = document.getElementById("playButton01");

playButton01.addEventListener("click", function() {
    if (video01.paused) {
        video01.play();
    } else {
        video01.pause();
    }
});


const video02 = document.getElementById("video02");
const playButton02 = document.getElementById("playButton02");

playButton02.addEventListener("click", function() {
    if (video02.paused) {
        video02.play();
    } else {
        video02.pause();
    }
});


const video03 = document.getElementById("video03");
const playButton03 = document.getElementById("playButton03");

playButton03.addEventListener("click", function() {
    if (video03.paused) {
        video03.play();
    } else {
        video03.pause();
    }
});