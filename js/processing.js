let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');

// temp img definition
let gray;
let bilateral;
let eq;
let edged;
let srcResized;
let img;
let biggestContourHulled;

// clone img
let img2;
let img3;
let img4;
let img5;
let img6;
let img7;
let img8;
let img9;

// contours
let contours;
let hierarchy;

let hull;

let contourSelected;

// image original
let imgOriginal;
let dsizeOriginal;

let resizeCoef;
let widthResized;
let heightResized;

let boundRect;

let ratioMat;
let ratioContours;
let hierarchyContours;

/**
 * Valeur à partir de laquelle on considère qu'il y a trop de contour ou non
 */
// for size
let contourRatioThreshold=1.5;
// for perim
// let contourRatioThreshold=15;
// fore area
// let contourRatioThreshold=50;

let contourRatio;

inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

function resizeImage() {
    if(imgElement.width > imgElement.height){
        resizeCoef=500/imgElement.height;
    }
    else {
        resizeCoef=500/imgElement.width;
    }

    widthResized = imgElement.width*resizeCoef;
    heightResized = imgElement.height*resizeCoef;
}


imgElement.onload = function() {
    initMats();
    // globalProcessBasic();
    // globalProcessBasicRect();
    // globalProcessAlgo1();
    // globalProcessAlgo2();
    globalProcessAlgo3();
    // globalProcessBasicPerim();
}

function initMats() {
    gray = new cv.Mat();
    bilateral = new cv.Mat();
    eq = new cv.Mat();
    edged = new cv.Mat();
    srcResized = new cv.Mat();
    img = new cv.Mat();

    ratioMat = new cv.Mat();
    ratioContours = new cv.MatVector();
    hierarchyContours = new cv.Mat();
}

/**
 * Reformat image and finally create a gray image
 * @description Process to run before applying filters
 */
function filterPreProcess() {
    resizeImage();

    // get original image
    let srcResizedOriginal = new cv.Mat();
    imgOriginal = new cv.Mat();
    dsizeOriginal = new cv.Size(widthResized/resizeCoef, heightResized/resizeCoef);
    cv.resize(src, srcResizedOriginal, dsizeOriginal, 0, 0, cv.INTER_AREA);
    cv.cvtColor(srcResizedOriginal, imgOriginal, cv.COLOR_RGB2BGR)

    // img size wanted
    let dsize = new cv.Size(widthResized, heightResized);

    //resize img
    cv.resize(src, srcResized, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow('canvasOutput2', srcResized);

    // RGB to BGR
    cv.cvtColor(srcResized, img, cv.COLOR_RGB2BGR)
    // cv.imshow('canvasOutput3', img);
    cv.imshow('canvasOutput6', img);

    img2 = img.clone();
    img3 = img.clone();
    img4 = img.clone();
    img5 = img.clone();
    img6 = img.clone();
    img7 = img.clone();
    img7 = img.clone();
    img8 = img.clone();
    img9 = img.clone();

    // BGR to GRAY levels
    cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY)
    cv.imshow('canvasOutput4', gray);
}


/**
 * Processus d'application de filtres sur l'image
 */
