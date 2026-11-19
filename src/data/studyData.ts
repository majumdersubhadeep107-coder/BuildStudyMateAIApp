export type NavSection = 'dashboard' | 'copilot' | 'flashcards' | 'quiz' | 'planner' | 'stack'

export interface Course {
  id: string
  code: string
  title: string
  instructor: string
  schedule: string
  examLabel: string
  examDaysAway: number
  mastery: number
  cardsCount: number
  dueCount: number
  accentHex: string
  softBg: string
  darkSoftBg: string
  coverImage: string
  lectureTitle: string
  lectureNotes: string
  syllabusTopics: string[]
}

export interface FlashcardItem {
  id: string
  courseId: string
  front: string
  back: string
  tag: string
  difficulty: 'Core' | 'Medium' | 'Advanced'
  repetitions: number
  easeFactor: number
  intervalDays: number
  dueToday: boolean
  lastReviewed?: string
}

export interface QuizQuestion {
  id: string
  courseId: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  topic: string
}

export interface StudyTask {
  id: string
  courseId: string
  title: string
  dueLabel: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  stage: 'todo' | 'in_progress' | 'mastered'
  estimatedMinutes: number
}

export interface WeeklyMetric {
  day: string
  focusHours: number
  cardsReviewed: number
  retentionPct: number
}

export const STUDENT_PROFILE = {
  name: 'Maya Lin',
  program: 'B.S. Computer Science & Cognitive Systems',
  term: 'Spring Semester · Week 8',
  streakDays: 14,
  retentionRate: 91.4,
  weeklyGoalHours: 22,
  loggedHours: 18.5,
  avatarUrl:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMHBvcnRyYWl0JTIwaGVhZHNob3QlMjBtaW5pbWFsfGVufDF8fHx8MTc5NTA4NTYwMnww&ixlib=rb-4.1.0&q=80&w=400',
  studyDeskUrl:
    'https://images.unsplash.com/photo-1587902673915-631e5ba4488f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBzdHVkeSUyMGRlc2slMjBub3RlYm9vayUyMGxhcHRvcCUyMHdhcm0lMjBsaWdodHxlbnwxfHx8fDE3OTUwODU2MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
}

