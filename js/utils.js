export const API_BASE_URL = `http://${window.location.hostname}:8080`;

export function parseResponseBody(response) {
    return response.text().then(text => {
        if (!text) {
            return null;
        }

        return JSON.parse(text);
    });
}

export function formatDateTime(value) {
    if (!value) {
        return '-';
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

export function initProfileMenu() {
    const profileMenu = document.querySelector('.profile-menu');
    const profileButton = document.querySelector('.header-profile-button');

    if (!profileMenu || !profileButton) {
        return;
    }

    profileButton.addEventListener('click', event => {
        event.stopPropagation();
        profileMenu.classList.toggle('is-open');
    });

    document.addEventListener('click', event => {
        if (!profileMenu.contains(event.target)) {
            profileMenu.classList.remove('is-open');
        }
    });
}
