
// Show an object on the screen.
function showObject(obj) {
  const pre = document.getElementById('response');
  const preParent = pre.parentElement;
  pre.innerText = JSON.stringify(obj, null, 4);
  preParent.classList.add('flashing');
  setTimeout(() => {
    preParent.classList.remove('flashing');
  }, 300);
}

function showResponse(response) {
  console.log(response);
  response.json().then(data => {
    showObject({
      data,
      status: response.status,
      statusText: response.statusText
    });
  });
}

/**
 * IT IS UNLIKELY THAT YOU WILL WANT TO EDIT THE CODE ABOVE.
 * EDIT THE CODE BELOW TO SEND REQUESTS TO YOUR API.
 *
 * Native browser Fetch API documentation to fetch resources: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */

// Map form (by id) to the function that should be called on submit

const formsAndHandlers = {
  'create-user': createUser,
  'delete-user': deleteUser,
  'change-username': changeUsername,
  'change-password': changePassword,
  'sign-in': signIn,
  'sign-out': signOut,
  'view-all-freets': viewAllFreets,
  'view-freets-by-author': viewFreetsByAuthor,
  'create-freet': createFreet,
  'edit-freet': editFreet,
  'delete-freet': deleteFreet,
  'create-comment': createComment,
  'view-all-comments': viewAllComments,
  'delete-comment':deleteComment,
  'view-comments-by-freets': viewCommentsByFreet,
  'view-comments-user': viewCommentsByAuthor,
  'view-all-reactions': viewAllReactions,
  'view-reactions-by-freet': viewReactionsByFreet,
  'create-reaction': createReaction,
  'delete-reaction': deleteReaction,
  'view-one-reaction': viewOneReactionByFreet,
  'view-all-flags':viewAllFlags,
  'view-flag':viewFlag,
  'view-flag-by-freet':viewFlagByFreet,
  'create-flag':createFlag,
  'edit-flag':addManualFlagToFlag,
  'delete-flag':deleteManualFlag,
  'draft-split':draftSplit,
  'post-split':postSplit,
  'get-split':getCurrentDraft,
  'change-split-value':changeSplitValue,
  'change-split-content':changeSplitContent,
  'delete-split':deleteDraft  
};

// Attach handlers to forms
function init() {
  Object.entries(formsAndHandlers).forEach(([formID, handler]) => {
    const form = document.getElementById(formID);
    form.onsubmit = e => {
      e.preventDefault();
      const formData = new FormData(form);
      handler(Object.fromEntries(formData.entries()));
      return false; // Don't reload page
    };
  });
}

// Attach handlers once DOM is ready
window.onload = init;
