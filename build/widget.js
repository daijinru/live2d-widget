import { ModelManager } from './model.js';
import { showMessage, showSSEMessage } from './message.js';
import { randomSelection } from './utils.js';
import { ToolsManager } from './tools.js';
import logger from './logger.js';
import registerDrag from './drag.js';
import { getKanbanDaily, getSearch, saveText, } from './conversation.js';
function registerEventListener(tips) {
    var _a;
    let userAction = false;
    let userActionTimer;
    const messageArray = tips.message.default;
    tips.seasons.forEach(({ date, text }) => {
        const now = new Date(), after = date.split('-')[0], before = date.split('-')[1] || after;
        if (Number(after.split('/')[0]) <= now.getMonth() + 1 &&
            now.getMonth() + 1 <= Number(before.split('/')[0]) &&
            Number(after.split('/')[1]) <= now.getDate() &&
            now.getDate() <= Number(before.split('/')[1])) {
            text = randomSelection(text);
            text = text.replace('{year}', String(now.getFullYear()));
            messageArray.push(text);
        }
    });
    let lastHoverElement;
    window.addEventListener('mousemove', () => (userAction = true));
    window.addEventListener('keydown', () => (userAction = true));
    setInterval(() => {
        if (userAction) {
            userAction = false;
            clearInterval(userActionTimer);
            userActionTimer = null;
        }
        else if (!userActionTimer) {
            userActionTimer = setInterval(() => {
                showMessage(messageArray, 6000, 9);
            }, 20000);
        }
    }, 1000);
    window.addEventListener('mouseover', (event) => {
        var _a;
        for (let { selector, text } of tips.mouseover) {
            if (!((_a = event.target) === null || _a === void 0 ? void 0 : _a.closest(selector)))
                continue;
            if (lastHoverElement === selector)
                return;
            lastHoverElement = selector;
            text = randomSelection(text);
            text = text.replace('{text}', event.target.innerText);
            showMessage(text, 4000, 8);
            return;
        }
    });
    let dblclickLoading = false;
    window.addEventListener('dblclick', (event) => {
        console.info('>>> dblclick', event);
        const target = event.target;
        if (!target)
            return;
        let isInContainer = false;
        if (target.closest) {
            isInContainer = !!target.closest('#WENKO__CONTAINER-ROOT');
        }
        else {
            let current = target;
            while (current) {
                if (current.id === 'WENKO__CONTAINER-ROOT') {
                    isInContainer = true;
                    break;
                }
                current = current.parentElement;
            }
        }
        if (!isInContainer)
            return;
        if (dblclickLoading)
            return;
        dblclickLoading = true;
        getKanbanDaily('随便说点什么，冷笑话也行', str => {
            showSSEMessage(str, 'wenko-kanban_daily');
        }, str => {
            showSSEMessage(str, 'wenko-kanban_daily-loading');
        }, () => {
            dblclickLoading = false;
        });
    });
    window.addEventListener('live2d:hoverbody', () => {
        console.info('>>> live2d:hoverbody');
        const text = randomSelection(tips.message.hoverBody);
        showMessage(text, 4000, 8, false);
    });
    window.addEventListener('live2d:tapbody', () => {
        console.info('>>> live2d:tapbody');
        const text = randomSelection(tips.message.tapBody);
        showMessage(text, 4000, 9);
    });
    const devtools = () => { };
    console.log('%c', devtools);
    devtools.toString = () => {
        showMessage(tips.message.console, 6000, 9);
    };
    window.addEventListener('copy', () => {
        showMessage(tips.message.copy, 6000, 9);
    });
    window.addEventListener('visibilitychange', () => {
        if (!document.hidden)
            showMessage(tips.message.visibilitychange, 6000, 9);
    });
    window.addEventListener('wenko_highlight', (event) => {
        let text = event.detail;
        getSearch(text, (str) => {
            if (!str || !Array.isArray(str))
                return;
            const merged = `
[kanban_daily]
这是原文：${text},
这是有关记忆：${str[0].content},
帮我总结。
`;
            getKanbanDaily(merged, str => {
                showSSEMessage(str, 'wenko_highlight');
            }, str => {
                showSSEMessage(str, 'wenko_highlight_loading');
            });
        });
    });
    window.addEventListener('wenko_saveText', (event) => {
        let text = event.detail;
        saveText(text, (str) => {
            showSSEMessage(str, 'wenko_saveText');
        }, str => {
            showSSEMessage(str, 'wenko_saveText_loading');
        });
    });
    const shadowRoot = (_a = document.getElementById('WENKO__CONTAINER-ROOT')) === null || _a === void 0 ? void 0 : _a.shadowRoot;
    shadowRoot
        .getElementById('waifu-tips')
        .addEventListener('click', function (e) {
        const tool = this;
        const rect = tool.getBoundingClientRect();
        if (e.clientX >= rect.right - 25 &&
            e.clientX <= rect.right - 5 &&
            e.clientY >= rect.top + 5 &&
            e.clientY <= rect.top + 25) {
            shadowRoot
                .getElementById('waifu-tips').classList.remove('waifu-tips-active');
        }
    });
}
function getShadowRootMounted() {
    var _a;
    const shadowRoot = (_a = document.getElementById('WENKO__CONTAINER-ROOT')) === null || _a === void 0 ? void 0 : _a.shadowRoot;
    if (shadowRoot) {
        const mounted = shadowRoot.getElementById('wenko_wifu');
        if (mounted) {
            return mounted;
        }
    }
    return null;
}
async function loadWidget(config) {
    var _a;
    localStorage.removeItem('waifu-display');
    sessionStorage.removeItem('waifu-message-priority');
    const mounted = getShadowRootMounted();
    mounted.insertAdjacentHTML('beforeend', `<div id="waifu">
      <div id="waifu-tips"></div>
      <div id="waifu-canvas">
        <canvas id="live2d" width="800" height="800"></canvas>
      </div>
      <div id="waifu-tool"></div>
    </div>`);
    let models = [];
    let tips;
    if (config.waifuPath) {
        const response = await fetch(config.waifuPath);
        tips = await response.json();
        models = tips.models;
        registerEventListener(tips);
    }
    const model = await ModelManager.initCheck(config, models);
    await model.loadModel('');
    new ToolsManager(model, config, tips).registerTools();
    if (config.drag)
        registerDrag();
    (_a = document.getElementById('waifu')) === null || _a === void 0 ? void 0 : _a.classList.add('waifu-active');
}
function initWidget(config) {
    if (typeof config === 'string') {
        logger.error('Your config for Live2D initWidget is outdated. Please refer to https://github.com/stevenjoezhang/live2d-widget/blob/master/dist/autoload.js');
        return;
    }
    logger.setLevel(config.logLevel);
    loadWidget(config);
}
export { initWidget };
