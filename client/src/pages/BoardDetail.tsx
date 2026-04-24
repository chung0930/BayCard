import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Heart, MessageCircle, Eye } from "lucide-react";
import { Link, useParams } from "wouter";

export default function BoardDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const { data: articles, isLoading } = trpc.articles.list.useQuery(
    { boardSlug: slug, limit: 20 },
    { enabled: !!slug }
  );

  const { data: boards } = trpc.boards.list.useQuery();
  const currentBoard = boards?.find((b) => b.slug === slug);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <h1 className="text-xl font-bold cursor-pointer">BayCard</h1>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/create-article">
                  <Button size="sm">New Article</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    {user.name}
                  </Button>
                </Link>
              </>
            ) : (
              <Button size="sm">Sign In</Button>
            )}
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar - Boards */}
          <aside className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="mb-4 font-semibold">看板</h3>
              <div className="space-y-2">
                {boards?.map((board) => (
                  <Link key={board.id} href={`/board/${board.slug}`}>
                    <div
                      className={`cursor-pointer rounded px-3 py-2 text-sm transition-colors ${
                        slug === board.slug
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {board.name}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Board Header */}
            {currentBoard && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold">{currentBoard.name}</h1>
                <p className="mt-2 text-muted-foreground">
                  {currentBoard.description}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {articles?.length || 0} articles
                </p>
              </div>
            )}

            {/* Articles List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : articles && articles.length > 0 ? (
                articles.map((article) => (
                  <Link key={article.id} href={`/article/${article.slug}`}>
                    <Card className="cursor-pointer p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                            {article.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {article.excerpt || article.content.substring(0, 100)}
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
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
                  <p className="text-muted-foreground">No articles in this board yet</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
