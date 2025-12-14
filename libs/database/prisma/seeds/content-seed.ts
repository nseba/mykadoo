import { PrismaClient, ArticleStatus, ArticleContentType } from '@prisma/client';

const prisma = new PrismaClient();

// Sample Authors
const authors = [
  {
    name: 'Sophie Chen',
    slug: 'sophie-chen',
    email: 'sophie@mykadoo.com',
    bio: 'Sophie is a gift-giving enthusiast with over 10 years of experience helping people find the perfect presents. She specializes in sentimental and meaningful gift ideas for all occasions.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    twitterHandle: 'sophiechenGifts',
    isActive: true,
  },
  {
    name: 'Max Rodriguez',
    slug: 'max-rodriguez',
    email: 'max@mykadoo.com',
    bio: 'Max is always on the lookout for the latest trending products and viral gift ideas. His specialty is finding unique, conversation-starting presents that are sure to impress.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    twitterHandle: 'maxGiftHunter',
    isActive: true,
  },
  {
    name: 'Elena Martinez',
    slug: 'elena-martinez',
    email: 'elena@mykadoo.com',
    bio: 'Elena believes the best gifts are practical ones that get used daily. She focuses on high-quality, functional gift recommendations that deliver real value.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    linkedinUrl: 'https://linkedin.com/in/elenamartinez',
    isActive: true,
  },
];

// Sample Categories
const categories = [
  {
    name: 'Gift Guides',
    slug: 'gift-guides',
    description: 'Curated gift guides for every occasion, budget, and recipient. Find the perfect present with our expert recommendations.',
    seoTitle: 'Gift Guides - Expert Curated Gift Ideas | Mykadoo',
    seoDescription: 'Explore our comprehensive gift guides for birthdays, holidays, and special occasions. Find thoughtful, personalized gift ideas for everyone on your list.',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Holiday Gifts',
    slug: 'holiday-gifts',
    description: 'Seasonal and holiday gift ideas for Christmas, Valentines Day, Mothers Day, and more.',
    seoTitle: 'Holiday Gift Ideas - Seasonal Gift Guides | Mykadoo',
    seoDescription: 'Find the perfect holiday gifts with our seasonal guides. From Christmas to Valentines Day, discover thoughtful presents for every celebration.',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Tech Gifts',
    slug: 'tech-gifts',
    description: 'The latest and greatest tech gadgets and electronics for the tech enthusiast in your life.',
    seoTitle: 'Best Tech Gifts - Gadgets & Electronics | Mykadoo',
    seoDescription: 'Discover the best tech gifts for gadget lovers. From smart home devices to gaming accessories, find cutting-edge electronics for any budget.',
    sortOrder: 3,
    isActive: true,
  },
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Beautiful and practical gifts for the home. From decor to kitchen essentials.',
    seoTitle: 'Home & Living Gifts - Home Decor Ideas | Mykadoo',
    seoDescription: 'Find beautiful home and living gifts. Explore our curated selection of home decor, kitchen gadgets, and cozy essentials.',
    sortOrder: 4,
    isActive: true,
  },
  {
    name: 'Budget Friendly',
    slug: 'budget-friendly',
    description: 'Great gift ideas that wont break the bank. Quality presents under $50.',
    seoTitle: 'Budget Friendly Gifts Under $50 | Mykadoo',
    seoDescription: 'Discover amazing gift ideas under $50. Find thoughtful, quality presents that fit any budget without compromising on thoughtfulness.',
    sortOrder: 5,
    isActive: true,
  },
];

// Sample Tags
const tags = [
  { name: 'Mothers Day', slug: 'mothers-day' },
  { name: 'Fathers Day', slug: 'fathers-day' },
  { name: 'Birthday', slug: 'birthday' },
  { name: 'Christmas', slug: 'christmas' },
  { name: 'Anniversary', slug: 'anniversary' },
  { name: 'Valentines Day', slug: 'valentines-day' },
  { name: 'Graduation', slug: 'graduation' },
  { name: 'For Her', slug: 'for-her' },
  { name: 'For Him', slug: 'for-him' },
  { name: 'For Kids', slug: 'for-kids' },
  { name: 'Under $25', slug: 'under-25' },
  { name: 'Under $50', slug: 'under-50' },
  { name: 'Under $100', slug: 'under-100' },
  { name: 'Luxury', slug: 'luxury' },
  { name: 'Personalized', slug: 'personalized' },
  { name: 'Sustainable', slug: 'sustainable' },
  { name: 'Handmade', slug: 'handmade' },
  { name: 'Tech', slug: 'tech' },
  { name: 'Beauty', slug: 'beauty' },
  { name: 'Fashion', slug: 'fashion' },
];

