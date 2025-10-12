import * as vscode from "vscode";
import { Rule } from "./types";

/**
 * Provide quick fixes for diagnostics created by runDiagnostics.
 */
export class BaselineCodeActionProvider implements vscode.CodeActionProvider {
  constructor(private rules: Rule[]) {}

  public provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] | undefined {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      const diagCode = typeof diagnostic.code === "string" ? diagnostic.code : String(diagnostic.code);
      const rule = this.rules.find((r) => r.id === diagCode);
      if (!rule) {continue;}

      const title = `Fix: replace with ${rule.fix}`;
      const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);

      // Attach the diagnostic and the replacement edit
      action.diagnostics = [diagnostic];
      action.isPreferred = true;
      action.edit = new vscode.WorkspaceEdit();
      // use the diagnostic.range to replace exactly the flagged text
      action.edit.replace(document.uri, diagnostic.range, rule.fix);

      actions.push(action);
    }

    return actions.length ? actions : undefined;
  }

  // optional: resolve (not required)
  public resolveCodeAction?(codeAction: vscode.CodeAction): vscode.CodeAction | Thenable<vscode.CodeAction> {
    return codeAction;
  }
}
