export function createSearchService({ repository }) {
  // Runs the search query and shapes each row for the response — one row
  // per matching tutor+subject pair (a tutor offering 3 subjects that all
  // match shows up 3 times, once per subject, which is what a results grid
  // wants).
  async function searchTutors(query) {
    const rows = await repository.searchTutors(query);
    return rows.map((r) => ({
      tutorId: r.tutorId,
      fullName: r.fullName,
      bio: r.bio,
      subject: r.subject,
      gradeLevel: r.gradeLevel,
      ratePaisePerHour: r.ratePaisePerHour,
      mode: r.mode,
    }));
  }

  return { searchTutors };
}
