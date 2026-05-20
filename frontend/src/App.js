import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:8081';
const MINT = '#00E676';
const NAVY = '#0A1A0F';

const CATEGORY_LABELS = { ELECTRONICS: '전자기기', FURNITURE: '가구', CLOTHING: '의류', OTHER: '기타' };
const CATEGORY_ICONS  = { ELECTRONICS: '💻', FURNITURE: '🪑', CLOTHING: '👕', OTHER: '📦' };
const TRADE_TYPE_LABELS = { DIRECT: '직거래', DELIVERY: '택배', BOTH: '직거래+택배' };

const IC = {
  Search:        ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  X:             ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  MapPin:        ({size=13,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Heart:         ({size=15,filled=false,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill={filled?color:'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Trash:         ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>,
  Pencil:        ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Upload:        ({size=28,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Image:         ({size=40,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>,
  Check:         ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  ChevronDown:   ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  AlertCircle:   ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill={color}/></svg>,
  CheckCircle:   ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
  ShoppingBag:   ({size=48,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  LogOut:        ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  ToggleRight:   ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3" fill={color}/></svg>,
  Plus:          ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Spinner:       ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{animation:'spin 0.7s linear infinite',display:'inline-block'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
  Moon:          ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun:           ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Eye:           ({size=13,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  ArrowUp:       ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  Flag:          ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  ChevronLeft:   ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight:  ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  UserIcon:      ({size=18,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  MessageSquare: ({size=14,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

const buildCSS = (dark) => `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; background: ${dark ? '#060D08' : '#F0FFF4'}; }

  @keyframes fadeInUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn    { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes shimmer    { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes heartPop   { 0%{transform:scale(1)} 35%{transform:scale(1.6)} 65%{transform:scale(0.9)} 100%{transform:scale(1)} }
  @keyframes toastSlide { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
  @keyframes toastFade  { from{opacity:1} to{opacity:0;transform:translateX(60px)} }
  @keyframes spin       { to{transform:rotate(360deg)} }

  .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
  .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,${dark ? '0.6' : '0.10'}), ${dark ? '0 0 20px rgba(0,230,118,0.08)' : '0 0 0 transparent'} !important; }
  .card-hover:hover .card-img-scale { transform: scale(1.05); }
  .card-img-scale { transition: transform 0.35s ease; width: 100%; height: 100%; object-fit: cover; display: block; }

  .card-overlay {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, rgba(15,43,74,0.93) 0%, rgba(15,43,74,0.55) 60%, transparent 100%);
    padding: 16px 12px 10px;
    transform: translateY(100%); opacity: 0;
    transition: transform 0.28s ease, opacity 0.28s ease;
  }
  .card-hover:hover .card-overlay { opacity: 1; transform: translateY(0); }

  .img-sold { filter: grayscale(100%); }

  .btn { transition: background 0.13s, opacity 0.13s, transform 0.1s; border: none; cursor: pointer; }
  .btn:hover { opacity: 0.88; }
  .btn:active { transform: scale(0.97); }

  .skeleton {
    background: linear-gradient(90deg, ${dark ? '#0D1E12 25%, #132618 50%, #0D1E12 75%' : '#E0F5EA 25%, #F0FFF4 50%, #E0F5EA 75%'});
    background-size: 600px 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: 8px;
  }

  .modal-enter   { animation: scaleIn 0.2s cubic-bezier(.34,1.56,.64,1); }
  .overlay-enter { animation: fadeIn 0.15s ease; }
  .toast-in      { animation: toastSlide 0.24s ease; }
  .toast-out     { animation: toastFade 0.24s ease forwards; }
  .heart-pop     { animation: heartPop 0.34s ease; }
  .card-enter    { animation: fadeInUp 0.3s ease both; }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: ${MINT} !important;
    box-shadow: 0 0 0 3px rgba(0,194,168,0.18);
  }
  input::placeholder, textarea::placeholder { color: #6B7280; }

  .tab-btn {
    padding: 9px 18px; border-radius: 24px; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.15s; border: 2px solid transparent;
    background: ${dark ? '#0D1A0F' : '#E8F5EE'}; color: ${dark ? '#5A9A70' : '#3A7A50'};
    white-space: nowrap; flex-shrink: 0;
  }
  .tab-btn:hover { background: ${dark ? '#122018' : '#C8F0D8'}; color: ${MINT}; }
  .tab-btn.active { background: ${MINT}; color: #fff; border-color: ${MINT}; }

  .sort-btn {
    padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.13s;
    border: 1.5px solid ${dark ? '#1A3025' : '#B8E0C8'};
    background: ${dark ? '#0D1A0F' : '#fff'}; color: ${dark ? '#5A9A70' : '#3A7A50'};
  }
  .sort-btn.active { background: ${MINT}; color: ${dark ? '#060D08' : '#fff'}; border-color: ${MINT}; }
  .sort-btn:hover:not(.active) { border-color: ${MINT}; color: ${MINT}; }

  select { -webkit-appearance: none; appearance: none; cursor: pointer; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${dark ? '#1A3025' : '#A8D4B8'}; border-radius: 3px; }
  .tab-bar-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 10px 0; }
  .tab-bar-scroll::-webkit-scrollbar { height: 0; }
  .seller-link:hover { color: ${MINT}; text-decoration: underline; }
  .recent-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
  .recent-scroll::-webkit-scrollbar { height: 0; }
  .conv-item:hover { background: ${dark ? '#0F2018' : '#E0F5EA'} !important; }
`;

const TOAST_CONFIG = {
  success: { bg:'#F0FDF4', border:'#22C55E', icon: <IC.CheckCircle size={16} color="#22C55E"/> },
  error:   { bg:'#FEF2F2', border:'#EF4444', icon: <IC.AlertCircle size={16} color="#EF4444"/> },
  warning: { bg:'#FFFBEB', border:'#F59E0B', icon: <IC.AlertCircle size={16} color="#F59E0B"/> },
  info:    { bg:'#EFF6FF', border:'#3B82F6', icon: <IC.AlertCircle size={16} color="#3B82F6"/> },
};

function ToastList({ toasts, dismiss }) {
  return (
    <div style={{position:'fixed',top:'20px',right:'20px',zIndex:9999,display:'flex',flexDirection:'column',gap:'8px',pointerEvents:'none'}}>
      {toasts.map(t => {
        const cfg = TOAST_CONFIG[t.type]||TOAST_CONFIG.info;
        return (
          <div key={t.id} className={t.leaving?'toast-out':'toast-in'} onClick={()=>dismiss(t.id)}
            style={{display:'flex',alignItems:'flex-start',gap:'10px',background:cfg.bg,padding:'12px 16px',borderRadius:'12px',border:`1px solid ${cfg.border}`,boxShadow:'0 4px 16px rgba(0,0,0,0.10)',maxWidth:'320px',cursor:'pointer',pointerEvents:'all'}}>
            <span style={{flexShrink:0,paddingTop:'1px'}}>{cfg.icon}</span>
            <span style={{fontSize:'13px',color:'#1e293b',lineHeight:'1.45',fontWeight:'500'}}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

function SkeletonCard({ dark }) {
  const bg = dark ? '#0D1A0F' : '#fff';
  const bdr = dark ? '#2A4A35' : '#D0EDD8';
  return (
    <div style={{background:bg,borderRadius:'16px',overflow:'hidden',border:`1px solid ${bdr}`}}>
      <div style={{position:'relative',paddingBottom:'100%'}}>
        <div className="skeleton" style={{position:'absolute',inset:0,borderRadius:'0'}}/>
      </div>
      <div style={{padding:'12px 14px 14px',display:'flex',flexDirection:'column',gap:'7px'}}>
        <div className="skeleton" style={{height:'11px',width:'30%'}}/>
        <div className="skeleton" style={{height:'14px',width:'65%'}}/>
        <div className="skeleton" style={{height:'20px',width:'40%'}}/>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <div className="skeleton" style={{height:'11px',width:'35%'}}/>
          <div className="skeleton" style={{height:'11px',width:'12%'}}/>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = buildCSS(dark);
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, [dark]);

  const C = {
    bg:        dark ? '#060D08' : '#F0FFF4',
    cardBg:    dark ? '#152B1A' : '#fff',
    navBg:     dark ? '#040A06' : '#fff',
    navBdr:    dark ? '#0F2018' : '#D8F0E0',
    text:      dark ? '#E8FFF2' : NAVY,
    textSub:   dark ? '#9ECFB0' : '#1A3A25',
    textMuted: dark ? '#4D7A5D' : '#5A8A6A',
    border:    dark ? '#122018' : '#C0E8CC',
    inputBg:   dark ? '#0D1A0F' : '#fff',
    inputBdr:  dark ? '#1A3025' : '#B8E0C8',
    cardBdr:   dark ? '#2A4A35' : '#D0EDD8',
    metaBg:    dark ? '#091408' : '#F0FFF4',
  };

  const inputStyle = {
    width:'100%', padding:'10px 14px', fontSize:'14px',
    border:`1px solid ${C.inputBdr}`, borderRadius:'10px',
    color:C.text, background:C.inputBg,
    transition:'border-color 0.15s, box-shadow 0.15s',
  };

  const [toasts, setToasts] = useState([]);
  const toast = useCallback((message, type='info') => {
    const id = Date.now()+Math.random();
    setToasts(p=>[...p,{id,message,type,leaving:false}]);
    setTimeout(()=>{
      setToasts(p=>p.map(t=>t.id===id?{...t,leaving:true}:t));
      setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),280);
    },3200);
  },[]);
  const dismissToast = useCallback(id=>setToasts(p=>p.filter(t=>t.id!==id)),[]);

  const [user,setUser] = useState(()=>{ try{return JSON.parse(localStorage.getItem('user'));}catch{return null;} });
  const [showAuth,setShowAuth] = useState(false);
  const [authTab,setAuthTab] = useState('login');
  const [loginData,setLoginData] = useState({username:'',password:''});
  const [registerData,setRegisterData] = useState({username:'',password:'',passwordConfirm:''});

  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);
  const [searchInput,setSearchInput] = useState('');
  const [searchKeyword,setSearchKeyword] = useState('');
  const [filterCategory,setFilterCategory] = useState('');
  const [filterTradeType,setFilterTradeType] = useState('');
  const [sortOrder,setSortOrder] = useState('latest');

  useEffect(()=>{ const t=setTimeout(()=>setSearchKeyword(searchInput),300); return()=>clearTimeout(t); },[searchInput]);

  const [showRegForm,setShowRegForm] = useState(false);
  const [regName,setRegName] = useState('');
  const [regPrice,setRegPrice] = useState('');
  const [regAddress,setRegAddress] = useState('');
  const [regDesc,setRegDesc] = useState('');
  const [regCategory,setRegCategory] = useState('OTHER');
  const [regTradeType,setRegTradeType] = useState('BOTH');
  const [regImages,setRegImages] = useState([]);
  const [regPreviews,setRegPreviews] = useState([]);
  const [isDragging,setIsDragging] = useState(false);
  const [submitting,setSubmitting] = useState(false);

  const [selectedItem,setSelectedItem] = useState(null);
  const [editMode,setEditMode] = useState(false);
  const [editData,setEditData] = useState({});
  const [editImages,setEditImages] = useState([]);
  const [editPreviews,setEditPreviews] = useState([]);
  const [modalImgIdx,setModalImgIdx] = useState(0);

  const [wishedIds,setWishedIds] = useState(new Set());
  const [heartAnim,setHeartAnim] = useState(null);

  const [profileUser,setProfileUser]   = useState(null);
  const [profileData,setProfileData]   = useState(null);
  const [showAdminReports,setShowAdminReports] = useState(false);
  const [adminReports,setAdminReports] = useState([]);
  const [showReportModal,setShowReportModal]   = useState(false);
  const [reportReason,setReportReason] = useState('');
  const [bumpLoading,setBumpLoading]   = useState(false);

  const [unreadCount,setUnreadCount]     = useState(0);
  const [showInbox,setShowInbox]         = useState(false);
  const [conversations,setConversations] = useState([]);
  const [currentConv,setCurrentConv]     = useState(null);
  const [convMessages,setConvMessages]   = useState([]);
  const [showMsgModal,setShowMsgModal]   = useState(false);
  const [msgTarget,setMsgTarget]         = useState(null);
  const [msgText,setMsgText]             = useState('');

  const [recentItems,setRecentItems] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('recentItems'))||[]; }catch{ return []; }
  });

  const msgEndRef = useRef(null);
  useEffect(()=>{ msgEndRef.current?.scrollIntoView({behavior:'smooth'}); },[convMessages]);

  const fetchItems = useCallback(()=>{
    setLoading(true);
    const params={sort:sortOrder};
    if(searchKeyword) params.keyword=searchKeyword;
    if(filterCategory) params.category=filterCategory;
    if(filterTradeType) params.tradeType=filterTradeType;
    axios.get(`${BASE_URL}/api/items`,{params})
      .then(res=>setItems(res.data))
      .catch(()=>toast('상품 목록을 불러오지 못했습니다.','error'))
      .finally(()=>setLoading(false));
  },[searchKeyword,filterCategory,sortOrder,filterTradeType]); // eslint-disable-line

  const fetchUnreadCount = useCallback(()=>{
    if(!user) return;
    axios.get(`${BASE_URL}/api/messages/unread-count?userId=${user.id}`)
      .then(res=>setUnreadCount(res.data.count||0))
      .catch(()=>{});
  },[user]);

  useEffect(()=>{fetchItems();},[fetchItems]);
  useEffect(()=>{
    if(user) axios.get(`${BASE_URL}/api/wishes/user/${user.id}`).then(r=>setWishedIds(new Set(r.data)));
    else setWishedIds(new Set());
  },[user]);
  useEffect(()=>{ if(user) fetchUnreadCount(); else setUnreadCount(0); },[user,fetchUnreadCount]);

  const getImages = (item) => {
    if(item?.imageNames?.length>0) return item.imageNames;
    if(item?.imageName) return [item.imageName];
    return [];
  };
  const getFirstImage = (item) => getImages(item)[0]||null;

  const addRegImages = (files) => {
    const remaining = 5 - regImages.length;
    if(remaining<=0) return toast('최대 5장까지 업로드 가능합니다.','warning');
    const arr = Array.from(files).slice(0,remaining);
    const newImgs=[],newPrevs=[];
    for(const f of arr){
      if(!f.type.startsWith('image/')) { toast('이미지 파일만 업로드 가능합니다.','error'); continue; }
      if(f.size>10*1024*1024) { toast('10MB 이하 파일만 가능합니다.','warning'); continue; }
      newImgs.push(f); newPrevs.push(URL.createObjectURL(f));
    }
    setRegImages(p=>[...p,...newImgs]); setRegPreviews(p=>[...p,...newPrevs]);
  };
  const removeRegImage = (idx) => {
    setRegImages(p=>p.filter((_,i)=>i!==idx));
    setRegPreviews(p=>p.filter((_,i)=>i!==idx));
  };
  const addEditImages = (files) => {
    const remaining = 5 - editImages.length;
    if(remaining<=0) return toast('최대 5장까지 업로드 가능합니다.','warning');
    const arr = Array.from(files).slice(0,remaining);
    const newImgs=[],newPrevs=[];
    for(const f of arr){
      if(!f.type.startsWith('image/')) { toast('이미지 파일만 업로드 가능합니다.','error'); continue; }
      if(f.size>10*1024*1024) { toast('10MB 이하 파일만 가능합니다.','warning'); continue; }
      newImgs.push(f); newPrevs.push(URL.createObjectURL(f));
    }
    setEditImages(p=>[...p,...newImgs]); setEditPreviews(p=>[...p,...newPrevs]);
  };
  const removeEditImage = (idx) => {
    setEditImages(p=>p.filter((_,i)=>i!==idx));
    setEditPreviews(p=>p.filter((_,i)=>i!==idx));
  };
  const onDrop = e => { e.preventDefault(); setIsDragging(false); addRegImages(e.dataTransfer.files); };

  const handleLogin=e=>{
    e.preventDefault();
    axios.post(`${BASE_URL}/api/auth/login`,loginData)
      .then(res=>{setUser(res.data);localStorage.setItem('user',JSON.stringify(res.data));setShowAuth(false);setLoginData({username:'',password:''});toast(`${res.data.username}님, 환영합니다!`,'success');})
      .catch(err=>toast(err.response?.data?.message||'로그인 정보를 확인해주세요.','error'));
  };
  const handleRegister=e=>{
    e.preventDefault();
    if(registerData.password!==registerData.passwordConfirm) return toast('비밀번호가 일치하지 않습니다.','error');
    axios.post(`${BASE_URL}/api/auth/register`,{username:registerData.username,password:registerData.password})
      .then(res=>{setUser(res.data);localStorage.setItem('user',JSON.stringify(res.data));setShowAuth(false);setRegisterData({username:'',password:'',passwordConfirm:''});toast('회원가입 완료!','success');})
      .catch(err=>toast(err.response?.data?.message||'회원가입에 실패했습니다.','error'));
  };
  const handleLogout=()=>{
    setUser(null);localStorage.removeItem('user');
    setProfileUser(null);setProfileData(null);
    setShowInbox(false);setCurrentConv(null);setConvMessages([]);setUnreadCount(0);
    toast('로그아웃되었습니다.','info');
  };

  const handleSubmit=e=>{
    e.preventDefault();
    if(!user) return toast('로그인 후 이용 가능합니다.','warning');
    if(!regName||!regPrice||!regAddress) return toast('상품명, 가격, 지역은 필수입니다.','warning');
    const fd=new FormData();
    fd.append('name',regName);fd.append('price',regPrice);fd.append('seller',user.username);
    fd.append('address',regAddress);fd.append('description',regDesc);
    fd.append('category',regCategory);fd.append('tradeType',regTradeType);
    regImages.forEach(img=>fd.append('images',img));
    setSubmitting(true);
    axios.post(`${BASE_URL}/api/items`,fd,{headers:{'Content-Type':'multipart/form-data'}})
      .then(()=>{
        setRegName('');setRegPrice('');setRegAddress('');setRegDesc('');
        setRegCategory('OTHER');setRegTradeType('BOTH');
        setRegImages([]);setRegPreviews([]);
        setShowRegForm(false);toast('상품이 등록되었습니다!','success');fetchItems();
      })
      .catch(()=>toast('등록 중 오류가 발생했습니다.','error'))
      .finally(()=>setSubmitting(false));
  };

  const handleDelete=(e,id)=>{
    e.stopPropagation();
    if(!window.confirm('삭제하시겠습니까?')) return;
    axios.delete(`${BASE_URL}/api/items/${id}`).then(()=>{fetchItems();if(selectedItem?.id===id)setSelectedItem(null);toast('삭제되었습니다.','info');});
  };

  const openModal=item=>{
    setSelectedItem(item);setEditMode(false);setModalImgIdx(0);
    setEditData({name:item.name,price:item.price,address:item.address,description:item.description||'',category:item.category||'OTHER',tradeType:item.tradeType||'BOTH'});
    setEditImages([]);setEditPreviews([]);
    axios.put(`${BASE_URL}/api/items/${item.id}/view`)
      .then(res=>{
        setSelectedItem(res.data);
        setItems(prev=>prev.map(i=>i.id===item.id?{...i,viewCount:res.data.viewCount}:i));
      });
    setRecentItems(prev=>{
      const updated=[item,...prev.filter(i=>i.id!==item.id)].slice(0,10);
      localStorage.setItem('recentItems',JSON.stringify(updated));
      return updated;
    });
  };

  const handleEditSave=()=>{
    const fd=new FormData();
    Object.entries(editData).forEach(([k,v])=>{if(v!=null)fd.append(k,v);});
    editImages.forEach(img=>fd.append('images',img));
    axios.put(`${BASE_URL}/api/items/${selectedItem.id}`,fd,{headers:{'Content-Type':'multipart/form-data'}})
      .then(res=>{setSelectedItem(res.data);setModalImgIdx(0);setEditMode(false);setEditImages([]);setEditPreviews([]);fetchItems();toast('수정되었습니다.','success');})
      .catch(()=>toast('수정 중 오류가 발생했습니다.','error'));
  };

  const handleStatusToggle=e=>{
    e.stopPropagation();
    const next=selectedItem.status==='SELLING'?'SOLD':'SELLING';
    const fd=new FormData();fd.append('status',next);
    axios.put(`${BASE_URL}/api/items/${selectedItem.id}`,fd,{headers:{'Content-Type':'multipart/form-data'}})
      .then(res=>{setSelectedItem(res.data);fetchItems();toast(next==='SOLD'?'판매완료로 변경!':'판매중으로 변경!','success');});
  };

  const handleWish=(e,id)=>{
    e.stopPropagation();
    if(!user) return toast('로그인 후 이용 가능합니다.','warning');
    setHeartAnim(id);setTimeout(()=>setHeartAnim(null),400);
    axios.post(`${BASE_URL}/api/wishes/${id}`,{userId:user.id})
      .then(res=>{const s=new Set(wishedIds);res.data.wished?s.add(id):s.delete(id);setWishedIds(s);fetchItems();if(selectedItem?.id===id)setSelectedItem(p=>({...p,wishCount:res.data.wishCount}));});
  };

  const canManage=(item)=>user&&(item.seller===user.username||user.role==='ADMIN');

  const openProfile=(username)=>{
    setSelectedItem(null);setShowInbox(false);setCurrentConv(null);
    axios.get(`${BASE_URL}/api/users/${username}/profile`)
      .then(res=>{setProfileData(res.data);setProfileUser(username);})
      .catch(()=>toast('프로필을 불러오지 못했습니다.','error'));
  };

  const handleBump=()=>{
    setBumpLoading(true);
    axios.put(`${BASE_URL}/api/items/${selectedItem.id}/bump`)
      .then(()=>{
        fetchItems();setSelectedItem(null);
        if(profileUser) axios.get(`${BASE_URL}/api/users/${profileUser}/profile`).then(res=>setProfileData(res.data));
        toast('끌어올리기 완료! 최신순 최상단으로 올라갔습니다.','success');
      })
      .catch(err=>toast(err.response?.data?.message||'끌어올리기에 실패했습니다.','error'))
      .finally(()=>setBumpLoading(false));
  };

  const handleReport=()=>{
    if(!reportReason) return toast('신고 사유를 선택해주세요.','warning');
    axios.post(`${BASE_URL}/api/reports`,{productId:selectedItem.id,reporterId:user.id,reason:reportReason})
      .then(()=>{setShowReportModal(false);setReportReason('');toast('신고가 접수되었습니다.','success');})
      .catch(err=>toast(err.response?.data?.message||'신고에 실패했습니다.','error'));
  };

  const openAdminReports=()=>{
    axios.get(`${BASE_URL}/api/reports?adminId=${user.id}`)
      .then(res=>{setAdminReports(res.data);setShowAdminReports(true);})
      .catch(()=>toast('신고 목록을 불러오지 못했습니다.','error'));
  };

  const openInbox=()=>{
    setSelectedItem(null);setProfileUser(null);setProfileData(null);setCurrentConv(null);
    setShowInbox(true);
    axios.get(`${BASE_URL}/api/messages/inbox?userId=${user.id}`)
      .then(res=>{setConversations(res.data);fetchUnreadCount();})
      .catch(()=>toast('쪽지함을 불러오지 못했습니다.','error'));
  };

  const openConversation=(conv)=>{
    setCurrentConv(conv);setMsgText('');
    axios.get(`${BASE_URL}/api/messages/conversation?userId=${user.id}&partnerId=${conv.partnerId}&productId=${conv.productId}`)
      .then(res=>{setConvMessages(res.data);fetchUnreadCount();})
      .catch(()=>toast('대화를 불러오지 못했습니다.','error'));
  };

  const backToInbox=()=>{
    setCurrentConv(null);setConvMessages([]);setMsgText('');
    axios.get(`${BASE_URL}/api/messages/inbox?userId=${user.id}`)
      .then(res=>{setConversations(res.data);fetchUnreadCount();})
      .catch(()=>{});
  };

  const handleSendMessage=()=>{
    if(!msgText.trim()) return toast('내용을 입력해주세요.','warning');
    const body={
      senderId:user.id,
      receiverUsername:currentConv?currentConv.partnerUsername:msgTarget?.receiverUsername,
      productId:currentConv?currentConv.productId:msgTarget?.productId,
      content:msgText.trim(),
    };
    axios.post(`${BASE_URL}/api/messages`,body)
      .then(()=>{
        setMsgText('');
        if(currentConv) openConversation(currentConv);
        else { setShowMsgModal(false);toast('쪽지를 보냈습니다.','success'); }
      })
      .catch(err=>toast(err.response?.data?.message||'전송에 실패했습니다.','error'));
  };

  const removeRecentItem=(id)=>{
    setRecentItems(prev=>{
      const updated=prev.filter(i=>i.id!==id);
      localStorage.setItem('recentItems',JSON.stringify(updated));
      return updated;
    });
  };
  const clearRecentItems=()=>{ setRecentItems([]); localStorage.removeItem('recentItems'); };

  const tradeBadge=(tradeType)=>{
    if(!tradeType) return null;
    const bg=tradeType==='DIRECT'?'rgba(59,130,246,0.12)':tradeType==='DELIVERY'?'rgba(139,92,246,0.12)':'rgba(0,194,168,0.12)';
    const color=tradeType==='DIRECT'?'#3B82F6':tradeType==='DELIVERY'?'#8B5CF6':MINT;
    return <span style={{fontSize:'10px',fontWeight:'700',padding:'2px 7px',borderRadius:'6px',background:bg,color}}>{TRADE_TYPE_LABELS[tradeType]||tradeType}</span>;
  };

  return (
    <div style={{background:C.bg,minHeight:'100vh'}}>
      <ToastList toasts={toasts} dismiss={dismissToast}/>

      {/* ── NAV ── */}
      <nav style={{background:C.navBg,borderBottom:`1px solid ${C.navBdr}`,position:'sticky',top:0,zIndex:200,boxShadow:dark?'none':'0 1px 8px rgba(0,0,0,0.05)'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px',height:'60px',display:'flex',alignItems:'center',gap:'16px'}}>

          <div onClick={()=>{setProfileUser(null);setProfileData(null);setShowInbox(false);setCurrentConv(null);}} style={{display:'flex',alignItems:'center',gap:'9px',cursor:'pointer',flexShrink:0,minWidth:'150px'}}>
            <div style={{width:'32px',height:'32px',background:`linear-gradient(135deg,${NAVY},#1A5030)`,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px'}}>♻️</div>
            <span style={{fontSize:'18px',fontWeight:'900',letterSpacing:'-0.5px',color:C.text}}>
              RE<span style={{color:MINT}}>:</span>MARKET
            </span>
          </div>

          <div style={{flex:1,position:'relative',display:'flex',alignItems:'center'}}>
            <span style={{position:'absolute',left:'16px',color:C.textMuted,pointerEvents:'none',display:'flex'}}><IC.Search size={16}/></span>
            <input placeholder="어떤 물건을 찾고 계세요?" value={searchInput} onChange={e=>setSearchInput(e.target.value)}
              style={{...inputStyle,paddingLeft:'46px',paddingRight:searchInput?'40px':'16px',borderRadius:'28px',boxShadow:dark?'none':'0 1px 4px rgba(0,0,0,0.06)'}}/>
            {searchInput&&(
              <button onClick={()=>{setSearchInput('');setSearchKeyword('');}} className="btn"
                style={{position:'absolute',right:'14px',background:'none',border:'none',cursor:'pointer',color:C.textMuted,display:'flex',padding:'2px'}}>
                <IC.X size={14}/>
              </button>
            )}
          </div>

          <div style={{display:'flex',alignItems:'center',gap:'10px',flexShrink:0,justifyContent:'flex-end'}}>
            <button onClick={()=>setDark(d=>!d)} className="btn"
              style={{width:'36px',height:'36px',borderRadius:'50%',background:dark?'#1A2F4A':'#F3F4F6',border:'none',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {dark?<IC.Sun size={16} color="#F59E0B"/>:<IC.Moon size={16} color={NAVY}/>}
            </button>
            {user ? (
              <>
                <button onClick={()=>setShowRegForm(v=>!v)} className="btn"
                  style={{display:'flex',alignItems:'center',gap:'6px',background:MINT,color:'#fff',borderRadius:'10px',padding:'8px 16px',fontWeight:'700',fontSize:'13px'}}>
                  <IC.Plus size={15} color="#fff"/> 판매하기
                </button>
                {user.role==='ADMIN'&&(
                  <button onClick={openAdminReports} className="btn"
                    style={{display:'flex',alignItems:'center',gap:'5px',background:'#FEF3C7',border:'1px solid #FDE68A',color:'#D97706',padding:'7px 12px',borderRadius:'9px',fontSize:'13px',fontWeight:'600'}}>
                    <IC.Flag size={12} color="#D97706"/> 신고
                  </button>
                )}
                <button onClick={openInbox} className="btn"
                  style={{position:'relative',display:'flex',alignItems:'center',gap:'5px',background:'none',border:`1px solid ${C.border}`,color:C.textSub,padding:'7px 12px',borderRadius:'9px',fontSize:'13px'}}>
                  <IC.MessageSquare size={13}/> 쪽지함
                  {unreadCount>0&&(
                    <span style={{position:'absolute',top:'-5px',right:'-5px',background:'#EF4444',color:'#fff',fontSize:'9px',fontWeight:'700',minWidth:'16px',height:'16px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>
                      {unreadCount>9?'9+':unreadCount}
                    </span>
                  )}
                </button>
                <div onClick={()=>openProfile(user.username)} style={{display:'flex',alignItems:'center',gap:'7px',cursor:'pointer'}}>
                  <div style={{width:'30px',height:'30px',borderRadius:'50%',background:`linear-gradient(135deg,${NAVY},#1A5030)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:'700'}}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <span style={{fontSize:'13px',fontWeight:'600',color:C.text}}>{user.username}</span>
                </div>
                <button onClick={handleLogout} className="btn"
                  style={{display:'flex',alignItems:'center',gap:'5px',background:'none',border:`1px solid ${C.border}`,color:C.textMuted,padding:'7px 12px',borderRadius:'9px',fontSize:'13px'}}>
                  <IC.LogOut size={13}/> 로그아웃
                </button>
              </>
            ) : (
              <>
                <button onClick={()=>{setShowAuth(v=>!v);setAuthTab('login');}} className="btn"
                  style={{background:'none',border:`1px solid ${C.border}`,color:C.textSub,padding:'8px 18px',borderRadius:'10px',fontWeight:'600',fontSize:'13px'}}>
                  로그인
                </button>
                <button onClick={()=>{setShowAuth(v=>!v);setAuthTab('register');}} className="btn"
                  style={{background:MINT,color:'#fff',padding:'8px 18px',borderRadius:'10px',fontWeight:'700',fontSize:'13px'}}>
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── AUTH 드롭다운 ── */}
      {!user&&showAuth&&(
        <div style={{position:'fixed',top:'70px',right:'24px',zIndex:300,background:C.cardBg,border:`1px solid ${C.cardBdr}`,borderRadius:'16px',padding:'24px',width:'320px',boxShadow:'0 16px 48px rgba(0,0,0,0.15)'}} className="modal-enter">
          <div style={{display:'flex',marginBottom:'20px',borderBottom:`2px solid ${C.border}`}}>
            {[['login','로그인'],['register','회원가입']].map(([k,l])=>(
              <button key={k} onClick={()=>setAuthTab(k)} className="btn"
                style={{flex:1,background:'none',border:'none',borderBottom:`2px solid ${authTab===k?MINT:'transparent'}`,color:authTab===k?MINT:C.textMuted,fontWeight:authTab===k?'700':'400',padding:'10px',cursor:'pointer',fontSize:'14px',marginBottom:'-2px',transition:'all 0.15s'}}>
                {l}
              </button>
            ))}
          </div>
          {authTab==='login'?(
            <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <input placeholder="아이디" value={loginData.username} onChange={e=>setLoginData({...loginData,username:e.target.value})} style={inputStyle}/>
              <input type="password" placeholder="비밀번호" value={loginData.password} onChange={e=>setLoginData({...loginData,password:e.target.value})} style={inputStyle}/>
              <button type="submit" className="btn" style={{background:NAVY,color:'#fff',borderRadius:'10px',padding:'11px',fontWeight:'700',fontSize:'14px',marginTop:'2px'}}>로그인</button>
            </form>
          ):(
            <form onSubmit={handleRegister} style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <input placeholder="아이디" value={registerData.username} onChange={e=>setRegisterData({...registerData,username:e.target.value})} style={inputStyle}/>
              <input type="password" placeholder="비밀번호" value={registerData.password} onChange={e=>setRegisterData({...registerData,password:e.target.value})} style={inputStyle}/>
              <input type="password" placeholder="비밀번호 확인" value={registerData.passwordConfirm} onChange={e=>setRegisterData({...registerData,passwordConfirm:e.target.value})} style={inputStyle}/>
              <button type="submit" className="btn" style={{background:MINT,color:'#fff',borderRadius:'10px',padding:'11px',fontWeight:'700',fontSize:'14px',marginTop:'2px'}}>회원가입</button>
            </form>
          )}
          <button style={{background:'none',border:'none',color:C.textMuted,fontSize:'12px',cursor:'pointer',marginTop:'14px',display:'block',width:'100%',textAlign:'center'}}
            onClick={()=>axios.post(`${BASE_URL}/api/auth/setup`).then(r=>{toast(r.data,'success');fetchItems();})}>
            예시 데이터 생성
          </button>
        </div>
      )}

      {/* ── 카테고리 탭바 (메인에서만) ── */}
      {!profileUser&&!showInbox&&!currentConv&&(
        <div style={{background:C.navBg,borderBottom:`1px solid ${C.navBdr}`,position:'sticky',top:'60px',zIndex:190}}>
          <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 24px'}}>
            <div className="tab-bar-scroll">
              <button className={`tab-btn${filterCategory===''?' active':''}`} onClick={()=>setFilterCategory('')}>🏠 전체</button>
              {Object.entries(CATEGORY_LABELS).map(([v,l])=>(
                <button key={v} className={`tab-btn${filterCategory===v?' active':''}`} onClick={()=>setFilterCategory(v)}>
                  {CATEGORY_ICONS[v]} {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 상품 등록 패널 ── */}
      {user&&showRegForm&&(
        <div style={{background:C.navBg,borderBottom:`1px solid ${C.navBdr}`,boxShadow:dark?'none':'0 4px 16px rgba(0,0,0,0.06)'}}>
          <div style={{maxWidth:'1200px',margin:'0 auto',padding:'24px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px'}}>
              <h3 style={{fontSize:'16px',fontWeight:'700',color:C.text}}>상품 등록</h3>
              <button onClick={()=>setShowRegForm(false)} className="btn" style={{background:'none',border:'none',color:C.textMuted,display:'flex'}}><IC.X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                <input placeholder="상품명 *" value={regName} onChange={e=>setRegName(e.target.value)} style={inputStyle}/>
                <input type="number" placeholder="가격 (원) *" value={regPrice} onChange={e=>setRegPrice(e.target.value)} style={inputStyle}/>
                <input placeholder="거래 지역 *" value={regAddress} onChange={e=>setRegAddress(e.target.value)} style={inputStyle}/>
                <div style={{position:'relative'}}>
                  <select value={regCategory} onChange={e=>setRegCategory(e.target.value)} style={{...inputStyle,paddingRight:'34px'}}>
                    {Object.entries(CATEGORY_LABELS).map(([v,l])=><option key={v} value={v}>{CATEGORY_ICONS[v]} {l}</option>)}
                  </select>
                  <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:C.textMuted}}><IC.ChevronDown size={14}/></span>
                </div>
                <div style={{position:'relative'}}>
                  <select value={regTradeType} onChange={e=>setRegTradeType(e.target.value)} style={{...inputStyle,paddingRight:'34px'}}>
                    <option value="DIRECT">🚶 직거래</option>
                    <option value="DELIVERY">📦 택배거래</option>
                    <option value="BOTH">🤝 둘 다 가능</option>
                  </select>
                  <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:C.textMuted}}><IC.ChevronDown size={14}/></span>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'14px'}}>
                <div style={{position:'relative'}}>
                  <textarea placeholder="상품 설명 (선택)" value={regDesc} onChange={e=>e.target.value.length<=500&&setRegDesc(e.target.value)}
                    style={{...inputStyle,resize:'vertical',minHeight:'90px'}} rows={3}/>
                  <span style={{position:'absolute',bottom:'10px',right:'12px',fontSize:'11px',color:C.textMuted}}>{regDesc.length}/500</span>
                </div>
                <div onDragEnter={e=>{e.preventDefault();setIsDragging(true)}} onDragLeave={e=>{e.preventDefault();setIsDragging(false)}} onDragOver={e=>e.preventDefault()} onDrop={onDrop}
                  style={{border:`2px dashed ${isDragging?MINT:C.border}`,borderRadius:'10px',background:isDragging?'rgba(0,194,168,0.06)':C.metaBg,transition:'all 0.18s',padding:'12px',minHeight:'90px'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:regPreviews.length>0?'8px':'0'}}>
                    {regPreviews.map((p,i)=>(
                      <div key={i} style={{position:'relative',width:'64px',height:'64px',flexShrink:0}}>
                        <img src={p} alt="" style={{width:'64px',height:'64px',objectFit:'cover',borderRadius:'8px',border:`1px solid ${C.border}`}}/>
                        <button type="button" onClick={()=>removeRegImage(i)}
                          style={{position:'absolute',top:'-5px',right:'-5px',width:'17px',height:'17px',borderRadius:'50%',background:'#EF4444',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <IC.X size={9} color="#fff"/>
                        </button>
                      </div>
                    ))}
                    {regPreviews.length<5&&(
                      <label onDragEnter={e=>{e.preventDefault();setIsDragging(true)}}
                        style={{width:'64px',height:'64px',border:`2px dashed ${isDragging?MINT:C.border}`,borderRadius:'8px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',color:isDragging?MINT:C.textMuted,gap:'3px',background:'transparent',flexShrink:0}}>
                        <IC.Plus size={14} color={isDragging?MINT:C.textMuted}/>
                        <span style={{fontSize:'10px'}}>추가</span>
                        <input type="file" accept="image/*" multiple onChange={e=>addRegImages(e.target.files)} style={{display:'none'}}/>
                      </label>
                    )}
                  </div>
                  {regPreviews.length===0&&(
                    <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'4px',cursor:'pointer',color:C.textMuted,height:'50px'}}>
                      <IC.Upload size={20} color={C.textMuted}/>
                      <span style={{fontSize:'12px'}}>클릭 또는 드래그 (최대 5장)</span>
                      <input type="file" accept="image/*" multiple onChange={e=>addRegImages(e.target.files)} style={{display:'none'}}/>
                    </label>
                  )}
                  {regPreviews.length>0&&<p style={{fontSize:'11px',color:C.textMuted}}>{regPreviews.length}/5장</p>}
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:'8px'}}>
                <button type="button" onClick={()=>setShowRegForm(false)} className="btn"
                  style={{padding:'10px 20px',background:C.metaBg,color:C.textMuted,borderRadius:'10px',fontWeight:'600',fontSize:'14px'}}>취소</button>
                <button type="submit" disabled={submitting} className="btn"
                  style={{display:'flex',alignItems:'center',gap:'7px',background:MINT,color:'#fff',borderRadius:'10px',padding:'10px 24px',fontWeight:'700',fontSize:'14px',opacity:submitting?0.65:1}}>
                  {submitting?<><IC.Spinner size={15}/> 등록 중...</>:'등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 페이지 본문 ── */}
      {currentConv ? (
        /* ── 대화 페이지 ── */
        <div style={{maxWidth:'800px',margin:'0 auto',padding:'20px 24px',display:'flex',flexDirection:'column',height:'calc(100vh - 60px)'}}>
          <button onClick={backToInbox} className="btn"
            style={{display:'flex',alignItems:'center',gap:'8px',background:'none',border:'none',color:C.textMuted,fontSize:'14px',marginBottom:'12px',padding:'4px 0',cursor:'pointer',alignSelf:'flex-start'}}>
            <IC.ChevronLeft size={16} color={C.textMuted}/> 쪽지함으로
          </button>
          <div style={{background:C.cardBg,borderRadius:'14px',padding:'14px 18px',marginBottom:'16px',border:`1px solid ${C.cardBdr}`,display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'50%',background:`linear-gradient(135deg,${NAVY},#1A5030)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'16px',fontWeight:'700',flexShrink:0}}>
              {(currentConv.partnerUsername||'?')[0].toUpperCase()}
            </div>
            <div>
              <p style={{fontSize:'14px',fontWeight:'700',color:C.text}}>@{currentConv.partnerUsername}</p>
              <p style={{fontSize:'12px',color:MINT}}>{currentConv.productName||`상품 #${currentConv.productId}`}</p>
            </div>
          </div>
          <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'10px',marginBottom:'12px',paddingRight:'4px'}}>
            {convMessages.length===0&&(
              <div style={{textAlign:'center',padding:'40px',color:C.textMuted,fontSize:'14px'}}>대화를 시작해보세요!</div>
            )}
            {convMessages.map(msg=>(
              <div key={msg.id} style={{display:'flex',justifyContent:msg.senderId===user.id?'flex-end':'flex-start'}}>
                <div style={{
                  maxWidth:'70%',padding:'10px 14px',lineHeight:'1.5',fontSize:'14px',
                  borderRadius:msg.senderId===user.id?'18px 18px 4px 18px':'18px 18px 18px 4px',
                  background:msg.senderId===user.id?MINT:(dark?'#0F2018':'#E8F5EE'),
                  color:msg.senderId===user.id?'#fff':C.text,
                }}>
                  {msg.content}
                  <p style={{fontSize:'10px',opacity:0.65,marginTop:'4px',textAlign:msg.senderId===user.id?'right':'left'}}>
                    {msg.createdAt?new Date(msg.createdAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}):''}
                  </p>
                </div>
              </div>
            ))}
            <div ref={msgEndRef}/>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <input value={msgText} onChange={e=>setMsgText(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),handleSendMessage())}
              placeholder="메시지를 입력하세요..." style={{...inputStyle,flex:1}}/>
            <button onClick={handleSendMessage} className="btn"
              style={{padding:'10px 20px',background:MINT,color:'#fff',borderRadius:'10px',fontWeight:'700',fontSize:'14px',flexShrink:0,whiteSpace:'nowrap'}}>
              전송
            </button>
          </div>
        </div>

      ) : showInbox ? (
        /* ── 쪽지함 페이지 ── */
        <div style={{maxWidth:'800px',margin:'0 auto',padding:'28px 24px'}}>
          <button onClick={()=>setShowInbox(false)} className="btn"
            style={{display:'flex',alignItems:'center',gap:'8px',background:'none',border:'none',color:C.textMuted,fontSize:'14px',marginBottom:'20px',padding:'4px 0',cursor:'pointer'}}>
            <IC.ChevronLeft size={16} color={C.textMuted}/> 뒤로가기
          </button>
          <h2 style={{fontSize:'20px',fontWeight:'800',color:C.text,marginBottom:'20px'}}>쪽지함</h2>
          {conversations.length===0?(
            <div style={{textAlign:'center',padding:'80px 20px',background:C.cardBg,borderRadius:'20px',border:`1px solid ${C.cardBdr}`,display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}>
              <IC.MessageSquare size={48} color={C.border}/>
              <p style={{fontSize:'16px',fontWeight:'600',color:C.text}}>쪽지가 없습니다</p>
              <p style={{fontSize:'14px',color:C.textMuted}}>상품 상세에서 판매자에게 쪽지를 보내보세요!</p>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              {conversations.map((conv,idx)=>(
                <div key={idx} onClick={()=>openConversation(conv)} className="conv-item"
                  style={{display:'flex',alignItems:'center',gap:'14px',padding:'16px',background:C.cardBg,borderRadius:'14px',border:`1px solid ${conv.unreadCount>0?MINT:C.cardBdr}`,cursor:'pointer',transition:'background 0.15s'}}>
                  <div style={{width:'46px',height:'46px',borderRadius:'50%',background:`linear-gradient(135deg,${NAVY},#1A5030)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'17px',fontWeight:'700',flexShrink:0}}>
                    {(conv.partnerUsername||'?')[0].toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'3px'}}>
                      <p style={{fontSize:'14px',fontWeight:conv.unreadCount>0?'700':'600',color:C.text}}>@{conv.partnerUsername}</p>
                      {conv.unreadCount>0&&(
                        <span style={{background:'#EF4444',color:'#fff',fontSize:'10px',fontWeight:'700',padding:'2px 7px',borderRadius:'10px',flexShrink:0}}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p style={{fontSize:'11px',color:MINT,marginBottom:'3px',fontWeight:'600'}}>{conv.productName||`상품 #${conv.productId}`}</p>
                    <p style={{fontSize:'12px',color:C.textMuted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{conv.lastMessage}</p>
                  </div>
                  <IC.ChevronRight size={16} color={C.textMuted}/>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : profileUser ? (
        /* ── 프로필 페이지 ── */
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'28px 24px'}}>
          <button onClick={()=>{setProfileUser(null);setProfileData(null);}} className="btn"
            style={{display:'flex',alignItems:'center',gap:'8px',background:'none',border:'none',color:C.textMuted,fontSize:'14px',marginBottom:'20px',padding:'4px 0',cursor:'pointer'}}>
            <IC.ChevronLeft size={16} color={C.textMuted}/> 뒤로가기
          </button>
          {profileData&&(
            <>
              <div style={{background:C.cardBg,borderRadius:'20px',padding:'28px 32px',border:`1px solid ${C.cardBdr}`,marginBottom:'24px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'24px',flexWrap:'wrap'}}>
                  <div style={{width:'68px',height:'68px',borderRadius:'50%',background:`linear-gradient(135deg,${NAVY},#1A5030)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'26px',fontWeight:'800',flexShrink:0}}>
                    {profileData.username[0].toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'4px',flexWrap:'wrap'}}>
                      <h2 style={{fontSize:'22px',fontWeight:'800',color:C.text}}>@{profileData.username}</h2>
                      {profileData.role==='ADMIN'&&(
                        <span style={{background:'#FEF3C7',color:'#D97706',fontSize:'11px',fontWeight:'700',padding:'3px 10px',borderRadius:'20px',border:'1px solid #FDE68A'}}>ADMIN</span>
                      )}
                    </div>
                    <p style={{fontSize:'13px',color:C.textMuted,marginBottom:'16px'}}>
                      가입일: {profileData.createdAt?profileData.createdAt.slice(0,10):'정보 없음'}
                    </p>
                    <div style={{display:'flex',gap:'28px'}}>
                      {[['판매중',profileData.sellingCount,MINT],['판매완료',profileData.soldCount,C.text],['전체',profileData.products?.length||0,C.text]].map(([label,count,color])=>(
                        <div key={label} style={{textAlign:'center'}}>
                          <p style={{fontSize:'22px',fontWeight:'900',color,lineHeight:'1.2'}}>{count}</p>
                          <p style={{fontSize:'12px',color:C.textMuted,marginTop:'2px'}}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <h3 style={{fontSize:'16px',fontWeight:'700',color:C.text,marginBottom:'16px'}}>등록 상품 ({profileData.products?.length||0})</h3>
              {profileData.products?.length===0?(
                <div style={{textAlign:'center',padding:'60px 20px',background:C.cardBg,borderRadius:'20px',border:`1px solid ${C.cardBdr}`,display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}>
                  <IC.ShoppingBag size={48} color={C.border}/>
                  <p style={{fontSize:'16px',fontWeight:'600',color:C.text}}>등록한 상품이 없습니다</p>
                </div>
              ):(
                <div style={gridStyle}>
                  {profileData.products.map((item,idx)=>(
                    <div key={item.id} className="card-hover card-enter"
                      style={{background:C.cardBg,borderRadius:'16px',overflow:'hidden',border:`1px solid ${C.cardBdr}`,animationDelay:`${idx*0.035}s`,boxShadow:dark?'0 2px 16px rgba(0,0,0,0.5)':'0 1px 4px rgba(0,0,0,0.05)'}}
                      onClick={()=>openModal(item)}>
                      <div style={{position:'relative',paddingBottom:'100%',background:C.metaBg,overflow:'hidden'}}>
                        <div style={{position:'absolute',inset:0}}>
                          {getFirstImage(item)?(
                            <img src={`${BASE_URL}/images/${getFirstImage(item)}`} alt={item.name}
                              className={`card-img-scale${item.status==='SOLD'?' img-sold':''}`} loading="lazy"/>
                          ):(
                            <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                              <IC.Image size={36} color={C.border}/>
                            </div>
                          )}
                          {item.status==='SOLD'&&(
                            <div style={{position:'absolute',top:'10px',left:'10px',background:'rgba(0,0,0,0.72)',borderRadius:'6px',padding:'3px 9px'}}>
                              <span style={{color:'#fff',fontWeight:'800',fontSize:'11px',letterSpacing:'1px'}}>SOLD</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{padding:'12px 14px 14px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'5px',flexWrap:'wrap'}}>
                          <p style={{fontSize:'11px',color:MINT,fontWeight:'700'}}>{CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]||'기타'}</p>
                          {tradeBadge(item.tradeType)}
                        </div>
                        <p style={{fontSize:'14px',fontWeight:'600',color:C.text,marginBottom:'5px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.name}</p>
                        <p style={{fontSize:'19px',fontWeight:'900',color:C.text,marginBottom:'6px',letterSpacing:'-0.5px'}}>
                          {item.price?.toLocaleString()}<span style={{fontSize:'12px',fontWeight:'500',color:C.textMuted,marginLeft:'2px'}}>원</span>
                        </p>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'3px'}}>
                            <IC.MapPin size={12} color={C.textMuted}/>
                            <span style={{fontSize:'12px',color:C.textMuted}}>{item.address}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                            <span style={{display:'flex',alignItems:'center',gap:'3px',fontSize:'11px',color:C.textMuted}}>
                              <IC.Eye size={11} color={C.textMuted}/> {item.viewCount||0}
                            </span>
                            <span style={{display:'flex',alignItems:'center',gap:'3px',fontSize:'11px',color:wishedIds.has(item.id)?'#E11D48':C.textMuted}}>
                              <IC.Heart size={11} filled={wishedIds.has(item.id)} color={wishedIds.has(item.id)?'#E11D48':C.textMuted}/> {item.wishCount||0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      ) : (
        /* ── 메인 페이지 ── */
        <div style={{maxWidth:'1200px',margin:'0 auto',padding:'28px 24px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px',flexWrap:'wrap',gap:'10px'}}>
            <div>
              <h1 style={{fontSize:'20px',fontWeight:'800',color:C.text,marginBottom:'2px'}}>
                {filterCategory?`${CATEGORY_LABELS[filterCategory]} 상품`:'전체 상품'}
              </h1>
              {!loading&&<p style={{fontSize:'13px',color:C.textMuted}}>{items.length}개의 상품</p>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
              {searchKeyword&&(
                <div style={{display:'flex',alignItems:'center',gap:'6px',background:dark?'rgba(0,194,168,0.1)':'#D6F5F1',border:`1px solid ${MINT}`,borderRadius:'20px',padding:'5px 12px'}}>
                  <IC.Search size={12} color={MINT}/>
                  <span style={{fontSize:'13px',color:MINT,fontWeight:'600'}}>"{searchKeyword}"</span>
                  <button onClick={()=>{setSearchInput('');setSearchKeyword('');}} className="btn"
                    style={{background:'none',border:'none',color:MINT,display:'flex',padding:'0',marginLeft:'2px'}}>
                    <IC.X size={12} color={MINT}/>
                  </button>
                </div>
              )}
              <div style={{width:'1px',height:'20px',background:C.border,margin:'0 2px'}}/>
              {[['','전체'],['DIRECT','직거래'],['DELIVERY','택배'],['BOTH','모두가능']].map(([v,l])=>(
                <button key={v} className={`sort-btn${filterTradeType===v?' active':''}`} onClick={()=>setFilterTradeType(v)}>{l}</button>
              ))}
              <div style={{width:'1px',height:'20px',background:C.border,margin:'0 2px'}}/>
              {[['latest','최신순'],['price_asc','낮은가격'],['price_desc','높은가격']].map(([v,l])=>(
                <button key={v} className={`sort-btn${sortOrder===v?' active':''}`} onClick={()=>setSortOrder(v)}>{l}</button>
              ))}
            </div>
          </div>

          {loading?(
            <div style={gridStyle}>{Array.from({length:8}).map((_,i)=><SkeletonCard key={i} dark={dark}/>)}</div>
          ):items.length===0?(
            <div style={{textAlign:'center',padding:'80px 20px',display:'flex',flexDirection:'column',alignItems:'center',gap:'14px',background:C.cardBg,borderRadius:'20px',border:`1px solid ${C.cardBdr}`}}>
              <IC.ShoppingBag size={52} color={C.border}/>
              <p style={{fontSize:'18px',fontWeight:'700',color:C.text}}>상품이 없습니다</p>
              <p style={{fontSize:'14px',color:C.textMuted}}>{searchKeyword||filterCategory||filterTradeType?'다른 검색어나 필터를 시도해보세요.':'첫 번째 상품을 등록해보세요!'}</p>
              {(searchKeyword||filterCategory||filterTradeType)&&(
                <button onClick={()=>{setSearchInput('');setSearchKeyword('');setFilterCategory('');setFilterTradeType('');}} className="btn"
                  style={{marginTop:'4px',padding:'10px 22px',background:MINT,color:'#fff',borderRadius:'10px',fontSize:'14px',fontWeight:'700'}}>
                  전체 보기
                </button>
              )}
            </div>
          ):(
            <div style={gridStyle}>
              {items.map((item,idx)=>(
                <div key={item.id} className="card-hover card-enter"
                  style={{background:C.cardBg,borderRadius:'16px',overflow:'hidden',border:`1px solid ${C.cardBdr}`,animationDelay:`${idx*0.035}s`,boxShadow:dark?'0 2px 16px rgba(0,0,0,0.5)':'0 1px 4px rgba(0,0,0,0.05)'}}
                  onClick={()=>openModal(item)}>

                  <div style={{position:'relative',paddingBottom:'100%',background:C.metaBg,overflow:'hidden'}}>
                    <div style={{position:'absolute',inset:0}}>
                      {getFirstImage(item)?(
                        <img src={`${BASE_URL}/images/${getFirstImage(item)}`} alt={item.name}
                          className={`card-img-scale${item.status==='SOLD'?' img-sold':''}`} loading="lazy"/>
                      ):(
                        <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                          <IC.Image size={36} color={C.border}/>
                          <span style={{fontSize:'11px',color:C.textMuted}}>이미지 없음</span>
                        </div>
                      )}
                      {item.description&&(
                        <div className="card-overlay">
                          <p style={{fontSize:'12px',color:'rgba(255,255,255,0.88)',lineHeight:'1.6',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical'}}>
                            {item.description}
                          </p>
                        </div>
                      )}
                      <button onClick={e=>handleWish(e,item.id)} className={heartAnim===item.id?'heart-pop':''}
                        style={{position:'absolute',top:'10px',right:'10px',width:'32px',height:'32px',borderRadius:'50%',background:'rgba(255,255,255,0.92)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.14)'}}>
                        <IC.Heart size={15} filled={wishedIds.has(item.id)} color={wishedIds.has(item.id)?'#E11D48':'#9CA3AF'}/>
                      </button>
                      {item.status==='SOLD'&&(
                        <div style={{position:'absolute',top:'10px',left:'10px',background:'rgba(0,0,0,0.72)',borderRadius:'6px',padding:'3px 9px'}}>
                          <span style={{color:'#fff',fontWeight:'800',fontSize:'11px',letterSpacing:'1px'}}>SOLD</span>
                        </div>
                      )}
                      {getImages(item).length>1&&(
                        <div style={{position:'absolute',bottom:'8px',left:'8px',background:'rgba(0,0,0,0.55)',borderRadius:'6px',padding:'2px 7px'}}>
                          <span style={{color:'#fff',fontSize:'10px',fontWeight:'700'}}>📷 {getImages(item).length}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{padding:'12px 14px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'5px',flexWrap:'wrap'}}>
                      <p style={{fontSize:'11px',color:MINT,fontWeight:'700'}}>{CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]||'기타'}</p>
                      {tradeBadge(item.tradeType)}
                    </div>
                    <p style={{fontSize:'14px',fontWeight:'600',color:C.text,marginBottom:'5px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.name}</p>
                    <p style={{fontSize:'19px',fontWeight:'900',color:C.text,marginBottom:'5px',letterSpacing:'-0.5px'}}>
                      {item.price?.toLocaleString()}<span style={{fontSize:'12px',fontWeight:'500',color:C.textMuted,marginLeft:'2px'}}>원</span>
                    </p>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'5px'}}>
                      <span onClick={e=>{e.stopPropagation();openProfile(item.seller);}}
                        className="seller-link"
                        style={{fontSize:'12px',color:C.textMuted,cursor:'pointer',fontWeight:'500'}}>
                        @{item.seller}
                      </span>
                      <span style={{display:'flex',alignItems:'center',gap:'3px',fontSize:'11px',color:C.textMuted}}>
                        <IC.Eye size={11} color={C.textMuted}/> {item.viewCount||0}
                      </span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'3px'}}>
                        <IC.MapPin size={12} color={C.textMuted}/>
                        <span style={{fontSize:'12px',color:C.textMuted}}>{item.address}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{display:'flex',alignItems:'center',gap:'3px',fontSize:'12px',color:wishedIds.has(item.id)?'#E11D48':C.textMuted}}>
                          <IC.Heart size={12} filled={wishedIds.has(item.id)} color={wishedIds.has(item.id)?'#E11D48':C.textMuted}/> {item.wishCount||0}
                        </span>
                        {canManage(item)&&(
                          <button onClick={e=>handleDelete(e,item.id)} className="btn" style={{background:'none',border:'none',display:'flex',padding:'2px'}}>
                            <IC.Trash size={13} color={C.textMuted}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 최근 본 상품 ── */}
          {recentItems.length>0&&(
            <div style={{marginTop:'44px',paddingTop:'28px',borderTop:`1px solid ${C.border}`}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}}>
                <h2 style={{fontSize:'16px',fontWeight:'700',color:C.text}}>최근 본 상품</h2>
                <button onClick={clearRecentItems} className="btn"
                  style={{background:'none',border:'none',color:C.textMuted,fontSize:'12px',cursor:'pointer',padding:'4px 8px'}}>
                  전체 삭제
                </button>
              </div>
              <div className="recent-scroll">
                {recentItems.map(item=>(
                  <div key={item.id} style={{flexShrink:0,width:'130px',cursor:'pointer',position:'relative',background:C.cardBg,borderRadius:'12px',overflow:'visible',border:`1px solid ${C.cardBdr}`}}
                    onClick={()=>openModal(item)} className="card-hover">
                    <button onClick={e=>{e.stopPropagation();removeRecentItem(item.id);}} className="btn"
                      style={{position:'absolute',top:'-7px',right:'-7px',zIndex:1,width:'20px',height:'20px',borderRadius:'50%',background:'rgba(0,0,0,0.55)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <IC.X size={10} color="#fff"/>
                    </button>
                    <div style={{borderRadius:'12px 12px 0 0',overflow:'hidden',position:'relative',paddingBottom:'100%',background:C.metaBg}}>
                      <div style={{position:'absolute',inset:0}}>
                        {getFirstImage(item)?(
                          <img src={`${BASE_URL}/images/${getFirstImage(item)}`} alt={item.name}
                            className={`card-img-scale${item.status==='SOLD'?' img-sold':''}`} loading="lazy"/>
                        ):(
                          <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <IC.Image size={24} color={C.border}/>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{padding:'8px 10px 10px'}}>
                      <p style={{fontSize:'12px',fontWeight:'600',color:C.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginBottom:'2px'}}>{item.name}</p>
                      <p style={{fontSize:'13px',fontWeight:'800',color:C.text}}>{item.price?.toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 상세 모달 ── */}
      {selectedItem&&(()=>{
        const imgs=getImages(selectedItem);
        return (
          <div className="overlay-enter"
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(3px)'}}
            onClick={()=>setSelectedItem(null)}>
            <div className="modal-enter"
              style={{background:C.cardBg,borderRadius:'24px',width:'100%',maxWidth:'860px',maxHeight:'90vh',overflowY:'auto',position:'relative'}}
              onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setSelectedItem(null)} className="btn"
                style={{position:'absolute',top:'16px',right:'16px',zIndex:2,width:'34px',height:'34px',borderRadius:'50%',background:C.metaBg,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.textMuted}}>
                <IC.X size={16}/>
              </button>

              <div style={{display:'flex'}}>
                {/* 이미지 슬라이드 */}
                <div style={{width:'45%',flexShrink:0,background:C.metaBg,borderRadius:'24px 0 0 24px',overflow:'hidden',position:'relative',minHeight:'360px'}}>
                  {imgs.length>0?(
                    <>
                      <img src={`${BASE_URL}/images/${imgs[modalImgIdx]}`} alt={selectedItem.name}
                        className={selectedItem.status==='SOLD'?'img-sold':''}
                        style={{width:'100%',height:'100%',objectFit:'cover',display:'block',minHeight:'360px'}}/>
                      {imgs.length>1&&(
                        <>
                          <button onClick={()=>setModalImgIdx(i=>Math.max(0,i-1))} className="btn"
                            style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',width:'32px',height:'32px',borderRadius:'50%',background:'rgba(0,0,0,0.5)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',opacity:modalImgIdx===0?0.3:1}}>
                            <IC.ChevronLeft size={16} color="#fff"/>
                          </button>
                          <button onClick={()=>setModalImgIdx(i=>Math.min(imgs.length-1,i+1))} className="btn"
                            style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',width:'32px',height:'32px',borderRadius:'50%',background:'rgba(0,0,0,0.5)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',opacity:modalImgIdx===imgs.length-1?0.3:1}}>
                            <IC.ChevronRight size={16} color="#fff"/>
                          </button>
                          <div style={{position:'absolute',bottom:'12px',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'5px'}}>
                            {imgs.map((_,i)=>(
                              <div key={i} onClick={()=>setModalImgIdx(i)}
                                style={{width:i===modalImgIdx?'18px':'6px',height:'6px',borderRadius:'3px',background:i===modalImgIdx?'#fff':'rgba(255,255,255,0.5)',cursor:'pointer',transition:'all 0.2s'}}/>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ):(
                    <div style={{height:'100%',minHeight:'360px',display:'flex',alignItems:'center',justifyContent:'center'}}><IC.Image size={52} color={C.border}/></div>
                  )}
                  {selectedItem.status==='SOLD'&&(
                    <div style={{position:'absolute',top:'16px',left:'16px',background:'rgba(0,0,0,0.72)',borderRadius:'8px',padding:'5px 12px'}}>
                      <span style={{color:'#fff',fontWeight:'800',fontSize:'13px',letterSpacing:'1.5px'}}>SOLD</span>
                    </div>
                  )}
                </div>

                <div style={{flex:1,padding:'32px',display:'flex',flexDirection:'column'}}>
                  {!editMode?(
                    <>
                      <div style={{display:'flex',gap:'7px',flexWrap:'wrap',marginBottom:'14px'}}>
                        <span style={{background:dark?'rgba(0,194,168,0.15)':'#D6F5F1',color:MINT,fontSize:'12px',fontWeight:'700',padding:'4px 12px',borderRadius:'20px'}}>
                          {CATEGORY_ICONS[selectedItem.category]} {CATEGORY_LABELS[selectedItem.category]||'기타'}
                        </span>
                        <span style={{background:selectedItem.status==='SOLD'?'#FEF2F2':'#F0FDF4',color:selectedItem.status==='SOLD'?'#EF4444':'#16A34A',fontSize:'12px',fontWeight:'700',padding:'4px 12px',borderRadius:'20px'}}>
                          {selectedItem.status==='SOLD'?'판매완료':'판매중'}
                        </span>
                        {selectedItem.tradeType&&(()=>{
                          const bg=selectedItem.tradeType==='DIRECT'?'rgba(59,130,246,0.12)':selectedItem.tradeType==='DELIVERY'?'rgba(139,92,246,0.12)':'rgba(0,194,168,0.12)';
                          const col=selectedItem.tradeType==='DIRECT'?'#3B82F6':selectedItem.tradeType==='DELIVERY'?'#8B5CF6':MINT;
                          return <span style={{background:bg,color:col,fontSize:'12px',fontWeight:'700',padding:'4px 12px',borderRadius:'20px'}}>{TRADE_TYPE_LABELS[selectedItem.tradeType]}</span>;
                        })()}
                      </div>
                      <h2 style={{fontSize:'22px',fontWeight:'800',color:C.text,marginBottom:'8px',lineHeight:'1.3'}}>{selectedItem.name}</h2>
                      <p style={{fontSize:'30px',fontWeight:'900',color:C.text,marginBottom:'16px',letterSpacing:'-1px'}}>
                        {selectedItem.price?.toLocaleString()}<span style={{fontSize:'15px',fontWeight:'500',color:C.textMuted,marginLeft:'3px'}}>원</span>
                      </p>
                      <div style={{padding:'14px',background:C.metaBg,borderRadius:'12px',marginBottom:'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'14px',color:C.textSub}}>
                          <IC.MapPin size={14} color={C.textMuted}/>{selectedItem.address}
                        </div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'14px'}}>
                            <span style={{fontSize:'13px',color:C.textMuted}}>판매자</span>
                            <span onClick={()=>openProfile(selectedItem.seller)}
                              className="seller-link"
                              style={{fontWeight:'600',color:C.text,cursor:'pointer'}}>
                              @{selectedItem.seller}
                            </span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <span style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:C.textMuted}}>
                              <IC.Eye size={12} color={C.textMuted}/> {selectedItem.viewCount||0}
                            </span>
                            <span style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:C.textMuted}}>
                              <IC.Heart size={12}/> {selectedItem.wishCount||0}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedItem.description&&(
                        <p style={{fontSize:'14px',color:C.textSub,lineHeight:'1.8',padding:'14px',background:C.metaBg,borderRadius:'12px',marginBottom:'16px',whiteSpace:'pre-wrap'}}>
                          {selectedItem.description}
                        </p>
                      )}
                      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'auto'}}>
                        <button onClick={e=>handleWish(e,selectedItem.id)} className={(heartAnim===selectedItem.id?'heart-pop ':'')+' btn'}
                          style={{display:'flex',alignItems:'center',gap:'7px',padding:'11px 18px',border:`1px solid ${wishedIds.has(selectedItem.id)?'#FECDD3':C.border}`,background:wishedIds.has(selectedItem.id)?'#FFF1F2':C.metaBg,color:wishedIds.has(selectedItem.id)?'#E11D48':C.textMuted,borderRadius:'10px',fontWeight:'600',fontSize:'13px'}}>
                          <IC.Heart size={15} filled={wishedIds.has(selectedItem.id)} color={wishedIds.has(selectedItem.id)?'#E11D48':'#9CA3AF'}/>
                          찜 {selectedItem.wishCount||0}
                        </button>

                        {user&&selectedItem.seller===user.username&&selectedItem.status==='SELLING'&&(()=>{
                          const canBump=!selectedItem.lastBumpedAt||Date.now()-new Date(selectedItem.lastBumpedAt).getTime()>=3600000;
                          return (
                            <button onClick={canBump?handleBump:()=>toast('1시간 후에 다시 시도해주세요.','warning')}
                              disabled={bumpLoading} className="btn"
                              style={{display:'flex',alignItems:'center',gap:'6px',padding:'11px 16px',
                                background:canBump?'#F0FDF4':C.metaBg,color:canBump?'#16A34A':C.textMuted,
                                border:`1px solid ${canBump?'#86EFAC':C.border}`,
                                borderRadius:'10px',fontWeight:'600',fontSize:'13px',opacity:bumpLoading?0.65:1}}>
                              <IC.ArrowUp size={13} color={canBump?'#16A34A':C.textMuted}/>
                              {bumpLoading?'처리 중...':canBump?'끌어올리기':'끌어올리기 (대기중)'}
                            </button>
                          );
                        })()}

                        {canManage(selectedItem)&&(
                          <>
                            <button onClick={()=>setEditMode(true)} className="btn"
                              style={{display:'flex',alignItems:'center',gap:'6px',padding:'11px 16px',background:'#6366F1',color:'#fff',borderRadius:'10px',fontWeight:'600',fontSize:'13px'}}>
                              <IC.Pencil size={13} color="#fff"/> 수정
                            </button>
                            <button onClick={handleStatusToggle} className="btn"
                              style={{display:'flex',alignItems:'center',gap:'6px',padding:'11px 16px',background:C.metaBg,color:C.textSub,border:`1px solid ${C.border}`,borderRadius:'10px',fontWeight:'600',fontSize:'13px'}}>
                              <IC.ToggleRight size={15} color={MINT}/>
                              {selectedItem.status==='SELLING'?'판매완료 처리':'판매중으로 변경'}
                            </button>
                            <button onClick={e=>handleDelete(e,selectedItem.id)} className="btn"
                              style={{display:'flex',alignItems:'center',gap:'6px',padding:'11px 16px',background:'#FEF2F2',color:'#EF4444',border:'1px solid #FECACA',borderRadius:'10px',fontWeight:'600',fontSize:'13px'}}>
                              <IC.Trash size={13} color="#EF4444"/> 삭제
                            </button>
                          </>
                        )}

                        {user&&selectedItem.seller!==user.username&&(
                          <>
                            <button onClick={()=>{setMsgText('');setMsgTarget({productId:selectedItem.id,productName:selectedItem.name,receiverUsername:selectedItem.seller});setShowMsgModal(true);}} className="btn"
                              style={{display:'flex',alignItems:'center',gap:'6px',padding:'11px 16px',background:'#EFF6FF',color:'#3B82F6',border:'1px solid #BFDBFE',borderRadius:'10px',fontWeight:'600',fontSize:'13px'}}>
                              <IC.MessageSquare size={13} color="#3B82F6"/> 쪽지 보내기
                            </button>
                            <button onClick={()=>setShowReportModal(true)} className="btn"
                              style={{display:'flex',alignItems:'center',gap:'6px',padding:'11px 16px',background:'#FEF2F2',color:'#EF4444',border:'1px solid #FECACA',borderRadius:'10px',fontWeight:'600',fontSize:'13px'}}>
                              <IC.Flag size={13} color="#EF4444"/> 신고
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  ):(
                    <>
                      <h3 style={{fontSize:'16px',fontWeight:'700',color:C.text,marginBottom:'18px'}}>상품 수정</h3>
                      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                        <input value={editData.name} onChange={e=>setEditData({...editData,name:e.target.value})} style={inputStyle} placeholder="상품명"/>
                        <input type="number" value={editData.price} onChange={e=>setEditData({...editData,price:e.target.value})} style={inputStyle} placeholder="가격"/>
                        <input value={editData.address} onChange={e=>setEditData({...editData,address:e.target.value})} style={inputStyle} placeholder="지역"/>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                          <div style={{position:'relative'}}>
                            <select value={editData.category} onChange={e=>setEditData({...editData,category:e.target.value})} style={{...inputStyle,paddingRight:'34px'}}>
                              {Object.entries(CATEGORY_LABELS).map(([v,l])=><option key={v} value={v}>{CATEGORY_ICONS[v]} {l}</option>)}
                            </select>
                            <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:C.textMuted}}><IC.ChevronDown size={14}/></span>
                          </div>
                          <div style={{position:'relative'}}>
                            <select value={editData.tradeType||'BOTH'} onChange={e=>setEditData({...editData,tradeType:e.target.value})} style={{...inputStyle,paddingRight:'34px'}}>
                              <option value="DIRECT">🚶 직거래</option>
                              <option value="DELIVERY">📦 택배거래</option>
                              <option value="BOTH">🤝 둘 다 가능</option>
                            </select>
                            <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:C.textMuted}}><IC.ChevronDown size={14}/></span>
                          </div>
                        </div>
                        <textarea value={editData.description} onChange={e=>setEditData({...editData,description:e.target.value})} style={{...inputStyle,resize:'vertical',minHeight:'72px'}} placeholder="상품 설명" rows={3}/>
                        <div style={{border:`2px dashed ${C.border}`,borderRadius:'10px',padding:'12px',background:C.metaBg}}>
                          <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:editPreviews.length>0?'8px':'0'}}>
                            {editPreviews.map((p,i)=>(
                              <div key={i} style={{position:'relative',width:'54px',height:'54px'}}>
                                <img src={p} alt="" style={{width:'54px',height:'54px',objectFit:'cover',borderRadius:'7px',border:`1px solid ${C.border}`}}/>
                                <button type="button" onClick={()=>removeEditImage(i)}
                                  style={{position:'absolute',top:'-5px',right:'-5px',width:'15px',height:'15px',borderRadius:'50%',background:'#EF4444',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                                  <IC.X size={8} color="#fff"/>
                                </button>
                              </div>
                            ))}
                            {editPreviews.length<5&&(
                              <label style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',color:C.textMuted,fontSize:'13px'}}>
                                <IC.Upload size={16} color={C.textMuted}/> {editPreviews.length>0?'추가':'이미지 변경 (선택)'}
                                <input type="file" accept="image/*" multiple onChange={e=>addEditImages(e.target.files)} style={{display:'none'}}/>
                              </label>
                            )}
                          </div>
                          {editPreviews.length>0&&<p style={{fontSize:'11px',color:C.textMuted}}>{editPreviews.length}/5장 (저장 시 기존 이미지 교체)</p>}
                        </div>
                      </div>
                      <div style={{display:'flex',gap:'8px',marginTop:'16px'}}>
                        <button onClick={handleEditSave} className="btn"
                          style={{display:'flex',alignItems:'center',gap:'6px',padding:'10px 20px',background:MINT,color:'#fff',borderRadius:'10px',fontWeight:'700',fontSize:'14px'}}>
                          <IC.Check size={14} color="#fff"/> 저장
                        </button>
                        <button onClick={()=>{setEditMode(false);setEditImages([]);setEditPreviews([]);}} className="btn"
                          style={{padding:'10px 20px',background:C.metaBg,color:C.textMuted,borderRadius:'10px',fontSize:'14px'}}>취소</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 신고 모달 ── */}
      {showReportModal&&selectedItem&&(
        <div className="overlay-enter"
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}
          onClick={()=>{setShowReportModal(false);setReportReason('');}}>
          <div className="modal-enter"
            style={{background:C.cardBg,borderRadius:'20px',width:'100%',maxWidth:'360px',padding:'28px'}}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:'16px',fontWeight:'700',color:C.text,marginBottom:'4px'}}>🚩 신고하기</h3>
            <p style={{fontSize:'13px',color:C.textMuted,marginBottom:'18px'}}>{selectedItem.name}</p>
            <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'20px'}}>
              {['허위매물','중복등록','사기의심','부적절한 내용'].map(r=>(
                <button key={r} onClick={()=>setReportReason(r)} className="btn"
                  style={{padding:'11px 14px',borderRadius:'10px',border:`2px solid ${reportReason===r?MINT:C.border}`,background:reportReason===r?(dark?'rgba(0,194,168,0.1)':'#D6F5F1'):C.metaBg,color:reportReason===r?MINT:C.textSub,fontWeight:reportReason===r?'700':'500',fontSize:'14px',textAlign:'left',cursor:'pointer'}}>
                  {r}
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>{setShowReportModal(false);setReportReason('');}} className="btn"
                style={{flex:1,padding:'11px',background:C.metaBg,color:C.textMuted,borderRadius:'10px',fontSize:'14px',fontWeight:'600'}}>취소</button>
              <button onClick={handleReport} className="btn"
                style={{flex:1,padding:'11px',background:'#EF4444',color:'#fff',borderRadius:'10px',fontWeight:'700',fontSize:'14px'}}>
                신고 접수
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 어드민 신고 목록 ── */}
      {showAdminReports&&(
        <div className="overlay-enter"
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}
          onClick={()=>setShowAdminReports(false)}>
          <div className="modal-enter"
            style={{background:C.cardBg,borderRadius:'20px',width:'100%',maxWidth:'680px',maxHeight:'80vh',overflowY:'auto',padding:'28px'}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
              <h3 style={{fontSize:'18px',fontWeight:'700',color:C.text}}>🚩 신고 목록 ({adminReports.length}건)</h3>
              <button onClick={()=>setShowAdminReports(false)} className="btn"
                style={{background:'none',border:'none',color:C.textMuted,display:'flex'}}><IC.X size={18}/></button>
            </div>
            {adminReports.length===0?(
              <p style={{textAlign:'center',padding:'40px',color:C.textMuted,fontSize:'15px'}}>신고된 상품이 없습니다.</p>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {adminReports.map(r=>(
                  <div key={r.id} style={{padding:'14px 16px',background:C.metaBg,borderRadius:'12px',border:`1px solid ${C.border}`}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'6px'}}>
                      <div>
                        <p style={{fontSize:'14px',fontWeight:'700',color:C.text,marginBottom:'4px'}}>{r.productName||`상품 #${r.productId}`}</p>
                        <span style={{display:'inline-block',background:'#FEF2F2',color:'#EF4444',fontSize:'12px',fontWeight:'700',padding:'2px 8px',borderRadius:'6px',border:'1px solid #FECACA'}}>{r.reason}</span>
                      </div>
                      <span style={{fontSize:'11px',color:C.textMuted,whiteSpace:'nowrap',marginLeft:'12px',marginTop:'2px'}}>
                        {r.createdAt?r.createdAt.slice(0,10):''}
                      </span>
                    </div>
                    <p style={{fontSize:'12px',color:C.textMuted,marginTop:'6px'}}>신고자: @{r.reporterUsername||r.reporterId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 쪽지 작성 모달 ── */}
      {showMsgModal&&msgTarget&&(
        <div className="overlay-enter"
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1200,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}
          onClick={()=>{setShowMsgModal(false);setMsgText('');}}>
          <div className="modal-enter"
            style={{background:C.cardBg,borderRadius:'20px',width:'100%',maxWidth:'400px',padding:'28px'}}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:'16px',fontWeight:'700',color:C.text,marginBottom:'4px'}}>쪽지 보내기</h3>
            <p style={{fontSize:'13px',color:C.textMuted,marginBottom:'16px'}}>
              @{msgTarget.receiverUsername} · {msgTarget.productName}
            </p>
            <textarea value={msgText} onChange={e=>setMsgText(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),handleSendMessage())}
              placeholder="메시지를 입력하세요..."
              style={{...inputStyle,resize:'none',minHeight:'100px',marginBottom:'16px'}} rows={4}/>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>{setShowMsgModal(false);setMsgText('');}} className="btn"
                style={{flex:1,padding:'11px',background:C.metaBg,color:C.textMuted,borderRadius:'10px',fontSize:'14px',fontWeight:'600'}}>취소</button>
              <button onClick={handleSendMessage} className="btn"
                style={{flex:1,padding:'11px',background:MINT,color:'#fff',borderRadius:'10px',fontWeight:'700',fontSize:'14px'}}>
                전송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const gridStyle = {display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'16px'};
