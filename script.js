// import fetch from "node-fetch";
let key = '9b75cc4160800cc67e8dc36b5e621a7b';
let token = '3e7247cae91c9003f19d8d85425aefe4f8cf85dd9eba413fdf97ecaa53e76dbe';
let idBoard = '6234d5eb4b191b7978887fd6';

const listSection = document.querySelector('#listSection');
const addList = document.querySelector('#addList');
const plusList = document.querySelector('#plusList')
const formAddList = document.querySelector('#formAddList');
const addListButton = document.querySelector('#addListButton');
const overlay = document.querySelector('#overlay');
const cardPopup = document.querySelector('#cardPopup');
const headingCardName = document.querySelector('#headingCardName');
const inListName = document.querySelector('#inListName');
const descriptionText = document.querySelector('#descriptionText');
const afterClickDescription = document.querySelector('#afterClickDescription');
const descriptionCross = document.querySelector('#afterClickDescriptionCrossButton');
const afterClickDescriptionTextarea = document.querySelector('#afterClickDescriptionTextarea');
const afterClickDescriptionSavebutton = document.querySelector('#afterClickDescriptionSavebutton');
const descriptionEditButton = document.querySelector("#descriptionEditButton");
const overlayCross = document.querySelector('#overlayCross');
const activityButtons = document.querySelector('#activityFormSaveCrossButtons');
let currentCard;
let listIdsArray = [];

overlayCross.addEventListener('click', closeCardPopup);

function closeCardPopup(event) {
  let ul = document.querySelector('#activityFormUl');
  ul.innerHTML = '';
  cardPopup.classList.remove('show');
  overlay.classList.remove('active');
}

descriptionCross.addEventListener('click', () => {
  afterClickDescription.classList.remove('show');
  descriptionText.classList.remove('hide');
})

afterClickDescriptionSavebutton.addEventListener('click', () => {
  if (afterClickDescriptionTextarea.value === '') {
    descriptionText.innerText = 'Add a more detailed description...';
    afterClickDescription.classList.remove('show');
    descriptionText.classList.remove('hide');
    descriptionEditButton.classList.remove('show');
    return;
  }
  descriptionText.innerText = afterClickDescriptionTextarea.value;
  descriptionText.classList.add('description-text-background');
  afterClickDescription.classList.remove('show');
  descriptionText.classList.remove('hide');
  descriptionEditButton.classList.add('show');
  updateCardWithDescription(afterClickDescriptionTextarea.value);
})
descriptionEditButton.addEventListener('click', () => {
  afterClickDescriptionTextarea.value = descriptionText.innerText;
  afterClickDescription.classList.add('show');
  descriptionText.classList.add('hide');
})

function updateCardWithDescription(des) {
  fetch(`https://api.trello.com/1/cards/${currentCard}?key=${key}&token=${token}&desc=${des}`, {
      method: "PUT",
      headers: {
        "Accept": "application/json"
      }
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
    })
}

async function getData() {
  let listsResponse = await fetch(`https://api.trello.com/1/boards/${idBoard}/lists?&key=${key}&token=${token}&filter=open`, {
    method: "GET",
    headings: {
      "Accept": "application/json"
    }
  })
  listIdsArray = await listsResponse.json();
  refreshDOMLists();
}

