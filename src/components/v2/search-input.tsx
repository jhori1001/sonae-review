'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Suggestion = { id: string; name: string; category: string };

export function V2SearchInput() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestIdRef = useRef(0);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function onChange(value: string) {
    setQ(value);
    setActive(-1);
    clearTimeout(timerRef.current);
    if (!value.trim()) { setItems([]); setOpen(false); return; }
    const requestId = ++requestIdRef.current;
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v2-suggest?q=${encodeURIComponent(value)}`);
        if (!res.ok || requestId !== requestIdRef.current) return;
        const data = await res.json();
        setItems(data.items || []);
        setOpen((data.items || []).length > 0);
      } catch {}
    }, 150);
  }

  function go(item?: Suggestion) {
    setOpen(false);
    if (item) router.push(`/v2/products/${item.id}`);
    else if (q.trim()) router.push(`/v2/products?q=${encodeURIComponent(q.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) {
      if (e.key === 'Enter') { e.preventDefault(); go(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(active >= 0 ? items[active] : undefined); }
    else if (e.key === 'Escape') setOpen(false);
  }

  return (
    <div className="v2-search-form" ref={boxRef}>
      <input
        aria-label="商品名・カテゴリを検索"
        value={q}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => items.length > 0 && setOpen(true)}
        placeholder="商品名・カテゴリを入力（ひらがな・カタカナどちらでも）"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="v2-suggest-list"
      />
      <button type="button" onClick={() => go()}>検索</button>
      {open && (
        <ul className="v2-suggest-list" id="v2-suggest-list" role="listbox">
          {items.map((item, i) => (
            <li key={item.id} role="option" aria-selected={i === active} className={i === active ? 'active' : ''} onMouseDown={() => go(item)}>
              <span className="v2-suggest-cat">{item.category}</span>{item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
