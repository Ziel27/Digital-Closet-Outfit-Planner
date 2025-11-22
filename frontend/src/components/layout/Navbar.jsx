import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { FiLogOut, FiHome, FiPackage, FiGrid, FiCalendar, FiMenu, FiX, FiSettings, FiHelpCircle } from 'react-icons/fi';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Notifications from '../Notifications';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
            <FiPackage className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold hidden sm:inline">Digital Closet</span>
            <span className="text-lg font-bold sm:hidden">Closet</span>
          </Link>

          {isAuthenticated && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="hidden lg:flex">
                  <FiHome className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <FiHome className="h-4 w-4" />
                </Button>
              </Link>
                <Link to="/closet">
                  <Button variant="ghost" size="sm" className="hidden lg:flex">
                    <FiPackage className="h-4 w-4 mr-2" />
                    Closet
                  </Button>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <FiPackage className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/outfits">
                  <Button variant="ghost" size="sm" className="hidden lg:flex">
                    <FiGrid className="h-4 w-4 mr-2" />
                    Outfits
                  </Button>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <FiGrid className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/calendar">
                  <Button variant="ghost" size="sm" className="hidden lg:flex">
                    <FiCalendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <FiCalendar className="h-4 w-4" />
                  </Button>
                </Link>
                
                <div className="flex items-center space-x-2 ml-2">
                  <Notifications />
                  <Link to="/help">
                    <Button variant="ghost" size="sm" className="hidden lg:flex">
                      <FiHelpCircle className="h-4 w-4 mr-2" />
                      Help
                    </Button>
                    <Button variant="ghost" size="sm" className="lg:hidden">
                      <FiHelpCircle className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button variant="ghost" size="sm" className="hidden lg:flex">
                      <FiSettings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="ghost" size="sm" className="lg:hidden">
                      <FiSettings className="h-4 w-4" />
                    </Button>
                  </Link>
                  {user?.avatar && (
                    <Avatar className="h-8 w-8 rounded-full hidden sm:block">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <span className="text-sm hidden lg:inline">{user?.name}</span>
                </div>
                
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden lg:flex">
                  <FiLogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="lg:hidden">
                  <FiLogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FiHome className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/closet" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FiPackage className="h-4 w-4 mr-2" />
                Closet
              </Button>
            </Link>
            <Link to="/outfits" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FiGrid className="h-4 w-4 mr-2" />
                Outfits
              </Button>
            </Link>
            <Link to="/calendar" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FiCalendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </Link>
            <div className="px-4 relative">
              <Notifications mobile={true} />
            </div>
            <Link to="/help" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FiHelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <FiSettings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <div className="flex items-center space-x-2 px-4 py-2 border-t mt-2">
              {user?.avatar && (
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <span className="text-sm flex-1">{user?.name}</span>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <FiLogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

