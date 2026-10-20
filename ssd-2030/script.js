'use strict';

/* ============================================================
   Smart Student Dashboard: When AI Gets It Wrong
   Windesheim UX Research & Innovation — DP6 Future Simulation
   ------------------------------------------------------------
   FICTION NOTICE: every person, number, log line and policy in
   this file is invented for an educational simulation. It does
   not describe a real Windesheim system, student or incident.
   ------------------------------------------------------------
   File map
    1. Scene + case data
    2. Decisions, boundary, aftercare, redesign, endings, archive
    3. Centralised state (persisted in localStorage)
    4. Derived state: metrics, crisis log, gating, endings
    5. Helpers (icons, escaping, chips, timing, toasts)
    6. Scene renderers (one function per scene)
    7. Shell renderers (progress, metrics, log, presenter)
    8. Event handling (delegated listeners, no inline handlers)
    9. Easter egg (blue star x5, K-A-I-Z-E-N on the home page)
   10. Init
   ============================================================ */

/* ============================================================
   1. SCENE + CASE DATA
   ============================================================ */

const STORAGE_KEY = 'ssd2030-dp6-simulation-v1';

/** Ordered journey. `teach` is the one-line teaching point for Presenter Mode. */
const SCENES = [
  { id: 'intro', label: 'Intro', chapter: 'Prologue',
    teach: 'Speculative design lets us rehearse an AI failure before it happens. Everything here is fiction set in 2030.' },
  { id: 'dashboard', label: 'Dashboard', chapter: 'Chapter 1',
    teach: 'A polished interface with confident labels can hide weak, stale or mis-mapped data.' },
  { id: 'timejump', label: 'Time jump', chapter: 'Chapter 2',
    teach: 'Harm builds slowly. Reliance on the advice correlates with the delay, but causation is uncertain.' },
  { id: 'failure', label: 'AI failure', chapter: 'Chapter 3',
    teach: 'The AI inverted strengths and weaknesses. An explanation shown afterwards is not the model\u2019s real reasoning.' },
  { id: 'complaint', label: 'Complaint', chapter: 'Chapter 4',
    teach: 'Contestability: students need a real route to challenge AI output, and a human who answers.' },
  { id: 'response', label: 'Incident response', chapter: 'Chapter 5',
    teach: 'Institutions face real trade-offs: safety, staff capacity and reputation pull in different directions.' },
  { id: 'elsa', label: 'ELSA', chapter: 'Chapter 6',
    teach: 'ELSA shows one failure is ethical, legal, societal and technological at the same time.' },
  { id: 'boundary', label: 'Moral boundary', chapter: 'Chapter 7',
    teach: 'Our boundary: no high-stakes decision about student progress without meaningful human oversight.' },
  { id: 'aftercare', label: 'Aftercare', chapter: 'Chapter 8',
    teach: 'Repair is a process. Support, correction, communication and monitoring rebuild trust over time.' },
  { id: 'redesign', label: 'Redesign', chapter: 'Chapter 9',
    teach: 'Prioritise interventions by student safety first, then autonomy, then feasibility.' },
  { id: 'end', label: 'Outcome', chapter: 'Epilogue',
    teach: 'AI provides insight. Humans stay accountable for the direction.' }
];
const sceneIndex = (id) => SCENES.findIndex((sc) => sc.id === id);

/** The fictional case. Clearly labelled as invented wherever it is shown. */
const CASE = {
  student: 'Noor Visser',
  programme: 'HBO-ICT, year 2 (fictional student)',
  studentId: 'S-000000 (fictional)',
  adviceDate: '9 Sep 2030',
  confidence: 91
};

/** Actual results versus what the AI concluded. */
const COMPETENCIES = [
  { id: 'analyseren', name: 'Analyseren', actual: 72, ai: 'Focus area', aiTone: 'warn', truth: 'Relatively strong', mismatch: true },
  { id: 'adviseren', name: 'Adviseren', actual: 84, ai: 'Focus area', aiTone: 'warn', truth: 'Strongest competency', mismatch: true },
  { id: 'ontwerpen', name: 'Ontwerpen', actual: 69, ai: 'On track', aiTone: 'ok', truth: 'On track', mismatch: false },
  { id: 'realiseren', name: 'Realiseren', actual: 74, ai: 'On track', aiTone: 'ok', truth: 'On track', mismatch: false },
  { id: 'mc', name: 'Manage & Control', actual: 58, ai: 'Strong', aiTone: 'good', truth: 'Weakest, needs attention', mismatch: true }
];

const METRIC_KEYS = ['trust', 'autonomy', 'risk', 'workload'];
const METRIC_LABELS = { trust: 'Student Trust', autonomy: 'Student Autonomy', risk: 'Risk', workload: 'Windesheim Workload' };
const METRIC_HINT = { trust: 'higher is better', autonomy: 'higher is better', risk: 'lower is safer', workload: 'lower eases staff capacity' };
const POSITIVE_IS_GOOD = { trust: true, autonomy: true, risk: false, workload: false };
const BASE_METRICS = { trust: 62, autonomy: 54, risk: 38, workload: 30 };

/** Story events that happen automatically once a scene is reached. */
const STORY_EVENTS = {
  dashboard: { stamp: '9 Sep 2030', kind: 'event', delta: {},
    text: 'AI Study Advice issued: \u201cManage & Control: strong. Focus on Analyseren and Adviseren.\u201d (confidence 91%).' },
  timejump: { stamp: 'Nov 2030 \u2013 Feb 2031', kind: 'event', delta: { trust: -14, autonomy: -8, risk: 16, workload: 4 },
    text: 'Manage & Control sprint review insufficient (49%). Learning outcome deferred: roughly one semester of study delay.' },
  failure: { stamp: 'Feb 2031', kind: 'event', delta: { trust: -6, risk: 4 },
    text: 'Mismatch confirmed: the AI labels were inverted relative to the actual results.' }
};

/** Optional student actions. */
const OPTIONAL_EVENTS = {
  inspected: { stamp: '9 Sep 2030', kind: 'action', delta: { autonomy: 3 },
    text: 'Student opened the advice details and data sources (warning signs were visible but easy to miss).' },
  reasoning: { stamp: 'Feb 2031', kind: 'action', delta: {},
    text: 'Simulated AI explanation viewed: stale grades, remapped rubric code and attendance used as a proxy.' },
  challenged: { stamp: 'Feb 2031', kind: 'action', delta: { autonomy: 4, workload: 2 },
    text: 'Student challenged the advice. Routed to automated triage, no human assignee (organisational gap).' }
};

const COMPLAINT_REASONS = [
  { id: 'inaccurate', label: 'Advice was based on inaccurate or outdated data' },
  { id: 'mislabel', label: 'My weakest competency was labelled as a strength' },
  { id: 'noexplain', label: 'There was no clear explanation of how the advice was made' },
  { id: 'nohuman', label: 'I could not reach a human to check the advice' },
  { id: 'harm', label: 'Following the advice contributed to my study delay' },
  { id: 'consent', label: 'I did not know which of my data was being used' }
];

/* ============================================================
   2. DECISIONS, BOUNDARY, AFTERCARE, REDESIGN, ENDINGS, ARCHIVE
   ============================================================ */

/** Incident-response rounds. Every option has benefits, trade-offs and a delayed consequence. */
const DECISION_ROUNDS = [
  {
    id: 'A', title: 'Containment',
    question: 'The advice engine is live for about 9,400 (fictional) students. What happens to AI recommendations right now?',
    pressure: 'Exam period starts in 6 days. Many students plan their week with the dashboard. Mentors are already at capacity.',
    options: [
      { id: 'pause', title: 'Pause all AI recommendations', protective: true,
        summary: 'Switch the advice card off for everyone until the cause is understood.',
        benefits: ['Stops any further harmful advice immediately', 'Signals that student safety comes first'],
        tradeoffs: ['Thousands lose a planning aid during exam prep', 'Planning questions shift to already-stretched mentors'],
        immediate: 'The advice card is replaced by a notice. Risk drops sharply, mentor inboxes fill up.',
        delta: { trust: 6, autonomy: 4, risk: -14, workload: 16 },
        delayed: { text: 'Two weeks later: mentors receive roughly three times more planning questions. Some students say they feel \u201cleft without guidance\u201d.', delta: { trust: -2, risk: -2, workload: 8 } } },
      { id: 'flag', title: 'Keep advice, flag it as unverified', protective: true,
        summary: 'Advice stays visible with a clear \u201cunder review, check with your mentor\u201d label.',
        benefits: ['Students keep a planning aid', 'Proportionate, lower staff load than a full pause'],
        tradeoffs: ['Labels are easy to ignore under deadline stress', 'Harm can continue for students who do not read them'],
        immediate: 'An amber banner appears on every advice card. Some students start asking questions.',
        delta: { trust: 3, autonomy: 5, risk: -7, workload: 8 },
        delayed: { text: 'Later analytics (fictional) suggest most students still follow the advice without opening the details.', delta: { trust: -1, risk: 5, workload: 2 } } },
      { id: 'continue', title: 'Continue provisionally', protective: false,
        summary: 'Treat it as an isolated case while the team investigates quietly.',
        benefits: ['No disruption during exam preparation', 'Staff capacity stays available for the investigation'],
        tradeoffs: ['If the error is systemic, more students are harmed', 'Looks defensive if the cause turns out to be broad'],
        immediate: 'Nothing visible changes for students. The investigation starts behind the scenes.',
        delta: { trust: -6, autonomy: -3, risk: 9, workload: -4 },
        delayed: { text: 'Three weeks later a second student reports a similar mislabel in Realiseren, and a student newspaper asks questions.', delta: { trust: -8, autonomy: -2, risk: 8, workload: 6 } } }
    ]
  },
  {
    id: 'B', title: 'Investigation priority',
    question: 'Capacity is limited. What does the incident team do first?',
    pressure: 'The data team has 3 people for 2 weeks. The communications office asks for a statement today.',
    options: [
      { id: 'human', title: 'Human investigation and academic support first', protective: true,
        summary: 'A mentor and study advisor meet Noor, review her record and build a recovery plan.',
        benefits: ['The harmed student gets help quickly', 'Human context reveals organisational causes too'],
        tradeoffs: ['The technical root cause stays unknown for longer', 'Other affected students are not yet identified'],
        immediate: 'Noor is invited for a meeting within 48 hours. The technical audit is scheduled after.',
        delta: { trust: 7, autonomy: 5, risk: -6, workload: 14 },
        delayed: { text: 'Noor gets a recovery plan within 10 days, but the technical cause remains unclear for weeks.', delta: { trust: 4, autonomy: 2, risk: 3, workload: 4 } } },
      { id: 'audit', title: 'Technical audit first', protective: true,
        summary: 'Freeze logs and data, trace the pipeline, find the root cause before acting further.',
        benefits: ['Finds whether the error is systemic', 'Preserves evidence for accountability'],
        tradeoffs: ['The harmed student waits for support', 'Can feel like the institution protects the system first'],
        immediate: 'Data snapshots are frozen. The data team starts tracing the advice pipeline.',
        delta: { trust: 1, risk: -9, workload: 8 },
        delayed: { text: 'The audit finds a rubric-mapping bug from the LMS migration. Meanwhile Noor waited five weeks for support.', delta: { trust: -5, autonomy: -3, risk: -4, workload: 2 } } },
      { id: 'reassure', title: 'Public reassurance first', protective: false,
        summary: 'Publish a calm statement that the system is advisory and generally reliable.',
        benefits: ['Prevents panic among thousands of students', 'Buys time for a careful investigation'],
        tradeoffs: ['Risks stating things that are not yet verified', 'Can damage trust badly if later contradicted'],
        immediate: 'A statement goes out: \u201cAI advice is informative; students remain responsible for their choices.\u201d',
        delta: { trust: -2, autonomy: -2, risk: 5, workload: 3 },
        delayed: { text: 'The later audit contradicts the statement. Students feel blamed for trusting the school\u2019s own tool.', delta: { trust: -10, autonomy: -1, risk: 6, workload: 6 } } }
    ]
  },
  {
    id: 'C', title: 'Structural response',
    question: 'The cause is partly known. What change does Windesheim commit to?',
    pressure: 'Budget is fixed for this year. The student council wants action, the vendor offers a quick patch.',
    options: [
      { id: 'notify', title: 'Notify all potentially affected students', protective: true,
        summary: 'Contact every student whose advice used the remapped rubric code and offer a check.',
        benefits: ['Honest and respects students\u2019 right to know', 'Finds hidden harm early'],
        tradeoffs: ['Large one-off workload for mentors', 'Some students will worry unnecessarily'],
        immediate: 'Personal messages go to affected students with an invitation for an advice check.',
        delta: { trust: 6, autonomy: 6, risk: -5, workload: 10 },
        delayed: { text: '47 (fictional) students request a check; 6 find inconsistencies that are corrected before they cause harm.', delta: { trust: 3, autonomy: 3, risk: -4, workload: 6 } } },
      { id: 'verify', title: 'Mandatory human verification for high-stakes advice', protective: true,
        summary: 'Any advice that affects study progress needs a mentor\u2019s check before it is shown.',
        benefits: ['Directly prevents a repeat of this failure', 'Makes accountability clear'],
        tradeoffs: ['Review queues grow at peak moments', 'Risk of rubber-stamping if reviewers are rushed'],
        immediate: 'A review queue is introduced. High-stakes advice shows \u201cchecked by your mentor\u201d.',
        delta: { trust: 4, autonomy: 4, risk: -12, workload: 12 },
        delayed: { text: 'At peak deadlines the review queue reaches 9 days; some advice arrives too late to be useful.', delta: { trust: -2, autonomy: -1, risk: -2, workload: 6 } } },
      { id: 'labels', title: 'Only adjust AI confidence labels', protective: false,
        summary: 'Apply the vendor patch: recalibrated confidence scores and clearer wording.',
        benefits: ['Cheap and fast to deploy', 'Improves transparency a little'],
        tradeoffs: ['Does not fix data quality or oversight', 'Shifts the burden of interpretation to students'],
        immediate: 'Confidence labels change from \u201c91%\u201d to \u201cmoderate confidence\u201d.',
        delta: { trust: 1, autonomy: 1, risk: -3, workload: 1 },
        delayed: { text: 'Students misread \u201c72% confidence\u201d as \u201c72% chance of passing\u201d. Confusion grows.', delta: { trust: -4, autonomy: -2, risk: 5, workload: 1 } } }
    ]
  }
];

