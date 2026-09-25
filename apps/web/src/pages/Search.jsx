import { useState } from "react";
import { api } from "../lib/api.js";
import { useQuery } from "../lib/use-query.js";
import { SearchFilters } from "../components/search-filters.jsx";
import { TutorCard } from "../components/tutor-card.jsx";

const EMPTY_FILTERS = { subject: "", gradeLevel: "", mode: "", maxPrice: "" };

// Converts the draft filter form values into the query params the API
// expects — drops empty fields, and converts the rupee price shown in the
// UI to the paise integer the API works in.
function toQueryParams(filters) {
  const params = {};
  if (filters.subject) params.subject = filters.subject;
  if (filters.gradeLevel) params.gradeLevel = filters.gradeLevel;
  if (filters.mode) params.mode = filters.mode;
  if (filters.maxPrice) params.maxPrice = String(Number(filters.maxPrice) * 100);
  return params;
}

// Public tutor search page: filter form + results grid. Re-queries only
// when "Search" is submitted, not on every keystroke.
export function Search() {
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  const {
    data: results,
    loading,
    error,
  } = useQuery(() => api.search.tutors(toQueryParams(appliedFilters)), [JSON.stringify(appliedFilters)]);

  // Applies the current draft filters, triggering a new search.
  function handleSubmit(e) {
    e.preventDefault();
    setAppliedFilters(draftFilters);
  }

  // Updates one field in the draft filter form.
  function updateFilter(key, value) {
    setDraftFilters((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Search tutors</h1>
      <SearchFilters filters={draftFilters} onChange={updateFilter} onSubmit={handleSubmit} />

      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {results && results.length === 0 && <p className="text-slate-500">No tutors found.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {results?.map((result) => (
          <TutorCard key={`${result.tutorId}-${result.subject}-${result.mode}`} result={result} />
        ))}
      </div>
    </div>
  );
}
