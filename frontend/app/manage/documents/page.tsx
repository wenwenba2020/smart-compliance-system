'use client'

/**
 * 单据类型管理页面
 */

import { useState, useEffect } from 'react'
import { FileText, Plus } from 'lucide-react'
import { getDocumentTypes, type DocumentType } from '@/lib/api'

export default function DocumentsPage() {
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        async function loadDocumentTypes() {
            try {
                const data = await getDocumentTypes()
                setDocumentTypes(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        loadDocumentTypes()
    }, [])
    
    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">单据类型管理</h1>
                        <p className="mt-2 text-gray-600">
                            管理系统中的单据类型及其描述
                        </p>
                    </div>
                    <button className="flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                        <Plus className="mr-2 h-5 w-5" />
                        添加单据类型
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {documentTypes.map((docType) => (
                            <div
                                key={docType.id}
                                className="rounded-lg border bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start">
                                        <FileText className="mr-4 mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {docType.type_name}
                                            </h3>
                                            {docType.description && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    {docType.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            编辑
                                        </button>
                                        <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">
                                            删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
