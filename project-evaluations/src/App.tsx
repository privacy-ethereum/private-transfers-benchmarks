import { useState } from "react";

import { useEvaluationsData } from "./data/utils.js";
import AddModal from "./components/AddModal.js";
import ProtocolDetail from "./components/ProtocolDetail.js";
import Sidebar from "./components/Sidebar.js";

export default function App() {
  const { evaluations, setEvaluations, selectedId, setSelectedId, addEvaluation } = useEvaluationsData();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <header className="shrink-0 border-b border-gray-800 px-6 py-3 bg-gray-950">
        <p className="text-xs text-gray-500">
          Evaluating <span className="text-gray-300 font-medium">{evaluations.length}</span> protocol
          {evaluations.length !== 1 ? "s" : ""}
        </p>
      </header>

      <div className="flex flex-1 min-h-0">
        <Sidebar
          evaluations={evaluations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={() => {
            setShowAddModal(true);
          }}
          setEvaluations={setEvaluations}
          setSelectedId={setSelectedId}
        />
        <main className="flex-1 flex flex-col min-h-0 bg-gray-950">
          <ProtocolDetail
            evaluations={evaluations}
            selectedId={selectedId}
            setEvaluations={setEvaluations}
            setSelectedId={setSelectedId}
          />
        </main>
      </div>

      {showAddModal && (
        <AddModal
          onClose={() => {
            setShowAddModal(false);
          }}
          addEvaluation={addEvaluation}
        />
      )}
    </div>
  );
}
