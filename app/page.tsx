"use client";

import { useState } from "react";
import { AutocompleteWidget } from "@ts4nfdi/terminology-service-suite";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const API = "https://semanticlookup.zbmed.de/ols/api/";
const COLUMNS = ["Elementtyp", "Element", "Wert", "Werttyp", "VokabularKlasse"] as const;
const NUM_ROWS = 37;

type ColName = (typeof COLUMNS)[number];
type SelectedTerm = { label: string; iri?: string; type?: string; ontology_name?: string };
type CellKey = `${number}-${ColName}`;
type CellState = Record<CellKey, SelectedTerm[]>;

function DataGrid() {
  const [cells, setCells] = useState<CellState>({} as CellState);

  const handleChange = (row: number, col: ColName) => (terms: SelectedTerm[]) => {
    const key: CellKey = `${row}-${col}`;
    setCells((prev) => ({ ...prev, [key]: terms }));
  };

  const rows = Array.from({ length: NUM_ROWS }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-screen-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
            Max Rubner-Institut
          </p>
          <h1 className="text-2xl font-bold text-gray-800">Daten-Aufnahme</h1>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-auto shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="w-12 px-3 py-3 text-center text-xs font-semibold text-gray-500 border-r border-gray-200 sticky left-0 bg-gray-100 z-10">
                  #
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0 min-w-[220px]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row}
                  className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                >
                  {/* Row number */}
                  <td className="px-3 py-2 text-center text-xs text-gray-400 font-mono border-r border-gray-100 sticky left-0 bg-white">
                    {row + 1}
                  </td>

                  {/* One AutocompleteWidget per cell */}
                  {COLUMNS.map((col) => {
                    const key: CellKey = `${row}-${col}`;
                    const selected = cells[key] ?? [];
                    return (
                      <td
                        key={col}
                        className="px-2 py-1.5 border-r border-gray-100 last:border-r-0 align-top"
                      >
                        <AutocompleteWidget
                          api={API}
                          selectionChangedEvent={handleChange(row, col)}
                          placeholder={col}
                        />
                        {selected.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {selected.map((t, i) => (
                              <span
                                key={i}
                                className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                                title={t.iri}
                              >
                                {t.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setCells({} as CellState)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Zurücksetzen
          </button>
          <button
            type="button"
            onClick={() => {
              const rows = Array.from({ length: NUM_ROWS }, (_, row) => {
                const entry: Record<string, SelectedTerm[]> = {};
                for (const col of COLUMNS) {
                  entry[col] = cells[`${row}-${col}` as CellKey] ?? [];
                }
                return { Zeile: row + 1, ...entry };
              });
              const blob = new Blob([JSON.stringify(rows, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `daten-aufnahme-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Daten exportieren (.json)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataGrid />
    </QueryClientProvider>
  );
}
