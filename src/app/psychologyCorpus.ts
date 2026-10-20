export interface CorpusDefinition {
  term: string;
  book: string;
  author: string;
  editorial: string;
  literalDefinition: string;
  clinicalContext: string;
  tags: string[];
}

export const psychologyCorpus: CorpusDefinition[] = [
  {
    term: 'Coraza Caracterológica',
    book: 'Análisis del carácter',
    author: 'Wilhelm Reich',
    editorial: 'Paidós',
    literalDefinition: 'Alteración crónica y rígida del yo que actúa como un mecanismo de protección automática contra los estímulos displacenteros del mundo exterior y contra las excitaciones pulsionales no descargadas.',
    clinicalContext: 'Reich demuestra que la coraza psíquica se traduce somáticamente en la coraza muscular (hipertonías crónicas en cuello, pecho, pelvis y diafragma) que impiden la libre respiración y la descarga energética.',
    tags: ['Reich', 'Carácter', 'Somático', 'Resistencia']
  },
  {
    term: 'Coraza Muscular',
    book: 'Análisis del carácter',
    author: 'Wilhelm Reich',
    editorial: 'Paidós',
    literalDefinition: 'Suma total de las actitudes y tensiones musculares crónicas en las que se fijan físicamente las represiones psíquicas y que bloquean la movilidad vegetativa del organismo.',
    clinicalContext: 'El análisis reichiano exige disolver estas tensiones musculares para que la emoción reprimida (angustia, cólera, libido) pueda ser expresada y liberada.',
    tags: ['Reich', 'Cuerpo', 'Vegetoterapia']
  },
  {
    term: 'Sentimiento de Inferioridad',
    book: 'El carácter neurótico',
    author: 'Alfred Adler',
    editorial: 'Paidós',
    literalDefinition: 'Vivencia básica y universal de debilidad, desvalimiento e imperfección experimentada desde la infancia, que actúa como el resorte motor constante para la búsqueda de seguridad y superación.',
    clinicalContext: 'En la neurosis, este sentimiento se agudiza patológicamente, llevando al sujeto a crear una "ficción directriz" o afán desmedido de poder para encubrir su fragilidad.',
    tags: ['Adler', 'Psicología Individual', 'Compensación']
  },
  {
    term: 'Arreglo Neurótico',
    book: 'El carácter neurótico',
    author: 'Alfred Adler',
    editorial: 'Paidós',
    literalDefinition: 'Dispositivo inconsciente y teleológico mediante el cual el paciente neurótico utiliza sus síntomas para eludir las exigencias sociales y asegurarse una posición ficticia de dominio o lástima.',
    clinicalContext: 'El síntoma no es un mero residuo biológico, sino una coartada calculada para proteger el sentimiento de la propia valía frente a la posibilidad del fracaso.',
    tags: ['Adler', 'Neurosis', 'Finalismo']
  },
  {
    term: 'Identificación con el Agresor',
    book: 'El yo y los mecanismos de defensa',
    author: 'Anna Freud',
    editorial: 'Paidós',
    literalDefinition: 'Mecanismo defensivo mediante el cual el sujeto, enfrentado a una agresión o peligro exterior, introyecta y asume los atributos del agresor, transformándose de víctima pasiva en agente activo del castigo.',
    clinicalContext: 'Es común en la infancia y en traumas relacionales tempranos; el niño imita la autoridad amenazante para conjurar la angustia de indefensión.',
    tags: ['Anna Freud', 'Mecanismos de Defensa', 'Yo']
  },
  {
    term: 'Formación Reactiva',
    book: 'El yo y los mecanismos de defensa',
    author: 'Anna Freud',
    editorial: 'Paidós',
    literalDefinition: 'Mecanismo que consiste en adoptar una actitud psíquica o hábito conductual consciente diametralmente opuesto a un impulso pulsional reprimido que genera angustia.',
    clinicalContext: 'Ejemplo clínico: una amabilidad extrema y pulcritud exagerada que enmascaran una hostilidad sádico-anal subyacente.',
    tags: ['Anna Freud', 'Defensa', 'Neurosis Obsesiva']
  },
  {
    term: 'Sublimación',
    book: 'Tres ensayos sobre teoría sexual',
    author: 'Sigmund Freud',
    editorial: 'Alianza Editorial',
    literalDefinition: 'Desvío de las energías pulsionales sexuales o agresivas hacia fines no sexuales y de alta valoración social o cultural (arte, ciencia, trabajo intelectual).',
    clinicalContext: 'Es el único mecanismo de defensa plenamente adaptativo y maduro en el que no opera la represión patógena.',
    tags: ['Freud', 'Pulsión', 'Cultura']
  },
  {
    term: 'Superyó (Über-Ich)',
    book: 'El yo y el ello',
    author: 'Sigmund Freud',
    editorial: 'Alianza Editorial',
    literalDefinition: 'Instancia psíquica formada por la introyección de las normas, ideales y prohibiciones morales de los progenitores tras la disolución del Complejo de Edipo.',
    clinicalContext: 'Ejerce funciones de autobservación, conciencia moral e ideal del yo. Su severidad excesiva genera el sentimiento inconsciente de culpa y la necesidad neurótica de castigo.',
    tags: ['Freud', 'Segunda Tópica', 'Culpa']
  },
  {
    term: 'Compulsión a la Repetición',
    book: 'Más allá del principio del placer',
    author: 'Sigmund Freud',
    editorial: 'Alianza Editorial',
    literalDefinition: 'Tendencia ciega del aparato psíquico a reproducir vivencias displacenteras o traumáticas del pasado, superando el dominio del principio del placer.',
    clinicalContext: 'Lleva a Freud a postular en 1920 la existencia de Tánatos (pulsión de muerte), explicando por qué los pacientes reviven patrones autodestructivos en la transferencia.',
    tags: ['Freud', 'Tánatos', 'Trauma']
  },
  {
    term: 'Conversión Histérica',
    book: 'Escritos sobre la histeria',
    author: 'Sigmund Freud y Josef Breuer',
    editorial: 'Alianza Editorial',
    literalDefinition: 'Transposición de un afecto psíquico intolerable reprimido hacia una inervación somática corporal (parálisis, contracturas, anestesias o convulsiones sin base orgánica).',
    clinicalContext: 'El cuerpo "habla" y teatraliza simbólicamente el conflicto infantil reprimido que no pudo encontrar cauce verbal.',
    tags: ['Freud', 'Histeria', 'Síntoma Somático']
  },
  {
    term: 'Condensación (Verdichtung)',
    book: 'La interpretación de los sueños',
    author: 'Sigmund Freud',
    editorial: 'Alianza Editorial',
    literalDefinition: 'Mecanismo del trabajo del sueño donde múltiples pensamientos latentes, personas o afectos se sintetizan en una sola imagen o representación manifiesta singular.',
    clinicalContext: 'Una figura onírica única puede amalgamar los rasgos del padre, del terapeuta y de una figura hostil de la infancia.',
    tags: ['Freud', 'Sueños', 'Inconsciente']
  },
  {
    term: 'Acto Fallido (Fehlleistung)',
    book: 'Psicopatología de la vida cotidiana',
    author: 'Sigmund Freud',
    editorial: 'Alianza Editorial',
    literalDefinition: 'Acción, olvido o lapsus donde el propósito consciente fracasa porque es interferido victoriosamente por una intención inconsciente reprimida.',
    clinicalContext: 'Demuestra el determinismo psíquico universal: no existen tropiezos fortuitos en la memoria o el habla.',
    tags: ['Freud', 'Actos Fallidos', 'Vida Cotidiana']
  }
];

