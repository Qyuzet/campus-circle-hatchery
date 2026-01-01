"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

interface TableData {
  headers: string[];
  rows: string[][];
}

interface TableBlockProps {
  data?: TableData;
  onUpdate: (data: TableData) => void;
}

export function TableBlock({ data, onUpdate }: TableBlockProps) {
  const [tableData, setTableData] = useState<TableData>(
    data || {
      headers: ["Column 1", "Column 2", "Column 3"],
      rows: [
        ["", "", ""],
        ["", "", ""],
      ],
    }
  );

  const updateData = (newData: TableData) => {
    setTableData(newData);
    onUpdate(newData);
  };

  const addColumn = () => {
    const newData = {
      headers: [...tableData.headers, `Column ${tableData.headers.length + 1}`],
      rows: tableData.rows.map((row) => [...row, ""]),
    };
    updateData(newData);
  };

  const removeColumn = (index: number) => {
    if (tableData.headers.length <= 1) return;
    const newData = {
      headers: tableData.headers.filter((_, i) => i !== index),
      rows: tableData.rows.map((row) => row.filter((_, i) => i !== index)),
    };
    updateData(newData);
  };

  const addRow = () => {
    const newData = {
      ...tableData,
      rows: [...tableData.rows, new Array(tableData.headers.length).fill("")],
    };
    updateData(newData);
  };

  const removeRow = (index: number) => {
    if (tableData.rows.length <= 1) return;
    const newData = {
      ...tableData,
      rows: tableData.rows.filter((_, i) => i !== index),
    };
    updateData(newData);
  };

  const updateHeader = (index: number, value: string) => {
    const newData = {
      ...tableData,
      headers: tableData.headers.map((h, i) => (i === index ? value : h)),
    };
    updateData(newData);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = {
      ...tableData,
      rows: tableData.rows.map((row, ri) =>
        ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : row
      ),
    };
    updateData(newData);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {tableData.headers.map((header, index) => (
                <th key={index} className="relative group">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(index, e.target.value)}
                    className="w-full px-3 py-2 font-medium text-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeColumn(index)}
                    className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                    title="Remove column"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </th>
              ))}
              <th className="w-10 bg-gray-100">
                <button
                  onClick={addColumn}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Add column"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group border-t border-gray-200">
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border-r border-gray-200 last:border-r-0">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="w-full px-3 py-2 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Empty"
                    />
                  </td>
                ))}
                <td className="w-10 bg-gray-50">
                  <button
                    onClick={() => removeRow(rowIndex)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                    title="Remove row"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 bg-gray-50 p-2">
        <button
          onClick={addRow}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add row
        </button>
      </div>
    </div>
  );
}

