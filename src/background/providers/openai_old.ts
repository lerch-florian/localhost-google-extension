import { fetchSSE } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'

export class OpenAIProviderOld implements Provider {
  constructor(
    private token: string,
    private model: string,
    private api_path: string,
    private prefix: string,
    private suffix: string,
    private message_end_sign: string,
  ) {
    this.token = token
    this.model = model
    this.api_path = api_path
    this.prefix = prefix
    this.suffix = suffix
    this.message_end_sign = message_end_sign
  }

  private buildPrompt(prompt: string): string {
    return `${this.prefix} ${prompt} ${this.suffix}`
  }

  async generateAnswer(params: GenerateAnswerParams) {
    let result = ''
    const message_end_sign = this.message_end_sign

    console.debug('generateAnswer')
    await fetchSSE(this.api_path, {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt: this.buildPrompt(params.prompt),
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
          const text = data.choices[0].text
          // if (text === '<|im_end|>' || text === '<|im_sep|>') {

          if (message_end_sign !== '') {
            if (text === message_end_sign) {
              return
            }
          }
          if (data['choices'][0]['finish_reason'] === 'stop') {
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
    return {}
  }
}
