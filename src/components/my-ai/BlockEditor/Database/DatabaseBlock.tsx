"use client";

import { useState } from "react";
import { Database, DatabaseView, DatabaseViewType } from "@/types/database";
import { DatabaseToolbar } from "./DatabaseToolbar";
import { TableView } from "./views/TableView";
import { BoardView } from "./views/BoardView";
import { GalleryView } from "./views/GalleryView";
import { ListView } from "./views/ListView";
import { FeedView } from "./views/FeedView";
import { CalendarView } from "./views/CalendarView";

interface DatabaseBlockProps {
  database: Database;
  onChange: (database: Database) => void;
}

export function DatabaseBlock({ database, onChange }: DatabaseBlockProps) {
  const currentView = database.views.find(
    (v) => v.id === database.currentViewId
  );

  const handleViewChange = (viewId: string) => {
    onChange({
      ...database,
      currentViewId: viewId,
    });
  };

  const handleAddItem = () => {
    const newItem = {
      id: Math.random().toString(36).substring(2, 15),
      properties: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onChange({
      ...database,
      items: [...database.items, newItem],
    });
  };

  const handleUpdateItem = (
    itemId: string,
    properties: Record<string, any>
  ) => {
    onChange({
      ...database,
      items: database.items.map((item) =>
        item.id === itemId
          ? { ...item, properties, updatedAt: new Date().toISOString() }
          : item
      ),
    });
  };

  const handleDeleteItem = (itemId: string) => {
    onChange({
      ...database,
      items: database.items.filter((item) => item.id !== itemId),
    });
  };

  const handleAddProperty = (property: any) => {
    onChange({
      ...database,
      properties: [...database.properties, property],
    });
  };

  const handleUpdateProperty = (propertyId: string, updates: any) => {
    onChange({
      ...database,
      properties: database.properties.map((prop) =>
        prop.id === propertyId ? { ...prop, ...updates } : prop
      ),
    });
  };

  const handleDeleteProperty = (propertyId: string) => {
    onChange({
      ...database,
      properties: database.properties.filter((prop) => prop.id !== propertyId),
      items: database.items.map((item) => {
        const newProperties = { ...item.properties };
        delete newProperties[propertyId];
        return { ...item, properties: newProperties };
      }),
    });
  };

  const renderView = () => {
    if (!currentView) return null;

    const viewProps = {
      database,
      onAddItem: handleAddItem,
      onUpdateItem: handleUpdateItem,
      onDeleteItem: handleDeleteItem,
      onAddProperty: handleAddProperty,
      onUpdateProperty: handleUpdateProperty,
      onDeleteProperty: handleDeleteProperty,
    };

    switch (currentView.type) {
      case "table":
        return <TableView {...viewProps} />;
      case "board":
        return <BoardView {...viewProps} />;
      case "gallery":
        return <GalleryView {...viewProps} />;
      case "list":
        return <ListView {...viewProps} />;
      case "feed":
        return <FeedView {...viewProps} />;
      case "calendar":
        return <CalendarView {...viewProps} />;
      default:
        return null;
    }
  };

  const handleUpdateDatabase = (updates: Partial<Database>) => {
    onChange({
      ...database,
      ...updates,
    });
  };

  const handleAddView = (view: DatabaseView) => {
    onChange({
      ...database,
      views: [...database.views, view],
      currentViewId: view.id,
    });
  };

  const handleUpdateView = (viewId: string, updates: Partial<DatabaseView>) => {
    onChange({
      ...database,
      views: database.views.map((view) =>
        view.id === viewId ? { ...view, ...updates } : view
      ),
    });
  };

  const handleDeleteView = (viewId: string) => {
    const remainingViews = database.views.filter((view) => view.id !== viewId);
    onChange({
      ...database,
      views: remainingViews,
      currentViewId:
        database.currentViewId === viewId
          ? remainingViews[0]?.id
          : database.currentViewId,
    });
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-visible relative">
      <DatabaseToolbar
        database={database}
        currentView={currentView}
        onViewChange={handleViewChange}
        onAddView={handleAddView}
        onUpdateView={handleUpdateView}
        onDeleteView={handleDeleteView}
        onAddProperty={handleAddProperty}
        onUpdateProperty={handleUpdateProperty}
        onDeleteProperty={handleDeleteProperty}
        onUpdateDatabase={handleUpdateDatabase}
      />
      <div className="bg-white overflow-hidden rounded-b-lg relative z-0">
        {renderView()}
      </div>
    </div>
  );
}
