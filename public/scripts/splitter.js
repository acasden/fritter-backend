

//draftSplit (content, splits)
//post
function draftSplit(fields) {
  fetch('/api/splits', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

//postSplit (splitterId)
//post
function postSplit(fields) {
  fetch('/api/splits', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

//getCurrentDraft
//get
function getCurrentDraft(fields) {
  fetch('/api/splits')
    .then(showResponse)
    .catch(showResponse);
}

//addSplit(splitterId, value) //deleteSplit(splitterId, value) //changeText(splitterId, content)
//put
function changeSplitValue(fields) {
  fetch('/api/splits', {method: 'PUT', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

//changeText(splitterId, content)
//put
function changeSplitContent(fields) {
  fetch('/api/splits', {method: 'PUT', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

//deleteDraft(splitterId?)
//delete
function deleteDraft(fields) {
  fetch(`/api/splits/${fields.splitterId}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
};