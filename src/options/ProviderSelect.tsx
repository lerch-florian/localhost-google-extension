import { Button, Input, Spinner, Tabs, Textarea, useInput, useToasts } from '@geist-ui/core'
import { FC, useCallback, useState } from 'react'
import useSWR from 'swr'
import { getProviderConfigs, ProviderConfigs, ProviderType, saveProviderConfigs } from '../config'

interface ConfigProps {
  config: ProviderConfigs
}

const ConfigPanel: FC<ConfigProps> = ({ config }) => {
  const [tab, setTab] = useState<ProviderType>(config.provider)

  const { bindings: apiKeyBindingsOld } = useInput(
    config.configs[ProviderType.GPT_OLD]?.apiKey ?? '',
  )
  const [apiUrlOld, setApiUrlOld] = useState(config.configs[ProviderType.GPT_OLD]?.api_path ?? '')
  const [modelOld, setModelOld] = useState(config.configs[ProviderType.GPT_OLD]?.model ?? '')
  const [prefixOld, setPrefixOld] = useState(config.configs[ProviderType.GPT_OLD]?.prefix ?? '')
  const [suffixOld, setSuffixOld] = useState(config.configs[ProviderType.GPT_OLD]?.suffix ?? '')

  const { bindings: apiKeyBindingsNew } = useInput(
    config.configs[ProviderType.GPT_NEW]?.apiKey ?? '',
  )
  const [apiUrlNew, setApiUrlNew] = useState(config.configs[ProviderType.GPT_NEW]?.api_path ?? '')
  const [modelNew, setModelNew] = useState(config.configs[ProviderType.GPT_NEW]?.model ?? '')
  const [systemNew, setSystemNew] = useState(config.configs[ProviderType.GPT_NEW]?.system ?? '')

  const { setToast } = useToasts()

  const save = useCallback(async () => {
    if (tab === ProviderType.GPT_OLD) {
      if (!apiKeyBindingsOld.value) {
        alert('Please enter your OpenAI API key')
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
      },
    })
    setToast({ text: 'Changes saved', type: 'success' })
  }, [
    apiKeyBindingsOld.value,
    modelOld,
    setToast,
    tab,
    apiUrlOld,
    prefixOld,
    suffixOld,
    modelNew,
    apiKeyBindingsNew.value,
    apiUrlNew,
    systemNew,
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
              <Input
                label="Model Name"
                value={modelOld}
                onChange={(e) => setModelOld(e.target.value)}
              />

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
              <Input
                label="Model Name"
                value={modelNew}
                onChange={(e) => setModelNew(e.target.value)}
              />

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
    const [config] = await Promise.all([getProviderConfigs()])
    return { config }
  })
  if (query.isLoading) {
    return <Spinner />
  }
  return <ConfigPanel config={query.data!.config} />
}

export default ProviderSelect
