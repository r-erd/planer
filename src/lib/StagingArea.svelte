<script>
  import { DEFAULT_COLORS, createId } from './store.js';

  let { events = [], onAddEvent, onUpdateEvent, onDeleteEvent,
        onContextMenu, onDragStart, onDropToStaging } = $props();

  let isEditing = $state({});

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e) {
    e.preventDefault();
    onDropToStaging();
  }

  function handleAdd() {
    onAddEvent();
  }

  function startEdit(id, title) {
    isEditing[id] = title;
  }

  function commitEdit(id) {
    const val = isEditing[id];
    if (val && val.trim()) {
      onUpdateEvent(id, { title: val.trim() });
    }
    delete isEditing[id];
    isEditing = { ...isEditing };
  }

  function handleKeydown(e, id) {
    if (e.key === 'Enter') commitEdit(id);
    if (e.key === 'Escape') {
      delete isEditing[id];
      isEditing = { ...isEditing };
    }
  }

  function handleRightClick(e, event) {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu({
      x: e.clientX,
      y: e.clientY,
      eventId: event.id,
      color: event.color,
    });
  }

  function handleItemDragStart(e, event) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
    onDragStart(event.id, -1, 0);
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<aside class="staging-area" ondragover={handleDragOver} ondrop={handleDrop}>
  <div class="staging-header">
    <span class="staging-title">Ideas</span>
    <button class="staging-add" onclick={handleAdd} title="Add idea">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </div>

  <div class="staging-list">
    {#each events as event, i (event.id)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="staging-chip"
        style="--chip-color: {event.color}; --chip-rgb: {hexToRgb(event.color)}; animation-delay: {i * 0.6 + 0.2}s;"
        draggable="true"
        ondragstart={(e) => handleItemDragStart(e, event)}
        ondblclick={() => startEdit(event.id, event.title)}
        oncontextmenu={(e) => handleRightClick(e, event)}
      >
        <div class="chip-dot" style="background: {event.color};"></div>
        {#if isEditing[event.id] !== undefined}
          <input
            class="chip-edit"
            bind:value={isEditing[event.id]}
            onblur={() => commitEdit(event.id)}
            onkeydown={(e) => handleKeydown(e, event.id)}
            autofocus
          />
        {:else}
          <span class="chip-label">{event.title}</span>
        {/if}
      </div>
    {/each}

    {#if events.length === 0}
      <div class="staging-empty">
        <span>Drop events here</span>
      </div>
    {/if}
  </div>
</aside>

<style>
  .staging-area {
    width: 160px;
    min-width: 160px;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    overflow: hidden;
  }

  .staging-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .staging-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .staging-add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    color: var(--text-dim);
    transition: all var(--transition);
  }

  .staging-add:hover {
    background: var(--bg-hover);
    color: var(--text);
  }

  .staging-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .staging-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    background: rgba(var(--chip-rgb), 0.1);
    border: 1px solid rgba(var(--chip-rgb), 0.15);
    border-radius: 8px;
    cursor: grab;
    user-select: none;
    transition: all 200ms ease;
    animation: chipFloat 3s ease-in-out infinite alternate;
    position: relative;
  }

  .staging-chip:hover {
    background: rgba(var(--chip-rgb), 0.18);
    border-color: rgba(var(--chip-rgb), 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--chip-rgb), 0.15);
  }

  .staging-chip:active {
    cursor: grabbing;
    transform: scale(0.97);
  }

  @keyframes chipFloat {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-3px); }
  }

  .chip-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 6px currentColor;
  }

  .chip-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
  }

  .chip-edit {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--text);
    font-size: 12px;
    font-weight: 500;
    outline: none;
    padding: 0;
    min-width: 0;
  }

  .staging-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 8px;
    text-align: center;
  }

  .staging-empty span {
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.5;
  }
</style>
