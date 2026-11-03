import { Router } from "express";
import {
  createTicket,
  fetchTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} from "../controllers/ticketsController";
import { requireAuth } from "../middleware/authMiddlware";

const router = Router();

// All ticket routes require authentication
router.use(requireAuth);

// Create a new ticket
router.post("/", createTicket);
router.post("/create", createTicket); // Backward-compatibility

// Retrieve list of tickets with filtering & pagination
router.get("/", fetchTickets);

// Retrieve details of a specific ticket
router.get("/:id", getTicketById);

// Update ticket details or status
router.put("/update/:id", updateTicket); // Backward-compatibility
router.put("/update", updateTicket); // Backward-compatibility
router.put("/:id", updateTicket);
router.patch("/:id", updateTicket);

// Delete or soft-delete a ticket
router.delete("/delete/:id", deleteTicket); // Backward-compatibility
router.delete("/delete", deleteTicket); // Backward-compatibility
router.delete("/:id", deleteTicket);

export default router;