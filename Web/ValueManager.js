function ValueManager(numberOfSides, numberOfEdges, drawSourceShape, rangeSet) {

    if (numberOfSides == undefined)
        this.numberOfSides = this.DEFAULT_NUMBER_OF_SIDES;
    else
        this.numberOfSides = numberOfSides;

    if (numberOfEdges == undefined)
        this.numberOfEdges = this.DEFAULT_NUMBER_OF_EDGES;
    else
        this.numberOfEdges = numberOfEdges;

    if (drawSourceShape == undefined)
        this.drawSourceShape = this.DEFAULT_DRAW_SOURCE_SHAPE;
    else
        this.drawSourceShape = drawSourceShape;

    if (rangeSet == undefined) {
        this.rangeSet = this.DEFAULT_RANGE_SET;
    } else {
        this.rangeSet = rangeSet;
    }

    return this;
}

ValueManager.prototype = {

    DEFAULT_NUMBER_OF_SIDES: 5,
    DEFAULT_NUMBER_OF_EDGES: 3,
    DEFAULT_DRAW_SOURCE_SHAPE: false,
    DEFAULT_RANGE_SET: [-1, -1],

    MINIMUM_NUMBER_OF_SIDES: 3,
    MAXIMUM_NUMBER_OF_SIDES: 2000,

    MINIMUM_NUMBER_OF_EDGES: 1,

    MAXIMUM_NUMBER_OF_SHAPES: 3000,

    RANGE_SET_ARRAY_LENGTH: 2,

    ERROR_NOT_A_NUMBER: "Please only input numbers",
    ERROR_NOT_AN_INTEGER: "Please only input integers",
    ERROR_TOO_FEW: "Please input an integer greater than ",
    ERROR_TOO_MANY: "Please input an integer less than ",
    ERROR_TOO_MANY_SHAPES: "Your input specifies too many shapes ",
    ERROR_INFINITE_SHAPES: "Your input specifies infinite shapes",
    ERROR_NOT_A_BOOLEAN: "Please input true or false",
    ERROR_NOT_AN_ARRAY: "Please input two integers separated by a comma",
    ERROR_INCORRECT_NUMBER_OF_RANGE_VALUES: "Please input only two comma-separated integers",
    ERROR_INVALID_RANGE_VALUE: "Please input only positive integers or -1",
    ERROR_TOO_LARGE_RANGE_VALUE: "Please use -1 or values between 0 and ",
    ERROR_FIRST_VALUE_GREATER_THAN_SECOND: "The end value must be greater than or equal to the start value",

    ERROR_TRY_RANGE: "<br />(Maybe try a range?)",

    SIDES_ID: "input_sides_error",
    EDGES_ID: "input_edges_error",
    SHAPE_ID: "input_shape_error",
    RANGE_ID: "input_range_error",

    toString: function() {
        return this.numberOfSides + "," +
               this.numberOfEdges + "," +
               this.drawSourceShape + "," +
               this.getRangeSetString();
    },

    getRangeSetString: function() {
        return this.rangeSet[0] + "," + this.rangeSet[1];
    },

    useDefaultValues: function() {
        this.numberOfSides = this.DEFAULT_NUMBER_OF_SIDES;
        this.numberOfEdges = this.DEFAULT_NUMBER_OF_EDGES;
        this.drawSourceShape = this.DEFAULT_DRAW_SOURCE_SHAPE;
        this.rangeSet = this.DEFAULT_RANGE_SET;
    },

    ingestStringFromUrl: function(commandString) {
        return this.ingestString(commandString, true);
    },

    ingestString: function(commandString, urlIngestion) {

        urlIngestion = (urlIngestion === true);

        commandString = commandString.replace(/%2C/g, ',');
        commandString = commandString.replace(/%20/g, ' ');

        var commands = commandString.split(",");
        var acceptance;

        acceptance = this.setNumberOfSides(commands[0], urlIngestion);
        if (acceptance.accepted == false) {
            if (urlIngestion)
                this.useDefaultValues();

            return acceptance;
        }

        acceptance = this.setNumberOfEdges(commands[1], urlIngestion);
        if (acceptance.accepted == false) {
            if (urlIngestion)
                this.useDefaultValues();

            return acceptance;
        }

        acceptance = this.setDrawSourceShape(commands[2]);
        if (acceptance.accepted == false) {
            if (urlIngestion)
                this.useDefaultValues();

            return acceptance;
        }

        acceptance = this.setRangeSet(commands[3] + "," + commands[4]);
        if (acceptance.accepted == false) {
            if (urlIngestion)
                this.useDefaultValues();

            return acceptance;
        }

        return acceptance;
    },

    isValidNumber: function(value) {
        return !isNaN(parseInt(value));
    },

    isNumberInteger: function(value) {
        return value % 1 === 0;
    },

    convertToBoolean: function(value) {
        if (value === "true")
            return true;
        else if (value === "false")
            return false;

        return undefined;
    },

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

    getMaximumPossibleShapes: function(numberOfSides, numberOfEdges) {
        // Force rounding to account for errors in division
        var totalNumberOfEdges = (numberOfSides * (numberOfSides - 1)) / 2;
        return Math.round(this.factorial(totalNumberOfEdges) / (this.factorial(totalNumberOfEdges - numberOfEdges) * this.factorial(numberOfEdges)));
    },

    isRangeBoundless: function() {
        if (this.rangeSet[1] == -1)
            return true;

        return false;
    },

    // For the shape preview we should show the middlemost shape in a user's range
    getPreviewRange: function() {
        var lowerBound, upperBound, midpoint;
		var maxPossibleShapes = this.getMaximumPossibleShapes(this.numberOfSides, this.numberOfEdges);

        if (this.rangeSet[0] == -1)
            lowerBound = 0;
        else
            lowerBound = this.rangeSet[0];

        if (this.isRangeBoundless())
            upperBound = this.getMaximumPossibleShapes(this.numberOfSides, this.numberOfEdges);
        else
            upperBound = this.rangeSet[1];

        midpoint = Math.round((upperBound + lowerBound) / 2);

		// Avoid creating a midpoint outside the range of possible shapes
		if (midpoint >= maxPossibleShapes)
			midpoint = Math.round(maxPossibleShapes / 2);

        return [midpoint, midpoint];
    },

    setNumberOfSides: function(numberOfSides, ignoreShapeOverflow) {

        if (!this.isValidNumber(numberOfSides)) {
            return {
                "accepted": false,
                "id": this.SIDES_ID,
                "error": this.ERROR_NOT_A_NUMBER
            };
        }

        if (!this.isNumberInteger(numberOfSides)) {
            return {
                "accepted": false,
                "id": this.SIDES_ID,
                "error": this.ERROR_NOT_AN_INTEGER
            };
        }

        numberOfSides = parseInt(numberOfSides);

        if (numberOfSides < this.MINIMUM_NUMBER_OF_SIDES) {
            return {
                "accepted": false,
                "id": this.SIDES_ID,
                "error": this.ERROR_TOO_FEW + (this.MINIMUM_NUMBER_OF_SIDES - 1)
            };
        }

        if (numberOfSides > this.MAXIMUM_NUMBER_OF_SIDES) {
            return {
                "accepted": false,
                "id": this.SIDES_ID,
                "error": this.ERROR_TOO_MANY + (this.MAXIMUM_NUMBER_OF_SIDES + 1)
            };
        }

        if (this.isRangeBoundless() && !ignoreShapeOverflow) {
            var NUMBER_OF_DRAWN_SHAPES = this.getMaximumPossibleShapes(numberOfSides, this.numberOfEdges);

            if (!isFinite(NUMBER_OF_DRAWN_SHAPES)) {
                return {
                    "accepted": false,
                    "id": this.SIDES_ID,
                    "error": this.ERROR_INFINITE_SHAPES + this.ERROR_TRY_RANGE
                };
            }

            if (NUMBER_OF_DRAWN_SHAPES > this.MAXIMUM_NUMBER_OF_SHAPES) {
                return {
                    "accepted": false,
                    "id": this.SIDES_ID,
                    "error": this.ERROR_TOO_MANY_SHAPES + "(" + (NUMBER_OF_DRAWN_SHAPES) + ")" + this.ERROR_TRY_RANGE
                };
            }
        }

        this.numberOfSides = numberOfSides;

        return {
            "accepted": true
        };
    },

    getNumberOfEdgesInNSidedShape: function(numberOfSides) {
        return (numberOfSides * (numberOfSides - 1)) / 2;
    },

    setNumberOfEdges: function(numberOfEdges, ignoreShapeOverflow) {

        if (!this.isValidNumber(numberOfEdges)) {
            return {
                "accepted": false,
                "id": this.EDGES_ID,
                "error": this.ERROR_NOT_A_NUMBER
            };
        }

        if (!this.isNumberInteger(numberOfEdges)) {
            return {
                "accepted": false,
                "id": this.EDGES_ID,
                "error": this.ERROR_NOT_AN_INTEGER
            };
        }

        numberOfEdges = parseInt(numberOfEdges);

        if (numberOfEdges < this.MINIMUM_NUMBER_OF_EDGES) {
            return {
                "accepted": false,
                "id": this.EDGES_ID,
                "error": this.ERROR_TOO_FEW + (this.MINIMUM_NUMBER_OF_EDGES - 1)
            };
        }

        var MAXIMUM_NUMBER_OF_EDGES = this.getNumberOfEdgesInNSidedShape(this.numberOfSides);

        if (numberOfEdges > MAXIMUM_NUMBER_OF_EDGES) {
            return {
                "accepted": false,
                "id": this.EDGES_ID,
                "error": this.ERROR_TOO_MANY + (MAXIMUM_NUMBER_OF_EDGES + 1)
            };
        }

        if (this.isRangeBoundless() && !ignoreShapeOverflow) {
            var NUMBER_OF_DRAWN_SHAPES = this.getMaximumPossibleShapes(this.numberOfSides, numberOfEdges);

            if (!isFinite(NUMBER_OF_DRAWN_SHAPES)) {
                return {
                    "accepted": false,
                    "id": this.EDGES_ID,
                    "error": this.ERROR_INFINITE_SHAPES + this.ERROR_TRY_RANGE
                };
            }

            if (NUMBER_OF_DRAWN_SHAPES > this.MAXIMUM_NUMBER_OF_SHAPES) {
                return {
                    "accepted": false,
                    "id": this.EDGES_ID,
                    "error": this.ERROR_TOO_MANY_SHAPES + "(" + (NUMBER_OF_DRAWN_SHAPES) + ")" + this.ERROR_TRY_RANGE
                };
            }
        }

        this.numberOfEdges = numberOfEdges;

        return {
            "accepted": true
        };
    },

    setDrawSourceShape: function(drawSourceShape) {

        shouldDrawSourceShape = this.convertToBoolean(drawSourceShape);

        if (shouldDrawSourceShape === undefined) {
            return {
                "accepted": false,
                "id": this.SHAPE_ID,
                "error": this.ERROR_NOT_A_BOOLEAN
            };
        }

        this.drawSourceShape = shouldDrawSourceShape;

        return {
            "accepted": true
        };
    },

    setRangeSet: function(rangeSet) {

        if (rangeSet == undefined) {
            return {
                "accepted": false,
                "id": this.RANGE_ID,
                "error": this.ERROR_NOT_AN_ARRAY
            };
        }

        rangeSet = rangeSet.trim();

        if (rangeSet == "") {
            return {
                "accepted": false,
                "id": this.RANGE_ID,
                "error": this.ERROR_NOT_AN_ARRAY
            };
        }

        if (rangeSet.indexOf(',') == -1) {
            return {
                "accepted": false,
                "id": this.RANGE_ID,
                "error": this.ERROR_NOT_AN_ARRAY
            };
        }

        rangeSet = rangeSet.split(",");

        if (rangeSet.length != this.RANGE_SET_ARRAY_LENGTH) {
            return {
                "accepted": false,
                "id": this.RANGE_ID,
                "error": this.ERROR_INCORRECT_NUMBER_OF_RANGE_VALUES
            };
        }

        var NUMBER_OF_DRAWN_SHAPES = this.getMaximumPossibleShapes(this.numberOfSides, this.numberOfEdges);

        for (var index = 0; index < 2; index++) {
            rangeSet[index] = rangeSet[index].trim();

            if (!this.isValidNumber(rangeSet[index])) {
                return {
                    "accepted": false,
                    "id": this.RANGE_ID,
                    "error": this.ERROR_NOT_AN_ARRAY
                };
            }

            if (!this.isNumberInteger(rangeSet[index])) {
                return {
                    "accepted": false,
                    "id": this.RANGE_ID,
                    "error": this.ERROR_NOT_AN_INTEGER
                };
            }

            if (rangeSet[index] < -1) {
                return {
                    "accepted": false,
                    "id": this.RANGE_ID,
                    "error": this.ERROR_INVALID_RANGE_VALUE
                };
            }

            // IGNORE FOR NOW
            /*
            if (rangeSet[index] > NUMBER_OF_DRAWN_SHAPES) {
                return {
                    "accepted": false,
                    "id": this.RANGE_ID,
                    "error": this.ERROR_TOO_LARGE_RANGE_VALUE + (NUMBER_OF_DRAWN_SHAPES)
                };
            }
            */
            rangeSet[index] = parseInt(rangeSet[index]);
        }

        if (rangeSet[0] > rangeSet[1] && rangeSet[1] != -1) {
            return {
                "accepted": false,
                "id": this.RANGE_ID,
                "error": this.ERROR_FIRST_VALUE_GREATER_THAN_SECOND
            };
        }

        var expectedRange;

        if (rangeSet[1] == -1) {
            expectedRange = NUMBER_OF_DRAWN_SHAPES - rangeSet[0];
        } else {
            expectedRange = rangeSet[1] - rangeSet[0];
        }

        if (rangeSet[0] == -1)
            expectedRange++;

        if (!isFinite(expectedRange)) {
            return {
                "accepted": false,
                "id": this.RANGE_ID,
                "error": this.ERROR_TOO_MANY_SHAPES + "(infinity)" + this.ERROR_TRY_RANGE
            };
        }

        if (expectedRange > this.MAXIMUM_NUMBER_OF_SHAPES) {
            return {
                "accepted": false,
                "id": this.RANGE_ID,
                "error": this.ERROR_TOO_MANY_SHAPES + "(" + (expectedRange) + ")" + this.ERROR_TRY_RANGE
            };
        }

        this.rangeSet = rangeSet;

        return {
            "accepted": true,
        };
    }
};