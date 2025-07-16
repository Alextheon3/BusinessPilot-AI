import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CubeIcon, 
  UsersIcon, 
  MegaphoneIcon, 
  CurrencyDollarIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon,
  HomeIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Sales', href: '/sales', icon: ChartBarIcon },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon },
  { name: 'Employees', href: '/employees', icon: UsersIcon },
  { name: 'Marketing', href: '/marketing', icon: MegaphoneIcon },
  { name: 'Finance', href: '/finance', icon: CurrencyDollarIcon },
  { name: 'AI Assistant', href: '/assistant', icon: ChatBubbleLeftRightIcon },
];

const Sidebar: React.FC = () => {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 py-4 shadow-md">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-gray-900">BusinessPilot AI</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`
                      }
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;