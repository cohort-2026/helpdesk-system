import React, { useEffect, useRef, useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { Alert } from "./Alert";

interface DialogProps {
  ref: React.RefObject<HTMLDialogElement | null>;
}

export const Dialog = ({ ref }: DialogProps) => {
  const [error, setError] = useState("");
  const closeModal = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="m-auto max-w-xl rounded-lg bg-white p-6 shadow-lg backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4">
        <h2
          id="modalTitle"
          className="text-xl font-bold text-gray-900 sm:text-2xl"
        >
          Create New User
        </h2>
        {error && (
          <div style={{ marginBottom: "10px" }}>
            <Alert variant="error" description={error} />
          </div>
        )}
        <form className="flex flex-col gap-4">
          <div>
            <Input
              type="text"
              id="name"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
              placeholder="user's name"
              label="Name: "
            />
          </div>
          <div>
            <Input
              type="text"
              id="surname"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
              placeholder="user's surname"
              label="Surname: "
            />
          </div>
          <div>
            <Input
              type="email"
              id="email"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
              placeholder="user's email"
              label="Email: "
            />
          </div>
          <div>
            <Input
              type="text"
              id="role"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
              required
              placeholder="user's role"
              label="Role: "
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>

            <Button type="submit" variant="primary">
              Done
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
