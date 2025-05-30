import { Plugin, Notice, Modal, App } from 'obsidian';

export default class ExamplePlugin extends Plugin {
	async onload() {
		console.log("Task Logger Plugin loaded");
		this.addRibbonIcon('circle-check-big', 'Log Task', async () => {
			const modal = new TaskModal(this.app);
			modal.open();
			// const task = "Sample Task";
			// const timestamp = new Date().toISOString();
			// console.log(`Task: ${task}, Timestamp: ${timestamp}`);
			// new Notice(`Task Created: ${task} at ${timestamp}`);
		});
	}

	onunload() {
		console.log("Task Logger Plugin unloaded");
	}
}

class TaskModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h3', { text: 'Create Task' });
		const descInput = contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Enter task description'});
		const startInput = contentEl.createEl('input', {
			type: 'datetime-local',
			placeholder: 'Select Start Date'});
		const endInput = contentEl.createEl('input', {
			type: 'datetime-local',
			placeholder: 'Select End Date'});
		const priorityInput = contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Priority Level'});
		const tagsInput = contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Enter Tags (comma separated)'});
		const linkedInput = contentEl.createEl('textarea', {
			placeholder: 'Enter Related Notes (use [[link]] format)'});
		const submitBtn = contentEl.createEl('button', {
			text: 'Create Task'});

		submitBtn.addEventListener('click', () => {
			const taskDescription = descInput.value;
			const startDate = startInput.value;
			const endDate = endInput.value;
			const priority = priorityInput.value;
			const tags = tagsInput.value;
			const linkedNotes = linkedInput.value;

			if (taskDescription) {
				const timestamp = new Date().toISOString();
				console.log(`Task: ${taskDescription}\nStart: ${startDate}\nEnd: ${endDate}\nPriority: ${priority}\nTags: ${tags}\nLinked Notes: ${linkedNotes}`);
				new Notice(`Task Created: ${taskDescription} at ${timestamp}`);
				this.close();
			} else {
				new Notice("Please fill in all required fields.");
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
