import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Agents', 'Changelog', 'Roadmap'],
  Developers: ['Documentation', 'API Reference', 'Examples', 'Community'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
};

export default function FooterSection() {
  return (
    <footer className="relative z-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 border-t border-border/30 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-secondary to-muted flex items-center justify-center">
                <Terminal className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xl font-semibold tracking-tight">GLMPilot</span>
            </Link>
            <p className="text-muted-foreground text-sm mt-4 max-w-xs">
              AI-powered browser IDE for frontend developers. Build, review, and ship with confidence.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2025 GLMPilot</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
