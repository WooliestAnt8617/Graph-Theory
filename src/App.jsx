import { useState } from 'react'
import CampusTree from './components/CampusTree'
import TreeTraversals from './components/TreeTraversals'
import SpanningTree from './components/SpanningTree'
import MinSpanningTree from './components/MinSpanningTree'
import DistanceCalculator from './components/DistanceCalculator'

const TABS = [
  { id: 'tree', icon: '🌳', label: 'Campus Tree', component: CampusTree },
  { id: 'traversal', icon: '🔄', label: 'Tree Traversals', component: TreeTraversals },
  { id: 'spanning', icon: '🌐', label: 'Spanning Trees', component: SpanningTree },
  { id: 'mst', icon: '⚡', label: 'Minimum Spanning Tree', component: MinSpanningTree },
  { id: 'distance', icon: '📏', label: 'Distance Calculator', component: DistanceCalculator },
]

function App() {
  const [activeTab, setActiveTab] = useState('tree')
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <div className="app-logo">Graph Theory Explorer</div>
          <div className="app-subtitle">CHRIST (Deemed to be University) — Delhi NCR Campus</div>
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {ActiveComponent && <ActiveComponent />}
      </main>
    </div>
  )
}

export default App
