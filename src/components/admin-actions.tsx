'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from './ui/button';
const labels:Record<string,string>={hide:'非公開にする',publish:'公開に戻す',delete:'削除する','dismiss-report':'通報を却下','close-contact':'対応済みにする'};
export function AdminActions({id,actions}:{id:string;actions:string[]}){const router=useRouter();const [busy,setBusy]=useState(false),[error,setError]=useState('');async function run(action:string){if(action==='delete'&&!confirm('この口コミと写真を完全に削除します。元に戻せません。よろしいですか？'))return;setBusy(true);setError('');try{const res=await fetch('/api/admin/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id})});if(!res.ok){setError((await res.json()).error||'失敗しました。');return}router.refresh()}catch{setError('通信できませんでした。')}finally{setBusy(false)}}return <div className="admin-actions">{actions.map(a=><Button key={a} size="sm" variant={a==='delete'?'destructive':'outline'} disabled={busy} onClick={()=>run(a)}>{labels[a]}</Button>)}{error&&<span className="error">{error}</span>}</div>}
