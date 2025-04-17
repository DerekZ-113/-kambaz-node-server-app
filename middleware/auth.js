// Authentication middleware functions

// Check if user is logged in
export const isAuthenticated = (req, res, next) => {
  if (!req.session.currentUser) {
    return res.status(401).json({ message: "You must be logged in" });
  }
  next();
};

// Check if user is faculty
export const isFaculty = (req, res, next) => {
  if (req.session.currentUser.role !== "FACULTY" && 
      req.session.currentUser.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// Check if user is a student
export const isStudent = (req, res, next) => {
  if (req.session.currentUser.role !== "STUDENT" && 
      req.session.currentUser.role !== "FACULTY" && 
      req.session.currentUser.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// Check specific user or admin
export const isUserOrAdmin = (req, res, next) => {
  const { userId } = req.params;
  if (!req.session.currentUser || 
      (req.session.currentUser._id !== userId && 
       req.session.currentUser.role !== "ADMIN")) {
    return res.status(403).json({ message: "Unauthorized access" });
  }
  next();
};