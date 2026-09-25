import type { Metadata } from 'next';
import './globals.css';
import './media.css';
import { Header, Footer } from '@/components/site';
export const metadata: Metadata={title:{default:'そなえレビュー | 写真と口コミで選ぶ防災グッズ',template:'%s | そなえレビュー'},description:'買う前に、使った人のリアルな口コミを。写真・収納性・使いやすさから防災グッズを探せるレビューサイト。',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ja"><body><Header/>{children}<Footer/></body></html>}
