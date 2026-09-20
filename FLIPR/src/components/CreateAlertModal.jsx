import React, { useState } from 'react';
import { X, Bell, ShieldCheck, Mail, CheckCircle2, ArrowRight, Sparkles, Tag, DollarSign } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export default function CreateAlertModal({
  productName = '',
  targetPrice = '',
  currentPrice = '',
  imageUrl = '',
  user = null,
  onClose,
  onSaveAlert,
  onOpenAuth,
}) {
  const [name, setName] = useState(productName || '');
  const [price, setPrice] = useState(targetPrice || currentPrice || '');
  const [email, setEmail] = useState(user?.email || '');
  const [marketplace, setMarketplace] = useState('Todos');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price || parseFloat(price) <= 0) return;

    const alertData = {
      id: 'alert-' + Date.now(),
      title: name.trim(),
      targetPrice: parseFloat(price),
      marketplace,
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString(),
    };

    if (!user) {
      // Si no tiene cuenta, guardamos temporalmente y abrimos auth
      trackEvent('alert_creation_signup_prompt', { product: name, targetPrice: price });
      if (onSaveAlert) onSaveAlert(alertData);
      setSavedSuccess(true);
      setTimeout(() => {
        if (onOpenAuth) onOpenAuth('register');
        onClose();
      }, 1200);
      return;
    }

    trackEvent('alert_created', { product: name, targetPrice: price, user: user.id });
    if (onSaveAlert) onSaveAlert(alertData);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-6 border border-emerald-500/30 bg-[#0d0f17]/95 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        {/* Glow ambient */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Crear Alerta de Oportunidad</h3>
              <p className="text-xs text-gray-400">Avísame cuando aparezca un chollo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">¡Alerta configurada con éxito!</h4>
            <p className="text-xs text-gray-300">
              {user
                ? `Monitorizaremos ${name} y te notificaremos cuando baje de ${price} €.`
                : 'Creando tu cuenta gratis para activar los avisos en tu correo...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Producto */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Producto que buscas
              </label>
              <input
                type="text"
                required
                placeholder="Ej: iPhone 15 Pro 256GB / PS5 Slim"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-sans font-medium"
              />
            </div>

            {/* Precio objetivo */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Precio máximo al que comprarías (€)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400 font-bold font-mono">
                  €
                </div>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="Ej: 650"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl bg-[#090A0F] border border-gray-800 pl-8 pr-4 py-2.5 text-xs text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-mono">
                Te avisaremos en cuanto detectemos anuncios en este precio o inferior.
              </p>
            </div>

            {/* Plataforma */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase">
                Marketplaces a monitorizar
              </label>
              <select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Todos">Todos (Wallapop, Vinted, Marketplace)</option>
                <option value="Wallapop">Solo Wallapop</option>
                <option value="Vinted">Solo Vinted</option>
                <option value="Marketplace">Solo Facebook Marketplace</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-3.5 px-4 font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm"
              >
                <Bell className="w-4 h-4 fill-black" />
                <span>{user ? 'Guardar y activar alerta' : 'Guardar alerta (Registro gratis)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {!user && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] font-mono text-emerald-400">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>No necesitas tarjeta ni pagar nada. Las alertas son 100% gratis.</span>
              </div>
            )}

          </form>
        )}

      </div>
    </div>
  );
}
