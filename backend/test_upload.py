"""
文件上传功能测试
"""

import requests
import os

API_BASE_URL = "http://localhost:10000"


def test_upload_regulation():
    """测试上传法规文档"""
    
    # 测试文件路径（使用现有的markdown文件作为测试）
    test_file = "../regulations/中华人民共和国招标投标法_20171227.md"
    
    if not os.path.exists(test_file):
        print(f"测试文件不存在: {test_file}")
        return
    
    print("=" * 60)
    print("测试文件上传功能")
    print("=" * 60)
    
    # 准备文件
    with open(test_file, 'rb') as f:
        files = {'file': (os.path.basename(test_file), f, 'text/markdown')}
        
        try:
            # 发送上传请求
            print(f"\n上传文件: {os.path.basename(test_file)}")
            response = requests.post(
                f"{API_BASE_URL}/api/regulations/upload",
                files=files
            )
            
            print(f"状态码: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\n✅ 上传成功!")
                print(f"  法规标题: {result['regulation_title']}")
                print(f"  条款数量: {result['clause_count']}")
                print(f"  消息: {result['message']}")
            else:
                error = response.json()
                print(f"\n❌ 上传失败: {error.get('detail', '未知错误')}")
                
        except requests.exceptions.ConnectionError:
            print("\n错误: 无法连接到API服务")
            print("请确保后端服务已启动: uvicorn app:app --reload --port 10000")
        except Exception as e:
            print(f"\n错误: {str(e)}")


def check_api_health():
    """检查API服务状态"""
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✅ API服务正常运行")
            return True
        else:
            print("❌ API服务异常")
            return False
    except:
        print("❌ 无法连接到API服务")
        return False


if __name__ == "__main__":
    print("检查API服务状态...")
    if check_api_health():
        print("\n开始测试上传功能...\n")
        test_upload_regulation()
    else:
        print("\n请先启动后端服务:")
        print("  cd backend")
        print("  uvicorn app:app --reload --port 10000")
