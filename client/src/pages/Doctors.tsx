import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MOCK_DOCTORS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Star, Calendar, Video, Search, Filter } from "lucide-react";
import { useState } from "react";

export default function Doctors() {
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  const filteredDoctors = MOCK_DOCTORS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.location.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialtyFilter === "all" || doc.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border/50 pb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold font-heading">Find a Specialist</h1>
              <p className="text-muted-foreground">Book appointments with trusted doctors near you.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search by doctor name or location..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="General Physician">General Physician</SelectItem>
                  <SelectItem value="Cardiologist">Cardiologist</SelectItem>
                  <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                  <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> More Filters
            </Button>
          </div>

          {/* Doctors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-all group">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <Badge className="absolute top-3 right-3 bg-white/90 text-black backdrop-blur-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {doctor.rating}
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{doctor.name}</CardTitle>
                      <CardDescription className="text-primary font-medium mt-1">{doctor.specialty}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0" /> 
                    <span className="truncate">{doctor.location} • {doctor.distance}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50/50 dark:bg-green-900/10 p-2 rounded-md w-fit">
                    <Calendar className="w-4 h-4" /> {doctor.availability}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                     <Badge variant="secondary" className="font-normal text-xs">Video Consult</Badge>
                     <Badge variant="secondary" className="font-normal text-xs">Clinic Visit</Badge>
                  </div>
                </CardContent>
                <CardFooter className="gap-3 pt-2">
                  <Button className="flex-1 font-semibold">Book Appointment</Button>
                  <Button variant="outline" size="icon" title="Video Call">
                    <Video className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {filteredDoctors.length === 0 && (
              <div className="col-span-full text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground">No doctors found matching your criteria.</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => {setSearch(""); setSpecialtyFilter("all")}}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
