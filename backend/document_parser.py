"""
文档解析器

支持PDF和Word文档的解析，提取法规条款
"""

import re
import os
from typing import List, Dict, Tuple
from PyPDF2 import PdfReader
from docx import Document


class DocumentParser:
    """文档解析器，支持PDF和Word格式"""
    
    def __init__(self):
        """初始化解析器"""
        # 条款编号的正则模式
        self.clause_pattern = re.compile(
            r'第[零一二三四五六七八九十百千]+条[\s\S]*?(?=第[零一二三四五六七八九十百千]+条|$)',
            re.MULTILINE
        )
        
        # 用于提取条款编号
        self.number_pattern = re.compile(r'第[零一二三四五六七八九十百千]+条')
    
    def parse_pdf(self, file_path: str) -> Tuple[str, List[Dict]]:
        """
        解析PDF文件
        
        Args:
            file_path: PDF文件路径
            
        Returns:
            (文档标题, 条款列表)
        """
        try:
            # 读取PDF
            reader = PdfReader(file_path)
            
            # 提取文本内容
            text_content = ""
            for page in reader.pages:
                text_content += page.extract_text() + "\n"
            
            # 从文件名提取标题
            filename = os.path.basename(file_path)
            title = re.sub(r'\.pdf$', '', filename, flags=re.IGNORECASE)
            
            # 提取条款
            clauses = self._extract_clauses(text_content)
            
            return title, clauses
            
        except Exception as e:
            raise Exception(f"PDF解析失败: {str(e)}")
    
    def parse_word(self, file_path: str) -> Tuple[str, List[Dict]]:
        """
        解析Word文档
        
        Args:
            file_path: Word文件路径
            
        Returns:
            (文档标题, 条款列表)
        """
        try:
            # 读取Word文档
            doc = Document(file_path)
            
            # 提取文本内容
            text_content = ""
            for paragraph in doc.paragraphs:
                text_content += paragraph.text + "\n"
            
            # 从文件名提取标题
            filename = os.path.basename(file_path)
            title = re.sub(r'\.(docx?|DOCX?)$', '', filename)
            
            # 提取条款
            clauses = self._extract_clauses(text_content)
            
            return title, clauses
            
        except Exception as e:
            raise Exception(f"Word文档解析失败: {str(e)}")
    
    def parse_file(self, file_path: str) -> Tuple[str, List[Dict]]:
        """
        根据文件类型自动选择解析器
        
        Args:
            file_path: 文件路径
            
        Returns:
            (文档标题, 条款列表)
        """
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return self.parse_pdf(file_path)
        elif file_ext in ['.doc', '.docx']:
            return self.parse_word(file_path)
        else:
            raise ValueError(f"不支持的文件格式: {file_ext}")
    
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


def test_parser():
    """测试解析器功能"""
    parser = DocumentParser()
    
    # 测试解析PDF（如果存在）
    test_pdf = '../regulations/test.pdf'
    if os.path.exists(test_pdf):
        print("测试PDF解析...")
        title, clauses = parser.parse_pdf(test_pdf)
        print(f"标题: {title}")
        print(f"条款数: {len(clauses)}")
        if clauses:
            print(f"第一条: {clauses[0]['clause_number']}")
    
    # 测试解析Word（如果存在）
    test_word = '../regulations/test.docx'
    if os.path.exists(test_word):
        print("\n测试Word解析...")
        title, clauses = parser.parse_word(test_word)
        print(f"标题: {title}")
        print(f"条款数: {len(clauses)}")
        if clauses:
            print(f"第一条: {clauses[0]['clause_number']}")


if __name__ == "__main__":
    test_parser()
