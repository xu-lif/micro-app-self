
const fetchSource = (url) => {
  return fetch(url).then(res => {
    // console.log('res', res)
    if (res.status === 200) {
      return res.text()
    }
    return ''
  })
}

export default fetchSource