// variable to determine where in study
// A, B, Q, F --> first condition, second condition, questionnaire, or full story
var studyState = "B";

// variables to set URLs
var stateAkey = "uphill";
var stateBkey = "decipher";
var stateQkey = "magnitude";

// main conditions set here (1 - text, 2 - static vis, 3 - stepper, 4 - scroller)
var firstCondition = "cond4";
var secondCondition = "cond2";
var mainCondition = firstCondition;
if(studyState === "B"){
  mainCondition = secondCondition;
}

// remove half of story, if needed
if(studyState === "A" || studyState === "B"){
  var chapterToRemove = (studyState === "A") ? "2" : "1";
  var chapter = document.querySelectorAll(".chap" + chapterToRemove);
  for(var element in chapter){
    if(element < chapter.length){
      chapter[element].style.display = "none";
    }
  }
}

// only keep relevant bits for each state (by removing other ones respectively)
if(studyState !== "A"){
  $(".stateA").css("display", "none");
}
if(studyState !== "B"){
  $(".stateB").css("display", "none");
}
if(studyState !== "F"){
  $(".stateF").css("display", "none");
}

// questionnaire will just be its own page!
// state F is the full story for debugging / restoration purposes (worry more about this later)

// debugging, to easily navigate pieces
var debugMode = true;