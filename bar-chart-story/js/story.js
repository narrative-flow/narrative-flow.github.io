// for a bar chart story based on Simpsons data

// story variation variables
let discrete = false;
let stepper = false;
let stepperText = false;
if(stepper){
  discrete = true;
}
let reverse;
let transitionTime = 600;
let sticky = false;
// TODO more variables into gui controls? which ones?
let showTimeline = true;
let stickySwap = false;
// easing of the scroll position (slow-out, I think... well, depends on direction, hmmm)
let scrollEaseOut = 0.85;

// grab window height
let windowHeight = document.documentElement.clientHeight;

// default spacing between continuous steps
let intervalSpacing = 300;

// number of pixels to lock text
let lockPixels = 800;
let lockPixelsOffset = 200;

// sticky text with scroll magic scenes
let scrollMagicController;
function useStickyText(){
  // create a scrollmagic scene
  function createMagicScene(element, controller){
    let magicScene = new ScrollMagic.Scene({
      triggerElement: "#" + element,
      offset: lockPixelsOffset,
      duration: lockPixels
      }).setPin("#" + element)
      // .addIndicators()
      .addTo(controller);
  }

  // add sticky text using scroll magic
  scrollMagicController = new ScrollMagic.Controller({loglevel: 3});
  let uniqueStateIDs = Array.from(new Set(stateIDs));
  for(let id in uniqueStateIDs){
    createMagicScene(uniqueStateIDs[id], scrollMagicController);
  }
}

if(sticky){
  useStickyText();
}

// scrollytelling set up
let container = d3.select('body');
let content = d3.select('.content');
let totalPixels, fullWindowPixels, scrollLength, scrollPosition, newScrollPosition;
function setScrollytellingVariables(){
  totalPixels = content.node().getBoundingClientRect().height;
  fullWindowPixels = document.documentElement.getBoundingClientRect().height;
  scrollLength = totalPixels - windowHeight;
  scrollPosition = 0;
  newScrollPosition = 0;
}
setScrollytellingVariables();

// need scrollPosition & scrollLength for scroller values in d3-transition module currently
let setDimensions = function(){
  totalPixels = content.node().getBoundingClientRect().height;
  windowHeight = document.documentElement.clientHeight;
  scrollLength = totalPixels - windowHeight;
  resetStory();
};

// when resizing, get new variables for viewport
window.onresize = setDimensions;

// initialize variables for state storage
let stateIndex, stateChange, crossMidpoint, currentPos, states, stateEnds, stateOffset;
function setStateStorage(){
  stateIndex = 0;
  if(discrete){
    stateIndex = -1;
  }
  stateChange = false;
  crossMidpoint = false;
  currentPos = 0;

  // must reset this for switching between discrete & continuous
  reverse = undefined;

  // scroller dynamic transition functions
  states = [];
  stateEnds = [];
  stateOffset = -windowHeight / 6;
  if(sticky){
    stateOffset = 0;
    if(stickySwap){
      stateOffset = lockPixels;
    }
  }
  let prev = "";
  for(let i in stateIDs){
    states[i] = d3.select("#" + stateIDs[i]).node().getBoundingClientRect().top + stateOffset;
    // TODO only works for pairing two states together, need to adjust for more!
    if(stateIDs[i] === prev){
      let next = d3.select("#" + stateIDs[+i + 1]).node().getBoundingClientRect().top + stateOffset;
      states[i] = (states[i] + next) / 2;
    }
    prev = stateIDs[i];
  }
  for(let i in states){
    if(sticky && !stickySwap){
      if(i < states.length - 1){
        states[i] = states[+i + 1];
      }
    }
    stateEnds[i] = states[i] + lockPixels;
  }
  // if we have a stepper, need to manually tweak positions
  if(stepper){
    let prev = "";
    for(let i in states){
      if(stateIDs[i] === prev){
        states[i] = states[i - 1] + 150;
      }
      prev = stateIDs[i];
    }
  }
  if(sticky && !stickySwap){
    states[states.length - 1] = scrollLength;
    stateEnds[states.length - 1] = scrollLength;
  }
  if(!sticky){
    for(let i in states){
      if(i < states.length - 1){
        stateEnds[i] = states[+i + 1] - intervalSpacing;
      }
    }
  }
  // redo states for midpoint (discrete scroller)
  if(discrete && !stepper){
    let statesTemp = [];
    for(let i = 0; i < states.length - 1; i++){
      statesTemp[i] = (states[i] + states[i + 1]) / 2 - stateOffset;
    }
    // add one to end, to keep same state length
    statesTemp[states.length - 1] = states[states.length - 1];
    states = statesTemp;
  }
}
setStateStorage();

