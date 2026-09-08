import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sequelize } from "../config/database.js";
import {
  Admin,
  Blog,
  BlogCategory,
  ContactEnquiry,
  Order,
  OrderItem,
  Product,
  ProductCategory,
  ProductImage,
  syncModels,
} from "../models/index.js";
import { loadFrontendCatalog } from "./load-frontend-catalog.mjs";
import { Op } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

const blogCategories = [
  { name: "Skincare Tips", slug: "skincare-tips", description: "Routine and skin health advice." },
  { name: "Makeup Guides", slug: "makeup-guides", description: "Tutorials and beauty how-tos." },
  { name: "Salon Care", slug: "salon-care", description: "Professional and wholesale insights." },
];

const blogs = [
  {
    title: "5 Daily Skincare Habits for Healthy Glow",
    slug: "5-daily-skincare-habits-for-healthy-glow",
    excerpt: "Simple routines that support healthy-looking skin every day.",
    content: "<p>Start with gentle cleansing, hydrating moisturizer, and SPF protection.</p>",
    author: "LGS Team",
    status: "Published",
    tags: ["skincare", "glow"],
    categorySlug: "skincare-tips",
  },
  {
    title: "Choosing the Right Lipstick Shade",
    slug: "choosing-the-right-lipstick-shade",
    excerpt: "How to match lipstick tones with your skin undertone.",
    content: "<p>Warm, cool and neutral undertones can guide your best lipstick match.</p>",
    author: "LGS Team",
    status: "Published",
    tags: ["makeup", "lips"],
    categorySlug: "makeup-guides",
  },
];

const uploadedProductImages = {
  "under-eye-gel": "/uploads/1788341676424-11.png",
  "acne-pimple-oil-control-cream": "/uploads/1788341792808-9.png",
  "spf-50-sunscreen": "/uploads/1788344476725-1.png",
  "hair-tonic": "/uploads/1788342355117-4.png",
  "jasmine-hair-oil": "/uploads/1788342387362-3.png",
  "hair-serum": "/uploads/1788342320640-5.png",
  "hair-growth-active-serum": "/uploads/1788341741932-10.png",
  "fairness-cream": "/uploads/1788341258918-12.png",
  "aloe-vera-shampoo": "/uploads/1788341870561-7.png",
  "anti-dandruff-shampoo": "/uploads/1788342257853-6.png",
  "moisturizer": "/uploads/1788342459319-2.png",
  "anti-blemishing-face-bar": "/uploads/1788339637744-14.png",
  "d-tan-face-pack": "/uploads/1788341205040-13.png",
  "anti-blemish-cream": "/uploads/1788341837596-8.png",
};
const faceBarGallery = [1, 2, 3, 4].map((n) => `/uploads/${["1788339637762-1.png", "1788339637774-2.png", "1788339637788-3.png", "1788339637808-4.png"][n - 1]}`);

async function upsertBySlug(model, values) {
  const record = await model.findOne({ where: { slug: values.slug } });
  if (record) {
    await record.update(values);
    return record;
  }
  return model.create(values);
}

