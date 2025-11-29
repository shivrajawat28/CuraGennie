import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SymptomResults from "@/pages/SymptomResults";
import Doctors from "@/pages/Doctors";
import Articles from "@/pages/Articles";
import ArticleDetail from "@/pages/ArticleDetail";
import ConditionDetail from "@/pages/ConditionDetail";
import { Header } from "@/components/Header"; // For About page placeholder

function About() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-20 max-w-3xl text-center space-y-8">
        <h1 className="text-4xl font-bold font-heading">About Cura Gennie</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Cura Gennie was born from a simple idea: health information should be accessible, friendly, and calm.
        </p>
        <p className="text-lg text-muted-foreground">
          We use advanced AI to help you understand your symptoms, but we believe technology should never replace the human touch of a doctor. We are here to bridge the gap—giving you the knowledge you need to have better conversations with your healthcare providers.
        </p>
        <div className="p-6 bg-accent/20 rounded-xl border border-accent/40 inline-block">
          <p className="font-medium text-accent-foreground">
            Mission: To empower 1 billion people with instant, reliable health guidance.
          </p>
        </div>
      </main>
    </div>
  );
}


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/symptom-checker" component={Home} />
      <Route path="/results" component={SymptomResults} />
      <Route path="/doctors" component={Doctors} />
      <Route path="/articles" component={Articles} />
      <Route path="/articles/:id" component={ArticleDetail} />
      <Route path="/conditions/:slug" component={ConditionDetail} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
