import { fetchEventSource } from "https://esm.sh/@microsoft/fetch-event-source";
import { generateMsgId } from "./utils.js";
import { getLocalStorage, setLocalStorage } from "./utils.js";
const getKeywordClassification = (callback, loadingCallback) => {
    const cache = getLocalStorage('keyword_classification');
    if (cache) {
        callback(cache);
        return;
    }
    let interval = setInterval(() => {
        loadingCallback('.');
    }, 1000);
    let out = '';
    fetchEventSource('http://localhost:8080/task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: generateMsgId(),
            text: '[keyword_classification]',
        }),
        onopen: (res) => {
            console.log('open', res);
            if (res.ok)
                return Promise.resolve();
        },
        onmessage: (line) => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            try {
                const parsed = JSON.parse(line.data);
                const payload = parsed.payload;
                if (payload.type !== 'text')
                    return;
                out += payload.payload.content;
                callback(payload.payload.content);
            }
            catch (error) {
                console.error(error);
            }
        },
        onclose: () => {
            setLocalStorage('keyword_classification', out, 60 * 60 * 12);
        },
        onerror: (err) => {
            console.log('error', err);
        },
    });
};
export { getKeywordClassification };
