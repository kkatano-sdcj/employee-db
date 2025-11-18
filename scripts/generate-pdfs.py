#!/usr/bin/env python3
"""
MarkdownファイルをPDFに変換するスクリプト
要件定義書と基本設計書を生成します。
"""

import os
import sys
from pathlib import Path

try:
    import markdown
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
except ImportError as e:
    print(f"必要なパッケージがインストールされていません: {e}")
    print("以下のコマンドでインストールしてください:")
    print("  pip install markdown weasyprint")
    sys.exit(1)


def markdown_to_pdf(md_path, pdf_path, title=""):
    """MarkdownファイルをPDFに変換"""
    # Markdownファイルを読み込む
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # MarkdownをHTMLに変換
    md = markdown.Markdown(extensions=['extra', 'codehilite', 'tables', 'toc'])
    html_content = md.convert(md_content)
    
    # HTMLテンプレートを作成
    html_template = f"""
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
        <style>
            @page {{
                size: A4;
                margin: 20mm;
            }}
            body {{
                font-family: 'Noto Sans CJK JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', sans-serif;
                font-size: 11pt;
                line-height: 1.6;
                color: #333;
            }}
            h1 {{
                font-size: 24pt;
                font-weight: bold;
                margin-top: 20pt;
                margin-bottom: 12pt;
                border-bottom: 2pt solid #333;
                padding-bottom: 6pt;
                page-break-after: avoid;
            }}
            h2 {{
                font-size: 18pt;
                font-weight: bold;
                margin-top: 16pt;
                margin-bottom: 10pt;
                border-bottom: 1pt solid #666;
                padding-bottom: 4pt;
                page-break-after: avoid;
            }}
            h3 {{
                font-size: 14pt;
                font-weight: bold;
                margin-top: 12pt;
                margin-bottom: 8pt;
                page-break-after: avoid;
            }}
            h4 {{
                font-size: 12pt;
                font-weight: bold;
                margin-top: 10pt;
                margin-bottom: 6pt;
                page-break-after: avoid;
            }}
            p {{
                margin-top: 6pt;
                margin-bottom: 6pt;
            }}
            ul, ol {{
                margin-top: 6pt;
                margin-bottom: 6pt;
                padding-left: 20pt;
            }}
            li {{
                margin-top: 3pt;
                margin-bottom: 3pt;
            }}
            code {{
                font-family: 'Courier New', 'DejaVu Sans Mono', monospace;
                font-size: 10pt;
                background-color: #f5f5f5;
                padding: 2pt 4pt;
                border-radius: 3pt;
            }}
            pre {{
                background-color: #f5f5f5;
                padding: 10pt;
                border-radius: 5pt;
                overflow-x: auto;
                margin-top: 8pt;
                margin-bottom: 8pt;
                page-break-inside: avoid;
            }}
            pre code {{
                background-color: transparent;
                padding: 0;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin-top: 10pt;
                margin-bottom: 10pt;
                page-break-inside: avoid;
            }}
            th, td {{
                border: 1pt solid #ddd;
                padding: 6pt;
                text-align: left;
            }}
            th {{
                background-color: #f0f0f0;
                font-weight: bold;
            }}
            blockquote {{
                border-left: 4pt solid #ddd;
                padding-left: 12pt;
                margin-left: 0;
                color: #666;
                font-style: italic;
            }}
            hr {{
                border: none;
                border-top: 1pt solid #ddd;
                margin: 16pt 0;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # PDFを生成
    try:
        font_config = FontConfiguration()
        HTML(string=html_template).write_pdf(
            pdf_path,
            font_config=font_config
        )
        return True
    except Exception as e:
        print(f"PDF生成エラー: {e}")
        return False


def main():
    """メイン処理"""
    # パス設定
    project_root = Path(__file__).parent.parent
    docs_dir = project_root / 'docs'
    specs_dir = project_root / 'specs' / '001-employee-db-requirements'
    spec_path = specs_dir / 'spec.md'
    plans_path = project_root / 'PLANS.md'
    
    # 出力先ディレクトリの確認
    docs_dir.mkdir(exist_ok=True)
    
    success_count = 0
    
    # 要件定義書の生成
    if spec_path.exists():
        print('要件定義書を生成中...')
        pdf_path = docs_dir / '要件定義書.pdf'
        if markdown_to_pdf(spec_path, pdf_path, '要件定義書'):
            print(f'✓ 要件定義書を生成しました: {pdf_path}')
            success_count += 1
        else:
            print('✗ 要件定義書の生成に失敗しました')
    else:
        print(f'✗ spec.mdが見つかりません: {spec_path}')
    
    # 基本設計書の生成
    if plans_path.exists():
        print('基本設計書を生成中...')
        pdf_path = docs_dir / '基本設計書.pdf'
        if markdown_to_pdf(plans_path, pdf_path, '基本設計書'):
            print(f'✓ 基本設計書を生成しました: {pdf_path}')
            success_count += 1
        else:
            print('✗ 基本設計書の生成に失敗しました')
    else:
        print(f'✗ PLANS.mdが見つかりません: {plans_path}')
    
    if success_count > 0:
        print(f'\n{success_count}件のPDF生成が完了しました。')
    else:
        print('\nPDF生成に失敗しました。')
        sys.exit(1)


if __name__ == '__main__':
    main()

