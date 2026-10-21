const ts = require('typescript');
const path = require('path');
const root = path.resolve(__dirname, '..');
const fs = require('fs');
for (const file of [path.join(root, 'services/photoRetouch.ts'),path.join(root, 'app/[locale]/_components/PhotoRetouchGenerate.tsx')]) {
  const result=ts.transpileModule(fs.readFileSync(file,'utf8'), {fileName:file,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}});
  const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  if(errors.length)throw new Error(ts.formatDiagnosticsWithColorAndContext(errors,{getCurrentDirectory:()=>process.cwd(),getCanonicalFileName:x=>x,getNewLine:()=>"\n"}));
}
// Execute the actual polling code with stubbed dependencies; never calls a network.
const source=fs.readFileSync(path.join(root, 'services/photoRetouch.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const vm=require('vm');
async function check(status){
 let calls=0;
 const sandbox={exports:{},require:(name)=>name.includes('awaitingCredits')?{isAwaitingCredits:()=>false,AwaitingCreditsError:Error}:{apiClient:{request:async()=>{calls++;return status;}}},setTimeout:f=>{f();return 1},Date,FormData};
 vm.runInNewContext(compiled,sandbox);
 const got=await sandbox.exports.photoRetouchService.pollResult('test');
 if(got.status!==status.status||calls!==1)throw Error('Poll did not stop for '+status.status);
}
(async()=>{for(const status of ['REVIEW_REQUIRED','QA_FAILED','COMPLETED'])await check({status,result_url:status==='COMPLETED'?'approved.png':null});console.log('PASS: frontend transpilation and three actual polling terminal states');})();
