const profileMenu = document.querySelector('.profile-menu');
const headerProfileBtn = document.querySelector('.header-profile-button');
const postCreateForm = document.getElementById('post-create-form');
const titleInput = document.getElementById('title-input');
const contentInput = document.getElementById('content-input');
const imageInput = document.getElementById('image-input');
const postError = document.getElementById('post-error');
const postSubmitBtn = document.getElementById('post-submit-btn');
const API_BASE_URL = `http://${window.location.hostname}:8080`;

function toggleProfileMenu() {
    profileMenu.classList.toggle('is-open');
}

function closeProfileMenu(event) {
    if (!profileMenu.contains(event.target)) {
        profileMenu.classList.remove('is-open');
    }
}

function checkInputs() {
    const titleValue = titleInput.value.trim();
    const contentValue = contentInput.value.trim();

    if (titleValue !== "" && contentValue !== "") {
        postSubmitBtn.style.backgroundColor = "#7F6AEE";
    } else {
        postSubmitBtn.style.backgroundColor = "#ACA0EB";
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

function showPostServerError(errorCode, errorMessage) {
    if (errorCode === "TITLE_EMPTY") {
        postError.textContent = "* 제목을 입력해주세요.";
        return;
    }

    if (errorCode === "INVALID_TITLE_LENGTH") {
        postError.textContent = "* 제목은 최대 26자까지 작성 가능합니다.";
        return;
    }

    if (errorCode === "CONTENT_EMPTY") {
        postError.textContent = "* 내용을 입력해주세요.";
        return;
    }

    if (errorCode === "USER_NOT_FOUND" || errorCode === "UNAUTHORIZED_USER") {
        alert(errorMessage || "로그인이 필요합니다.");
        window.location.href = "../login/index.html";
        return;
    }

    alert(errorMessage || "게시글 작성 중 알 수 없는 에러가 발생했습니다.");
}

headerProfileBtn.addEventListener('click', toggleProfileMenu);
document.addEventListener('click', closeProfileMenu);
titleInput.addEventListener('input', checkInputs);
contentInput.addEventListener('input', checkInputs);
imageInput.addEventListener('change', function() {
    postError.textContent = "";
});

postCreateForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const titleValue = titleInput.value.trim();
    const contentValue = contentInput.value.trim();

    postError.textContent = "";

    if (titleValue === "" || contentValue === "") {
        postError.textContent = "* 제목, 내용을 모두 작성해주세요.";
        return;
    }

    if (titleValue.length > 26) {
        postError.textContent = "* 제목은 최대 26자까지 작성 가능합니다.";
        return;
    }

    const postData = {
        title: titleValue,
        content: contentValue
    };

    authFetch(`${API_BASE_URL}/api/v1/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => {
        return parseResponseBody(response)
            .then(resData => {
                if (response.ok) {
                    return resData;
                }

                showPostServerError(resData?.code, resData?.message);
                return null;
            });
    })
    .then(resData => {
        if (!resData) {
            return;
        }

        if (resData.data == null) {
            alert("생성된 게시글 ID가 응답에 포함되지 않았습니다.");
            return;
        }

        alert("게시글이 작성되었습니다.");
        window.location.href = `../post-detail/index.html?id=${resData.data}`;
    })
    .catch(error => {
        console.error("통신 에러 발생:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    });
});
