import { notFound } from "../common/errors.js";

// Shapes one tutor row into a queue list item: contact info + a summary of
// their uploaded documents, enough for an admin to triage without opening
// each one.
function shapeQueueEntry(tutor) {
  return {
    id: tutor.id,
    fullName: tutor.fullName,
    verificationStatus: tutor.verificationStatus,
    email: tutor.user.email,
    phone: tutor.user.phone,
    documents: tutor.documents.map((d) => ({ id: d.id, docType: d.docType, uploadedAt: d.uploadedAt })),
  };
}

export function createVerificationService({ repository, storageProvider }) {
  // Returns every tutor currently awaiting review, for the admin queue page.
  async function getQueue() {
    const tutors = await repository.findQueue();
    return tutors.map(shapeQueueEntry);
  }

  // Approves a tutor: flips them to VERIFIED (making them eligible to
  // appear in public search) and records an audit entry for who approved
  // them and when.
  async function approve(adminUserId, tutorId) {
    const tutor = await repository.findTutorById(tutorId);
    if (!tutor) throw notFound("Tutor not found");

    await repository.setVerificationStatus(tutorId, "VERIFIED");
    await repository.createAuditLog({
      actorId: adminUserId,
      action: "TUTOR_APPROVED",
      targetType: "Tutor",
      targetId: tutorId,
    });
    return { id: tutorId, verificationStatus: "VERIFIED" };
  }

  // Rejects a tutor with a required reason: flips them to REJECTED and
  // records the reason in the audit entry's metadata, so there's a
  // permanent record of why.
  async function reject(adminUserId, tutorId, { reason }) {
    const tutor = await repository.findTutorById(tutorId);
    if (!tutor) throw notFound("Tutor not found");

    await repository.setVerificationStatus(tutorId, "REJECTED");
    await repository.createAuditLog({
      actorId: adminUserId,
      action: "TUTOR_REJECTED",
      targetType: "Tutor",
      targetId: tutorId,
      metadata: { reason },
    });
    return { id: tutorId, verificationStatus: "REJECTED" };
  }

  // Resolves a verification document to a readable URL for an admin —
  // this is the one place PII documents get read, so it's audit-logged
  // before returning anything, unconditionally.
  async function readDocument(adminUserId, tutorId, docId) {
    const doc = await repository.findDocument(tutorId, docId);
    if (!doc) throw notFound("Document not found");

    // Audit-logged before returning anything — every verification-doc read
    // must produce exactly one AuditLog row.
    await repository.createAuditLog({
      actorId: adminUserId,
      action: "VERIFICATION_DOC_READ",
      targetType: "VerificationDoc",
      targetId: doc.id,
    });

    const readUrl = await storageProvider.getReadUrl(doc.storageKey);
    return { id: doc.id, docType: doc.docType, uploadedAt: doc.uploadedAt, readUrl };
  }

  // Lists recent audit entries (optionally filtered by targetType) with
  // the acting admin's identity attached — makes the audit trail this
  // module generates actually inspectable, not just silently written.
  async function listAuditLog(query) {
    const entries = await repository.listAuditLog(query);
    return entries.map((e) => ({
      id: e.id,
      action: e.action,
      targetType: e.targetType,
      targetId: e.targetId,
      metadata: e.metadata,
      createdAt: e.createdAt,
      actor: { id: e.actor.id, email: e.actor.email, role: e.actor.role },
    }));
  }

  return { getQueue, approve, reject, readDocument, listAuditLog };
}
