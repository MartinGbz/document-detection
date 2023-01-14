/**
 * @brief Processus basique
 */
function globalProcessBasic() {
    src = cv.imread(imgElement)

    contourRatio = getContoursRatio(src);

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
 * @brief Pareil que global process basic mais avec le calcul du contour raio avec les périmètres
 */
function globalProcessBasicPerim() {
    src = cv.imread(imgElement)

    let mat = new cv.Mat();
    cv.cvtColor(src, mat, cv.COLOR_BGR2GRAY)
    cv.Canny(mat, mat, 255, 255)
    contourRatio = getContoursRatioArea(mat);

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
 * Draw all hulls + the bigest hull alone on the image
 */
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
        
        cv.drawContours(img3, hull, i, color, 1, cv.LINE_8, hierarchy, 0);
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