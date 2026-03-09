import React, { useState } from 'react';
import SideBar from './Components/SideBar.jsx';
import Dashboard from './Components/Dashboard';
import Products from './Components/Products';
import Orders from './Components/Orders';
import Customers from "./Components/Customers"

const Admin = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeItem, setActiveItem] = useState('Dashboard');

  const handleNavigation = (view, itemName) => {
    setCurrentView(view);
    setActiveItem(itemName);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'orders':
        return <Orders/>;
      case 'customers':
        return <Customers/>;
      case 'inventory':
        return <div className="p-6"><h1 className="text-2xl font-bold">Inventory Management - Coming Soon</h1></div>;
      case 'analytics':
        return <div className="p-6"><h1 className="text-2xl font-bold">Analytics Dashboard - Coming Soon</h1></div>;
      case 'settings':
        return <div className="p-6"><h1 className="text-2xl font-bold">Settings Panel - Coming Soon</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar 
        activeItem={activeItem} 
        onNavigation={handleNavigation} 
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;