async function getDataCards(id) {
  let cardsResponse = await fetch(`https://api.trello.com/1/lists/${id}/cards?key=${key}&token=${token}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  })

  let listCardsArray = await cardsResponse.json();
  let cardsArray = [];
  listCardsArray.forEach((element) => {
    let tempArray = [];
    tempArray.push(element['name']);
    tempArray.push(element['idList']);
    tempArray.push(element['id']);
    tempArray.push(element['pos']);
    cardsArray.push(tempArray);
  })
  refreshDOMCards(cardsArray);
}

function refreshDOMCards(cardsArray) {
  cardsArray.forEach((element) => {
    addListItem(element[0], element[1], element[2], element[3]);
  })
}

document.addEventListener('DOMContentLoaded', getData);

function refreshDOMLists() {
  listIdsArray.reverse().forEach((element) => {
    createListDiv(element['id'], element['name']);
    getDataCards(element['id']);
  });
}

function addListItem(cardName, listId, cardId, cardPos) {
  let li = document.createElement('li');
  li.addEventListener('mouseover', hover);
  li.addEventListener('mouseout', notHover);
  li.addEventListener('click', openCardPopup);
  li.setAttribute('data-idCard', cardId);
  li.setAttribute('data-cardPos', cardPos);
  li.setAttribute('draggable', "true");
  li.classList.add('draggable');
  let p = document.createElement('p');
  p.innerText = cardName;
  let iEdit = document.createElement('i');
  iEdit.classList.add('fa-solid', 'fa-pen', 'i-edit');
  iEdit.addEventListener('click', openPopup);
  let editBox = document.createElement('div');
  editBox.classList.add('editbox-div');
  let editText = document.createElement('textarea');
  editText.name = 'edit-card';
  editText.rows = '4';
  editText.addEventListener('keyup', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.keyCode === 13) {
      event.preventDefault();
      event.target.nextElementSibling.click();
    }
  });
  editText.addEventListener('click', (event) => {
    event.stopPropagation();
  })
  editBox.appendChild(editText);
  let saveButton = document.createElement('button');
  saveButton.type = "submit";
  saveButton.innerText = 'save';
  saveButton.classList.add('add-card-button');
  saveButton.addEventListener('click', closePopup);
  editBox.appendChild(saveButton);
  li.appendChild(p);
  li.appendChild(iEdit);
  li.appendChild(editBox);
  let list = document.querySelector(`div[data-idList="${listId}"]`);
  let ul = list.children.item(1);
  ul.appendChild(li);
}


plusList.addEventListener('click', () => {
  plusList.classList.add('plus-list-afterclick');
  formAddList.classList.add('form-addlist-afterclick');
})

const afterClickTextArea = document.querySelectorAll("[data-afterClickTextArea]");
const formCross = document.querySelectorAll("#form-cross");
const listDiv = document.querySelectorAll('[data-list-div]');
const listCross = document.querySelector('#list-cross');

listCross.addEventListener('click', closeAddList);

function closeAddList(event) {
  plusList.classList.remove("plus-list-afterclick");
  formAddList.classList.remove("form-addlist-afterclick");
}

addListButton.addEventListener('click', (event) => {
  event.preventDefault();
  const listName = document.querySelector('#textInput').value;
  let myList = createAList(listName);
  myList.then((response) => {
      return response.json();
    })
    .then((response) => {
      let listId = response['id'];
      createListDiv(listId, listName);
      document.querySelector('#textInput').value = '';
    })
    .catch((error) => {
      console.log(error);
    })
});

function createAList(value) {
  return fetch(`https://api.trello.com/1/lists?key=${key}&token=${token}&name=${value}&idBoard=${idBoard}`, {
    method: "POST",
    body: JSON.stringify({
      name: value
    }),
    headings: {
      "Accept": "application/json"
    }
  })
}

