import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="pt-28 pb-24 bg-white min-h-[80vh] flex items-center justify-center">
      <div className="container-tight max-w-md text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/80 mb-6">
          <span className="font-heading text-3xl font-extrabold">404</span>
        </div>

        <h1 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Page not found
        </h1>

        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          The page you are looking for might have been moved, renamed, or is currently reserved for the next early access batch.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Homepage
          </Button>
          <Button variant="outline" href="/waitlist">
            Join Waitlist
          </Button>
        </div>
      </div>
    </div>
  );
}
