import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType } from '../config'
import { OpenAIProviderNew } from './providers/openai_new'
import { OpenAIProviderOld } from './providers/openai_old'
import { Provider } from './types'

async function generateAnswers(port: Browser.Runtime.Port, question: string) {
  const providerConfigs = await getProviderConfigs()

  let provider: Provider
  if (providerConfigs.provider === ProviderType.GPT_OLD) {
    const { apiKey, model, api_path, prefix, suffix, message_end_sign } =
      providerConfigs.configs[ProviderType.GPT_OLD]!
    provider = new OpenAIProviderOld(apiKey, model, api_path, prefix, suffix, message_end_sign)
  } else if (providerConfigs.provider === ProviderType.GPT_NEW) {
    const { apiKey, model, api_path, system } = providerConfigs.configs[ProviderType.GPT_NEW]!
    provider = new OpenAIProviderNew(apiKey, model, api_path, system)
  } else {
    throw new Error(`Unknown provider ${providerConfigs.provider}`)
  }

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    cleanup?.()
  })

  const { cleanup } = await provider.generateAnswer({
    prompt: question,
    signal: controller.signal,
    onEvent(event) {
      console.debug('onEvent', event)
      if (event.type === 'done') {
        port.postMessage({ event: 'DONE' })
        return
      }
      port.postMessage(event.data)
    },
  })
}

Browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    console.debug('received msg', msg)
    try {
      await generateAnswers(port, msg.question)
    } catch (err: any) {
      console.error(err)
      port.postMessage({ error: err.message })
    }
  })
})

Browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    Browser.runtime.openOptionsPage()
  }
})
