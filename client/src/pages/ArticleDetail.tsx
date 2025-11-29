import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, Tag, Share2 } from "lucide-react";

export default function ArticleDetail() {
  // In a real app, we would fetch article by ID from params
  // const [match, params] = useRoute("/articles/:id");

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />
      
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 py-12">
          
          <Link href="/articles" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
          </Link>

          <div className="space-y-6 mb-10">
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground items-center">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium text-xs">
                Pain Management
              </span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Nov 24, 2025</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5 min read</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold font-heading leading-tight text-foreground">
              How to manage recurring headaches safely
            </h1>
          </div>

          <div className="aspect-video w-full rounded-2xl overflow-hidden mb-12 relative shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1515023677547-593d9635e982?q=80&w=1200&auto=format&fit=crop" 
              alt="Person holding head in pain" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            <p className="lead text-xl text-foreground font-medium mb-6">
              Headaches are one of the most common health complaints, but understanding their triggers can be the key to finding relief without relying solely on medication.
            </p>

            <h3>Identify Your Triggers</h3>
            <p>
              The first step in managing recurring headaches is to understand what causes them. Common triggers include:
            </p>
            <ul>
              <li>Stress and anxiety</li>
              <li>Lack of sleep or irregular sleep patterns</li>
              <li>Dehydration</li>
              <li>Skipping meals</li>
              <li>Eye strain from screen time</li>
            </ul>

            <h3>Natural Relief Methods</h3>
            <p>
              Before reaching for painkillers, consider trying these natural relief methods:
            </p>
            <ol>
              <li><strong>Hydrate:</strong> Drink a large glass of water. Dehydration is a very common cause of tension headaches.</li>
              <li><strong>Rest in a dark room:</strong> If you have a migraine, light sensitivity is common. Resting in a dark, quiet room can help.</li>
              <li><strong>Cold or Warm Compress:</strong> A cold pack on the forehead can numb the pain, while a warm compress on the neck can relax tight muscles.</li>
            </ol>

            <div className="bg-muted/50 p-6 rounded-xl border-l-4 border-primary my-8">
              <h4 className="text-foreground font-bold mt-0 mb-2">When to see a doctor</h4>
              <p className="mb-0 text-sm">
                While most headaches are harmless, you should see a doctor if your headache is sudden and severe, follows a head injury, or is accompanied by fever, stiff neck, confusion, or vision changes.
              </p>
            </div>

            <h3>Lifestyle Changes for Prevention</h3>
            <p>
              Prevention is better than cure. Establishing a regular sleep schedule, managing stress through meditation or yoga, and maintaining good posture can significantly reduce the frequency of headaches.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
            <Button variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" /> Share Article
            </Button>
            <div className="text-sm text-muted-foreground italic">
              Written by Dr. Sarah Chen
            </div>
          </div>

        </article>
      </main>

      <Footer />
    </div>
  );
}
