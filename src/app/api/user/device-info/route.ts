import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId, device } = await request.json();

    if (!userId || !device) {
      return NextResponse.json(
        { error: 'User ID and device information are required' },
        { status: 400 }
      );
    }

    console.log('Attempting to save device info for userId:', userId);

    // Parse the incoming device data first
    let deviceObj;
    try {
      // If device is already a string, parse it to an object
      deviceObj = typeof device === 'string' ? JSON.parse(device) : device;
    } catch (error) {
      console.error('Error parsing device data:', error);
      return NextResponse.json(
        { error: 'Invalid device data format' },
        { status: 400 }
      );
    }

    // Extract essential device information
    const newDeviceData = {
      deviceType: deviceObj.deviceType || 'Unknown',
      screenCategory: deviceObj.screenCategory || 'Unknown',
      orientation: deviceObj.orientation || 'Unknown',
      browser: deviceObj.browser || 'Unknown',
      os: deviceObj.os || 'Unknown',
      screenSize: deviceObj.screenSize || 'Unknown'
    };

    // Check if user already has a device record
    const existingRecord = await prisma.device_info.findFirst({
      where: {
        user_id: userId
      }
    });

    let result;
    let action;

    if (existingRecord) {
      // Update existing record
      console.log(`Updating device info for existing user ${userId}`);
      result = await prisma.device_info.update({
        where: {
          id: existingRecord.id
        },
        data: {
          device: JSON.stringify(newDeviceData),
          updatedAt: new Date()
        }
      });
      action = 'updated';
    } else {
      // Create new record for first-time user
      console.log(`Creating device info for new user ${userId}`);
      result = await prisma.device_info.create({
        data: {
          user_id: userId,
          device: JSON.stringify(newDeviceData),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      action = 'created';
    }
    
    // Clean up any possible duplicate records
    if (existingRecord) {
      const duplicates = await prisma.device_info.deleteMany({
        where: {
          user_id: userId,
          id: {
            not: existingRecord.id
          }
        }
      });
      
      if (duplicates.count > 0) {
        console.log(`⚠️ Removed ${duplicates.count} duplicate records for user ${userId}`);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      deviceInfo: result,
      action: action
    });
  } catch (error) {
    console.error('Error saving device info:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    // Include the error details for debugging
    return NextResponse.json(
      { error: 'Failed to save device information', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching device info for user:', userId);

    // Get device information for the specified user
    const deviceInfo = await prisma.device_info.findFirst({
      where: {
        user_id: userId
      }
    });

    console.log('Found device info:', deviceInfo ? 'Yes' : 'No');
    return NextResponse.json({ 
      success: true, 
      deviceInfo: deviceInfo ? [deviceInfo] : [] 
    });
  } catch (error) {
    console.error('Error retrieving device info:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve device information', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}