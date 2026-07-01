import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 pb-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
        <MessageCircle className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-xl font-bold">Chat del torneo</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Próximamente podrás chatear con los participantes de tus torneos de EA
        SPORTS FC.
      </p>
    </div>
  );
}
