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

// black image with the same size than img
let blackImg;

// clone img
let img2;
let img3;
let img4;
let img5;
let img6;

// contours
let contours;
let hierarchy;

let hull;

let contourSelected;

// let width = 1008;
// let height = 756;

imgElement.addEventListener('load', (e) => {
    console.log('Hauteur de l\'image:', imgElement.height);
    console.log('Largeur de l\'image:', imgElement.width);
    width = imgElement.width;
    height = imgElement.height;
}, false);

inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
    //   console.log(imgElement);
    //   console.log(e.target.files[0]);
    //   console.log(e.target.files);
    //   console.log(e);
}, false);


imgElement.onload = function() {
    console.log('hey');

    // apply filters
    filtersProcess();

    // find contours
    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    cv.findContours(edged, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    console.log('contours.size():', contours.size())

    // show all contours found
    drawAllContours();

    // Create convex hulls from different contours
    createConvexHulls();

    // Draw all hulls + draw the bigest hull
    findLargestContourAndHull();

    findCorners22();
}

function filtersProcess() {
    // img read
    src = cv.imread(imgElement)
    // cv.imshow('canvasOutput', src);

    // variablesglobales
    gray = new cv.Mat();
    bilateral = new cv.Mat();
    eq = new cv.Mat();
    edged = new cv.Mat();
    linesTest = new cv.Mat();
    srcResized = new cv.Mat();
    img = new cv.Mat();
    blackImg = cv.Mat.zeros(img.rows, img.cols, cv.CV_8UC3);

    // img size wanted
    let dsize = new cv.Size(width, height);

    //resize img
    cv.resize(src, srcResized, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow('canvasOutput2', srcResized);

    // RGB to BGR
    cv.cvtColor(srcResized, img, cv.COLOR_RGB2BGR)
    cv.imshow('canvasOutput3', img);

    img2 = img.clone();
    img3 = img.clone();
    img4 = img.clone();
    img5 = img.clone();
    img6 = img.clone();

    // BGR to GRAY levels
    cv.cvtColor(img, gray, cv.COLOR_BGR2GRAY)
    cv.imshow('canvasOutput4', gray);

    // Billateral filter
    // cv.bilateralFilter(gray, bilateral, 5, 5, 5, cv.BORDER_CONSTANT)
    // cv.imshow('canvasOutput5', bilateral);

    // toto = new cv.Mat();
    // titi = new cv.Mat();
    // cv.erode(bilateral, toto, titi, new cv.Point(-1,-1), 1, cv.BORDER_CONSTANT)
    // cv.imshow('canvasOutput51', toto);

    // ----------------------------------------

    test1 = new cv.Mat();
    // Billateral filter
    // cv.bilateralFilter(gray, test1, 10, 500, 1, cv.BORDER_CONSTANT)
    // cv.bilateralFilter(gray, test1, 9, 75, 75, cv.BORDER_CONSTANT)
    // cv.bilateralFilter(gray, test1, 5, 5, 5, cv.BORDER_CONSTANT)
    // cv.imshow('canvasOutput5', test1);

    // cv.adaptiveThreshold(test1, test1, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 115, 4)
    // cv.imshow('canvasOutput51', test1);

    // cv.medianBlur(test1, test1, 11)
    // cv.imshow('canvasOutput52', test1);

    // cv.copyMakeBorder(test1, test1, 5, 5, 5, 5, cv.BORDER_CONSTANT, value=[0, 0, 0, 0])
    // cv.imshow('canvasOutput53', test1);

        // test2 = new cv.Mat();
    // Billateral filter
    // cv.bilateralFilter(gray, test2, 5, 5, 5, cv.BORDER_DEFAULT)
    // cv.imshow('canvasOutput52', test2);

    // test3 = new cv.Mat();
    // // Billateral filter
    // cv.bilateralFilter(gray, test3, 5, 5, 5, cv.BORDER_REFLECT)
    // cv.imshow('canvasOutput53', test3);

    // test4 = new cv.Mat();
    // // Billateral filter
    // cv.bilateralFilter(gray, test4, 5, 5, 5, cv.BORDER_WRAP)
    // cv.imshow('canvasOutput54', test4);
    
    // let ksize = new cv.Size(5, 5);
    let ksize = new cv.Size(7, 7);
    // let ksize = new cv.Size(5, 5);
    // let ksize = new cv.Size(29, 29);
    // let ksize = new cv.Size(11, 11);
    cv.GaussianBlur(gray, test1, ksize, 0, 0, cv.BORDER_DEFAULT)
    cv.imshow('canvasOutput5', test1);

    // Equalize histoigram
    cv.equalizeHist(test1, eq)
    cv.imshow('canvasOutput6', eq);

    cv.Canny(eq, edged, 255, 0)
    cv.imshow('canvasOutput7', edged);

    console.log('edged:', edged)   

    // while(!contours || contours.size() > 200) {
    //     // Canny filter
    //     // cv.Canny(gray, edged, 200, 250)
    //     cv.Canny(eq, edged, 50, 200)
    //     cv.imshow('canvasOutput7', edged);

    //     console.log('edged:', edged)   
    // }

    // cv.HoughLines(gray, linesTest, 1, Math.PI/180,15)
    // cv.imshow('canvasOutput51', linesTest);  

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
    cv.drawContours(img4, contourVec, 0, green, 1, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img4, img4, cv.COLOR_BGR2RGB)
    cv.imshow('canvasOutput10', img4);

    // Draw the bigest contour hulled on the idcard
    let hull2 = new cv.MatVector();
    biggestContourHulled = new cv.Mat()
    cv.convexHull(contourSelected, biggestContourHulled, true, true);
    hull2.push_back(biggestContourHulled);
    cv.drawContours(img5, hull2, 0, green, 1, cv.LINE_8, hierarchy, 0);
    cv.cvtColor(img5, img5, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput11', img5);
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

function findCorners() {
    console.log(biggestContourHulled.data32S);
    
    let array = new Array();
    
    for(let i=0; i<biggestContourHulled.data32S.length; i+=2){
        array.push({x:biggestContourHulled.data32S[i], y:biggestContourHulled.data32S[i+1]});
    }
    console.log(array);
    
    let c1 = getMinXMinY(array);
    let c2 = getMaxXMinY(array);
    
    let c3 = getMinXMaxY(array);
    let c4 = getMaxXMaxY(array);

    console.log('c1');
    console.log(c1);
    console.log('c2');
    console.log(c2);
    console.log('c3');
    console.log(c3);
    console.log('c4');
    console.log(c4);

    let bottomLeft = new cv.Point(c1[0].x, c1[0].y);
    let topLeft = new cv.Point(c2[0].x, c2[0].y);
    let bottomRight =new cv.Point(c3[0].x, c3[0].y);
    let topRight = new cv.Point(c4[0].x, c4[0].y);

    console.log(bottomRight.x);

    let widthA = Math.sqrt(Math.pow((bottomRight.x-bottomLeft.x), 2) + Math.pow((bottomRight.y - bottomLeft.y) , 2));
    let widthB = Math.sqrt(Math.pow((topRight.x - topLeft.x) , 2) + Math.pow((topRight.y -topLeft.y) , 2));
    //# compute the height of the new image
    let heightA = Math.sqrt(Math.pow((topRight.x - bottomRight.x) , 2) + Math.pow((topRight.y - bottomRight.y),2));
    let heightB = Math.sqrt(Math.pow((topLeft.x - bottomLeft.x) , 2) + Math.pow((topLeft.y - bottomLeft.y) , 2));

    console.log(widthA);
    console.log(widthB);
    console.log(heightA);
    console.log(heightB);

    let maxWidth = Math.max(parseInt(widthA), parseInt(widthB));
    let maxHeight = Math.max(parseInt(heightA), parseInt(heightB));

    console.log(maxHeight);
    console.log(maxWidth);

    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [topLeft.x, topLeft.y, topRight.x, topRight.y, bottomLeft.x, bottomLeft.y,bottomRight.x, bottomRight.y]);
    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, maxWidth-1, 0, 0, maxWidth-1, maxHeight-1, maxHeight-1]);
    let M2 = cv.getPerspectiveTransform(srcTri, dstTri);

    let finalDst2 = new cv.Mat();
    let dsize3 = new cv.Size(maxWidth, maxHeight);

    cv.warpPerspective(img6, finalDst2, M2, dsize3, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.cvtColor(finalDst2, finalDst2, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput12', finalDst2);

    let dsize4 = new cv.Size(maxWidth*2,maxHeight*2);
    cv.resize(finalDst2, finalDst2, dsize4, 0, 0, cv.INTER_AREA);
    cv.imshow('canvasOutput13', finalDst2);
}

function findCorners2(){    
    let foundContour = new cv.MatVector();
  
    //Get area for all contours so we can find the biggest
    let sortableContours = [];
    for (let i = 0; i < hull.size(); i++) {
      let cnt = hull.get(i);
      let area = cv.contourArea(cnt, false);
      let perim = cv.arcLength(cnt, false);
  
      let red = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
      let green = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
      let blue = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0)); 
      let color = new cv.Scalar(red, green, blue);
  
      sortableContours.push({ areaSize: area, perimiterSize: perim, contour: cnt, color: color  });
    }

    console.log(sortableContours);

    //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
    let approx = new cv.Mat();
    cv.approxPolyDP(sortableContours[65].contour, approx, 0.005, true);
  
    if (approx.rows >= 4) {
      console.log('Found a 4-corner approx');
      foundContour = approx;
    }
    else{
      console.log('No 4-corner large contour!');
      return;
    }
  
    //Find the corners
    let corner1 = new cv.Point(foundContour.data32S[0], foundContour.data32S[1]);
    let corner2 = new cv.Point(foundContour.data32S[2], foundContour.data32S[3]);
    let corner3 = new cv.Point(foundContour.data32S[4], foundContour.data32S[5]);
    let corner4 = new cv.Point(foundContour.data32S[6], foundContour.data32S[7]);
  
    console.log(corner1);
    console.log(corner2);
    console.log(corner3);
    console.log(corner4);
  
    //Order the corners
    let cornerArray = new cv.MatVector();
    cornerArray = [{ corner: corner1 }, { corner: corner2 }, { corner: corner3 }, { corner: corner4 }];
    //Sort by Y position (to get top-down)
    cornerArray.sort((item1, item2) => { 
      return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0; 
    }).slice(0, 5);
    
    console.log(cornerArray);
  
    // for (c of cornerArray) {
    //   cv.drawContours(img6, c.corner, -1, c.color, 1, cv.LINE_8, hierarchy, 100);
    // }
    // cv.drawContours(img6, cornerArray, -1, new cv.Scalar(0,255,0), 1, cv.LINE_8, hierarchy, 100);
  
    cv.imshow('canvasOutput12', img6);
}

function findCorners22(){
    
    // STEP already done before
    // //Get area for all contours so we can find the biggest
    // let sortableContours = [];
    // for (let i = 0; i < contours.size(); i++) {
    //     let cnt = contours.get(i);
    //     let area = cv.contourArea(cnt, false);
    //     let perim = cv.arcLength(cnt, false);
        
    //     sortableContours.push({ areaSize: area, perimiterSize: perim, contour: cnt });
    // }

    // //Sort 'em
    // sortableContours = sortableContours.sort((item1, item2) => { return (item1.areaSize > item2.areaSize) ? -1 : (item1.areaSize < item2.areaSize) ? 1 : 0; }).slice(0, 5);

    // console.log('cv.arcLength(contourSelected, false):', cv.arcLength(contourSelected, false))
    // console.log('sortableContours[0].perimiterSize:', sortableContours[0].perimiterSize)
    // console.log('cv.arcLength(biggestContourHulled, false):', cv.arcLength(biggestContourHulled, false))

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
    let finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, theWidth, 0, theWidth, theHeight, 0, theHeight]);
    console.log('finalDestCoords:', finalDestCoords)
    let srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.corner.x, tl.corner.y, tr.corner.x, tr.corner.y, br.corner.x, br.corner.y, bl.corner.x, bl.corner.y]);
    let dsize = new cv.Size(theWidth, theHeight);
    // l'assemblage des coordonnées (des coins) reel de la carte sur l'image ET des dimension réel de la carte (distance entre les coorddonées)
    // permet de nous fournir un array de perspective
    let M = cv.getPerspectiveTransform(srcCoords, finalDestCoords)
    // on utilise cette array de perspective dans cette fonction, ce ui nous permet de faire l'homographie
    cv.warpPerspective(img6, finalDst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.cvtColor(finalDst, finalDst, cv.COLOR_BGR2RGB, 0);
    cv.imshow('canvasOutput12', finalDst);
}

function findCorners3() {
    let poly = new cv.MatVector();
    // approximates each contour to polygon
    for (let i = 0; i < contours.size(); ++i) {
        let tmp = new cv.Mat();
        let cnt = contours.get(i);
        // You can try more different parameters
        cv.approxPolyDP(cnt, tmp, 3, true);
        poly.push_back(tmp);
        cnt.delete(); tmp.delete();
    }
    // draw contours with random Scalar
    for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                Math.round(Math.random() * 255));
        cv.drawContours(img6, poly, i, color, 1, 8, hierarchy, 0);
    }
    cv.imshow('canvasOutput12', img6);
}

function onOpenCvReady() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}

// function onOpenCvReady() {
//     cv['onRuntimeInitialized']=()=>{
//         document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
//         console.log('gang')
//     };
// }