export const COURSES: Course[] = [
  {
    id: 'cs301',
    code: 'CS 301',
    title: 'Machine Learning & Neural Systems',
    instructor: 'Prof. Elena Vance',
    schedule: 'Mon / Wed · 10:30 AM',
    examLabel: 'Midterm Exam',
    examDaysAway: 4,
    mastery: 88,
    cardsCount: 48,
    dueCount: 14,
    accentHex: '#3B4FE4',
    softBg: '#EEF0FF',
    darkSoftBg: 'rgba(99, 116, 255, 0.16)',
    coverImage:
      'https://images.unsplash.com/photo-1548393488-ae8f117cbc1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBzdHVkeSUyMGRlc2slMjBub3RlYm9vayUyMGxhcHRvcCUyMHdhcm0lMjBsaWdodHxlbnwxfHx8fDE3OTUwODU2MDJ8MA&ixlib=rb-4.1.0&q=80&w=800',
    lectureTitle: 'Lecture 14: Backpropagation, Regularization & Transformer Attention',
    lectureNotes: `Backpropagation is an exact algorithmic application of the multivariable chain rule that computes partial derivatives of a scalar loss function with respect to every weight in a neural network. During the forward pass, intermediate activations are cached in memory so backward pass Jacobian-vector products avoid redundant exponential recomputation.

Stochastic Gradient Descent updates parameter vectors iteratively in the opposite direction of mini-batch gradients scaled by learning rate alpha. Adaptive optimizers such as Adam maintain exponential moving averages of both first-order gradients (momentum) and second-order squared gradients to normalize step sizes across sparse or ill-conditioned dimensions.

Regularization prevents overfitting when model capacity exceeds training signal. Weight decay (L2 regularization) penalizes large parameter norms, whereas Dropout randomly zeroes hidden activations with probability p during training to discourage brittle co-adaptation across neurons.

Scaled Dot-Product Attention computes contextual representations via Softmax((Q * K^T) / sqrt(d_k)) * V. Dividing by sqrt(d_k) prevents large dot products in high dimensions from pushing softmax into regions with vanishingly small gradients.`,
    syllabusTopics: [
      'Multivariable Chain Rule & Computational Graphs',
      'SGD, Momentum & AdamW Optimization',
      'Bias-Variance Tradeoff & Dropout Regularization',
      'Scaled Dot-Product & Multi-Head Self-Attention',
    ],
  },
  {
    id: 'bio214',
    code: 'BIO 214',
    title: 'Cellular Neurobiology',
    instructor: 'Prof. Marcus Sterling',
    schedule: 'Tue / Thu · 1:00 PM',
    examLabel: 'Synaptic Lab Quiz',
    examDaysAway: 2,
    mastery: 82,
    cardsCount: 39,
    dueCount: 16,
    accentHex: '#0F766E',
    softBg: '#E6F7F5',
    darkSoftBg: 'rgba(20, 184, 166, 0.16)',
    coverImage:
      'https://images.unsplash.com/photo-1777777008773-a646d94edf91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBzdHVkeSUyMGRlc2slMjBub3RlYm9vayUyMGxhcHRvcCUyMHdhcm0lMjBsaWdodHxlbnwxfHx8fDE3OTUwODU2MDJ8MA&ixlib=rb-4.1.0&q=80&w=800',
    lectureTitle: 'Lecture 11: Action Potentials, Ion Channels & Long-Term Potentiation',
    lectureNotes: `Resting membrane potential in mammalian neurons sits near -70 mV and is maintained primarily by selective potassium leak channels alongside the ATP-dependent sodium-potassium pump, which exports three Na+ ions for every two K+ ions imported against their electrochemical gradients.

An Action Potential initiates at the axon hillock once depolarization crosses threshold potential near -55 mV. Voltage-gated sodium channels open rapidly, driving an inward Na+ current toward the sodium equilibrium potential (+60 mV), before fast inactivation gates close and delayed-rectifier potassium channels repolarize the membrane.

Saltatory conduction accelerates signal propagation along myelinated axons by restricting voltage-gated ion channel regeneration to unmyelinated Nodes of Ranvier, reducing membrane capacitance and metabolic energy expenditure.

Long-Term Potentiation (LTP) in hippocampal CA1 synapses depends on coincidence detection by postsynaptic NMDA receptors. Postsynaptic depolarization expels extracellular Mg2+ ions blocking the NMDA pore, permitting Ca2+ influx upon glutamate binding and triggering CaMKII-mediated AMPA receptor insertion.`,
    syllabusTopics: [
      'Goldman-Hodgkin-Katz Membrane Equilibrium',
      'Voltage-Gated Na+/K+ Channel Kinetics',
      'Myelination & Saltatory Propagation',
      'NMDA Receptor Coincidence & Hippocampal LTP',
    ],
  },
  {
    id: 'econ202',
    code: 'ECON 202',
    title: 'Macroeconomic Theory & Policy',
    instructor: 'Prof. Priya Nair',
    schedule: 'Mon / Wed / Fri · 2:00 PM',
    examLabel: 'Problem Set 6',
    examDaysAway: 1,
    mastery: 94,
    cardsCount: 31,
    dueCount: 7,
    accentHex: '#B45309',
    softBg: '#FEF3C7',
    darkSoftBg: 'rgba(245, 158, 11, 0.16)',
    coverImage:
      'https://images.unsplash.com/photo-1587902673915-631e5ba4488f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBzdHVkeSUyMGRlc2slMjBub3RlYm9vayUyMGxhcHRvcCUyMHdhcm0lMjBsaWdodHxlbnwxfHx8fDE3OTUwODU2MDJ8MA&ixlib=rb-4.1.0&q=80&w=800',
    lectureTitle: 'Lecture 16: IS-LM Dynamics, Monetary Policy & Taylor Rule',
    lectureNotes: `The IS curve represents combinations of real interest rates and aggregate output where the goods market is in equilibrium, sloping downward because lower real interest rates stimulate capital investment and interest-sensitive consumption. Fiscal expansion shifts the IS curve rightward scaled by the Keynesian expenditure multiplier.

Monetary policy operates in modern central banking by setting policy interest rates and adjusting reserve balances to steer short-term real rates. According to the Taylor Rule, nominal policy rates respond more than one-for-one to inflation deviations above target so that real interest rates rise enough to cool excess aggregate demand.

Expectations-Augmented Phillips Curve relates short-run inflation surprises to cyclical unemployment gaps around the non-accelerating inflation rate of unemployment (NAIRU). When inflation expectations anchor credibly, supply shocks produce smaller second-round wage-price spirals.

At the Effective Lower Bound, conventional rate cuts lose traction because nominal interest rates approach zero, prompting central banks to deploy forward guidance and quantitative easing to compress long-duration term premia.`,
    syllabusTopics: [
      'IS-LM Goods & Money Market Equilibrium',
      'Taylor Principle & Central Bank Credibility',
      'Expectations-Augmented Phillips Curve & NAIRU',
      'Zero Lower Bound & Unconventional Policy',
    ],
  },
  {
    id: 'arch118',
    code: 'ARCH 118',
    title: 'Modernist Design & Spatial Theory',
    instructor: 'Prof. Julian Morel',
    schedule: 'Thu · 3:30 PM Seminar',
    examLabel: 'Analytical Critique',
    examDaysAway: 6,
    mastery: 91,
    cardsCount: 24,
    dueCount: 5,
    accentHex: '#7C3AED',
    softBg: '#F3E8FF',
    darkSoftBg: 'rgba(167, 139, 250, 0.16)',
    coverImage:
      'https://images.unsplash.com/photo-1779444480590-9bf6f021d5d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdHVkeSUyMGRlc2slMjBub3RlYm9vayUyMGxhcHRvcCUyMHdhcm0lMjBsaWdodHxlbnwxfHx8fDE3OTUwODU2MDJ8MA&ixlib=rb-4.1.0&q=80&w=800',
    lectureTitle: 'Seminar 8: Bauhaus Tectonics, Le Corbusier & Daylight Choreography',
    lectureNotes: `Le Corbusier articulated Five Points of Architecture enabled by reinforced concrete structural frames: pilotis elevating mass off the ground, the free plan liberating interior partitions from load-bearing walls, the free facade, horizontal ribbon windows, and occupied roof gardens.

Bauhaus pedagogy in Dessau unified fine craft, industrial prototyping, and material honesty, rejecting applied ornament in favor of tectonic clarity where structural joints and material properties remain legible to the occupant.

Nordic Modernism exemplified by Alvar Aalto tempered strict rationalist geometry with tactile timber surfaces, acoustic warmth, and indirect northern skylights that diffuse harsh glare into calm luminous gradients suited for libraries and civic halls.`,
    syllabusTopics: [
      'Le Corbusier Five Points & Domino Frame',
      'Bauhaus Material Pedagogy in Dessau',
      'Alvar Aalto & Humanist Daylight Diffusion',
    ],
  },
]

