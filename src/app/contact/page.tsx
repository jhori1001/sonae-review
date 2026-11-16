import Link from 'next/link';
import {ContactForm} from '@/components/contact-form';
export const metadata={title:'お問い合わせ'};
export default function Page(){return <main className="page-wrap narrow"><div className="breadcrumb"><Link href="/">ホーム</Link> / お問い合わせ</div><div className="page-heading"><h1>お問い合わせ</h1><p>口コミの削除依頼、掲載内容の誤り、個人情報に関するご請求などはこちらから。</p></div><ContactForm/></main>}
