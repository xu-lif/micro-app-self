
const fetchSource = (url) => {
  return fetch(url).then(res => res.text())
}

export default fetchSource