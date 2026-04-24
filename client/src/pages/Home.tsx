import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Heart, MessageCircle, Eye } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useEffect, useState } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeBoard, setActiveBoard] = useState<string | null>(null);

  const { data: boards, isLoading: boardsLoading } = trpc.boards.list.useQuery();
  const { data: hotArticles, isLoading: articlesLoading } = trpc.articles.hot.useQuery({
    limit: 10,
  });
  const { data: announcements } = trpc.announcements.list.useQuery();

  useEffect(() => {
    if (boards && boards.length > 0 && !activeBoard) {
      setActiveBoard(boards[0].slug);
    }
  }, [boards, activeBoard]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary"></div>
            <h1 className="text-xl font-bold">BayCard</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Sign In</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {announcements && announcements.length > 0 && (
        <div className="border-b border-border bg-accent/5 py-3">
          <div className="container">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="text-sm text-foreground">
                <span className="font-semibold">{announcement.title}:</span> {announcement.content}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="card-base">
              <h2 className="mb-4 font-semibold">Boards</h2>
              <div className="space-y-2">
                {boardsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : boards && boards.length > 0 ? (
                  boards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => setActiveBoard(board.slug)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        activeBoard === board.slug
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {board.icon && <span className="mr-2">{board.icon}</span>}
                      {board.name}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No boards</p>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <div className="mt-4">
                <Link href="/create-article">
                  <Button className="w-full">New Article</Button>
                </Link>
              </div>
            )}
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6 flex gap-4 border-b border-border">
              <button className="border-b-2 border-primary px-4 py-2 font-medium text-primary">
                Hot
              </button>
              <button className="border-b-2 border-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground">
                Latest
              </button>
            </div>

            <div className="space-y-4">
              {articlesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : hotArticles && hotArticles.length > 0 ? (
                hotArticles.map((article) => (
                  <Link key={article.id} href={`/article/${article.slug}`}>
                    <Card className="card-hover p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                            {article.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {article.excerpt || article.content.substring(0, 100)}
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="badge">Board</span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {article.viewCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {article.likeCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {article.commentCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">No articles yet</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
