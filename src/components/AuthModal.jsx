import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { login, register } from '../auth';

const ERRORS = {
  'email-exists': 'Ya existe una cuenta con ese email. Prueba a iniciar sesión.',
  'bad-credentials': 'Email o contraseña incorrectos.',
  'short-password': 'La contraseña debe tener al menos 6 caracteres.',
  'invalid-email': 'Introduce un email válido.',
  'invalid-name': 'El nombre debe tener al menos 2 caracteres.',
  'no-db': 'El registro aún no está configurado en el servidor (falta el almacén de datos de Vercel).',
  'db-error': 'No se pudo guardar tu cuenta en el servidor. La base de datos no está escribiendo bien: revisa el almacén de Vercel (Upstash) y vuelve a publicar.',
  'invalid-body': 'Datos no válidos.',
  'timeout': 'El servidor tardó demasiado. Comprueba que la base de datos de Vercel está conectada y has vuelto a publicar.',
  'network': 'Error de conexión. Inténtalo de nuevo.',
};

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('login'); // login | register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = mode === 'register'
        ? await register(name, email, password)
        : await login(email, password);
      if (r.ok && r.data && r.data.user) {
        onSuccess(r.data.user);
        onClose();
        return;
      }
      setError(ERRORS[r.data?.error] || 'Algo salió mal. Inténtalo de nuevo.');
    } catch (err) {
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
          className="absolute top-4 right-4 h-9 w-9 rounded-xl bg-gray-800/70 hover:bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black shadow-lg shadow-emerald-500/30">
            <Zap className="h-5 w-5 fill-black" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h2>
          <p className="text-xs text-gray-400">
            {mode === 'login'
              ? 'Entra para recuperar tu historial, favoritos y créditos.'
              : 'Tu historial, favoritos y créditos quedarán asociados a tu cuenta.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#12151F] border border-gray-800 p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${mode === 'login' ? 'bg-emerald-500 text-black' : 'text-gray-400'}`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${mode === 'register' ? 'bg-emerald-500 text-black' : 'text-gray-400'}`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
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

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-[11px] font-mono text-red-300">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Entrar' : 'Crear cuenta gratis'}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-500 font-mono">
          Tus datos se guardan de forma segura en el servidor y se restauran en cualquier dispositivo.
        </p>
      </div>
    </div>
  );
}
