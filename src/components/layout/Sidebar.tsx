import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  FileEdit, 
  LineChart, 
  Library, 
  Settings, 
  HelpCircle,
  LogOut
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ to, icon, label, active }: SidebarItemProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors",
        active 
          ? "bg-sidebar-accent text-white font-medium" 
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/10 hover:text-white"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar h-screen flex flex-col bg-midnight text-white">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
          <span className="text-xl font-heading font-semibold">FormFolio</span>
        </div>

        <nav className="space-y-6">
          <div>
            <h3 className="text-xs uppercase text-slate-300 font-semibold ml-3 mb-2">Main</h3>
            <SidebarItem 
              to="/" 
              icon={<LayoutDashboard className="h-5 w-5" />} 
              label="Dashboard" 
              active={isActive('/')}
            />
            <SidebarItem 
              to="/builder" 
              icon={<FileEdit className="h-5 w-5" />} 
              label="Form Builder" 
              active={isActive('/builder')}
            />
            <SidebarItem 
              to="/analytics" 
              icon={<LineChart className="h-5 w-5" />} 
              label="Analytics" 
              active={isActive('/analytics')}
            />
            <SidebarItem 
              to="/templates" 
              icon={<Library className="h-5 w-5" />} 
              label="Templates" 
              active={isActive('/templates')}
            />
          </div>
          
          <div>
            <h3 className="text-xs uppercase text-slate-300 font-semibold ml-3 mb-2">Support</h3>
            <SidebarItem 
              to="/settings" 
              icon={<Settings className="h-5 w-5" />} 
              label="Settings" 
              active={isActive('/settings')}
            />
            <SidebarItem 
              to="/help" 
              icon={<HelpCircle className="h-5 w-5" />} 
              label="Help & Support" 
              active={isActive('/help')}
            />
          </div>
        </nav>
      </div>
      
      <div className="mt-auto p-6">
        <button className="flex items-center gap-3 px-3 py-2 rounded-md w-full text-white/80 hover:text-white hover:bg-white/10 transition-colors">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;