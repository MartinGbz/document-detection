//IDEA:
// - cac-lculer le nombre de contours et en fonction de ça ça me permet de savor si je doit augementer le history equalizer ou pas

// temp img definition
let gray;
let bilateral;
let eq;
let edged;
let srcResized;
let img;
let biggestContourHulled;

// black image with the same size than img
// let blackImg;

// clone img
let img2;
let img3;
let img4;

// contours
let contours;
let hierarchy;

let hull;
let hull2;

let contourSelected;

let width = 1008;
let height = 756;

let green;

let ksize;

// imgElement.onload = function() {
//     globalProcess(src);
// }

function globalProcess(src) {
    // apply filters
    src = filtersProcess(src);

    // find contours
    contours = new cv.MatVector();
    // hierarchy = new cv.Mat();
    cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // // show all contours found
    // drawAllContours();

    // Create convex hulls from different contours
    createConvexHulls();

    // // Draw all hulls + draw the bigest hull
    if(contours.get(0)) {
        findLargestContourAndHull(); 
        // biggestContourHulled.delete();
    }

    // findCorners();
    // finalDst.delete();

    // hierarchy.delete();
    // img.delete();

    // img2 is created but when I returned it, the app crashed

    contours.delete();

    return img2;
}

function filtersProcess(src) {

    // cv.imshow('canvasOutput', src);

    // variablesglobales
    // linesTest = new cv.Mat();
    // srcResized = new cv.Mat();

    // if(img) {
    //     img.delete();
    // }

    // img = new cv.Mat();

    // img size wanted
    // let dsize = new cv.Size(width, height);

    //resize img
    // cv.resize(src, srcResized, dsize, 0, 0, cv.INTER_AREA);
    //cv.imshow('canvasOutput2', srcResized);

    // RGB to BGR
    cv.cvtColor(src, img, cv.COLOR_RGB2BGR)
    // cv.imshow('canvasOutput3', img);

    img2 = img.clone();
    img3 = img.clone();
    img4 = img.clone();

    // BGR to GRAY levels
    cv.cvtColor(img, img, cv.COLOR_BGR2GRAY)
    // cv.imshow('canvasOutput4', gray);

    // cv.cvtColor(src, img, cv.COLOR_RGBA2GRAY);

    // Billateral filter
    // cv.bilateralFilter(gray, bilateral, 5, 5, 5, cv.BORDER_CONSTANT)
    // cv.imshow('canvasOutput5', bilateral);


    // let ksize = new cv.Size(17, 17);
    // let ksize = new cv.Size(29, 29);
    // let ksize = new cv.Size(11, 11);
    
    cv.GaussianBlur(img, img, ksize, 0, 0, cv.BORDER_DEFAULT)



    // ----------------------------------------

    // Equalize histoigram
    cv.equalizeHist(img, img)
    //cv.imshow('canvasOutput6', eq);

    // Canny filter
    // cv.Canny(gray, edged, 200, 250)
    cv.Canny(img, img, 75, 200)
    //cv.imshow('canvasOutput7', edged);

    return img

    // cv.HoughLines(gray, linesTest, 1, Math.PI/180,15)
    // cv.imshow('canvasOutput51', linesTest);  

}

// Draw all contours found on the image
function drawAllContours() {
    for (let i = 0; i < contours.size(); ++i) {
        let red = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let green = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let blue = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0)); 
        let randomColor =  new cv.Scalar(red,green, blue);
        cv.drawContours(img, contours, i, randomColor, 1, cv.LINE_8, hierarchy, 1);
    }
    cv.cvtColor(img, img, cv.COLOR_BGR2RGB)
    //cv.imshow('canvasOutput8', img);
}

function createConvexHulls() {
    hull = new cv.MatVector();
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        cv.convexHull(cnt, tmp, false, true);

        hull.push_back(tmp);
        cnt.delete(); tmp.delete();
    }
    hull.delete();
}

// Draw all hulls + the bigest hull alone on the image
function findLargestContourAndHull() {
    // get first contours from contours array
    contourSelected = contours.get(0).clone(); 
    // explore contours and draw all of them on the img
    // fins the bigest contour
    for (let i = 0; i < contours.size(); ++i) {
        let perimCurCtr = cv.arcLength(contours.get(i), false);
        let perimBigCtr = cv.arcLength(contourSelected, false);
        // let areaCurCtr = cv.contourArea(contours.get(i), false);
        // let areaBigCtr = cv.contourArea(contours.get(i), false);

        if(perimCurCtr >= perimBigCtr){
            contourSelected=contours.get(i).clone();
        }
    }

    // console.log(cv.arcLength(contourSelected, false))

    // crete a empty MatVector and put the bigest contour in it
    
    // Draw the bigest contour hulled on the idcard
    // hull2 = new cv.MatVector();
    // biggestContourHulled = new cv.Mat()
    // let testa = new cv.MatVector();
    // let testb = new cv.MatVector();
    // testa.push_back(new cv.Mat());
    // testa.push_back(new cv.Mat());
    // testb.push_back(new cv.Mat());
    // testb.push_back(new cv.Mat());
    // for (let i = 0; i < testb.size(); i++) {
    //     testb.get(i).delete();
    //     console.log('deleted')
    // }
    // console.log('testa:', testa)
    // console.log('testa:', testa.length)
    // console.log('testb:', testb)
    // console.log('testb:', testb.length)
    // hull2.delete();
    // for (let i = 0; i < hull2.size(); i++) {
    //     hull2.get(i).delete();
    //     // console.log('deleted')
    // }
    hull2 = new cv.MatVector();
    cv.convexHull(contourSelected, biggestContourHulled, true, true);
    hull2.push_back(biggestContourHulled);
    // console.log('biggestContourHulled:', biggestContourHulled)
    // console.log('hull2:', hull2)
    cv.drawContours(img2, hull2, 0, green, 5, cv.LINE_8, hierarchy, 0);
    // the line below causes a crash
    // aka: 6480688 - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.
    cv.cvtColor(img2, img2, cv.COLOR_BGR2RGB, 0);

    hull2.delete();
    // biggestContourHulled.delete();
}

