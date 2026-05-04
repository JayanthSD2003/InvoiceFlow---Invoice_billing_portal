import useLayout from '../features/hooks/useLayout';

function MobileSidebarOverlay() {
  const { sidebarOpen, closeSidebar } = useLayout();

  return (
    <button
      type="button"
      aria-label="Close sidebar"
      onClick={closeSidebar}
      className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
        sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    />
  );
}

export default MobileSidebarOverlay;