export const INITIAL_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    courseId: 'cs301',
    front: 'Why does Scaled Dot-Product Attention divide Q · K^T by sqrt(d_k) before applying Softmax?',
    back: 'In high dimensions, dot products grow in variance proportionally to d_k, pushing Softmax into saturated regions with near-zero gradients. Scaling by 1/sqrt(d_k) preserves unit variance and stable gradient flow.',
    tag: 'Transformers',
    difficulty: 'Core',
    repetitions: 2,
    easeFactor: 2.6,
    intervalDays: 4,
    dueToday: true,
  },
  {
    id: 'fc-2',
    courseId: 'cs301',
    front: 'How does AdamW differ from standard L2 regularization inside adaptive gradient optimizers?',
    back: 'AdamW decouples weight decay directly from the gradient update rather than adding L2 penalty into g_t, preventing parameters with large historical squared gradients from receiving weaker effective regularization.',
    tag: 'Optimization',
    difficulty: 'Advanced',
    repetitions: 1,
    easeFactor: 2.4,
    intervalDays: 1,
    dueToday: true,
  },
  {
    id: 'fc-3',
    courseId: 'cs301',
    front: 'Why must forward-pass intermediate activations be cached in memory during neural network training?',
    back: 'Backpropagation computes vector-Jacobian products using local derivatives evaluated at the forward activations; caching them avoids exponential recomputation across deep layers.',
    tag: 'Backprop',
    difficulty: 'Core',
    repetitions: 3,
    easeFactor: 2.7,
    intervalDays: 9,
    dueToday: false,
  },
  {
    id: 'fc-4',
    courseId: 'bio214',
    front: 'Why is the postsynaptic NMDA receptor considered a molecular coincidence detector in hippocampal LTP?',
    back: 'Opening requires two simultaneous events: presynaptic glutamate release (ligand binding) AND postsynaptic depolarization strong enough to expel extracellular Mg2+ blocking the channel pore, allowing Ca2+ influx.',
    tag: 'Synaptic Plasticity',
    difficulty: 'Core',
    repetitions: 1,
    easeFactor: 2.5,
    intervalDays: 1,
    dueToday: true,
  },
  {
    id: 'fc-5',
    courseId: 'bio214',
    front: 'What stoichiometry makes the Na+/K+ ATPase electrogenic, and how does it support resting potential?',
    back: 'Each ATP cycle exports 3 Na+ ions and imports 2 K+ ions, creating a net outward positive charge and maintaining steep concentration gradients that power K+ leak equilibrium near -70 mV.',
    tag: 'Membrane Biophysics',
    difficulty: 'Medium',
    repetitions: 2,
    easeFactor: 2.55,
    intervalDays: 4,
    dueToday: true,
  },
  {
    id: 'fc-6',
    courseId: 'econ202',
    front: 'State the Taylor Principle and explain what happens if a central bank responds less than 1-for-1 to inflation.',
    back: 'Nominal policy rates must increase by more than 1 percentage point per 1 point rise in inflation so the real interest rate rises. Otherwise, higher inflation lowers real interest rates, fueling further overheating.',
    tag: 'Monetary Policy',
    difficulty: 'Core',
    repetitions: 2,
    easeFactor: 2.65,
    intervalDays: 5,
    dueToday: true,
  },
  {
    id: 'fc-7',
    courseId: 'econ202',
    front: 'Why does the IS curve slope downward in (Y, r) space?',
    back: 'A lower real interest rate reduces the user cost of capital and boosts planned investment and durable consumption, raising equilibrium aggregate output in the goods market.',
    tag: 'IS-LM Model',
    difficulty: 'Core',
    repetitions: 4,
    easeFactor: 2.75,
    intervalDays: 12,
    dueToday: false,
  },
  {
    id: 'fc-8',
    courseId: 'arch118',
    front: 'How did Le Corbusier’s Maison Dom-Ino structural frame enable both the Free Plan and Free Facade?',
    back: 'By concentrating gravity loads onto reinforced concrete columns (pilotis) and flat slabs cantilevered past the perimeter, neither interior partitions nor exterior curtain walls carry structural weight.',
    tag: 'Modernist Tectonics',
    difficulty: 'Medium',
    repetitions: 1,
    easeFactor: 2.5,
    intervalDays: 2,
    dueToday: true,
  },
]

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    courseId: 'cs301',
    topic: 'Transformer Architecture',
    question:
      'In Multi-Head Attention with key dimension d_k = 64, omitting the 1/sqrt(d_k) scaling factor primarily causes which training issue?',
    options: [
      'Dot products grow in magnitude, saturating Softmax and shrinking gradients toward zero',
      'Weight matrices become non-invertible during matrix multiplication with Value vectors',
      'Positional encodings cancel out token embeddings across residual connections',
      'Dropout masks remain active during validation inference passes',
    ],
    correctIndex: 0,
    explanation:
      'When d_k = 64, unscaled dot products have standard deviation ~8 rather than 1, pushing Softmax outputs close to 0 or 1 where local derivatives vanish.',
  },
  {
    id: 'q-2',
    courseId: 'cs301',
    topic: 'Regularization & Generalization',
    question:
      'During evaluation (inference) of a network trained with inverted Dropout at drop probability p = 0.2, how are hidden activations handled?',
    options: [
      '20% of neurons continue to be randomly zeroed and averaged across 5 passes',
      'All neurons remain active with weights untouched because 1/(1-p) scaling was applied during training',
      'Activations are multiplied by 0.2 to match training sparsity',
      'Batch normalization layers recompute mini-batch variance from single test samples',
    ],
    correctIndex: 1,
    explanation:
      'Inverted dropout scales surviving activations by 1/(1-p) during training so expected activation magnitudes stay identical at test time with all units active.',
  },
  {
    id: 'q-3',
    courseId: 'bio214',
    topic: 'Action Potential Kinetics',
    question:
      'What directly enforces the absolute refractory period immediately following the peak of a neuronal action potential?',
    options: [
      'Temporary depletion of all intracellular ATP stores powering Na+/K+ pumps',
      'Inactivation gates occluding voltage-gated Na+ channels until the membrane hyperpolarizes',
      'Extracellular Mg2+ ions plugging voltage-gated K+ channels',
      'Complete equalization of Na+ concentrations inside and outside the soma',
    ],
    correctIndex: 1,
    explanation:
      'Voltage-gated Na+ channels enter an inactivated conformation shortly after opening and cannot reopen until membrane repolarization resets their inactivation gate.',
  },
  {
    id: 'q-4',
    courseId: 'bio214',
    topic: 'Synaptic Plasticity',
    question:
      'Applying a selective NMDA receptor antagonist to hippocampal CA1 neurons prior to high-frequency tetanus stimulation will:',
    options: [
      'Abolish baseline fast excitatory synaptic transmission mediated by AMPA receptors',
      'Prevent induction of Long-Term Potentiation while leaving baseline AMPA EPSPs intact',
      'Convert inhibitory GABAergic currents into depolarizing sodium currents',
      'Immediately block axonal conduction along Nodes of Ranvier',
    ],
    correctIndex: 1,
    explanation:
      'AMPA receptors mediate normal baseline EPSPs, whereas NMDA receptor Ca2+ influx is specifically required to induce new LTP via AMPA insertion.',
  },
  {
    id: 'q-5',
    courseId: 'econ202',
    topic: 'Taylor Rule & Real Rates',
    question:
      'Suppose inflation rises by 2% while output stays at potential. Under a Taylor Rule coefficient of 1.5 on inflation, the central bank raises nominal rates by:',
    options: [
      '1.0%, lowering the real interest rate by 1.0%',
      '2.0%, leaving the real interest rate unchanged',
      '3.0%, increasing the real interest rate by 1.0% to restrain demand',
      '0.5%, relying on fiscal multipliers to close the inflation gap',
    ],
    correctIndex: 2,
    explanation:
      'With a 1.5 response coefficient (i = r* + pi + 0.5*(pi - pi*)), a 2% jump in pi raises nominal i by 2% + 0.5(2%) = 3.0%, raising real r by +1.0%.',
  },
  {
    id: 'q-6',
    courseId: 'arch118',
    topic: 'Nordic Modernism',
    question:
      'How did Alvar Aalto’s library designs depart from strict international-style orthogonal glass boxes?',
    options: [
      'By reintroducing load-bearing neoclassical stone colonnades and frescoed domes',
      'By pairing conical indirect skylights and warm timber acoustic surfaces to diffuse glare',
      'By eliminating all natural daylight in favor of fluorescent grid ceilings',
      'By burying reading rooms entirely below water tables without ventilation',
    ],
    correctIndex: 1,
    explanation:
      'Aalto humanized modernism through shadowless conical roof monitors that bounce high-latitude light softly onto reading desks alongside tactile birch interiors.',
  },
]

