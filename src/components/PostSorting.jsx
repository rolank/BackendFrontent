import PropTypes from "prop-types";
export function PostSorting({
  fields = [],
  value,
  handleSortBy,
  orderValue,
  handleSortOrder,
}) {
  return (
    <div>
      <label htmlFor="sortBy">Sort By: </label>
      <select
        id="sortBy"
        name="sortBy"
        value={value}
        onChange={(e) => handleSortBy(e.target.value)}
      >
        {fields.map((field) => (
          <option key={field} value={field}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </option>
        ))}
      </select>
      {" /  "}
      <label htmlFor="sortOrder">Sort Order: </label>
      <select
        id="sortOrder"
        name="sortOrder"
        value={orderValue}
        onChange={(e) => handleSortOrder(e.target.value)}
      >
        <option value={"ascending"}>Ascending</option>
        <option value={"descending"}>Descending</option>
      </select>
    </div>
  );
}

PostSorting.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string.isRequired,
  handleSortBy: PropTypes.func.isRequired,
  orderValue: PropTypes.string.isRequired,
  handleSortOrder: PropTypes.func.isRequired,
};
