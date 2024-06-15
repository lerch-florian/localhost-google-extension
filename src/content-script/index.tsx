import { render } from 'preact'
import '../base.css'
import { getUserConfig, Language, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import { config, SearchEngine } from './search-engine-configs'
import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'

async function mount(question: string, siteConfig: SearchEngine) {
  console.debug('Chatgpt: Running the Mounting', siteConfig)
  const container = document.createElement('div')
  container.className = 'chat-gpt-container'

  const userConfig = await getUserConfig()
  console.debug('Chatgpt: userConfig', userConfig)

  let theme: Theme
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }
  if (theme === Theme.Dark) {
    container.classList.add('gpt-dark')
  } else {
    container.classList.add('gpt-light')
  }

  console.debug('Chatgpt: creating sidebar container')

  const siderbarContainer = getPossibleElementByQuerySelector(siteConfig.sidebarContainerQuery)
  if (siderbarContainer) {
    siderbarContainer.prepend(container)
  } else {
    container.classList.add('sidebar-free')
    const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
    if (appendContainer) {
      appendContainer.appendChild(container)
    }
  }

  console.debug('Chatgpt: rendering ChatGPTContainer')

  render(
    <ChatGPTContainer question={question} triggerMode={userConfig.triggerMode || 'always'} />,
    container,
  )
}

const siteRegex = new RegExp(Object.keys(config).join('|'))
const siteName = location.hostname.match(siteRegex)![0]
const siteConfig = config[siteName]

async function run() {
  console.debug('Chatgpt: Running the Run', siteConfig)
  let searchInput = getPossibleElementByQuerySelector<HTMLInputElement>(siteConfig.inputQuery)

  function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }

  // try to find the searchInput element multiple times
  let counter = 0
  while (!searchInput) {
    console.debug('Chatgpt: searchInput not yet found. Trying again')
    await sleep(100)
    searchInput = getPossibleElementByQuerySelector<HTMLInputElement>(siteConfig.inputQuery)

    counter++
    if (counter > 10) {
      console.debug('Chatgpt: searchInput not found after 10 tries')
      break
    }
  }

  console.debug('Chatgpt: searchInput', searchInput)

  if (searchInput && searchInput.value) {
    console.debug('Mount ChatGPT on', siteName)
    const userConfig = await getUserConfig()
    const searchValueWithLanguageOption =
      userConfig.language === Language.Auto
        ? searchInput.value
        : `${searchInput.value}(in ${userConfig.language})`
    mount(searchValueWithLanguageOption, siteConfig)
  }
}

run()

if (siteConfig.watchRouteChange) {
  siteConfig.watchRouteChange(run)
}
