import { fetchEventSource } from "https://esm.sh/@microsoft/fetch-event-source";
import { generateMsgId } from "./utils.js";
export const getKanbanDaily = (text, callback, loadingCallback, doneCallback) => {
    let interval = setInterval(() => {
        loadingCallback && loadingCallback('.');
    }, 1000);
    let out = '';
    setTimeout(() => {
        fetchEventSource('http://localhost:8080/task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: generateMsgId(),
                text,
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
                    if (line.event !== 'text')
                        return;
                    const data = JSON.parse(line.data);
                    if (data.type !== 'text')
                        return;
                    const payload = data.payload;
                    if (payload.type !== 'text')
                        return;
                    out += payload.content;
                    callback(payload.content);
                }
                catch (error) {
                    console.error(error);
                }
            },
            onclose: () => {
                doneCallback && doneCallback();
            },
            onerror: (err) => {
                console.log('error', err);
            },
        });
    }, 1500);
};
export const getWeightedTexts = (text) => {
    return [
        { Text: text, Weight: 0.6 },
        { Text: document.title, Weight: 0.2 },
        { Text: location.href, Weight: 0.1 },
        { Text: new Date().getTime().toString(), Weight: 0.1 },
    ];
};
export const getSearch = (text, callback, loadingCallback) => {
    let interval = setInterval(() => {
        loadingCallback && loadingCallback('.');
    }, 1000);
    const weightedTexts = getWeightedTexts(text);
    fetch("http://localhost:8080/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            texts: weightedTexts,
        }),
    })
        .then((res) => res.json())
        .then((data) => {
        interval && clearInterval(interval);
        callback(data);
    })
        .catch(err => {
        console.error('❌ 搜索失败', err);
        interval && clearInterval(interval);
        callback('😂 Search error');
    });
};
export const saveText = (text, callback, loadingCallback) => {
    let interval = setInterval(() => {
        loadingCallback && loadingCallback('.');
    }, 1000);
    const weightedTexts = getWeightedTexts(text);
    fetch("http://localhost:8080/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            texts: weightedTexts,
        }),
    })
        .then((res) => res.json())
        .then((res) => {
        interval && clearInterval(interval);
        if (res.id) {
            const text = `😊 Generated [id ${res.id}]`;
            callback(text);
        }
        else {
            callback('😂 Save Text failed');
        }
    })
        .catch(err => {
        console.error('❌ 生成向量失败', err);
        interval && clearInterval(interval);
        callback('😂 Save Text error');
    });
};
