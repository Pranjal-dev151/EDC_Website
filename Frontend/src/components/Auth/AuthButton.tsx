import styles from './Auth.module.css';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function AuthButton({ children, loading, disabled, ...props }: Props) {
  return (
    <button className={styles.button} disabled={disabled || loading} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
