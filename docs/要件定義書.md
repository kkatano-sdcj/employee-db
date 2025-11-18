# Feature Specification: 従業員データベースシステム

**Feature Branch**: `001-employee-db-requirements`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "@spec_draft.md の内容を元に要件定義を作成してください。"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 従業員情報の登録と管理 (Priority: P1)

統括人事管理者が新規パート従業員の基本情報（氏名、生年月日、入社日、雇用区分など）を登録し、勤務時間帯、休憩時間帯、勤務場所、交通費などの勤務条件を設定できる。

**Why this priority**: システムの基盤となる機能であり、他のすべての機能が従業員情報に依存するため、最優先で実装する必要があります。

**Independent Test**: 統括人事管理者が新規従業員を登録し、勤務条件を設定して保存できることを確認します。この機能単体で、従業員マスターの基本機能が動作することを検証できます。

**Acceptance Scenarios**:

1. **Given** 統括人事管理者がログインしている, **When** 新規従業員の基本情報（氏名、生年月日、入社日、雇用区分）を入力して保存する, **Then** 従業員情報が正しく登録され、一覧画面に表示される
2. **Given** 従業員が登録されている, **When** 複数の勤務時間帯（例：09:00-12:00、13:00-18:00）を設定する, **Then** すべての勤務時間帯が正しく保存され、表示される
3. **Given** 従業員が登録されている, **When** 複数の勤務場所と交通費情報（ルート別、往復金額、月額定期、上限金額）を設定する, **Then** すべての情報が正しく保存され、契約書出力時に反映される
4. **Given** 従業員情報が登録されている, **When** 情報を更新する, **Then** 最終更新日時と更新者が記録される

---

### User Story 2 - 雇用契約書の作成とPDF出力 (Priority: P1)

統括人事管理者が雇用契約書を作成し、PDF形式で出力できる。契約書には枝番が自動付与され、承認番号を管理できる。

**Why this priority**: 雇用契約書からの手入力作業を廃止するという主要目的を達成するための核心機能です。法的文書としての契約書を正確に出力できることが必須です。

**Independent Test**: 統括人事管理者が従業員の契約情報を入力し、契約書をPDF形式で出力できることを確認します。出力されたPDFに必要な情報（枝番、承認番号、勤務条件、交通費など）がすべて含まれていることを検証できます。

**Acceptance Scenarios**:

1. **Given** 従業員情報と勤務条件が登録されている, **When** 雇用契約書を作成してPDF出力する, **Then** 契約期間、勤務時間、勤務場所、時給、交通費などの情報が含まれたPDFが生成される
2. **Given** 契約書が作成されている, **When** 契約書を出力する, **Then** 社員番号に枝番が自動付与される
3. **Given** 契約書を作成する, **When** 承認番号を入力する, **Then** 承認番号が契約書に表示され、履歴として管理される
4. **Given** 契約内容が変更された, **When** 契約書を再作成する, **Then** 既存契約書が無効化され、新しい承認番号の入力が必須となる

---

### User Story 3 - 給与計算用データの抽出 (Priority: P1)

統括人事管理者が給与計算に必要なデータ（時給、通勤費、社会保険フラグ、各種手当）をCSV形式で抽出できる。

**Why this priority**: 給与支払データ作成の効率化という主要目的を達成するための核心機能です。手入力作業を削減し、正確性を向上させるために必須です。

**Independent Test**: 統括人事管理者が指定した日時点での給与計算用データをCSV形式で抽出できることを確認します。抽出されたCSVに時給、通勤費、社会保険フラグ、各種手当が含まれていることを検証できます。

**Acceptance Scenarios**:

1. **Given** 従業員情報と給与情報が登録されている, **When** 給与計算用CSVを抽出する, **Then** 時給情報（複数レート対応、適用期間付き）、通勤費（ルート別）、社会保険加入フラグ、各種手当が含まれたCSVが生成される
2. **Given** 複数の従業員が登録されている, **When** 指定日時点での給与計算用CSVを抽出する, **Then** その時点で有効な情報のみが抽出される
3. **Given** 抽出項目を選択できる, **When** 必要な項目のみを選択してCSV抽出する, **Then** 選択した項目のみが含まれたCSVが生成される

---

### User Story 4 - 契約更新アラート機能 (Priority: P2)

契約期限が近づいた際に、統括人事管理者と現場マネージャーに自動通知が送られる。

