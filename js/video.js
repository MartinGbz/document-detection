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
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let cap = new cv.VideoCapture(video);
    
        const FPS = 30;
    
        function processVideo() {
          try {
            // const memUsedBefore = window.performance.memory['usedJSHeapSize']; //Used memory before executing processVideo (in bytes)
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
            // const additionalMemUsed = window.performance.memory['usedJSHeapSize'] - memUsedBefore;
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