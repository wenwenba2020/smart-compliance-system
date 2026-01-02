'use client'

/**
 * API 连接测试页面
 */

import { useState, useEffect } from 'react'

export default function ApiTestPage() {
    const [status, setStatus] = useState<string>('测试中...')
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string>('')
    
    useEffect(() => {
        async function testApi() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smart-compliance-backend.onrender.com'
                setStatus(`正在连接: ${API_URL}`)
                
                const response = await fetch(`${API_URL}/health`)
                const result = await response.json()
                
                setStatus('✅ 连接成功！')
                setData(result)
                
                // 测试角色 API
                const rolesResponse = await fetch(`${API_URL}/api/roles`)
                const rolesData = await rolesResponse.json()
                setData({ health: result, roles: rolesData })
                
            } catch (err) {
                setStatus('❌ 连接失败')
                setError(err instanceof Error ? err.message : String(err))
            }
        }
        
        testApi()
    }, [])
    
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">API 连接测试</h1>
            
            <div className="space-y-4">
                <div className="p-4 border rounded">
                    <h2 className="font-semibold">状态:</h2>
                    <p>{status}</p>
                </div>
                
                {error && (
                    <div className="p-4 border border-red-500 rounded bg-red-50">
                        <h2 className="font-semibold text-red-800">错误:</h2>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}
                
                {data && (
                    <div className="p-4 border rounded bg-green-50">
                        <h2 className="font-semibold text-green-800">返回数据:</h2>
                        <pre className="mt-2 text-sm overflow-auto">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
                
                <div className="p-4 border rounded bg-blue-50">
                    <h2 className="font-semibold text-blue-800">环境变量:</h2>
                    <p className="text-sm">
                        NEXT_PUBLIC_API_URL = {process.env.NEXT_PUBLIC_API_URL || '(未设置，使用默认值)'}
                    </p>
                </div>
            </div>
        </div>
    )
}
