import { Router } from "express";
import {
  createTicket,
  fetchTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  assignTicket
} from "../controllers/ticketsController";
import { requireAuth } from "../middleware/authMiddlware";

const router = Router();

// All ticket routes require authentication
router.use(requireAuth);

// Create a new ticket
router.post("/create", createTicket);

// Retrieve list of tickets with filtering & pagination
router.get("/", fetchTickets);

// Assign (or self-assign / claim) ticket
router.put("/:id/assign", assignTicket);

// Retrieve details of a specific ticket
router.get("/:id", getTicketById);

// Update ticket details or status
router.put("/update/:id", updateTicket);

// Delete or soft-delete a ticket
router.delete("/delete/:id", deleteTicket);

export default router;