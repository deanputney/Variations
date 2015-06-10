function ShapeModel(svgPane) {
    if (svgPane) {
        if (window === this) {
            return new ShapeModel(svgPane);
        }

        this.svgPane = svgPane;
        return this;

    } else {
        return undefined;
    }
}

ShapeModel.prototype = {

    MIN_BLANK_WINDOW_SPACE_X_PERCENT: 0.03,
    MIN_BLANK_WINDOW_SPACE_Y_PERCENT: 0.03,
    SPACE_BETWEEN_BOXES_PERCENT: 0.015,

    MAX_SHAPES_POSSIBLE: 3000,

    DEFAULT_LINE_COLOR: "#003",
    SOURCE_SHAPE_COLOR: "#e3e3e3",

    // Return radians given degrees. Helps make things readable for me. :)
    convertToRadians: function(degrees) {
        return (Math.PI * (degrees / 180));
    },

    // Return all of the points along the exterior of an N-sided shape positioned
    // at a pre-determined location
    getPointsInNSidedShape: function(numberOfSides, sideLength, startX, startY) {
        var oldX = startX;
        var oldY = startY;
        var curX = startX;
        var curY = startY;
        var curAngle = 0;

        var points = [];

        for(var side = 0; side < numberOfSides; side++) {
            oldX = curX;
            oldY = curY;

            curX += Math.cos(this.convertToRadians(curAngle)) * sideLength;
            curY -= Math.sin(this.convertToRadians(curAngle)) * sideLength;
            curAngle += 360 / numberOfSides;

            points.push([curX, curY]);

            oldX = curX;
            oldY = curY;
        }

        return points;
    },

    // A regular polygon is not normally inscribed within a square. Return the side length of
    // a regular polygon that fits within our bounding square.
    getSideLengthForNSidedShapeInBoundingBox: function(numberOfSides, boxSideLength) {

        if (numberOfSides <= 4)
            return boxSideLength; // Regular polygons with s <= 4 can use bounding box length
        else {
            var exteriorAngle = 360 / numberOfSides;
            var xOverhangSum = 0;
            for (var triangle = 1; triangle <= Math.ceil(numberOfSides / 4) - 1; triangle++) {
                xOverhangSum += Math.cos(this.convertToRadians(triangle * exteriorAngle));
            }

            return boxSideLength / (1 + 2 * xOverhangSum);
        }
    },

    // The lowermost side of a polygon will generally be smaller than our bounding box's.
    // In this case we must center the polygon within its bounding box. Return this x offset.
    getXStartOffsetForNSidedShapeInBoundingBox: function(numberOfSides, sideLength) {

        if (numberOfSides <= 4)
            return 0; // Regular polygons with s <= 4 are already centered
        else {
            var xOffset = 0;
            var exteriorAngle = 360 / numberOfSides;
            for (var triangle = 1; triangle <= Math.ceil(numberOfSides / 4) - 1; triangle++) {
                xOffset += sideLength * Math.cos(this.convertToRadians(triangle * exteriorAngle));
            }
            return xOffset;
        }
    },

    // Only a polygon with n % 4 == 0 sides will be perfectly flush with a bounding box. We must vertically
    // center the polygon within its bounding box. Return this y offset.
    getYStartOffsetForNSidedShapeInBoundingBox: function(numberOfSides, sideLength, boundingBoxSideLength) {

        if (numberOfSides % 4 == 0)
            return 0;
        else {
            var yOffset = 0;
            var radius = sideLength / (2 * Math.sin(Math.PI / numberOfSides));
            var apothem = radius * Math.cos(Math.PI / numberOfSides);

            if (numberOfSides % 2 == 0) { // even
                return (boundingBoxSideLength - (2 * apothem)) / 2;
            } else { // odd
                return (boundingBoxSideLength - (apothem + radius)) / 2;
            }
        }
    },

    // Given an arbitrary number of shapes to draw, return an object containing essential size,
    // orientation, offset, and spacing details for drawing these shapes in the pane.
    //     size: the size (side length) of the shapes' bounding boxes
    //     orientation: an [x, y] pair expressing the number of [columns, rows] to draw
    //     startOffset: an [x, y] pair expressing the initial offset from (0, 0) to draw from
    //     spaceBetweenBoxes: the empty space (both x and y) to leave between shapes
    //     boundingBoxSideLength: the side length of a bounding box in this image
    getBestSizeAndOrientationOfShapesInSVGPane: function(numberOfShapes) {

        var sizeAndOrientation = {
            "size": 0,
            "orientation": [0, 0],
            "startOffset": [0, 0],
            "spaceBetweenBoxes": 0,
            "boundingBoxSideLength": 0
        };

        if (numberOfShapes < 1 || numberOfShapes == NaN || numberOfShapes == undefined) {
            console.warn("Zero shapes provided");
            return sizeAndOrientation;
        }

        for (var divideBy = 1; divideBy <= numberOfShapes; divideBy++) {
            var numberOfBoxesX = Math.ceil(numberOfShapes / divideBy);
            var numberOfBoxesY = Math.ceil(numberOfShapes / numberOfBoxesX);

            // Other important constants defined at top of file for easy access

            var svgPaneWidth = this.svgPane.getWidth();
            var svgPaneHeight = this.svgPane.getHeight();
            var startOfImageX = this.MIN_BLANK_WINDOW_SPACE_X_PERCENT * svgPaneWidth;
            var startOfImageY = this.MIN_BLANK_WINDOW_SPACE_Y_PERCENT * svgPaneHeight;

            // Box Constants
            var spaceBetweenBoxesX = this.SPACE_BETWEEN_BOXES_PERCENT * svgPaneWidth;
            var spaceBetweenBoxesY = this.SPACE_BETWEEN_BOXES_PERCENT * svgPaneHeight;
            var spaceBetweenBoxes = Math.min(spaceBetweenBoxesX, spaceBetweenBoxesY);

            var sizeOfBoxX = (svgPaneWidth -
                             (svgPaneWidth * this.MIN_BLANK_WINDOW_SPACE_X_PERCENT * 2) -
                             (spaceBetweenBoxes * (numberOfBoxesX - 1))) /
                             numberOfBoxesX;

            var sizeOfBoxY = (svgPaneHeight -
                             (svgPaneHeight * this.MIN_BLANK_WINDOW_SPACE_Y_PERCENT * 2) -
                             (spaceBetweenBoxes * (numberOfBoxesY - 1))) /
                             numberOfBoxesY;

            var sizeOfBox = Math.min(sizeOfBoxX, sizeOfBoxY);

            // Center the image in the SVG window
            var blankSpaceRight = svgPaneWidth -
                                  (numberOfBoxesX * sizeOfBox) -
                                  ((numberOfBoxesX - 1) * spaceBetweenBoxes) -
                                  (startOfImageX * 2);

            var blankSpaceBottom = svgPaneHeight -
                                   (numberOfBoxesY * sizeOfBox) -
                                   ((numberOfBoxesY - 1) * spaceBetweenBoxes) -
                                   (startOfImageY * 2);

            startOfImageX += blankSpaceRight / 2;
            startOfImageY += blankSpaceBottom / 2;

            if (sizeOfBox >= sizeAndOrientation.size) {
                sizeAndOrientation = {
                        "size": sizeOfBox,
                        "orientation": [numberOfBoxesX, numberOfBoxesY],
                        "startOffset": [startOfImageX, startOfImageY],
                        "spaceBetweenBoxes": spaceBetweenBoxes,
                        "boundingBoxSideLength": sizeOfBox
                    };
            } else {
                if (sizeAndOrientation.size != 0)
                    return sizeAndOrientation;
            }
        }

        if (sizeAndOrientation.size == 0) {
            console.warn("Cannot draw this many shapes in the svg window");
        }

        return sizeAndOrientation;
    },

    // Return `number`! (aka: n * n-1 * ... * 1)
    factorial: function(number) {
        if (number == 0)
            return 1;
        else {
            var product = 1;
            for (var multiplyBy = 1; multiplyBy <= number; multiplyBy++) {
                product *= multiplyBy;
            }
            return product;
        }
    },

    // Return C(x,y) : x! / ((x-y)! * y!)
    combination: function(x, y) {
        return this.factorial(x) / (this.factorial(x - y) * this.factorial(y));
    },

    // "The handshake problem"
    getNumberOfEdgesInNSidedShape: function(numberOfSides) {
        return (numberOfSides * (numberOfSides - 1)) / 2;
    },

    // Validation on rangeOverride
    getRangeOfShapes: function(numberOfEdgesInShape, numberOfEdgesToDraw, rangeOverride) {

        var maxPossibleShapes = this.combination(numberOfEdgesInShape, numberOfEdgesToDraw);

        // THIS IS SUPER IMPORTANT.
        // It saves you from range namespace conflicts that can hurt values in related libraries.
        rangeOverride = new Array(rangeOverride[0], rangeOverride[1]);

        if (rangeOverride[0] == undefined)
            rangeOverride[0] = 0;

        if (rangeOverride[0] < 0)
            rangeOverride[0] = 0;

        if (rangeOverride[0] > maxPossibleShapes)
            rangeOverride[0] = 0;

        if (rangeOverride[1] == undefined)
            rangeOverride[1] = maxPossibleShapes;

        if (rangeOverride[1] < 0)
            rangeOverride[1] = maxPossibleShapes;

        if (rangeOverride[1] > maxPossibleShapes)
            rangeOverride[1] = maxPossibleShapes;

        if (rangeOverride[0] > rangeOverride[1]) {
            rangeOverride[0] = 0;
            rangeOverride[1] = maxPossibleShapes;
        }

        return rangeOverride;
    },

    // For a given set of points, return a list of every possible pair thereof.
    getEdgesInSetOfPoints: function(points) {
        var edges = [];

        for (var pointA = 0; pointA < points.length; pointA++) {
            for (var pointB = pointA + 1; pointB < points.length; pointB++) {
                edges.push([points[pointA], points[pointB]]);
            }
        }

        return edges;
    },

    // This is a ridiculous helper function that makes the recursive seem
    // iterative through the juvenile misuse of a global counter.
    generateEdgeCombinations: function(edges, edgesPerCombination, range) {
        this.combinationCount = 0;
        return this.getCombinationsOfEdges(edges, edgesPerCombination, range, edgesPerCombination == 1);
    },

    // This guy should only be called by 'generateEdgeCombinations'
    getCombinationsOfEdges: function(edges, count, range, startedWithOneCount) {

        var index, tailIndex, combinations, head, tailCombinations;

        if (count > edges.length || count <= 0)
            return [];

        if (count == edges.length)
            return [edges];

        if (count == 1) {
            combinations = [];
            for (var edge = 0; edge < edges.length; edge++) {
                if (this.combinationCount >= range[0])
                    combinations.push([edges[edge]]);

                this.combinationCount++;

                if (startedWithOneCount && combinations.length == ((range[1] - range[0]) + 1))
                    return combinations;
            }

            return combinations;
        }

        combinations = [];

        for (index = 0; index < (edges.length - count) + 1; index++) {
            head = edges.slice(index, index + 1);
            tailCombinations = ShapeModel.prototype.getCombinationsOfEdges.call(this, edges.slice(index + 1), count - 1, range, startedWithOneCount);

            for (tailIndex = 0; tailIndex < tailCombinations.length; tailIndex++) {
                if (this.combinationCount >= range[0])
                    combinations.push(head.concat(tailCombinations[tailIndex]));

                this.combinationCount++;

                if (combinations.length == (range[1] - range[0]) + 1)
                    return combinations;
            }
        }

        return combinations;
    },



// "PUBLIC" FUNCTIONS GO HERE ---------------------------------------------------------------------------------------------------


    // Draw a regular N-sided polygon that fits and is centered within a bounding
    // box at a given location
    drawNSidedShape: function(numberOfSides, boundingBoxSideLength, startX, startY, lineColor) {

        var idealSideLength = this.getSideLengthForNSidedShapeInBoundingBox(numberOfSides, boundingBoxSideLength);
        var xStartOffset = this.getXStartOffsetForNSidedShapeInBoundingBox(numberOfSides, idealSideLength);
        var yStartOffset = this.getYStartOffsetForNSidedShapeInBoundingBox(numberOfSides, idealSideLength, boundingBoxSideLength);

        var points = this.getPointsInNSidedShape(numberOfSides,
                                                 idealSideLength,
                                                 startX + xStartOffset,
                                                 startY - yStartOffset);

        var shapeSides = [];

        for (var startOfEdge = 0; startOfEdge < numberOfSides; startOfEdge++) {
            var endOfEdge = startOfEdge + 1;

            if (endOfEdge >= numberOfSides) {
                endOfEdge = 0;
            }

            shapeSides.push(
                this.svgPane.drawSVGLine(points[startOfEdge][0], points[startOfEdge][1],
                                         points[endOfEdge][0], points[endOfEdge][1],
                                         lineColor)
            );
        }

        return shapeSides;
    },

    // Draw some number of N-sided shapes, filling the svg window
    drawMNSidedShapes: function(numberOfShapes, numberOfSides, lineColor) {

        var sizeAndOrientation = this.getBestSizeAndOrientationOfShapesInSVGPane(numberOfShapes);
        var shapesDrawn = 0;

        for (var row = 0; row < sizeAndOrientation.orientation[1]; row++) {
            for (var column = 0; column < sizeAndOrientation.orientation[0]; column++) {
                this.drawNSidedShape(numberOfSides, sizeAndOrientation.size,
                                     sizeAndOrientation.startOffset[0] +
                                         (column * (sizeAndOrientation.size + sizeAndOrientation.spaceBetweenBoxes)),
                                     // For y calculation, throw in extra size offset, drawings move UP the page
                                     sizeAndOrientation.startOffset[1] + sizeAndOrientation.size +
                                         (row * (sizeAndOrientation.size + sizeAndOrientation.spaceBetweenBoxes)),
                                     lineColor);

                shapesDrawn++;

                if (shapesDrawn == numberOfShapes)
                    return;
            }
        }
    },

    // TODO: this function is a mess. :(
    drawAllEdgeCombinations: function(numberOfSides, numberOfEdgesToDraw, drawSourceShape, rangeOverride) {

        var numberOfEdgesInShape = this.getNumberOfEdgesInNSidedShape(numberOfSides);

        // Figure out how many of shapes we need to draw before determining shape size
        rangeOverride = this.getRangeOfShapes(numberOfEdgesInShape, numberOfEdgesToDraw, rangeOverride);
        var numberOfShapesToDraw = (rangeOverride[1] - rangeOverride[0]) + 1;

        if (numberOfShapesToDraw > this.MAX_SHAPES_POSSIBLE) {
            console.log("Too much to draw, %s exceeds %s", numberOfShapesToDraw, this.MAX_SHAPES_POSSIBLE);
            return;
        }

        // We'll do this for a generic shape and then translate throughout the page as necessary
        var sizeAndOrientation = this.getBestSizeAndOrientationOfShapesInSVGPane(numberOfShapesToDraw);
        var idealSideLength = this.getSideLengthForNSidedShapeInBoundingBox(numberOfSides, sizeAndOrientation.size);
        var xStartOffset = this.getXStartOffsetForNSidedShapeInBoundingBox(numberOfSides, idealSideLength);
        var yStartOffset = this.getYStartOffsetForNSidedShapeInBoundingBox(numberOfSides, idealSideLength, sizeAndOrientation.boundingBoxSideLength);

        var shapePoints = this.getPointsInNSidedShape(numberOfSides, idealSideLength,
                                                      xStartOffset,
                                                      sizeAndOrientation.boundingBoxSideLength - yStartOffset); // because shapes draw UP!
        var shapeEdges = this.getEdgesInSetOfPoints(shapePoints);
        var edgeSets = this.generateEdgeCombinations(shapeEdges, numberOfEdgesToDraw, rangeOverride);

        var row = 0;
        var column = 0;

        for (var i = 0; i < edgeSets.length; i++) {
            // To save time calculating edges we use the first set of edges and translate around the window
            var xOffset = sizeAndOrientation.startOffset[0] + (column * (sizeAndOrientation.size + sizeAndOrientation.spaceBetweenBoxes));
            var yOffset = sizeAndOrientation.startOffset[1] + (row * (sizeAndOrientation.size + sizeAndOrientation.spaceBetweenBoxes));

            if (drawSourceShape) {
                this.drawNSidedShape(numberOfSides, sizeAndOrientation.boundingBoxSideLength,
                                     xOffset, yOffset + sizeAndOrientation.boundingBoxSideLength,
                                     this.SOURCE_SHAPE_COLOR);
            }

            for (var edge = 0; edge < edgeSets[i].length; edge++) {
                this.svgPane.drawSVGLine(edgeSets[i][edge][0][0] + xOffset, edgeSets[i][edge][0][1] + yOffset,
                                         edgeSets[i][edge][1][0] + xOffset, edgeSets[i][edge][1][1] + yOffset,
                                         this.DEFAULT_LINE_COLOR);
            }

            column++;
            if (column == sizeAndOrientation.orientation[0]) {
                row++;
                column = 0;
            }
        }
    }
};