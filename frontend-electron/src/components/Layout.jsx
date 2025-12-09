import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  FileText,
  BarChart3,
  Leaf,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDarkMode } from '@/hooks/useDarkMode.jsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Pedidos', href: '/pedidos', icon: ShoppingCart },
  { name: 'Remitos', href: '/remitos', icon: FileText },
  { name: 'Estadísticas', href: '/estadisticas', icon: BarChart3 },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-[#0f0f0f] dark:to-[#1a1a1a]">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1a1a1a]/95 dark:backdrop-blur-xl border-r border-gray-200 dark:border-[#2a2a2a] dark:shadow-2xl transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#1db954] blur-lg opacity-50"></div>
                <Leaf className="relative h-9 w-9 text-green-600 dark:text-[#1db954] drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Verdulería</h1>
                <p className="text-[10px] text-gray-500 dark:text-[#6b7280] font-medium uppercase tracking-wider">Gestión Premium</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 group',
                    isActive
                      ? 'bg-green-50 dark:bg-[#1db954]/10 text-green-700 dark:text-[#1db954] shadow-lg dark:shadow-[#1db954]/20'
                      : 'text-gray-700 dark:text-[#9ca3af] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1db954]/5 to-transparent rounded-2xl"></div>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1db954] rounded-r-full shadow-lg shadow-[#1db954]/50"></div>
                  )}
                  <item.icon className={cn(
                    "relative h-5 w-5 transition-all",
                    isActive ? "drop-shadow-lg" : "opacity-80 group-hover:opacity-100"
                  )} />
                  <span className="relative">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a] space-y-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 dark:text-[#9ca3af] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] dark:hover:text-white transition-all duration-200"
            >
              <span>Modo {darkMode ? 'Oscuro' : 'Claro'}</span>
              {darkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            <p className="text-[10px] text-gray-500 dark:text-[#4b5563] text-center font-medium uppercase tracking-wider">
              Sistema v2.0
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white dark:bg-[#282b30] border-b border-gray-200 dark:border-[#1e2124] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-600 dark:text-[#1db954]" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Verdulería</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#35383f]"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}