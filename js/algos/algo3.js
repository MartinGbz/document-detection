/**
 * @description globalProcessAlgo3 + algoBasicRect
 * @note Utilise le contour ratio (calculer à partir du périmètre)
 */
function globalProcessAlgo3() {
    src = cv.imread(imgElement)

    // contourRatio = getContoursRatioSize(src)
    // contourRatio = getContoursRatioPerim(src)
    contourRatio = getContoursRatioArea(src)

    filterPreProcess();
    
    // apply filters
    filtersProcess();

    manageFiltersParameters3();
}

/**
 * @brief Gère les filtres en fonction de l'image et créer l'image finale
 * @description Pareil que manageFiltersParameters2 sauf que la on fait varier que le gaussian. Le canny lui reste à 100
 * Le ratio de contours ce caulcul via les perimettre des tous les contours.
 * Les contours sont récupérer à partir du canny
 */
function manageFiltersParameters3() {
    let gaussianKSize = [5,7,11,15,17,19];
    let gaussianKSizeIndex = -1;

    blurred = new cv.Mat();

    console.log("contourRatio: ", contourRatio)

    while(contourRatio > contourRatioThreshold) {
        gaussianKSizeIndex++;
        if(gaussianKSizeIndex == 5){
            break;
        }

        let ksize = new cv.Size(gaussianKSize[gaussianKSizeIndex], gaussianKSize[gaussianKSizeIndex]);
        console.log("ksize: ", ksize)

        cv.GaussianBlur(gray, blurred, ksize, 0, 0, cv.BORDER_DEFAULT)
        cv.imshow('canvasOutput5', gray);

        // Canny filter
        cv.Canny(blurred, edged, 100, 0)
        cv.imshow('canvasOutput7', edged);
        
        // contourRatio = getContoursRatioMF(edged)
        // contourRatio = getContoursRatioPerimMF(edged)
        contourRatio = getContoursRatioAreaMF(edged)
        console.log("contourRatio: ", contourRatio)
    }

    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    cv.findContours(edged, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    // show all contours found
    drawAllContours();

    // Draw all hulls + draw the biggest hull
    findBiggestContourAndHullRect();

    findCorners();
}