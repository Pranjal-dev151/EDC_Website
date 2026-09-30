import { useEffect } from 'react';
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthError, clearToken, getMe, getToken } from '../../services/adminApi';
import styles from './Admin.module.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    if (!token) return;
    getMe().catch((err) => {
      if (err instanceof AuthError) navigate('/admin/login', { replace: true });
    });
  }, [token, navigate]);

  if (!token) return <Navigate to="/admin/login" replace />;

  function onLogout() {
    clearToken();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <span className={styles.brand}>EDC SIRT · Admin</span>
        <nav className={styles.nav} aria-label="Admin">
          <Link to="/admin/blogs">Blogs</Link>
          <Link to="/admin/events">Events</Link>
          <button type="button" className={styles.buttonSecondary} onClick={onLogout}>
            Logout
          </button>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
