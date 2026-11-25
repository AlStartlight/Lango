const {Client}=require('pg');
require('dotenv').config({quiet:true});
const token=process.argv[2];
const lessonId=process.argv[3] || 'en-cefr-a1-u01-l01';
const base='http://localhost:3100';
const c=new Client({connectionString:process.env.DATABASE_URL.replace(/[?&]schema=[^&]*/,'')});
(async()=>{
await c.connect();
const qs=await c.query('select id,"answerKey",choices from (select q.id,q."answerKey", (select json_agg(json_build_object(\'id\',c.id,\'label\',c.label) order by c.position) from lango."QuestionChoice" c where c."questionId"=q.id) choices from lango."Question" q where q."lessonId"=$1 and q.status=\'published\' order by q.position) x',[lessonId]);
console.log('questions',qs.rowCount);
const headers={cookie:`lango_session=${token}`,'content-type':'application/json'};
for (const [i,row] of qs.rows.entries()) {
  const key=row.answerKey;
  const answer = key.choiceId ? {choiceId:key.choiceId} : key.order ? {order:key.order} : (key.accepted?{accepted:key.accepted[0]}:{});
  const r=await fetch(`${base}/api/v1/attempts`,{method:'POST',headers,body:JSON.stringify({clientAttemptId:`flow-${lessonId}-${i}`,questionId:row.id,answer,timeSpentMs:500})});
  const j=await r.json();
  if (!r.ok || !j.data?.correct) { console.log('FAIL',i,row.id,j); process.exit(1); }
}
console.log('all correct submitted');
const done=await fetch(`${base}/api/v1/lessons/${lessonId}/complete`,{method:'POST',headers,body:JSON.stringify({lessonId})});
console.log('complete',done.status,await done.text());
const prog=await fetch(`${base}/api/v1/progress/curriculum?language=en`,{headers});
console.log('progress',await prog.text());
await c.end();
})().catch(e=>{console.error(e);process.exit(1)});
