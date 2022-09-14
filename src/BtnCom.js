const BtnCom = () => {

  const handleBtnClick = () => {
    console.log('window.ppp', window.ppp)
  }

  return (
    <button onClick={handleBtnClick}>测试按钮</button>
  )
}

export default BtnCom