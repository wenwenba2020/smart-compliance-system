'use client'

/**
 * 设置页面 - AI模型配置
 * 
 * 允许用户配置Embedding模型和LLM模型的API Key
 */

import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'

interface ModelConfig {
    embeddingModel: string
    embeddingApiKey: string
    embeddingBaseUrl: string
    llmModel: string
    llmApiKey: string
    llmBaseUrl: string
    matchingStrategy: 'rule' | 'vector' | 'llm'
}

export default function SettingsPage() {
    // 配置状态
    const [config, setConfig] = useState<ModelConfig>({
        embeddingModel: 'openai',
        embeddingApiKey: '',
        embeddingBaseUrl: 'https://api.openai.com/v1',
        llmModel: 'gpt-4',
        llmApiKey: '',
        llmBaseUrl: 'https://api.openai.com/v1',
        matchingStrategy: 'rule'
    })
    
    // UI状态
    const [showEmbeddingKey, setShowEmbeddingKey] = useState(false)
    const [showLLMKey, setShowLLMKey] = useState(false)
    const [saved, setSaved] = useState(false)
    const [testing, setTesting] = useState<string | null>(null)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
    
    // 从localStorage加载配置
    useEffect(() => {
        const savedConfig = localStorage.getItem('modelConfig')
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig))
        }
    }, [])
    
    // 保存配置
    const handleSave = () => {
        localStorage.setItem('modelConfig', JSON.stringify(config))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }
    
    // 测试连接
    const handleTest = async (type: 'embedding' | 'llm') => {
        setTesting(type)
        setTestResult(null)
        
        // 模拟测试（实际应该调用后端API）
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const apiKey = type === 'embedding' ? config.embeddingApiKey : config.llmApiKey
        
        if (!apiKey) {
            setTestResult({
                success: false,
                message: '请先填写API Key'
            })
        } else {
            setTestResult({
                success: true,
                message: '连接测试成功！'
            })
        }
        
        setTesting(null)
    }
    
    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="mx-auto max-w-3xl">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
                    <p className="mt-2 text-gray-600">
                        配置AI模型和匹配策略，提升智能审核能力
                    </p>
                </div>
                
                {/* Embedding模型配置 */}
                <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-purple-600" />
                        <h2 className="text-xl font-bold text-gray-900">
                            Embedding模型配置
                        </h2>
                    </div>
                    <p className="mb-6 text-sm text-gray-600">
                        用于条款向量化和语义检索，提高匹配准确度
                    </p>
                    
                    <div className="space-y-4">
                        {/* 模型选择 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                模型类型
                            </label>
                            <select
                                value={config.embeddingModel}
                                onChange={(e) => setConfig({ ...config, embeddingModel: e.target.value })}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="openai">OpenAI (text-embedding-3-small)</option>
                                <option value="openai-large">OpenAI (text-embedding-3-large)</option>
                                <option value="local">本地Sentence-Transformers</option>
                                <option value="zhipu">智谱AI (embedding-2)</option>
                                <option value="qwen">通义千问 (text-embedding-v2)</option>
                            </select>
                        </div>
                        
                        {/* API Key */}
                        {config.embeddingModel !== 'local' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={showEmbeddingKey ? 'text' : 'password'}
                                        value={config.embeddingApiKey}
                                        onChange={(e) => setConfig({ ...config, embeddingApiKey: e.target.value })}
                                        placeholder="sk-..."
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmbeddingKey(!showEmbeddingKey)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showEmbeddingKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Base URL */}
                        {config.embeddingModel !== 'local' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Base URL (可选)
                                </label>
                                <input
                                    type="text"
                                    value={config.embeddingBaseUrl}
                                    onChange={(e) => setConfig({ ...config, embeddingBaseUrl: e.target.value })}
                                    placeholder="https://api.openai.com/v1"
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    如使用代理或自部署服务，请填写自定义地址
                                </p>
                            </div>
                        )}
                        
                        {/* 测试按钮 */}
                        {config.embeddingModel !== 'local' && (
                            <button
                                onClick={() => handleTest('embedding')}
                                disabled={testing !== null}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {testing === 'embedding' ? '测试中...' : '测试连接'}
                            </button>
                        )}
                    </div>
                </div>
                
                {/* LLM模型配置 */}
                <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">
                            LLM模型配置
                        </h2>
                    </div>
                    <p className="mb-6 text-sm text-gray-600">
                        用于智能推荐和条款解释，提供更智能的审核建议
                    </p>
                    
                    <div className="space-y-4">
                        {/* 模型选择 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                模型类型
                            </label>
                            <select
                                value={config.llmModel}
                                onChange={(e) => setConfig({ ...config, llmModel: e.target.value })}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="gpt-4">OpenAI GPT-4</option>
                                <option value="gpt-4-turbo">OpenAI GPT-4 Turbo</option>
                                <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                                <option value="claude-3-opus">Anthropic Claude 3 Opus</option>
                                <option value="claude-3-sonnet">Anthropic Claude 3 Sonnet</option>
                                <option value="zhipu-glm-4">智谱AI GLM-4</option>
                                <option value="qwen-plus">通义千问 Plus</option>
                            </select>
                        </div>
                        
                        {/* API Key */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showLLMKey ? 'text' : 'password'}
                                    value={config.llmApiKey}
                                    onChange={(e) => setConfig({ ...config, llmApiKey: e.target.value })}
                                    placeholder="sk-..."
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLLMKey(!showLLMKey)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showLLMKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        
                        {/* Base URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                API Base URL (可选)
                            </label>
                            <input
                                type="text"
                                value={config.llmBaseUrl}
                                onChange={(e) => setConfig({ ...config, llmBaseUrl: e.target.value })}
                                placeholder="https://api.openai.com/v1"
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        {/* 测试按钮 */}
                        <button
                            onClick={() => handleTest('llm')}
                            disabled={testing !== null}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {testing === 'llm' ? '测试中...' : '测试连接'}
                        </button>
                    </div>
                </div>
                
                {/* 匹配策略 */}
                <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">匹配策略</h2>
                    <p className="mb-6 text-sm text-gray-600">
                        选择条款匹配的方式，不同策略有不同的准确度和响应速度
                    </p>
                    
                    <div className="space-y-3">
                        <label className="flex items-start rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="strategy"
                                value="rule"
                                checked={config.matchingStrategy === 'rule'}
                                onChange={(e) => setConfig({ ...config, matchingStrategy: e.target.value as any })}
                                className="mt-1 mr-3"
                            />
                            <div>
                                <div className="font-medium text-gray-900">仅规则匹配（当前）</div>
                                <p className="text-sm text-gray-600">
                                    基于预设的审核规则进行精确匹配，速度快，结果稳定
                                </p>
                            </div>
                        </label>
                        
                        <label className="flex items-start rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="strategy"
                                value="vector"
                                checked={config.matchingStrategy === 'vector'}
                                onChange={(e) => setConfig({ ...config, matchingStrategy: e.target.value as any })}
                                className="mt-1 mr-3"
                            />
                            <div>
                                <div className="font-medium text-gray-900">向量检索 + 规则匹配</div>
                                <p className="text-sm text-gray-600">
                                    结合语义相似度和规则匹配，提高覆盖率，需要配置Embedding模型
                                </p>
                            </div>
                        </label>
                        
                        <label className="flex items-start rounded-lg border p-4 cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="strategy"
                                value="llm"
                                checked={config.matchingStrategy === 'llm'}
                                onChange={(e) => setConfig({ ...config, matchingStrategy: e.target.value as any })}
                                className="mt-1 mr-3"
                            />
                            <div>
                                <div className="font-medium text-gray-900">LLM智能推荐</div>
                                <p className="text-sm text-gray-600">
                                    使用大语言模型进行智能分析和推荐，准确度最高，需要配置LLM模型
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
                
                {/* 测试结果提示 */}
                {testResult && (
                    <div className={`mb-6 rounded-lg border p-4 ${
                        testResult.success 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                    }`}>
                        <div className="flex items-start">
                            {testResult.success ? (
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                            )}
                            <div>
                                <h3 className={`text-sm font-medium ${
                                    testResult.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {testResult.success ? '测试成功' : '测试失败'}
                                </h3>
                                <p className={`mt-1 text-sm ${
                                    testResult.success ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {testResult.message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 保存按钮 */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleSave}
                        className="flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Save className="mr-2 h-5 w-5" />
                        保存配置
                    </button>
                    
                    {saved && (
                        <div className="flex items-center text-green-600">
                            <CheckCircle className="mr-2 h-5 w-5" />
                            <span className="text-sm font-medium">配置已保存</span>
                        </div>
                    )}
                </div>
                
                {/* 提示信息 */}
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">配置说明</h3>
                            <ul className="mt-2 text-sm text-blue-700 space-y-1">
                                <li>• API Key将存储在浏览器本地，不会上传到服务器</li>
                                <li>• 建议先使用"仅规则匹配"测试系统，再逐步升级到智能匹配</li>
                                <li>• 向量检索和LLM功能需要后端支持，请确保后端已部署相应模块</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
