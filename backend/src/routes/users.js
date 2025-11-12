import { createUser , findByUserName } from "../services/users.js";

export function userRoutes(app) {
  app.post("/api/v1/user/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const newUser = await createUser({ username, email, password });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
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
