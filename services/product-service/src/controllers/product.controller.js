const Product = require('../models/Product.model');
const { 
  sendSuccess, 
  sendError, 
  sendPaginated,
  AppError, 
  catchAsync,
  Logger,
  uploadMultipleImages,
  deleteMultipleImages,
  deleteImage,
  isValidObjectId,
  cloudinary
} = require('../../../../shared');

// Helper function to upload base64 image to Cloudinary
const uploadBase64Image = async (base64String, folder) => {
  try {
    // Remove data:image/png;base64, prefix if exists
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    
    const result = await cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
      folder: `ecommerce/${folder}`,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto:good' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    throw new Error('Failed to upload image: ' + error.message);
  }
};

// Create new product (JSON with base64 images)
exports.createProduct = catchAsync(async (req, res, next) => {
  const { 
    name, 
    description, 
    price, 
    discountPrice, 
    category, 
    subCategory, 
    inventory, 
    specifications, 
    tags, 
    brand,
    isFeatured,
    images // Array of base64 strings or image URLs
  } = req.body;
  
  const sellerId = req.userId;

  // Validate required fields
  if (!name || !description || !price || !category) {
    throw new AppError('Name, description, price, and category are required', 400);
  }

  // Validate category
  const validCategories = [
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Beauty',
    'Sports',
    'Books',
    'Toys',
    'Automotive',
    'Health',
    'Grocery',
    'Other'
  ];

  if (!validCategories.includes(category)) {
    throw new AppError(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
  }

  // Handle images if provided
  let imageData = [];
  if (images && Array.isArray(images) && images.length > 0) {
    if (images.length > 5) {
      throw new AppError('Maximum 5 images allowed', 400);
    }

    try {
      Logger.info('Uploading images to Cloudinary', { count: images.length });
      
      // Upload all images in parallel
      const uploadPromises = images.map(base64Img => 
        uploadBase64Image(base64Img, `products/${sellerId}`)
      );
      
      imageData = await Promise.all(uploadPromises);
      
      Logger.info('Images uploaded successfully', {
        count: imageData.length,
        sellerId
      });
    } catch (error) {
      Logger.error('Image upload failed', error);
      throw new AppError('Failed to upload images: ' + error.message, 500);
    }
  }

  // Create product
  const product = new Product({
    sellerId,
    name,
    description,
    price: parseFloat(price),
    discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
    category,
    subCategory: subCategory || undefined,
    images: imageData,
    inventory: inventory || { quantity: 0 },
    specifications: specifications || {},
    tags: tags || [],
    brand: brand || undefined,
    isFeatured: isFeatured || false
  });

  await product.save();

  Logger.info('Product created', {
    productId: product._id,
    sellerId,
    name: product.name,
    imageCount: imageData.length
  });

  return sendSuccess(
    res,
    { product },
    'Product created successfully',
    201
  );
});

// Update product (JSON with optional base64 images)
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { images, ...updates } = req.body;
  const sellerId = req.userId;

  if (!isValidObjectId(id)) {
    throw new AppError('Invalid product ID', 400);
  }

  // Find product and verify ownership
  const product = await Product.findOne({ _id: id, sellerId });
  
  if (!product) {
    throw new AppError('Product not found or you do not have permission to update it', 404);
  }

  // Handle image updates if provided
  if (images && Array.isArray(images) && images.length > 0) {
    if (images.length > 5) {
      throw new AppError('Maximum 5 images allowed', 400);
    }

    try {
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        const publicIds = product.images.map(img => img.publicId);
        await deleteMultipleImages(publicIds);
        Logger.info('Old images deleted', { count: publicIds.length });
      }

      // Upload new images
      Logger.info('Uploading new images', { count: images.length });
      
      const uploadPromises = images.map(base64Img => 
        uploadBase64Image(base64Img, `products/${sellerId}`)
      );
      
      const imageData = await Promise.all(uploadPromises);
      updates.images = imageData;
      
      Logger.info('New images uploaded', { count: imageData.length });
    } catch (error) {
      Logger.error('Image update failed', error);
      throw new AppError('Failed to update images: ' + error.message, 500);
    }
  }

  // Don't allow updating these fields
  delete updates.sellerId;
  delete updates._id;

  // Update product
  Object.assign(product, updates);
  await product.save();

  Logger.info('Product updated', {
    productId: product._id,
    sellerId
  });

  return sendSuccess(res, { product }, 'Product updated successfully');
});

