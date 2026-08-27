import React, { useState, useEffect } from 'react';
import { Camera, MessageCircle, FileText, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Order } from '../types';
import { sendWhatsAppNotification } from '../services/whatsapp';

interface NewOrderFormProps {
  onSuccess: () => void;
}

export function NewOrderForm({ onSuccess }: NewOrderFormProps) {
  const [customer, setCustomer] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [service, setService] = useState('');
  
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [whatsappNotify, setWhatsappNotify] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useLocalStorage<Order[]>('erp_orders', []);
  const [customersList, setCustomersList] = useState<any[]>([]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  useEffect(() => {
    // --- BACKEND STANDBY ---
    /*
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomersList(data))
      .catch(console.error);
    */
    
    // --- LOGICA LOCALSTORAGE (Atual) ---
    const customersStr = localStorage.getItem('erp_customers');
    if (customersStr) {
      setCustomersList(JSON.parse(customersStr));
    }

    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      alert("Não foi possível acessar a câmera do dispositivo. Verifique as permissões.");
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotos(prev => [...prev, dataUrl]);
        setPhotoUploaded(true);
        closeCamera(); // optionally close after taking 1, or keep open. Let's close it for simplicity
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos.splice(index, 1);
      if (newPhotos.length === 0) setPhotoUploaded(false);
      return newPhotos;
    });
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setCustomer('');
      setWhatsapp('');
      return;
    }
    const selected = customersList.find(c => c.id === selectedId);
    if (selected) {
      setCustomer(selected.name);
      setWhatsapp(selected.phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const orderId = `OS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      customer,
      service,
      status: 'Pendente',
      total: 0,
      date: 'Agora mesmo',
      whatsappNotified: whatsappNotify,
      hasPhotoChecklist: photoUploaded,
      photos,
      invoiceGenerated: false
    };

    if (whatsappNotify && whatsapp) {
      const message = `Olá, ${customer}! Sua ordem de serviço (${orderId}) para o serviço "${service}" foi aberta e já estamos acompanhando.`;
      const success = await sendWhatsAppNotification(whatsapp, message);
      if (!success) {
        console.warn('Falha ao notificar o cliente via WhatsApp.');
        newOrder.whatsappNotified = false; // Could update status if failed
      }
    }

    setTimeout(() => {
      // Get the latest from localStorage just in case to avoid overwriting
      const existingStr = window.localStorage.getItem('erp_orders');
      const existing = existingStr ? JSON.parse(existingStr) : orders;
      
      const newOrdersList = [newOrder, ...existing];
      setOrders(newOrdersList);
      
      setIsSubmitting(false);
      onSuccess();
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Nova Ordem de Serviço</h2>
        <p className="text-slate-500 mt-1">Crie e gerencie o serviço em poucos segundos.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm">1</span>
            Dados do Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Buscar Cliente Cadastrado (Opcional)</label>
              <select onChange={handleCustomerSelect} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
                <option value="">-- Selecione ou digite abaixo --</option>
                {customersList.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input value={customer} onChange={e => setCustomer(e.target.value)} name="customer" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Ex: João da Silva" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} name="whatsapp" required type="tel" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="(11) 99999-9999" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Equipamento / Veículo / Serviço</label>
              <input value={service} onChange={e => setService(e.target.value)} name="service" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="O que será reparado?" />
            </div>
          </div>
        </div>

        {/* Checklist com Foto */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm">2</span>
                Checklist e Condição de Entrada
              </h3>
              <p className="text-sm text-slate-500 mt-1">Registre fotos para evitar acusações falsas (A prova fica salva).</p>
            </div>
            <div className="hidden sm:flex bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Essencial
            </div>
          </div>
          
          <div className="mt-4">
            {!photoUploaded && photos.length === 0 && !isCameraOpen ? (
              <div 
                onClick={openCamera}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-slate-600 font-medium">Capturar Foto do Aparelho</p>
                <p className="text-sm text-slate-400 mt-1">Capture avarias, arranhões ou o estado geral direto pela câmera.</p>
              </div>
            ) : null}

            {isCameraOpen && (
              <div className="bg-slate-900 rounded-xl overflow-hidden relative mb-4">
                <video ref={videoRef} autoPlay playsInline className="w-full h-64 md:h-80 object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button type="button" onClick={closeCamera} className="px-4 py-2 bg-white/20 text-white rounded-lg backdrop-blur-sm">Cancelar</button>
                  <button type="button" onClick={capturePhoto} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 transition-colors">
                    <Camera className="w-5 h-5" /> Capturar
                  </button>
                </div>
              </div>
            )}

            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-square">
                    <img src={photo} alt={`Evidência ${idx + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                      ✕
                    </button>
                  </div>
                ))}
                {!isCameraOpen && (
                  <div onClick={openCamera} className="border-2 border-dashed border-slate-300 rounded-lg aspect-square flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-sm font-medium">Adicionar</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notificações e Faturamento */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm">3</span>
            Automações
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${whatsappNotify ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Aviso Automático no WhatsApp</div>
                  <div className="text-sm text-slate-500">Notificar cliente a cada etapa do serviço</div>
                </div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" checked={whatsappNotify} onChange={() => setWhatsappNotify(!whatsappNotify)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-slate-200 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" style={{ transform: whatsappNotify ? 'translateX(100%)' : 'translateX(0)', borderColor: whatsappNotify ? '#10b981' : '#e2e8f0', backgroundColor: whatsappNotify ? '#10b981' : '#fff' }}/>
                <div className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${whatsappNotify ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
              </div>
            </label>

            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Nota Fiscal (1-Clique)</div>
                  <div className="text-sm text-slate-500">A NF será emitida automaticamente no faturamento.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button type="button" className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
            Gerar OS em Segundos
          </button>
        </div>
      </form>
    </motion.div>
  );
}
