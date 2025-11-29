import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SymptomChecker } from "@/components/SymptomChecker";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
          {/* Abstract Background Elements */}
          <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" />
          
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Column: Text */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8 text-center lg:text-left"
              >
                <div className="space-y-4">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-accent/50 text-accent-foreground font-medium text-sm tracking-wide border border-accent/20">
                    ✨ AI-Powered Health Assistant
                  </span>
                  <h1 className="text-4xl lg:text-6xl font-bold font-heading text-foreground leading-[1.1]">
                    Health made simple with <span className="text-primary">Cura Gennie</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Understand what your symptoms could mean, how to take care of yourself, and which doctor to talk to—all in one place.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Trusted by 10k+ users</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Symptom Checker Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                {/* Decorative blob behind card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-xl transform scale-105" />
                
                <SymptomChecker />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features / Value Props Section (Optional but good for "landing page" feel) */}
        <section className="py-20 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🔍",
                  title: "Smart Analysis",
                  desc: "Get instant insights about your symptoms powered by advanced AI."
                },
                {
                  icon: "🛡️",
                  title: "Privacy First",
                  desc: "Your health data is private. We don't store your personal medical history."
                },
                {
                  icon: "👨‍⚕️",
                  title: "Expert Connections",
                  desc: "Find the right specialist nearby when you need professional help."
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