export const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    courseId: 'econ202',
    title: 'Complete Problem Set 6: Taylor Rule & ZLB derivations',
    dueLabel: 'Tomorrow · 5:00 PM',
    priority: 'high',
    completed: false,
    stage: 'in_progress',
    estimatedMinutes: 50,
  },
  {
    id: 'task-2',
    courseId: 'bio214',
    title: 'Drill 16 Synaptic Plasticity & NMDA SM-2 flashcards',
    dueLabel: 'In 2 days',
    priority: 'high',
    completed: false,
    stage: 'todo',
    estimatedMinutes: 25,
  },
  {
    id: 'task-3',
    courseId: 'cs301',
    title: 'Synthesize Lecture 14 notes & practice Transformer gradient quiz',
    dueLabel: 'In 3 days',
    priority: 'high',
    completed: false,
    stage: 'in_progress',
    estimatedMinutes: 45,
  },
  {
    id: 'task-4',
    courseId: 'arch118',
    title: 'Draft 600-word spatial analysis comparing Villa Savoye & Viipuri Library',
    dueLabel: 'Friday · 11:59 PM',
    priority: 'medium',
    completed: false,
    stage: 'todo',
    estimatedMinutes: 60,
  },
  {
    id: 'task-5',
    courseId: 'cs301',
    title: 'Verify computational graph Jacobian-vector hand derivations',
    dueLabel: 'Completed yesterday',
    priority: 'medium',
    completed: true,
    stage: 'mastered',
    estimatedMinutes: 40,
  },
]

export const WEEKLY_METRICS: WeeklyMetric[] = [
  { day: 'Mon', focusHours: 2.8, cardsReviewed: 38, retentionPct: 87 },
  { day: 'Tue', focusHours: 3.4, cardsReviewed: 46, retentionPct: 89 },
  { day: 'Wed', focusHours: 2.1, cardsReviewed: 29, retentionPct: 88 },
  { day: 'Thu', focusHours: 3.9, cardsReviewed: 54, retentionPct: 91 },
  { day: 'Fri', focusHours: 2.6, cardsReviewed: 35, retentionPct: 90 },
  { day: 'Sat', focusHours: 1.9, cardsReviewed: 28, retentionPct: 92 },
  { day: 'Sun', focusHours: 1.8, cardsReviewed: 32, retentionPct: 93 },
]
