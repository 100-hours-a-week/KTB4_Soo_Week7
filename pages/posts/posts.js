import { apiFetch, handleApiError } from '../../js/api.js';
import { API_BASE_URL, formatDateTime, initProfileMenu } from '../../js/utils.js';

const postsList = document.getElementById('posts-list');
const createPostBtn = document.getElementById('create-post-btn');
function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function normalizeCount(value) {
    if (Array.isArray(value)) {
        return value.length;
    }

    return value ?? 0;
}

function showPostServerError(errorCode, errorMessage) {
    if (errorCode === "USER_NOT_FOUND" || errorCode === "UNAUTHORIZED_USER") {
        alert(errorMessage || "로그인이 필요합니다.");
        window.location.href = "../login/index.html";
        return;
    }

    alert(errorMessage || "게시글 목록을 가져오던 중 오류가 발생했습니다.");
}

function buildPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;

    const postId = post.id ?? post.postId;
    const titleText = post.title || '제목 없음';
    const authorName = post.author || post.writer || post.nickname || '미등록 작성자';
    const postedAt = formatDateTime(
        post.updatedAt || post.createdAt || post.updatedDate || post.createdDate || post.updated_at || post.created_at
    );
    const likeCount = normalizeCount(post.likeCount ?? post.likes);
    const commentCount = normalizeCount(post.commentCount ?? post.comments);
    const viewCount = normalizeCount(post.viewCount ?? post.views);

    card.innerHTML = `
        <h3 class="post-card-title">${escapeHtml(titleText)}</h3>
        <div class="post-card-meta-row">
            <div class="post-card-stats">
                <span>같은 문제 ${likeCount}</span>
                <span>댓글 ${commentCount}</span>
                <span>조회 ${viewCount}</span>
            </div>
            <time class="post-card-date">${escapeHtml(postedAt)}</time>
        </div>
        <div class="post-card-footer">
            <div class="author-info">
                <span class="author-avatar" aria-hidden="true"></span>
                <span class="author-name">${escapeHtml(authorName)}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', function() {
        if (postId) {
            window.location.href = `../post-detail/index.html?id=${postId}`;
        }
    });

    card.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            card.click();
        }
    });

    return card;
}

function renderPosts(posts) {
    postsList.innerHTML = '';

    if (!posts || posts.length === 0) {
        const empty = document.createElement('article');
        empty.className = 'posts-empty';
        empty.textContent = '아직 등록된 버그가 없습니다. 첫 번째 버그를 발견해보세요!';
        postsList.appendChild(empty);
        return;
    }

    posts.forEach(post => {
        postsList.appendChild(buildPostCard(post));
    });
}

function loadPostList() {
    apiFetch(`${API_BASE_URL}/api/v1/posts`, {
        method: 'GET'
    })
    .then(resData => {
        const posts = Array.isArray(resData.data)
            ? resData.data
            : resData.data?.posts ?? resData.data?.items ?? [];

        renderPosts(posts);
    })
    .catch(error => {
        handleApiError(error, showPostServerError);
        postsList.innerHTML = '';
        const empty = document.createElement('article');
        empty.className = 'posts-empty';
        empty.textContent = '서버와 통신 중 오류가 발생했습니다.';
        postsList.appendChild(empty);
    });
}

initProfileMenu();
createPostBtn.addEventListener('click', function() {
    window.location.href = '../post-create/index.html';
});

loadPostList();
