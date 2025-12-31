"""
智能合规审核系统 - FastAPI应用

提供RESTful API接口用于:
- 查询匹配的法规条款
- 管理审核角色和单据类型
- 搜索法规条款
"""

from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import os
import shutil
from pathlib import Path

from database import get_db, AuditorRole, DocumentType, Regulation, Clause, AuditRule
from matcher import SimpleMatcher
from document_parser import DocumentParser


# ============ 响应模型定义 ============

class ClauseResponse(BaseModel):
    """条款响应模型"""
    clause_id: int
    regulation_id: int
    regulation_title: str
    clause_number: Optional[str]
    content: str
    source: str
    priority: int


class MatchResponse(BaseModel):
    """匹配查询响应模型"""
    role: str
    document_type: str
    matched_clauses: List[ClauseResponse]
    total: int


class RoleResponse(BaseModel):
    """角色响应模型"""
    id: int
    role_name: str
    responsibilities: Optional[str]


class DocumentTypeResponse(BaseModel):
    """单据类型响应模型"""
    id: int
    type_name: str
    description: Optional[str]


class RegulationSummary(BaseModel):
    """法规摘要模型"""
    id: int
    title: str
    source_file: Optional[str]
    clause_count: int


# ============ FastAPI 应用初始化 ============

app = FastAPI(
    title="智能合规审核系统",
    description="基于语义理解的合规审核系统API",
    version="1.0.0 (MVP)"
)

# 配置CORS（跨域资源共享）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ API 路由 ============

@app.get("/", tags=["根路径"])
def root():
    """
    API根路径
    
    返回系统基本信息
    """
    return {
        "name": "智能合规审核系统",
        "version": "1.0.0 (MVP)",
        "description": "基于语义理解的合规审核系统",
        "docs": "/docs",
        "endpoints": {
            "match": "/api/match",
            "roles": "/api/roles",
            "document_types": "/api/document-types",
            "regulations": "/api/regulations",
            "search": "/api/search"
        }
    }


@app.get("/api/match", response_model=MatchResponse, tags=["核心功能"])
def match_clauses(
    role: str = Query(..., description="审核角色名称，如：商务管理员"),
    document_type: str = Query(..., description="单据类型名称，如：采购招标/比选/谈判/评审结论建议"),
    db: Session = Depends(get_db)
):
    """
    匹配法规条款
    
    根据审核角色和单据类型，返回相关的法规条款列表。
    
    **参数:**
    - **role**: 审核角色名称
    - **document_type**: 单据类型名称
    
    **返回:**
    - 匹配的法规条款列表，按优先级排序
    
    **示例:**
    ```
    GET /api/match?role=商务管理员&document_type=采购招标/比选/谈判/评审结论建议
    ```
    """
    matcher = SimpleMatcher(db)
    
    # 验证角色是否存在
    role_obj = db.query(AuditorRole).filter(AuditorRole.role_name == role).first()
    if not role_obj:
        raise HTTPException(status_code=404, detail=f"未找到审核角色: {role}")
    
    # 验证单据类型是否存在
    doc_type_obj = db.query(DocumentType).filter(DocumentType.type_name == document_type).first()
    if not doc_type_obj:
        raise HTTPException(status_code=404, detail=f"未找到单据类型: {document_type}")
    
    # 执行匹配
    results = matcher.match_clauses(role, document_type)
    
    return {
        'role': role,
        'document_type': document_type,
        'matched_clauses': results,
        'total': len(results)
    }


@app.get("/api/roles", response_model=List[RoleResponse], tags=["数据管理"])
def list_roles(db: Session = Depends(get_db)):
    """
    获取所有审核角色
    
    返回系统中所有已定义的审核角色列表。
    """
    matcher = SimpleMatcher(db)
    roles = matcher.get_all_roles()
    return roles


@app.get("/api/document-types", response_model=List[DocumentTypeResponse], tags=["数据管理"])
def list_document_types(db: Session = Depends(get_db)):
    """
    获取所有单据类型
    
    返回系统中所有已定义的单据类型列表。
    """
    matcher = SimpleMatcher(db)
    doc_types = matcher.get_all_document_types()
    return doc_types


@app.get("/api/regulations", response_model=List[RegulationSummary], tags=["数据管理"])
def list_regulations(db: Session = Depends(get_db)):
    """
    获取所有法规摘要
    
    返回系统中所有法规文档的摘要信息，包括条款数量。
    """
    matcher = SimpleMatcher(db)
    regulations = matcher.get_regulations_summary()
    return regulations


