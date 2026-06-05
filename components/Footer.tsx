import Link from "next/link";
import { Brain } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-white/5 bg-[#09090b]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
            <p className="text-sm text-slate-400 max-w-xs">
              SaaS platform powering next-generation mock interviews. Upload resumes, practice job-specific questions, and secure your dream job.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91 1.031.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links sections */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Product</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/interview" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Start Practicing
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Feedback Reports
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Support</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Guides
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                      API Status
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Company</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Legal</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 md:flex md:items-center md:justify-between">
          <p className="text-xs text-slate-500 md:order-1">
            &copy; {currentYear} PrepForge Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
