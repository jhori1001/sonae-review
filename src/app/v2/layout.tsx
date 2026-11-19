import './sakura.css';
import { V2Header, V2SearchBand, V2Footer } from '@/components/v2/chrome';
export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="v2">
      <V2Header />
      <V2SearchBand />
      {children}
      <V2Footer />
    </div>
  );
}
