"use strict";

// parse data from CSV into JS
// all of these datasets are related and may want to clean this up for transitions...
var simpsonsBars = [{ "gender": "F", "age": "child", "quantity": 0 }, { "gender": "F", "age": "adult", "quantity": 0 }, { "gender": "M", "age": "child", "quantity": 0 }, { "gender": "M", "age": "adult", "quantity": 0 }, { "gender": "F", "family": "Y", "quantity": 0 }, { "gender": "M", "family": "Y", "quantity": 0 }];
var simpsonsTable = {
  rowLabel: [],
  columnLabel: ["Gender", "Adult"],
  value: []
};
d3.tsv("d3/simpsons.csv", function (error, data) {
  // for every character, parse into bar chart data
  for (var index in data) {
    var character = data[index];
    // ignore header row
    if (!character.length) {
      // get data from characters for bar charts
      var isMale = character.Male === "1";
      var gender = isMale ? "M" : "F";
      var isAdult = character.Age >= 18;
      var adult = isAdult ? "Y" : "N";
      var hybridIndex = isMale ? isAdult ? 3 : 2 : isAdult ? 1 : 0;
      simpsonsBars[hybridIndex].quantity += 1;
      // only the main simpsons family for the table & aggregation for bars
      if (index < 5) {
        var indexGender = isMale ? 5 : 4;
        simpsonsBars[indexGender].quantity += 1;
        simpsonsTable.rowLabel.push(character[""]);
        simpsonsTable.value.push([gender, adult]);
      }
    }
  }
  // setup and draw story components
  buildStoryComponents();
});

// NOTE requires some components from story.js right now to draw SVGs
function drawStoryViews() {
  // initialize the table view and hide it
  views.table = table().width(setup.displayW - 175).height(setup.displayH).margins({ top: 20, right: 20, bottom: 120, left: 50 });
  d3.select('.vis').datum(simpsonsTable).call(views.table);

  // initialize the bar chart view and hide it
  views.bars = bar();
  d3.select('.vis').datum(simpsonsBars).call(views.bars);
  views.bars.hide();

  // initialize the icon view
  views.icons = icons().iconSize(50).location("img/").barHeight(views.bars.height()).xPos(views.bars.xPos);
  d3.select('.vis').datum(simpsonsTable).call(views.icons);
}