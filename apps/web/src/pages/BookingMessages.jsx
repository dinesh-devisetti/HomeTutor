import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea } from "@hometutoring/ui";
import { api } from "../lib/api.js";
import { useQuery } from "../lib/use-query.js";
import { useMutation } from "../lib/use-mutation.js";
import { useAuth } from "../context/auth-context.jsx";
import { MessageThread } from "../components/message-thread.jsx";

// A booking's message thread — send/list REST calls, masking handled
// entirely server-side so this page just renders whatever body text comes back.
export function BookingMessages() {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    data: messages,
    loading,
    error,
    refetch,
  } = useQuery(() => api.messages.list(id), [id]);
  const [body, setBody] = useState("");
  const sendMessage = useMutation((input) => api.messages.send(id, input));

  // Sends the composed message, clears the box, and refetches the thread.
  async function handleSend(e) {
    e.preventDefault();
    if (!body.trim()) return;
    await sendMessage.mutate({ body });
    setBody("");
    refetch();
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link to={`/bookings/${id}`} className="text-sm text-slate-500 underline">
          ← Back to booking
        </Link>

        {loading && <p className="text-slate-500">Loading...</p>}
        {error && <p className="text-red-600">{error.message}</p>}

        <MessageThread messages={messages} currentUserId={user?.id} />

        <form onSubmit={handleSend} className="space-y-2">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message..." />
          {sendMessage.error && <p className="text-sm text-red-600">{sendMessage.error.message}</p>}
          <Button type="submit" disabled={sendMessage.loading}>
            {sendMessage.loading ? "Sending..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
