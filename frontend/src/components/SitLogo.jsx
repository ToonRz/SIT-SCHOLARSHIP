import sitLogo from './5C0C6B3F5719320009472D84963454FAD2E8D158.png';

/** SIT KMUTT official logo (FR-01) */
export default function SitLogo({ className = 'h-10 w-auto object-contain', alt = 'SIT KMUTT' }) {
  return <img src={sitLogo} alt={alt} className={className} />;
}
