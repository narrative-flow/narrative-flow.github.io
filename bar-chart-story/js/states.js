// declaration of states for automatic creation of stories

// collection of state IDs, to decide state trigger points & text to show in stepper
// TODO autogenerate from other data structure
let stateIDs = ["raw", "icons", "sort", "compare", "building", "replace", "replace", "compare2", "scaling", "scaling", "pivoting", "move"];

// TODO auto-create operations from a simpler data structure?
// TODO states seem off by one? record how this works (state A vs state AB vs transition A->B)
allStates = [{
  id: "raw",
  // TODO document this: module: { element : function }, elements must be unique
  state: {
    table: {
      wholeTable: "bringIn"
    },
    icons: {
      allIcons: "nextToTable"
    }
  }
},{
  id: "icons",
  state: {
    table: {
      wholeTable: "moveOut"
    },
    icons: {
      allIcons: "moveOverTable"
    },
    bars: {
      xAxis: "fadeOut"
    }
  }
},{
  id: "sort",
  state: {
    icons: {
      allIcons: "moveToChart"
    },
    bars: {
      xAxis: "fadeIn",
      allBars: "fadeOut",
      compareAxis1: "fadeOut",
      compareAxis2: "fadeOut"
    }
  }
},{
  id: "compare",
  state: {
    bars: {
      compareAxis1: "compareNearIcons",
      compareAxis2: "fadeIn",
      compareAxisDomain: "fadeOut",
      // TODO temporary fix for stepper, to make sure that each set of states get run together!
      allBars: "fadeOut"
    }
  }
},{
  id: "building",
  state: {
    icons: {
      allIcons: "fadeIn"
    },
    bars: {
      compareAxis1: "compareToAxis",
      compareAxis2: "fadeOut",
      compareAxisDomain: "fadeIn",
      allBars: "emptyBars"
    }
  }
},{
  id: "replace",
  state: {
    icons: {
      allIcons: "fadeOut"
    },
    bars: {
      allBars: "familyByGender",
      compareAxis1: "fadeIn",
      yAxis: "fadeOut"
    }
  }
},{
  id: "replace",
  state: {
    bars: {
      compareAxis1: "fadeOut",
      yAxis: "scaleAxisSmall",
      familyBars: "familyByGender",
      fullBars: "fadeOut"
    }
  }
},{
  id: "compare2",
  state: {
    bars: {
      // TODO bug going BACKwards... before went to g = 1 - f(); works fine in stepper? very minor
      yAxis: "scaleAxisLarge",
      familyBars: "scaleFamilyBars",
      fullBars: "allEmpty"
    }
  }
},{
  id: "scaling",
  state: {
    bars: {
      familyBars: "fadeIn",
      fullBars: "allByGender",
      yAxis: "fadeIn"
    }
  }
},{
  id: "scaling",
  state: {
    bars: {
      familyBars: "fadeOut",
      fullBars: "moveApart",
      yAxis: "fadeOut",
      legend: "fadeOut"
    }
  }
},{
  id: "pivoting",
  state: {
    bars: {
      yAxis: "fadeOut",
      fullBars: "changeColor",
      legend: "fadeIn",
      legendColors: "fadeIn",
      legendText: "legendPosition",
      xAxisText: "fadeIn"
    }
  }
},{
  id: "move",
  state: {
    bars: {
      yAxis: "fadeIn",
      fullBars: "moveToAge",
      legendColors: "fadeOut",
      legendText: "moveLegend",
      xAxisText: "fadeOut"
    }
  }
}];
