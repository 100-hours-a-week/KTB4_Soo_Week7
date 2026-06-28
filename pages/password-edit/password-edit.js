const profileMenu = document.querySelector('.profile-menu');
const headerProfileBtn = document.querySelector('.header-profile-button');
const passwordEditForm = document.getElementById('password-edit-form');
const passwordInput = document.getElementById('password-input');
const passwordConfirmInput = document.getElementById('password-confirm-input');
const passwordEditBtn = document.getElementById('password-edit-submit-btn');
const passwordError = document.getElementById('password-error');
const passwordConfirmError = document.getElementById('password-confirm-error');
const completeMessage = document.querySelector('.complete-message');
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
    const passwordValue = passwordInput.value.trim();
    const passwordConfirmValue = passwordConfirmInput.value.trim();

    if (passwordValue !== "" && passwordConfirmValue !== "") {
        passwordEditBtn.style.backgroundColor = "#7F6AEE";
    } else {
        passwordEditBtn.style.backgroundColor = "#ACA0EB";
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

function showPasswordServerError(errorCode, errorMessage) {
    if (
        errorCode === "PASSWORD_EMPTY" ||
        errorCode === "INVALID_PASSWORD_LENGTH" ||
        errorCode === "INVALID_PASSWORD_COMPLEXITY"
    ) {
        passwordError.textContent = `* ${errorMessage || "비밀번호 형식을 확인해주세요."}`;
        return;
    }

    if (errorCode === "USER_NOT_FOUND" || errorCode === "UNAUTHORIZED_USER") {
        alert(errorMessage || "로그인이 필요합니다.");
        window.location.href = "../login/index.html";
        return;
    }

    alert(errorMessage || "비밀번호 수정 중 알 수 없는 에러가 발생했습니다.");
}

function validatePassword() {
    const passwordValue = passwordInput.value.trim();
    const passwordConfirmValue = passwordConfirmInput.value.trim();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

    passwordError.textContent = "";
    passwordConfirmError.textContent = "";
    completeMessage.classList.remove('is-visible');

    let isSuccess = true;

    if (passwordValue === "") {
        passwordError.textContent = "* 비밀번호를 입력해주세요.";
        isSuccess = false;
    } else if (!passwordRegex.test(passwordValue)) {
        passwordError.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        isSuccess = false;
    }

    if (passwordConfirmValue === "") {
        passwordConfirmError.textContent = "* 비밀번호를 한번 더 입력해주세요.";
        isSuccess = false;
    } else if (passwordValue !== passwordConfirmValue) {
        passwordConfirmError.textContent = "* 비밀번호가 다릅니다.";
        isSuccess = false;
    }

    return isSuccess;
}

headerProfileBtn.addEventListener('click', toggleProfileMenu);
document.addEventListener('click', closeProfileMenu);
passwordInput.addEventListener('input', checkInputs);
passwordConfirmInput.addEventListener('input', checkInputs);

passwordEditForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (!validatePassword()) {
        return;
    }

    const updateData = {
        newPassword: passwordInput.value.trim()
    };

    fetch(`${API_BASE_URL}/api/v1/users/me/password`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (response.ok) {
            passwordEditBtn.style.backgroundColor = "#7F6AEE";
            completeMessage.classList.add('is-visible');
            return null;
        }

        return parseResponseBody(response);
    })
    .then(resData => {
        if (!resData) {
            return;
        }

        showPasswordServerError(resData.code, resData.message);
    })
    .catch(error => {
        console.error("통신 에러 발생:", error);
        alert("서버와 통신 중 오류가 발생했습니다.");
    });
});
