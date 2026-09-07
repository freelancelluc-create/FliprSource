import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Zap, AlertCircle, Loader2, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { login, register, requestPasswordReset, confirmPasswordReset } from '../auth';

const ERRORS = {
  'email-exists': 'Ya existe una cuenta con ese email. Prueba a iniciar sesión.',
  'bad-credentials': 'Email o contraseña incorrectos.',
  'short-password': 'La contraseña debe tener al menos 6 caracteres.',
  'invalid-email': 'Introduce un email válido.',
  'invalid-name': 'El nombre debe tener al menos 2 caracteres.',
  'no-db': 'El registro aún no está configurado en el servidor (falta el almacén de datos de Vercel).',
  'db-error': 'No se pudo guardar tu cuenta. Revisa el almacén de Vercel (Upstash) y vuelve a publicar.',
  'invalid-body': 'Datos no válidos.',
  'invalid-token': 'El enlace de recuperación no es válido o ya fue usado.',
  'expired-token': 'El código de recuperación ha caducado (válido 1 hora). Solicita uno nuevo.',
  'not-found': 'No encontramos una cuenta con ese email.',
  'timeout': 'El servidor tardó demasiado. Comprueba que la base de datos de Vercel está conectada.',
  'network': 'Sin conexión. Comprueba tu red e inténtalo de nuevo.',
};

// Modos del modal: login | register | forgot | reset
export default function AuthModal({ initialMode = 'login', onClose, onSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (m) => { setMode(m); setError(''); setInfo(''); };

  // ── Login / Register ──────────────────────────────────────────────────────
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = mode === 'register'
        ? await register(name, email, password)
        : await login(email, password);
      if (r.ok && r.data && r.data.user) {
        onSuccess(r.data.user, mode);
        onClose();
        return;
      }
      setError(ERRORS[r.data?.error] || 'Algo salió mal. Inténtalo de nuevo.');
    } catch {
      setError(ERRORS.network);
    } finally {
      setLoading(false);
    }
  };

  // ── Solicitar token de reset ───────────────────────────────────────────────
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await requestPasswordReset(email);
      if (r.ok && r.data?.ok) {
        if (r.data.token) {
          // Sin SMTP configurado: mostramos el token directamente al usuario
          setResetToken(r.data.token);
          setInfo('Copia el código de abajo e introdúcelo para cambiar tu contraseña.');
          switchMode('reset');
          setInfo('Copia el código de recuperación e introdúcelo en el campo correspondiente.');
        } else {
          setInfo('Si el email está registrado recibirás un correo con el enlace de recuperación.');
        }
      } else {
        setError(ERRORS[r.data?.error] || 'No se pudo enviar el código. Inténtalo de nuevo.');
      }
    } catch {
      setError(ERRORS.network);
    } finally {
      setLoading(false);
    }
  };

  // ── Confirmar nuevo password ───────────────────────────────────────────────
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError(ERRORS['short-password']); return; }
    setLoading(true);
    try {
      const r = await confirmPasswordReset(resetToken, newPassword);
      if (r.ok && r.data?.ok) {
        setInfo('Contraseña actualizada. Ya puedes iniciar sesión.');
        switchMode('login');
        setInfo('Contraseña actualizada correctamente. Inicia sesión con la nueva contraseña.');
      } else {
        setError(ERRORS[r.data?.error] || 'No se pudo cambiar la contraseña.');
      }
    } catch {
      setError(ERRORS.network);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 border border-emerald-500/30 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-gray-800/70 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black shadow-lg shadow-emerald-500/30">
            {mode === 'forgot' || mode === 'reset'
              ? <KeyRound className="h-5 w-5" />
              : <Zap className="h-5 w-5 fill-black" />}
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === 'login' && 'Bienvenido de nuevo'}
            {mode === 'register' && 'Crea tu cuenta'}
            {mode === 'forgot' && 'Recuperar contraseña'}
            {mode === 'reset' && 'Nueva contraseña'}
          </h2>
          <p className="text-xs text-gray-400">
            {mode === 'login' && 'Entra para recuperar tu historial, favoritos y créditos.'}
            {mode === 'register' && 'Tu historial, favoritos y créditos quedarán asociados a tu cuenta.'}
            {mode === 'forgot' && 'Introduce tu email y te enviaremos un código de recuperación.'}
            {mode === 'reset' && 'Introduce el código recibido y tu nueva contraseña.'}
          </p>
        </div>

        {/* ── Tabs login / register ──────────────────────────────────────── */}
        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#12151F] border border-gray-800 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-lg py-2 text-xs font-bold transition-all ${mode === 'login' ? 'bg-emerald-500 text-black' : 'text-gray-400'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`rounded-lg py-2 text-xs font-bold transition-all ${mode === 'register' ? 'bg-emerald-500 text-black' : 'text-gray-400'}`}
            >
              Crear cuenta
            </button>
          </div>
        )}

        {/* ── Volver (forgot / reset) ────────────────────────────────────── */}
        {(mode === 'forgot' || mode === 'reset') && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al inicio de sesión
          </button>
        )}

        {/* ── Mensaje informativo ────────────────────────────────────────── */}
        {info && (
          <div className="flex items-start gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-[11px] font-mono text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        {/* ── Formulario LOGIN / REGISTER ────────────────────────────────── */}
        {(mode === 'login' || mode === 'register') && (
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-[#090A0F] border border-gray-800 pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="Contraseña (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {error && <ErrorBox msg={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Crear cuenta gratis'}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="w-full text-center text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>
        )}

        {/* ── Formulario FORGOT ──────────────────────────────────────────── */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {error && <ErrorBox msg={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar código de recuperación
            </button>
          </form>
        )}

        {/* ── Formulario RESET ───────────────────────────────────────────── */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-3">
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                placeholder="Código de recuperación"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value.trim())}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 pl-10 pr-4 py-3 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {error && <ErrorBox msg={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Cambiar contraseña
            </button>
          </form>
        )}

        <p className="text-center text-[10px] text-gray-500 font-mono">
          Tus datos se guardan de forma segura en el servidor y se restauran en cualquier dispositivo.
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-[11px] font-mono text-red-300">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}
