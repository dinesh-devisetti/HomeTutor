// Users controllers: the caller's own profile — no path/middleware
// knowledge here, that lives in users.routes.js.
export function createUsersController({ usersService }) {
  return {
    // Returns the logged-in caller's own profile — the simplest possible
    // proof that the JWT + guard chain works end to end.
    async getMe(req, res) {
      const me = await usersService.getMe(req.user.id);
      res.status(200).json(me);
    },

    // Lets the logged-in caller update their own display name.
    async updateMe(req, res) {
      const me = await usersService.updateMe(req.user.id, req.body);
      res.status(200).json(me);
    },
  };
}
