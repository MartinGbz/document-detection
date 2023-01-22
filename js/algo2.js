/**
 * @description modification gaussian blur uniquement
 * @note Utilise le contour ratio (calculer à partir du périmètre)
 */
function globalProcessAlgo2() {
    src = cv.imread(imgElement)

    contourRatio = getContoursRatioSize(src)
    // contourRatio = getContoursRatioPerim(src)
    // contourRatio = getContoursRatioArea(src)

    filterPreProcess();
    // apply filters
    filtersProcess();

    manageFiltersParameters2();
}

/**
 * @brief Gère les filtres en fonction de l'image et créer l'image finale
 * @description Pareil que manageFiltersParameters2 sauf que la on fait varier que le gaussian. Le canny lui reste à 100
 * Le ratio de contours ce caulcul via les perimettre des tous les contours.
 * Les contours sont récupérer à partir du canny
 */
function manageFiltersParameters2() {
    let gaussianKSize = [5,7,11,15,17,19];
    let gaussianKSizeIndex = -1;

    console.log("contourRatio: ", contourRatio)

    while(contourRatio > contourRatioThreshold) {
        gaussianKSizeIndex++;
        if(gaussianKSizeIndex == 5){
            break;
        }

        let ksize = new cv.Size(gaussianKSize[gaussianKSizeIndex], gaussianKSize[gaussianKSizeIndex]);
        console.log("ksize: ", ksize)

        cv.GaussianBlur(gray, gray, ksize, 0, 0, cv.BORDER_DEFAULT)
        cv.imshow('canvasOutput5', gray);

        // Canny filter
        cv.Canny(gray, edged, 100, 0)
        cv.imshow('canvasOutput7', edged);
        
        contourRatio = getContoursRatioMF(edged)
        // contourRatio = getContoursRatioPerimMF(edged)
        // contourRatio = getContoursRatioAreaMF(edged)
        console.log("contourRatio: ", contourRatio)
    }

    // show all contours found
    drawAllContours();

    // Create convex hulls from different contours
    createConvexHulls();

    // Draw all hulls + draw the biggest hull
    findBiggestContourAndHull();

    findCorners();
}

function getContoursRatioMF(src) {
    let ratio;

    let c = new cv.MatVector();
    let h = new cv.Mat();
    cv.findContours(src, c, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    if(imgElement.width > imgElement.height){
        ratio = c.size()/imgElement.width;
    }
    else {
        ratio = c.size()/imgElement.height;
    }

    c.delete();
    h.delete();

    return ratio;
}

function getContoursRatioPerimMF(src) {
    let ratio;
    let perim = 0;

    let c = new cv.MatVector();
    let h = new cv.Mat();

    cv.findContours(src, c, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < c.size(); ++i) {
        perim = perim + cv.arcLength(c.get(i), false);
    }

    if(imgElement.width > imgElement.height){
        ratio = perim/imgElement.width;
    }
    else {
        ratio = perim/imgElement.height;
    }

    c.delete();
    h.delete();

    return ratio;
}

function getContoursRatioAreaMF(src) {
    let ratio;
    let area = 0;

    let c = new cv.MatVector();
    let h = new cv.Mat();

    cv.findContours(src, c, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < c.size(); ++i) {
        let contour_poly = new cv.Mat();
        cv.convexHull(c.get(i), contour_poly, false, true);
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

    c.delete();
    h.delete();

    return ratio;
}