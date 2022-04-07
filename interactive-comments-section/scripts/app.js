"use strict";

/* Variables */
const mainContainer = document.querySelector(".main");
const headerButtons = document.querySelector(".header__buttons");
const burgerMenuButton = document.querySelector(".menu-button");
const manualDataLoad = document.querySelector(".load-button");

let modalOverlay;
const dataFile = "../data.json";
let targetElementID = 0;
let typeOfElement = "";
let listOfCommentIDs = [];
const today = new Date();
// prettier-ignore
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// prettier-ignore
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Functions */
const storeData = (data) =>
    window.localStorage.setItem("commentData", JSON.stringify(data));

const fetchData = () => JSON.parse(window.localStorage.getItem("commentData"));

const setSelectedElement = function (element) {
    // Get the last class of any button to determine the selected comment.
    targetElementID = element.classList[element.classList.length - 1].split("--")[1];
    typeOfElement = element.closest("section").classList[0];
};

const showModal = function () {
    // Opens up delete confirmation modal.
    modalOverlay.classList.remove("hidden");
    document.querySelector(`.modal--${targetElementID}`).classList.remove("hidden");
};

const closeModal = function () {
    if (modalOverlay.classList.contains("hidden")) return;

    // Closes the delete confirmation modal.
    modalOverlay.classList.add("hidden");
    document.querySelector(`.modal--${targetElementID}`).classList.add("hidden");
};

const replyToComment = function () {};

const editComment = function () {
    const commentTextRaw = document.querySelector(
        `.${typeOfElement}--${targetElementID} .comment--content`
    ).innerText;

    const editTextBoxClass = typeOfElement === "comment" ? typeOfElement : "reply";

    const commentEditButton = document.querySelector(
        `.edit-button.${editTextBoxClass}--${targetElementID}`
    );
    const commentDeleteButton = document.querySelector(
        `.delete-button.${editTextBoxClass}--${targetElementID}`
    );
    const commentSaveButton = document.querySelector(
        `.save-button.${editTextBoxClass}--${targetElementID}`
    );
    const commentDiscardButton = document.querySelector(
        `.discard-button.${editTextBoxClass}--${targetElementID}`
    );

    // Filter out the username from the reply.
    const filterPattern = /^@\w*\s\s/;
    const commentText = commentTextRaw.replace(filterPattern, "");

    // Hide the comment text
    document
        .querySelector(`.${typeOfElement}--${targetElementID} .comment--content`)
        .classList.add("hidden");

    // Display the comment edit text box
    document
        .querySelector(`.edit-comment--${targetElementID}`)
        .classList.remove("hidden");

    document.querySelector(`.edit-comment--${targetElementID}`).innerHTML = commentText;

    commentEditButton.classList.add("hidden");
    commentDeleteButton.classList.add("hidden");
    commentSaveButton.classList.remove("hidden");
    commentDiscardButton.classList.remove("hidden");

    const saveComment = function () {
        setSelectedElement(commentSaveButton);

        // Remove event listeners to prevent this function from calling multiple times on the subsequent calls.
        commentSaveButton.removeEventListener("click", saveComment);

        const newCommentTextRaw = document.querySelector(
            `.edit-comment--${targetElementID}`
        ).value;
        console.log(newCommentTextRaw);

        const newStartFilterPattern = /\n\s*.\w*\s\s/;
        const newEndFilterPattern = /\n\s*/;

        let newCommentText = newCommentTextRaw
            .replace(newStartFilterPattern, "")
            .replace(newEndFilterPattern, "");

        // Check if the new comment is the same as the old one (ie. no changes made)
        let isSameText = true;

        if (commentText.split(" ").length != newCommentText.split(" ").length) {
            isSameText = false;
        } else {
            for (let index = 0; index < newCommentText.length; index++) {
                if (commentText[index] != newCommentText[index]) {
                    isSameText = false;
                    break;
                }
            }
        }

        if (isSameText) return;

        let commentData = fetchData();
        if (typeOfElement === "comment-reply") {
            const comments = commentData.comments;

            comments.forEach((comment) => {
                comment.replies.forEach((reply) => {
                    if (reply.id === +targetElementID) {
                        const dateString = `${days[today.getDay()]}, ${today.getDate()}/${
                            months[today.getMonth()]
                        }/${today.getFullYear()}`;

                        reply.content = newCommentText;
                        reply.createdAt = dateString;

                        newCommentText = `
                        <span class="content__replying-to">@${reply.replyingTo}&nbsp;&nbsp;</span>${newCommentText}
                        `;
                    }
                });
            });

            // Update comment data
            commentData.comments = comments;
        }

        storeData(commentData);

        commentEditButton.classList.remove("hidden");
        commentDeleteButton.classList.remove("hidden");
        commentSaveButton.classList.add("hidden");
        commentDiscardButton.classList.add("hidden");

        // Show the comment text
        document
            .querySelector(`.${typeOfElement}--${targetElementID} .comment--content`)
            .classList.remove("hidden");

        // Hide the comment edit text box
        document
            .querySelector(`.edit-comment--${targetElementID}`)
            .classList.add("hidden");

        document.querySelector(
            `.${typeOfElement}--${targetElementID} .comment--content`
        ).innerHTML = newCommentText;
    };

    const discardComment = function () {
        setSelectedElement(commentDiscardButton);

        // Remove multiple listeners on subsequent clicks.
        commentDiscardButton.removeEventListener("click", discardComment);

        commentEditButton.classList.remove("hidden");
        commentDeleteButton.classList.remove("hidden");
        commentSaveButton.classList.add("hidden");
        commentDiscardButton.classList.add("hidden");

        // Show the comment text
        document
            .querySelector(`.${typeOfElement}--${targetElementID} .comment--content`)
            .classList.remove("hidden");

        // Hide the comment edit text box
        document
            .querySelector(`.edit-comment--${targetElementID}`)
            .classList.add("hidden");

        return;
    };

    commentSaveButton.addEventListener("click", saveComment);
    commentDiscardButton.addEventListener("click", discardComment);
};

