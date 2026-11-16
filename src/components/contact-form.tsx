'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Input} from './ui/input';
import {Textarea} from './ui/textarea';
import {NativeSelect} from './ui/native-select';
import {Button} from './ui/button';
import {LoaderCircle} from 'lucide-react';
import {contactCategories} from '@/lib/contact';
export function ContactForm(){const [busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(false);async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');try{const res=await fetch('/api/contact',{method:'POST',body:new FormData(e.currentTarget)});const data=await res.json();if(!res.ok){setError(data.error||'送信できませんでした。');return}setDone(true)}catch{setError('通信できませんでした。入力内容はこのままです。もう一度お試しください。')}finally{setBusy(false)}}
 if(done)return <div className="success"><h2>送信しました</h2><p>お問い合わせありがとうございます。内容を確認し、必要に応じてメールでご連絡します。</p></div>;
 return <form className="review-form" onSubmit={submit}><div className="form-grid"><div className="form-group"><label htmlFor="name">お名前 <b>必須</b></label><Input id="name" name="name" required maxLength={50}/></div><div className="form-group"><label htmlFor="email">メールアドレス <b>必須</b></label><Input id="email" name="email" type="email" required maxLength={200}/></div></div><div className="form-group"><label htmlFor="category">お問い合わせの種類 <b>必須</b></label><NativeSelect id="category" name="category" required>{contactCategories.map(c=><option key={c}>{c}</option>)}</NativeSelect></div><div className="form-group"><label htmlFor="body">内容 <b>必須</b></label><Textarea id="body" name="body" required minLength={10} maxLength={3000} placeholder="口コミについてのご依頼は、対象の口コミのURLを添えてください。"/></div><input type="text" name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true"/>{error&&<p role="alert" className="error">{error}</p>}<Button type="submit" disabled={busy}>{busy?<><LoaderCircle className="spin"/>送信中…</>:'送信する'}</Button><p className="form-note">いただいた情報は<Link href="/privacy">プライバシーポリシー</Link>に沿って、お問い合わせへの対応にのみ使います。</p></form>}
