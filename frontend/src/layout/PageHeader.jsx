function PageHeader({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}

export default PageHeader;