function createListDiv(listId, listName) {
  let divListDiv = document.createElement("div");
  divListDiv.classList.add("list-div");
  divListDiv.setAttribute('data-list-div', '');
  divListDiv.setAttribute('data-idList', listId);
  let divHeadingAndButton = document.createElement('div');
  divHeadingAndButton.classList.add('heading-and-button');
  let pHeading = document.createElement('p');
  pHeading.innerText = listName;
  let iHeading = document.createElement('i');
  iHeading.classList.add('fa-solid', 'fa-xmark');
  iHeading.addEventListener('click', (event) => {
    archiveList(event.target.parentElement.parentElement.getAttribute('data-idList'));
    closeListDiv(event);
  });
  divHeadingAndButton.appendChild(pHeading);
  divHeadingAndButton.appendChild(iHeading);
  divListDiv.appendChild(divHeadingAndButton);
  let ul = document.createElement('ul');
  ul.classList.add('list-div-ul');
  divListDiv.appendChild(ul);
  let formBefore = document.createElement('form');
  formBefore.classList.add('add-card');
  formBefore.setAttribute('data-form', '');
  let divBeforeClickTextarea = document.createElement('div');
  divBeforeClickTextarea.classList.add('before-click-textarea');
  divBeforeClickTextarea.setAttribute('data-afterClickTextArea', '');
  formBefore.appendChild(divBeforeClickTextarea);
  divListDiv.appendChild(formBefore);
  let textArea = document.createElement('textarea');
  textArea.name = 'add-card-textarea'
  textArea.rows = '3';
  textArea.classList.add('add-card-text-area');
  textArea.placeholder = 'Enter a title for this card...';
  textArea.addEventListener('keyup', submitTextArea);
  divBeforeClickTextarea.appendChild(textArea);
  let divButtonAndCross = document.createElement('div');
  divButtonAndCross.classList.add('button-and-cross');
  let buttonAddCard = document.createElement('button');
  buttonAddCard.type = "submit";
  buttonAddCard.classList.add('add-card-button');
  buttonAddCard.innerText = "Add Card";
  buttonAddCard.addEventListener('click', (event) => {
    event.preventDefault();
    createListItem(event);
    hideTextArea(event);
  });
  let iFormCross = document.createElement('i');
  iFormCross.classList.add('fa-solid', 'fa-xmark', 'fa-xl', 'form-cross');
  iFormCross.id = "form-cross";
  iFormCross.addEventListener('click', hideTextArea);
  divButtonAndCross.appendChild(buttonAddCard);
  divButtonAndCross.appendChild(iFormCross);
  divBeforeClickTextarea.appendChild(divButtonAndCross);
  let divPlusInput = document.createElement('div');
  divPlusInput.classList.add('plus-input');
  divPlusInput.id = "plusInput";
  divPlusInput.setAttribute('data-plus-input', '');
  divPlusInput.addEventListener('click', showTextArea);
  let iPlusSign = document.createElement('i');
  iPlusSign.classList.add('fa-solid', 'fa-plus', 'plus-sign');
  let divAddField = document.createElement('div');
  divAddField.classList.add('add-field');
  divAddField.innerText = 'Add a card';
  divPlusInput.appendChild(iPlusSign);
  divPlusInput.appendChild(divAddField);
  formBefore.appendChild(divPlusInput);
  listSection.insertBefore(divListDiv, addList);
}

function hover(event) {
  if (event.target.localName === 'li') {
    event.target.children.item(1).classList.add('i-edit-show');
  } else {
    event.target.parentElement.children.item(1).classList.add('i-edit-show');
  }
}

function notHover(event) {
  if (event.target.localName === 'li') {
    event.target.children.item(1).classList.remove('i-edit-show');
  } else {
    event.target.parentElement.children.item(1).classList.remove('i-edit-show');
  }
}

function openPopup(event) {
  event.stopPropagation();
  overlay.classList.add('active');
  let value = event.target.previousElementSibling.innerText;
  event.target.nextElementSibling.classList.add('show');
  event.target.nextElementSibling.firstElementChild.value = value;
}

function closePopup(event) {
  event.stopPropagation();
  let cardId = event.target.parentElement.parentElement.getAttribute('data-idCard');
  let value = event.target.previousElementSibling.value.trim();
  updateCard(cardId, value);
  event.target.parentElement.parentElement.firstElementChild.innerText = value;
  event.target.parentElement.classList.remove('show');
  overlay.classList.remove('active');
}

function updateCard(id, cardName) {
  fetch(`https://api.trello.com/1/cards/${id}?key=${key}&token=${token}&name=${cardName}`, {
      method: "PUT",
      headers: {
        "Accept": "application/json"
      }
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    })
}

