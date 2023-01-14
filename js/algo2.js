/**
 * @description modification gaussian blur uniquement
 * @note Utilise le contour ratio (calculer à partir du périmètre)
 */
function globalProcessAlgo2() {
    src = cv.imread(imgElement)

    let mat = new cv.Mat();
    cv.cvtColor(src, mat, cv.COLOR_BGR2GRAY)
    cv.Canny(mat, mat, 255, 255)
    contourRatio = getContoursRatioArea(mat)

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

    const threashold = 20000;

    while(contourRatio > threashold) {
        gaussianKSizeIndex++;
        if(gaussianKSizeIndex == 5){
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
        
        contourRatio = getContoursRatioArea(edged)
    }

    // show all contours found
    drawAllContours();

    // Create convex hulls from different contours
    createConvexHulls();

    // Draw all hulls + draw the bigest hull
    findLargestContourAndHull();

    findCorners();
}