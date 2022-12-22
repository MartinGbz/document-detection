// let video = document.getElementById("videoInput"); // video is the id of video tag
// let canvasFrame = document.getElementById("canvasOutput01"); // canvasFrame is the id of <canvas>
// let context = canvasFrame.getContext("2d");
// let src = new cv.Mat(height, width, cv.CV_8UC4);
// let dst = new cv.Mat(height, width, cv.CV_8UC1);
// const FPS = 30;

// window.addEventListener("load", (event) => {
//     console.log("page is fully loaded");
//     videoTest();
// });

// function videoTest() {
//     console.log('hey')
//     navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//     .then(function(stream) {
//         video.srcObject = stream;
//         video.play();
//         // schedule first one.
//         setTimeout(processVideo, 0);
//     })
//     .catch(function(err) {
//         console.log("An error occurred! " + err);
//     });
// }

// function processVideo() {
//     let begin = Date.now();
//     context.drawImage(video, 0, 0, width, height);
//     src.data.set(context.getImageData(0, 0, width, height).data);
//     cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
//     cv.imshow("canvasOutput02", dst); // canvasOutput is the id of another <canvas>;
//     // schedule next one.
//     let delay = 1000/FPS - (Date.now() - begin);
//     setTimeout(processVideo, delay);
// }






// let src;
// let dst;
// let cap;
// const FPS = 30;
// function processVideo() {
//     let begin = Date.now();
//     cap.read(src);
//     cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
//     cv.imshow("canvasOutput01", dst);
//     // schedule next one.
//     let delay = 1000/FPS - (Date.now() - begin);
//     setTimeout(processVideo, delay);
// }

// function onOpenCvReady() {
//     document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
//     console.log('hey')
//     src = new cv.Mat(960, 1440, cv.CV_8UC4);
//     dst = new cv.Mat(960, 1440, cv.CV_8UC1);
//     cap = new cv.VideoCapture('videoInput');
//     // schedule first one.
//     setTimeout(processVideo, 0);
// }
   