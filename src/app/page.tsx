'use client';

import React, { useState, useEffect, useRef } from 'react';
import { psychologyCorpus, dsm5Database } from './psychologyCorpus';

interface BookItem {
  id: string;
  title: string;
  author: string;
  editorial: string;
  year: string;
  area: string;
  status: 'Completado' | 'En lectura' | 'Por leer';
  summary: string;
  keyConcepts: string[];
  pdfFileName?: string;
}

export default function PsychologyHome() {
  const [activeTab, setActiveTab] = useState('corpus');

  // Metricas persistentes
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [booksFinished, setBooksFinished] = useState(0);
  const [cardsMastered, setCardsMastered] = useState(0);
  const [streakDays, setStreakDays] = useState(1);

  // Focus Audio Ambiental
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio Context compartido para efectos táctiles
  const sfxCtxRef = useRef<AudioContext | null>(null);

  const getSfxContext = () => {
    if (typeof window === 'undefined') return null;
    if (!sfxCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      sfxCtxRef.current = new AudioCtx();
    }
    if (sfxCtxRef.current.state === 'suspended') {
      sfxCtxRef.current.resume();
    }
    return sfxCtxRef.current;
  };

  const playPopSound = () => {
    try {
      const ctx = getSfxContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  };

  const playChimeSound = () => {
    try {
      const ctx = getSfxContext();
      if (!ctx) return;
      [440, 554.37, 659.25, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.26);
      });
    } catch {}
  };

  // Cronómetro de Lectura (30 min, 1h, 2h, 3h)
  const [pomoMinutes, setPomoMinutes] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Buscador de Corpus Textual
  const [corpusSearch, setCorpusSearch] = useState('');
  const [corpusAuthorFilter, setCorpusAuthorFilter] = useState('TODOS');

  // Formulación Clínica Psicoanalítica
  const [caseDescription, setCaseDescription] = useState('');
  const [formulationResult, setFormulationResult] = useState<string | null>(null);
  const [isFormulating, setIsFormulating] = useState(false);

  // Frase teórica inspiracional
  const [quoteIdx, setQuoteIdx] = useState(0);
  const quotes = [
    { text: 'La voz del intelecto es suave, pero no descansa hasta haber logrado ser escuchada.', author: 'Sigmund Freud' },
    { text: 'Una mentira no tendría sentido alguno a menos que la verdad fuera tenida por peligrosa.', author: 'Alfred Adler' },
    { text: 'El carácter consiste en una alteración crónica del yo que podemos calificar de rigidez.', author: 'Wilhelm Reich' },
    { text: 'El yo procura defenderse contra las invasiones del ello mediante diversos mecanismos.', author: 'Anna Freud' }
  ];

  // Las 14 obras clínicas
  const initialBooks: BookItem[] = [
    {
      id: '1',
      title: 'Introducción al psicoanálisis',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1916-1917',
      area: 'Fundamentos y Metapsicología',
      status: 'En lectura',
      summary: 'Conferencias magistrales donde Freud sistematiza los actos fallidos, la teoría de los sueños y la teoría general de las neurosis.',
      keyConcepts: ['Actos fallidos', 'Simbolismo onírico', 'Libido', 'Resistencia', 'Transferencia'],
      pdfFileName: 'introduccion-al-psicoanalisis-freud.pdf'
    },
    {
      id: '2',
      title: 'Esquema del psicoanálisis',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1940',
      area: 'Síntesis Teórica Final',
      status: 'Por leer',
      summary: 'Obra testamentaria póstuma que resume concisamente el aparato psíquico, las pulsiones y la técnica terapéutica.',
      keyConcepts: ['Aparato psíquico', 'Segunda tópica', 'Eros y Tánatos', 'Técnica analítica'],
      pdfFileName: 'esquema-del-psicoanalisis-freud.pdf'
    },
    {
      id: '3',
      title: 'Autobiografía',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1925',
      area: 'Historia del Movimiento',
      status: 'Por leer',
      summary: 'Crónica personal y científica de los descubrimientos que forjaron el nacimiento y la consolidación del movimiento psicoanalítico.',
      keyConcepts: ['Catarsis de Breuer', 'Ruptura con Fliess', 'Génesis teórica'],
      pdfFileName: 'autobiografia-freud.pdf'
    },
    {
      id: '4',
      title: 'Escritos sobre la histeria',
      author: 'Sigmund Freud y Josef Breuer',
      editorial: 'Alianza Editorial',
      year: '1895',
      area: 'Clínica Fundacional',
      status: 'Completado',
      summary: 'Estudios clínicos sobre la histeria femenina y el paso revolucionario del método hipnótico al habla catártica.',
      keyConcepts: ['Conversión somática', 'Trauma psíquico', 'Método catártico', 'Caso Anna O.'],
      pdfFileName: 'escritos-sobre-la-histeria-freud.pdf'
    },
    {
      id: '5',
      title: 'La interpretación de los sueños',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1900',
      area: 'Vía Regia al Inconsciente',
      status: 'En lectura',
      summary: 'Fundamento que demuestra que el sueño es el cumplimiento disfrazado de un deseo reprimido.',
      keyConcepts: ['Contenido manifiesto', 'Pensamientos latentes', 'Condensación', 'Desplazamiento', 'Censura'],
      pdfFileName: 'la-interpretacion-de-los-suenos-freud.pdf'
    },
    {
      id: '6',
      title: 'Psicopatología de la vida cotidiana',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1901',
      area: 'Manifestaciones del Inconsciente',
      status: 'Completado',
      summary: 'Análisis minucioso de lapsus linguae, olvido de nombres propios y acciones fallidas en la vida diaria.',
      keyConcepts: ['Lapsus', 'Olvido motivado', 'Traspapelar', 'Determinismo psíquico'],
      pdfFileName: 'psicopatologia-de-la-vida-cotidiana-freud.pdf'
    },
    {
      id: '7',
      title: 'El chiste y su relación con lo inconsciente',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1905',
      area: 'Economía Psíquica',
      status: 'Por leer',
      summary: 'Estudio de los mecanismos que permiten liberar energía psíquica y burlar la censura a través del humor.',
      keyConcepts: ['Ahorro de gasto psíquico', 'Técnicas del chiste', 'Alivio de tensión'],
      pdfFileName: 'el-chiste-y-su-relacion-con-lo-inconsciente-freud.pdf'
    },
    {
      id: '8',
      title: 'Tres ensayos sobre teoría sexual',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1905',
      area: 'Desarrollo Psicosexual',
      status: 'En lectura',
      summary: 'Evolución de la sexualidad infantil, las zonas erógenas y las fijaciones que estructuran las futuras neurosis.',
      keyConcepts: ['Fase oral', 'Fase anal', 'Fase fálica', 'Complejo de Edipo', 'Pulsión parcial'],
      pdfFileName: 'tres-ensayos-sobre-teoria-sexual-freud.pdf'
    },
    {
      id: '9',
      title: 'Más allá del principio del placer',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1920',
      area: 'Giro Teórico Trascendental',
      status: 'Por leer',
      summary: 'Introducción del concepto de pulsión de muerte (Tánatos) y la compulsión a la repetición.',
      keyConcepts: ['Compulsión a la repetición', 'Pulsión de muerte', 'Neurosis de guerra', 'Principio de Nirvana'],
      pdfFileName: 'mas-alla-del-principio-del-placer-freud.pdf'
    },
    {
      id: '10',
      title: 'El yo y el ello',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1923',
      area: 'Segunda Tópica Estructural',
      status: 'En lectura',
      summary: 'Presentación formal de las instancias psíquicas que rigen la personalidad humana.',
      keyConcepts: ['Ello (pulsiones)', 'Yo (realidad)', 'Superyó (ideal moral)', 'Sentimiento inconsciente de culpa'],
      pdfFileName: 'el-yo-y-el-ello-freud.pdf'
    },
    {
      id: '11',
      title: 'Nuevas aportaciones al psicoanálisis',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      year: '1933',
      area: 'Revisión y Conferencias',
      status: 'Por leer',
      summary: 'Revisión crítica de la doctrina onírica, las defensas y la cosmovisión científica del psicoanálisis.',
      keyConcepts: ['Descomposición de la personalidad', 'Sueño y ocultismo', 'Feminidad'],
      pdfFileName: 'nuevas-aportaciones-al-psicoanalisis-freud.pdf'
    },
    {
      id: '12',
      title: 'El yo y los mecanismos de defensa',
      author: 'Anna Freud',
      editorial: 'Paidós',
      year: '1936',
      area: 'Psicología del Yo y Defensas',
      status: 'En lectura',
      summary: 'Sistematización exhaustiva de los recursos que emplea el yo para protegerse de la angustia y el conflicto.',
      keyConcepts: ['Sublimación', 'Formación reactiva', 'Proyección', 'Identificación con el agresor', 'Regresión'],
      pdfFileName: 'el-yo-y-los-mecanismos-de-defensa-anna-freud.pdf'
    },
    {
      id: '13',
      title: 'El carácter neurótico',
      author: 'Alfred Adler',
      editorial: 'Paidós',
      year: '1912',
      area: 'Psicología Individual',
      status: 'Completado',
      summary: 'Fundamento de la psicología individual: el afán de poder, el sentimiento de inferioridad y las compensaciones.',
      keyConcepts: ['Sentimiento de inferioridad', 'Afán de superioridad', 'Arreglo neurótico', 'Línea de vida', 'Finalismo ficticio'],
      pdfFileName: 'el-caracter-neurotico-adler.pdf'
    },
    {
      id: '14',
      title: 'Análisis del carácter',
      author: 'Wilhelm Reich',
      editorial: 'Paidós',
      year: '1933',
      area: 'Coraza Caracterológica y Somática',
      status: 'En lectura',
      summary: 'Pionero estudio de cómo las resistencias psíquicas se solidifican en tensiones corporales crónicas.',
      keyConcepts: ['Coraza caracterial', 'Coraza muscular', 'Vegetoterapia', 'Resistencia del carácter', 'Potencia orgástica'],
      pdfFileName: 'analisis-del-caracter-reich.pdf'
    }
  ];

  const [books, setBooks] = useState<BookItem[]>(initialBooks);

  // Cargar datos guardados
  useEffect(() => {
    const sMins = localStorage.getItem('psy_mins');
    const sDone = localStorage.getItem('psy_done');
    const sCards = localStorage.getItem('psy_cards');
    const sStreak = localStorage.getItem('psy_streak');
    if (sMins) setReadingMinutes(Number(sMins));
    if (sDone) setBooksFinished(Number(sDone));
    if (sCards) setCardsMastered(Number(sCards));
    if (sStreak) setStreakDays(Number(sStreak));
  }, []);

  useEffect(() => {
    localStorage.setItem('psy_mins', readingMinutes.toString());
    localStorage.setItem('psy_done', booksFinished.toString());
    localStorage.setItem('psy_cards', cardsMastered.toString());
    localStorage.setItem('psy_streak', streakDays.toString());
  }, [readingMinutes, booksFinished, cardsMastered, streakDays]);

  const showNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3800);
  };

  // Temporizador de estudio
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setReadingMinutes(prev => prev + pomoMinutes);
      playChimeSound();
      showNotice(`🎉 ¡Sesión de ${pomoMinutes}m completada! Tiempo acumulado para tu maestría.`);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, pomoMinutes]);

  const toggleFocusAudio = () => {
    playPopSound();
    if (isAudioPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsAudioPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        setIsAudioPlaying(true);
        showNotice('🌧️ Sonido de lluvia para lectura profunda activado');
      } catch {
        showNotice('Toca la pantalla para activar el audio');
      }
    }
  };

  // Motor de Formulación Clínica
  const handleGenerateFormulation = () => {
    playPopSound();
    if (!caseDescription.trim()) return;
    setIsFormulating(true);

    setTimeout(() => {
      const lower = caseDescription.toLowerCase();
      let hypothesis = '';
      let defense = '';
      let bodyArmor = '';
      let adlerComp = '';
      let dsmCat = '';

      if (lower.includes('cuerpo') || lower.includes('tensión') || lower.includes('contractura') || lower.includes('respiración') || lower.includes('cuello') || lower.includes('espalda')) {
        bodyArmor = 'Wilhelm Reich (Análisis del carácter): Se observa una fijación somática característica de la "coraza muscular". Las tensiones crónicas fungen como un blindaje que inmoviliza la energía libidinal y la agresividad no tramitada verbalmente.';
      } else {
        bodyArmor = 'Wilhelm Reich: Predominio de coraza caracterológica conductual; rigidez yoica adaptativa como respuesta a frustraciones infantiles tempranas.';
      }

      if (lower.includes('culpa') || lower.includes('perfeccion') || lower.includes('orden') || lower.includes('limpieza') || lower.includes('control')) {
        hypothesis = 'Sigmund Freud (El yo y el ello): Conflicto primario entre un Superyó punitivo y las pulsiones del Ello. El síntoma actúa como un autocastigo o expiación.';
        defense = 'Anna Freud: Mecanismos nucleares de Formación Reactiva y Aislamiento del Afecto (propio de la neurosis obsesiva).';
        dsmCat = 'DSM-5: Corresponde a criterios de Trastorno de la Personalidad Obsesivo-Compulsiva (F60.5).';
      } else if (lower.includes('miedo') || lower.includes('abandono') || lower.includes('vacio') || lower.includes('inestable') || lower.includes('impulsiv')) {
        hypothesis = 'Sigmund Freud / Kernberg: Falla en la integración de las representaciones del objeto y angustia de pérdida. Defecto en la función reguladora del Yo.';
        defense = 'Anna Freud: Predominio del mecanismo de Escisión (splitting) e Identificación Proyectiva.';
        dsmCat = 'DSM-5: Alineado con el Trastorno de la Personalidad Límite (F60.3).';
      } else {
        hypothesis = 'Sigmund Freud (Introducción al psicoanálisis): El síntoma es un compromiso simbólico entre una moción pulsional reprimida que busca satisfacción y la censura moral del Yo.';
        defense = 'Anna Freud: Mecanismo de Represión Primaria secundado por Desplazamiento.';
        dsmCat = 'DSM-5: Trastorno de Síntomas Somáticos / Trastorno de Conversión (F44.4).';
      }

      adlerComp = 'Alfred Adler (El carácter neurótico): La conducta analizada opera como un "Arreglo Neurótico" teleológico destinado a salvaguardar al sujeto de un profundo "Sentimiento de Inferioridad", construyendo una posición de superioridad ficticia.';

      setFormulationResult(
        `📋 FORMULACIÓN CLÍNICA & PSICODINÁMICA INTEGRADA:\n\n` +
        `1. HIPÓTESIS ESTRUCTURAL FREUDIANA:\n${hypothesis}\n\n` +
        `2. DEFENSAS YOICAS (ANNA FREUD):\n${defense}\n\n` +
        `3. CORAZA Y REGISTRO SOMÁTICO (WILHELM REICH):\n${bodyArmor}\n\n` +
        `4. FINALISMO Y COMPENSACIÓN (ALFRED ADLER):\n${adlerComp}\n\n` +
        `5. CRUCE NOSOLÓGICO DSM-5:\n${dsmCat}\n\n` +
        `💡 Sugerencia técnica para Goodnotes/Notion: Explorar en la sesión los puntos de fijación infantil y el beneficio primario del síntoma.`
      );

      setIsFormulating(false);
      playChimeSound();
      showNotice('✨ Formulación clínica generada con éxito.');
    }, 1200);
  };

  const filteredCorpus = psychologyCorpus.filter(c => {
    const matchesSearch = c.term.toLowerCase().includes(corpusSearch.toLowerCase()) ||
                          c.literalDefinition.toLowerCase().includes(corpusSearch.toLowerCase()) ||
                          c.book.toLowerCase().includes(corpusSearch.toLowerCase()) ||
                          c.author.toLowerCase().includes(corpusSearch.toLowerCase());
    if (corpusAuthorFilter === 'TODOS') return matchesSearch;
    if (corpusAuthorFilter === 'FREUD') return matchesSearch && c.author.includes('Sigmund');
    if (corpusAuthorFilter === 'ANNA') return matchesSearch && c.author.includes('Anna');
    if (corpusAuthorFilter === 'ADLER') return matchesSearch && c.author.includes('Adler');
    if (corpusAuthorFilter === 'REICH') return matchesSearch && c.author.includes('Reich');
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#F1F7F7] text-[#5D6B6B] font-sans antialiased selection:bg-[#F7CBCA]">
      {/* BARRA LATERAL SALVIA */}
      <aside className="w-80 shrink-0 bg-[#E3EFEA] p-5 flex flex-col justify-between border-r border-[#D5E5E5] shadow-[6px_0_24px_rgba(93,107,107,0.08)]">
        <div>
          {/* PERFIL */}
          <div className="bg-white rounded-[28px] p-4 mb-5 flex items-center gap-3.5 shadow-[6px_8px_20px_rgba(189,209,209,0.35)]">
            <div className="relative w-14 h-14 rounded-[22px] p-1 bg-[#D5E5E5] flex items-center justify-center shrink-0 shadow-inner">
              <div className="w-full h-full rounded-[18px] overflow-hidden bg-[#F7CBCA] flex items-center justify-center font-black text-[#5D6B6B]">
                <img
                  src="/lorena.jpg"
                  alt="Lorena"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <span className="text-sm font-black">LA</span>
              </div>
              <span className="absolute -bottom-1 -right-1 text-xs">🧠</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[#5D6B6B] font-extrabold flex items-center gap-1">
                Lorena Alvarez <span>✨</span>
              </div>
              <div className="font-black text-[#3B4747] text-sm tracking-tight truncate">
                Psychology Mastery
              </div>
              <div className="text-[10px] text-[#7A8E8E] font-bold mt-0.5 flex items-center gap-1">
                <span>📚</span> 14 Obras + DSM-5
              </div>
            </div>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="space-y-2">
            {[
              { id: 'corpus', label: 'Corpus de Libros (PDF)', icon: '📖', badge: '14 Obras', bg: 'bg-[#F7CBCA]' },
              { id: 'formulacion', label: 'Formulación Clínica IA', icon: '🩺', badge: 'Diagnóstico', bg: 'bg-[#BDD1D1]' },
              { id: 'dsm5', label: 'DSM-5 & Criterios', icon: '📑', badge: 'Manual', bg: 'bg-[#D5E5E5]' },
              { id: 'biblioteca', label: 'Biblioteca de Lectura', icon: '📚', badge: 'Estado', bg: 'bg-[#F7CBCA]' },
              { id: 'focus', label: 'Focus de Estudio', icon: '⏱️', badge: '30m - 3h', bg: 'bg-[#D5E5E5]' },
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playPopSound();
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[22px] text-xs font-black transition-all ${
                    active
                      ? 'bg-white text-[#3B4747] shadow-[5px_6px_16px_rgba(93,107,107,0.12)] translate-x-1'
                      : 'text-[#5D6B6B] hover:bg-white/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-9 h-9 rounded-[16px] flex items-center justify-center text-base shrink-0 shadow-sm ${item.bg}`}>
                      {item.icon}
                    </span>
                    <span className="text-xs tracking-tight truncate">{item.label}</span>
                  </span>
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                    active ? 'bg-[#D5E5E5] text-[#3B4747]' : 'bg-[#DDE9E9] text-[#7A8E8E]'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ACCESOS DIRECTOS A NOTION Y GOODNOTES */}
        <div className="pt-4 border-t border-[#D5E5E5] space-y-2.5">
          <a
            href="notion://"
            onClick={playPopSound}
            className="w-full py-2.5 px-3 rounded-[18px] bg-white hover:bg-[#F7CBCA]/30 text-[#3B4747] text-xs font-black flex items-center justify-between shadow-[4px_5px_12px_rgba(93,107,107,0.08)] transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-[#D5E5E5] flex items-center justify-center text-sm">📓</span>
              <span>Mi Notion (Biblioteca)</span>
            </span>
            <span className="text-xs">↗</span>
          </a>

          <a
            href="goodnotes://"
            onClick={playPopSound}
            className="w-full py-2.5 px-3 rounded-[18px] bg-gradient-to-r from-[#F7CBCA] to-[#E8B4B3] hover:brightness-105 text-[#3B4747] text-xs font-black flex items-center justify-between shadow-[4px_5px_12px_rgba(247,203,202,0.45)] transition-all"
          >
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-white/70 flex items-center justify-center text-sm">✍️</span>
              <span>Apuntes en Goodnotes</span>
            </span>
            <span className="text-xs">↗</span>
          </a>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto overflow-y-auto">
        {savedNotice && (
          <div className="fixed top-5 right-5 z-50 bg-[#BDD1D1] text-[#2C3838] font-black text-xs px-5 py-3.5 rounded-[22px] shadow-xl animate-bounce flex items-center gap-2 border border-white">
            <span>🌸</span>
            <span>{savedNotice}</span>
          </div>
        )}

        {/* CABECERA */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#7A8E8E] bg-[#D5E5E5] px-3 py-1 rounded-full">
              Santuario de Lectura & Teoría Clínica 🌿
            </span>
            <h1 className="text-2xl font-black text-[#3B4747] tracking-tight mt-1">
              Psicología & Psicoanálisis
            </h1>
          </div>

          <div
            onClick={() => {
              playPopSound();
              setQuoteIdx((quoteIdx + 1) % quotes.length);
            }}
            className="hidden sm:flex items-center gap-3 bg-white p-3.5 rounded-[22px] max-w-md cursor-pointer hover:scale-[1.01] transition-transform shadow-[6px_8px_18px_rgba(189,209,209,0.3)] border border-[#E3EFEA]"
            title="Toca para cambiar de cita"
          >
            <span className="text-2xl">💬</span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#3B4747] italic line-clamp-2">&quot;{quotes[quoteIdx].text}&quot;</p>
              <span className="text-[10px] font-black text-[#7A8E8E]">— {quotes[quoteIdx].author}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. CORPUS DE DEFINICIONES SEGÚN CADA LIBRO */}
        {/* ========================================================= */}
        {activeTab === 'corpus' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#3B4747]">Corpus Textual & Definiciones Literales 📖</h2>
                <p className="text-xs text-[#7A8E8E] mt-0.5">
                  Escribe cualquier concepto (ej. <em>coraza caracterológica, fijación, inferioridad</em>) para obtener su definición exacta según la obra.
                </p>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['TODOS', 'FREUD', 'ANNA', 'ADLER', 'REICH'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      playPopSound();
                      setCorpusAuthorFilter(tab);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all ${
                      corpusAuthorFilter === tab
                        ? 'bg-[#F7CBCA] text-[#3B4747] shadow-sm'
                        : 'bg-white text-[#7A8E8E] hover:bg-[#E3EFEA]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* BARRA DE BÚSQUEDA DEL CORPUS */}
            <div className="bg-white rounded-[24px] p-4 flex items-center gap-3 shadow-[6px_8px_18px_rgba(189,209,209,0.22)] border border-[#E8F0F0]">
              <span className="text-lg">🔍</span>
              <input
                type="text"
                value={corpusSearch}
                onChange={e => setCorpusSearch(e.target.value)}
                placeholder="Buscar qué significa según el libro (ej. coraza caracterológica, superyó, arreglo)..."
                className="w-full bg-transparent border-none text-xs text-[#3B4747] placeholder-[#8A9C9C] focus:outline-none font-medium"
              />
              {corpusSearch && (
                <button onClick={() => setCorpusSearch('')} className="text-xs text-[#8A9C9C] hover:text-[#3B4747]">
                  ✕
                </button>
              )}
            </div>

            {/* TARJETAS DEL CORPUS CON DEFINICIÓN DEL LIBRO */}
            <div className="grid grid-cols-1 gap-4">
              {filteredCorpus.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[26px] p-6 shadow-[6px_8px_20px_rgba(189,209,209,0.22)] border border-[#E8F0F0] space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-[#F7CBCA] text-[#3B4747]">
                        {item.term}
                      </span>
                      <span className="text-xs font-bold text-[#7A8E8E]">
                        — {item.author}
                      </span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E3EFEA] text-[#5D6B6B]">
                      📖 Obra: {item.book} ({item.editorial})
                    </span>
                  </div>

                  <div className="bg-[#F1F7F7] p-4 rounded-[20px] text-xs text-[#3B4747] leading-relaxed font-semibold italic border-l-4 border-[#F7CBCA]">
                    &quot;{item.literalDefinition}&quot;
                  </div>

                  <div className="text-xs text-[#5D6B6B] leading-relaxed font-medium">
                    <strong className="text-[#3B4747]">Contexto y Aplicación Clínica:</strong> {item.clinicalContext}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1F7F7]">
                    <div className="flex gap-1.5">
                      {item.tags.map((t, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#D5E5E5] text-[#3B4747]">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <a
                      href="goodnotes://"
                      onClick={playPopSound}
                      className="text-[11px] font-black text-[#5D6B6B] hover:text-[#3B4747] flex items-center gap-1"
                    >
                      <span>✍️</span> Anotar en Goodnotes ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. FORMULACIÓN CLÍNICA PSICOANALÍTICA (IA INTERACTIVA) */}
        {/* ========================================================= */}
        {activeTab === 'formulacion' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#3B4747]">Asistente de Formulación Clínica & Psicodinámica 🩺</h2>
              <p className="text-xs text-[#7A8E8E] mt-0.5">
                Ingresa una viñeta, motivo de consulta o síntomas del paciente para obtener un cruce entre Freud, Adler, Reich y el DSM-5.
              </p>
            </div>

            <div className="bg-white rounded-[28px] p-6 sm:p-7 space-y-4 shadow-[8px_10px_24px_rgba(189,209,209,0.3)] border border-[#E8F0F0]">
              <label className="block text-xs font-black text-[#3B4747]">
                Descripción del caso clínico, síntoma somático o conflicto del paciente:
              </label>

              <textarea
                value={caseDescription}
                onChange={e => setCaseDescription(e.target.value)}
                rows={5}
                placeholder="Ejemplo: Paciente refiere rigidez crónica en cuello y hombros, incapacidad de relajarse, perfeccionismo extremo en el trabajo y sentimiento constante de que si no controla todo sufrirá una humillación..."
                className="w-full bg-[#F1F7F7] rounded-[20px] p-4 text-xs text-[#3B4747] placeholder-[#8A9C9C] focus:outline-none font-medium shadow-inner"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateFormulation}
                  disabled={isFormulating || !caseDescription.trim()}
                  className="flex-1 py-3.5 rounded-[20px] bg-gradient-to-r from-[#F7CBCA] to-[#E8B4B3] hover:brightness-105 text-[#3B4747] font-black text-xs shadow-md disabled:opacity-50 transition-all"
                >
                  {isFormulating ? 'Formulando hipótesis psicodinámica...' : '✨ Analizar Caso con Psicoanálisis & DSM-5'}
                </button>
                <button
                  onClick={() => {
                    playPopSound();
                    setCaseDescription('');
                    setFormulationResult(null);
                  }}
                  className="px-5 py-3.5 rounded-[20px] bg-[#F1F7F7] text-[#7A8E8E] text-xs font-black hover:bg-[#E3EFEA]"
                >
                  Limpiar
                </button>
              </div>

              {formulationResult && (
                <div className="mt-4 p-5 rounded-[22px] bg-[#FAF8F5] text-xs text-[#3B4747] leading-relaxed whitespace-pre-line font-medium border border-[#E8E0D5] shadow-inner">
                  {formulationResult}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. DSM-5 & MANUAL DIAGNÓSTICO */}
        {/* ========================================================= */}
        {activeTab === 'dsm5' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#3D352E]">Criterios DSM-5 & Cruce Psicoanalítico 📑</h2>
              <p className="text-xs text-[#7A8E8E] mt-0.5">
                Criterios oficiales del manual médico contrastados con la lectura estructural y defensiva.
              </p>
            </div>

            <div className="space-y-5">
              {dsm5Database.map(cat => (
                <div key={cat.id} className="bg-white rounded-[28px] p-6 shadow-[6px_8px_20px_rgba(189,209,209,0.22)] border border-[#E8F0F0] space-y-4">
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#D5E5E5] text-[#2C3838]">
                    {cat.name}
                  </span>

                  <div className="space-y-4">
                    {cat.disorders.map((d, i) => (
                      <div key={i} className="p-4 rounded-[22px] bg-[#F1F7F7] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-[#3B4747]">{d.code} • {d.title}</h3>
                          <span className="text-[10px] font-bold text-[#7A8E8E]">DSM-5</span>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-[#5D6B6B]">Criterios nucleares del manual:</span>
                          <ul className="text-xs text-[#5D6B6B] space-y-1 mt-1 pl-2">
                            {d.criteriaSummary.map((crit, idx) => (
                              <li key={idx}>• {crit}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-[#DDE9E9]">
                          <span className="text-[11px] font-black text-[#3B4747]">Lectura Psicoanalítica Diferencial:</span>
                          <p className="text-xs text-[#5D6B6B] mt-1 leading-relaxed italic">
                            {d.differentialPsychoanalysis}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. BIBLIOTECA DE LECTURA DE LAS 14 OBRAS */}
        {/* ========================================================= */}
        {activeTab === 'biblioteca' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#3B4747]">Tus 14 Obras de Estudio 📚</h2>
                <p className="text-xs text-[#7A8E8E] mt-0.5">Gestión de lectura y fichas por libro.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-[26px] p-5 flex flex-col justify-between shadow-[6px_8px_20px_rgba(189,209,209,0.22)] border border-[#E8F0F0]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E3EFEA] text-[#5D6B6B]">
                        {book.editorial} • {book.year}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        book.status === 'Completado' ? 'bg-[#D5E5E5] text-[#2C3838]' : book.status === 'En lectura' ? 'bg-[#F7CBCA] text-[#3B4747]' : 'bg-[#EAEAEA] text-[#7A8E8E]'
                      }`}>
                        {book.status}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-[#3B4747] leading-snug">{book.title}</h3>
                    <div className="text-xs font-bold text-[#7A8E8E] mt-0.5">{book.author}</div>
                    <p className="text-xs text-[#5D6B6B] mt-2.5 leading-relaxed font-medium">{book.summary}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F1F7F7] flex items-center justify-between gap-2">
                    <select
                      value={book.status}
                      onChange={(e) => {
                        playPopSound();
                        const newStatus = e.target.value as BookItem['status'];
                        setBooks(prev => prev.map(b => b.id === book.id ? { ...b, status: newStatus } : b));
                      }}
                      className="bg-[#F1F7F7] rounded-[16px] px-3 py-1.5 text-xs font-black text-[#3B4747] focus:outline-none"
                    >
                      <option value="En lectura">📖 En lectura</option>
                      <option value="Completado">✅ Completado</option>
                      <option value="Por leer">⏳ Por leer</option>
                    </select>

                    <a
                      href="notion://"
                      onClick={playPopSound}
                      className="px-3 py-1.5 rounded-[16px] bg-[#D5E5E5] text-[#2C3838] text-xs font-black flex items-center gap-1 shadow-sm"
                    >
                      <span>📓</span> Notion
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. FOCUS & LECTURA PROFUNDA (30M A 3 HORAS) */}
        {/* ========================================================= */}
        {activeTab === 'focus' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] p-7 shadow-[8px_10px_24px_rgba(189,209,209,0.3)] border border-[#E8F0F0] space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-[#F7CBCA] text-[#3B4747]">
                    Lectura Profunda & Análisis Clínico 📖
                  </span>
                  <h2 className="text-xl font-black text-[#3B4747] mt-1.5">Bloques de Estudio Continuado</h2>
                  <p className="text-xs text-[#7A8E8E]">Sesiones extensas para subrayar textos y redactar fichas teóricas.</p>
                </div>

                <div className="text-4xl font-black font-mono text-[#3B4747] bg-[#F1F7F7] px-6 py-2.5 rounded-[22px] shadow-inner">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
              </div>

              {/* SELECTOR REAL DE TIEMPO (30 MIN, 1 HORA, 2 HORAS, 3 HORAS) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: '30 Minutos', mins: 30 },
                  { label: '1 Hora (60m)', mins: 60 },
                  { label: '2 Horas (120m)', mins: 120 },
                  { label: '3 Horas (180m)', mins: 180 },
                ].map(item => (
                  <button
                    key={item.mins}
                    onClick={() => {
                      playPopSound();
                      setPomoMinutes(item.mins);
                      setTimeLeft(item.mins * 60);
                      setIsRunning(false);
                    }}
                    className={`py-3 rounded-[20px] text-xs font-black transition-all ${
                      pomoMinutes === item.mins
                        ? 'bg-[#F7CBCA] text-[#3B4747] shadow-sm'
                        : 'bg-[#F1F7F7] text-[#7A8E8E] hover:bg-[#E3EFEA]'
                    }`}
                  >
                    🌸 {item.label}
                  </button>
                ))}
              </div>

              {/* BOTONES DE CONTROL */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <button
                  onClick={() => {
                    playPopSound();
                    setIsRunning(!isRunning);
                  }}
                  className={`flex-1 py-4 rounded-[22px] text-xs font-black text-[#3B4747] transition-all shadow-md ${
                    isRunning ? 'bg-[#F7CBCA] hover:brightness-105' : 'bg-[#BDD1D1] hover:brightness-105'
                  }`}
                >
                  {isRunning ? '⏸️ Pausar Lectura' : `▶️ Iniciar Lectura (${pomoMinutes >= 60 ? `${pomoMinutes / 60}h` : `${pomoMinutes}m`})`}
                </button>
                <button
                  onClick={toggleFocusAudio}
                  className={`px-5 py-4 rounded-[22px] text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    isAudioPlaying
                      ? 'bg-[#D5E5E5] text-[#2C3838] animate-pulse shadow-inner'
                      : 'bg-[#F1F7F7] text-[#5D6B6B] hover:bg-[#E3EFEA]'
                  }`}
                >
                  <span>{isAudioPlaying ? '🌧️' : '🎧'}</span> {isAudioPlaying ? 'Lluvia Suave (Activa)' : 'Lluvia Ambiental'}
                </button>
                <button
                  onClick={() => {
                    playPopSound();
                    setIsRunning(false);
                    setTimeLeft(pomoMinutes * 60);
                  }}
                  className="px-5 py-4 rounded-[22px] text-xs font-black bg-[#F1F7F7] text-[#7A8E8E] hover:bg-[#E3EFEA]"
                >
                  ↺ Reiniciar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}