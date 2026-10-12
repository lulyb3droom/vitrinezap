import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro"]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["entrega", "retirada"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "completed"]);

/** Grupo de opções/adicionais de um produto (ex.: "Tamanho", "Coberturas"). */
export type OptionGroup = {
  id: string;
  name: string;
  /** single = escolhe 1 (radio), multiple = escolhe vários (checkbox) */
  type: "single" | "multiple";
  required: boolean;
  /** máximo de escolhas quando type = multiple (0 = sem limite) */
  max?: number;
  items: { id: string; name: string; price: number }[];
};

export type OrderItemSummary = {
  productId: string;
  title: string;
  qty: number;
  unitPrice: number;
  options: { group: string; name: string; price: number }[];
  note?: string;
};

/** Loja + conta do lojista (users / profiles). */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  storeSlug: text("store_slug").notNull().unique(),
  storeName: text("store_name").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(), // só dígitos, com DDD
  description: text("description"),
  logoUrl: text("logo_url"),
  themeColor: text("theme_color").notNull().default("#16a34a"),
  plan: planEnum("plan").notNull().default("free"),
  pixKey: text("pix_key"),
  isOpen: boolean("is_open").notNull().default(true),
  openingHours: text("opening_hours"), // texto livre: "Seg a Sex, 9h às 18h"
  askScheduleDate: boolean("ask_schedule_date").notNull().default(false), // serviços/encomendas
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("categories_store_idx").on(t.storeId)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    imageUrl: text("image_url"),
    isAvailable: boolean("is_available").notNull().default(true),
    stock: integer("stock"), // null = sem controle de estoque
    sortOrder: integer("sort_order").notNull().default(0),
    optionsJson: jsonb("options_json").$type<OptionGroup[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("products_store_idx").on(t.storeId), index("products_category_idx").on(t.categoryId)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone"),
    itemsSummary: jsonb("items_summary").$type<OrderItemSummary[]>().notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    deliveryType: deliveryTypeEnum("delivery_type").notNull(),
    address: text("address"),
    paymentMethod: text("payment_method").notNull(),
    scheduledFor: text("scheduled_for"),
    notes: text("notes"),
    status: orderStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_store_created_idx").on(t.storeId, t.createdAt)],
);

export type Profile = typeof profiles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
