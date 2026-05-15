# Database Seeding Guide

This directory contains scripts to populate the KaryFix database with initial data including services, categories, and admin user.

## Overview

The seeding system includes:
- **217 sub-services** across **9 main categories**
- **Admin user** for system management
- All pricing information from the KaryFix service catalog

## Available Scripts

Run these commands from the `server` directory:

### Seed Everything (Recommended)
```bash
npm run seed:all
```
This will:
1. Clear existing services and categories
2. Seed all 9 service categories
3. Seed all 217 sub-services with pricing
4. Create admin user (if not exists)

### Seed Only Services
```bash
npm run seed:services
```
Seeds all service categories and sub-services (clears existing data first).

### Seed Only Admin User
```bash
npm run seed:admin
```
Creates the admin user (skips if already exists).

## Admin Credentials

After running the seed scripts, you can login with:

- **Email:** `admin@karyfix.com`
- **Password:** `admin123`
- **Role:** `admin`

⚠️ **IMPORTANT:** Change the admin password immediately after first login!

## Service Categories

The following categories are seeded:

1. **Electronic Repair Services** (40 services)
   - Mobile, TV, Desktop, Gaming Console repairs
   - Smart home device repairs

2. **Vehicle Repair Services** (68 services)
   - Bike, Car, Auto Rickshaw repairs
   - Electric Vehicle (EV) repairs
   - Truck & heavy vehicle repairs
   - Highway breakdown & emergency services

3. **Kitchen Repair Services** (9 services)
   - Mixer, Cooker, Microwave, Refrigerator
   - Dishwasher, Water Purifier, etc.

4. **Motor Repair Services** (14 services)
   - AC Motor, LT Motor rewinding
   - Pump motor, Transformer repairs
   - Industrial motor services

5. **Laundry Services** (5 services)
   - Regular wash, Premium wash
   - Hand wash, Dry cleaning, Ironing

6. **Tailoring Services** (63 services)
   - Custom stitching (Men, Women, Kids)
   - Alterations & repairs
   - Embroidery & traditional work (Maggam, Aari, Zardozi, etc.)

7. **Interior & Construction Services** (8 services)
   - Interior design consultation
   - Tiling, Plumbing, Fixture installation
   - Construction material delivery

8. **Educational & Business Support** (4 services)
   - Student transport services
   - Xerox, Printing, Lamination, Binding

9. **Waste Management & Recycling** (6 services)
   - Plastic, Electronic, Metal waste collection
   - Paper, Glass, Rubber waste collection

## Database Structure

### ServiceCategory Schema
- name, slug, description
- icon, image
- active, featured, displayOrder

### SubService Schema
- categoryId (reference to ServiceCategory)
- name, slug, description
- priceRange (min, max, unit)
- priceType (fixed, range, per-item, per-hour, custom)
- estimatedDuration (value, unit)
- features, requirements
- active, popular, displayOrder

## Re-seeding

If you need to re-seed the database:

1. The service seeding script automatically clears existing services first
2. Run `npm run seed:all` to refresh all data
3. Admin user creation will skip if user already exists

To delete admin user before re-creating:
```bash
# Connect to MongoDB
mongosh karyfix

# Delete admin user
db.users.deleteOne({ email: "admin@karyfix.com" })

# Then run seed script
npm run seed:admin
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongosh`
- Check `.env` file has correct `MONGODB_URI`
- Default: `mongodb://localhost:27017/karyfix`

### Seeding Fails
- Check MongoDB is running
- Verify database connection string
- Ensure no schema validation errors

### Admin Already Exists
The admin seed script will notify you if admin user already exists and will not create a duplicate.

## Files

- `servicesData.js` - Complete service catalog data
- `seedServices.js` - Script to seed services
- `seedAdmin.js` - Script to seed admin user
- `README.md` - This documentation

## Notes

- All prices are in INR (Indian Rupees)
- Estimated durations are approximate
- Popular services are marked for frontend highlighting
- Featured categories appear prominently in UI
- All data matches the official KaryFix service catalog