**Why this priority**: 契約更新の見逃しを防ぎ、継続的な雇用管理を支援する重要な機能です。ただし、基本機能が動作した後に実装することで、段階的に価値を提供できます。

**Independent Test**: 契約期限の30日前、14日前、7日前に自動通知が送られることを確認します。通知対象者が正しく設定され、アラート状態が管理されることを検証できます。

**Acceptance Scenarios**:

1. **Given** 契約期限が30日前になった, **When** アラートシステムが動作する, **Then** 統括人事管理者と担当部署の現場マネージャーに通知が送られる
2. **Given** 契約期限が14日前になった, **When** アラートシステムが動作する, **Then** リマインダー通知が送られる
3. **Given** 契約期限が7日前になった, **When** アラートシステムが動作する, **Then** 最終リマインダー通知が送られる
4. **Given** 契約書が出力された, **When** 雇用終了アラートが設定されている, **Then** アラートが自動解除される

---

### User Story 5 - 従業員検索と一覧表示 (Priority: P2)

統括人事管理者と現場マネージャーが従業員を検索し、一覧表示できる。勤務場所やステータスでフィルタリング可能。

**Why this priority**: 登録された従業員情報を効率的に閲覧・管理するための基本機能です。検索とフィルタリングにより、大量のデータから必要な情報を素早く見つけられます。

**Independent Test**: ユーザーが従業員を検索し、勤務場所やステータスでフィルタリングして一覧表示できることを確認します。検索結果が正しく表示され、権限に応じた情報のみが表示されることを検証できます。

**Acceptance Scenarios**:

1. **Given** 複数の従業員が登録されている, **When** 氏名で検索する, **Then** 該当する従業員が一覧に表示される
2. **Given** 複数の従業員が登録されている, **When** 勤務場所でフィルタリングする, **Then** 該当する勤務場所の従業員のみが表示される
3. **Given** 現場マネージャーがログインしている, **When** 従業員一覧を表示する, **Then** 自部門・自拠点の従業員のみが表示される
4. **Given** 統括人事管理者がログインしている, **When** 従業員一覧を表示する, **Then** すべての従業員が表示される

---

### User Story 6 - 同時編集制御 (Priority: P2)

複数のユーザーが同じ従業員情報を同時に編集しようとした場合、最初のアクセス者以外は編集できない。

**Why this priority**: データの整合性を保ち、同時編集による競合を防ぐ重要な機能です。ただし、基本機能が動作した後に実装することで、段階的に価値を提供できます。

**Independent Test**: 2人のユーザーが同じ従業員情報に同時にアクセスし、最初のユーザーが編集を開始した場合、2人目のユーザーは編集できないことを確認します。ロックが15分後に自動解放されることも検証できます。

**Acceptance Scenarios**:

1. **Given** ユーザーAが従業員情報を編集している, **When** ユーザーBが同じ従業員情報にアクセスする, **Then** ユーザーBは編集できないことを示すメッセージが表示される
2. **Given** ユーザーAが従業員情報の編集を開始した, **When** 15分が経過する, **Then** ロックが自動解放され、他のユーザーが編集可能になる
3. **Given** ユーザーAが従業員情報の編集を保存した, **When** 保存が完了する, **Then** ロックが解放され、他のユーザーが編集可能になる

---

### User Story 7 - 契約履歴の管理と表示 (Priority: P3)

従業員の契約履歴（雇用期間、勤務時間、勤務日数、勤務場所、時給、雇用保険、社会保険）を表示できる。

**Why this priority**: 過去の契約情報を参照するための機能です。基本機能が動作した後に実装することで、段階的に価値を提供できます。

**Independent Test**: 統括人事管理者が従業員の契約履歴を表示できることを確認します。過去の契約情報が時系列で表示され、必要な情報がすべて含まれていることを検証できます。

**Acceptance Scenarios**:

1. **Given** 従業員に複数の契約履歴がある, **When** 契約履歴を表示する, **Then** 雇用期間、勤務時間、勤務日数、勤務場所、時給、雇用保険、社会保険が時系列で表示される
2. **Given** 契約内容が変更された, **When** 契約変更履歴を表示する, **Then** 変更日時、変更項目、変更前値、変更後値、変更理由、更新者、承認者が表示される

---

### Edge Cases