export interface DsmCategory {
  id: string;
  name: string;
  disorders: {
    code: string;
    title: string;
    criteriaSummary: string[];
    differentialPsychoanalysis: string;
  }[];
}

export const dsm5Database: DsmCategory[] = [
  {
    id: 'personalidad',
    name: 'Trastornos de la Personalidad (Grupos A, B y C)',
    disorders: [
      {
        code: 'F60.3',
        title: 'Trastorno de la Personalidad Límite (Borderline)',
        criteriaSummary: [
          'Inestabilidad persistente en relaciones interpersonales, autoimagen y afectos.',
          'Esfuerzos desesperados para evitar el desamparo real o imaginado.',
          'Impulsividad potencialmente dañina en al menos dos áreas.',
          'Sentimientos crónicos de vacío y disforia episódica intensa.'
        ],
        differentialPsychoanalysis: 'Desde la teoría psicoanalítica de Otto Kernberg y Freud, se estructura sobre una organización fronteriza con difusión de identidad y predominio del mecanismo de escisión (splitting) sobre la represión, con fallas graves en la constancia objetal.'
      },
      {
        code: 'F60.4',
        title: 'Trastorno de la Personalidad Histriónica',
        criteriaSummary: [
          'Incomodidad cuando no es el centro de atención.',
          'Interacción seductora o provocativa inapropiada.',
          'Expresión emocional superficial y rápidamente cambiante.',
          'Utilización constante del aspecto físico para llamar la atención.'
        ],
        differentialPsychoanalysis: 'Equivalente clásico a la estructura de carácter histérico analizada por Freud y Wilhelm Reich: fijación en la etapa fálico-edípica, donde la erotización y teatralidad defienden contra la angustia de castración o la devaluación narcisista.'
      },
      {
        code: 'F60.5',
        title: 'Trastorno de la Personalidad Obsesivo-Compulsiva',
        criteriaSummary: [
          'Preocupación excesiva por los detalles, normas, listas y orden.',
          'Perfeccionismo que interfiere con la finalización de tareas.',
          'Dedicación excesiva al trabajo con exclusión del ocio.',
          'Rigidez, terquedad y dificultad para delegar tareas.'
        ],
        differentialPsychoanalysis: 'Freud y Reich lo definen como el carácter anal-retentivo: dominado por la formación reactiva, el aislamiento del afecto y la anulación mágica, con un Superyó tiránico y necesidad compulsiva de control.'
      }
    ]
  },
  {
    id: 'somatomorfos',
    name: 'Trastornos de Síntomas Somáticos y Disociativos',
    disorders: [
      {
        code: 'F44.4',
        title: 'Trastorno de Síntomas Neurológicos Funcionales (Trastorno de Conversión)',
        criteriaSummary: [
          'Uno o más síntomas de alteración motora o sensitiva voluntaria.',
          'Incompatibilidad clínica entre el síntoma y las afecciones neurológicas médicas reconocidas.',
          'El síntoma causa malestar clínicamente significativo o deterioro funcional.'
        ],
        differentialPsychoanalysis: 'El cuadro nuclear de los Escritos sobre la histeria (Freud y Breuer): el afecto estrangulado se transforma en una inervación somática simbólica (conversión), con ganancia primaria (alivio de la angustia) y ganancia secundaria (cuidado del entorno).'
      }
    ]
  }
];