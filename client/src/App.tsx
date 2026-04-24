import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import ArticleDetail from "@/pages/ArticleDetail";
import Profile from "@/pages/Profile";
import CreateArticle from "@/pages/CreateArticle";
import BoardDetail from "@/pages/BoardDetail";
import Search from "@/pages/Search";
import AdminDashboard from "@/pages/AdminDashboard";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/article/:slug" component={ArticleDetail} />
      <Route path="/board/:slug" component={BoardDetail} />
      <Route path="/search" component={Search} />
      <Route path="/profile" component={Profile} />
      <Route path="/create-article" component={CreateArticle} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
