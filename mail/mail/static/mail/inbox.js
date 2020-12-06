document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  document.querySelector('#compose-form').onsubmit = send_mail;
  document.querySelector('#archive-email-content').addEventListener('click', () => onclick_toggle_archive() );

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-card').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-card').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetching_all_inbox_emails(mailbox);

}

function fetching_all_inbox_emails(mailbox){
  
  // Clearing div email-card 
  document.getElementById("email-card").innerHTML = "";
  // Getting the inbox emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
  // Print emails
  console.log("here1");
  console.log(emails);
  // Making div card of email
  emails_show(emails, mailbox)
  })
  .catch(err => {
    console.log(err);
  });

}

function send_mail(){

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      
      if(result.message){
      // Redirect to send
        load_mailbox('sent');
      }

      if(result.error){
      // Showing error msg
        document.querySelector("#error-compose-form").innerHTML = `<p>${result.error}</p>`;
      }

  })
  .catch(err => {
    console.log(err);
  });

  return false
}


function emails_show(emails, mailbox){
  
  flage = false;
  if( mailbox == 'archive'){
    flage = true;
  }

  emails.forEach(email => {
  
    if (email.archived == flage){
    
    var parent_div_node = document.createElement("div");
    
    var p_node_0 = document.createElement("P");
    var textnode_sender = document.createTextNode(email.sender);
    p_node_0.appendChild(textnode_sender);
    parent_div_node.appendChild(p_node_0);
    
    var p_node_1 = document.createElement("P");
    var textnode_subject = document.createTextNode(email.subject);
    p_node_1.appendChild(textnode_subject);
    parent_div_node.appendChild(p_node_1);
    
    var p_node_2 = document.createElement("P");
    var textnode_timestamp = document.createTextNode(email.timestamp);
    p_node_2.appendChild(textnode_timestamp);
    parent_div_node.appendChild(p_node_2);
    
    // Adding on click method to hold email card
    parent_div_node.onclick = function(){
      onclick_email(email);
    }
    
    document.querySelector('#email-card').append(parent_div_node);
    
    parent_div_node.classList.add('email-card-style');
    if(email.read == false){
      parent_div_node.style.backgroundColor = "white"; 
    }
    else if(email.read == true){
      parent_div_node.style.backgroundColor = "gray"; 
    }

    }
  });

  return null;
}

function onclick_email(email){

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-card').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content-view').style.display = 'block';

  input_from = document.querySelector('#email-content-view-from');
  subject_email = document.querySelector('#email-content-subject');
  textarea_email = document.querySelector('#email-content-body');
  time_email = document.querySelector('#email-content-time');
  archive_email = document.querySelector('#archive-email-content');

  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log("here2");
    console.log(email);
    // ... do something else with email ...
    input_from.value = email.sender;
    subject_email.value = email.subject;
    time_email.value = email.timestamp;
    textarea_email.innerHTML = email.body;
  });

  if(email.read == false){
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  }

  archive_email.setAttribute("key", email.id);
  //archive_email.addEventListener('click', onclick_toggle_archive);

  if(email.archived == false){

    archive_email.innerHTML = 'Archive';
    archive_email.classList.remove("btn-warning");
    archive_email.classList.add("btn-info");

  }else{

    archive_email.innerHTML = 'Unarchive';
    archive_email.classList.remove("btn-info");
    archive_email.classList.add("btn-warning");

  }

}

function onclick_toggle_archive(){
    
  email_btn_id = document.querySelector('#archive-email-content').getAttribute("key");
  console.log(email_btn_id);
  
  fetch(`/emails/${email_btn_id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log("here3");
      console.log(email);
      // ... do something else with email ...
      fetch(`/emails/${email_btn_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
      }).then( () => load_mailbox('inbox') )
  });



}