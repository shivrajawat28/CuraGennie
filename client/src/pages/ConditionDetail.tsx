import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MOCK_CONDITION_DETAILS, MOCK_DOCTORS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle2, Heart, MapPin, Shield, Star, Users, Video } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ConditionDetail() {
  const [match, params] = useRoute("/conditions/:slug");
  const { toast } = useToast();

  // In a real app, we would fetch from backend using the slug
  // For mock, we'll just grab the first one or find by slug if we had a proper slug system
  const condition = MOCK_CONDITION_DETAILS[0]; // Defaulting to Viral Fever for demo

  const handleBook = (doctorName: string) => {
    toast({
      title: "Appointment Request Sent",
      description: `We've notified ${doctorName}. You'll receive a confirmation shortly.`,
    });
  };

  if (!condition) return <div>Condition not found</div>;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Back Button */}
          <Link href="/results">
            <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="w-4 h-4" /> Back to Results
            </Button>
          </Link>

          {/* 1) Condition Overview */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-primary">
                {condition.name}
              </h1>
              <Badge variant={condition.severity === 'high' ? 'destructive' : 'secondary'} className="uppercase tracking-wider">
                {condition.severity} Severity
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {condition.overview}
            </p>
          </section>

          {/* 2) Causes & Effects */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              How does this condition happen?
            </h2>
            <ul className="space-y-2 ml-1">
              {condition.causes_and_effects.map((cause, idx) => (
                <li key={idx} className="flex gap-3 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3) Self Care */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              How can you take care of yourself?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900">
                <CardHeader>
                  <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">Prevention & Daily Care</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {condition.self_care.prevention_and_daily_care.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-base text-blue-700 dark:text-blue-400">Exercises & Movement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {condition.self_care.exercises_and_yoga.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-foreground/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 4 & 5) Social & Support */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Social Contact & Outdoors
              </h2>
              <ul className="space-y-2 bg-muted/30 p-4 rounded-lg">
                {condition.social_and_outdoor_guidance.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-indigo-500">•</span> {tip}
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                How others can help
              </h2>
              <ul className="space-y-2 bg-muted/30 p-4 rounded-lg">
                {condition.support_from_others.map((tip, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-pink-500">•</span> {tip}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 6) Important Safety Disclaimer */}
          <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl flex gap-4 items-start">
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-destructive">Important Safety Note</h4>
              <p className="text-destructive/90 text-sm leading-relaxed">
                The information on this page is for awareness only. It is NOT a medical diagnosis or prescription.
                Always consult a qualified doctor before taking any medicine or starting treatment.
              </p>
            </div>
          </div>

          {/* 7) Common Treatment Approaches */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold">Common treatment approaches (for doctors)</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Common Medicine Classes</CardTitle>
                  <CardDescription>Categories doctors may consider</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {condition.treatment_overview.common_medicine_classes.map((cls, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-primary font-bold">•</span> {cls}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Non-Medicine Care</CardTitle>
                  <CardDescription>Supportive treatments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {condition.treatment_overview.non_medicine_care.map((care, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-primary font-bold">•</span> {care}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md border border-border/50">
              <span className="font-semibold">Note:</span> The medicines mentioned here are general categories that doctors may consider. This is NOT a prescription. Do not start or change any medicine without consulting a doctor.
            </p>
          </section>

          {/* 8) Recommended Doctors */}
          <section className="space-y-6 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Doctors who can help with this condition</h2>
              <Badge variant="outline">{condition.recommended_specialist}</Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_DOCTORS.filter(d => d.specialty === condition.recommended_specialist).slice(0, 3).map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-all">
                  <div className="h-32 overflow-hidden relative">
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    <Badge className="absolute top-2 right-2 bg-white/90 text-black backdrop-blur-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {doctor.rating}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <CardDescription className="text-primary font-medium">{doctor.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {doctor.location}
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <Calendar className="w-4 h-4" /> {doctor.availability}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-0">
                    <Button className="flex-1" onClick={() => handleBook(doctor.name)}>Book Appointment</Button>
                    <Button variant="outline" size="icon" disabled title="Video consult coming soon">
                      <Video className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {/* Fallback if no specific doctors match the mock data exactly */}
              {MOCK_DOCTORS.filter(d => d.specialty === condition.recommended_specialist).length === 0 && (
                 MOCK_DOCTORS.slice(0, 2).map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-all opacity-75">
                    <div className="h-32 overflow-hidden relative">
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                      <Badge className="absolute top-2 right-2 bg-white/90 text-black backdrop-blur-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {doctor.rating}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{doctor.name}</CardTitle>
                      <CardDescription className="text-primary font-medium">{doctor.specialty}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 text-sm text-muted-foreground space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> {doctor.location}
                      </div>
                      <p className="text-xs italic">Showing available doctor (Specialty match not found in mock)</p>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-0">
                      <Button className="flex-1" onClick={() => handleBook(doctor.name)}>Book Appointment</Button>
                    </CardFooter>
                  </Card>
                 ))
              )}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
