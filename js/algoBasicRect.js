/**
 * @brief Pareil que global process basic mais avec le bounding rect (estimation de rectangle)
 */
function globalProcessBasicRect() {
    src = cv.imread(imgElement)

    contourRatio = getContoursRatio(src);
    // contourRatio = getContoursRatioArea(src);
    console.log('contourRatio:', contourRatio)
    
    filterPreProcess();

    // apply filters
    filtersProcess();

    // show all contours found
    drawAllContours();

    // Create convex hulls from different contours
    createRect();

    // Draw all hulls + draw the bigest hull
    findLargestContourAndHullRect();

    findCorners();
}

/**
 * Draw all hulls + the bigest hull alone on the image
 * Compare bounding rect area of all contours (instead of perim or area of the contour)
 */
function findLargestContourAndHullRect() {
    // get first contours from contours array
    contourSelected = contours.get(0).clone(); 
    let contourSelectedRect;

    // explore contours and draw all of them on the img
    // finds the bigest contour
    for (let i = 0; i < contours.size(); ++i) {
        let red = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let green = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let blue = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0)); 

        let color =  new cv.Scalar(red,green, blue);  

        let contour_poly = new cv.Mat();
        // cv.approxPolyDP(contours.get(i), contour_poly, 3, true);
        cv.convexHull(contours.get(i), contour_poly, false, true);
        contours_poly.push_back(contour_poly);
        let rect = cv.boundingRect(contour_poly);
        boundRect.push_back(rect);
        contour_poly.delete();

        let contour_pol2 = new cv.Mat();
        // cv.approxPolyDP(contourSelected, contour_pol2, 3, true);
        cv.convexHull(contourSelected, contour_pol2, false, true);
        contours_poly.push_back(contour_pol2);
        let rect2 = cv.boundingRect(contour_pol2);
        contour_pol2.delete();

        let areaCurCtr = rect.width*rect.height;
        let areaBigCtr = rect2.width*rect2.height;

        if(areaCurCtr >= areaBigCtr){
            contourSelected=contours.get(i).clone();
            contourSelectedRect = rect2;
            // console.log('areaCurCtr:', areaCurCtr)
            // console.log('areaBigCtr:', areaBigCtr)
        }
        else {
            contourSelectedRect = rect2;
            // console.log('areaCurCtr:', areaCurCtr)
            // console.log('areaBigCtr:', areaBigCtr)
        }

        let topLeft = new cv.Point(boundRect.get(i).x, boundRect.get(i).y);
        let bottomRight = new cv.Point(boundRect.get(i).x + boundRect.get(i).width, boundRect.get(i).y + boundRect.get(i).height);
        cv.rectangle(img3, topLeft, bottomRight, color, 2);
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

    let testtest = new cv.MatVector();
    testtest.push_back(contourSelected);
    cv.drawContours(img8, testtest, 0, green, 5, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img8, img8, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput57', img8);
    
    // Ici le fait de hulled le contour me permet dans findcorner de le faire passé en tant que rectangle
    // alors que le contour en lui même ne serait pas passé
    // le mieux serait d'utiliser la fonction boudingRect (utilisé dans findcorner2) mais pour l'instant l'homographie findcroner2 ne marche pas.
    // mais une fois ça résolut c'est good.
    cv.convexHull(contourSelected, biggestContourHulled, true, true);
    cv.approxPolyDP(biggestContourHulled, biggestContourHulled2, 100, true);
    
    // let rect2 = cv.boundingRect(biggestContourHulled);
    // biggestContourHulled2 = img5.roi(rect2);
    
    hull2.push_back(biggestContourHulled2);
    
    let hull3 = new cv.MatVector();
    hull3.push_back(biggestContourHulled);
    console.log('hull3:', hull3)
    cv.drawContours(img6, hull3, 0, green, 5, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img6, img6, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput55', img6);

    let topLeft = new cv.Point(contourSelectedRect.x, contourSelectedRect.y);
    let bottomRight = new cv.Point(contourSelectedRect.x + contourSelectedRect.width, contourSelectedRect.y + contourSelectedRect.height);
    cv.rectangle(img7, topLeft, bottomRight, green, 2);
    cv.imshow('canvasOutput56', img7);

    cv.drawContours(img5, hull2, 0, green, 5, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img5, img5, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput10', img5);
}