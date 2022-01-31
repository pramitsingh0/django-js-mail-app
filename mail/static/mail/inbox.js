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
  document.querySelector('#email-view').style.display = 'none';



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
    console.log(emails)
    emails.forEach(element => {
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
                          <div class="card" style="width: fit-content;">
                            <ul class="list-group list-group-flush">
                              <li class="list-group-item"><b>Sender:</b> ${mail["sender"]}</li>
                              <li class="list-group-item"><b>Recipients:</b> ${mail["recipients"]}</li>
                              <li class="list-group-item"><b>Subject:</b> ${mail["subject"]}</li>
                              <li class="list-group-item">${mail["timestamp"]}</li>
                            </ul>
                          </div>
                          <div id="buttons" style="float: right;">
                            <div id="archive" style="float: left;" class="btn btn-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="white" class="bi bi-archive" viewBox="0 0 16 16">
                            <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                            </svg> ${!mail['archived'] ? 'Archive' : 'Unarchive'}
                            </div>
                            <div id="reply" class="btn btn-primary" style="float: right; margin-left: 10px;"><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-reply" viewBox="0 0 16 16">
                            <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.74 8.74 0 0 0-1.921-.306 7.404 7.404 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254a.503.503 0 0 0-.042-.028.147.147 0 0 1 0-.252.499.499 0 0 0 .042-.028l3.984-2.933zM7.8 10.386c.068 0 .143.003.223.006.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96v-.667z"/>
                            </svg>Reply</div>
                          </div>
                          <div style="clear: both;"></div>


                          
<div id="mail-body" class="card card-body" style="white-space: pre-wrap;">
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

    document.querySelector('#archive').addEventListener('click', () => {
      fetch('/emails/' + mailId, {
        method: 'PUT',
        body: JSON.stringify({ archived : !mail["archived"]})
      })
      .then(response => load_mailbox('inbox'))
    })
    document.querySelector('#reply').addEventListener('click', () => {
      compose_email();
      fetch('/emails/' + mailId)
      .then(response => response.json())
      .then(mail => {
        document.querySelector('#compose-recipients').value = mail["sender"];
        document.querySelector('#compose-subject').value = "Re: " + mail["subject"];
        document.querySelector('#compose-body').value = `On ${mail["timestamp"]}, ${mail["sender"]} wrote:\n\t${mail["body"]}\n---------------------------------------------------`;
      })
    })
  })
}