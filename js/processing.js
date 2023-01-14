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

// contours
let contours;
let hierarchy;

let hull;

let contourSelected;

// image original
let imgOriginal;
let dsizeOriginal;

let resizeCoef = 1;

let widthResized;
let heightResized;

let contours_poly;
let boundRect;

// Cette valeur determine si oui ou non on considère le contour comme un rectangle
// approximation très précise du contour = épsilon petit.
// polygone approximé avec un nombre de points raisonnable = épsilon plus grand.
let epsilon = 55;

/**
 * Valeur à partir de laquelle on considère qu'il y a trop de contour ou non
 */
// for c.size()
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
    // globalProcessBasic();
    globalProcessBasicRect();
    // globalProcessAlgo1();
    // globalProcessAlgo2();
    // globalProcessBasicPerim();
}

/**
 * @brief Reformat image and finally create a gray image
 * @description Process to run before applying filters
 */
function filterPreProcess() {
    resizeImage();

    gray = new cv.Mat();
    bilateral = new cv.Mat();
    eq = new cv.Mat();
    edged = new cv.Mat();
    srcResized = new cv.Mat();
    img = new cv.Mat();

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

    // BGR to GRAY levels
    cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY)
    cv.imshow('canvasOutput4', gray);
}


/**
 * @brief Processus d'application de filtres sur l'image
 */
function filtersProcess() {
    test1 = new cv.Mat();

    // Billateral filter
    // cv.bilateralFilter(gray, gray, 25, 25, 25, cv.BORDER_DEFAULT)
    // cv.imshow('canvasOutput52', gray);

    let ksize = new cv.Size(7, 7);
    console.log('contourRatio:', contourRatio)
    console.log('contourRatioThreshold:', contourRatioThreshold)
    if(contourRatio > contourRatioThreshold) {
        cv.GaussianBlur(gray, gray, ksize, 0, 0, cv.BORDER_DEFAULT)
        cv.imshow('canvasOutput5', gray);
    }

    // // Equalize histoigram
    // cv.equalizeHist(gray, gray)
    // cv.imshow('canvasOutput6', gray);

    // Canny filter
    // canny150 + gaussian77 work aproximatively on noised image BUT arase some id card contour on not noised image
    // canny100 + gaussian77 work perfectly on noised image BUT arase some id card contour on not noised image
    console.log('hey:', 'hey')
    cv.Canny(gray, edged, 100, 0)
    console.log('ho:', 'ho')
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
function getContoursRatio(src) {
    let mat = new cv.Mat();
    cv.cvtColor(src, mat, cv.COLOR_BGR2GRAY)
    cv.Canny(mat, mat, 255, 255)

    let c = new cv.MatVector();
    let h = new cv.Mat();
    cv.findContours(mat, c, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    console.log('c.size():', c.size())
    console.log('imgElement.width:', imgElement.width)
    console.log('imgElement.height:', imgElement.height)

    let ratio;
    if(imgElement.width > imgElement.height){
        ratio = c.size()/imgElement.width;
    }
    else {
        ratio = c.size()/imgElement.height;
    }

    return ratio;
}

/**
 * Calcul un ratio des périmètres des contours en fonction de la taille de l'image
 * @param {*} src image dont on doit detecter les contours
 * @returns ratio
 */
function getContoursRatioPerim(src) {
    // let c = new cv.MatVector();
    // let h = new cv.Mat();

    let mat = new cv.Mat();
    cv.cvtColor(src, mat, cv.COLOR_BGR2GRAY)
    cv.Canny(mat, mat, 255, 255)

    let c = new cv.MatVector();
    let h = new cv.Mat();

    cv.findContours(mat, c, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    let perim = 0;

    for (let i = 0; i < c.size(); ++i) {
        perim = perim + cv.arcLength(c.get(i), false);
    }

    let ratio;
    if(imgElement.width > imgElement.height){
        ratio = perim/imgElement.width;
    }
    else {
        ratio = perim/imgElement.height;
    }

    console.log('perim:', perim)
    console.log('ratio:', ratio)
    console.log('c.size():', c.size())

    return ratio;
}

/**
 * Calcul un ratio des aires des bounding rectangles des contours en fonction de la taille de l'image
 * @param {*} src image dont on doit detecter les contours
 * @returns ratio
 */
function getContoursRatioArea(src) {
    // let c = new cv.MatVector();
    // let h = new cv.Mat();

    let mat = new cv.Mat();
    cv.cvtColor(src, mat, cv.COLOR_BGR2GRAY)
    cv.Canny(mat, mat, 255, 255)

    let c = new cv.MatVector();
    let h = new cv.Mat();

    cv.findContours(mat, c, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    // let perim = 0;
    let area = 0;

    for (let i = 0; i < c.size(); ++i) {
        // perim = perim + cv.arcLength(c.get(i), false);

        let contour_poly = new cv.Mat();
        // cv.approxPolyDP(contours.get(i), contour_poly, 3, true);
        cv.convexHull(c.get(i), contour_poly, false, true);
        let rect = cv.boundingRect(contour_poly);
        contour_poly.delete();

        area = area + rect.width*rect.height;
    }

    let ratio;
    if(imgElement.width > imgElement.height){
        ratio = area/imgElement.width;
    }
    else {
        ratio = area/imgElement.height;
    }

    console.log('area:', area)
    console.log('ratio:', ratio)
    console.log('c.size():', c.size())

    return ratio;
}


/**
 * @brief Créer des enveloppe convex (~polygone)
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
 * @brief Créer des reactangle approximées pour chaque contours trouvés
 * @description approxPolyDP va permettre d'estimer un polygon quelconque en fonction du contour
 * Ensuite la fonction boundingRect() va permettre d'estimer un rectangle à partir du polygon
 */
function createRect() {
    contours_poly = new cv.MatVector();
    boundRect = new cv.RectVector();

    for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i);
        let contour_poly = new cv.Mat();
        cv.approxPolyDP(contour, contour_poly, 3, true);
        contours_poly.push_back(contour_poly);

        let rect = cv.boundingRect(contour_poly);
        boundRect.push_back(rect);
    }
}


// Draw all contours found on the image
function drawAllContours() {
    console.log('hey')
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
 * Trouve les coins de la CNI et crop + homogrpahie et produit donc une image de la CNI rognée
 */
function findCorners(){
    // epsilon = .05 * cv.arcLength(biggestContourHulled, false);
    // console.log('epsilon:', epsilon)
    // let approx = new cv.Mat();
    // let approx2 = new cv.Mat();
    // cv.approxPolyDP(biggestContourHulled, approx, .05 * cv.arcLength(biggestContourHulled, false), true);
    // cv.approxPolyDP(biggestContourHulled, approx, 100, true);
    // cv.approxPolyDP(contourSelected, approx2, 3, true);
    // let approx = cv.boundingRect(approx2);
    // console.log('approx:', approx)

    let green = new cv.Scalar(0,0,255);
    let contourVec = new cv.MatVector();
    contourVec.push_back(biggestContourHulled2);
    // Draw the bigest contour on the image
    cv.drawContours(img4, contourVec, 0, green, 3, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img4, img4, cv.COLOR_BGR2RGB)
    cv.imshow('canvasOutput54', img4);

    if (biggestContourHulled2.rows == 4) {
        console.log('Found a 4-corner approx');
        foundContour = biggestContourHulled2;
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