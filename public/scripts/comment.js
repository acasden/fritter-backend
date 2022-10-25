/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properties 'username' and 'password'
 */



 function viewAllComments(fields) {
  fetch('/api/comments')
    .then(showResponse)
    .catch(showResponse);
}

function viewCommentsByFreet(fields) {
  fetch(`/api/comments?freetId=${fields.freetId}`)
  .then(showResponse)
  .catch(showResponse);
}
  
function viewCommentsByAuthor(fields) {
  fetch(`/api/comments?author=${fields.author}`)
    .then(showResponse)
    .catch(showResponse);
}
  
function createComment(fields) {
  fetch('/api/comments', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}
  
  
function deleteComment(fields) {
  fetch(`/api/comments/${fields.commentId}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}