- 複数のユーザーが同時に同じ従業員情報にアクセスした場合、最初のアクセス者以外は編集できない
- 契約書を再作成する際、既存の承認番号をそのまま使用しようとした場合、新しい承認番号の入力が必須となる
- 給与計算用CSV抽出時に、適用期間が重複する時給レートがある場合、最新のレートが優先される
- 契約更新アラートが送信された後、契約が更新されずに期限が過ぎた場合、アラート状態が「確認済」に更新される
- 従業員情報を削除しようとした場合、関連する契約履歴や提出物・預かり品の情報も連鎖的に削除される
- 検索結果が100件を超える場合、ページネーションが適用され、効率的に閲覧できる
- 権限のないユーザーが個人番号や給与情報にアクセスしようとした場合、アクセスが拒否される
- Enterキーを押下した場合、保存されずに次のフィールドに移動する（誤操作防止）
- 従業員番号を手動入力する際、既存の従業員番号と重複する場合、エラーメッセージが表示され登録が拒否される

## Clarifications

### Session 2025-01-27

- Q: 従業員番号の生成方法と一意性管理 → A: 手動入力（ユーザーが入力、システムが一意性チェック）
- Q: エラー状態とエラーメッセージの表示方法 → A: インライン表示（エラーが発生したフィールドの直下にメッセージを表示）
- Q: 契約更新アラートの通知配信方法 → A: システム内通知のみ（アプリケーション内の通知センターに表示）
- Q: 監査ログの保持期間 → A: 7年間（法的要件に準拠）
- Q: 従業員データの保持期間（退職後） → A: 7年間（法的要件に準拠）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow 統括人事管理者 to register new employees with basic information (employee number entered manually, name, date of birth, hire date, employment classification). System MUST validate employee number uniqueness and reject duplicate entries with an error message displayed inline below the employee number field.
- **FR-025**: System MUST display validation errors inline (directly below the field where the error occurred) with clear, user-friendly error messages in Japanese
- **FR-002**: System MUST allow users to set multiple working hours (time ranges) for each employee
- **FR-003**: System MUST allow users to set multiple break hours (time ranges) for each employee
- **FR-004**: System MUST allow users to set multiple work locations for each employee
- **FR-005**: System MUST allow users to register transportation expenses by route (round-trip amount, monthly pass, maximum amount)
- **FR-006**: System MUST generate employment contracts in PDF format with automatic branch number assignment
- **FR-007**: System MUST require approval number input when creating or recreating employment contracts
- **FR-008**: System MUST allow users to extract payroll calculation data (hourly wage, transportation expenses, social insurance flag, various allowances) in CSV format
- **FR-009**: System MUST allow users to extract data at a specified point in time in CSV format with selectable output items
- **FR-010**: System MUST send automatic alerts 30 days, 14 days, and 7 days before contract expiration. Alerts MUST be delivered via in-app notification center only (no email or SMS). Users MUST be able to view and manage alerts within the application.
- **FR-011**: System MUST prevent users other than the first accessor from editing the same employee record simultaneously
- **FR-012**: System MUST display the last update date and time and updater on all screens
- **FR-013**: System MUST record all contract changes (change date/time, changed items, before/after values, change reason, updater, approver)
- **FR-014**: System MUST allow users to search employees by name, work location, and status
- **FR-015**: System MUST restrict access to personal numbers and salary information to 統括人事管理者 and administrators only
- **FR-016**: System MUST restrict 現場マネージャー access to only their own department/location data
- **FR-017**: System MUST restrict CSV extraction, contract PDF output, and payroll CSV output to 統括人事管理者 and administrators only
- **FR-018**: System MUST record all change operations in audit logs (before/after values in JSON format). Audit logs MUST be retained for 7 years to comply with legal requirements (labor relations document retention period).
- **FR-019**: System MUST prevent saving when Enter key is pressed (move to next field instead)
- **FR-020**: System MUST automatically release edit locks after 15 minutes
- **FR-021**: System MUST allow users to manage document submissions and custody items (submission status, return status tracking)
- **FR-022**: System MUST allow users to view contract history (employment period, working hours, working days, work location, hourly wage, employment insurance, social insurance)
- **FR-023**: System MUST invalidate existing contracts when contract content is changed and require new contract creation
- **FR-024**: System MUST automatically release employment termination alerts when contract documents are output

### Key Entities *(include if feature involves data)*

