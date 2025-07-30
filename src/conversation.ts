// @ts-ignore
import { fetchEventSource } from "https://esm.sh/@microsoft/fetch-event-source";
import { generateMsgId } from "./utils.js";
import { getLocalStorage, setLocalStorage } from "./utils.js";

export const getKeywordClassification = (text, callback, loadingCallback?) => {
  // const cache = getLocalStorage('keyword_classification')
  // if (cache) {
  //   callback(cache)
  //   return
  // }

  // 每秒向 loadingCallback 发送一个 .
  let interval = setInterval(() => {
    loadingCallback('.')
  }, 1000)

  let out = ''

  setTimeout(() => {
    fetchEventSource('http://localhost:8080/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: generateMsgId(),
        text: '[keyword_classification]' + text,
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
          // console.log('<intent parsed>', data)
          if (data.type !== 'text') return
          const payload = data.payload
          if (payload.type !== 'text') return
          out += payload.content
          callback(payload.content)
        } catch (error) {
          console.error(error)
        }
      },
      onclose: () => {
        setLocalStorage('keyword_classification', out, 60 * 60 * 12)
      },
      onerror: (err) => {
        console.log('error', err)
      },
    })
  }, 1500)
}

export type WeightedText = {
	Text: string
	Weight: number
}
export const getWeightedTexts = (text) => {
  return [
    {Text: text, Weight: 0.6},
    {Text: document.title, Weight: 0.2},
    {Text: location.href, Weight: 0.1},
    // 时间戳精确到毫秒
    {Text: new Date().getTime().toString(), Weight: 0.1},
  ]
}
export const getSearch = (text, callback, loadingCallback) => {
  let interval = setInterval(() => {
    loadingCallback('.')
  }, 1000)
  const weightedTexts = getWeightedTexts(text)
  fetchEventSource('http://localhost:8080/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      texts: weightedTexts,
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
        // console.log('<intent parsed>', data)
        if (data.type !== 'text') return
        const payload = data.payload
        if (payload.type !== 'text') return
        callback(payload.content)
      } catch (error) {
        console.error(error)
      }
    },
    onclose: () => {
      console.log('close')
    },
    onerror: (err) => {
      console.log('error', err)
    },
  })
}

export const saveText = (text, callback, loadingCallback) => {
  let interval = setInterval(() => {
    loadingCallback('.')
  }, 1000)
  const weightedTexts = getWeightedTexts(text)
  fetchEventSource('http://localhost:8080/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      texts: weightedTexts,
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
        // console.log('<intent parsed>', data)
        if (data.type !== 'text') return
        const payload = data.payload
        if (payload.type !== 'text') return
        callback(payload.content)
      } catch (error) {
        console.error(error)
      }
    },
    onclose: () => {
      console.info('save success')
    },
    onerror: (err) => {
      console.log('error', err)
    },
  })
}
