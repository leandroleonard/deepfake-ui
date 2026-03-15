'use client';

import { useState, useEffect } from 'react';
import { Shield, Eye, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import Header from '@/components/header';

export default function HomePage() {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">

      <Header />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>

        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* badge */}
            <div className="inline-flex items-center gap-2 border border-gray-200 bg-white shadow-sm rounded-full px-4 py-2 mb-6 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              Detecção avançada com inteligência artificial
            </div>

            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight">
              Proteja-se contra
              <br />
              conteúdo manipulado
            </h1>

            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Detecte deepfakes em imagens e vídeos com tecnologia de ponta.
              Descubra em segundos se uma mídia é autêntica ou gerada por IA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={auth ? '/analysis/new' : '/register'}
                className="
                  inline-flex items-center justify-center gap-2
                  px-8 py-4
                  bg-black text-white
                  rounded-lg
                  hover:bg-gray-900
                  shadow-lg hover:shadow-xl
                  transition-all duration-200
                "
              >
                {auth ? 'Nova análise' : 'Começar agora'}
                <ArrowRight className="w-4 h-4" />
              </Link>

              {!auth && (
                <Link
                  href="/login"
                  className="
                    px-8 py-4
                    border border-gray-300
                    rounded-lg
                    hover:bg-gray-50
                    transition-all duration-200
                  "
                >
                  Fazer login
                </Link>
              )}
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Resultado em menos de 2 minutos
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider">Como funciona</p>
            <h2 className="text-4xl font-semibold">Processo simples e rápido</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Envie sua mídia',
                desc: 'Faça upload da imagem ou vídeo que deseja verificar.',
              },
              {
                step: '2',
                title: 'Análise com IA',
                desc: 'Nosso sistema analisa a mídia em busca de manipulações.',
              },
              {
                step: '3',
                title: 'Resultado completo',
                desc: 'Receba um relatório detalhado em poucos segundos.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="
                  border border-gray-200
                  rounded-xl
                  p-8
                  bg-white
                  shadow-sm hover:shadow-md
                  transition-all
                "
              >
                <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm text-gray-500 mb-3 uppercase tracking-wider">Tecnologia</p>
            <h2 className="text-4xl font-semibold">Segurança com máxima precisão</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Shield, title: 'Alta precisão', desc: 'Treinado com milhões de amostras reais.' },
              { icon: Eye, title: 'Análise detalhada', desc: 'Identifica áreas suspeitas com precisão.' },
              { icon: Clock, title: 'Resultados rápidos', desc: 'Análise completa em segundos.' },
              { icon: CheckCircle, title: 'Histórico completo', desc: 'Acesse análises anteriores facilmente.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex gap-4">
                  <Icon className="w-6 h-6 mt-1 text-black" />
                  <div>
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-semibold mb-4">
            {auth ? 'Não perca nenhum resultado' : 'Comece agora gratuitamente'}
          </h2>
          <p className="text-gray-300 mb-8">Detecte deepfakes com tecnologia de ponta</p>
          <Link
            href={auth ? '/history' : '/register'}
            className="
              inline-block
              bg-white text-black
              px-8 py-4
              rounded-lg
              hover:bg-gray-100
              transition-all
              shadow-lg
            "
          >
            {auth ? 'Acessar histórico' : 'Criar conta grátis'}
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          © 2026 DeepDetect. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}