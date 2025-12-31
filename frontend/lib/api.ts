/**
 * API调用封装
 * 
 * 统一管理所有后端API请求
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smart-compliance-backend.onrender.com'

/**
 * 通用请求函数
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        })
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
            throw new Error(error.detail || `HTTP ${response.status}`)
        }
        
        return await response.json()
    } catch (error) {
        console.error('API request failed:', error)
        throw error
    }
}

// ============ 类型定义 ============

export interface Clause {
    clause_id: number
    regulation_id: number
    regulation_title: string
    clause_number: string
    content: string
    source: string
    priority: number
}

export interface MatchResult {
    role: string
    document_type: string
    matched_clauses: Clause[]
    total: number
}

export interface Role {
    id: number
    role_name: string
    responsibilities: string | null
}

export interface DocumentType {
    id: number
    type_name: string
    description: string | null
}

export interface Regulation {
    id: number
    title: string
    source_file: string | null
    clause_count: number
}

export interface SearchResult {
    keyword: string
    results: Array<{
        clause_id: number
        regulation_title: string
        clause_number: string
        content: string
    }>
    total: number
}

// ============ API函数 ============

/**
 * 条款匹配查询
 */
export async function matchClauses(
    role: string,
    documentType: string
): Promise<MatchResult> {
    const params = new URLSearchParams({
        role,
        document_type: documentType,
    })
    return request<MatchResult>(`/api/match?${params}`)
}

/**
 * 关键词搜索
 */
export async function searchClauses(
    keyword: string,
    limit: number = 20
): Promise<SearchResult> {
    const params = new URLSearchParams({
        keyword,
        limit: limit.toString(),
    })
    return request<SearchResult>(`/api/search?${params}`)
}

/**
 * 获取所有审核角色
 */
export async function getRoles(): Promise<Role[]> {
    return request<Role[]>('/api/roles')
}

/**
 * 获取所有单据类型
 */
export async function getDocumentTypes(): Promise<DocumentType[]> {
    return request<DocumentType[]>('/api/document-types')
}

/**
 * 获取所有法规
 */
export async function getRegulations(): Promise<Regulation[]> {
    return request<Regulation[]>('/api/regulations')
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<{ status: string; service: string }> {
    return request<{ status: string; service: string }>('/health')
}

/**
 * 获取所有审核规则
 */
export async function getAuditRules(): Promise<Array<{
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
}>> {
    return request<any>('/api/audit-rules')
}
