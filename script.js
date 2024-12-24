
let video = "";
let isPlaying = false;
let metadataLoaded = false;
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
    eventObj.preventDefault();
    eventObj.stopPropagation();

    let selectedFileObject;
    metadataLoaded = false;
    if (eventObj.type == "drop") {
        selectedFileObject = eventObj.dataTransfer.files[0];

    } else {
        selectedFileObject = eventObj.target.files[0];
    }

    if (!selectedFileObject.type.startsWith('video/')) { 
        stopHandler();
        showToast('Invalid file type. Please select a video file.', 5000);
        return;
    }

     // Supported formats
     const supportedTypes = ['video/mp4', 'video/webm', 'video/3gpp', 'video/quicktime'];
     // Check if the selected video format is supported
    if (!supportedTypes.includes(selectedFileObject.type)) {
        stopHandler();
        showToast('Unsupported video format. Please upload another video.', 5000);
        return;
    }

    const link = URL.createObjectURL(selectedFileObject);
    const videoElement = document.createElement("video");
    videoElement.src = link;
    videoElement.setAttribute("class", "video");
    videoElement.setAttribute('playsinline', ''); // Prevent full-screen on iOS
    videoElement.setAttribute('webkit-playsinline', '');
    videoElement.preload = "auto";

    if (videoPlayer.children.length > 0) {
        videoPlayer.removeChild(videoPlayer.children[0]);
    }

    videoPlayer.appendChild(videoElement);

    video = videoElement;

    const userAgentCheck = /iPad|iPhone|iPod/i.test(navigator.userAgent);
    if (userAgentCheck) {
        // Your iOS-specific logic here
        isPlaying = false;
    }
    else{
        isPlaying = true;
    }

    setPlayPause();
    videoElement.volume = 0.3;
    slider.value = 0;

    videoElement.addEventListener("loadedmetadata", function () {
        metadataLoaded = true;
        duration = Math.round(videoElement.duration); 
        let time = timeFormat(duration);
        totalTimeElem.innerText = time;
        currentTimeElem.innerText = "00:00:00";
        slider.setAttribute("max", Math.floor(videoElement.duration * 100));
        if(isPlaying){
            startTimer();
        }
        
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
    if (videoElement.playbackRate < 1) {
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
const slider = document.querySelector("#slider");

slider.addEventListener("input", function (e) {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        slider.value = 0;
        return;
    }

    let value = e.target.value / 100; 
    video.currentTime = value;
    currentTimeElem.innerText = timeFormat(Math.round(value));
});

/*********** forward and backward button *************/
const forwardBtn = document.querySelector("#fwdBtn");
const backwardBtn = document.querySelector("#backBtn");

const forward = function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }

    let adjustedTime = 5 * video.playbackRate;
    currentPlayTime = Math.round(video.currentTime + adjustedTime);

    if (Math.abs(currentPlayTime - video.duration) < 0.5) {
        currentPlayTime = video.duration; 
    }

    video.currentTime = currentPlayTime;
    slider.value = Math.floor(currentPlayTime * 100);

    if (currentPlayTime > video.duration) {
        currentTimeElem.innerText = timeFormat(duration);
    }
    else {
        currentTimeElem.innerText = timeFormat(Math.round(currentPlayTime));
    }
    showToast("Forward by 5 sec");
}

const backward = function () {
    const videoElement = document.querySelector("video");
    if (videoElement == null) {
        return;
    }

    let adjustedTime = 5 * video.playbackRate;
    currentPlayTime = Math.round(video.currentTime - adjustedTime);

    if (currentPlayTime < 0.5) {
        currentPlayTime = 0; 
    }

    video.currentTime = currentPlayTime;
    slider.value = Math.floor(currentPlayTime * 100);

    if (currentPlayTime < 0) {
        currentTimeElem.innerText = timeFormat(0);
    }
    else {
        currentTimeElem.innerText = timeFormat(Math.round(currentPlayTime));
    }
    showToast("Backward by 5 sec");  
}

forwardBtn.addEventListener("click", forward);
backwardBtn.addEventListener("click", backward);

/*********************** stop btn *************************/
const stopBtn = document.querySelector("#stopBtn");
const stopHandler = () => {
    if (video) {
        isPlaying = false;
        setPlayPause();
        // remove the video from UI 
        video.src = '';  
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
        if (Math.abs(video.currentTime - video.duration) < 0.01) { 
            video.currentTime = 0;
            slider.value = 0;
            currentTimeElem.innerText = "00:00:00"; 
        }
        playPauseContainer.innerHTML = `<i class="fas fa-pause"></i>`;
        video.play();
        if (metadataLoaded) {
            startTimer();  
        }
    }
    else {
        playPauseContainer.innerHTML = `<i class="fas fa-play"></i>`;
        video.pause();
        stopTimer();
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
    if (timerObj) {
        clearInterval(timerObj); 
    }

    timerObj = setInterval(function () {
        currentPlayTime = Math.round(video.currentTime); 
        slider.value = Math.floor(video.currentTime * 100);
        const time = timeFormat(currentPlayTime);
        currentTimeElem.innerText = time;
        if (video.currentTime == video.duration) {
            isPlaying = false;
            setPlayPause();
        }
    }, 30);
}

function stopTimer() {
    clearInterval(timerObj);
    timerObj = null; 
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
        e.preventDefault(); 
        speedUpHandler(); 
    }
    else if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault(); 
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

/******************* Mobile devices specific Handling *******************/
function adjustViewportHeight() {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
}

// Update on load and resize
window.visualViewport?.addEventListener('resize', adjustViewportHeight);
window.addEventListener('load', adjustViewportHeight);

// Check if the device supports touch
if ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches) {
    const btns = document.querySelectorAll(".btn");
    const listItems = document.querySelectorAll("li");
    const inputMenu = document.querySelector(".input-menu");

    function handleTap(elements) {
        elements.forEach(function(element) {
            element.addEventListener('click', function() {

                elements.forEach(function(innerElement) {
                    innerElement.classList.remove('tapped');
                });

                element.classList.add('tapped');
                
                setTimeout(function() {
                    element.classList.remove('tapped');
                }, 500);
            });
        });
    }

    handleTap(btns);
    handleTap(listItems);
    handleTap([inputMenu]);   
}