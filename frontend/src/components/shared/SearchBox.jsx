function SearchBox() {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        className="w-44 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-800 lg:w-56"
      />
    </div>
  );
}

export default SearchBox;