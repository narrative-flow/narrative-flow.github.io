
// by default, push our survey data
var formID = "iform";

// get all data in form and return object
function getFormData(id) {
  var elements = document.getElementById(id).elements; // all form elements
  var fields =  Object.keys(elements).map(function(k){
        if(elements[k].name !== undefined){
            return elements[k].name;
        // special check for Edge's html collection
        }else if(elements[k].length > 0){
          return elements[k].item(0).name;
        }
    }).filter(function(item, pos, self){
      return self.indexOf(item) == pos && item;
    });
    // console.log(fields);
  var data = {};
  fields.forEach(function(k){
    data[k] = elements[k].value;
    if(elements[k].type === "checkbox"){
      data[k] = elements[k].checked;
    // special check for Edge's html collection
    }else if(elements[k].length){
      for(var i = 0; i < elements[k].length; i++){
        if(elements[k].item(i).checked){
          data[k] = elements[k].item(i).value;
        }
      }
    }
  });
  // console.log(data);
  return data;
}

function handleFormSubmit(event) {  // handles form submit withtout any jquery

  // calculate all form values to submit
  insertDataIntoForm();

  event.preventDefault();           // we are submitting via xhr below
  var data = getFormData(formID);         // get the values submitted in the form
    // var url = event.target.action;  //
    // var xhr = new XMLHttpRequest();
    // xhr.open('POST', url);
    // xhr.withCredentials = true;
    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.onreadystatechange = function() {
        // console.log( xhr.status, xhr.statusText )
        // console.log(xhr.responseText);
        // return;
    // };
    // url encode form data for sending as post data
    // var encoded = Object.keys(data).map(function(k) {
        // return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
    // }).join('&');
    // xhr.send(encoded);

    // open up catchpa at end
    openUpCaptcha();
}

// attach listeners to our form buttons
function loaded() {
  // console.log('contact form submission handler loaded successfully');
  // bind to the submit event of our form
  var form = document.getElementById(formID);
  form.addEventListener("submit", handleFormSubmit, false);
}

document.addEventListener('DOMContentLoaded', loaded, false);