- **Employee**: Represents a part-time employee with basic information (employee number entered manually with uniqueness constraint, branch number, name, date of birth, nationality, hire date, retirement date, employment classification, status, department code, personal number). Includes last update date/time and updater information. Employee number must be unique across all employees.
- **Employment History**: Represents employment and personnel history including period, department, position, grade, paid leave, salary reference, work location history, and working days type (weekly/monthly/shift). Includes last update date/time and updater information.
- **Salary**: Represents salary information including hourly wage (multiple rates supported), social insurance flag, various allowances (basic allowance, job allowance, perfect attendance allowance, other allowances), and applicable period. Includes last update date/time and updater information.
- **Work Condition**: Represents comprehensive work settings including working hours (multiple, normalized table), break hours (multiple, normalized table), work locations (multiple, normalized table), paid leave grant base date, and transportation expense information (by route, round-trip amount, monthly pass, maximum amount, normalized table). Includes last update date/time and updater information.
- **Contract**: Represents employment contract including contract type, contract period (start/end), contract renewal flag, fixed-term contract base date, job content, and employment termination alert flag. Includes last update date/time and updater information.
- **Contract Alert**: Represents contract renewal alerts including contract ID reference, alert type (pre-expiration notification, employment termination notification), notification date/time, notification target, alert status (unnotified/notified/confirmed), and last update date/time.
- **Contract Change History**: Represents contract change history including contract ID reference, change date/time, changed items, before/after values, change reason, updater, and change approver.
- **Document Submission**: Represents submitted documents and custody items including employee ID reference, document type (submission/custody), document name, submission date, return scheduled date, return date, status (unsubmitted/submitted/returned), notes, last update date/time, and updater.
- **Document**: Represents contract document including document ID, approval number, contract period reference, document type, status (field creation/division head seal pending/general affairs submitted/returned to employee), creation date/time, approval date/time, document data (PDF), last update date/time, and updater.
- **Edit Lock**: Represents edit lock for preventing simultaneous editing including target record ID, lock acquirer, lock acquisition time, and lock expiration time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 統括人事管理者 can complete employee registration (basic information and work conditions) in under 5 minutes per employee
- **SC-002**: 統括人事管理者 can generate employment contract PDFs in under 2 minutes per contract
- **SC-003**: 統括人事管理者 can extract payroll calculation CSV data for 100 employees in under 30 seconds
- **SC-004**: System displays search results for employee list within 2 seconds for queries with up to 1000 employees
- **SC-005**: Contract renewal alerts are sent automatically with 100% accuracy (no missed notifications for contracts expiring within 30 days)
- **SC-006**: Simultaneous editing conflicts are prevented 100% of the time (no data corruption from concurrent edits)
- **SC-007**: All contract changes are recorded in audit logs with 100% accuracy (no unrecorded changes)
- **SC-008**: Users can access only data permitted by their role with 100% accuracy (no unauthorized access to personal numbers or salary information)
- **SC-009**: Manual data entry work for employment contracts is reduced by at least 80% compared to previous Excel-based process
- **SC-010**: Manual data entry work for payroll data creation is reduced by at least 70% compared to previous process
- **SC-011**: System supports at least 50 concurrent users without performance degradation
- **SC-012**: Data extraction (CSV) for 500 employees completes within 10 seconds
- **SC-013**: 90% of users successfully complete employee registration on first attempt without errors
- **SC-014**: Contract renewal alerts are delivered to correct recipients (統括人事管理者 and relevant 現場マネージャー) with 100% accuracy

## Assumptions

- Users have appropriate access credentials and role assignments (統括人事管理者, 現場マネージャー, administrator, auditor)
- Employee data is migrated from existing Excel files via CSV import
- Personal information minimization policy is followed (no address, phone number, or bank account information stored)
- Contract documents are legally valid when generated according to specified format
- System operates during normal business hours (8:00-20:00) with standard availability expectations
- Users have basic computer literacy and can navigate web-based interfaces
- Network connectivity is available for all users accessing the system
- Employee data (including retired employees) MUST be retained for 7 years after retirement date to comply with legal requirements (labor relations document retention period). After 7 years, data may be archived or deleted according to organizational policy.

## Dependencies

- Existing employee data in Excel format that needs to be imported
- Legal requirements for employment contracts and personal information protection
- Approval workflows within the organization (field → division → administrator)
- Integration with future external systems (currently no external integrations planned)

## Out of Scope

- Real-time synchronization with external payroll systems
- Mobile application development (web application only)
- Advanced analytics and reporting dashboards beyond basic employee search and listing
- Automated contract renewal processing (alerts only, manual renewal required)
- Integration with time tracking or attendance systems
- Multi-language support (Japanese only)
- Offline functionality
