import React, { useState } from 'react';
import OrderForm from './components/OrderForm';
import Tracking from './components/Tracking';
import Dashboard from './components/Dashboard';
import HackathonDemo from './components/HackathonDemo';
import './App.css';
import './HackathonDemo.css';

function App() {
  const [activeTab, setActiveTab] = useState('order');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚚 Smart Logistics AI Agent</h1>
        <nav>
          <button 
            className={activeTab === 'order' ? 'active' : ''}
            onClick={() => setActiveTab('order')}
          >
            📦 Create Order
          </button>
          <button 
            className={activeTab === 'tracking' ? 'active' : ''}
            onClick={() => setActiveTab('tracking')}
          >
            📍 Track Order
          </button>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'demo' ? 'active' : ''}
            onClick={() => setActiveTab('demo')}
          >
            🏆 Hackathon Demo
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === 'order' && <OrderForm />}
        {activeTab === 'tracking' && <Tracking />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'demo' && <HackathonDemo />}
      </main>
    </div>
  );
}

export default App;