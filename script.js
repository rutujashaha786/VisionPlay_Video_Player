
let video = "";
let isPlaying = false;
let currentPlayTime;
let duration;
let timerObj;


/******************* Handle Input *******************/
const videoInput = document.querySelector("#video-input");
const videoBtn = document.querySelector("#videoBtn");

const handleInput = function () {
    videoInput.click();
    videoInput.value = '';
}

videoBtn.addEventListener("click", handleInput);


/******************* Accept Input *******************/
const videoPlayer = document.querySelector("#video-player");
const totalTimeElem = document.querySelector("#totalTime");
const currentTimeElem = document.querySelector("#currentTime");

const acceptInputHandler = function (eventObj) {

    let selectedFile;
    if (eventObj.type == "drop") {
        selectedFile = eventObj.dataTransfer.files[0]

    } else {
        selectedFile = eventObj.target.files[0];
    }

    if (!selectedFile.type.startsWith('video/')) {
        stopHandler();
        showToast('Invalid file type. Please select a video file.', 5000);
        return;
    }

    const link = URL.createObjectURL(selectedFile);
    const videoElement = document.createElement("video");
    videoElement.src = link;
    videoElement.setAttribute("class", "video");

    if (videoPlayer.children.length > 0) {
        // if present -> remove it 
        videoPlayer.removeChild(videoPlayer.children[0]);
    }

    videoPlayer.appendChild(videoElement);

    video = videoElement;
    isPlaying = true;
    setPlayPause();
    videoElement.volume = 0.3;
    slider.value = 0;

    videoElement.addEventListener("loadedmetadata", function () {
        duration = Math.round(videoElement.duration); //get duration in secs (whole number)
        let time = timeFormat(duration); // convert seconds into hrs:mins:secs
        totalTimeElem.innerText = time;
        currentTimeElem.innerText = "00:00:00";
        slider.setAttribute("max", duration);
        startTimer();
    })

}

videoInput.addEventListener("change", acceptInputHandler);

/******************* volume and speed *******************/
const speedUp = document.querySelector("#speedUp");
const speedDown = document.querySelector("#speedDown");
const volumeUp = document.querySelector("#volumeUp");
const volumeDown = document.querySelector("#volumeDown");
const toast = document.querySelector(".toast");


const speedUpHandler = function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }
    if (videoElement.playbackRate > 3) {
        return;
    }
    videoElement.playbackRate = videoElement.playbackRate + 0.5;
    showToast(videoElement.playbackRate + "X");
}

const speedDownHandler = function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }
    if (videoElement.playbackRate < 0.5) {
        return;
    }
    videoElement.playbackRate = videoElement.playbackRate - 0.5;
    showToast(videoElement.playbackRate + "X");
}

const volumeUpHandler = function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }
    if (videoElement.volume > 0.9) {
        return;
    }
    videoElement.volume = videoElement.volume + 0.1;
    showToast((Math.round(videoElement.volume * 100)) + "%");
}

const volumeDownHandler = function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }
    if (videoElement.volume < 0.1) {
        return;
    }
    videoElement.volume = videoElement.volume - 0.1;
    showToast((Math.round(videoElement.volume * 100)) + "%");
}

function showToast(message, timeOut = 1000) {
    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(function () {
        toast.style.display = "none";
    }, timeOut);
}

speedUp.addEventListener("click", speedUpHandler);
speedDown.addEventListener("click", speedDownHandler);
volumeUp.addEventListener("click", volumeUpHandler);
volumeDown.addEventListener("click", volumeDownHandler);

/*********** controls ****************************************/
const fullscreenBtn = document.querySelector("#fullscreenBtn");
const slider = document.querySelector("#slider");

const fullscreenHandler = function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }
    videoElement.requestFullscreen();
}

fullscreenBtn.addEventListener("click", fullscreenHandler);

slider.addEventListener("change", function (e) {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        slider.value = 0;
        return;
    }

    let value = e.target.value;
    video.currentTime = value;
});

/*********** forward and backward button *************/
const forwardBtn = document.querySelector("#fwdBtn");
const backwardBtn = document.querySelector("#backBtn");