// ensure we are at the top of the page on each load
window.onbeforeunload = function(){
  window.scrollTo(0, 0);
};

// which elements to draw (when loading)
function buildStoryComponents(){
  setupVis();
  // must wait to draw after initializing states
  // TODO currently not supporting at all...
  // if(!discrete){
  //   drawIcons(stateScales[0], reverse);
  // }
}

// set up visualization in an svg and its scales, colors, & other variables
let setup = {};
let views = {};
function setupVis(){
  setup.margin = {top: 20, right: 20, bottom: 30, left: 40};
  setup.displayW = 700;
  setup.displayH = 500;

  setup.svg = d3.select(".vis").append("svg")
      .attr("width", setup.displayW)
      .attr("height", setup.displayH)
    .append("g")
      .attr("transform", "translate(" + setup.margin.left + "," + setup.margin.top + ")");
  
  // initialize & draw our story visualizations
  drawStoryViews();

  // initialize the scrollbar timeline view
  if(showTimeline){
    let timelineSelection = d3.select(".timeline");
    views.timeline = timeline()
      .height(parseFloat(timelineSelection.style("height")))
      .pageLength(fullWindowPixels)
      .pageHeight(windowHeight);
    if(discrete){
      views.timeline.discreteMarkers();
    }
    if(stepper){
      views.timeline.stepperTimeline();
    }
    timelineSelection
      .datum(storyTimeline)
      .call(views.timeline);
    
    // add scrollbar timeline view interactions
    let draggingText = function(d, i, offset){
       $(".section:eq(" + i + ")").css("position", "relative")
          .css("top", offset);
    };
    let draggedText = function(d, i, offset){
      $(".section:eq(" + i + ")").css("position", "relative")
        .css("top", offset);
    };
    views.timeline.textDrag(draggingText, draggedText);

    let draggedMarkerStart = function(d, i, y){
      states[i] = y;
      createStateScales();
      render();
    };
    views.timeline.visMarkerStart(draggedMarkerStart);

    if(!discrete){
      let draggedMarkerEnd = function(d, i, y){
        stateEnds[i] = y;
        createStateScales();
        render();
      };
      views.timeline.visMarkerEnd(draggedMarkerEnd);
      
      let draggedMarker = function(d, i, y1, y2){
        states[i] = y1;
        stateEnds[i] = y2;
        createStateScales();
        render();
      };
      views.timeline.visMarker(draggedMarker);
    }
  }
}

// function to render vis state (repeated on scrolling conditions)
let render = function(){

  // get new scroll position
  newScrollPosition = document.documentElement.scrollTop || document.body.scrollTop;

  if(scrollPosition !== newScrollPosition){
    // slowly ease into current position
    scrollPosition = scrollEase(scrollPosition, newScrollPosition);

    // update window marker in timeline
    if(showTimeline){
      views.timeline.updateWindowMarker(scrollPosition);
    }
  }
  findStateIndex();
  if(stateChange){

    // transition function
    let tf = stateScales[stateIndex];
    drawState(tf);
    stateChange = false;
    if(reverse){
      stateIndex--;
      reverse = false;
    }
  }
};

// only re-render state dynamically if not stepper
let scrollerTimer;
if(!stepper){
  scrollerTimer = d3.timer(render);
}

// state/s to draw based on index
let drawState = function(tf){

  // declare global transition object for all states (each time, otherwise issues)
  // can fix timing, duration, and easing
  // may want to create multiple to allow customization though
  // keep in mind that going forward/reverse may cause issues with easing!
  let globalTransition = d3.transition("state-" + stateIndex)
    .duration(transitionTime);
  
  // draw a state based on the state index
  drawAState(stateIndex, tf, reverse, globalTransition);
};

