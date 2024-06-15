import { Button, Input, Select, Spinner, Tabs, Textarea, useInput, useToasts } from '@geist-ui/core'
import { FC, useCallback, useState } from 'react'
import useSWR from 'swr'
import { fetchExtensionConfigs } from '../api'
import { getProviderConfigs, ProviderConfigs, ProviderType, saveProviderConfigs } from '../config'

interface ConfigProps {
  config: ProviderConfigs
  models: string[]
}

async function loadModels(): Promise<string[]> {
  const configs = await fetchExtensionConfigs()
  return configs.openai_model_names
}

const ConfigPanel: FC<ConfigProps> = ({ config, models }) => {
  const [tab, setTab] = useState<ProviderType>(config.provider)

  const { bindings: apiKeyBindingsOld } = useInput(
    config.configs[ProviderType.GPT_OLD]?.apiKey ?? '',
  )
  const [apiUrlOld, setApiUrlOld] = useState(config.configs[ProviderType.GPT_OLD]?.api_path ?? '')
  const [modelOld, setModelOld] = useState(config.configs[ProviderType.GPT_OLD]?.model ?? models[0])
  const [prefixOld, setPrefixOld] = useState(config.configs[ProviderType.GPT_OLD]?.prefix ?? '')
  const [suffixOld, setSuffixOld] = useState(config.configs[ProviderType.GPT_OLD]?.suffix ?? '')

  const { bindings: apiKeyBindingsNew } = useInput(
    config.configs[ProviderType.GPT_NEW]?.apiKey ?? '',
  )
  const [apiUrlNew, setApiUrlNew] = useState(config.configs[ProviderType.GPT_NEW]?.api_path ?? '')
  const [modelNew, setModelNew] = useState(config.configs[ProviderType.GPT_NEW]?.model ?? models[0])
  const [systemNew, setSystemNew] = useState(config.configs[ProviderType.GPT_NEW]?.system ?? '')
  const [userNew, setUserNew] = useState(config.configs[ProviderType.GPT_NEW]?.user ?? '')

  const { setToast } = useToasts()

  const save = useCallback(async () => {
    if (tab === ProviderType.GPT_OLD) {
      if (!apiKeyBindingsOld.value) {
        alert('Please enter your OpenAI API key')
        return
      }
      if (!modelOld || !models.includes(modelOld)) {
        alert('Please select a valid model')
        return
      }
    }
    await saveProviderConfigs(tab, {
      [ProviderType.GPT_OLD]: {
        model: modelOld,
        apiKey: apiKeyBindingsNew.value,
        api_path: apiUrlOld,
        prefix: prefixOld,
        suffix: suffixOld,
      },
      [ProviderType.GPT_NEW]: {
        model: modelNew,
        apiKey: apiKeyBindingsNew.value,
        api_path: apiUrlNew,
        system: systemNew,
        user: userNew,
      },
    })
    setToast({ text: 'Changes saved', type: 'success' })
  }, [
    apiKeyBindingsOld.value,
    modelOld,
    models,
    setToast,
    tab,
    apiUrlOld,
    prefixOld,
    suffixOld,
    modelNew,
    apiKeyBindingsNew.value,
    apiUrlNew,
    systemNew,
    userNew,
  ])

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={tab} onChange={(v) => setTab(v as ProviderType)}>
        <Tabs.Item label="OpenAI API LEGACY" value={ProviderType.GPT_OLD}>
          <div className="flex flex-col gap-2">
            <span>
              OpenAI official API, more stable,{' '}
              <span className="font-semibold">charge by usage</span>
            </span>
            <div className="flex flex-row gap-2">
              <Select
                scale={2 / 3}
                value={modelOld}
                onChange={(v) => setModelOld(v as string)}
                placeholder="model"
              >
                {models.map((m) => (
                  <Select.Option key={m} value={m}>
                    {m}
                  </Select.Option>
                ))}
              </Select>
              <Input htmlType="password" label="API key" scale={2 / 3} {...apiKeyBindingsOld} />
            </div>

            <div className="flex flex-col gap-2">
              <Input
                label="API url"
                onChange={(e) => setApiUrlOld(e.target.value)}
                value={apiUrlOld}
              />

              <div>Prefix</div>
              <Textarea onChange={(e) => setPrefixOld(e.target.value)} value={prefixOld} rows={6} />

              <div>Suffix</div>
              <Textarea onChange={(e) => setSuffixOld(e.target.value)} value={suffixOld} rows={6} />
            </div>
          </div>
        </Tabs.Item>

        <Tabs.Item label="OpenAI API NEW" value={ProviderType.GPT_NEW}>
          <div className="flex flex-col gap-2">
            <span>
              OpenAI official API, more stable,{' '}
              <span className="font-semibold">charge by usage</span>
            </span>
            <div className="flex flex-row gap-2">
              <Select
                scale={2 / 3}
                value={modelOld}
                onChange={(v) => setModelNew(v as string)}
                placeholder="model"
              >
                {models.map((m) => (
                  <Select.Option key={m} value={m}>
                    {m}
                  </Select.Option>
                ))}
              </Select>
              <Input htmlType="password" label="API key" scale={2 / 3} {...apiKeyBindingsNew} />
            </div>

            <div className="flex flex-col gap-2">
              <Input
                label="API url"
                onChange={(e) => setApiUrlNew(e.target.value)}
                value={apiUrlNew}
              />

              <div>System</div>
              <Textarea onChange={(e) => setSystemNew(e.target.value)} value={systemNew} rows={6} />

              <div>User</div>
              <Textarea onChange={(e) => setUserNew(e.target.value)} value={userNew} rows={6} />
            </div>
          </div>
        </Tabs.Item>
      </Tabs>
      <Button scale={2 / 3} ghost style={{ width: 20 }} type="success" onClick={save}>
        Save
      </Button>
    </div>
  )
}

function ProviderSelect() {
  const query = useSWR('provider-configs', async () => {
    const [config, models] = await Promise.all([getProviderConfigs(), loadModels()])
    return { config, models }
  })
  if (query.isLoading) {
    return <Spinner />
  }
  return <ConfigPanel config={query.data!.config} models={query.data!.models} />
}

export default ProviderSelect
