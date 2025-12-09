import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:4200", // URL do Angular
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Conectar ao MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI, { dbName: "todo" })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.log("Erro na conexão:", err.message));

// ----------------------
// 📌 Modelo Task
// ----------------------
const taskSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, minlength: 2 },
    descricao: { type: String, default: "", trim: true },
    concluida: { type: Boolean, default: false },
    prazo: { type: Date, required: false },
  },
  { collection: "tasks", timestamps: true }
);

const Task = mongoose.model("Task", taskSchema, "tasks");

// ----------------------
// 📌 Rota inicial
// ----------------------
app.get("/", (req, res) => res.json({ msg: "API ToDo rodando" }));

// ----------------------
// 📌 Criar tarefa  
// ----------------------
app.post("/tasks", async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------
// 📌 Listar tarefas
// ----------------------
app.get("/tasks", async (_, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

// ----------------------
// 📌 Buscar tarefa por ID
// ----------------------
app.get("/tasks/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// 📌 Atualizar tarefa (PUT – substitui tudo)
// ----------------------
app.put("/tasks/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      overwrite: true,
    });

    if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------
// 📌 Editar parcialmente (PATCH)
// ----------------------
app.patch("/tasks/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ----------------------
// 📌 Deletar tarefa
// ----------------------
app.delete("/tasks/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// 📌 Iniciar servidor
// ----------------------
app.listen(process.env.PORT, () =>
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`)
);