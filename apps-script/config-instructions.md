How to connect the system:
- make two google sheets
- place the main sheet (MAASHEET) onto the unrestricted account of two (or both onto the same account)
- copy over maa-sheet.gs into the Apps Script
- copy over maa-sidebar code into Apps Script
- create a folder, set share to anyone, then place ID into the script
- create a google form with a short-answer response on the same account as the main sheet
- click prefill, and then generate link
- get the entry id
- paste the id \# into the sidebar code
- get the form id and paste that also into the sidebar code
- paste maa-backend-ctrl.gs into other sheet (secondary sheet), which can be created on any account.
- deploy the secondary sheet as web app, anyone acts as user, get the link.
- use the CMS, enjoy!

- hope future me won't regret the ambiguity