import {products,shortName} from '@/lib/catalog';
import {normalizeForSearch} from '@/lib/search';
export async function GET(request:Request){
 const q=(new URL(request.url).searchParams.get('q')||'').trim();
 if(!q)return Response.json({items:[]});
 const needle=normalizeForSearch(q);
 const items=products
  .map(p=>{
   const name=normalizeForSearch(p.name),category=normalizeForSearch(p.category),brand=normalizeForSearch(p.brand);
   let score=-1;
   if(category===needle)score=0;
   else if(name.startsWith(needle))score=1;
   else if(category.includes(needle))score=2;
   else if(name.includes(needle))score=3;
   else if(brand.includes(needle))score=4;
   return {p,score};
  })
  .filter(x=>x.score>=0)
  .sort((a,b)=>a.score-b.score)
  .slice(0,8)
  .map(x=>({id:x.p.id,name:shortName(x.p.name,40),category:x.p.category}));
 return Response.json({items});
}
