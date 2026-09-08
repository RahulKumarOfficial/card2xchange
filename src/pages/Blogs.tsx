import React from 'react';
import { BlogPost } from '../types';

const MOCK_BLOGS: BlogPost[] = [
  {
    id: '1',
    title: 'How to maximize your gift card returns in 2026',
    excerpt: 'Learn the insider tips on getting the most value out of your unused gift cards from top retailers.',
    content: 'Full content goes here...',
    date: 'Sep 5, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600&h=400',
    author: 'Sarah Jenkins'
  },
  {
    id: '2',
    title: 'The rise of digital gift card trading',
    excerpt: 'Digital gift cards have transformed the way we exchange value. Here is why the trend is accelerating.',
    content: 'Full content goes here...',
    date: 'Aug 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&q=80&w=600&h=400',
    author: 'Michael Chen'
  },
  {
    id: '3',
    title: 'Avoiding gift card scams online',
    excerpt: 'Stay safe with these essential tips for identifying and avoiding common gift card trading scams.',
    content: 'Full content goes here...',
    date: 'Aug 15, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=600&h=400',
    author: 'Alex Rivera'
  }
];

export default function Blogs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Latest Insights & Guides</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Expert advice on gift card trading, market trends, and security tips to help you trade better.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_BLOGS.map((blog) => (
          <article key={blog.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span className="font-medium text-blue-600">{blog.author}</span>
                <span className="mx-2">&bull;</span>
                <span>{blog.date}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                {blog.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                {blog.excerpt}
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors self-start mt-auto">
                Read Article &rarr;
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