// enable drawing different states
function drawAState(stateIndex, dynamics, reverse, transitionName){

  // on final state, there are no transitions to create
  if(stateIndex >= allStates.length - 1 || stateIndex < 0){
    return false;
  }

  // wire up all interactions
  for(let moduleName in allStates[stateIndex].state){
    // element to change between states
    let moduleObject = allStates[stateIndex].state[moduleName];
    let nextModuleObject = allStates[stateIndex + 1].state[moduleName];
    // ignoring any errors
    if(nextModuleObject === undefined){
      continue;
    }
    let module = views[moduleName];
    // console.log(moduleObject);
    for(let elementsName in moduleObject){
      // console.log(moduleObject[elementsName]);
      // console.log("state " + stateIndex + " - module " + moduleName + " - element " + elementsName + " - function " + moduleObject[elementsName]);
      let elements = module[elementsName]();
      let funct = views[moduleName][moduleObject[elementsName]];
      let nextFunct = views[moduleName][nextModuleObject[elementsName]];
      // ignoring any errors
      if(nextFunct === undefined){
        continue;
      }
      // play transition from one state to the next
      if(reverse === undefined){
        // iniital state attributes/styles
        elements.call(funct);
        // final state attributes/styles & perform transition
        elements = elements.interrupt().transition().dynamic(dynamics);
        elements.call(nextFunct);
      // play the transition to the desired state
      }else{
        elements = elements.transition(transitionName);
        // play transition forward
        if(!reverse){
          elements.call(nextFunct);
        // play transition backwards
        }else{
          elements.call(funct);
        }
      }
    }
  }
}

// create story timeline data
let storyTimeline;
function createStoryTimeline(){
  storyTimeline = {"text": [], "vis": [], "visEnd": []};

  // store story states into data structure for timeline
  storyTimeline.vis = states;

  // only store unique state IDs for text states to avoid duplicate controls
  let uniqueStateIDs = Array.from(new Set(stateIDs));
  for(let i = 0; i < uniqueStateIDs.length; i++){
    storyTimeline.text[i] = [d3.select("#" + uniqueStateIDs[i]).node().getBoundingClientRect().top];
    storyTimeline.text[i].push(d3.select("#" + uniqueStateIDs[i]).node().getBoundingClientRect().bottom);
  }

  // get story end states
  storyTimeline.visEnd = stateEnds;
}
createStoryTimeline();

// create new scales automatically
// return 0 to 1, based on states & scroll positions
let createScale = function(index){
  let scale = d3.scaleLinear()
    .domain(sticky ?
        [states[index], stateEnds[index]] :
        [states[index], stateEnds[index]])
    .range([0, 1])
    .clamp(true);
  return function(){
    return scale(scrollPosition);
  };
};

// create all the scales for state transitions
// map to the transition between index and index + 1
let stateScales;
function createStateScales(){
  stateScales = [];
  for(let i = 0; i < (states.length - 1); i++){
    stateScales[i] = createScale(i);
  }
}
createStateScales();

// find proper stateIndex for loading story parts
function findStateIndex(){
  if(scrollPosition > states[stateIndex + 1] && scrollPosition < states[states.length - 1]){
    stateIndex++;
    stateChange = true;
    if(discrete){
      reverse = false;
    }
  // fix so that changes scroll backwards to -1 accordingly (think it works okay for both)
  }else if(scrollPosition < states[stateIndex] && scrollPosition > 0){
    stateIndex--;
    stateChange = true;
    if(discrete){
      reverse = true;
      // undo increment for reversing discretely (to replay)
      stateIndex++;
    }
  }
}

// disable input "easing" with speed of 0, higher makes for slower ease
let scrollEaseThreshold = 0.01;
let scrollEase = function(current, actual) {
  let ease = discrete ? 0 : scrollEaseOut;
  let remainder = (current - actual) * ease;
  // close enough, use the real scroll position
  if(Math.abs(remainder) < scrollEaseThreshold) {
    return actual;
  // otherwise, move closer and closer to real scroll position
  } else {
    return remainder + actual;
  }
};

