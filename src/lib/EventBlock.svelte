<script>
  let { event, startHour, endHour, dayIndex, hasOverlap = false,
        onUpdateEvent, onDeleteEvent, onContextMenu, onDragStart } = $props();

  let isEditing = $state(false);
  let editText = $state('');
  let inputEl = $state(null);
  let isResizing = $state(false);
  let resizeEdge = $state(null);

  let hourHeight = $derived(
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height'))
  );

  let top = $derived((event.startHour - startHour) * hourHeight);
  let height = $derived(Math.max(event.duration * hourHeight, 20));

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  function handleDoubleClick(e) {
    e.stopPropagation();
    isEditing = true;
    editText = event.title;
    requestAnimationFrame(() => {
      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      }
    });
  }

  function commitEdit() {
    if (editText.trim()) {
      onUpdateEvent(event.id, { title: editText.trim() });
    }
    isEditing = false;
  }

  function handleEditKeydown(e) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') isEditing = false;
  }

  function handleRightClick(e) {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu({
      x: e.clientX,
      y: e.clientY,
      eventId: event.id,
      color: event.color,
    });
  }

  function handleDragStart(e) {
    if (isResizing || isEditing) {
      e.preventDefault();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetPx = e.clientY - rect.top;
    const offsetHours = offsetPx / hourHeight;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);

    // Create a subtle drag image
    const ghost = e.currentTarget.cloneNode(true);
    ghost.style.width = e.currentTarget.offsetWidth + 'px';
    ghost.style.opacity = '0.8';
    ghost.style.position = 'absolute';
    ghost.style.top = '-9999px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, e.clientX - rect.left, offsetPx);
    requestAnimationFrame(() => ghost.remove());

    onDragStart(event.id, dayIndex, offsetHours);
  }

  function handleResizeStart(e, edge) {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    resizeEdge = edge;

    const startY = e.clientY;
    const originalStart = event.startHour;
    const originalDuration = event.duration;

    function onMouseMove(e) {
      const delta = (e.clientY - startY) / hourHeight;
      const snap = (v) => Math.round(v * 4) / 4; // 15-min snap

      if (resizeEdge === 'bottom') {
        const newDuration = snap(Math.max(0.25, originalDuration + delta));
        const clamped = Math.min(newDuration, endHour - event.startHour);
        onUpdateEvent(event.id, { duration: clamped });
      } else {
        const newStart = snap(originalStart + delta);
        const clamped = Math.max(startHour, Math.min(newStart, originalStart + originalDuration - 0.25));
        const newDuration = originalStart + originalDuration - clamped;
        onUpdateEvent(event.id, { startHour: clamped, duration: newDuration });
      }
    }

    function onMouseUp() {
      isResizing = false;
      resizeEdge = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function formatTime(hour) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  let timeLabel = $derived(`${formatTime(event.startHour)} – ${formatTime(event.startHour + event.duration)}`);
  let isCompact = $derived(event.duration < 0.75);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="event-block"
  class:compact={isCompact}
  class:editing={isEditing}
  class:resizing={isResizing}
  class:overlap={hasOverlap}
  style="top: {top}px; height: {height}px; --event-color: {event.color}; --event-rgb: {hexToRgb(event.color)};"
  draggable={!isResizing && !isEditing}
  ondragstart={handleDragStart}
  ondblclick={handleDoubleClick}
  oncontextmenu={handleRightClick}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="resize-handle resize-top" onmousedown={(e) => handleResizeStart(e, 'top')}></div>

  <div class="event-content">
    {#if isEditing}
      <input
        bind:this={inputEl}
        bind:value={editText}
        class="edit-input"
        onblur={commitEdit}
        onkeydown={handleEditKeydown}
      />
    {:else}
      <span class="event-title">{event.title}</span>
      {#if !isCompact}
        <span class="event-time">{timeLabel}</span>
      {/if}
    {/if}
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="resize-handle resize-bottom" onmousedown={(e) => handleResizeStart(e, 'bottom')}></div>
</div>

<style>
  .event-block {
    position: absolute;
    left: 4px;
    right: 4px;
    border-radius: 6px;
    background: rgba(var(--event-rgb), 0.15);
    border-left: 3px solid var(--event-color);
    cursor: grab;
    user-select: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: box-shadow 150ms ease, transform 50ms ease;
    z-index: 2;
  }

  .event-block:hover {
    box-shadow: 0 2px 12px rgba(var(--event-rgb), 0.25);
    z-index: 3;
  }

  .event-block:active:not(.resizing):not(.editing) {
    cursor: grabbing;
    z-index: 4;
  }

  .event-block.resizing {
    cursor: ns-resize;
    z-index: 4;
  }

  .event-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4px 8px;
    min-height: 0;
    gap: 1px;
  }

  .compact .event-content {
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .event-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .event-time {
    font-size: 10px;
    color: var(--text-muted);
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  .edit-input {
    width: 100%;
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--event-color);
    color: var(--text);
    font-size: 12px;
    font-weight: 600;
    padding: 2px 4px;
    border-radius: 4px;
    outline: none;
  }

  .resize-handle {
    height: 6px;
    cursor: ns-resize;
    flex-shrink: 0;
    position: relative;
  }

  .resize-handle::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    border-radius: 1px;
    background: var(--event-color);
    opacity: 0;
    transition: opacity var(--transition);
  }

  .resize-top::after { top: 1px; }
  .resize-bottom::after { bottom: 1px; }

  .event-block:hover .resize-handle::after {
    opacity: 0.5;
  }

  /* Overlap warning */
  .event-block.overlap {
    border-right: 2px solid rgba(244, 63, 94, 0.5);
    box-shadow: inset 0 0 0 1px rgba(244, 63, 94, 0.2), 0 0 8px rgba(244, 63, 94, 0.15);
  }
</style>
