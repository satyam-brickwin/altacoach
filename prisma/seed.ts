import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting seed script...');

    // Create an admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    console.log('Created admin user:', admin);

    // Create businesses with different statuses
    const business1 = await prisma.business.create({
      data: {
        name: 'Acme Corporation',
        status: 'ACTIVE',
        createdBy: {
          connect: {
            id: admin.id
          }
        }
      }
    });

    const business2 = await prisma.business.create({
      data: {
        name: 'Globex Corporation',
        status: 'ACTIVE',
        createdBy: {
          connect: {
            id: admin.id
          }
        }
      }
    });

    const business3 = await prisma.business.create({
      data: {
        name: 'Wayne Enterprises',
        status: 'ACTIVE',
        createdBy: {
          connect: {
            id: admin.id
          }
        }
      }
    });
    
    // Add a PENDING business
    const pendingBusiness = await prisma.business.create({
      data: {
        name: 'Stark Industries',
        status: 'PENDING',
        createdBy: {
          connect: {
            id: admin.id
          }
        }
      }
    });
    
    // Add a SUSPENDED business
    const suspendedBusiness = await prisma.business.create({
      data: {
        name: 'Umbrella Corporation',
        status: 'SUSPENDED',
        createdBy: {
          connect: {
            id: admin.id
          }
        }
      }
    });

    console.log('Created businesses:', { 
      business1, 
      business2, 
      business3,
      pendingBusiness,
      suspendedBusiness
    });

    // Create business users
    const user1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@acme.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
        status: 'ACTIVE'
      }
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@globex.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
        status: 'ACTIVE'
      }
    });

    const user3 = await prisma.user.create({
      data: {
        name: 'Bruce Wayne',
        email: 'bruce@wayne.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
        status: 'ACTIVE'
      }
    });
    
    const pendingUser = await prisma.user.create({
      data: {
        name: 'Tony Stark',
        email: 'tony@stark.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
        status: 'ACTIVE'
      }
    });
    
    const suspendedUser = await prisma.user.create({
      data: {
        name: 'Albert Wesker',
        email: 'wesker@umbrella.com',
        password: await bcrypt.hash('password123', 10),
        role: 'USER',
        status: 'SUSPENDED'
      }
    });

    // Create business user associations
    const businessUser1 = await prisma.businessUser.create({
      data: {
        user: {
          connect: { id: user1.id }
        },
        business: {
          connect: { id: business1.id }
        },
        createdBy: {
          connect: { id: admin.id }
        }
      }
    });

    const businessUser2 = await prisma.businessUser.create({
      data: {
        user: {
          connect: { id: user2.id }
        },
        business: {
          connect: { id: business2.id }
        },
        createdBy: {
          connect: { id: admin.id }
        }
      }
    });

    const businessUser3 = await prisma.businessUser.create({
      data: {
        user: {
          connect: { id: user3.id }
        },
        business: {
          connect: { id: business3.id }
        },
        createdBy: {
          connect: { id: admin.id }
        }
      }
    });
    
    const pendingBusinessUser = await prisma.businessUser.create({
      data: {
        user: {
          connect: { id: pendingUser.id }
        },
        business: {
          connect: { id: pendingBusiness.id }
        },
        createdBy: {
          connect: { id: admin.id }
        }
      }
    });
    
    const suspendedBusinessUser = await prisma.businessUser.create({
      data: {
        user: {
          connect: { id: suspendedUser.id }
        },
        business: {
          connect: { id: suspendedBusiness.id }
        },
        createdBy: {
          connect: { id: admin.id }
        }
      }
    });

    console.log('Created business users:', { 
      businessUser1, 
      businessUser2, 
      businessUser3,
      pendingBusinessUser,
      suspendedBusinessUser
    });

    // Create documents (formerly content)
    const document1 = await prisma.document.create({
      data: {
        title: 'Introduction to Alta Coach',
        description: 'Learn the basics of using Alta Coach',
        contentType: 'COURSE',
        source: 'business',
        fileType: 'pdf',
        language: 'English',
        url: '/content/intro.pdf',
        createdBy: {
          connect: { id: admin.id }
        }
      }
    });

    const document2 = await prisma.document.create({
      data: {
        title: 'Advanced Techniques',
        description: 'Master advanced coaching techniques',
        contentType: 'GUIDE',
        source: 'business',
        fileType: 'pdf',
        language: 'English',
        url: '/content/advanced.pdf',
        createdBy: {
          connect: { id: admin.id }
        }
      }
    });

    const document3 = await prisma.document.create({
      data: {
        title: 'Practice Exercise 1',
        description: 'Breathing exercises for beginners',
        contentType: 'EXERCISE',
        source: 'business',
        fileType: 'pdf',
        language: 'English',
        url: '/content/exercise1.pdf',
        createdBy: {
          connect: { id: admin.id }
        }
      }
    });

    const document4 = await prisma.document.create({
      data: {
        title: 'Common Questions',
        description: 'Frequently asked questions',
        contentType: 'FAQ',
        source: 'admin',
        fileType: 'pdf',
        language: 'English',
        url: '/content/faq.pdf',
        createdBy: {
          connect: { id: admin.id }
        }
      }
    });

    // Connect documents to businesses using BusinessDocument junction table
    await prisma.businessDocument.create({
      data: {
        business: { connect: { id: business1.id } },
        document: { connect: { id: document1.id } },
        admin: { connect: { id: admin.id } }
      }
    });

    await prisma.businessDocument.create({
      data: {
        business: { connect: { id: business1.id } },
        document: { connect: { id: document2.id } },
        admin: { connect: { id: admin.id } }
      }
    });

    await prisma.businessDocument.create({
      data: {
        business: { connect: { id: business2.id } },
        document: { connect: { id: document3.id } },
        admin: { connect: { id: admin.id } }
      }
    });

    await prisma.businessDocument.create({
      data: {
        business: { connect: { id: business3.id } },
        document: { connect: { id: document4.id } },
        admin: { connect: { id: admin.id } }
      }
    });

    console.log('Created documents:', { document1, document2, document3, document4 });

    // Query all businesses to verify
    const allBusinesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        status: true,
      }
    });
    
    console.log('All businesses in database:');
    allBusinesses.forEach(business => {
      console.log(`- ${business.name} (${business.status})`);
    });
    
    // Count businesses by status
    const pendingCount = await prisma.business.count({
      where: { status: 'PENDING' }
    });
    
    const suspendedCount = await prisma.business.count({
      where: { status: 'SUSPENDED' }
    });
    
    const activeCount = await prisma.business.count({
      where: { status: 'ACTIVE' }
    });
    
    console.log(`\nBusiness counts by status:`);
    console.log(`- Active: ${activeCount}`);
    console.log(`- Pending: ${pendingCount}`);
    console.log(`- Suspended: ${suspendedCount}`);

    console.log('Seed completed successfully');
  } catch (e) {
    console.error('Error during seeding:', e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });