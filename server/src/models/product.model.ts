import mongoose, { Schema, model, type Model } from 'mongoose';

export type StockStatus = 'in_stock' | 'out_of_stock';

export type ProductVariant = {
  /** Size or colour option label, e.g. "M", "3XL". */
  name: string;
  /** null = price on request (the brand quotes on WhatsApp). */
  price: number | null;
  stockStatus: StockStatus;
};

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  fabric: string;
  care: string;
  colour: string;
  category: mongoose.Types.ObjectId | null;
  images: string[];
  variants: ProductVariant[];
  stockStatus: StockStatus;
  bestseller: boolean;
  featured: boolean;
  newArrival: boolean;
  seoTitle: string;
  seoDescription: string;
  displayOrder: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<ProductVariant>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: null, min: 0 },
    stockStatus: { type: String, enum: ['in_stock', 'out_of_stock'], default: 'in_stock' },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, default: null, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    fabric: { type: String, default: '' },
    care: { type: String, default: '' },
    colour: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    images: { type: [String], default: [] },
    variants: { type: [variantSchema], default: [] },
    stockStatus: { type: String, enum: ['in_stock', 'out_of_stock'], default: 'in_stock' },
    bestseller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ bestseller: 1, featured: 1, newArrival: 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product ?? model<IProduct>('Product', productSchema);
