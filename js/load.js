function onOpenCvReady() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
  //   startWebcam();
  setVariables();
  startVideo();
}