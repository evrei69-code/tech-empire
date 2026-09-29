export type Kind='cpu'|'gpu'|'battery';
export type Techs=Record<string,number>;
export type Params=Record<string,number>;
export type Out={perf:number;temp:number;cost:number;rel:number};
export interface Param{k:string;label:string;min:number;max:number;step:number}
export interface Target{k:keyof Out;label:string;op:'>'|'<';v:number;warn:number}
export interface Design{name:string;icon:string;params:Param[];def:Params;targets:Target[];calc(p:Params,t:Techs):Out;hints(o:Out,p:Params):string[]}
const has=(t:Techs,k:string)=>t[k]?1:0;
const cool=(t:Techs,i:number)=>[1,1.25,1.5][i]*(1+.15*has(t,'materials'));
const coolCost=[0,8,20];
const T=(perf:number,temp:number,cost:number,rel:number,pl:string,cl:string):Target[]=>[
 {k:'perf',label:pl,op:'>',v:perf,warn:perf*.9},{k:'temp',label:'Температура °C',op:'<',v:temp,warn:temp*1.1},
 {k:'cost',label:cl,op:'<',v:cost,warn:cost*1.1},{k:'rel',label:'Надёжность',op:'>',v:rel,warn:rel*.9}];
const H=(a:(string|false)[])=>a.filter(Boolean) as string[];
export const DESIGNS:Record<Kind,Design>={
cpu:{name:'Процессор',icon:'🧠',params:[
 {k:'f',label:'Частота, GHz',min:1,max:5,step:.1},{k:'c',label:'Ядра',min:1,max:12,step:1},
 {k:'v',label:'Напряжение, V',min:.7,max:1.2,step:.01},{k:'a',label:'Площадь, mm²',min:40,max:140,step:2},
 {k:'cool',label:'Охлаждение (0 воздух, 1 трубка, 2 жидкость)',min:0,max:2,step:1}],
 def:{f:3.4,c:6,v:.92,a:82,cool:0},targets:T(80,85,80,80,'Производительность','Стоимость $'),
 calc(p,t){const pow=p.c*p.f*p.v**2*2,temp=30+pow*1.22/cool(t,p.cool);return{
 perf:Math.min(100,p.f*Math.sqrt(p.c)*(1+.15*has(t,'arch'))*10),temp,
 cost:(p.a*.6+p.c*3+p.f*4)*(1-.15*has(t,'semis'))+coolCost[p.cool],
 rel:Math.max(0,100-(p.v-.7)*30-Math.max(0,temp-60)*.5-Math.max(0,p.f-3.5)*4-Math.max(0,.6+p.f*.1-p.v)*200-Math.max(0,p.a-100)*.2)}},
 hints:o=>H([o.temp>85&&'Слишком горячо: уменьшите напряжение или улучшите охлаждение.',o.perf<80&&'Мало мощности: добавьте ядра или частоту.',o.cost>80&&'Дорого: уменьшите площадь или число ядер.',o.rel<80&&'Низкая надёжность: снизьте нагрев или частоту.'])},
gpu:{name:'GPU',icon:'🎮',params:[
 {k:'clk',label:'Частота, GHz',min:.8,max:2.5,step:.05},{k:'u',label:'Вычислительные блоки',min:8,max:80,step:2},
 {k:'v',label:'Напряжение, V',min:.7,max:1.2,step:.01},{k:'a',label:'Площадь, mm²',min:100,max:400,step:5},
 {k:'cool',label:'Охлаждение (0-2)',min:0,max:2,step:1}],
 def:{clk:1.8,u:40,v:.9,a:250,cool:1},targets:T(75,85,150,80,'Графика','Стоимость $'),
 calc(p,t){const pow=p.u*p.clk*p.v**2*3,temp=30+pow*.5/cool(t,p.cool);return{
 perf:Math.min(100,p.clk*Math.sqrt(p.u)*(1+.15*has(t,'arch'))*5.2),temp,
 cost:(p.a*.35+p.u*1.2)*(1-.15*has(t,'semis'))+coolCost[p.cool]*2,
 rel:Math.max(0,100-(p.v-.7)*25-Math.max(0,temp-60)*.6-Math.max(0,p.clk-2)*10-Math.max(0,.6+p.clk*.2-p.v)*150)}},
 hints:o=>H([o.temp>85&&'GPU перегревается: меньше блоков или лучше охлаждение.',o.perf<75&&'Не хватает графики: частота или блоки.',o.cost>150&&'Слишком дорогой кристалл.',o.rel<80&&'Надёжность низкая: снизьте частоту и нагрев.'])},
battery:{name:'Батарея',icon:'🔋',params:[
 {k:'mah',label:'Ёмкость, мАч',min:2000,max:6000,step:100},{k:'si',label:'Кремний в аноде, %',min:0,max:30,step:1},{k:'w',label:'Быстрая зарядка, Вт',min:10,max:100,step:5}],
 def:{mah:4000,si:10,w:30},targets:T(80,45,45,80,'Ёмкость (индекс)','Стоимость $'),
 calc(p,t){const cap=p.mah*(1+.4*p.si/100)*(1+.2*has(t,'battery'));const temp=25+p.w*.5+p.si*.4;return{
 perf:Math.min(100,cap/50),temp,cost:p.mah*.008+p.si*.6+p.w*.15,
 rel:Math.max(0,100-p.si*1.1-Math.max(0,temp-45)*1.5-p.w*.1)}},
 hints:o=>H([o.temp>45&&'Батарея греется: меньше мощность зарядки или кремния.',o.perf<80&&'Мало ёмкости: добавьте мАч или кремний.',o.cost>45&&'Дорого: уберите кремний или быструю зарядку.',o.rel<80&&'Кремний и нагрев снижают надёжность.'])}};
export type Status=0|1|2;
export const check=(t:Target,v:number):Status=>t.op=='>'?(v>=t.v?2:v>=t.warn?1:0):(v<=t.v?2:v<=t.warn?1:0);