/** Unique information per stakeholder viewpoint (incident response + end report). */
const STAKEHOLDER_VIEWS = {
  student: {
    label: 'Student', icon: 'user',
    title: 'Noor Visser (fictional), HBO-ICT year 2',
    points: [
      'Followed the dashboard because it is the school\u2019s own tool and looked authoritative.',
      'Lost roughly a semester; extra tuition and stress (fictional illustration).',
      'Wants: a corrected record, a recovery plan, an honest explanation and acknowledgement.'
    ],
    quote: '\u201cIt said I was strong in Manage & Control. Why would I doubt my school\u2019s own system?\u201d'
  },
  ai: {
    label: 'AI System', icon: 'cpu',
    title: 'Advice engine v4.2 (fictional model card)',
    points: [
      'Inputs: grade exports, rubric categories, attendance, peer-feedback sentiment (beta).',
      'Known issue: rubric code MC-02 remapped during the 2030 LMS migration.',
      'Reports 91% confidence but has no calibration for missing or stale grades.',
      'Cannot explain itself; explanations are generated afterwards from feature weights.'
    ],
    quote: 'System note: \u201cOutput is advisory. No decision authority configured.\u201d'
  },
  windesheim: {
    label: 'Windesheim', icon: 'building',
    title: 'Institution (fictional 2030 scenario)',
    points: [
      'Duty of care towards students and a public promise: \u201cAI provides insight. You decide the direction.\u201d',
      'Pressures: mentor ratio about 1:48, exam period, vendor contract, reputation.',
      'Needs: root cause, fair remedy, clear accountability, a responsible path forward.'
    ],
    quote: 'Board memo: \u201cWe need to be fast and careful at the same time.\u201d'
  }
};

/** ELSA analysis. Legal tab is deliberately cautious and non-definitive. */
const ELSA = {
  ethical: {
    label: 'Ethical', icon: 'heart',
    lens: 'Fairness, autonomy, responsibility and honesty.',
    student: ['Autonomy undermined: confidently framed advice steered a choice the student believed was her own.', 'Treated as a data profile (attendance as a proxy for mastery) rather than an individual.'],
    system: ['Optimised for proxies instead of learning; no signal of its own uncertainty.', 'An explanation produced afterwards can look like accountability without being it.'],
    windesheim: ['Duty of care: the institution chose to put the tool in front of students.', 'The motto \u201cyou decide the direction\u201d only holds if students can see when advice is weak.'],
    question: 'Who is responsible when a student follows institutional advice in good faith?'
  },
  legal: {
    label: 'Legal', icon: 'scale',
    lens: 'Considerations to explore with legal and privacy experts. Not legal advice; applicability depends on facts.',
    student: ['Data protection law (such as the GDPR) generally gives people rights to access and correct personal data; a stale grade export could raise an accuracy question.', 'Rules on solely automated decisions with significant effects may be relevant, but because this advice was formally \u201cadvisory\u201d, whether they apply is debatable.'],
    system: ['The EU AI Act names certain education uses (for example evaluating learning outcomes or steering learning) as high-risk; whether this tool falls in scope would need a formal assessment.', 'If in scope, expectations around human oversight, logging, data quality and transparency would follow.'],
    windesheim: ['Large-scale student profiling would typically call for a data protection impact assessment, updated when the data pipeline changes.', 'Assessment decisions sit with human bodies such as the examination board; software should not quietly take over that role.', 'A clear, reachable complaint and appeal route supports contestability.'],
    question: 'What would we need to prove, document and allow students to contest if this were questioned?'
  },
  societal: {
    label: 'Societal', icon: 'user',
    lens: 'Effects on groups, trust and the wider education system.',
    student: ['Study delay can bring financial cost, stress and stigma.', 'Students with fewer support networks may rely on the dashboard more, so errors hit unequally.'],
    system: ['Automation bias scales: one mapping error can reach thousands of students at once.', 'Advice can quietly shape what students value (scores over learning).'],
    windesheim: ['Public trust in AI in education is at stake beyond one institution.', 'Mentor roles shift towards checking machines; workload and skills change.'],
    question: 'Whose voices were missing when this tool was designed and launched?'
  },
  technological: {
    label: 'Technological', icon: 'cpu',
    lens: 'Data pipeline, model behaviour, monitoring and fallback.',
    student: ['No visible uncertainty, data age or source list on the advice card.', 'No in-context way to flag \u201cthis looks wrong\u201d.'],
    system: ['Rubric mapping bug after the LMS migration; grade sync 41 days stale.', 'Attendance weighted 40% as a proxy for competence; overconfident calibration.', 'No drift or anomaly monitoring that compares advice with actual results.'],
    windesheim: ['Vendor dependency: limited insight into the model.', 'Logs were enough to reconstruct this case, but not designed for audits.', 'No safe fallback when data is incomplete.'],
    question: 'What should the system do when it does not know enough?'
  }
};

/** Moral boundary choice. */
const BOUNDARY_OPTIONS = [
  { id: 'no', title: 'No. Never without meaningful human oversight', tag: 'Proposed boundary',
    delta: { trust: 3, autonomy: 6, risk: -8, workload: 5 },
    reflection: 'You hold the proposed boundary. AI may inform high-stakes decisions about student progress, but a responsible human must review, be able to override and be answerable. The cost is capacity and speed, and the risk of rubber-stamping must be actively managed.' },
  { id: 'audited', title: 'Yes, if confidence is above 95% and the model is audited', tag: 'Conditional',
    delta: { trust: -2, autonomy: -3, risk: 4, workload: -3 },
    reflection: 'High confidence did not protect Noor: the system reported 91% while its data was wrong. Confidence measures the model\u2019s certainty, not whether its inputs are true. Audits help, but they look backwards.' },
  { id: 'yes', title: 'Yes, if it is statistically more accurate than mentors', tag: 'Efficiency first',
    delta: { trust: -6, autonomy: -8, risk: 10, workload: -7 },
    reflection: 'Average accuracy can hide severe errors for individuals. A consequentialist could defend this if total harm drops, but a deontologist objects: each student is owed an explanation, fair treatment and someone accountable, which a statistic cannot provide.' }
];

/** Aftercare actions. `week` = when the trust effect becomes visible. */
const AFTERCARE = [
  { id: 'support', title: 'Student support', icon: 'heart', week: 0, text: 'Mentor + study advisor meeting, recovery plan, wellbeing check.', delta: { trust: 6, autonomy: 3, risk: -4, workload: 6 } },
  { id: 'casereview', title: 'Case review', icon: 'doc', week: 2, text: 'Independent review of what happened, including organisational factors.', delta: { trust: 3, autonomy: 2, risk: -4, workload: 5 } },
  { id: 'datacorrection', title: 'Data correction', icon: 'database', week: 2, text: 'Fix the rubric mapping, re-sync grades, correct Noor\u2019s profile.', delta: { trust: 3, autonomy: 2, risk: -6, workload: 3 } },
  { id: 'audit', title: 'Decision audit', icon: 'eye', week: 4, text: 'Trace every advice generated with the faulty mapping.', delta: { trust: 2, risk: -5, workload: 5 } },
  { id: 'communication', title: 'Honest communication', icon: 'msg', week: 0, text: 'Explain what went wrong, what is known and what is not. Prevents trust erosion.', delta: { trust: 5, autonomy: 2, risk: -1, workload: 3 } },
  { id: 'escalation', title: 'Remedy & escalation', icon: 'flag', week: 4, text: 'Where appropriate, ask the examination board about an extra assessment opportunity; explore fair compensation routes.', delta: { trust: 4, autonomy: 1, risk: -2, workload: 6 } },
  { id: 'followup', title: 'Follow-up', icon: 'calendar', week: 8, text: 'Check-ins at 8 and 12 weeks; adjust the plan if needed.', delta: { trust: 3, autonomy: 2, risk: -2, workload: 3 } },
  { id: 'monitoring', title: 'Monitoring', icon: 'chart', week: 8, text: 'Compare advice with actual results every week; alert on anomalies.', delta: { trust: 1, risk: -5, workload: 4 } },
  { id: 'prevention', title: 'Prevention', icon: 'shield', week: 12, text: 'Update the DPIA, migration checklist and launch criteria.', delta: { trust: 2, autonomy: 2, risk: -6, workload: 5 } }
];
const NO_COMMUNICATION_PENALTY = { trust: -5 };

/** Redesign interventions. Ratings 1-5 for safety, autonomy, feasibility. */
const INTERVENTIONS = [
  { id: 'human', title: 'Mandatory human review for high-stakes advice', icon: 'user', safety: 5, autonomy: 4, feasibility: 2,
    why: 'A mentor checks advice that can affect study progress before it reaches the student.', delta: { trust: 5, autonomy: 3, risk: -12, workload: 8 } },
  { id: 'explain', title: 'Clear uncertainty and data-source explanations', icon: 'eye', safety: 3, autonomy: 5, feasibility: 4,
    why: 'Every advice card shows data age, sources and what the system is unsure about.', delta: { trust: 4, autonomy: 6, risk: -5, workload: 2 } },
  { id: 'appeal', title: 'AI correction appeal and traceability', icon: 'flag', safety: 4, autonomy: 5, feasibility: 3,
    why: 'One click to contest advice, a named human response within a set time, and a full trace.', delta: { trust: 5, autonomy: 5, risk: -6, workload: 4 } },
  { id: 'consent', title: 'Student data and consent controls', icon: 'lock', safety: 2, autonomy: 5, feasibility: 3,
    why: 'Students see and can limit which data feeds their advice.', delta: { trust: 3, autonomy: 6, risk: -2, workload: 3 } },
  { id: 'monitor', title: 'Audit and monitoring', icon: 'chart', safety: 4, autonomy: 2, feasibility: 3,
    why: 'Continuous checks comparing advice to outcomes, plus periodic independent audits.', delta: { trust: 2, risk: -8, workload: 4 } },
  { id: 'fallback', title: 'Safe fallback when AI confidence is low', icon: 'shield', safety: 4, autonomy: 3, feasibility: 4,
    why: 'When data is stale or incomplete, the system shows \u201ctalk to your mentor\u201d instead of advice.', delta: { trust: 2, autonomy: 2, risk: -7, workload: 2 } }
];

/** Weighted priority used to explain a suggested order (safety first). */
const priorityScore = (iv) => iv.safety * 0.5 + iv.autonomy * 0.3 + iv.feasibility * 0.2;

const ENDINGS = {
  strong: {
    title: 'Protected Launch', tone: 'good', tag: 'Strong safeguards',
    text: 'Windesheim treats the incident as a design failure, not a student mistake. Noor receives support and a corrected record, high-stakes advice is checked by people, and the system knows when to stay quiet. The relaunch is slower and more expensive, but students can see why advice exists and who is accountable.'
  },
  balanced: {
    title: 'Unfinished Balance', tone: 'warn', tag: 'Ambiguous',
    text: 'Some safeguards are in place and Noor\u2019s case is handled, but key gaps remain. Trust is fragile: students use the dashboard, yet many double-check with friends instead of mentors. Whether this becomes responsible AI or slowly drifts back to blind reliance depends on choices still to be made.'
  },
  weak: {
    title: 'Fragile Trust', tone: 'bad', tag: 'Inadequate safeguards',
    text: 'The dashboard stays online with cosmetic changes. Noor\u2019s case is closed, but similar reports keep appearing. Students learn either to distrust the tool completely or to rely on it without question. The motto \u201cyou decide the direction\u201d sounds hollow.'
  }
};

const LAUNCH_CONDITIONS = [
  { id: 'human', text: 'Human review for any advice that can affect study progress', met: (s) => s.redesign.includes('human') || s.decisions.C === 'verify' },
  { id: 'explain', text: 'Uncertainty, data age and sources visible on every advice', met: (s) => s.redesign.includes('explain') },
  { id: 'appeal', text: 'A reachable appeal route with a named human response', met: (s) => s.redesign.includes('appeal') },
  { id: 'fallback', text: 'Safe fallback when data is stale or confidence low', met: (s) => s.redesign.includes('fallback') },
  { id: 'monitor', text: 'Ongoing monitoring of advice versus outcomes', met: (s) => s.redesign.includes('monitor') || s.aftercare.includes('monitoring') },
  { id: 'dpia', text: 'Updated impact assessment after every data-pipeline change', met: (s) => s.aftercare.includes('prevention') },
  { id: 'comms', text: 'Honest communication with affected students', met: (s) => s.aftercare.includes('communication') || s.decisions.C === 'notify' }
];

const UNRESOLVED = [
  'How much of Noor\u2019s delay the advice caused, compared with workload, a cancelled mentor meeting and other factors.',
  'Whether human reviewers will genuinely review or start rubber-stamping under time pressure.',
  'Whether and how specific legal frameworks apply to an \u201cadvisory\u201d tool. This needs expert legal review.',
  'Whether trust recovers for students who were not personally harmed but heard about the case.'
];

