function KeyHandler() {
    if (window === this) {
        return new KeyHandler();
    }

    return this;
}

KeyHandler.prototype = {

    handleKeyPress: function(keyCode) {
        var updatedDivId = "";

        switch(keyCode) {
            case 81: /* Q */
                this.increaseSides();
                updatedDivId = "input_sides";
                break;
            case 65: /* A */
                this.decreaseSides();
                updatedDivId = "input_sides";
                break;
            case 87: /* W */
                this.increaseEdges();
                updatedDivId = "input_edges";
                break;
            case 83: /* S */
                this.decreaseEdges();
                updatedDivId = "input_edges";
                break;
            case 69: /* E */
                this.toggleSourceShape();
                updatedDivId = "input_shape";
                break;
            case 82: /* R */
                this.increaseRange();
                updatedDivId = "input_range";
                break;
            case 70: /* F */
                this.decreaseRange();
                updatedDivId = "input_range";
                break;
            case 84: /* T */
                this.shiftRight();
                updatedDivId = "input_range";
                break;
            case 71: /* G */
                this.shiftLeft();
                updatedDivId = "input_range";
                break;
            case 67: /* C */
                this.reset();
                break;
            default:
                console.log("Invalid input. Doing nothing");
                break;
        }

        return updatedDivId;
    },

    getSides: function() {
        return parseInt(document.getElementById("input_sides").value);
    },

    getEdges: function() {
        return parseInt(document.getElementById("input_edges").value);
    },

    getShape: function() {
        return document.getElementById("input_shape").value;
    },

    getRange: function() {
        var rangeString = document.getElementById("input_range").value;
        var rangeStrings = rangeString.split(",");
        var range = [];

        range[0] = parseInt(rangeStrings[0]);
        range[1] = parseInt(rangeStrings[1]);

        return range;
    },

    setRange: function(range) {
        document.getElementById("input_range").value = range[0] + "," + range[1];
    },

    increaseSides: function() {
        var numberOfSides = this.getSides();
        numberOfSides++;
        document.getElementById("input_sides").value = numberOfSides;
    },

    decreaseSides: function() {
        var numberOfSides = this.getSides();
        numberOfSides--;
        document.getElementById("input_sides").value = numberOfSides;
    },

    increaseEdges: function() {
        var numberOfEdges = this.getEdges();
        numberOfEdges++;
        document.getElementById("input_edges").value = numberOfEdges;
    },

    decreaseEdges: function() {
        var numberOfEdges = this.getEdges();
        numberOfEdges--;
        document.getElementById("input_edges").value = numberOfEdges;
    },

    toggleSourceShape: function() {
        var sourceShape = this.getShape();
        if (sourceShape == "true")
            sourceShape = "false";
        else
            sourceShape = "true";
        document.getElementById("input_shape").value = sourceShape;
    },

    increaseRange: function() {
        var range = this.getRange();
        range[1]++;
        this.setRange(range);
    },

    decreaseRange: function() {
        var range = this.getRange();
        range[1]--;
        this.setRange(range);
    },

    shiftRight: function() {
        var range = this.getRange();
        range[0]++;
        range[1]++;
        this.setRange(range);
    },

    shiftLeft: function() {
        var range = this.getRange();
        range[0]--;
        range[1]--;
        this.setRange(range);
    },

    reset: function() {
        location.reload();
    }
}
