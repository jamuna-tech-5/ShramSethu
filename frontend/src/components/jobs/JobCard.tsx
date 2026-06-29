import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatRelativeTime, truncate } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  locationCity: string;
  locationState: string;
  budgetMin: number;
  budgetMax: number;
  durationDays?: number;
  status: string;
  requiredSkills: string[];
  minGigScore: number;
  createdAt: string;
  customer: {
    user: {
      fullName: string;
      avatarUrl?: string;
    };
  };
  _count?: { applications: number };
}

export default function JobCard({ job }: { job: Job }) {
  const navigate = useNavigate();

  return (
    <Card className="card-hover cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">{job.category}</Badge>
              {job.minGigScore > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  GigScore {job.minGigScore}+
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{truncate(job.description, 100)}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold text-brand">
              {formatCurrency(job.budgetMin)} — {formatCurrency(job.budgetMax)}
            </div>
            {job.durationDays && (
              <div className="text-xs text-muted-foreground mt-0.5">{job.durationDays} days</div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {job.locationCity}, {job.locationState}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(job.createdAt)}
          </div>
          {job._count && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {job._count.applications} applicants
            </div>
          )}
          <div className="ml-auto">
            <Button size="sm" className="h-7 text-xs bg-brand hover:bg-brand-dark">
              Apply Now
            </Button>
          </div>
        </div>

        {job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {job.requiredSkills.slice(0, 3).map(skill => (
              <span key={skill} className="text-xs bg-muted px-2 py-0.5 rounded-full">{skill}</span>
            ))}
            {job.requiredSkills.length > 3 && (
              <span className="text-xs text-muted-foreground">+{job.requiredSkills.length - 3} more</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}