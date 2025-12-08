/**
 * Virtual Template Gallery
 * 
 * High-performance gallery with CSS Grid and pagination
 * Handles 2000+ templates with smooth filtering
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, X, ChevronLeft, Check,
    FileText, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../../application/store/settings-store';
import {
    filterTemplates,
    PREDEFINED_TAGS,
    TAG_COLORS,
    type TemplateConfig,
    type TagCategory
} from '../../cv-templates/factory/TemplateFactory';
import { DynamicTemplate } from '../../cv-templates/factory/DynamicTemplateRenderer';
import { useTranslation } from '../../hooks/useTranslation';

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_WIDTH = 280;
const CARD_HEIGHT = 420;
const ITEMS_PER_PAGE = 24; // Load 24 at a time

// ============================================================================
// TAG BADGE COMPONENT
// ============================================================================

interface TagBadgeProps {
    tag: { id: string; label: string; color: string };
    size?: 'sm' | 'md';
    onClick?: () => void;
    selected?: boolean;
}

const TagBadge: React.FC<TagBadgeProps> = ({ tag, size = 'sm', onClick, selected }) => (
    <button
        onClick={onClick}
        style={{
            padding: size === 'sm' ? '2px 8px' : '4px 12px',
            fontSize: size === 'sm' ? '10px' : '12px',
            fontWeight: 600,
            borderRadius: '12px',
            border: selected ? `2px solid ${tag.color}` : '1px solid transparent',
            backgroundColor: selected ? `${tag.color}30` : `${tag.color}20`,
            color: tag.color,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
        }}
    >
        {tag.label}
    </button>
);

// ============================================================================
// TEMPLATE CARD COMPONENT (Lightweight)
// ============================================================================

interface TemplateCardProps {
    config: TemplateConfig;
    onClick: () => void;
    isSelected: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = React.memo(({
    config,
    onClick,
    isSelected
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px' }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // ATS score color
    const atsColor = config.attributes.atsScore >= 80 ? '#22c55e' :
        config.attributes.atsScore >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <motion.div
            ref={cardRef}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            animate={{
                scale: isHovered ? 1.02 : 1,
                boxShadow: isHovered
                    ? '0 20px 40px rgba(0,0,0,0.3)'
                    : '0 4px 12px rgba(0,0,0,0.2)'
            }}
            style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                background: '#1e293b',
                border: isSelected ? '3px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)'
            }}
        >
            {/* Thumbnail Preview - Only render if visible */}
            <div style={{
                width: '100%',
                height: '280px',
                overflow: 'hidden',
                position: 'relative',
                background: '#fff'
            }}>
                {isVisible ? (
                    <div style={{
                        transform: 'scale(0.25)',
                        transformOrigin: 'top left',
                        width: '210mm',
                        height: '297mm',
                        pointerEvents: 'none'
                    }}>
                        <DynamicTemplate config={config} forceMode="modele" />
                    </div>
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af'
                    }}>
                        <FileText size={32} />
                    </div>
                )}

                {/* ATS Score Badge */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: atsColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <FileText size={12} />
                    ATS {config.attributes.atsScore}%
                </div>

                {/* New Badge */}
                {config.attributes.isNew && (
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'white'
                    }}>
                        NEW
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div style={{
                padding: '12px',
                height: 'calc(100% - 280px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <h3 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'white',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {config.name}
                </h3>

                {/* Tags */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    overflow: 'hidden',
                    maxHeight: '48px'
                }}>
                    {config.tags.slice(0, 4).map(tag => (
                        <TagBadge key={tag.id} tag={tag} size="sm" />
                    ))}
                    {config.tags.length > 4 && (
                        <span style={{
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.5)',
                            alignSelf: 'center'
                        }}>
                            +{config.tags.length - 4}
                        </span>
                    )}
                </div>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Check size={14} color="white" />
                </div>
            )}
        </motion.div>
    );
});

TemplateCard.displayName = 'TemplateCard';

// ============================================================================
// FILTER SIDEBAR
// ============================================================================

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    resultCount: number;
    t: (key: string) => string | string[];
}

