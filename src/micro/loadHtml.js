import fetchSource from './utils'

const extraDomSources = (app, htmlDom) => {
  const children = Array.from(htmlDom.children)
  if (children.length) {
    children.forEach(child => {
      // 递归处理每个节点
      extraDomSources(app, child)
    })
  }
  // 处理link
  if (htmlDom instanceof HTMLLinkElement) {
    // 获取dom属性
    const href = htmlDom.getAttribute('href')
    if (href && htmlDom.getAttribute('rel') === 'stylesheet') { // 判断是一个css link
      const urlFetch = href.match(/^http/) ? href : `${app.url}${href}`
      app.sources.links[urlFetch] = {
        code: ''
      }
      htmlDom.parentNode.removeChild(htmlDom)
    }
  }
  // 处理script
  // 分为远程资源和内联script
  if (htmlDom instanceof HTMLScriptElement) {
    const src = htmlDom.getAttribute('src')
    if (src) {
      const urlFetch = src.match(/^http/) ? src : `${app.url}${src}`
      app.sources.scripts[urlFetch] = {
        code: '',
        isExternal: true
      }
      
    } else if (htmlDom.textContent) {
      const nonceStr = Math.random().toString(36).substr(2, 15)
      app.sources.scripts[nonceStr] = {
        code: htmlDom.textContent,
        isExternal: false
      }
    }
    htmlDom.parentNode.removeChild(htmlDom)
  }
}

const fetchCssSourceCode = (app, microHead, htmlDom) => {
  const promises = []
  Object.keys(app.sources.links).forEach(url => {
    promises.push(fetchSource(url))
  })
  Promise.all(promises).then(codes => {
    codes.forEach((code, index) => {
        // code存入app缓存
        app.sources.links[Object.keys(app.sources.links)[index]].code = code
        // code放入micro-head中style标签中
        const styleDom = document.createElement('style')
        styleDom.textContent = code
        microHead.appendChild(styleDom)
        // app.onLoad(htmlDom)
    })
    app.onLoad(htmlDom)
  })
}

const fetchScriptSourceCode = (app, htmlDom) => {
  const promises = []
  Object.keys(app.sources.scripts).forEach(url => {
    if (app.sources.scripts[url].isExternal) {
      promises.push(fetchSource(url))
    }
  })
  Promise.all(promises).then(codes => {
    codes.forEach((code, index) => {
      app.sources.scripts[Object.keys(app.sources.scripts)[index]].code = code
    })
    app.onLoad(htmlDom)
  })
}

const fetchSourcesCode = (app, microHead, htmlDom) => {
  fetchCssSourceCode(app, microHead, htmlDom)
  fetchScriptSourceCode(app, htmlDom)
}

export const loadHtml = (app) => {
  fetchSource(app.url).then(html => {
    html = html
    .replace(/<head[^>]*>[\s\S]*?<\/head>/i, (match) => {
      // 将head标签替换为micro-app-head，因为web页面只允许有一个head标签
      return match
        .replace(/<head/i, '<micro-app-head')
        .replace(/<\/head>/i, '</micro-app-head>')
    })
    .replace(/<body[^>]*>[\s\S]*?<\/body>/i, (match) => {
      // 将body标签替换为micro-app-body，防止与基座应用的body标签重复导致的问题。
      return match
        .replace(/<body/i, '<micro-app-body')
        .replace(/<\/body>/i, '</micro-app-body>')
    })
    // 创建dom
    const htmlDom = document.createElement('div')
    htmlDom.innerHTML = html
    // 提取出css link和script地址,后面单独fetch资源并缓存
    extraDomSources(app, htmlDom)
    console.log('app.sources', app.sources)

    // fetch css资源，获取code,放在micro-head中，以及app缓存中
    // fetch script资源,获取code存入app缓存
    const microHead = htmlDom.querySelector('micro-app-head')
    fetchSourcesCode(app, microHead, htmlDom)
    // return htmlDom
  }).catch(err => {
    console.log('获取html资源失败', err)
  })
}