function noBackground(event) {
  event.target.classList.remove('edit');
}

function archiveList(id) {
  console.log(id);
  fetch(`https://api.trello.com/1/lists/${id}/closed?key=${key}&token=${token}&value=true`, {
      method: "PUT"
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    })

  fetch('https://api.trello.com/1/lists/${id}/archiveAllCards?key=${key}&token=${token}', {
      method: "POST"
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
    })
}

function submitTextArea(event) {
  event.preventDefault();
  if (event.keyCode === 13 && !event.shiftKey) {
    event.preventDefault();
    event.target.nextElementSibling.firstElementChild.click();
    event.target.value = '';
  }
}

function showTextArea(event) {
  this.classList.add('after-click-plus-input');
  this.parentElement.firstElementChild.classList.add('after-click-textarea');
  event.target.parentElement.firstElementChild.firstElementChild.value = "";
}

document.addEventListener('click', (event) => {
  listDiv.forEach((element) => {
    if (!element.contains(event.target)) {
      element.lastElementChild.firstElementChild.classList.remove('after-click-textarea');
      element.lastElementChild.lastElementChild.classList.remove('after-click-plus-input');
    }
  })
});

function hideTextArea(event) {
  event.target.parentElement.parentElement.parentElement.lastElementChild.classList.remove('after-click-plus-input');
  event.target.parentElement.parentElement.classList.remove('after-click-textarea');
}

function closeListDiv(event) {
  event.target.parentElement.parentElement.remove();
}

async function createListItem(event) {
  let textValue = event.target.parentElement.parentElement.firstElementChild.value;
  let idList = event.target.parentElement.parentElement.parentElement.parentElement.getAttribute('data-idList');
  let li = document.createElement('li');
  makeAPIcall(textValue, idList, li);
  li.addEventListener('mouseover', hover);
  li.addEventListener('mouseout', notHover);
  li.addEventListener('click', openCardPopup);
  li.setAttribute('draggable', 'true');
  li.classList.add('draggable');
  let p = document.createElement('p');
  let iEdit = document.createElement('i');
  iEdit.classList.add('fa-solid', 'fa-pen', 'i-edit');
  iEdit.addEventListener('click', openPopup);
  p.innerText = textValue.trim();
  let editBox = document.createElement('div');
  editBox.classList.add('editbox-div');
  let editText = document.createElement('textarea');
  editText.name = 'edit-card';
  editText.rows = '4';
  editText.addEventListener('keyup', (event) => {
    console.log('textarea clicked');
    event.preventDefault();
    event.stopPropagation();
    if (event.keyCode === 13) {
      event.preventDefault();
      event.target.nextElementSibling.click();
    }
  });
  editText.addEventListener('click', (event) => {
    event.stopPropagation();
  })
  editBox.appendChild(editText);
  let saveButton = document.createElement('button');
  saveButton.type = "submit";
  saveButton.innerText = 'save';
  saveButton.classList.add('add-card-button');
  saveButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closePopup(event);
  });
  editBox.appendChild(saveButton);
  li.appendChild(p);
  li.appendChild(iEdit);
  li.appendChild(editBox);
  let ul = event.target.parentElement.parentElement.parentElement.parentElement.children.item(1);
  ul.appendChild(li);
}