// Sample Articles
const articles = [
  {
    title: 'The Ultimate Mothers Day Gift Guide 2025',
    slug: 'ultimate-mothers-day-gift-guide-2025',
    excerpt: 'Show mom how much you care with these thoughtful and unique gift ideas. From personalized keepsakes to luxurious self-care treats, weve curated the perfect presents for every type of mom.',
    content: `
# The Ultimate Mother's Day Gift Guide 2025

Mother's Day is the perfect opportunity to show your appreciation for the incredible woman who raised you. Whether she's into tech, loves pampering herself, or treasures sentimental gifts, we've got you covered.

## For the Tech-Savvy Mom

### 1. Smart Photo Frame
A digital photo frame that automatically syncs with your phone means Mom can enjoy new photos of the grandkids without any tech hassle. Look for one with Wi-Fi connectivity and a high-resolution display.

**Price Range:** $80-150

### 2. Wireless Earbuds
Perfect for her morning walks or podcast binges, a quality pair of wireless earbuds with noise cancellation will be a game-changer.

**Price Range:** $50-200

## For the Self-Care Queen

### 3. Luxury Spa Kit
Treat mom to a spa day at home with a curated set of bath bombs, face masks, and aromatherapy oils. Choose products with natural ingredients for an extra-special touch.

**Price Range:** $40-100

### 4. Silk Pillowcase Set
Beauty sleep gets an upgrade with silk pillowcases. They're gentler on skin and hair, and feel absolutely luxurious.

**Price Range:** $30-80

## For the Sentimental Mom

### 5. Custom Family Portrait
Commission an artist to create a custom illustration of your family. It's a one-of-a-kind gift she'll treasure forever.

**Price Range:** $50-200

### 6. Personalized Jewelry
A necklace with birthstones for each family member or an engraved bracelet makes for a meaningful keepsake she can wear daily.

**Price Range:** $30-300

## Quick Gift Ideas Under $25

- Handwritten letter in a beautiful card
- Her favorite flowers delivered
- Gourmet coffee or tea sampler
- Cozy socks with a fun pattern
- A bestselling book in her favorite genre

## Wrapping Up

Remember, the best gift is one that shows you know and appreciate her. Take time to think about what would make her smile, and don't underestimate the power of a heartfelt note alongside any gift.

Happy Mother's Day to all the amazing moms out there!
    `,
    featuredImageUrl: 'https://images.unsplash.com/photo-1520013817300-1f4c1cb245ef?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Beautiful Mother\'s Day gift arrangement with flowers and wrapped presents',
    status: ArticleStatus.PUBLISHED,
    contentType: ArticleContentType.GIFT_GUIDE,
    seoTitle: 'Ultimate Mother\'s Day Gift Guide 2025 - Best Gift Ideas for Mom',
    seoDescription: 'Discover the perfect Mother\'s Day gifts for 2025. From tech gadgets to personalized jewelry, find thoughtful presents mom will love.',
    seoKeywords: ['mothers day gifts', 'gifts for mom', 'mothers day 2025', 'best gifts for mothers day'],
    readingTimeMinutes: 8,
    wordCount: 520,
    isFeatured: true,
    categorySlug: 'gift-guides',
    tags: ['mothers-day', 'for-her', 'personalized'],
  },
  {
    title: '15 Best Tech Gifts for Gadget Lovers in 2025',
    slug: 'best-tech-gifts-gadget-lovers-2025',
    excerpt: 'From cutting-edge smart home devices to portable power solutions, discover the most exciting tech gifts that will delight any gadget enthusiast.',
    content: `
# 15 Best Tech Gifts for Gadget Lovers in 2025

Finding the perfect gift for a tech enthusiast can be challenging with so many options available. We've tested and curated the absolute best tech gifts for 2025.

## Smart Home Essentials

### 1. Smart Display Hub
The latest smart displays combine video calling, home automation control, and entertainment in one sleek device. Perfect for the kitchen counter or bedside table.

**Why We Love It:** Voice control, great display, multiple functionality
**Price:** $130-250

### 2. Robot Vacuum with AI Navigation
Modern robot vacuums use AI to map your home and clean more efficiently than ever. Look for models with self-emptying bases for truly hands-off cleaning.

**Price:** $300-800

## Portable Tech

### 3. High-Capacity Power Bank
A 20,000mAh power bank with fast charging keeps devices powered through the longest days. Essential for travelers and busy professionals.

**Price:** $40-80

### 4. Noise-Canceling Headphones
Premium noise-canceling headphones have become an essential work-from-home accessory. Look for 30+ hour battery life and comfortable fit for all-day wear.

**Price:** $200-400

## Gaming & Entertainment

### 5. Handheld Gaming Console
The latest handheld gaming devices offer console-quality gaming on the go. Perfect for commuters and casual gamers alike.

**Price:** $200-500

### 6. Streaming Device
Give the gift of entertainment with the latest streaming devices. 4K support and voice control are must-have features.

**Price:** $30-100

## Wearable Tech

### 7. Fitness Tracker
Modern fitness trackers offer comprehensive health monitoring including sleep tracking, stress management, and workout metrics.

**Price:** $100-250

### 8. Smart Glasses
Audio glasses combine style with functionality, letting you take calls and listen to music without traditional headphones.

**Price:** $200-350

## For the Power User

### 9. Mechanical Keyboard
A quality mechanical keyboard makes a huge difference for anyone who types a lot. Customizable RGB lighting is a nice bonus.

**Price:** $100-200

### 10. Ultra-Wide Monitor
Give the gift of screen real estate with an ultra-wide curved monitor. Perfect for productivity and immersive gaming.

**Price:** $300-600

## Budget-Friendly Options

- USB-C Hub ($25-50)
- Wireless charging pad ($20-40)
- Cable management kit ($15-30)
- LED desk lamp with wireless charging ($40-60)
- Bluetooth tracker for keys ($30)

## Final Thoughts

When choosing tech gifts, consider the recipient's existing ecosystem (Apple vs Android vs Windows) for compatibility. And don't forget to include batteries or a gift receipt for easy returns!
    `,
    featuredImageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Collection of modern tech gadgets including headphones, smartwatch, and laptop',
    status: ArticleStatus.PUBLISHED,
    contentType: ArticleContentType.GIFT_GUIDE,
    seoTitle: '15 Best Tech Gifts 2025 - Top Gadgets for Tech Lovers',
    seoDescription: 'Discover the best tech gifts for 2025. From smart home devices to portable gadgets, find the perfect gift for the tech enthusiast in your life.',
    seoKeywords: ['tech gifts', 'gadget gifts', 'best tech gifts 2025', 'gifts for techies'],
    readingTimeMinutes: 7,
    wordCount: 580,
    isFeatured: true,
    categorySlug: 'tech-gifts',
    tags: ['tech', 'for-him', 'birthday'],
  },
  {
    title: 'Budget-Friendly Gift Ideas Under $25',
    slug: 'budget-friendly-gift-ideas-under-25',
    excerpt: 'Thoughtful gifts don\'t have to break the bank. Discover our favorite meaningful presents under $25 that will impress anyone on your list.',
    content: `
# Budget-Friendly Gift Ideas Under $25

Great gifts don't have to come with great price tags. Here are our top picks for thoughtful, quality presents that won't empty your wallet.

## For the Homebody

### 1. Scented Candle
A high-quality scented candle instantly upgrades any space. Look for natural wax and long burn times.

**Price:** $15-25

### 2. Cozy Throw Blanket
Fleece or knit throw blankets are always appreciated, especially during the colder months.

**Price:** $20-25

### 3. Succulent Plant
Low-maintenance and adorable, succulents make great gifts for plant lovers and beginners alike.

**Price:** $10-20

## For the Foodie

### 4. Gourmet Hot Sauce Set
A collection of artisan hot sauces is perfect for the spice lover in your life.

**Price:** $15-25

### 5. Specialty Coffee Beans
Locally roasted or single-origin coffee beans make a thoughtful gift for coffee enthusiasts.

**Price:** $12-22

### 6. Recipe Journal
A beautiful journal for recording favorite recipes is both practical and sentimental.

**Price:** $15-20

## For the Self-Care Enthusiast

### 7. Face Mask Set
Sheet masks or clay masks in fun packaging make excellent stocking stuffers or standalone gifts.

**Price:** $10-25

### 8. Bath Bomb Collection
Colorful, fragrant bath bombs turn ordinary baths into spa experiences.

**Price:** $15-25

### 9. Hand Cream Trio
Premium hand creams in travel sizes are practical and indulgent.

**Price:** $18-25

## For the Creative

### 10. Adult Coloring Book with Pencils
Mindful coloring has proven benefits for stress relief. Include a set of colored pencils for a complete gift.

**Price:** $15-25

### 11. Journal or Planner
A beautiful journal or planner helps keep goals and thoughts organized.

**Price:** $15-25

## Universal Crowd-Pleasers

- Quality chocolate box ($15-25)
- Fun socks with personality ($10-15)
- Reusable water bottle ($15-25)
- Phone stand or holder ($10-20)
- Desk organizer ($15-25)

## Tips for Budget Gifting

1. **Shop early** to avoid rush shipping costs
2. **Buy in bulk** for multiple recipients
3. **Add a personal touch** with a handwritten note
4. **Consider experiences** like a coffee date IOU
5. **Look for sales** and seasonal discounts

Remember, the thought and effort you put into selecting a gift matters more than the price tag. A well-chosen $25 gift can be more meaningful than an expensive generic one!
    `,
    featuredImageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Beautifully wrapped budget-friendly gifts with ribbon and tags',
    status: ArticleStatus.PUBLISHED,
    contentType: ArticleContentType.GIFT_GUIDE,
    seoTitle: 'Best Gift Ideas Under $25 - Affordable Thoughtful Presents',
    seoDescription: 'Find the perfect budget-friendly gifts under $25. Thoughtful, quality presents for every occasion without breaking the bank.',
    seoKeywords: ['budget gifts', 'gifts under 25', 'cheap gift ideas', 'affordable presents'],
    readingTimeMinutes: 6,
    wordCount: 480,
    isFeatured: false,
    categorySlug: 'budget-friendly',
    tags: ['under-25', 'birthday', 'christmas'],
  },
  {
    title: 'Christmas Gift Guide 2025: Best Presents for Everyone',
    slug: 'christmas-gift-guide-2025',
    excerpt: 'Make this holiday season magical with our comprehensive Christmas gift guide. Perfect presents for family, friends, and coworkers.',
    content: `
# Christmas Gift Guide 2025: Best Presents for Everyone

The holiday season is here, and it's time to find the perfect gifts for everyone on your list. We've organized our top picks by recipient to make your shopping easier.

## For Parents

### For Mom
- Personalized jewelry with family birthstones
- Luxurious cashmere sweater or scarf
- Smart indoor garden for fresh herbs
- Spa day gift certificate
- Custom photo book of family memories

### For Dad
- Quality leather wallet or bag
- Whiskey tasting set
- Golf accessories or gear
- Smart home gadget
- Premium headphones for his commute

## For Siblings

### For Sister
- Skincare routine set
- Cozy loungewear set
- Experience gift (concert tickets, cooking class)
- Subscription box (books, beauty, snacks)
- Custom phone case with favorite photo

### For Brother
- Gaming accessories
- Sports team merchandise
- Quality sunglasses
- Portable Bluetooth speaker
- DIY hot sauce making kit

## For Kids

### Ages 3-7
- Building blocks or LEGO sets
- Interactive learning tablets
- Plush toys and stuffed animals
- Art supplies and craft kits
- Outdoor play equipment

### Ages 8-12
- Science experiment kits
- Board games for family game night
- Books from popular series
- Remote control vehicles
- Creative building sets

### Teens
- Wireless earbuds
- Gift cards to favorite stores
- Trendy room decor
- Skincare starter kits
- Gaming gear

## For Friends & Coworkers

### Close Friends
- Personalized gifts reflecting their hobbies
- Quality bottle of wine with accessories
- Subscription to streaming service
- Matching friendship bracelets or jewelry
- Custom artwork or prints

### Coworkers
- Desk accessories (plant, organizer)
- Premium coffee or tea
- Useful tech gadgets (power bank, USB hub)
- Nice candle or diffuser
- Gift card to local coffee shop

## For Your Partner

### Thoughtful Romantic Gifts
- Weekend getaway reservation
- Custom star map of significant date
- Personalized love letters book
- Experience they've always wanted
- Jewelry with meaningful symbolism

## Budget Breakdown

**Under $25:** Candles, books, specialty foods
**$25-50:** Quality accessories, subscription first month
**$50-100:** Electronics, premium brands, experiences
**$100+:** Luxury items, tech gadgets, major experiences

## Last-Minute Gift Ideas

Running out of time? These ideas ship fast or are available digitally:
- E-gift cards
- Digital subscriptions
- Printable gift certificates for experiences
- Donation to charity in their name
- Same-day delivery from major retailers

Happy holidays and happy gifting!
    `,
    featuredImageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Christmas presents under decorated tree with festive lights',
    status: ArticleStatus.PUBLISHED,
    contentType: ArticleContentType.SEASONAL,
    seoTitle: 'Christmas Gift Guide 2025 - Best Holiday Gift Ideas',
    seoDescription: 'Find the perfect Christmas gifts for everyone on your list. From parents to kids, discover thoughtful presents for the 2025 holiday season.',
    seoKeywords: ['christmas gifts', 'holiday gift guide', 'christmas gift ideas 2025', 'presents for family'],
    readingTimeMinutes: 9,
    wordCount: 620,
    isFeatured: true,
    categorySlug: 'holiday-gifts',
    tags: ['christmas', 'for-her', 'for-him', 'for-kids'],
  },
  {
    title: 'How to Choose the Perfect Gift: A Complete Guide',
    slug: 'how-to-choose-perfect-gift-guide',
    excerpt: 'Master the art of gift-giving with our expert tips on selecting presents that truly resonate. From understanding personality types to timing your purchase.',
    content: `
# How to Choose the Perfect Gift: A Complete Guide

Giving the perfect gift is both an art and a science. In this guide, we'll share proven strategies for selecting presents that will truly delight your recipients.

## Understanding Your Recipient

### Step 1: Listen Throughout the Year
The best gift-givers are attentive listeners. Pay attention when people mention:
- Products they've seen and liked
- Problems they need solved
- Hobbies they want to start
- Items they've been meaning to replace

**Pro Tip:** Keep notes on your phone about gift ideas throughout the year.

### Step 2: Consider Their Personality Type

**The Practical Person**
- Focuses on functionality
- Appreciates quality over quantity
- Gift ideas: useful tools, organizational items, quality basics

**The Experience Seeker**
- Values memories over possessions
- Loves trying new things
- Gift ideas: tickets, classes, travel experiences

**The Sentimental Type**
- Treasures meaningful connections
- Keeps mementos and photos
- Gift ideas: personalized items, photo gifts, handwritten letters

**The Trendsetter**
- Stays current with the latest
- Appreciates unique finds
- Gift ideas: emerging brands, viral products, limited editions

## Gift-Giving Strategies

### The 4-Gift Rule
For each person, aim for:
1. Something they want
2. Something they need
3. Something to wear
4. Something to read

### The Interest Intersection Method
Combine two of their interests into one gift. If they love cooking AND travel, consider a cookbook featuring international cuisines they want to explore.

### The Upgrade Approach
Identify something they already own but could use an upgrade. Better headphones, a nicer version of their favorite product, etc.

## Common Gift-Giving Mistakes

### Mistake 1: Giving What YOU Would Want
The gift should reflect their tastes, not yours. It's okay if you wouldn't want it for yourself.

### Mistake 2: Overspending to Impress
A thoughtful $30 gift often means more than an impersonal $100 one. Focus on thoughtfulness, not price.

### Mistake 3: Last-Minute Panic Buying
Plan ahead to have time for personalization and to avoid settling for whatever's available.

### Mistake 4: Ignoring Wish Lists
If someone has a wish list, use it! They're telling you exactly what they want.

## Presentation Matters

Don't underestimate the power of presentation:
- Use quality wrapping paper or reusable bags
- Add a thoughtful card with a personal message
- Consider the unwrapping experience
- Include gift receipts discreetly

## When You're Stuck

### Ask Questions (Subtly)
Talk to their friends or family for ideas. Or ask leading questions about things they've been eyeing.

### Gift Cards Are Okay
When done right, gift cards show you know their interests (favorite store, restaurant, experience provider).

### Experiences Over Things
When in doubt, give an experience. Dinner out, a class, or an adventure creates lasting memories.

## Final Thoughts

The perfect gift isn't about finding the most expensive or impressive item. It's about showing that you know and appreciate the recipient. Take time to think about what would make them smile, and don't be afraid to add a personal touch.

Remember: the thought truly does count more than the price tag.
    `,
    featuredImageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Person thoughtfully wrapping a gift with care',
    status: ArticleStatus.PUBLISHED,
    contentType: ArticleContentType.HOW_TO,
    seoTitle: 'How to Choose the Perfect Gift - Expert Gift-Giving Guide',
    seoDescription: 'Learn the secrets to choosing perfect gifts every time. Expert tips on understanding recipients, avoiding mistakes, and making every present memorable.',
    seoKeywords: ['how to choose gifts', 'gift giving guide', 'perfect gift tips', 'gift selection'],
    readingTimeMinutes: 8,
    wordCount: 650,
    isFeatured: false,
    categorySlug: 'gift-guides',
    tags: ['birthday', 'christmas', 'anniversary'],
  },
];

