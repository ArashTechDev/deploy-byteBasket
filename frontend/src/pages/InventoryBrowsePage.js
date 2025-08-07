import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import { useTranslation } from "react-i18next";
import InventoryService from "../services/inventoryService";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const InventoryBrowsePage = ({ onNavigate }) => {
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [dietaryCategories, setDietaryCategories] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Load categories and dietary categories on mount
  useEffect(() => {
    InventoryService.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));

    InventoryService.getDietaryCategories()
      .then(setDietaryCategories)
      .catch(() => setDietaryCategories([]));
  }, []);

  // Load inventory items when filters/search/page change
  useEffect(() => {
    setLoading(true);

    InventoryService.getAll({
      category: selectedCategories.length ? selectedCategories.join(",") : undefined,
      dietary: selectedDietary.length ? selectedDietary.join(",") : undefined,
      search: debouncedSearchTerm || undefined,
      page,
      pageSize,
    })
      .then(({ items, pagination }) => {
        setItems(items);
        setTotalPages(pagination.totalPages || 1);
      })
      .catch(() => {
        setItems([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [selectedCategories, selectedDietary, debouncedSearchTerm, page]);

  const toggleCategory = (cat) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDietary = (diet) => {
    setPage(1);
    setSelectedDietary((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentPage="inventory" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <h1 className="text-4xl font-extrabold mb-10 text-gray-900 tracking-tight">
          {t("inventoryBrowseTitle", "Browse Available Food Items")}
        </h1>

        {/* Search Input */}
        <input
          type="text"
          placeholder={t("searchPlaceholder", "Search items...")}
          className="w-full max-w-xl p-3 mb-10 border border-gray-300 rounded-full focus:outline-none focus:ring-4 focus:ring-orange-400 shadow-sm transition"
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          aria-label={t("searchAriaLabel", "Search inventory items")}
        />

        <div className="flex flex-col md:flex-row gap-10">
          {/* Filters Panel */}
          <aside className="md:w-72 flex-shrink-0 bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
            <h2 className="font-semibold mb-5 text-gray-800 text-lg tracking-wide">
              {t("filterByCategory", "Filter by Category")}
            </h2>
            <div className="max-h-52 overflow-y-auto mb-10 space-y-3">
              {categories.length === 0 && (
                <p className="text-gray-400 italic">{t("noCategories", "No categories found.")}</p>
              )}
              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center cursor-pointer text-gray-700 select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="mr-3 accent-orange-400 rounded"
                  />
                  <span className="capitalize">{cat}</span>
                </label>
              ))}
            </div>

            <h2 className="font-semibold mb-5 text-gray-800 text-lg tracking-wide">
              {t("filterByDietary", "Filter by Dietary Restriction")}
            </h2>
            <div className="max-h-52 overflow-y-auto space-y-3">
              {dietaryCategories.length === 0 && (
                <p className="text-gray-400 italic">{t("noDietary", "No dietary categories.")}</p>
              )}
              {dietaryCategories.map((diet) => (
                <label
                  key={diet}
                  className="flex items-center cursor-pointer text-gray-700 select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedDietary.includes(diet)}
                    onChange={() => toggleDietary(diet)}
                    className="mr-3 accent-orange-400 rounded"
                  />
                  <span className="capitalize">{diet}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Items Grid */}
          <section className="flex-1">
            {loading ? (
              <p className="text-center py-20 text-gray-600 font-medium tracking-wide text-lg">
                {t("loading", "Loading...")}
              </p>
            ) : items.length === 0 ? (
              <p className="text-center py-20 text-gray-600 font-medium tracking-wide text-lg">
                {t("noItemsFound", "No items found.")}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-6 shadow-lg flex flex-col transform hover:scale-[1.03] transition-transform cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") onNavigate("itemDetails", { id: item.id });
                    }}
                    onClick={() => onNavigate("itemDetails", { id: item.id })}
                  >
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="w-full h-44 object-cover rounded-2xl mb-5"
                      loading="lazy"
                    />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">{t("categoryLabel", "Category")}: </span>
                      <span className="capitalize">{item.category}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">{t("quantityLabel", "Quantity")}: </span>
                      {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{t("expirationLabel", "Expiration")}: </span>
                      {item.expirationDate
                        ? new Date(item.expirationDate).toLocaleDateString()
                        : t("notAvailable", "N/A")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 mt-14">
                <button
                  onClick={goPrev}
                  disabled={page === 1}
                  className={`px-7 py-3 rounded-full border-2 border-orange-500 text-orange-500 font-semibold transition ${
                    page === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-orange-500 hover:text-white"
                  }`}
                >
                  {t("previous", "Previous")}
                </button>
                <span className="text-gray-700 font-semibold tracking-wide">
                  {t("pageLabel", "Page")} {page} {t("ofLabel", "of")} {totalPages}
                </span>
                <button
                  onClick={goNext}
                  disabled={page === totalPages}
                  className={`px-7 py-3 rounded-full border-2 border-orange-500 text-orange-500 font-semibold transition ${
                    page === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-orange-500 hover:text-white"
                  }`}
                >
                  {t("next", "Next")}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default InventoryBrowsePage;
