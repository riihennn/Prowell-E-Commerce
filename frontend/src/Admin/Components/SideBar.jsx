import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "../../assets/prowellBlue.png";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const SideBar = ({ activeItem, onNavigation }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const  Navigate  = useNavigate()

  const menuItems = [
    { id: 1, name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
    { id: 2, name: 'Products', icon: Package, view: 'products' },
    { id: 3, name: 'Orders', icon: ShoppingCart, view: 'orders' },
    { id: 4, name: 'Customers', icon: Users, view: 'customers' },
  ];

  const secondaryItems = [
    { id: 9, name: 'Exit', icon: LogOut, view: 'Exit' },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (itemName, view) => {
    onNavigation(view, itemName);
  };


  return (
    <div className={`bg-white text-gray-800 h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col border-r border-gray-200`}>
      {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex flex-col items-center">
              <img
                src={Logo}
                alt="Brand Logo"
                className="h-12 w-auto object-contain" // adjust h-12 for size
              />
              <span className="text-lg text-gray-700 hover:text-gray-900">
                Admin Panel
              </span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.name;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.name, item.view)}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#2eb4ac] text-white shadow-md' 
                  : 'hover:bg-gray-100 text-gray-700'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <IconComponent size={20} className={isActive ? 'text-white' : 'text-[#2eb4ac]'} />
              {!isCollapsed && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Secondary Items */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {secondaryItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.name;
          
          return (
            <button
              key={item.id}
              onClick={()=>Navigate("/")}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-[#2eb4ac] text-white shadow-md' 
                  : 'hover:bg-gray-100 text-gray-700'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <IconComponent size={20} className={isActive ? 'text-white' : 'text-[#2eb4ac]'} />
              {!isCollapsed && (
                <span className="ml-3 font-medium">{item.name}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#2eb4ac] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Admin User</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;