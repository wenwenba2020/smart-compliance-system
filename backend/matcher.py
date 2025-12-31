"""
条款匹配器

实现基于审核规则的条款匹配逻辑
"""

from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from database import AuditRule, AuditorRole, DocumentType, Clause, Regulation


class SimpleMatcher:
    """简单的条款匹配器"""
    
    def __init__(self, db_session: Session):
        """
        初始化匹配器
        
        Args:
            db_session: 数据库会话
        """
        self.session = db_session
    
    def match_clauses(
        self, 
        role_name: str, 
        document_type: str
    ) -> List[Dict]:
        """
        根据审核角色和单据类型匹配相关条款
        
        Args:
            role_name: 审核角色名称
            document_type: 单据类型名称
            
        Returns:
            匹配的条款列表
        """
        # 查询匹配的审核规则
        rules = (
            self.session.query(AuditRule)
            .join(AuditorRole, AuditRule.role_id == AuditorRole.id)
            .join(DocumentType, AuditRule.document_type_id == DocumentType.id)
            .join(Clause, AuditRule.clause_id == Clause.id)
            .filter(
                AuditorRole.role_name == role_name,
                DocumentType.type_name == document_type
            )
            .order_by(AuditRule.priority.desc())  # 按优先级排序
            .all()
        )
        
        if not rules:
            return []
        
        # 格式化返回结果
        results = []
        for rule in rules:
            clause = rule.clause
            regulation = clause.regulation
            
            results.append({
                'clause_id': clause.id,
                'regulation_id': regulation.id,
                'regulation_title': regulation.title,
                'clause_number': clause.clause_number,
                'content': clause.content,
                'source': rule.source,
                'priority': rule.priority
            })
        
        return results
    
    def get_all_roles(self) -> List[Dict]:
        """
        获取所有审核角色
        
        Returns:
            角色列表
        """
        roles = self.session.query(AuditorRole).all()
        return [
            {
                'id': role.id,
                'role_name': role.role_name,
                'responsibilities': role.responsibilities
            }
            for role in roles
        ]
    
    def get_all_document_types(self) -> List[Dict]:
        """
        获取所有单据类型
        
        Returns:
            单据类型列表
        """
        doc_types = self.session.query(DocumentType).all()
        return [
            {
                'id': dt.id,
                'type_name': dt.type_name,
                'description': dt.description
            }
            for dt in doc_types
        ]
    
    def get_regulations_summary(self) -> List[Dict]:
        """
        获取所有法规的摘要信息
        
        Returns:
            法规摘要列表
        """
        regulations = self.session.query(Regulation).all()
        
        results = []
        for reg in regulations:
            clause_count = self.session.query(Clause).filter(
                Clause.regulation_id == reg.id
            ).count()
            
            results.append({
                'id': reg.id,
                'title': reg.title,
                'source_file': reg.source_file,
                'clause_count': clause_count
            })
        
        return results
    
    def search_clauses_by_keyword(self, keyword: str, limit: int = 20) -> List[Dict]:
        """
        根据关键词搜索条款
        
        Args:
            keyword: 搜索关键词
            limit: 返回结果数量限制
            
        Returns:
            匹配的条款列表
        """
        clauses = (
            self.session.query(Clause)
            .join(Regulation)
            .filter(Clause.content.like(f'%{keyword}%'))
            .limit(limit)
            .all()
        )
        
        results = []
        for clause in clauses:
            results.append({
                'clause_id': clause.id,
                'regulation_title': clause.regulation.title,
                'clause_number': clause.clause_number,
                'content': clause.content
            })
        
        return results


def test_matcher():
    """测试匹配器功能"""
    from database import SessionLocal
    
    db = SessionLocal()
    matcher = SimpleMatcher(db)
    
    try:
        # 测试获取角色
        print("所有审核角色:")
        roles = matcher.get_all_roles()
        for role in roles:
            print(f"  - {role['role_name']}")
        
        # 测试获取单据类型
        print("\n所有单据类型:")
        doc_types = matcher.get_all_document_types()
        for dt in doc_types:
            print(f"  - {dt['type_name']}")
        
        # 测试匹配
        if roles and doc_types:
            print(f"\n测试匹配: {roles[0]['role_name']} + {doc_types[0]['type_name']}")
            results = matcher.match_clauses(
                roles[0]['role_name'], 
                doc_types[0]['type_name']
            )
            print(f"匹配到 {len(results)} 条相关条款")
            
            if results:
                print(f"\n示例条款:")
                print(f"  法规: {results[0]['regulation_title']}")
                print(f"  条款: {results[0]['clause_number']}")
                print(f"  内容: {results[0]['content'][:100]}...")
        
    finally:
        db.close()


if __name__ == "__main__":
    test_matcher()
