const Progress = {
  async load() {
    try {
      const r = await fetch('/api/progress');
      if (!r.ok) throw new Error(r.statusText);
      return await r.json();
    } catch {
      return { current: 0, completed: [], quizScores: {}, badges: [], sessions: [] };
    }
  },

  async save(state) {
    await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
  },

  async exportData() {
    const r = await fetch('/api/export');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kubeclimb-progress.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
};
