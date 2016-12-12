// only if not in iframe do these automatically
if(studyState !== "F"){
  // start timer
  var surveyStart = Math.round(performance.now()) / 1000.0;

  // grab our form for storying page data
  var form = $("#gform");

  // load all other data into hidden fields
   // initial variables to capture for survey: random id, resolution, browser
  var uid = window.location.hash;
  var userAgentString = navigator.userAgent;
  var initialResolutionWidth = window.innerWidth;
  var initialResolutionHeight = window.innerHeight;
  var finalResolutionWidth = window.innerWidth;
  var finalResolutionHeight = window.innerHeight;
  form.find("#user-id").val(uid);
  form.find("#browser").val(userAgentString);
  form.find("#res-start").val(initialResolutionWidth + "x" + initialResolutionHeight);
  form.find("#res-end").val(finalResolutionWidth + "x" + finalResolutionHeight);
  var storyCondition = "";
  if(firstCondition === "cond1"){
    storyCondition += "Te";
  }else if(firstCondition === "cond2"){
    storyCondition += "Vi";
  }else if(firstCondition === "cond3"){
    storyCondition += "St";
  }else if(firstCondition === "cond4"){
    storyCondition += "Sc";
  }
  storyCondition += "-";
  if(secondCondition === "cond1"){
    storyCondition += "Te";
  }else if(secondCondition === "cond2"){
    storyCondition += "Vi";
  }else if(secondCondition === "cond3"){
    storyCondition += "St";
  }else if(secondCondition === "cond4"){
    storyCondition += "Sc";
  }

  form.find("#condition").val(storyCondition);

  // remove questions on certain conditions?
  // if(mainCondition === "cond1"){
  //   form.find(".visual-conditions-only").remove();
  // }

  // store timer in form
  form.find("#survey-time").val(surveyStart);
}