'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingBag, Users, FolderTree,
  TicketPercent, Star, BarChart3,
  Search, Settings,
  Menu, X, Bell, LogOut, User,
  ChevronDown, PanelRightClose, PanelRightOpen
} from 'lucide-react'

interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  adminName: string
  adminEmail: string
  adminAvatar: string
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  adminName: '',
  adminEmail: '',
  adminAvatar: '',
  logout: () => {},
})

export const useAdminAuth = () => useContext(AuthContext)

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
  { icon: TicketPercent, label: 'Coupons', href: '/admin/coupons' },
  { icon: Star, label: 'Reviews', href: '/admin/reviews' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
]

const SubNav = ({ item, collapsed }: { item: typeof navItems[number], collapsed: boolean }) => {
  const pathname = usePathname()
  const isActive = item.href === '/admin' ? pathname === '/admin' : (pathname === item.href || pathname.startsWith(item.href + '/'))

  return (
    <Link href={item.href}>
      <motion.div
        className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors duration-200 cursor-pointer group relative ${
          isActive
            ? 'text-white font-medium'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        {isActive && (
          <motion.div
            layoutId="navIndicator"
            className="absolute inset-0 bg-gradient-to-r from-[#C9A84C]/20 to-transparent rounded-lg border border-[#C9A84C]/30"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <div className={`relative z-10 ${isActive ? 'text-[#C9A84C]' : 'group-hover:text-[#C9A84C]/70'}`}>
          <item.icon size={20} />
        </div>
        {!collapsed && (
          <span className="relative z-10 text-sm tracking-wide whitespace-nowrap">{item.label}</span>
        )}
        {isActive && (
          <motion.div
            className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[#C9A84C]"
            layoutId="navDot"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const auth: AuthContextType = {
    isAuthenticated: true,
    isAdmin: true,
    adminName: 'Aarav Mehta',
    adminEmail: 'aarav@yezbee.com',
    adminAvatar: '',
    logout: () => { router.push('/admin/login') },
  }

  const notifications = [
    { id: 1, text: 'New order #ORD-2026-0042 from Priya Sharma', time: '2 min ago', unread: true },
    { id: 2, text: 'Low stock alert: "Silk Evening Gown" (3 left)', time: '15 min ago', unread: true },
    { id: 3, text: 'Payment received for order #ORD-2026-0039', time: '1 hour ago', unread: false },
    { id: 4, text: 'New customer registered: Ananya Gupta', time: '3 hours ago', unread: false },
    { id: 5, text: 'Review pending: "Velvet Blazer" - 4 stars', time: '5 hours ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <AuthContext.Provider value={auth}>
      <div className="min-h-screen bg-[#FAF7F2] flex" suppressHydrationWarning>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        <motion.aside
          animate={{ width: collapsed ? 72 : 260 }}
          className="fixed left-0 top-0 h-full bg-[#1A1A1A] z-50 overflow-hidden shadow-2xl flex flex-col"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          suppressHydrationWarning
        >
          <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
            <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-[#C9A84C] to-[#A8882E] rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#C9A84C]/20"
                whileHover={{ rotate: 15 }}
              >
                <span className="text-white font-bold text-sm">YB</span>
              </motion.div>
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -20 : 0 }}
                className="text-white font-semibold text-lg tracking-wider whitespace-nowrap"
              >
                YEZ <span className="text-[#C9A84C]">BEE</span>
              </motion.span>
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-500 hover:text-[#C9A84C] transition-colors hidden lg:block"
              suppressHydrationWarning
            >
              {collapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-gray-400 hover:text-white lg:hidden"
              suppressHydrationWarning
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/10">
            {navItems.map((item) => (
              <div key={item.href} onClick={() => setMobileOpen(false)}>
                <SubNav item={item} collapsed={collapsed} />
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#C9A84C]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-[#C9A84C]" />
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-white text-sm font-medium truncate">{auth.adminName}</p>
                  <p className="text-gray-500 text-xs truncate">{auth.adminEmail}</p>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        <motion.main
          animate={{ marginLeft: collapsed ? 72 : 260 }}
          className="flex-1 min-h-screen"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
            <div className="flex items-center justify-between h-16 px-4 lg:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-[#C9A84C] transition-colors"
                  suppressHydrationWarning
                >
                  <Menu size={22} />
                </button>

                <div className="hidden md:flex items-center">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search orders, products, customers..."
                      className="w-64 lg:w-96 pl-10 pr-4 py-2 bg-[#FAF7F2] rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                      suppressHydrationWarning
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-[#C9A84C] transition-colors rounded-lg hover:bg-[#FAF7F2]"
                  suppressHydrationWarning
                >
                  <Search size={20} />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 text-gray-600 hover:text-[#C9A84C] transition-colors rounded-lg hover:bg-[#FAF7F2]"
                    suppressHydrationWarning
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#C9A84C] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-[#C9A84C]/30">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 hover:bg-[#FAF7F2] cursor-pointer transition-colors ${
                                n.unread ? 'bg-[#F5E6C8]/20 border-l-2 border-[#C9A84C]' : ''
                              }`}
                            >
                              <p className="text-sm text-gray-700">{n.text}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 border-t border-gray-100 text-center">
                          <button className="text-xs text-[#C9A84C] font-medium hover:underline" suppressHydrationWarning>
                            View all notifications
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#FAF7F2] transition-colors"
                    suppressHydrationWarning
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#C9A84C] to-[#A8882E] rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md">
                      {auth.adminName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700">{auth.adminName}</span>
                    <ChevronDown size={14} className="text-gray-400 hidden lg:block" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{auth.adminName}</p>
                          <p className="text-xs text-gray-500">{auth.adminEmail}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-[#C9A84C]/10 text-[#C9A84C] rounded-full border border-[#C9A84C]/20">
                            Super Admin
                          </span>
                        </div>
                        <div className="py-1">
                          <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#FAF7F2] flex items-center gap-2 transition-colors">
                            <User size={15} /> Profile
                          </button>
                          <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#FAF7F2] flex items-center gap-2 transition-colors">
                            <Settings size={15} /> Settings
                          </button>
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={auth.logout}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden border-t border-gray-100 overflow-hidden"
                >
                  <div className="p-3">
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <div className="p-4 lg:p-8 flex-1">
            {children}
          </div>

          <footer className="mt-auto px-4 lg:px-8 py-4 border-t border-gray-200/60 bg-white/60 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>&copy; {new Date().getFullYear()} YEZ BEE FASHION &bull; Admin Management Portal v2.0</span>
            <div className="flex items-center gap-4 text-gray-500">
              <Link href="/" target="_blank" className="hover:text-[#C9A84C] transition-colors font-medium">
                View Customer Storefront ↗
              </Link>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                System Status: <strong className="text-emerald-700 font-bold">Online</strong>
              </span>
            </div>
          </footer>
        </motion.main>
      </div>
    </AuthContext.Provider>
  )
}
