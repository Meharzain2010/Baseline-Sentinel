import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface Rule {
  id: string;
  pattern: string;
  fix: string;
  reason: string;
  link?: string;
}

let diagnosticCollection: vscode.DiagnosticCollection | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("✅ Baseline Sentinel Activated");

  // 1️⃣ Load rules.json safely
  let rules: Rule[] = [];
  try {
    const rulesPath = path.join(context.extensionPath, "rules.json");
    const raw = fs.readFileSync(rulesPath, "utf8");
    rules = JSON.parse(raw).filter((r: { pattern: any; reason: any; id: any; }) => r.pattern && r.reason && r.id);
  } catch (err: any) {
    vscode.window.showErrorMessage("❌ Failed to load rules.json: " + err.message);
    console.error(err);
    return; // stop activation
  }

  // 2️⃣ Create diagnostics collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection("baselineSentinel");
  context.subscriptions.push(diagnosticCollection);

  // 3️⃣ Update diagnostics for active editor
  if (vscode.window.activeTextEditor) {
    updateDiagnostics(vscode.window.activeTextEditor.document, rules);
  }

  // 4️⃣ Register workspace events
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => updateDiagnostics(doc, rules)),
    vscode.workspace.onDidChangeTextDocument(e => updateDiagnostics(e.document, rules)),
    vscode.workspace.onDidCloseTextDocument(doc => diagnosticCollection?.delete(doc.uri))
  );

  // 5️⃣ Register code action provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["javascript", "typescript", "javascriptreact", "typescriptreact"],
      new BaselineFixProvider(rules),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );
}

export function deactivate() {
  if (diagnosticCollection) diagnosticCollection.dispose();
}

/**
 * Convert a dotted path pattern into a regex that matches the full property access in code.
 */
function patternToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/\./g, "\\.");
  return new RegExp(escaped, "g");
}

/**
 * Update diagnostics for a document based on rules.
 */
function updateDiagnostics(document: vscode.TextDocument, rules: Rule[]) {
  if (!["javascript", "typescript", "javascriptreact", "typescriptreact"].includes(document.languageId)) {
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const text = document.getText();

  for (const rule of rules) {
    const regex = patternToRegex(rule.pattern);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text))) {
      const range = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + match[0].length)
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        rule.reason,
        vscode.DiagnosticSeverity.Warning
      );
      diagnostic.source = "Baseline Sentinel";
      diagnostic.code = rule.id;
      diagnostics.push(diagnostic);
    }
  }

  diagnosticCollection?.set(document.uri, diagnostics);
}

/**
 * Provides quick fixes for rules.
 */
class BaselineFixProvider implements vscode.CodeActionProvider {
  constructor(private rules: Rule[]) {}

  provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
    if (!diagnosticCollection) return;

    const diagnostics = diagnosticCollection.get(document.uri) || [];
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of diagnostics) {
      if (range.intersection(diagnostic.range)) {
        const rule = this.rules.find(r => r.id === diagnostic.code);
        if (rule) {
          const fix = new vscode.CodeAction(
            "Fix with Baseline Sentinel",
            vscode.CodeActionKind.QuickFix
          );
          fix.edit = new vscode.WorkspaceEdit();
          fix.edit.replace(document.uri, diagnostic.range, rule.fix);
          fix.diagnostics = [diagnostic];
          fix.isPreferred = true;
          actions.push(fix);
        }
      }
    }

    return actions.length ? actions : undefined;
  }
}
