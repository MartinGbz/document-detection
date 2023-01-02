let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');



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


let srcResizedOriginal;
let imgOriginal;
let dsizeOriginal;

let resizeCoef = 1;

let width;
let height;


let contours_poly;
let boundRect;
let centers;
let radius;

/**
 * Valeur à partir de laquelle on considère qu'il y a trop de contour ou non
 */
let contourRatioThreshold=1.5;
let contourRatio;

imgElement.addEventListener('load', (e) => {
    // console.log('Hauteur de l\'image:', imgElement.height);
    // console.log('Largeur de l\'image:', imgElement.width);

    // if(imgElement.width > imgElement.height){
    //     resizeCoef=500/imgElement.height;
    // }
    // else {
    //     resizeCoef=500/imgElement.width;
    // }

    // console.log('resizeCoef:', resizeCoef)

    // width = imgElement.width*resizeCoef;
    // height = imgElement.height*resizeCoef;

    // console.log('height:', height);
    // console.log('width:', width);



}, false);

inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
    //   console.log(imgElement);
    //   console.log(e.target.files[0]);
    //   console.log(e.target.files);
    //   console.log(e);
}, false);

function resizeImage() {
    console.log('original height', imgElement.height);
    console.log('original width', imgElement.width);

    if(imgElement.width > imgElement.height){
        resizeCoef=500/imgElement.height;
    }
    else {
        resizeCoef=500/imgElement.width;
    }

    console.log('resizeCoef:', resizeCoef)

    width = imgElement.width*resizeCoef;
    height = imgElement.height*resizeCoef;

    console.log('new height:', height);
    console.log('new width:', width);
}


imgElement.onload = function() {
    globalProcessBasic();
    // globalProcessAlgo1();
    // globalProcessAlgo2();
    // globalProcessBasicPerim();
}

function globalProcessBasic() {
    console.log('hey');

    // img read
    src = cv.imread(imgElement)

    contourRatio = getContoursRatio(src);
    console.log('getContoursRatio:', contourRatio)

    resizeImage();

    filterPreProcess();

    // apply filters
    filtersProcess();

    // show all contours found
    drawAllContours();

    // Create convex hulls from different contours
    // createConvexHulls();
    createTest();

    // Draw all hulls + draw the bigest hull
    findLargestContourAndHull();

    findCorners();
}


/**
 * Pareil que global process basic mais avec le calcul du contour raio avec les périmètres
 */
function globalProcessBasicPerim() {
    console.log('hey');

    // img read
    src = cv.imread(imgElement)

    let mat = new cv.Mat();
    cv.cvtColor(src, mat, cv.COLOR_BGR2GRAY)
    cv.Canny(mat, mat, 255, 255)
    contourRatio = getContoursRatio2(mat);
    console.log('getContoursRatio:', contourRatio)

    resizeImage();

    filterPreProcess();
    // apply filters
    filtersProcess();

    // show all contours found
    drawAllContours();

    // Create convex hulls from different contours
    createConvexHulls();

    // Draw all hulls + draw the bigest hull
    findLargestContourAndHull();

    findCorners();
}

/**
 * modification canny + gaussian blur
 * Utilise le nombre de contours
 */
function globalProcessAlgo1() {
    src = cv.imread(imgElement)

    resizeImage();

    filterPreProcess();
    // apply filters
    filtersProcess();

    manageFiltersParameters();
    // manageFiltersParameters2();
}

/**
 * modification gaussian blur uniquement
 * Utilise le contour ratio (calculer à partir du périmètre)
 */
function globalProcessAlgo2() {
    src = cv.imread(imgElement)

    let mat = new cv.Mat();
    cv.cvtColor(src, mat, cv.COLOR_BGR2GRAY)
    cv.Canny(mat, mat, 255, 255)
    contourRatio = getContoursRatio2(mat)
    console.log('contourRatio:', contourRatio)

    resizeImage();

    filterPreProcess();
    // apply filters
    filtersProcess();

    manageFiltersParameters2();
}

