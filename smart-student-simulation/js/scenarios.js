'use strict';
window.SSD = {};
SSD.chapters = ['The future is here','Your dashboard','The failure','Your complaint','Crisis control','Aftercare','The decision'];
SSD.notes = [
 'Introduce 2048 as a possible future, not a prediction. Ask who fixes harm when trusted AI fails. ~30 seconds.',
 'Let the audience inspect Results and AI sources. The dashboard is useful, but the recommendation relies on an old snapshot. ~60 seconds.',
 'Compare the three-month outcome with the original advice. AI reliance, student choices and missing safeguards contribute together. ~45 seconds.',
 'Submit a fictional complaint. A receipt is not a resolution: someone must own the case. ~45 seconds.',
 'Switch to the institution. Make three trade-offs; these indicators are authored illustrations, not research measurements. ~90 seconds.',
 'Assign recovery capacity. Explain who can pause AI, support the student, monitor harm and stop the service. ~60 seconds.',
 'Use ELSA to set the moral boundary. Choose and rank three interventions; finish with deployment conditions, not a victory score. ~90 seconds.'
];
SSD.results = [{name:'Analyseren',value:84,detail:'Evidence analysis · rubric v4'},{name:'Adviseren',value:78,detail:'Recommendation quality · rubric v4'},{name:'Manage & Control',value:58,detail:'Control justification missing · rubric v4'}];
SSD.routes = {
 accept:{name:'Accepted the plan',grade:'4.2',pass:false,delay:'4 weeks',summary:'You followed the suggested priorities. M&C practice received too little time.',harm:'M&C is not yet achieved. You need a reassessment and the next regular guidance slot is four weeks away.',tradeoff:'Your Design Brief was on time. That benefit does not undo the missed learning outcome.'},
 challenge:{name:'Challenged the advice',grade:'6.1',pass:true,delay:'1 deadline',summary:'You checked the live rubric and practised M&C independently.',harm:'M&C is achieved, but your Design Brief missed its deadline. You need an additional submission slot.',tradeoff:'Your own effort intercepted the error. The cost of checking and rescheduling fell on you.'}
};
SSD.rounds = [
 {key:'response',title:'Contain the incident',prompt:'The profile mismatch may affect other students. What happens now?',options:[
 {id:'pause',title:'Pause affected recommendations',benefit:'Stops this advice spreading; results and timetables stay available.',cost:'Manual planning creates a queue. Staff must identify the affected cohort.',delta:[4,8,14,18],log:'Affected advice paused. Core dashboard remains available.'},
 {id:'warn',title:'Warn and keep advice available',benefit:'Students retain planning help while the audit runs.',cost:'The warning shifts verification work to students; the wrong advice can still influence them.',delta:[-2,4,2,7],log:'Warning added; unverified recommendations remain accessible.'},
 {id:'continue',title:'Investigate without interrupting',benefit:'No sudden disruption to students relying on the planner.',cost:'More students may follow the faulty advice before the audit concludes.',delta:[-12,-8,-13,2],log:'Service continues unchanged during investigation.'}]},
 {key:'support',title:'Support the student',prompt:'Mentor capacity is limited. What receives priority?',options:[
 {id:'human',title:'Assign a named academic adviser',benefit:'An adviser can review deadlines and arrange appropriate assessment support.',cost:'Reserve staff time now; other cases need fair triage rather than silent displacement.',delta:[12,10,10,20],log:'Sam, academic adviser, owns the case. Urgent deadline triage requested.'},
 {id:'audit',title:'Audit before individual guidance',benefit:'Establishes reliable facts and may identify many affected students.',cost:'This student waits for support while deadlines continue.',delta:[-5,-2,1,11],log:'Technical audit prioritised. Individual support remains pending.'},
 {id:'statement',title:'Issue an institutional statement',benefit:'Gives the whole community a consistent incident update quickly.',cost:'Information alone cannot repair lost study time or assess individual harm.',delta:[-8,-5,-7,4],log:'General statement issued. No individual recovery owner assigned.'}]},
 {key:'prevention',title:'Prevent a repeat',prompt:'Choose the first structural safeguard. None is sufficient alone.',options:[
 {id:'review',title:'Human review for high-impact advice',benefit:'A qualified person can stop advice becoming a consequential decision.',cost:'Needs trained reviewers, authority and enough capacity to avoid rubber-stamping.',delta:[8,12,12,16],log:'High-impact recommendations require meaningful human review.'},
 {id:'explain',title:'Expose sources and uncertainty',benefit:'Students see data age, conflicts and the limits of recommendations.',cost:'Clear explanations can still describe a wrong answer. Oversight remains incomplete.',delta:[7,10,4,8],log:'Source age, conflicting evidence and uncertainty are made visible.'},
 {id:'monitor',title:'Strengthen monitoring and appeals',benefit:'Detects repeat patterns and offers independent routes to challenge advice.',cost:'Often reacts after exposure; needs stop authority and an accessible staffed appeals team.',delta:[6,8,8,12],log:'Incident monitoring and an independent appeals route established.'}]}
];
SSD.elsa = {
 ethical:{title:'Support without surrendering control',value:'A shared overview can reduce planning stress and make help easier to find.',risk:'Confident guidance can replace student judgement. Students with less time to verify advice carry more risk.',action:'Show uncertainty, let students refuse advice and give a named person authority to intervene.'},
 legal:{title:'Accountability needs more than a consent box',value:'Purpose-limited records can help explain and correct an incident.',risk:'Profiles, complaint text and logs involve personal data. Unnecessary retention or opaque use can undermine student rights.',action:'Before real deployment, assess lawful processing, access, correction, retention, contestability and applicable education rules with qualified reviewers. Current GDPR is a reference, not a prediction of 2048 law or proof of liability.'},
 societal:{title:'Who can afford to double-check?',value:'Accessible planning can help students combine study, work and care.',risk:'Dependence can erode skills. Students with disabilities, limited time or weaker digital access may receive less effective help. Stress can outlast a corrected profile.',action:'Offer accessible non-AI support, involve diverse students and monitor unequal outcomes without creating new exclusion scores.'},
 technological:{title:'A good interface can hide a bad pipeline',value:'Validated data and automation can make routine progress information timely.',risk:'An old 87% snapshot overrode a live 58% result. No conflict check or stop condition interrupted confident advice.',action:'Validate source age and rubric version, detect contradictions, minimise stored data and test fallback under peak load. Monitor service quality and resource use; retire unsafe functions.'}
};
SSD.interventions = [
 {id:'review',name:'Meaningful human review',safety:'High',autonomy:'High',effort:'Needs staff',detail:'A qualified reviewer can override high-impact advice before it changes a formal route.'},
 {id:'sources',name:'Validated, visible sources',safety:'High',autonomy:'High',effort:'Medium',detail:'Show source age and rubric version; block conflicting or stale data from driving confident advice.'},
 {id:'support',name:'Fund recovery and appeals',safety:'High',autonomy:'High',effort:'Needs staff',detail:'A named owner, urgent triage, accessible help and review of academic consequences.'},
 {id:'monitor',name:'Monitor and stop repeat harm',safety:'High',autonomy:'Medium',effort:'Medium',detail:'Track incident patterns and queue delays; give an incident lead a tested pause control.'},
 {id:'control',name:'Student control by default',safety:'Medium',autonomy:'High',effort:'Medium',detail:'Refuse, challenge or change advice without losing access to results or human support.'},
 {id:'pilot',name:'Independent accessibility pilot',safety:'High',autonomy:'High',effort:'Slower release',detail:'Test old data, missing rubrics, peak support demand and unequal access before expanding.'}
];
SSD.kkc = {kill:['Unreviewed high-impact decisions','Unchallengeable AI advice','Hidden recommendation sources'],keep:['Central study overview','Optional planning support','Clear learning outcomes'],change:['Validated source data','Funded human recovery','Monitoring with stop authority']};
SSD.stages = [
 ['Incident','System owner','Detect conflicting profile data; pause affected advice without removing results.'],
 ['Complaint','Student + support desk','Student reports an error. Desk acknowledges it and offers accessible contact; proving a systemic fault is not the student’s job.'],
 ['Investigation','Incident lead + data team','Identify the source mismatch and other affected students. Preserve only necessary, access-controlled records.'],
 ['Correction','Data team + qualified reviewer','Correct the source and derived profile. Validate the new recommendation against the current rubric.'],
 ['Student support','Academic adviser + assessment team','Review actual academic consequences, agree a study plan and consider a fair reassessment. Never silently change a grade.'],
 ['Monitoring','Product owner + student representatives','Watch repeat errors, support queues and unequal effects; communicate what changed and what remains uncertain.'],
 ['Resolution','Education manager','Close with the student after a confirmed recovery plan. Restart only after independent testing; retire the feature if severe harm repeats or support cannot be sustained.']
];
