let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');

// temp img definition
let gray;
let bilateral;
let eq;
let edged;
let img;

// image original
let imgOriginal;
let dsizeOriginal;

let resizeCoef = 1;

let widthResized;
let heightResized;


let biggestContourHulled;

// clone img
let img2;
let img3;
let img4;
let img5;

// contours
let contours;
let hierarchy;

let hull;

let contourSelected;


let contours_poly;
let boundRect;

// Cette valeur determine si oui ou non on considère le contour comme un rectangle
// approximation très précise du contour = épsilon petit.
// polygone approximé avec un nombre de points raisonnable = épsilon plus grand.
let epsilon = 55;

/**
 * Valeur à partir de laquelle on considère qu'il y a trop de contour ou non
 */
let contourRatioThreshold = 1.5;
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

function initMats() {
    gray = new cv.Mat();
    bilateral = new cv.Mat();
    eq = new cv.Mat();
    edged = new cv.Mat();
    img = new cv.Mat();
    imgOriginal = new cv.Mat();

    contours_poly = new cv.MatVector();
    boundRect = new cv.RectVector();
}


imgElement.onload = function() {
    initMats();
    globalProcessBasicRect();
}


/**
 * @brief Pareil que global process basic mais avec le bounding rect (estimation de rectangle)
 */
function globalProcessBasicRect() {
    src = cv.imread(imgElement)

    contourRatio = getContoursRatio(src);

    resizeImage();

    filterPreProcess();

    // apply filters
    filtersProcess();

    // Create convex hulls from different contours
    createRect();

    // Draw all hulls + draw the bigest hull
    findLargestContourAndHullRect();

    findCorners();
}


/**
 * @brief Reformat image and finally create a gray image
 * @description Process to run before applying filters
 */
function filterPreProcess() {
    // get original image
    dsizeOriginal = new cv.Size(widthResized/resizeCoef, heightResized/resizeCoef);
    cv.resize(src, imgOriginal, dsizeOriginal, 0, 0, cv.INTER_AREA);
    cv.cvtColor(imgOriginal, imgOriginal, cv.COLOR_RGB2BGR)

    // img size wanted
    let dsize = new cv.Size(widthResized, heightResized);

    // resize img
    cv.resize(src, img, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow('canvasOutput2', img);

    // RGB to BGR
    cv.cvtColor(img, img, cv.COLOR_RGB2BGR)
    // cv.imshow('canvasOutput3', img);

    img2 = img.clone();
    img3 = img.clone();
    img4 = img.clone();
    img5 = img.clone();

    // BGR to GRAY levels
    cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY)
    cv.imshow('canvasOutput4', gray);
}


/**
 * @brief Processus d'application de filtres sur l'image
 */
function filtersProcess() {
    let ksize = new cv.Size(7, 7);
    if(contourRatio > contourRatioThreshold) {
        cv.GaussianBlur(gray, gray, ksize, 0, 0, cv.BORDER_DEFAULT)
        cv.imshow('canvasOutput5', gray);
    }

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
function getContoursRatio(src) {
    let mat = new cv.Mat();
    cv.cvtColor(src, mat, cv.COLOR_BGR2GRAY)
    cv.Canny(mat, mat, 255, 255)

    let c = new cv.MatVector();
    let h = new cv.Mat();
    cv.findContours(mat, c, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let ratio;
    if(imgElement.width > imgElement.height){
        ratio = c.size()/imgElement.width;
    }
    else {
        ratio = c.size()/imgElement.height;
    }

    mat.delete();
    c.delete();
    h.delete();

    return ratio;
}

/**
 * @brief Créer des reactangle approximées pour chaque contours trouvés
 * @description approxPolyDP va permettre d'estimer un polygon quelconque en fonction du contour
 * Ensuite la fonction boundingRect() va permettre d'estimer un rectangle à partir du polygon
 */
function createRect() {
    if(contours_poly) { 
        contours_poly.delete();
        contours_poly = new cv.MatVector();
    }
    if(boundRect) {
        boundRect.delete();
        boundRect = new cv.RectVector();
    }
    for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i);
        let contour_poly = new cv.Mat();
        cv.approxPolyDP(contour, contour_poly, 3, true);
        contours_poly.push_back(contour_poly);

        let rect = cv.boundingRect(contour_poly);
        boundRect.push_back(rect);
    }
}

/**
 * Draw all hulls + the bigest hull alone on the image
 * Compare bounding rect area of all contours (instead of perim or area of the contour)
 */
function findLargestContourAndHullRect() {
    contourSelected = contours.get(0).clone(); 

    for (let i = 0; i < contours.size(); ++i) {
        let contourPoly = new cv.Mat();
        // cv.approxPolyDP(contours.get(i), contourPoly, 3, true);
        cv.convexHull(contours.get(i), contourPoly, false, true);
        contours_poly.push_back(contourPoly);
        let rect = cv.boundingRect(contourPoly);
        boundRect.push_back(rect);
        contourPoly.delete();

        let contourPolySelected = new cv.Mat();
        // cv.approxPolyDP(contourSelected, contourPolySelected, 3, true);
        cv.convexHull(contourSelected, contourPolySelected, false, true);
        contours_poly.push_back(contourPolySelected);
        let rectSelected = cv.boundingRect(contourPolySelected);
        boundRect.push_back(rect);
        contourPolySelected.delete();

        let perimCurCtr = rect.width*rect.height;
        let perimBigCtr = rectSelected.width*rectSelected.height;

        if(perimCurCtr >= perimBigCtr){
            contourSelected=contours.get(i).clone();
        }
    }

    cv.cvtColor(img3, img3, cv.COLOR_BGR2RGB)
    cv.imshow('canvasOutput9', img3);

    // crete a empty MatVector and put the bigest contour in it
    let green = new cv.Scalar(0,255,0);
    let contourVec = new cv.MatVector();
    contourVec.push_back(contourSelected);

    // Draw the bigest contour hulled on the idcard
    let hull2 = new cv.MatVector();
    biggestContourHulled = new cv.Mat()
    biggestContourHulled2 = new cv.Mat()
    
    // Ici le fait de hulled le contour me permet dans findcorner de le faire passé en tant que rectangle
    // alors que le contour en lui même ne serait pas passé
    // le mieux serait d'utiliser la fonction boudingRect (utilisé dans findcorner2) mais pour l'instant l'homographie findcroner2 ne marche pas.
    // mais une fois ça résolut c'est good.
    cv.convexHull(contourSelected, biggestContourHulled, true, true);
    cv.approxPolyDP(biggestContourHulled, biggestContourHulled2, 100, true);
    hull2.push_back(biggestContourHulled2);

    cv.drawContours(img5, hull2, 0, green, 5, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img5, img5, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput10', img5);
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