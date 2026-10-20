'use strict';
SSD.option = (round,id) => SSD.rounds.find(r=>r.key===round)?.options.find(o=>o.id===id);
SSD.metrics = state => {
 const values = state.student==='challenge'?[48,64,52,24]:[36,38,40,24];
 for(const r of SSD.rounds){const o=SSD.option(r.key,state.decisions[r.key]);if(o)o.delta.forEach((v,i)=>values[i]+=v);}
 if(state.aftercare==='fund') [8,6,10,17].forEach((v,i)=>values[i]+=v);
 if(state.aftercare==='patch') [-4,-3,0,5].forEach((v,i)=>values[i]+=v);
 return values.map(v=>Math.max(0,Math.min(100,v)));
};
SSD.ending = state => {
 const d=state.decisions;
 if(!state.student || state.case?.status!=='investigating' || SSD.rounds.some(r=>!d[r.key]) || !state.aftercare)return {name:'Unfinished case',type:'neutral',text:'Complete the student choice, complaint handoff, three response rounds and an aftercare decision to see an ending.'};
 if(d.response==='pause'&&d.support==='human'&&d.prevention==='review'&&state.aftercare==='fund')return {name:'Responsible Recovery',type:'good',text:'Harm is contained, a person owns recovery and high-impact advice has meaningful review. This is a recovery pathway, not proof that deployment is safe.'};
 if((d.response==='continue'&&d.support!=='human')||(d.support==='statement'&&state.aftercare==='patch'))return {name:'Systemic Failure',type:'bad',text:'Communication or technical repair substituted for individual recovery. Structural exposure remains and unresolved complaints accumulate.'};
 return {name:'Fragile Trust',type:'warn',text:'Some protections improved, but gaps remain in containment, individual support, oversight or recovery capacity. Trust cannot be restored by a patch alone.'};
};
SSD.gaps = state => {
 const out=[];
 if(state.decisions.response!=='pause')out.push('Contain affected advice before more students rely on it.');
 if(state.decisions.support!=='human')out.push('Give each affected student a named adviser and urgent deadline triage.');
 if(state.decisions.prevention!=='review')out.push('Establish meaningful human review for high-impact decisions.');
 if(state.aftercare!=='fund')out.push('Reserve recovery capacity; a referral button is not available support.');
 if(!state.priorities.includes('sources'))out.push('Validate source age and rubric consistency before restarting advice.');
 if(!state.priorities.includes('pilot'))out.push('Run independent accessibility and failure tests before scaling.');
 return out;
};
