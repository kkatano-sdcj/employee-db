"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

import {
  defaultEmployeeFormValues,
  employeeFormSchema,
  type EmployeeFormValues,
} from "@/lib/schemas/employee";

type EmployeeFormProps = {
  mode?: "create" | "edit";
  context?: "employee-management" | "contract-management";
  initialValues?: EmployeeFormValues;
  employeeId?: string;
  workConditionId?: string;
  contractId?: string;
  redirectTo?: string;
};

export const EmployeeForm = ({
  mode = "create",
  context = "employee-management",
  initialValues,
  employeeId,
  workConditionId,
  contractId,
  redirectTo,
}: EmployeeFormProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string }>();
  const memoizedDefaultValues = useMemo(
    () => initialValues ?? defaultEmployeeFormValues,
    [initialValues],
  );
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: memoizedDefaultValues,
  });
  const previousInitialValues = useRef<EmployeeFormValues | undefined>(initialValues);

  useEffect(() => {
    if (initialValues && previousInitialValues.current !== initialValues) {
      form.reset(initialValues);
      previousInitialValues.current = initialValues;
    }
  }, [initialValues, form]);

  const workingHours = useFieldArray({ control: form.control, name: "workingHours" });
  const breakHours = useFieldArray({ control: form.control, name: "breakHours" });
  const workLocations = useFieldArray({ control: form.control, name: "workLocations" });
  const transportationRoutes = useFieldArray({
    control: form.control,
    name: "transportationRoutes",
  });

  const sectionPermissions = (() => {
    if (mode !== "edit") {
      return { basic: true, work: true, contract: true, documents: true };
    }
    if (context === "contract-management") {
      return { basic: false, work: true, contract: true, documents: true };
    }
    return { basic: true, work: false, contract: false, documents: false };
  })();

  const onSubmit = async (values: EmployeeFormValues) => {
    setStatus(undefined);

    if (mode === "edit" && !employeeId) {
      setStatus({
        type: "error",
        message: "従業員IDが見つかりません。もう一度やり直してください。",
      });
      return;
    }

    const isEdit = mode === "edit";
    const endpoint = isEdit ? `/api/employees/${employeeId}` : "/api/employees";
    const payload = isEdit
      ? {
          values,
          workConditionId,
          contractId,
        }
      : values;

    const response = await fetch(endpoint, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const payload = await response
        .json()
        .catch(() => ({ message: "保存に失敗しました" }));
      setStatus({
        type: "error",
        message: payload.message ?? "保存に失敗しました",
      });
      return;
    }

    if (isEdit) {
      setStatus({ type: "success", message: "更新が完了しました。" });
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      }
    } else {
      setStatus({
        type: "success",
        message: "登録が完了しました。従業員一覧を確認してください。",
      });
      form.reset(defaultEmployeeFormValues);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormSection title="基本情報" readOnlyLabel={!sectionPermissions.basic ? "表示のみ" : undefined}>
        <div className="grid gap-4 md:grid-cols-3">
          <TextField
            label="従業員番号"
            registration={form.register("employeeNumber")}
            error={form.formState.errors.employeeNumber?.message}
            readOnly={!sectionPermissions.basic}
          />
          <TextField
            label="氏名"
            registration={form.register("name")}
            error={form.formState.errors.name?.message}
          />
          <TextField
            label="氏名(カナ)"
            registration={form.register("nameKana")}
            error={form.formState.errors.nameKana?.message}
          />
          <SelectField
            label="性別"
            registration={form.register("gender")}
            error={form.formState.errors.gender?.message}
            options={[
              { label: "男性", value: "MALE" },
              { label: "女性", value: "FEMALE" },
              { label: "その他", value: "OTHER" },
            ]}
          />
          <TextField
            type="date"
            label="生年月日"
            registration={form.register("birthDate")}
            error={form.formState.errors.birthDate?.message}
          />
          <TextField
            type="text"
            label="国籍"
            registration={form.register("nationality")}
            error={form.formState.errors.nationality?.message}
            readOnly={!sectionPermissions.basic}
          />
          <TextField
            type="date"
            label="入社日"
            registration={form.register("hiredAt")}
            error={form.formState.errors.hiredAt?.message}
          />
          <SelectField
            label="雇用区分"
            registration={form.register("employmentType")}
            error={form.formState.errors.employmentType?.message}
            disabled={!sectionPermissions.basic && mode === "edit"}
            options={[
              { label: "常勤", value: "FULL_TIME" },
              { label: "パート", value: "PART_TIME" },
              { label: "契約", value: "CONTRACT" },
            ]}
          />
          <SelectField
            label="勤務状態"
            registration={form.register("employmentStatus")}
            error={form.formState.errors.employmentStatus?.message}
            disabled={!sectionPermissions.basic && mode === "edit"}
            options={[
              { label: "稼働", value: "ACTIVE" },
              { label: "休職", value: "ON_LEAVE" },
              { label: "退職", value: "RETIRED" },
            ]}
          />
          <TextField
            label="所属コード"
            registration={form.register("departmentCode")}
            error={form.formState.errors.departmentCode?.message}
            readOnly={!sectionPermissions.basic}
          />
          <TextField
            label="マイナンバー"
            registration={form.register("myNumber")}
            error={form.formState.errors.myNumber?.message}
            readOnly={!sectionPermissions.basic}
          />
        </div>
      </FormSection>

      <FormSection
        title="勤務条件"
        readOnlyLabel={!sectionPermissions.work ? "表示のみ" : undefined}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <SelectField
            label="勤務日数区分"
            registration={form.register("workDaysType")}
            error={form.formState.errors.workDaysType?.message}
            options={[
              { label: "週", value: "WEEKLY" },
              { label: "月", value: "MONTHLY" },
              { label: "シフト", value: "SHIFT" },
            ]}
            disabled={!sectionPermissions.work && mode === "edit"}
          />
          <TextField
            type="number"
            label="勤務日数"
            registration={form.register("workDaysCount", { valueAsNumber: true })}
            error={form.formState.errors.workDaysCount?.message}
            readOnly={!sectionPermissions.work}
          />
          <TextField
            label="勤務日数メモ"
            registration={form.register("workDaysCountNote")}
            error={form.formState.errors.workDaysCountNote?.message}
            readOnly={!sectionPermissions.work}
          />
          <TextField
            type="date"
            label="有給基準日"
            registration={form.register("paidLeaveBaseDate")}
            error={form.formState.errors.paidLeaveBaseDate?.message}
            readOnly={!sectionPermissions.work}
          />
        </div>

        <DynamicFieldArray
          title="勤務時間帯"
          fields={workingHours.fields}
          onAdd={() => workingHours.append({ start: "09:00", end: "18:00" })}
          onRemove={(idx) => workingHours.remove(idx)}
          editable={sectionPermissions.work}
        >
          {(field, index) => (
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                label="開始"
                type="time"
                registration={form.register(`workingHours.${index}.start` as const)}
                error={form.formState.errors.workingHours?.[index]?.start?.message}
                readOnly={!sectionPermissions.work}
              />
              <TextField
                label="終了"
                type="time"
                registration={form.register(`workingHours.${index}.end` as const)}
                error={form.formState.errors.workingHours?.[index]?.end?.message}
                readOnly={!sectionPermissions.work}
              />
            </div>
          )}
        </DynamicFieldArray>

        <DynamicFieldArray
          title="休憩時間帯"
          fields={breakHours.fields}
          onAdd={() => breakHours.append({ start: "12:00", end: "13:00" })}
          onRemove={(idx) => breakHours.remove(idx)}
          editable={sectionPermissions.work}
        >
          {(field, index) => (
            <div className="grid gap-3 md:grid-cols-2">
              <TextField
                label="開始"
                type="time"
                registration={form.register(`breakHours.${index}.start` as const)}
                error={form.formState.errors.breakHours?.[index]?.start?.message}
                readOnly={!sectionPermissions.work}
              />
              <TextField
                label="終了"
                type="time"
                registration={form.register(`breakHours.${index}.end` as const)}
                error={form.formState.errors.breakHours?.[index]?.end?.message}
                readOnly={!sectionPermissions.work}
              />
            </div>
          )}
        </DynamicFieldArray>

        <DynamicFieldArray
          title="勤務場所"
          fields={workLocations.fields}
          onAdd={() => workLocations.append({ location: "" })}
          onRemove={(idx) => workLocations.remove(idx)}
          editable={sectionPermissions.work}
        >
          {(field, index) => (
            <TextField
              label="勤務地"
              registration={form.register(`workLocations.${index}.location` as const)}
              error={form.formState.errors.workLocations?.[index]?.location?.message}
              readOnly={!sectionPermissions.work}
            />
          )}
        </DynamicFieldArray>

        <DynamicFieldArray
          title="交通費（ルート別）"
          fields={transportationRoutes.fields}
          onAdd={() =>
            transportationRoutes.append({
              route: "",
              roundTripAmount: 0,
              monthlyPassAmount: undefined,
              maxAmount: undefined,
              nearestStation: "",
            })
          }
          onRemove={(idx) => transportationRoutes.remove(idx)}
          editable={sectionPermissions.work}
        >
          {(field, index) => (
            <div className="grid gap-3 md:grid-cols-5">
              <TextField
                label="ルート"
                registration={form.register(
                  `transportationRoutes.${index}.route` as const,
                )}
                error={
                  form.formState.errors.transportationRoutes?.[index]?.route?.message
                }
                readOnly={!sectionPermissions.work}
              />
              <TextField
                type="number"
                label="往復"
                registration={form.register(
                  `transportationRoutes.${index}.roundTripAmount` as const,
                  { valueAsNumber: true },
                )}
                error={
                  form.formState.errors.transportationRoutes?.[index]?.roundTripAmount
                    ?.message
                }
                readOnly={!sectionPermissions.work}
              />
              <TextField
                type="number"
                label="定期"
                registration={form.register(
                  `transportationRoutes.${index}.monthlyPassAmount` as const,
                )}
                error={
                  form.formState.errors.transportationRoutes?.[index]?.monthlyPassAmount
                    ?.message
                }
                readOnly={!sectionPermissions.work}
              />
              <TextField
                type="number"
                label="上限"
                registration={form.register(
                  `transportationRoutes.${index}.maxAmount` as const,
                )}
                error={
                  form.formState.errors.transportationRoutes?.[index]?.maxAmount?.message
                }
                readOnly={!sectionPermissions.work}
              />
              <TextField
                label="最寄り"
                registration={form.register(
                  `transportationRoutes.${index}.nearestStation` as const,
                )}
                error={
                  form.formState.errors.transportationRoutes?.[index]?.nearestStation
                    ?.message
                }
                readOnly={!sectionPermissions.work}
              />
            </div>
          )}
        </DynamicFieldArray>
      </FormSection>

      <FormSection
        title="雇用契約"
        readOnlyLabel={!sectionPermissions.contract ? "表示のみ" : undefined}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <SelectField
            label="契約タイプ"
            registration={form.register("contract.contractType")}
            error={form.formState.errors.contract?.contractType?.message}
            disabled={!sectionPermissions.contract && mode === "edit"}
            options={[
              { label: "無期", value: "INDEFINITE" },
              { label: "有期", value: "FIXED_TERM" },
            ]}
          />
          <TextField
            type="date"
            label="契約開始日"
            registration={form.register("contract.contractStartDate")}
            error={form.formState.errors.contract?.contractStartDate?.message}
            readOnly={!sectionPermissions.contract}
          />
          <TextField
            type="date"
            label="契約終了日"
            registration={form.register("contract.contractEndDate")}
            error={form.formState.errors.contract?.contractEndDate?.message}
            readOnly={!sectionPermissions.contract}
          />
          <div className="flex items-center gap-2">
            <input
              id="isRenewable"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              {...form.register("contract.isRenewable")}
              disabled={!sectionPermissions.contract && mode === "edit"}
            />
            <label htmlFor="isRenewable" className="text-sm text-slate-600">
              更新予定あり
            </label>
          </div>
          <TextField
            type="number"
            label="時給"
            registration={form.register("contract.hourlyWage", { valueAsNumber: true })}
            error={form.formState.errors.contract?.hourlyWage?.message}
            readOnly={!sectionPermissions.contract}
          />
          <TextField
            type="number"
            label="残業時給"
            registration={form.register("contract.overtimeHourlyWage")}
            error={form.formState.errors.contract?.overtimeHourlyWage?.message}
            readOnly={!sectionPermissions.contract}
          />
        </div>
        <TextField
          label="業務内容"
          registration={form.register("contract.jobDescription")}
          error={form.formState.errors.contract?.jobDescription?.message}
          readOnly={!sectionPermissions.contract}
        />
        <TextField
          label="有休条項"
          registration={form.register("contract.paidLeaveClause")}
          error={form.formState.errors.contract?.paidLeaveClause?.message}
          readOnly={!sectionPermissions.contract}
        />
        <TextField
          label="備考"
          registration={form.register("contract.hourlyWageNote")}
          error={form.formState.errors.contract?.hourlyWageNote?.message}
          readOnly={!sectionPermissions.contract}
        />
      </FormSection>

      <FormSection
        title="書類・提出状況"
        readOnlyLabel={!sectionPermissions.documents ? "表示のみ" : undefined}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            type="date"
            label="契約書提出日"
            registration={form.register("documents.submittedToAdminOn")}
            error={form.formState.errors.documents?.submittedToAdminOn?.message}
            readOnly={!sectionPermissions.documents}
          />
          <TextField
            label="本人返却"
            registration={form.register("documents.returnedToEmployee")}
            error={form.formState.errors.documents?.returnedToEmployee?.message}
            readOnly={!sectionPermissions.documents}
          />
          <TextField
            label="満了通知書発行状況"
            registration={form.register("documents.expirationNoticeIssued")}
            error={form.formState.errors.documents?.expirationNoticeIssued?.message}
            readOnly={!sectionPermissions.documents}
          />
          <TextField
            label="退職届提出状況"
            registration={form.register("documents.resignationLetterSubmitted")}
            error={form.formState.errors.documents?.resignationLetterSubmitted?.message}
            readOnly={!sectionPermissions.documents}
          />
          <TextField
            label="健康保険証返却"
            registration={form.register("documents.returnHealthInsuranceCard")}
            error={form.formState.errors.documents?.returnHealthInsuranceCard?.message}
            readOnly={!sectionPermissions.documents}
          />
          <TextField
            label="セキュリティカード返却"
            registration={form.register("documents.returnSecurityCard")}
            error={form.formState.errors.documents?.returnSecurityCard?.message}
            readOnly={!sectionPermissions.documents}
          />
        </div>
      </FormSection>

      {status && (
        <p
          className={`rounded-2xl border p-4 text-sm ${
            status.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {status.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-soft"
          type="submit"
        >
          {mode === "edit" ? "変更を保存" : "従業員を登録"}
        </button>
      </div>
    </form>
  );
};

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
  readOnlyLabel?: string;
};
const FormSection = ({ title, children, readOnlyLabel }: FormSectionProps) => (
  <section className="section-card space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">SECTION</p>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {readOnlyLabel && (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {readOnlyLabel}
        </span>
      )}
    </div>
    <fieldset disabled={Boolean(readOnlyLabel)} className="space-y-4 border-0 p-0">
      {children}
    </fieldset>
  </section>
);

type FieldRegistration = ReturnType<UseFormReturn<EmployeeFormValues>["register"]>;

type TextFieldProps = {
  label: string;
  registration: FieldRegistration;
  error?: string;
  type?: string;
  readOnly?: boolean;
};

const TextField = ({ label, registration, error, type = "text", readOnly }: TextFieldProps) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="input-label">{label}</span>
    <input
      type={type}
      className={`input-field ${error ? "border-rose-300" : ""} ${readOnly ? "bg-slate-50" : ""}`}
      readOnly={readOnly}
      {...registration}
    />
    {error && <span className="text-xs text-rose-500">{error}</span>}
  </label>
);

type SelectFieldProps = TextFieldProps & {
  options: Array<{ label: string; value: string }>;
  disabled?: boolean;
};

const SelectField = ({ label, registration, error, options, disabled }: SelectFieldProps) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="input-label">{label}</span>
    <select
      className={`input-field ${error ? "border-rose-300" : ""}`}
      disabled={disabled}
      {...registration}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span className="text-xs text-rose-500">{error}</span>}
  </label>
);

type DynamicFieldArrayProps<T extends { id: string }> = {
  title: string;
  fields: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  children: (field: T, index: number) => ReactNode;
  editable?: boolean;
};

const DynamicFieldArray = <T extends { id: string }>({
  title,
  fields,
  onAdd,
  onRemove,
  children,
  editable = true,
}: DynamicFieldArrayProps<T>) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {editable && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent-blue"
        >
          <PlusCircleIcon className="h-4 w-4" /> 追加
        </button>
      )}
    </div>
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-2xl border border-slate-100 p-4">
          {editable && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-xs text-rose-500"
              >
                <MinusCircleIcon className="mr-1 inline h-4 w-4" /> 削除
              </button>
            </div>
          )}
          {children(field, index)}
        </div>
      ))}
    </div>
  </div>
);
