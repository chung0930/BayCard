import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Heart, MessageCircle, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const { data: userArticles, isLoading: articlesLoading } = trpc.articles.getUserArticles.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  // Favorites feature will be implemented later

  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setEditMode(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUpdateProfile = async () => {
    if (!user) return;
    await updateProfileMutation.mutateAsync({
      name,
      bio: "",
      avatar: "",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="mt-2 text-muted-foreground">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <h1 className="text-xl font-bold cursor-pointer">BayCard</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="p-6">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary"></div>
                <h2 className="text-lg font-bold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updateProfileMutation.isPending}
                      className="flex-1"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setEditMode(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setEditMode(true)} className="w-full">
                  Edit Profile
                </Button>
              )}
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-6 flex gap-4 border-b border-border">
              <button className="border-b-2 border-primary px-4 py-2 font-medium text-primary">
                My Articles
              </button>
              <button className="border-b-2 border-transparent px-4 py-2 font-medium text-muted-foreground hover:text-foreground">
                Favorites
              </button>
            </div>

            {/* Articles List */}
            <div className="space-y-4">
              {articlesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : userArticles && userArticles.length > 0 ? (
                userArticles.map((article) => (
                  <Link key={article.id} href={`/article/${article.slug}`}>
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
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
