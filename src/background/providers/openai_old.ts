import { fetchSSE } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'

export class OpenAIProviderOld implements Provider {
  constructor(
    private token: string,
    private model: string,
    private api_path: string,
    private prefix: string,
    private suffix: string,
  ) {
    this.token = token
    this.model = model
    this.api_path = api_path
    this.prefix = prefix
    this.suffix = suffix
  }

  private buildPrompt(prompt: string): string {
    // if (this.model.startsWith('text-chat-davinci')) {

    return `${this.prefix} ${prompt} ${this.suffix}`

    return `<|start_header_id|>user<|end_header_id|>
        ${prompt} <|eot_id|>
      <|start_header_id|>assistant<|end_header_id|>`

    return `<|start_header_id|>system<|end_header_id|>
        Respond conversationally. <|eot_id|>
      <|start_header_id|>user<|end_header_id|>
        ${prompt} <|eot_id|>
      <|start_header_id|>assistant<|end_header_id|>`

    // }
    return prompt
  }

  async generateAnswer(params: GenerateAnswerParams) {
    let result = ''
    // await fetchSSE('https://api.openai.com/v1/completions', {
    // await fetchSSE('http://localhost:1234/v1/completions', {
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
          if (text === '<|eot_id|>') {
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
