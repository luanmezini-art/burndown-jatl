import React from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <AppProvider>
      <div className="flex flex-row h-screen w-screen bg-slate-50 text-slate-900 font-sans">
        <Sidebar />
        <Dashboard />
      </div>
    </AppProvider>
  );
}

export default App;
