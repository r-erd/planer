<script>
  import { loadState, saveState, resetState, createId, DEFAULT_COLORS } from './lib/store.js';
  import { exportToICS } from './lib/ics.js';
  import Header from './lib/Header.svelte';
  import StagingArea from './lib/StagingArea.svelte';
  import DayColumn from './lib/DayColumn.svelte';
  import ContextMenu from './lib/ContextMenu.svelte';
  import SettingsModal from './lib/SettingsModal.svelte';

  let state = $state(loadState());
  let contextMenu = $state(null);
  let showSettings = $state(false);
  let dragData = $state(null);

  function persist() {
    saveState(state);
  }

  function handleReset() {
    state = resetState();
  }

  function addEvent(dayIndex, startHour, duration) {
    state.events.push({
      id: createId(),
      title: 'New Event',
      dayIndex,
      startHour: startHour ?? (dayIndex === -1 ? state.startHour : state.startHour + 1),
      duration: duration ?? 1,
      color: DEFAULT_COLORS[state.events.length % DEFAULT_COLORS.length],
    });
    persist();
  }

  function addDay() {
    const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const usedNames = new Set(state.days);
    let name = dayNames.find(d => !usedNames.has(d)) || `Day ${state.days.length + 1}`;
    state.days = [...state.days, name];
    persist();
  }

  function removeDay(index) {
    if (state.days.length <= 1) return;
    state.events = state.events.filter(e => e.dayIndex !== index).map(e => {
      if (e.dayIndex > index) e.dayIndex--;
      return e;
    });
    state.days = state.days.filter((_, i) => i !== index);
    persist();
  }

  function updateEvent(id, updates) {
    const ev = state.events.find(e => e.id === id);
    if (ev) {
      Object.assign(ev, updates);
      persist();
    }
  }

  function deleteEvent(id) {
    state.events = state.events.filter(e => e.id !== id);
    persist();
  }

  function duplicateEvent(id) {
    const ev = state.events.find(e => e.id === id);
    if (!ev) return;
    state.events.push({
      id: createId(),
      title: ev.title + ' (copy)',
      dayIndex: ev.dayIndex,
      startHour: Math.min(ev.startHour + ev.duration, state.endHour - ev.duration),
      duration: ev.duration,
      color: ev.color,
    });
    persist();
  }

  function handleDropToStaging() {
    if (!dragData) return;
    const ev = state.events.find(e => e.id === dragData.eventId);
    if (ev) {
      ev.dayIndex = -1;
      persist();
    }
    dragData = null;
  }

  function handleContextMenu(detail) {
    contextMenu = detail;
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  function handleColorChange(id, color) {
    updateEvent(id, { color });
    closeContextMenu();
  }

  function handleDragStart(eventId, sourceDayIndex, offsetHours) {
    dragData = { eventId, sourceDayIndex, offsetHours };
  }

  function handleDrop(dayIndex, hour) {
    if (!dragData) return;
    const ev = state.events.find(e => e.id === dragData.eventId);
    if (ev) {
      const snapped = Math.round((hour - dragData.offsetHours) * 4) / 4;
      ev.dayIndex = dayIndex;
      ev.startHour = Math.max(state.startHour, Math.min(snapped, state.endHour - ev.duration));
      persist();
    }
    dragData = null;
  }

  function handleDragEnd() {
    dragData = null;
  }

  function handleSettingsUpdate(updates) {
    Object.assign(state, updates);
    // Clamp existing events
    state.events.forEach(ev => {
      if (ev.startHour < state.startHour) ev.startHour = state.startHour;
      if (ev.startHour + ev.duration > state.endHour) {
        ev.startHour = Math.max(state.startHour, state.endHour - ev.duration);
      }
      if (ev.dayIndex >= state.days.length) ev.dayIndex = state.days.length - 1;
    });
    persist();
    showSettings = false;
  }

  $effect(() => {
    function onClick() { closeContextMenu(); }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  });

  let hours = $derived(Array.from(
    { length: state.endHour - state.startHour },
    (_, i) => state.startHour + i
  ));

  let stagedEvents = $derived(state.events.filter(e => e.dayIndex === -1));
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="app-layout" onmouseup={handleDragEnd}>
  <Header
    onAddDay={addDay}
    onExport={() => exportToICS(state)}
    onSettings={() => showSettings = true}
    onReset={handleReset}
  />

  <div class="planner-body">
    <StagingArea
      events={stagedEvents}
      onAddEvent={() => addEvent(-1)}
      onUpdateEvent={updateEvent}
      onDeleteEvent={deleteEvent}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onDropToStaging={handleDropToStaging}
    />

    <div class="planner-viewport">
      <div class="planner-scroll">
        <div class="time-gutter">
          <div class="gutter-header"></div>
          {#each hours as hour}
            <div class="gutter-label">
              <span>{hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</span>
            </div>
          {/each}
        </div>

        <div class="columns-container">
          {#each state.days as day, dayIndex (day + dayIndex)}
            <DayColumn
              {day}
              {dayIndex}
              {hours}
              startHour={state.startHour}
              endHour={state.endHour}
              events={state.events.filter(e => e.dayIndex === dayIndex)}
              isDragTarget={dragData !== null}
              onAddEvent={addEvent}
              onRemoveDay={() => removeDay(dayIndex)}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          {/each}
        </div>
      </div>
    </div>
  </div>

  {#if contextMenu}
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      eventId={contextMenu.eventId}
      currentColor={contextMenu.color}
      onColorChange={handleColorChange}
      onDuplicate={() => { duplicateEvent(contextMenu.eventId); closeContextMenu(); }}
      onDelete={() => { deleteEvent(contextMenu.eventId); closeContextMenu(); }}
      onClose={closeContextMenu}
    />
  {/if}

  {#if showSettings}
    <SettingsModal
      startHour={state.startHour}
      endHour={state.endHour}
      days={state.days}
      onSave={handleSettingsUpdate}
      onClose={() => showSettings = false}
    />
  {/if}
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .planner-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .planner-viewport {
    flex: 1;
    overflow: auto;
    padding: 0 16px 16px;
  }

  .planner-scroll {
    display: flex;
    min-width: fit-content;
    gap: 0;
  }

  .time-gutter {
    width: 64px;
    min-width: 64px;
    flex-shrink: 0;
    position: sticky;
    left: 0;
    z-index: 10;
    background: var(--bg);
  }

  .gutter-header {
    height: 48px;
    border-bottom: 1px solid var(--border);
  }

  .gutter-label {
    height: var(--hour-height);
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding-right: 12px;
    position: relative;
  }

  .gutter-label span {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-dim);
    transform: translateY(-7px);
    letter-spacing: 0.02em;
  }

  .columns-container {
    display: flex;
    flex: 1;
    gap: 1px;
    background: var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
</style>
