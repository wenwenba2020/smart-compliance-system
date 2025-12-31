'use client'

/**
 * 关键词搜索页面
 */

import { useState } from 'react'
import { Search, FileText } from 'lucide-react'
import { searchClauses } from '@/lib/api'

export default function SearchPage() {
    const [keyword, setKeyword] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!keyword.trim()) return
        
        setLoading(true)
        setHasSearched(false)
        
        try {
            const data = await searchClauses(keyword, 20)
            setResults(data.results)
            setHasSearched(true)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">关键词搜索</h1>
                    <p className="mt-2 text-gray-600">
                        在所有法规条款中搜索包含指定关键词的内容
                    </p>
                </div>
                
                {/* 搜索框 */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="输入关键词搜索..."
                                className="block w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !keyword.trim()}
                            className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? '搜索中...' : '搜索'}
                        </button>
                    </div>
                </form>
                
                {/* 搜索结果 */}
                {hasSearched && (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">搜索结果</h2>
                            <span className="text-sm text-gray-500">
                                找到 {results.length} 条相关条款
                            </span>
                        </div>
                        
                        {results.length === 0 ? (
                            <div className="rounded-lg border bg-white p-12 text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">
                                    未找到相关条款
                                </h3>
                                <p className="mt-2 text-gray-500">
                                    请尝试使用其他关键词
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {result.regulation_title}
                                        </h3>
                                        <p className="mt-1 text-sm font-medium text-blue-600">
                                            {result.clause_number}
                                        </p>
                                        <p 
                                            className="mt-3 text-gray-700 leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: result.content.replace(
                                                    new RegExp(keyword, 'gi'),
                                                    (match: string) => `<mark class="bg-yellow-200">${match}</mark>`
                                                )
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
