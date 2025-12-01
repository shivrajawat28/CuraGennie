import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MOCK_ANALYSIS_RESULT, MOCK_DOCTORS } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Calendar, Video, MapPin, Star, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function SymptomResults() {
  const { toast } = useToast();
  
  // In a real app, we would parse the location search params or use context state
  // const [location] = useLocation();
  
  const result = MOCK_ANALYSIS_RESULT;

  const handleBook = (doctorName: string) => {
    toast({
      title: "Appointment Request Sent",
      description: `We've notified ${doctorName}. You'll receive a confirmation shortly.`,
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Back Button */}
          <Link href="/symptom-checker">
             <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary mb-6 ml-2 group">
               <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
               <span className="group-hover:underline transition-all">Back to Symptom Entry</span>
             </Button>
          </Link>

          {/* Header Section */}
          <div className="space-y-2 text-center pb-4">
            <h1 className="text-3xl md:text-4xl font-bold font-heading">Based on your inputs, here's what we found</h1>
            <p className="text-muted-foreground">AI-powered analysis of your symptoms.</p>
          </div>

          {/* Section 1: Possible Conditions */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertCircle className="text-primary w-5 h-5" />
                Possible Conditions
              </h2>
            </div>

            <div className="grid gap-6">
              {result.conditions.map((condition, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {/* Make the card clickable linking to detail page */}
                  <Link href={`/conditions/${idx === 0 ? 'viral-upper-respiratory-infection' : 'seasonal-allergies'}`}>
                    <Card className="overflow-hidden border-l-4 border-l-primary shadow-md hover:shadow-xl hover:border-teal-200 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all cursor-pointer group bg-card/50 hover:-translate-y-0.5 duration-200">
                      <CardHeader className="pb-3 bg-muted/10 group-hover:bg-primary/5 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">{condition.name}</CardTitle>
                            <CardDescription>{condition.description}</CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={condition.severity === 'high' ? 'destructive' : 'secondary'} className="uppercase tracking-wider text-[10px]">
                              {condition.severity} Severity
                            </Badge>
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                              <span>Match</span>
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${condition.probability}%` }}
                                />
                              </div>
                              <span>{condition.probability}%</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-sm text-primary font-medium flex items-center gap-1 group-hover:text-primary/80 group-hover:underline transition-all">
                           Tap to see full details and guidance <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 2: Summary Box */}
          <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-lg">Analysis Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Primary Suspect</span>
                <p className="font-semibold text-primary mt-1">{result.conditions[0].name}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Severity</span>
                <p className="font-semibold text-foreground mt-1 capitalize">{result.conditions[0].severity}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Recommended Specialist</span>
                <p className="font-semibold text-foreground mt-1">{result.recommendedSpecialist}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Action</span>
                <p className="font-semibold text-foreground mt-1">Consult Doctor</p>
              </div>
            </div>
          </section>

          {/* Section 3: Doctor Recommendation */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recommended Specialists</h2>
              <Button variant="link" className="text-primary">View all doctors</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {MOCK_DOCTORS.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-md transition-all">
                  <div className="h-32 overflow-hidden relative">
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    <Badge className="absolute top-2 right-2 bg-white/90 text-black backdrop-blur-sm hover:bg-white">
                      <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" /> {doctor.rating}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <CardDescription className="text-primary font-medium">{doctor.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {doctor.location} ({doctor.distance})
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Calendar className="w-4 h-4" /> {doctor.availability}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-0">
                    <Button className="flex-1" onClick={() => handleBook(doctor.name)}>Book</Button>
                    <Button variant="outline" size="icon" disabled title="Video consult coming soon">
                      <Video className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive/90">
              <strong>Important Disclaimer:</strong> This analysis is generated by AI and is NOT a medical diagnosis. 
              It should not replace professional medical advice. If you have severe symptoms, please visit the nearest hospital immediately.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
