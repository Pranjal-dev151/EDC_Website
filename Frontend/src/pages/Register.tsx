import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthButton from '../components/Auth/AuthButton';
import AuthCard from '../components/Auth/AuthCard';
import AuthInput from '../components/Auth/AuthInput';
import styles from '../components/Auth/Auth.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [success, setSuccess] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = 'Enter your full name.';
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
      <AuthCard title="Create account" description="Frontend-only demo — no data leaves your browser.">
        <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Registration form">
          <AuthInput label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Doe" error={errors.name} required />
          <AuthInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" error={errors.email} required />
          <AuthInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" error={errors.password} required />
          <AuthButton type="submit">Create account</AuthButton>
          {success && <p role="status" className={styles.success}>Demo account created.</p>}
        </form>
        <p className={styles.hint}>Already have an account? <Link to="/login">Sign in</Link></p>
      </AuthCard>
    </div>
  );
}
