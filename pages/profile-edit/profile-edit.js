const profileMenu = document.querySelector('.profile-menu');
const headerProfileBtn = document.querySelector('.header-profile-button');
const emailText = document.getElementById('email-text');
const nicknameInput = document.getElementById('nickname-input');
const nicknameError = document.getElementById('nickname-error');
const profileEditForm = document.getElementById('profile-edit-form');
const editSubmitBtn = document.getElementById('edit-submit-btn');
const withdrawBtn = document.querySelector('.withdraw-button');
const modalOverlay = document.querySelector('.modal-overlay');
const modalCancelBtn = document.querySelector('.modal-cancel-button');
const modalConfirmBtn = document.querySelector('.modal-confirm-button');
const toastMessage = document.querySelector('.toast-message');
const API_BASE_URL = `http://${window.location.hostname}:8080`;

function toggleProfileMenu() {
    profileMenu.classList.toggle('is-open');
}

function closeProfileMenu(event) {
    if (!profileMenu.contains(event.target)) {
        profileMenu.classList.remove('is-open');
    }
}

function setUserInfo(user) {
    if (!user) {
        return;
    }

    if (user.email) {
        emailText.textContent = user.email;
    }

    if (user.nickname) {
        nicknameInput.value = user.nickname;
    }
}

function loadUserInfo() {
    authFetch(`${API_BASE_URL}/api/v1/users/me`, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('현재 사용자 조회 API를 사용할 수 없습니다.');
        }

        return response.json();
    })
    .then(resData => {
        const user = resData.data || resData;
        setUserInfo(user);
    })
    .catch(error => {
        console.error("회원 정보 조회 실패:", error);
        alert("로그인이 필요합니다.");
        window.location.href = "../login/index.html";
    });
}

function showNicknameServerError(errorCode, errorMessage) {
    if (
        errorCode === "NICKNAME_EMPTY" ||
        errorCode === "INVALID_NICKNAME_LENGTH" ||
        errorCode === "NICKNAME_CONTAINS_SPACE" ||
        errorCode === "DUPLICATE_NICKNAME"
    ) {
        nicknameError.textContent = `* ${errorMessage || "닉네임 형식을 확인해주세요."}`;
        return;
    }

    if (errorCode === "USER_NOT_FOUND") {
        alert(errorMessage || "로그인이 필요합니다.");
        window.location.href = "../login/index.html";
        return;
    }

    alert(errorMessage || "회원정보 수정 중 알 수 없는 에러가 발생했습니다.");
}

function validateNickname() {
    const nicknameValue = nicknameInput.value.trim();

    nicknameError.textContent = "";

    if (nicknameValue === "") {
        nicknameError.textContent = "* 닉네임을 입력해주세요.";
        return false;
    }

    if (nicknameValue.includes(" ")) {
        nicknameError.textContent = "* 띄어쓰기를 없애주세요.";
        return false;
    }

    if (nicknameValue.length > 10) {
        nicknameError.textContent = "* 닉네임은 최대 10자까지 작성 가능합니다.";
        return false;
    }

    return true;
}

function showToast() {
    toastMessage.classList.add('is-visible');
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

headerProfileBtn.addEventListener('click', toggleProfileMenu);
document.addEventListener('click', closeProfileMenu);

profileEditForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (!validateNickname()) {
        return;
    }

    const updateData = {
        newNickname: nicknameInput.value.trim()
    };

    authFetch(`${API_BASE_URL}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (response.ok) {
            editSubmitBtn.style.backgroundColor = "#7F6AEE";
            localStorage.setItem('loginUserNickname', updateData.newNickname);
            showToast();
            return null;
        }

        return parseResponseBody(response);
    })
    .then(resData => {
        if (!resData) {
            return;
        }

        showNicknameServerError(resData.code, resData.message);
    })
    .catch(error => {
        console.error("통신 에러 발생:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    });
});

withdrawBtn.addEventListener('click', function() {
    modalOverlay.classList.add('is-visible');
    modalOverlay.setAttribute('aria-hidden', 'false');
});

modalCancelBtn.addEventListener('click', function() {
    modalOverlay.classList.remove('is-visible');
    modalOverlay.setAttribute('aria-hidden', 'true');
});

modalConfirmBtn.addEventListener('click', function() {
    clearAuth();
    window.location.href = "../login/index.html";
});

loadUserInfo();
