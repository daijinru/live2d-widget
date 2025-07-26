let messageTimer = null;
function showMessage(text, timeout, priority, override = true) {
}
function showSSEMessage(text, id) {
    var _a;
    const shadowRoot = (_a = document.getElementById('WENKO__CONTAINER-ROOT')) === null || _a === void 0 ? void 0 : _a.shadowRoot;
    if (!shadowRoot)
        return;
    const tips = shadowRoot.getElementById('waifu-tips');
    if (!tips)
        return;
    const currentSSEId = tips.getAttribute('data-sse-id');
    if (currentSSEId === id) {
        tips.innerHTML += text;
    }
    else {
        tips.classList.remove('waifu-tips-active');
        tips.removeAttribute('data-sse-id');
        tips.innerHTML = text;
        tips.setAttribute('data-sse-id', id);
        setTimeout(() => {
            tips.classList.add('waifu-tips-active');
        }, 10);
    }
}
function welcomeMessage(time, welcomeTemplate, referrerTemplate) {
    if (location.pathname === '/') {
        for (const { hour, text } of time) {
            const now = new Date(), after = hour.split('-')[0], before = hour.split('-')[1] || after;
            if (Number(after) <= now.getHours() &&
                now.getHours() <= Number(before)) {
                return text;
            }
        }
    }
    const text = i18n(welcomeTemplate, document.title);
    if (document.referrer !== '') {
        const referrer = new URL(document.referrer);
        if (location.hostname === referrer.hostname)
            return text;
        return `${i18n(referrerTemplate, referrer.hostname)}<br>${text}`;
    }
    return text;
}
function i18n(template, ...args) {
    return template.replace(/\$(\d+)/g, (_, idx) => {
        var _a;
        const i = parseInt(idx, 10) - 1;
        return (_a = args[i]) !== null && _a !== void 0 ? _a : '';
    });
}
export { showMessage, showSSEMessage, welcomeMessage, i18n };
