// 사용할 HTML 요소(DOM)들 가져오기
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-submit-btn');

const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

// 실시간 입력 감지하여 버튼 색상 바꾸기
function checkInputs() {
    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    // 이메일과 비밀번호가 둘 다 비어있지 않다면
    if (emailValue !== "" && passwordValue !== "") {
        loginBtn.style.backgroundColor = "#7F6AEE"; 
    } else {
        loginBtn.style.backgroundColor = "#ACA0EB"; 
    }
}

emailInput.addEventListener('input', checkInputs);
passwordInput.addEventListener('input', checkInputs);


// 로그인 버튼 클릭(폼 제출) 시 유효성 검사
loginForm.addEventListener('submit', function(event) {

    event.preventDefault();

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    // 이메일 형식을 검사하는 정규표현식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 에러 메시지 초기화 
    emailError.textContent = "";
    passwordError.textContent = "";

    let isSuccess = true; // 유효성 검사 통과 여부 플래그

    // 이메일 유효성 검사
    if (emailValue === "") {
        emailError.textContent = "* 이메일을 입력해주세요.";
        isSuccess = false;
    } else if (!emailRegex.test(emailValue)) {
        emailError.textContent = "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)";
        isSuccess = false;
    }

    // 비밀번호 유효성 검사
    // 8자 이상 20자 이하, 대문자/소문자/숫자/특수문자 최소 1개씩 포함하는 정규식
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

    if (passwordValue === "") {
        passwordError.textContent = "* 비밀번호를 입력해주세요.";
        isSuccess = false;
    } else if (!passwordRegex.test(passwordValue)) {
        passwordError.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        isSuccess = false;
    }

    // 모든 검사를 통과했을 때 처리
    if (isSuccess) {
        
    }
});