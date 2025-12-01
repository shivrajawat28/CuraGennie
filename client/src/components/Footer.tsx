import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted/30 mt-20 relative">
      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
        .gradient-border {
          height: 2px;
          background: linear-gradient(90deg, rgb(0, 200, 180), rgb(0, 200, 220), rgb(0, 200, 180));
          background-size: 200% 100%;
          animation: gradient-flow 8s ease infinite;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); opacity: 1; }
          15% { transform: scale(1.1); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
          60% { transform: scale(1); opacity: 0.8; }
        }
        .heart-beat {
          animation: heartbeat 1.5s ease-in-out 1s infinite;
        }
      `}</style>
      <div className="gradient-border" />
      <div className="border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M19 14c1.49-1.28 3.6-1.28 5.09 0 1.49 1.28 1.49 3.36 0 4.63-1.49 1.28-3.6 1.28-5.09 0-1.49-1.28-1.49-3.36 0-4.63z" />
                  <path d="M12 12v.01" />
                  <path d="M17 21h-4a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3z" />
                </svg>
              </div>
              <span className="font-heading font-bold text-xl text-foreground">
                Cura Gennie
              </span>
              <svg className="w-5 h-5 text-rose-500 heart-beat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Your friendly health buddy for symptom awareness and wellness guidance.
              We help you understand your health better, but we don't replace your doctor.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary/80 hover:underline transition-all cursor-pointer">Home</Link>
              </li>
              <li>
                <Link href="/symptom-checker" className="text-muted-foreground hover:text-primary/80 hover:underline transition-all cursor-pointer">Symptom Checker</Link>
              </li>
              <li>
                <Link href="/doctors" className="text-muted-foreground hover:text-primary/80 hover:underline transition-all cursor-pointer">Find Doctors</Link>
              </li>
              <li>
                <Link href="/articles" className="text-muted-foreground hover:text-primary/80 hover:underline transition-all cursor-pointer">Health Articles</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary/80 hover:underline transition-all cursor-pointer">About Us</Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary/80 hover:underline transition-all">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary/80 hover:underline transition-all">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block max-w-3xl mx-auto mb-6">
            <p className="text-sm font-medium">
              Disclaimer: Cura Gennie is not a medical device, diagnosis, or treatment tool. 
              All information is for educational purposes only. Always consult a qualified healthcare professional.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cura Gennie. All rights reserved.
          </p>
        </div>
      </div>
    </div>
    </footer>
  );
}