// Get all products with filters and pagination
// Get all products with filters and pagination
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    category,
    minPrice,
    maxPrice,
    search,
    isActive,
    isFeatured
  } = req.query;

  // Build query
  let query = {};

  // Only filter by isActive if explicitly provided
  if (isActive !== undefined && isActive !== null && isActive !== '') {
    query.isActive = isActive === 'true';
  }

  if (isFeatured !== undefined && isFeatured !== null && isFeatured !== '') {
    query.isFeatured = isFeatured === 'true';
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (search) {
    query.$text = { $search: search };
  }

  console.log('📊 Query being used:', JSON.stringify(query));

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      // REMOVED .populate('sellerId') - causing the error
      .select('-__v'),
    Product.countDocuments(query)
  ]);

  console.log(`✅ Found ${products.length} products out of ${total} total`);

  Logger.info('Products fetched', {
    count: products.length,
    total,
    page,
    filters: query
  });

  return sendPaginated(res, products, page, limit, total);
});


// Get single product by ID
exports.getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new AppError('Invalid product ID', 400);
  }

  const product = await Product.findById(id)
    // REMOVED .populate('sellerId')
    // REMOVED .populate('reviews.userId')
    .select('-__v');

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Increment views
  product.views += 1;
  await product.save();

  return sendSuccess(res, { product }, 'Product retrieved successfully');
});


// Get products by seller
// Get products by seller
exports.getProductsBySeller = catchAsync(async (req, res, next) => {
  const sellerId = req.params.sellerId || req.userId;
  const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

  if (!isValidObjectId(sellerId)) {
    throw new AppError('Invalid seller ID', 400);
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find({ sellerId })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      // REMOVED .populate()
      .select('-__v'),
    Product.countDocuments({ sellerId })
  ]);

  return sendPaginated(res, products, page, limit, total);
});


// Delete product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const sellerId = req.userId;

  if (!isValidObjectId(id)) {
    throw new AppError('Invalid product ID', 400);
  }

  // Find product and verify ownership
  const product = await Product.findOne({ _id: id, sellerId });
  
  if (!product) {
    throw new AppError('Product not found or you do not have permission to delete it', 404);
  }

  // Delete images from Cloudinary
  if (product.images && product.images.length > 0) {
    try {
      const publicIds = product.images.map(img => img.publicId);
      await deleteMultipleImages(publicIds);
      Logger.info('Product images deleted from Cloudinary', {
        count: publicIds.length
      });
    } catch (error) {
      Logger.error('Failed to delete images', error);
      // Continue with product deletion even if image deletion fails
    }
  }

  await product.deleteOne();

  Logger.info('Product deleted', {
    productId: id,
    sellerId
  });

  return sendSuccess(res, null, 'Product deleted successfully');
});

// Search products
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

  if (!q) {
    throw new AppError('Search query is required', 400);
  }

  let query = {
    isActive: true,
    $text: { $search: q }
  };

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort({ score: { $meta: 'textScore' }, 'ratings.average': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'),
    Product.countDocuments(query)
  ]);

  Logger.info('Product search completed', {
    query: q,
    resultsCount: products.length
  });

  return sendPaginated(res, products, page, limit, total);
});

// Add product review
exports.addReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.userId;

  if (!isValidObjectId(id)) {
    throw new AppError('Invalid product ID', 400);
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  const product = await Product.findById(id);
  
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if user already reviewed
  const existingReview = product.reviews.find(
    review => review.userId.toString() === userId
  );

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  // Add review
  product.reviews.push({
    userId,
    rating,
    comment
  });

  // Update ratings
  product.updateRatings();
  await product.save();

  Logger.info('Review added', {
    productId: id,
    userId,
    rating
  });

  return sendSuccess(res, { product }, 'Review added successfully');
});

// Get product categories
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Product.distinct('category');
  
  return sendSuccess(res, { categories }, 'Categories retrieved successfully');
});
