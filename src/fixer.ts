import * as vscode from "vscode";
import { Rule } from "./types";

/**
 * Apply all rules to a string of code.
 * Only uses rule.fixCode if defined; otherwise, leaves code unchanged.
 */
export function applyFixesToText(
  original: string,
  rules: Rule[]
): { fixed: string; replacements: { from: string; to: string }[] } {
  let fixed = original;
  const replacements: { from: string; to: string }[] = [];

  for (const rule of rules) {
    if (!rule.fixCode) continue; // skip rules without a real replacement

    const re = new RegExp(rule.pattern, "g");
    fixed = fixed.replace(re, (match) => {
      replacements.push({ from: match, to: rule.fixCode! });
      return rule.fixCode!;
    });
  }

  return { fixed, replacements };
}

/**
 * Apply fixes to a VS Code document.
 * If preview is true, opens a diff editor instead of modifying the file.
 */
export async function applyFixesToDocument(
  document: vscode.TextDocument,
  rules: Rule[],
  options: { preview: boolean }
) {
  const original = document.getText();
  const { fixed, replacements } = applyFixesToText(original, rules);

  if (replacements.length === 0) {
    vscode.window.showInformationMessage("No Baseline fixes suggested for this file.");
    return;
  }

  if (options.preview) {
    const previewDoc = await vscode.workspace.openTextDocument({
      content: fixed,
      language: document.languageId,
    });
    await vscode.commands.executeCommand(
      "vscode.diff",
      document.uri,
      previewDoc.uri,
      `Baseline: Before ↔ After`
    );
    vscode.window.showInformationMessage(`Preview: ${replacements.length} change(s) suggested.`);
  } else {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(original.length));
    edit.replace(document.uri, fullRange, fixed);
    const applied = await vscode.workspace.applyEdit(edit);

    if (applied) {
      await document.save();
      vscode.window.showInformationMessage(`Applied ${replacements.length} Baseline fix(es).`);
    } else {
      vscode.window.showErrorMessage("Failed to apply Baseline fixes.");
    }
  }
}
