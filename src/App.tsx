import {useEffect,useState} from 'react';
import {useGame} from './hooks/useGame';
import {advance} from './game/state';
import Company from './screens/Company/Company';
import Lab from './screens/Lab/Lab';
import Empire from './screens/Empire/Empire';
import Science from './screens/Science/Science';
import Finance from './screens/Finance/Finance';

const TABS=[['home','🏠','Компания'],['business','🏭','Бизнес'],['science','🔬','Наука'],['tech','🧠','Технологии'],['finance','💰','Финансы']] as const;
type Tab=typeof TABS[number][0];

export default function App(){
 const {s,update,reset}=useGame(); const [tab,setTab]=useState<Tab>('home');
 useEffect(()=>{const id=setInterval(()=>update(g=>advance(g,1)),1000);return()=>clearInterval(id)},[update]);
 const screen=tab==='home'?<Company s={s} update={update} reset={reset}/>:tab==='business'?<Empire s={s} update={update}/>:tab==='science'?<Science s={s} update={update}/>:tab==='tech'?<Lab s={s} update={update}/>:<Finance s={s}/>;
 return <div className="min-h-screen max-w-[560px] mx-auto px-3 pt-3 pb-24">{screen}
  <nav className="fixed bottom-0 inset-x-0 z-50 max-w-[560px] mx-auto flex bg-[#14161a]/95 backdrop-blur border-t border-[#292d35] pb-[env(safe-area-inset-bottom)]">
   {TABS.map(([k,i,n])=><button key={k} onClick={()=>setTab(k)} className={`flex-1 py-2 text-[10px] ${tab===k?'text-pri':'text-mut'}`}><div className="text-xl">{i}</div>{n}</button>)}
  </nav>
 </div>
}