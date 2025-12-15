/**
 * NEXAL Platform - Design Inspector
 * 
 * Debug tool for inspecting design resolution and rendering.
 */

import React, { useState } from 'react';
import { useDesignSpec } from '../hooks/useDesignSpec';
import { type DesignSpec } from '../spec/DesignSpec';
import { type ComputedDesign } from '../resolver/StyleResolver';
import { getAllPacks } from '../packs/PresetPacks';

// ============================================================================
// INSPECTOR COMPONENT
// ============================================================================

interface InspectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DesignInspector({ isOpen, onClose }: InspectorProps) {
    const { spec, computed, history, canUndo, canRedo, undo, redo } = useDesignSpec();
    const [activeTab, setActiveTab] = useState<'spec' | 'computed' | 'history' | 'packs'>('spec');

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            height: '100vh',
            backgroundColor: '#1F2937',
            color: '#F3F4F6',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid #374151',
            }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>🔍 Design Inspector</span>
                <button onClick={onClose} style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    fontSize: '18px',
                }}>×</button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #374151',
            }}>
                {(['spec', 'computed', 'history', 'packs'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: activeTab === tab ? '#374151' : 'transparent',
                            border: 'none',
                            color: activeTab === tab ? '#F3F4F6' : '#9CA3AF',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Undo/Redo */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '8px 16px',
                borderBottom: '1px solid #374151',
            }}>
                <button
                    onClick={() => undo()}
                    disabled={!canUndo}
                    style={{
                        flex: 1,
                        padding: '6px',
                        background: canUndo ? '#4F46E5' : '#374151',
                        border: 'none',
                        borderRadius: '4px',
                        color: canUndo ? '#FFF' : '#6B7280',
                        cursor: canUndo ? 'pointer' : 'not-allowed',
                    }}
                >
                    ↩ Undo
                </button>
                <button
                    onClick={() => redo()}
                    disabled={!canRedo}
                    style={{
                        flex: 1,
                        padding: '6px',
                        background: canRedo ? '#4F46E5' : '#374151',
                        border: 'none',
                        borderRadius: '4px',
                        color: canRedo ? '#FFF' : '#6B7280',
                        cursor: canRedo ? 'pointer' : 'not-allowed',
                    }}
                >
                    Redo ↪
                </button>
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px',
            }}>
                {activeTab === 'spec' && <SpecView spec={spec} />}
                {activeTab === 'computed' && <ComputedView computed={computed} />}
                {activeTab === 'history' && <HistoryView history={history} />}
                {activeTab === 'packs' && <PacksView />}
            </div>
        </div>
    );
}

// ============================================================================
// TAB VIEWS
// ============================================================================

function SpecView({ spec }: { spec: DesignSpec }) {
    return (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(spec, null, 2)}
        </pre>
    );
}

function ComputedView({ computed }: { computed: ComputedDesign }) {
    return (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(computed, null, 2)}
        </pre>
    );
}

function HistoryView({ history }: { history: readonly any[] }) {
    if (history.length === 0) {
        return <div style={{ color: '#6B7280' }}>No history yet</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.slice().reverse().map((patch, i) => (
                <div key={patch.id} style={{
                    padding: '8px',
                    background: '#374151',
                    borderRadius: '4px',
                }}>
                    <div style={{ color: '#9CA3AF', fontSize: '10px' }}>
                        {new Date(patch.timestamp).toLocaleTimeString()}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>{patch.path}</div>
                    <div style={{ color: '#10B981' }}>
                        → {JSON.stringify(patch.value)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function PacksView() {
    const packs = getAllPacks();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {packs.map(pack => (
                <div key={pack.id} style={{
                    padding: '12px',
                    background: '#374151',
                    borderRadius: '4px',
                    borderLeft: `4px solid ${pack.spec.tokens?.colors?.accent || '#4F46E5'}`,
                }}>
                    <div style={{ fontWeight: 'bold' }}>{pack.metadata.name}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '10px' }}>
                        v{pack.version} • {pack.metadata.tags.join(', ')}
                    </div>
                    {pack.metadata.description && (
                        <div style={{ marginTop: '4px', fontSize: '11px' }}>
                            {pack.metadata.description}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// HOOK FOR INSPECTOR
// ============================================================================

export function useInspector() {
    const [isOpen, setIsOpen] = useState(false);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(!isOpen),
    };
}
