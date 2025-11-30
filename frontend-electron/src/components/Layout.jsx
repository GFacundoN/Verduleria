import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  FileText,
  Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Productos', href: '/productos', icon: Package },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Pedidos', href: '/pedidos', icon: ShoppingCart },
  { name: 'Remitos', href: '/remitos', icon: FileText },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 h-16 px-6 border-b border-gray-200">
            <Leaf className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Verdulería</h1>
              <p className="text-xs text-gray-500">Sistema de Gestión</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              © 2024 Verdulería System
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}