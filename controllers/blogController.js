const Blog = require('../models/Blog');

function index(req, res) {
  const page = parseInt(req.query.page) || 1;
  const { posts, total, totalPages } = Blog.getAll(page, 6);
  const categories = Blog.getCategories();
  const recentPosts = Blog.getRecent(4);

  res.render('pages/blog', {
    title: 'Health Blog - AfyaCart Kenya',
    metaDescription: 'Expert health tips, wellness guides, pharmacy insights and more from AfyaCart Kenya. Stay informed about your health.',
    canonicalPath: page > 1 ? `/blog?page=${page}` : '/blog',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'AfyaCart Health Blog',
      description: 'Expert health tips, wellness guides, and pharmacy insights',
      url: 'https://afyacart.net/blog',
      publisher: {
        '@type': 'Organization',
        name: 'AfyaCart Kenya',
      },
    },
    posts,
    total,
    page,
    totalPages,
    categories,
    recentPosts,
    activeCategory: null,
  });
}

function show(req, res) {
  const post = Blog.findBySlug(req.params.slug);
  if (!post) {
    return res.status(404).render('pages/404', {
      title: 'Post Not Found - AfyaCart Kenya',
      metaDescription: 'The blog post you are looking for could not be found.',
      canonicalPath: '/blog',
    });
  }

  const categories = Blog.getCategories();
  const recentPosts = Blog.getRecent(4);
  const relatedPosts = Blog.getRelated(post.id, post.category, 3);

  res.render('pages/blog-post', {
    title: `${post.title} - AfyaCart Blog`,
    metaDescription: post.excerpt || post.title,
    canonicalPath: `/blog/${post.slug}`,
    ogType: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'AfyaCart Kenya',
      },
      image: post.featured_image || 'https://afyacart.net/images/og-image.png',
      datePublished: post.created_at ? new Date(post.created_at).toISOString() : new Date().toISOString(),
      dateModified: post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://afyacart.net/blog/${post.slug}`,
      },
    },
    post,
    categories,
    recentPosts,
    relatedPosts,
  });
}

function category(req, res) {
  const categorySlug = decodeURIComponent(req.params.category).replace(/-/g, ' ');
  // Capitalize words
  const categoryName = categorySlug.replace(/\b\w/g, c => c.toUpperCase());
  const page = parseInt(req.query.page) || 1;
  const { posts, total, totalPages } = Blog.getByCategory(categoryName, page, 6);
  const categories = Blog.getCategories();
  const recentPosts = Blog.getRecent(4);

  res.render('pages/blog', {
    title: `${categoryName} - AfyaCart Blog`,
    metaDescription: `Read our latest ${categoryName} articles and tips from AfyaCart Kenya.`,
    canonicalPath: `/blog/category/${req.params.category}`,
    jsonLd: null,
    posts,
    total,
    page,
    totalPages,
    categories,
    recentPosts,
    activeCategory: categoryName,
  });
}

module.exports = { index, show, category };
