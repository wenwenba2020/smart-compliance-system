'use client'

/**
 * 侧边栏导航组件
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    Home, 
    Search, 
    BookOpen, 
    Users, 
    FileText, 
    Link as LinkIcon,
    Settings 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: '首页', href: '/', icon: Home },
    { name: '搜索', href: '/search', icon: Search },
    { name: '法规库', href: '/regulations', icon: BookOpen },
]

const management = [
    { name: '角色', href: '/manage/roles', icon: Users },
    { name: '单据类型', href: '/manage/documents', icon: FileText },
    { name: '审核规则', href: '/manage/rules', icon: LinkIcon },
]

const settings = [
    { name: '设置', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    
    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold text-gray-900">
                    智能合规审核
                </h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {/* Main navigation */}
                <div className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 flex-shrink-0',
                                        isActive
                                            ? 'text-blue-600'
                                            : 'text-gray-400 group-hover:text-gray-500'
                                    )}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>
                
                {/* Management section */}
                <div className="pt-6">
                    <p className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase">
                        管理
                    </p>
                    <div className="space-y-1">
                        {management.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            'mr-3 h-5 w-5 flex-shrink-0',
                                            isActive
                                                ? 'text-blue-600'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                        )}
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </div>
                
                {/* Settings section */}
                <div className="pt-6">
                    <div className="space-y-1">
                        {settings.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            'mr-3 h-5 w-5 flex-shrink-0',
                                            isActive
                                                ? 'text-blue-600'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                        )}
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </nav>
            
            {/* Footer */}
            <div className="border-t p-4">
                <p className="text-xs text-gray-500">
                    © 2025 智能合规审核系统
                </p>
                <p className="text-xs text-gray-400">
                    v1.0.0 (MVP)
                </p>
            </div>
        </div>
    )
}
