import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthButton from '../components/Auth/AuthButton';
import AuthCard from '../components/Auth/AuthCard';
import AuthInput from '../components/Auth/AuthInput';
import styles from '../components/Auth/Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [success, setSuccess] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.includes('@')) next.email = 'Enter a valid email.';
    if (password.length < 6) next.password = 'Password must be at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } else {
      setSuccess(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <AuthCard title="Welcome back" description="Frontend-only demo — no credentials are stored or transmitted.">
        <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Login form">
          <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" error={errors.email} required />
          <AuthInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" error={errors.password} required />
          <AuthButton type="submit">Sign in</AuthButton>
          {success && <p role="status" className={styles.success}>Demo sign-in successful.</p>}
        </form>
        <p className={styles.hint}>No account? <Link to="/register">Create one</Link></p>
      </AuthCard>
    </div>
  );
}
