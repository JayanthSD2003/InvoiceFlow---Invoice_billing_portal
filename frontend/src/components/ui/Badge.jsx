function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    warning:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    danger:
      'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default Badge;