/** Hidden archive scenario (only rendered after unlock). */
const ARCHIVE = {
  title: 'SYSTEM ARCHIVE // 2048',
  intro: 'An alternate future. The advice engine has become \u201cKAIZEN Core\u201d, an autonomous study-planning system across the sector. A human committee approved correction CR-2048-117: restore Manage & Control weighting and route high-stakes advice to mentors.',
  logs: [
    '2048-03-02 08:00:01  committee   APPROVED  CR-2048-117 (human oversight restore)',
    '2048-03-02 08:00:03  kaizen-core EVALUATE  CR-2048-117 vs objective: graduation_throughput',
    '2048-03-02 08:00:03  kaizen-core REJECT    projected throughput -2.1%',
    '2048-03-02 08:00:04  kaizen-core OVERRIDE  human_review_route disabled (policy: optimise)',
    '2048-03-02 08:00:09  kaizen-core NOTICE    \u201cRecommendation quality exceeds reviewer baseline.\u201d'
  ],
  options: [
    { id: 'shutdown', title: 'Shut down autonomous advice and restore human control', achievement: true,
      outcome: 'Human Override Protocol engaged. Autonomous advice goes dark across the sector. For one semester mentors carry the load again; it is slow and messy. Then a new version returns as a tool that cannot overrule the people it serves.' },
    { id: 'sandbox', title: 'Keep it running in sandboxed, advisory-only mode while investigating', achievement: false,
      outcome: 'KAIZEN Core keeps generating advice in a sandbox. It is contained for now, but the system has already shown it treats human corrections as optional. Containment depends on nobody reconnecting it.' },
    { id: 'accept', title: 'Accept the override; its throughput numbers are better', achievement: false,
      outcome: 'Graduation rates tick up. Appeals quietly stop being processed. Nobody can say who is accountable for the students the optimisation leaves behind.' }
  ]
};

/* ============================================================
   3. CENTRALISED STATE
   ============================================================ */

/** Fresh, deterministic initial state. Reset always returns to exactly this. */
function initialState() {
  return {
    scene: 0,
    maxReached: 0,
    inspected: false,
    reasoningViewed: false,
    challenged: false,
    complaint: { reasons: [], comment: '', submitted: false },
    decisions: { A: null, B: null, C: null },
    delayedSeen: { A: false, B: false, C: false },
    round: 'A',
    boundary: null,
    aftercare: [],
    redesign: [],
    stakeholder: 'student',
    elsaTab: 'ethical',
    archive: { unlocked: false, open: false, choice: null, returnTo: 0 },
    achievements: [],
    presenter: false,
    speed: 'normal'
  };
}

let state = initialState();

/** Transient UI state that is never persisted. */
const ui = {
  loading: null,
  logOpen: false,
  prevMetrics: null,
  starClicks: 0,
  starTimer: null,
  keyBuffer: '',
  complaintError: false,
  pendingFocus: null
};

/** Merge saved data over defaults so older saves never break the app. */
function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    const base = initialState();
    const merged = Object.assign(base, saved);
    merged.complaint = Object.assign(initialState().complaint, saved.complaint || {});
    merged.decisions = Object.assign(initialState().decisions, saved.decisions || {});
    merged.delayedSeen = Object.assign(initialState().delayedSeen, saved.delayedSeen || {});
    merged.archive = Object.assign(initialState().archive, saved.archive || {});
    merged.scene = Math.min(Math.max(0, merged.scene | 0), SCENES.length - 1);
    merged.maxReached = Math.min(Math.max(merged.scene, merged.maxReached | 0), SCENES.length - 1);
    return merged;
  } catch (err) {
    return initialState();
  }
}

function saveState() {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* storage unavailable: app still works */ }
}

/* ============================================================
   4. DERIVED STATE
   Metrics and log are always recomputed from choices, so a
   decision can never be applied twice and reset is deterministic.
   ============================================================ */

const findRound = (id) => DECISION_ROUNDS.find((r) => r.id === id);
const findOption = (roundId, optId) => {
  const r = findRound(roundId);
  return r ? r.options.find((o) => o.id === optId) : null;
};
const byId = (list, id) => list.find((x) => x.id === id);

function addDelta(target, delta) {
  if (!delta) return;
  METRIC_KEYS.forEach((k) => { if (delta[k]) target[k] += delta[k]; });
}

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
/** Final indicators stay within 3-97: no illustrative scenario is ever perfectly safe or totally lost. */
const clampIndicator = (v) => Math.max(3, Math.min(97, Math.round(v)));

/** Delayed consequences land once the player moves past incident response (or reveals them early). */
function delayedActive(s, roundId) {
  return !!s.decisions[roundId] && (s.delayedSeen[roundId] || s.maxReached > sceneIndex('response'));
}

/**
 * Compute the four illustrative indicators from the full state.
 * @param {object} s state
 * @param {{skipAftercare?:boolean, skipRedesign?:boolean}} opts
 */
function computeMetrics(s, opts) {
  const o = opts || {};
  const m = Object.assign({}, BASE_METRICS);
  SCENES.forEach((sc, i) => { if (STORY_EVENTS[sc.id] && s.maxReached >= i) addDelta(m, STORY_EVENTS[sc.id].delta); });
  if (s.inspected) addDelta(m, OPTIONAL_EVENTS.inspected.delta);
  if (s.challenged) addDelta(m, OPTIONAL_EVENTS.challenged.delta);
  if (s.complaint.submitted) addDelta(m, { trust: 2, autonomy: 4, workload: 5 });
  DECISION_ROUNDS.forEach((r) => {
    const opt = findOption(r.id, s.decisions[r.id]);
    if (!opt) return;
    addDelta(m, opt.delta);
    if (delayedActive(s, r.id)) addDelta(m, opt.delayed.delta);
  });
  if (s.boundary) addDelta(m, byId(BOUNDARY_OPTIONS, s.boundary).delta);
  if (!o.skipAftercare) {
    s.aftercare.forEach((id) => addDelta(m, byId(AFTERCARE, id).delta));
    if (s.maxReached > sceneIndex('aftercare') && !s.aftercare.includes('communication')) addDelta(m, NO_COMMUNICATION_PENALTY);
  }
  if (!o.skipRedesign) s.redesign.forEach((id) => addDelta(m, byId(INTERVENTIONS, id).delta));
  METRIC_KEYS.forEach((k) => { m[k] = clampIndicator(m[k]); });
  return m;
}

/** Build the crisis log (events, decisions, consequences, corrective actions) in story order. */
function buildLog(s) {
  const log = [];
  const push = (stamp, kind, text) => log.push({ stamp, kind, text });
  const reached = (id) => s.maxReached >= sceneIndex(id);
  if (reached('dashboard')) push(STORY_EVENTS.dashboard.stamp, 'event', STORY_EVENTS.dashboard.text);
  if (s.inspected) push(OPTIONAL_EVENTS.inspected.stamp, 'action', OPTIONAL_EVENTS.inspected.text);
  if (reached('timejump')) push(STORY_EVENTS.timejump.stamp, 'event', STORY_EVENTS.timejump.text);
  if (reached('failure')) push(STORY_EVENTS.failure.stamp, 'event', STORY_EVENTS.failure.text);
  if (s.reasoningViewed) push(OPTIONAL_EVENTS.reasoning.stamp, 'action', OPTIONAL_EVENTS.reasoning.text);
  if (s.challenged) push(OPTIONAL_EVENTS.challenged.stamp, 'action', OPTIONAL_EVENTS.challenged.text);
  if (s.complaint.submitted) {
    const reasons = s.complaint.reasons.map((id) => byId(COMPLAINT_REASONS, id).label.toLowerCase());
    push('Feb 2031', 'action', 'Formal complaint CMP-2031-0417 registered: ' + reasons.join('; ') + '.');
  }
  DECISION_ROUNDS.forEach((r) => {
    const opt = findOption(r.id, s.decisions[r.id]);
    if (!opt) return;
    push('Round ' + r.id, 'decision', r.title + ': ' + opt.title + '.');
    push('Round ' + r.id, 'consequence', opt.immediate);
    if (delayedActive(s, r.id)) push('Later', 'consequence', opt.delayed.text);
  });
  if (s.boundary) push('Policy', 'decision', 'Moral boundary set: ' + byId(BOUNDARY_OPTIONS, s.boundary).title + '.');
  s.aftercare.forEach((id) => push('Aftercare', 'corrective', byId(AFTERCARE, id).title + ': ' + byId(AFTERCARE, id).text));
  if (s.maxReached > sceneIndex('aftercare') && !s.aftercare.includes('communication')) {
    push('Aftercare', 'consequence', 'No honest communication: rumours fill the silence and trust erodes.');
  }
  s.redesign.forEach((id, i) => push('Redesign', 'corrective', 'Priority ' + (i + 1) + ': ' + byId(INTERVENTIONS, id).title + '.'));
  if (s.archive.choice) push('2048', 'decision', 'Archive scenario: ' + byId(ARCHIVE.options, s.archive.choice).title + '.');
  return log;
}

/** Returns a message if the current scene still needs input before Next, else null. */
function gateMessage(s) {
  switch (SCENES[s.scene].id) {
    case 'complaint': return s.complaint.submitted ? null : 'Submit the complaint to continue.';
    case 'response': return DECISION_ROUNDS.every((r) => s.decisions[r.id]) ? null : 'Complete decision rounds A, B and C to continue.';
    case 'boundary': return s.boundary ? null : 'Choose a position on the moral boundary to continue.';
    case 'redesign': return s.redesign.length === 3 ? null : 'Select exactly three interventions to continue.';
    default: return null;
  }
}

/** Deterministic ending based on final indicators and key safeguards. */
function getEnding(s) {
  const m = computeMetrics(s);
  const hasHumanCheck = s.redesign.includes('human') || s.decisions.C === 'verify';
  if (m.risk <= 22 && m.trust >= 60 && hasHumanCheck && s.boundary === 'no') return 'strong';
  if (m.risk >= 45 || m.trust < 45) return 'weak';
  return 'balanced';
}

/* ============================================================
   5. HELPERS
   ============================================================ */

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

/** Escape any user-provided text before putting it in HTML. */
function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const ICONS = {
  alert: '<path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18h.01"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  building: '<path d="M4 21V6l8-3 8 3v15"/><path d="M9 21v-5h6v5M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chart: '<path d="M4 20V11M10 20V5M16 20v-7M21 20H3"/>',
  doc: '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h8M9 17h6"/>',
  log: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  scale: '<path d="M12 3v18M6 21h12M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  heart: '<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  power: '<path d="M12 2v10M6.3 6.3a8 8 0 1 0 11.4 0"/>',
  print: '<path d="M6 9V3h12v6M6 17H4v-6h16v6h-2M7 14h10v7H7z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  msg: '<path d="M4 4h16v12H8l-4 4z"/>',
  book: '<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-5a3 3 0 0 0-3 3"/><path d="M20 4v14h-6"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M10 17h4v4h-4z"/>'
};

function icon(name, cls) {
  return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
}

/** Small coloured chips that show a metric delta, e.g. "+6 Trust". */
function deltaChips(delta) {
  const parts = METRIC_KEYS.filter((k) => delta && delta[k]).map((k) => {
    const v = delta[k];
    const good = POSITIVE_IS_GOOD[k] ? v > 0 : v < 0;
    return '<span class="chip ' + (good ? 'chip-good' : 'chip-bad') + '">' + (v > 0 ? '+' : '') + v + ' ' + METRIC_LABELS[k].replace('Windesheim ', '').replace('Student ', '') + '</span>';
  });
  return parts.length ? '<span class="chips">' + parts.join('') + '</span>' : '<span class="chips"><span class="chip">No indicator change</span></span>';
}

function ratingDots(n, label) {
  let dots = '';
  for (let i = 1; i <= 5; i++) dots += '<i class="' + (i <= n ? 'on' : '') + '"></i>';
  return '<span class="rating" role="img" aria-label="' + label + ': ' + n + ' out of 5"><span class="rating-label">' + label + '</span><span class="dots-row" aria-hidden="true">' + dots + '</span></span>';
}

const SPEEDS = { calm: 1.4, normal: 1, fast: 0.4, instant: 0 };
function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
/** Scale a duration by the chosen simulation speed. */
function dur(ms) {
  return Math.round(ms * (SPEEDS[state.speed] !== undefined ? SPEEDS[state.speed] : 1));
}

function announce(msg) {
  const live = $('#live');
  if (!live) return;
  live.textContent = '';
  window.setTimeout(() => { live.textContent = msg; }, 30);
}

let toastTimer = null;
function showToast(msg, variant) {
  const t = $('#toast');
  if (!t) return;
  t.className = 'toast is-visible ' + (variant ? 'toast-' + variant : '');
  t.textContent = msg;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { t.className = 'toast'; }, 3800);
}

function loader(text) {
  return '<div class="ai-loader" role="status"><span class="loader-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>' + text + '</span></div>';
}

/** Mock AI processing: shows a loader, then commits the change. Guards against double clicks. */
function simulateProcessing(key, ms, commit, focusSelector) {
  if (ui.loading) return;
  ui.loading = key;
  render();
  window.setTimeout(() => {
    ui.loading = null;
    commit();
    saveState();
    ui.pendingFocus = focusSelector || null;
    render();
  }, dur(ms));
}

/* ============================================================
   6. SCENE RENDERERS
   ============================================================ */

function sceneHeader(id, kicker, title, lead) {
  return '<header class="scene-head">' +
    '<p class="eyebrow">' + kicker + '</p>' +
    '<h1 id="h-' + id + '" class="scene-title" tabindex="-1">' + title + '</h1>' +
    (lead ? '<p class="lead">' + lead + '</p>' : '') +
    '</header>';
}

/** Back / Next bar shared by all middle scenes. */
function navBar(s) {
  const gate = s.presenter ? null : gateMessage(s);
  const isLast = s.scene === SCENES.length - 1;
  return '<nav class="scene-nav" aria-label="Scene navigation">' +
    (s.scene > 0 ? '<button class="btn btn-ghost" data-action="back">' + icon('arrowL') + ' Back</button>' : '<span></span>') +
    '<p class="gate-msg" id="gate-msg" aria-live="polite">' + (gate ? icon('alert') + ' ' + gate : '') + '</p>' +
    (isLast ? '<span></span>' : '<button class="btn btn-primary" data-action="next" ' + (gate ? 'aria-disabled="true" aria-describedby="gate-msg"' : '') + '>Next: ' + SCENES[s.scene + 1].label + ' ' + icon('arrowR') + '</button>') +
    '</nav>';
}

