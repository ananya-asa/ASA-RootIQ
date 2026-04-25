const vscode = require('vscode');
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';

function activate(context) {

	// ⚡ QUICK FIX COMMAND
	let quickFix = vscode.commands.registerCommand('asa-rootiq.quickFix', async () => {

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('Open a file first!');
			return;
		}

		const code = editor.document.getText(editor.selection) || editor.document.getText();
		const error = await getErrorFromFile(editor);

		if (!error) {
			vscode.window.showWarningMessage('No errors detected! Write some buggy code first 😄');
			return;
		}

		vscode.window.showInformationMessage('⚡ ASA RootIQ is analyzing...');

		try {
			const response = await axios.post(`${BACKEND_URL}/analyze`, {
				code, error, mode: 'quick'
			});

			const analysis = response.data.analysis;
			const problemMatch = analysis.match(/PROBLEM:\s*(.+)/i);
			const fixMatch = analysis.match(/FIX:\s*([\s\S]*?)$/i);

			const problem = problemMatch ? problemMatch[1].trim() : 'Error detected';
			const fixedCode = fixMatch ? fixMatch[1].trim() : null;

			const action = await vscode.window.showInformationMessage(
				`⚡ ${error}\n${problem}`,
				{ modal: true },
				'Apply Fix',
				'Cancel'
			);

			if (action === 'Apply Fix' && fixedCode) {
				const edit = new vscode.WorkspaceEdit();
				const fullRange = new vscode.Range(
					editor.document.positionAt(0),
					editor.document.positionAt(editor.document.getText().length)
				);
				edit.replace(editor.document.uri, fullRange, fixedCode);
				await vscode.workspace.applyEdit(edit);
				vscode.window.showInformationMessage('✅ Fix applied by ASA RootIQ!');
			}

		} catch (err) {
			vscode.window.showErrorMessage('Backend not running! Start with node index.js');
		}
	});

	// 🎓 LEARN MODE COMMAND
	let learnMode = vscode.commands.registerCommand('asa-rootiq.learnMode', async () => {

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('Open a file first!');
			return;
		}

		const code = editor.document.getText(editor.selection) || editor.document.getText();
		const error = await getErrorFromFile(editor);

		if (!error) {
			vscode.window.showWarningMessage('No errors detected! Write some buggy code first 😄');
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'asaRootIQ',
			'🎓 ASA RootIQ — Learn Mode',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: []
			}
		);

		panel.webview.html = getLoadingHTML();

		try {
			const response = await axios.post(`${BACKEND_URL}/analyze`, {
				code, error, mode: 'learn'
			});

			const analysis = response.data.analysis;
			const htmlMatch = analysis.match(/<!DOCTYPE html>[\s\S]*/i);
			panel.webview.html = htmlMatch ? htmlMatch[0] : `<h2 style="color:red">Could not generate learning page</h2>`;

		} catch (err) {
			panel.webview.html = `<h2 style="color:red">Backend not running! Start with node index.js</h2>`;
		}
	});

	context.subscriptions.push(quickFix, learnMode);
}

function getLoadingHTML() {
	return `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    background: #0f0f1a;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    font-family: 'Segoe UI', sans-serif;
  }
  .loader { text-align: center; color: #7c6af7; }
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #2a2a3e;
    border-top: 4px solid #7c6af7;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  h2 { color: #7c6af7; }
  p { color: #888; }
</style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <h2>ASA RootIQ is thinking...</h2>
    <p>Generating your interactive learning experience ✨</p>
  </div>
</body>
</html>`;
}

async function getErrorFromFile(editor) {
	const uri = editor.document.uri;
	const diagnostics = vscode.languages.getDiagnostics(uri);
	if (diagnostics.length === 0) return null;

	const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
	const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);
	const target = errors.length > 0 ? errors[0] : warnings[0];

	return `Line ${target.range.start.line + 1}: ${target.message}`;
}

function deactivate() {}

module.exports = { activate, deactivate };