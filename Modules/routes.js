import * as modulesDao from "./dao.js";

export default function ModuleRoutes(app) {
  app.put("/api/modules/:moduleId", async (req, res) => {
    const { moduleId } = req.params;
    const moduleUpdates = req.body;
    const status = await modulesDao.updateModule(moduleId, moduleUpdates);
    res.send(status);
  });

  app.delete("/api/modules/:moduleId", async (req, res) => {
    try {
      const { moduleId } = req.params;
      await modulesDao.deleteModule(moduleId);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting module:", error);
      res.status(500).send(error.message);
    }
  });
}

