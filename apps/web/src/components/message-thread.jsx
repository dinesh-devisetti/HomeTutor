// Renders a booking's message thread as chat bubbles, right-aligned for
// the current viewer's own messages. Contact-detail masking has already
// been applied server-side (messaging.service.js) by the time this
// component sees the body text — it never masks anything itself.
export function MessageThread({ messages, currentUserId }) {
  if (!messages || messages.length === 0) {
    return <p className="text-sm text-slate-500">No messages yet.</p>;
  }

  return (
    <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border border-slate-100 p-3">
      {messages.map((m) => {
        const isMine = m.senderId === currentUserId;
        return (
          <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                isMine ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
              }`}
            >
              <p>{m.body}</p>
              <p className={`mt-1 text-xs ${isMine ? "text-slate-300" : "text-slate-500"}`}>
                {new Date(m.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