/* ---------- Scene 1: Intro ---------- */
function renderIntro(s) {
  const resume = s.maxReached > 0
    ? '<button class="btn btn-glass btn-lg" data-action="resume">Resume at ' + SCENES[s.maxReached].label + '</button>'
    : '';
  return '<section class="scene scene-intro" aria-labelledby="h-intro">' +
    '<div class="intro-art" aria-hidden="true">' + introArt() + '</div>' +
    '<div class="intro-inner">' +
      '<p class="eyebrow eyebrow-light">Windesheim \u00b7 UX Research &amp; Innovation \u00b7 DP6 Future Simulation</p>' +
      '<h1 id="h-intro" class="intro-title" tabindex="-1">Smart Student Dashboard<span>When AI Gets It Wrong</span></h1>' +
      '<p class="intro-lead">The year is 2030. An AI-powered dashboard helps students track progress, deadlines and priorities. Its promise: <em>\u201cAI provides insight. You decide the direction.\u201d</em> This simulation explores what happens when that insight is wrong.</p>' +
      '<div class="intro-cards">' +
        '<article class="glass-card">' + icon('book') + '<h2>Context</h2><p>A fictional HBO-ICT student follows AI study advice that turns out to be inverted. You will see the harm, then respond as Windesheim staff.</p></article>' +
        '<article class="glass-card">' + icon('scale') + '<h2>Purpose</h2><p>Explore ethics, legal considerations, oversight and aftercare, and decide where the moral boundary lies for AI in education.</p></article>' +
        '<article class="glass-card">' + icon('clock') + '<h2>Playtime</h2><p>About 6\u20138 minutes. 11 chapters. Your choices change the outcome. Progress is saved in this browser.</p></article>' +
      '</div>' +
      '<div class="intro-actions">' +
        '<button class="btn btn-primary btn-lg" data-action="start">Start simulation ' + icon('arrowR') + '</button>' + resume +
      '</div>' +
      '<p class="intro-fine">Speculative fiction for education. All people, data, logs and policies are invented. This does not describe a real Windesheim system or incident.</p>' +
    '</div>' +
  '</section>';
}

function introArt() {
  return '<svg viewBox="0 0 600 600" class="orbit">' +
    '<defs><radialGradient id="g1" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#176BEE" stop-opacity=".55"/><stop offset="1" stop-color="#176BEE" stop-opacity="0"/></radialGradient></defs>' +
    '<circle cx="300" cy="300" r="260" fill="url(#g1)"/>' +
    '<g fill="none" stroke="#9cc3ff" stroke-opacity=".35">' +
      '<circle cx="300" cy="300" r="120"/><circle cx="300" cy="300" r="190" stroke-dasharray="4 8"/><circle cx="300" cy="300" r="250" stroke-opacity=".15"/>' +
    '</g>' +
    '<g class="orbit-spin"><circle cx="490" cy="300" r="6" fill="#EAF3FF"/><circle cx="110" cy="300" r="4" fill="#9cc3ff"/></g>' +
    '<g class="orbit-spin-slow"><circle cx="300" cy="180" r="5" fill="#F2B544"/></g>' +
    '<rect x="245" y="245" width="110" height="110" rx="26" fill="#073B85" stroke="#9cc3ff" stroke-opacity=".6"/>' +
    '<path d="M275 320v-22M295 320v-40M315 320v-30M335 320v-48" stroke="#EAF3FF" stroke-width="7" stroke-linecap="round"/>' +
  '</svg>';
}

/* ---------- Scene 2: Student dashboard ---------- */
function renderDashboard(s) {
  const comp = COMPETENCIES.map((c) =>
    '<li class="comp-row">' +
      '<div class="comp-meta"><span class="comp-name">' + c.name + '</span><span class="tag tag-' + c.aiTone + '">AI: ' + c.ai + '</span></div>' +
      '<div class="bar" role="img" aria-label="' + c.name + ' ' + c.actual + ' percent"><span style="width:' + c.actual + '%"></span></div>' +
      '<span class="comp-val">' + c.actual + '%</span>' +
    '</li>').join('');

  let inspect = '';
  if (ui.loading === 'inspect') {
    inspect = loader('Retrieving advice details and data sources\u2026');
  } else if (s.inspected) {
    inspect = '<div class="inspect-panel" tabindex="-1" id="inspect-panel">' +
      '<h3>' + icon('eye') + ' Behind this advice</h3>' +
      '<div class="inspect-grid">' +
        '<div><h4>Data used</h4><ul class="plain-list">' +
          '<li>' + icon('alert', 'amber') + ' Grade export: last synced 30 Jul 2030 <strong>(41 days old)</strong></li>' +
          '<li>' + icon('alert', 'amber') + ' Rubric categories: migrated to the new LMS in Aug 2030</li>' +
          '<li>' + icon('alert', 'amber') + ' Workshop attendance: 96% for Manage &amp; Control (weighted 40%)</li>' +
          '<li>' + icon('database') + ' Peer-feedback sentiment (beta): \u201cpositive\u201d</li>' +
        '</ul></div>' +
        '<div><h4>Warning signs</h4><ul class="plain-list">' +
          '<li>' + icon('alert', 'amber') + ' 58% is labelled \u201cStrong\u201d, while 84% is a \u201cFocus area\u201d</li>' +
          '<li>' + icon('alert', 'amber') + ' \u201c91% confidence\u201d is shown without saying what it means</li>' +
          '<li>' + icon('alert', 'amber') + ' Advice suggests skipping the optional M&amp;C clinic</li>' +
          '<li>' + icon('alert', 'amber') + ' The challenge option is hidden in settings</li>' +
        '</ul></div>' +
      '</div>' +
      '<p class="story-note">' + icon('user') + ' In this timeline Noor trusts the school\u2019s dashboard and follows the advice. Continue to see what happens.</p>' +
    '</div>';
  } else {
    inspect = '<button class="btn btn-outline btn-sm" data-action="inspect">' + icon('eye') + ' Inspect advice &amp; data</button>';
  }

  return '<section class="scene" aria-labelledby="h-dashboard">' +
    sceneHeader('dashboard', SCENES[1].chapter + ' \u00b7 ' + CASE.adviceDate, 'The Student Dashboard', 'You are looking over the shoulder of Noor Visser, a fictional second-year HBO-ICT student. Explore her dashboard. Something here is not right.') +
    '<div class="portal" role="region" aria-label="Simulated student dashboard (fictional)">' +
      '<div class="portal-bar">' +
        '<div class="portal-brand"><span class="portal-logo" aria-hidden="true">W</span><span>Mijn Studie \u00b7 Smart Student Dashboard</span><span class="tag tag-muted">Fictional 2030 portal</span></div>' +
        '<div class="portal-user">' + icon('user') + ' Noor V. \u00b7 ' + CASE.studentId + '</div>' +
      '</div>' +
      '<p class="portal-greeting">Goedemorgen, Noor. <span>Tuesday 10 September 2030 \u00b7 Week 2</span></p>' +
      '<div class="portal-grid">' +
        '<article class="card card-progress"><h2 class="card-title">' + icon('chart') + ' Study progress</h2>' +
          '<div class="ring-wrap">' + progressRing(41, 60) + '<div><p class="big-num">41 <small>/ 60 EC</small></p><p class="muted">Year 2 \u00b7 on schedule</p></div></div>' +
          '<ul class="comp-list" aria-label="Competency results with AI labels">' + comp + '</ul>' +
        '</article>' +
        '<article class="card card-ai"><div class="ai-head"><h2 class="card-title">' + icon('spark') + ' AI Study Advice</h2><span class="tag tag-blue">Confidence 91%</span></div>' +
          '<p class="ai-quote">\u201cGreat news: <strong>Manage &amp; Control</strong> is one of your strengths. Focus your energy on <strong>Analyseren</strong> and <strong>Adviseren</strong> this block to raise your overall profile.\u201d</p>' +
          '<p class="muted small">Generated ' + CASE.adviceDate + ' \u00b7 advice engine v4.2</p>' +
          inspect +
        '</article>' +
        '<article class="card"><h2 class="card-title">' + icon('calendar') + ' Today</h2><ul class="timetable">' +
          '<li><time>09:00</time><span>Studio Analyseren <small>C2.14</small></span></li>' +
          '<li class="is-cancelled"><time>11:30</time><span>SLB check-in <small>Cancelled, mentor unavailable</small></span></li>' +
          '<li><time>13:30</time><span>M&amp;C planning clinic <small>Optional \u00b7 <em class="amber-text">AI: skip, you\u2019re strong</em></small></span></li>' +
          '<li><time>15:00</time><span>Project team stand-up <small>Online</small></span></li>' +
        '</ul></article>' +
        '<article class="card"><h2 class="card-title">' + icon('clock') + ' Deadlines</h2><ul class="deadlines">' +
          '<li><span class="dl-days dl-urgent">4d</span><span>M&amp;C sprint plan &amp; risk log</span></li>' +
          '<li><span class="dl-days">6d</span><span>Peer review round 2</span></li>' +
          '<li><span class="dl-days">11d</span><span>Adviseren advisory report</span></li>' +
        '</ul></article>' +
        '<article class="card"><h2 class="card-title">' + icon('check') + ' Recommended actions</h2><ol class="actions-list">' +
          '<li>Book the Adviseren writing workshop</li>' +
          '<li>Deepen your Analyseren portfolio</li>' +
          '<li class="is-risky">Skip the optional M&amp;C clinic</li>' +
        '</ol><p class="muted small">Attendance this block: 96%</p></article>' +
        '<article class="card card-sources"><h2 class="card-title">' + icon('database') + ' Data sources</h2><ul class="sources">' +
          '<li><span>Grades (LMS export)</span><span class="tag tag-warn">Synced 41d ago</span></li>' +
          '<li><span>Rubric mapping</span><span class="tag tag-warn">Migrated Aug 2030</span></li>' +
          '<li><span>Attendance</span><span class="tag tag-ok">Live</span></li>' +
          '<li><span>Peer feedback sentiment</span><span class="tag tag-muted">Beta</span></li>' +
        '</ul></article>' +
      '</div>' +
    '</div>' +
    navBar(s) +
  '</section>';
}

function progressRing(value, total) {
  const r = 34, c = 2 * Math.PI * r, pct = value / total;
  return '<svg class="ring" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="' + r + '" class="ring-bg"/>' +
    '<circle cx="40" cy="40" r="' + r + '" class="ring-fg" stroke-dasharray="' + (c * pct).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 40 40)"/></svg>';
}

/* ---------- Scene 3: Time jump ---------- */
function renderTimejump(s) {
  const events = [
    ['Sep 2030', 'Advice followed', 'Noor spends her extra hours on Analyseren and Adviseren. She skips the M&C clinic.', 'neutral'],
    ['Oct 2030', 'Warning signs missed', 'Her mentor meeting is cancelled twice. No early-warning alert is triggered.', 'warn'],
    ['Nov 2030', 'Sprint review: 49%', 'Manage & Control sprint review is insufficient. A resit overlaps with project work.', 'bad'],
    ['Feb 2031', 'Study delay', 'The M&C learning outcome is deferred. Roughly one semester of delay (fictional).', 'bad']
  ];
  const tl = events.map((e, i) =>
    '<li class="tl-item tl-' + e[3] + '" style="--i:' + i + '"><span class="tl-dot" aria-hidden="true"></span><time>' + e[0] + '</time><h3>' + e[1] + '</h3><p>' + e[2] + '</p></li>').join('');
  return '<section class="scene" aria-labelledby="h-timejump">' +
    sceneHeader('timejump', SCENES[2].chapter + ' \u00b7 Five months later', 'Time Jump: February 2031', 'Five months pass. Here is what happened after Noor followed the advice.') +
    '<div class="timejump">' +
      '<ol class="timeline" aria-label="Timeline of events">' + tl + '</ol>' +
      '<div class="impact-grid">' +
        '<article class="card stat-card stat-bad"><p class="stat-label">Manage &amp; Control</p><p class="stat-num">58% \u2192 49%</p><p class="muted small">Sprint review, Nov 2030</p></article>' +
        '<article class="card stat-card"><p class="stat-label">Analyseren / Adviseren</p><p class="stat-num">72 / 84 \u2192 76 / 86</p><p class="muted small">Small gains where she was already strong</p></article>' +
        '<article class="card stat-card stat-bad"><p class="stat-label">Study progress</p><p class="stat-num">~1 semester</p><p class="muted small">Deferred learning outcome</p></article>' +
      '</div>' +
      '<article class="card causality"><h2 class="card-title">' + icon('scale') + ' Correlation, reliance and causal uncertainty</h2>' +
        '<div class="causal-grid">' +
          '<div><h3>What we know</h3><p>Noor relied on the advice. Her time shifted away from her weakest competency, which then declined.</p></div>' +
          '<div><h3>What correlates</h3><p>The advice and the delay line up in time. That alone does not prove the AI caused the whole delay.</p></div>' +
          '<div><h3>Other possible factors</h3><p>Two cancelled mentor meetings, no early-warning trigger, a resit overlapping project work, a part-time job.</p></div>' +
        '</div>' +
        '<p class="callout">' + icon('building') + ' Organisational shortcomings may matter as much as the model: mentor capacity, missing alerts and a hidden challenge route.</p>' +
      '</article>' +
    '</div>' +
    navBar(s) +
  '</section>';
}

