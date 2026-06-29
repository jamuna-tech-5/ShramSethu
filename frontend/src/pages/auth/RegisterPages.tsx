import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'WORKER' | 'CUSTOMER';
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') as 'WORKER' | 'CUSTOMER') || 'WORKER';
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { role: defaultRole }
  });
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const selectedRole = watch('role');

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">SS</span>
            </div>
            <span className="text-white font-bold text-2xl">ShramSethu</span>
          </div>
          <p className="text-white/60 text-sm">Create your account and get started</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Join millions of workers building their financial future</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(['WORKER', 'CUSTOMER'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue('role', role)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedRole === role
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border text-muted-foreground hover:border-brand/50'
                  }`}
                >
                  {role === 'WORKER' ? '👷 I\'m a Worker' : '🏢 I\'m Hiring'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="space-y-3">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Ravi Kumar"
                  {...register('fullName', { required: 'Full name is required' })}
                  className="mt-1"
                />
                {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })}
                  className="mt-1"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  {...register('phone', {
                    required: 'Phone is required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid Indian phone number' }
                  })}
                  className="mt-1"
                />
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-brand hover:bg-brand-dark"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-brand font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}