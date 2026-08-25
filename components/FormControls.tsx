import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FieldWrapperProps {
  label: string;
  children: ReactNode;
  suffix?: string;
}

function FieldWrapper({ label, children, suffix }: FieldWrapperProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-stone-600">{label}</span>
      <div className="relative">
        {children}
        {suffix ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base font-medium text-stone-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  suffix?: string;
};

export function TextField({ label, suffix, className = "", ...props }: TextFieldProps) {
  return (
    <FieldWrapper label={label} suffix={suffix}>
      <input
        {...props}
        className={`w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-lg font-medium text-stone-800 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 ${
          suffix ? "pr-16" : ""
        } ${className}`}
      />
    </FieldWrapper>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function SelectField({ label, className = "", children, ...props }: SelectFieldProps) {
  return (
    <FieldWrapper label={label}>
      <select
        {...props}
        className={`w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-lg font-medium text-stone-800 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 ${className}`}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function TextAreaField({ label, className = "", ...props }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label}>
      <textarea
        {...props}
        className={`w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-base font-medium text-stone-800 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100 ${className}`}
      />
    </FieldWrapper>
  );
}
