type FilterOption = { value: string; label: string };
type FilterControl = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};
type Props = {
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  resultLabel: string;
  filters?: FilterControl[];
};

export default function AdminListToolbar({
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  resultCount,
  resultLabel,
  filters = [],
}: Props) {
  return (
    <div className="admin-list-toolbar">
      <label className="admin-list-search">
        <span>{searchLabel}</span>
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
        />
      </label>
      {filters.map((filter) => (
        <label className="admin-list-filter" key={filter.label}>
          <span>{filter.label}</span>
          <select value={filter.value} onChange={(event) => filter.onChange(event.target.value)}>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <p className="admin-list-result-count" aria-live="polite">
        {resultCount} {resultLabel}
      </p>
    </div>
  );
}