async function seedContent() {
  console.log('Starting content seed...');

  // Create Authors
  console.log('Creating authors...');
  const createdAuthors: Record<string, string> = {};
  for (const author of authors) {
    const created = await prisma.author.upsert({
      where: { slug: author.slug },
      update: author,
      create: author,
    });
    createdAuthors[author.slug] = created.id;
    console.log(`  Created author: ${author.name}`);
  }

  // Create Categories
  console.log('Creating categories...');
  const createdCategories: Record<string, string> = {};
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    createdCategories[category.slug] = created.id;
    console.log(`  Created category: ${category.name}`);
  }

  // Create Tags
  console.log('Creating tags...');
  const createdTags: Record<string, string> = {};
  for (const tag of tags) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
    createdTags[tag.slug] = created.id;
    console.log(`  Created tag: ${tag.name}`);
  }

  // Create Articles
  console.log('Creating articles...');
  const authorSlugs = Object.keys(createdAuthors);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const authorSlug = authorSlugs[i % authorSlugs.length];

    // Check if article exists
    const existing = await prisma.article.findUnique({
      where: { slug: article.slug },
    });

    if (existing) {
      console.log(`  Article already exists: ${article.title}`);
      continue;
    }

    const created = await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        featuredImageUrl: article.featuredImageUrl,
        featuredImageAlt: article.featuredImageAlt,
        status: article.status,
        contentType: article.contentType,
        publishedAt: new Date(),
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        seoKeywords: article.seoKeywords,
        readingTimeMinutes: article.readingTimeMinutes,
        wordCount: article.wordCount,
        isFeatured: article.isFeatured,
        authorId: createdAuthors[authorSlug],
      },
    });

    // Add category
    if (article.categorySlug && createdCategories[article.categorySlug]) {
      await prisma.articleCategory.create({
        data: {
          articleId: created.id,
          categoryId: createdCategories[article.categorySlug],
          isPrimary: true,
        },
      });
    }

    // Add tags
    for (const tagSlug of article.tags) {
      if (createdTags[tagSlug]) {
        await prisma.articleTag.create({
          data: {
            articleId: created.id,
            tagId: createdTags[tagSlug],
          },
        });
      }
    }

    console.log(`  Created article: ${article.title}`);
  }

  console.log('Content seed completed!');
}

export { seedContent };

// Run if executed directly
if (require.main === module) {
  seedContent()
    .catch((e) => {
      console.error('Error seeding content:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
