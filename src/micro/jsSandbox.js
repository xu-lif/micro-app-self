/**
 * 创建一个沙箱，
 * 为什么需要js沙箱？
 *   -- 基座应用和微应用都是两个公用同一个window对象，在子应用中修改window属性会覆盖影响基座应用中的window对象属性
 *   -- 时间监听的问题，当子应用卸载之后，我们需要去解绑子应用中监听的事件，不然的话会出问题，
 *      但是要解除绑定的话，我们需要暂存子应用中绑定至事件的回调函数，这种在卸载的时候才能解绑
 * 
 * 返回一个porxy对象
 * 将proxy对象注入至执行微应用的执行环境中，用于替换window
 */
const nativeAddEventListender = window.addEventListender
const nativeRemoveEventListener = window.removeEventListener



const effect = (sanboxWindow) => {
  const listenerMap = new Map() // {key: type, value: listener[]}
  sanboxWindow.addEventListender = (type, listener, options) => {
    if (listenerMap.has(type)) {
      listenerMap.get(type).add(listener)
    } else {
      listenerMap.set(type, new Set([listener]))
    }
    return nativeAddEventListender.call(window, type, listener, options)
  }

  sanboxWindow.removeEventListener = (type, listener) => {
    if (listenerMap.has(type)) {
      listenerMap.get(type).delete(listener)
    }
    return nativeRemoveEventListener.call(window, type, listener)
  }
  return () => { // 清除listenerMap中的所有绑定的事件回调
    if (listenerMap.size) {
      listenerMap.forEach((listenerList, type) => {
        if (listenerList.size) {
          listenerList.forEach(listener => {
            nativeRemoveEventListener.call(window, type, listener)
          })
        }
      })
    }
    listenerMap.clear()
  }
}

class JsSandbox {
  constructor() {
    this.active = false
    // 存储的是当前沙箱中定义的全局属性变量
    this.sanboxWindow = {}
    // 存储的是当前沙箱中定义的全局属性变量的key，用于沙箱关闭后的情况给你操作
    this.cacheKey = new Set()
    this.disposeEffect = effect(this.sanboxWindow)
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
      // 卸载绑定的事件
      this.disposeEffect()
    }
  }

  bindCodeExec = (code) => {
    console.log('this.proxyWindow', this.proxyWindow)
    window.proxyWindow = this.proxyWindow
    return `;(function(window, self){with(window){;${code}\n}}).call(window.proxyWindow, window.proxyWindow, window.proxyWindow);`;
  }
}

export default JsSandbox