interface FilterState {
    search: string;
    atsMin: number;
    tags: string[];
    categories: TagCategory[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    isOpen,
    onClose,
    filters,
    onFilterChange,
    resultCount,
    t
}) => {
    const tagsByCategory = useMemo(() => {
        const grouped: Record<TagCategory, typeof PREDEFINED_TAGS> = {
            ats: [],
            style: [],
            industry: [],
            experience: [],
            feature: [],
            region: []
        };

        PREDEFINED_TAGS.forEach(tag => {
            grouped[tag.category].push(tag);
        });

        return grouped;
    }, []);

    const toggleTag = (tagId: string) => {
        const newTags = filters.tags.includes(tagId)
            ? filters.tags.filter(t => t !== tagId)
            : [...filters.tags, tagId];
        onFilterChange({ ...filters, tags: newTags });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: -320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -320, opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '320px',
                        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                        borderRight: '1px solid rgba(255,255,255,0.1)',
                        overflowY: 'auto',
                        zIndex: 100,
                        padding: '24px'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }}>
                        <h2 style={{
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: 700,
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Filter size={20} />
                            Filtres
                        </h2>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Result Count */}
                    <div style={{
                        padding: '12px 16px',
                        background: 'rgba(139, 92, 246, 0.2)',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        color: '#c4b5fd',
                        fontSize: '14px',
                        fontWeight: 600
                    }}>
                        {resultCount.toLocaleString()} {t('templates.gallery.found')}
                    </div>

                    {/* Search */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                            {t('templates.gallery.search')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                                placeholder={t('templates.gallery.searchPlaceholder') as string}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 40px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    {/* ATS Score Slider */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{t('templates.gallery.atsMin')}</span>
                            <span style={{ color: '#22c55e' }}>{filters.atsMin}%</span>
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={filters.atsMin}
                            onChange={(e) => onFilterChange({ ...filters, atsMin: parseInt(e.target.value) })}
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* Tag Filters */}
                    {Object.entries(tagsByCategory).map(([category, tags]) => (
                        <div key={category} style={{ marginBottom: '20px' }}>
                            <label style={{
                                color: TAG_COLORS[category as TagCategory],
                                fontSize: '12px',
                                fontWeight: 600,
                                marginBottom: '8px',
                                display: 'block',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {t(`templates.gallery.categories.${category}`)}
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {tags.map(tag => (
                                    <TagBadge
                                        key={tag.id}
                                        tag={tag}
                                        size="md"
                                        selected={filters.tags.includes(tag.id)}
                                        onClick={() => toggleTag(tag.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Reset Button */}
                    <button
                        onClick={() => onFilterChange({ search: '', atsMin: 0, tags: [], categories: [] })}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'transparent',
                            color: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginTop: '16px'
                        }}
                    >
                        {t('templates.gallery.reset')}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const VirtualTemplateGallery: React.FC = () => {
    const navigate = useNavigate();
    const { setSelectedTemplate } = useSettingsStore();
    const { t } = useTranslation();

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filterOpen, setFilterOpen] = useState(true);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        atsMin: 0,
        tags: [],
        categories: []
    });

    // Filter templates
    const filteredTemplates = useMemo(() => {
        return filterTemplates({
            search: filters.search || undefined,
            atsMin: filters.atsMin || undefined,
            tags: filters.tags.length > 0 ? filters.tags : undefined
        });
    }, [filters]);

    // Templates to display (paginated)
    const displayedTemplates = useMemo(() => {
        return filteredTemplates.slice(0, visibleCount);
    }, [filteredTemplates, visibleCount]);

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [filters]);

    const handleSelect = useCallback((config: TemplateConfig) => {
        setSelectedId(config.id);
    }, []);

    const handleConfirm = useCallback(() => {
        if (selectedId) {
            // Save to store then navigate
            setSelectedTemplate(selectedId);
            navigate('/');
        }
    }, [selectedId, navigate, setSelectedTemplate]);

    const loadMore = useCallback(() => {
        setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredTemplates.length));
    }, [filteredTemplates.length]);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Filter Sidebar */}
            <FilterSidebar
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onFilterChange={setFilters}
                resultCount={filteredTemplates.length}
                t={t}
            />

            {/* Main Content */}
            <div style={{
                marginLeft: filterOpen ? '320px' : '0',
                transition: 'margin-left 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <ChevronLeft size={18} />
                            {t('templates.gallery.back')}
                        </button>

                        {!filterOpen && (
                            <button
                                onClick={() => setFilterOpen(true)}
                                style={{
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '1px solid rgba(139, 92, 246, 0.5)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    color: '#c4b5fd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Filter size={18} />
                                {t('templates.gallery.filters')}
                            </button>
                        )}

                        <h1 style={{
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 700,
                            margin: 0
                        }}>
                            {t('templates.gallery.title')}
                            <span style={{
                                fontSize: '14px',
                                color: 'rgba(255,255,255,0.5)',
                                fontWeight: 400,
                                marginLeft: '12px'
                            }}>
                                {displayedTemplates.length} / {filteredTemplates.length.toLocaleString()} {t('templates.gallery.displayed')}
                            </span>
                        </h1>
                    </div>

                    {selectedId && (
                        <button
                            onClick={handleConfirm}
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 24px',
                                cursor: 'pointer',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Check size={18} />
                            {t('templates.gallery.useTemplate')}
                        </button>
                    )}
                </div>

                {/* Grid */}
                <div style={{
                    flex: 1,
                    padding: '24px',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTH}px, 1fr))`,
                        gap: '16px',
                        maxWidth: '1600px',
                        margin: '0 auto',
                        justifyContent: 'center'
                    }}>
                        {displayedTemplates.map(config => (
                            <TemplateCard
                                key={config.id}
                                config={config}
                                onClick={() => handleSelect(config)}
                                isSelected={selectedId === config.id}
                            />
                        ))}
                    </div>

                    {/* Load More Button */}
                    {visibleCount < filteredTemplates.length && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '32px',
                            marginBottom: '48px'
                        }}>
                            <button
                                onClick={loadMore}
                                style={{
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    border: '1px solid rgba(139, 92, 246, 0.5)',
                                    borderRadius: '12px',
                                    padding: '16px 48px',
                                    cursor: 'pointer',
                                    color: '#c4b5fd',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <ChevronDown size={20} />
                                {t('templates.gallery.loadMore')} ({Math.min(ITEMS_PER_PAGE, filteredTemplates.length - visibleCount)} {t('templates.gallery.templatesUnit')})
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VirtualTemplateGallery;
