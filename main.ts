import { Plugin, Notice, Modal, App, TFile } from 'obsidian';

export default class KanbanTaskNotePlugin extends Plugin {
	async onload() {

		console.log("[KanbanTaskNote] Kanban Task Note Plugin loaded");

		this.addRibbonIcon('circle-check-big', 'Log Task', async () => {
			const modal = new KanbanTaskNote(this.app);
			modal.open();
		});

		this.app.workspace.on('file-open', (file) => {
			if (file instanceof TFile) {
				if (this.isPluginTaskNote(file))
				{
					new Notice("[INFO] [KanbanTaskNote] Note is a Task Note");
				}
			}
		});

		this.registerMarkdownCodeBlockProcessor('kanban-task-note-ui', (source, el, ctx) => {
			// This is where you can process the task-note code block
			const file = this.app.workspace.getActiveFile();
			if (!file || !this.isPluginTaskNote(file))
			{
				return;
			}

			const headingDiv = el.createDiv({ cls: 'task-note-heading' });
			headingDiv.createEl('button', { text: 'Add New Empty Date Heading' }).onclick = async () => {
				await this.insertDateHeading(file, true);
			};
			headingDiv.createEl('button', { text: 'Add Heading with Template' }).onclick = async () => {
				await this.insertDateHeading(file, false);
			};
		});

		// Command: Add new date heading (empty)
		let execCmd = false;
		this.addCommand({
			id: 'add-new-date-heading',
			name: 'Add New Date Heading',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file && this.isPluginTaskNote(file)) {
					if (!checking)
					{
						console.log("[KanbanTaskNote] Executing Add task Command");
						this.insertDateHeading(file, true);
					} 
					execCmd = true;
				}
				else
				{
					console.log("[KanbanTaskNote] Checking the note...");
					execCmd = false;
				}
				return execCmd;
        	}
		});

		this.addCommand({
			id: 'add-new-date-heading-with-task',
			name: 'Add New Date Heading with Template',
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file && this.isPluginTaskNote(file)) {
					if (!checking)
					{
						console.log("[KanbanTaskNote] Executing Add task Command");
						this.insertDateHeading(file, false);
					} 
					execCmd = true;
				}
				else
				{
					console.log("[KanbanTaskNote] Checking the note...");
					execCmd = false;
				}
				return execCmd;
			}
		});
	}

	onunload() {
		console.log("[KanbanTaskNote] Kanban Task Note unloaded");
	}

	isPluginTaskNote(acticveFile: TFile): boolean {
		let pluginTaskNote = false;
		if (acticveFile)
		{
			const cache = this.app.metadataCache.getFileCache(acticveFile);
			if (cache && cache.frontmatter && cache.frontmatter._plugin_id === 'kanban-task-note') {
				pluginTaskNote = true;
			}
			else if (cache && cache.frontmatter && cache.frontmatter._plugin_id !== 'kanban-task-note')
			{
				new Notice("[WARN] [KanbanTaskNote] Note is NOT a Task Note");
			}
			else
			{
				new Notice("[WARN] [KanbanTaskNote] Note does not have frontmatter or _plugin_id");
			}
		}
		else
		{
			pluginTaskNote = false;
		}

		return pluginTaskNote;
	}

	async insertDateHeading(file: TFile, empty: boolean = false) {
		const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
		const dateHeading = `# ${today}\n`;
		const content = await this.app.vault.read(file);

		// Check if the date heading already exists
		if (content.includes(dateHeading)) {
			new Notice(`[WARN] [KanbanTaskNote] Date heading for ${today} already exists.`);
			return;
		}

		// Find the position to insert the new date heading
		const notesHeadingRegex = /^# Notes$/m; // Match the # Notes heading
		const notesHeadingMatch = content.match(notesHeadingRegex);

		let toInsert = `\n${dateHeading}\n`;
		if (empty) {
			console.log("[KanbanTaskNote] Inserting empty date heading");
			toInsert += `<!-- Add subtasks here -->\n\n`;
		} else {
			console.log("[KanbanTaskNote] Inserting date heading with task template");
			toInsert += `- [ ] Task\n\n`; // TODO: Able to load a template for this
		}

		let newContent: string;
		if (notesHeadingMatch) {
			// Insert before the # Notes heading
			console.log("[KanbanTaskNote] Inserting before Note heading");
			const index = notesHeadingMatch.index;
			newContent = content.slice(0, index) + toInsert + content.slice(index);
		} else {
			// If # Notes heading doesn't exist, append at the end
			console.log("[KanbanTaskNote] Inserting at the end");
			newContent = content + toInsert;
		}

		await this.app.vault.modify(file, newContent);
		new Notice(`[INFO] [KanbanTaskNote] Inserted date heading: ${today}`);
	}
}

class KanbanTaskNote extends Modal {
	inputs: Record<string, HTMLInputElement | HTMLTextAreaElement> = {};
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h3', { text: 'Create Task' });

		const fields = [
			{ key: 'name', type: 'input', inputType: 'text', label: 'Task Name (required)', placeholder: 'Enter task name' },
			{ key: 'start', type: 'input', inputType: 'datetime-local', label: 'Start Date (required)', placeholder: 'Select Start Date' },
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

		if (!values.name || !values.start) {
			new Notice("[ERROR] [KanbanTaskNote] Please fill in all required fields.");
			return;
		}
		else
		{
			new Notice(`[INFO] [KanbanTaskNote] Task Created: ${values.name}`);
		}

		const yamlFrontmatter =
			'---\n' +
			`_plugin_id: kanban-task-note\n` +
			Object.entries(values)
				.map(([key, value]) => {
					if (key === 'name') return ''; // Exclude name from YAML
					// Special handling for tags as YAML list
					if (key === 'tags') {
						const tagsArray = value.split(', ').map(t => t.trim()).filter(Boolean);
						if (tagsArray.length === 0) return `tags: `;
						return `tags:\n${tagsArray.map(tag => `  - "${tag}"`).join('\n')}`;
					}
					// Special handling for linkedNotes as YAML list
					if (key === 'linkedNotes') {
						const notesArray = value.split('\n').map(t => t.trim()).filter(Boolean);
						if (notesArray.length === 0) return `linkedNotes: `;
						if (notesArray.some(note => !note.startsWith('[[') || !note.endsWith(']]'))) {
							new Notice("[KanbanTaskNote] Related Notes should be in [[link]] format.");
							return `linkedNotes: `;
						}
						return `linkedNotes:\n${notesArray.map(note => `  - "${note}"`).join('\n')}`;
					}
					return `${key}: "${value.replace(/"/g, '\\"')}"`;
				})
				.join('\n') +
				`\ntimespent: 0\n` +
			'\n---\n\n';

		const fileName = `${values.name}.md`;
		const linebreak = `---\n`;
		const startDateHeading = values.start ? `# ${values.start.split('T')[0]}\n\n` : '';
		const subtaskPlaceholder = '<!-- Add subtasks here -->\n\n';

		await this.app.vault.create(fileName, 
									yamlFrontmatter + 
									linebreak +
									'```kanban-task-note-ui\n```\n\n' +
									startDateHeading + 
									subtaskPlaceholder +
									`# Notes\n\n`);
									
		new Notice(`[INFO] [KanbanTaskNote] Task note created: ${fileName}`);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
