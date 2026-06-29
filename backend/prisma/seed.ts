import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shramsethu.in' },
    update: {},
    create: {
      email: 'admin@shramsethu.in',
      phone: '9999999999',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      fullName: 'ShramSethu Admin',
      isVerified: true,
      wallet: { create: { balance: 0 } }
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // Demo worker
  const workerPassword = await bcrypt.hash('Worker@123', 10);
  const worker = await prisma.user.upsert({
    where: { email: 'ravi@example.com' },
    update: {},
    create: {
      email: 'ravi@example.com',
      phone: '9876543210',
      passwordHash: workerPassword,
      role: UserRole.WORKER,
      fullName: 'Ravi Kumar',
      isVerified: true,
      wallet: { create: { balance: 1500 } },
      workerProfile: {
        create: {
          bio: 'Experienced delivery driver with 5 years of experience.',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          yearsExperience: 5,
          gigScore: 720,
          incomeConsistencyScore: 75,
          customerRatingScore: 4.5,
          jobCompletionScore: 90,
          experienceScore: 85,
          financialBehaviourScore: 70,
          digitalReputationScore: 80,
          totalJobsCompleted: 142,
          totalEarnings: 185000,
          averageRating: 4.5
        }
      }
    }
  });
  console.log('✅ Worker user created:', worker.email);

  // Demo customer
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'priya@example.com' },
    update: {},
    create: {
      email: 'priya@example.com',
      phone: '9123456789',
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
      fullName: 'Priya Sharma',
      isVerified: true,
      wallet: { create: { balance: 50000 } },
      customerProfile: {
        create: {
          companyName: 'Sharma Enterprises',
          businessType: 'Retail',
          city: 'Mumbai',
          state: 'Maharashtra',
          totalJobsPosted: 12
        }
      }
    }
  });
  console.log('✅ Customer user created:', customer.email);

  // Skills
  const skillsData = [
    { name: 'Driving', category: 'Transport' },
    { name: 'Delivery', category: 'Transport' },
    { name: 'Cooking', category: 'Food & Hospitality' },
    { name: 'Cleaning', category: 'Household' },
    { name: 'Plumbing', category: 'Home Services' },
    { name: 'Electrician', category: 'Home Services' },
    { name: 'Carpentry', category: 'Home Services' },
    { name: 'Painting', category: 'Home Services' },
    { name: 'Gardening', category: 'Household' },
    { name: 'Security Guard', category: 'Security' },
    { name: 'Data Entry', category: 'IT & Digital' },
    { name: 'Web Development', category: 'IT & Digital' },
    { name: 'Graphic Design', category: 'IT & Digital' },
    { name: 'Customer Support', category: 'IT & Digital' },
    { name: 'Photography', category: 'Creative' },
    { name: 'Tailoring', category: 'Fashion' },
    { name: 'Beauty & Wellness', category: 'Beauty' },
    { name: 'Teaching & Tutoring', category: 'Education' },
    { name: 'Healthcare Assistant', category: 'Healthcare' },
    { name: 'Logistics & Warehousing', category: 'Logistics' }
  ];

  for (const skill of skillsData) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill
    });
  }
  console.log('✅ Skills seeded');

  // Government Schemes
  const schemes = [
    {
      name: 'PM-SYM (Pradhan Mantri Shram Yogi Maan-Dhan)',
      description: 'Pension scheme for unorganized workers providing monthly pension of ₹3000 after age 60.',
      ministry: 'Ministry of Labour & Employment',
      benefits: 'Monthly pension of ₹3,000 after age 60. Equal contribution from government.',
      applicationUrl: 'https://maandhan.in/',
      category: 'Pension',
      eligibilityCriteria: { min_age: 18, max_age: 40, monthly_income_max: 15000 }
    },
    {
      name: 'PMSBY - Accidental Insurance',
      description: 'Pradhan Mantri Suraksha Bima Yojana — Accidental death and disability cover.',
      ministry: 'Ministry of Finance',
      benefits: '₹2 lakh accidental death cover. ₹1 lakh for partial disability. Only ₹20/year premium.',
      applicationUrl: 'https://jansuraksha.gov.in/',
      category: 'Insurance',
      eligibilityCriteria: { min_age: 18, max_age: 70, bank_account_required: true }
    },
    {
      name: 'PMJJBY - Life Insurance',
      description: 'Pradhan Mantri Jeevan Jyoti Bima Yojana — Life insurance for all.',
      ministry: 'Ministry of Finance',
      benefits: '₹2 lakh life cover for just ₹436/year.',
      applicationUrl: 'https://jansuraksha.gov.in/',
      category: 'Insurance',
      eligibilityCriteria: { min_age: 18, max_age: 50, bank_account_required: true }
    },
    {
      name: 'e-Shram Card',
      description: 'National portal for registration of unorganized workers.',
      ministry: 'Ministry of Labour & Employment',
      benefits: 'Unique Worker ID, ₹2 lakh accident insurance, access to all government welfare schemes.',
      applicationUrl: 'https://eshram.gov.in/',
      category: 'Identity',
      eligibilityCriteria: { not_income_tax_payer: true, not_epf_member: true }
    },
    {
      name: 'PMKVY - Skill Training',
      description: 'Pradhan Mantri Kaushal Vikas Yojana — Free skill training and certification.',
      ministry: 'Ministry of Skill Development & Entrepreneurship',
      benefits: 'Free skill training, recognized certification, monetary reward on completion.',
      applicationUrl: 'https://pmkvyofficial.org/',
      category: 'Skill Development',
      eligibilityCriteria: { min_age: 15, max_age: 45 }
    },
    {
      name: 'Mudra Loan - Shishu Category',
      description: 'Micro loans for small and micro enterprises up to ₹50,000.',
      ministry: 'Ministry of Finance',
      benefits: 'Collateral-free loans up to ₹50,000 at low interest rates.',
      applicationUrl: 'https://mudra.org.in/',
      category: 'Finance',
      eligibilityCriteria: { max_loan_amount: 50000, business_type: 'micro' }
    }
  ];

  for (const scheme of schemes) {
    await prisma.governmentScheme.create({ data: scheme }).catch(() => {});
  }
  console.log('✅ Government schemes seeded');

  console.log('🎉 Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());