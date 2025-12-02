/**
 * Database Seed Script
 * 
 * Populates the database with initial data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (development only!)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    await prisma.userFeedback.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.recipientProfile.deleteMany();
    await prisma.searchResult.deleteMany();
    await prisma.search.deleteMany();
    await prisma.product.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.emailVerificationToken.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Cleaned existing data');
  }

  // Create users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('Test123!@#', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@mykadoo.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
      profile: {
        create: {
          currency: 'USD',
          language: 'en',
          preferredAIAgent: 'Sophie',
          interests: ['technology', 'books', 'travel'],
          occasions: ['birthday', 'anniversary', 'holiday'],
        },
      },
    },
  });

  const goldUser = await prisma.user.create({
    data: {
      email: 'gold@mykadoo.com',
      password: hashedPassword,
      name: 'Gold User',
      role: 'GOLD',
      status: 'ACTIVE',
      emailVerified: new Date(),
      profile: {
        create: {
          currency: 'USD',
          language: 'en',
          preferredAIAgent: 'Max',
          budgetMin: 50,
          budgetMax: 200,
          interests: ['gaming', 'sports', 'music'],
        },
      },
      subscription: {
        create: {
          plan: 'GOLD',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      },
    },
  });

  const freeUser = await prisma.user.create({
    data: {
      email: 'user@mykadoo.com',
      password: hashedPassword,
      name: 'Free User',
      role: 'FREE',
      status: 'ACTIVE',
      emailVerified: new Date(),
      profile: {
        create: {
          currency: 'USD',
          language: 'en',
          preferredAIAgent: 'Elena',
          interests: ['cooking', 'gardening', 'reading'],
        },
      },
    },
  });

  console.log(`✅ Created ${3} users`);

  // Create recipient profiles
  console.log('👥 Creating recipient profiles...');
  
  const motherProfile = await prisma.recipientProfile.create({
    data: {
      userId: freeUser.id,
      name: 'Mom',
      relationship: 'mother',
      ageRange: 'adult',
      interests: ['gardening', 'cooking', 'reading', 'knitting'],
      favoriteColors: ['blue', 'purple'],
      hobbies: ['baking', 'flower arranging'],
      notes: 'Loves homemade gifts and practical items',
      birthdayDate: new Date('1965-05-15'),
    },
  });

  const friendProfile = await prisma.recipientProfile.create({
    data: {
      userId: goldUser.id,
      name: 'Best Friend',
      relationship: 'friend',
      ageRange: 'young-adult',
      gender: 'non-binary',
      interests: ['gaming', 'anime', 'tech gadgets', 'music'],
      favoriteColors: ['black', 'purple', 'neon green'],
      hobbies: ['streaming', 'cosplay'],
      notes: 'Loves unique and quirky gifts',
      birthdayDate: new Date('1998-08-22'),
    },
  });

  console.log(`✅ Created ${2} recipient profiles`);

  // Create sample products
  console.log('🎁 Creating products...');
  
  const products = [
    {
      title: 'Wireless Gaming Headset',
      description: 'High-quality wireless gaming headset with 7.1 surround sound',
      imageUrl: 'https://example.com/headset.jpg',
      price: 89.99,
      currency: 'USD',
      rating: 4.5,
      reviewCount: 1234,
      affiliateNetwork: 'Amazon',
      externalId: 'B08XYZ123',
      affiliateLink: 'https://amazon.com/dp/B08XYZ123?tag=mykadoo-20',
      category: 'Electronics',
      tags: ['gaming', 'audio', 'wireless', 'tech'],
      occasions: ['birthday', 'holiday'],
      ageGroups: ['teens', 'young-adults', 'adults'],
    },
    {
      title: 'Gourmet Cooking Set',
      description: 'Professional quality cooking utensils with bamboo handles',
      imageUrl: 'https://example.com/cooking-set.jpg',
      price: 65.00,
      currency: 'USD',
      rating: 4.8,
      reviewCount: 856,
      affiliateNetwork: 'Amazon',
      externalId: 'B08ABC456',
      affiliateLink: 'https://amazon.com/dp/B08ABC456?tag=mykadoo-20',
      category: 'Kitchen & Dining',
      tags: ['cooking', 'kitchenware', 'gourmet'],
      occasions: ['birthday', 'holiday', 'housewarming'],
      ageGroups: ['adults'],
    },
    {
      title: 'Indoor Herb Garden Kit',
      description: 'Smart indoor garden for growing fresh herbs year-round',
      imageUrl: 'https://example.com/herb-garden.jpg',
      price: 129.99,
      currency: 'USD',
      rating: 4.6,
      reviewCount: 543,
      affiliateNetwork: 'Amazon',
      externalId: 'B08DEF789',
      affiliateLink: 'https://amazon.com/dp/B08DEF789?tag=mykadoo-20',
      category: 'Home & Garden',
      tags: ['gardening', 'herbs', 'indoor', 'smart-home'],
      occasions: ['birthday', 'holiday'],
      ageGroups: ['adults', 'seniors'],
    },
  ];

  const createdProducts = await Promise.all(
    products.map((product) => prisma.product.create({ data: product }))
  );

  console.log(`✅ Created ${createdProducts.length} products`);

  // Create wishlists
  console.log('📋 Creating wishlists...');
  
  const wishlist = await prisma.wishlist.create({
    data: {
      userId: freeUser.id,
      name: "Mom's Birthday Ideas",
      description: 'Gift ideas for mom\'s upcoming birthday',
      isPublic: false,
      items: {
        create: [
          {
            productId: createdProducts[1].id, // Cooking set
            priority: 1,
            notes: 'She mentioned wanting new kitchen tools',
          },
          {
            productId: createdProducts[2].id, // Herb garden
            priority: 2,
            notes: 'Perfect for her gardening hobby',
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${1} wishlist with items`);

  // Create favorites
  console.log('⭐ Creating favorites...');
  
  await prisma.favorite.create({
    data: {
      userId: goldUser.id,
      productId: createdProducts[0].id, // Gaming headset
    },
  });

  console.log(`✅ Created favorites`);

  // Create search history
  console.log('🔍 Creating search history...');
  
  const search = await prisma.search.create({
    data: {
      userId: freeUser.id,
      query: 'gifts for mom who loves gardening',
      filters: {
        occasion: 'birthday',
        budgetMin: 50,
        budgetMax: 150,
        interests: ['gardening', 'cooking'],
      },
      model: 'gpt-4',
      cost: 0.02,
      latency: 1250,
      results: {
        create: [
          {
            productId: createdProducts[2].id,
            rank: 1,
            score: 0.95,
          },
          {
            productId: createdProducts[1].id,
            rank: 2,
            score: 0.82,
          },
        ],
      },
    },
  });

  console.log(`✅ Created search history`);

  // Create user feedback
  console.log('💬 Creating user feedback...');
  
  await prisma.userFeedback.create({
    data: {
      userId: freeUser.id,
      searchId: search.id,
      productId: createdProducts[2].id,
      action: 'LIKED',
      rating: 5,
      occasion: 'birthday',
      relationship: 'mother',
      recipientAge: 'adult',
      searchContext: {
        budgetMin: 50,
        budgetMax: 150,
      },
      comment: 'Perfect gift idea!',
    },
  });

  console.log(`✅ Created user feedback`);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: 3 (1 admin, 1 gold, 1 free)`);
  console.log(`   Recipient Profiles: 2`);
  console.log(`   Products: ${createdProducts.length}`);
  console.log(`   Wishlists: 1`);
  console.log(`   Searches: 1`);
  console.log(`   Feedback: 1`);
  console.log('\n✉️  Test credentials:');
  console.log(`   Admin: admin@mykadoo.com / Test123!@#`);
  console.log(`   Gold:  gold@mykadoo.com / Test123!@#`);
  console.log(`   Free:  user@mykadoo.com / Test123!@#`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
