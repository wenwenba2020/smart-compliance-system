"""
法规文档解析器

负责从regulations文件夹中解析法规文档，提取条款信息
"""

import re
import os
from typing import List, Dict, Tuple


class RegulationParser:
    """法规文档解析器"""
    
    def __init__(self):
        """初始化解析器"""
        # 条款编号的正则模式
        # 匹配：第X条、第X章、第X节等
        self.clause_pattern = re.compile(
            r'第[零一二三四五六七八九十百千]+条[\s\S]*?(?=第[零一二三四五六七八九十百千]+条|$)',
            re.MULTILINE
        )
        
        # 用于提取条款编号
        self.number_pattern = re.compile(r'第[零一二三四五六七八九十百千]+条')
    
    def parse_file(self, file_path: str) -> Tuple[str, List[Dict]]:
        """
        解析单个法规文档文件
        
        Args:
            file_path: 文件路径
            
        Returns:
            (法规标题, 条款列表)
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取文件名作为法规标题（去掉日期和.md后缀）
        filename = os.path.basename(file_path)
        title = re.sub(r'_\d{8}\.md$', '', filename)
        
        # 提取所有条款
        clauses = self._extract_clauses(content)
        
        return title, clauses
    
    def _extract_clauses(self, content: str) -> List[Dict]:
        """
        从文档内容中提取所有条款
        
        Args:
            content: 文档内容
            
        Returns:
            条款列表，每个条款包含编号和内容
        """
        clauses = []
        
        # 使用正则表达式查找所有"第X条"
        matches = self.clause_pattern.finditer(content)
        
        for match in matches:
            clause_text = match.group(0).strip()
            
            # 提取条款编号
            number_match = self.number_pattern.search(clause_text)
            if number_match:
                clause_number = number_match.group(0)
                
                # 清理条款内容（去除多余空白）
                clause_content = clause_text.strip()
                clause_content = re.sub(r'\s+', ' ', clause_content)
                
                # 跳过太短的条款（可能是误匹配）
                if len(clause_content) > 10:
                    clauses.append({
                        'clause_number': clause_number,
                        'content': clause_content
                    })
        
        return clauses
    
    def parse_directory(self, directory_path: str) -> List[Tuple[str, str, List[Dict]]]:
        """
        解析整个目录中的所有法规文档
        
        Args:
            directory_path: 目录路径
            
        Returns:
            列表，每个元素为 (法规标题, 源文件路径, 条款列表)
        """
        results = []
        
        # 遍历目录中的所有.md文件
        for filename in os.listdir(directory_path):
            if filename.endswith('.md'):
                file_path = os.path.join(directory_path, filename)
                
                try:
                    title, clauses = self.parse_file(file_path)
                    results.append((title, file_path, clauses))
                    print(f"✓ 已解析: {title} ({len(clauses)} 条)")
                except Exception as e:
                    print(f"✗ 解析失败: {filename} - {str(e)}")
        
        return results
    
    def search_clause_by_content(
        self, 
        parsed_data: List[Tuple[str, str, List[Dict]]], 
        search_text: str
    ) -> List[Dict]:
        """
        根据内容片段搜索条款
        
        Args:
            parsed_data: 解析后的数据
            search_text: 要搜索的文本片段
            
        Returns:
            匹配的条款列表
        """
        results = []
        
        for title, file_path, clauses in parsed_data:
            for clause in clauses:
                if search_text in clause['content']:
                    results.append({
                        'regulation_title': title,
                        'clause_number': clause['clause_number'],
                        'content': clause['content'],
                        'source_file': file_path
                    })
        
        return results


def test_parser():
    """测试解析器功能"""
    parser = RegulationParser()
    
    # 测试解析regulations目录
    regulations_dir = '../regulations'
    if os.path.exists(regulations_dir):
        print("开始解析法规文档...")
        results = parser.parse_directory(regulations_dir)
        
        print(f"\n总共解析 {len(results)} 个法规文档")
        
        # 显示每个法规的条款数量
        for title, _, clauses in results:
            print(f"  - {title}: {len(clauses)} 条")
        
        # 测试搜索功能
        print("\n测试搜索功能（搜索'公开招标'）:")
        search_results = parser.search_clause_by_content(results, '公开招标')
        print(f"找到 {len(search_results)} 条相关条款")
        
        if search_results:
            print(f"\n示例：{search_results[0]['regulation_title']} - {search_results[0]['clause_number']}")
            print(f"内容：{search_results[0]['content'][:100]}...")
    else:
        print(f"错误: 未找到目录 {regulations_dir}")


if __name__ == "__main__":
    test_parser()
