<script>
  import { DEFAULT_COLORS } from './store.js';

  let { x, y, eventId, currentColor, onColorChange, onDuplicate, onDelete, onClose } = $props();

  // Adjust position if too close to edges
  let adjustedX = $derived(Math.min(x, window.innerWidth - 200));
  let adjustedY = $derived(Math.min(y, window.innerHeight - 240));

  function handleClick(e) {
    e.stopPropagation();
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="context-overlay" onclick={onClose}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="context-menu" style="left: {adjustedX}px; top: {adjustedY}px;" onclick={handleClick}>
    <div class="menu-section">
      <span class="menu-label">Color</span>
      <div class="color-grid">
        {#each DEFAULT_COLORS as color}
          <button
            class="color-swatch"
            class:active={color === currentColor}
            style="background: {color};"
            onclick={() => onColorChange(eventId, color)}
            title={color}
          ></button>
        {/each}
      </div>
    </div>
    <div class="menu-divider"></div>
    <button class="menu-item" onclick={onDuplicate}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      Duplicate
    </button>
    <button class="menu-item menu-item-danger" onclick={onDelete}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      Delete Event
    </button>
  </div>
</div>

<style>
  .context-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
  }

  .context-menu {
    position: absolute;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 8px;
    min-width: 180px;
    animation: fadeIn 100ms ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .menu-section {
    padding: 4px;
  }

  .menu-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    display: block;
    margin-bottom: 8px;
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }

  .color-swatch {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all var(--transition);
  }

  .color-swatch:hover {
    transform: scale(1.15);
  }

  .color-swatch.active {
    border-color: white;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.3);
  }

  .menu-divider {
    height: 1px;
    background: var(--border);
    margin: 6px 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px;
    border-radius: var(--radius);
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
    transition: all var(--transition);
  }

  .menu-item:hover {
    background: var(--bg-hover);
    color: var(--text);
  }

  .menu-item-danger:hover {
    color: #f43f5e;
    background: rgba(244, 63, 94, 0.1);
  }
</style>
