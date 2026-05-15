require('dotenv').config();
const mongoose = require('mongoose');
const ServiceCategory = require('../models/ServiceCategory');
const SubService = require('../models/SubService');
const servicesData = require('./servicesData');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing services data...');
    await SubService.deleteMany({});
    await ServiceCategory.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed data
    console.log('\n📦 Seeding database with services...\n');
    let totalCategories = 0;
    let totalSubServices = 0;

    for (const categoryData of servicesData) {
      // Create category with slug
      const categoryWithSlug = {
        ...categoryData.category,
        slug: categoryData.category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      };
      const category = await ServiceCategory.create(categoryWithSlug);
      totalCategories++;
      console.log(`✅ Created category: ${category.name}`);

      // Create sub-services for this category with slugs
      const subServicesWithCategory = categoryData.subServices.map(
        (subService) => ({
          ...subService,
          categoryId: category._id,
          slug: subService.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
        })
      );

      const createdSubServices = await SubService.insertMany(
        subServicesWithCategory
      );
      totalSubServices += createdSubServices.length;
      console.log(
        `   ✅ Created ${createdSubServices.length} sub-services for ${category.name}`
      );
    }

    console.log('\n✨ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories created: ${totalCategories}`);
    console.log(`   - Sub-services created: ${totalSubServices}`);

    // Display categories with counts
    console.log('\n📋 Categories with service counts:');
    const categories = await ServiceCategory.find().sort({ displayOrder: 1 });
    for (const cat of categories) {
      const count = await SubService.countDocuments({ categoryId: cat._id });
      console.log(`   - ${cat.name}: ${count} services`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
