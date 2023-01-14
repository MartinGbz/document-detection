/**
 * @description modification canny + gaussian blur
 * @note Utilise le nombre de contours
 */
function globalProcessAlgo1() {

    src = cv.imread(imgElement)
    src = cv.imread(imgElement);

    filterPreProcess();
    // apply filters
    filtersProcess();

    manageFiltersParameters();
    // manageFiltersParameters2();
}

/**
 * @brief Gère les filtres en fonction de l'image et créer l'image finale
 * @description En donnant une image grise en input on determine le meilleur combo canny + gaussian blur
 * pour avoir un nombre de contours < à un threashold défini
 */
function manageFiltersParameters() {
    let gaussianKSize = [5,7,11,29];
    let gaussianKSizeIndex = 0;

    let cannyThreshold = [0,50,100,150,200,255];
    let cannyThresholdIndex = -1;
    const threashold = 50;

    while(!contours || contours.size() > threashold) {
        cannyThresholdIndex++;
        if(cannyThresholdIndex == 6) {
            gaussianKSizeIndex++;
            cannyThresholdIndex = 0;
        }
        if(cannyThresholdIndex == 7 || gaussianKSizeIndex == 5){
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
        console.log('contours.size():', contours.size())
        console.log('gaussian: ', gaussianKSize[gaussianKSizeIndex])
        console.log('canny: ', cannyThreshold[cannyThresholdIndex])  
    }

    // show all contours found
    drawAllContours();

    // Create convex hulls from different contours
    createConvexHulls();
    // createRect();

    // Draw all hulls + draw the bigest hull
    findLargestContourAndHull();

    findCorners();
}