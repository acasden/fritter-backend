/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properties 'username' and 'password'
 */

 function viewAllFlags(fields) { //view all flags
    fetch('/api/flags')
      .then(showResponse)
      .catch(showResponse);
  }
  
  function viewFlag(fields) { //view flag by flagId
    fetch(`/api/flags?flagId=${fields.flagId}`)
      .then(showResponse)
      .catch(showResponse);
  }

  function viewFlagByFreet(fields) { //view flag by freetId
    fetch(`/api/flags?freetId=${fields.freetId}`)
      .then(showResponse)
      .catch(showResponse);
  }
  
  function createFlag(fields) { //add manual flag using freetId
    fetch('/api/flags', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
      .then(showResponse)
      .catch(showResponse);
  }
  
  function addManualFlagToFlag(fields) { //add manual flag using flagId
    fetch(`/api/flags/${fields.flagId}`, {method: 'PUT', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
      .then(showResponse)
      .catch(showResponse);
  }
  
  function deleteManualFlag(fields) { //delete manual flag using flagId
    fetch(`/api/flags/${fields.flagId}`, {method: 'DELETE'})
      .then(showResponse)
      .catch(showResponse);
  }
  