const forward = function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }

    currentPlayTime = Math.round(video.currentTime) + 5;
    video.currentTime = currentPlayTime;
    slider.value = currentPlayTime;

    if (currentPlayTime > duration) {
        currentTimeElem.innerText = timeFormat(duration);
    }
    else {
        currentTimeElem.innerText = timeFormat(currentPlayTime);
    }
    showToast("Forward by 5 sec");
}

const backward = function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }

    currentPlayTime = Math.round(video.currentTime) - 5;
    video.currentTime = currentPlayTime;
    slider.value = currentPlayTime;

    if (currentPlayTime < 0) {
        currentTimeElem.innerText = timeFormat(0);
    }
    else {
        currentTimeElem.innerText = timeFormat(currentPlayTime);
    }
    showToast("Backward by 5 sec");  
}

forwardBtn.addEventListener("click", forward);
backwardBtn.addEventListener("click", backward);

/*********************** stop btn *************************/
const stopBtn = document.querySelector("#stopBtn");
const stopHandler = () => {
    if (video) {
        stopTimer();
        isPlaying = false;
        setPlayPause();
        // remove the video from UI 
        video.remove();
        // reset all the variables
        video = null; 
        slider.value = 0;
        totalTimeElem.innerText = '--/--/--';
        currentTimeElem.innerText = '--/--/--';
        videoPlayer.innerHTML = '<img src="./Media_Player.png" alt="videothumbnail-image" class="thumbnail">';
    }
    
}
stopBtn.addEventListener("click", stopHandler)

/****************play pause********************/
const playPauseContainer = document.querySelector("#playPause");
function setPlayPause() {
    if (isPlaying === true) {
        if (Math.round(video.currentTime) == duration) {
            slider.value = 0;
            currentTimeElem.innerText = "00:00:00";
            video.currentTime = 0;
        }
        playPauseContainer.innerHTML = `<i class="fas fa-pause"></i>`;
        video.play();
    }
    else {
        playPauseContainer.innerHTML = `<i class="fas fa-play"></i>`;
        video.pause();
    }
}

playPauseContainer.addEventListener("click", function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }
    isPlaying = !isPlaying;
    setPlayPause();
})

/*************** utility function to convert secs into hrs :mns : seconds *****************/
function timeFormat(timeCount) {
    let time = '';
    // const sec = parseInt(timeCount, 10);
    const sec = timeCount;
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);
    if (hours < 10)
        hours = "0" + hours;
    if (minutes < 10)
        minutes = "0" + minutes;
    if (seconds < 10)
        seconds = "0" + seconds
    time = `${hours}:${minutes}:${seconds}`;
    return time;
}

// function that runs the slider and timer 
function startTimer() {
    timerObj = setInterval(function () {
        currentPlayTime = Math.round(video.currentTime); //when video plays, currentTime updates automatically
        slider.value = currentPlayTime;
        const time = timeFormat(currentPlayTime);
        currentTimeElem.innerText = time;

        if (currentPlayTime == duration) {
            isPlaying = false;
            setPlayPause();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerObj);
}

/********************** enable drag and drop **********************/
// Prevent default behavior for dragover and dragleave events
videoPlayer.addEventListener('dragenter', (e) => {
    e.preventDefault();
})

videoPlayer.addEventListener('dragover', (e) => {
    e.preventDefault();
})

videoPlayer.addEventListener('dragleave', (e) => {
    e.preventDefault();
})

videoPlayer.addEventListener('drop', (e) => {
    e.preventDefault();
    acceptInputHandler(e);
})

/********* keyboard support ***************/
const body = document.querySelector("body");
// keyboard inputs
body.addEventListener("keydown", function (e) {
    if (!video) return;
    if (e.code == "Space") {
        isPlaying = !isPlaying
        setPlayPause();
    }
    else if (e.key == "ArrowUp") {
        e.preventDefault();
        volumeUpHandler()
    }
    else if (e.key == "ArrowDown") {
        e.preventDefault();
        volumeDownHandler();
    }
    else if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault(); // Prevent default browser action for this key combination
        speedUpHandler(); 
    }
    else if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault(); // Prevent default browser action for this key combination
        speedDownHandler();
    }
    else if (e.key == "ArrowRight") {
        e.preventDefault();
        forward();
    }
    else if (e.key == "ArrowLeft") {
        e.preventDefault();
        backward();
    }
})