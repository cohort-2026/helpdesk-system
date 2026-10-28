import { Router } from "express";
import {createTicket, fetchTickets} from "../controllers/ticketsController"

const router = Router()

router.get("/", fetchTickets)

router.post("/create", createTicket)

router.put("/update", createTicket)

router.delete("/delete", createTicket)

export default router