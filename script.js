class TaskBreakdownApp {
    constructor() {
        this.apiKey = localStorage.getItem('siliconflow_api_key') || '';
        this.taskLists = JSON.parse(localStorage.getItem('task_lists') || '[]');
        this.currentTaskList = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTaskLists();
        this.showEmptyState();
    }

    bindEvents() {
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('breakdownBtn').addEventListener('click', () => this.breakdownTask());
        document.getElementById('saveTaskList').addEventListener('click', () => this.saveTaskList());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.breakdownTask();
        });
    }

    openSettings() {
        document.getElementById('apiKey').value = this.apiKey;
        document.getElementById('settingsModal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    }

    saveSettings() {
        this.apiKey = document.getElementById('apiKey').value.trim();
        localStorage.setItem('siliconflow_api_key', this.apiKey);
        this.closeSettings();
        
        if (this.apiKey) {
            this.showNotification('API key saved successfully!', 'success');
        }
    }

    async breakdownTask() {
        const input = document.getElementById('taskInput').value.trim();
        
        if (!input) {
            this.showNotification('Please enter a goal or situation to break down.', 'error');
            return;
        }

        if (!this.apiKey) {
            this.showNotification('Please set your SiliconFlow API key in settings first.', 'error');
            this.openSettings();
            return;
        }

        this.showLoading(true);
        document.getElementById('breakdownBtn').disabled = true;

        try {
            const tasks = await this.callAnthropicAPI(input);
            this.displayTasks(tasks, input);
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Failed to generate tasks. Please check your API key and try again.', 'error');
        } finally {
            this.showLoading(false);
            document.getElementById('breakdownBtn').disabled = false;
        }
    }

    async callAnthropicAPI(input) {
        const prompt = `Break down this goal/situation into specific, actionable tasks with priorities and deadlines:

"${input}"

Return ONLY a JSON array of tasks in this exact format:
[
  {
    "title": "Specific actionable task",
    "priority": "High|Medium|Low",
    "deadline": "Tonight|Tomorrow|This week|etc"
  }
]

Make tasks specific, actionable, and granular. Include 5-8 tasks maximum.`;

        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'Qwen/Qwen2.5-7B-Instruct',
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Extract JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid response format');
        }

        return JSON.parse(jsonMatch[0]);
    }

    displayTasks(tasks, originalInput) {
        this.currentTaskList = {
            id: Date.now(),
            name: this.generateTaskListName(originalInput),
            tasks: tasks.map(task => ({
                ...task,
                id: Date.now() + Math.random(),
                completed: false
            })),
            createdAt: new Date().toISOString()
        };

        document.getElementById('taskListName').value = this.currentTaskList.name;
        document.getElementById('taskListHeader').classList.remove('hidden');
        
        this.renderTasks();
        document.getElementById('taskInput').value = '';
    }

    generateTaskListName(input) {
        // Simple name generation from input
        const words = input.split(' ').slice(0, 4);
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    renderTasks() {
        const container = document.getElementById('tasksGrid');
        
        if (!this.currentTaskList || !this.currentTaskList.tasks.length) {
            this.showEmptyState();
            return;
        }

        container.innerHTML = this.currentTaskList.tasks.map(task => {
            const randomKitten = Math.floor(Math.random() * 9) + 1;
            return `
            <div class="task-card ${task.priority.toLowerCase()}-priority ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-actions">
                    <button class="action-btn" onclick="app.editTask('${task.id}')" title="Edit">✏️</button>
                    <button class="action-btn" onclick="app.deleteTask('${task.id}')" title="Delete">🗑️</button>
                </div>
                <img src="kitten/卡通猫咪${randomKitten}.png" alt="Cat" class="task-card-image">
                <div class="task-header">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="app.toggleTask('${task.id}')">
                    <div class="task-content">
                        <div class="task-title">${task.title}</div>
                    </div>
                </div>
                <div class="task-meta">
                    <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="task-deadline">${task.deadline}</span>
                </div>
            </div>
        `}).join('');
    }

    toggleTask(taskId) {
        const task = this.currentTaskList.tasks.find(t => t.id == taskId);
        if (task) {
            task.completed = !task.completed;
            this.renderTasks();
        }
    }

    editTask(taskId) {
        const task = this.currentTaskList.tasks.find(t => t.id == taskId);
        if (task) {
            const newTitle = prompt('Edit task:', task.title);
            if (newTitle && newTitle.trim()) {
                task.title = newTitle.trim();
                this.renderTasks();
            }
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.currentTaskList.tasks = this.currentTaskList.tasks.filter(t => t.id != taskId);
            this.renderTasks();
        }
    }

    saveTaskList() {
        if (!this.currentTaskList) return;

        const name = document.getElementById('taskListName').value.trim();
        if (!name) {
            this.showNotification('Please enter a name for your task list.', 'error');
            return;
        }

        this.currentTaskList.name = name;
        
        // Check if updating existing list
        const existingIndex = this.taskLists.findIndex(list => list.id === this.currentTaskList.id);
        if (existingIndex >= 0) {
            this.taskLists[existingIndex] = this.currentTaskList;
        } else {
            this.taskLists.push(this.currentTaskList);
        }

        localStorage.setItem('task_lists', JSON.stringify(this.taskLists));
        this.renderTaskLists();
        this.showNotification('Task list saved successfully!', 'success');
    }

    renderTaskLists() {
        const container = document.getElementById('taskListsSidebar');
        
        if (!this.taskLists.length) {
            container.innerHTML = '<p class="empty-state">No saved task lists yet.</p>';
            return;
        }

        container.innerHTML = this.taskLists.map(list => {
            const randomKitten = Math.floor(Math.random() * 9) + 1;
            return `
            <div class="task-list-item ${this.currentTaskList && this.currentTaskList.id === list.id ? 'active' : ''}" 
                 onclick="app.loadTaskList(${list.id})">
                <button class="task-list-delete" onclick="event.stopPropagation(); app.deleteTaskList(${list.id})" title="Delete">&times;</button>
                <div style="font-weight: 600; margin-bottom: 0.25rem;">${list.name}</div>
                <div style="font-size: 0.8rem; color: #666;">
                    ${list.tasks.length} tasks • ${list.tasks.filter(t => t.completed).length} completed
                </div>
            </div>
        `}).join('');
    }

    loadTaskList(listId) {
        this.currentTaskList = this.taskLists.find(list => list.id === listId);
        if (this.currentTaskList) {
            document.getElementById('taskListName').value = this.currentTaskList.name;
            document.getElementById('taskListHeader').classList.remove('hidden');
            this.renderTasks();
            this.renderTaskLists();
        }
    }

    deleteTaskList(listId) {
        if (confirm('Are you sure you want to delete this task list?')) {
            this.taskLists = this.taskLists.filter(list => list.id !== listId);
            localStorage.setItem('task_lists', JSON.stringify(this.taskLists));
            
            if (this.currentTaskList && this.currentTaskList.id === listId) {
                this.currentTaskList = null;
                document.getElementById('taskListHeader').classList.add('hidden');
                this.showEmptyState();
            }
            
            this.renderTaskLists();
            this.showNotification('Task list deleted successfully!', 'success');
        }
    }

    showEmptyState() {
        const container = document.getElementById('tasksGrid');
        container.innerHTML = `
            <div class="empty-state">
                <h3>Ready to break down your goals?</h3>
                <p>Enter a goal or situation above and click "Breakdown Task" to get started!</p>
            </div>
        `;
    }

    showLoading(show) {
        document.getElementById('loadingState').classList.toggle('hidden', !show);
        document.getElementById('taskListContainer').classList.toggle('hidden', show);
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize app
const app = new TaskBreakdownApp();