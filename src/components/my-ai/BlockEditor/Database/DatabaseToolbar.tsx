"use client";

import { useState } from "react";
import { Database, DatabaseView, DatabaseProperty } from "@/types/database";
import {
  Table,
  Columns,
  LayoutGrid,
  LayoutList,
  Rss,
  Calendar,
  Plus,
  Settings,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PropertyEditor } from "./PropertyEditor";
import { ViewEditor } from "./ViewEditor";
import { DatabaseSettings } from "./DatabaseSettings";

interface DatabaseToolbarProps {
  database: Database;
  currentView?: DatabaseView;
  onViewChange: (viewId: string) => void;
  onAddView: (view: DatabaseView) => void;
  onUpdateView: (viewId: string, updates: Partial<DatabaseView>) => void;
  onDeleteView: (viewId: string) => void;
  onAddProperty: (property: DatabaseProperty) => void;
  onUpdateProperty: (propertyId: string, updates: any) => void;
  onDeleteProperty: (propertyId: string) => void;
  onUpdateDatabase: (updates: Partial<Database>) => void;
}

const viewIcons = {
  table: Table,
  board: Columns,
  gallery: LayoutGrid,
  list: LayoutList,
  feed: Rss,
  calendar: Calendar,
};

export function DatabaseToolbar({
  database,
  currentView,
  onViewChange,
  onAddView,
  onUpdateView,
  onDeleteView,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onUpdateDatabase,
}: DatabaseToolbarProps) {
  const [propertyEditorOpen, setPropertyEditorOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<
    DatabaseProperty | undefined
  >();
  const [viewEditorOpen, setViewEditorOpen] = useState(false);
  const [editingView, setEditingView] = useState<DatabaseView | undefined>();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const ViewIcon = currentView ? viewIcons[currentView.type] : Table;

  const handleAddProperty = () => {
    setEditingProperty(undefined);
    setPropertyEditorOpen(true);
  };

  const handleEditProperty = (property: DatabaseProperty) => {
    setEditingProperty(property);
    setPropertyEditorOpen(true);
  };

  const handleSaveProperty = (property: DatabaseProperty) => {
    if (editingProperty) {
      onUpdateProperty(property.id, property);
    } else {
      onAddProperty(property);
    }
  };

  const handleAddView = () => {
    setEditingView(undefined);
    setViewEditorOpen(true);
  };

  const handleEditView = (view: DatabaseView) => {
    setEditingView(view);
    setViewEditorOpen(true);
  };

  const handleSaveView = (view: DatabaseView) => {
    if (editingView) {
      onUpdateView(view.id, view);
    } else {
      onAddView(view);
    }
  };

  return (
    <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 flex items-center justify-between relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={database.name}
          onChange={(e) => {
            onUpdateDatabase({ name: e.target.value });
          }}
          className="text-sm font-medium text-gray-700 bg-transparent border-0 focus:outline-none focus:ring-0 px-0"
          placeholder="Untitled Database"
        />
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
              <ViewIcon className="h-4 w-4" />
              <span className="text-sm">{currentView?.name || "View"}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={5}>
            {database.views.map((view) => {
              const Icon = viewIcons[view.type];
              return (
                <div
                  key={view.id}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded-sm"
                >
                  <button
                    onClick={() => onViewChange(view.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{view.name}</span>
                    {view.id === database.currentViewId && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditView(view)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit className="h-3 w-3 text-gray-600" />
                    </button>
                    {database.views.length > 1 && (
                      <button
                        onClick={() => onDeleteView(view.id)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleAddView}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          className="flex items-center justify-center h-8 w-8 text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <PropertyEditor
        property={editingProperty}
        open={propertyEditorOpen}
        onClose={() => setPropertyEditorOpen(false)}
        onSave={handleSaveProperty}
      />

      <ViewEditor
        view={editingView}
        open={viewEditorOpen}
        onClose={() => setViewEditorOpen(false)}
        onSave={handleSaveView}
      />

      <DatabaseSettings
        database={database}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUpdate={onUpdateDatabase}
      />
    </div>
  );
}
