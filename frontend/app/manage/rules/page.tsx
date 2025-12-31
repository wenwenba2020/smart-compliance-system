'use client'

/**
 * 审核规则管理页面
 * 
 * 展示角色-单据类型-条款之间的关联关系图
 */

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, ArrowRight, FileText } from 'lucide-react'
import { getAuditRules } from '@/lib/api'

interface AuditRule {
    id: number
    role: { id: number; role_name: string }
    document_type: { id: number; type_name: string }
    clause: {
        id: number
        clause_number: string
        content: string
        regulation: { id: number; title: string }
    }
    source: string
    priority: number
}

// 按角色和单据类型分组规则
interface GroupedRule {
    role: string
    documentType: string
    clauses: Array<{
        id: number
        clauseNumber: string
        content: string
        regulationTitle: string
        source: string
        priority: number
    }>
}

export default function RulesPage() {
    const [rules, setRules] = useState<AuditRule[]>([])
    const [groupedRules, setGroupedRules] = useState<GroupedRule[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set())
    
    useEffect(() => {
        loadRules()
    }, [])
    
    async function loadRules() {
        try {
            const data = await getAuditRules()
            setRules(data)
            
            // 按角色和单据类型分组
            const grouped = groupRulesByRoleAndDocType(data)
            setGroupedRules(grouped)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    
    function groupRulesByRoleAndDocType(rules: AuditRule[]): GroupedRule[] {
        const groupMap = new Map<string, GroupedRule>()
        
        rules.forEach(rule => {
            const key = `${rule.role.role_name}|${rule.document_type.type_name}`
            
            if (!groupMap.has(key)) {
                groupMap.set(key, {
                    role: rule.role.role_name,
                    documentType: rule.document_type.type_name,
                    clauses: []
                })
            }
            
            groupMap.get(key)!.clauses.push({
                id: rule.clause.id,
                clauseNumber: rule.clause.clause_number,
                content: rule.clause.content,
                regulationTitle: rule.clause.regulation.title,
                source: rule.source,
                priority: rule.priority
            })
        })
        
        return Array.from(groupMap.values())
    }
    
    function toggleExpand(index: number) {
        const newExpanded = new Set(expandedRules)
        if (newExpanded.has(index)) {
            newExpanded.delete(index)
        } else {
            newExpanded.add(index)
        }
        setExpandedRules(newExpanded)
    }
    
    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">审核规则管理</h1>
                    <p className="mt-2 text-gray-600">
                        查看审核角色、单据类型与法规条款之间的关联关系
                    </p>
                </div>
                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : groupedRules.length === 0 ? (
                    <div className="rounded-lg border bg-white p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            暂无审核规则
                        </h3>
                        <p className="mt-2 text-gray-500">
                            请先添加审核规则
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groupedRules.map((group, index) => (
                            <div
                                key={index}
                                className="rounded-lg border bg-white shadow-sm overflow-hidden"
                            >
                                {/* 规则头部 */}
                                <button
                                    onClick={() => toggleExpand(index)}
                                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-4">
                                        {expandedRules.has(index) ? (
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        )}
                                        <div className="text-left">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {group.role} → {group.documentType}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {group.clauses.length} 条相关法规条款
                                            </p>
                                        </div>
                                    </div>
                                </button>
                                
                                {/* 关系图展开内容 */}
                                {expandedRules.has(index) && (
                                    <div className="border-t bg-gray-50 p-6">
                                        {/* 关系图 */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-4">
                                                关联关系图
                                            </h4>
                                            
                                            {/* 三列布局：角色 → 单据类型 → 条款 */}
                                            <div className="grid grid-cols-3 gap-6">
                                                {/* 第一列：角色 */}
                                                <div className="flex flex-col items-center">
                                                    <div className="w-full rounded-lg border-2 border-blue-500 bg-blue-50 p-4 text-center">
                                                        <div className="text-xs font-medium text-blue-600 mb-1">
                                                            审核角色
                                                        </div>
                                                        <div className="text-sm font-bold text-blue-900">
                                                            {group.role}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* 第二列：单据类型 */}
                                                <div className="flex flex-col items-center">
                                                    <div className="w-full rounded-lg border-2 border-green-500 bg-green-50 p-4 text-center">
                                                        <div className="text-xs font-medium text-green-600 mb-1">
                                                            单据类型
                                                        </div>
                                                        <div className="text-sm font-bold text-green-900">
                                                            {group.documentType}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* 第三列：条款数量 */}
                                                <div className="flex flex-col items-center">
                                                    <div className="w-full rounded-lg border-2 border-purple-500 bg-purple-50 p-4 text-center">
                                                        <div className="text-xs font-medium text-purple-600 mb-1">
                                                            相关条款
                                                        </div>
                                                        <div className="text-sm font-bold text-purple-900">
                                                            {group.clauses.length} 条
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* 箭头连接线 */}
                                            <div className="relative mt-4 mb-4">
                                                <div className="flex items-center justify-center space-x-4">
                                                    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-green-500"></div>
                                                    <ArrowRight className="h-6 w-6 text-green-500" />
                                                    <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 to-purple-500"></div>
                                                    <ArrowRight className="h-6 w-6 text-purple-500" />
                                                    <div className="w-16"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* 条款详情列表 */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                关联的法规条款
                                            </h4>
                                            <div className="space-y-3">
                                                {group.clauses.map((clause, clauseIndex) => (
                                                    <div
                                                        key={clauseIndex}
                                                        className="rounded-lg border border-purple-200 bg-white p-4"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                                                                        {clauseIndex + 1}
                                                                    </span>
                                                                    <span className="text-sm font-semibold text-gray-900">
                                                                        {clause.regulationTitle}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-medium text-blue-600 mb-2">
                                                                    {clause.clauseNumber}
                                                                </p>
                                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                                    {clause.content.length > 150 
                                                                        ? clause.content.substring(0, 150) + '...' 
                                                                        : clause.content
                                                                    }
                                                                </p>
                                                                <div className="mt-3 flex items-center space-x-3 text-xs text-gray-500">
                                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                                                                        来源: {clause.source}
                                                                    </span>
                                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                                                                        优先级: {clause.priority}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                {/* 统计信息 */}
                {!loading && groupedRules.length > 0 && (
                    <div className="mt-8 rounded-lg border bg-blue-50 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            统计信息
                        </h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">
                                    {groupedRules.length}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    审核规则组
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {rules.length}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    条款关联
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">
                                    {new Set(rules.map(r => r.role.role_name)).size}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    审核角色
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
