// Verification controllers: no path/middleware knowledge here, that lives
// in verification.routes.js.
export function createVerificationController({ verificationService }) {
  return {
    // Lists tutors awaiting review — the admin's work queue.
    async getQueue(req, res) {
      res.status(200).json(await verificationService.getQueue());
    },

    // Approves a tutor, making them eligible for public search results.
    async approve(req, res) {
      res.status(200).json(await verificationService.approve(req.user.id, req.params.tutorId));
    },

    // Rejects a tutor with a required reason (kept in the audit trail).
    async reject(req, res) {
      res.status(200).json(await verificationService.reject(req.user.id, req.params.tutorId, req.body));
    },

    // Reads one verification document — every call here writes an
    // audit-log row before returning the file, per the "every
    // verification-doc read is audited" domain rule.
    async readDocument(req, res) {
      const doc = await verificationService.readDocument(req.user.id, req.params.tutorId, req.params.docId);
      res.status(200).json(doc);
    },

    // Lists recent audit-log entries (optionally filtered by
    // targetType) — makes the audit trail this module and others write
    // to actually reviewable by an admin, not just silently generated.
    async listAuditLog(req, res) {
      res.status(200).json(await verificationService.listAuditLog(req.query));
    },
  };
}
