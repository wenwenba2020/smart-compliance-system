'use client'

/**
 * 首页 - 条款匹配查询
 * 
 * 核心功能页面，用户选择审核角色和单据类型，查询匹配的法规条款
 */

import { useState, useEffect } from 'react'
import { Search, FileText, AlertCircle } from 'lucide-react'
import { matchClauses, getRoles, getDocumentTypes, type Role, type DocumentType, type Clause } from '@/lib/api'

export default function HomePage() {
    // 状态管理
    const [roles, setRoles] = useState<Role[]>([])
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedDocType, setSelectedDocType] = useState('')
    const [results, setResults] = useState<Clause[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [hasSearched, setHasSearched] = useState(false)
    
    // 加载角色和单据类型
    useEffect(() => {
        async function loadData() {
            try {
                const [rolesData, docTypesData] = await Promise.all([
                    getRoles(),
                    getDocumentTypes()
                ])
                setRoles(rolesData)
                setDocumentTypes(docTypesData)
                
                // 自动选择第一个选项
                if (rolesData.length > 0) setSelectedRole(rolesData[0].role_name)
                if (docTypesData.length > 0) setSelectedDocType(docTypesData[0].type_name)
            } catch (err) {
                setError('加载数据失败，请检查后端服务是否正常运行')
                console.error(err)
            }
        }
        loadData()
    }, [])
    
    // 执行查询
    const handleSearch = async () => {
        if (!selectedRole || !selectedDocType) {
            setError('请选择审核角色和单据类型')
            return
        }
        
        setLoading(true)
        setError('')
        setHasSearched(false)
        
        try {
            const data = await matchClauses(selectedRole, selectedDocType)
            setResults(data.matched_clauses)
            setHasSearched(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : '查询失败')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="h-full p-8">
            <div className="mx-auto max-w-4xl">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        条款匹配查询
                    </h1>
                    <p className="mt-2 text-gray-600">
                        选择审核角色和单据类型，系统将为您匹配相关的法规条款
                    </p>
                </div>
                
                {/* 查询表单 */}
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="space-y-6">
                        {/* 选择审核角色 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                审核角色
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                <option value="">请选择角色</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.role_name}>
                                        {role.role_name}
                                    </option>
                                ))}
                            </select>
                            {selectedRole && roles.find(r => r.role_name === selectedRole)?.responsibilities && (
                                <p className="mt-2 text-sm text-gray-500">
                                    {roles.find(r => r.role_name === selectedRole)?.responsibilities}
                                </p>
                            )}
                        </div>
                        
                        {/* 选择单据类型 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                单据类型
                            </label>
                            <select
                                value={selectedDocType}
                                onChange={(e) => setSelectedDocType(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                <option value="">请选择单据类型</option>
                                {documentTypes.map((docType) => (
                                    <option key={docType.id} value={docType.type_name}>
                                        {docType.type_name}
                                    </option>
                                ))}
                            </select>
                            {selectedDocType && documentTypes.find(d => d.type_name === selectedDocType)?.description && (
                                <p className="mt-2 text-sm text-gray-500">
                                    {documentTypes.find(d => d.type_name === selectedDocType)?.description}
                                </p>
                            )}
                        </div>
                        
                        {/* 查询按钮 */}
                        <button
                            onClick={handleSearch}
                            disabled={loading || !selectedRole || !selectedDocType}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    查询中...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-5 w-5" />
                                    开始查询
                                </>
                            )}
                        </button>
                    </div>
                </div>
                
                {/* 错误提示 */}
                {error && (
                    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                            <div>
                                <h3 className="text-sm font-medium text-red-800">出错了</h3>
                                <p className="mt-1 text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 查询结果 */}
                {hasSearched && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                匹配结果
                            </h2>
                            <span className="text-sm text-gray-500">
                                共 {results.length} 条
                            </span>
                        </div>
                        
                        {results.length === 0 ? (
                            <div className="rounded-lg border bg-white p-12 text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">
                                    未找到匹配的条款
                                </h3>
                                <p className="mt-2 text-gray-500">
                                    请尝试选择其他审核角色或单据类型
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results.map((clause) => (
                                    <div
                                        key={clause.clause_id}
                                        className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {clause.regulation_title}
                                                </h3>
                                                <p className="mt-1 text-sm font-medium text-blue-600">
                                                    {clause.clause_number}
                                                </p>
                                                <p className="mt-3 text-gray-700 leading-relaxed">
                                                    {clause.content}
                                                </p>
                                                <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5">
                                                        来源: {clause.source}
                                                    </span>
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700">
                                                        优先级: {clause.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
