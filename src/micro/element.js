import CreateApp, { appInstanceMap } from './createApp'

class Element extends HTMLElement {
  constructor() {
    super()
  }

  // 定义element可以触发connectedCallback的属性
  static get observedAttributes () {
    return ['name', 'url']
  }
  // 加载完成时触发，创建app
  connectedCallback() {
    // console.log('加载完成时触发，创建app')
    const app = new CreateApp({
      name: this.name,
      url: this.url,
      container: this
    })
    appInstanceMap.set(this.name, app)
  }

  // 卸载时触发, 卸载app
  disConnectedCallback() {
    console.log('卸载时触发, 卸载app')
    appInstanceMap.delete(this.name)
  }

  // element属性变化时触发
  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName === 'name' && !this.name && newValue) {
      this.name = newValue
    }
    if (attrName === 'url' && !this.url && newValue) {
      this.url = newValue
    }
  }
}

export default Element