const deleteComment = function () {
    const totalCommentsDeleted = [];
    closeModal();

    document.querySelector(`.${typeOfElement}--${targetElementID}`).remove();

    totalCommentsDeleted.push(targetElementID);

    // Delete all replies to a comment, if any.
    if (typeOfElement === "comment") {
        document
            .querySelectorAll(`.parent-comment-${targetElementID}`)
            .forEach((reply) => {
                reply.remove();
                totalCommentsDeleted.push(targetElementID);
            });
    }

    let commentData = fetchData();
    let existingComments = commentData.comments;

    totalCommentsDeleted.forEach((commentID) => {
        let indexToBeDeleted = existingComments.indexOf(
            existingComments.find((comment) => comment.id === +commentID)
        );

        // If the ID is not found in the comments, search for it in the replies.
        if (indexToBeDeleted === -1) {
            existingComments.forEach((currentReply) => {
                indexToBeDeleted = currentReply.replies.indexOf(
                    currentReply.replies.find((reply) => reply.id === +commentID)
                );
                // Delete reply
                currentReply.replies.splice(indexToBeDeleted, 1);
            });
        } else {
            // Delete Comment
            existingComments.splice(indexToBeDeleted, 1);
        }
    });

    commentData.comments = existingComments;
    storeData(commentData);
};

