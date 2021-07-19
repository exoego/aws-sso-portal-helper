'use strict'

let StorageLocal
try {
  // eslint-disable-next-line no-undef
  StorageLocal = browser.storage.local
} catch (e) {
  // eslint-disable-next-line no-undef
  const Chrome = chrome
  StorageLocal = {
    get: (keys) => {
      return new Promise((resolve, reject) => {
        Chrome.storage.local.get(keys, (items) => {
          if (Chrome.runtime.lastError) {
            return reject(Chrome.runtime.lastError)
          }
          resolve(items)
        })
      })
    },
    set: (keyValues) => {
      return new Promise((resolve, reject) => {
        Chrome.storage.local.set(keyValues, (items) => {
          if (Chrome.runtime.lastError) {
            return reject(Chrome.runtime.lastError)
          }
          resolve(items)
        })
      })
    }
  }
}

try {
  const styleKey = 'wv3ta1_shrink'
  const style = document.createElement('style')
  // language=CSS
  style.innerHTML = `
        .${styleKey} {
            opacity: 0.35 !important;
            font-size: 12px !important;
            padding: 1px 0px 1px 8px !important
        }

        .${styleKey} .instance-block {
            display: flex;
        }

        .${styleKey} .instance-block img {
            height: 16px;
        }
    `
  document.body.appendChild(style);

  (async () => {
    const significantInstances = (await StorageLocal.get(['significantInstances']))?.significantInstances ?? {}
    const intervalId = setInterval(() => {
      if (!document.querySelectorAll('portal-application').length) {
        // Retry until app found
      } else {
        Array.from(document.querySelectorAll('portal-application')).forEach(app => {
          app.addEventListener('click', () => {
            Array.from(document.querySelectorAll('portal-instance')).forEach(instance => {
              if (significantInstances[instance.id]) {
                instance.classList.remove(styleKey)
              } else {
                instance.classList.add(styleKey)
              }
              const button = document.createElement('button')
              button.className = 'myDeleteButton'
              button.innerText = '@'
              button.style = `
                                position: absolute;
                                top: ${instance.offsetTop};
                                left: -24px;
                            `
              button.addEventListener('click', (event) => {
                event.preventDefault()
                if (significantInstances[instance.id]) {
                  instance.classList.add(styleKey)
                  delete significantInstances[instance.id]
                } else {
                  instance.classList.remove(styleKey)
                  significantInstances[instance.id] = true
                }
                StorageLocal.set({
                  significantInstances
                })
              })
              instance.parentElement.insertBefore(button, instance)
            })
          })
        })
        clearInterval(intervalId)
      }
    }, 50)
  })()
} catch (e) {
  console.error(e)
}