async function openCardPopup(event) {
  afterClickDescription.classList.remove('show');
  descriptionText.classList.remove('hide');
  let cardValue;
  let listValue;
  if (event.target.localName === 'i') {
    return;
  }
  if (event.target.localName === 'p') {
    currentCard = event.target.parentElement.getAttribute('data-idCard');
    cardValue = event.target.innerText;
    listValue = event.target.parentElement.parentElement.previousElementSibling.firstElementChild.innerText;
  }
  if (event.target.localName === 'li') {
    currentCard = event.target.getAttribute('data-idCard');
    cardValue = event.target.firstElementChild.innerText;
    listValue = event.target.parentElement.previousElementSibling.firstElementChild.innerText;
  }
  let descValue = getDescription();
  let allComments = await getComments();
  console.log(allComments);
  allComments.reverse().forEach((element) => {
    console.log(element);
    console.log(element['id']);
    makeComment(element['data']['text'], element['id']);
  })
  if (await descValue) {
    descriptionEditButton.classList.add('show');
  } else {
    descriptionEditButton.classList.remove('show');
  }
  descriptionText.addEventListener('click', () => {
    if (descValue === '') {
      afterClickDescriptionTextarea.placeholder = descriptionText.innerText;
    } else {
      afterClickDescriptionTextarea.value = descriptionText.innerText;
    }
    afterClickDescription.classList.add('show');
    descriptionText.classList.add('hide');
  })
  cardPopup.classList.add('show');
  overlay.classList.add('active');
  fillInValues(cardValue, listValue, await descValue);
}

async function getComments() {
  console.log('function called');
  let response = await fetch(`https://api.trello.com/1/cards/${currentCard}/actions?key=${key}&token=${token}&filter=commentCard`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  })

  let data = await response.json();
  return data;
}

async function getDescription() {
  let response = await fetch(`https://api.trello.com/1/cards/${currentCard}?key=${key}&token=${token}&fields=desc`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  })
  let data = await response.json();
  let descValue = data['desc'];
  return descValue;
}

function fillInValues(cardValue, listValue, descValue) {
  // const cardPopup = document.querySelector('#cardPopup');
  // const headingCardName = document.querySelector('#headingCardName');
  // const inListName = document.querySelector('#inListName');
  headingCardName.innerText = cardValue;
  inListName.innerText = listValue;
  if (descValue === '') {
    descriptionText.innerText = 'Add a description...';
    descriptionText.classList.remove('description-text-background');
  } else {
    descriptionText.innerText = descValue;
    if (!descriptionText.classList.contains('description-text-background')) {
      descriptionText.classList.add('description-text-background');
    }
  }
}

function makeAPIcall(text, id, li) {
  fetch(`https://api.trello.com/1/cards/?idList=${id}&key=${key}&token=${token}&name=${text}`, {
      method: "POST",
      headers: {
        "Accept": "application/json"
      }
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      li.setAttribute('data-idCard', response['id']);
      li.setAttribute('data-cardPos', response['pos']);
    })
    .catch((err) => {
      console.log(err);
    })
}

const activityFormText = document.querySelector('#activityFormText');
activityFormText.addEventListener('keyup', (event) => {
  event.target.style.height = 'auto';
  let scHeight = event.target.scrollHeight;
  event.target.style.height = `${scHeight}px`;
})
activityFormText.addEventListener('keydown', (event) => {
  event.target.style.height = 'auto';
  let scHeight = event.target.scrollHeight;
  event.target.style.height = `${scHeight}px`;
})

const saveCommentButton = document.querySelector("#saveCommentButton");
activityFormText.addEventListener('click', (event) => {
  activityButtons.classList.add('show');
  event.target.classList.add('noBorder');
})

saveCommentButton.addEventListener('click', async function(event) {
  event.preventDefault();
  activityFormText.classList.remove('noBorder');
  activityButtons.classList.remove('show');
  let comment = activityFormText.value;
  let commentId = await addCommentAPICall(comment);
  console.log(commentId);
  makeComment(comment, commentId);
  activityFormText.value = '';
})

const commentCrossButton = document.querySelector("#commentCrossButton");
commentCrossButton.addEventListener('click', () => {
  activityFormText.classList.remove('noBorder');
  activityButtons.classList.remove('show');
})

const activityFormLiP = document.querySelector("#activityFormLiP");

