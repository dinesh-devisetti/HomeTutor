// Students controllers: no path/middleware knowledge here, that lives in
// students.routes.js.
export function createStudentsController({ studentsService }) {
  return {
    // Adds a child under the logged-in parent's account (parent-only —
    // a tutor or admin creating "a student" wouldn't make sense here).
    async create(req, res) {
      const student = await studentsService.create(req.user.id, req.body);
      res.status(201).json(student);
    },

    // Lists the caller's own children.
    async listMine(req, res) {
      res.status(200).json(await studentsService.listMine(req.user.id));
    },

    // Reads one student by id — any authenticated role can call this,
    // but the service enforces that only that student's own guardian may
    // actually see the record (cross-parent lookups are rejected there).
    async getById(req, res) {
      const student = await studentsService.getById(req.user.id, req.params.id);
      res.status(200).json(student);
    },
  };
}
