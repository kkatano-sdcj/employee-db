# PDF契約書生成実装ガイド

## 概要
このドキュメントは、従業員データベースシステムにおける契約書・誓約書のPDF生成機能実装のためのガイドです。

## ファイル構成

### テンプレート定義
- `employment-contract-template.json` - 雇用契約書テンプレート定義
- `pledge-template.json` - 誓約書テンプレート定義
- `database-field-mapping.json` - データベースフィールドマッピング定義

### 元文書
- `パート雇入通知書見本ver_A2025.09.docx` - 雇用契約書の元文書
- `(SDPMS-M-07-R03-12)誓約書.docx` - 誓約書の元文書

## 実装手順

### 1. 必要なパッケージのインストール

```bash
# PDF生成ライブラリ
pnpm add @react-pdf/renderer react-pdf

# または、サーバーサイドでの生成の場合
pnpm add puppeteer pdf-lib

# 日付フォーマット用
pnpm add date-fns
```

### 2. データ取得

```typescript
// 従業員情報と関連データを取得
const getContractData = async (employeeId: string, contractId?: string) => {
  const employee = await db.employee.findUnique({
    where: { id: employeeId },
    include: {
      employmentContracts: {
        where: contractId ? { id: contractId } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      workConditions: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return {
    employee: employee,
    contract: employee.employmentContracts[0],
    workCondition: employee.workConditions[0]
  };
};
```

### 3. テンプレートとデータのマッピング

```typescript
import contractTemplate from './employment-contract-template.json';
import fieldMapping from './database-field-mapping.json';

const mapDataToTemplate = (data: any, template: any) => {
  const mappedData: any = {};

  template.sections.forEach((section: any) => {
    section.fields?.forEach((field: any) => {
      if (field.dbField) {
        // dbFieldからデータを取得
        // 例: "employee.name" -> data.employee.name
        const value = getNestedValue(data, field.dbField);
        mappedData[field.id] = formatValue(value, field.type, field.format);
      } else if (field.defaultText) {
        mappedData[field.id] = field.defaultText;
      }
    });
  });

  return mappedData;
};

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const formatValue = (value: any, type: string, format?: string) => {
  switch (type) {
    case 'date':
      return formatDate(value, format || 'yyyy年MM月dd日');
    case 'currency':
      return `￥${value?.toLocaleString('ja-JP')}`;
    case 'boolean':
      return value ? '有' : '無';
    default:
      return value || '';
  }
};
```

### 4. PDF生成（React PDF使用例）

```tsx
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';

// 日本語フォントの登録
Font.register({
  family: 'NotoSansJP',
  src: '/fonts/NotoSansJP-Regular.otf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSansJP'
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20
  },
  section: {
    marginBottom: 15
  },
  label: {
    fontSize: 10,
    color: '#666'
  },
  value: {
    fontSize: 12,
    marginBottom: 5
  }
});

const ContractPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>雇用契約書</Text>

      {/* ヘッダー部分 */}
      <View style={styles.section}>
        <Text style={styles.value}>{data.contractDate}</Text>
        <Text style={styles.value}>{data.employeeName} 殿</Text>
      </View>

      {/* 各セクションの描画 */}
      {/* ... */}
    </Page>
  </Document>
);

// 使用例
export const GeneratePDFButton = ({ employeeId }: { employeeId: string }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchContractData(employeeId).then(setData);
  }, [employeeId]);

  if (!data) return <div>Loading...</div>;

  return (
    <PDFDownloadLink
      document={<ContractPDF data={data} />}
      fileName={`contract_${data.employeeNumber}_${Date.now()}.pdf`}
    >
      {({ loading }) => loading ? '生成中...' : 'PDF ダウンロード'}
    </PDFDownloadLink>
  );
};
```

### 5. サーバーサイドPDF生成（Puppeteer使用例）

