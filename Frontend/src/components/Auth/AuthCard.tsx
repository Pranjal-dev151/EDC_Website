import styles from './Auth.module.css';

export default function AuthCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className={styles.card}>
      <h1>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      {children}
    </div>
  );
}
