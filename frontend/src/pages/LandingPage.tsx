import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Award, Users, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'AI GigScore™',
      description: 'Our AI calculates a trusted financial score using your work history, earnings consistency, customer ratings, and experience.'
    },
    {
      icon: Shield,
      title: 'Digital Financial Identity',
      description: 'Build a verified worker profile that\'s portable across all gig platforms and recognized by banks and employers.'
    },
    {
      icon: Award,
      title: 'Digital Reputation History',
      description: 'Your verified work history, customer ratings, and job records follow you across all platforms.'
    },
    {
      icon: CheckCircle,
      title: 'Government Scheme Finder',
      description: 'AI recommends eligible welfare schemes with personalized eligibility checks and direct application links.'
    }
  ];

  const stats = [
    { value: '90M+', label: 'Gig Workers in India' },
    { value: '₹3.5L Cr', label: 'Gig Economy Size' },
    { value: '72%', label: 'Lack Banking Access' },
    { value: '85%', label: 'Miss Government Schemes' }
  ];

  return (
    <div className="min-h-screen bg-navy-dark">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light/50" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-brand/5 rounded-full blur-2xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand/20 border border-brand/30 text-brand px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star className="w-3.5 h-3.5" />
            Empowering India's Gig Economy
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
            Turning Every Gig
            <br />
            <span className="text-gradient">into a Better Future</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            ShramSethu empowers India's gig workers with financial identity, digital reputation,
            and government welfare access — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-brand hover:bg-brand-dark text-white px-8"
              onClick={() => navigate('/register')}
            >
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-brand">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Challenges Gig Workers Face</h2>
            <p className="text-white/60">India has millions of gig workers contributing significantly to the economy — yet many remain financially invisible.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Financial Invisibility', desc: 'No salary slips, poor credit history, loan rejection, difficult insurance access.' },
              { title: 'Income Instability', desc: 'Irregular monthly income with no financial planning and unpredictable earnings.' },
              { title: 'Platform Dependency', desc: 'Reputation stays on one platform, difficult to switch jobs, no portable profile.' },
              { title: 'No Social Security', desc: 'No pension, no health benefits, no accident coverage for gig workers.' },
              { title: 'Digital Reputation Gap', desc: 'Years of honest work cannot be verified; trust disappears after switching platforms.' },
              { title: 'Limited Growth', desc: 'Difficulty obtaining loans and no personalized financial guidance available.' }
            ].map(problem => (
              <div key={problem.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="w-8 h-8 bg-brand/20 rounded-lg flex items-center justify-center mb-3">
                  <div className="w-3 h-3 bg-brand rounded-full" />
                </div>
                <h3 className="text-white font-semibold mb-2">{problem.title}</h3>
                <p className="text-white/50 text-sm">{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Introducing ShramSethu</h2>
            <p className="text-white/60">A single digital platform that empowers gig workers with financial identity, reputation, and government support.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map(feature => (
              <div key={feature.title} className="bg-navy rounded-xl p-6 border border-white/10 card-hover">
                <div className="w-10 h-10 gradient-brand rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            "Millions of hardworking people deserve recognition, financial trust, and equal opportunities."
          </h2>
          <p className="text-white/60 mb-8">Join ShramSethu today and build your financial future.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-brand hover:bg-brand-dark text-white px-8" onClick={() => navigate('/register?role=WORKER')}>
              I'm a Gig Worker <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/register?role=CUSTOMER')}>
              I'm Hiring Workers
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">SS</span>
            </div>
            <span className="text-white font-semibold">ShramSethu</span>
            <span className="text-white/40 text-sm">— Team AlphaByte</span>
          </div>
          <div className="flex items-center gap-4">
            <Users className="w-4 h-4 text-white/40" />
            <span className="text-white/40 text-sm">Building bridges between hardworking people and a better future.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}