const setListeners = function (data) {
    const sortButton = document.querySelector(".sort-button");
    const sortOptions = document.querySelector(".sort-options");

    modalOverlay = document.querySelector(".modal-overlay");

    const editCommentButton = document.querySelectorAll(".edit-button");
    const deleteCommentButton = document.querySelectorAll(".delete-button");
    const modalCancelDeleteButton = document.querySelectorAll(".do-not-delete");
    const modalConfirmDeletButton = document.querySelectorAll(".confirm-delete");

    const newCommentForm = document.querySelector(".new-comment-form");
    const newCommentText = document.querySelector(".new-comment-textbox");
    const commentTextMessage = document.querySelector(".comment-text-messages");
    const newCommentButton = document.querySelector(".new-comment-submit");

    modalOverlay.addEventListener("click", closeModal);

    // Sort button listener
    sortButton.addEventListener("click", function () {
        sortOptions.classList.toggle("sort-menu-active");
    });

    // Edit Comment
    editCommentButton.forEach((editButton) => {
        editButton.addEventListener("click", function () {
            // Fetch the comment on which the action was performed.
            setSelectedElement(this);
            editComment();
        });
    });

    // Delete comment
    deleteCommentButton.forEach((deleteButton) => {
        deleteButton.addEventListener("click", function () {
            // Fetch the comment on which the action was performed.
            setSelectedElement(this);
            showModal();
        });
    });

    modalCancelDeleteButton.forEach((cancelDeleteButton) => {
        cancelDeleteButton.addEventListener("click", closeModal);
    });

    modalConfirmDeletButton.forEach((confirmDeleteButton) => {
        confirmDeleteButton.addEventListener("click", function () {
            setSelectedElement(this);
            deleteComment();
        });
    });

    newCommentButton.addEventListener("click", function (e) {
        e.preventDefault();

        if (newCommentText.value === "") {
            newCommentText.classList.add("error");
            commentTextMessage.innerHTML = "Comment cannot be empty!";
            setTimeout(() => {
                newCommentText.classList.remove("error");
            }, 3000);

            return;
        }

        addNewComment(newCommentText.value);
        newCommentText.value = "";
    });

    newCommentForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (newCommentText.value === "") {
            newCommentText.classList.add("error");
            commentTextMessage.innerHTML = "Comment cannot be empty!";
            setTimeout(() => {
                newCommentText.classList.remove("error");
            }, 3000);

            return;
        }

        addNewComment(newCommentText.value, data);
        newCommentText.value = "";
    });
};

const addNewComment = function (newComment) {
    const data = fetchData();
    const dateString = `${days[today.getDay()]}, ${today.getDate()}/${
        months[today.getMonth()]
    }/${today.getFullYear()}`;

    const newCommentID = listOfCommentIDs.length === 0 ? 1 : listOfCommentIDs.at(-1) + 1;

    let newCommentArray = {
        id: +`${newCommentID}`,
        content: newComment,
        createdAt: dateString,
        score: 0,
        user: {
            image: {
                png: data.currentUser.image.png,
                webp: data.currentUser.image.webp,
            },
            username: data.currentUser.username,
        },
        replies: [],
    };

    listOfCommentIDs.push(newCommentArray.id);
    data.comments.push(newCommentArray);

    mainContainer.innerHTML = "";

    storeData(data);
    displayComments(data);
    setListeners(data);
};

