"""
API测试脚本

用于测试智能合规审核系统的API功能
"""

import requests
import json
from typing import Dict


class APITester:
    """API测试器"""
    
    def __init__(self, base_url: str = "http://localhost:10000"):
        """
        初始化测试器
        
        Args:
            base_url: API服务的基础URL
        """
        self.base_url = base_url
    
    def test_root(self):
        """测试根路径"""
        print("\n=== 测试根路径 ===")
        response = requests.get(f"{self.base_url}/")
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        return response.status_code == 200
    
    def test_health(self):
        """测试健康检查"""
        print("\n=== 测试健康检查 ===")
        response = requests.get(f"{self.base_url}/health")
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
        return response.status_code == 200
    
    def test_list_roles(self):
        """测试获取审核角色列表"""
        print("\n=== 测试获取审核角色列表 ===")
        response = requests.get(f"{self.base_url}/api/roles")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            roles = response.json()
            print(f"角色数量: {len(roles)}")
            for role in roles:
                print(f"  - {role['role_name']}")
            return roles
        else:
            print(f"错误: {response.text}")
            return []
    
    def test_list_document_types(self):
        """测试获取单据类型列表"""
        print("\n=== 测试获取单据类型列表 ===")
        response = requests.get(f"{self.base_url}/api/document-types")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            doc_types = response.json()
            print(f"单据类型数量: {len(doc_types)}")
            for dt in doc_types:
                print(f"  - {dt['type_name']}")
            return doc_types
        else:
            print(f"错误: {response.text}")
            return []
    
    def test_list_regulations(self):
        """测试获取法规列表"""
        print("\n=== 测试获取法规列表 ===")
        response = requests.get(f"{self.base_url}/api/regulations")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            regulations = response.json()
            print(f"法规数量: {len(regulations)}")
            for reg in regulations:
                print(f"  - {reg['title']}: {reg['clause_count']} 条")
            return regulations
        else:
            print(f"错误: {response.text}")
            return []
    
    def test_match_clauses(self, role: str, document_type: str):
        """
        测试条款匹配
        
        Args:
            role: 审核角色
            document_type: 单据类型
        """
        print(f"\n=== 测试条款匹配 ===")
        print(f"角色: {role}")
        print(f"单据类型: {document_type}")
        
        params = {
            'role': role,
            'document_type': document_type
        }
        
        response = requests.get(f"{self.base_url}/api/match", params=params)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"匹配到 {result['total']} 条相关条款\n")
            
            for i, clause in enumerate(result['matched_clauses'], 1):
                print(f"条款 {i}:")
                print(f"  法规: {clause['regulation_title']}")
                print(f"  条款: {clause['clause_number']}")
                print(f"  内容: {clause['content'][:100]}...")
                print(f"  来源: {clause['source']}")
                print(f"  优先级: {clause['priority']}")
                print()
            
            return result
        else:
            print(f"错误: {response.text}")
            return None
    
    def test_search(self, keyword: str, limit: int = 10):
        """
        测试关键词搜索
        
        Args:
            keyword: 搜索关键词
            limit: 返回结果数量
        """
        print(f"\n=== 测试关键词搜索 ===")
        print(f"关键词: {keyword}")
        
        params = {
            'keyword': keyword,
            'limit': limit
        }
        
        response = requests.get(f"{self.base_url}/api/search", params=params)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"找到 {result['total']} 条相关条款\n")
            
            for i, clause in enumerate(result['results'][:3], 1):  # 只显示前3条
                print(f"结果 {i}:")
                print(f"  法规: {clause['regulation_title']}")
                print(f"  条款: {clause['clause_number']}")
                print(f"  内容: {clause['content'][:80]}...")
                print()
            
            return result
        else:
            print(f"错误: {response.text}")
            return None
    
    def run_all_tests(self):
        """运行所有测试"""
        print("=" * 60)
        print("智能合规审核系统 - API 测试")
        print("=" * 60)
        
        try:
            # 基础测试
            self.test_root()
            self.test_health()
            
            # 数据列表测试
            roles = self.test_list_roles()
            doc_types = self.test_list_document_types()
            self.test_list_regulations()
            
            # 核心功能测试
            if roles and doc_types:
                # 测试商务管理员
                self.test_match_clauses(
                    role='商务管理员',
                    document_type='采购招标/比选/谈判/评审结论建议'
                )
                
                # 测试厂领导
                self.test_match_clauses(
                    role='厂领导',
                    document_type='采购招标/比选/谈判/评审结论建议'
                )
            
            # 搜索测试
            self.test_search('公开招标')
            
            print("\n" + "=" * 60)
            print("所有测试完成!")
            print("=" * 60)
            
        except requests.exceptions.ConnectionError:
            print("\n错误: 无法连接到API服务")
            print("请确保服务已启动: uvicorn app:app --reload --port 10000")
        except Exception as e:
            print(f"\n测试出错: {str(e)}")
            import traceback
            traceback.print_exc()


def main():
    """主函数"""
    tester = APITester()
    tester.run_all_tests()


if __name__ == "__main__":
    main()
