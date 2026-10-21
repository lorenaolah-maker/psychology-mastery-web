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
  const [activeTab, setActiveTab] = useState('formulacion');

  // Libros y Textos Extraídos (Persistentes)
  const [uploadedBooks, setUploadedBooks] = useState<UploadedBook[]>([]);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [processStatus, setProcessStatus] = useState<string | null>(null);

  // Diccionario Contextual Multi-palabra
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [selectedBookFilter, setSelectedBookFilter] = useState('TODOS');

  // Formulación Clínica (Síntomas, Psicoanálisis & DSM-5)
  const [caseDescription, setCaseDescription] = useState('');
  const [formulationResult, setFormulationResult] = useState<string | null>(null);
  const [isFormulating, setIsFormulating] = useState(false);

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

  // Normalizador de texto para búsquedas multi-palabra y sin tildes
  const normalize = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Cargar datos
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

  // Temporizador
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

  // Audio ambiental de lluvia
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

  // Buscador Contextual Multi-palabra
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
        const hasExactPhrase = normP.includes(normalizedTerm);
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

  // Motor de Formulación Clínica Psicoanalítica & Cruce DSM-5
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
        bodyArmor = 'Wilhelm Reich (Análisis del carácter): Evidencia clara de fijación en la "coraza muscular". Las tensiones crónicas fungen como un blindaje somático que inmoviliza la energía libidinal y la agresividad reprimida.';
      } else {
        bodyArmor = 'Wilhelm Reich: Predominio de coraza caracterológica conductual; rigidez yoica adaptativa como respuesta a frustraciones tempranas del desarrollo.';
      }

      if (lower.includes('culpa') || lower.includes('perfeccion') || lower.includes('orden') || lower.includes('limpieza') || lower.includes('control') || lower.includes('obsesi')) {
        hypothesis = 'Sigmund Freud (El yo y el ello): Conflicto agudo entre un Superyó tiránico e introyectado y las mociones pulsionales del Ello. El síntoma opera como castigo o expiación inconsciente.';
        defense = 'Anna Freud: Mecanismos nucleares de Formación Reactiva, Aislamiento del Afecto y Anulación Mágica (carácter obsesivo).';
        dsmCat = 'DSM-5: Compatible con Trastorno de la Personalidad Obsesivo-Compulsiva (F60.5) o Trastorno Obsesivo-Compulsivo (F42).';
      } else if (lower.includes('miedo') || lower.includes('abandono') || lower.includes('vacio') || lower.includes('inestable') || lower.includes('impulsiv') || lower.includes('ira')) {
        hypothesis = 'Sigmund Freud / Kernberg: Falla en la integración de representaciones objetales (objeto bueno vs objeto malo). Falla de la función integradora del Yo ante la angustia de pérdida.';
        defense = 'Anna Freud: Predominio de la Escisión (splitting) e Identificación Proyectiva como defensa frente a la ambivalencia.';
        dsmCat = 'DSM-5: Criterios alineados con Trastorno de la Personalidad Límite (Borderline, F60.3).';
      } else if (lower.includes('paralisis') || lower.includes('anestesia') || lower.includes('ciego') || lower.includes('dolor') || lower.includes('desmayo')) {
        hypothesis = 'Sigmund Freud y Josef Breuer (Escritos sobre la histeria): Cuadro clásico de conversión histérica. El afecto estrangulado intolerable se traspone hacia una inervación somática con valor simbólico.';
        defense = 'Anna Freud: Represión primaria masiva con ganancia primaria (alivio del conflicto) y ganancia secundaria (atención).';
        dsmCat = 'DSM-5: Trastorno de Síntomas Neurológicos Funcionales / Trastorno de Conversión (F44.4).';
      } else {
        hypothesis = 'Sigmund Freud (Introducción al psicoanálisis): El síntoma es una transacción simbólica entre una moción pulsional que busca descarga y la barrera de censura del Yo.';
        defense = 'Anna Freud: Mecanismo de Represión fundamental secundado por Desplazamiento.';
        dsmCat = 'DSM-5: Trastorno de Adaptación o Trastorno de Ansiedad Generalizada (F41.1).';
      }

      adlerComp = 'Alfred Adler (El carácter neurótico): La manifestación clínica opera como un "Arreglo Neurótico" teleológico destinado a compensar un profundo "Sentimiento de Inferioridad", construyendo una posición de dominio o excusa ficticia.';

      setFormulationResult(
        `📋 FORMULACIÓN CLÍNICA & PSICODINÁMICA INTEGRADA:\n\n` +
        `1. HIPÓTESIS ESTRUCTURAL FREUDIANA:\n${hypothesis}\n\n` +
        `2. DEFENSAS YOICAS (ANNA FREUD):\n${defense}\n\n` +
        `3. CORAZA Y REGISTRO SOMÁTICO (WILHELM REICH):\n${bodyArmor}\n\n` +
        `4. FINALISMO Y COMPENSACIÓN (ALFRED ADLER):\n${adlerComp}\n\n` +
        `5. CRUCE NOSOLÓGICO DSM-5:\n${dsmCat}\n\n` +
        `💡 Sugerencia técnica para Goodnotes/Notion: Registrar en la sesión los puntos de fijación edípica/preedípica y el beneficio secundario que sostiene el síntoma.`
      );

      setIsFormulating(false);
      playChimeSound();
      setProcessStatus('✨ Formulación clínica generada con éxito.');
      setTimeout(() => setProcessStatus(null), 3500);
    }, 1200);
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
              { id: 'formulacion', label: 'Formulación Clínica & DSM-5', icon: '🩺', badge: 'Síntomas', bg: 'bg-[#F7CBCA]' },
              { id: 'diccionario', label: 'Diccionario de Mis Libros', icon: '🔍', badge: 'Frases y PDFs', bg: 'bg-[#BDD1D1]' },
              { id: 'obras', label: 'Mis Obras & Etapas', icon: '📖', badge: '14 Libros', bg: 'bg-[#D5E5E5]' },
              { id: 'subir', label: 'Subir & Gestionar PDFs', icon: '📤', badge: 'Cargar', bg: 'bg-[#F7CBCA]' },
              { id: 'focus', label: 'Focus & Lectura Profunda', icon: '⏱️', badge: '30m - 3h', bg: 'bg-[#D5E5E5]' },
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
            <h1 className="text-2xl font-black text-[#3B4747] tracking-tight mt-1">
              Psicología & Psicoanálisis
            </h1>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. FORMULACIÓN CLÍNICA & DIAGNÓSTICO (SÍNTOMAS, DSM-5 & PSICOANÁLISIS) */}
        {/* ========================================================= */}
        {activeTab === 'formulacion' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[#3B4747]">Formulación Clínica & Diagnóstico Psicoanalítico 🩺</h2>
              <p className="text-xs text-[#7A8E8E] mt-0.5">
                Ingresa los síntomas, quejas del paciente o manifestaciones corporales para formular una hipótesis cruzada entre Freud, Adler, Reich, Anna Freud y el DSM-5.
              </p>
            </div>

            <div className="bg-white rounded-[28px] p-6 sm:p-7 space-y-4 shadow-[8px_10px_24px_rgba(189,209,209,0.3)] border border-[#E8F0F0]">
              <label className="block text-xs font-black text-[#3B4747]">
                Ingresa los síntomas o descripción del caso clínico:
              </label>

              <textarea
                value={caseDescription}
                onChange={e => setCaseDescription(e.target.value)}
                rows={5}
                placeholder="Ejemplo: Paciente presenta dolor y tensión crónica en el cuello y pecho, angustia de perder el control, culpa extrema por errores mínimos y necesidad compulsiva de orden..."
                className="w-full bg-[#F1F7F7] rounded-[20px] p-4 text-xs text-[#3B4747] placeholder-[#8A9C9C] focus:outline-none font-medium shadow-inner"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateFormulation}
                  disabled={isFormulating || !caseDescription.trim()}
                  className="flex-1 py-3.5 rounded-[20px] bg-gradient-to-r from-[#F7CBCA] to-[#E8B4B3] hover:brightness-105 text-[#3B4747] font-black text-xs shadow-md disabled:opacity-50 transition-all"
                >
                  {isFormulating ? 'Analizando síntomas y formulando hipótesis...' : '✨ Diagnosticar con Psicoanálisis & DSM-5'}
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
        {/* 2. DICCIONARIO CONTEXTUAL (MULTI-PALABRA Y FRASES) */}
        {/* ========================================================= */}
        {activeTab === 'diccionario' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] p-6 shadow-[8px_10px_24px_rgba(189,209,209,0.3)] border border-[#E8F0F0] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-[#3B4747]">Buscador Textual de Frases & Conceptos</h2>
                  <p className="text-xs text-[#7A8E8E]">
                    Busca frases completas (ej. <em>terapia catártica, coraza muscular, sentimiento de inferioridad</em>). El motor ignora acentos y rastrea solo en los PDFs que tengas subidos.
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
                    placeholder="Escribe dos o más palabras (ej. terapia catártica, coraza muscular, arreglo neurótico)..."
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
                  Buscar en el Libro
                </button>
              </div>
            </div>

            {uploadedBooks.length === 0 && (
              <div className="bg-white rounded-[26px] p-8 text-center space-y-3 border-2 border-dashed border-[#D5E5E5]">
                <span className="text-4xl">📤</span>
                <h3 className="text-base font-black text-[#3B4747]">Tu biblioteca aún no tiene PDFs cargados</h3>
                <p className="text-xs text-[#7A8E8E] max-w-md mx-auto">
                  Para que el buscador extraiga las citas textuales de tus lecturas, ve a <strong>Subir & Gestionar PDFs</strong> y carga tus libros.
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

            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#3B4747]">
                    Se encontraron {searchResults.length} apariciones para &quot;{searchTerm}&quot;:
                  </span>
                  <span className="text-[10px] text-[#7A8E8E] font-bold">Cita textual directa</span>
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
                          <span>✍️</span> Apuntar en Goodnotes ↗
                        </a>
                      </div>

                      <div className="bg-[#F1F7F7] p-4 rounded-[20px] text-xs text-[#3B4747] leading-relaxed font-semibold italic border-l-4 border-[#F7CBCA]">
                        &quot;{res.sentence}&quot;
                      </div>

                      <p className="text-xs text-[#5D6B6B] leading-relaxed font-medium">
                        <strong className="text-[#3B4747]">Contexto en el texto:</strong> {res.paragraph}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.length === 0 && searchTerm && uploadedBooks.length > 0 && (
              <div className="bg-white rounded-[24px] p-6 text-center text-xs text-[#7A8E8E] font-semibold">
                No se encontraron coincidencias para &quot;{searchTerm}&quot; en los PDFs subidos. Verifica que el libro que contiene ese término esté cargado en la pestaña de subida.
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. MIS OBRAS, AÑO DE ESCRITURA Y ETAPAS (14 LIBROS) */}
        {/* ========================================================= */}
        {activeTab === 'obras' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#3B4747]">Mis Obras de Estudio & Etapas Clínicas 📖</h2>
                <p className="text-xs text-[#7A8E8E] mt-0.5">Control de lectura, año de redacción, editorial y conceptos nucleares.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={bookStageFilter}
                  onChange={e => {
                    playPopSound();
                    setBookStageFilter(e.target.value);
                  }}
                  className="bg-white rounded-[16px] px-3 py-1.5 text-xs font-black text-[#3B4747] shadow-sm focus:outline-none"
                >
                  <option value="TODOS">Todas las Etapas</option>
                  <option value="Completado">✅ Terminado</option>
                  <option value="En lectura">📖 En lectura</option>
                  <option value="Por leer">⏳ Por leer</option>
                </select>

                <select
                  value={bookAuthorFilter}
                  onChange={e => {
                    playPopSound();
                    setBookAuthorFilter(e.target.value);
                  }}
                  className="bg-white rounded-[16px] px-3 py-1.5 text-xs font-black text-[#3B4747] shadow-sm focus:outline-none"
                >
                  <option value="TODOS">Todos los Autores</option>
                  <option value="FREUD">Sigmund Freud</option>
                  <option value="ANNA">Anna Freud</option>
                  <option value="ADLER">Alfred Adler</option>
                  <option value="REICH">Wilhelm Reich</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStudyBooks.map((book) => {
                const stageStyle = book.status === 'Completado'
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
                          Escrito en {book.yearWritten} • {book.editorial}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${stageStyle}`}>
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
                          const newStatus = e.target.value as BookStudyItem['status'];
                          setStudyBooks(prev => prev.map(b => b.id === book.id ? { ...b, status: newStatus } : b));
                          if (newStatus === 'Completado') {
                            playChimeSound();
                            setProcessStatus(`✨ ¡"${book.title}" marcado como terminado!`);
                            setTimeout(() => setProcessStatus(null), 3500);
                          }
                        }}
                        className="bg-[#F1F7F7] rounded-[16px] px-3 py-1.5 text-xs font-black text-[#3B4747] focus:outline-none"
                      >
                        <option value="En lectura">📖 En lectura</option>
                        <option value="Completado">✅ Terminado</option>
                        <option value="Por leer">⏳ Por leer</option>
                      </select>

                      <div className="flex gap-1.5">
                        <a
                          href="notion://"
                          onClick={playPopSound}
                          className="px-3 py-1.5 rounded-[16px] bg-[#D5E5E5] text-[#2C3838] text-xs font-black flex items-center gap-1 shadow-sm"
                        >
                          <span>📓</span> Notion
                        </a>
                        <a
                          href="goodnotes://"
                          onClick={playPopSound}
                          className="px-3 py-1.5 rounded-[16px] bg-[#F7CBCA] text-[#3B4747] text-xs font-black flex items-center gap-1 shadow-sm"
                        >
                          <span>✍️</span> Goodnotes
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. SUBIR Y GESTIONAR LIBROS EN PDF */}
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
                  Sube los PDFs de las obras que vas leyendo desde los Archivos de tu iPad o Mac. El buscador leerá todo su texto para que el diccionario tome únicamente las palabras y conceptos que el autor realmente escribió.
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

            <div>
              <h3 className="text-sm font-black text-[#3B4747] mb-3">
                Libros actualmente indexados en el diccionario ({uploadedBooks.length}):
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
                  <p className="text-xs text-[#7A8E8E]">Sesiones extensas para avanzar en tus lecturas de Apple Books, Kindle o PDFs.</p>
                </div>

                <div className="text-4xl font-black font-mono text-[#3B4747] bg-[#F1F7F7] px-6 py-2.5 rounded-[22px] shadow-inner">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
              </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[24px] p-5 shadow-[6px_8px_18px_rgba(189,209,209,0.2)] border border-[#E8F0F0]">
                <div className="text-xs font-black text-[#7A8E8E]">Horas Totales de Lectura</div>
                <div className="text-2xl font-black text-[#3B4747] mt-1">{(totalStudyMinutes / 60).toFixed(1)}h</div>
                <div className="text-[10px] text-[#5D6B6B] mt-0.5">{totalStudyMinutes} minutos registrados</div>
              </div>

              <div className="bg-white rounded-[24px] p-5 shadow-[6px_8px_18px_rgba(189,209,209,0.2)] border border-[#E8F0F0]">
                <div className="text-xs font-black text-[#7A8E8E]">Libros en Memoria</div>
                <div className="text-2xl font-black text-[#3B4747] mt-1">{uploadedBooks.length}</div>
                <div className="text-[10px] text-[#5D6B6B] mt-0.5">Disponibles para consulta multi-palabra</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}