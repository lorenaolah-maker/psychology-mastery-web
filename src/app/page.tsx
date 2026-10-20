'use client';

import React, { useState, useEffect, useRef } from 'react';

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
  notionUrl?: string;
}

export default function PsychologyHome() {
  const [activeTab, setActiveTab] = useState('biblioteca');

  // Metricas persistentes
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [booksFinished, setBooksFinished] = useState(0);
  const [cardsMastered, setCardsMastered] = useState(0);
  const [streakDays, setStreakDays] = useState(1);

  // Focus Audio Ambiental
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio Context compartido para efectos tactiles
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

  // Cronometro de Lectura
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Frase teorica inspiracional
  const [quoteIdx, setQuoteIdx] = useState(0);
  const quotes = [
    { text: 'La voz del intelecto es suave, pero no descansa hasta haber logrado ser escuchada.', author: 'Sigmund Freud' },
    { text: 'Una mentira no tendría sentido alguno a menos que la verdad fuera tenida por peligrosa.', author: 'Alfred Adler' },
    { text: 'El carácter consiste en una alteración crónica del yo que podemos calificar de rigidez.', author: 'Wilhelm Reich' },
    { text: 'El yo procura defenderse contra las invasiones del ello mediante diversos mecanismos.', author: 'Anna Freud' }
  ];

  // Buscador de libros y conceptos
  const [bookSearch, setBookSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('TODOS');

  // Las 14 obras clinicas
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
      keyConcepts: ['Actos fallidos', 'Simbolismo onírico', 'Libido', 'Resistencia', 'Transferencia']
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
      keyConcepts: ['Aparato psíquico', 'Segunda tópica', 'Eros y Tánatos', 'Técnica analítica']
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
      keyConcepts: ['Catarsis de Breuer', 'Ruptura con Fliess', 'Génesis teórica']
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
      keyConcepts: ['Conversión somática', 'Trauma psíquico', 'Método catártico', 'Caso Anna O.']
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
      keyConcepts: ['Contenido manifiesto', 'Pensamientos latentes', 'Condensación', 'Desplazamiento', 'Censura']
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
      keyConcepts: ['Lapsus', 'Olvido motivado', 'Traspapelar', 'Determinismo psíquico']
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
      keyConcepts: ['Ahorro de gasto psíquico', 'Técnicas del chiste', 'Alivio de tensión']
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
      keyConcepts: ['Fase oral', 'Fase anal', 'Fase fálica', 'Complejo de Edipo', 'Pulsión parcial']
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
      keyConcepts: ['Compulsión a la repetición', 'Pulsión de muerte', 'Neurosis de guerra', 'Principio de Nirvana']
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
      keyConcepts: ['Ello (pulsiones)', 'Yo (realidad)', 'Superyó (ideal moral)', 'Sentimiento inconsciente de culpa']
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
      keyConcepts: ['Descomposición de la personalidad', 'Sueño y ocultismo', 'Feminidad']
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
      keyConcepts: ['Sublimación', 'Formación reactiva', 'Proyección', 'Identificación con el agresor', 'Regresión']
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
      keyConcepts: ['Sentimiento de inferioridad', 'Afán de superioridad', 'Arreglo neurótico', 'Línea de vida', 'Finalismo ficticio']
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
      keyConcepts: ['Coraza caracterial', 'Coraza muscular', 'Vegetoterapia', 'Resistencia del carácter', 'Potencia orgástica']
    }
  ];

  const [books, setBooks] = useState<BookItem[]>(initialBooks);

  // Flashcards clinicas
  const flashcards = [
    {
      cat: 'Anna Freud • Mecanismos',
      front: '¿Qué es la "Identificación con el agresor"?',
      back: 'Mecanismo de defensa donde el sujeto, ante un peligro externo, se apropia de los atributos agresivos del atacante o reproduce su conducta para pasar de ser víctima pasiva a figura activa de control.'
    },
    {
      cat: 'Alfred Adler • Psicología Individual',
      front: '¿Cómo define Adler el "Sentimiento de Inferioridad"?',
      back: 'Un estado universal intrínseco al ser humano desde la infancia debido a la indefensión biológica, el cual actúa como el motor psíquico principal que impulsa el afán de compensación y autorrealización.'
    },
    {
      cat: 'Wilhelm Reich • Caracterología',
      front: '¿Qué representa la "Coraza Muscular"?',
      back: 'La manifestación somática de la coraza del carácter: tensiones y rigideces musculares crónicas donde quedan atrapadas y bloqueadas las energías emocionales y pulsionales no elaboradas.'
    },
    {
      cat: 'Sigmund Freud • Metapsicología',
      front: '¿Cuál es la función del "Superyó"?',
      back: 'Instancia psíquica heredera del Complejo de Edipo que interioriza las demandas y prohibiciones parentales y sociales, actuando como juez moral, censor y fuente del sentimiento de culpa.'
    },
    {
      cat: 'Sigmund Freud • Sueños',
      front: '¿Qué es el "Desplazamiento" en la elaboración onírica?',
      back: 'Proceso por el cual la carga afectiva o importancia de una idea latente intensa se traslada a otro elemento indiferente o secundario del contenido manifiesto para burlar la censura.'
    }
  ];

  const [cardIdx, setCardIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

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
    setTimeout(() => setSavedNotice(null), 3500);
  };

  // Temporizador
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setReadingMinutes(prev => prev + pomoMinutes);
      playChimeSound();
      showNotice(`🎉 ¡Sesión de lectura completada! +${pomoMinutes} minutos de análisis.`);
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

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
                          b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
                          b.keyConcepts.some(c => c.toLowerCase().includes(bookSearch.toLowerCase()));
    if (authorFilter === 'TODOS') return matchesSearch;
    if (authorFilter === 'FREUD') return matchesSearch && b.author.includes('Sigmund');
    if (authorFilter === 'ANNA') return matchesSearch && b.author.includes('Anna');
    if (authorFilter === 'ADLER') return matchesSearch && b.author.includes('Adler');
    if (authorFilter === 'REICH') return matchesSearch && b.author.includes('Reich');
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-[#F1F7F7] text-[#5D6B6B] font-sans antialiased selection:bg-[#F7CBCA]">
      {/* BARRA LATERAL SALVIA / BRUMA */}
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
                <span>📚</span> 14 Obras de Estudio
              </div>
            </div>
          </div>

          {/* NAVEGACION */}
          <nav className="space-y-2">
            {[
              { id: 'biblioteca', label: 'Biblioteca de Obras', icon: '📖', badge: '14 Libros', bg: 'bg-[#F7CBCA]' },
              { id: 'focus', label: 'Focus & Lectura', icon: '⏱️', badge: '25-30m', bg: 'bg-[#D5E5E5]' },
              { id: 'flashcards', label: 'Flashcards Clínicas', icon: '🗂️', badge: 'Teoría', bg: 'bg-[#BDD1D1]' },
              { id: 'glosario', label: 'Glosario & Conceptos', icon: '🔍', badge: 'Metapsicología', bg: 'bg-[#F7CBCA]' },
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
          {/* BOTON NOTION */}
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

          {/* BOTON GOODNOTES */}
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

          {/* FRASE INSPIRACIONAL TEORICA */}
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
        {/* 1. BIBLIOTECA DE LAS 14 OBRAS */}
        {/* ========================================================= */}
        {activeTab === 'biblioteca' && (
          <div className="space-y-6">
            {/* BUSCADOR Y FILTROS POR AUTOR */}
            <div className="bg-white rounded-[26px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[6px_8px_20px_rgba(189,209,209,0.25)]">
              <div className="flex items-center gap-2.5 w-full sm:w-80 bg-[#F1F7F7] px-4 py-2.5 rounded-[18px]">
                <span>🔍</span>
                <input
                  type="text"
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                  placeholder="Buscar obra, autor o concepto (ej. Adler, histeria, coraza)..."
                  className="bg-transparent border-none text-xs text-[#3B4747] placeholder-[#8A9C9C] focus:outline-none w-full font-medium"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'TODOS', label: 'Todos (14)' },
                  { id: 'FREUD', label: 'S. Freud' },
                  { id: 'ANNA', label: 'Anna Freud' },
                  { id: 'ADLER', label: 'Adler' },
                  { id: 'REICH', label: 'Reich' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playPopSound();
                      setAuthorFilter(tab.id);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-black transition-all ${
                      authorFilter === tab.id
                        ? 'bg-[#F7CBCA] text-[#3B4747] shadow-sm'
                        : 'bg-[#F1F7F7] text-[#7A8E8E] hover:bg-[#E3EFEA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LISTA DE TARJETAS DE LIBROS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBooks.map((book) => {
                const statusBg = book.status === 'Completado'
                  ? 'bg-[#D5E5E5] text-[#2C3838]'
                  : book.status === 'En lectura'
                    ? 'bg-[#F7CBCA] text-[#3B4747]'
                    : 'bg-[#EAEAEA] text-[#7A8E8E]';

                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-[26px] p-5 flex flex-col justify-between shadow-[6px_8px_20px_rgba(189,209,209,0.22)] border border-[#E8F0F0] hover:scale-[1.01] transition-transform"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#E3EFEA] text-[#5D6B6B]">
                          {book.editorial} • {book.year}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${statusBg}`}>
                          {book.status}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-[#3B4747] leading-snug">
                        {book.title}
                      </h3>
                      <div className="text-xs font-bold text-[#7A8E8E] mt-0.5">
                        {book.author}
                      </div>

                      <p className="text-xs text-[#5D6B6B] mt-2.5 leading-relaxed font-medium">
                        {book.summary}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {book.keyConcepts.map((concept, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-[12px] bg-[#F1F7F7] text-[#5D6B6B] border border-[#E3EFEA]"
                          >
                            #{concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#F1F7F7] flex items-center justify-between gap-2">
                      <select
                        value={book.status}
                        onChange={(e) => {
                          playPopSound();
                          const newStatus = e.target.value as BookItem['status'];
                          setBooks(prev => prev.map(b => b.id === book.id ? { ...b, status: newStatus } : b));
                          if (newStatus === 'Completado') {
                            setBooksFinished(prev => prev + 1);
                            playChimeSound();
                            showNotice(`✨ ¡"${book.title}" marcado como completado!`);
                          }
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
                        className="px-3.5 py-1.5 rounded-[16px] bg-[#D5E5E5] hover:bg-[#BDD1D1] text-[#2C3838] text-xs font-black flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <span>📓</span> Ficha en Notion
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. FOCUS TIMER & LECTURA PROFUNDA */}
        {/* ========================================================= */}
        {activeTab === 'focus' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] p-7 shadow-[8px_10px_24px_rgba(189,209,209,0.3)] border border-[#E8F0F0] space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full bg-[#F7CBCA] text-[#3B4747]">
                    Lectura Profunda & Análisis Clínico 📖
                  </span>
                  <h2 className="text-xl font-black text-[#3B4747] mt-1.5">Bloque de Inmersión Teórica</h2>
                  <p className="text-xs text-[#7A8E8E]">Sesión de lectura continuada para subrayar y sintetizar conceptos.</p>
                </div>

                <div className="text-4xl font-black font-mono text-[#3B4747] bg-[#F1F7F7] px-6 py-2.5 rounded-[22px] shadow-inner">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
              </div>

              {/* SELECTOR DE MINUTOS */}
              <div className="grid grid-cols-3 gap-3">
                {[20, 25, 30].map(mins => (
                  <button
                    key={mins}
                    onClick={() => {
                      playPopSound();
                      setPomoMinutes(mins);
                      setTimeLeft(mins * 60);
                      setIsRunning(false);
                    }}
                    className={`py-3 rounded-[20px] text-xs font-black transition-all ${
                      pomoMinutes === mins
                        ? 'bg-[#F7CBCA] text-[#3B4747] shadow-sm'
                        : 'bg-[#F1F7F7] text-[#7A8E8E] hover:bg-[#E3EFEA]'
                    }`}
                  >
                    🌸 {mins} Minutos
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
                    isRunning
                      ? 'bg-[#F7CBCA] hover:brightness-105'
                      : 'bg-[#BDD1D1] hover:brightness-105'
                  }`}
                >
                  {isRunning ? '⏸️ Pausar Sesión' : '▶️ Iniciar Lectura Focus'}
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

            {/* ESTADISTICAS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Tiempo de Lectura', val: `${(readingMinutes / 60).toFixed(1)}h`, sub: `${readingMinutes} min registrados`, icon: '⏱️', bg: 'bg-[#D5E5E5]' },
                { label: 'Obras Leídas', val: `${booksFinished}`, sub: 'de 14 obras clínicas', icon: '📚', bg: 'bg-[#F7CBCA]' },
                { label: 'Conceptos Dominados', val: `${cardsMastered}`, sub: 'Flashcards validadas', icon: '🧠', bg: 'bg-[#BDD1D1]' },
                { label: 'Días de Racha', val: `${streakDays}`, sub: 'Día activo de estudio', icon: '🔥', bg: 'bg-[#D5E5E5]' },
              ].map((m, idx) => (
                <div key={idx} className="bg-white rounded-[24px] p-4 flex flex-col justify-between h-36 shadow-[6px_8px_18px_rgba(189,209,209,0.22)] border border-[#E8F0F0]">
                  <div className={`w-10 h-10 rounded-[18px] ${m.bg} flex items-center justify-center text-lg`}>
                    {m.icon}
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-[#7A8E8E]">{m.label}</div>
                    <div className="text-2xl font-black text-[#3B4747] mt-0.5">{m.val}</div>
                    <div className="text-[10px] font-bold text-[#5D6B6B] mt-0.5">{m.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. FLASHCARDS CLINICAS */}
        {/* ========================================================= */}
        {activeTab === 'flashcards' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#3B4747]">Flashcards de Teoría y Metapsicología</h2>
              <p className="text-xs text-[#7A8E8E] mt-0.5">Repaso activo de conceptos fundamentales de Freud, Adler, Reich y Anna Freud.</p>
            </div>

            <div
              onClick={() => {
                playPopSound();
                setShowAnswer(!showAnswer);
              }}
              className="bg-white rounded-[32px] p-10 sm:p-14 text-center cursor-pointer hover:scale-[1.01] transition-all min-h-[260px] flex flex-col items-center justify-center space-y-4 shadow-[8px_12px_26px_rgba(189,209,209,0.3)] border border-[#E8F0F0] relative"
            >
              <span className="text-[11px] font-black uppercase px-4 py-1 rounded-full bg-[#F7CBCA] text-[#3B4747]">
                {flashcards[cardIdx].cat}
              </span>

              <div className="text-lg sm:text-xl font-black text-[#3B4747] max-w-xl leading-relaxed">
                {showAnswer ? flashcards[cardIdx].back : flashcards[cardIdx].front}
              </div>

              <span className="text-[11px] text-[#8A9C9C] font-bold">
                {showAnswer ? '💡 Definición clínica' : '👆 Toca la tarjeta para ver la respuesta'}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  playPopSound();
                  setShowAnswer(false);
                  setCardIdx(prev => (prev + 1) % flashcards.length);
                }}
                className="flex-1 py-3.5 rounded-[20px] bg-white text-[#5D6B6B] font-black text-xs shadow-sm hover:bg-[#F1F7F7]"
              >
                ➡️ Siguiente Tarjeta
              </button>
              <button
                onClick={() => {
                  playChimeSound();
                  setCardsMastered(prev => prev + 1);
                  setShowAnswer(false);
                  setCardIdx(prev => (prev + 1) % flashcards.length);
                  showNotice('🎉 ¡Concepto dominado y guardado en tu memoria clínica!');
                }}
                className="flex-1 py-3.5 rounded-[20px] bg-[#BDD1D1] text-[#2C3838] font-black text-xs shadow-sm hover:brightness-105"
              >
                ✅ ¡Lo domino! (+1 Concepto)
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. GLOSARIO CLINICO */}
        {/* ========================================================= */}
        {activeTab === 'glosario' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#3B4747]">Glosario Clínico & Metapsicológico</h2>
              <p className="text-xs text-[#7A6E63] mt-0.5">Términos esenciales extraídos directamente de las 14 obras.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { term: 'Aparato Psíquico', autor: 'Sigmund Freud', def: 'Modelo conceptual que describe la mente humana estructurada en instancias dinámicas (Ello, Yo, Superyó) y niveles de consciencia.', tag: 'Segunda Tópica' },
                { term: 'Catarsis', autor: 'Freud & Breuer', def: 'Descarga emocional ligada al recuerdo de un trauma reprimido que produce la liberación del síntoma histeriforme.', tag: 'Histeria' },
                { term: 'Lapsus Linguae', autor: 'Sigmund Freud', def: 'Acto fallido involuntario en el habla donde la intención inconsciente quiebra el discurso consciente manifiesto.', tag: 'Vida Cotidiana' },
                { term: 'Compensación', autor: 'Alfred Adler', def: 'Mecanismo psíquico mediante el cual el individuo busca sobreponerse al sentimiento de inferioridad desarrollando habilidades sustitutas.', tag: 'Psicología Individual' },
                { term: 'Coraza Caracterológica', autor: 'Wilhelm Reich', def: 'Estructura rígida defensiva de la personalidad consolidada para proteger al yo de las amenazas pulsionales y del mundo exterior.', tag: 'Caracterología' },
                { term: 'Formación Reactiva', autor: 'Anna Freud', def: 'Mecanismo defensivo consistente en adoptar una actitud o conducta diametralmente opuesta al deseo inconsciente reprimido.', tag: 'Mecanismos de Defensa' },
                { term: 'Pulsión de Muerte (Tánatos)', autor: 'Sigmund Freud', def: 'Pulsión primaria orientada a la desorganización, el retorno a lo inorgánico y la desconexión vincular.', tag: 'Más Allá del Principio del Placer' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-[24px] p-5 shadow-[6px_8px_18px_rgba(189,209,209,0.22)] border border-[#E8F0F0]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#F7CBCA] text-[#3B4747]">
                      {item.autor}
                    </span>
                    <span className="text-[10px] text-[#7A8E8E] font-bold">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#3B4747]">{item.term}</h3>
                  <p className="text-xs text-[#5D6B6B] mt-1.5 leading-relaxed font-medium">
                    {item.def}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}