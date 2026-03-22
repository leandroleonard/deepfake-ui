'use client';

import { useState } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, CreditCard, Landmark, Smartphone, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const PLANS = [
  { id: 'basic', name: 'Básico', credits: 10, price: '5.000', description: 'Ideal para testes rápidos' },
  { id: 'pro', name: 'Profissional', credits: 50, price: '20.000', description: 'Para investigadores e jornalistas', popular: true },
  { id: 'enterprise', name: 'Empresarial', credits: 200, price: '70.000', description: 'Uso intensivo para empresas' },
];

const BANK_DETAILS = {
  bank: 'BAI',
  owner: 'DEEPDETECT ANGOLA LDA',
  iban: 'AO06 0000 0000 0000 0000 0000 0',
  express_number: '921 252 910',
};

export default function CreditsPage() {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [step, setStep] = useState<'plans' | 'payment'>('plans');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const handleConfirmPayment = async () => {
    try {
      // Aqui enviamos uma notificação ao backend que o usuário pretende pagar esse plano
      await api.post('/credits/notify-payment', {
        plan_id: selectedPlan.id,
        amount: selectedPlan.price,
      });
      setStep('plans');
      toast.success('Pedido de recarga enviado! Envie o comprovativo via WhatsApp ou aguarde a validação.');
    } catch (error) {
      toast.error('Erro ao processar pedido.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#000' }}>Recarregar Créditos</h1>
          <p className="text-gray-600">Escolha um plano e utilize os métodos de pagamento locais de Angola.</p>
        </div>

        {step === 'plans' ? (
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative p-8 flex flex-col border-2 transition-all ${
                  plan.popular ? 'border-black shadow-lg scale-105' : 'border-gray'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2 text-gray-600">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4 text-gray-600">{plan.price} Kz</div>
                <p className="text-gray-500 text-sm mb-6 flex-1 text-gray-600">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600" /> {plan.credits} Créditos de análise
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600" /> Validade ilimitada
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600" /> Suporte prioritário
                  </li>
                </ul>

                <Button 
                  onClick={() => { setSelectedPlan(plan); setStep('payment'); }}
                  className={`w-full ${plan.popular ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                >
                  Selecionar Plano
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gray-50/50">
              <button onClick={() => setStep('plans')} className="text-sm text-gray-500 hover:text-black mb-4">
                ← Voltar aos planos
              </button>
              <h2 className="text-2xl font-bold text-gray-600">Pagamento: {selectedPlan.name}</h2>
              <p className="text-gray-600">Total a pagar: <span className="font-bold text-black">{selectedPlan.price} Kz</span></p>
            </div>

            <div className="p-8 space-y-8">
              {/* Opção 1: Multicaixa Express */}
              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-600">Multicaixa Express / TRF</h4>
                  <p className="text-sm text-gray-500 mb-3">Envie o valor para o número abaixo:</p>
                  <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                    <span className="font-mono font-bold text-gray-400">{BANK_DETAILS.express_number}</span>
                    <button onClick={() => copyToClipboard(BANK_DETAILS.express_number, 'Número')} className="text-blue-600 hover:text-blue-800">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Opção 2: Transferência Bancária */}
              <div className="flex gap-4 items-start">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Landmark className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-600">Transferência Bancária (IBAN)</h4>
                  <p className="text-sm text-gray-500 mb-3">Depósito ou transferência para:</p>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 uppercase font-bold">IBAN {BANK_DETAILS.bank}</p>
                    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                      <span className="font-mono text-xs font-bold text-gray-400">{BANK_DETAILS.iban}</span>
                      <button onClick={() => copyToClipboard(BANK_DETAILS.iban, 'IBAN')} className="text-blue-600 hover:text-blue-800">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  Após o pagamento, os créditos serão adicionados à sua conta num período de 30 min a 2h após a validação do comprovativo.
                </p>
              </div>

              <Button onClick={handleConfirmPayment} className="w-full bg-black text-white py-6 text-lg rounded-xl">
                Já fiz o pagamento
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}