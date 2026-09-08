import { Admin } from "./Admin.js";
import { ProductCategory } from "./ProductCategory.js";
import { Product } from "./Product.js";
import { ProductImage } from "./ProductImage.js";
import { BlogCategory } from "./BlogCategory.js";
import { Blog } from "./Blog.js";
import { Order } from "./Order.js";
import { OrderItem } from "./OrderItem.js";
import { ContactEnquiry } from "./ContactEnquiry.js";
import { Coupon } from "./Coupon.js";
import { InstagramPost } from "./InstagramPost.js";

export function syncModels() {
  ProductCategory.hasMany(Product, { foreignKey: "categoryId", as: "products" });
  Product.belongsTo(ProductCategory, { foreignKey: "categoryId", as: "category" });

  Product.hasMany(ProductImage, { foreignKey: "productId", as: "images", onDelete: "CASCADE" });
  ProductImage.belongsTo(Product, { foreignKey: "productId", as: "product" });

  BlogCategory.hasMany(Blog, { foreignKey: "categoryId", as: "blogs" });
  Blog.belongsTo(BlogCategory, { foreignKey: "categoryId", as: "category" });

  Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items", onDelete: "CASCADE" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
  OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

  return {
    Admin,
    ProductCategory,
    Product,
    ProductImage,
    BlogCategory,
    Blog,
    Order,
    OrderItem,
    ContactEnquiry,
    Coupon,
    InstagramPost,
  };
}

export {
  Admin,
  ProductCategory,
  Product,
  ProductImage,
  BlogCategory,
  Blog,
  Order,
  OrderItem,
  ContactEnquiry,
  Coupon,
  InstagramPost,
};
