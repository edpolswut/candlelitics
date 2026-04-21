import './App.css';
import DashboardsList from './Components/DashboardsList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <DashboardsList/>
      </header>
    </div>
  );
}

export default App;