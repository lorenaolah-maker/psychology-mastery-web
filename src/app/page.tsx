'use client';

import React, { useState, useEffect, useRef } from 'react';

// Estructura de libro subido con texto extraído
interface UploadedBook {
  id: string;
  name: string;
  uploadDate: string;
  pageCount: number;
  fullText: string;
}

// Resultado del diccionario contextual
interface SearchMatch {
  bookName: string;
  sentence: string;
  paragraph: string;
}

export default function PsychologyMasteryApp() {
  const [activeTab, setActiveTab] = useState('diccionario');

  // Libros y Textos Extraídos (Persistentes)
  const [uploadedBooks, setUploadedBooks] = useState<UploadedBook[]>([]);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [processStatus, setProcessStatus] = useState<string | null>(null);

  // Diccionario Contextual
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [selectedBookFilter, setSelectedBookFilter] = useState('TODOS');

  // Temporizador de Estudio (30m, 1h, 2h, 3h)
  const [pomoMinutes, setPomoMinutes] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);

  // Focus Audio Ambiental
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio Context compartido para efectos sonoros táctiles
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

  // Frase teórica rotativa
  const [quoteIdx, setQuoteIdx] = useState(0);
  const quotes = [
    { text: 'La voz del intelecto es suave, pero no descansa hasta haber logrado ser escuchada.', author: 'Sigmund Freud' },
    { text: 'El carácter consiste en una alteración crónica del yo que podemos calificar de rigidez.', author: 'Wilhelm Reich' },
    { text: 'Una mentira no tendría sentido alguno a menos que la verdad fuera tenida por peligrosa.', author: 'Alfred Adler' },
    { text: 'El yo procura defenderse contra las invasiones del ello mediante diversos mecanismos.', author: 'Anna Freud' }
  ];

  // Cargar libros y minutos de LocalStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('psy_uploaded_books');
    const mins = localStorage.getItem('psy_study_mins');
    if (saved) {
      try {
        setUploadedBooks(JSON.parse(saved));
      } catch {}
    }
    if (mins) {
      setTotalStudyMinutes(Number(mins));
    }
  }, []);

  // Guardar libros cada vez que cambien
  useEffect(() => {
    try {
      localStorage.setItem('psy_uploaded_books', JSON.stringify(uploadedBooks));
    } catch {
      setProcessStatus('⚠️ La memoria local está al límite. Considera limpiar libros antiguos.');
    }
  }, [uploadedBooks]);

  useEffect(() => {
    localStorage.setItem('psy_study_mins', totalStudyMinutes.toString());
  }, [totalStudyMinutes]);

  // Manejador del temporizador
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setTotalStudyMinutes(prev => prev + pomoMinutes);
      playChimeSound();
      setProcessStatus(`🎉 ¡Sesión de lectura completada! +${pomoMinutes} minutos registrados.`);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, pomoMinutes]);

  // Audio de lluvia ambiental
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
        setProcessStatus('🌧️ Sonido de lluvia suave activado para lectura profunda');
        setTimeout(() => setProcessStatus(null), 3000);
      } catch {
        setProcessStatus('Toca la pantalla para activar el audio');
      }
    }
  };

  // Procesamiento nativo de archivos PDF subidos desde el navegador
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    playPopSound();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPdf(true);
    setProcessStatus('📖 Leyendo y extrayendo el contenido del PDF...');

    try {
      const pdfjs = await import('pdfjs-dist');
      // Configurar worker de pdfjs
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        let accumulatedText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: unknown) => (item as { str?: string }).str || '')
            .join(' ');
          accumulatedText += `\n[Página ${pageNum}] ` + pageText;
        }

        const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

        const newBook: UploadedBook = {
          id: Date.now().toString() + '-' + i,
          name: cleanName,
          uploadDate: new Date().toLocaleDateString('es-MX'),
          pageCount: pdf.numPages,
          fullText: accumulatedText
        };

        setUploadedBooks(prev => {
          const filtered = prev.filter(b => b.name.toLowerCase() !== newBook.name.toLowerCase());
          return [newBook, ...filtered];
        });
      }

      playChimeSound();
      setProcessStatus(`✅ ¡Libro procesado con éxito! Ya puedes buscar cualquier palabra en su texto.`);
    } catch (err) {
      console.error(err);
      setProcessStatus('❌ Error al procesar el archivo. Asegúrate de que no esté protegido con contraseña.');
    } finally {
      setIsProcessingPdf(false);
      setTimeout(() => setProcessStatus(null), 4500);
    }
  };

  // Buscador Contextual que extrae exactamente los párrafos de los libros subidos
  const handleSearchWord = () => {
    playPopSound();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.trim().toLowerCase();
    const matches: SearchMatch[] = [];

    const targetBooks = selectedBookFilter === 'TODOS'
      ? uploadedBooks
      : uploadedBooks.filter(b => b.id === selectedBookFilter);

    targetBooks.forEach(book => {
      // Dividir el texto en párrafos u oraciones largas
      const paragraphs = book.fullText.split(/\n+/);

      paragraphs.forEach(p => {
        const pLower = p.toLowerCase();
        if (pLower.includes(term)) {
          // Extraer la oración más cercana que contiene el término
          const sentences = p.split(/(?<=[.?!])\s+/);
          const matchingSentence = sentences.find(s => s.toLowerCase().includes(term)) || p;

          matches.push({
            bookName: book.name,
            sentence: matchingSentence.trim(),
            paragraph: p.trim()
          });
        }
      });
    });

    setSearchResults(matches.slice(0, 30)); // Limitar a las 30 mejores apariciones
    if (matches.length > 0) {
      playChimeSound();
    }
  };

  const handleDeleteBook = (id: string, name: string) => {
    playPopSound();
    if (window.confirm(`¿Quieres eliminar "${name}" del índice de búsqueda?`)) {
      setUploadedBooks(prev => prev.filter(b => b.id !== id));
      setSearchResults(prev => prev.filter(r => r.bookName !== name));
    }
  };

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
                <span>📚</span> {uploadedBooks.length} Libros Indexados
              </div>
            </div>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="space-y-2">
            {[
              { id: 'diccionario', label: 'Diccionario de Mis Libros', icon: '🔍', badge: `${uploadedBooks.length} PDFs`, bg: 'bg-[#F7CBCA]' },
              { id: 'subir', label: 'Subir & Gestionar PDFs', icon: '📤', badge: 'Cargar', bg: 'bg-[#D5E5E5]' },
              { id: 'focus', label: 'Focus & Lectura Profunda', icon: '⏱️', badge: '30m - 3h', bg: 'bg-[#BDD1D1]' },
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

        {/* HUB DE LECTORES: APPLE BOOKS, KINDLE, NOTION, GOODNOTES */}
        <div className="pt-4 border-t border-[#D5E5E5] space-y-2">
          <div className="text-[10px] font-black uppercase tracking-wider text-[#7A8E8E] px-2 mb-1">
            Mis Lectores & Apuntes
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="ibooks://"
              onClick={playPopSound}
              className="py-2.5 px-3 rounded-[18px] bg-white hover:bg-[#F7CBCA]/30 text-[#3B4747] text-xs font-black flex items-center justify-center gap-1.5 shadow-[4px_5px_12px_rgba(93,107,107,0.08)] transition-all"
            >
              <span>🍎</span> Apple Books
            </a>
            <a
              href="kindle://"
              onClick={playPopSound}
              className="py-2.5 px-3 rounded-[18px] bg-white hover:bg-[#D5E5E5]/50 text-[#3B4747] text-xs font-black flex items-center justify-center gap-1.5 shadow-[4px_5px_12px_rgba(93,107,107,0.08)] transition-all"
            >
              <span>🔥</span> Kindle
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="notion://"
              onClick={playPopSound}
              className="py-2.5 px-3 rounded-[18px] bg-white hover:bg-[#F7CBCA]/30 text-[#3B4747] text-xs font-black flex items-center justify-center gap-1.5 shadow-[4px_5px_12px_rgba(93,107,107,0.08)] transition-all"
            >
              <span>📓</span> Notion
            </a>
            <a
              href="goodnotes://"
              onClick={playPopSound}
              className="py-2.5 px-3 rounded-[18px] bg-gradient-to-r from-[#F7CBCA] to-[#E8B4B3] text-[#3B4747] text-xs font-black flex items-center justify-center gap-1.5 shadow-[4px_5px_12px_rgba(247,203,202,0.45)] transition-all"
            >
              <span>✍️</span> Goodnotes
            </a>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto overflow-y-auto">
        {processStatus && (
          <div className="fixed top-5 right-5 z-50 bg-[#BDD1D1] text-[#2C3838] font-black text-xs px-5 py-3.5 rounded-[22px] shadow-xl animate-bounce flex items-center gap-2 border border-white">
            <span>🌸</span>
            <span>{processStatus}</span>
          </div>
        )}

        {/* CABECERA */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#7A8E8E] bg-[#D5E5E5] px-3 py-1 rounded-full">
              Laboratorio Clínico & Corpus de Lectura 🌿
            </span>
            <h1 className="text-2xl font-black text-[#3B4747] tracking-tight mt-1">
              Diccionario Psicológico de Mis Libros
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
        {/* 1. DICCIONARIO CONTEXTUAL BASADO ÚNICAMENTE EN LOS LIBROS */}
        {/* ========================================================= */}
        {activeTab === 'diccionario' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] p-6 shadow-[8px_10px_24px_rgba(189,209,209,0.3)] border border-[#E8F0F0] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-[#3B4747]">Buscar en el Texto Real de Mis Libros</h2>
                  <p className="text-xs text-[#7A8E8E]">
                    Escribe cualquier término clínico (ej. <em>coraza, represión, fijación, inferioridad</em>). Solo se mostrarán definiciones extraídas de los PDFs que has subido.
                  </p>
                </div>

                {uploadedBooks.length > 0 && (
                  <select
                    value={selectedBookFilter}
                    onChange={e => {
                      playPopSound();
                      setSelectedBookFilter(e.target.value);
                    }}
                    className="bg-[#F1F7F7] rounded-[18px] px-3.5 py-2 text-xs font-black text-[#3B4747] focus:outline-none"
                  >
                    <option value="TODOS">Buscar en todos mis libros ({uploadedBooks.length})</option>
                    {uploadedBooks.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-2">
                <div className="flex-1 bg-[#F1F7F7] px-4 py-3 rounded-[20px] flex items-center gap-2.5">
                  <span>🔍</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearchWord()}
                    placeholder="Escribe una palabra o concepto para consultar su significado en el libro..."
                    className="w-full bg-transparent border-none text-xs text-[#3B4747] placeholder-[#8A9C9C] focus:outline-none font-medium"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-xs text-[#8A9C9C] hover:text-[#3B4747]">✕</button>
                  )}
                </div>

                <button
                  onClick={handleSearchWord}
                  className="px-6 py-3 rounded-[20px] bg-gradient-to-r from-[#F7CBCA] to-[#E8B4B3] hover:brightness-105 text-[#3B4747] font-black text-xs shadow-md transition-all whitespace-nowrap"
                >
                  Buscar Definición
                </button>
              </div>
            </div>

            {/* AVISO SI NO HAY LIBROS SUBIDOS */}
            {uploadedBooks.length === 0 && (
              <div className="bg-white rounded-[26px] p-8 text-center space-y-3 border-2 border-dashed border-[#D5E5E5]">
                <span className="text-4xl">📤</span>
                <h3 className="text-base font-black text-[#3B4747]">Tu biblioteca aún no tiene libros subidos</h3>
                <p className="text-xs text-[#7A8E8E] max-w-md mx-auto">
                  Para que el diccionario extraiga definiciones exactas, ve a la pestaña <strong>Subir & Gestionar PDFs</strong> y carga los libros que ya leíste o estás leyendo.
                </p>
                <button
                  onClick={() => {
                    playPopSound();
                    setActiveTab('subir');
                  }}
                  className="px-5 py-2.5 rounded-[18px] bg-[#D5E5E5] text-[#2C3838] font-black text-xs shadow-sm"
                >
                  Ir a subir mis libros en PDF ➔
                </button>
              </div>
            )}

            {/* RESULTADOS DE LA BÚSQUEDA */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#3B4747]">
                    Se encontraron {searchResults.length} citas textuales para &quot;{searchTerm}&quot;:
                  </span>
                  <span className="text-[10px] text-[#7A8E8E] font-bold">Extraído directamente del PDF</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {searchResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-[26px] p-6 shadow-[6px_8px_20px_rgba(189,209,209,0.22)] border border-[#E8F0F0] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-[#E3EFEA] text-[#5D6B6B]">
                          📖 {res.bookName}
                        </span>
                        <a
                          href="goodnotes://"
                          onClick={playPopSound}
                          className="text-[11px] font-bold text-[#7A8E8E] hover:text-[#3B4747] flex items-center gap-1"
                        >
                          <span>✍️</span> Copiar a Goodnotes
                        </a>
                      </div>

                      <div className="bg-[#F1F7F7] p-4 rounded-[20px] text-xs text-[#3B4747] leading-relaxed font-semibold italic border-l-4 border-[#F7CBCA]">
                        &quot;{res.sentence}&quot;
                      </div>

                      <p className="text-xs text-[#5D6B6B] leading-relaxed font-medium">
                        <strong className="text-[#3B4747]">Párrafo completo del autor:</strong> {res.paragraph}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length === 0 && searchTerm && uploadedBooks.length > 0 && (
              <div className="bg-white rounded-[24px] p-6 text-center text-xs text-[#7A8E8E] font-semibold">
                No se encontraron apariciones de &quot;{searchTerm}&quot; en los libros seleccionados. Intenta con una raíz más corta (por ejemplo: <em>coraz</em> en lugar de <em>corazas</em>).
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SUBIR Y GESTIONAR LIBROS EN PDF */}
        {/* ========================================================= */}
        {activeTab === 'subir' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] p-7 shadow-[8px_10px_24px_rgba(189,209,209,0.3)] border border-[#E8F0F0] space-y-5 text-center">
              <div className="w-16 h-16 rounded-[24px] bg-[#F7CBCA] flex items-center justify-center text-3xl mx-auto shadow-sm">
                📑
              </div>
              <div>
                <h2 className="text-lg font-black text-[#3B4747]">Cargar Obras Clínicas en PDF</h2>
                <p className="text-xs text-[#7A8E8E] max-w-lg mx-auto mt-1">
                  Selecciona cualquier libro desde los Archivos de tu iPad o Mac. El sistema extraerá todo el vocabulario y párrafos para que tu diccionario funcione de forma 100% personalizada.
                </p>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[22px] bg-gradient-to-r from-[#F7CBCA] to-[#E8B4B3] hover:brightness-105 text-[#3B4747] font-black text-xs shadow-md cursor-pointer transition-all">
                  <span>➕</span> Seleccionar archivo PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handlePdfUpload}
                    disabled={isProcessingPdf}
                    className="hidden"
                  />
                </label>
              </div>

              {isProcessingPdf && (
                <div className="text-xs text-[#3B4747] font-bold animate-pulse">
                  ⏳ Procesando páginas y extrayendo conceptos... Esto puede tardar unos segundos según el tamaño del libro.
                </div>
              )}
            </div>

            {/* LISTA DE LIBROS CARGADOS */}
            <div>
              <h3 className="text-sm font-black text-[#3B4747] mb-3">
                Libros actualmente indexados ({uploadedBooks.length}):
              </h3>

              {uploadedBooks.length === 0 ? (
                <div className="text-xs text-[#8A9C9C] italic">No hay libros subidos todavía.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {uploadedBooks.map(book => (
                    <div
                      key={book.id}
                      className="bg-white rounded-[24px] p-4 flex items-center justify-between gap-3 shadow-[6px_8px_18px_rgba(189,209,209,0.2)] border border-[#E8F0F0]"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-black text-[#3B4747] truncate">{book.name}</div>
                        <div className="text-[10px] text-[#7A8E8E] font-semibold mt-0.5">
                          {book.pageCount} páginas • Indexado el {book.uploadDate}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteBook(book.id, book.name)}
                        className="w-8 h-8 rounded-full bg-[#F1F7F7] hover:bg-[#F7CBCA] text-xs flex items-center justify-center transition-colors shrink-0"
                        title="Eliminar libro"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. FOCUS & LECTURA PROFUNDA (30M A 3 HORAS) */}
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
                  <p className="text-xs text-[#7A8E8E]">Sesiones extensas para avanzar en tus lecturas de Apple Books, Kindle o PDFs.</p>
                </div>

                <div className="text-4xl font-black font-mono text-[#3B4747] bg-[#F1F7F7] px-6 py-2.5 rounded-[22px] shadow-inner">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
              </div>

              {/* SELECTOR DE TIEMPO REAL */}
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

            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[24px] p-5 shadow-[6px_8px_18px_rgba(189,209,209,0.2)] border border-[#E8F0F0]">
                <div className="text-xs font-black text-[#7A8E8E]">Horas Totales de Lectura</div>
                <div className="text-2xl font-black text-[#3B4747] mt-1">{(totalStudyMinutes / 60).toFixed(1)}h</div>
                <div className="text-[10px] text-[#5D6B6B] mt-0.5">{totalStudyMinutes} minutos registrados</div>
              </div>

              <div className="bg-white rounded-[24px] p-5 shadow-[6px_8px_18px_rgba(189,209,209,0.2)] border border-[#E8F0F0]">
                <div className="text-xs font-black text-[#7A8E8E]">Libros en Memoria</div>
                <div className="text-2xl font-black text-[#3B4747] mt-1">{uploadedBooks.length}</div>
                <div className="text-[10px] text-[#5D6B6B] mt-0.5">Disponibles para consulta textual</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}