async function addCommentAPICall(text) {
  let response = await fetch(`https://api.trello.com/1/cards/${currentCard}/actions/comments?text=${text}&key=${key}&token=${token}`, {
    method: "POST",
    headers: {
      "Accept": "application/json"
    }
  })
  let data = await response.json();
  return data['id'];
}

function makeComment(comment, commentId) {
  console.log(commentId);
  if (!comment) {
    return;
  }
  let ul = document.querySelector('#activityFormUl');
  let li = document.createElement('li');
  li.setAttribute('data-idComment', commentId);
  li.classList.add('activity-form-li');
  ul.insertBefore(li, ul.firstChild);
  let pText = document.createElement('p');
  pText.classList.add('activity-form-li-p');
  pText.innerText = comment;
  li.appendChild(pText);
  let div = document.createElement('div');
  div.classList.add('activity-form-buttons');
  li.appendChild(div);
  let pEdit = document.createElement('p');
  pEdit.innerText = "edit";
  pEdit.classList.add("activity-form-edit-delete-buttons");
  pEdit.addEventListener('click', (event) => {
    console.log(event);
    openEditView(event);
  })
  div.appendChild(pEdit);
  let pDelete = document.createElement('p');
  pDelete.innerText = 'delete';
  pDelete.classList.add('activity-form-edit-delete-buttons');
  pDelete.addEventListener('click', () => {
    console.log(event);
    deleteComment(event);
  })
  div.appendChild(pDelete);
  let afterEditDiv = document.createElement('div');
  afterEditDiv.classList.add('after-edit-div');
  li.appendChild(afterEditDiv);
  let textarea = document.createElement('textarea');
  textarea.classList.add("after-edit-textarea");
  afterEditDiv.appendChild(textarea);
  let afterEditButtons = document.createElement('div');
  afterEditButtons.classList.add('after-edit-buttons');
  afterEditDiv.appendChild(afterEditButtons);
  let afterEditSaveButton = document.createElement('button');
  afterEditSaveButton.type = 'submit';
  afterEditSaveButton.classList.add('add-card-button', "save-comment");
  afterEditSaveButton.innerText = 'Save';
  afterEditSaveButton.addEventListener('click', (event) => {
    saveEditedComment(event, commentId);
  })
  afterEditButtons.appendChild(afterEditSaveButton);
  let i = document.createElement('i');
  i.classList.add("fa-solid", "fa-xmark", "after-click-description-cross-button");
  i.addEventListener('click', (event) => {
    console.log(event);
    closeEditView(event);
  })
  afterEditButtons.appendChild(i);
}

function deleteComment(event) {
  let commentId = event.target.parentElement.parentElement.getAttribute('data-idComment');
  deleteCommentAPICall(commentId);
  event.target.parentElement.parentElement.remove();
}

