import PropType from "prop-types";
export function PostFilter({ field, value, handleTextChange }) {
  return (
    <div>
      <label htmlFor={`filter-${field}`}>{field}</label>
      <input
        type="text"
        id={`filter-${field}`}
        name={`filter-${field}`}
        placeholder={`Filter by ${field}`}
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
      />
    </div>
  );
}

PostFilter.propTypes = {
  field: PropType.string.isRequired,
  value: PropType.string.isRequired,
  handleTextChange: PropType.func.isRequired,
};
