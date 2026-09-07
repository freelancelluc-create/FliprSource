import React, { useState } from 'react';
import { Upload, Sparkles, Zap, AlertCircle, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { PRESET_PRODUCTS } from '../data/presetProducts';
import { parseProductFromImageOrUrl, extractUrlFromShareText } from '../utils/aiVisionParser';
import { prepareImageForVision } from '../utils/imageUtils';

export default function AnalyzeForm({ onAnalyze, initialPreset = null }) {
  const [selectedPresetId, setSelectedPresetId] = useState(initialPreset ? initialPreset.id : null);
  const [title, setTitle] = useState(initialPreset ? initialPreset.name : "");
  const [price, setPrice] = useState(initialPreset ? initialPreset.inputPrice : "");
  const [condition, setCondition] = useState(initialPreset ? initialPreset.condition : "Muy buen estado");
  const [marketplace, setMarketplace] = useState(initialPreset ? initialPreset.marketplace : "Wallapop");
  const [imageUrl, setImageUrl] = useState(initialPreset ? initialPreset.imageUrl : "");
  const [urlInput, setUrlInput] = useState("");
  const [accessoryInput, setAccessoryInput] = useState("");
  const [accessories, setAccessories] = useState(initialPreset ? initialPreset.accessories : ["Caja original"]);
  
  // UX Feedback states
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState("Escaneando ventas de mercado...");
  const [aiNotes, setAiNotes] = useState([]);
  const [aiPriceWarning, setAiPriceWarning] = useState("");
  const [description, setDescription] = useState("");
  const [km, setKm] = useState(null);


  // Preset Selection Handler
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.name);
    setPrice(preset.inputPrice);
    setCondition(preset.condition);
    setMarketplace(preset.marketplace);
    setImageUrl(preset.imageUrl);
    setAccessories(preset.accessories || []);
    setAiNotes(preset.reasons ? [preset.reasons[0]] : []);
    setAiSuccessMessage(`Demo cargada: ${preset.name}`);
    setAiPriceWarning("");
    setDescription("");
    setKm(preset.km || null);
  };

  // Drag & drop or local photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setImageUrl(reader.result);
        // Optimizamos la captura antes de enviarla a la Visión IA:
        // evita el error 413 (imagen demasiado grande) y mejora la lectura del precio.
        let visionSrc = reader.result;
        try {
          visionSrc = await prepareImageForVision(reader.result);
        } catch (err) {
          console.warn("No se pudo optimizar la imagen; se enviará la original.", err);
        }
        runAiAnalysisOnUpload(file, visionSrc, null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Automatic AI extraction from URL or Uploaded photo
  const runAiAnalysisOnUpload = async (file, imgData, urlText) => {
    setIsAiParsing(true);
    setAiSuccessMessage("");
    setAiPriceWarning("");
    try {
      const parsed = await parseProductFromImageOrUrl({ file, imageUrl: imgData, urlText });
      setTitle(parsed.title);
      setPrice(parsed.price);
      setCondition(parsed.condition);
      setMarketplace(parsed.marketplace);
      setAccessories(parsed.accessories);
      setAiNotes(parsed.aiVisionNotes);
      setDescription(parsed.description || "");
      setKm(parsed.km || null);
      setSelectedPresetId(null);

      if (parsed.priceDetected && parsed.price !== null) {
        setAiPriceWarning("");
        setAiSuccessMessage(urlText
          ? `✓ ¡Enlace procesado! Título: "${parsed.title}" (${parsed.price} €)`
          : "✓ ¡Foto analizada!");
      } else {
        setAiSuccessMessage(urlText
          ? `✓ Enlace procesado: "${parsed.title}"`
          : "✓ Foto cargada");
        setAiPriceWarning(parsed.aiPriceWarning || "⚠️ No hemos podido leer el precio del anuncio. Escríbelo en el campo 'Precio de compra' para continuar.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleUrlAiExtract = (e) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;
    const { url } = extractUrlFromShareText(urlInput);
    if (url && url !== urlInput) {
      setUrlInput(url);
    }
    runAiAnalysisOnUpload(null, null, url || urlInput);
  };

  const handleUrlPaste = (e) => {
    const pasted = e.clipboardData?.getData('text') || '';
    if (pasted) {
      const { url } = extractUrlFromShareText(pasted);
      if (url) {
        e.preventDefault();
        setUrlInput(url);
        runAiAnalysisOnUpload(null, null, url);
      }
    }
  };

  const handleAddAccessory = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && accessoryInput.trim()) {
      e.preventDefault();
      if (!accessories.includes(accessoryInput.trim())) {
        setAccessories([...accessories, accessoryInput.trim()]);
      }
      setAccessoryInput("");
    }
  };

  const handleRemoveAccessory = (accToRemove) => {
    setAccessories(accessories.filter(a => a !== accToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!price || parseFloat(price) <= 0) {
      setAiPriceWarning("⚠️ Indica el precio de compra antes de analizar.");
      return;
    }
    setAiPriceWarning("");

    setIsScanning(true);
    setScanStep("Identificando variante y modelo...");

    setTimeout(() => {
      setScanStep("Consultando histórico de ventas recientes...");
    }, 600);

    setTimeout(() => {
      setScanStep("Calculando FLIP SCORE™ y beneficio neto...");
    }, 1200);

    setTimeout(() => {
      setIsScanning(false);
      
      const matchingPreset = PRESET_PRODUCTS.find(p => p.id === selectedPresetId);
      if (matchingPreset && matchingPreset.inputPrice === parseFloat(price)) {
        onAnalyze(matchingPreset);
      } else {
        onAnalyze({
          customTitle: title || "Producto de Segunda Mano",
          price: parseFloat(price),
          condition,
          marketplace,
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80",
          accessories,
          aiNotes,
          description,
          km
        });
      }
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      
      {/* Form Container */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-gray-800 space-y-8 relative overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Zap className="w-7 h-7 text-emerald-400 fill-emerald-400" />
              <span>Analizar oportunidad de compra</span>
            </h2>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
              Wallapop & Vinted · Decisión en 5 segundos
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Pega cualquier enlace de Wallapop o Vinted, o sube una captura. Extraeremos el título y precio al instante.
          </p>
        </div>

        {/* AI Photo Upload & URL Extractor Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Photo Drag & Drop Dropzone */}
          <div className="relative border-2 border-dashed border-gray-700 hover:border-emerald-500/60 rounded-2xl p-4 bg-[#090A0F]/80 text-center transition-all group flex flex-col items-center justify-center min-h-[140px]">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {imageUrl ? (
              <div className="flex items-center gap-3 w-full">
                <img src={imageUrl} alt="Subida" className="w-16 h-16 rounded-xl object-cover border border-emerald-500/50" />
                <div className="text-left text-xs font-mono">
                  <span className="text-emerald-400 font-bold block">✓ Imagen cargada</span>
                  <span className="text-gray-400">Análisis de la captura listo</span>
                  <span className="text-[10px] text-gray-500 block underline mt-1">Haz clic para cambiar</span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white block">Subir foto o captura del anuncio</span>
                <span className="text-[10px] text-gray-400 block font-mono">JPG, PNG o Screenshot</span>
              </>
            )}
          </div>

          {/* Paste URL Box */}
          <form onSubmit={handleUrlAiExtract} className="border border-gray-800 rounded-2xl p-4 bg-[#090A0F]/80 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-gray-300 uppercase flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                Pega la URL del producto de Wallapop o Vinted:
              </label>
              <p className="text-[11px] text-gray-400">Presiona Enter o "Extraer con IA" para autorrellenar</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: https://es.wallapop.com/item/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onPaste={handleUrlPaste}
                onBlur={() => { if (urlInput.trim()) handleUrlAiExtract(); }}
                className="flex-1 rounded-xl bg-[#12151F] border border-gray-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={isAiParsing}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-2 text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-500/20 flex-shrink-0"
              >
                {isAiParsing ? (
                  <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                )}
                <span>{isAiParsing ? 'Leyendo...' : 'Extraer con IA'}</span>
              </button>
            </div>
          </form>

        </div>

        {/* AI Success Feedback Notification */}
        {aiSuccessMessage && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-center gap-3 text-xs font-mono text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold">{aiSuccessMessage}</span>
          </div>
        )}

        {/* Preset Chips Selector */}
        <div className="space-y-3 pt-2 border-t border-gray-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              O selecciona un producto demo preseteado:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESET_PRODUCTS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-[#161B29]/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-[#161B29]'
                  }`}
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-700 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-white">{preset.name}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                      <span className="text-emerald-400 font-bold">{preset.inputPrice} €</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        preset.verdict === 'COMPRALO' ? 'bg-emerald-500/20 text-emerald-400' :
                        preset.verdict === 'NEGOCIA' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {preset.verdict}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title / Product Name */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Producto / Modelo
              </label>
              <input
                type="text"
                required
                placeholder="Ej: PlayStation 5 Slim / iPhone 14 Pro"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSelectedPresetId(null);
                }}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans font-medium"
              />
            </div>

            {/* Purchase Price Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Precio de compra (€) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400 font-bold font-mono">
                  €
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="250"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setAiPriceWarning("");
                  }}
                  className={`w-full rounded-xl bg-[#090A0F] border pl-8 pr-4 py-3 text-sm text-white font-mono font-bold focus:outline-none focus:ring-1 ${
                    aiPriceWarning && !price
                      ? 'border-amber-500/60 focus:border-amber-400 focus:ring-amber-400'
                      : 'border-gray-800 focus:border-emerald-500 focus:ring-emerald-500'
                  }`}
                />
              </div>
              {aiPriceWarning && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-[11px] font-mono text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{aiPriceWarning}</span>
                </div>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Condition Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Estado del producto
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              >
                <option value="Nuevo">Nuevo (En caja precintada)</option>
                <option value="Como nuevo">Como nuevo (Sin marcas)</option>
                <option value="Muy buen estado">Muy buen estado (Leve uso)</option>
                <option value="Buen estado">Buen estado (Marcas normales)</option>
                <option value="Aceptable">Aceptable (Desgaste notable)</option>
                <option value="A reparar">A reparar / Necesita arreglo</option>
              </select>
            </div>

            {/* Marketplace Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
                Marketplace de la oferta
              </label>
              <select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
              >
                <option value="Wallapop">Wallapop</option>
                <option value="Vinted">Vinted</option>
                <option value="Marketplace">Facebook Marketplace</option>
                <option value="Otro">Otro / Trato en Mano</option>
              </select>
            </div>

          </div>

          {/* Optional Accessories Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
              Accesorios opcionales que incluye
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: Caja original, Mando extra, Factura..."
                value={accessoryInput}
                onChange={(e) => setAccessoryInput(e.target.value)}
                onKeyDown={handleAddAccessory}
                className="flex-1 rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddAccessory}
                className="rounded-xl bg-gray-800 hover:bg-gray-700 px-4 py-2.5 text-xs font-bold text-white border border-gray-700"
              >
                Añadir
              </button>
            </div>

            {accessories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {accessories.map((acc, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400"
                  >
                    <span>{acc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccessory(acc)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Descripción del anuncio (opcional): se rellena sola si se detecta, o puedes pegar la del vendedor */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider block">
              Descripción del anuncio (mejora el análisis)
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Seat Ibiza 2009, 150.000 km, le falta un faro y hay que cambiar el embrague..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-[#090A0F] border border-gray-800 px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none resize-y"
            />
            <p className="text-[10px] text-gray-500 font-mono">
              Si pegas la descripción del vendedor (año, km, desperfectos...), el análisis lo tiene en cuenta.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isScanning}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 py-4 font-bold text-black shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 text-base"
            >
              {isScanning ? (
                <>
                  <div className="h-5 w-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span className="font-mono text-sm font-bold">{scanStep}</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-black" />
                  <span>Analizar oportunidad ahora</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
