import { useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: article, isLoading } = trpc.articles.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  ) as any;

  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      setCommentContent("");
      toast.success("Comment posted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleLikeMutation = trpc.likes.toggleArticleLike.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleFavoriteMutation = trpc.favorites.toggle.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!commentContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (!article) return;

    setIsSubmittingComment(true);
    try {
      await createCommentMutation.mutateAsync({
        articleId: article.id,
        content: commentContent,
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Article not found</h1>
          <p className="mt-2 text-muted-foreground">The article you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold">BayCard</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <span className="text-sm text-muted-foreground">{user?.name}</span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <main className="lg:col-span-2">
            <article className="card-base">
              {/* Article Header */}
              <div className="mb-6" key="article-header">
                <h1 className="mb-4 text-3xl font-bold">{article.title as string}</h1>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="badge">Board</span>
                    <span>{article.author?.name || "Anonymous"}</span>
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Article Images */}
              {article.images && Array.isArray(article.images) && article.images.length > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-4">
                  {(article.images as string[]).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Article image ${idx + 1}`}
                      className="rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-sm mb-6 max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: article.content as string,
                }}
              />
              </div>

              {/* Article Actions */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error("Please sign in");
                        return;
                      }
                      toggleLikeMutation.mutate({ articleId: article.id });
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-secondary"
                  >
                    <Heart
                      className={`h-5 w-5 ${article.isLiked ? "fill-current text-red-500" : ""}`}
                    />
                    <span>{article.likeCount}</span>
                  </button>

                  <button className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-secondary">
                    <MessageCircle className="h-5 w-5" />
                    <span>{article.commentCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error("Please sign in");
                        return;
                      }
                      toggleFavoriteMutation.mutate({ articleId: article.id });
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-secondary"
                  >
                    <Bookmark
                      className={`h-5 w-5 ${article.isFavorited ? "fill-current" : ""}`}
                    />
                  </button>

                  <button className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-secondary">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold">Comments</h2>

              {/* Comment Form */}
              {isAuthenticated && (
                <Card className="mb-6 p-4">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="mb-4"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment || !commentContent.trim()}
                    >
                      {isSubmittingComment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        "Post Comment"
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {article.comments && article.comments.length > 0 ? (
                  article.comments.map((comment: any) => (
                    <Card key={comment.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">User</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 text-sm">{comment.content}</p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <button className="flex items-center gap-1 hover:text-foreground">
                              <Heart className="h-4 w-4" />
                              {comment.likeCount}
                            </button>
                            <button className="hover:text-foreground">Reply</button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No comments yet</p>
                )}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="mb-4 font-semibold">Article Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Views</span>
                  <p className="font-semibold">{article.viewCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Likes</span>
                  <p className="font-semibold">{article.likeCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Comments</span>
                  <p className="font-semibold">{article.commentCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Author</span>
                  <p className="font-semibold">{article.author?.name}</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