const displayComments = function (data) {
    const { currentUser, comments } = data;
    let commentHTML,
        commentReplyHTML = "";

    comments.forEach((comment) => {
        // Add new comment.
        commentHTML = `<section class="comment comment--${comment.id}">`;
        commentHTML += `
        <article class="comment--header">
            <img
                src="${comment.user.image.png}"
                alt="${comment.user.username}"
                class="comment__avatar"
            />
            <h3 class="comment__author">${comment.user.username}&nbsp;comment--${
            comment.id
        }</h3>
            <p class="comment__date">${comment.createdAt}</p>
        </article>

        <p class="comment--content">
            ${comment.content}
        </p>

        <textarea rows="7" class="comment--edit edit-comment--${
            comment.id
        } edit-comment-textbox hidden">
        </textarea>

        <article class="comment--footer">
            <div class="comment__votes">
                <button class="button vote-button upvote-button">
                    <i class="fa-solid fa-arrow-up"></i>
                </button>

                <p class="vote-counter">${comment.score}</p>

                <button class="button vote-button downvote-button">
                    <i class="fa-solid fa-arrow-down"></i>
                </button>
            </div>

            <div class="comment__actions">
                <!-- <div class="action__reply ${
                    comment.user.username === currentUser.username && "hidden"
                }"> -->
                <div class="action__reply">
                    <button class="button reply-button action-button comment--${
                        comment.id
                    } hidden">
                        <i class="fa-solid fa-reply"></i>
                        <span class="action-reply">Reply</span>
                    </button>
                </div>

                <!-- <div class="action__button-container ${
                    comment.user.username != currentUser.username && "hidden"
                }"> -->
                <div class="action__button-container">
                    <button class="button edit-button action-button comment--${
                        comment.id
                    }">
                        <i class="fa-solid fa-pen action-icon"></i>
                        <span class="action-edit">Edit</span>
                    </button>

                    <button class="button delete-button action-button comment--${
                        comment.id
                    }">
                        <i class="fa-solid fa-trash-can action-icon"></i>
                        <span class="action-delete">Delete</span>
                    </button>

                    <button class="button save-button action-button comment--${
                        comment.id
                    } hidden">
                        <i class="fa-regular fa-floppy-disk action-icon"></i>
                        <span class="action-save">Save</span>
                    </button>

                    <button class="button discard-button action-button comment--${
                        comment.id
                    } hidden">
                        <i class="fa-solid fa-ban action-icon"></i>
                        <span class="action-discard">Discard</span>
                    </button>
                </div>

                <div class="delete-modal hidden modal--${comment.id}">
                    <h2 class="delete__title">Delete Comment</h2>
                    <p class="delete__text">
                        You sure you wanna delete your comment? This action cannot
                        be undone.
                    </p>

                    <div class="delete-confirmation">
                        <button class="button do-not-delete">No, Go Back</button>
                        <button class="button confirm-delete comment--${
                            comment.id
                        }">Yes, Delete</button>
                    </div>
                </div>
            </div>
        </article>
        `;

        commentHTML += `</section>`;

        comment.replies.forEach((reply) => {
            commentReplyHTML = `<section class="comment-reply parent-comment-${comment.id} comment-reply--${reply.id}">`;

            commentReplyHTML += `
            <article class="comment--header">
                <img
                    src="${reply.user.image.png}"
                    alt="${reply.user.username}"
                    class="comment__avatar"
                />
                <h3 class="comment__author">${reply.user.username} comment-reply--${
                reply.id
            } &nbsp;parent-comment-${comment.id}</h3>
                <p class="comment__date">${reply.createdAt}</p>
            </article>

            <article class="vertical-reply-line"></article>

            <p class="comment--content">
                <span class="content__replying-to">@${
                    reply.replyingTo
                }&nbsp;&nbsp;</span>${reply.content}
            </p>

            <textarea rows="7" class="comment--edit edit-comment--${
                reply.id
            } edit-comment-textbox hidden">
            </textarea>
    

            <article class="comment--footer">
                <div class="comment__votes">
                    <button class="button vote-button upvote-button">
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>

                    <p class="vote-counter">${reply.score}</p>

                    <button class="button vote-button downvote-button">
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>
                </div>

                <div class="comment__actions">
                    <!-- <div class="action__reply ${
                        reply.user.username === currentUser.username && "hidden"
                    }"> -->
                    <div class="action__reply hidden">
                        <button class="button reply-button action-button reply--${
                            reply.id
                        }">
                            <i class="fa-solid fa-reply"></i>
                            <span class="action-reply">Reply</span>
                        </button>
                    </div>

                    <!-- <div class="action__button-container ${
                        reply.user.username != currentUser.username && "hidden"
                    }"> -->
                    <div class="action__button-container">
                        <button class="button edit-button action-button reply--${
                            reply.id
                        }">
                            <i class="fa-solid fa-pen"></i>
                            <span class="action-edit">Edit</span>
                        </button>

                        <button class="button delete-button action-button reply--${
                            reply.id
                        }">
                            <i class="fa-solid fa-trash-can"></i>
                            <span class="action-delete">Delete</span>
                        </button>

                        <button class="button save-button action-button reply--${
                            reply.id
                        } hidden">
                            <i class="fa-regular fa-floppy-disk action-icon"></i>
                            <span class="action-save">Save</span>
                        </button>
    
                        <button class="button discard-button action-button reply--${
                            reply.id
                        } hidden">
                            <i class="fa-solid fa-ban action-icon"></i>
                            <span class="action-discard">Discard</span>
                        </button>
                    </div>

                    <div class="delete-modal hidden modal--${reply.id}">
                        <h2 class="delete__title">Delete Comment</h2>
                        <p class="delete__text">
                            You sure you wanna delete your comment? This action cannot
                            be undone.
                        </p>

                        <div class="delete-confirmation modal-button--${reply.id}">
                            <button class="button do-not-delete">No, Go Back</button>
                            <button class="button confirm-delete reply--${
                                reply.id
                            }">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            </article>
            `;

            commentReplyHTML += "</section>";
            mainContainer.insertAdjacentHTML("afterbegin", commentReplyHTML);
        });

        // Append comment to the main container.
        mainContainer.insertAdjacentHTML("afterbegin", commentHTML);
    });

    mainContainer.insertAdjacentHTML(
        "beforeend",
        `
            <section class="comment-new">
                <form class="new-comment-form">
                    <img
                        src="${currentUser.image.png}"
                        alt="${currentUser.username}"
                        class="comment__avatar new-comment-avatar"
                    />
                    <article class="new-comment-textbox-container">
                        <textarea
                            rows="7"
                            class="new-comment-textbox"
                            placeholder="Add a comment"
                        ></textarea>
                        <span class="comment-text-messages"></span>
                    </article>
                    <button type="submit" class="button new-comment-submit">Send</button>
                </form>
            </section>
        `
    );

    mainContainer.insertAdjacentHTML(
        "afterbegin",
        `
        <section class="comment-sort">
            <article class="sort-button-container">
                <button class="button sort-button">
                    <span class="sort-text">SORT</span>
                    <i class="fa-solid fa-arrow-down-a-z"></i>
                </button>

                <div class="sort-options">
                    <div class="sort-option sort--newest">Newest First</div>
                    <div class="sort-option sort--oldest">Oldest First</div>
                    <div class="sort-option sort--popular">Most Popular</div>
                </div>
            </article>
        </section>
    `
    );
};

