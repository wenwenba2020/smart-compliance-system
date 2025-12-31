"""
数据初始化脚本

负责:
1. 创建数据库表
2. 解析并导入法规文档
3. 导入示例数据（从截图中提取的审核规则）
"""

import os
import sys
from database import (
    init_database, SessionLocal, 
    Regulation, Clause, AuditorRole, DocumentType, AuditRule
)
from parser import RegulationParser


def import_regulations(db_session, regulations_dir='../regulations'):
    """
    导入法规文档到数据库
    
    Args:
        db_session: 数据库会话
        regulations_dir: 法规文档目录路径
    """
    print("\n=== 导入法规文档 ===")
    
    parser = RegulationParser()
    parsed_data = parser.parse_directory(regulations_dir)
    
    for title, source_file, clauses in parsed_data:
        # 检查法规是否已存在
        existing = db_session.query(Regulation).filter(
            Regulation.title == title
        ).first()
        
        if existing:
            print(f"跳过已存在的法规: {title}")
            continue
        
        # 创建法规记录
        regulation = Regulation(
            title=title,
            source_file=source_file
        )
        db_session.add(regulation)
        db_session.flush()  # 获取regulation.id
        
        # 创建条款记录
        for clause_data in clauses:
            clause = Clause(
                regulation_id=regulation.id,
                clause_number=clause_data['clause_number'],
                content=clause_data['content']
            )
            db_session.add(clause)
        
        db_session.commit()
        print(f"✓ 已导入: {title} ({len(clauses)} 条)")
    
    print(f"\n法规文档导入完成! 共 {len(parsed_data)} 个法规")


def import_example_data(db_session):
    """
    导入示例数据（从截图中提取）
    
    包括:
    - 审核角色
    - 单据类型
    - 审核规则
    """
    print("\n=== 导入示例数据 ===")
    
    # 1. 创建审核角色
    print("\n1. 创建审核角色...")
    roles_data = [
        {
            'role_name': '商务管理员',
            'responsibilities': '负责采购招标、比选、谈判等商务活动的合规性审核，确保采购流程符合法律法规要求'
        },
        {
            'role_name': '厂领导',
            'responsibilities': '负责重大采购项目的最终审批，把控采购决策的合规性和合理性'
        }
    ]
    
    roles = {}
    for role_data in roles_data:
        existing = db_session.query(AuditorRole).filter(
            AuditorRole.role_name == role_data['role_name']
        ).first()
        
        if existing:
            roles[role_data['role_name']] = existing
            print(f"  - {role_data['role_name']} (已存在)")
        else:
            role = AuditorRole(**role_data)
            db_session.add(role)
            db_session.flush()
            roles[role_data['role_name']] = role
            print(f"  ✓ {role_data['role_name']}")
    
    # 2. 创建单据类型
    print("\n2. 创建单据类型...")
    doc_types_data = [
        {
            'type_name': '采购招标/比选/谈判/评审结论建议',
            'description': '采购活动中的招标、比选、谈判等环节的评审结论和建议文档'
        }
    ]
    
    doc_types = {}
    for dt_data in doc_types_data:
        existing = db_session.query(DocumentType).filter(
            DocumentType.type_name == dt_data['type_name']
        ).first()
        
        if existing:
            doc_types[dt_data['type_name']] = existing
            print(f"  - {dt_data['type_name']} (已存在)")
        else:
            doc_type = DocumentType(**dt_data)
            db_session.add(doc_type)
            db_session.flush()
            doc_types[dt_data['type_name']] = doc_type
            print(f"  ✓ {dt_data['type_name']}")
    
    db_session.commit()
    
    # 3. 创建审核规则（关联角色-单据-条款）
    print("\n3. 创建审核规则...")
    
    # 从截图中提取的规则映射
    rules_mapping = [
        # 商务管理员的规则
        {
            'role': '商务管理员',
            'document_type': '采购招标/比选/谈判/评审结论建议',
            'clause_keywords': [
                '采购人不得将应当以公开招标方式采购的货物或者服务化整为零',
                '具有特殊性，只能从有限范围的供应商处采购的',
                '招标后没有供应商投标或者没有合格标的',
                '技术复杂或者性质特殊，不能确定详细规格',
                '采用竞争性谈判方式采购的',
            ]
        },
        # 厂领导的规则
        {
            'role': '厂领导',
            'document_type': '采购招标/比选/谈判/评审结论建议',
            'clause_keywords': [
                '在招标采购中，出现下列情形之一的，应予废标',
                '符合专业条件的供应商或者对招标文件作实质响应的供应商不足三家',
                '废标后，采购人应当将废标理由通知所有投标人',
                '政府采购合同的双方当事人不得擅自变更、中止或者终止合同',
            ]
        }
    ]
    
    rule_count = 0
    for rule_mapping in rules_mapping:
        role = roles[rule_mapping['role']]
        doc_type = doc_types[rule_mapping['document_type']]
        
        print(f"\n  处理: {rule_mapping['role']} + {rule_mapping['document_type']}")
        
        for keyword in rule_mapping['clause_keywords']:
            # 搜索包含关键词的条款
            clauses = db_session.query(Clause).filter(
                Clause.content.like(f'%{keyword[:20]}%')  # 使用关键词前20个字符搜索
            ).all()
            
            for clause in clauses:
                # 检查规则是否已存在
                existing_rule = db_session.query(AuditRule).filter(
                    AuditRule.role_id == role.id,
                    AuditRule.document_type_id == doc_type.id,
                    AuditRule.clause_id == clause.id
                ).first()
                
                if not existing_rule:
                    audit_rule = AuditRule(
                        role_id=role.id,
                        document_type_id=doc_type.id,
                        clause_id=clause.id,
                        source='example',
                        priority=10  # 示例数据优先级设为10
                    )
                    db_session.add(audit_rule)
                    rule_count += 1
                    print(f"    ✓ 关联条款: {clause.clause_number} ({clause.regulation.title})")
                    break  # 只关联第一个匹配的条款
    
    db_session.commit()
    print(f"\n审核规则创建完成! 共 {rule_count} 条规则")


def main():
    """主函数"""
    print("=" * 60)
    print("智能合规审核系统 - 数据初始化")
    print("=" * 60)
    
    # 1. 初始化数据库
    print("\n步骤 1: 初始化数据库...")
    init_database()
    
    # 2. 创建数据库会话
    db = SessionLocal()
    
    try:
        # 3. 导入法规文档
        regulations_dir = '../regulations'
        if not os.path.exists(regulations_dir):
            print(f"\n错误: 未找到法规文档目录: {regulations_dir}")
            print("请确保regulations目录存在且包含法规文档")
            sys.exit(1)
        
        import_regulations(db, regulations_dir)
        
        # 4. 导入示例数据
        import_example_data(db)
        
        print("\n" + "=" * 60)
        print("数据初始化完成!")
        print("=" * 60)
        
        # 5. 显示统计信息
        print("\n数据库统计:")
        print(f"  - 法规文档: {db.query(Regulation).count()} 个")
        print(f"  - 法规条款: {db.query(Clause).count()} 条")
        print(f"  - 审核角色: {db.query(AuditorRole).count()} 个")
        print(f"  - 单据类型: {db.query(DocumentType).count()} 个")
        print(f"  - 审核规则: {db.query(AuditRule).count()} 条")
        
        print("\n您现在可以启动API服务:")
        print("  uvicorn app:app --reload --port 10000")
        
    except Exception as e:
        print(f"\n错误: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