async function main() {
  syncModels();
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  {
    const admin = await Admin.findOne({ where: { email: "admin@lgs.com" } });
    const values = {
      name: "LGS Admin",
      email: "admin@lgs.com",
      passwordHash,
      role: "Super Admin",
      status: "Active",
    };
    if (admin) {
      await admin.update(values);
    } else {
      await Admin.create(values);
    }
  }

  const { categories, products } = loadFrontendCatalog();

  // Remove old demo/duplicate products so the admin inventory matches the client brochure catalog.
  await Product.destroy({ where: { slug: { [Op.notIn]: products.map((product) => product.slug) } } });

  for (const category of categories) {
    await upsertBySlug(ProductCategory, {
      name: category.name,
      slug: category.slug,
      description: category.tagline,
      image: category.image,
      group: category.group,
      types: category.types,
      status: "Active",
      displayOrder: 0,
    });
  }

  for (const product of products) {
    const category = await ProductCategory.findOne({ where: { slug: product.category } });
    if (!category) continue;

    // Never replace an image uploaded from the admin panel with the bundled
    // brochure placeholder when reseeding the catalog.
    const existingProduct = await Product.findOne({ where: { slug: product.slug } });
    const uploadedMain = existingProduct?.mainImage?.startsWith("/uploads/")
      ? existingProduct.mainImage
      : uploadedProductImages[product.slug] || null;
    const uploadedGallery = Array.isArray(existingProduct?.additionalImages)
      ? existingProduct.additionalImages.filter((image) => String(image).startsWith("/uploads/"))
      : [];

    const record = await upsertBySlug(Product, {
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      type: product.type,
      subtitle: product.subtitle,
      description: product.description,
      shortDescription: product.subtitle,
      price: product.mrp,
      salePrice: product.price,
      sku: product.id.toUpperCase(),
      stock: product.inStock ? 24 : 0,
      mainImage: uploadedMain || product.image,
      additionalImages: uploadedGallery.length
        ? uploadedGallery
        : product.slug === "anti-blemishing-face-bar"
          ? faceBarGallery
          : [product.hoverImage].filter(Boolean),
      status: product.inStock ? "Active" : "Inactive",
      featured: product.tags?.includes("bestseller") || product.tags?.includes("trending"),
      ingredients: product.keyIngredients?.join(", ") ?? null,
      benefits: product.benefits?.join(" | ") ?? null,
      usage: product.howToUse,
      size: product.size ?? null,
      variants: product.variants ?? null,
      tags: product.tags,
      rating: product.rating,
      reviews: product.reviews,
      metaTitle: product.name,
      metaDescription: product.subtitle,
      categoryId: category.id,
    });

    const existingImage = await ProductImage.findOne({
      where: { productId: record.id, url: product.image, isPrimary: true },
    });
    const imageValues = { productId: record.id, url: product.image, isPrimary: true, alt: product.name };
    if (existingImage) {
      await existingImage.update(imageValues);
    } else {
      await ProductImage.create(imageValues);
    }
  }

  for (const category of blogCategories) {
    await upsertBySlug(BlogCategory, category);
  }

  for (const blog of blogs) {
    const category = await BlogCategory.findOne({ where: { slug: blog.categorySlug } });
    if (!category) continue;
    await upsertBySlug(Blog, {
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      featuredImage: "/assets/blog-placeholder.jpg",
      author: blog.author,
      tags: blog.tags,
      status: blog.status,
      publishedAt: new Date(),
      metaTitle: blog.title,
      metaDescription: blog.excerpt,
      categoryId: category.id,
    });
  }

  {
    const enquiryValues = {
      name: "Sample Customer",
      email: "customer@example.com",
      phone: "+91 90000 00000",
      subject: "Product help",
      message: "Need help with product selection.",
      status: "New",
    };
    const enquiry = await ContactEnquiry.findOne({
      where: { email: enquiryValues.email, message: enquiryValues.message },
    });
    if (enquiry) {
      await enquiry.update(enquiryValues);
    } else {
      await ContactEnquiry.create(enquiryValues);
    }
  }

  {
    const orderValues = {
      orderNumber: "LGS-0001",
      customerName: "Sample Customer",
      email: "customer@example.com",
      phone: "+91 90000 00000",
      shippingAddress: "Sample shipping address",
      billingAddress: "Sample billing address",
      subtotal: 999,
      discount: 0,
      shippingCharge: 0,
      totalAmount: 999,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      notes: "Seed order",
    };
    const order = await Order.findOne({ where: { orderNumber: orderValues.orderNumber } });
    if (order) {
      await order.update(orderValues);
    } else {
      await Order.create(orderValues);
    }
  }

  console.log("Seed data inserted successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
