// SIMPLE VERSION - Only add the 2 critical changes to make inline editing work

// 1. Add these imports at top:
import { InlineEditorOverlay } from '../editor/InlineEditorOverlay';
import { MagicParticles } from '../editor/MagicParticles';

// 2. Add state for hover/cursor (around line 40):
const [isHovered, setIsHovered] = useState(false);
const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

// 3. Get the openEditor from useInlineEditor (around line 46):
const { openEditor } = useInlineEditor();

// 4. Add the double-click handler (around line 115):
const handleInlineDoubleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const editableEl = target.closest('[data-inline-edit]') as HTMLElement;

    if (!editableEl) return;

    const fieldKey = editableEl.getAttribute('data-inline-edit') || '';
    const label = editableEl.getAttribute('data-inline-label') || '';
    const required = editableEl.getAttribute('data-inline-required') === 'true';
    const removable = editableEl.getAttribute('data-inline-removable') === 'true';
    const currentValue = editableEl.textContent || '';

    const rect = editableEl.getBoundingClientRect();
    const position = {
        x: rect.left,
        y: rect.bottom + 8
    };

    openEditor({ fieldKey, label, required, removable }, currentValue, position);
}, [openEditor]);

// 5. On the CV container div, add onMouseEnter/Leave/Move for particles
onMouseEnter = {() => !isMobile && setIsHovered(true)}
onMouseLeave = {() => !isMobile && setIsHovered(false)}
onMouseMove = {(e) => {
    if (!isMobile) {
        setCursorPos({ x: e.clientX, y: e.clientY });
    }
}}

// 6. Inside the CV container, add MagicParticles:
{ !isMobile && isHovered && <MagicParticles cursor={cursorPos} /> }

// 7. On the CV div (with cvRef), add onDoubleClick:
<div
    ref={cvRef}
    onDoubleClick={handleInlineDoubleClick}  // <-- ADD THIS LINE
    ...other props
>

// 8. After CV div, add InlineEditorOverlay:
    {/* INLINE EDITOR OVERLAY */}
    <InlineEditorOverlay />

// 9. In the <style> section, add hover CSS:
        /* Hover effect for editable elements */
        [data-inline-edit]:hover {
            outline: 2px solid rgba(139, 92, 246, 0.4);
        outline-offset: 2px;
        background-color: rgba(139, 92, 246, 0.05);
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.2s ease;
}

        [data-inline-edit] {
            transition: all 0.2s ease;
}
