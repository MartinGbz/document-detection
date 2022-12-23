// let video = document.getElementById('videoInput');

// navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//     .then(function(stream) {
//         video.srcObject = stream;
//         video.play();
//     })
//     .catch(function(err) {
//         console.log("An error occurred! " + err);
//     });

// const FPS = 30;
// function processVideo() {
//     let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
//     let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
//     let cap = new cv.VideoCapture(video);
//     let begin = Date.now();
//     cap.read(src);
//     cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
//     cv.imshow("canvasOutput", dst);
//     // schedule next one.
//     let delay = 1000/FPS - (Date.now() - begin);
//     setTimeout(processVideo, delay);
// }

// // schedule first one.
// setTimeout(processVideo, 2000);


let video = document.getElementById("videoInput"); // video is the id of video tag
video.width = 640;
video.height = 480;
navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then(function(stream) {
    video.srcObject = stream;
    video.play();

    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    let cap = new cv.VideoCapture(video);

    const FPS = 30;
    function processVideo() {
      try {
        // if (!streaming) {
        //   // clean and stop.
        //   src.delete();
        //   dst.delete();
        //   return;
        // }
        let begin = Date.now();
        // start processing.
        cap.read(src);
        dst = globalProcess(src);
        // cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.imshow("canvasOutput", dst);
        // schedule the next one.
        let delay = 1000 / FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
      } catch (err) {
        console.error(err);
      }
    }

    // schedule the first one.
    setTimeout(processVideo, 0);
  })
  .catch(function(err) {
    console.log("An error occurred! " + err);
  });