function filtersProcess() {

    // Billateral filter
    // cv.bilateralFilter(gray, gray, 25, 25, 25, cv.BORDER_DEFAULT)
    // cv.imshow('canvasOutput52', gray);

    let ksize = new cv.Size(7, 7);
    console.log('contourRatio:', contourRatio)
    console.log('contourRatioThreshold:', contourRatioThreshold)
    if(contourRatio > contourRatioThreshold) {
        // comment si utilisation de algo1 2 ou 3
        cv.GaussianBlur(gray, gray, ksize, 0, 0, cv.BORDER_DEFAULT)
        cv.imshow('canvasOutput5', gray);
    }

    // // Equalize histoigram
    // cv.equalizeHist(gray, gray)
    // cv.imshow('canvasOutput6', gray);

    // Canny filter
    cv.Canny(gray, edged, 100, 0)
    cv.imshow('canvasOutput7', edged);

    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    cv.findContours(edged, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
}

/**
 * Calcul un ratio du nombre de contour en fonction de la taille de l'image
 * @param {*} src image dont on doit detecter les contours
 * @returns ratio
 */
function getContoursRatioSize(src) {
    let ratio = 1;

    cv.cvtColor(src, ratioMat, cv.COLOR_BGR2GRAY)
    cv.Canny(ratioMat, ratioMat, 255, 255)

    cv.findContours(ratioMat, ratioContours, hierarchyContours, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    if(imgElement.width > imgElement.height){
        ratio = ratioContours.size()/imgElement.width;
    }
    else {
        ratio = ratioContours.size()/imgElement.height;
    }

    return ratio;
}

/**
 * Calcul un ratio des périmètres des contours en fonction de la taille de l'image
 * @param {*} src image dont on doit detecter les contours
 * @returns ratio
 */
function getContoursRatioPerim(src) {
    let ratio = 1;
    let perim = 0;

    cv.cvtColor(src, ratioMat, cv.COLOR_BGR2GRAY)
    cv.Canny(ratioMat, ratioMat, 255, 255)

    cv.findContours(ratioMat, ratioContours, hierarchyContours, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < ratioContours.size(); ++i) {
        perim = perim + cv.arcLength(ratioContours.get(i), false);
    }

    if(imgElement.width > imgElement.height){
        ratio = perim/imgElement.width;
    }
    else {
        ratio = perim/imgElement.height;
    }

    return ratio;
}

/**
 * Calcul un ratio des aires des bounding rectangles des contours en fonction de la taille de l'image
 * @param {*} src image dont on doit detecter les contours
 * @returns ratio
 */
function getContoursRatioArea(src) {
    let ratio = 1;
    let area = 0;

    cv.cvtColor(src, ratioMat, cv.COLOR_BGR2GRAY)
    cv.Canny(ratioMat, ratioMat, 255, 255)

    cv.findContours(ratioMat, ratioContours, hierarchyContours, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < ratioContours.size(); ++i) {
        let contour_poly = new cv.Mat();
        cv.convexHull(ratioContours.get(i), contour_poly, false, true);
        let rect = cv.boundingRect(contour_poly);
        contour_poly.delete();
        area = area + rect.width*rect.height;
    }

    if(imgElement.width > imgElement.height){
        ratio = area/imgElement.width;
    }
    else {
        ratio = area/imgElement.height;
    }

    return ratio;
}


/**
 * Créer des enveloppe convex (~polygone)
 */
function createConvexHulls() {
    hull = new cv.MatVector();
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        cv.convexHull(cnt, tmp, false, true);

        hull.push_back(tmp);
        cnt.delete(); tmp.delete();
    }
}


/**
 * Draw all contours found on the image
 */
function drawAllContours() {
    for (let i = 0; i < contours.size(); ++i) {
        let red = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let green = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let blue = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0)); 
        let randomColor =  new cv.Scalar(red,green, blue);
        cv.drawContours(img, contours, i, randomColor, 2, cv.LINE_8, hierarchy, 1);
    }
    cv.cvtColor(img, img, cv.COLOR_BGR2RGB)
    cv.imshow('canvasOutput8', img);
}


/**
 * Test l'approximation d'un contour pour un rectangle
 * @param {*} biggestContour 
 * @returns true if a rectangle is found and false if not found
 */
function testAprox(biggestContour) {
    // Cette valeur determine si oui ou non on considère le contour comme un rectangle
    // approximation très précise du contour = épsilon petit.
    // polygone approximé avec un nombre de points raisonnable = épsilon plus grand.
    let epsilon = 55;
    
    //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
    let approx = new cv.Mat();
    // cv.approxPolyDP(biggestContour, approx, .05 * cv.arcLength(biggestContour, false), true);
    cv.approxPolyDP(biggestContour, approx, epsilon, true);

    if (approx.rows == 4) {
        console.log('Found a 4-corner approx');
        return true;
    }
    else{
        console.log('No 4-corner large contour!');
        return false;
    }
}


