import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--brand-secondary)]">
              PAU Muslim Ummah
            </h3>
            <p className="text-slate-300 text-sm">
               Pan Atlantic University&apos;s vibrant Muslim community, fostering faith,
              knowledge, and brotherhood.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--brand-secondary)]">
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link 
                href="/policy" 
                className="block text-slate-300 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/feed" 
                className="block text-slate-300 hover:text-white transition-colors text-sm"
              >
                Feed
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--brand-secondary)]">
              Contact
            </h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>Pan Atlantic University</p>
              <p>Lekki, Lagos, Nigeria</p>
              <p>Email: pro.muslimummah@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} PAU Muslim Ummah. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
