"use strict";

// reusable bar chart view
function bar() {
  // global vars for bar chart
  var margin = { top: 20, right: 20, bottom: 30, left: 40 };
  var width = 500 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);

  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom().scale(x);

  var yAxis = d3.axisLeft().scale(y).ticks(6);

  // new scales & axes, custom for showing comparison values
  var yComparison = d3.scaleLinear().range([height, height - (50 + 8) * 3]);
  yComparison.domain([0, 3]);
  var yComparisonAxis = d3.axisLeft().scale(yComparison).tickValues([1, 2, 3]).tickFormat(d3.format(","));
  var yComparison2 = d3.scaleLinear().range([height, height - (50 + 8) * 2]);
  yComparison2.domain([0, 2]);
  var yComparisonAxis2 = d3.axisRight().scale(yComparison2).tickValues([1, 2]).tickFormat(d3.format(","));

  // d3 selections for table
  var svg = void 0,
      chart = void 0,
      data = void 0;

  // generator for bar chart
  function bar(selection) {
    // for every selection:
    selection.each(function (d, i) {

      // store full dataset
      data = d;

      // set domain of scales
      x.domain(data.map(function (d) {
        return d.gender;
      }));
      y.domain([0, 23]);

      // create new bar chart group
      svg = d3.select(this).select('svg');
      chart = svg.append('g').attr('class', 'barChart').attr("transform", "translate(30," + 30 + ")");

      // draw chart
      chart.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

      chart.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", ".71em").style("text-anchor", "end").text("gender");

      chart.selectAll(".bar").data(d).enter().append("rect").attr("class", function (d) {
        if (d.family) {
          return "bar family";
        } else {
          return "bar full";
        }
      }).attr("x", x(d.gender)).attr("width", x.bandwidth()).attr("y", height).attr("height", 0).attr("fill", function (d) {
        return "#FFDC2A";
      });

      // add custom marks to chart
      chart.append("g").attr("class", "comparison axis").attr("transform", "translate(80, 0)").call(yComparisonAxis);
      // hide this axis by default
      d3.select(".comparison .domain").attr("opacity", 0);
      chart.append("g").attr("class", "comparison2 axis").attr("transform", "translate(350, 0)").call(yComparisonAxis2);

      // manually set up y-axis to family size
      y.domain([0, 7.75]);
      chart.select(".y").call(yAxis);

      // add a legend
      chart.append("g").attr("class", "legend").selectAll(".age").data(data.slice().reverse()).enter().append("rect").attr("class", "age").attr("x", x.bandwidth() * 2 + 100).attr("y", function (d, i) {
        return height + 60 - 40 * i;
      }).attr("height", 25).attr("width", 25).attr("fill", function (d) {
        return d.age === "adult" ? "steelblue" : "#e7298a";
      }).attr("visibility", function (d) {
        return d.age && d.gender === "M" ? "visible" : "hidden";
      });
      chart.select(".legend").selectAll(".ageText").data(data.slice().reverse()).enter().append("text").attr("class", "ageText").attr("x", x.bandwidth() * 2 + 130).attr("y", function (d, i) {
        return height + 60 - 40 * i + 18;
      }).text(function (d) {
        return d.age;
      }).attr("visibility", function (d) {
        return d.age && d.gender === "M" ? "visible" : "hidden";
      });
      // hide legend to start
      chart.select(".legend").attr("opacity", 0);
    });
  }

  // state definitions
  bar.fadeIn = function (elements) {
    return elements.attr("opacity", 1);
  };
  bar.fadeOut = function (elements) {
    return elements.attr("opacity", 0);
  };
  bar.compareNearIcons = function (elements) {
    return elements.call(bar.fadeIn).attr("transform", "translate(80, 0)");
  };
  bar.compareToAxis = function (elements) {
    return elements.attr("transform", "translate(0, 0)");
  };
  bar.emptyBars = function (elements) {
    elements.call(bar.fadeOut).attr("x", function (d) {
      return x(d.gender);
    }).attr("width", x.bandwidth()).attr("y", height).attr("height", 0);
  };
  bar.familyByGender = function (elements) {
    y.domain([0, 7.75]);
    elements.call(bar.fadeIn).attr("y", function (d, i, j) {
      return y(d.quantity);
    }).attr("height", function (d, i, j) {
      if (d.family) {
        return height - y(d.quantity);
      }
    }).attr("width", function (d, i, j) {
      return x.bandwidth();
    }).attr("x", function (d) {
      return x(d.gender);
    });
  };
  bar.scaleAxisSmall = function (elements) {
    // elements.call(yAxis);
    y.domain([0, 7.75]);
    // NOTE there may be a bug going backwards here
    elements.call(bar.fadeIn).call(yAxis);
  };
  bar.scaleAxisLarge = function (elements) {
    // elements.call(yAxis);
    y.domain([0, 23]);
    elements.call(yAxis);
  };
  bar.scaleFamilyBars = function (elements) {
    elements.attr("y", function (d, i, j) {
      y.domain([0, 23]);
      return y(d.quantity);
    }).attr("height", function (d, i, j) {
      if (d.family) {
        return height - y(d.quantity);
      }
    });
  };
  bar.allEmpty = function (elements) {
    elements.call(bar.fadeIn).attr("y", height).attr("height", 0);
  };
  bar.allByGender = function (elements) {
    elements.attr("y", function (d, i, j) {
      var adjustment = d.age === "child" ? data[i + 1].quantity - 0.1 : 0;
      return y(d.quantity + adjustment);
    }).attr("height", function (d, i, j) {
      if (!d.family) {
        return height - y(d.quantity);
      }
    }).attr("width", function (d, i, j) {
      return x.bandwidth();
    }).attr("x", function (d) {
      return x(d.gender);
    }).call(bar.simpsonsColor);
  };
  bar.moveApart = function (elements) {
    // reset domain
    x.domain(data.map(function (d) {
      return d.gender;
    }));
    chart.select(".y text").text("gender");
    chart.select(".x").call(xAxis);

    elements.attr("y", function (d, i, j) {
      var genderIndex = d.gender == "F" ? 1 : 3;
      var yStacked = d.age == "adult" ? d.quantity : data[genderIndex].quantity + d.quantity + 0.75;
      return y(yStacked);
    }).attr("height", function (d, i, j) {
      if (!d.family) {
        return height - y(d.quantity);
      }
    }).attr("width", function (d, i, j) {
      return x.bandwidth();
    }).attr("x", function (d) {
      return x(d.gender);
    }).call(bar.simpsonsColor);
  };
  // set bar colors back to yellow
  bar.simpsonsColor = function (elements) {
    elements.attr("fill", function (d) {
      return "#FFDC2A";
    });
  };
  // change bar color and keep position (for going in reverse in stepper)
  bar.changeColor = function (elements) {
    elements.call(bar.moveApart).attr("fill", function (d) {
      return d.age === "child" ? "#e7298a" : "steelblue";
    });
  };
  bar.moveToAge = function (elements) {
    x.domain(data.map(function (d) {
      if (!d.family) {
        return d.age;
      } else {
        return "child";
      }
    }));

    // transitioned before, but not visible atm anyways
    chart.select(".y text").text("age");

    elements.attr("x", function (d) {
      return x(d.age);
    }).attr("y", function (d, i, j) {
      if (!d.family) {
        var adjustment = d.gender === "F" ? data[i + 2].quantity - 0.02 : 0;
        return y(d.quantity + adjustment);
      }
    }).attr("height", function (d, i, j) {
      if (!d.family) {
        return height - y(d.quantity);
      }
    }).attr("width", function (d, i, j) {
      return x.bandwidth();
    });
  };
  bar.legendPosition = function (elements) {
    elements.attr("x", x.bandwidth() * 2 + 130).attr("y", function (d, i) {
      return height + 60 - 40 * i + 18;
    });
  };
  bar.moveLegend = function (elements) {
    elements.attr("x", function (d) {
      if (d.age === "child") {
        return x.bandwidth() / 2 + 5;
      } else {
        return x.bandwidth() * 3 / 2 + 25;
      }
    }).attr("y", height + 20);
  };

  // element definitions
  bar.xAxis = function () {
    return chart.select(".x");
  };
  bar.yAxis = function () {
    return chart.select(".y");
  };
  bar.allBars = function () {
    return chart.selectAll(".bar");
  };
  bar.familyBars = function () {
    return chart.selectAll(".bar.family");
  };
  bar.fullBars = function () {
    return chart.selectAll(".bar.full");
  };
  bar.compareAxes = function () {
    return chart.selectAll(".comparison, .comparison2");
  };
  bar.compareAxis1 = function () {
    return chart.select(".comparison");
  };
  bar.compareAxis2 = function () {
    return chart.select(".comparison2");
  };
  bar.compareAxisDomain = function () {
    return chart.select(".comparison .domain");
  };
  bar.legend = function () {
    return chart.select(".legend");
  };
  bar.legendColors = function () {
    return chart.selectAll(".legend .age");
  };
  bar.legendText = function () {
    return chart.selectAll(".legend .ageText");
  };
  bar.xAxisText = function () {
    return chart.selectAll(".x .tick text");
  };

  // hide the bar chart
  bar.hide = function (f, r) {
    chart.selectAll(".bar").attr("opacity", 0);
    chart.selectAll(".axis").attr("opacity", 0);
  };

  // show the bar chart
  bar.show = function (f, r) {
    bar.showX(f, r);
    bar.showY(f, r);
    bar.showComparison(f, r);
    bar.showBars(f, r);
  };

  // getters & setters
  bar.xPos = function (value) {
    return x(value) + x.bandwidth() / 2;
  };

  bar.height = function (value) {
    if (!arguments.length) {
      return height;
    }
    height = value;
    return bar;
  };

  // return the bar chart generator
  return bar;
}