/**
 * 
 * @returns true if a rectangle is found and false if not found
 */
function findCorners(){
    let green = new cv.Scalar(0,0,255);
    let contourVec = new cv.MatVector();
    contourVec.push_back(biggestContourHulled);
    // Draw the bigest contour on the image
    cv.drawContours(img4, contourVec, 0, green, 3, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img4, img4, cv.COLOR_BGR2RGB)
    cv.imshow('canvasOutput54', img4);

    if (biggestContourHulled.rows == 4) {
        console.log('Found a 4-corner approx');
        foundContour = biggestContourHulled;
    }
    else{
        console.log('No 4-corner large contour!');
        return;
    }

    //Find the corners
    //foundCountour has 2 channels (seemingly x/y), has a depth of 4, and a type of 12.  Seems to show it's a CV_32S "type", so the valid data is in data32S??
    let corner1 = new cv.Point(foundContour.data32S[0], foundContour.data32S[1]);
    let corner2 = new cv.Point(foundContour.data32S[2], foundContour.data32S[3]);
    let corner3 = new cv.Point(foundContour.data32S[4], foundContour.data32S[5]);
    let corner4 = new cv.Point(foundContour.data32S[6], foundContour.data32S[7]);

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

    let finalDst = new cv.Mat();
    let finalDestRotated = new cv.Mat();

    // row, col, type, array
    // For example, CV_8UC1 means a 8-bit single-channel array, CV_32FC2 means a 2-channel (complex) floating-point array.
    // let finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, theWidth - 1, 0, theWidth - 1, theHeight - 1, 0, theHeight - 1]);
    // ?, ?, taille haut, ?, taille bas, taille droite, ?, taille gauche
    let finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, theWidth/resizeCoef, 0, theWidth/resizeCoef, theHeight/resizeCoef, 0, theHeight/resizeCoef]);
    console.log('finalDestCoords:', finalDestCoords)
    let srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.corner.x/resizeCoef, tl.corner.y/resizeCoef, tr.corner.x/resizeCoef, tr.corner.y/resizeCoef, br.corner.x/resizeCoef, br.corner.y/resizeCoef, bl.corner.x/resizeCoef, bl.corner.y/resizeCoef]);
    let dsize = new cv.Size(theWidth/resizeCoef, theHeight/resizeCoef);
    
    // l'assemblage des coordonnées (des coins) reel de la carte sur l'image ET des dimension réel de la carte (distance entre les coorddonées)
    // permet de nous fournir un array de perspective
    let M = cv.getPerspectiveTransform(srcCoords, finalDestCoords)
    
    // on utilise cet array de perspective dans cette fonction, ce ui nous permet de faire l'homographie
    cv.warpPerspective(imgOriginal, finalDst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.cvtColor(finalDst, finalDst, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput11', finalDst);
    // document.getElementById('canvasOutput11').width
    console.log('width:', document.getElementById('canvasOutput11').width)
    console.log('height:', document.getElementById('canvasOutput11').height)
    if(document.getElementById('canvasOutput11').height > document.getElementById('canvasOutput11').width) {
        // finalDestRotated = finalDst.rotate(cv.ROTATE_90_COUNTERCLOCKWISE);
        // Créez une matrice de rotation de 2x3
        cv.rotate(finalDst, finalDestRotated, cv.ROTATE_90_COUNTERCLOCKWISE);
        // const rotationMatrix = cv.getRotationMatrix2D(new cv.Point(finalDst.cols / 2, finalDst.rows / 2), 90, 1);

        // Appliquez la transformation de rotation à l'image
        // finalDestRotated = finalDst.warpAffine(rotationMatrix, new cv.Size(finalDst.cols, finalDst.rows));
    }
    cv.imshow('canvasOutput12', finalDestRotated);
}


function onOpenCvReady() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}