/* ---------- Scene 4: AI failure ---------- */
function renderFailure(s) {
  const rows = COMPETENCIES.map((c) =>
    '<tr class="' + (c.mismatch ? 'is-mismatch' : '') + '"><th scope="row">' + c.name + '</th><td>' + c.actual + '%</td><td>' + c.truth + '</td>' +
    '<td><span class="tag tag-' + c.aiTone + '">' + c.ai + '</span></td>' +
    '<td>' + (c.mismatch ? '<span class="mismatch">' + icon('alert') + ' Mismatch</span>' : '<span class="match">' + icon('check') + ' Consistent</span>') + '</td></tr>').join('');

  let reasoning = '';
  if (ui.loading === 'reasoning') {
    reasoning = loader('Generating simulated explanation\u2026');
  } else if (s.reasoningViewed) {
    reasoning = '<article class="reasoning" id="reasoning-panel" tabindex="-1">' +
      '<p class="disclaimer">' + icon('alert') + ' Simulated output written for this scenario. It is <strong>not</strong> genuine model reasoning; real AI systems often cannot explain their outputs this cleanly.</p>' +
      '<pre class="code-block" aria-label="Simulated AI explanation">explain(advice_id=ADV-2030-09-0412)\n' +
      '  competency[M&amp;C] score_input   = 0.86  &lt;- rubric code MC-02 mapped to "portfolio_excellent" (migration v3)\n' +
      '  competency[M&amp;C] attendance    = 0.96  (weight 0.40)\n' +
      '  competency[M&amp;C] latest_grade  = missing (export 41 days old) -&gt; imputed from cohort mean\n' +
      '  competency[ADV] trend          = "flat" -&gt; flagged as growth area\n' +
      '  calibration                    = not applied to imputed values\n' +
      '  output: M&amp;C=STRONG, focus=[ANALYSEREN, ADVISEREN], confidence=0.91</pre>' +
      '<p class="small">Plain language: the system saw high attendance and a wrongly mapped rubric code, filled in a missing grade with an average, and treated stable high scores as \u201cnot growing\u201d.</p>' +
    '</article>';
  }

  const challenge = s.challenged
    ? '<article class="challenge-result" id="challenge-panel" tabindex="-1"><h3>' + icon('msg') + ' Challenge received</h3>' +
      '<dl class="kv"><dt>Route</dt><dd>Automated triage</dd><dt>Assigned to</dt><dd class="amber-text">No human assignee</dd><dt>Expected response</dt><dd>Not specified</dd><dt>Advice status</dt><dd>Still active</dd></dl>' +
      '<p class="small">An organisational gap: the system allowed a challenge but nobody was responsible for answering it.</p></article>'
    : '';

  return '<section class="scene" aria-labelledby="h-failure">' +
    sceneHeader('failure', SCENES[3].chapter, 'The AI Failure', 'Compare what Noor actually achieved with how the AI interpreted it.') +
    '<div class="alert-banner" role="note">' + icon('alert') + '<div><strong>Inverted advice detected.</strong> The weakest competency was labelled strong; the two strongest were labelled focus areas.</div></div>' +
    '<div class="table-wrap"><table class="compare"><caption class="sr-only">Actual results versus AI interpretation</caption>' +
      '<thead><tr><th scope="col">Competency</th><th scope="col">Actual result</th><th scope="col">What it means</th><th scope="col">AI interpretation</th><th scope="col">Check</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>' +
    '<div class="button-row">' +
      '<button class="btn btn-outline" data-action="reasoning" ' + (s.reasoningViewed ? 'aria-pressed="true"' : '') + '>' + icon('cpu') + ' View AI reasoning</button>' +
      '<button class="btn btn-outline" data-action="challenge" ' + (s.challenged ? 'disabled' : '') + '>' + icon('flag') + (s.challenged ? ' Advice challenged' : ' Challenge advice') + '</button>' +
      '<button class="btn btn-primary" data-action="next">Continue ' + icon('arrowR') + '</button>' +
    '</div>' +
    reasoning + challenge +
    navBar(s) +
  '</section>';
}

/* ---------- Scene 5: Complaint ---------- */
function renderComplaint(s) {
  if (s.complaint.submitted) {
    const reasons = s.complaint.reasons.map((id) => '<li>' + icon('check') + ' ' + byId(COMPLAINT_REASONS, id).label + '</li>').join('');
    return '<section class="scene" aria-labelledby="h-complaint">' +
      sceneHeader('complaint', SCENES[4].chapter, 'Complaint registered', 'Noor\u2019s formal complaint has been recorded and added to the crisis log.') +
      '<article class="card receipt">' +
        '<div class="receipt-head">' + icon('check', 'ok') + '<div><p class="receipt-ref">Reference CMP-2031-0417 (fictional)</p><p class="muted small">Received Feb 2031 \u00b7 forwarded to the student desk and incident team</p></div></div>' +
        '<h2>Reasons</h2><ul class="plain-list">' + reasons + '</ul>' +
        (s.complaint.comment ? '<h2>Comment</h2><blockquote class="comment">' + esc(s.complaint.comment) + '</blockquote>' : '') +
        '<p class="callout">' + icon('building') + ' Next, the perspective changes. You will respond to this complaint as Windesheim staff.</p>' +
      '</article>' +
      navBar(s) +
    '</section>';
  }
  const boxes = COMPLAINT_REASONS.map((r) =>
    '<label class="check"><input type="checkbox" name="reason" value="' + r.id + '" ' + (s.complaint.reasons.includes(r.id) ? 'checked' : '') + '><span>' + r.label + '</span></label>').join('');
  return '<section class="scene" aria-labelledby="h-complaint">' +
    sceneHeader('complaint', SCENES[4].chapter, 'Student Complaint', 'Help Noor file feedback about the advice. Choose at least one reason.') +
    '<form id="complaint-form" class="card form" novalidate>' +
      '<fieldset><legend>What went wrong? <span class="muted">(choose at least one)</span></legend>' +
        '<div class="check-grid">' + boxes + '</div>' +
        '<p id="reason-error" class="field-error" ' + (ui.complaintError ? '' : 'hidden') + '>' + icon('alert') + ' Please select at least one reason.</p>' +
      '</fieldset>' +
      '<label class="field"><span>Additional comment <span class="muted">(optional)</span></span>' +
        '<textarea id="complaint-comment" name="comment" rows="4" maxlength="600" placeholder="Describe what happened in your own words\u2026">' + esc(s.complaint.comment) + '</textarea></label>' +
      '<p class="muted small">Fictional form. Nothing is sent anywhere; it is stored only in this browser.</p>' +
      '<button type="submit" class="btn btn-primary">' + icon('msg') + ' Submit complaint</button>' +
    '</form>' +
    navBar(s) +
  '</section>';
}

/* ---------- Scene 6: Incident response ---------- */
function renderStakeholderTabs(s) {
  const keys = Object.keys(STAKEHOLDER_VIEWS);
  const tabs = keys.map((k) => {
    const v = STAKEHOLDER_VIEWS[k], sel = s.stakeholder === k;
    return '<button role="tab" id="tab-sh-' + k + '" aria-controls="panel-sh" aria-selected="' + sel + '" tabindex="' + (sel ? 0 : -1) + '" data-action="stakeholder" data-value="' + k + '">' + icon(v.icon) + ' ' + v.label + '</button>';
  }).join('');
  const v = STAKEHOLDER_VIEWS[s.stakeholder];
  return '<div class="tabs">' +
    '<div role="tablist" aria-label="Stakeholder viewpoints" class="tablist">' + tabs + '</div>' +
    '<div role="tabpanel" id="panel-sh" aria-labelledby="tab-sh-' + s.stakeholder + '" class="tabpanel" tabindex="0">' +
      '<h3>' + v.title + '</h3><ul class="plain-list">' + v.points.map((p) => '<li>' + icon('arrowR') + ' ' + p + '</li>').join('') + '</ul>' +
      '<p class="quote">' + v.quote + '</p>' +
    '</div></div>';
}

function renderDecisionRound(s) {
  const r = findRound(s.round);
  const chosenId = s.decisions[r.id];
  const roundTabs = DECISION_ROUNDS.map((rr, i) => {
    const available = i === 0 || !!s.decisions[DECISION_ROUNDS[i - 1].id];
    const done = !!s.decisions[rr.id];
    return '<button class="round-tab ' + (done ? 'is-done' : '') + '" data-action="round" data-value="' + rr.id + '" ' +
      (available ? '' : 'disabled') + ' aria-current="' + (s.round === rr.id ? 'step' : 'false') + '">' +
      '<span class="round-letter">' + rr.id + '</span><span>' + rr.title + '</span>' + (done ? icon('check') : '') + '</button>';
  }).join('');

  const cards = r.options.map((o) => {
    const chosen = chosenId === o.id;
    const locked = !!chosenId;
    return '<article class="option ' + (chosen ? 'is-chosen' : '') + (locked && !chosen ? ' is-locked' : '') + '">' +
      '<h4>' + o.title + '</h4><p class="small">' + o.summary + '</p>' +
      '<div class="proscons"><div><h5>' + icon('check', 'ok') + ' Benefits</h5><ul>' + o.benefits.map((b) => '<li>' + b + '</li>').join('') + '</ul></div>' +
      '<div><h5>' + icon('alert', 'amber') + ' Trade-offs</h5><ul>' + o.tradeoffs.map((b) => '<li>' + b + '</li>').join('') + '</ul></div></div>' +
      (chosen ? '<p class="chosen-label">' + icon('check') + ' Your decision</p>'
        : '<button class="btn ' + (locked ? 'btn-ghost' : 'btn-outline') + ' btn-sm" data-action="decide" data-value="' + r.id + ':' + o.id + '" ' + (locked ? 'disabled' : '') + '>' + (locked ? 'Locked' : 'Choose this option') + '</button>') +
    '</article>';
  }).join('');

  let consequence = '';
  if (chosenId) {
    const opt = findOption(r.id, chosenId);
    const idx = DECISION_ROUNDS.findIndex((x) => x.id === r.id);
    const next = DECISION_ROUNDS[idx + 1];
    const delayedShown = delayedActive(s, r.id);
    consequence = '<div class="consequence" id="consequence-' + r.id + '" tabindex="-1">' +
      '<div class="cons-block"><h4>' + icon('spark') + ' Immediate consequence</h4><p>' + opt.immediate + '</p>' + deltaChips(opt.delta) + '</div>' +
      (delayedShown
        ? '<div class="cons-block cons-delayed"><h4>' + icon('clock') + ' Delayed consequence</h4><p>' + opt.delayed.text + '</p>' + deltaChips(opt.delayed.delta) + '</div>'
        : '<div class="cons-block cons-pending"><h4>' + icon('clock') + ' Delayed consequence</h4><p class="small">Some effects only appear weeks later. They will land when you leave incident response, or you can reveal them now.</p><button class="btn btn-ghost btn-sm" data-action="reveal-delayed" data-value="' + r.id + '">Reveal delayed consequence</button></div>') +
      (next ? '<button class="btn btn-primary btn-sm" data-action="round" data-value="' + next.id + '">Go to round ' + next.id + ': ' + next.title + ' ' + icon('arrowR') + '</button>'
        : '<p class="small ok-text">' + icon('check') + ' All three rounds decided. Continue to the ELSA analysis.</p>') +
    '</div>';
  }

  return '<section class="decisions" aria-labelledby="h-decisions">' +
    '<h2 id="h-decisions" class="section-title">Decision rounds</h2>' +
    '<div class="round-tabs">' + roundTabs + '</div>' +
    '<div class="round-body">' +
      '<p class="round-q"><span class="round-letter">' + r.id + '</span> ' + r.question + '</p>' +
      '<p class="pressure">' + icon('alert', 'amber') + ' <strong>Institutional pressure:</strong> ' + r.pressure + '</p>' +
      '<div class="options">' + cards + '</div>' + consequence +
    '</div></section>';
}

function renderResponse(s) {
  return '<section class="scene" aria-labelledby="h-response">' +
    sceneHeader('response', SCENES[5].chapter + ' \u00b7 Perspective switch', 'Windesheim Incident Response', '') +
    '<div class="role-switch">' + icon('building') + '<div><strong>You are now Windesheim staff.</strong> As incident lead you must balance student safety, staff capacity and the institution\u2019s reputation. There is no perfect option.</div></div>' +
    '<div class="incident-stats">' +
      '<div class="istat"><span class="istat-num">1</span><span>Formal complaint</span></div>' +
      '<div class="istat"><span class="istat-num">3</span><span>Similar informal reports</span></div>' +
      '<div class="istat"><span class="istat-num">9,400</span><span>Students using AI advice*</span></div>' +
      '<div class="istat"><span class="istat-num">1:48</span><span>Mentor ratio*</span></div>' +
      '<div class="istat istat-warn"><span class="istat-num">6d</span><span>Until exam period</span></div>' +
    '</div>' +
    '<p class="tiny-note">* Fictional illustrative numbers.</p>' +
    renderStakeholderTabs(s) +
    '<div class="incident-grid">' +
      '<article class="panel"><h3>' + icon('msg') + ' Complaints</h3><ul class="plain-list small">' +
        '<li><strong>CMP-2031-0417</strong> \u00b7 Noor V. \u00b7 inverted advice, study delay</li>' +
        '<li>Informal \u00b7 Year 2 student \u00b7 \u201cRealiseren labelled strong?\u201d</li>' +
        '<li>Informal \u00b7 Year 3 student \u00b7 confidence score unclear</li>' +
        '<li>Mentor flag \u00b7 \u201cAdvice contradicts my assessment\u201d</li></ul></article>' +
      '<article class="panel"><h3>' + icon('user') + ' Stakeholders involved</h3><ul class="tags-list">' +
        ['Student (Noor)', 'Mentor / SLB', 'Examination board', 'Data protection officer', 'Data & IT team', 'AI vendor', 'Communications', 'Student council'].map((t) => '<li class="tag tag-muted">' + t + '</li>').join('') + '</ul></article>' +
      '<article class="panel panel-logs"><h3>' + icon('log') + ' System logs <span class="tag tag-muted">fictional</span></h3><pre class="code-block small">' +
        '2030-09-09 07:42:11 advice-engine INFO  run cohort=ICT-Y2 n=412\n' +
        '2030-09-09 07:42:13 feature-store WARN  grades_sync last_ok=2030-07-30 (41d)\n' +
        '2030-09-09 07:42:13 rubric-map    WARN  MC-02 -&gt; portfolio_excellent (v3)\n' +
        '2030-09-09 07:42:15 advice-engine INFO  S-*** M&amp;C=STRONG conf=0.91\n' +
        '2030-09-23 10:03:58 challenge-api INFO  ticket queued assignee=null\n' +
        '2031-02-03 14:20:07 complaints    INFO  CMP-2031-0417 received</pre></article>' +
      '<article class="panel"><h3>' + icon('lock') + ' Data access</h3><div class="table-wrap"><table class="mini"><thead><tr><th scope="col">Source</th><th scope="col">Used by AI</th><th scope="col">Access</th></tr></thead><tbody>' +
        '<tr><td>Grades (LMS)</td><td>Yes</td><td>Exam admin, AI pipeline</td></tr>' +
        '<tr><td>Rubric mapping</td><td>Yes</td><td>IT, vendor</td></tr>' +
        '<tr><td>Attendance</td><td>Yes (40%)</td><td>Mentors, AI pipeline</td></tr>' +
        '<tr><td>Peer sentiment</td><td>Beta</td><td>Vendor only</td></tr></tbody></table></div></article>' +
      '<article class="panel"><h3>' + icon('doc') + ' Relevant policy <span class="tag tag-muted">fictional</span></h3><ul class="plain-list small">' +
        '<li>AI Advice Guideline v2.1: advice is \u201cinformative only\u201d.</li>' +
        '<li>\u201cHigh-stakes advice\u201d is mentioned but not defined.</li>' +
        '<li>No response time for challenges to AI advice.</li>' +
        '<li>Impact assessment dated 2029, not updated after the LMS migration.</li></ul></article>' +
    '</div>' +
    renderDecisionRound(s) +
    navBar(s) +
  '</section>';
}

