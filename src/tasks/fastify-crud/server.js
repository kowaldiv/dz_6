import fastify from "fastify";
import { Worker } from "worker_threads";

const db = {
  categories: [],
  products: [],
  users: [],
};

const categorySchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 50 },
      description: { type: "string", maxLength: 300 },
    },
  },
};

const productSchema = {
  body: {
    type: "object",
    required: ["name", "price", "categoryId"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 200 },
      price: { type: "number", minimum: 0.01 },
      categoryId: { type: "number", minimum: 0.01 },
      inStock: { type: "boolean" },
    },
  },
};

const userSchema = {
  body: {
    type: "object",
    required: ["name", "email"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100 },
      email: { type: "string", format: "email" },
      role: {
        type: "string",
        enum: ["customer", "admin"],
        default: "customer",
      },
    },
  },
};

const app = fastify({ logger: true });

app.get("/", async () => {
  return { message: "Server is running" };
});

app.get("/categories", async () => {
  return db.categories;
});

app.get("/categories/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const category = db.categories.find((c) => c.id === id);

  if (!category) {
    return res.status(404).send({ error: "Category not found" });
  }
  return category;
});

app.post("/categories", { schema: categorySchema }, async (req, res) => {
  const { name, description } = req.body;

  const newCategory = {
    id: +new Date(),
    name,
    description: description || "",
  };

  db.categories.push(newCategory);
  return res.status(201).send(newCategory);
});

app.put("/categories/:id", { schema: categorySchema }, async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;

  const index = db.categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).send({ error: "Category not found" });
  }

  db.categories[index] = {
    ...db.categories[index],
    name,
    description: description || "",
  };
  return res.status(200).send(db.categories[index]);
});

app.delete("/categories/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).send({ error: "Category not found" });
  }

  const hasProducts = db.products.some((product) => product.categoryId === id);
  if (hasProducts) {
    return res.status(400).send({ error: "Category has products" });
  }

  db.categories.splice(index, 1);
  return res.status(204).send();
});

app.get("/products", async (req, res) => {
  let filteredProducts = [...db.products];

  const { categoryId, inStock } = req.query;

  if (categoryId !== undefined) {
    const id = parseInt(categoryId);
    filteredProducts = filteredProducts.filter((product) => {
      return product.categoryId === id;
    });
  }

  if (inStock !== undefined) {
    const isInStock = inStock === "true";
    filteredProducts = filteredProducts.filter((product) => {
      return product.inStock === isInStock;
    });
  }

  return res.status(200).send(filteredProducts);
});

app.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const product = db.products.find((c) => c.id === id);

  if (!product) {
    return res.status(404).send({ error: "Product not found" });
  }
  return product;
});

app.post("/products", { schema: productSchema }, async (req, res) => {
  const { name, price, categoryId, inStock } = req.body;

  const existingCategory = db.categories.find(
    (category) => category.id === categoryId,
  );
  if (!existingCategory) {
    return res.status(404).send({ error: "Category not found" });
  }

  const newProduct = {
    id: +new Date(),
    name,
    price,
    categoryId,
    inStock: inStock || false,
  };

  db.products.push(newProduct);
  return res.status(201).send(newProduct);
});

app.put("/products/:id", { schema: productSchema }, async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price, categoryId, inStock } = req.body;

  const index = db.products.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).send({ error: "Product not found" });
  }

  const existingCategory = db.categories.find(
    (category) => category.id === categoryId,
  );
  if (!existingCategory) {
    return res.status(409).send({ error: "Category not found" });
  }

  db.products[index] = {
    ...db.products[index],
    name,
    price,
    categoryId,
    inStock: inStock || db.products[index].inStock,
  };
  return res.status(200).send(db.products[index]);
});

app.delete("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.products.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).send({ error: "Product not found" });
  }

  db.products.splice(index, 1);
  return res.status(204).send();
});

app.get("/users", async (req, res) => {
  let filteredUsers = [...db.users];

  const { role } = req.query;

  if (role !== undefined) {
    filteredUsers = filteredUsers.filter((user) => {
      return user.role === role;
    });
  }

  return res.status(200).send(filteredUsers);
});

app.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const user = db.users.find((c) => c.id === id);

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }
  return user;
});

app.post("/users", { schema: userSchema }, async (req, res) => {
  const { name, email, role } = req.body;

  const existingUser = db.users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(409).send({ error: "Email already exists" });
  }

  const newUser = {
    id: +new Date(),
    name,
    email,
    role: role || "customer",
    createdAt: +new Date(),
  };

  db.users.push(newUser);
  return res.status(201).send(newUser);
});

app.put("/users/:id", { schema: userSchema }, async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, role } = req.body;

  const index = db.users.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).send({ error: "User not found" });
  }

  db.users[index] = {
    ...db.users[index],
    name,
    email,
    role,
  };
  return res.status(200).send(db.users[index]);
});

app.delete("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const index = db.users.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).send({ error: "User not found" });
  }

  db.users.splice(index, 1);
  return res.status(204).send();
});

app.listen({ port: 3000 });
