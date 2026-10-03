import io
from typing import Dict, Any
from pypdf import PdfReader
from backend.services.ai_assistant import AIAssistantService

class PDFParserService:
    @staticmethod
    def parse_pdf_bytes(file_bytes: bytes, filename: str = "") -> Dict[str, Any]:
        """解析上传的 PDF 文件二进制流，提取文本并自动识别核心技能"""
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text_chunks = []
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_chunks.append(page_text.strip())
            
            full_text = "\n\n".join(text_chunks)
            if not full_text.strip():
                return {
                    "success": False,
                    "error": "未能从 PDF 中提取到可读文本（可能是图片扫描件或加密文档）"
                }

            # 自动提取技术栈标签
            skills = AIAssistantService.extract_skills(full_text)
            
            # 尝试从文件名或前几行推断版本名称
            default_version_name = filename.rsplit(".", 1)[0] if filename else "PDF解析简历"
            
            return {
                "success": True,
                "version_name": default_version_name,
                "raw_content": full_text,
                "highlights": ", ".join(skills[:8]),
                "page_count": len(reader.pages)
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"PDF 解析失败: {str(e)}"
            }
