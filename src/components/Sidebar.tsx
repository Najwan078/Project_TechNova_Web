import { useState, useEffect } from 'react';
import logoKampus from '../assets/Logo_Technova_University.png';

interface SidebarProps {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isLightMode?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const menuItems = [
  {
    id: 'beranda',
    label: 'Beranda',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'pencarian',
    label: 'Pencarian Data',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
    ),
  },
  {
    id: 'about',
    label: 'About Us',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </svg>
    ),
  },
  {
    id: 'contact',
    label: 'Contact Us',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
];

export default function Sidebar({ activeMenu, onMenuClick, isMobileOpen, onMobileClose, isLightMode = false, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const handleMenuClick = (id: string) => {
    onMenuClick(id);
    onMobileClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`px-4 py-5 border-b border-white/[0.06] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img
              src={logoKampus}
              alt="Logo"
              className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
              style={{ filter: isLightMode ? 'invert(1) hue-rotate(180deg)' : 'none' }}
            />
            <div>
              <h3 className="font-[Outfit] font-bold text-white text-base leading-tight">TechNova</h3>
              <p className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-semibold">University</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <img
            src={logoKampus}
            alt="Logo"
            className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
            style={{ filter: isLightMode ? 'invert(1) hue-rotate(180deg)' : 'none' }}
          />
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {isCollapsed
                ? <path d="m9 18 6-6-6-6"/>
                : <path d="m15 18-6-6 6-6"/>}
            </svg>
          </button>
        )}
      </div>

      {/* Menu Label */}
      {!isCollapsed && (
        <div className="px-6 pt-6 pb-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-medium">Menu Utama</p>
        </div>
      )}

      {/* Menu Items */}
      <nav className={`px-3 space-y-1 mt-${isCollapsed ? '4' : '0'}`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
              isCollapsed ? 'justify-center' : ''
            } ${
              activeMenu === item.id
                ? 'bg-cyan-400/[0.08] text-cyan-400 border border-cyan-400/20 shadow-[0_0_15px_rgba(0,229,255,0.08)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <span className={`transition-all duration-300 flex-shrink-0 ${
              activeMenu === item.id
                ? 'drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]'
                : 'group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]'
            }`}>
              {item.icon}
            </span>
            {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
            {!isCollapsed && activeMenu === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
            )}
          </button>
        ))}
      </nav>
      <div className="flex-1" />
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 left-0 shrink-0 border-r border-white/[0.08] z-30 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
        style={{
          background: 'rgba(6, 6, 26, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '2px 0 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* MOBILE OVERLAY */}
      <div
        className="fixed inset-0 z-40 lg:hidden transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          opacity: isMobileOpen ? 1 : 0,
          pointerEvents: isMobileOpen ? 'auto' : 'none',
        }}
        onClick={onMobileClose}
      />

      {/* MOBILE SIDEBAR */}
      <aside
        className="fixed top-0 left-0 h-full w-64 z-50 lg:hidden flex flex-col border-r border-white/[0.08]"
        style={{
          background: 'rgba(6, 6, 26, 0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isMobileOpen ? '4px 0 40px rgba(0, 229, 255, 0.08), 4px 0 80px rgba(0, 0, 0, 0.5)' : 'none',
        }}
      >
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all duration-300 z-10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}