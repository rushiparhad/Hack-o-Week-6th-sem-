import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  function updateField(event) {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = isRegister
        ? await authApi.register(form)
        : await authApi.login({ email: form.email, password: form.password });

      login(response.data);
      toast.success(isRegister ? 'Account created successfully' : 'Login successful');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_0%_0%,#67e8f980,transparent_28%),radial-gradient(circle_at_95%_5%,#f9731680,transparent_30%),linear-gradient(140deg,#f8fafc_20%,#dbeafe_58%,#e2e8f0_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_0%_0%,#0e749090,transparent_24%),radial-gradient(circle_at_95%_5%,#7c2d1290,transparent_30%),linear-gradient(140deg,#020617_20%,#0f172a_58%,#1e293b_100%)]">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mx-auto w-full max-w-md rounded-3xl border border-white/40 bg-white/55 p-8 shadow-2xl shadow-cyan-900/10 backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/55"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Secure Insight Cloud</p>
        <h1 className="mt-1 font-display text-3xl font-black text-slate-900 dark:text-slate-50">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {isRegister ? (
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              required
              placeholder="Full name"
              className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-3 outline-none dark:border-slate-700/60 dark:bg-slate-900/70"
            />
          ) : null}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            required
            placeholder="Email"
            className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-3 outline-none dark:border-slate-700/60 dark:bg-slate-900/70"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            required
            minLength={8}
            placeholder="Password"
            className="w-full rounded-xl border border-white/40 bg-white/70 px-3 py-3 outline-none dark:border-slate-700/60 dark:bg-slate-900/70"
          />
          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsRegister((prev) => !prev)}
          className="mt-4 text-sm font-semibold text-cyan-700 dark:text-cyan-300"
        >
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </motion.section>
    </main>
  );
}

export default AuthPage;
