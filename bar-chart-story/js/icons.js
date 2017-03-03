'use strict';

// module for drawing icons inside an svg
function icons() {

  // default values
  var iconSize = 100;
  var location = '';
  var extension = 'png';

  // d3 selections for icons
  var svg = void 0,
      iconGroup = void 0,
      allIcons = void 0,
      data = void 0;

  // variables passed in from bar chart
  var height = void 0,
      xpos = void 0;

  // generator to draw icons
  // icons from: http://www.svgcuttabledesigns.com/the-simpsons-exclusive-svg-only/
  function icons(selection) {
    // for every selection
    selection.each(function (d, i) {
      svg = d3.select(this).select('svg');
      iconGroup = svg.append("g").attr("class", "icons");
      allIcons = iconGroup.selectAll("image").data(d.value).enter().append("image").attr("x", 0).attr("y", function (d2, i2) {
        return 85 + i2 * 60;
      }).attr("width", iconSize).attr("height", iconSize).attr("xlink:href", function (d2, i2) {
        // use original data to get character names
        return location + d.rowLabel[i2] + "." + extension;
      }).attr("opacity", 1);
      data = d;
    });
  }

  // state definitions for icons
  icons.fadeIn = function (elements) {
    return elements.attr("opacity", 1);
  };
  icons.fadeOut = function (elements) {
    return elements.attr("opacity", 0);
  };
  icons.nextToTable = function (elements) {
    return elements.attr("x", 0).attr("y", function (d, i) {
      return 85 + i * 60;
    });
  };
  icons.moveOverTable = function (elements) {
    return elements.attr("x", 90).attr("y", function (d, i) {
      return 85 + i * 60;
    });
  };
  icons.moveToChart = function (elements) {
    var yIterF = data.value.filter(function (d) {
      if (d[0] === "F") {
        return true;
      }
    }).length;
    var yIterM = data.value.length - yIterF;
    var bottom = height - 20;

    return elements.attr("x", function (d, i) {
      return xpos(d[0]) + 4;
    }).attr("y", function (d, i) {
      if (d[0] === "F") {
        yIterF -= 1;
        return bottom - yIterF * 60;
      } else {
        yIterM -= 1;
        return bottom - yIterM * 60;
      }
    });
  };

  // element definitions
  icons.allIcons = function () {
    return allIcons;
  };

  // getters / setters
  icons.iconSize = function (value) {
    if (!arguments.length) {
      return iconSize;
    }
    iconSize = value;
    return icons;
  };
  icons.location = function (value) {
    if (!arguments.length) {
      return location;
    }
    location = value;
    return icons;
  };
  icons.extension = function (value) {
    if (!arguments.length) {
      return extension;
    }
    extension = value;
    return icons;
  };
  icons.barHeight = function (value) {
    if (!arguments.length) {
      return height;
    }
    height = value;
    return icons;
  };
  icons.xPos = function (value) {
    if (!arguments.length) {
      return xpos;
    }
    xpos = value;
    return icons;
  };

  // return the icons generator
  return icons;
}