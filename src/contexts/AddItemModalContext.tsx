"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AddItemModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AddItemModalContext = createContext<AddItemModalContextType | undefined>(
  undefined
);

export function AddItemModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <AddItemModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </AddItemModalContext.Provider>
  );
}

export function useAddItemModal() {
  const context = useContext(AddItemModalContext);
  if (context === undefined) {
    throw new Error(
      "useAddItemModal must be used within an AddItemModalProvider"
    );
  }
  return context;
}