const fetchCommentIDs = function (data) {
    // Store all IDs in an array.x
    data.comments.forEach((elem) => {
        listOfCommentIDs.push(elem.id);
        elem.replies.forEach((rep) => {
            listOfCommentIDs.push(rep.id);
        });
    });

    listOfCommentIDs.sort();
};

const parseData = function () {
    let commentData;

    // Look for data in localstorage, if unavailable, read from data file.
    if (!fetchData()) {
        fetch("./data.json")
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                commentData = data;
                storeData(commentData);

                displayComments(commentData);
                // Set listeners to buttons after rendering them on the DOM.
                setListeners(commentData);

                fetchCommentIDs(commentData);
            })
            .catch((err) => {
                console.error(`ERROR: ${err.message}`);
            });
    } else {
        commentData = fetchData();
        displayComments(commentData);
        // Set listeners to buttons after rendering them on the DOM.
        setListeners(commentData);

        fetchCommentIDs(commentData);
    }
};

// Start up everything.
const intitialize = function () {
    setStorageVariable("commentsSectionTheme"); // From utils.js
    parseData();
};

intitialize();

/* Event Listeners */
burgerMenuButton.addEventListener("click", function (e) {
    Array.from(burgerMenuButton.children).forEach((bar) =>
        bar.classList.toggle("menu-active")
    );
    headerButtons.classList.toggle("header-buttons-active");
});

manualDataLoad.addEventListener("click", function () {
    window.localStorage.removeItem("commentData");
    mainContainer.innerHTML = "";
    parseData();
});

// Close delete confirmation modal.
document.body.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
});
