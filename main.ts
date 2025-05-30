import { Plugin, Notice, Modal, App } from 'obsidian';

export default class ExamplePlugin extends Plugin {
	async onload() {
		console.log("Task Logger Plugin loaded");
		this.addRibbonIcon('circle-check-big', 'Log Task', async () => {
			const modal = new TaskModal(this.app);
			modal.open();
		});
	}

	onunload() {
		console.log("Task Logger Plugin unloaded");
	}
}

class TaskModal extends Modal {
	inputs: Record<string, HTMLInputElement | HTMLTextAreaElement> = {};
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h3', { text: 'Create Task' });

		const fields = [
			{ key: 'name', type: 'input', inputType: 'text', label: 'Task Name', placeholder: 'Enter task name' },
			{ key: 'start', type: 'input', inputType: 'datetime-local', label: 'Start Date', placeholder: 'Select Start Date' },
			{ key: 'end', type: 'input', inputType: 'datetime-local', label: 'End Date', placeholder: 'Select End Date' },
			{ key: 'priority', type: 'input', inputType: 'text', label: 'Priority Level', placeholder: 'Priority Level' },
			{ key: 'tags', type: 'input', inputType: 'text', label: 'Tags', placeholder: 'Enter Tags (comma separated)' },
			{ key: 'linkedNotes', type: 'textarea', inputType: 'text', label: 'Related Notes', placeholder: 'Enter Related Notes (use [[link]] format)' }
		];

		fields.forEach(field => {
			const fieldEl = contentEl.createDiv({ cls: 'field' }); // Create a div for each field
			fieldEl.createEl('label', { text: field.label }); // Add label

			let input;
			if (field.type === 'textarea') {
				input = fieldEl.createEl('textarea', { placeholder: field.placeholder });
			} else {
				input = fieldEl.createEl('input', { type: field.inputType, placeholder: field.placeholder });
			}
			input.classList.add('task-input'); // Add a CSS class for styling
			input.setAttribute('data-key', field.key);
			this.inputs[field.key] = input;
		});

		const submitBtn = contentEl.createEl('button', { text: 'Create Task' });
		submitBtn.classList.add('task-submit-btn'); // Add a CSS class for styling
		submitBtn.addEventListener('click', () => this.handleSubmit());
	}

	async handleSubmit() {
		const values: Record<string, string> = {};
		for (const key in this.inputs) {
			values[key] = this.inputs[key].value;
		}

		if (!values.name) {
			new Notice("Please fill in all required fields.");
			return;
		}
		else
		{
			console.log(`Task: ${values.name}`);
			new Notice(`Task Created: ${values.name}`);
		}

		const yamlFrontmatter =
			'---\n' +
			Object.entries(values)
				.map(([key, value]) => {
					if (key === 'name') return ''; // Exclude name from YAML
					// Special handling for tags as YAML list
					if (key === 'tags') {
						const tagsArray = value.split(', ').map(t => t.trim()).filter(Boolean);
						if (tagsArray.length === 0) return '';
						return `tags:\n${tagsArray.map(tag => `  - "${tag}"`).join('\n')}`;
					}
					// Special handling for linkedNotes as YAML list
					if (key === 'linkedNotes') {
						const notesArray = value.split('\n').map(t => t.trim()).filter(Boolean);
						if (notesArray.length === 0) return '';
						return `linkedNotes:\n${notesArray.map(note => `  - "${note}"`).join('\n')}`;
					}
					return `${key}: "${value.replace(/"/g, '\\"')}"`;
				})
				.join('\n') +
			'\n---\n\n';

		const fileName = `${values.name}.md`;
		const horizontalLine = `---\n`;
		const noteBody = `# Notes\n`;

		await this.app.vault.create(fileName, yamlFrontmatter + horizontalLine + noteBody);
		new Notice(`Task note created: ${fileName}`);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
