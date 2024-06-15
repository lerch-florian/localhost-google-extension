import { fetchSSE } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'

export class OpenAIProviderNew implements Provider {
  constructor(
    private token: string,
    private model: string,
    private api_path: string,
    private system: string,
  ) {
    this.token = token
    this.model = model
    this.api_path = api_path
    this.system = system
  }

  async generateAnswer(params: GenerateAnswerParams) {
    let result = ''

    await fetchSSE(this.api_path, {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: this.system },
          { role: 'user', content: params.prompt },
        ],
        stream: true,
        max_tokens: 2048,
      }),
      onMessage(message) {
        console.debug('sse message', message)
        if (message === '[DONE]') {
          params.onEvent({ type: 'done' })
          return
        }
        let data
        try {
          data = JSON.parse(message)
          console.debug('parsed data', data)
          const text = data.choices[0].delta.content
          // if (text === '<|im_end|>' || text === '<|im_sep|>') {
          if (data.choices[0].finish_reason === 'stop') {
            return
          }
          result += text
          params.onEvent({
            type: 'answer',
            data: {
              text: result,
              messageId: data.id,
              conversationId: data.id,
            },
          })
        } catch (err) {
          console.error(err)
          return
        }
      },
    })
    console.log('fetchSSE done')
    return {}
  }
}
