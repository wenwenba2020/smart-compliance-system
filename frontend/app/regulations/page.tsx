'use client'

/**
 * 法规浏览页面
 */

import { useState, useEffect, useRef } from 'react'
import { BookOpen, FileText, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { getRegulations, type Regulation } from '@/lib/api'

export default function RegulationsPage() {
    const [regulations, setRegulations] = useState<Regulation[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    useEffect(() => {
        loadRegulations()
    }, [])
    
    async function loadRegulations() {
        try {
            const data = await getRegulations()
            setRegulations(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // 检查文件类型
            const validTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
                'application/msword' // .doc
            ]
            
            if (!validTypes.includes(file.type) && 
                !file.name.endsWith('.pdf') && 
                !file.name.endsWith('.docx') && 
                !file.name.endsWith('.doc')) {
                setUploadStatus({
                    success: false,
                    message: '仅支持PDF和Word文档（.pdf, .docx, .doc）'
                })
                return
            }
            
            // 检查文件大小（限制10MB）
            if (file.size > 10 * 1024 * 1024) {
                setUploadStatus({
                    success: false,
                    message: '文件大小不能超过10MB'
                })
                return
            }
            
            setSelectedFile(file)
            setUploadStatus(null)
        }
    }
    
    const handleUpload = async () => {
        if (!selectedFile) return
        
        setUploading(true)
        setUploadStatus(null)
        
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            
            const response = await fetch('http://localhost:10000/api/regulations/upload', {
                method: 'POST',
                body: formData
            })
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: '上传失败' }))
                throw new Error(error.detail || '上传失败')
            }
            
            const result = await response.json()
            
            setUploadStatus({
                success: true,
                message: `上传成功！已解析 ${result.clause_count} 条法规条款`
            })
            
            // 刷新法规列表
            await loadRegulations()
            
            // 3秒后关闭弹窗
            setTimeout(() => {
                setShowUploadModal(false)
                setSelectedFile(null)
                setUploadStatus(null)
            }, 3000)
            
        } catch (error) {
            setUploadStatus({
                success: false,
                message: error instanceof Error ? error.message : '上传失败'
            })
        } finally {
            setUploading(false)
        }
    }
    
    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">法规文档库</h1>
                        <p className="mt-2 text-gray-600">
                            浏览系统中所有法规文档及其条款数量
                        </p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                    >
                        <Upload className="mr-2 h-5 w-5" />
                        上传法规
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                法规列表
                            </h2>
                            <span className="text-sm text-gray-500">
                                共 {regulations.length} 个法规
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {regulations.map((regulation) => (
                                <div
                                    key={regulation.id}
                                    className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start">
                                        <BookOpen className="mr-4 mt-1 h-8 w-8 flex-shrink-0 text-blue-600" />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {regulation.title}
                                            </h3>
                                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <FileText className="mr-1 h-4 w-4" />
                                                    {regulation.clause_count} 条款
                                                </div>
                                                {regulation.source_file && (
                                                    <div className="text-xs text-gray-400">
                                                        {regulation.source_file.split('/').pop()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="ml-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            查看详情
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* 上传法规弹窗 */}
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">上传法规文档</h2>
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false)
                                        setSelectedFile(null)
                                        setUploadStatus(null)
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <p className="mb-6 text-sm text-gray-600">
                                支持上传PDF和Word文档（.pdf, .docx, .doc），文件大小不超过10MB
                            </p>
                            
                            {/* 文件选择区域 */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="mb-4 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500 hover:bg-blue-50"
                            >
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm font-medium text-gray-900">
                                    点击选择文件或拖拽文件到此处
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    支持PDF、Word文档
                                </p>
                            </div>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            
                            {/* 已选文件 */}
                            {selectedFile && (
                                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <FileText className="mr-3 h-8 w-8 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* 上传状态提示 */}
                            {uploadStatus && (
                                <div className={`mb-4 rounded-lg border p-4 ${
                                    uploadStatus.success 
                                        ? 'border-green-200 bg-green-50' 
                                        : 'border-red-200 bg-red-50'
                                }`}>
                                    <div className="flex items-start">
                                        {uploadStatus.success ? (
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                                        )}
                                        <div>
                                            <h3 className={`text-sm font-medium ${
                                                uploadStatus.success ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                                {uploadStatus.success ? '上传成功' : '上传失败'}
                                            </h3>
                                            <p className={`mt-1 text-sm ${
                                                uploadStatus.success ? 'text-green-700' : 'text-red-700'
                                            }`}>
                                                {uploadStatus.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* 操作按钮 */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false)
                                        setSelectedFile(null)
                                        setUploadStatus(null)
                                    }}
                                    className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                                    disabled={uploading}
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploading}
                                    className="flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            上传中...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            开始上传
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
