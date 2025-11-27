function filterResources(url) {
  const targetUrls = ['komiinform.ru', 'pg11.ru', 'komionline.ru', 'bnkomi.ru', 'rutube.ru', 'emily-in-paris.ru', 'mail.yandex.ru']

  if (targetUrls.some(target => url.includes(target))) {
    fetch(chrome.runtime.getURL("blacklist.json"))
      .then(res => res.json())
      .then(data => {
        const rules = data.domains.map((domain, index) => ({
          id: index + 1,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: `${domain}`
          }
        }))

        const resourcesRules = data.resources.map((resource, index) => ({
          id: index + 1001,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: resource
          }
        }))

        rules.push(...resourcesRules)

        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: rules.map(r => r.id),
          addRules: rules
        })
      })
  }
}

function touchStyles(url, tabId) {
  let css = ''

  if (url.includes('komiinform.ru')) {
      css += '#header, .left-adv, .mainContent .text-right + p, .top-adv-white, .media { display: none !important } body .cookies-container { z-index: 9 }'
  } else if (url.includes('pg11.ru')) {
    css += '#__next > div + div > div:is(:first-child), #footer + div, .contentRightStretchBanner140, .contentRightMainBanner { display: none }'
  } else if (url.includes('komionline.ru')) {
    css += '.adv-side-left, .adv-side-right, .adv, .adv-row, .sape-links, #slinksBlock { display: none }'
  } else if (url.includes('mail.yandex.ru')) {
    css += '[data-testid="page-layout_right-column_container"], [data-testid="content-header_container"] > div:nth-child(3), [data-testid="page-layout_right-column_loading-indicator"] { display: none }'
  } else if (url.includes('bnkomi.ru')) {
    css += '.modBanners { display: none }'
  }

  chrome.scripting.insertCSS({
    target: { tabId },
    css: css,
  })
}

chrome.webNavigation.onCommitted.addListener(
  async function(_) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const url = tab?.url ?? ''

      filterResources(url)
      touchStyles(url, tab.id)
    } catch (err) {
      console.error(err)
    }
  }
)
