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
        className={`w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-lg font-medium text-stone-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${
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
        className={`w-full appearance-none rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-lg font-medium text-stone-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${className}`}
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
        className={`w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-base font-medium text-stone-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${className}`}
      />
    </FieldWrapper>
  );
}

interface CategoryChipsProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  /** Full Tailwind classes for the selected chip, e.g. "bg-blue-600 text-white". */
  activeClassName?: string;
}

/**
 * Pill-style single-select category picker — used in place of a native
 * <select> on the "new entry" forms, matching the Figma reference's chip
 * pattern (bigger touch targets than a dropdown, and the current choice is
 * visible at a glance instead of hidden inside a closed select).
 */
export function CategoryChips({
  label,
  options,
  value,
  onChange,
  activeClassName = "bg-primary text-white",
}: CategoryChipsProps) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-stone-600">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? activeClassName : "bg-stone-100 text-stone-600 active:bg-stone-200"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
