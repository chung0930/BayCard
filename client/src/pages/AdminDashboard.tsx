import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, FileText, MessageSquare, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">You do not have permission to access this page.</p>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-bold">BayCard Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              Exit Admin
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="mt-2 text-muted-foreground">管理系統和內容</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/users">
            <Card className="cursor-pointer p-6 hover:shadow-lg transition-shadow">
              <Users className="mb-4 h-8 w-8 text-primary" />
              <h3 className="font-semibold">User Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage users and permissions
              </p>
            </Card>
          </Link>

          <Link href="/admin/articles">
            <Card className="cursor-pointer p-6 hover:shadow-lg transition-shadow">
              <FileText className="mb-4 h-8 w-8 text-primary" />
              <h3 className="font-semibold">Article Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Review and delete articles
              </p>
            </Card>
          </Link>

          <Link href="/admin/comments">
            <Card className="cursor-pointer p-6 hover:shadow-lg transition-shadow">
              <MessageSquare className="mb-4 h-8 w-8 text-primary" />
              <h3 className="font-semibold">Comment Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Moderate comments
              </p>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="cursor-pointer p-6 hover:shadow-lg transition-shadow">
              <Settings className="mb-4 h-8 w-8 text-primary" />
              <h3 className="font-semibold">System Settings</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Configure system
              </p>
            </Card>
          </Link>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
          <Card className="p-6">
            <p className="text-muted-foreground">Activity logs will appear here</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