@app.get("/api/search", tags=["搜索功能"])
def search_clauses(
    keyword: str = Query(..., description="搜索关键词"),
    limit: int = Query(20, ge=1, le=100, description="返回结果数量限制"),
    db: Session = Depends(get_db)
):
    """
    根据关键词搜索条款
    
    在所有法规条款中搜索包含指定关键词的条款。
    
    **参数:**
    - **keyword**: 搜索关键词
    - **limit**: 返回结果数量限制（1-100）
    
    **示例:**
    ```
    GET /api/search?keyword=公开招标&limit=10
    ```
    """
    matcher = SimpleMatcher(db)
    results = matcher.search_clauses_by_keyword(keyword, limit)
    
    return {
        'keyword': keyword,
        'results': results,
        'total': len(results)
    }


@app.get("/health", tags=["系统"])
def health_check():
    """
    健康检查
    
    用于检查API服务是否正常运行。
    """
    return {"status": "healthy", "service": "smart_compliance"}


@app.get("/api/audit-rules", tags=["数据管理"])
def get_audit_rules(db: Session = Depends(get_db)):
    """
    获取所有审核规则
    
    返回角色-单据类型-条款之间的关联关系。
    """
    rules = (
        db.query(AuditRule)
        .join(AuditorRole, AuditRule.role_id == AuditorRole.id)
        .join(DocumentType, AuditRule.document_type_id == DocumentType.id)
        .join(Clause, AuditRule.clause_id == Clause.id)
        .join(Regulation, Clause.regulation_id == Regulation.id)
        .all()
    )
    
    results = []
    for rule in rules:
        results.append({
            'id': rule.id,
            'role': {
                'id': rule.role.id,
                'role_name': rule.role.role_name
            },
            'document_type': {
                'id': rule.document_type.id,
                'type_name': rule.document_type.type_name
            },
            'clause': {
                'id': rule.clause.id,
                'clause_number': rule.clause.clause_number,
                'content': rule.clause.content,
                'regulation': {
                    'id': rule.clause.regulation.id,
                    'title': rule.clause.regulation.title
                }
            },
            'source': rule.source,
            'priority': rule.priority
        })
    
    return results


@app.post("/api/regulations/upload", tags=["数据管理"])
async def upload_regulation(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    上传法规文档
    
    支持PDF和Word文档（.pdf, .docx, .doc），自动解析并导入系统。
    
    **参数:**
    - **file**: 上传的文件
    
    **返回:**
    - 导入的法规信息和条款数量
    
    **示例:**
    ```bash
    curl -X POST "http://localhost:10000/api/regulations/upload" \
         -F "file=@法规文档.pdf"
    ```
    """
    # 检查文件类型
    allowed_extensions = ['.pdf', '.doc', '.docx']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件格式。仅支持: {', '.join(allowed_extensions)}"
        )
    
    # 创建临时目录
    upload_dir = Path("./data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # 保存上传的文件
    temp_file_path = upload_dir / file.filename
    
    try:
        # 保存文件
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 解析文档
        parser = DocumentParser()
        title, clauses = parser.parse_file(str(temp_file_path))
        
        if not clauses:
            raise HTTPException(
                status_code=400,
                detail="未能从文档中提取到有效的法规条款"
            )
        
        # 检查法规是否已存在
        existing = db.query(Regulation).filter(
            Regulation.title == title
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"法规 '{title}' 已存在于系统中"
            )
        
        # 创建法规记录
        regulation = Regulation(
            title=title,
            source_file=file.filename
        )
        db.add(regulation)
        db.flush()  # 获取regulation.id
        
        # 创建条款记录
        for clause_data in clauses:
            clause = Clause(
                regulation_id=regulation.id,
                clause_number=clause_data['clause_number'],
                content=clause_data['content']
            )
            db.add(clause)
        
        db.commit()
        
        return {
            "success": True,
            "regulation_id": regulation.id,
            "regulation_title": regulation.title,
            "clause_count": len(clauses),
            "message": f"成功导入法规 '{title}'，共 {len(clauses)} 条"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"文档处理失败: {str(e)}"
        )
    finally:
        # 清理临时文件
        if temp_file_path.exists():
            temp_file_path.unlink()


# ============ 启动说明 ============

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("智能合规审核系统 API 服务")
    print("=" * 60)
    print("\n启动服务器...")
    print("访问 API 文档: http://localhost:10000/docs")
    print("=" * 60)
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=10000,
        reload=True
    )