function filterPreProcess() {
    gray = new cv.Mat();
    bilateral = new cv.Mat();
    eq = new cv.Mat();
    edged = new cv.Mat();
    srcResized = new cv.Mat();
    img = new cv.Mat();

    srcResizedOriginal = new cv.Mat();
    imgOriginal = new cv.Mat();
    dsizeOriginal = new cv.Size(width/resizeCoef, height/resizeCoef);
    //resize img
    cv.resize(src, srcResizedOriginal, dsizeOriginal, 0, 0, cv.INTER_AREA);
    // RGB to BGR
    cv.cvtColor(srcResizedOriginal, imgOriginal, cv.COLOR_RGB2BGR)
    // cv.imshow('canvasOutput54', imgOriginal);

    
    // img size wanted
    let dsize = new cv.Size(width, height);

    //resize img
    cv.resize(src, srcResized, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow('canvasOutput2', srcResized);

    // RGB to BGR
    cv.cvtColor(srcResized, img, cv.COLOR_RGB2BGR)
    // cv.imshow('canvasOutput3', img);

    img2 = img.clone();
    img3 = img.clone();
    img4 = img.clone();
    img5 = img.clone();

    // BGR to GRAY levels
    cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY)
    cv.imshow('canvasOutput4', gray);
}

