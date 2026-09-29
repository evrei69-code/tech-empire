import {useEffect,useState,useCallback} from 'react';
import {CompanyState,loadGame,saveGame,newGame} from '../game/state';

export function useGame(){
 const [s,set]=useState<CompanyState>(loadGame);
 useEffect(()=>{saveGame(s)},[s]);
 const update=useCallback((f:(g:CompanyState)=>CompanyState)=>set(f),[]);
 const reset=useCallback(()=>set(newGame()),[]);
 return{s,update,reset};
}
