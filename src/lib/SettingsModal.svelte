<script>
  let { startHour, endHour, days, onSave, onClose } = $props();

  let localStart = $state(startHour);
  let localEnd = $state(endHour);
  let localDays = $state([...days]);
  let editingIndex = $state(-1);
  let editText = $state('');

  function handleSave() {
    if (localEnd <= localStart) return;
    onSave({
      startHour: localStart,
      endHour: localEnd,
      days: localDays,
    });
  }

  function startEditDay(i) {
    editingIndex = i;
    editText = localDays[i];
  }

  function commitDayEdit() {
    if (editText.trim() && editingIndex >= 0) {
      localDays[editingIndex] = editText.trim();
    }
    editingIndex = -1;
  }

  function handleDayKeydown(e) {
    if (e.key === 'Enter') commitDayEdit();
    if (e.key === 'Escape') editingIndex = -1;
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose();
  }

  let hourOptions = $derived(Array.from({ length: 24 }, (_, i) => i));
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" onclick={handleOverlayClick}>
  <div class="modal">
    <div class="modal-header">
      <h2>Settings</h2>
      <button class="close-btn" onclick={onClose}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Visible Hours</label>
        <div class="hour-range">
          <select bind:value={localStart}>
            {#each hourOptions as h}
              <option value={h} disabled={h >= localEnd}>
                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
              </option>
            {/each}
          </select>
          <span class="range-sep">to</span>
          <select bind:value={localEnd}>
            {#each hourOptions as h}
              <option value={h} disabled={h <= localStart}>
                {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
              </option>
            {/each}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Day Names</label>
        <div class="day-list">
          {#each localDays as day, i}
            <div class="day-item">
              {#if editingIndex === i}
                <input
                  class="day-edit-input"
                  bind:value={editText}
                  onblur={commitDayEdit}
                  onkeydown={handleDayKeydown}
                  autofocus
                />
              {:else}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span class="day-text" ondblclick={() => startEditDay(i)}>{day}</span>
              {/if}
            </div>
          {/each}
          <p class="form-hint">Double-click a day name to rename it</p>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick={onClose}>Cancel</button>
      <button class="btn btn-primary" onclick={handleSave}>Save Changes</button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    animation: overlayIn 150ms ease;
  }

  @keyframes overlayIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 400px;
    max-width: 90vw;
    animation: modalIn 200ms ease;
  }

  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.95) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 {
    font-size: 15px;
    font-weight: 600;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: var(--radius);
    color: var(--text-muted);
    transition: all var(--transition);
  }

  .close-btn:hover {
    background: var(--bg-hover);
    color: var(--text);
  }

  .modal-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .hour-range {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hour-range select {
    flex: 1;
  }

  .range-sep {
    font-size: 13px;
    color: var(--text-dim);
  }

  .day-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .day-item {
    padding: 6px 10px;
    background: var(--bg-surface);
    border-radius: var(--radius);
    border: 1px solid var(--border-subtle);
  }

  .day-text {
    font-size: 13px;
    cursor: text;
  }

  .day-edit-input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 13px;
    color: var(--text);
    outline: none;
    padding: 0;
  }

  .form-hint {
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 4px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid var(--border);
  }

  .btn {
    padding: 8px 16px;
    border-radius: var(--radius);
    font-size: 13px;
    font-weight: 500;
    transition: all var(--transition);
  }

  .btn-secondary {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-muted);
  }

  .btn-secondary:hover {
    background: var(--bg-hover);
    color: var(--text);
  }

  .btn-primary {
    background: var(--accent);
    color: white;
  }

  .btn-primary:hover {
    background: var(--accent-hover);
  }
</style>
