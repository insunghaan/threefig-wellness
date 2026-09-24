import { Check, MoonStar } from 'lucide-react';
import './teaser2-balance-preview.css';

export function Teaser2BalancePreview({ id }: { id: string }) {
  return <div className={`t2-balance-preview t2-balance-preview-${id}`}>
    <div className="t2-balance-preview-head"><span>3FIG / {id === 'now' ? 'TODAY' : id === 'why' ? 'YOUR CONTEXT' : 'TONIGHT'}</span><span>PREVIEW</span></div>
    {id === 'now' ? <>
      <p className="t2-balance-mini-label">SKIN BALANCE INDEX</p>
      <div className="t2-balance-mini-score"><strong>82</strong><span>/ 100</span><small>Balanced</small></div>
      <div className="t2-balance-mini-track"><i /></div>
      <div className="t2-balance-mini-footer"><span>Skin check-in</span><strong>Comfortable</strong></div>
    </> : id === 'why' ? <>
      <p className="t2-balance-mini-label">RECORDS, SIDE BY SIDE</p>
      <div className="t2-balance-mini-row"><span>Sleep</span><strong>7h 42m</strong><i style={{width:'76%'}} /></div>
      <div className="t2-balance-mini-row"><span>Your stress note</span><strong>Busy day</strong><i style={{width:'58%'}} /></div>
      <div className="t2-balance-mini-footer"><span>Skin check-in</span><strong>A little dry</strong></div>
    </> : <>
      <p className="t2-balance-mini-label">ONE SMALL STEP</p>
      <div className="t2-balance-bedtime"><MoonStar size={23} aria-hidden="true" /><strong>10:20 <small>PM</small></strong></div>
      <p className="t2-balance-mini-task">Make time to wind down.</p>
      <div className="t2-balance-mini-footer"><Check size={13} aria-hidden="true" /><span>Check in with your skin tomorrow</span></div>
    </>}
    <p className="t2-balance-mini-disclaimer">Illustrative example</p>
  </div>;
}