function filtersProcess() {
    test1 = new cv.Mat();

    // Billateral filter
    // cv.bilateralFilter(gray, test2, 25, 25, 25, cv.BORDER_DEFAULT)
    // cv.imshow('canvasOutput52', test2);


    let ksize = new cv.Size(7, 7);
    if(contourRatio > contourRatioThreshold) {
        cv.GaussianBlur(gray, gray, ksize, 0, 0, cv.BORDER_DEFAULT)
        cv.imshow('canvasOutput5', gray);
    }

    // Canny filter
    // canny150 + gaussian77 work aproximatively on noised image BUT arase some id card contour on not noised image
    // canny100 + gaussian77 work perfectly on noised image BUT arase some id card contour on not noised image
    cv.Canny(gray, edged, 100, 0)
    cv.imshow('canvasOutput7', edged);

    if(contours) {
        contours.delete();
    }
    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    cv.findContours(edged, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    console.log('---------------contours.size():', contours.size())
}


/**
 * En donnant une image grise en input on determine le meilleur combo canny + gaussian blur pour avoir un nombre de contours < à un threashold défini
 */
function manageFiltersParameters() {
    let gaussianKSize = [5,7,11,29];
    let gaussianKSizeIndex = 0;

    let cannyThreshold = [0,50,100,150,200,255];
    let cannyThresholdIndex = -1;
    const threashold = 50;

    while(!contours || contours.size() > threashold) {
        console.log('"test":', "test")
        cannyThresholdIndex++;
        if(cannyThresholdIndex == 6) {
            gaussianKSizeIndex++;
            cannyThresholdIndex = 0;
            console.log("hey")
        }
        if(cannyThresholdIndex == 7 || gaussianKSizeIndex == 5){
            console.log("ho")
            break;
        }

        let ksize = new cv.Size(gaussianKSize[gaussianKSizeIndex], gaussianKSize[gaussianKSizeIndex]);
        cv.GaussianBlur(gray, test1, ksize, 0, 0, cv.BORDER_DEFAULT)
        cv.imshow('canvasOutput5', test1);

        // Equalize histoigram
        cv.equalizeHist(test1, eq)
        cv.imshow('canvasOutput6', eq);

        // Canny filter
        cv.Canny(eq, edged, cannyThreshold[cannyThresholdIndex], 0)
        cv.imshow('canvasOutput7', edged);
        
        // find contours
        if(contours) {
            contours.delete();
        }
        contours = new cv.MatVector();
        hierarchy = new cv.Mat();
        cv.findContours(edged, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        console.log('---------------contours.size():', contours.size())
        console.log('gaussian: ', gaussianKSize[gaussianKSizeIndex])
        console.log('canny: ', cannyThreshold[cannyThresholdIndex])
        
    }

    // show all contours found
    drawAllContours();

    // Create convex hulls from different contours
    // createConvexHulls();
    createTest();

    // Draw all hulls + draw the bigest hull
    findLargestContourAndHull();

    findCorners();
}

/**
 * Pareil que manageFiltersParameters2 sauf que la on fait varier que le gaussian. Le canny lui reste à 100
 * Le ratio de contours ce caulcul via les perimettre des tous les contours.
 * Les contours sont récupérer à partir du canny
 */
function manageFiltersParameters2() {
    let gaussianKSize = [5,7,11,15,17,19];
    let gaussianKSizeIndex = -1;

    const threashold = 20000;

    console.log('contourRatio:', contourRatio)

    while(contourRatio > threashold) {
        gaussianKSizeIndex++;
        if(gaussianKSizeIndex == 5){
            console.log("ho")
            break;
        }

        // let ksize = new cv.Size(5, 5);
        let ksize = new cv.Size(gaussianKSize[gaussianKSizeIndex], gaussianKSize[gaussianKSizeIndex]);
        // let ksize = new cv.Size(29, 29);
        // let ksize = new cv.Size(11, 11);
        cv.GaussianBlur(gray, test1, ksize, 0, 0, cv.BORDER_DEFAULT)
        cv.imshow('canvasOutput5', test1);

        // Canny filter
        cv.Canny(test1, edged, 100, 0)
        cv.imshow('canvasOutput7', edged);
        
        contourRatio = getContoursRatio2(edged)
        console.log('contourRatio:', contourRatio)
        console.log('gaussian: ', gaussianKSize[gaussianKSizeIndex])
        
    }

    

    // show all contours found
    drawAllContours();

    // Create convex hulls from different contours
    createConvexHulls();

    // Draw all hulls + draw the bigest hull
    findLargestContourAndHull();

    findCorners();
}

/**
 * Calcul un ratio du nombre de contour en fonction de la taille de l'image
 * @param {*} src 
 * @returns ratio
 */
function getContoursRatio(src) {
    let mat = new cv.Mat();
    cv.cvtColor(src, mat, cv.COLOR_BGR2GRAY)
    cv.Canny(mat, mat, 255, 255)

    let c = new cv.MatVector();
    let h = new cv.Mat();
    cv.findContours(mat, c, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    console.log('AAA---------------contours.size():', c.size())

    let ratio;
    if(imgElement.width > imgElement.height){
        ratio = c.size()/imgElement.width;
    }
    else {
        ratio = c.size()/imgElement.height;
    }

    console.log('ratio:', ratio)

    return ratio;
}

/**
 * Calcul un ratio des périmètres des contours en fonction de la taille de l'image
 * @param {*} src 
 * @returns ratio
 */
function getContoursRatio2(src) {
    let c = new cv.MatVector();
    let h = new cv.Mat();
    cv.findContours(src, c, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    console.log('AAA---------------contours.size():', c.size())
    let perim = 0;

    for (let i = 0; i < c.size(); ++i) {
        perim = perim + cv.arcLength(c.get(i), false);
    }

    // console.log('perim:', perim)

    return perim;
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
}

function createPoly() {
    hull = new cv.MatVector();
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        cv.approxPolyDP(cnt, tmp, 3, true);

        hull.push_back(tmp);
        cnt.delete(); tmp.delete();
    }
}

function createTest() {
    contours_poly = new cv.MatVector();
    boundRect = new cv.RectVector();
    // centers = new cv.Point2fVector();
    radius = new cv.FloatVector();

    for (let i = 0; i < contours.size(); i++) {
        let contour = contours.get(i);
        let contour_poly = new cv.Mat();
        cv.approxPolyDP(contour, contour_poly, 3, true);
        contours_poly.push_back(contour_poly);

        let rect = cv.boundingRect(contour_poly);
        boundRect.push_back(rect);

        // let center = new cv.Point2f();
        // cv.minEnclosingCircle(contour_poly, center, radius.push_back(0));
        // centers.push_back(center);
    }

    console.log('centers:', centers)
    console.log('boundRect:', boundRect)
    
    // hull = new cv.MatVector();
    // let boundRect;
    // let rect;
    // let center;
    // for (let i = 0; i < contours.size(); ++i) {
    //     boundRect = new cv.RectVector();
    //     rect = cv.boundingRect(hull2);
    //     boundRect.push_back(rect);
    //     center = new cv.Point2f();
    //     cv.minEnclosingCircle(hull2, center, radius.push_back(0));
    //     centers.push_back(center);
    //     cv.drawContours(img5, hull2, i, green);
    //     cv.rectangle(img5, boundRect.get(i).tl(), boundRect.get(i).br(), color, 2);
    //     cv.circle(img5, centers.get(i), radius.get(i), color, 2);
    // }
}

// Draw all hulls + the bigest hull alone on the image
function findLargestContourAndHull() {
    // get first contours from contours array
    contourSelected = contours.get(0).clone(); 
    // explore contours and draw all of them on the img
    // fins the bigest contour
    for (let i = 0; i < contours.size(); ++i) {
        let red = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let green = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let blue = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0)); 

        let color =  new cv.Scalar(red,green, blue);  

        let perimCurCtr = cv.arcLength(contours.get(i), false);
        let perimBigCtr = cv.arcLength(contourSelected, false);
        // let areaCurCtr = cv.contourArea(contours.get(i), false);
        // let areaBigCtr = cv.contourArea(contours.get(i), false);

        if(perimCurCtr >= perimBigCtr){
            contourSelected=contours.get(i).clone();
        }

        console.log(boundRect.get(i))
        
        // cv.drawContours(img3, contours_poly, i, color, 1, cv.LINE_8, hierarchy, 0);
        
        // let rect = new cv.Rect(boundRect.get(i).x, boundRect.get(i).y, boundRect.get(i).width, boundRect.get(i).height);
        // cv.rectangle(img3, rect.tl(), rect.br(), color, 2);
        let topLeft = new cv.Point(boundRect.get(i).x, boundRect.get(i).y);
        let bottomRight = new cv.Point(boundRect.get(i).x + boundRect.get(i).width, boundRect.get(i).y + boundRect.get(i).height);
        cv.rectangle(img3, topLeft, bottomRight, color, 2);
    }

    console.log("contourSelected")
    console.log(cv.arcLength(contourSelected, false))

    cv.cvtColor(img3, img3, cv.COLOR_BGR2RGB)
    cv.imshow('canvasOutput9', img3);

    // crete a empty MatVector and put the bigest contour in it
    let green = new cv.Scalar(0,255,0);
    let contourVec = new cv.MatVector();
    contourVec.push_back(contourSelected);
    
    // Draw the bigest contour on the image
    // cv.drawContours(img4, contourVec, 0, green, 1, cv.LINE_8, hierarchy, 0);
    // cv.cvtColor(img4, img4, cv.COLOR_BGR2RGB)
    // cv.imshow('canvasOutput10', img4);

    // Draw the bigest contour hulled on the idcard
    let hull2 = new cv.MatVector();
    biggestContourHulled = new cv.Mat()
    // cv.convexHull(contourSelected, biggestContourHulled, true, true);
    cv.approxPolyDP(contourSelected, biggestContourHulled, 3, true);
    hull2.push_back(biggestContourHulled);

    cv.drawContours(img5, hull2, 0, green, 5, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img5, img5, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput10', img5);
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
    cv.imshow('canvasOutput8', img);
}

/**
 * Trouve les coins de la CNI et crop + homogrpahie et produit donc une image de la CNI rognée
 * @returns 
 */
function findCorners(){
    //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
    let approx = new cv.Mat();
    cv.approxPolyDP(biggestContourHulled, approx, .05 * cv.arcLength(biggestContourHulled, false), true);

    let green = new cv.Scalar(0,0,255);
    let contourVec = new cv.MatVector();
    contourVec.push_back(approx);
    // Draw the bigest contour on the image
    cv.drawContours(img4, contourVec, 0, green, 1, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img4, img4, cv.COLOR_BGR2RGB)
    // cv.imshow('canvasOutput54', img4);

    if (approx.rows == 4) {
        console.log('Found a 4-corner approx');
        foundContour = approx;
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
    let finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, theWidth/resizeCoef, 0, theWidth/resizeCoef, theHeight/resizeCoef, 0, theHeight/resizeCoef]);
    console.log('finalDestCoords:', finalDestCoords)
    let srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.corner.x/resizeCoef, tl.corner.y/resizeCoef, tr.corner.x/resizeCoef, tr.corner.y/resizeCoef, br.corner.x/resizeCoef, br.corner.y/resizeCoef, bl.corner.x/resizeCoef, bl.corner.y/resizeCoef]);
    let dsize = new cv.Size(theWidth/resizeCoef, theHeight/resizeCoef);
    // l'assemblage des coordonnées (des coins) reel de la carte sur l'image ET des dimension réel de la carte (distance entre les coorddonées)
    // permet de nous fournir un array de perspective
    let M = cv.getPerspectiveTransform(srcCoords, finalDestCoords)
    // on utilise cette array de perspective dans cette fonction, ce ui nous permet de faire l'homographie
    cv.warpPerspective(imgOriginal, finalDst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.cvtColor(finalDst, finalDst, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput11', finalDst);
}

function onOpenCvReady() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}