import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Heart, MessageCircle, Eye, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const { data: allArticles } = trpc.articles.list.useQuery({
    limit: 1000,
  });

  const results = useMemo(() => {
    if (!query.trim() || !allArticles) return [];
    
    const lowerQuery = query.toLowerCase();
    return allArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.content.toLowerCase().includes(lowerQuery)
    );
  }, [query, allArticles]);

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
        <div className="mx-auto max-w-2xl">
          {/* Search Box */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="搜尋文章標題或內容..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Results */}
          <div>
            {query.trim() === "" ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">輸入關鍵字開始搜尋</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  找到 {results.length} 篇文章
                </p>
                {results.map((article) => (
                  <Link key={article.id} href={`/article/${article.slug}`}>
                    <Card className="cursor-pointer p-4 hover:shadow-md transition-shadow">
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
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">未找到相關文章</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
