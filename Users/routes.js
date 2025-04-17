import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";

export default function UserRoutes(app) {
  const createUser = async (req, res) => {
    try {
      // Remove _id if present to prevent conflicts with MongoDB
      const { _id, ...userWithoutId } = req.body;
      const newUser = await dao.createUser(userWithoutId);
      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ 
        message: "Error creating user", 
        error: process.env.NODE_ENV === "development" ? error.message : undefined 
      });
    }
  };

  const deleteUser = async (req, res) => {
    const status = await dao.deleteUser(req.params.userId);
    res.json(status);
  };

  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;

    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }

    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }

    const users = await dao.findAllUsers();
    res.json(users);
  };

  const findUserById = async (req, res) => {
    const { userId } = req.params;
    
    try {
      const user = await dao.findUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }
      
      res.json(user);
    } catch (error) {
      console.error(`Error in findUserById route:`, error);
      res.status(500).json({ 
        message: "Error retrieving user", 
        error: process.env.NODE_ENV === "development" ? error.message : undefined 
      });
    }
  };

  const findCoursesForUser = async (req, res) => {
    console.log("Session in findCoursesForUser:", req.session);
    console.log("Current user in session:", req.session.currentUser);
    
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      console.log("No currentUser in session for /api/users/:uid/courses");
      res.status(401).json({ message: "Unauthorized - You need to sign in" });
      return;
    }
    
    if (currentUser.role === "ADMIN") {
      const courses = await courseDao.findAllCourses();
      res.json(courses);
      return;
    }
    
    let { uid } = req.params;
    if (uid === "current") {
      uid = currentUser._id;
    }
    
    const courses = await enrollmentsDao.findCoursesForUser(uid);
    res.json(courses);
  };

  const enrollUserInCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
    res.send(status);
  };

  const unenrollUserFromCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    res.send(status);
  };

  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    await dao.updateUser(userId, userUpdates);
    const currentUser = req.session["currentUser"];
    if (currentUser && currentUser._id === userId) {
      req.session["currentUser"] = { ...currentUser, ...userUpdates };
    }
    res.json(currentUser);
  };

  const signup = async (req, res) => { 
    try {
      const user = await dao.findUserByUsername(req.body.username);
      if (user) {
        res.status(400).json({ message: "Username already taken" });
        return;
      }
      
      // Validate role selection - ensure only valid roles can be selected
      const role = req.body.role && ["STUDENT", "FACULTY"].includes(req.body.role) 
        ? req.body.role 
        : "STUDENT"; // Default to STUDENT if no valid role provided
      
      const newUser = {
        ...req.body,
        role
      };
      
      const currentUser = await dao.createUser(newUser);
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Error during signup", error: error.message });
    }
  };

  const signin = async (req, res) => {    
    const { username, password } = req.body;
    const currentUser = await dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };

  const signout = async (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };

  const profile = async (req, res) => {    
    console.log("Session in profile endpoint:", req.session);
    console.log("Current user in session:", req.session.currentUser);
    
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      console.log("No currentUser in session for /api/users/profile");
      res.status(401).json({ message: "Unauthorized - You need to sign in" });
      return;
    }
    res.json(currentUser);
  };

  const createCourse = async (req, res) => {
    const currentUser = req.session["currentUser"];
    const newCourse = await courseDao.createCourse(req.body);
    await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
  app.get("/api/users/:uid/courses", findCoursesForUser);
  app.post("/api/users/current/courses", createCourse);
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`Sign-in attempt for user: ${username}`);
      
      // Use the dao function instead of direct model access
      const user = await dao.findUserByUsername(username);
      
      if (!user) {
        console.log(`User not found: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log(`User found: ${user.username}, comparing passwords...`);
      console.log(`DB password: ${user.password.substring(0,3)}***, Input password: ${password.substring(0,3)}***`);
      
      // Basic password comparison
      if (user.password !== password) {
        console.log(`Password mismatch for user: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Success - set the session
      console.log(`Authentication successful for: ${username}`);
      req.session.currentUser = user;
      
      // Log session info
      console.log(`Session ID: ${req.sessionID}`);
      console.log(`Session data:`, req.session);
      
      // Remove password before sending response
      const { password: _, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Sign-in error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);

  // Add a test endpoint to create a user
  app.get("/api/users/create-test", async (req, res) => {
    try {
      // Check if test user already exists
      const existing = await dao.findUserByUsername("test");
      
      if (existing) {
        return res.json({ 
          message: "Test user already exists", 
          user: { username: existing.username, _id: existing._id } 
        });
      }
      
      // Create test user
      const testUser = await dao.createUser({
        username: "test",
        password: "test",
        firstName: "Test",
        lastName: "User",
        role: "FACULTY"
      });
      
      res.json({ 
        message: "Test user created", 
        user: { username: testUser.username, _id: testUser._id } 
      });
    } catch (error) {
      console.error("Error creating test user:", error);
      res.status(500).json({ message: error.message });
    }
  });
}