// functions to change stepper
let stepForward = function(){
  stateIndex++;
  // reached the end
  let overflow = false;
  if(stateIndex > states.length - 2){
    stateIndex = states.length - 2;
    overflow = true;
  }
  reverse = false;
  let tf = stateScales[stateIndex];
  drawState(tf);
  // update text on screen
  // must reset window to find proper scroll position
  window.scroll(0, 0);
  let textPosPrev = d3.select("#" + stateIDs[stateIndex]).node().getBoundingClientRect().top + stateOffset;
  let textPos = d3.select("#" + stateIDs[stateIndex + 1]).node().getBoundingClientRect().top + stateOffset;
  if(overflow){
    textPosPrev = textPos;
  }
  window.scroll(0, textPosPrev);
  // animate motion and fading out of text
  if(stepperText){
    $("h1").animate({opacity: 0}, 400);
    $(".section:not(#" + stateIDs[stateIndex + 1] + ")").animate({opacity: 0}, 400);
    $("body").animate({scrollTop: textPos}, 400);
    $("#" + stateIDs[stateIndex + 1]).animate({opacity: 1}, 400);
  }else{
    d3.selectAll(".section").style("opacity", 0);
    d3.select("#" + stateIDs[stateIndex + 1]).style("opacity", 1);
    window.scroll(0, textPos);
  }
  // update the timeline window marker
  if(showTimeline){
    views.timeline.updateWindowMarker(textPos, stepperText);
  }
};
let stepBackward = function(){
  reverse = true;
  let tf = stateScales[stateIndex];
  drawState(tf);
  // change index pointer, AFTER drawing in reverse, odd but necessary 
  stateIndex--;
  // reached the beginning
  let overflow = false;
  if(stateIndex < -1){
    stateIndex = -1;
    overflow = true;
  }
  // update text on screen
  let textPos, textPosPrev;
  // must reset window to find proper scroll position
  window.scroll(0, 0);
  // initial screen is different, special handling of stateIndex
  if(stateIndex === -1){
    textPos = 0;
    textPosPrev = d3.select("#" + stateIDs[stateIndex + 2]).node().getBoundingClientRect().top + stateOffset;
    if(overflow){
      textPosPrev = 0;
    }
    if(stepperText){
      $("h1").animate({opacity: 1}, 400);
    }
  }else{
    textPos = d3.select("#" + stateIDs[stateIndex + 1]).node().getBoundingClientRect().top + stateOffset;
    textPosPrev = d3.select("#" + stateIDs[stateIndex + 2]).node().getBoundingClientRect().top + stateOffset;
  }
  window.scroll(0, textPosPrev);
  // fancy motion of stepper text
  if(stepperText){
    $("body").animate({scrollTop: textPos}, 400);
    $(".section:not(#" + stateIDs[stateIndex + 1] + ")").animate({opacity: 0}, 400);
    $("#" + stateIDs[stateIndex + 1]).animate({opacity: 1}, 400);
  }else{
    d3.selectAll(".section").style("opacity", 0);
    d3.select("#" + stateIDs[stateIndex + 1]).style("opacity", 1);
    window.scroll(0, textPos);
  }
  // update the timeline window marker
  if(showTimeline){
    views.timeline.updateWindowMarker(textPos, stepperText);
  }
};

// one time, set up the zingtouch for whole screen & wire up interactions
let zingElem = document.getElementById("swipe");
let zingTouch = new ZingTouch.Region(zingElem);
zingTouch.bind(zingElem).swipe( function(event){
  let direction = event.detail.data[0].currentDirection;
  // swipe to the right, go backward
  if(direction < 15 || direction > 345){
    stepBackward();
  }
  // swipe to the left, go forward
  if(direction > 165 && direction < 195){
    stepForward();
  }
});

