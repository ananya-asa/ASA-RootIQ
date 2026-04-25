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
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0f0f1a;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: 'Segoe UI', sans-serif;
    overflow: hidden;
  }
  .container { text-align: center; width: 80%; max-width: 400px; }
  .logo {
    font-size: 2.5em;
    font-weight: bold;
    color: #7c6af7;
    text-shadow: 0 0 30px #7c6af7;
    animation: pulse 2s ease infinite;
    margin-bottom: 10px;
  }
  .subtitle {
    color: #555;
    font-size: 0.9em;
    margin-bottom: 40px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  @keyframes pulse {
    0%, 100% { text-shadow: 0 0 20px #7c6af7; }
    50% { text-shadow: 0 0 60px #7c6af7, 0 0 100px #7c6af7; }
  }
  .bug-animation {
    font-size: 3em;
    animation: bugWalk 1s ease infinite alternate;
    display: inline-block;
    margin-bottom: 30px;
  }
  @keyframes bugWalk {
    from { transform: translateX(-20px) rotate(-10deg); }
    to { transform: translateX(20px) rotate(10deg); }
  }
  .message {
    color: #e0e0e0;
    font-size: 1.1em;
    min-height: 30px;
    margin-bottom: 25px;
    transition: opacity 0.3s ease;
  }
  .progress-container {
    background: #1e1e2e;
    border-radius: 50px;
    height: 12px;
    width: 100%;
    margin-bottom: 12px;
    border: 1px solid #2a2a3e;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #7c6af7, #da77f2);
    border-radius: 50px;
    transition: width 0.5s ease;
    box-shadow: 0 0 10px #7c6af7;
  }
  .progress-text {
    color: #555;
    font-size: 0.85em;
    margin-bottom: 25px;
  }
  .dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 30px;
  }
  .dot {
    width: 10px;
    height: 10px;
    background: #7c6af7;
    border-radius: 50%;
    animation: bounce 0.6s ease infinite alternate;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce {
    to { transform: translateY(-15px); opacity: 0.3; }
  }
  .particles {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: -1;
  }
  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #7c6af7;
    border-radius: 50%;
    animation: float linear infinite;
    opacity: 0.3;
  }
  @keyframes float {
    0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
    10% { opacity: 0.3; }
    90% { opacity: 0.3; }
    100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
  }
</style>
</head>
<body>
  <div class="particles" id="particles"></div>
  <div class="container">
    <div class="logo">ASA RootIQ</div>
    <div class="subtitle">AI Debugging Mentor</div>
    <div class="bug-animation">🐛</div>
    <div class="message" id="message">Interrogating your variables... 🔍</div>
    <div class="progress-container">
      <div class="progress-bar" id="progressBar"></div>
    </div>
    <div class="progress-text" id="progressText">0%</div>
    <div class="dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  </div>

<script>
  const messages = [
    "Interrogating your variables... 🔍",
    "Catching the bug red-handed... 🚨",
    "Explaining to Gemini what you did... 😅",
    "Gemini is judging your code... 👀",
    "Don't worry, we've all been there... 💀",
    "Consulting the debugging gods... 🙏",
    "Building your personalized lesson... 🏗️",
    "Adding confetti for when you win... 🎊",
    "Teaching your bug a lesson... 🎓",
    "Almost done, promise! ⏰",
    "Gemini is writing your quiz... ✍️",
    "Polishing the animations... ✨",
    "This will blow your mind... 💜"
  ];

  let i = 0;
  let progress = 0;
  const el = document.getElementById('message');
  const bar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  // Message cycle
  setInterval(() => {
    el.style.opacity = 0;
    setTimeout(() => {
      i = (i + 1) % messages.length;
      el.textContent = messages[i];
      el.style.opacity = 1;
    }, 300);
  }, 2000);

  // Progress bar fills over ~15 seconds
  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += Math.random() * 4 + 1;
      if (progress > 90) progress = 90;
      bar.style.width = progress + '%';
      progressText.textContent = Math.round(progress) + '%';
    }
  }, 600);

  // Particles
  const container = document.getElementById('particles');
  for (let p = 0; p < 20; p++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 8) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
    container.appendChild(particle);
  }
</script>
</body>
</html>`;
}

const { exec } = require('child_process');
const path = require('path');

async function getErrorFromFile(editor) {
	const uri = editor.document.uri;
	const filePath = uri.fsPath;

	// Step 1: Check static diagnostics first
	const diagnostics = vscode.languages.getDiagnostics(uri);
	if (diagnostics.length > 0) {
		const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
		const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);
		const target = errors.length > 0 ? errors[0] : warnings[0];
		return `Line ${target.range.start.line + 1}: ${target.message}`;
	}

	// Step 2: No static errors → run file and capture runtime error
	const ext = path.extname(filePath);
	const commands = {
		'.py': `python "${filePath}"`,
		'.js': `node "${filePath}"`,
	};

	const command = commands[ext];
	if (!command) {
		// Unsupported language → fallback to input box
		return await vscode.window.showInputBox({
			prompt: 'Paste your runtime error here:',
			placeHolder: 'e.g. IndexError: list index out of range'
		});
	}

	// Run the file and capture stderr
	return new Promise((resolve) => {
		exec(command, (error, stdout, stderr) => {
			if (stderr) {
				// Extract last meaningful error line
				const lines = stderr.trim().split('\n');
				const errorLine = lines[lines.length - 1];
				resolve(errorLine);
			} else {
				resolve(null);
			}
		});
	});
}

function deactivate() {}

module.exports = { activate, deactivate };