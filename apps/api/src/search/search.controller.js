// Search controllers: no path/middleware knowledge here, that lives in
// search.routes.js.
export function createSearchController({ searchService }) {
  return {
    // Public tutor search — filter by subject/grade/mode/price/geo-radius,
    // with unverified tutors excluded at the query level (search.model.js).
    async searchTutors(req, res) {
      res.status(200).json(await searchService.searchTutors(req.query));
    },
  };
}
