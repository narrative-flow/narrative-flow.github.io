'use strict';

// module based on online example
// http://jsfiddle.net/v6VMf
// refactored into a reusable chart format: https://bost.ocks.org/mike/chart/

// reusable table view
function table() {

  // default values for table creation
  var width = 200;
  var height = 200;
  var margins = { top: 20, right: 20, bottom: 20, left: 200 };
  var chartW = void 0,
      chartH = void 0;

  // d3 selections for table
  var svg = void 0,
      tableSvg = void 0,
      tableBodySvg = void 0,
      tableHeaderSvg = void 0,
      rowHeaderSvg = void 0,
      colHeaderSvg = void 0;

  // variables tied to data for table and cell size
  var rowHeaderLevelNum = 1;
  var colHeaderLevelNum = 1;
  var cellH = void 0;
  var cellW = void 0;

  // generator to draw table
  function table(selection) {

    // for every selection:
    selection.each(function (d, i) {

      // loading in data
      var columnLabel = d.columnLabel;
      var rowLabel = d.rowLabel;
      var value = d.value;

      // set up table selectors
      svg = d3.select(this).select('svg');
      tableSvg = svg.append('g').attr('class', 'table').attr('transform', 'translate(' + margins.left + ',' + margins.top + ')').attr("opacity", 1);
      tableBodySvg = tableSvg.append('g').attr('class', 'table-body');
      tableHeaderSvg = tableSvg.append('g').attr('class', 'table-header');
      rowHeaderSvg = tableHeaderSvg.append('g').attr('class', 'row-header');
      colHeaderSvg = tableHeaderSvg.append('g').attr('class', 'col-header');

      // variables tied to data for table creation
      chartW = Math.max(width - margins.left - margins.right, 0.1);
      chartH = Math.max(height - margins.top - margins.bottom, 0.1);
      cellH = chartH / (value.length + rowHeaderLevelNum);
      cellW = chartW / (value[0].length + colHeaderLevelNum);

      // all components for the table below

      // row header
      var rowHeaderCell = rowHeaderSvg.selectAll('rect.row-header-cell').data(rowLabel);
      rowHeaderCell.enter().append('rect').attrs({
        class: 'row-header-cell',
        width: cellW,
        height: cellH,
        x: 0,
        y: function y(d, i) {
          return i * cellH + cellH * colHeaderLevelNum;
        }
      }).styles({
        fill: '#eee',
        stroke: 'silver'
      });

      // row header text
      rowHeaderCell.enter().append('text').attrs({
        class: 'row-header-content',
        x: 0,
        y: function y(d, i) {
          return i * cellH + cellH * colHeaderLevelNum;
        },
        dx: cellW / 2,
        dy: cellH / 2
      }).styles({
        fill: 'black',
        'text-anchor': 'middle'
      }).text(function (d, i) {
        return d;
      });

      // col header
      var colHeaderCell = colHeaderSvg.selectAll('rect.col-header-cell').data(columnLabel);
      colHeaderCell.enter().append('rect').attrs({
        class: 'col-header-cell',
        width: cellW,
        height: cellH,
        x: function x(d, i) {
          return i * cellW + cellW * rowHeaderLevelNum;
        },
        y: 0
      }).styles({
        fill: '#eee',
        stroke: 'silver'
      });

      // col header text
      colHeaderCell.enter().append('text').attrs({
        class: 'col-header-content',
        x: function x(d, i) {
          return i * cellW + cellW * rowHeaderLevelNum;
        },
        y: 0,
        dx: cellW / 2,
        dy: cellH / 2
      }).styles({
        fill: 'black',
        'text-anchor': 'middle'
      }).text(function (d, i) {
        return d;
      });

      // body
      var row = tableBodySvg.selectAll('g.row').data(value);
      row.enter().append('g').attr('class', 'cell row').each(function (rD, rI) {
        // for each row, first the cell
        var cell = d3.select(this).selectAll('rect.cell').data(rD);
        cell.enter().append('rect').attrs({
          class: 'cell',
          width: cellW,
          height: cellH,
          x: function x(d, i) {
            return i * cellW + cellW * rowHeaderLevelNum;
          },
          y: function y(d, i) {
            return rI * cellH + cellH;
          }
        }).styles({
          fill: 'white',
          stroke: 'silver'
        });

        // text
        cell.enter().append('text').attrs({
          class: 'cell-content',
          width: cellW,
          height: cellH,
          x: function x(d, i) {
            return i * cellW + cellW * rowHeaderLevelNum;
          },
          y: function y(d, i) {
            return rI * cellH + cellH;
          },
          dx: cellW / 2,
          dy: cellH / 2
        }).styles({
          fill: 'black',
          'text-anchor': 'middle'
        }).text(function (d, i) {
          return d;
        });
      });
    });
  }

  // state definitions
  table.fadeIn = function (elements) {
    return elements.attr("opacity", 1);
  };
  table.fadeOut = function (elements) {
    return elements.attr("opacity", 0);
  };
  table.bringIn = function (elements) {
    return elements.call(table.fadeIn).attr("transform", "translate(" + margins.left + ',' + margins.top + ")");
  };
  table.moveOut = function (elements) {
    return elements.call(table.fadeOut).attr("transform", "translate(" + (margins.left - 40) + "," + margins.top + ")");
  };

  // element definitions
  table.wholeTable = function () {
    return tableSvg;
  };

  // getters / setters
  table.width = function (value) {
    if (!arguments.length) {
      return width;
    }
    width = value;
    return table;
  };
  table.height = function (value) {
    if (!arguments.length) {
      return height;
    }
    height = value;
    return table;
  };
  table.margins = function (values) {
    if (!arguments.length) {
      return margins;
    }
    margins = values;
    return table;
  };

  // return the table generator
  return table;
}