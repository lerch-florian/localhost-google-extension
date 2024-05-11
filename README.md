
## Modifications
- changed for a locally hosted (openai style) model
- allows for changing the scripts before and after the search prompt in the LLM request

## Example Llama V3
``` sh
# api key
placeholder

# API url
http://localhost:1234/v1/completions

# prefix
<|start_header_id|>system<|end_header_id|>Try to provide a concise answer to the users search query<|eot_id|>
<|start_header_id|>user<|end_header_id|>

# suffix
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
```


# ChatGPT for Google Original

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/wong2/chatgpt-google-extension/pre-release-build.yml)
[![Twitter Follow](https://img.shields.io/twitter/follow/chatgpt4google?style=social)](https://twitter.com/chatgpt4google)
![License](https://img.shields.io/github/license/wong2/chatgpt-google-extension)

## Supported Search Engines

Google, Baidu, Bing, DuckDuckGo, Brave, Yahoo, Naver, Yandex, Kagi, Searx

## Screenshot

![Screenshot](screenshots/extension.png?raw=true)

## Features

- Supports all popular search engines
- Supports the official OpenAI API
- Supports ChatGPT Plus
- Markdown rendering
- Code highlights
- Dark mode
- Provide feedback to improve ChatGPT
- Copy to clipboard
- Custom trigger mode
- Switch languages

## Troubleshooting

### How to make it work in Brave

![Screenshot](screenshots/brave.png?raw=true)

Disable "Prevent sites from fingerprinting me based on my language preferences" in `brave://settings/shields`

### How to make it work in Opera

![Screenshot](screenshots/opera.png?raw=true)

Enable "Allow access to search page results" in the extension management page

## Build from source

1. Clone the repo
2. Install dependencies with `npm`
3. `npm run build`
4. Load `build/chromium/` or `build/firefox/` directory to your browser

To run the firefox plugin in a normal release firefox version, it has to be signed by mozilla (can be done for private extensions as well): 
https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/#signing-your-addons
## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=wong2/chatgpt-google-extension&type=Date)](https://star-history.com/#wong2/chatgpt-google-extension&Date)

