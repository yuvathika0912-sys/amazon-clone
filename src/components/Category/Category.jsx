
import "./Category.css";

const categories = [
  { label: "All", value: "All", color: "all" },
  {
    label: "Electronics",
    value: "Electronics",
    color: "electronics",
  },
  {
    label: "Fashion",
    value: "Fashion",
    color: "fashion",
  },
  {
    label: "Beauty",
    value: "beauty",
    color: "beauty",
  },
  {
    label: "Mobiles",
    value: "Mobiles",
    color: "mobiles",
  },
  {
    label: "Groceries",
    value: "groceries",
    color: "groceries",
  },
  {
    label: "Books",
    value: "books",
    color: "books",
  },
];

function Category({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="category">
      {categories.map((category) => {
        const isActive =
          String(selectedCategory).toLowerCase() ===
          category.value.toLowerCase();

        return (
          <button
            type="button"
            key={category.value}
            className={`categoryBtn category-${category.color} ${
              isActive ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.value)}
            aria-pressed={isActive}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

export default Category;
