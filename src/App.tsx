import React, {useCallback} from 'react';
import './App.scss';
import {startApp} from "./main";

function App() {
  const containerRef = useCallback((containerEl: HTMLDivElement | null) => {
      if (containerEl !== null) {
          startApp(containerEl).catch(console.error);
      }
  }, []);

  return (
    <div className="App">
      <div ref={containerRef} className="pixi-container"/>
    </div>
  );
}

export default App;
