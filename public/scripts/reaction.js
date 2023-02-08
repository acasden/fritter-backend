/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properties 'username' and 'password'
 */


 function viewAllReactions(fields) {
    fetch('/api/reactions')
      .then(showResponse)
      .catch(showResponse);
  }
  
  function viewReactionsByFreet(fields) {
    fetch(`/api/reactions?freetId=${fields.freetId}`)
    .then(showResponse)
    .catch(showResponse);
  }

  function viewOneReactionByFreet(fields) {
    fetch(`/api/reactions?freetId=${fields.freetId}&one=True`)
    .then(showResponse)
    .catch(showResponse);
  }
    
  function createReaction(fields) {
    fetch('/api/reactions', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
      .then(showResponse)
      .catch(showResponse);
  }
    
    
  function deleteReaction(fields) {
    fetch(`/api/reactions/${fields.reactionId}`, {method: 'DELETE'})
      .then(showResponse)
      .catch(showResponse);
  }
  