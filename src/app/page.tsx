'use client';

import React, { useState, useEffect, useRef } from 'react';

// Estructura de libro de estudio
interface BookStudyItem {
  id: string;
  title: string;
  author: string;
  editorial: string;
  yearWritten: string;
  area: string;
  status: 'Completado' | 'En lectura' | 'Por leer';
  summary: string;
  keyConcepts: string[];
}

// Estructura de PDF subido con texto extraído
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

  // Diccionario Contextual Multi-palabra
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [selectedBookFilter, setSelectedBookFilter] = useState('TODOS');

  // Las 14 Obras de Estudio
  const initialStudyBooks: BookStudyItem[] = [
    {
      id: '1',
      title: 'Introducción al psicoanálisis',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      yearWritten: '1916-1917',
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
      yearWritten: '1940',
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
      yearWritten: '1925',
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
      yearWritten: '1895',
      area: 'Clínica Fundacional',
      status: 'Completado',
      summary: 'Estudios clínicos sobre la histeria femenina y el paso revolucionario del método hipnótico al habla catártica.',
      keyConcepts: ['Conversión somática', 'Trauma psíquico', 'Terapia catártica', 'Caso Anna O.']
    },
    {
      id: '5',
      title: 'La interpretación de los sueños',
      author: 'Sigmund Freud',
      editorial: 'Alianza Editorial',
      yearWritten: '1900',
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
      yearWritten: '1901',
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
      yearWritten: '1905',
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
      yearWritten: '1905',
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
      yearWritten: '1920',
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
      yearWritten: '1923',
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
      yearWritten: '1933',
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
      yearWritten: '1936',
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
      yearWritten: '1912',
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
      yearWritten: '1933',
      area: 'Coraza Caracterológica y Somática',
      status: 'En lectura',
      summary: 'Pionero estudio de cómo las resistencias psíquicas se solidifican en tensiones corporales crónicas.',
      keyConcepts: ['Coraza caracterial', 'Coraza muscular', 'Vegetoterapia', 'Resistencia del carácter', 'Potencia orgástica']
    }
  ];

  const [studyBooks, setStudyBooks] = useState<BookStudyItem[]>(initialStudyBooks);
  const [bookAuthorFilter, setBookAuthorFilter] = useState('TODOS');
  const [bookStageFilter, setBookStageFilter] = useState('TODOS');

  // Temporizador de Estudio (30m, 1h, 2h, 3h)
  const [pomoMinutes, setPomoMinutes] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);

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

  // Normalizador de texto: elimina tildes y signos para búsquedas perfectas
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Cargar datos guardados
  useEffect(() => {
    const savedBooks = localStorage.getItem('psy_uploaded_books');
    const savedStudyBooks = localStorage.getItem('psy_study_books');
    const mins = localStorage.getItem('psy_study_mins');

    if (savedBooks) {
      try { setUploadedBooks(JSON.parse(savedBooks)); } catch {}
    }
    if (savedStudyBooks) {
      try { setStudyBooks(JSON.parse(savedStudyBooks)); } catch {}
    }
    if (mins) {
      setTotalStudyMinutes(Number(mins));
    }
  }, []);

  // Guardar datos
  useEffect(() => {
    try {
      localStorage.setItem('psy_uploaded_books', JSON.stringify(uploadedBooks));
    } catch {
      setProcessStatus('⚠️ Memoria local al límite. Considera eliminar algún archivo pesado.');
    }
  }, [uploadedBooks]);

  useEffect(() => {
    localStorage.setItem('psy_study_books', JSON.stringify(studyBooks));
  }, [studyBooks]);

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

  // Audio ambiental de lluvia suave
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

  // Procesamiento nativo de archivos PDF
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    playPopSound();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPdf(true);
    setProcessStatus('📖 Leyendo y extrayendo el contenido del PDF...');

    try {
      const pdfjs = await import('pdfjs-dist');
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
      setProcessStatus(`✅ ¡Libro procesado con éxito! Ya puedes buscar conceptos compuestos en su texto.`);
    } catch (err) {
      console.error(err);
      setProcessStatus('❌ Error al procesar el archivo. Asegúrate de que no esté protegido con contraseña.');
    } finally {
      setIsProcessingPdf(false);
      setTimeout(() => setProcessStatus(null), 4500);
    }
  };

  // Buscador Contextual Multi-palabra (Ej: "terapia catártica", "coraza muscular")
  const handleSearchWord = () => {
    playPopSound();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const rawTerm = searchTerm.trim();
    const normalizedTerm = normalize(rawTerm);
    const searchTokens = normalizedTerm.split(' ').filter(t => t.length > 1);

    const matches: SearchMatch[] = [];

    const targetBooks = selectedBookFilter === 'TODOS'
      ? uploadedBooks
      : uploadedBooks.filter(b => b.id === selectedBookFilter);

    targetBooks.forEach(book => {
      const paragraphs = book.fullText.split(/\n+/);

      paragraphs.forEach(p => {
        const normP = normalize(p);

        // Coincidencia 1: La frase exacta completa (ej. "terapia catartica")
        const hasExactPhrase = normP.includes(normalizedTerm);

        // Coincidencia 2: Todas las palabras clave están dentro del mismo párrafo
        const hasAllTokens = searchTokens.length > 1 && searchTokens.every(tok => normP.includes(tok));

        if (hasExactPhrase || hasAllTokens) {
          const sentences = p.split(/(?<=[.?!])\s+/);
          const matchingSentence = sentences.find(s => {
            const normS = normalize(s);
            return normS.includes(normalizedTerm) || (searchTokens.length > 1 && searchTokens.every(tok => normS.includes(tok)));
          }) || p;

          matches.push({
            bookName: book.name,
            sentence: matchingSentence.trim(),
            paragraph: p.trim()
          });
        }
      });
    });

    setSearchResults(matches.slice(0, 35));
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

  const filteredStudyBooks = studyBooks.filter(b => {
    const matchesAuthor = bookAuthorFilter === 'TODOS' ? true :
      bookAuthorFilter === 'FREUD' ? b.author.includes('Sigmund') :
      bookAuthorFilter === 'ANNA' ? b.author.includes('Anna') :
      bookAuthorFilter === 'ADLER' ? b.author.includes('Adler') :
      b.author.includes('Reich');

    const matchesStage = bookStageFilter === 'TODOS' ? true : b.status === bookStageFilter;

    return matchesAuthor && matchesStage;
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
                <span>📚</span> 14 Obras • {uploadedBooks.length} PDFs
              </div>
            </div>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="space-y-2">
            {[
              { id: 'diccionario', label: 'Diccionario de Mis Libros', icon: '🔍', badge: 'Frases y Conceptos', bg: 'bg-[#F7CBCA]' },
              { id: 'obras', label: 'Mis Obras & Etapas', icon: '📖', badge: '14 Libros', bg: 'bg-[#BDD1D1]' },
              { id: 'subir', label: 'Subir & Gestionar PDFs', icon: '📤', badge: 'Cargar', bg: 'bg-[#D5E5E5]' },
              { id: 'focus', label: 'Focus & Lectura Profunda', icon: '⏱️', badge: '30m - 3h', bg: 'bg-[#F7CBCA]' },
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
              Santuario de Lectura & Teoría Clínica 🌿
            </span>
            <h1 className="text-2xl font-