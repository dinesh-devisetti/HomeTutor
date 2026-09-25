// Wraps the public tutor search endpoint.
export function createSearchApi(client) {
  return {
    // Searches tutors by subject/gradeLevel/mode/price filters (all
    // optional) — params go as query string, not a body. Geographic
    // "near me" filtering is a future feature.
    tutors: (params) => client.get("/search/tutors", { params }),
  };
}
