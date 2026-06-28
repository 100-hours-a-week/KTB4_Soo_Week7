// 사용할 HTML 요소(DOM)들 가져오기
const signupForm = document.getElementById('signup-form');
const profileInput = document.getElementById('profile-input');
const profileUploadBtn = document.querySelector('.profile-upload-button');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const passwordConfirmInput = document.getElementById('password-confirm-input');
const nicknameInput = document.getElementById('nickname-input');
const signupBtn = document.getElementById('signup-submit-btn');

const profileError = document.getElementById('profile-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const passwordConfirmError = document.getElementById('password-confirm-error');
const nicknameError = document.getElementById('nickname-error');
const API_BASE_URL = `http://${window.location.hostname}:8080`;

// 실시간 입력 감지하여 버튼 색상 바꾸기
function checkInputs() {
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const passwordConfirmValue = passwordConfirmInput.value.trim();
    const nicknameValue = nicknameInput.value.trim();

    if (
        emailValue !== "" &&
        passwordValue !== "" &&
        passwordConfirmValue !== "" &&
        nicknameValue !== ""
    ) {
        signupBtn.style.backgroundColor = "#7F6AEE";
    } else {
        signupBtn.style.backgroundColor = "#ACA0EB";
    }
}

// 프로필 사진 버튼 클릭 시 파일 선택창 열기
profileUploadBtn.addEventListener('click', function() {
    profileInput.click();
});

// 프로필 사진 선택 시 미리보기 보여주기
profileInput.addEventListener('change', function() {
    const selectedFile = profileInput.files[0];

    if (!selectedFile) {
        checkInputs();
        return;
    }

    const imageUrl = URL.createObjectURL(selectedFile);
    profileUploadBtn.innerHTML = `<img src="${imageUrl}" alt="선택한 프로필 사진">`;
    profileError.textContent = "";
    checkInputs();
});

emailInput.addEventListener('input', checkInputs);
passwordInput.addEventListener('input', checkInputs);
passwordConfirmInput.addEventListener('input', checkInputs);
nicknameInput.addEventListener('input', checkInputs);

// 회원가입 버튼 클릭(폼 제출) 시 유효성 검사
signupForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const passwordConfirmValue = passwordConfirmInput.value.trim();
    const nicknameValue = nicknameInput.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

    profileError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    passwordConfirmError.textContent = "";
    nicknameError.textContent = "";

    let isSuccess = true;

    // 이메일 유효성 검사
    if (emailValue === "") {
        emailError.textContent = "* 이메일을 입력해주세요.";
        isSuccess = false;
    } else if (!emailRegex.test(emailValue)) {
        emailError.textContent = "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)";
        isSuccess = false;
    }

    // 비밀번호 유효성 검사
    if (passwordValue === "") {
        passwordError.textContent = "* 비밀번호를 입력해주세요.";
        isSuccess = false;
    } else if (!passwordRegex.test(passwordValue)) {
        passwordError.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        isSuccess = false;
    }

    // 비밀번호 확인 유효성 검사
    if (passwordConfirmValue === "") {
        passwordConfirmError.textContent = "* 비밀번호를 한번 더 입력해주세요.";
        isSuccess = false;
    } else if (passwordValue !== passwordConfirmValue) {
        passwordConfirmError.textContent = "* 비밀번호가 다릅니다.";
        isSuccess = false;
    }

    // 닉네임 유효성 검사
    if (nicknameValue === "") {
        nicknameError.textContent = "* 닉네임을 입력해주세요.";
        isSuccess = false;
    } else if (nicknameValue.includes(" ")) {
        nicknameError.textContent = "* 띄어쓰기를 없애주세요.";
        isSuccess = false;
    } else if (nicknameValue.length > 10) {
        nicknameError.textContent = "* 닉네임은 최대 10자까지 작성 가능합니다.";
        isSuccess = false;
    }

    if (isSuccess) {
        const signupData = {
            email: emailValue,
            password: passwordValue,
            nickname: nicknameValue
        };

        fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        })
        .then(response => response.json())
        .then(resData => {
            console.log("서버 응답 데이터:", resData);

            if (resData.code === "SIGNUP_SUCCESS") {
                localStorage.setItem('loginUserEmail', emailValue);
                localStorage.setItem('loginUserNickname', nicknameValue);
                alert("회원가입에 성공했습니다!");
                window.location.href = "../login/index.html";
            } else if (resData.code === "DUPLICATE_EMAIL") {
                emailError.textContent = `* ${resData.message}`;
            } else if (resData.code === "DUPLICATE_NICKNAME") {
                nicknameError.textContent = `* ${resData.message}`;
            } else if (
                resData.code === "EMAIL_EMPTY" ||
                resData.code === "INVALID_EMAIL_FORMAT"
            ) {
                emailError.textContent = `* ${resData.message || "올바른 이메일 주소 형식을 입력해주세요."}`;
            } else if (
                resData.code === "PASSWORD_EMPTY" ||
                resData.code === "INVALID_PASSWORD_LENGTH" ||
                resData.code === "INVALID_PASSWORD_COMPLEXITY"
            ) {
                passwordError.textContent = `* ${resData.message || "비밀번호 형식을 확인해주세요."}`;
            } else if (
                resData.code === "NICKNAME_EMPTY" ||
                resData.code === "INVALID_NICKNAME_LENGTH" ||
                resData.code === "NICKNAME_CONTAINS_SPACE"
            ) {
                nicknameError.textContent = `* ${resData.message || "닉네임 형식을 확인해주세요."}`;
            } else {
                alert(resData.message || "회원가입 중 알 수 없는 에러가 발생했습니다.");
            }
        })
        .catch(error => {
            console.error("통신 에러 발생:", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        });
    }
});
