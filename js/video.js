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


// -----------------------------------


function startVideo() {
    setVariables();
    let video = document.getElementById("videoInput"); // video is the id of video tag
    video.width = 640;
    video.height = 480;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(function(stream) {
        video.srcObject = stream;
        video.play();
    
        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        // let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let cap = new cv.VideoCapture(video);
    
        // cap.read(src)
        // cv.imshow("canvasOutput", src);
    
        const FPS = 30;
    
        function processVideo() {
          try {
            const memUsedBefore = window.performance.memory['usedJSHeapSize']; //Used memory before executing processVideo (in bytes)
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
            // document.getElementById("canvasOutput").getContext("2d", { willReadFrequently: true })
            // schedule the next one.
            let delay = 1000 / FPS - (Date.now() - begin);
            //Subtract memUsedBefore from the current allocated heap size
            const additionalMemUsed = window.performance.memory['usedJSHeapSize'] - memUsedBefore;
            console.log('additionalMemUsed:', additionalMemUsed)
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
}





// --------------------------------








// var canvas
// var canvas2
// var ctx
// var ctx2;
// var video;
// var webcamWidth;
// var webcamHeight;

// var start;
// var end;

// navigator.getUserMedia = (
//   navigator.getUserMedia ||
//   navigator.webkitGetUserMedia ||
//   navigator.mozGetUserMedia ||
//   navigator.msGetUserMedia
// );


// function startWebcam() {
//     canvas = document.getElementById("canvasOutput")
//     // canvas2 = document.getElementById("myCanvas2")
//     video = document.getElementById('videoInput')
   
//    ctx = canvas.getContext('2d')
//    const mediaSource = new MediaSource();
 
//    if (navigator.getUserMedia) {
//      navigator.getUserMedia (
//        {
//          video: true,
//          audio: false
//        },
 
//        function(stream) {
//          webcamWidth = stream.getVideoTracks()[0].getSettings().width
//          webcamHeight = stream.getVideoTracks()[0].getSettings().height
//          canvas.setAttribute('width', webcamWidth);
//          canvas.setAttribute('height', webcamHeight);
//         //  canvas2.setAttribute('width', 300);
//         //  canvas2.setAttribute('height', 300);
 
//          // video.src = window.URL.createObjectURL(localMediaStream);
//          video.srcObject = stream
//          video = document.getElementById('videoInput');
 
//          if (navigator.mediaDevices.getUserMedia) {
             
//             // ctx.drawImage(video, 0, 0);
//             // const img_dataURI = canvas.toDataURL('image/png');
//             // document.getElementById("myCanvas").src = img_dataURI



//              video.srcObject = stream;
//              console.log('IFFFF')
//            } else {
//             console.log('ELSEEEE')
//              var vendorURL = window.URL || window.webkitURL;
//              video.src = vendorURL.createObjectURL(stream);
//            }
//            video.play();
//        },
 
//        function(err) {
//          console.log( err);
//        }
//      );
//    } else {
//    console.log("getUserMedia not supported by your browser");
//    }
//  }