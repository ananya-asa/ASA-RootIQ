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
				code,
				error,
				mode: 'quick'
			});

			const analysis = response.data.analysis;
			const problemMatch = analysis.match(/PROBLEM:\s*(.+)/i);
      const fixMatch = analysis.match(/FIX:\s*([\s\S]*?)$/i);

      const problem=problemMatch ? problemMatch[1].trim() : 'NO Problem Found';
      const fixedCode=fixMatch ? fixMatch[1].trim() : null;

      const action=await vscode.window.showInformationMessage(
        `⚡ ${error}\n${problem}`,
        { modal: true },
        'Apply Fix',
        'Cancel'
      )
      if(action==='Apply Fix' && fixedCode){
        const edit=new vscode.WorkspaceEdit();
        const fullRange=new vscode.Range(
          editor.document.positionAt(0),
          editor.document.positionAt(editor.document.getText().length)
        );

        edit.replace(editor.document.uri,fullRange,fixedCode);
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage('Fix applied successfully!');
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
		// Create webview panel
		const panel = vscode.window.createWebviewPanel(
			'asaRootIQ',
			'🎓 ASA RootIQ — Learn Mode',
			vscode.ViewColumn.Beside,
			{ enableScripts: true }
		);

		// Show loading screen first
		panel.webview.html = getLoadingHTML();

		try {
			const response = await axios.post(`${BACKEND_URL}/analyze`, {
				code,
				error,
				mode: 'learn'
			});

			const analysis = response.data.analysis;
			panel.webview.html = getLearnModeHTML(analysis, error);

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
  .loader {
    text-align: center;
    color: #7c6af7;
  }
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #2a2a3e;
    border-top: 4px solid #7c6af7;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  h2 { color: #7c6af7; }
  p { color: #888; }
</style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <h2>ASA RootIQ is thinking...</h2>
    <p>Analyzing your error with Gemini AI ✨</p>
  </div>
</body>
</html>`;
}

function getLearnModeHTML(analysis, error) {
	const sections = parseAnalysis(analysis);

	return `<!DOCTYPE html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0f0f1a;
    font-family: 'Segoe UI', sans-serif;
    color: #e0e0e0;
    padding: 30px;
  }
  .header {
    text-align: center;
    margin-bottom: 30px;
  }
  .header h1 {
    color: #7c6af7;
    font-size: 1.8em;
  }
  .header p {
    color: #888;
    margin-top: 8px;
  }
  .error-box {
    background: #1e1e2e;
    border-left: 4px solid #ff6b6b;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    font-family: monospace;
    color: #ff6b6b;
  }
  .card {
    background: #1e1e2e;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 20px;
    border: 1px solid #2a2a3e;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeUp 0.5s ease forwards;
  }
  .card:nth-child(1) { animation-delay: 0.2s; }
  .card:nth-child(2) { animation-delay: 0.6s; }
  .card:nth-child(3) { animation-delay: 1.0s; }
  .card:nth-child(4) { animation-delay: 1.4s; }
  .card:nth-child(5) { animation-delay: 1.8s; }
  @keyframes fadeUp {
    to { opacity: 1; transform: translateY(0); }
  }
  .card-title {
    font-size: 1em;
    font-weight: bold;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .what { border-top: 3px solid #ff6b6b; }
  .why { border-top: 3px solid #ffa94d; }
  .fix { border-top: 3px solid #69db7c; }
  .prevent { border-top: 3px solid #74c0fc; }
  .quiz { border-top: 3px solid #da77f2; }
  .what .card-title { color: #ff6b6b; }
  .why .card-title { color: #ffa94d; }
  .fix .card-title { color: #69db7c; }
  .prevent .card-title { color: #74c0fc; }
  .quiz .card-title { color: #da77f2; }
  .card-content {
    color: #ccc;
    line-height: 1.7;
    font-size: 0.95em;
    white-space: pre-wrap;
  }
  code {
    background: #2a2a3e;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    color: #69db7c;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>🎓 ASA RootIQ</h1>
    <p>Let's understand this error together</p>
  </div>

  <div class="error-box">
    ❌ ${error}
  </div>

  <div class="cards">
    <div class="card what">
      <div class="card-title">🔴 What Went Wrong</div>
      <div class="card-content">${sections.what}</div>
    </div>
    <div class="card why">
      <div class="card-title">🟠 Why It Happened</div>
      <div class="card-content">${sections.why}</div>
    </div>
    <div class="card fix">
      <div class="card-title">🟢 How To Fix It</div>
      <div class="card-content">${sections.fix}</div>
    </div>
    <div class="card prevent">
      <div class="card-title">🔵 How To Prevent It</div>
      <div class="card-content">${sections.prevent}</div>
    </div>
    <div class="card quiz">
      <div class="card-title">🟣 Quick Quiz</div>
      <div class="card-content">${sections.quiz}</div>
    </div>
  </div>
</body>
</html>`;
}

function parseAnalysis(analysis) {
	const sections = {
		what: '', why: '', fix: '', prevent: '', quiz: ''
	};

	const whatMatch = analysis.match(/1\.\s*\*?\*?WHAT WENT WRONG:?\*?\*?([\s\S]*?)(?=2\.|$)/i);
	const whyMatch = analysis.match(/2\.\s*\*?\*?WHY IT HAPPENED:?\*?\*?([\s\S]*?)(?=3\.|$)/i);
	const fixMatch = analysis.match(/3\.\s*\*?\*?HOW TO FIX IT:?\*?\*?([\s\S]*?)(?=4\.|$)/i);
	const preventMatch = analysis.match(/4\.\s*\*?\*?HOW TO PREVENT IT:?\*?\*?([\s\S]*?)(?=5\.|$)/i);
	const quizMatch = analysis.match(/5\.\s*\*?\*?QUICK QUIZ:?\*?\*?([\s\S]*?)$/i);

	if (whatMatch) sections.what = whatMatch[1].trim();
	if (whyMatch) sections.why = whyMatch[1].trim();
	if (fixMatch) sections.fix = fixMatch[1].trim();
	if (preventMatch) sections.prevent = preventMatch[1].trim();
	if (quizMatch) sections.quiz = quizMatch[1].trim();

	return sections;
}

async function getErrorFromFile(editor) {
  const uri = editor.document.uri;
  const diagnostics = vscode.languages.getDiagnostics(uri);
  
  if (diagnostics.length === 0) return null;
  
  // Get the most severe error first
  const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
  const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);
  
  const target = errors.length > 0 ? errors[0] : warnings[0];
  
  return `Line ${target.range.start.line + 1}: ${target.message}`;
}

function deactivate() {}

module.exports = { activate, deactivate };