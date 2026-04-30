<script>
  import EventBlock from './EventBlock.svelte';

  let { day, dayIndex, hours, startHour, endHour, events, isDragTarget,
        onAddEvent, onRemoveDay, onUpdateEvent, onDeleteEvent,
        onContextMenu, onDragStart, onDrop } = $props();

  let columnEl = $state(null);
  let bodyEl = $state(null);
  let dragCreate = $state(null);

  // Current time tracking
  let now = $state(new Date());
  $effect(() => {
    const interval = setInterval(() => { now = new Date(); }, 60000);
    return () => clearInterval(interval);
  });

  let hourHeight = $derived(
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height'))
  );

  // Current time line position
  let currentHour = $derived(now.getHours() + now.getMinutes() / 60);
  let isCurrentTimeVisible = $derived(currentHour >= startHour && currentHour <= endHour);
  let currentTimeTop = $derived((currentHour - startHour) * hourHeight);

  // Total scheduled hours
  let totalHours = $derived(events.reduce((sum, e) => sum + e.duration, 0));

  // Overlap detection: check for any overlapping pairs
  function getOverlappingIds(events) {
    const ids = new Set();
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i], b = events[j];
        if (a.startHour < b.startHour + b.duration && b.startHour < a.startHour + a.duration) {
          ids.add(a.id);
          ids.add(b.id);
        }
      }
    }
    return ids;
  }
  let overlappingIds = $derived(getOverlappingIds(events));

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDropOnColumn(e) {
    e.preventDefault();
    if (!columnEl) return;
    const rect = columnEl.getBoundingClientRect();
    const headerHeight = 48;
    const y = e.clientY - rect.top - headerHeight + columnEl.scrollTop;
    const hour = startHour + y / hourHeight;
    onDrop(dayIndex, hour);
  }

  // Drag-to-create
  function handleBodyMouseDown(e) {
    // Only left button, and not on an event block
    if (e.button !== 0 || e.target.closest('.event-block')) return;
    if (!bodyEl) return;

    const rect = bodyEl.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const startH = startHour + y / hourHeight;
    const snapped = Math.round(startH * 4) / 4;

    dragCreate = { startH: snapped, currentH: snapped };

    function onMouseMove(ev) {
      const yy = ev.clientY - rect.top;
      const h = startHour + yy / hourHeight;
      dragCreate = { ...dragCreate, currentH: Math.round(h * 4) / 4 };
    }

    function onMouseUp() {
      if (dragCreate) {
        const s = Math.min(dragCreate.startH, dragCreate.currentH);
        const e = Math.max(dragCreate.startH, dragCreate.currentH);
        const dur = e - s;
        if (dur >= 0.25) {
          const clampedStart = Math.max(startHour, Math.min(s, endHour - 0.25));
          const clampedDur = Math.min(dur, endHour - clampedStart);
          onAddEvent(dayIndex, clampedStart, clampedDur);
        }
      }
      dragCreate = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  let dragPreviewTop = $derived(dragCreate ? (Math.min(dragCreate.startH, dragCreate.currentH) - startHour) * hourHeight : 0);
  let dragPreviewHeight = $derived(dragCreate ? Math.abs(dragCreate.currentH - dragCreate.startH) * hourHeight : 0);

  function formatTotalHours(h) {
    if (h === 0) return '';
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    if (mins === 0) return `${hrs}h`;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="day-column"
     bind:this={columnEl}
     class:drag-target={isDragTarget}
     ondragover={handleDragOver}
     ondrop={handleDropOnColumn}
>
  <div class="day-header">
    <div class="day-header-left">
      <span class="day-name">{day}</span>
      {#if totalHours > 0}
        <span class="day-total">{formatTotalHours(totalHours)}</span>
      {/if}
    </div>
    <div class="day-actions">
      <button class="icon-btn" onclick={() => onAddEvent(dayIndex)} title="Add event">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button class="icon-btn icon-btn-danger" onclick={onRemoveDay} title="Remove day">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="day-body" bind:this={bodyEl} onmousedown={handleBodyMouseDown}>
    {#each hours as hour (hour)}
      <div class="hour-row" class:hour-row-even={hour % 2 === 0}></div>
    {/each}

    {#if isCurrentTimeVisible}
      <div class="now-line" style="top: {currentTimeTop}px;">
        <div class="now-dot"></div>
      </div>
    {/if}

    {#if dragCreate && dragPreviewHeight > 2}
      <div class="drag-preview" style="top: {dragPreviewTop}px; height: {dragPreviewHeight}px;"></div>
    {/if}

    {#each events as event (event.id)}
      <EventBlock
        {event}
        {startHour}
        {endHour}
        {onUpdateEvent}
        {onDeleteEvent}
        {onContextMenu}
        {onDragStart}
        {dayIndex}
        hasOverlap={overlappingIds.has(event.id)}
      />
    {/each}
  </div>
</div>

<style>
  .day-column {
    flex: 1;
    min-width: 180px;
    background: var(--bg-surface);
    display: flex;
    flex-direction: column;
    transition: background var(--transition);
  }

  .day-column.drag-target {
    background: var(--bg-surface);
  }

  .day-header {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    position: sticky;
    top: 0;
    background: var(--bg-surface);
    z-index: 5;
  }

  .day-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .day-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: -0.01em;
  }

  .day-total {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-dim);
    background: var(--bg-elevated);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .day-actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity var(--transition);
  }

  .day-column:hover .day-actions {
    opacity: 1;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    color: var(--text-muted);
    transition: all var(--transition);
  }

  .icon-btn:hover {
    background: var(--bg-hover);
    color: var(--text);
  }

  .icon-btn-danger:hover {
    color: #f43f5e;
    background: rgba(244, 63, 94, 0.1);
  }

  .day-body {
    position: relative;
    flex: 1;
  }

  .hour-row {
    height: var(--hour-height);
    border-bottom: 1px solid var(--border-subtle);
  }

  .hour-row-even {
    background: rgba(255,255,255,0.008);
  }

  /* Current time indicator */
  .now-line {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 3;
    pointer-events: none;
  }

  .now-line::after {
    content: '';
    position: absolute;
    top: -0.5px;
    left: 0;
    right: 0;
    height: 1.5px;
    background: #f43f5e;
    opacity: 0.8;
  }

  .now-dot {
    position: absolute;
    left: -3px;
    top: -4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f43f5e;
  }

  /* Drag-to-create preview */
  .drag-preview {
    position: absolute;
    left: 4px;
    right: 4px;
    background: rgba(99, 102, 241, 0.15);
    border: 1px dashed rgba(99, 102, 241, 0.4);
    border-radius: 6px;
    z-index: 1;
    pointer-events: none;
  }
</style>
