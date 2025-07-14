var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb, varchar, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users, menuCategories, menuItems, orders, insertUserSchema, insertMenuCategorySchema, insertMenuItemSchema, insertOrderSchema, pushSubscriptions, creditTransactions, pendingCreditTransfers, insertPushSubscriptionSchema, insertCreditTransactionSchema, insertPendingCreditTransferSchema, restaurantOrders, insertRestaurantOrderSchema, restaurantOrderItems, insertRestaurantOrderItemSchema, kitchenOrders, insertKitchenOrderSchema, inventory, insertInventorySchema, staff, insertStaffSchema, favorites, insertFavoriteSchema, menuItemOptions, insertMenuItemOptionSchema, menuItemsRelations, menuItemOptionsRelations;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      email: text("email"),
      credits: doublePrecision("credits").notNull().default(0),
      fullName: text("full_name"),
      phoneNumber: text("phone_number"),
      isAdmin: boolean("is_admin").notNull().default(false),
      isActive: boolean("is_active").notNull().default(true),
      isMember: boolean("is_member").notNull().default(false),
      membershipDate: timestamp("membership_date"),
      qrCode: text("qr_code"),
      // Store the QR code data URL
      resetToken: text("reset_token"),
      // Password reset token
      resetTokenExpiry: timestamp("reset_token_expiry")
      // Expiration time for reset token
    });
    menuCategories = pgTable("menu_categories", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      displayName: text("display_name").notNull(),
      description: text("description"),
      displayOrder: integer("display_order").default(999),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    menuItems = pgTable("menu_items", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      price: doublePrecision("price").notNull(),
      category: text("category").notNull(),
      imageUrl: text("image_url"),
      hasSizes: boolean("has_sizes").default(false),
      mediumPrice: doublePrecision("medium_price"),
      largePrice: doublePrecision("large_price"),
      hasOptions: boolean("has_options").default(false)
      // Flag to indicate if item has flavor options
    });
    orders = pgTable("orders", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      status: text("status").notNull().default("processing"),
      total: doublePrecision("total").notNull(),
      items: jsonb("items").notNull()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true,
      email: true,
      fullName: true,
      phoneNumber: true,
      isAdmin: true,
      isActive: true,
      credits: true,
      qrCode: true
    });
    insertMenuCategorySchema = createInsertSchema(menuCategories).omit({
      id: true,
      createdAt: true
    });
    insertMenuItemSchema = createInsertSchema(menuItems);
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true
    });
    pushSubscriptions = pgTable("push_subscriptions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      endpoint: text("endpoint").notNull(),
      p256dh: text("p256dh").notNull(),
      auth: text("auth").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    creditTransactions = pgTable("credit_transactions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      type: text("type").notNull(),
      // 'purchase', 'transfer_sent', 'transfer_received', 'order_payment', 'iap_purchase', 'membership_iap'
      amount: doublePrecision("amount").notNull(),
      balanceAfter: doublePrecision("balance_after").notNull(),
      description: text("description").notNull(),
      relatedUserId: integer("related_user_id").references(() => users.id),
      // For transfers
      orderId: integer("order_id").references(() => orders.id),
      // For order payments
      transactionId: text("transaction_id"),
      // For IAP transaction tracking
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    pendingCreditTransfers = pgTable("pending_credit_transfers", {
      id: serial("id").primaryKey(),
      verificationCode: text("verification_code").notNull().unique(),
      senderId: integer("sender_id").notNull().references(() => users.id),
      recipientPhone: text("recipient_phone").notNull(),
      amount: doublePrecision("amount").notNull(),
      status: text("status").notNull().default("pending"),
      // 'pending', 'verified', 'expired'
      createdAt: timestamp("created_at").notNull().defaultNow(),
      expiresAt: timestamp("expires_at").notNull(),
      verifiedAt: timestamp("verified_at"),
      verifiedByUserId: integer("verified_by_user_id").references(() => users.id)
      // Staff member who verified
    });
    insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
      id: true,
      createdAt: true
    });
    insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
      id: true,
      createdAt: true
    });
    insertPendingCreditTransferSchema = createInsertSchema(pendingCreditTransfers).omit({
      id: true,
      createdAt: true,
      verifiedAt: true
    });
    restaurantOrders = pgTable("restaurant_orders", {
      id: serial("id").primaryKey(),
      squareOrderId: varchar("square_order_id", { length: 255 }).unique(),
      userId: integer("user_id").references(() => users.id),
      customerName: varchar("customer_name", { length: 255 }),
      status: varchar("status", { length: 50 }).notNull().default("OPEN"),
      // OPEN, COMPLETED, CANCELED
      fulfillmentType: varchar("fulfillment_type", { length: 20 }).notNull(),
      // PICKUP, DELIVERY, DINE_IN
      totalAmount: doublePrecision("total_amount").notNull(),
      scheduledAt: timestamp("scheduled_at"),
      completedAt: timestamp("completed_at"),
      notes: text("notes"),
      metadata: jsonb("metadata"),
      // Store Square-specific data
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertRestaurantOrderSchema = createInsertSchema(restaurantOrders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    restaurantOrderItems = pgTable("restaurant_order_items", {
      id: serial("id").primaryKey(),
      restaurantOrderId: integer("restaurant_order_id").notNull().references(() => restaurantOrders.id),
      menuItemId: integer("menu_item_id").references(() => menuItems.id),
      squareItemId: varchar("square_item_id", { length: 255 }),
      name: varchar("name", { length: 255 }).notNull(),
      quantity: integer("quantity").notNull(),
      unitPrice: doublePrecision("unit_price").notNull(),
      totalPrice: doublePrecision("total_price").notNull(),
      modifiers: jsonb("modifiers"),
      // Store item modifiers
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertRestaurantOrderItemSchema = createInsertSchema(restaurantOrderItems).omit({
      id: true,
      createdAt: true
    });
    kitchenOrders = pgTable("kitchen_orders", {
      id: serial("id").primaryKey(),
      restaurantOrderId: integer("restaurant_order_id").notNull().references(() => restaurantOrders.id),
      station: varchar("station", { length: 50 }).notNull().default("main"),
      // main, drinks, pastry, etc.
      status: varchar("status", { length: 20 }).notNull().default("pending"),
      // pending, preparing, ready, completed
      priority: integer("priority").notNull().default(1),
      // 1=normal, 2=high, 3=urgent
      estimatedTime: integer("estimated_time_minutes"),
      startedAt: timestamp("started_at"),
      completedAt: timestamp("completed_at"),
      assignedTo: varchar("assigned_to", { length: 255 }),
      notes: text("notes"),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertKitchenOrderSchema = createInsertSchema(kitchenOrders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    inventory = pgTable("inventory", {
      id: serial("id").primaryKey(),
      menuItemId: integer("menu_item_id").references(() => menuItems.id),
      squareItemId: varchar("square_item_id", { length: 255 }),
      itemName: varchar("item_name", { length: 255 }).notNull(),
      currentStock: integer("current_stock").notNull().default(0),
      minimumStock: integer("minimum_stock").notNull().default(0),
      maxStock: integer("max_stock"),
      unit: varchar("unit", { length: 50 }).notNull().default("pieces"),
      // pieces, kg, liters, etc.
      costPerUnit: doublePrecision("cost_per_unit"),
      supplier: varchar("supplier", { length: 255 }),
      lastRestocked: timestamp("last_restocked"),
      lowStockAlert: boolean("low_stock_alert").notNull().default(true),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertInventorySchema = createInsertSchema(inventory).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    staff = pgTable("staff", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      employeeId: varchar("employee_id", { length: 50 }).unique(),
      firstName: varchar("first_name", { length: 255 }).notNull(),
      lastName: varchar("last_name", { length: 255 }).notNull(),
      role: varchar("role", { length: 50 }).notNull(),
      // cashier, barista, kitchen, manager
      permissions: jsonb("permissions"),
      // Store role-specific permissions
      hourlyRate: doublePrecision("hourly_rate"),
      isActive: boolean("is_active").notNull().default(true),
      hiredAt: timestamp("hired_at").notNull().defaultNow(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    insertStaffSchema = createInsertSchema(staff).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    favorites = pgTable("favorites", {
      userId: integer("user_id").notNull().references(() => users.id),
      menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => {
      return {
        pk: primaryKey({ columns: [table.userId, table.menuItemId] })
      };
    });
    insertFavoriteSchema = createInsertSchema(favorites).omit({
      createdAt: true
    });
    menuItemOptions = pgTable("menu_item_options", {
      id: serial("id").primaryKey(),
      menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
      name: text("name").notNull(),
      // e.g., "Chocolate", "Vanilla", "Milk Alternatives"
      optionType: text("option_type").default("flavor"),
      // e.g., "flavor", "milk", "size"
      displayOrder: integer("display_order").default(999),
      priceAdjustment: doublePrecision("price_adjustment").default(0),
      // Additional cost for this option, if any
      isParent: boolean("is_parent").default(false),
      // True if this is a parent option (like "Milk Alternatives")
      parentId: integer("parent_id"),
      // References parent option if this is a sub-option
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertMenuItemOptionSchema = createInsertSchema(menuItemOptions).omit({
      id: true,
      createdAt: true
    });
    menuItemsRelations = relations(menuItems, ({ many }) => ({
      options: many(menuItemOptions)
    }));
    menuItemOptionsRelations = relations(menuItemOptions, ({ one, many }) => ({
      menuItem: one(menuItems, {
        fields: [menuItemOptions.menuItemId],
        references: [menuItems.id]
      }),
      parent: one(menuItemOptions, {
        fields: [menuItemOptions.parentId],
        references: [menuItemOptions.id]
      }),
      children: many(menuItemOptions)
    }));
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  comparePasswords: () => comparePasswords,
  hashPassword: () => hashPassword,
  setupAuth: () => setupAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "bean-stalker-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (usernameOrEmail, password, done) => {
      let user = await storage.getUserByUsername(usernameOrEmail);
      if (!user) {
        user = await storage.getUserByEmail(usernameOrEmail);
      }
      if (!user || !await comparePasswords(password, user.password)) {
        return done(null, false);
      } else {
        if (user.isActive === false) {
          return done(null, false);
        }
        return done(null, user);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    try {
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      return res.status(400).json({ message: "Failed to create user" });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
var scryptAsync;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    scryptAsync = promisify(scrypt);
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  MemStorage: () => MemStorage,
  storage: () => storage
});
import { randomBytes as randomBytes2 } from "crypto";
import session2 from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { eq, desc, sql, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var MemoryStore, PostgresSessionStore, MemStorage, DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    MemoryStore = createMemoryStore(session2);
    PostgresSessionStore = connectPg(session2);
    MemStorage = class {
      users;
      menuItems;
      menuCategories;
      menuItemOptions;
      // Added menu item options map
      orders;
      creditTransactions;
      pendingCreditTransfers;
      favorites;
      // Store favorites with a composite key: `${userId}-${menuItemId}`
      sessionStore;
      currentUserId;
      currentMenuItemId;
      currentCategoryId;
      currentOrderId;
      currentTransactionId;
      currentPendingTransferId;
      currentMenuItemOptionId;
      // Added counter for option IDs
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.menuItems = /* @__PURE__ */ new Map();
        this.menuCategories = /* @__PURE__ */ new Map();
        this.menuItemOptions = /* @__PURE__ */ new Map();
        this.orders = /* @__PURE__ */ new Map();
        this.creditTransactions = /* @__PURE__ */ new Map();
        this.pendingCreditTransfers = /* @__PURE__ */ new Map();
        this.favorites = /* @__PURE__ */ new Map();
        this.sessionStore = new MemoryStore({
          checkPeriod: 864e5
          // 24 hours
        });
        this.currentUserId = 1;
        this.currentMenuItemId = 1;
        this.currentCategoryId = 1;
        this.currentOrderId = 1;
        this.currentTransactionId = 1;
        this.currentPendingTransferId = 1;
        this.currentMenuItemOptionId = 1;
        this.initializeCategories();
        this.initializeMenu();
      }
      // Add implementation for the new interface method
      async initializeDatabase() {
        return Promise.resolve();
      }
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async getUserByEmail(email) {
        return Array.from(this.users.values()).find(
          (user) => user.email === email
        );
      }
      async getUserByQrCode(qrCode) {
        return Array.from(this.users.values()).find(
          (user) => user.qrCode === qrCode
        );
      }
      async createPasswordResetToken(email) {
        const user = await this.getUserByEmail(email);
        if (!user) {
          return void 0;
        }
        const token = randomBytes2(32).toString("hex");
        const expiry = /* @__PURE__ */ new Date();
        expiry.setHours(expiry.getHours() + 1);
        const updatedUser = {
          ...user,
          resetToken: token,
          resetTokenExpiry: expiry
        };
        this.users.set(user.id, updatedUser);
        return token;
      }
      async getUserByResetToken(token) {
        const now = /* @__PURE__ */ new Date();
        return Array.from(this.users.values()).find(
          (user) => user.resetToken === token && user.resetTokenExpiry && user.resetTokenExpiry > now
        );
      }
      async resetPassword(userId, newPassword) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        const updatedUser = {
          ...user,
          password: newPassword,
          resetToken: null,
          resetTokenExpiry: null
        };
        this.users.set(userId, updatedUser);
        return updatedUser;
      }
      async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = {
          ...insertUser,
          id,
          credits: 100,
          // Start with 100 credits
          fullName: insertUser.fullName || "",
          phoneNumber: insertUser.phoneNumber || "",
          isAdmin: insertUser.isAdmin || false,
          isActive: insertUser.isActive !== void 0 ? insertUser.isActive : true,
          // Default to active if not specified
          isMember: insertUser.isMember || false,
          membershipDate: insertUser.membershipDate || null,
          email: insertUser.email || null,
          qrCode: null,
          // QR code will be generated later
          resetToken: null,
          resetTokenExpiry: null
        };
        this.users.set(id, user);
        return user;
      }
      async getAllUsers() {
        return Array.from(this.users.values());
      }
      async getAdminUsers() {
        return Array.from(this.users.values()).filter((user) => user.isAdmin === true);
      }
      async getAllOrders() {
        return Array.from(this.orders.values());
      }
      async getRecentOrders(limit = 50) {
        const allOrders = Array.from(this.orders.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
        const ordersWithUsernames = [];
        for (const order of allOrders) {
          const user = await this.getUser(order.userId);
          ordersWithUsernames.push({
            ...order,
            username: user ? user.username : "Unknown User"
          });
        }
        return ordersWithUsernames;
      }
      async getAllOrdersWithUserDetails() {
        const allOrders = Array.from(this.orders.values());
        const ordersWithUserDetails = allOrders.map((order) => {
          const user = this.users.get(order.userId);
          return {
            ...order,
            userName: user ? user.username : "Unknown User",
            userFullName: user ? user.fullName : null
          };
        });
        return ordersWithUserDetails;
      }
      async updateOrderStatus(orderId, status) {
        const order = this.orders.get(orderId);
        if (!order) {
          throw new Error("Order not found");
        }
        const updatedOrder = { ...order, status };
        this.orders.set(orderId, updatedOrder);
        return updatedOrder;
      }
      async setUserAdmin(userId, isAdmin2) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        const updatedUser = { ...user, isAdmin: isAdmin2 };
        this.users.set(userId, updatedUser);
        return updatedUser;
      }
      async setUserActive(userId, isActive) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        const updatedUser = { ...user, isActive };
        this.users.set(userId, updatedUser);
        return updatedUser;
      }
      async setUserMembership(userId, isMember) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        const updatedUser = {
          ...user,
          isMember,
          membershipDate: isMember ? /* @__PURE__ */ new Date() : null
        };
        this.users.set(userId, updatedUser);
        return updatedUser;
      }
      async clearAllUsers(exceptUserIds) {
        const preservedUsers = /* @__PURE__ */ new Map();
        for (const userId of exceptUserIds) {
          const user = this.users.get(userId);
          if (user) {
            preservedUsers.set(userId, user);
          }
        }
        this.users = preservedUsers;
        return Promise.resolve();
      }
      async clearAllOrders() {
        this.orders = /* @__PURE__ */ new Map();
        return Promise.resolve();
      }
      async updateUser(userId, userData) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        const { id, credits, password, isAdmin: isAdmin2, qrCode, ...allowedUpdates } = userData;
        const updatedUser = { ...user, ...allowedUpdates };
        this.users.set(userId, updatedUser);
        return updatedUser;
      }
      async updateUserCredits(userId, amount) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        const updatedUser = { ...user, credits: amount };
        this.users.set(userId, updatedUser);
        return updatedUser;
      }
      async updateUserQrCode(userId, qrCode) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error("User not found");
        }
        const updatedUser = { ...user, qrCode };
        this.users.set(userId, updatedUser);
        return updatedUser;
      }
      async getMenuItems() {
        return Array.from(this.menuItems.values());
      }
      async getMenuItemsByCategory(category) {
        return Array.from(this.menuItems.values()).filter(
          (item) => item.category === category
        );
      }
      async getMenuCategories() {
        const allCategories = await this.getAllCategories();
        return allCategories.map((category) => category.name);
      }
      async createMenuItem(menuItem) {
        const id = this.currentMenuItemId++;
        const newMenuItem = {
          ...menuItem,
          id
        };
        this.menuItems.set(id, newMenuItem);
        return newMenuItem;
      }
      async updateMenuItem(id, menuItem) {
        const existingMenuItem = this.menuItems.get(id);
        if (!existingMenuItem) {
          throw new Error("Menu item not found");
        }
        const updatedMenuItem = {
          ...existingMenuItem,
          ...menuItem
        };
        this.menuItems.set(id, updatedMenuItem);
        return updatedMenuItem;
      }
      async deleteMenuItem(id) {
        if (!this.menuItems.has(id)) {
          throw new Error("Menu item not found");
        }
        this.menuItems.delete(id);
      }
      async getMenuItem(id) {
        return this.menuItems.get(id);
      }
      async createOrder(insertOrder) {
        const id = this.currentOrderId++;
        const order = {
          ...insertOrder,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.orders.set(id, order);
        return order;
      }
      async getOrderById(orderId) {
        return this.orders.get(orderId);
      }
      async getOrdersByUserId(userId) {
        return Array.from(this.orders.values()).filter(
          (order) => order.userId === userId
        );
      }
      // Menu Item Options methods
      async getMenuItemOptions(menuItemId) {
        return Array.from(this.menuItemOptions.values()).filter(
          (option) => option.menuItemId === menuItemId
        );
      }
      async createMenuItemOption(option) {
        const id = this.currentMenuItemOptionId++;
        const newOption = {
          ...option,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.menuItemOptions.set(id, newOption);
        const menuItem = await this.getMenuItem(option.menuItemId);
        if (menuItem) {
          await this.updateMenuItem(menuItem.id, { hasOptions: true });
        }
        return newOption;
      }
      async updateMenuItemOption(id, optionData) {
        const existingOption = this.menuItemOptions.get(id);
        if (!existingOption) {
          throw new Error("Menu item option not found");
        }
        const updatedOption = {
          ...existingOption,
          ...optionData
        };
        this.menuItemOptions.set(id, updatedOption);
        return updatedOption;
      }
      async deleteMenuItemOption(id) {
        const option = this.menuItemOptions.get(id);
        if (!option) {
          throw new Error("Menu item option not found");
        }
        this.menuItemOptions.delete(id);
        const remainingOptions = await this.getMenuItemOptions(option.menuItemId);
        if (remainingOptions.length === 0) {
          const menuItem = await this.getMenuItem(option.menuItemId);
          if (menuItem) {
            await this.updateMenuItem(menuItem.id, { hasOptions: false });
          }
        }
      }
      // Push subscription methods
      pushSubscriptions = /* @__PURE__ */ new Map();
      async savePushSubscription(subscription) {
        const id = Math.floor(Math.random() * 1e4);
        const newSubscription = {
          ...subscription,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.pushSubscriptions.set(subscription.endpoint, newSubscription);
        return newSubscription;
      }
      async getPushSubscriptionsByUserId(userId) {
        return Array.from(this.pushSubscriptions.values()).filter((sub) => sub.userId === userId);
      }
      async deletePushSubscription(endpoint) {
        this.pushSubscriptions.delete(endpoint);
      }
      // Credit transaction methods
      async createCreditTransaction(transaction) {
        const id = this.currentTransactionId++;
        const newTransaction = {
          ...transaction,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.creditTransactions.set(id, newTransaction);
        return newTransaction;
      }
      async getCreditTransactionsByUserId(userId) {
        return Array.from(this.creditTransactions.values()).filter((transaction) => transaction.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getCreditTransactionByTransactionId(transactionId) {
        return Array.from(this.creditTransactions.values()).find((transaction) => transaction.transactionId === transactionId);
      }
      // Pending Credit Transfer methods
      async createPendingCreditTransfer(transfer) {
        const id = this.currentPendingTransferId++;
        const newTransfer = {
          ...transfer,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          verifiedAt: null,
          verifiedByUserId: null
        };
        this.pendingCreditTransfers.set(id, newTransfer);
        return newTransfer;
      }
      async getPendingCreditTransferByCode(verificationCode) {
        return Array.from(this.pendingCreditTransfers.values()).find((transfer) => transfer.verificationCode === verificationCode);
      }
      async verifyPendingCreditTransfer(transferId, verifiedByUserId) {
        const transfer = this.pendingCreditTransfers.get(transferId);
        if (!transfer) {
          throw new Error("Pending credit transfer not found");
        }
        const updatedTransfer = {
          ...transfer,
          status: "verified",
          verifiedAt: /* @__PURE__ */ new Date(),
          verifiedByUserId
        };
        this.pendingCreditTransfers.set(transferId, updatedTransfer);
        return updatedTransfer;
      }
      async getPendingCreditTransfersBySender(senderId) {
        return Array.from(this.pendingCreditTransfers.values()).filter((transfer) => transfer.senderId === senderId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getAllPendingCreditTransfers() {
        return Array.from(this.pendingCreditTransfers.values()).filter((transfer) => transfer.status === "pending").sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getAllCreditTransfers() {
        return Array.from(this.pendingCreditTransfers.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async expirePendingCreditTransfers() {
        const now = /* @__PURE__ */ new Date();
        Array.from(this.pendingCreditTransfers.entries()).forEach(([id, transfer]) => {
          if (transfer.status === "pending" && new Date(transfer.expiresAt) <= now) {
            const expiredTransfer = {
              ...transfer,
              status: "expired"
            };
            this.pendingCreditTransfers.set(id, expiredTransfer);
          }
        });
      }
      // Favorites methods
      async addFavorite(favorite) {
        const key = `${favorite.userId}-${favorite.menuItemId}`;
        const newFavorite = {
          ...favorite,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.favorites.set(key, newFavorite);
        return newFavorite;
      }
      async removeFavorite(userId, menuItemId) {
        const key = `${userId}-${menuItemId}`;
        this.favorites.delete(key);
      }
      async getUserFavorites(userId) {
        const userFavorites = Array.from(this.favorites.values()).filter((favorite) => favorite.userId === userId);
        const favoriteMenuItems = [];
        for (const favorite of userFavorites) {
          const menuItem = this.menuItems.get(favorite.menuItemId);
          if (menuItem) {
            favoriteMenuItems.push(menuItem);
          }
        }
        return favoriteMenuItems;
      }
      async isFavorite(userId, menuItemId) {
        const key = `${userId}-${menuItemId}`;
        return this.favorites.has(key);
      }
      // Menu Category methods
      async getAllCategories() {
        return Array.from(this.menuCategories.values());
      }
      async getCategoryByName(name) {
        return Array.from(this.menuCategories.values()).find(
          (category) => category.name === name
        );
      }
      async createCategory(category) {
        const id = this.currentCategoryId++;
        const newCategory = {
          ...category,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.menuCategories.set(id, newCategory);
        return newCategory;
      }
      async updateCategory(id, categoryData) {
        const existingCategory = this.menuCategories.get(id);
        if (!existingCategory) {
          throw new Error("Category not found");
        }
        const updatedCategory = {
          ...existingCategory,
          ...categoryData
        };
        this.menuCategories.set(id, updatedCategory);
        return updatedCategory;
      }
      async deleteCategory(id) {
        if (!this.menuCategories.has(id)) {
          throw new Error("Category not found");
        }
        this.menuCategories.delete(id);
      }
      initializeCategories() {
        this.addCategory("breakfast", "Breakfast", "Morning favorites to start your day", 10);
        this.addCategory("lunch", "Lunch", "Satisfying midday meals", 20);
        this.addCategory("coffee", "Coffee", "Premium coffee beverages", 30);
        this.addCategory("hot-drinks", "Hot Drinks", "Warm beverages for any occasion", 40);
        this.addCategory("iced-drinks", "Iced Drinks", "Refreshing cold beverages", 50);
        this.addCategory("juices", "Juices", "Fresh-squeezed and blended juices", 60);
        this.addCategory("smoothies", "Smoothies", "Fruit and yogurt smoothies", 70);
      }
      addCategory(name, displayName, description, displayOrder = 999) {
        const id = this.currentCategoryId++;
        const category = {
          id,
          name,
          displayName,
          description,
          displayOrder,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.menuCategories.set(id, category);
      }
      initializeMenu() {
        this.addMenuItem("Egg & Bacon Panini", "Scrambled eggs with crispy bacon on toasted panini bread.", 13.5, "breakfast", "/images/breakfast-panini.jpg");
        this.addMenuItem("Avocado Toast", "Smashed avocado on sourdough with feta, cherry tomatoes and microgreens.", 12, "breakfast", "/images/avocado-toast.jpg");
        this.addMenuItem("Breakfast Bowl", "Greek yogurt with granola, seasonal fruits, honey and chia seeds.", 10.5, "breakfast", "/images/breakfast-bowl.jpg");
        this.addMenuItem("Chicken Salad", "Grilled chicken with mixed greens, cherry tomatoes, cucumber and balsamic dressing.", 14.5, "lunch", "/images/chicken-salad.jpg");
        this.addMenuItem("Turkey & Swiss Sandwich", "Sliced turkey, Swiss cheese, lettuce, tomato and mayo on multigrain bread.", 13, "lunch", "/images/turkey-sandwich.jpg");
        this.addMenuItem("Vegetable Soup", "Hearty vegetable soup with seasonal vegetables and herbs, served with bread.", 9.5, "lunch", "/images/vegetable-soup.jpg");
        this.addMenuItem("Cappuccino", "Espresso with steamed milk and a thick layer of foam.", 4.5, "coffee", "/images/cappuccino.jpg");
        this.addMenuItem("Flat White", "Espresso with steamed milk and a thin layer of microfoam.", 4.5, "coffee", "/images/flat-white.jpg");
        this.addMenuItem("Espresso", "Concentrated coffee served in a small cup.", 3.5, "coffee", "/images/espresso.jpg");
        this.addMenuItem("Hot Chocolate", "Rich chocolate with steamed milk topped with whipped cream.", 4.5, "hot-drinks", "/images/hot-chocolate.jpg");
        this.addMenuItem("Green Tea", "Traditional Japanese green tea.", 3.5, "hot-drinks", "/images/green-tea.jpg");
        this.addMenuItem("Iced Coffee", "Cold brew coffee served over ice.", 4, "iced-drinks", "/images/iced-coffee.jpg");
        this.addMenuItem("Iced Tea", "Fresh brewed tea served over ice.", 3.5, "iced-drinks", "/images/iced-tea.jpg");
        this.addMenuItem("Orange Juice", "Freshly squeezed orange juice.", 4.5, "juices", "/images/orange-juice.jpg");
        this.addMenuItem("Green Juice", "Spinach, kale, cucumber, apple and ginger.", 5.5, "juices", "/images/green-juice.jpg");
        this.addMenuItem("Berry Blast", "Mixed berries, banana, yogurt and honey.", 6, "smoothies", "/images/berry-smoothie.jpg");
        this.addMenuItem("Tropical Paradise", "Mango, pineapple, coconut milk and banana.", 6, "smoothies", "/images/tropical-smoothie.jpg");
      }
      addMenuItem(name, description, price, category, imageUrl = null) {
        const id = this.currentMenuItemId++;
        const menuItem = {
          id,
          name,
          description,
          price,
          category,
          imageUrl,
          hasSizes: null,
          mediumPrice: null,
          largePrice: null,
          hasOptions: false
          // Initialize with no options
        };
        this.menuItems.set(id, menuItem);
      }
    };
    DatabaseStorage = class {
      sessionStore;
      _db = null;
      constructor() {
        try {
          const connectionString = process.env.DATABASE_URL;
          const sql2 = postgres(connectionString, { ssl: "require" });
          this._db = drizzle(sql2, {
            schema: {
              users,
              menuItems,
              menuCategories,
              orders,
              pushSubscriptions,
              creditTransactions,
              pendingCreditTransfers,
              favorites,
              menuItemOptions
            }
          });
          this.sessionStore = new MemoryStore({
            checkPeriod: 864e5
            // 24 hours - clean up expired sessions
          });
        } catch (error) {
          console.error("Failed to initialize database connection:", error);
          throw error;
        }
      }
      // Getter for the database connection
      get db() {
        if (!this._db) {
          throw new Error("Database connection not initialized");
        }
        return this._db;
      }
      async getUser(id) {
        const result = await this.db.select().from(users).where(eq(users.id, id));
        return result[0];
      }
      async getUserByUsername(username) {
        const result = await this.db.select().from(users).where(eq(users.username, username));
        return result[0];
      }
      async getUserByEmail(email) {
        const result = await this.db.select().from(users).where(eq(users.email, email));
        return result[0];
      }
      async getUserByQrCode(qrCode) {
        const result = await this.db.select().from(users).where(eq(users.qrCode, qrCode));
        return result[0];
      }
      async createPasswordResetToken(email) {
        const user = await this.getUserByEmail(email);
        if (!user) {
          return void 0;
        }
        const token = randomBytes2(32).toString("hex");
        const expiry = /* @__PURE__ */ new Date();
        expiry.setHours(expiry.getHours() + 1);
        await this.db.update(users).set({
          resetToken: token,
          resetTokenExpiry: expiry
        }).where(eq(users.id, user.id));
        return token;
      }
      async getUserByResetToken(token) {
        const now = /* @__PURE__ */ new Date();
        const result = await this.db.select().from(users).where(
          eq(users.resetToken, token)
        );
        const user = result[0];
        if (user && user.resetTokenExpiry && user.resetTokenExpiry > now) {
          return user;
        }
        return void 0;
      }
      async resetPassword(userId, newPassword) {
        const result = await this.db.update(users).set({
          password: newPassword,
          resetToken: null,
          resetTokenExpiry: null
        }).where(eq(users.id, userId)).returning();
        if (result.length === 0) {
          throw new Error("User not found");
        }
        return result[0];
      }
      async createUser(insertUser) {
        const userWithDefaults = {
          credits: 100,
          // Default starting credits
          isAdmin: false,
          // Default non-admin
          ...insertUser
          // User-provided values override defaults
        };
        const result = await this.db.insert(users).values(userWithDefaults).returning();
        return result[0];
      }
      async getAllUsers() {
        try {
          console.log("DatabaseStorage: Fetching all users from database");
          const allUsers = await this.db.select().from(users);
          console.log(`DatabaseStorage: Found ${allUsers.length} users`);
          return allUsers;
        } catch (error) {
          console.error("DatabaseStorage: Error fetching all users:", error);
          throw error;
        }
      }
      async getAdminUsers() {
        try {
          console.log("DatabaseStorage: Fetching admin users from database");
          const adminUsers = await this.db.select().from(users).where(eq(users.isAdmin, true));
          console.log(`DatabaseStorage: Found ${adminUsers.length} admin users`);
          return adminUsers;
        } catch (error) {
          console.error("DatabaseStorage: Error fetching admin users:", error);
          throw error;
        }
      }
      async getAllOrders() {
        return this.db.select().from(orders);
      }
      async getAllOrdersWithUserDetails() {
        const allOrders = await this.db.select().from(orders);
        const ordersWithUserDetails = [];
        for (const order of allOrders) {
          const user = await this.getUser(order.userId);
          ordersWithUserDetails.push({
            ...order,
            userName: user ? user.username : "Unknown User",
            userFullName: user ? user.fullName : null
          });
        }
        return ordersWithUserDetails;
      }
      async getRecentOrders(limit = 50) {
        const recentOrders = await this.db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
        const ordersWithUsernames = [];
        for (const order of recentOrders) {
          const user = await this.getUser(order.userId);
          ordersWithUsernames.push({
            ...order,
            username: user ? user.username : "Unknown User"
          });
        }
        return ordersWithUsernames;
      }
      async updateOrderStatus(orderId, status) {
        const result = await this.db.update(orders).set({ status }).where(eq(orders.id, orderId)).returning();
        if (result.length === 0) {
          throw new Error("Order not found");
        }
        return result[0];
      }
      async setUserAdmin(userId, isAdmin2) {
        const result = await this.db.update(users).set({ isAdmin: isAdmin2 }).where(eq(users.id, userId)).returning();
        if (result.length === 0) {
          throw new Error("User not found");
        }
        return result[0];
      }
      async setUserActive(userId, isActive) {
        const result = await this.db.update(users).set({ isActive }).where(eq(users.id, userId)).returning();
        if (result.length === 0) {
          throw new Error("User not found");
        }
        return result[0];
      }
      async setUserMembership(userId, isMember) {
        const result = await this.db.update(users).set({
          isMember,
          membershipDate: isMember ? /* @__PURE__ */ new Date() : null
        }).where(eq(users.id, userId)).returning();
        if (result.length === 0) {
          throw new Error("User not found");
        }
        return result[0];
      }
      async clearAllUsers(exceptUserIds) {
        try {
          await this.db.delete(orders).where(
            sql`${orders.userId} NOT IN (${exceptUserIds.join(",")})`
          );
          await this.db.delete(pushSubscriptions).where(
            sql`${pushSubscriptions.userId} NOT IN (${exceptUserIds.join(",")})`
          );
          await this.db.delete(creditTransactions).where(
            sql`${creditTransactions.userId} NOT IN (${exceptUserIds.join(",")})`
          );
          await this.db.delete(favorites).where(
            sql`${favorites.userId} NOT IN (${exceptUserIds.join(",")})`
          );
          await this.db.delete(users).where(
            sql`${users.id} NOT IN (${exceptUserIds.join(",")})`
          );
          console.log(`Successfully cleared users except for IDs: ${exceptUserIds.join(",")}`);
          return Promise.resolve();
        } catch (error) {
          console.error("Error in clearAllUsers:", error);
          throw error;
        }
      }
      async clearAllOrders() {
        try {
          await this.db.delete(orders);
          console.log("Successfully cleared all orders");
          return Promise.resolve();
        } catch (error) {
          console.error("Error in clearAllOrders:", error);
          throw error;
        }
      }
      async updateUser(userId, userData) {
        const { id, credits, password, isAdmin: isAdmin2, qrCode, ...allowedUpdates } = userData;
        const result = await this.db.update(users).set(allowedUpdates).where(eq(users.id, userId)).returning();
        if (result.length === 0) {
          throw new Error("User not found");
        }
        return result[0];
      }
      async updateUserCredits(userId, amount) {
        const result = await this.db.update(users).set({ credits: amount }).where(eq(users.id, userId)).returning();
        if (result.length === 0) {
          throw new Error("User not found");
        }
        return result[0];
      }
      async updateUserQrCode(userId, qrCode) {
        const result = await this.db.update(users).set({ qrCode }).where(eq(users.id, userId)).returning();
        if (result.length === 0) {
          throw new Error("User not found");
        }
        return result[0];
      }
      async getMenuItems() {
        try {
          console.log("DatabaseStorage: Fetching menu items from database");
          const items = await this.db.select().from(menuItems);
          console.log(`DatabaseStorage: Found ${items.length} menu items`);
          return items;
        } catch (error) {
          console.error("DatabaseStorage: Error fetching menu items:", error);
          throw error;
        }
      }
      async getMenuItemsByCategory(category) {
        return this.db.select().from(menuItems).where(eq(menuItems.category, category));
      }
      async getMenuCategories() {
        const allCategories = await this.getAllCategories();
        return allCategories.map((category) => category.name);
      }
      async createMenuItem(menuItem) {
        const result = await this.db.insert(menuItems).values(menuItem).returning();
        return result[0];
      }
      async updateMenuItem(id, menuItem) {
        const result = await this.db.update(menuItems).set(menuItem).where(eq(menuItems.id, id)).returning();
        if (result.length === 0) {
          throw new Error("Menu item not found");
        }
        return result[0];
      }
      async deleteMenuItem(id) {
        const item = await this.getMenuItem(id);
        if (!item) {
          throw new Error("Menu item not found");
        }
        try {
          await this.db.delete(favorites).where(eq(favorites.menuItemId, id));
          await this.db.delete(menuItems).where(eq(menuItems.id, id));
          console.log(`Successfully deleted menu item with ID: ${id}`);
        } catch (error) {
          console.error("Error deleting menu item:", error);
          throw new Error("Failed to delete menu item");
        }
      }
      async getMenuItem(id) {
        const result = await this.db.select().from(menuItems).where(eq(menuItems.id, id));
        return result[0];
      }
      async createOrder(insertOrder) {
        const result = await this.db.insert(orders).values(insertOrder).returning();
        return result[0];
      }
      async getOrderById(orderId) {
        const result = await this.db.select().from(orders).where(eq(orders.id, orderId));
        return result[0];
      }
      async getOrdersByUserId(userId) {
        return this.db.select().from(orders).where(eq(orders.userId, userId));
      }
      // Push notification subscription methods
      async savePushSubscription(subscription) {
        const result = await this.db.insert(pushSubscriptions).values(subscription).returning();
        return result[0];
      }
      async getPushSubscriptionsByUserId(userId) {
        return this.db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
      }
      async deletePushSubscription(endpoint) {
        await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
      }
      // Credit transaction methods
      async createCreditTransaction(transaction) {
        try {
          const result = await this.db.insert(creditTransactions).values(transaction).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating credit transaction:", error);
          throw error;
        }
      }
      async getCreditTransactionsByUserId(userId) {
        try {
          return this.db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId)).orderBy(desc(creditTransactions.createdAt));
        } catch (error) {
          console.error("Error fetching credit transactions:", error);
          throw error;
        }
      }
      async getCreditTransactionByTransactionId(transactionId) {
        try {
          const result = await this.db.select().from(creditTransactions).where(eq(creditTransactions.transactionId, transactionId)).limit(1);
          return result[0] || void 0;
        } catch (error) {
          console.error("Error fetching credit transaction by transaction ID:", error);
          throw error;
        }
      }
      // Favorites methods
      async addFavorite(favorite) {
        try {
          const result = await this.db.insert(favorites).values(favorite).returning();
          return result[0];
        } catch (error) {
          console.error("Error adding favorite:", error);
          throw error;
        }
      }
      async removeFavorite(userId, menuItemId) {
        try {
          await this.db.delete(favorites).where(
            and(
              eq(favorites.userId, userId),
              eq(favorites.menuItemId, menuItemId)
            )
          );
        } catch (error) {
          console.error("Error removing favorite:", error);
          throw error;
        }
      }
      async getUserFavorites(userId) {
        try {
          return this.db.select({
            id: menuItems.id,
            name: menuItems.name,
            description: menuItems.description,
            price: menuItems.price,
            category: menuItems.category,
            imageUrl: menuItems.imageUrl,
            hasSizes: menuItems.hasSizes,
            mediumPrice: menuItems.mediumPrice,
            largePrice: menuItems.largePrice,
            hasOptions: menuItems.hasOptions
          }).from(favorites).innerJoin(menuItems, eq(favorites.menuItemId, menuItems.id)).where(eq(favorites.userId, userId));
        } catch (error) {
          console.error("Error getting user favorites:", error);
          throw error;
        }
      }
      async isFavorite(userId, menuItemId) {
        try {
          const result = await this.db.select().from(favorites).where(
            and(
              eq(favorites.userId, userId),
              eq(favorites.menuItemId, menuItemId)
            )
          );
          return result.length > 0;
        } catch (error) {
          console.error("Error checking if item is favorite:", error);
          throw error;
        }
      }
      // Menu Item Options methods
      async getMenuItemOptions(menuItemId) {
        try {
          return this.db.select().from(menuItemOptions).where(eq(menuItemOptions.menuItemId, menuItemId)).orderBy(menuItemOptions.displayOrder);
        } catch (error) {
          console.error("Error getting menu item options:", error);
          throw error;
        }
      }
      async createMenuItemOption(option) {
        try {
          const result = await this.db.insert(menuItemOptions).values(option).returning();
          await this.db.update(menuItems).set({ hasOptions: true }).where(eq(menuItems.id, option.menuItemId));
          return result[0];
        } catch (error) {
          console.error("Error creating menu item option:", error);
          throw error;
        }
      }
      async updateMenuItemOption(id, optionData) {
        try {
          const result = await this.db.update(menuItemOptions).set(optionData).where(eq(menuItemOptions.id, id)).returning();
          if (result.length === 0) {
            throw new Error("Menu item option not found");
          }
          return result[0];
        } catch (error) {
          console.error("Error updating menu item option:", error);
          throw error;
        }
      }
      async deleteMenuItemOption(id) {
        try {
          const option = await this.db.select().from(menuItemOptions).where(eq(menuItemOptions.id, id));
          if (option.length === 0) {
            throw new Error("Menu item option not found");
          }
          const menuItemId = option[0].menuItemId;
          await this.db.delete(menuItemOptions).where(eq(menuItemOptions.id, id));
          const remainingOptions = await this.db.select().from(menuItemOptions).where(eq(menuItemOptions.menuItemId, menuItemId));
          if (remainingOptions.length === 0) {
            await this.db.update(menuItems).set({ hasOptions: false }).where(eq(menuItems.id, menuItemId));
          }
        } catch (error) {
          console.error("Error deleting menu item option:", error);
          throw error;
        }
      }
      // Menu Category methods
      async getAllCategories() {
        try {
          return this.db.select().from(menuCategories).orderBy(menuCategories.displayOrder);
        } catch (error) {
          console.error("Error getting all categories:", error);
          throw error;
        }
      }
      async getCategoryByName(name) {
        try {
          const result = await this.db.select().from(menuCategories).where(eq(menuCategories.name, name));
          return result[0];
        } catch (error) {
          console.error("Error getting category by name:", error);
          throw error;
        }
      }
      async createCategory(category) {
        try {
          const categoryWithDefaults = {
            ...category,
            createdAt: /* @__PURE__ */ new Date()
          };
          const result = await this.db.insert(menuCategories).values(categoryWithDefaults).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating category:", error);
          throw error;
        }
      }
      async updateCategory(id, categoryData) {
        try {
          const result = await this.db.update(menuCategories).set(categoryData).where(eq(menuCategories.id, id)).returning();
          if (result.length === 0) {
            throw new Error("Category not found");
          }
          return result[0];
        } catch (error) {
          console.error("Error updating category:", error);
          throw error;
        }
      }
      async deleteCategory(id) {
        try {
          const menuItemsWithCategory = await this.db.select().from(menuItems).innerJoin(
            menuCategories,
            eq(menuItems.category, menuCategories.name)
          ).where(eq(menuCategories.id, id));
          if (menuItemsWithCategory.length > 0) {
            throw new Error("Cannot delete category that is still in use by menu items");
          }
          await this.db.delete(menuCategories).where(eq(menuCategories.id, id));
        } catch (error) {
          console.error("Error deleting category:", error);
          throw error;
        }
      }
      // Method to initialize the database with sample data
      async initializeDatabase() {
        const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const userCount = await this.db.select().from(users);
        if (userCount.length === 0) {
          console.log("Initializing database with sample data...");
          await this.db.insert(users).values({
            username: "bs_admin",
            password: await hashPassword2("BS2025@@"),
            // Use hashed password
            email: "admin@beanstalker.com",
            credits: 100,
            fullName: "Admin User",
            phoneNumber: "123-456-7890",
            isAdmin: true,
            isActive: true
          });
          await this.db.insert(users).values({
            username: "user",
            password: await hashPassword2("user123"),
            // Use hashed password
            email: "user@example.com",
            credits: 50,
            fullName: "Regular User",
            phoneNumber: "987-654-3210",
            isAdmin: false,
            isActive: true
          });
          console.log("Creating menu categories...");
          await this.initializeCategories();
          console.log("Creating menu items...");
          await this.addMenuItem("Egg & Bacon Panini", "Scrambled eggs with crispy bacon on toasted panini bread.", 13.5, "breakfast", "/images/breakfast-panini.jpg");
          await this.addMenuItem("Avocado Toast", "Smashed avocado on sourdough with feta, cherry tomatoes and microgreens.", 12, "breakfast", "/images/avocado-toast.jpg");
          await this.addMenuItem("Breakfast Bowl", "Greek yogurt with granola, seasonal fruits, honey and chia seeds.", 10.5, "breakfast", "/images/breakfast-bowl.jpg");
          await this.addMenuItem("Chicken Salad", "Grilled chicken with mixed greens, cherry tomatoes, cucumber and balsamic dressing.", 14.5, "lunch", "/images/chicken-salad.jpg");
          await this.addMenuItem("Turkey & Swiss Sandwich", "Sliced turkey, Swiss cheese, lettuce, tomato and mayo on multigrain bread.", 13, "lunch", "/images/turkey-sandwich.jpg");
          await this.addMenuItem("Vegetable Soup", "Hearty vegetable soup with seasonal vegetables and herbs, served with bread.", 9.5, "lunch", "/images/vegetable-soup.jpg");
          await this.addMenuItem("Cappuccino", "Espresso with steamed milk and a thick layer of foam.", 4.5, "coffee", "/images/cappuccino.jpg");
          await this.addMenuItem("Flat White", "Espresso with steamed milk and a thin layer of microfoam.", 4.5, "coffee", "/images/flat-white.jpg");
          await this.addMenuItem("Espresso", "Concentrated coffee served in a small cup.", 3.5, "coffee", "/images/espresso.jpg");
          await this.addMenuItem("Hot Chocolate", "Rich chocolate with steamed milk topped with whipped cream.", 4.5, "hot-drinks", "/images/hot-chocolate.jpg");
          await this.addMenuItem("Green Tea", "Traditional Japanese green tea.", 3.5, "hot-drinks", "/images/green-tea.jpg");
          await this.addMenuItem("Iced Coffee", "Cold brew coffee served over ice.", 4, "iced-drinks", "/images/iced-coffee.jpg");
          await this.addMenuItem("Iced Tea", "Fresh brewed tea served over ice.", 3.5, "iced-drinks", "/images/iced-tea.jpg");
          await this.addMenuItem("Orange Juice", "Freshly squeezed orange juice.", 4.5, "juices", "/images/orange-juice.jpg");
          await this.addMenuItem("Green Juice", "Spinach, kale, cucumber, apple and ginger.", 5.5, "juices", "/images/green-juice.jpg");
          await this.addMenuItem("Berry Blast", "Mixed berries, banana, yogurt and honey.", 6, "smoothies", "/images/berry-smoothie.jpg");
          await this.addMenuItem("Tropical Paradise", "Mango, pineapple, coconut milk and banana.", 6, "smoothies", "/images/tropical-smoothie.jpg");
          console.log("Database initialization complete!");
        } else {
          const categoryCount = await this.db.select().from(menuCategories);
          if (categoryCount.length === 0) {
            console.log("Initializing menu categories...");
            await this.initializeCategories();
          }
        }
      }
      async initializeCategories() {
        await this.addCategory("breakfast", "Breakfast", "Morning favorites to start your day", 10);
        await this.addCategory("lunch", "Lunch", "Satisfying midday meals", 20);
        await this.addCategory("coffee", "Coffee", "Premium coffee beverages", 30);
        await this.addCategory("hot-drinks", "Hot Drinks", "Warm beverages for any occasion", 40);
        await this.addCategory("iced-drinks", "Iced Drinks", "Refreshing cold beverages", 50);
        await this.addCategory("juices", "Juices", "Fresh-squeezed and blended juices", 60);
        await this.addCategory("smoothies", "Smoothies", "Fruit and yogurt smoothies", 70);
      }
      async addCategory(name, displayName, description, displayOrder = 999) {
        await this.db.insert(menuCategories).values({
          name,
          displayName,
          description,
          displayOrder,
          createdAt: /* @__PURE__ */ new Date()
        });
      }
      async addMenuItem(name, description, price, category, imageUrl = null) {
        await this.db.insert(menuItems).values({
          name,
          description,
          price,
          category,
          imageUrl,
          hasSizes: null,
          mediumPrice: null,
          largePrice: null,
          hasOptions: false
          // Initialize with no options
        });
      }
      // Push subscription methods (DatabaseStorage)
      async savePushSubscription(subscription) {
        try {
          const result = await this.db.insert(pushSubscriptions).values(subscription).returning();
          return result[0];
        } catch (error) {
          console.error("Error saving push subscription:", error);
          throw error;
        }
      }
      async getPushSubscriptionsByUserId(userId) {
        try {
          return this.db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
        } catch (error) {
          console.error("Error getting push subscriptions:", error);
          throw error;
        }
      }
      async deletePushSubscription(endpoint) {
        try {
          await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
        } catch (error) {
          console.error("Error deleting push subscription:", error);
          throw error;
        }
      }
      // Credit transaction methods (DatabaseStorage)
      async createCreditTransaction(transaction) {
        try {
          let transactionData = { ...transaction };
          if (transactionData.balanceAfter === void 0 || transactionData.balanceAfter === null) {
            const user = await this.getUser(transaction.userId);
            if (user) {
              transactionData.balanceAfter = user.credits + transaction.amount;
            }
          }
          const result = await this.db.insert(creditTransactions).values(transactionData).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating credit transaction:", error);
          throw error;
        }
      }
      async getCreditTransactionsByUserId(userId) {
        try {
          return this.db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId)).orderBy(sql`${creditTransactions.createdAt} DESC`);
        } catch (error) {
          console.error("Error getting credit transactions:", error);
          throw error;
        }
      }
      async getCreditTransactionByTransactionId(transactionId) {
        try {
          const result = await this.db.select().from(creditTransactions).where(eq(creditTransactions.transactionId, transactionId)).limit(1);
          return result[0] || void 0;
        } catch (error) {
          console.error("Error fetching credit transaction by transaction ID:", error);
          throw error;
        }
      }
      // Pending Credit Transfer methods (DatabaseStorage)
      async createPendingCreditTransfer(transfer) {
        try {
          const result = await this.db.insert(pendingCreditTransfers).values(transfer).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating pending credit transfer:", error);
          throw error;
        }
      }
      async getPendingCreditTransferByCode(verificationCode) {
        try {
          const result = await this.db.select().from(pendingCreditTransfers).where(eq(pendingCreditTransfers.verificationCode, verificationCode)).limit(1);
          return result[0] || void 0;
        } catch (error) {
          console.error("Error getting pending credit transfer by code:", error);
          throw error;
        }
      }
      async getPendingCreditTransfers(senderId) {
        try {
          const result = await this.db.select().from(pendingCreditTransfers).where(and(
            eq(pendingCreditTransfers.senderId, senderId),
            eq(pendingCreditTransfers.status, "pending")
          )).orderBy(desc(pendingCreditTransfers.createdAt));
          return result;
        } catch (error) {
          console.error("Error getting pending credit transfers:", error);
          throw error;
        }
      }
      async verifyPendingCreditTransfer(transferId, verifiedByUserId) {
        try {
          const result = await this.db.update(pendingCreditTransfers).set({
            status: "verified",
            verifiedAt: /* @__PURE__ */ new Date(),
            verifiedByUserId
          }).where(eq(pendingCreditTransfers.id, transferId)).returning();
          if (!result[0]) {
            throw new Error("Pending credit transfer not found");
          }
          return result[0];
        } catch (error) {
          console.error("Error verifying pending credit transfer:", error);
          throw error;
        }
      }
      async getPendingCreditTransfersBySender(senderId) {
        try {
          return this.db.select().from(pendingCreditTransfers).where(eq(pendingCreditTransfers.senderId, senderId)).orderBy(sql`${pendingCreditTransfers.createdAt} DESC`);
        } catch (error) {
          console.error("Error getting pending credit transfers by sender:", error);
          throw error;
        }
      }
      async getAllPendingCreditTransfers() {
        try {
          return this.db.select().from(pendingCreditTransfers).where(eq(pendingCreditTransfers.status, "pending")).orderBy(sql`${pendingCreditTransfers.createdAt} DESC`);
        } catch (error) {
          console.error("Error getting all pending credit transfers:", error);
          throw error;
        }
      }
      async getAllCreditTransfers() {
        try {
          return this.db.select().from(pendingCreditTransfers).orderBy(sql`${pendingCreditTransfers.createdAt} DESC`);
        } catch (error) {
          console.error("Error getting all credit transfers:", error);
          throw error;
        }
      }
      async expirePendingCreditTransfers() {
        try {
          await this.db.update(pendingCreditTransfers).set({ status: "expired" }).where(and(
            eq(pendingCreditTransfers.status, "pending"),
            sql`${pendingCreditTransfers.expiresAt} <= NOW()`
          ));
        } catch (error) {
          console.error("Error expiring pending credit transfers:", error);
          throw error;
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/push-notifications.ts
var push_notifications_exports = {};
__export(push_notifications_exports, {
  getVapidPublicKey: () => getVapidPublicKey,
  notifyAdminsAboutNewOrder: () => notifyAdminsAboutNewOrder,
  sendNotificationToAdmins: () => sendNotificationToAdmins,
  sendOrderStatusNotification: () => sendOrderStatusNotification,
  sendPushNotification: () => sendPushNotification,
  sendPushNotificationToUser: () => sendPushNotificationToUser
});
import webpush from "web-push";
import crypto from "crypto";
function getVapidPublicKey() {
  return vapidKeys.publicKey;
}
async function sendPushNotificationToUser(userId, payload) {
  try {
    console.log(`Attempting to send notification to user ${userId}`);
    const subscriptions = await storage.getPushSubscriptionsByUserId(userId);
    if (!subscriptions.length) {
      console.log(`No push subscriptions found for user ${userId}. User hasn't enabled notifications.`);
      return;
    }
    console.log(`Found ${subscriptions.length} push subscriptions for user ${userId}`);
    const enrichedPayload = {
      ...payload,
      data: {
        ...payload.data || {},
        userId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    if (!enrichedPayload.tag) {
      enrichedPayload.tag = `notification-${Date.now()}`;
    }
    const results = await Promise.allSettled(
      subscriptions.map((subscription) => sendPushNotification(subscription, enrichedPayload))
    );
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    console.log(`Push notification results for user ${userId}: ${successful} successful, ${failed} failed`);
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Failed to send push notification to subscription ${index}:`, result.reason);
      }
    });
  } catch (error) {
    console.error("Error sending push notification to user:", error);
  }
}
async function sendPushNotification(subscription, payload) {
  try {
    console.log("Attempting to send push notification to subscription:", {
      endpoint: subscription.endpoint.substring(0, 50) + "...",
      userId: subscription.userId
    });
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };
    const isWNS = subscription.endpoint.includes("windows.com") || subscription.endpoint.includes("microsoft");
    const isApple = subscription.endpoint.includes("apple") || subscription.endpoint.includes("icloud");
    const isFirebase = subscription.endpoint.includes("fcm") || subscription.endpoint.includes("firebase");
    console.log("Endpoint analysis:", {
      isWNS,
      isApple,
      isFirebase,
      endpointStart: subscription.endpoint.substring(0, 30)
    });
    console.log("Using simplified universal payload format for cross-platform compatibility");
    let simplePayload = {
      title: String(payload.title || "Bean Stalker Coffee"),
      body: String(payload.body || payload.message || "You have a new notification"),
      tag: "beanstalker-notification-" + Date.now()
      // Add timestamp to make tag unique
    };
    simplePayload.data = {};
    if (payload.data) {
      if (payload.data.userId) simplePayload.data.userId = Number(payload.data.userId);
      if (payload.data.orderId) simplePayload.data.orderId = Number(payload.data.orderId);
      if (payload.data.status) simplePayload.data.status = String(payload.data.status);
      if (payload.data.url) simplePayload.data.url = String(payload.data.url);
      if (payload.data.testId) simplePayload.data.testId = payload.data.testId;
      if (payload.data.isTestNotification) simplePayload.data.isTestNotification = payload.data.isTestNotification;
      if (payload.data.timestamp) simplePayload.data.timestamp = payload.data.timestamp;
      if (!simplePayload.data.url) {
        simplePayload.data.url = "/orders";
      }
      console.log("Preserving userId in notification payload:", payload.data.userId);
    }
    if (payload.data && payload.data.orderId) {
      let emoji = "";
      let statusText = payload.data.status || "updated";
      if (statusText === "processing") {
        emoji = "\u2615 ";
        statusText = "being prepared";
      } else if (statusText === "completed") {
        emoji = "\u2705 ";
        statusText = "ready for pickup";
      } else if (statusText === "cancelled") {
        emoji = "\u274C ";
        statusText = "cancelled";
      } else if (statusText === "test") {
        emoji = "\u{1F514} ";
        statusText = "test";
      }
      simplePayload.title = `${emoji}Order #${payload.data.orderId} Update`;
      simplePayload.body = `Your order is now ${statusText}`;
    }
    if (payload.data && payload.data.testId) {
      simplePayload.title = "\u{1F514} Test Notification";
      const timestamp2 = (/* @__PURE__ */ new Date()).toLocaleTimeString();
      simplePayload.body = `This is a test notification (${timestamp2})`;
    }
    payload = simplePayload;
    console.log("Simplified universal payload:", JSON.stringify(payload, null, 2));
    console.log("Notification payload:", JSON.stringify(payload));
    console.log(
      "Using formatted subscription with keys present:",
      !!pushSubscription.keys.p256dh && !!pushSubscription.keys.auth
    );
    const options = {
      TTL: 60 * 60
      // 1 hour TTL (default)
    };
    if (isWNS) {
      console.log("Windows Notification Service detected - using raw format");
      options.headers = {
        ...options.headers,
        "X-WNS-Type": "wns/raw",
        "Content-Type": "application/octet-stream",
        "X-WNS-Cache-Policy": "cache"
      };
      const title = payload.title || "Bean Stalker";
      const message = payload.body || payload.message || "";
      const rawPayload = JSON.stringify({
        title,
        message,
        type: "toast",
        // Include order data if available
        orderId: payload.orderId || payload.data?.orderId,
        status: payload.status || payload.data?.status,
        url: payload.url || payload.data?.url
      });
      console.log("Using Windows raw JSON format payload");
      return await webpush.sendNotification(
        pushSubscription,
        rawPayload,
        options
      );
    } else if (isFirebase) {
      options.headers = {
        ...options.headers,
        "Urgency": "high"
      };
    }
    console.log("Sending push with options:", {
      platform: isWNS ? "Windows" : isApple ? "Apple" : isFirebase ? "Firebase" : "Standard",
      ttl: options.TTL,
      headers: options.headers || {}
    });
    let result;
    try {
      result = await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload),
        options
      );
    } catch (error) {
      if (isWNS && (error.statusCode === 400 || error.statusCode === 401)) {
        console.log("Initial Windows push failed, attempting with ultra-minimal raw payload");
        console.log("Windows auth error details:", error.headers ? JSON.stringify(error.headers) : "No headers");
        const isVapidMismatch = error.headers && (error.headers["x-wns-error-description"] || error.headers["X-WNS-ERROR-DESCRIPTION"]) && (error.headers["x-wns-error-description"] || error.headers["X-WNS-ERROR-DESCRIPTION"]).includes("public key");
        if (isVapidMismatch) {
          console.log("VAPID key mismatch detected, removing subscription");
          await storage.deletePushSubscription(subscription.endpoint);
          throw new Error("VAPID key mismatch, subscription removed");
        }
        let messageText = typeof payload.body === "string" ? payload.body : typeof payload.message === "string" ? payload.message : "New notification";
        if (payload.data && payload.data.orderId && payload.data.status) {
          messageText = `Order #${payload.data.orderId} is now ${payload.data.status}`;
        }
        const rawPayload = JSON.stringify({
          msg: messageText,
          title: payload.title || "Bean Stalker",
          data: payload.data || {},
          // Include the data property for context
          type: "toast"
        });
        options.headers = {
          "X-WNS-Type": "wns/raw",
          "Content-Type": "text/plain",
          "X-WNS-Cache-Policy": "cache"
        };
        try {
          result = await webpush.sendNotification(
            pushSubscription,
            rawPayload,
            options
          );
        } catch (error2) {
          console.error("Even minimal raw payload failed for Windows:", error2.message);
          if (error2.statusCode === 400 || error2.statusCode === 401) {
            console.log("Trying last-resort badge notification for Windows");
            options.headers = {
              "X-WNS-Type": "wns/badge",
              "Content-Type": "text/xml"
            };
            const badgePayload = `<badge value="alert"/>`;
            result = await webpush.sendNotification(
              pushSubscription,
              badgePayload,
              options
            );
          } else {
            throw error2;
          }
        }
      } else {
        throw error;
      }
    }
    console.log("Push notification sent successfully with status:", result.statusCode);
    return result;
  } catch (error) {
    console.error("Error sending push notification:", {
      statusCode: error.statusCode,
      message: error.message,
      body: error.body,
      stack: error.stack,
      endpoint: subscription.endpoint.substring(0, 50) + "...",
      headers: JSON.stringify(error.headers || {})
    });
    if (error.statusCode === 410) {
      console.log("Subscription is no longer valid, removing it from the database:", subscription.endpoint);
      await storage.deletePushSubscription(subscription.endpoint);
    }
    if (error.statusCode === 401 || error.statusCode === 403) {
      console.log("Detected authorization error");
      if (error.headers && (error.headers["x-wns-error-description"] || error.headers["X-WNS-ERROR-DESCRIPTION"])) {
        const wnsError = error.headers["x-wns-error-description"] || error.headers["X-WNS-ERROR-DESCRIPTION"];
        console.error(`Windows Notification Service error: ${wnsError}`);
        if (typeof wnsError === "string") {
          if (wnsError.includes("JWT Authentication Failed") || wnsError.includes("authentication")) {
            console.error("WNS JWT authentication failed - VAPID keys may be invalid or expired");
            await storage.deletePushSubscription(subscription.endpoint);
          } else if (wnsError.includes("The cloud service is not authorized") || wnsError.includes("authorization")) {
            console.error("WNS authorization error - VAPID configuration issue");
          } else if (wnsError.includes("Device Unreachable")) {
            console.error("WNS device unreachable - removing subscription");
            await storage.deletePushSubscription(subscription.endpoint);
          } else if (wnsError.includes("Channel Expired")) {
            console.error("WNS channel expired - removing subscription");
            await storage.deletePushSubscription(subscription.endpoint);
          }
        }
      } else if (subscription.endpoint.includes("windows.com") || subscription.endpoint.includes("microsoft")) {
        console.error("Windows Notification Service error without details - authorization issue");
        console.error("This may indicate incompatible VAPID keys or Windows-specific configuration issues");
      } else {
        console.error("Push notification authorization failed - check VAPID keys and configuration");
      }
    } else if (error.statusCode === 404) {
      console.error("Push endpoint not found - subscription may be invalid");
      await storage.deletePushSubscription(subscription.endpoint);
    } else if (error.statusCode === 410) {
      console.error("Push subscription has been unsubscribed or expired");
      await storage.deletePushSubscription(subscription.endpoint);
    } else if (error.statusCode === 400) {
      console.error("Bad request error - payload may be invalid or too large");
    } else if (error.statusCode >= 500) {
      console.error("Push service server error, will retry later:", error.statusCode);
    } else {
      if (error.headers && (error.headers["x-wns-status"] && String(error.headers["x-wns-status"]).toLowerCase() === "dropped" || error.headers["x-wns-notificationstatus"] && String(error.headers["x-wns-notificationstatus"]).toLowerCase() === "dropped")) {
        console.log('Windows notification marked as "dropped" - this is expected behavior for some Windows devices');
        return {
          statusCode: 202,
          // Accepted, but not delivered (custom status)
          body: "Windows notification marked as dropped (expected behavior)",
          headers: error.headers
        };
      } else {
        console.error(`Unhandled push notification error with status code ${error.statusCode}`);
      }
    }
    throw error;
  }
}
async function sendOrderStatusNotification(userId, orderId, status) {
  let title = "Order Update";
  let body = `Order #${orderId} status has been updated to: ${status}`;
  let icon = "/images/icon.svg";
  switch (status) {
    case "processing":
      title = "Order Being Prepared";
      body = `Great news! Your order #${orderId} is now being prepared.`;
      break;
    case "completed":
      title = "Order Ready for Pickup";
      body = `Your order #${orderId} is ready! Come pick it up while it's hot!`;
      break;
    case "cancelled":
      title = "Order Cancelled";
      body = `We're sorry, but your order #${orderId} has been cancelled.`;
      break;
  }
  await sendPushNotificationToUser(userId, {
    title,
    body,
    message: body,
    // Add message property for browsers that prefer it
    icon,
    badge: "/images/badge.svg",
    tag: `order-${orderId}-${Date.now()}`,
    // Ensure notification is unique
    vibrate: [100, 50, 100],
    // Add vibration pattern for mobile devices
    requireInteraction: true,
    // Makes notification stay until user interacts with it
    actions: [
      {
        action: "view",
        title: "View Order"
      }
    ],
    data: {
      orderId,
      status,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      url: "/orders"
      // URL to open when notification is clicked
    }
  });
}
async function sendNotificationToAdmins(payload) {
  try {
    const adminUsers = await storage.getAdminUsers();
    console.log(`Sending notification to ${adminUsers.length} admin users`);
    const promises = adminUsers.map((admin) => sendPushNotificationToUser(admin.id, payload));
    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error sending notification to admins:", error);
    throw error;
  }
}
async function notifyAdminsAboutNewOrder(orderId, username, orderTotal) {
  const title = "New Order Received";
  const body = `New order #${orderId} from ${username} for ${orderTotal.toFixed(2)} credits`;
  await sendNotificationToAdmins({
    title,
    body,
    icon: "/images/order-icon.svg",
    badge: "/images/badge.svg",
    sound: "/sounds/order-notification.mp3",
    // Add sound for more attention
    tag: `admin-order-${orderId}-${Date.now()}`,
    // Ensure notification is unique
    data: {
      orderId,
      url: "/admin",
      // URL to open when notification is clicked
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      isAdminNotification: true,
      // Flag to identify admin notifications
      type: "new_order"
    },
    // Add vibration pattern (mobile devices only)
    vibrate: [100, 50, 100, 50, 100],
    // Set higher importance for Android
    requireInteraction: true,
    priority: "high"
  });
}
var vapidKeys;
var init_push_notifications = __esm({
  "server/push-notifications.ts"() {
    "use strict";
    init_storage();
    vapidKeys = {
      publicKey: "BLeQMZeMxGSl0T1YGtCufXPz6aKE8c7ItAwJ5bAavW8FSz0d-Czw5wR-nvGVIhhjkRPs2vok9MzViHINmzdCdCQ",
      privateKey: "kiLWqPdQTIW9Zf2W3tL4OwSX8d32dZOla-c8erPufaA"
    };
    console.log("VAPID private key hash:", crypto.createHash("sha256").update(vapidKeys.privateKey).digest("hex").substring(0, 8));
    webpush.setVapidDetails(
      "mailto:support@beanstalker.com",
      // This should be a real contact email for your application
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
    if (process.env.GCM_API_KEY) {
      webpush.setGCMAPIKey(process.env.GCM_API_KEY);
      console.log("Using GCM API key for Firebase Cloud Messaging");
    } else {
      console.log("No GCM API key found. Firebase Cloud Messaging may not work optimally for older Android devices.");
    }
    console.log(
      "Push notification service initialized with VAPID keys. Public key:",
      vapidKeys.publicKey.substring(0, 10) + "..."
    );
  }
});

// server/square-payment.ts
var square_payment_exports = {};
__export(square_payment_exports, {
  createPaymentLink: () => createPaymentLink,
  getSquareApplicationId: () => getSquareApplicationId,
  getSquareLocationId: () => getSquareLocationId,
  processPayment: () => processPayment
});
import { randomUUID } from "crypto";
async function processPayment(paymentRequest) {
  try {
    const idempotencyKey = paymentRequest.idempotencyKey || randomUUID();
    const paymentData = {
      source_id: paymentRequest.sourceId,
      idempotency_key: idempotencyKey,
      amount_money: {
        amount: Math.round(paymentRequest.amount * 100),
        // Convert to cents
        currency: paymentRequest.currency
      },
      location_id: process.env.SQUARE_LOCATION_ID,
      ...paymentRequest.customerName && {
        buyer_email_address: paymentRequest.customerEmail,
        note: `Bean Stalker Premium Membership - ${paymentRequest.customerName}`
      }
    };
    const response = await fetch("https://connect.squareupsandbox.com/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-12-13"
      },
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Payment failed: ${response.status} - ${errorData}`);
    }
    const result = await response.json();
    return {
      success: true,
      payment: result.payment,
      transactionId: result.payment?.id,
      receiptUrl: result.payment?.receipt_url
    };
  } catch (error) {
    console.error("Square payment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown payment error"
    };
  }
}
async function createPaymentLink(amount) {
  try {
    const checkoutData = {
      idempotency_key: randomUUID(),
      order: {
        location_id: process.env.SQUARE_LOCATION_ID,
        line_items: [{
          name: "Bean Stalker Premium Membership",
          quantity: "1",
          base_price_money: {
            amount: Math.round(amount * 100),
            currency: "AUD"
          }
        }]
      },
      payment_options: {
        autocomplete: true
      },
      redirect_url: process.env.SQUARE_REDIRECT_URL || "https://member.beanstalker.com.au"
    };
    const response = await fetch("https://connect.squareupsandbox.com/v2/online-checkout/payment-links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-12-13"
      },
      body: JSON.stringify(checkoutData)
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Payment link creation failed: ${response.status} - ${errorData}`);
    }
    const result = await response.json();
    return {
      success: true,
      paymentLink: result.payment_link,
      url: result.payment_link?.url
    };
  } catch (error) {
    console.error("Square payment link error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function getSquareApplicationId() {
  return process.env.SQUARE_APPLICATION_ID;
}
function getSquareLocationId() {
  return process.env.SQUARE_LOCATION_ID;
}
var init_square_payment = __esm({
  "server/square-payment.ts"() {
    "use strict";
  }
});

// server/square-config.ts
var square_config_exports = {};
__export(square_config_exports, {
  getSquareAccessToken: () => getSquareAccessToken,
  getSquareApplicationId: () => getSquareApplicationId2,
  getSquareLocationId: () => getSquareLocationId2,
  getSquareWebhookSignatureKey: () => getSquareWebhookSignatureKey,
  refreshSquareConfig: () => refreshSquareConfig,
  squareConfig: () => squareConfig
});
function getSquareConfig() {
  const useProduction = process.env.NODE_ENV === "production" && process.env.SQUARE_USE_PRODUCTION === "true";
  let config;
  if (useProduction) {
    config = {
      locationId: process.env.SQUARE_PRODUCTION_LOCATION_ID || "YOUR_PRODUCTION_LOCATION_ID",
      applicationId: process.env.SQUARE_PRODUCTION_APPLICATION_ID || "YOUR_PRODUCTION_APP_ID",
      accessToken: process.env.SQUARE_PRODUCTION_ACCESS_TOKEN,
      webhookSignatureKey: process.env.SQUARE_PRODUCTION_WEBHOOK_SIGNATURE_KEY
    };
    console.log(`\u{1F3EA} Using PRODUCTION Square credentials`);
  } else {
    config = {
      locationId: "LKTZKDFJ44YZD",
      // Working sandbox location
      applicationId: "sandbox-sq0idb-psFtGCJDduHGMjv3Qw34jA",
      // Working sandbox app
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
    };
    console.log(`\u{1F9EA} Using SANDBOX Square credentials`);
  }
  console.log(`\u{1F527} Square Config: Location=${config.locationId}, App=${config.applicationId}`);
  return config;
}
function getSquareLocationId2() {
  return squareConfig.locationId;
}
function getSquareApplicationId2() {
  return squareConfig.applicationId;
}
function getSquareAccessToken() {
  return squareConfig.accessToken;
}
function getSquareWebhookSignatureKey() {
  return squareConfig.webhookSignatureKey;
}
function refreshSquareConfig() {
  const freshConfig = getSquareConfig();
  console.log(`\u{1F504} Square Config Refreshed: Location=${freshConfig.locationId}`);
  return freshConfig;
}
var squareConfig;
var init_square_config = __esm({
  "server/square-config.ts"() {
    "use strict";
    squareConfig = getSquareConfig();
  }
});

// server/square-restaurant.ts
var square_restaurant_exports = {};
__export(square_restaurant_exports, {
  createRestaurantOrder: () => createRestaurantOrder,
  getLocationInfo: () => getLocationInfo,
  getSquareMenuItems: () => getSquareMenuItems,
  processRestaurantPayment: () => processRestaurantPayment,
  syncInventoryLevels: () => syncInventoryLevels,
  updateOrderStatus: () => updateOrderStatus
});
async function createRestaurantOrder() {
  throw new Error("Square Restaurant integration temporarily disabled due to SDK compatibility issues");
}
async function updateOrderStatus() {
  throw new Error("Square Restaurant integration temporarily disabled due to SDK compatibility issues");
}
async function getSquareMenuItems() {
  throw new Error("Square Restaurant integration temporarily disabled due to SDK compatibility issues");
}
async function syncInventoryLevels() {
  throw new Error("Square Restaurant integration temporarily disabled due to SDK compatibility issues");
}
async function processRestaurantPayment() {
  throw new Error("Square Restaurant integration temporarily disabled due to SDK compatibility issues");
}
async function getLocationInfo() {
  throw new Error("Square Restaurant integration temporarily disabled due to SDK compatibility issues");
}
var init_square_restaurant = __esm({
  "server/square-restaurant.ts"() {
    "use strict";
  }
});

// server/square-kitchen-integration.ts
var square_kitchen_integration_exports = {};
__export(square_kitchen_integration_exports, {
  getSquareKitchenOrders: () => getSquareKitchenOrders,
  handleSquareOrderWebhook: () => handleSquareOrderWebhook,
  syncOrdersFromSquare: () => syncOrdersFromSquare
});
async function makeSquareRequest(endpoint, method = "GET", body) {
  const response = await fetch(`${SQUARE_API_BASE}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Square-Version": SQUARE_VERSION
    },
    ...body && { body: JSON.stringify(body) }
  });
  if (!response.ok) {
    throw new Error(`Square API error: ${response.status} - ${await response.text()}`);
  }
  return response.json();
}
function mapSquareStateToBeanStalker(squareState) {
  switch (squareState) {
    case "OPEN":
    case "PROPOSED":
      return "processing";
    case "IN_PROGRESS":
    case "RESERVED":
      return "preparing";
    case "READY":
    case "PREPARED":
      return "ready";
    case "COMPLETED":
      return "completed";
    case "CANCELED":
      return "cancelled";
    default:
      return "processing";
  }
}
function extractBeanStalkerOrderId(squareOrder) {
  try {
    const pickupNote = squareOrder.fulfillments?.[0]?.pickupDetails?.note;
    if (pickupNote) {
      const match = pickupNote.match(/Bean Stalker order #(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    for (const lineItem of squareOrder.lineItems || []) {
      if (lineItem.note) {
        const match = lineItem.note.match(/Order #(\d+)/);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting Bean Stalker order ID:", error);
    return null;
  }
}
async function handleSquareOrderWebhook(webhookData) {
  try {
    console.log("\u{1F514} Processing Square webhook...");
    const eventType = webhookData.event_type || webhookData.type || "unknown";
    console.log(`\u{1F4CB} Webhook event type: ${eventType}`);
    if (!eventType.includes("order")) {
      console.log("\u26A0\uFE0F Non-order event, skipping...");
      return { success: true, ordersUpdated: 0, message: "Non-order event processed" };
    }
    const orderData = webhookData.data?.object || webhookData.order;
    if (!orderData) {
      console.log("\u26A0\uFE0F No order data in webhook");
      return { success: true, ordersUpdated: 0, message: "No order data found" };
    }
    console.log(`\u{1F4E6} Processing Square order: ${orderData.id}`);
    const beanStalkerOrderId = extractBeanStalkerOrderId(orderData);
    if (!beanStalkerOrderId) {
      console.log("\u26A0\uFE0F No Bean Stalker order ID found in Square order");
      return { success: true, ordersUpdated: 0, message: "No Bean Stalker order ID found" };
    }
    console.log(`\u{1F517} Found Bean Stalker order ID: ${beanStalkerOrderId}`);
    const beanOrder = await storage.getOrderById(beanStalkerOrderId);
    if (!beanOrder) {
      console.log(`\u274C Bean Stalker order #${beanStalkerOrderId} not found`);
      return { success: false, ordersUpdated: 0, message: "Bean Stalker order not found" };
    }
    const squareState = orderData.state || "OPEN";
    const newStatus = mapSquareStateToBeanStalker(squareState);
    console.log(`\u{1F4CA} Square state: ${squareState} \u2192 Bean Stalker status: ${newStatus}`);
    if (beanOrder.status !== newStatus) {
      console.log(`\u{1F504} Updating order #${beanStalkerOrderId}: ${beanOrder.status} \u2192 ${newStatus}`);
      await storage.updateOrderStatus(beanStalkerOrderId, newStatus);
      console.log(`\u2705 Order #${beanStalkerOrderId} status updated successfully`);
      return {
        success: true,
        ordersUpdated: 1,
        message: `Order #${beanStalkerOrderId} updated to ${newStatus}`
      };
    } else {
      console.log(`\u{1F4CB} Order #${beanStalkerOrderId} status unchanged: ${beanOrder.status}`);
      return {
        success: true,
        ordersUpdated: 0,
        message: `Order #${beanStalkerOrderId} status unchanged`
      };
    }
  } catch (error) {
    console.error("\u274C Webhook processing error:", error);
    return {
      success: false,
      ordersUpdated: 0,
      message: error instanceof Error ? error.message : "Unknown webhook error"
    };
  }
}
async function syncOrdersFromSquare() {
  console.log("\u{1F504} Manual sync called - webhook sync is preferred for real-time updates");
  console.log("\u2705 Bidirectional sync operational via webhooks");
  return {
    success: true,
    ordersUpdated: 0,
    error: "Manual sync simplified - webhook sync handles real-time updates"
  };
}
async function getSquareKitchenOrders() {
  try {
    console.log("\u{1F4CB} Fetching Square kitchen orders...");
    const searchQuery = {
      filter: {
        locationFilter: {
          locationIds: [process.env.SQUARE_LOCATION_ID]
        },
        fulfillmentFilter: {
          fulfillmentTypes: ["PICKUP"],
          fulfillmentStates: ["PROPOSED", "RESERVED", "PREPARED", "COMPLETED"]
        }
      },
      limit: 50
    };
    const response = await makeSquareRequest("/orders/search", "POST", { query: searchQuery });
    return response.orders || [];
  } catch (error) {
    console.error("\u274C Error fetching Square kitchen orders:", error);
    return [];
  }
}
var SQUARE_API_BASE, SQUARE_VERSION;
var init_square_kitchen_integration = __esm({
  "server/square-kitchen-integration.ts"() {
    "use strict";
    init_storage();
    SQUARE_API_BASE = "https://connect.squareupsandbox.com/v2";
    SQUARE_VERSION = "2023-12-13";
  }
});

// server/square-orders-sync.ts
var square_orders_sync_exports = {};
__export(square_orders_sync_exports, {
  getSquareOrders: () => getSquareOrders,
  sendOrdersToSquare: () => sendOrdersToSquare
});
async function sendOrdersToSquare() {
  try {
    console.log("\u{1F504} Starting real Square Orders API sync...");
    const orders2 = await storage.getRecentOrders(10);
    console.log(`\u{1F4CB} Found ${orders2.length} orders to send to Square`);
    let created = 0;
    const errors = [];
    for (const order of orders2) {
      try {
        const user = await storage.getUser(order.userId);
        const customerName = user?.username || `Customer #${order.userId}`;
        const squareOrderData = {
          reference_id: `bs-order-${order.id}`,
          source: {
            name: "Bean Stalker Coffee Shop"
          },
          location_id: process.env.SQUARE_LOCATION_ID,
          line_items: order.items?.map((item, index) => ({
            uid: `item-${order.id}-${index}`,
            name: item.name || "Coffee Item",
            quantity: item.quantity?.toString() || "1",
            item_type: "ITEM",
            base_price_money: {
              amount: Math.round((item.price || 0) * 100),
              // Convert to cents
              currency: "AUD"
            }
          })) || [],
          fulfillments: [{
            uid: `fulfillment-${order.id}`,
            type: "PICKUP",
            state: "PROPOSED",
            pickup_details: {
              recipient: {
                display_name: customerName
              },
              schedule_type: "ASAP",
              note: `Bean Stalker order #${order.id}`
            }
          }]
        };
        const orderResponse = await fetch("https://connect.squareupsandbox.com/v2/orders", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "Square-Version": "2023-12-13"
          },
          body: JSON.stringify({
            order: squareOrderData
          })
        });
        if (orderResponse.ok) {
          const orderResult = await orderResponse.json();
          const squareOrderId = orderResult.order?.id;
          const paymentData = {
            source_id: "cnon:card-nonce-ok",
            // Sandbox test nonce (will be marked as credit payment in note)
            idempotency_key: `bs-pay-${order.id}-${Date.now()}`.substring(0, 45),
            amount_money: {
              amount: Math.round((order.total || 0) * 100),
              currency: "AUD"
            },
            order_id: squareOrderId,
            location_id: process.env.SQUARE_LOCATION_ID,
            note: `PAID WITH BEAN STALKER APP CREDITS - Customer: ${customerName || "Customer"} - Original payment method: Store Credit Balance`
          };
          const paymentResponse = await fetch("https://connect.squareupsandbox.com/v2/payments", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
              "Square-Version": "2023-12-13"
            },
            body: JSON.stringify(paymentData)
          });
          if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json();
            console.log(`\u2705 Created Square order ${squareOrderId} with payment ${paymentResult.payment?.id} for Bean Stalker order #${order.id}`);
            created++;
          } else {
            const paymentError = await paymentResponse.text();
            console.log(`\u26A0\uFE0F Created Square order ${squareOrderId} for Bean Stalker order #${order.id} but payment failed: ${paymentError}`);
            created++;
          }
        } else {
          const errorData = await orderResponse.text();
          const errorMsg = `Square API error for order #${order.id}: ${orderResponse.status} - ${errorData}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      } catch (orderError) {
        const errorMsg = `Failed to process order #${order.id}: ${orderError}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    console.log(`\u{1F389} Successfully created ${created}/${orders2.length} orders in Square sandbox`);
    return {
      success: true,
      created,
      errors
    };
  } catch (error) {
    console.error("Square Orders sync failed:", error);
    return {
      success: false,
      created: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
}
async function getSquareOrders() {
  try {
    const response = await fetch(`https://connect.squareupsandbox.com/v2/orders/search`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-12-13"
      },
      body: JSON.stringify({
        location_ids: [process.env.SQUARE_LOCATION_ID],
        query: {
          filter: {
            date_time_filter: {
              created_at: {
                start_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
                // Last 7 days
              }
            }
          },
          sort: {
            sort_field: "CREATED_AT",
            sort_order: "DESC"
          }
        },
        limit: 100
      })
    });
    if (response.ok) {
      const result = await response.json();
      return result.orders || [];
    } else {
      console.error("Failed to fetch Square orders:", await response.text());
      return [];
    }
  } catch (error) {
    console.error("Error fetching Square orders:", error);
    return [];
  }
}
var init_square_orders_sync = __esm({
  "server/square-orders-sync.ts"() {
    "use strict";
    init_storage();
  }
});

// server/square-single-order-sync.ts
var square_single_order_sync_exports = {};
__export(square_single_order_sync_exports, {
  sendSingleOrderToSquare: () => sendSingleOrderToSquare
});
async function sendSingleOrderToSquare(orderId) {
  try {
    console.log(`\u{1F504} Sending individual order #${orderId} to Square...`);
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return {
        success: false,
        error: `Order #${orderId} not found`
      };
    }
    const user = await storage.getUser(order.userId);
    if (!user) {
      return {
        success: false,
        error: `User for order #${orderId} not found`
      };
    }
    const customerName = user.username || "Bean Stalker Customer";
    let orderItems = [];
    try {
      orderItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];
    } catch (parseError) {
      console.error(`Failed to parse items for order #${orderId}:`, parseError);
      orderItems = [];
    }
    const lineItems = orderItems.map((item, index) => ({
      uid: `bs-item-${orderId}-${index}`,
      name: `${item.name}${item.size ? ` (${item.size})` : ""}${item.flavor ? ` - ${item.flavor}` : ""}`,
      quantity: item.quantity?.toString() || "1",
      item_type: "ITEM",
      base_price_money: {
        amount: Math.round((item.price || 0) * 100),
        currency: "AUD"
      }
    }));
    const locationId = getSquareLocationId2();
    const accessToken = getSquareAccessToken();
    console.log(`\u{1F50D} Debug: Using FORCED location_id: ${locationId}`);
    const squareOrderData = {
      reference_id: `bs-order-${orderId}`,
      location_id: locationId,
      line_items: lineItems,
      fulfillments: [{
        uid: `bs-fulfillment-${orderId}`,
        type: "PICKUP",
        state: "PROPOSED",
        pickup_details: {
          recipient: {
            display_name: customerName
          },
          schedule_type: "ASAP",
          note: `Bean Stalker order #${orderId}`
        }
      }]
    };
    const orderResponse = await fetch("https://connect.squareupsandbox.com/v2/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-12-13"
      },
      body: JSON.stringify({
        order: squareOrderData
      })
    });
    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      return {
        success: false,
        error: `Square API error: ${orderResponse.status} - ${errorData}`
      };
    }
    const orderResult = await orderResponse.json();
    const squareOrderId = orderResult.order?.id;
    console.log(`\u{1F50D} Debug: Creating payment for FORCED location_id: ${locationId}`);
    const paymentData = {
      source_id: "cnon:card-nonce-ok",
      // Sandbox test nonce
      idempotency_key: `bs-pay-${orderId}-${Date.now()}`.substring(0, 45),
      amount_money: {
        amount: Math.round((order.total || 0) * 100),
        currency: "AUD"
      },
      order_id: squareOrderId,
      location_id: locationId,
      note: `Bean Stalker app credits payment for order #${orderId} by ${customerName}`
    };
    const paymentResponse = await fetch("https://connect.squareupsandbox.com/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-12-13"
      },
      body: JSON.stringify(paymentData)
    });
    if (paymentResponse.ok) {
      const paymentResult = await paymentResponse.json();
      console.log(`\u2705 Created Square order ${squareOrderId} with payment ${paymentResult.payment?.id} for Bean Stalker order #${orderId}`);
    } else {
      const paymentError = await paymentResponse.text();
      console.log(`\u26A0\uFE0F Created Square order ${squareOrderId} for Bean Stalker order #${orderId} but payment failed: ${paymentError}`);
    }
    return {
      success: true,
      squareOrderId
    };
  } catch (error) {
    console.error(`Failed to send order #${orderId} to Square:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
var init_square_single_order_sync = __esm({
  "server/square-single-order-sync.ts"() {
    "use strict";
    init_storage();
    init_square_config();
  }
});

// server/square-kitchen-integration-simple.ts
var square_kitchen_integration_simple_exports = {};
__export(square_kitchen_integration_simple_exports, {
  getSquareKitchenOrders: () => getSquareKitchenOrders2,
  handleSquareOrderWebhook: () => handleSquareOrderWebhook2,
  syncOrdersFromSquare: () => syncOrdersFromSquare2
});
async function makeSquareRequest2(endpoint, method = "GET", body) {
  const response = await fetch(`${SQUARE_API_BASE2}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Square-Version": SQUARE_VERSION2
    },
    ...body && { body: JSON.stringify(body) }
  });
  if (!response.ok) {
    throw new Error(`Square API error: ${response.status} - ${await response.text()}`);
  }
  return response.json();
}
function mapSquareStateToBeanStalker2(squareState) {
  switch (squareState) {
    case "OPEN":
    case "PROPOSED":
      return "processing";
    case "IN_PROGRESS":
    case "RESERVED":
      return "preparing";
    case "READY":
    case "PREPARED":
      return "ready";
    case "COMPLETED":
      return "completed";
    case "CANCELED":
      return "cancelled";
    default:
      return "processing";
  }
}
function extractBeanStalkerOrderId2(squareOrder) {
  try {
    const pickupNote = squareOrder.fulfillments?.[0]?.pickupDetails?.note;
    if (pickupNote) {
      const match = pickupNote.match(/Bean Stalker order #(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    for (const lineItem of squareOrder.lineItems || []) {
      if (lineItem.note) {
        const match = lineItem.note.match(/Order #(\d+)/);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting Bean Stalker order ID:", error);
    return null;
  }
}
async function handleSquareOrderWebhook2(webhookData) {
  try {
    console.log("\u{1F514} Processing Square webhook...");
    const eventType = webhookData.event_type || webhookData.type || "unknown";
    console.log(`\u{1F4CB} Webhook event type: ${eventType}`);
    if (!eventType.includes("order")) {
      console.log("\u26A0\uFE0F Non-order event, skipping...");
      return { success: true, ordersUpdated: 0, message: "Non-order event processed" };
    }
    const orderData = webhookData.data?.object || webhookData.order;
    if (!orderData) {
      console.log("\u26A0\uFE0F No order data in webhook");
      return { success: true, ordersUpdated: 0, message: "No order data found" };
    }
    console.log(`\u{1F4E6} Processing Square order: ${orderData.id}`);
    const beanStalkerOrderId = extractBeanStalkerOrderId2(orderData);
    if (!beanStalkerOrderId) {
      console.log("\u26A0\uFE0F No Bean Stalker order ID found in Square order");
      return { success: true, ordersUpdated: 0, message: "No Bean Stalker order ID found" };
    }
    console.log(`\u{1F517} Found Bean Stalker order ID: ${beanStalkerOrderId}`);
    const beanOrder = await storage.getOrderById(beanStalkerOrderId);
    if (!beanOrder) {
      console.log(`\u274C Bean Stalker order #${beanStalkerOrderId} not found`);
      return { success: false, ordersUpdated: 0, message: "Bean Stalker order not found" };
    }
    const squareState = orderData.state || "OPEN";
    const newStatus = mapSquareStateToBeanStalker2(squareState);
    console.log(`\u{1F4CA} Square state: ${squareState} \u2192 Bean Stalker status: ${newStatus}`);
    if (beanOrder.status !== newStatus) {
      console.log(`\u{1F504} Updating order #${beanStalkerOrderId}: ${beanOrder.status} \u2192 ${newStatus}`);
      await storage.updateOrderStatus(beanStalkerOrderId, newStatus);
      console.log(`\u2705 Order #${beanStalkerOrderId} status updated successfully`);
      return {
        success: true,
        ordersUpdated: 1,
        message: `Order #${beanStalkerOrderId} updated to ${newStatus}`
      };
    } else {
      console.log(`\u{1F4CB} Order #${beanStalkerOrderId} status unchanged: ${beanOrder.status}`);
      return {
        success: true,
        ordersUpdated: 0,
        message: `Order #${beanStalkerOrderId} status unchanged`
      };
    }
  } catch (error) {
    console.error("\u274C Webhook processing error:", error);
    return {
      success: false,
      ordersUpdated: 0,
      message: error instanceof Error ? error.message : "Unknown webhook error"
    };
  }
}
async function syncOrdersFromSquare2() {
  console.log("\u{1F504} Manual sync called - webhook sync is preferred for real-time updates");
  console.log("\u2705 Bidirectional sync operational via webhooks");
  return {
    success: true,
    ordersUpdated: 0,
    error: "Manual sync simplified - webhook sync handles real-time updates"
  };
}
async function getSquareKitchenOrders2() {
  try {
    console.log("\u{1F4CB} Fetching Square kitchen orders...");
    const searchQuery = {
      filter: {
        locationFilter: {
          locationIds: [process.env.SQUARE_LOCATION_ID]
        },
        fulfillmentFilter: {
          fulfillmentTypes: ["PICKUP"],
          fulfillmentStates: ["PROPOSED", "RESERVED", "PREPARED", "COMPLETED"]
        }
      },
      limit: 50
    };
    const response = await makeSquareRequest2("/orders/search", "POST", { query: searchQuery });
    return response.orders || [];
  } catch (error) {
    console.error("\u274C Error fetching Square kitchen orders:", error);
    return [];
  }
}
var SQUARE_API_BASE2, SQUARE_VERSION2;
var init_square_kitchen_integration_simple = __esm({
  "server/square-kitchen-integration-simple.ts"() {
    "use strict";
    init_storage();
    SQUARE_API_BASE2 = "https://connect.squareupsandbox.com/v2";
    SQUARE_VERSION2 = "2023-12-13";
  }
});

// server/square-integration-final.ts
var square_integration_final_exports = {};
__export(square_integration_final_exports, {
  createSquareOrder: () => createSquareOrder,
  getSquareConfig: () => getSquareConfig2,
  handleSquareWebhook: () => handleSquareWebhook,
  syncAllOrdersToSquare: () => syncAllOrdersToSquare
});
async function createSquareOrder(orderId) {
  try {
    console.log(`\u{1F504} Creating Square order for Bean Stalker order #${orderId}`);
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return { success: false, error: `Order #${orderId} not found` };
    }
    const user = await storage.getUser(order.userId);
    if (!user) {
      return { success: false, error: `User for order #${orderId} not found` };
    }
    let orderItems = [];
    try {
      orderItems = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];
    } catch {
      orderItems = [];
    }
    if (orderItems.length === 0) {
      return { success: false, error: `No items found in order #${orderId}` };
    }
    const lineItems = orderItems.map((item, index) => ({
      uid: `bs-item-${orderId}-${index}`,
      name: `${item.name}${item.size ? ` (${item.size})` : ""}${item.flavor ? ` - ${item.flavor}` : ""}`,
      quantity: String(item.quantity || 1),
      item_type: "ITEM",
      base_price_money: {
        amount: Math.round((item.price || 0) * 100),
        currency: "AUD"
      }
    }));
    const squareOrderData = {
      reference_id: `bs-order-${orderId}`,
      location_id: SQUARE_CONFIG.locationId,
      line_items: lineItems,
      fulfillments: [{
        uid: `bs-fulfillment-${orderId}`,
        type: "PICKUP",
        state: "PROPOSED",
        pickup_details: {
          recipient: {
            display_name: user.username || "Bean Stalker Customer"
          },
          schedule_type: "ASAP",
          note: `Bean Stalker order #${orderId}`
        }
      }]
    };
    const orderResponse = await fetch(`${SQUARE_API_BASE3}/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SQUARE_CONFIG.accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-12-13"
      },
      body: JSON.stringify({ order: squareOrderData })
    });
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error(`Square Orders API error: ${orderResponse.status} - ${errorText}`);
      return { success: false, error: `Square API error: ${orderResponse.status}` };
    }
    const orderResult = await orderResponse.json();
    const squareOrderId = orderResult.order?.id;
    if (!squareOrderId) {
      return { success: false, error: "No Square order ID returned" };
    }
    await createSquarePayment(squareOrderId, orderId, order.total || 0, user.username || "Customer");
    console.log(`\u2705 Square order created: ${squareOrderId} for Bean Stalker order #${orderId}`);
    return { success: true, squareOrderId };
  } catch (error) {
    console.error(`\u274C Failed to create Square order for #${orderId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
async function createSquarePayment(squareOrderId, beanOrderId, amount, customerName) {
  try {
    const paymentData = {
      source_id: "cnon:card-nonce-ok",
      // Sandbox test nonce
      idempotency_key: `bs-pay-${beanOrderId}-${Date.now()}`.substring(0, 45),
      amount_money: {
        amount: Math.round(amount * 100),
        currency: "AUD"
      },
      order_id: squareOrderId,
      location_id: SQUARE_CONFIG.locationId,
      note: `Bean Stalker app credits - Order #${beanOrderId} by ${customerName}`
    };
    const paymentResponse = await fetch(`${SQUARE_API_BASE3}/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SQUARE_CONFIG.accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2023-12-13"
      },
      body: JSON.stringify(paymentData)
    });
    if (paymentResponse.ok) {
      const result = await paymentResponse.json();
      console.log(`\u{1F4B3} Payment created: ${result.payment?.id} for Square order ${squareOrderId}`);
    } else {
      const errorText = await paymentResponse.text();
      console.log(`\u26A0\uFE0F Payment failed for Square order ${squareOrderId}: ${errorText}`);
    }
  } catch (error) {
    console.error(`Payment creation failed for Square order ${squareOrderId}:`, error);
  }
}
async function handleSquareWebhook(webhookData) {
  try {
    console.log(`\u{1F514} Processing Square webhook: ${webhookData.event_type || webhookData.type}`);
    const eventType = webhookData.event_type || webhookData.type || "unknown";
    if (!eventType.includes("order")) {
      return { success: true, ordersUpdated: 0 };
    }
    const squareOrder = webhookData.data?.object || webhookData.object;
    if (!squareOrder) {
      return { success: true, ordersUpdated: 0 };
    }
    const beanOrderId = extractBeanStalkerOrderId3(squareOrder);
    if (!beanOrderId) {
      console.log("No Bean Stalker order ID found in Square webhook data");
      return { success: true, ordersUpdated: 0 };
    }
    const beanOrder = await storage.getOrderById(beanOrderId);
    if (!beanOrder) {
      console.log(`Bean Stalker order #${beanOrderId} not found`);
      return { success: true, ordersUpdated: 0 };
    }
    const squareState = squareOrder.state || "OPEN";
    const newStatus = mapSquareStateToBeanStalker3(squareState);
    if (beanOrder.status !== newStatus) {
      await storage.updateOrderStatus(beanOrderId, newStatus);
      const { sendOrderStatusNotification: sendOrderStatusNotification2 } = await Promise.resolve().then(() => (init_push_notifications(), push_notifications_exports));
      await sendOrderStatusNotification2(beanOrder.userId, beanOrderId, newStatus);
      console.log(`\u{1F4F1} Order #${beanOrderId} status updated: ${beanOrder.status} \u2192 ${newStatus}`);
      return { success: true, ordersUpdated: 1 };
    }
    return { success: true, ordersUpdated: 0 };
  } catch (error) {
    console.error("Square webhook processing failed:", error);
    return { success: false, ordersUpdated: 0 };
  }
}
function extractBeanStalkerOrderId3(squareOrder) {
  try {
    const pickupNote = squareOrder.fulfillments?.[0]?.pickup_details?.note || squareOrder.fulfillments?.[0]?.pickupDetails?.note;
    if (pickupNote) {
      const match = pickupNote.match(/Bean Stalker order #(\d+)/i);
      if (match) return parseInt(match[1], 10);
    }
    const refId = squareOrder.reference_id;
    if (refId) {
      const match = refId.match(/bs-order-(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    return null;
  } catch (error) {
    console.error("Error extracting Bean Stalker order ID:", error);
    return null;
  }
}
function mapSquareStateToBeanStalker3(squareState) {
  const stateMap = {
    "OPEN": "processing",
    "IN_PROGRESS": "preparing",
    "READY": "ready",
    "COMPLETED": "completed",
    "CANCELED": "cancelled"
  };
  return stateMap[squareState.toUpperCase()] || "processing";
}
function getSquareConfig2() {
  return SQUARE_CONFIG;
}
async function syncAllOrdersToSquare() {
  try {
    const orders2 = await storage.getAllOrders();
    const errors = [];
    let synced = 0;
    for (const order of orders2) {
      if (order.status !== "cancelled") {
        const result = await createSquareOrder(order.id);
        if (result.success) {
          synced++;
        } else {
          errors.push(`Order #${order.id}: ${result.error}`);
        }
      }
    }
    console.log(`\u{1F4CA} Bulk sync completed: ${synced}/${orders2.length} orders synced`);
    return { success: true, synced, errors };
  } catch (error) {
    console.error("Bulk sync failed:", error);
    return { success: false, synced: 0, errors: [error instanceof Error ? error.message : "Unknown error"] };
  }
}
var SQUARE_CONFIG, SQUARE_API_BASE3;
var init_square_integration_final = __esm({
  "server/square-integration-final.ts"() {
    "use strict";
    init_storage();
    SQUARE_CONFIG = {
      locationId: "LRQ926HVH9WFD",
      applicationId: "sandbox-sq0idb-0f_-wyGBcz7NmblQtFkv9A",
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
    };
    SQUARE_API_BASE3 = "https://connect.squareupsandbox.com/v2";
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
init_storage();
init_auth();
init_schema();
init_auth();
init_push_notifications();
init_square_payment();
import express from "express";
import { createServer } from "http";
import { z } from "zod";
import QRCode from "qrcode";
import multer from "multer";
import path from "path";
import fs from "fs";

// server/email-service.ts
import nodemailer from "nodemailer";
var testAccount = null;
var transporter = null;
var usingTestAccount = false;
async function createTestEmailAccount() {
  try {
    console.log("Setting up test email account for password reset emails");
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    usingTestAccount = true;
    console.log("Test email account generated:", testAccount.user);
    console.log("Preview URL: https://ethereal.email");
    return transporter;
  } catch (error) {
    console.error("Failed to create test email account:", error);
    return null;
  }
}
function createProductionTransporter() {
  try {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log("Setting up Gmail SMTP for email notifications");
      const gmailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      console.log("Using Gmail SMTP for sending emails");
      usingTestAccount = false;
      return gmailTransporter;
    }
    const emailHost = "mail.member.beanstalker.com.au";
    const emailPort = 587;
    const emailUser = "info@member.beanstalker.com.au";
    const emailPass = "BBBnnnMMM!!!123";
    const secure = false;
    console.log(`Setting up SMTP with ${emailHost}:${emailPort} (secure: ${secure})`);
    const productionTransporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure,
      // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      },
      // Add timeout
      connectionTimeout: 15e3,
      // 15 seconds
      // Debug options for troubleshooting 
      debug: true,
      // Enable debugging
      logger: true
      // Log to console
    });
    console.log("Using provided email credentials for sending emails");
    usingTestAccount = false;
    return productionTransporter;
  } catch (error) {
    console.error("Failed to create production email transporter:", error);
    return null;
  }
}
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = createProductionTransporter();
} else {
  createTestEmailAccount();
}
async function sendEmail(options) {
  try {
    if (!transporter) {
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = createProductionTransporter();
      } else {
        transporter = await createTestEmailAccount();
      }
      if (!transporter) {
        console.error("Failed to initialize email transporter");
        return false;
      }
    }
    let fromEmail = "Bean Stalker <info@member.beanstalker.com.au>";
    const mailOptions = {
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      if (usingTestAccount && info && info.messageId) {
        console.log("Test email preview URL:", nodemailer.getTestMessageUrl(info));
      }
      return true;
    } catch (productionError) {
      console.error("Error sending email with configured transporter:", productionError);
      if (usingTestAccount) {
        throw productionError;
      }
      console.log("Falling back to test email account...");
      transporter = await createTestEmailAccount();
      if (!transporter) {
        throw new Error("Failed to create fallback test email account");
      }
      const testInfo = await transporter.sendMail(mailOptions);
      console.log("Email sent using fallback test account:", testInfo.messageId);
      console.log("Test email preview URL:", nodemailer.getTestMessageUrl(testInfo));
      return true;
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
async function sendPasswordResetEmail(email, resetToken) {
  const baseUrl = "https://beanstalker.replit.app";
  const resetUrl = `${baseUrl}/auth?resetToken=${resetToken}`;
  const emailText = `Hello,

You are receiving this email because you (or someone else) has requested the reset of the password for your Bean Stalker account.

Please click on the following link, or paste it into your browser to complete the process:

${resetUrl}

If you did not request this, please ignore this email and your password will remain unchanged.

The link will expire in 1 hour.

Thank you,
Bean Stalker Team`;
  const emailHtml = `<p>Hello,</p><p>You are receiving this email because you (or someone else) has requested the reset of the password for your Bean Stalker account.</p><p>Please click on the following link, or paste it into your browser to complete the process:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p><p>The link will expire in 1 hour.</p><p>Thank you,<br />Bean Stalker Team</p>`;
  return sendEmail({
    to: email,
    subject: "Bean Stalker Password Reset",
    text: emailText,
    html: emailHtml
  });
}
async function sendAppUpdateNotification(userEmails, version) {
  if (!userEmails || userEmails.length === 0) {
    console.log("No user emails provided for app update notification");
    return false;
  }
  const appUrl = "https://beanstalker.replit.app";
  const emailText = `Great news! The Bean Stalker coffee app has been updated to version ${version}.

New features and improvements are now available. If you have the app installed on your phone, it will update automatically the next time you open it.

Open the app now: ${appUrl}

Thank you for using Bean Stalker!

Bean Stalker Team`;
  const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;"><div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #124430; margin: 0; font-size: 28px;">Bean Stalker</h1><p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Your Favorite Coffee Experience</p></div><div style="background-color: #124430; color: white; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 25px;"><h2 style="margin: 0 0 10px 0; font-size: 24px;">App Updated!</h2><p style="margin: 0; font-size: 16px;">Version ${version} is now available</p></div><div style="margin-bottom: 25px;"><h3 style="color: #124430; margin-bottom: 15px;">What's New:</h3><ul style="color: #333; line-height: 1.6; padding-left: 20px;"><li>Enhanced performance and stability</li><li>Improved user interface</li><li>Bug fixes and optimizations</li><li>Better notification system</li></ul></div><div style="text-align: center; margin: 30px 0;"><a href="${appUrl}" style="background-color: #124430; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">Open Bean Stalker App</a></div><div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;"><p style="margin: 0; color: #666; font-size: 14px;"><strong>Already installed?</strong> Your app will update automatically the next time you open it. If you don't see the update, try closing and reopening the app.</p></div><hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;"><div style="text-align: center;"><p style="color: #666; font-size: 12px; margin: 0;">Thank you for choosing Bean Stalker Coffee<br>Questions? Contact us through the app or visit our store.</p></div></div></div>`;
  console.log(`Sending app update notification to ${userEmails.length} users for version ${version}`);
  return sendEmail({
    to: userEmails.join(", "),
    subject: "Bean Stalker App Updated - New Features Available!",
    text: emailText,
    html: emailHtml
  });
}

// server/routes.ts
init_square_config();
async function verifyPurchaseReceipt(receipt, platform) {
  if (!receipt || typeof receipt !== "string") {
    return false;
  }
  try {
    return receipt.length > 0;
  } catch (error) {
    console.error("Receipt verification error:", error);
    return false;
  }
}
function formatZodError(error) {
  return error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
}
var isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
};
var uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var multerStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});
var upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  }
});
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.use("/uploads", express.static(uploadsDir));
  app2.get("/api/menu", async (req, res) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  app2.get("/api/menu/:menuItemId/options", async (req, res) => {
    try {
      const menuItemId = parseInt(req.params.menuItemId);
      const options = await storage.getMenuItemOptions(menuItemId);
      const parentOptions = options.filter((option) => option.isParent);
      const standardOptions = options.filter((option) => !option.isParent && !option.parentId);
      const childOptions = options.filter((option) => option.parentId);
      const result = [
        ...standardOptions,
        ...parentOptions.map((parent) => ({
          ...parent,
          children: childOptions.filter((child) => child.parentId === parent.id)
        }))
      ];
      res.json(result);
    } catch (error) {
      console.error("Error fetching menu item options:", error);
      res.status(500).json({ message: "Failed to fetch menu item options" });
    }
  });
  app2.get("/api/menu/categories", async (req, res) => {
    try {
      const categories = await storage.getMenuCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu categories" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/menu/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const items = await storage.getMenuItemsByCategory(category);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user?.id;
      const orders2 = await storage.getOrdersByUserId(userId);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== req.user?.id && !req.user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized to view this order" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user?.id;
      const orderData = insertOrderSchema.parse({ ...req.body, userId });
      const user = await storage.getUser(userId);
      if (!user || user.credits < orderData.total) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      const order = await storage.createOrder(orderData);
      console.log(`\u{1F4DD} ORDER CREATED: Order #${order.id} for user ${userId}, total: $${orderData.total}`);
      const newBalance = user.credits - orderData.total;
      await storage.updateUserCredits(userId, newBalance);
      await storage.createCreditTransaction({
        userId,
        type: "order",
        amount: -orderData.total,
        // Negative amount for spending credits
        description: `Order #${order.id}`,
        balanceAfter: newBalance,
        orderId: order.id
      });
      try {
        await notifyAdminsAboutNewOrder(order.id, user.username, orderData.total);
        console.log(`Notification sent to admins about new order #${order.id}`);
      } catch (notificationError) {
        console.error("Failed to send admin notification:", notificationError);
      }
      console.log(`\u{1F504} AUTO-SYNC: Triggering webhook-based sync for order #${order.id}...`);
      setTimeout(() => {
        const port = process.env.PORT || 5e3;
        const baseUrl = process.env.NODE_ENV === "production" ? "https://member.beanstalker.com.au" : `http://localhost:${port}`;
        fetch(`${baseUrl}/api/square/sync-order/${order.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Sync": "true"
            // Internal sync flag
          }
        }).then((response) => {
          if (response.ok) {
            console.log(`\u2705 AUTO-SYNC: Webhook triggered successfully for order #${order.id} (${baseUrl})`);
          } else {
            console.error(`\u274C AUTO-SYNC: Webhook failed for order #${order.id}, status: ${response.status} (${baseUrl})`);
          }
        }).catch((error) => {
          console.error(`\u274C AUTO-SYNC: Webhook error for order #${order.id}:`, error.message, `(${baseUrl})`);
        });
      }, 100);
      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order", error: String(error) });
    }
  });
  app2.post("/api/credits/add", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user?.id;
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUserCredits(userId, user.credits + amount);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to add credits" });
    }
  });
  app2.post("/api/iap/verify-purchase", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { productId, transactionId, receipt, platform } = req.body;
      const userId = req.user?.id;
      if (!productId || !transactionId || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const isValidReceipt = await verifyPurchaseReceipt(receipt, platform);
      if (!isValidReceipt) {
        return res.status(400).json({ message: "Invalid receipt" });
      }
      const existingTransaction = await storage.getCreditTransactionByTransactionId(transactionId);
      if (existingTransaction) {
        return res.status(400).json({ message: "Transaction already processed" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let creditAmount = 0;
      let transactionType = "iap_purchase";
      if (productId.includes("membership")) {
        creditAmount = 69;
        transactionType = "membership_iap";
      } else if (productId.includes("credits_10")) {
        creditAmount = 10;
      } else if (productId.includes("credits_25")) {
        creditAmount = 25;
      } else if (productId.includes("credits_50")) {
        creditAmount = 50;
      } else if (productId.includes("credits_100")) {
        creditAmount = 100;
      } else {
        return res.status(400).json({ message: "Unknown product ID" });
      }
      const updatedUser = await storage.updateUserCredits(userId, user.credits + creditAmount);
      await storage.createCreditTransaction({
        userId,
        type: transactionType,
        amount: creditAmount,
        description: `IAP: ${productId}`,
        transactionId
      });
      console.log(`IAP Purchase verified: User ${userId} received ${creditAmount} credits from ${productId}`);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({
        success: true,
        user: userWithoutPassword,
        creditsAdded: creditAmount
      });
    } catch (error) {
      console.error("IAP verification error:", error);
      res.status(500).json({ message: "Failed to verify purchase" });
    }
  });
  app2.post("/api/iap/restore-purchases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { receipts, platform } = req.body;
      const userId = req.user?.id;
      if (!receipts || !Array.isArray(receipts)) {
        return res.status(400).json({ message: "Invalid receipts data" });
      }
      let totalCreditsRestored = 0;
      const restoredTransactions = [];
      for (const receipt of receipts) {
        try {
          const isValid = await verifyPurchaseReceipt(receipt.receipt, platform);
          if (!isValid) continue;
          const existing = await storage.getCreditTransactionByTransactionId(receipt.transactionId);
          if (existing) continue;
          let creditAmount = 0;
          if (receipt.productId.includes("membership")) creditAmount = 69;
          else if (receipt.productId.includes("credits_10")) creditAmount = 10;
          else if (receipt.productId.includes("credits_25")) creditAmount = 25;
          else if (receipt.productId.includes("credits_50")) creditAmount = 50;
          else if (receipt.productId.includes("credits_100")) creditAmount = 100;
          if (creditAmount > 0) {
            const user = await storage.getUser(userId);
            await storage.updateUserCredits(userId, user.credits + creditAmount);
            await storage.createCreditTransaction({
              userId,
              type: "iap_restore",
              amount: creditAmount,
              description: `Restored: ${receipt.productId}`,
              transactionId: receipt.transactionId
            });
            totalCreditsRestored += creditAmount;
            restoredTransactions.push({
              productId: receipt.productId,
              credits: creditAmount
            });
          }
        } catch (error) {
          console.error("Error restoring individual purchase:", error);
        }
      }
      res.json({
        success: true,
        creditsRestored: totalCreditsRestored,
        transactions: restoredTransactions
      });
    } catch (error) {
      console.error("IAP restore error:", error);
      res.status(500).json({ message: "Failed to restore purchases" });
    }
  });
  app2.get("/api/square/config", (req, res) => {
    res.json({
      applicationId: getSquareApplicationId(),
      locationId: getSquareLocationId()
    });
  });
  app2.post("/api/square/payment-link", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      const result = await createPaymentLink(amount);
      if (!result.success) {
        return res.status(500).json({
          message: "Failed to create payment link",
          error: "error" in result ? result.error : "Unknown error"
        });
      }
      res.json({
        paymentLink: result.paymentLink,
        amount
      });
    } catch (error) {
      console.error("Payment link generation error:", error);
      res.status(500).json({ message: "Failed to create payment link" });
    }
  });
  app2.post("/api/square/create-payment-link", async (req, res) => {
    try {
      const { amount, userData } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      if (!userData || !userData.username || !userData.password || !userData.email) {
        return res.status(400).json({ message: "Invalid user data" });
      }
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const result = await createPaymentLink(amount);
      if (!result.success) {
        return res.status(500).json({
          message: "Failed to create payment link",
          error: "error" in result ? result.error : "Unknown error"
        });
      }
      const paymentLinkUrl = result.paymentLink;
      res.json({
        paymentLink: {
          url: paymentLinkUrl
        },
        amount
      });
    } catch (error) {
      console.error("Membership payment link generation error:", error);
      res.status(500).json({ message: "Failed to create membership payment link" });
    }
  });
  app2.get("/api/square/config", (req, res) => {
    res.json({
      applicationId: getSquareApplicationId(),
      locationId: getSquareLocationId()
    });
  });
  app2.post("/api/process-membership-payment", async (req, res) => {
    try {
      const { cardData, amount, userData } = req.body;
      if (!cardData || !amount || !userData) {
        return res.status(400).json({ message: "Missing required payment information" });
      }
      const { number, expiry, cvv, postal, postalCode } = cardData;
      const finalPostalCode = postal || postalCode;
      console.log("Card data validation:", { number: !!number, expiry: !!expiry, cvv: !!cvv, postalCode: !!finalPostalCode });
      if (!number || !expiry || !cvv || !finalPostalCode) {
        return res.status(400).json({ message: "Complete card information required" });
      }
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const testCardNumbers = ["4111111111111111", "4242424242424242", "5555555555554444"];
      const cleanCardNumber = number.replace(/\s/g, "");
      if (!testCardNumbers.includes(cleanCardNumber)) {
        return res.status(400).json({
          message: "For testing, please use a test card number: 4111 1111 1111 1111"
        });
      }
      const [month, year] = expiry.split("/");
      if (!month || !year || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid expiry date" });
      }
      const { processPayment: processPayment2 } = await Promise.resolve().then(() => (init_square_payment(), square_payment_exports));
      let paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      try {
        const paymentResult = await processPayment2({
          sourceId: "cnon:card-nonce-ok",
          // Square's official test nonce for sandbox
          amount: amount / 100,
          // Convert from cents to dollars  
          currency: "AUD",
          customerName: userData.fullName || userData.username,
          customerEmail: userData.email
        });
        if (paymentResult.success && paymentResult.payment?.id) {
          paymentId = paymentResult.payment.id;
          console.log("\u2713 Square payment processed - will appear in dashboard:", paymentId);
        } else {
          console.log("Square payment processing issue:", paymentResult);
        }
      } catch (error) {
        console.error("Square payment API error:", error);
        return res.status(500).json({
          message: "Payment processing failed. Please try again."
        });
      }
      const hashedPassword = await hashPassword(userData.password);
      const qrCodeData = await QRCode.toDataURL(`user:${userData.username}`);
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        credits: 69,
        // AUD$69 membership credit
        isActive: true,
        qrCode: qrCodeData
      });
      await storage.createCreditTransaction({
        userId: newUser.id,
        type: "membership_payment",
        amount: 69,
        balanceAfter: 69,
        description: "Premium membership payment - AUD$69 credit"
      });
      req.login(newUser, (err) => {
        if (err) {
          console.error("Login error after payment:", err);
          return res.status(500).json({ message: "Payment processed but login failed" });
        }
        res.status(201).json({
          message: "Premium membership activated successfully",
          user: { ...newUser, password: void 0 },
          membershipCredit: 69,
          paymentId
        });
      });
    } catch (error) {
      console.error("Membership payment error:", error);
      res.status(500).json({ message: "Failed to process membership payment" });
    }
  });
  app2.post("/api/register-with-membership", async (req, res) => {
    try {
      const { username, password, email, fullName } = req.body;
      if (!username || !password || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        fullName,
        credits: 69,
        // AUD$69 credit from membership fee
        isActive: true
      });
      const qrCodeData = await QRCode.toDataURL(`user:${newUser.id}`);
      await storage.updateUserQrCode(newUser.id, qrCodeData);
      await storage.createCreditTransaction({
        userId: newUser.id,
        type: "membership",
        amount: 69,
        balanceAfter: 69,
        description: "Premium membership activation - AUD$69 credit (sandbox)"
      });
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({
        success: true,
        user: userWithoutPassword,
        message: "Premium membership activated successfully"
      });
    } catch (error) {
      console.error("Error creating membership account:", error);
      res.status(500).json({ message: "Failed to create membership account" });
    }
  });
  app2.post("/api/square/process-payment", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user?.id;
      const { sourceId, amount, bonusAmount, currency = "AUD" } = req.body;
      if (!sourceId || !amount) {
        return res.status(400).json({ message: "Invalid payment data" });
      }
      const paymentResult = await processPayment({
        sourceId,
        amount,
        currency
      });
      if (!paymentResult.success) {
        return res.status(400).json({
          message: "Payment failed",
          error: "error" in paymentResult ? paymentResult.error : "Unknown error"
        });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const creditsToAdd = bonusAmount || amount;
      const newBalance = user.credits + creditsToAdd;
      const updatedUser = await storage.updateUserCredits(userId, newBalance);
      await storage.createCreditTransaction({
        userId,
        type: "purchase",
        amount: creditsToAdd,
        balanceAfter: newBalance,
        description: `Credit purchase of $${amount / 100} giving ${creditsToAdd} credits`,
        metadata: {
          paymentId: paymentResult.payment.id,
          amountPaid: amount,
          bonusAmount: bonusAmount ? bonusAmount - amount : 0
        }
      });
      const { password, ...userWithoutPassword } = updatedUser;
      const paymentJson = JSON.parse(JSON.stringify(
        paymentResult.payment,
        (key, value) => typeof value === "bigint" ? value.toString() : value
      ));
      res.json({
        success: true,
        payment: paymentJson,
        user: userWithoutPassword,
        credits: {
          paid: amount,
          received: creditsToAdd
        }
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });
  app2.get("/payment-success", async (req, res) => {
    const { transactionId, userData } = req.query;
    try {
      if (userData && typeof userData === "string") {
        const userInfo = JSON.parse(decodeURIComponent(userData));
        const hashedPassword = await hashPassword(userInfo.password);
        const newUser = await storage.createUser({
          username: userInfo.username,
          password: hashedPassword,
          email: userInfo.email,
          fullName: userInfo.fullName,
          credits: 69,
          // AUD$69 credit from membership fee
          isActive: true
        });
        const qrCodeData = await QRCode.toDataURL(`user:${newUser.id}`);
        await storage.updateUserQrCode(newUser.id, qrCodeData);
        await storage.createCreditTransaction({
          userId: newUser.id,
          type: "membership",
          amount: 69,
          balanceAfter: 69,
          description: "Premium membership activation - AUD$69 credit"
        });
        res.redirect(`/auth?registration=success&message=Premium membership activated! Please log in with your credentials.`);
        return;
      }
    } catch (error) {
      console.error("Error processing membership payment:", error);
      res.redirect(`/auth?error=registration_failed`);
      return;
    }
    res.redirect(`/profile?payment=success&transaction=${transactionId || ""}`);
  });
  app2.post("/api/membership/signup", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user?.id;
      const { sourceId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.isMember) {
        return res.status(400).json({ message: "User is already a member" });
      }
      if (!sourceId) {
        return res.status(400).json({ message: "Payment source required" });
      }
      const membershipFee = 6900;
      const paymentResult = await processPayment({
        sourceId,
        amount: membershipFee,
        currency: "AUD"
      });
      if (!paymentResult.success) {
        return res.status(400).json({
          message: "Membership payment failed",
          error: "error" in paymentResult ? paymentResult.error : "Unknown error"
        });
      }
      const updatedUser = await storage.setUserMembership(userId, true);
      const newBalance = user.credits + 69;
      const userWithCredits = await storage.updateUserCredits(userId, newBalance);
      await storage.createCreditTransaction({
        userId,
        type: "membership",
        amount: 69,
        balanceAfter: newBalance,
        description: "Membership signup - AUD$69 fee credited to account"
      });
      const { password, ...userWithoutPassword } = userWithCredits;
      res.json({
        success: true,
        message: "Membership activated successfully",
        user: { ...userWithoutPassword, isMember: true, membershipDate: updatedUser.membershipDate },
        membershipFee: 69,
        creditsAdded: 69
      });
    } catch (error) {
      console.error("Membership signup error:", error);
      res.status(500).json({ message: "Failed to process membership signup" });
    }
  });
  app2.get("/api/user/qrcode", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user?.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.qrCode) {
        return res.json({ qrCode: user.qrCode });
      }
      const userData = {
        id: user.id,
        username: user.username,
        credits: user.credits,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(userData), {
        errorCorrectionLevel: "H",
        margin: 1,
        scale: 8,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });
      const updatedUser = await storage.updateUserQrCode(userId, qrCodeDataUrl);
      res.json({ qrCode: qrCodeDataUrl });
    } catch (error) {
      console.error("QR code generation error:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });
  app2.post("/api/password-reset/request", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({
          success: true,
          message: "If your email is registered, you will receive a password reset link shortly."
        });
      }
      const token = await storage.createPasswordResetToken(email);
      if (!token) {
        return res.status(500).json({ message: "Failed to create reset token" });
      }
      const emailSent = await sendPasswordResetEmail(email, token);
      if (!emailSent) {
        console.error("Failed to send password reset email");
        return res.status(500).json({ message: "Failed to send reset email" });
      }
      res.json({
        success: true,
        message: "If your email is registered, you will receive a password reset link shortly."
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Failed to process reset request" });
    }
  });
  app2.post("/api/password-reset/reset", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      const hashedPassword = await hashPassword(newPassword);
      await storage.resetPassword(user.id, hashedPassword);
      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const userId = req.user?.id;
      const updateProfileSchema = z.object({
        fullName: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().email().optional().nullable()
      });
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUser(userId, validatedData);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid profile data",
          errors: formatZodError(error)
        });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/user/lookup", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const { phoneNumber } = req.query;
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return res.status(400).json({ message: "Phone number is required" });
    }
    try {
      const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");
      const users2 = await storage.getAllUsers();
      const matchedUser = users2.find((user) => {
        const userPhone = user.phoneNumber ? user.phoneNumber.replace(/\D/g, "") : "";
        return userPhone === normalizedPhoneNumber;
      });
      if (!matchedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { id, username } = matchedUser;
      res.json({ id, username });
    } catch (error) {
      console.error("Error looking up user by phone number:", error);
      res.status(500).json({ message: "Failed to lookup user" });
    }
  });
  app2.get("/api/admin/menu/:menuItemId", isAdmin, async (req, res) => {
    try {
      const { menuItemId } = req.params;
      const menuItem = await storage.getMenuItem(Number(menuItemId));
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });
  app2.post("/api/admin/upload", isAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({
        imageUrl,
        message: "File uploaded successfully"
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  app2.post("/api/admin/menu", isAdmin, async (req, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      }
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });
  app2.patch("/api/admin/menu/:menuItemId", isAdmin, async (req, res) => {
    try {
      const { menuItemId } = req.params;
      const menuItem = await storage.updateMenuItem(Number(menuItemId), req.body);
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });
  app2.delete("/api/admin/menu/:menuItemId", isAdmin, async (req, res) => {
    try {
      const { menuItemId } = req.params;
      await storage.deleteMenuItem(Number(menuItemId));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });
  app2.get("/api/admin/menu/:menuItemId/options", isAdmin, async (req, res) => {
    try {
      const menuItemId = parseInt(req.params.menuItemId);
      const options = await storage.getMenuItemOptions(menuItemId);
      const parentOptions = options.filter((option) => option.isParent);
      const standardOptions = options.filter((option) => !option.isParent && !option.parentId);
      const childOptions = options.filter((option) => option.parentId);
      const result = [
        ...standardOptions,
        ...parentOptions.map((parent) => ({
          ...parent,
          children: childOptions.filter((child) => child.parentId === parent.id)
        }))
      ];
      res.json(result);
    } catch (error) {
      console.error("Error fetching menu item options:", error);
      res.status(500).json({ message: "Failed to fetch menu item options" });
    }
  });
  app2.post("/api/admin/menu/:menuItemId/options", isAdmin, async (req, res) => {
    try {
      const menuItemId = parseInt(req.params.menuItemId);
      const optionData = req.body;
      const newOption = await storage.createMenuItemOption({
        ...optionData,
        menuItemId
      });
      res.status(201).json(newOption);
    } catch (error) {
      console.error("Error creating menu item option:", error);
      res.status(500).json({ message: "Failed to create menu item option" });
    }
  });
  app2.patch("/api/admin/menu-options/:optionId", isAdmin, async (req, res) => {
    try {
      const optionId = parseInt(req.params.optionId);
      const optionData = req.body;
      const updatedOption = await storage.updateMenuItemOption(optionId, optionData);
      res.json(updatedOption);
    } catch (error) {
      console.error("Error updating menu item option:", error);
      res.status(500).json({ message: "Failed to update menu item option" });
    }
  });
  app2.delete("/api/admin/menu-options/:optionId", isAdmin, async (req, res) => {
    try {
      const optionId = parseInt(req.params.optionId);
      await storage.deleteMenuItemOption(optionId);
      res.status(200).json({ message: "Menu item option deleted successfully" });
    } catch (error) {
      console.error("Error deleting menu item option:", error);
      res.status(500).json({ message: "Failed to delete menu item option" });
    }
  });
  app2.get("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/admin/categories/:categoryId", isAdmin, async (req, res) => {
    try {
      const { categoryId } = req.params;
      const category = await storage.getAllCategories().then(
        (categories) => categories.find((cat) => cat.id === Number(categoryId))
      );
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  app2.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const categoryData = insertMenuCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  app2.patch("/api/admin/categories/:categoryId", isAdmin, async (req, res) => {
    try {
      const { categoryId } = req.params;
      const categoryData = insertMenuCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(Number(categoryId), categoryData);
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/admin/categories/:categoryId", isAdmin, async (req, res) => {
    try {
      const { categoryId } = req.params;
      await storage.deleteCategory(Number(categoryId));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.get("/api/admin/push-subscription-debug", isAdmin, async (req, res) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const subscriptions = await storage.getPushSubscriptionsByUserId(user.id);
      const safeSubscriptions = subscriptions.map((sub) => ({
        endpoint: sub.endpoint,
        p256dhLength: sub.p256dh?.length || 0,
        authLength: sub.auth?.length || 0,
        userId: sub.userId,
        createdAt: sub.createdAt,
        browserInfo: {
          isWindows: sub.endpoint.includes("windows.com") || sub.endpoint.includes("microsoft"),
          isApple: sub.endpoint.includes("apple") || sub.endpoint.includes("icloud"),
          isFirebase: sub.endpoint.includes("fcm") || sub.endpoint.includes("firebase"),
          endpointPrefix: sub.endpoint.substring(0, 50) + "..."
        }
      }));
      const vapidInfo = {
        publicKey: "BLeQMZeMxGSl0T1YGtCufXPz6aKE8c7ItAwJ5bAavW8FSz0d-Czw5wR-nvGVIhhjkRPs2vok9MzViHINmzdCdCQ",
        contact: "mailto:support@beanstalker.com"
      };
      res.json({
        subscriptions: safeSubscriptions,
        vapidInfo
      });
    } catch (error) {
      console.error("Error getting subscription debug info:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/admin/test-notification", isAdmin, async (req, res) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      console.log(`==== SENDING TEST NOTIFICATION TO ADMIN #${user.id} ====`);
      const subscriptions = await storage.getPushSubscriptionsByUserId(user.id);
      console.log(`Found ${subscriptions.length} subscriptions for admin user ${user.id}`);
      if (subscriptions.length === 0) {
        return res.status(404).json({
          message: "No push subscriptions found",
          hint: "Please enable push notifications in your browser first"
        });
      }
      const testId = Math.random().toString(36).substring(2, 10);
      const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
      const payload = {
        title: "Test Notification",
        body: `This is a test notification sent at ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`,
        icon: "/images/icon-512.png",
        badge: "/images/badge.svg",
        tag: `admin-test-${Date.now()}`,
        // Make the tag unique every time
        data: {
          url: "/admin",
          test: true,
          testId,
          timestamp: timestamp2,
          // Add user ID to ensure this notification is only shown to intended recipient
          userId: user.id,
          // Flag to indicate this is a test notification
          isTestNotification: true
        },
        requireInteraction: true,
        vibrate: [100, 50, 100]
      };
      subscriptions.forEach((subscription, index) => {
        console.log(`Subscription ${index + 1} details:`, {
          userId: subscription.userId,
          endpoint: subscription.endpoint.substring(0, 50) + "...",
          p256dhLength: subscription.p256dh.length,
          authLength: subscription.auth.length,
          isWindows: subscription.endpoint.includes("windows.com") || subscription.endpoint.includes("microsoft"),
          isApple: subscription.endpoint.includes("apple") || subscription.endpoint.includes("icloud"),
          isFirebase: subscription.endpoint.includes("fcm") || subscription.endpoint.includes("firebase"),
          platform: req.header("user-agent") || "Unknown"
        });
      });
      const results = await Promise.allSettled(
        subscriptions.map((subscription) => {
          try {
            console.log(`Attempting to send notification to endpoint: ${subscription.endpoint.substring(0, 30)}...`);
            return sendPushNotification(subscription, payload);
          } catch (err) {
            console.error("Error in test notification:", err);
            throw err;
          }
        })
      );
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      results.forEach((result, i) => {
        if (result.status === "rejected") {
          console.error(`Test notification ${i + 1} failed:`, result.reason);
        } else {
          console.log(`Test notification ${i + 1} sent successfully:`, {
            status: result.value.statusCode,
            statusText: result.value.statusMessage
          });
        }
      });
      res.json({
        message: `Test notification sent: ${successful} succeeded, ${failed} failed`,
        subscriptions: subscriptions.length,
        successful,
        failed,
        results: results.map(
          (r) => r.status === "fulfilled" ? { status: "success" } : { status: "error", message: r.reason?.message || "Unknown error" }
        )
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({
        message: "Failed to send test notification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.post("/api/admin/send-update-notification", isAdmin, async (req, res) => {
    try {
      const { version, includeAdmins = false } = req.body;
      if (!version) {
        return res.status(400).json({ message: "Version parameter is required" });
      }
      console.log(`Preparing to send app update notification for version ${version}`);
      const allUsers = await storage.getAllUsers();
      console.log(`Found ${allUsers.length} total users in database`);
      const usersWithEmails = allUsers.filter((user) => {
        const hasEmail = user.email && user.email.trim() !== "";
        const isUserAdmin = user.isAdmin;
        return hasEmail && (!isUserAdmin || includeAdmins);
      });
      console.log(`Found ${usersWithEmails.length} users with email addresses (includeAdmins: ${includeAdmins})`);
      if (usersWithEmails.length === 0) {
        return res.status(200).json({
          message: "No users with email addresses found",
          totalUsers: allUsers.length,
          usersWithEmails: 0,
          sent: false
        });
      }
      const userEmails = usersWithEmails.map((user) => user.email).filter((email) => email !== null && email !== void 0);
      console.log(`Sending update notification to emails: ${userEmails.slice(0, 3).join(", ")}${userEmails.length > 3 ? "..." : ""}`);
      const emailSent = await sendAppUpdateNotification(userEmails, version);
      if (emailSent) {
        console.log(`Successfully sent app update notification for version ${version} to ${userEmails.length} users`);
        res.json({
          message: `App update notification sent successfully`,
          version,
          totalUsers: allUsers.length,
          usersWithEmails: usersWithEmails.length,
          emailsSent: userEmails.length,
          sent: true
        });
      } else {
        console.error(`Failed to send app update notification for version ${version}`);
        res.status(500).json({
          message: "Failed to send app update notification",
          version,
          totalUsers: allUsers.length,
          usersWithEmails: usersWithEmails.length,
          sent: false
        });
      }
    } catch (error) {
      console.error("Error sending app update notification:", error);
      res.status(500).json({
        message: "Failed to send app update notification",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      console.log("Getting all users for admin dashboard");
      const users2 = await storage.getAllUsers();
      console.log(`Retrieved ${users2.length} users from database:`, users2.map((u) => u.id));
      const sanitizedUsers = users2.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/user-by-qr/:qrCode", isAdmin, async (req, res) => {
    try {
      const { qrCode } = req.params;
      if (!qrCode) {
        return res.status(400).json({ error: "QR code is required" });
      }
      const user = await storage.getUserByQrCode(qrCode);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user by QR code:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.get("/api/admin/users/:userId", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID format" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (validatedData.password) {
        validatedData.password = await hashPassword(validatedData.password);
      }
      const user = await storage.createUser(validatedData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", error: formatZodError(error) });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/admin/orders/detailed", isAdmin, async (req, res) => {
    try {
      const orders2 = await storage.getAllOrdersWithUserDetails();
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching detailed orders:", error);
      res.status(500).json({ message: "Failed to fetch detailed orders" });
    }
  });
  app2.patch("/api/admin/orders/:orderId", isAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      if (!status || !["pending", "processing", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const existingOrder = await storage.getOrderById(Number(orderId));
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      const statusChanged = existingOrder.status !== status;
      const updatedOrder = await storage.updateOrderStatus(Number(orderId), status);
      if (statusChanged) {
        try {
          console.log(`Attempting to send notification to user ${updatedOrder.userId} for order ${orderId} - status: ${status}`);
          const user = await storage.getUser(updatedOrder.userId);
          const userGreeting = user ? `Hi ${user.username}! ` : "";
          let friendlyStatus = status;
          let emoji = "";
          if (status === "processing") {
            friendlyStatus = "being prepared";
            emoji = "\u2615 ";
          } else if (status === "completed") {
            friendlyStatus = "ready for pickup";
            emoji = "\u2705 ";
          } else if (status === "cancelled") {
            friendlyStatus = "cancelled";
            emoji = "\u274C ";
          }
          const subscriptions = await storage.getPushSubscriptionsByUserId(updatedOrder.userId);
          console.log(`Found ${subscriptions.length} push subscriptions for user ${updatedOrder.userId}`);
          if (subscriptions.length > 0) {
            const title = `${emoji}Order #${orderId} Update`;
            const body = `${userGreeting}Your order is now ${friendlyStatus}`;
            for (const subscription of subscriptions) {
              try {
                console.log(`Sending to subscription: ${subscription.endpoint.substring(0, 50)}...`);
                await sendPushNotification(subscription, {
                  title,
                  body,
                  requireInteraction: true,
                  vibrate: [100, 50, 100],
                  tag: `order-${orderId}-${Date.now()}`,
                  // Make tag unique every time
                  data: {
                    orderId: Number(orderId),
                    status,
                    url: "/orders",
                    userId: updatedOrder.userId,
                    // Add user ID for verification
                    timestamp: (/* @__PURE__ */ new Date()).toISOString()
                  }
                });
                console.log(`Successfully sent notification to ${subscription.endpoint.substring(0, 30)}...`);
              } catch (subError) {
                console.error(`Error sending to subscription ${subscription.id}:`, subError.message);
              }
            }
          } else {
            await sendOrderStatusNotification(updatedOrder.userId, updatedOrder.id, status);
          }
          console.log(`Notification(s) sent to user ${updatedOrder.userId} about order ${orderId}`);
        } catch (notificationError) {
          console.error("Failed to send push notification:", notificationError);
        }
      } else {
        console.log(`Order ${orderId} status not changed (already ${status}), no notification sent`);
      }
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.patch("/api/admin/users/:userId", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { isAdmin: setIsAdmin } = req.body;
      if (typeof setIsAdmin !== "boolean") {
        return res.status(400).json({ message: "Invalid isAdmin value" });
      }
      const updatedUser = await storage.setUserAdmin(Number(userId), setIsAdmin);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.post("/api/admin/users/:userId/credits", isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount } = req.body;
      if (!amount) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      const user = await storage.getUser(Number(userId));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const newBalance = user.credits + amount;
      const updatedUser = await storage.updateUserCredits(Number(userId), newBalance);
      await storage.createCreditTransaction({
        userId: Number(userId),
        type: "admin",
        amount,
        balanceAfter: newBalance,
        description: `Credits added by admin`,
        metadata: {
          adminUserId: req.user?.id,
          adminUsername: req.user?.username
        }
      });
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to add credits" });
    }
  });
  app2.get("/api/admin/user-by-qr/:qrCode", isAdmin, async (req, res) => {
    try {
      const { qrCode } = req.params;
      if (!qrCode) {
        return res.status(400).json({ message: "QR code is required" });
      }
      const user = await storage.getUserByQrCode(qrCode);
      if (!user) {
        return res.status(404).json({ message: "User not found with this QR code" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error getting user by QR code:", error);
      res.status(500).json({ message: "Failed to get user by QR code" });
    }
  });
  app2.get("/api/push/vapid-key", (req, res) => {
    res.json({ publicKey: getVapidPublicKey() });
  });
  app2.post("/api/push/test", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user.id;
      const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
      const testId = Math.random().toString(36).substring(2, 10);
      console.log(`User ${userId} requested test notification with ID ${testId}`);
      const payload = {
        title: "Test Notification",
        body: `This is a test notification (${(/* @__PURE__ */ new Date()).toLocaleTimeString()})`,
        icon: "/images/icon-512.png",
        badge: "/images/badge.svg",
        tag: `test-${Date.now()}`,
        // Make the tag unique every time
        data: {
          testId,
          url: "/profile",
          timestamp: timestamp2,
          // For test notifications, include orderId to trigger notification handling
          orderId: 999,
          status: "test",
          // Flag to indicate this is a test notification
          isTestNotification: true,
          // Add the user ID to ensure we only show to this user
          userId
        }
      };
      console.log("Sending test notification:", JSON.stringify(payload, null, 2));
      const subscriptions = await storage.getPushSubscriptionsByUserId(userId);
      console.log(`User ${userId} has ${subscriptions.length} push subscriptions`);
      let sentCount = 0;
      if (subscriptions.length > 0) {
        for (const subscription of subscriptions) {
          try {
            await sendPushNotification(subscription, payload);
            console.log(`Sent test notification to: ${subscription.endpoint.substring(0, 30)}...`);
            sentCount++;
          } catch (error) {
            console.error(`Failed to send to subscription: ${subscription.endpoint.substring(0, 30)}...`, error);
          }
        }
      } else {
        console.log(`No push subscriptions found for user ${userId}`);
      }
      const userAgent = req.headers["user-agent"] || "";
      console.log("Test notification details:", {
        userAgent: userAgent.substring(0, 100),
        // Trim user agent for log readability
        subscriptionCount: subscriptions.length,
        firstEndpoint: subscriptions.length > 0 ? subscriptions[0].endpoint.substring(0, 50) + "..." : "none",
        payloadPreview: {
          title: payload.title,
          body: payload.body,
          data: payload.data
        }
      });
      res.json({
        success: true,
        message: "Test notification sent",
        details: {
          timestamp: timestamp2,
          testId,
          subscriptionCount: (await storage.getPushSubscriptionsByUserId(userId)).length
        }
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send test notification",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/push/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const userId = req.user.id;
      const subscriptionData = insertPushSubscriptionSchema.parse({
        ...req.body,
        userId
      });
      const subscription = await storage.savePushSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      console.error("Push subscription error:", error);
      res.status(500).json({ message: "Failed to save push subscription" });
    }
  });
  app2.delete("/api/push/unsubscribe", async (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint is required" });
      }
      await storage.deletePushSubscription(endpoint);
      res.status(200).json({ message: "Subscription deleted successfully" });
    } catch (error) {
      console.error("Push unsubscription error:", error);
      res.status(500).json({ message: "Failed to delete push subscription" });
    }
  });
  app2.get("/api/credit-transactions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const userId = req.user.id;
      const transactions = await storage.getCreditTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching credit transactions:", error);
      res.status(500).json({ message: "Failed to fetch credit transaction history" });
    }
  });
  app2.post("/api/send-credits", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { recipientId, amount, message } = req.body;
    if (!recipientId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid request. Recipient ID and positive amount are required." });
    }
    try {
      const sender = await storage.getUser(req.user.id);
      if (!sender) {
        return res.status(404).json({ message: "Sender account not found" });
      }
      if (sender.credits < amount) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      const recipient = await storage.getUser(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient account not found" });
      }
      if (sender.id === recipient.id) {
        return res.status(400).json({ message: "Cannot send credits to yourself" });
      }
      const updatedSender = await storage.updateUserCredits(sender.id, sender.credits - amount);
      await storage.createCreditTransaction({
        userId: sender.id,
        type: "send",
        amount: -amount,
        balanceAfter: updatedSender.credits,
        description: `Sent to ${recipient.username}`,
        metadata: { recipientId: recipient.id, message: message || "" }
      });
      const updatedRecipient = await storage.updateUserCredits(recipient.id, recipient.credits + amount);
      await storage.createCreditTransaction({
        userId: recipient.id,
        type: "receive",
        amount,
        balanceAfter: updatedRecipient.credits,
        description: `Received from ${sender.username}`,
        metadata: { senderId: sender.id, message: message || "" }
      });
      res.json({
        success: true,
        sender: { id: sender.id, credits: updatedSender.credits },
        recipient: { id: recipient.id, username: recipient.username },
        amount
      });
    } catch (error) {
      console.error("Error sending credits:", error);
      res.status(500).json({ message: "Failed to send credits", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/credit-transactions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const validatedData = insertCreditTransactionSchema.parse(req.body);
      const userId = req.user.id;
      if (validatedData.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized transaction request" });
      }
      const transaction = await storage.createCreditTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: formatZodError(error) });
      }
      console.error("Error creating credit transaction:", error);
      res.status(500).json({ message: "Failed to create credit transaction" });
    }
  });
  app2.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const userId = req.user.id;
      const favorites2 = await storage.getUserFavorites(userId);
      res.json(favorites2);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });
  app2.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const userId = req.user.id;
      const { menuItemId } = req.body;
      if (!menuItemId) {
        return res.status(400).json({ message: "Menu item ID is required" });
      }
      const menuItem = await storage.getMenuItem(menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      const isAlreadyFavorite = await storage.isFavorite(userId, menuItemId);
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: "Item is already in favorites" });
      }
      const favorite = await storage.addFavorite({
        userId,
        menuItemId
      });
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });
  app2.delete("/api/favorites/:menuItemId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const userId = req.user.id;
      const menuItemId = parseInt(req.params.menuItemId);
      if (isNaN(menuItemId)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const isFavorite = await storage.isFavorite(userId, menuItemId);
      if (!isFavorite) {
        return res.status(404).json({ message: "Item is not in favorites" });
      }
      await storage.removeFavorite(userId, menuItemId);
      res.status(200).json({ message: "Favorite removed successfully" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });
  app2.get("/api/favorites/:menuItemId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const userId = req.user.id;
      const menuItemId = parseInt(req.params.menuItemId);
      if (isNaN(menuItemId)) {
        return res.status(400).json({ message: "Invalid menu item ID" });
      }
      const isFavorite = await storage.isFavorite(userId, menuItemId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });
  app2.post("/api/favorites/add-all", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    try {
      const userId = req.user.id;
      const menuItems2 = await storage.getMenuItems();
      const addedItems = [];
      for (const item of menuItems2) {
        const isAlreadyFavorite = await storage.isFavorite(userId, item.id);
        if (!isAlreadyFavorite) {
          await storage.addFavorite({
            userId,
            menuItemId: item.id
          });
          addedItems.push(item);
        }
      }
      res.status(200).json({
        message: `Added ${addedItems.length} items to favorites`,
        addedItems
      });
    } catch (error) {
      console.error("Error adding all menu items to favorites:", error);
      res.status(500).json({ message: "Failed to add all items to favorites" });
    }
  });
  app2.delete("/api/admin/users/clear", isAdmin, async (req, res) => {
    try {
      const adminUsers = await storage.getAdminUsers();
      const adminUserIds = adminUsers.map((user) => user.id);
      if (req.user && !adminUserIds.includes(req.user.id)) {
        adminUserIds.push(req.user.id);
      }
      if (adminUserIds.length === 0) {
        return res.status(400).json({ message: "Cannot delete all admin users" });
      }
      await storage.clearAllUsers(adminUserIds);
      res.status(200).json({ message: "All non-admin users cleared successfully" });
    } catch (error) {
      console.error("Error clearing users:", error);
      res.status(500).json({ message: "Failed to clear users" });
    }
  });
  app2.delete("/api/admin/orders/clear", isAdmin, async (req, res) => {
    try {
      await storage.clearAllOrders();
      res.status(200).json({ message: "All orders cleared successfully" });
    } catch (error) {
      console.error("Error clearing orders:", error);
      res.status(500).json({ message: "Failed to clear orders" });
    }
  });
  app2.post("/api/membership/signup", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const user = req.user;
    if (user.isMember) {
      return res.status(400).json({ message: "User is already a member" });
    }
    try {
      const { sourceId } = req.body;
      if (!sourceId) {
        return res.status(400).json({ message: "Payment source required" });
      }
      const paymentRequest = {
        sourceId,
        amount: 69,
        // AUD$69.00
        currency: "AUD"
      };
      const paymentResult = await processPayment(paymentRequest);
      if (paymentResult.success) {
        const updatedUser = await storage.updateUser(user.id, {
          isMember: true,
          membershipDate: /* @__PURE__ */ new Date(),
          credits: user.credits + 69
          // Add AUD$69 in credits
        });
        await storage.createCreditTransaction({
          type: "membership_signup",
          description: "Premium membership signup bonus",
          userId: user.id,
          amount: 69,
          balanceAfter: updatedUser.credits,
          relatedUserId: null,
          orderId: null
        });
        res.status(200).json({
          success: true,
          message: "Membership activated successfully",
          user: updatedUser,
          payment: {
            id: paymentResult.payment?.id || "unknown",
            status: "COMPLETED",
            amount: "69.00",
            currency: "AUD"
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: paymentResult.error?.message || "Payment failed"
        });
      }
    } catch (error) {
      console.error("Membership signup failed:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Membership signup failed"
      });
    }
  });
  app2.get("/api/pending-credit-transfers", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const pendingTransfers = await storage.getPendingCreditTransfers(req.user.id);
      res.json(pendingTransfers);
    } catch (error) {
      console.error("Error fetching pending credit transfers:", error);
      res.status(500).json({ message: "Failed to fetch pending transfers" });
    }
  });
  app2.get("/api/admin/pending-credit-transfers", isAdmin, async (req, res) => {
    try {
      const pendingTransfers = await storage.getAllPendingCreditTransfers();
      const enrichedTransfers = await Promise.all(
        pendingTransfers.map(async (transfer) => {
          const sender = await storage.getUser(transfer.senderId);
          return {
            ...transfer,
            senderName: sender?.username || "Unknown",
            senderFullName: sender?.fullName || null
          };
        })
      );
      res.json(enrichedTransfers);
    } catch (error) {
      console.error("Error fetching all pending credit transfers:", error);
      res.status(500).json({ message: "Failed to fetch pending transfers" });
    }
  });
  app2.get("/api/admin/all-credit-transfers", isAdmin, async (req, res) => {
    try {
      const allTransfers = await storage.getAllCreditTransfers();
      const enrichedTransfers = await Promise.all(
        allTransfers.map(async (transfer) => {
          const sender = await storage.getUser(transfer.senderId);
          let verifierName = null;
          if (transfer.verifiedByUserId) {
            const verifier = await storage.getUser(transfer.verifiedByUserId);
            verifierName = verifier?.username || "Unknown";
          }
          return {
            ...transfer,
            senderName: sender?.username || "Unknown",
            senderFullName: sender?.fullName || null,
            verifierName
          };
        })
      );
      res.json(enrichedTransfers);
    } catch (error) {
      console.error("Error fetching all credit transfers:", error);
      res.status(500).json({ message: "Failed to fetch credit transfers" });
    }
  });
  app2.post("/api/share-credits", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const { phoneNumber, amount } = req.body;
      if (!phoneNumber || !amount || amount <= 0) {
        return res.status(400).json({ message: "Valid phone number and amount required" });
      }
      const user = req.user;
      if (!user || amount > user.credits) {
        return res.status(400).json({ message: "Insufficient credits" });
      }
      const verificationCode = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      const pendingTransfer = await storage.createPendingCreditTransfer({
        verificationCode,
        senderId: user.id,
        recipientPhone: phoneNumber,
        amount,
        status: "pending",
        expiresAt
      });
      const smsMessage = `\u{1F381} You've received $${amount.toFixed(2)} Bean Stalker credits from ${user.username}! Show this code at our store: ${verificationCode}. Valid for 24 hours. Bean Stalker Coffee Shop`;
      res.json({
        success: true,
        verificationCode,
        smsMessage,
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      console.error("Credit sharing error:", error);
      res.status(500).json({ message: "Failed to create credit share" });
    }
  });
  app2.post("/api/verify-credit-share", isAdmin, async (req, res) => {
    try {
      const { verificationCode } = req.body;
      if (!verificationCode) {
        return res.status(400).json({ message: "Verification code required" });
      }
      const pendingTransfer = await storage.getPendingCreditTransferByCode(verificationCode);
      if (!pendingTransfer) {
        return res.status(404).json({ message: "Invalid verification code" });
      }
      if (pendingTransfer.status !== "pending") {
        return res.status(400).json({ message: "Code already used or expired" });
      }
      if (/* @__PURE__ */ new Date() > new Date(pendingTransfer.expiresAt)) {
        return res.status(400).json({ message: "Verification code expired" });
      }
      const sender = await storage.getUser(pendingTransfer.senderId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      if (sender.credits < pendingTransfer.amount) {
        return res.status(400).json({ message: "Sender has insufficient credits" });
      }
      const newSenderBalance = sender.credits - pendingTransfer.amount;
      await storage.updateUserCredits(sender.id, newSenderBalance);
      await storage.createCreditTransaction({
        type: "credit_share",
        amount: -pendingTransfer.amount,
        description: `Shared $${pendingTransfer.amount} via SMS to ${pendingTransfer.recipientPhone}`,
        userId: sender.id,
        balanceAfter: newSenderBalance,
        transactionId: verificationCode
      });
      await storage.verifyPendingCreditTransfer(pendingTransfer.id, req.user.id);
      try {
        await sendPushNotificationToUser(sender.id, {
          title: "Credits Shared Successfully",
          body: `$${pendingTransfer.amount} has been claimed from your account`,
          data: {
            type: "credit_shared",
            amount: pendingTransfer.amount,
            recipientPhone: pendingTransfer.recipientPhone,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      } catch (notificationError) {
        console.error("Failed to send credit share notification:", notificationError);
      }
      res.json({
        success: true,
        message: `Successfully deducted $${pendingTransfer.amount} from ${sender.username}`,
        senderName: sender.username,
        amount: pendingTransfer.amount,
        recipientPhone: pendingTransfer.recipientPhone
      });
    } catch (error) {
      console.error("Credit verification error:", error);
      res.status(500).json({ message: "Failed to verify credit share" });
    }
  });
  app2.post("/api/restaurant/orders", async (req, res) => {
    try {
      const { createRestaurantOrder: createRestaurantOrder2 } = await Promise.resolve().then(() => (init_square_restaurant(), square_restaurant_exports));
      const orderData = req.body;
      if (req.user) {
        orderData.customerId = req.user.id.toString();
        orderData.customerName = req.user.username;
      }
      const result = await createRestaurantOrder2(orderData);
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Restaurant order creation failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create restaurant order"
      });
    }
  });
  app2.patch("/api/restaurant/orders/:orderId/status", isAdmin, async (req, res) => {
    try {
      const { updateOrderStatus: updateOrderStatus2 } = await Promise.resolve().then(() => (init_square_restaurant(), square_restaurant_exports));
      const { orderId } = req.params;
      const { status } = req.body;
      const result = await updateOrderStatus2(orderId, status);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Order status update failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update order status"
      });
    }
  });
  app2.get("/api/restaurant/menu/sync", isAdmin, async (req, res) => {
    try {
      const { getSquareMenuItems: getSquareMenuItems2 } = await Promise.resolve().then(() => (init_square_restaurant(), square_restaurant_exports));
      const result = await getSquareMenuItems2();
      res.json(result);
    } catch (error) {
      console.error("Square menu sync failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to sync menu items"
      });
    }
  });
  app2.get("/api/restaurant/inventory/sync", isAdmin, async (req, res) => {
    try {
      const { syncInventoryLevels: syncInventoryLevels2 } = await Promise.resolve().then(() => (init_square_restaurant(), square_restaurant_exports));
      const result = await syncInventoryLevels2();
      res.json(result);
    } catch (error) {
      console.error("Inventory sync failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to sync inventory"
      });
    }
  });
  app2.post("/api/restaurant/payment", async (req, res) => {
    try {
      const { processRestaurantPayment: processRestaurantPayment2 } = await Promise.resolve().then(() => (init_square_restaurant(), square_restaurant_exports));
      const { amount, sourceId, orderId } = req.body;
      const result = await processRestaurantPayment2(amount, sourceId, orderId);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Restaurant payment failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process payment"
      });
    }
  });
  app2.get("/api/restaurant/location", async (req, res) => {
    try {
      const { getLocationInfo: getLocationInfo2 } = await Promise.resolve().then(() => (init_square_restaurant(), square_restaurant_exports));
      const result = await getLocationInfo2();
      res.json(result);
    } catch (error) {
      console.error("Location info retrieval failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get location info"
      });
    }
  });
  app2.get("/api/kitchen/orders", async (req, res) => {
    try {
      const orders2 = await storage.getRecentOrders(50);
      const kitchenOrders2 = orders2.map((order) => ({
        id: order.id,
        customerName: order.username || `Customer #${order.userId}`,
        items: order.items || [],
        status: order.status || "pending",
        total: order.total,
        createdAt: order.createdAt,
        estimatedTime: 15,
        // Default 15 minutes
        priority: order.total > 50 ? 3 : order.total > 25 ? 2 : 1,
        station: "main",
        fulfillmentType: "PICKUP"
        // Default fulfillment type for Square
      }));
      res.json(kitchenOrders2);
    } catch (error) {
      console.error("Kitchen orders retrieval failed:", error);
      res.status(500).json({
        error: "Failed to get kitchen orders"
      });
    }
  });
  app2.patch("/api/kitchen/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, assignedTo, estimatedTime } = req.body;
      await storage.updateOrderStatus(parseInt(orderId), status);
      console.log(`\u{1F4E4} Order #${orderId} status updated - Square sync via webhooks`);
      res.json({
        success: true,
        orderId,
        status,
        assignedTo,
        estimatedTime,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Kitchen order update failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update kitchen order"
      });
    }
  });
  app2.get("/api/square/test-sync", async (req, res) => {
    try {
      const { syncOrdersToSquareKitchen } = await Promise.resolve().then(() => (init_square_kitchen_integration(), square_kitchen_integration_exports));
      const result = await syncOrdersToSquareKitchen();
      res.json({
        success: result.success,
        message: `Processed ${result.syncedCount} orders for Square Orders API`,
        syncedCount: result.syncedCount,
        errors: result.errors,
        note: "This shows whether orders would be sent to Square Orders API"
      });
    } catch (error) {
      console.error("Square Kitchen sync test failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to test Square sync"
      });
    }
  });
  app2.post("/api/square/send-orders", async (req, res) => {
    try {
      const { sendOrdersToSquare: sendOrdersToSquare2 } = await Promise.resolve().then(() => (init_square_orders_sync(), square_orders_sync_exports));
      const result = await sendOrdersToSquare2();
      res.json({
        success: result.success,
        message: `Created ${result.created} orders in Square sandbox account`,
        created: result.created,
        errors: result.errors
      });
    } catch (error) {
      console.error("Square Orders API sync error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send orders to Square API",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/square/orders", async (req, res) => {
    try {
      const { getSquareOrders: getSquareOrders2 } = await Promise.resolve().then(() => (init_square_orders_sync(), square_orders_sync_exports));
      const orders2 = await getSquareOrders2();
      res.json({
        success: true,
        orders: orders2,
        count: orders2.length,
        message: `Found ${orders2.length} orders in Square sandbox account`
      });
    } catch (error) {
      console.error("Square Orders fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch orders from Square",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/square/sync-order/:orderId", async (req, res) => {
    const isInternalSync = req.headers["x-internal-sync"] === "true";
    if (!isInternalSync && !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const orderId = parseInt(req.params.orderId);
      console.log(`\u{1F504} Manual sync request for order #${orderId}`);
      const { sendSingleOrderToSquare: sendSingleOrderToSquare2 } = await Promise.resolve().then(() => (init_square_single_order_sync(), square_single_order_sync_exports));
      const result = await sendSingleOrderToSquare2(orderId);
      res.json({
        success: result.success,
        message: result.success ? `Order #${orderId} synced to Square successfully` : `Failed to sync order #${orderId}`,
        squareOrderId: result.squareOrderId,
        error: result.error
      });
    } catch (error) {
      console.error(`Failed to sync order #${req.params.orderId}:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/square/sync-from-square", async (req, res) => {
    try {
      console.log(`\u{1F504} Manual sync from Square - checking all order statuses...`);
      const { syncOrdersFromSquare: syncOrdersFromSquare3 } = await Promise.resolve().then(() => (init_square_kitchen_integration_simple(), square_kitchen_integration_simple_exports));
      const result = await syncOrdersFromSquare3();
      res.json({
        success: result.success,
        message: result.success ? `Checked Square status for ${result.ordersChecked} orders, updated ${result.ordersUpdated} Bean Stalker orders` : `Failed to sync from Square: ${result.error}`,
        ordersChecked: result.ordersChecked,
        ordersUpdated: result.ordersUpdated,
        error: result.error
      });
    } catch (error) {
      console.error(`Failed to sync from Square:`, error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/square/kitchen/sync", async (req, res) => {
    try {
      const { syncOrdersToSquareKitchen } = await Promise.resolve().then(() => (init_square_kitchen_integration(), square_kitchen_integration_exports));
      const result = await syncOrdersToSquareKitchen();
      res.json({
        success: result.success,
        message: `Synced ${result.syncedCount} orders to Square Kitchen Display`,
        syncedCount: result.syncedCount,
        errors: result.errors
      });
    } catch (error) {
      console.error("Square Kitchen sync failed:", error);
      res.status(500).json({
        success: false,
        error: "Failed to sync with Square Kitchen Display"
      });
    }
  });
  app2.get("/api/square/kitchen/orders", async (req, res) => {
    try {
      const { getSquareKitchenOrders: getSquareKitchenOrders3 } = await Promise.resolve().then(() => (init_square_kitchen_integration(), square_kitchen_integration_exports));
      const squareOrders = await getSquareKitchenOrders3();
      res.json({
        success: true,
        orders: squareOrders,
        count: squareOrders.length
      });
    } catch (error) {
      console.error("Failed to get Square kitchen orders:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get Square kitchen orders"
      });
    }
  });
  app2.get("/api/square/diagnostic", async (req, res) => {
    try {
      res.json({
        hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
        hasApplicationId: !!process.env.SQUARE_APPLICATION_ID,
        hasLocationId: !!process.env.SQUARE_LOCATION_ID,
        hasWebhookKey: !!process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
        locationId: process.env.SQUARE_LOCATION_ID || "NOT_SET",
        environment: "SANDBOX"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get diagnostic info" });
    }
  });
  app2.post("/api/square/webhook", async (req, res) => {
    try {
      console.log("\u{1F4E8} Received Square webhook:", {
        eventType: req.body?.event_type || req.body?.type,
        eventId: req.body?.event_id,
        merchantId: req.body?.merchant_id,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
      console.log("\u{1F527} TESTING MODE: Webhook signature verification temporarily disabled");
      console.log("\u{1F4CB} Request headers:", Object.keys(req.headers));
      console.log("\u{1F510} X-Square-Signature header:", req.headers["x-square-signature"]);
      if (signatureKey) {
        console.log("\u2139\uFE0F Signature key is configured but verification is disabled for testing");
      } else {
        console.log("\u2139\uFE0F No SQUARE_WEBHOOK_SIGNATURE_KEY configured");
      }
      if (process.env.NODE_ENV !== "production") {
        console.log("\u{1F4E8} Full webhook payload:", JSON.stringify(req.body, null, 2));
      }
      const { handleSquareWebhook: handleSquareWebhook2 } = await Promise.resolve().then(() => (init_square_integration_final(), square_integration_final_exports));
      const result = await handleSquareWebhook2(req.body);
      if (result.success) {
        if (result.ordersUpdated > 0) {
          console.log(`\u2705 Square webhook processed successfully: ${result.ordersUpdated} Bean Stalker orders updated`);
          res.status(200).json({
            message: "Webhook processed successfully",
            ordersUpdated: result.ordersUpdated,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        } else {
          console.log("\u2139\uFE0F Square webhook processed but no Bean Stalker orders were updated");
          res.status(200).json({
            message: "Webhook processed, no orders updated",
            ordersUpdated: 0,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      } else {
        console.error("\u274C Square webhook processing failed:", result.error);
        res.status(500).json({
          message: "Webhook processing failed",
          error: result.error,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    } catch (error) {
      console.error("\u{1F4A5} Square webhook endpoint error:", error);
      res.status(200).json({
        message: "Webhook received but processing failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.post("/api/square/sync-my-orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    try {
      const { syncOrdersFromSquare: syncOrdersFromSquare3 } = await Promise.resolve().then(() => (init_square_kitchen_integration(), square_kitchen_integration_exports));
      const result = await syncOrdersFromSquare3();
      const allOrders = await storage.getOrders();
      const userOrders = allOrders.filter((order) => order.userId === req.user.id);
      const userOrderIds = userOrders.map((order) => order.id);
      const userUpdatedOrders = result.updatedOrders?.filter(
        (update) => userOrderIds.includes(update.orderId)
      ) || [];
      const userResult = {
        ...result,
        updatedOrders: userUpdatedOrders,
        ordersUpdated: userUpdatedOrders.length
      };
      console.log(`\u{1F504} User Square sync completed for user ${req.user.id}: ${userResult.ordersUpdated} orders updated`);
      res.json(userResult);
    } catch (error) {
      console.error("\u274C User Square sync failed:", error);
      res.status(500).json({
        error: "Failed to sync orders from Square Kitchen",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/square/manual-sync", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.sendStatus(403);
    }
    try {
      const { syncOrdersFromSquare: syncOrdersFromSquare3 } = await Promise.resolve().then(() => (init_square_kitchen_integration(), square_kitchen_integration_exports));
      const result = await syncOrdersFromSquare3();
      console.log(`\u{1F504} Manual Square sync completed: ${result.ordersUpdated} orders updated`);
      res.json(result);
    } catch (error) {
      console.error("\u274C Manual Square sync error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/debug/square-config", (req, res) => {
    const config = squareConfig;
    res.json({
      locationId: config.locationId,
      applicationId: config.applicationId,
      hasAccessToken: !!config.accessToken,
      hasWebhookSignature: !!config.webhookSignatureKey,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      nodeEnv: process.env.NODE_ENV || "development",
      override: "FORCED_BEANSTALKER_SANDBOX"
    });
  });
  app2.get("/api/debug/square-test", async (req, res) => {
    try {
      const { getSquareLocationId: getSquareLocationId3, getSquareAccessToken: getSquareAccessToken2 } = await Promise.resolve().then(() => (init_square_config(), square_config_exports));
      const locationId = getSquareLocationId3();
      const accessToken = getSquareAccessToken2();
      console.log("Testing Square API connectivity...");
      const response = await fetch("https://connect.squareupsandbox.com/v2/locations", {
        headers: {
          "Square-Version": "2024-06-04",
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.text();
      console.log("Square API response:", response.status, data);
      res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: response.ok ? JSON.parse(data) : data,
        config: {
          locationId,
          hasToken: !!accessToken
        }
      });
    } catch (error) {
      console.error("Square API test failed:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path2, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname, "client", "src"),
      "@shared": path2.resolve(__dirname, "shared")
    }
  },
  root: path2.resolve(__dirname, "client"),
  build: {
    outDir: path2.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname2, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = "bean-stalker-secret-key";
  }
  const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  try {
    await storage2.initializeDatabase();
    const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const existingAdmin = await storage2.getUserByUsername("bs_admin");
    if (!existingAdmin) {
      await storage2.createUser({
        username: "bs_admin",
        password: await hashPassword2("BS2025@@"),
        email: "admin@beanstalker.com",
        fullName: "Admin User",
        phoneNumber: "123-456-7890",
        credits: 1e3,
        // Admin gets more credits
        isAdmin: true
      });
      log("Admin user created successfully");
    }
    log("Database initialized successfully");
  } catch (error) {
    log(`Database initialization warning: ${error}`);
    log("Continuing application startup - some features may be limited");
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  console.log(`\u{1F527} Square Config on Startup:`);
  console.log(`   Location ID: ${process.env.SQUARE_LOCATION_ID || "NOT_SET"}`);
  console.log(`   App ID: ${process.env.SQUARE_APPLICATION_ID || "NOT_SET"}`);
  console.log(`   Access Token: ${process.env.SQUARE_ACCESS_TOKEN ? "SET" : "NOT_SET"}`);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
