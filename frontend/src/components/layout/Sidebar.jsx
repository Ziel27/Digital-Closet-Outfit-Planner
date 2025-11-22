import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { FiLogOut, FiHome, FiPackage, FiGrid, FiCalendar, FiMenu, FiX, FiSettings, FiHelpCircle } from 'react-icons/fi';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Notifications from '../Notifications';

const Sidebar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/closet', icon: FiPackage, label: 'Closet' },
    { path: '/outfits', icon: FiGrid, label: 'Outfits' },
    { path: '/calendar', icon: FiCalendar, label: 'Calendar' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = ({ onClose }) => (
    <div className="flex flex-col h-full bg-card border-r dark:border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-border">
        <Link to="/dashboard" className="flex items-center space-x-2" onClick={onClose}>
          <FiPackage className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Closet</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onClose}
        >
          <FiX className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} onClick={onClose} className="block">
              <Button
                variant={active ? 'secondary' : 'ghost'}
                className={`w-full justify-start h-10 px-4 ${active ? 'bg-secondary' : ''}`}
              >
                <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </Button>
            </Link>
          );
        })}

        {/* Notifications */}
        <Notifications onClose={onClose} />

        {/* Help */}
        <Link to="/help" onClick={onClose} className="block">
          <Button
            variant={isActive('/help') ? 'secondary' : 'ghost'}
            className={`w-full justify-start h-10 px-4 ${isActive('/help') ? 'bg-secondary' : ''}`}
          >
            <FiHelpCircle className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="flex-1 text-left">Help</span>
          </Button>
        </Link>

        {/* Settings */}
        <Link to="/settings" onClick={onClose} className="block">
          <Button
            variant={isActive('/settings') ? 'secondary' : 'ghost'}
            className={`w-full justify-start h-10 px-4 ${isActive('/settings') ? 'bg-secondary' : ''}`}
          >
            <FiSettings className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="flex-1 text-left">Settings</span>
          </Button>
        </Link>
      </nav>

      {/* User Profile Section */}
      <div className="border-t dark:border-border p-4 space-y-2">
        <div className="flex items-center space-x-3 px-2 py-2">
          {user?.avatar ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">{user?.name?.charAt(0)}</span>
            </div>
          )}
          <span className="text-sm font-medium flex-1">{user?.name}</span>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start h-10 px-4"
          onClick={handleLogout}
        >
          <FiLogOut className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="flex-1 text-left">Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50 bg-card border shadow-sm h-10 w-10 p-0"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-40">
        <SidebarContent onClose={() => {}} />
      </aside>
    </>
  );
};

export default Sidebar;

