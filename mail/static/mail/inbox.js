document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_mail;
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#notification').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


/////////////////////////CUSTOM FUNCTIONS//////////////////////////////

function send_mail(event) {
  const recipient = document.querySelector('#compose-recipients').value;
  const body = document.querySelector('#compose-body').value;
  const subject = document.querySelector('#compose-subject').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipient,
      body: body,
      subject: subject
    })
  })
  .then(response => response.json())
    .then(result => {
      if ("message" in result) {
        return load_mailbox('sent');
      }

      if ("error" in result) {
        document.querySelector('#notification').style.display = 'block';
        document.querySelector('#notification').innerHTML = result['error'];
      }
    })
  return false;
}