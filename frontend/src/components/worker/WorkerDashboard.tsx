import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Briefcase, Star, Wallet, RefreshCw,
  MapPin, ArrowRight, Bell, FileText, Award
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GigScoreCard from '@/components/worker/GigScoreCard';
import EarningsChart from '@/components/worker/EarningsChart';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function WorkerDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['workerProfile'],
    queryFn: () => api.get('/workers/profile').then(r => r.data.data)
  });

  const { data: earnings } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => api.get('/workers/earnings').then(r => r.data.data)
  });

  const { data: applications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => api.get('/jobs/my/applications').then(r => r.data.data)
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data.data)
  });

  const recalcMutation = useMutation({
    mutationFn: () => api.post('/workers/gigscore/recalculate'),
    onSuccess: (res) => {
      toast({ title: 'GigScore Updated!', description: `Your new score: ${res.data.data.gigScore}` });
      queryClient.invalidateQueries({ queryKey: ['workerProfile'] });
    }
  });

  const wp = profile?.workerProfile;

  const stats = [
    {
      label: 'GigScore™',
      value: wp?.gigScore || 0,
      icon: Award,
      color: 'text-brand',
      bg: 'bg-brand/10',
      suffix: ''
    },
    {
      label: 'Jobs Completed',
      value: wp?.totalJobsCompleted || 0,
      icon: Briefcase,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      suffix: ''
    },
    {
      label: 'Average Rating',
      value: parseFloat(wp?.averageRating || '0').toFixed(1),
      icon: Star,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      suffix: '/5'
    },
    {
      label: 'Total Earnings',
      value: formatCurrency(parseFloat(wp?.totalEarnings || '0')),
      icon: Wallet,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      suffix: ''
    }
  ];

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="gradient-brand rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Welcome back, {user?.fullName?.split(' ')[0]}! 👋</h1>
            <p className="text-white/80 mt-1 text-sm">
              {wp?.city && wp?.state ? `${wp.city}, ${wp.state}` : 'Complete your profile to get started'}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-white/20 text-white border-0">
                <MapPin className="w-3 h-3 mr-1" />
                {wp?.isAvailable ? 'Available for work' : 'Not available'}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/20"
            onClick={() => recalcMutation.mutate()}
            disabled={recalcMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${recalcMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh Score
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-4">
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <div className="text-xl font-bold">{stat.value}{stat.suffix}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* GigScore Card */}
        <div className="lg:col-span-1">
          {wp && (
            <GigScoreCard
              gigScore={wp.gigScore}
              incomeConsistencyScore={wp.incomeConsistencyScore}
              customerRatingScore={Math.round(parseFloat(wp.customerRatingScore?.toString() || '0'))}
              jobCompletionScore={wp.jobCompletionScore}
              experienceScore={wp.experienceScore}
              financialBehaviourScore={wp.financialBehaviourScore}
              digitalReputationScore={wp.digitalReputationScore}
            />
          )}

          {/* Quick Links */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Browse Jobs', icon: Briefcase, href: '/jobs' },
                { label: 'Upload Documents', icon: FileText, href: '/documents' },
                { label: 'Government Schemes', icon: Award, href: '/schemes' },
                { label: 'Apply for Loan', icon: TrendingUp, href: '/worker/loans' }
              ].map(link => (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <link.icon className="w-4 h-4 text-brand" />
                    <span className="text-sm">{link.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Earnings (Last 6 Months)</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/worker/earnings')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {earnings?.monthly?.length > 0 ? (
                <EarningsChart data={earnings.monthly} />
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No earnings data yet. Complete jobs to see your earnings!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Recent Applications</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/jobs')}>
                  Browse Jobs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {applications?.length > 0 ? (
                <div className="space-y-3">
                  {applications.slice(0, 4).map((app: {
                    id: string;
                    status: string;
                    appliedAt: string;
                    job: { id: string; title: string; locationCity: string; budgetMin: number; budgetMax: number };
                  }) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{app.job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {app.job.locationCity} · {formatRelativeTime(app.appliedAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          app.status === 'ACCEPTED' ? 'success' :
                          app.status === 'REJECTED' ? 'destructive' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No applications yet.{' '}
                  <button className="text-brand hover:underline" onClick={() => navigate('/jobs')}>
                    Browse jobs