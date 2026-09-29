import styles from './Auth.module.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function AuthInput({ label, error, id, ...props }: Props) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
  return (
    <label className={styles.field} htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} {...props} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} />
      {error && <span id={`${inputId}-error`} role="alert" className={styles.error}>{error}</span>}
    </label>
  );
}
