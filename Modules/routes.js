import * as modulesDao from "./dao.js";

export default function ModuleRoutes(app) {
  app.put("/api/modules/:moduleId", (req, res) => {
    try {
      const { moduleId } = req.params;
      const moduleUpdates = req.body;
      const updatedModule = modulesDao.updateModule(moduleId, moduleUpdates);
      
      if (!updatedModule) {
        return res.status(404).send("Module not found");
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Error updating module:", error);
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/modules/:moduleId", (req, res) => {
    const { moduleId } = req.params;
    modulesDao.deleteModule(moduleId);
    res.sendStatus(204);
  });
}

