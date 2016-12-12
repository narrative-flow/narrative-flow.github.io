
// by default, push our survey data
var formID = "gform";

//function validEmail(email) { // see:
//  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
//  return re.test(email);
//}
// get all data in form and return object
function getFormData(id) {
  var elements = document.getElementById(id).elements; // all form elements
  //var fields = Object.keys(elements).filter(function(k){
  //  return k.length > 1 && elements[k].name && elements[k].name.length > 0 ;
  //});
    // TODO send updates to code I got this from... though, this is broken in chrome now, crap!
  var fields =  Object.keys(elements).map(function(k){
        if(elements[k].name !== undefined){
            return elements[k].name;
        }
    }).filter(function(item, pos, self){
      return self.indexOf(item) == pos && item;
    });
    // console.log(fields);
  var data = {};
  fields.forEach(function(k){
    data[k] = elements[k].value;
  });
  // console.log(data);
  return data;
}

function handleEmailFormSubmit(event){
  formID = "form-email";
  handleFormSubmit(event);
}

function handleFormSubmit(event) {  // handles form submit withtout any jquery

  // activate spinner for user feedback
  document.getElementById('submit').classList.remove("mdl-button--colored");
  document.getElementById("submit").disabled = true;
  document.getElementById('survey-spinner').classList.add("is-active");

  event.preventDefault();           // we are submitting via xhr below
  var data = getFormData(formID);         // get the values submitted in the form
  //if( !validEmail(data.email) ) {   // if email is not valid show error
  //  document.getElementById('email-invalid').style.display = 'block';
  //  return false;
  //} else {
    // var url = event.target.action;  //
    // var xhr = new XMLHttpRequest();
    // xhr.open('POST', url);
    // xhr.withCredentials = true;
    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.onreadystatechange = function() {
        // console.log( xhr.status, xhr.statusText )
        // console.log(xhr.responseText);
        // console.log(formID);
        document.getElementById('gform').style.display = 'none'; // hide form
        // if(formID != "form-email"){
          document.getElementById('thankyou_message').style.display = 'block';
        // }else{
          // document.getElementById('thankyou_message').style.display = 'none';
          // document.getElementById('thankyou_message2').style.display = 'block';
        // }
        // return;
    // };
    // url encode form data for sending as post data
    // var encoded = Object.keys(data).map(function(k) {
        // return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
    // }).join('&')
    // xhr.send(encoded);
  //}


}

// attach listeners to our form buttons
function loaded() {
  // console.log('contact form submission handler loaded successfully');
  // bind to the submit event of our form
  var form = document.getElementById('gform');
  form.addEventListener("submit", handleFormSubmit, false);

  // add a listener bound to our return form button
  var returnForm = document.getElementById('form-return');
  returnForm.addEventListener("submit", returnToForm);
  var returnForm2 = document.getElementById('form-return2');
  returnForm2.addEventListener("submit", returnToForm);

  // add a listener bound to our email form button
  var emailForm = document.getElementById('form-email');
  emailForm.addEventListener("submit", handleEmailFormSubmit, false);
}

// add function to return to form
function returnToForm(event){
  event.preventDefault();
  document.getElementById('gform').style.display = 'block';
  document.getElementById('thankyou_message').style.display = 'none';
  document.getElementById('thankyou_message2').style.display = 'none';

  // reactivate button
  document.getElementById('submit').classList.add("mdl-button--colored");
  document.getElementById("submit").disabled = false;
  document.getElementById('survey-spinner').classList.remove("is-active");

  // reset default form ID
  formID = "gform";
}

document.addEventListener('DOMContentLoaded', loaded, false);
