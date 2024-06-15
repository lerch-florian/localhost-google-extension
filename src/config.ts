import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

export enum TriggerMode {
  Always = 'always',
  QuestionMark = 'questionMark',
  Manually = 'manually',
}

export const TRIGGER_MODE_TEXT = {
  [TriggerMode.Always]: { title: 'Always', desc: 'ChatGPT is queried on every search' },
  [TriggerMode.QuestionMark]: {
    title: 'Question Mark',
    desc: 'When your query ends with a question mark (?)',
  },
  [TriggerMode.Manually]: {
    title: 'Manually',
    desc: 'ChatGPT is queried when you manually click a button',
  },
}

export enum Theme {
  Auto = 'auto',
  Light = 'light',
  Dark = 'dark',
}

export enum Language {
  Auto = 'auto',
  English = 'english',
  Chinese = 'chinese',
  Spanish = 'spanish',
  French = 'french',
  Korean = 'korean',
  Japanese = 'japanese',
  German = 'german',
  Portuguese = 'portuguese',
}

const userConfigWithDefaultValue = {
  triggerMode: TriggerMode.Always,
  theme: Theme.Auto,
  language: Language.Auto,
}

export type UserConfig = typeof userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
  console.debug('update configs', updates)
  return Browser.storage.local.set(updates)
}

export enum ProviderType {
  GPT_OLD = 'gptold',
  GPT_NEW = 'gptnew',
}

interface GPTOLDProviderConfig {
  model: string
  api_path: string
  apiKey: string
  prefix: string
  suffix: string
}

interface GPTNEWProviderConfig {
  model: string
  api_path: string
  apiKey: string
  system: string
  user: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.GPT_OLD]: GPTOLDProviderConfig | undefined
    [ProviderType.GPT_NEW]: GPTNEWProviderConfig | undefined
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const { provider = ProviderType.GPT_OLD } = await Browser.storage.local.get('provider')
  const configKeyOld = `provider:${ProviderType.GPT_OLD}`
  const resultOld = await Browser.storage.local.get(configKeyOld)
  const configKeyNew = `provider:${ProviderType.GPT_NEW}`
  const resultNew = await Browser.storage.local.get(configKeyNew)

  return {
    provider,
    configs: {
      [ProviderType.GPT_OLD]: resultOld[configKeyOld],
      [ProviderType.GPT_NEW]: resultNew[configKeyNew],
    },
  }
}

export async function saveProviderConfigs(
  provider: ProviderType,
  configs: ProviderConfigs['configs'],
) {
  return Browser.storage.local.set({
    provider,
    [`provider:${ProviderType.GPT_OLD}`]: configs[ProviderType.GPT_OLD],
    [`provider:${ProviderType.GPT_NEW}`]: configs[ProviderType.GPT_NEW],
  })
}
