import { fa_comment, fa_camera_retro } from './icons.js';
class ToolsManager {
    constructor(model, config, tips) {
        this.config = config;
        this.tools = {
            hitokoto: {
                icon: fa_comment,
                callback: async () => {
                }
            },
            photo: {
                icon: fa_camera_retro,
                callback: () => {
                }
            },
        };
    }
    registerTools() {
        var _a, _b;
        const tools = Object.entries(this.tools);
        for (const [name, value] of tools) {
            const { icon, callback } = value;
            const element = document.createElement('span');
            element.id = `waifu-tool-${name}`;
            element.innerHTML = icon;
            const shadowRoot = (_a = document.getElementById('WENKO__CONTAINER-ROOT')) === null || _a === void 0 ? void 0 : _a.shadowRoot;
            (_b = shadowRoot
                .getElementById('waifu-tool')) === null || _b === void 0 ? void 0 : _b.insertAdjacentElement('beforeend', element);
            element.addEventListener('click', callback);
        }
    }
}
export { ToolsManager };