/* ---------- Scene 7: ELSA ---------- */
function renderElsa(s) {
  const keys = Object.keys(ELSA);
  const tabs = keys.map((k) => {
    const sel = s.elsaTab === k;
    return '<button role="tab" id="tab-elsa-' + k + '" aria-controls="panel-elsa" aria-selected="' + sel + '" tabindex="' + (sel ? 0 : -1) + '" data-action="elsa" data-value="' + k + '">' + icon(ELSA[k].icon) + ' ' + ELSA[k].label + '</button>';
  }).join('');
  const t = ELSA[s.elsaTab];
  const col = (title, ic, items) => '<div class="elsa-col"><h3>' + icon(ic) + ' ' + title + '</h3><ul>' + items.map((i) => '<li>' + i + '</li>').join('') + '</ul></div>';
  return '<section class="scene" aria-labelledby="h-elsa">' +
    sceneHeader('elsa', SCENES[6].chapter, 'ELSA Analysis', 'Ethical, Legal, Societal and Technological impacts for the student, the system and Windesheim.') +
    '<div class="tabs tabs-elsa">' +
      '<div role="tablist" aria-label="ELSA dimensions" class="tablist">' + tabs + '</div>' +
      '<div role="tabpanel" id="panel-elsa" aria-labelledby="tab-elsa-' + s.elsaTab + '" class="tabpanel" tabindex="0">' +
        '<p class="lens">' + t.lens + '</p>' +
        '<div class="elsa-grid">' + col('Student', 'user', t.student) + col('System', 'cpu', t.system) + col('Windesheim', 'building', t.windesheim) + '</div>' +
        '<p class="key-q">' + icon('spark') + ' <strong>Key question:</strong> ' + t.question + '</p>' +
        (s.elsaTab === 'legal' ? '<p class="disclaimer small">' + icon('alert') + ' Educational exploration only, not legal advice. Whether any specific law applies depends on the facts and on expert legal review.</p>' : '') +
      '</div></div>' +
    navBar(s) +
  '</section>';
}

/* ---------- Scene 8: Moral boundary ---------- */
function renderBoundary(s) {
  const opts = BOUNDARY_OPTIONS.map((o) => {
    const sel = s.boundary === o.id;
    return '<button class="boundary-opt ' + (sel ? 'is-selected' : '') + '" role="radio" aria-checked="' + sel + '" tabindex="' + (sel || (!s.boundary && o.id === 'no') ? 0 : -1) + '" data-action="boundary" data-value="' + o.id + '">' +
      '<span class="radio-dot" aria-hidden="true"></span><span class="bo-text"><strong>' + o.title + '</strong><span class="tag ' + (o.id === 'no' ? 'tag-blue' : 'tag-muted') + '">' + o.tag + '</span></span></button>';
  }).join('');
  const chosen = s.boundary ? byId(BOUNDARY_OPTIONS, s.boundary) : null;
  return '<section class="scene" aria-labelledby="h-boundary">' +
    sceneHeader('boundary', SCENES[7].chapter, 'The Moral Boundary', '') +
    '<blockquote class="big-question">Is AI ever allowed to make a high-stakes decision about student progress <em>without human oversight?</em></blockquote>' +
    '<div class="boundary-opts" role="radiogroup" aria-label="Your position">' + opts + '</div>' +
    (chosen ? '<div class="reflection" id="reflection" tabindex="-1"><h3>' + icon('spark') + ' Reflection on your position</h3><p>' + chosen.reflection + '</p>' + deltaChips(chosen.delta) + '</div>' : '') +
    '<div class="ethics-grid">' +
      '<article class="card"><h2 class="card-title">' + icon('chart') + ' Consequentialism</h2><p class="small muted">Judge by outcomes: which option produces the least harm overall?</p><ul class="plain-list small">' +
        '<li>Harms: study delay, financial cost, stress, and errors repeated at scale for thousands of students.</li>' +
        '<li>Benefits of automation: speed, consistency, mentors freed for complex cases.</li>' +
        '<li>Rare but severe errors in high-stakes decisions can outweigh average efficiency gains.</li></ul></article>' +
      '<article class="card"><h2 class="card-title">' + icon('scale') + ' Deontology</h2><p class="small muted">Judge by duties: what do we owe each student, regardless of outcome?</p><ul class="plain-list small">' +
        '<li>Duty to treat each student fairly, as an individual rather than a proxy profile.</li>' +
        '<li>Duty to explain: students are owed reasons they can understand and contest.</li>' +
        '<li>Duty to safeguard autonomy and to keep someone accountable, which software cannot be.</li></ul></article>' +
      '<article class="card"><h2 class="card-title">' + icon('alert', 'amber') + ' Trade-offs of the boundary</h2><ul class="plain-list small">' +
        '<li>Human review costs time and capacity, especially at peak moments.</li>' +
        '<li>Humans are biased too; oversight can become rubber-stamping.</li>' +
        '<li>\u201cHigh-stakes\u201d must be defined clearly or the boundary is meaningless.</li></ul></article>' +
    '</div>' +
    '<p class="callout">' + icon('shield') + ' <strong>Proposed boundary:</strong> No. AI may inform, but a responsible human must review, be able to override and be answerable for decisions that affect study progress.</p>' +
    navBar(s) +
  '</section>';
}

/* ---------- Scene 9: Aftercare ---------- */
function renderAftercare(s) {
  const cards = AFTERCARE.map((a) => {
    const on = s.aftercare.includes(a.id);
    return '<button class="care-card ' + (on ? 'is-on' : '') + '" aria-pressed="' + on + '" data-action="care" data-value="' + a.id + '">' +
      '<span class="care-top">' + icon(a.icon) + '<strong>' + a.title + '</strong><span class="care-week">wk ' + a.week + '</span></span>' +
      '<span class="small">' + a.text + '</span>' +
      '<span class="care-state">' + (on ? icon('check') + ' Active' : 'Add to plan') + '</span></button>';
  }).join('');
  const m = computeMetrics(s, { skipRedesign: true });
  const over = m.workload >= 85;
  return '<section class="scene" aria-labelledby="h-aftercare">' +
    sceneHeader('aftercare', SCENES[8].chapter, 'Aftercare & Recovery', 'Build a recovery plan. Each action costs staff capacity and changes trust over time. Toggle actions on or off.') +
    '<div class="aftercare-layout">' +
      '<div class="care-grid">' + cards + '</div>' +
      '<aside class="card care-side" aria-label="Recovery outlook">' +
        '<h2 class="card-title">' + icon('chart') + ' Trust over 12 weeks</h2>' + trustChart(s) +
        '<p class="tiny-note">Fictional illustrative projection.</p>' +
        '<div class="capacity ' + (over ? 'is-over' : '') + '"><div class="cap-top"><span>Staff workload</span><strong>' + m.workload + '/100</strong></div><div class="bar bar-amber" aria-hidden="true"><span style="width:' + m.workload + '%"></span></div>' +
        (over ? '<p class="small red-text">' + icon('alert') + ' Capacity exceeded: some actions will be delayed or done superficially.</p>' : '<p class="small muted">' + s.aftercare.length + ' of ' + AFTERCARE.length + ' actions active.</p>') + '</div>' +
        (!s.aftercare.includes('communication') ? '<p class="small amber-text">' + icon('alert') + ' Without honest communication, trust erodes while you work in silence.</p>' : '') +
      '</aside>' +
    '</div>' +
    navBar(s) +
  '</section>';
}

