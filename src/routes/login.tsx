import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/app/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ChevronDown, ChevronUp, Lock, Phone, Shield, User as UserIcon, Building2, ArrowLeft, Grid3x3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { panchayats } from "@/lib/demo/data";

export const Route = createFileRoute("/login")({
  component: Login,
});

const IMAGES = Array.from({ length: 10 }, (_, i) => `/images/village/v${i + 1}.jpg`);

function Login() {
  const { loginAsFarmer, loginAsHead, loginAsAdmin, registerFarmer, isLoading } = useAuth();
  const navigate = useNavigate();

  // Slideshow state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mode state
  const [farmerMode, setFarmerMode] = useState<"signin" | "register">("signin");

  // Head state
  const [headId, setHeadId] = useState("");
  const [headPass, setHeadPass] = useState("");
  const [headError, setHeadError] = useState("");

  // Farmer SignIn state
  const [farmerPhone, setFarmerPhone] = useState("");
  const [farmerPin, setFarmerPin] = useState("");
  const [farmerError, setFarmerError] = useState("");

  // Farmer Register state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regPanchayat, setRegPanchayat] = useState("kandiyur");
  const [regError, setRegError] = useState("");

  // Admin login panel state
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleHeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeadError("");
    try {
      await loginAsHead(headId, headPass);
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setHeadError(err instanceof Error ? err.message : "Failed to login as head");
    }
  };

  const handleFarmerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFarmerError("");
    try {
      await loginAsFarmer(farmerPhone, farmerPin);
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setFarmerError(err instanceof Error ? err.message : "Failed to sign in");
    }
  };

  const handleFarmerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    try {
      await registerFarmer({
        name: regName,
        phone: regPhone,
        pin: regPin,
        panchayatId: regPanchayat,
      });
      toast.success("Successfully registered!");
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : "Failed to register");
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    try {
      await loginAsAdmin(adminUser, adminPass);
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Failed to login as admin");
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-manrope">
      
      {/* LEFT COLUMN: BRANDING (Hidden on small screens) */}
      <div className="hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex relative">
        {/* Image Slideshow Background */}
        {IMAGES.map((src, index) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
            style={{ 
              backgroundImage: `url(${src})`,
              opacity: index === currentImageIndex ? 0.6 : 0,
              zIndex: 0
            }}
          />
        ))}
        
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30 z-0"></div>
        <div className="absolute inset-0 bg-slate-950/30 z-0"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-block transition-opacity hover:opacity-80">
            <Logo inverted />
          </Link>
        </div>

        <div className="relative z-10 mt-auto max-w-lg">
          <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20 text-primary">
            <Grid3x3 className="size-6" />
          </div>
          <h2 className="font-display text-4xl font-semibold leading-tight text-white">
            Precision farming starts with hyperlocal intelligence.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Join thousands of farmers across India receiving 1-km resolution weather forecasts and tailored crop advisories directly from SUKSHMA-AI.
          </p>
          
          <div className="mt-12 flex items-center gap-4 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="size-8 rounded-full border-2 border-slate-950 bg-slate-800" />
              ))}
            </div>
            <p>Trusted by 1000+ Panchayats</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-24 xl:px-32 relative">
        
        {/* Mobile Logo (only visible on mobile) */}
        <div className="absolute left-6 top-6 lg:hidden">
          <Link to="/" className="inline-block">
            <Logo />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[420px]">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to access your agricultural dashboard.</p>
          </div>

          <Tabs defaultValue="farmer" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
              <TabsTrigger value="farmer" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 font-medium">
                Farmer
              </TabsTrigger>
              <TabsTrigger value="head" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 font-medium">
                Panchayat Head
              </TabsTrigger>
            </TabsList>
            
            {/* --- PANCHAYAT HEAD TAB --- */}
            <TabsContent value="head" className="m-0 space-y-6 outline-none focus-visible:ring-0">
              <form onSubmit={handleHeadSubmit} className="space-y-4">
                {headError && (
                  <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{headError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="head-id">Login ID (LGD Code)</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input id="head-id" placeholder="e.g. TN-TNJ-110234" value={headId} onChange={(e) => setHeadId(e.target.value)} className="pl-10 h-11 bg-white border-slate-200" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="head-pass">Password</Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <Input id="head-pass" type="password" placeholder="Enter password" value={headPass} onChange={(e) => setHeadPass(e.target.value)} className="pl-10 h-11 bg-white border-slate-200" required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 mt-2 text-base font-medium rounded-lg" disabled={isLoading}>
                  {isLoading ? "Authenticating..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            {/* --- FARMER TAB --- */}
            <TabsContent value="farmer" className="m-0 outline-none focus-visible:ring-0">
              
              {farmerMode === "signin" ? (
                <form onSubmit={handleFarmerSignIn} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {farmerError && (
                    <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{farmerError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="farmer-phone">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input id="farmer-phone" placeholder="10-digit number" type="tel" value={farmerPhone} onChange={(e) => setFarmerPhone(e.target.value)} className="pl-10 h-11 bg-white border-slate-200" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmer-pin">4-Digit PIN</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input id="farmer-pin" type="password" placeholder="e.g. 1234" value={farmerPin} onChange={(e) => setFarmerPin(e.target.value)} className="pl-10 h-11 bg-white border-slate-200" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11 mt-2 text-base font-medium rounded-lg" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in to Dashboard"}
                  </Button>
                  
                  <div className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setFarmerMode("register")} className="font-semibold text-primary hover:underline">
                      Create one
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleFarmerRegister} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="mb-2">
                    <button type="button" onClick={() => setFarmerMode("signin")} className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1">
                      <ArrowLeft className="size-3" /> Back to sign in
                    </button>
                  </div>
                  
                  {regError && (
                    <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{regError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input id="reg-name" placeholder="Your name" value={regName} onChange={(e) => setRegName(e.target.value)} className="h-11 bg-white border-slate-200" required />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="reg-phone">Mobile Number</Label>
                      <Input id="reg-phone" placeholder="10-digit number" type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="h-11 bg-white border-slate-200" required />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Select Panchayat</Label>
                      <select 
                        value={regPanchayat} 
                        onChange={(e) => setRegPanchayat(e.target.value)}
                        className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        required
                      >
                        {panchayats.map(p => <option key={p.id} value={p.id}>{p.name} ({p.block})</option>)}
                      </select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="reg-pin">Set a 4-Digit PIN</Label>
                      <Input id="reg-pin" type="password" placeholder="Create PIN" value={regPin} onChange={(e) => setRegPin(e.target.value)} className="h-11 bg-white border-slate-200" required />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-11 mt-4 text-base font-medium rounded-lg" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Account"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center text-xs text-slate-400">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 hover:text-slate-600 transition-colors"
              onClick={() => setAdminOpen((v) => !v)}
            >
              <Shield className="h-3.5 w-3.5" /> 
              {adminOpen ? "Hide Admin Portal" : "Admin Login"}
            </button>
          </div>

          {/* ── Admin Login Accordion ─────────────────────────── */}
          {adminOpen && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6 animate-in slide-in-from-top-2 fade-in duration-300">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                {adminError && (
                  <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{adminError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="admin-user" className="text-sm font-medium text-slate-700">Username</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="admin-user" placeholder="admin" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className="pl-9 h-10 bg-white" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-pass" className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input id="admin-pass" type="password" placeholder="Password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="pl-9 h-10 bg-white" required />
                  </div>
                </div>
                <Button type="submit" variant="outline" className="w-full h-10 font-medium rounded-md" disabled={isLoading}>
                  {isLoading ? "Authenticating..." : "Sign in to Console"}
                </Button>
              </form>
            </div>
          )}
          
          {/* Demo Info Footer */}
          <div className="mt-8 rounded-lg border border-primary/10 bg-primary/5 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Demo Access</p>
            <ul className="space-y-1">
              <li><strong className="font-semibold">Farmer:</strong> phone=0000000000, PIN=1234</li>
              <li><strong className="font-semibold">Head:</strong> TN-TNJ-110234 / 110234@sukshma</li>
              <li><strong className="font-semibold">Admin:</strong> admin / sukshma2026</li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
}
