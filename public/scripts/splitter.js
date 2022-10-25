function splitFreet(fields) { //fields are content and splits
    fetch('/api/splits', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
      .then(showResponse)
      .catch(showResponse);
  }