function deleteCommentAPICall(commentId) {
  fetch(`https://api.trello.com/1/cards/${currentCard}/actions/${commentId}/comments?key=${key}&token=${token}`, {
      method: "DELETE"
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
}

function openEditView(event) {
  let commentToEdit = event.target.parentElement.previousElementSibling.innerText;
  event.target.parentElement.nextElementSibling.firstElementChild.value = commentToEdit;
  event.target.parentElement.previousElementSibling.classList.add('hide');
  event.target.parentElement.classList.add('hide');
  event.target.parentElement.nextElementSibling.classList.add('show');
}

function closeEditView(event) {
  event.target.parentElement.parentElement.classList.remove('show');
  event.target.parentElement.parentElement.previousElementSibling.classList.remove('hide');
  event.target.parentElement.parentElement.previousElementSibling.previousElementSibling.classList.remove('hide');
}

function saveEditedComment(event, commentId) {
  let editedComment = event.target.parentElement.previousElementSibling.value;
  if (!editedComment) {
    return;
  }
  event.target.parentElement.parentElement.previousElementSibling.previousElementSibling.innerText = editedComment;
  event.target.parentElement.parentElement.classList.remove('show');
  event.target.parentElement.parentElement.previousElementSibling.classList.remove('hide');
  event.target.parentElement.parentElement.previousElementSibling.previousElementSibling.classList.remove('hide');
  saveEditedCommentAPICall(editedComment, commentId);
}

function saveEditedCommentAPICall(text, id) {
  fetch(`https://api.trello.com/1/cards/${currentCard}/actions/${id}/comments?text=${text}&key=${key}&token=${token}`, {
      method: "PUT"
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
    })
}

const deleteCard = document.querySelector('#deleteCard');
deleteCard.addEventListener('click', (event) => {
  deleteCardAPICall();
  deleteCardFromDOM();
  closeCardPopup();
})

function deleteCardAPICall() {
  fetch(`https://api.trello.com/1/cards/${currentCard}?key=${key}&token=${token}`, {
      method: "DELETE"
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
}

function deleteCardFromDOM() {
  let cardElement = document.querySelector(`[data-idCard='${currentCard}']`);
  cardElement.remove();
}

// drag and drop
document.addEventListener("dragstart", (event) => {
  if (event.target.matches(".draggable")) {
    event.target.classList.add('dragging');
  };
})

document.addEventListener('dragend', (event) => {
  if (event.target.matches('.draggable')) {
    event.target.classList.remove('dragging');
  }
})

document.addEventListener('dragover', (event) => {
  if (event.target.matches('.list-div-ul') ||
    event.target.matches('.list-div')) {
    event.preventDefault();
    const afterElement = getDragAfterElement(event.target, event.clientY);
    console.log(afterElement);
    const draggable = document.querySelector('.draggable.dragging');
    if (!afterElement) {
      if (event.target.matches('.list-div')) {
        event.target.children.item(1).appendChild(draggable);
      } else {
        event.target.appendChild(draggable);
      }
    } else {
      event.target.insertBefore(draggable, afterElement);
    }
    updateCardAfterDrop(draggable);
  }
})

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    // console.log(box);
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return {
        offset: offset,
        element: child
      };
    } else {
      return closest;
    }
  }, {
    offset: Number.NEGATIVE_INFINITY
  }).element
}

function updateCardAfterDrop(card) {
  let cardId = card.getAttribute('data-idCard');
  let listId = card.parentElement.parentElement.getAttribute('data-idList')
  let nextCardPos;
  let previousCardPos;
  let currentCardPos;
  console.log(cardId);
  if (!card.previousElementSibling && !card.nextElementSibling) {
    currentCardPos = null;
  } else if (!card.previousElementSibling) {
    nextCardPos = parseFloat(card.nextElementSibling.getAttribute('data-cardPos'));
    if (nextCardPos) {
      currentCardPos = nextCardPos / 2;
    }
  } else if (!card.nextElementSibling) {
    previousCardPos = parseFloat(card.previousElementSibling.getAttribute('data-cardPos'));
    if (previousCardPos) {
      currentCardPos = previousCardPos * 2;
    }
  } else {
    nextCardPos = parseFloat(card.nextElementSibling.getAttribute('data-cardPos'));
    previousCardPos = parseFloat(card.previousElementSibling.getAttribute('data-cardPos'));
    currentCardPos = (nextCardPos + previousCardPos) / 2;
  }
  updateCardAfterDropAPICall(currentCardPos, cardId, listId);
}

function updateCardAfterDropAPICall(cardPos, cardId, listId) {
  if (cardPos) {
    fetch(`https://api.trello.com/1/cards/${cardId}?key=${key}&token=${token}&idList=${listId}&pos=${cardPos}`, {
        method: "PUT",
        headers: {
          "Accept": "application/json"
        }
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      })
  } else {
    fetch(`https://api.trello.com/1/cards/${cardId}?key=${key}&token=${token}&idList=${listId}`, {
        method: "PUT",
        headers: {
          "Accept": "application/json"
        }
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      })
  }
}
