/**
 * 创建一个沙箱，
 * 为什么需要js沙箱？
 *   -- 基座应用和微应用都是两个公用同一个window对象，在子应用中修改window属性会覆盖影响基座应用中的window对象属性
 * 
 * 返回一个porxy对象
 * 将proxy对象注入至执行微应用的执行环境中，用于替换window
 */

class JsSandbox {
  constructor() {
    this.active = false
    this.sanboxWindow = {}
    this.cacheKey = new Set()
    this.proxyWindow = new Proxy(this.sanboxWindow, {
      get: (target, key) => {
        if (Reflect.has(target, key)) { // 如果子应用的sandboxWindow中存在则取值，否则前往window中取值
          return Reflect.get(target, key)
        }
        // 否则兜底到window对象上取值
        const rawValue = Reflect.get(window, key)

        // 如果兜底的值为函数，则需要绑定window对象，如：console、alert等
        if (typeof rawValue === 'function') {
          const valueStr = rawValue.toString()
          // 排除构造函数
          if (!/^function\s+[A-Z]/.test(valueStr) && !/^class\s+/.test(valueStr)) {
            return rawValue.bind(window)
          }
        }

        // 其它情况直接返回
        return rawValue
      },
      set: (target, key, value) => {
        if (this.active) {
          Reflect.set(target, key, value)
          this.cacheKey.add(key)
        }
        return true
      }
    })
  }

  start = () => {
    this.active = true
  }

  stop = () => {
    if (this.active) {
      this.active = false
      this.cacheKey.forEach(key => {
        Reflect.deleteProperty(this.sanboxWindow, key)
      })
      this.cacheKey.clear()
    }
  }

  bindCodeExec = (code) => {
    console.log('this.proxyWindow', this.proxyWindow)
    window.proxyWindow = this.proxyWindow
    const bindCode = `;(function(window, self){with(window){;${code}\n}}).call(window.proxyWindow, window.proxyWindow, window.proxyWindow);`;
    (0, eval)(bindCode)
  }
}

export default JsSandbox