'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">About altacoach</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-4">
          altacoach is dedicated to revolutionizing the way professionals receive coaching and training support. 
          Our AI-powered platform provides personalized guidance, reinforcement, and continuous learning opportunities 
          that extend beyond traditional training programs.
        </p>
        <p className="text-gray-700 mb-4">
          We believe that effective learning doesn't end when a training session concludes. 
          That's why we've created an intelligent assistant that helps professionals apply their 
          newly acquired knowledge in real-world scenarios, reinforcing learning and accelerating skill development.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
        <p className="text-gray-700 mb-4">
          altacoach was founded by a team of learning and development experts who recognized a critical gap 
          in traditional corporate training: the lack of effective post-training support. 
          Studies show that without reinforcement, professionals retain only a fraction of what they learn during training.
        </p>
        <p className="text-gray-700 mb-4">
          By combining cutting-edge AI technology with proven learning methodologies, we've created a solution 
          that provides continuous, personalized support to help professionals retain and apply their training effectively.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
        <p className="text-gray-700 mb-4">
          Our diverse team brings together expertise in artificial intelligence, learning and development, 
          and enterprise software. We're passionate about creating technology that makes a meaningful difference 
          in how people learn and grow professionally.
        </p>
        <p className="text-gray-700">
          Together, we're building the future of professional development—one where continuous learning 
          is accessible, engaging, and effective for everyone.
        </p>
      </div>
    </div>
  );
} 