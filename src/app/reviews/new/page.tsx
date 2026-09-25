import Link from 'next/link';
import {redirect} from 'next/navigation';
import {ReviewForm} from '@/components/review-form';
import {products} from '@/lib/catalog';
export const metadata={title:'口コミを書く'};
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{product?:string}>}){const params=await searchParams;const product=products.find(p=>p.id===params.product);if(!product)redirect('/products');return <main className="page-wrap narrow"><div className="breadcrumb"><Link href="/">ホーム</Link> / <Link href={`/products/${product.id}`}>{product.name}</Link> / 口コミを書く</div><div className="page-heading"><p className="overline">SHARE YOUR EXPERIENCE</p><h1>あなたの経験を、次の安心へ。</h1><p>よかったことも、気になったことも。実際に試したからこそ分かることを教えてください。</p></div><ReviewForm productId={product.id} productName={product.name}/></main>}
