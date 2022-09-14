import { useState, useEffect } from 'react'
import logo from './logo.svg';
import './App.css';
import simpleMicroApp from './micro/index'
import BtnCom from './BtnCom'
window.dataVal = '测试的window data = base app'

simpleMicroApp.start()

function App() {
  const [isShow, setIsShow] = useState(false)
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <BtnCom/>
        <button onClick={() => {
          setIsShow(oldVal => !oldVal)
        }}>加载子应用</button>
        {
        isShow && <micro-app style={{
          width: '200px',
          height: '300px',
          background: 'blue',
          border: '2px solid gray',
          overflow: 'auto'
        }} name="app" url="http://localhost:3000">12</micro-app>
        }
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
