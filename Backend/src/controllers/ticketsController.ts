import { Request, Response, NextFunction } from "express";

export const createTicket = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "create ticket" });
};

export const updateTicket = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "update ticket" });
};

export const deleteTicket = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "delete ticket" });
};

export const fetchTickets = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "fetch tickets" });
};
