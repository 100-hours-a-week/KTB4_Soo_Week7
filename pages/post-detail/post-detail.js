const profileMenu = document.querySelector('.profile-menu');
const headerProfileBtn = document.querySelector('.header-profile-button');
const postTitle = document.getElementById('post-title');
const postAuthor = document.getElementById('post-author');
const postDate = document.getElementById('post-date');
const postEditBtn = document.getElementById('post-edit-btn');
const postDeleteBtn = document.getElementById('post-delete-btn');
const postImage = document.getElementById('post-image');
const postContent = document.getElementById('post-content');
const likeBtn = document.getElementById('like-btn');
const likeCount = document.getElementById('like-count');
const viewCount = document.getElementById('view-count');
const commentCount = document.getElementById('comment-count');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const commentSubmitBtn = document.getElementById('comment-submit-btn');
const commentsList = document.getElementById('comments-list');
const deletePostModal = document.getElementById('delete-post-modal');
const deleteCommentModal = document.getElementById('delete-comment-modal');
const confirmPostDeleteBtn = document.getElementById('confirm-post-delete-btn');
const confirmCommentDeleteBtn = document.getElementById('confirm-comment-delete-btn');
const API_BASE_URL = `http://${window.location.hostname}:8080`;

const params = new URLSearchParams(window.location.search);
const postId = params.get('id');
let currentPost = null;
let isLiked = false;
let currentLikeCount = 0;
let editingCommentId = null;
let deletingCommentId = null;

function toggleProfileMenu() {
    profileMenu.classList.toggle('is-open');
}

function closeProfileMenu(event) {
    if (!profileMenu.contains(event.target)) {
        profileMenu.classList.remove('is-open');
    }
}

function parseResponseBody(response) {
    return response.text()
        .then(text => {
            if (!text) {
                return null;
            }

            return JSON.parse(text);
        });
}

