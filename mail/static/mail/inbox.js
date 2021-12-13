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
  document.querySelector('#email-view').style.display = 'none';

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(element => {
      if (element["archived"]) {
        return;
      }
      const mail = document.createElement('div');
      mail.setAttribute("class", "card card-body");
      mail.style.marginBottom = "10px";
      mail.innerHTML = element["subject"].bold() + element["sender"] + " | " + element['timestamp'];
      mail.addEventListener('click', () => view_mail(element["id"]));
      if (element["read"]) {
        mail.style.backgroundColor = "#e9e9e9";
      }
      document.querySelector('#emails-view').append(mail);
    });
  })


  
  
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

function view_mail(mailId) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#email-view').innerHTML = "";

  fetch('/emails/' + mailId)
  .then(response => response.json())
  .then(mail => {
    const mail_div = document.createElement('div')
    mail_div.setAttribute('id', 'mail-container')
    mail_div.innerHTML = `
                          <div class="card" style="width: 18rem;">
                            <ul class="list-group list-group-flush">
                              <li class="list-group-item"><b>Sender:</b> ${mail["sender"]}</li>
                              <li class="list-group-item"><b>Recipients:</b> ${mail["recipients"]}</li>
                              <li class="list-group-item"><b>Subject:</b> ${mail["subject"]}</li>
                              <li class="list-group-item">${mail["timestamp"]}</li>
                            </ul>
                          </div>

                          
                          <div id="mail-body" class="card card-body">
                            ${mail["body"]}
                          </div>
                          `;
    document.querySelector('#email-view').append(mail_div);
    document.querySelector('#mail-body').style.marginTop = "40px";
    if (!mail['read']) {
      fetch('/emails/' + mailId, {
        method: 'PUT',
        body: JSON.stringify({ read : true })
      })
    }
  })
}