function findCorners(){
    //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
    let approx = new cv.Mat();
    cv.approxPolyDP(biggestContourHulled, approx, .05 * cv.arcLength(biggestContourHulled, false), true);

    let green = new cv.Scalar(0,0,255);
    let contourVec = new cv.MatVector();
    contourVec.push_back(approx);
    // Draw the bigest contour on the image
    cv.drawContours(img3, contourVec, 0, green, 1, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img3, img3, cv.COLOR_BGR2RGB)
    // cv.imshow('canvasOutput54', img3);

    if (approx.rows == 4) {
        console.log('Found a 4-corner approx');
        foundContour = approx;
    }
    else{
        console.log('No 4-corner large contour!');
        return;
    }

    approx.delete();

    //Find the corners
    //foundCountour has 2 channels (seemingly x/y), has a depth of 4, and a type of 12.  Seems to show it's a CV_32S "type", so the valid data is in data32S??
    let corner1 = new cv.Point(foundContour.data32S[0], foundContour.data32S[1]);
    let corner2 = new cv.Point(foundContour.data32S[2], foundContour.data32S[3]);
    let corner3 = new cv.Point(foundContour.data32S[4], foundContour.data32S[5]);
    let corner4 = new cv.Point(foundContour.data32S[6], foundContour.data32S[7]);
    console.log(corner1)
    console.log(corner2)
    console.log(corner3)
    console.log(corner4)

    //Order the corners
    let cornerArray = [{ corner: corner1 }, { corner: corner2 }, { corner: corner3 }, { corner: corner4 }];
    //Sort by Y position (to get top-down)
    cornerArray.sort((item1, item2) => { return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0; }).slice(0, 5);

    //Determine left/right based on x position of top and bottom 2
    let tl = cornerArray[0].corner.x < cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
    let tr = cornerArray[0].corner.x > cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
    let bl = cornerArray[2].corner.x < cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];
    let br = cornerArray[2].corner.x > cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];

    // Calculate the max width/height
    // ici on trouve la taille de chaque coté du rectangle en calculant l'hyptothénuse grâce au coordonées des points 
    let widthBottom = Math.hypot(br.corner.x - bl.corner.x, br.corner.y - bl.corner.y);
    let widthTop = Math.hypot(tr.corner.x - tl.corner.x, tr.corner.y - tl.corner.y);
    let theWidth = (widthBottom > widthTop) ? widthBottom : widthTop;
    let heightRight = Math.hypot(tr.corner.x - br.corner.x, tr.corner.y - br.corner.y);
    let heightLeft = Math.hypot(tl.corner.x - bl.corner.x, tr.corner.y - bl.corner.y);
    let theHeight = (heightRight > heightLeft) ? heightRight : heightLeft;

    console.log('theWidth:', theWidth)
    console.log('theHeight:', theHeight)
    //Transform!
    let finalDst = new cv.Mat();
    // row, col, type, array
    // For example, CV_8UC1 means a 8-bit single-channel array, CV_32FC2 means a 2-channel (complex) floating-point array.
    // let finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, theWidth - 1, 0, theWidth - 1, theHeight - 1, 0, theHeight - 1]);
    // ?, ?, taille haut, ?, taille bas, taille droite, ?, taille gauche
    let finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, theWidth, 0, theWidth, theHeight, 0, theHeight]);
    console.log('finalDestCoords:', finalDestCoords)
    let srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.corner.x, tl.corner.y, tr.corner.x, tr.corner.y, br.corner.x, br.corner.y, bl.corner.x, bl.corner.y]);
    let dsize = new cv.Size(theWidth, theHeight);
    // l'assemblage des coordonnées (des coins) reel de la carte sur l'image ET des dimension réel de la carte (distance entre les coorddonées)
    // permet de nous fournir un array de perspective
    let M = cv.getPerspectiveTransform(srcCoords, finalDestCoords)
    // on utilise cette array de perspective dans cette fonction, ce ui nous permet de faire l'homographie
    cv.warpPerspective(img4, finalDst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.cvtColor(finalDst, finalDst, cv.COLOR_BGR2RGB, 0);
    //cv.imshow('canvasOutput12', finalDst);

    // biggestContourHulled.delete();
}

function setVariables() {
    hierarchy = new cv.Mat();
    img = new cv.Mat();
    biggestContourHulled = new cv.Mat()
    green = new cv.Scalar(0,255,0);
    ksize = new cv.Size(5, 5);
    // hull2 = new cv.MatVector();
}

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    //   startWebcam();
    setVariables();
    startVideo();
  }