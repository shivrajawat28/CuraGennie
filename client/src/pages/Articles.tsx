import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const MOCK_ARTICLES = [
  {
    id: 1,
    title: "How to manage recurring headaches safely",
    description: "Understanding the triggers of migraines and tension headaches, and natural ways to reduce frequency.",
    category: "Pain Management",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1515023677547-593d9635e982?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Understanding seasonal allergies vs. cold",
    description: "Key differences between allergy symptoms and the common cold to help you choose the right treatment.",
    category: "Respiratory Health",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "5 Daily habits for better heart health",
    description: "Simple lifestyle changes you can make today to improve your cardiovascular health significantly.",
    category: "Heart Health",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1571019611242-c8c3bdd92552?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "The importance of hydration during fever",
    description: "Why fluids are critical when you're sick and what are the best drinks to stay hydrated.",
    category: "Wellness",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1543599538-a6c4f6cc5c05?q=80&w=800&auto=format&fit=crop"
  }
];

export default function Articles() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h1 className="text-4xl font-bold font-heading">Health Guides & Articles</h1>
            <p className="text-lg text-muted-foreground">
              Expert-curated content to help you understand your body and live a healthier life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {MOCK_ARTICLES.map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} className="group block h-full cursor-pointer">
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all border-border/50 bg-card/50 group-hover:bg-card">
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <Badge className="absolute top-4 left-4 bg-white/90 text-black hover:bg-white">
                        {article.category}
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        <span>{article.readTime}</span>
                        <span>Nov 24, 2025</span>
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors leading-tight">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base line-clamp-3">
                        {article.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
              </Link>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
