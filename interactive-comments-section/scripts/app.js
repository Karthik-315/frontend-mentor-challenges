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
    // Stores data into localStorage
    window.localStorage.setItem("commentData", JSON.stringify(data));

// Gets data from localStorage.
const fetchData = () => JSON.parse(window.localStorage.getItem("commentData"));

const setSelectedElement = function (element) {
    // Get the last class of any button to determine the selected comment / reply.
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

const setCreatedAtTime = function () {};

const registerVotes = function (voteType) {
    // Keeps track of total upvotes and downvotes.

    const voteCounterText = document.querySelector(
        `.${typeOfElement}--${targetElementID} .vote-counter`
    );
    let currentVotes = +voteCounterText.innerText;

    voteType === "upvote" ? currentVotes++ : currentVotes--;

    voteCounterText.innerHTML = currentVotes;

    let commentData = fetchData();
    let existingComments = commentData.comments;
    let indexToBeUpdated;

    // Update data to localStorage.
    if (typeOfElement === "comment") {
        indexToBeUpdated = existingComments.indexOf(
            existingComments.find((comment) => comment.id === +targetElementID)
        );
        commentData.comments[indexToBeUpdated].score = +currentVotes;
    } else if (typeOfElement === "comment-reply") {
        existingComments.forEach((currentComment) => {
            indexToBeUpdated = currentComment.replies.indexOf(
                currentComment.replies.find((reply) => reply.id === +targetElementID)
            );

            const reply = currentComment.replies[indexToBeUpdated];

            // If the current reply is not the one to be updated, ignore.
            if (!reply) return;

            currentComment.replies[indexToBeUpdated].score = +currentVotes;
        });
    }

    storeData(commentData);
};

const replyToComment = function () {
    const replyTextBoxClass = typeOfElement === "comment" ? typeOfElement : "reply";

    // Set DOM elements required for reply textbox.
    const commentReplyButton = document.querySelector(
        `.reply-button.${replyTextBoxClass}--${targetElementID}`
    );

    const replySaveButton = document.querySelector(
        `.post-reply-button.${replyTextBoxClass}--${targetElementID}`
    );

    const replyDiscardButton = document.querySelector(
        `.discard-reply-button.${replyTextBoxClass}--${targetElementID}`
    );

    document.querySelector(`.reply-comment--${targetElementID}`).value = "";

    document
        .querySelector(`.reply-comment--${targetElementID}`)
        .classList.remove("hidden");

    // Enable reply textbox and relevant buttons
    document.querySelector(`.new-reply--${targetElementID}`).classList.remove("hidden");
    commentReplyButton.classList.add("hidden");
    replySaveButton.classList.remove("hidden");
    replyDiscardButton.classList.remove("hidden");

    const resetReplyBox = function () {
        document.querySelector(`.new-reply--${targetElementID}`).classList.add("hidden");
        commentReplyButton.classList.remove("hidden");
        replySaveButton.classList.add("hidden");
        replyDiscardButton.classList.add("hidden");
    };

    const saveReply = function () {
        const replyText = document.querySelector(
            `.reply-comment--${targetElementID}`
        ).value;

        if (replyText === "") {
            console.log("Empty Reply Box");
            const errorMessageContainer = document.querySelector(
                `.main-reply-messages--${targetElementID}`
            );
            const currentReply = document.querySelector(
                `.reply-comment--${targetElementID}`
            );

            currentReply.classList.add("error");
            errorMessageContainer.classList.add("error");
            errorMessageContainer.innerText = "Comment cannot be empty!";

            setTimeout(() => {
                errorMessageContainer.classList.remove("error");
                currentReply.classList.remove("error");
                errorMessageContainer.innerText = "";
            }, 3000);

            return;
        }

        // Remove multiple listeners
        replySaveButton.removeEventListener("click", saveReply);
        resetReplyBox();
        let replyingTo = "";

        if (typeOfElement === "comment") {
            replyingTo = fetchData().comments.find(
                (comment) => comment.id === +targetElementID
            ).user.username;
        } else if (typeOfElement === "comment-reply") {
            fetchData().comments.forEach((comment) => {
                console.log(comment.replies);
                replyingTo = comment.replies.find(
                    (reply) => reply.id === +targetElementID
                )?.user?.username;
            });
        }
        appendNewData(replyText, "reply", replyingTo);
    };

    const discardReply = function () {
        // Remove multiple listeners
        replyDiscardButton.removeEventListener("click", discardReply);
        resetReplyBox();
        return;
    };

    replySaveButton.addEventListener("click", saveReply);
    replyDiscardButton.addEventListener("click", discardReply);
};

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

        const newDataTextRaw = document.querySelector(
            `.edit-comment--${targetElementID}`
        ).value;

        console.log(`New Comment: ${newDataTextRaw}`);
        if (newDataTextRaw === "") {
            console.log("Empty Edit Box");
            const errorMessageContainer = document.querySelector(
                `.main-edit-messages--${targetElementID}`
            );
            const currentComment = document.querySelector(
                `.edit-comment--${targetElementID}`
            );

            currentComment.classList.add("error");
            errorMessageContainer.classList.add("error");
            errorMessageContainer.innerText = "Comment cannot be empty!";

            setTimeout(() => {
                errorMessageContainer.classList.remove("error");
                currentComment.classList.remove("error");
                errorMessageContainer.innerText = "";
            }, 3000);

            return;
        }

        const newStartFilterPattern = /\n\s*.\w*\s\s/;
        const newEndFilterPattern = /\n\s*/;

        let newDataText = newDataTextRaw
            .replace(newStartFilterPattern, "")
            .replace(newEndFilterPattern, "");

        // Check if the new comment is the same as the old one (ie. no changes made)
        let isSameText = true;

        if (commentText.split(" ").length != newDataText.split(" ").length) {
            isSameText = false;
        } else {
            for (let index = 0; index < newDataText.length; index++) {
                if (commentText[index] != newDataText[index]) {
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

                        reply.content = newDataText;
                        reply.createdAt = dateString;

                        newDataText = `
                        <span class="content__replying-to">@${reply.replyingTo}&nbsp;&nbsp;</span>${newDataText}
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
        ).innerHTML = newDataText;

        // Remove event listeners to prevent this function from calling multiple times on the subsequent calls.
        commentSaveButton.removeEventListener("click", saveComment);
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
            existingComments.forEach((currentComment) => {
                indexToBeDeleted = currentComment.replies.indexOf(
                    currentComment.replies.find((reply) => reply.id === +commentID)
                );
                // Delete reply
                currentComment.replies.splice(indexToBeDeleted, 1);
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

    const commentActionsContainer = document.querySelectorAll(".comment__actions");
    const modalCancelDeleteButton = document.querySelectorAll(".do-not-delete");
    const modalConfirmDeletButton = document.querySelectorAll(".confirm-delete");

    const newDataForm = document.querySelector(".new-comment-form");
    const newDataText = document.querySelector(".new-comment-textbox");
    const commentTextMessage = document.querySelector(".comment-text-messages");
    const newDataButton = document.querySelector(".new-comment-submit");

    const upvoteButton = document.querySelectorAll(".upvote-button");
    const downvoteButton = document.querySelectorAll(".downvote-button");

    modalOverlay.addEventListener("click", closeModal);

    // Sort button listener
    sortButton.addEventListener("click", function () {
        sortOptions.classList.toggle("sort-menu-active");
    });

    commentActionsContainer.forEach((container) => {
        container.addEventListener("click", function (e) {
            if (e.target.nodeName === "BUTTON") setSelectedElement(e.target);

            switch (e.target.classList[1]) {
                case "reply-button":
                    replyToComment();
                    break;

                case "edit-button":
                    editComment();
                    break;

                case "delete-button":
                    showModal();
                    break;

                default:
                    return;
            }
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

    const processComment = function (e) {
        e.preventDefault();

        if (newDataText.value === "") {
            newDataText.classList.add("error");
            commentTextMessage.classList.add("error");
            commentTextMessage.innerHTML = "Comment cannot be empty!";
            setTimeout(() => {
                newDataText.classList.remove("error");
                commentTextMessage.classList.remove("error");
            }, 3000);

            return;
        }

        appendNewData(newDataText.value, "comment");
        newDataText.value = "";
    };

    newDataButton.addEventListener("click", processComment);
    newDataForm.addEventListener("submit", processComment);

    upvoteButton.forEach((btn) => {
        btn.addEventListener("click", function () {
            setSelectedElement(this);
            registerVotes("upvote");
        });
    });

    downvoteButton.forEach((btn) => {
        btn.addEventListener("click", function () {
            setSelectedElement(this);
            registerVotes("downvote");
        });
    });
};

const appendNewData = function (newData, typeOfData, replyingToUser) {
    // Adds new comment or reply to a comment
    const data = fetchData();
    const dateString = `${days[today.getDay()]}, ${today.getDate()}/${
        months[today.getMonth()]
    }/${today.getFullYear()}`;

    const newDataID = listOfCommentIDs.length === 0 ? 1 : listOfCommentIDs.at(-1) + 1;

    let newDataArray = {
        id: +`${newDataID}`,
        content: newData,
        createdAt: dateString,
        score: 0,
        user: {
            image: {
                png: data.currentUser.image.png,
                webp: data.currentUser.image.webp,
            },
            username: data.currentUser.username,
        },
        ...(typeOfData === "comment" && { replies: [] }),
        ...(typeOfData === "reply" && { replyingTo: replyingToUser }),
    };

    listOfCommentIDs.push(newDataArray.id);

    if (typeOfData === "comment") {
        data.comments.push(newDataArray);
    } else if (typeOfData === "reply") {
        // Get the parent comment that this reply belongs to.
        let parentCommentID;
        if (typeOfElement === "comment") {
            parentCommentID = targetElementID;
        } else {
            // If the data is a reply to another reply, find the parent comment first.
            parentCommentID = document
                .querySelector(`.comment-reply--${targetElementID}`)
                .classList[1].split("-")[2];
        }

        // Push to replies array.
        data.comments
            .find((comment) => comment.id === +parentCommentID)
            .replies.push(newDataArray);
    }

    /*
        Flush all comments and re-load the whole container with new ones.
        New approach needed.
    */
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

        <span class="main-comment-messages main-edit-messages--${comment.id}"></span>

        <article class="comment--footer">
            <div class="comment__votes">
                <button class="button vote-button upvote-button upvote-button--${
                    comment.id
                }">
                    <i class="fa-solid fa-arrow-up"></i>
                </button>

                <p class="vote-counter">${comment.score}</p>

                <button class="button vote-button downvote-button downvote-button--${
                    comment.id
                }">
                    <i class="fa-solid fa-arrow-down"></i>
                </button>
            </div>

            <div class="comment__actions">
                <div class="action__reply ${
                    comment.user.username === currentUser.username && "hidden"
                }">
                    <button class="button reply-button action-button comment--${
                        comment.id
                    }">
                        <i class="fa-solid fa-reply"></i>
                        <span class="action-reply">Reply</span>
                    </button>
                </div>

                <div class="action__button-container ${
                    comment.user.username != currentUser.username && "hidden"
                }"> 
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

        commentHTML += `
            <section class="new-reply new-reply--${comment.id} hidden">
                <textarea rows="7" class="reply--new-reply reply-comment--${comment.id} reply-comment-textbox hidden">
                </textarea>

                <span class="main-comment-messages main-reply-messages--${comment.id}"></span>
                
                <div class="action__button-container--new-reply">
                    <button class="button post-reply-button action-button comment--${comment.id} hidden">
                        <i class="fa-regular fa-floppy-disk action-icon"></i>
                        <span class="action-save">Post</span>
                    </button>

                    <button class="button discard-reply-button action-button comment--${comment.id} hidden">
                        <i class="fa-solid fa-ban action-icon"></i>
                        <span class="action-discard">Discard</span>
                    </button>
                </div>
            </section>
        `;

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
            
            <textarea rows="7" class="reply--edit edit-comment--${
                reply.id
            } edit-comment-textbox hidden">
            </textarea>

            <span class="main-comment-messages main-edit-messages--${reply.id}"></span>

            <article class="comment--footer">
                <div class="comment__votes">
                    <button class="button vote-button upvote-button upvote-button--${
                        reply.id
                    }">
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>

                    <p class="vote-counter">${reply.score}</p>

                    <button class="button vote-button downvote-button downvote-button--${
                        reply.id
                    }">
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>
                </div>

                <div class="comment__actions">
                    <div class="action__reply ${
                        reply.user.username === currentUser.username && "hidden"
                    }">
                        <button class="button reply-button action-button reply--${
                            reply.id
                        }">
                            <i class="fa-solid fa-reply action-icon"></i>
                            <span class="action-reply">Reply</span>
                        </button>
                    </div>

                    <div class="action__button-container ${
                        reply.user.username != currentUser.username && "hidden"
                    }">
                        <button class="button edit-button action-button reply--${
                            reply.id
                        }">
                            <i class="fa-solid fa-pen action-icon"></i>
                            <span class="action-edit">Edit</span>
                        </button>

                        <button class="button delete-button action-button reply--${
                            reply.id
                        }">
                            <i class="fa-solid fa-trash-can action-icon"></i>
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

            commentReplyHTML += `
                <section class="new-reply new-reply--${reply.id} hidden">
                    <textarea rows="7" class="reply--new-reply reply-comment--${reply.id} reply-comment-textbox hidden">
                    </textarea>

                    <span class="main-comment-messages main-reply-messages--${reply.id}"></span>
                        
                    <div class="action__button-container--new-reply">
                        <button class="button post-reply-button action-button reply--${reply.id} hidden">
                            <i class="fa-regular fa-floppy-disk action-icon"></i>
                            <span class="action-save">Post</span>
                        </button>

                        <button class="button discard-reply-button action-button reply--${reply.id} hidden">
                            <i class="fa-solid fa-ban action-icon"></i>
                            <span class="action-discard">Discard</span>
                        </button>
                    </div>
                </section>
             `;
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

    console.log(listOfCommentIDs);
};

// Start up everything.
const intitialize = function () {
    setStorageVariable("commentsSectionTheme"); // From utils.js
    parseData();

    console.log(fetchData());
};

intitialize();

/* Event Listeners */
burgerMenuButton.addEventListener("click", function (e) {
    Array.from(burgerMenuButton.children).forEach((bar) =>
        bar.classList.toggle("menu-active")
    );
    headerButtons.classList.toggle("header-buttons-active");
    mainContainer.classList.toggle("header-buttons-active");
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
