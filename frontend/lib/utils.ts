/**
 * 工具函数
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并Tailwind CSS类名
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

/**
 * 高亮关键词
 */
export function highlightKeyword(text: string, keyword: string): string {
    if (!keyword) return text
    const regex = new RegExp(`(${keyword})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}