```typescript
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

export const generatePDFServer = async (
  employeeId: string,
  contractId: string
): Promise<Buffer> => {
  // データ取得
  const data = await getContractData(employeeId, contractId);
  const mappedData = mapDataToTemplate(data, contractTemplate);

  // HTMLテンプレートの生成
  const html = await generateHTML(mappedData);

  // Puppeteerで��DFに変換
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm'
    }
  });

  await browser.close();

  // PDFを保存
  const fileName = `contract_${data.employee.employeeNumber}_${Date.now()}.pdf`;
  const filePath = path.join(process.cwd(), 'generated-pdfs', fileName);
  await fs.writeFile(filePath, pdf);

  // データベースにパスを保存
  await db.employmentContract.update({
    where: { id: contractId },
    data: { pdfPath: filePath }
  });

  return pdf;
};

const generateHTML = async (data: any): Promise<string> => {
  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Noto Sans JP', sans-serif; }
        .title { text-align: center; font-size: 24px; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <h1 class="title">雇用契約書</h1>
      <div class="section">
        <div class="field">${data.contractDate}</div>
        <div class="field">${data.employeeName} 殿</div>
      </div>
      <!-- 残りのセクション -->
    </body>
    </html>
  `;
};
```

### 6. API エンドポイント

```typescript
// Next.js API Route例
// pages/api/contracts/[contractId]/pdf.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { contractId } = req.query;

  try {
    const pdf = await generatePDFServer(req.body.employeeId, contractId as string);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contract_${contractId}.pdf`);
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ error: 'PDF生成に失敗しました' });
  }
}
```

## データベース設計の考慮事項

### 必要なテーブル/フィールド

1. **employees** テーブル
   - 基本的な従業員情報
   - 社会保険加入フラグ

2. **employment_contracts** テーブル
   - 契約詳細情報
   - PDF生成履歴（pdfPath, generatedAt）
   - 承認情報（approver, approvalNumber）

3. **work_conditions** テーブル
   - 勤務時間、休日情報
   - 手当情報

4. **pledges** テーブル
   - 誓約書情報
   - 署名日、ステータス

### 枝番管理

```sql
-- 枝番の自動採番例
CREATE OR REPLACE FUNCTION get_next_branch_number(emp_number VARCHAR)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT MAX(branch_number) + 1
     FROM employees
     WHERE employee_number = emp_number),
    1
  );
END;
$$ LANGUAGE plpgsql;
```

## セキュリティ考慮事項

1. **アクセス制御**
   - PDF生成は認証済みユーザーのみ
   - 契約書へのアクセスは権限チェック必須

2. **データ保護**
   - 個人情報を含むPDFは暗号化
   - 生成済みPDFは安全な場所に保管

3. **監査ログ**
   - PDF生成/ダウンロード履歴を記録
   - 誰がいつアクセスしたかを追跡

## テスト項目

1. **データマッピング**
   - 全フィールドが正しくマップされるか
   - デフォルト値が適用されるか
   - 条件付きフィールドが正しく表示/非表示になるか

2. **PDF生成**
   - 日本語が正しく表示されるか
   - レイアウトが崩れないか
   - ファイルサイズが適切か

3. **パフォーマンス**
   - 大量のPDF生成時の処理時間
   - 同時アクセス時の動作

## トラブルシューティング

### 日本語が文字化けする
- フォントファイルが正しく読み込まれているか確認
- エンコーディングがUTF-8になっているか確認

### PDF生成が遅い
- データ取得クエリを最適化
- キャッシュの利用を検討
- バックグラウンドジョブでの生成を検討

### レイアウトが崩れる
- CSSのページブレイク設定を確認
- 長いテキストの折り返し設定を確認

## 今後の拡張案

1. **電子署名機能**
   - デジタル署名の実装
   - タイムスタンプの付与

2. **バージョン管理**
   - 契約書の改訂履歴
   - 差分表示機能

3. **一括生成**
   - 複数の契約書を一度に生成
   - ZIPファイルでのダウンロード

4. **テンプレート管理**
   - 管理画面からのテンプレート編集
   - カスタムフィールドの追加