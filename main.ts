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
		contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Enter task description'});
		contentEl.createEl('input', {
			type: 'datetime-local',
			placeholder: 'Select Start Date'});
		contentEl.createEl('input', {
			type: 'datetime-local',
			placeholder: 'Select End Date'});
		contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Priority Level'});
		contentEl.createEl('input', {
			type: 'text',
			placeholder: 'Enter Tags (comma separated)'});
		contentEl.createEl('textarea', {
			placeholder: 'Enter Task Notes'});
		contentEl.createEl('button', {
			text: 'Create Task'});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
