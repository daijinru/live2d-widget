// @ts-ignore
import { fetchEventSource } from "https://esm.sh/@microsoft/fetch-event-source";
import { generateMsgId } from "./utils.js";

const getKeywordClassification = (callback, loadingCallback?) => {
  // 每秒向 loadingCallback 发送一个 .
  let interval = setInterval(() => {
    loadingCallback('.')
  }, 1000)
  setTimeout(() => {
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
        console.log('open', res)
        if (res.ok) return Promise.resolve()
      },
      onmessage: (line) => {
        if (interval) {
          clearInterval(interval)
          interval = null
        }
        try {
          if (line.event !== 'text') return
          const data = JSON.parse(line.data)
          console.log('<intent parsed>', data)
          if (data.type !== 'text') return
          const payload = data.payload
          if (payload.type !== 'text') return
          callback(payload.content)
        } catch (error) {
          console.error(error)
        }
      },
      onclose: () => {
      },
      onerror: (err) => {
        console.log('error', err)
      },
    })
  }, 1500)
}

export { getKeywordClassification }