// wire up interactions for scroller OR stepper
let stepperKeys;
function setInteractions(){
  // remove general interactions
  document.removeEventListener("keyup", stepperKeys);
  document.querySelector("#swipe").style.display = "none";

  // remove stepper if not a stepper
  // remove other interactions as well
  if(!stepper){
    d3.select(".control").style("display", "none");
    d3.select("body").style("overflow", "scroll");
    
  // otherwise, wire up stepper
  }else{

    // reshow the stepper controls
    d3.select(".control").style("display", "block");

    // lock scrolling
    d3.select("body").style("overflow", "hidden");

    // manually set initial state for stepper
    stateIndex = -1;

    // wire up buttons and keyboard commands for stepper
    d3.select("#step-next").on("click", stepForward);
    d3.select("#step-prev").on("click", stepBackward);
    stepperKeys = function(e){
      let key = e.keyCode;
      if(key === 39){
        stepForward();
      }
      if(key === 37){
        stepBackward();
      }
    };
    document.addEventListener("keyup", stepperKeys, false);

    // enable zing touch swiping by unhiding its controller
    document.querySelector("#swipe").style.display = "block";
  }
}
setInteractions();

// clear the story for refreshing data variables
function resetStory(){
  window.scroll(0, 0);
  d3.select(".vis svg").remove();
  d3.select(".timeline svg").remove();
  setup = {};
  views = {};
  // kill animation loop
  if(scrollerTimer){
    scrollerTimer.stop();
  }
  // update other variables
  updateVariables();
  // rebuild the story
  buildStoryComponents();
  // reshow any stepper text
  d3.selectAll(".section").style("opacity", 1);
  d3.select("h1").style("opacity", 1);
  // reinstantiate scrolling animation loop
  if(!stepper){
    scrollerTimer = d3.timer(render);
  }
}

function updateVariables(){
  // make sure stepper has discrete activated
  if(stepper){
    discrete = true;
  }

  // wipe and recreate scroll magic scenes
  if(scrollMagicController !== undefined){
    scrollMagicController.destroy(true);
  }
  if(sticky){
    useStickyText();
  }

  // reset other variables
  setScrollytellingVariables();

  // reset state variables
  setStateStorage();

  // reset timeline data
  createStoryTimeline();

  // reset text positions
  document.querySelector(".section").style.top = 0;

  // reset state scales
  createStateScales();

  // re-setup interactions
  setInteractions();
}

// wire up story controller buttons
if(!stepper){
  document.querySelector("#feedback").disabled = true;
}else{
  document.querySelector("#continuous").disabled = true;
  document.querySelector("#discrete").disabled = true;
  document.querySelector("#discrete").checked = true;
  document.querySelector("#sticky").disabled = true;
}
document.querySelector("#duration").value = transitionTime;
if(!discrete){
  document.querySelector("#duration").disabled = true;
}
document.querySelector("#scroller").onclick = function(){
  stepper = false;
  document.querySelector("#feedback").checked = true;
  document.querySelector("#feedback").disabled = true;
  if(!discrete){
    document.querySelector("#duration").disabled = true;
  }
  document.querySelector("#continuous").disabled = false;
  document.querySelector("#discrete").disabled = false;
  document.querySelector("#sticky").disabled = false;
  resetStory();
};
document.querySelector("#stepper").onclick = function(){
  stepper = true;
  discrete = true;
  document.querySelector("#feedback").disabled = false;
  document.querySelector("#duration").disabled = false;
  stepperText = document.querySelector("#feedback").checked;
  document.querySelector("#continuous").disabled = true;
  document.querySelector("#discrete").disabled = true;
  document.querySelector("#discrete").checked = true;
  document.querySelector("#sticky").disabled = true;
  resetStory();
};
document.querySelector("#continuous").onclick = function(){
  discrete = false;
  document.querySelector("#duration").disabled = true;
  resetStory();
};
document.querySelector("#discrete").onclick = function(){
  discrete = true;
  document.querySelector("#duration").disabled = false;
  resetStory();
};
document.querySelector("#feedback").onclick = function(){
  stepperText = document.querySelector("#feedback").checked;
  resetStory();
};
document.querySelector("#duration").onclick = function(){
  transitionTime = document.querySelector("#duration").value;
  resetStory();
};
document.querySelector("#sticky").onclick = function(){
  sticky = document.querySelector("#sticky").checked;
  stepper = false;
  if(sticky){
    document.querySelector("#scroller").checked = true;
    document.querySelector("#scroller").disabled = true;
    document.querySelector("#stepper").disabled = true;
  }else{
    document.querySelector("#scroller").checked = true;
    document.querySelector("#scroller").disabled = false;
    document.querySelector("#stepper").disabled = false;
  }
  resetStory();
};
