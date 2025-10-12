import * as vscode from "vscode";
import { Rule } from "./types";

/**
 * Run diagnostics for a single document using given rules.
 * Produces vscode.Diagnostic items and sets them on the collection.
 */
export function runDiagnostics(
  document: vscode.TextDocument,
  rules: Rule[],
  collection: vscode.DiagnosticCollection
) {
  // don't run for non-target languages
  const supported = new Set([
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "html"
  ]);
  if (!supported.has(document.languageId)) {
    // clear any previous diagnostics for non-target file
    collection.set(document.uri, []);
    return;
  }

  if (!rules || rules.length === 0) {
    collection.set(document.uri, []);
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const text = document.getText();

  for (const rule of rules) {
    const re = new RegExp(rule.pattern, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = m.index + m[0].length;
      const range = new vscode.Range(document.positionAt(start), document.positionAt(end));

      const message = `${m[0]} — ${rule.reason}`;
      const diag = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);
      diag.source = "Baseline Sentinel";
      // attach the rule id so code action provider can match
      diag.code = rule.id;
      diagnostics.push(diag);
    }
  }

  collection.set(document.uri, diagnostics);
}
