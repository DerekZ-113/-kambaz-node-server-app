import PathParameters from "./PathParameters.js";
import QueryParameters from "./QueryParameters.js";
import WorkingWithArrays from "./WorkingWithArrays.js";
import WorkingWithObjects from "./WorkingWithObjects.js";
// Import cors but don't use it directly - we're already using it in the main app

function Lab5(app) {
    // Add this missing welcome route
    app.get("/lab5/welcome", (req, res) => {
        res.send("Welcome to Lab 5");
    });
  
    PathParameters(app);
    QueryParameters(app);
    WorkingWithObjects(app);
    WorkingWithArrays(app);
    app.get("/lab5", (req, res) => {
        res.send("Lab5 API");
    });
}

export default Lab5;