function formatDateTime(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatCount(value) {
    const count = Number(value) || 0;

    if (count >= 100000) {
        return "100k";
    }

    if (count >= 10000) {
        return "10k";
    }

    if (count >= 1000) {
        return "1k";
    }

    return String(count);
}

function getCommentId(comment) {
    return comment.id ?? comment.commentId;
}

function getCommentContent(comment) {
    if (getCommentId(comment) == null) {
        return "삭제된 댓글입니다";
    }

    return comment.content ?? comment.commentContent ?? "";
}

function getCommentAuthor(comment) {
    if (getCommentId(comment) == null) {
        return "알 수 없는 사용자";
    }

    return comment.nickname ?? comment.author ?? comment.writer ?? "작성자";
}

function getCommentDate(comment) {
    return comment.updatedAt || comment.createdAt || comment.updatedDate || comment.createdDate;
}

function handleAuthError(errorCode, errorMessage) {
    if (errorCode === "USER_NOT_FOUND" || errorCode === "UNAUTHORIZED_USER") {
        alert(errorMessage || "로그인이 필요합니다.");
        window.location.href = "../login/index.html";
        return true;
    }

    return false;
}

function showServerError(errorCode, errorMessage) {
    if (handleAuthError(errorCode, errorMessage)) {
        return;
    }

    if (errorCode === "POST_NOT_FOUND") {
        alert(errorMessage || "해당 게시글이 존재하지 않습니다.");
        window.location.href = "../posts/index.html";
        return;
    }

    if (errorCode === "UNAUTHORIZED_POST_ACCESS" || errorCode === "UNAUTHORIZED_COMMENT_ACCESS") {
        alert(errorMessage || "권한이 없습니다.");
        return;
    }

    if (errorCode === "CONTENT_EMPTY") {
        alert(errorMessage || "댓글 내용을 입력해주세요.");
        return;
    }

    alert(errorMessage || "요청 처리 중 오류가 발생했습니다.");
}

function openModal(modal) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function setCommentButtonState() {
    if (commentInput.value.trim() === "") {
        commentSubmitBtn.classList.remove('is-active');
    } else {
        commentSubmitBtn.classList.add('is-active');
    }
}

function setPostDetail(post) {
    currentPost = post;
    currentLikeCount = post.likeCount ?? post.likes ?? 0;

    postTitle.textContent = post.title || "제목 없음";
    postAuthor.textContent = post.nickname || post.author || "작성자";
    postDate.textContent = formatDateTime(post.updatedAt || post.createdAt);
    postContent.textContent = post.content || "";
    likeCount.textContent = formatCount(currentLikeCount);
    viewCount.textContent = formatCount(post.viewCount ?? post.views ?? 0);
    commentCount.textContent = formatCount(Array.isArray(post.comments) ? post.comments.length : post.commentCount ?? 0);

    if (post.image) {
        postImage.classList.remove('is-hidden');
        postImage.style.backgroundImage = `url("${post.image}")`;
    } else {
        postImage.classList.remove('is-hidden');
        postImage.style.backgroundImage = "";
    }

    renderComments(post.comments || []);
}

function buildCommentItem(comment) {
    const commentId = getCommentId(comment);
    const item = document.createElement('article');
    item.className = 'comment-item';

    const avatar = document.createElement('span');
    avatar.className = 'author-avatar';
    avatar.setAttribute('aria-hidden', 'true');

    const body = document.createElement('div');
    body.className = 'comment-body';

    const meta = document.createElement('div');
    meta.className = 'comment-meta';

    const author = document.createElement('strong');
    author.textContent = getCommentAuthor(comment);

    const time = document.createElement('time');
    time.textContent = formatDateTime(getCommentDate(comment));

    const content = document.createElement('p');
    content.className = 'comment-content';
    content.textContent = getCommentContent(comment);

    const actions = document.createElement('div');
    actions.className = 'comment-actions';

    if (commentId != null) {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.textContent = '수정';
        editBtn.addEventListener('click', function() {
            editingCommentId = commentId;
            commentInput.value = getCommentContent(comment);
            commentSubmitBtn.textContent = '댓글 수정';
            setCommentButtonState();
            commentInput.focus();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', function() {
            deletingCommentId = commentId;
            openModal(deleteCommentModal);
        });

        actions.append(editBtn, deleteBtn);
    }

    meta.append(author, time);
    body.append(meta, content);
    item.append(avatar, body, actions);

    return item;
}

function renderComments(comments) {
    commentsList.innerHTML = "";

    if (!comments.length) {
        return;
    }

    comments.forEach(comment => {
        commentsList.appendChild(buildCommentItem(comment));
    });
}

function loadPostDetail() {
    if (!postId) {
        alert("게시글 ID가 없습니다.");
        window.location.href = "../posts/index.html";
        return;
    }

    fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        return parseResponseBody(response)
            .then(resData => {
                if (response.ok) {
                    return resData;
                }

                showServerError(resData?.code, resData?.message);
                return null;
            });
    })
    .then(resData => {
        if (resData?.code === "POST_DETAIL_FETCH_SUCCESS") {
            setPostDetail(resData.data);
        }
    })
    .catch(error => {
        console.error("통신 에러 발생:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    });
}

function submitComment() {
    const content = commentInput.value.trim();

    if (content === "") {
        return;
    }

    const isEditing = editingCommentId !== null;
    const url = isEditing
        ? `${API_BASE_URL}/api/v1/posts/${postId}/comments/${editingCommentId}`
        : `${API_BASE_URL}/api/v1/posts/${postId}/comments`;

    fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    })
    .then(response => {
        return parseResponseBody(response)
            .then(resData => {
                if (response.ok) {
                    return resData;
                }

                showServerError(resData?.code, resData?.message);
                return null;
            });
    })
    .then(resData => {
        if (!resData) {
            return;
        }

        commentInput.value = "";
        editingCommentId = null;
        commentSubmitBtn.textContent = "댓글 등록";
        setCommentButtonState();
        loadPostDetail();
    })
    .catch(error => {
        console.error("통신 에러 발생:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    });
}

function deletePost() {
    fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            window.location.href = "../posts/index.html";
            return null;
        }

        return parseResponseBody(response)
            .then(resData => {
                showServerError(resData?.code, resData?.message);
            });
    })
    .catch(error => {
        console.error("통신 에러 발생:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    });
}

function deleteComment() {
    if (!deletingCommentId) {
        return;
    }

    fetch(`${API_BASE_URL}/api/v1/posts/${postId}/comments/${deletingCommentId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            deletingCommentId = null;
            closeModal(deleteCommentModal);
            loadPostDetail();
            return null;
        }

        return parseResponseBody(response)
            .then(resData => {
                showServerError(resData?.code, resData?.message);
            });
    })
    .catch(error => {
        console.error("통신 에러 발생:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    });
}

headerProfileBtn.addEventListener('click', toggleProfileMenu);
document.addEventListener('click', closeProfileMenu);

postEditBtn.addEventListener('click', function() {
    window.location.href = `../post-edit/index.html?id=${postId}`;
});

postDeleteBtn.addEventListener('click', function() {
    openModal(deletePostModal);
});

confirmPostDeleteBtn.addEventListener('click', deletePost);
confirmCommentDeleteBtn.addEventListener('click', deleteComment);

document.querySelectorAll('[data-close-modal]').forEach(button => {
    button.addEventListener('click', function() {
        closeModal(deletePostModal);
        closeModal(deleteCommentModal);
    });
});

deletePostModal.addEventListener('click', function(event) {
    if (event.target === deletePostModal) {
        closeModal(deletePostModal);
    }
});

deleteCommentModal.addEventListener('click', function(event) {
    if (event.target === deleteCommentModal) {
        closeModal(deleteCommentModal);
    }
});

likeBtn.addEventListener('click', function() {
    isLiked = !isLiked;
    currentLikeCount += isLiked ? 1 : -1;
    likeBtn.classList.toggle('is-liked', isLiked);
    likeCount.textContent = formatCount(currentLikeCount);
});

commentInput.addEventListener('input', setCommentButtonState);
commentForm.addEventListener('submit', function(event) {
    event.preventDefault();
    submitComment();
});

loadPostDetail();
