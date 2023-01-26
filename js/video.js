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
            let begin = Date.now();
            cap.read(src);
            dst = globalProcess(src);
            cv.imshow("videoOutput", dst);
            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
          } catch (err) {
            console.error(err);
          }
        }
        setTimeout(processVideo, 0);
      })
      .catch(function(err) {
        console.log("An error occurred! " + err);
      });    
}