import { createUser, findByUserName, loginUser } from "../services/users.js";

export function userRoutes(app) {
  app.post("/api/v1/user/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const checkUser = await findByUserName(username);
      if (checkUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const newUser = await createUser({ username, email, password });
      // Strip passwordHash before sending response
      const { passwordHash, ...safeUser } = newUser.toObject();
      res.status(201).json(safeUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/v1/user/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await loginUser(username, password);
      if (!result.ok) {
        return res.status(401).json({ error: result.message });
      }
      res.json({ user: result.user, token: result.token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Additional user-related routes can be added here
  app.get("/api/v1/user/:id", async (req, res) => {
    try {
      const username = req.params.id;
      const user = await findByUserName(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