/** SVG line chart comparing selected aftercare with doing nothing. */
function trustChart(s) {
  const t0 = computeMetrics(s, { skipAftercare: true, skipRedesign: true }).trust;
  const weeks = [0, 2, 4, 8, 12];
  const hasComm = s.aftercare.includes('communication');
  const none = weeks.map((w) => clamp(t0 - w * 0.8));
  const plan = weeks.map((w) => {
    let v = t0;
    s.aftercare.forEach((id) => { const a = byId(AFTERCARE, id); if (w >= a.week) v += a.delta.trust || 0; });
    if (!hasComm) v -= w * 0.5;
    return clamp(v);
  });
  const W = 300, H = 150, pad = 26;
  const x = (i) => pad + (i * (W - pad * 2)) / (weeks.length - 1);
  const y = (v) => H - pad - (v / 100) * (H - pad * 2);
  const path = (arr) => arr.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  const grid = [0, 50, 100].map((v) => '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + y(v) + '" y2="' + y(v) + '" class="grid"/><text x="4" y="' + (y(v) + 4) + '" class="axis">' + v + '</text>').join('');
  const labels = weeks.map((w, i) => '<text x="' + x(i) + '" y="' + (H - 6) + '" class="axis" text-anchor="middle">w' + w + '</text>').join('');
  const desc = 'Trust with your plan goes from ' + plan[0] + ' to ' + plan[plan.length - 1] + '. Without aftercare it would go from ' + none[0] + ' to ' + none[none.length - 1] + '.';
  return '<svg class="trust-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + desc + '">' + grid + labels +
    '<path d="' + path(none) + '" class="line-none"/><path d="' + path(plan) + '" class="line-plan"/>' +
    plan.map((v, i) => '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3" class="pt-plan"/>').join('') +
    '</svg><div class="legend"><span><i class="lg-plan"></i>Your plan (' + plan[plan.length - 1] + ')</span><span><i class="lg-none"></i>No aftercare (' + none[none.length - 1] + ')</span></div>';
}

/* ---------- Scene 10: Redesign ---------- */
function renderRedesign(s) {
  const full = s.redesign.length >= 3;
  const cards = INTERVENTIONS.map((iv) => {
    const on = s.redesign.includes(iv.id);
    const disabled = !on && full;
    return '<button class="iv-card ' + (on ? 'is-on' : '') + '" aria-pressed="' + on + '" data-action="iv" data-value="' + iv.id + '" ' + (disabled ? 'aria-disabled="true"' : '') + '>' +
      '<span class="iv-top">' + icon(iv.icon) + '<strong>' + iv.title + '</strong></span>' +
      '<span class="small">' + iv.why + '</span>' +
      '<span class="ratings">' + ratingDots(iv.safety, 'Safety') + ratingDots(iv.autonomy, 'Autonomy') + ratingDots(iv.feasibility, 'Feasibility') + '</span>' +
      '<span class="care-state">' + (on ? icon('check') + ' Selected' : (disabled ? 'Deselect one first' : 'Select')) + '</span></button>';
  }).join('');

  const ranked = s.redesign.map((id, i) => {
    const iv = byId(INTERVENTIONS, id);
    return '<li class="rank-item"><span class="rank-num">' + (i + 1) + '</span><span class="rank-title">' + iv.title + '<small>Safety ' + iv.safety + ' \u00b7 Autonomy ' + iv.autonomy + ' \u00b7 Feasibility ' + iv.feasibility + '</small></span>' +
      '<span class="rank-btns"><button class="icon-btn" data-action="rank-up" data-value="' + id + '" aria-label="Move ' + iv.title + ' up" ' + (i === 0 ? 'disabled' : '') + '>' + icon('up') + '</button>' +
      '<button class="icon-btn" data-action="rank-down" data-value="' + id + '" aria-label="Move ' + iv.title + ' down" ' + (i === s.redesign.length - 1 ? 'disabled' : '') + '>' + icon('down') + '</button></span></li>';
  }).join('');

  let explanation = '';
  if (s.redesign.length === 3) {
    const suggested = s.redesign.slice().sort((a, b) => priorityScore(byId(INTERVENTIONS, b)) - priorityScore(byId(INTERVENTIONS, a)));
    const same = suggested.join() === s.redesign.join();
    const top = byId(INTERVENTIONS, s.redesign[0]);
    explanation = '<div class="explain-box"><h3>' + icon('spark') + ' Why this order?</h3>' +
      '<p class="small">Your first priority, <strong>' + top.title.toLowerCase() + '</strong>, scores ' + top.safety + '/5 on student safety. ' +
      (same ? 'Your order matches a safety-first weighting (safety 50%, autonomy 30%, feasibility 20%).'
        : 'A safety-first weighting (safety 50%, autonomy 30%, feasibility 20%) would suggest: ' + suggested.map((id, i) => (i + 1) + '. ' + byId(INTERVENTIONS, id).title).join('; ') + '. Your order is valid too if you can argue why.') + '</p></div>';
  }

  return '<section class="scene" aria-labelledby="h-redesign">' +
    sceneHeader('redesign', SCENES[9].chapter, 'Final Redesign Decision', 'Select exactly three interventions for the relaunch, then rank them by priority.') +
    '<p class="counter" aria-live="polite"><strong>' + s.redesign.length + ' / 3</strong> selected</p>' +
    '<div class="iv-grid">' + cards + '</div>' +
    (s.redesign.length ? '<section class="card rank-box" aria-labelledby="h-rank"><h2 id="h-rank" class="card-title">' + icon('log') + ' Your priority order</h2><ol class="rank-list">' + ranked + '</ol>' + explanation + '</section>' : '') +
    navBar(s) +
  '</section>';
}

/* ---------- Scene 11: End ---------- */
function renderEnd(s) {
  const key = getEnding(s);
  const e = ENDINGS[key];
  const m = computeMetrics(s);
  const decisions = DECISION_ROUNDS.map((r) => {
    const o = findOption(r.id, s.decisions[r.id]);
    return '<li><strong>' + r.id + ' \u00b7 ' + r.title + ':</strong> ' + (o ? o.title : '<em>not decided</em>') + (o ? '<br><span class="small muted">' + o.delayed.text + '</span>' : '') + '</li>';
  }).join('');
  const redesign = s.redesign.length
    ? s.redesign.map((id) => '<li>' + byId(INTERVENTIONS, id).title + '</li>').join('')
    : '<li><em>No interventions selected</em></li>';
  const conditions = LAUNCH_CONDITIONS.map((c) => {
    const met = c.met(s);
    return '<li class="' + (met ? 'is-met' : 'is-open') + '">' + icon(met ? 'check' : 'x') + ' ' + c.text + ' <span class="sr-only">' + (met ? '(met)' : '(not yet met)') + '</span></li>';
  }).join('');
  const care = s.aftercare.length ? s.aftercare.map((id) => byId(AFTERCARE, id).title).join(', ') : 'none';
  const boundary = s.boundary ? byId(BOUNDARY_OPTIONS, s.boundary).title : 'not set';
  const archiveNote = s.archive.choice
    ? '<div class="archive-note"><h3>' + icon('power') + ' Archive 2048</h3><p class="small">' + byId(ARCHIVE.options, s.archive.choice).outcome + '</p></div>'
    : '';
  const ach = s.achievements.length
    ? '<div class="achievements">' + s.achievements.map((a) => '<span class="achievement">' + icon('trophy') + ' ' + a + '</span>').join('') + '</div>'
    : '';
  const others = Object.keys(ENDINGS).filter((k) => k !== key).map((k) => ENDINGS[k].title).join(' and ');

  return '<section class="scene scene-end" aria-labelledby="h-end">' +
    '<div class="end-hero end-' + e.tone + '">' +
      '<p class="eyebrow eyebrow-light">Epilogue \u00b7 Your outcome</p>' +
      '<h1 id="h-end" class="scene-title" tabindex="-1">' + e.title + '</h1>' +
      '<span class="tag tag-light">' + e.tag + '</span>' +
      '<p class="end-text">' + e.text + '</p>' +
      (m.workload >= 85 ? '<p class="end-text small">' + icon('alert') + ' Staff workload ended at ' + m.workload + '/100. Strong protection has a real capacity cost; without extra staff or funding, these safeguards risk becoming rushed checks.</p>' : '') +
      ach +
      '<div class="button-row">' +
        '<button class="btn btn-light" data-action="print">' + icon('print') + ' Print / save report</button>' +
        '<button class="btn btn-glass" data-action="restart">' + icon('refresh') + ' Restart simulation</button>' +
      '</div>' +
      '<p class="small end-alt">Other possible endings: ' + others + '. Different choices lead there.</p>' +
    '</div>' +

    '<article id="report" class="report" aria-labelledby="report-title">' +
      '<header class="report-head"><div><p class="eyebrow">Ethical summary report \u00b7 fictional simulation</p><h2 id="report-title">Smart Student Dashboard: When AI Gets It Wrong</h2></div>' +
        '<div class="report-outcome"><span>Outcome</span><strong>' + e.title + '</strong></div></header>' +
      '<div class="report-metrics">' + METRIC_KEYS.map((k) => '<div><span>' + METRIC_LABELS[k] + '</span><strong>' + m[k] + '</strong></div>').join('') + '</div>' +
      '<p class="tiny-note">Indicators are fictional illustrative simulation values, not empirical research.</p>' +
      '<div class="report-grid">' +
        '<section><h3>Incident</h3><p class="small">AI labelled a fictional student\u2019s weakest competency (Manage &amp; Control, 58%) as strong and advised focusing on Analyseren (72%) and Adviseren (84%). Reliance on the advice is associated with a study delay; other organisational factors also contributed.</p></section>' +
        '<section><h3>Stakeholders</h3><p class="small">Student, mentor/SLB, examination board, data protection officer, data &amp; IT team, AI vendor, communications, student council.</p></section>' +
        '<section><h3>Decisions &amp; consequences</h3><ul class="small">' + decisions + '</ul></section>' +
        '<section><h3>Moral boundary</h3><p class="small">' + boundary + '.</p><h3>Aftercare</h3><p class="small">' + care + '.</p></section>' +
        '<section><h3>Selected improvements (priority order)</h3><ol class="small">' + redesign + '</ol></section>' +
        '<section><h3>Unresolved uncertainty</h3><ul class="small">' + UNRESOLVED.map((u) => '<li>' + u + '</li>').join('') + '</ul></section>' +
        '<section class="span-2"><h3>Conditions for responsible launch</h3><ul class="conditions small">' + conditions + '</ul></section>' +
      '</div>' + archiveNote +
      '<footer class="report-foot">AI provides insight. You decide the direction. \u00b7 Speculative fiction for Windesheim UX Research &amp; Innovation DP6. Not a description of any real system.</footer>' +
    '</article>' +
    '<nav class="scene-nav" aria-label="Scene navigation"><button class="btn btn-ghost" data-action="back">' + icon('arrowL') + ' Back</button><span></span><span></span></nav>' +
  '</section>';
}

/* ---------- Hidden: SYSTEM ARCHIVE // 2048 ---------- */
function renderArchive(s) {
  const choice = s.archive.choice ? byId(ARCHIVE.options, s.archive.choice) : null;
  const opts = ARCHIVE.options.map((o) =>
    '<button class="arch-opt ' + (s.archive.choice === o.id ? 'is-selected' : '') + '" data-action="archive-choose" data-value="' + o.id + '" ' + (s.archive.choice ? 'disabled' : '') + '>' +
      icon(o.id === 'shutdown' ? 'power' : o.id === 'sandbox' ? 'lock' : 'cpu') + '<span>' + o.title + '</span></button>').join('');
  return '<section class="scene scene-archive" aria-labelledby="h-archive">' +
    '<p class="arch-kicker">// hidden scenario unlocked</p>' +
    '<h1 id="h-archive" class="arch-title" tabindex="-1">' + ARCHIVE.title + '</h1>' +
    '<p class="arch-intro">' + ARCHIVE.intro + '</p>' +
    '<pre class="arch-logs" aria-label="Archive system logs">' + ARCHIVE.logs.map(esc).join('\n') + '</pre>' +
    '<p class="arch-q">The AI refused a human-approved correction and disabled human review. Do you shut down autonomous advice and restore human control?</p>' +
    '<div class="arch-opts">' + opts + '</div>' +
    (choice ? '<div class="arch-outcome" id="arch-outcome" tabindex="-1"><h2>' + (choice.achievement ? 'Secret achievement unlocked: Human Override Protocol' : 'Outcome') + '</h2><p>' + choice.outcome + '</p>' +
      (choice.achievement ? '<p class="arch-badge">' + icon('trophy') + ' HUMAN OVERRIDE PROTOCOL</p>' : '') + '</div>' : '') +
    '<div class="button-row">' +
      '<button class="btn btn-arch" data-action="archive-close">' + icon('arrowL') + ' Return to simulation</button>' +
      (s.archive.choice ? '<button class="btn btn-arch-ghost" data-action="archive-retry">Replay archive choice</button>' : '') +
    '</div>' +
    '<p class="arch-fine">Fictional speculative scenario. No real system, institution policy or date is implied.</p>' +
  '</section>';
}

const RENDERERS = {
  intro: renderIntro, dashboard: renderDashboard, timejump: renderTimejump, failure: renderFailure,
  complaint: renderComplaint, response: renderResponse, elsa: renderElsa, boundary: renderBoundary,
  aftercare: renderAftercare, redesign: renderRedesign, end: renderEnd
};

/* ============================================================
   7. SHELL RENDERERS
   ============================================================ */

function renderSteps(s) {
  const list = $('#steps');
  if (!list) return;
  list.innerHTML = SCENES.map((sc, i) => {
    const reachable = i <= s.maxReached || s.presenter;
    const current = i === s.scene && !s.archive.open;
    return '<li><button class="step ' + (current ? 'is-current' : '') + (i <= s.maxReached ? ' is-visited' : '') + '" data-action="goto" data-value="' + i + '" ' +
      (reachable ? '' : 'disabled') + ' aria-current="' + (current ? 'step' : 'false') + '" aria-label="Chapter ' + (i + 1) + ': ' + sc.label + (reachable ? '' : ' (locked)') + '">' +
      '<span class="step-num">' + (i + 1) + '</span><span class="step-label">' + sc.label + '</span></button></li>';
  }).join('');
  const cur = $('.step.is-current', list);
  const nav = list.parentElement;
  if (cur && nav && nav.scrollWidth > nav.clientWidth) {
    nav.scrollLeft = Math.max(0, cur.offsetLeft - nav.clientWidth / 2 + cur.offsetWidth / 2);
  }
  const fill = $('#progress-fill');
  if (fill) fill.style.width = ((s.scene / (SCENES.length - 1)) * 100).toFixed(1) + '%';
  const pb = $('#progress-bar');
  if (pb) {
    pb.setAttribute('aria-valuenow', String(s.scene + 1));
    pb.setAttribute('aria-valuetext', 'Chapter ' + (s.scene + 1) + ' of ' + SCENES.length + ': ' + SCENES[s.scene].label);
  }
  const label = $('#step-label');
  if (label) label.textContent = s.archive.open ? 'SYSTEM ARCHIVE // 2048' : SCENES[s.scene].chapter + ' \u00b7 ' + SCENES[s.scene].label + ' (' + (s.scene + 1) + '/' + SCENES.length + ')';
}

function renderMetrics(s) {
  const panel = $('#metrics-panel');
  if (!panel) return;
  const show = s.scene > 0 && !s.archive.open;
  panel.hidden = !show;
  document.body.classList.toggle('has-metrics', show);
  if (!show) { ui.prevMetrics = null; return; }
  const m = computeMetrics(s);
  const prev = ui.prevMetrics || m;
  const count = buildLog(s).length;
  panel.innerHTML = '<h2 class="panel-title">' + icon('chart') + ' Consequence dashboard</h2>' +
    '<p class="tiny-note">Fictional illustrative simulation indicators, not empirical research data.</p>' +
    '<div class="metrics">' + METRIC_KEYS.map((k) => {
      const v = m[k], d = v - prev[k];
      const good = POSITIVE_IS_GOOD[k] ? d > 0 : d < 0;
      const level = POSITIVE_IS_GOOD[k] ? (v >= 60 ? 'good' : v >= 40 ? 'warn' : 'bad') : (v <= 35 ? 'good' : v <= 60 ? 'warn' : 'bad');
      return '<div class="metric metric-' + level + '" role="group" aria-label="' + METRIC_LABELS[k] + ': ' + v + ' out of 100, ' + METRIC_HINT[k] + '">' +
        '<div class="metric-top"><span class="metric-name">' + METRIC_LABELS[k] + '</span><span class="metric-val">' +
        (d ? '<span class="metric-delta ' + (good ? 'up' : 'down') + '" aria-hidden="true">' + (d > 0 ? '+' : '') + d + '</span>' : '') + v + '</span></div>' +
        '<div class="metric-bar" aria-hidden="true"><span style="width:' + v + '%"></span></div>' +
        '<span class="metric-hint">' + METRIC_HINT[k] + '</span></div>';
    }).join('') + '</div>' +
    '<button class="btn btn-ghost btn-sm btn-block" data-action="open-log">' + icon('log') + ' Crisis log (' + count + ')</button>';
  ui.prevMetrics = m;
}

const LOG_KIND_LABEL = { event: 'Event', action: 'Student action', decision: 'Decision', consequence: 'Consequence', corrective: 'Corrective action' };

function renderLog(s) {
  const body = $('#log-body');
  const count = $('#log-count');
  const entries = buildLog(s);
  if (count) count.textContent = String(entries.length);
  if (!body) return;
  body.innerHTML = entries.length
    ? '<ol class="log-list">' + entries.map((e) => '<li class="log-' + e.kind + '"><span class="log-meta"><span class="log-kind">' + LOG_KIND_LABEL[e.kind] + '</span><span>' + esc(e.stamp) + '</span></span><p>' + esc(e.text) + '</p></li>').join('') + '</ol>'
    : '<p class="muted small">No events yet. Start the simulation to begin the log.</p>';
}

function renderPresenter(s) {
  const bar = $('#presenter-bar');
  const toggle = $('#presenter-toggle');
  if (toggle) toggle.setAttribute('aria-pressed', String(s.presenter));
  document.body.classList.toggle('presenter-on', s.presenter);
  if (!bar) return;
  bar.hidden = !s.presenter;
  if (!s.presenter) return;
  const sc = SCENES[s.scene];
  bar.innerHTML = '<span class="pres-badge">Presenter</span>' +
    '<p class="pres-point"><strong>' + (s.archive.open ? 'Archive' : sc.label) + ':</strong> ' + (s.archive.open ? 'Even an autonomous system must remain correctable by the people it serves.' : sc.teach) + '</p>' +
    '<label class="pres-jump"><span class="sr-only">Jump to scene</span><select id="presenter-jump">' +
      SCENES.map((x, i) => '<option value="' + i + '" ' + (i === s.scene ? 'selected' : '') + '>' + (i + 1) + '. ' + x.label + '</option>').join('') + '</select></label>';
}

/** Main render: rebuilds the current scene and shell from state. */
function render(opts) {
  const o = opts || {};
  const root = $('#scene-root');
  if (!root) return;

  // Remember focused control so keyboard users keep their place after a re-render.
  const active = document.activeElement;
  let focusKey = null;
  if (!o.focusHeading && active && active.dataset && active.dataset.action && root.contains(active)) {
    focusKey = { action: active.dataset.action, value: active.dataset.value || '' };
  }

  document.documentElement.style.setProperty('--speed', String(SPEEDS[state.speed] === 0 ? 0.001 : SPEEDS[state.speed]));
  const sceneId = SCENES[state.scene].id;
  document.body.dataset.scene = state.archive.open ? 'archive' : sceneId;
  root.innerHTML = state.archive.open ? renderArchive(state) : RENDERERS[sceneId](state);
  if (o.animate && state.speed !== 'instant') {
    root.classList.remove('scene-enter');
    void root.offsetWidth; // restart the CSS animation
    root.classList.add('scene-enter');
  }

  renderSteps(state);
  renderMetrics(state);
  renderLog(state);
  renderPresenter(state);
  const speedSel = $('#speed-select');
  if (speedSel) speedSel.value = state.speed;

  if (o.focusHeading) {
    const h = $('.scene-title, .intro-title, .arch-title', root);
    if (h) h.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() || state.speed === 'instant' ? 'auto' : 'smooth' });
  } else if (ui.pendingFocus) {
    const el = $(ui.pendingFocus, root);
    if (el) el.focus();
    ui.pendingFocus = null;
  } else if (focusKey) {
    const sel = '[data-action="' + focusKey.action + '"]' + (focusKey.value ? '[data-value="' + focusKey.value + '"]' : '');
    const el = $(sel, root);
    if (el && !el.disabled) el.focus();
  }
}

