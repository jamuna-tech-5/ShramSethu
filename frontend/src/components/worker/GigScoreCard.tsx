import { getScoreColor, getScoreLabel } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Star, CheckCircle, Clock, Award, Shield } from 'lucide-react';

interface GigScoreCardProps {
  gigScore: number;
  incomeConsistencyScore: number;
  customerRatingScore: number;
  jobCompletionScore: number;
  experienceScore: number;
  financialBehaviourScore: number;
  digitalReputationScore: number;
}

export default function GigScoreCard({
  gigScore,
  incomeConsistencyScore,
  customerRatingScore,
  jobCompletionScore,
  experienceScore,
  financialBehaviourScore,
  digitalReputationScore
}: GigScoreCardProps) {
  const scorePercent = ((gigScore - 300) / 600) * 100;

  const components = [
    { label: 'Income Consistency', value: incomeConsistencyScore, weight: '30%', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Customer Ratings', value: Math.round(customerRatingScore), weight: '20%', icon: Star, color: 'text-yellow-500' },
    { label: 'Job Completion', value: jobCompletionScore, weight: '15%', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Experience', value: experienceScore, weight: '15%', icon: Clock, color: 'text-purple-500' },
    { label: 'Financial Behaviour', value: financialBehaviourScore, weight: '10%', icon: Award, color: 'text-orange-500' },
    { label: 'Digital Reputation', value: digitalReputationScore, weight: '10%', icon: Shield, color: 'text-pink-500' }
  ];

  return (
    <Card className="overflow-hidden">
      <div className="gradient-brand p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Your GigScore™</p>
            <div className={`text-5xl font-black mt-1 ${getScoreColor(gigScore)}`} style={{ color: 'white' }}>
              {gigScore}
            </div>
            <p className="text-white/90 text-sm mt-1 font-medium">{getScoreLabel(gigScore)}</p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.3)" strokeWidth="8" fill="none" />
              <circle
                cx="50" cy="50" r="40"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${251.2 * scorePercent / 100} 251.2`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{Math.round(scorePercent)}%</span>
            </div>
          </div>
        </div>
        <p className="text-white/70 text-xs mt-3">Range: 300 (Poor) — 900 (Excellent)</p>
      </div>

      <CardContent className="p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Score Breakdown</h4>
        <div className="space-y-3">
          {components.map(comp => (
            <div key={comp.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <comp.icon className={`w-3.5 h-3.5 ${comp.color}`} />
                  <span className="text-xs text-muted-foreground">{comp.label}</span>
                  <span className="text-xs text-muted-foreground/60">({comp.weight})</span>
                </div>
                <span className="text-xs font-medium">{comp.value}%</span>
              </div>
              <Progress value={comp.value} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}