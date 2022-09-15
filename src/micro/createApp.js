/**
 * 创建应用app
 *  -- 初始化app: name, url, container
 */
import { loadHtml } from './loadHtml'
import JsSandbox from './jsSandbox'


class CreateApp {
  constructor({
    name,
    url,
    container
  }) {
    this.name = name
    this.url = url
    this.container = container
    this.sanboxJs = new JsSandbox()
    // fetch url html
    loadHtml(this)
  }
  sources = {
    links: {},
    scripts: {}
  }
  // 资源加载完成
  onLoad(htmlDom) {

    this.loadCount = this.loadCount ? this.loadCount + 1 : 1
    console.log('this.loadCount', this.loadCount)
    if (this.loadCount === 2 && htmlDom) {
      this.sources.html = htmlDom
      
      this.onMount()
    }
  }

  // 执行js入口
  onMount() {
    // 克隆dom对象
    const cloneElement = this.sources.html.cloneNode(true)
    const frameElement = document.createDocumentFragment()
    Array.from(cloneElement.childNodes).forEach(node => {
      frameElement.appendChild(node)
    })
    this.container.appendChild(frameElement)
    this.sanboxJs.start()
    Object.values(this.sources.scripts).forEach(script => {
      // console.log('scripts', script)
      (0, eval)(this.sanboxJs.bindCodeExec(script.code))
    })
  }

  onUnMount() {
    this.sanboxJs.stop()
  }
}

export const appInstanceMap = new Map()

export default CreateApp