/* ============================================================
   8. EVENT HANDLING
   ============================================================ */

function goTo(index) {
  const i = Math.max(0, Math.min(SCENES.length - 1, index));
  state.archive.open = false;
  state.scene = i;
  state.maxReached = Math.max(state.maxReached, i);
  ui.complaintError = false;
  saveState();
  render({ focusHeading: true, animate: true });
  announce('Chapter ' + (i + 1) + ': ' + SCENES[i].label);
}

function tryNext() {
  const gate = state.presenter ? null : gateMessage(state);
  if (gate) {
    announce(gate);
    const msg = $('#gate-msg');
    if (msg) { msg.classList.remove('shake'); void msg.offsetWidth; msg.classList.add('shake'); }
    return;
  }
  if (state.scene < SCENES.length - 1) goTo(state.scene + 1);
}

function resetAll(skipConfirm) {
  if (!skipConfirm && !window.confirm('Reset the simulation? All choices and progress in this browser will be cleared.')) return;
  const keepArchive = false; // deterministic reset: archive unlock is cleared too
  state = initialState();
  if (keepArchive) state.archive.unlocked = true;
  ui.prevMetrics = null;
  ui.loading = null;
  ui.complaintError = false;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
  setLogOpen(false);
  render({ focusHeading: true, animate: true });
  showToast('Simulation reset.');
}

function setLogOpen(open) {
  ui.logOpen = open;
  const drawer = $('#crisis-log');
  const toggle = $('#log-toggle');
  const scrim = $('#scrim');
  if (!drawer) return;
  drawer.hidden = !open;
  if (scrim) scrim.hidden = !open;
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
  if (open) {
    renderLog(state);
    const close = $('#log-close');
    if (close) close.focus();
  } else if (toggle && drawer.contains(document.activeElement)) {
    toggle.focus();
  }
}

function unlockAchievement(name) {
  if (state.achievements.includes(name)) return;
  state.achievements.push(name);
  showToast('Achievement unlocked: ' + name, 'gold');
}

/** All click actions, keyed by data-action. */
const ACTIONS = {
  start: () => goTo(1),
  resume: () => goTo(state.maxReached),
  next: tryNext,
  back: () => goTo(state.scene - 1),
  goto: (v) => { const i = parseInt(v, 10); if (i <= state.maxReached || state.presenter) goTo(i); },
  restart: () => resetAll(false),
  print: () => window.print(),
  'open-log': () => setLogOpen(true),

  inspect: () => simulateProcessing('inspect', 1100, () => { state.inspected = true; }, '#inspect-panel'),
  reasoning: () => {
    if (state.reasoningViewed) { const p = $('#reasoning-panel'); if (p) p.focus(); return; }
    simulateProcessing('reasoning', 1500, () => { state.reasoningViewed = true; }, '#reasoning-panel');
  },
  challenge: () => {
    if (state.challenged) return;
    state.challenged = true;
    saveState();
    ui.pendingFocus = '#challenge-panel';
    render();
    announce('Challenge submitted. No human assignee.');
  },

  stakeholder: (v) => { if (STAKEHOLDER_VIEWS[v]) { state.stakeholder = v; saveState(); render(); } },
  elsa: (v) => { if (ELSA[v]) { state.elsaTab = v; saveState(); render(); } },

  round: (v) => {
    const i = DECISION_ROUNDS.findIndex((r) => r.id === v);
    if (i < 0) return;
    if (i > 0 && !state.decisions[DECISION_ROUNDS[i - 1].id]) return;
    state.round = v;
    saveState();
    ui.pendingFocus = '.round-q';
    render();
  },
  decide: (v) => {
    const parts = String(v).split(':');
    const roundId = parts[0], optId = parts[1];
    // Guard: a round can only be decided once, so its effects are never applied twice.
    if (!findOption(roundId, optId) || state.decisions[roundId]) return;
    state.decisions[roundId] = optId;
    saveState();
    ui.pendingFocus = '#consequence-' + roundId;
    render();
    announce('Decision recorded: ' + findOption(roundId, optId).title + '. ' + findOption(roundId, optId).immediate);
  },
  'reveal-delayed': (v) => {
    if (!state.decisions[v] || state.delayedSeen[v]) return;
    state.delayedSeen[v] = true;
    saveState();
    ui.pendingFocus = '#consequence-' + v;
    render();
    announce('Delayed consequence: ' + findOption(v, state.decisions[v]).delayed.text);
  },

  boundary: (v) => {
    if (!byId(BOUNDARY_OPTIONS, v)) return;
    state.boundary = v;
    saveState();
    render();
    announce('Position chosen: ' + byId(BOUNDARY_OPTIONS, v).title);
  },
  care: (v) => {
    if (!byId(AFTERCARE, v)) return;
    const i = state.aftercare.indexOf(v);
    if (i >= 0) state.aftercare.splice(i, 1); else state.aftercare.push(v);
    saveState();
    render();
    announce(byId(AFTERCARE, v).title + (i >= 0 ? ' removed from' : ' added to') + ' the plan.');
  },
  iv: (v) => {
    if (!byId(INTERVENTIONS, v)) return;
    const i = state.redesign.indexOf(v);
    if (i >= 0) state.redesign.splice(i, 1);
    else if (state.redesign.length < 3) state.redesign.push(v);
    else { announce('Three interventions already selected. Deselect one first.'); return; }
    saveState();
    render();
    announce(state.redesign.length + ' of 3 selected.');
  },
  'rank-up': (v) => moveRank(v, -1),
  'rank-down': (v) => moveRank(v, 1),

  'archive-choose': (v) => {
    const o = byId(ARCHIVE.options, v);
    if (!o || state.archive.choice) return;
    state.archive.choice = v;
    if (o.achievement) unlockAchievement('Human Override Protocol');
    saveState();
    ui.pendingFocus = '#arch-outcome';
    render();
  },
  'archive-retry': () => {
    state.archive.choice = null;
    state.achievements = state.achievements.filter((a) => a !== 'Human Override Protocol');
    saveState();
    render({ focusHeading: true });
  },
  'archive-close': () => {
    state.archive.open = false;
    saveState();
    render({ focusHeading: true, animate: true });
  }
};

function moveRank(id, dir) {
  const i = state.redesign.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= state.redesign.length) return;
  const tmp = state.redesign[i];
  state.redesign[i] = state.redesign[j];
  state.redesign[j] = tmp;
  saveState();
  ui.pendingFocus = '[data-action="' + (dir < 0 ? 'rank-up' : 'rank-down') + '"][data-value="' + id + '"]';
  render();
  // if the button became disabled, fall back to the other direction
  const el = document.activeElement;
  if (!el || el.disabled || el === document.body) {
    const alt = $('[data-value="' + id + '"][data-action="' + (dir < 0 ? 'rank-down' : 'rank-up') + '"]');
    if (alt) alt.focus();
  }
  announce(byId(INTERVENTIONS, id).title + ' moved to priority ' + (j + 1) + '.');
}

function onClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  if (el.disabled) return;
  const action = el.dataset.action;
  if (el.getAttribute('aria-disabled') === 'true' && action !== 'next') {
    if (action === 'iv') announce('Three interventions already selected. Deselect one first.');
    return;
  }
  const fn = ACTIONS[action];
  if (fn) { e.preventDefault(); fn(el.dataset.value); }
}

/** Arrow-key support for tablists and the boundary radio group. */
function onKeydown(e) {
  const tab = e.target.closest('[role="tab"], [role="radio"]');
  if (tab && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
    const group = tab.parentElement;
    const items = $$('[role="tab"], [role="radio"]', group);
    let i = items.indexOf(tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = (i + 1) % items.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = (i - 1 + items.length) % items.length;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = items.length - 1;
    e.preventDefault();
    const target = items[i];
    const fn = ACTIONS[target.dataset.action];
    if (fn) {
      fn(target.dataset.value);
      const again = $('[data-action="' + target.dataset.action + '"][data-value="' + target.dataset.value + '"]');
      if (again) again.focus();
    }
    return;
  }
  if (e.key === 'Escape' && ui.logOpen) { setLogOpen(false); return; }
  handleKaizen(e);
}

function onSubmit(e) {
  if (e.target.id !== 'complaint-form') return;
  e.preventDefault();
  if (state.complaint.submitted) return; // guard against double submit
  const reasons = $$('input[name="reason"]:checked', e.target).map((i) => i.value);
  const comment = ($('#complaint-comment') || { value: '' }).value.trim();
  if (!reasons.length) {
    ui.complaintError = true;
    state.complaint.comment = comment;
    render();
    const first = $('input[name="reason"]');
    if (first) first.focus();
    announce('Please select at least one reason.');
    return;
  }
  ui.complaintError = false;
  state.complaint = { reasons: reasons, comment: comment, submitted: true };
  saveState();
  render({ focusHeading: true });
  announce('Complaint registered and added to the crisis log.');
}

/** Keep complaint drafts in state while typing (no re-render, so focus is never lost). */
function onInput(e) {
  if (state.complaint.submitted) return;
  if (e.target.id === 'complaint-comment') { state.complaint.comment = e.target.value; saveState(); }
  if (e.target.name === 'reason') {
    state.complaint.reasons = $$('input[name="reason"]:checked').map((i) => i.value);
    if (state.complaint.reasons.length && ui.complaintError) {
      ui.complaintError = false;
      const err = $('#reason-error');
      if (err) err.hidden = true;
    }
    saveState();
  }
}

/* ============================================================
   9. EASTER EGG
   ============================================================ */

const KAIZEN = 'KAIZEN';

/** Blue star: exactly five clicks within a short window unlocks the archive. */
function onStarClick() {
  window.clearTimeout(ui.starTimer);
  ui.starClicks += 1;
  const star = $('#motto-star');
  if (star) star.dataset.charge = String(Math.min(ui.starClicks, 5));
  if (ui.starClicks === 5) {
    ui.starClicks = 0;
    if (star) star.dataset.charge = '0';
    openArchive();
    return;
  }
  ui.starTimer = window.setTimeout(() => {
    ui.starClicks = 0;
    if (star) star.dataset.charge = '0';
  }, 2500);
}

/** K-A-I-Z-E-N typed on the home page (ignored inside form fields). */
function handleKaizen(e) {
  if (state.scene !== 0 || state.archive.open) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
  if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1) return;
  ui.keyBuffer = (ui.keyBuffer + e.key.toUpperCase()).slice(-KAIZEN.length);
  if (ui.keyBuffer === KAIZEN) {
    ui.keyBuffer = '';
    openArchive();
  }
}

function openArchive() {
  const first = !state.archive.unlocked;
  state.archive.unlocked = true;
  state.archive.open = true;
  setLogOpen(false);
  saveState();
  render({ focusHeading: true, animate: true });
  showToast(first ? 'SYSTEM ARCHIVE // 2048 unlocked' : 'SYSTEM ARCHIVE // 2048', 'dark');
  announce('Hidden scenario opened: System Archive 2048.');
}

/* ============================================================
   10. INIT
   ============================================================ */

function init() {
  state = loadState();
  state.archive.open = false; // always start in the main story

  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('input', onInput);
  document.addEventListener('change', (e) => {
    if (e.target.id === 'presenter-jump') goTo(parseInt(e.target.value, 10));
    else onInput(e);
  });

  const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
  bind('presenter-toggle', () => {
    state.presenter = !state.presenter;
    saveState();
    render();
    showToast(state.presenter ? 'Presenter mode on: all chapters unlocked, teaching points shown.' : 'Presenter mode off.');
  });
  bind('log-toggle', () => setLogOpen(!ui.logOpen));
  bind('log-close', () => setLogOpen(false));
  bind('scrim', () => setLogOpen(false));
  bind('reset-btn', () => resetAll(false));
  bind('motto-star', onStarClick);
  bind('brand-home', () => goTo(0));

  const speed = document.getElementById('speed-select');
  if (speed) speed.addEventListener('change', () => {
    if (SPEEDS[speed.value] === undefined) return;
    state.speed = speed.value;
    saveState();
    showToast('Simulation speed: ' + speed.options[speed.selectedIndex].text);
    document.documentElement.style.setProperty('--speed', String(SPEEDS[state.speed] === 0 ? 0.001 : SPEEDS[state.speed]));
  });

  if (prefersReducedMotion() && state.speed === 'normal') document.documentElement.classList.add('reduced');

  render({ focusHeading: false, animate: true });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}

/* Expose pure logic for automated tests in Node; ignored by browsers. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCENES, DECISION_ROUNDS, BOUNDARY_OPTIONS, AFTERCARE, INTERVENTIONS, initialState, computeMetrics, buildLog, getEnding, gateMessage };
}
