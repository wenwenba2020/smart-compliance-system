"""
数据库模型和连接管理

定义了合规审核系统的核心数据模型:
- Regulation: 法规文档
- Clause: 法规条款
- AuditorRole: 审核角色
- DocumentType: 单据类型
- AuditRule: 审核规则（角色-单据-条款的关联）
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
import os

# 数据库文件路径
# 生产环境使用环境变量指定的路径，开发环境使用本地路径
db_path = os.getenv('DATABASE_PATH', './data/compliance.db')
DATABASE_URL = f"sqlite:///{db_path}"

# 创建数据目录（如果不存在）
db_dir = os.path.dirname(db_path) if '/' in db_path else './data'
if db_dir and db_dir != '/data':  # /data通常是Railway的volume mount point
    os.makedirs(db_dir, exist_ok=True)

# 创建数据库引擎
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},  # SQLite特定配置
    echo=False  # 设置为True可以看到SQL语句
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 声明基类
Base = declarative_base()


class Regulation(Base):
    """法规文档表"""
    __tablename__ = 'regulations'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False, comment="法规标题")
    source_file = Column(String(255), comment="源文件路径")
    
    # 关联关系
    clauses = relationship('Clause', back_populates='regulation', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Regulation(id={self.id}, title='{self.title}')>"


class Clause(Base):
    """法规条款表"""
    __tablename__ = 'clauses'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    regulation_id = Column(Integer, ForeignKey('regulations.id'), nullable=False, comment="所属法规ID")
    clause_number = Column(String(50), comment="条款编号，如：第二十八条")
    content = Column(Text, nullable=False, comment="条款内容")
    
    # 关联关系
    regulation = relationship('Regulation', back_populates='clauses')
    audit_rules = relationship('AuditRule', back_populates='clause')
    
    def __repr__(self):
        return f"<Clause(id={self.id}, clause_number='{self.clause_number}')>"


class AuditorRole(Base):
    """审核角色表"""
    __tablename__ = 'auditor_roles'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(100), unique=True, nullable=False, comment="角色名称")
    responsibilities = Column(Text, comment="职责描述")
    
    # 关联关系
    audit_rules = relationship('AuditRule', back_populates='role')
    
    def __repr__(self):
        return f"<AuditorRole(id={self.id}, role_name='{self.role_name}')>"


class DocumentType(Base):
    """单据类型表"""
    __tablename__ = 'document_types'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    type_name = Column(String(200), unique=True, nullable=False, comment="单据类型名称")
    description = Column(Text, comment="单据描述")
    
    # 关联关系
    audit_rules = relationship('AuditRule', back_populates='document_type')
    
    def __repr__(self):
        return f"<DocumentType(id={self.id}, type_name='{self.type_name}')>"


class AuditRule(Base):
    """
    审核规则表
    
    定义了审核角色-单据类型-法规条款之间的关联关系
    """
    __tablename__ = 'audit_rules'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey('auditor_roles.id'), nullable=False, comment="审核角色ID")
    document_type_id = Column(Integer, ForeignKey('document_types.id'), nullable=False, comment="单据类型ID")
    clause_id = Column(Integer, ForeignKey('clauses.id'), nullable=False, comment="条款ID")
    source = Column(String(50), default='example', comment="规则来源: example/manual/auto")
    priority = Column(Integer, default=0, comment="优先级，数字越大优先级越高")
    
    # 关联关系
    role = relationship('AuditorRole', back_populates='audit_rules')
    document_type = relationship('DocumentType', back_populates='audit_rules')
    clause = relationship('Clause', back_populates='audit_rules')
    
    def __repr__(self):
        return f"<AuditRule(id={self.id}, role_id={self.role_id}, document_type_id={self.document_type_id})>"


def init_database():
    """初始化数据库，创建所有表"""
    import os
    
    # 确保data目录存在
    os.makedirs('./data', exist_ok=True)
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    print("数据库表创建成功!")


def get_db():
    """
    获取数据库会话的依赖函数
    
    用于FastAPI的依赖注入
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    # 直接运行此文件可以初始化数据库
    init_database()
