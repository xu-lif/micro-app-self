/**
 * window.customElement.define('name', constructor) -- 定义了
 * 监听自定义的element的加载和attr变化方法，
 * 触发create micro-app
 * app对象:
 *  属性:
 *    name,
 *    url,
 *    source(包含了所有的静态资源css和js),
 *    container(customElement对象，用户字应用的挂载)
 *  方法:
 *    loadHtml(fetch html并处理收集css和js资源)
 *    mount(所有资源加载完成之后，js执行，正式开始挂载子应用)
 */
import Element from './element'

//  export default microApp

const simpleMicroApp = {
  start () {
    return window.customElements.define('micro-app', Element)
  },
}
export default simpleMicroApp