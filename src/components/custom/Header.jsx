import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useUser } from '@/context/UserContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles, 
  Zap,
  FileText,
  Users,
  Crown,
  ArrowRight,
  Home,
  Layout,
  User,
  Settings,
  MessageSquare
} from 'lucide-react';

function Header() {
  const { user, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { scrollY } = useScroll();

  // Transform scroll to background opacity
  const backgroundOpacity = useTransform(scrollY, [0, 50], [0.8, 0.95]);
  const borderOpacity = useTransform(scrollY, [0, 50], [0.2, 0.4]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      if (e.key === 'Escape' && showUserMenu) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, showUserMenu]);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: location.pathname === '/'
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Layout,
      current: location.pathname.includes('/dashboard'),
      protected: true
    },
    {
      name: 'Templates',
      href: '/create/templates',
      icon: FileText,
      current: location.pathname.includes('/create')
    },
    {
      name: 'Contact',
      href: '/contact',
      icon: MessageSquare,
      current: location.pathname === '/contact'
    }
  ];

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: {
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const dropdownVariants = {
    closed: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 }
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      initial="initial"
      animate="animate"
    >
      {/* Glass morphism background */}
      <motion.div
        className="absolute inset-0 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, 
            rgba(245, 158, 11, ${backgroundOpacity}) 0%, 
            rgba(217, 119, 6, ${backgroundOpacity}) 50%, 
            rgba(146, 64, 14, ${backgroundOpacity}) 100%)`,
        }}
      />
      
      {/* Animated border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(245, 158, 11, ${borderOpacity}) 50%, 
            transparent 100%)`,
        }}
      />

      {/* Floating glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-600/5 blur-sm" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Enhanced Logo */}
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <motion.div
              className="relative"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-xl shadow-lg flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </motion.div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-xl blur-md opacity-50 -z-10" />
            </motion.div>
            
            <div className="block">
              <motion.h1 
                className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 bg-clip-text text-transparent"
                whileHover={{ scale: 1.02 }}
              >
                Write<span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-black via-   to-black bg-clip-text text-transparent">Spark</span>
              </motion.h1>
              
              <motion.p 
                className="text-xs text-amber-700/80 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Powered by AI
              </motion.p>
            </div>
          </motion.div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                variants={navItemVariants}
                custom={index}
                className="relative"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.dropdown ? (
                  <div>
                    <motion.button
                      variants={navItemVariants}
                      whileHover="hover"
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                        ${item.current 
                          ? 'bg-amber-100/20 text-amber-900 shadow-sm' 
                          : 'text-amber-800 hover:bg-amber-50/30 hover:text-amber-900'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      <motion.div
                        animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-200/50 overflow-hidden"
                        >
                          {item.dropdown.map((dropdownItem) => (
                            <motion.a
                              key={dropdownItem.name}
                              href={dropdownItem.href}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-amber-800 hover:bg-amber-50/50 transition-colors duration-200"
                              whileHover={{ x: 4 }}
                            >
                              <dropdownItem.icon className="w-4 h-4 text-amber-600" />
                              <span>{dropdownItem.name}</span>
                            </motion.a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${item.current 
                        ? 'bg-amber-100/20 text-amber-900 shadow-sm' 
                        : 'text-amber-800 hover:bg-amber-50/30 hover:text-amber-900'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Enhanced Auth Section */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
                     >
             {user ? (
               <div className="flex items-center space-x-3">
                 <motion.div
                   whileHover={{ scale: 1.05 }}
                   className="hidden sm:block"
                 >
                   <Button
                     onClick={() => navigate('/dashboard')}
                     className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-medium"
                   >
                     <Layout className="w-4 h-4 mr-2" />
                     Dashboard
                   </Button>
                 </motion.div>
                 
                 <motion.div
                   whileHover={{ scale: 1.05 }}
                   className="relative"
                   onMouseEnter={() => setShowUserMenu(true)}
                   onMouseLeave={() => setShowUserMenu(false)}
                   data-user-menu
                 >
                   <button
                     className="w-10 h-10 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center cursor-pointer focus-visible-amber"
                     onClick={() => setShowUserMenu(!showUserMenu)}
                   >
                     <User className="w-5 h-5 text-white" />
                   </button>
                   {/* User indicator glow */}
                   <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur-sm opacity-30 -z-10" />
                   
                   {/* User Dropdown Menu */}
                   <AnimatePresence>
                     {showUserMenu && (
                       <motion.div
                         variants={dropdownVariants}
                         initial="closed"
                         animate="open"
                         exit="closed"
                         className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-200/50 overflow-hidden z-50"
                       >
                         <div className="py-2">
                           <div className="px-4 py-3 border-b border-amber-200/30">
                             <p className="text-sm font-medium text-amber-900">Signed in as</p>
                             <p className="text-xs text-amber-700/80 truncate">{user?.email || 'User'}</p>
                           </div>
                           
                           <div className="border-t border-amber-200/30">
                             <motion.button
                               onClick={() => {
                                 logout();
                                 setShowUserMenu(false);
                               }}
                               className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50/50 transition-colors duration-200 text-left"
                               whileHover={{ x: 4 }}
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                               </svg>
                               <span>Sign Out</span>
                             </motion.button>
                           </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </motion.div>
               </div>
             ) : (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} className="hidden md:block">
                  <Button
                    onClick={() => navigate('/auth/sign-in')}
                    variant="ghost"
                    className="text-amber-800 hover:bg-amber-50/30 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    Sign In
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    onClick={() => navigate('/auth/sign-in')}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-xs md:text-sm font-medium group"
                  >
                    Get Started
                    <motion.div
                      className="ml-1 md:ml-2"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Enhanced Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-amber-100/20 text-amber-800 hover:bg-amber-100/30 transition-colors duration-200"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </motion.button>
          </motion.div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden bg-white/95 backdrop-blur-xl rounded-2xl mx-4 mt-4 shadow-2xl border border-amber-200/50 overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                        ${item.current 
                          ? 'bg-amber-100/30 text-amber-900' 
                          : 'text-amber-800 hover:bg-amber-50/30'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
                                 
                 {user ? (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3 }}
                     className="pt-4 border-t border-amber-200/30"
                   >
                     <div className="px-4 py-3 bg-amber-50/50 rounded-xl mb-3">
                       <p className="text-sm font-medium text-amber-900">Signed in as</p>
                       <p className="text-xs text-amber-700/80 truncate">{user?.email || 'User'}</p>
                     </div>
                     
                     <Button
                       onClick={() => {
                         logout();
                         setIsMobileMenuOpen(false);
                       }}
                       variant="outline"
                       className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl"
                     >
                       <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                       </svg>
                       Sign Out
                     </Button>
                   </motion.div>
                 ) : (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3 }}
                     className="pt-4 border-t border-amber-200/30"
                   >
                     <Button
                       onClick={() => {
                         navigate('/auth/sign-in');
                         setIsMobileMenuOpen(false);
                       }}
                       className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg"
                     >
                       Get Started
                       <ArrowRight className="w-4 h-4 ml-2" />
                     </Button>
                   </motion.div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

export default Header;
