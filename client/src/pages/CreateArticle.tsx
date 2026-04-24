import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function CreateArticle() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<string>("");

  const { data: boards, isLoading: boardsLoading } = trpc.boards.list.useQuery();

  const createArticleMutation = trpc.articles.create.useMutation({
    onSuccess: (data) => {
      toast.success("Article published successfully");
      setLocation(`/article/${data.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    if (!selectedBoard) {
      toast.error("Please select a board");
      return;
    }

    const board = boards?.find((b) => b.slug === selectedBoard);
    if (!board) {
      toast.error("Invalid board selected");
      return;
    }

    await createArticleMutation.mutateAsync({
      title,
      content,
      excerpt: excerpt || content.substring(0, 100),
      boardId: board.id,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="mt-2 text-muted-foreground">You need to be logged in to create an article.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold">BayCard</h1>
          <span className="text-sm text-muted-foreground">{user?.name}</span>
        </div>
      </header>

      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <Card className="p-6">
            <h1 className="mb-6 text-2xl font-bold">Create New Article</h1>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>
                <Input
                  placeholder="Article title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Board Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium">Board</label>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                >
                  <option value="">Select a board...</option>
                  {boardsLoading ? (
                    <option disabled>Loading boards...</option>
                  ) : (
                    boards?.map((board) => (
                      <option key={board.id} value={board.slug}>
                        {board.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Excerpt */}
              <div>
                <label className="mb-2 block text-sm font-medium">Excerpt (optional)</label>
                <Input
                  placeholder="Brief summary of your article..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              {/* Content */}
              <div>
                <label className="mb-2 block text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Write your article content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handlePublish}
                  disabled={createArticleMutation.isPending}
                  className="flex-1"
                >
                  {createArticleMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Article"
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
